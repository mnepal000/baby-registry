// Dallu baby registry: name-suggestion backend (Google Apps Script).
//
// What it does:
//  1. Receives { name, why, from, turnstileToken } from the site's name form.
//  2. Verifies the Turnstile captcha token with Cloudflare, server-side.
//  3. Emails the suggestion to hellomuku@gmail.com. Nothing is public.
//    If this script is bound to a Google Sheet, it also appends a row to
//    a "Suggestions" sheet, but the sheet is optional: email is the delivery.
//
// Setup (one time, ~5 minutes):
//  1. Go to script.google.com, create a new project, paste this file.
//  2. Fill in TURNSTILE_SECRET below (from dash.cloudflare.com > Turnstile).
//  3. Deploy > New deployment > Web app:
//       Execute as: Me
//       Who has access: Anyone
//     Copy the web app URL.
//  4. In the registry repo's data.js, set:
//       nameBackendUrl: "<the web app URL>",
//       turnstileSiteKey: "<the Turnstile site key>",
//     then regenerate data.min.js (see ~/workspace/minify-sites.sh) and push.
//
// Test: submit the form on the site. The suggestion should arrive by email.
// If it fails, check Executions in the Apps Script editor for the error.

var TURNSTILE_SECRET = ""; // <-- paste the Turnstile SECRET key here (never the site key)

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || "{}");
    var token = String(data.turnstileToken || "").trim();
    if (!token) return json({ ok: false, error: "captcha-missing" });
    if (!verifyTurnstile(token)) return json({ ok: false, error: "captcha-failed" });

    var name = clean(data.name, 60);
    var why = clean(data.why, 140);
    var from = clean(data.from, 60);
    if (!name) return json({ ok: false, error: "name-required" });

    MailApp.sendEmail({
      to: "hellomuku@gmail.com",
      subject: "Name suggestion for Dallu: " + name,
      body: "Name suggestion for Dallu: " + name +
        (why ? "\nWhy this name: " + why : "") +
        (from ? "\nSuggested by: " + from : "")
    });

    // Optional: also log to a sheet when this script is bound to one.
    // A failure here must not lose the email, so it is best-effort only.
    try { sheetRef().appendRow([new Date(), name, why, from]); } catch (errSheet) {}

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: "server-error" });
  }
}

// Cloudflare Turnstile server-side verification.
function verifyTurnstile(token) {
  var res = UrlFetchApp.fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "post",
    payload: { secret: TURNSTILE_SECRET, response: token },
    muteHttpExceptions: true
  });
  var out = JSON.parse(res.getContentText());
  return out.success === true;
}

function sheetRef() {
  // Uses the sheet this script is bound to. First run creates the header row.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Suggestions");
  if (!sh) {
    sh = ss.insertSheet("Suggestions");
    sh.appendRow(["Timestamp", "Name", "Why", "From"]);
  } else if (sh.getLastRow() === 0) {
    sh.appendRow(["Timestamp", "Name", "Why", "From"]);
  }
  return sh;
}

function clean(v, max) {
  var s = String(v == null ? "" : v).replace(/[\r\n\t]+/g, " ").trim();
  return s.slice(0, max);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
