// Baby registry app: countdown, watch-him-grow, timeline, and the name form.
// There is no item listing on this page anymore: gifting happens on Babylist,
// linked from the nav, the hero, and the registry section.
(function () {
  "use strict";

  // ---- Personalize from REGISTRY config ----
  function personalize() {
    var r = window.REGISTRY || {};
    ["brandName", "heroBaby", "footBaby"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && r.babyName) el.textContent = r.babyName;
    });
    ["heroMonth", "footMonth"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && r.dueMonthLabel) el.textContent = r.dueMonthLabel;
    });
    var fam = document.getElementById("famName");
    if (fam && r.familyName) fam.textContent = r.familyName;
    var ce = document.getElementById("contactEmail");
    if (ce && r.contactEmail) {
      ce.textContent = r.contactEmail;
      ce.href = "mailto:" + r.contactEmail;
    }
    if (r.babyName) document.title = r.babyName + " is on the way | Our Baby Registry";
  }

  // ---- Countdown ----
  function tickCountdown() {
    var r = window.REGISTRY || {};
    if (!r.dueDate) return;
    var target = new Date(r.dueDate + "T00:00:00");
    var now = new Date();
    var diff = target - now;
    var box = document.getElementById("countdown");
    if (diff <= 0) {
      box.innerHTML = '<p class="hero-sub">Our little one should be here any day now 💛</p>';
      return;
    }
    setText("cd-days", Math.floor(diff / 86400000));
  }
  function setText(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = v;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  // Parse "YYYY-MM-DD" as UTC midnight so week math never trips on DST shifts.
  function parseDay(s) {
    var p = s.split("-");
    return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
  }
  function todayUTC() {
    var n = new Date();
    return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
  }

  // ---- Watch him grow: gestational week from the due date ----
  function renderGrowth() {
    var r = window.REGISTRY || {};
    var sizes = window.WEEK_SIZES || [];
    if (!r.dueDate || !sizes.length) return;
    var baby = r.babyName ? r.babyName.split(" ")[0] : "Baby";
    setText("growTitle", baby + " is growing");

    var due = parseDay(r.dueDate);
    var today = todayUTC();
    var textEl = document.getElementById("growText");
    var dimsEl = document.getElementById("growDims");
    var emojiEl = document.getElementById("growEmoji");

    if (today >= due) {
      emojiEl.textContent = "💛";
      textEl.innerHTML = "<strong>" + esc(baby) + "</strong> should be here any day now. Welcome, little one!";
      dimsEl.textContent = "";
      return;
    }
    // gestational age: 280 days before the due date is day 0
    var conception = new Date(due.getTime() - 280 * 86400000);
    var week = Math.floor((today - conception) / (7 * 86400000));
    if (week < 4) {
      emojiEl.textContent = "✨";
      textEl.innerHTML = "The journey has just begun. <strong>" + esc(baby) + "</strong> is on the way!";
      dimsEl.textContent = "";
      return;
    }
    var w = sizes.filter(function (s) { return s.week === Math.min(week, 42); })[0] || sizes[sizes.length - 1];
    emojiEl.textContent = w.emoji;
    textEl.innerHTML = "Week " + w.week + ": <strong>" + esc(baby) + "</strong> is about the size of <strong>" + esc(w.size) + "</strong>.";
    dimsEl.textContent = w.length + " long · " + w.weight;
  }

  // ---- Watch him grow: pregnancy timeline ----
  function renderTimeline() {
    var r = window.REGISTRY || {};
    var sizes = window.WEEK_SIZES || [];
    var list = document.getElementById("growTimeline");
    if (!r.dueDate || !list) return;
    var due = parseDay(r.dueDate);
    // gestational age: 280 days before the due date is day 0
    var conception = new Date(due.getTime() - 280 * 86400000);
    var todayStart = todayUTC();
    var baby = r.babyName ? r.babyName.split(" ")[0] : "Baby";

    function sizeFor(week) {
      var w = sizes.filter(function (s) { return s.week === Math.min(week, 42); })[0];
      return w ? w.size : "a tiny miracle";
    }
    function weekOf(d) { return Math.floor((d - conception) / (7 * 86400000)); }
    function fmt(d) { return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }); }
    function key(d) {
      return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0");
    }

    var milestones = [
      { date: "2026-05-10", title: "We found out",
        note: "Two pink lines on a Sunday evening. " + baby + " was the size of " + sizeFor(5) + " and already running the household." },
      { date: "2026-05-19", title: "First sonogram",
        note: "We heard the heartbeat for the first time. It sounded like a tiny drum solo, and we both pretended not to tear up." },
      { date: "2026-07-04", title: "First trimester, done",
        note: "The queasy weeks are behind us. " + baby + " is the size of " + sizeFor(13) + " and has started rehearsing his dance moves." },
      { date: "2026-08-22", title: "Halfway there",
        note: "Twenty weeks in and the size of " + sizeFor(20) + ", with kicks strong enough to register on the Richter scale." },
      { date: "2026-09-19", title: "Viability milestone",
        note: "The size of " + sizeFor(24) + ". Every week from here counts double, and the nursery inspiration folder is officially out of control." },
      { date: "2026-10-17", title: "Third trimester begins",
        note: "The home stretch. He'll be the size of " + sizeFor(28) + " and napping on his own schedule, which is to say, never on ours." },
      { date: r.dueDate, title: "Due date",
        note: "We finally meet " + baby + ", all " + sizeFor(40) + "-sized and wonderful. Worth every 3 a.m. dress rehearsal." }
    ];
    milestones.push({ date: key(todayStart), today: true, title: "You are here",
      note: "Right now, " + baby + " is about the size of " + sizeFor(weekOf(todayStart)) + " and practicing his boxing combinations daily." });
    milestones.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });

    list.innerHTML = "";
    milestones.forEach(function (m) {
      var d = parseDay(m.date);
      var status = m.today ? "today" : (d < todayStart ? "past" : "future");
      var li = document.createElement("li");
      li.className = "tl-item " + status;
      li.innerHTML =
        '<span class="tl-dot" aria-hidden="true"></span>' +
        '<div class="tl-card">' +
          '<div class="tl-meta"><span class="tl-date">' + esc(m.today ? "Today" : fmt(d)) + "</span>" +
          '<span class="tl-week">Week ' + weekOf(d) + "</span></div>" +
          "<h4>" + esc(m.title) + "</h4>" +
          "<p>" + esc(m.note) + "</p>" +
        "</div>";
      list.appendChild(li);
    });
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---- Name suggestion form: Turnstile captcha + backend save ----
  // Backend not configured yet? Falls back to the old mailto behavior.
  var nameForm = document.getElementById("nameForm");
  if (nameForm) {
    var rName = window.REGISTRY || {};
    var nameBackendUrl = rName.nameBackendUrl || "";
    var tsSiteKey = rName.turnstileSiteKey || "";
    var backendOn = !!(nameBackendUrl && tsSiteKey);
    var tsWidgetId = null;
    var note0 = document.getElementById("nsNote");

    function ensureTurnstile() {
      var box = document.getElementById("tsWidget");
      if (!box || tsWidgetId !== null || typeof turnstile === "undefined") return;
      try { tsWidgetId = turnstile.render(box, { sitekey: tsSiteKey, theme: "light" }); }
      catch (err) { tsWidgetId = null; }
    }
    if (backendOn) {
      if (document.readyState === "complete") ensureTurnstile();
      else window.addEventListener("load", ensureTurnstile);
      setTimeout(ensureTurnstile, 3000); // retry in case the Turnstile script is slow
    } else {
      var tw = document.getElementById("tsWidget");
      if (tw) tw.style.display = "none";
      if (note0) note0.textContent = "This opens your email app with the suggestion addressed to us. Nothing is posted publicly.";
    }

    nameForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var sug = document.getElementById("nsName").value.trim();
      var why = document.getElementById("nsWhy").value.trim();
      var from = document.getElementById("nsFrom").value.trim();
      if (!sug) return;
      var note = document.getElementById("nsNote");
      var btn = nameForm.querySelector('button[type="submit"]');

      if (!backendOn) {
        var to = rName.contactEmail || "hellomuku@gmail.com";
        var body = "Name suggestion for Dallu: " + sug +
          (why ? "\nWhy this name: " + why : "") +
          (from ? "\nSuggested by: " + from : "");
        window.location.href = "mailto:" + to +
          "?subject=" + encodeURIComponent("Name suggestion for Dallu") +
          "&body=" + encodeURIComponent(body);
        if (note) note.textContent = "Thank you! Your email app should have opened with the suggestion ready to send. \uD83D\uDC9B";
        nameForm.reset();
        return;
      }

      var token = "";
      try { token = (tsWidgetId !== null) ? turnstile.getResponse(tsWidgetId) : ""; }
      catch (errTok) { token = ""; }
      if (!token) {
        if (note) note.textContent = "Please complete the quick human check above first.";
        return;
      }

      btn.disabled = true;
      var origLabel = btn.textContent;
      btn.textContent = "Sending\u2026";
      fetch(nameBackendUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ name: sug, why: why, from: from, turnstileToken: token })
      }).then(function (resp) { return resp.json(); }).then(function (res) {
        if (res && res.ok) {
          if (note) note.textContent = "Thank you! Your suggestion is saved. We cannot wait to read it. \uD83D\uDC9B";
          nameForm.reset();
        } else if (res && res.error === "captcha-failed") {
          if (note) note.textContent = "The human check did not pass. Please try again.";
        } else {
          if (note) note.textContent = "Hmm, that did not go through. Please try again in a moment.";
        }
        try { turnstile.reset(tsWidgetId); } catch (errR) {}
      }).catch(function () {
        if (note) note.textContent = "Something went wrong sending that. Please try again in a moment.";
        try { turnstile.reset(tsWidgetId); } catch (errR2) {}
      }).finally(function () {
        btn.disabled = false;
        btn.textContent = origLabel;
      });
    });
  }

  personalize();
  renderGrowth();
  renderTimeline();
  tickCountdown();
  setInterval(tickCountdown, 1000);
})();
