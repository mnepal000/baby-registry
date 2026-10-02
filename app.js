// Baby registry app: countdown, filters, purchased tracking (localStorage).
(function () {
  "use strict";

  var LS_KEY = "baby-registry-purchased-v1";
  var state = {
    category: "All",
    priority: "all",
    query: "",
    hidePurchased: false,
    purchased: loadPurchased()
  };

  function loadPurchased() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }
  function savePurchased() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state.purchased)); } catch (e) {}
  }

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
    var d = Math.floor(diff / 86400000);
    var h = Math.floor(diff / 3600000) % 24;
    var m = Math.floor(diff / 60000) % 60;
    var s = Math.floor(diff / 1000) % 60;
    setText("cd-days", d);
    setText("cd-hours", pad(h));
    setText("cd-mins", pad(m));
    setText("cd-secs", pad(s));
  }
  function setText(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = v;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  // ---- Filters ----
  var CATEGORIES = ["All", "Travel", "Nursery", "Feeding", "Diapering", "Bath & Health", "Clothing", "Play"];

  function buildChips() {
    var wrap = document.getElementById("categoryChips");
    wrap.innerHTML = "";
    CATEGORIES.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "chip" + (state.category === c ? " active" : "");
      b.textContent = c;
      b.addEventListener("click", function () {
        state.category = c;
        buildChips();
        render();
      });
      wrap.appendChild(b);
    });
  }

  function matches(item) {
    if (state.category !== "All" && item.category !== state.category) return false;
    if (state.priority !== "all" && item.priority !== state.priority) return false;
    if (state.hidePurchased && state.purchased[item.id]) return false;
    if (state.query) {
      var q = state.query.toLowerCase();
      var hay = (item.name + " " + (item.brand || "") + " " + item.category + " " + item.blurb).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function render() {
    var grid = document.getElementById("itemGrid");
    var items = (window.ITEMS || []).filter(matches);
    document.getElementById("emptyMsg").hidden = items.length > 0;
    grid.innerHTML = "";
    items.forEach(function (item) {
      var claimed = !!state.purchased[item.id];
      var card = document.createElement("article");
      card.className = "card" + (claimed ? " purchased" : "");

      var badgeLabel = item.priority === "must" ? "Must-have" : "Nice-to-have";

      card.innerHTML =
        '<div class="card-img">' +
          '<img src="' + esc(item.img) + '" alt="' + esc(item.name) + '" loading="lazy">' +
          '<span class="badge ' + item.priority + '">' + badgeLabel + "</span>" +
          (claimed ? '<span class="purchased-ribbon">Purchased ✓</span>' : "") +
        "</div>" +
        '<div class="card-body">' +
          '<div class="card-cat">' + esc(item.category) + "</div>" +
          "<h3>" + esc(item.name) + "</h3>" +
          (item.brand ? '<p class="card-brand">' + esc(item.brand) + "</p>" : "") +
          '<p class="card-blurb">' + esc(item.blurb) + "</p>" +
          '<div class="card-meta"><span class="card-price">' + esc(item.price) + '</span>' +
          '<span class="card-store">at ' + esc(item.store) + "</span></div>" +
          '<div class="card-actions">' +
            '<a class="btn-buy" href="' + esc(item.url) + '" target="_blank" rel="noopener">View / Buy</a>' +
            '<button class="btn-claim' + (claimed ? " claimed" : "") + '">' +
              (claimed ? "Purchased ✓" : "Mark as purchased") +
            "</button>" +
          "</div>" +
        "</div>";

      card.querySelector(".btn-claim").addEventListener("click", function () {
        if (state.purchased[item.id]) delete state.purchased[item.id];
        else state.purchased[item.id] = true;
        savePurchased();
        render();
      });
      grid.appendChild(card);
    });
    updateProgress();
  }

  function updateProgress() {
    var total = (window.ITEMS || []).length;
    var claimed = Object.keys(state.purchased).length;
    var pct = total ? Math.round((claimed / total) * 100) : 0;
    setText("progressText", claimed + " of " + total + " gifts claimed");
    setText("progressPct", pct + "%");
    document.getElementById("progressFill").style.width = pct + "%";
  }

  // ---- Wire up ----
  document.getElementById("searchBox").addEventListener("input", function (e) {
    state.query = e.target.value.trim();
    render();
  });
  document.getElementById("priorityFilter").addEventListener("change", function (e) {
    state.priority = e.target.value;
    render();
  });
  document.getElementById("hidePurchased").addEventListener("change", function (e) {
    state.hidePurchased = e.target.checked;
    render();
  });

  personalize();
  buildChips();
  render();
  tickCountdown();
  setInterval(tickCountdown, 1000);
})();
