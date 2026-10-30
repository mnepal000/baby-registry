// Baby shower RSVP form for dallu.baby/rsvp.
// Sends { type: "rsvp", name, attending, guests, allergies, message, turnstileToken }
// to the same Apps Script backend as the name form (see ../backend/name-suggestions.gs),
// which emails the RSVP to hellomuku@gmail.com. Nothing is posted publicly.
(function () {
  "use strict";
  var BACKEND_URL = "https://script.google.com/macros/s/AKfycbwoxl52KzsWOIbxkIJ88WuGM3-HXcWjwF2K1-b8Eb30pMW0vG1D6JJuBm_Eo03Xfjidkg/exec";
  var SITE_KEY = "0x4AAAAAAFOcAMGV4haWI8Iu";

  var form = document.getElementById("rsvpForm");
  if (!form) return;
  var note = document.getElementById("rsvpNote");
  var btn = form.querySelector('button[type="submit"]');
  var guestsInput = document.getElementById("rsvpGuests");
  var widgetId = null;
  var redirecting = false;

  function ensureTurnstile() {
    var box = document.getElementById("rsvpTsWidget");
    if (!box || widgetId !== null || typeof turnstile === "undefined") return;
    try { widgetId = turnstile.render(box, { sitekey: SITE_KEY, theme: "light" }); }
    catch (err) { widgetId = null; }
  }
  if (document.readyState === "complete") ensureTurnstile();
  else window.addEventListener("load", ensureTurnstile);
  setTimeout(ensureTurnstile, 3000);

  // Add to calendar: download an .ics file for Apple Calendar, Outlook
  // desktop, and other calendar apps. Google and Outlook web links are
  // in the page itself. Event: Sunday, December 6, 2026, 12:30 pm to
  // 4:00 pm EST, which is 17:30 to 21:00 UTC.
  var icsBtn = document.getElementById("icsDownload");
  if (icsBtn) {
    icsBtn.addEventListener("click", function () {
      var now = new Date();
      function stamp(d) {
        return d.getUTCFullYear() +
          String(d.getUTCMonth() + 1).padStart(2, "0") +
          String(d.getUTCDate()).padStart(2, "0") + "T" +
          String(d.getUTCHours()).padStart(2, "0") +
          String(d.getUTCMinutes()).padStart(2, "0") +
          String(d.getUTCSeconds()).padStart(2, "0") + "Z";
      }
      var lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Dallu//Baby Shower//EN",
        "BEGIN:VEVENT",
        "UID:dallu-baby-shower-20261206@dallu.baby",
        "DTSTAMP:" + stamp(now),
        "DTSTART:20261206T173000Z",
        "DTEND:20261206T210000Z",
        "SUMMARY:Baby shower for Dallu",
        "LOCATION:Nepal Residence\\, Beltsville",
        "DESCRIPTION:Baby shower for Dallu at Nepal Residence\\, Beltsville.",
        "END:VEVENT",
        "END:VCALENDAR",
        ""
      ];
      var blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "dallu-baby-shower-2026-12-06.ics";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  }

  // If the guest cannot come, the guest count does not apply.
  form.addEventListener("change", function (e) {
    if (e.target && e.target.name === "rsvpAttending") {
      var no = e.target.value === "no";
      if (guestsInput) {
        guestsInput.disabled = no;
        if (no) guestsInput.value = "";
        else if (!guestsInput.value) guestsInput.value = "1";
      }
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("rsvpName").value.trim();
    var attendingEl = form.querySelector('input[name="rsvpAttending"]:checked');
    var attending = attendingEl ? attendingEl.value : "";
    var guests = guestsInput && !guestsInput.disabled ? parseInt(guestsInput.value, 10) : 0;
    if (!guests || guests < 1) guests = attending === "no" ? 0 : 1;
    var allergies = document.getElementById("rsvpAllergies").value.trim();
    var message = document.getElementById("rsvpMessage").value.trim();
    if (!name || !attending) return;

    var token = "";
    try { token = (widgetId !== null) ? turnstile.getResponse(widgetId) : ""; }
    catch (errTok) { token = ""; }
    if (!token) {
      if (note) note.textContent = "Please complete the quick human check above first.";
      return;
    }

    btn.disabled = true;
    var origLabel = btn.textContent;
    btn.textContent = "Sending…";
    fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ type: "rsvp", name: name, attending: attending, guests: guests, allergies: allergies, message: message, turnstileToken: token })
    }).then(function (resp) { return resp.json(); }).then(function (res) {
      if (res && res.ok) {
        redirecting = true;
        if (attending === "yes") {
          // Yes: show the add to calendar options, then redirect to the
          // homepage after 15 seconds, so there is time to use them.
          form.style.display = "none";
          var panel = document.getElementById("calendarPanel");
          if (panel) panel.style.display = "block";
          var countdownEl = document.getElementById("calCountdown");
          var secondsLeft = 15;
          var timer = setInterval(function () {
            secondsLeft -= 1;
            if (countdownEl) countdownEl.textContent = secondsLeft;
            if (secondsLeft <= 0) {
              clearInterval(timer);
              window.location.href = "../";
            }
          }, 1000);
        } else {
          // No or maybe: no calendar needed, thank them and redirect soon.
          if (note) note.textContent = "Thank you! Your RSVP is saved. Taking you back to dallu.baby…";
          form.reset();
          if (guestsInput) { guestsInput.disabled = false; guestsInput.value = "1"; }
          setTimeout(function () { window.location.href = "../"; }, 3000);
        }
      } else if (res && res.error === "captcha-failed") {
        if (note) note.textContent = "The human check did not pass. Please try again.";
      } else {
        if (note) note.textContent = "Hmm, that did not go through. Please try again in a moment.";
      }
      try { turnstile.reset(widgetId); } catch (errR) {}
    }).catch(function () {
      if (note) note.textContent = "Something went wrong sending that. Please try again in a moment.";
      try { turnstile.reset(widgetId); } catch (errR2) {}
    }).finally(function () {
      if (!redirecting) {
        btn.disabled = false;
        btn.textContent = origLabel;
      }
    });
  });
})();
