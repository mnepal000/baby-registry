// Baby registry app: countdown, filters, purchase claims (localStorage + optional
// shared Google Sheet). Claim details (buyer name, platform, order no., message)
// are collected Babylist-style via a modal form.
(function () {
  "use strict";

  var LS_KEY = "baby-registry-claims-v1";
  var CLAIM = window.CLAIM_CONFIG || { formUrl: "", entryIds: {}, sheetCsvUrl: "" };

  var state = {
    category: "All",
    priority: "all",
    query: "",
    hidePurchased: false,
    localClaims: loadLocalClaims(), // { itemId: {name, platform, order, message, ts} }
    sheetClaims: {}                 // { itemId: {...} } from published CSV
  };

  function loadLocalClaims() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      var data = raw ? JSON.parse(raw) : {};
      // migrate the old boolean format
      Object.keys(data).forEach(function (k) {
        if (data[k] === true) data[k] = { name: "", platform: "", order: "", message: "", ts: Date.now() };
      });
      return data;
    } catch (e) {
      return {};
    }
  }
  function saveLocalClaims() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state.localClaims)); } catch (e) {}
  }

  function getClaim(itemId) {
    if (state.sheetClaims[itemId]) return { data: state.sheetClaims[itemId], shared: true };
    if (state.localClaims[itemId]) return { data: state.localClaims[itemId], shared: false };
    return null;
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
    var bb = document.getElementById("babylistBanner");
    if (bb) {
      if (r.babylistUrl) {
        bb.hidden = false;
        document.getElementById("babylistBtn").href = r.babylistUrl;
      } else {
        bb.hidden = true;
      }
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
    setText("cd-hours", pad(Math.floor(diff / 3600000) % 24));
    setText("cd-mins", pad(Math.floor(diff / 60000) % 60));
    setText("cd-secs", pad(Math.floor(diff / 1000) % 60));
  }
  function setText(id, v) {
    var el = document.getElementById(id);
    if (el) el.textContent = v;
  }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  // ---- Watch him grow: gestational week from the due date ----
  function renderGrowth() {
    var r = window.REGISTRY || {};
    var sizes = window.WEEK_SIZES || [];
    if (!r.dueDate || !sizes.length) return;
    var baby = r.babyName ? r.babyName.split(" ")[0] : "Baby";
    setText("growTitle", baby + " is growing");

    var due = new Date(r.dueDate + "T00:00:00");
    var now = new Date();
    var textEl = document.getElementById("growText");
    var dimsEl = document.getElementById("growDims");
    var emojiEl = document.getElementById("growEmoji");

    if (now >= due) {
      emojiEl.textContent = "💛";
      textEl.innerHTML = "<strong>" + esc(baby) + "</strong> should be here any day now. Welcome, little one!";
      dimsEl.textContent = "";
      return;
    }
    // gestational age: 280 days before the due date is day 0
    var conception = new Date(due.getTime() - 280 * 86400000);
    var week = Math.floor((now - conception) / (7 * 86400000));
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

  // ---- Filters ----
  var CATEGORIES = ["All", "Travel", "Nursery", "Feeding", "Diapering", "Bath & Health", "Clothing", "Play", "Gift Cards"];

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
    if (state.hidePurchased && getClaim(item.id)) return false;
    if (state.query) {
      var q = state.query.toLowerCase();
      var hay = (item.name + " " + (item.brand || "") + " " + item.category + " " + item.blurb).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ---- Modal ----
  var backdrop = null, modalContent = null;
  function initModal() {
    backdrop = document.getElementById("modalBackdrop");
    modalContent = document.getElementById("modalContent");
    document.getElementById("modalClose").addEventListener("click", closeModal);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !backdrop.hidden) closeModal();
    });
  }
  function openModal(html) {
    modalContent.innerHTML = html;
    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    backdrop.hidden = true;
    document.body.style.overflow = "";
  }

  function openClaimModal(item) {
    openModal(
      "<h3>Mark as purchased</h3>" +
      '<p class="modal-sub">' + esc(item.name) + "</p>" +
      '<form id="claimForm" novalidate>' +
      '<label class="field">Your name <span class="req">*</span>' +
      '<input type="text" name="name" required autocomplete="name" placeholder="e.g. Asha Sharma"></label>' +
      '<label class="field">Where did you buy it? <span class="req">*</span>' +
      '<input type="text" name="platform" required value="' + esc(item.store) + '"></label>' +
      '<label class="field">Order number <span class="opt">(optional)</span>' +
      '<input type="text" name="order" autocomplete="off" placeholder="e.g. 112-3456789-1234567"></label>' +
      '<label class="field">A message for the parents <span class="opt">(optional)</span>' +
      '<textarea name="message" rows="3" placeholder="We can\'t wait to meet him!"></textarea></label>' +
      '<p class="fine-print">Your name and message will appear on the registry so other gifters ' +
      "don't buy the same gift. " + (CLAIM.formUrl
        ? "Claims are shared with everyone viewing the registry."
        : "Claims are saved in this browser until the shared list is connected.") + "</p>" +
      '<p class="form-error" id="claimError" hidden>Please fill in your name and where you bought it.</p>' +
      '<button class="btn btn-primary btn-block" type="submit">Confirm purchase</button>' +
      "</form>"
    );
    document.getElementById("claimForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target;
      var name = f.name.value.trim();
      var platform = f.platform.value.trim();
      if (!name || !platform) {
        document.getElementById("claimError").hidden = false;
        return;
      }
      submitClaim(item, {
        name: name,
        platform: platform,
        order: f.order.value.trim(),
        message: f.message.value.trim(),
        ts: Date.now()
      });
    });
  }

  function openDetailsModal(item, claim, shared) {
    var d = claim;
    openModal(
      "<h3>Purchased ✓</h3>" +
      '<p class="modal-sub">' + esc(item.name) + "</p>" +
      '<dl class="claim-details">' +
      "<dt>Gifted by</dt><dd>" + esc(d.name || "A friend") + "</dd>" +
      "<dt>Purchased at</dt><dd>" + esc(d.platform || "—") + "</dd>" +
      (d.order ? "<dt>Order number</dt><dd>" + esc(d.order) + "</dd>" : "") +
      (d.message ? "<dt>Message</dt><dd class='msg'>" + esc(d.message) + "</dd>" : "") +
      "</dl>" +
      (shared
        ? '<p class="fine-print">This claim is shared on the registry for all visitors.</p>'
        : '<p class="fine-print">Saved in this browser. ' +
          (CLAIM.formUrl ? "" : "It will be visible to everyone once the shared list is connected.") + "</p>")
    );
  }

  function submitClaim(item, claim) {
    state.localClaims[item.id] = claim;
    saveLocalClaims();
    postToForm(item, claim);
    closeModal();
    render();
    openModal(
      "<h3>Thank you! 💛</h3>" +
      '<p class="modal-sub">' + esc(item.name) + "</p>" +
      "<p>Your purchase has been recorded" +
      (CLAIM.formUrl ? " and shared on the registry." : " in this browser.") + "</p>" +
      '<button class="btn btn-primary btn-block" id="thanksOk">Done</button>'
    );
    document.getElementById("thanksOk").addEventListener("click", closeModal);
  }

  function postToForm(item, claim) {
    if (!CLAIM.formUrl || !CLAIM.entryIds || !CLAIM.entryIds.itemId) return;
    try {
      var body = new URLSearchParams();
      body.append(CLAIM.entryIds.itemId, item.id);
      if (CLAIM.entryIds.name) body.append(CLAIM.entryIds.name, claim.name);
      if (CLAIM.entryIds.platform) body.append(CLAIM.entryIds.platform, claim.platform);
      if (CLAIM.entryIds.order) body.append(CLAIM.entryIds.order, claim.order);
      if (CLAIM.entryIds.message) body.append(CLAIM.entryIds.message, claim.message);
      fetch(CLAIM.formUrl, { method: "POST", mode: "no-cors", body: body });
    } catch (e) { /* fire-and-forget; local copy is the fallback */ }
  }

  // ---- Shared claims via published Google Sheet CSV ----
  function parseCSV(text) {
    var rows = [], row = [], field = "", inQ = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQ) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQ = false;
        } else field += c;
      } else if (c === '"') inQ = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c !== "\r") field += c;
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) {
      return r.some(function (f) { return f.trim() !== ""; });
    });
  }

  function colIndex(head, names) {
    for (var n = 0; n < names.length; n++) {
      for (var i = 0; i < head.length; i++) {
        if (head[i].toLowerCase() === names[n].toLowerCase()) return i;
      }
    }
    return -1;
  }

  function loadSheetClaims() {
    if (!CLAIM.sheetCsvUrl) return Promise.resolve();
    return fetch(CLAIM.sheetCsvUrl, { cache: "no-store" })
      .then(function (res) { return res.ok ? res.text() : ""; })
      .then(function (text) {
        if (!text) return;
        var rows = parseCSV(text);
        if (rows.length < 2) return;
        var head = rows[0].map(function (h) { return h.trim(); });
        var cItem = colIndex(head, ["Item ID", "Item Id", "item_id"]);
        var cName = colIndex(head, ["Your Name", "Name"]);
        var cPlat = colIndex(head, ["Where did you buy it?", "Platform", "Store"]);
        var cOrder = colIndex(head, ["Order Number", "Order number"]);
        var cMsg = colIndex(head, ["Message for the parents", "Message"]);
        if (cItem < 0 || cName < 0) return;
        var claims = {};
        rows.slice(1).forEach(function (r) {
          var id = (r[cItem] || "").trim();
          var name = (r[cName] || "").trim();
          if (!id || !name || claims[id]) return; // first claim per item wins
          claims[id] = {
            name: name,
            platform: cPlat >= 0 ? (r[cPlat] || "").trim() : "",
            order: cOrder >= 0 ? (r[cOrder] || "").trim() : "",
            message: cMsg >= 0 ? (r[cMsg] || "").trim() : "",
            ts: Date.now()
          };
        });
        state.sheetClaims = claims;
        render();
      })
      .catch(function () { /* sheet unavailable: local claims still work */ });
  }

  // ---- Render ----
  function render() {
    var grid = document.getElementById("itemGrid");
    var items = (window.ITEMS || []).filter(matches);
    document.getElementById("emptyMsg").hidden = items.length > 0;
    grid.innerHTML = "";
    items.forEach(function (item) {
      var isGiftCard = !!item.giftCard;
      var found = isGiftCard ? null : getClaim(item.id);
      var claimed = !!found;
      var card = document.createElement("article");
      card.className = "card" + (claimed ? " purchased" : "") + (isGiftCard ? " giftcard" : "");

      var badgeLabel = item.priority === "must" ? "Must-have" : "Nice-to-have";
      var viaBabylist = !isGiftCard && /babylist\.com/.test(item.url || "");
      var buyLabel = isGiftCard ? "Buy gift card" : (viaBabylist ? "Buy on Babylist" : "View / Buy");
      var actions;
      if (isGiftCard) {
        actions = "";
      } else if (claimed) {
        var byName = found.data.name ? " by " + esc(found.data.name) : "";
        actions =
          '<button class="btn-claim claimed giver-link">Gifted' + byName + "</button>" +
          (!found.shared ? '<button class="btn-undo" title="Undo your claim">Undo</button>' : "");
      } else {
        actions = '<button class="btn-claim">Mark as purchased</button>';
      }

      var imgHtml = isGiftCard
        ? '<div class="giftcard-art" role="img" aria-label="Gift card"><span>🎁</span></div>'
        : '<img src="' + esc(item.img) + '" alt="' + esc(item.name) + '" loading="lazy">';

      card.innerHTML =
        '<div class="card-img">' +
          imgHtml +
          '<span class="badge ' + item.priority + '">' + badgeLabel + "</span>" +
          (claimed ? '<span class="purchased-ribbon">Purchased ✓</span>' : "") +
        "</div>" +
        '<div class="card-body">' +
          '<div class="card-cat">' + esc(item.category) + "</div>" +
          "<h3>" + esc(item.name) + "</h3>" +
          (item.brand ? '<p class="card-brand">' + esc(item.brand) + "</p>" : "") +
          '<p class="card-blurb">' + esc(item.blurb) + "</p>" +
          '<div class="card-meta"><span class="card-price">' + esc(item.price) + "</span>" +
          '<span class="card-store">at ' + esc(item.store) + "</span></div>" +
          '<div class="card-actions">' +
            '<a class="btn-buy" href="' + esc(item.url) + '" target="_blank" rel="noopener">' + buyLabel + "</a>" +
            actions +
          "</div>" +
        "</div>";

      if (isGiftCard) {
        // gift cards are never claimed: any amount, no duplicates possible
      } else if (claimed) {
        card.querySelector(".giver-link").addEventListener("click", function () {
          openDetailsModal(item, found.data, found.shared);
        });
        var undo = card.querySelector(".btn-undo");
        if (undo) undo.addEventListener("click", function () {
          delete state.localClaims[item.id];
          saveLocalClaims();
          render();
        });
      } else {
        card.querySelector(".btn-claim").addEventListener("click", function () {
          openClaimModal(item);
        });
      }
      grid.appendChild(card);
    });
    updateProgress();
  }

  function updateProgress() {
    var items = window.ITEMS || [];
    var claimed = items.filter(function (i) { return getClaim(i.id); }).length;
    var pct = items.length ? Math.round((claimed / items.length) * 100) : 0;
    setText("progressText", claimed + " of " + items.length + " gifts claimed");
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
  initModal();
  buildChips();
  render();
  renderGrowth();
  loadSheetClaims();
  tickCountdown();
  setInterval(tickCountdown, 1000);
})();
