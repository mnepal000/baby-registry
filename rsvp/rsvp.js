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

  function ensureTurnstile() {
    var box = document.getElementById("rsvpTsWidget");
    if (!box || widgetId !== null || typeof turnstile === "undefined") return;
    try { widgetId = turnstile.render(box, { sitekey: SITE_KEY, theme: "light" }); }
    catch (err) { widgetId = null; }
  }
  if (document.readyState === "complete") ensureTurnstile();
  else window.addEventListener("load", ensureTurnstile);
  setTimeout(ensureTurnstile, 3000);

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
        if (note) note.textContent = "Thank you! Your RSVP is saved. We cannot wait to see you. 💛";
        form.reset();
        if (guestsInput) { guestsInput.disabled = false; guestsInput.value = "1"; }
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
      btn.disabled = false;
      btn.textContent = origLabel;
    });
  });
})();
