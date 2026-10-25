/* Bills 4 Thrills — shared app logic (vanilla JS, no build step). Demo only. */
(function () {
  "use strict";

  // ---------- Storage ----------
  var KEYS = { paid: "b4t_paid", seen: "b4t_seen", posted: "b4t_posted" };

  function read(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { console.warn("Storage full or unavailable", e); return false; }
  }

  var Store = {
    paid: function () { return read(KEYS.paid, []); },
    seen: function () { return read(KEYS.seen, []); },
    posted: function () { return read(KEYS.posted, []); },
    totalPaid: function () {
      return Store.paid().reduce(function (s, p) { return s + Number(p.amount || 0); }, 0);
    },
    markSeen: function (id) {
      var s = Store.seen(); if (s.indexOf(id) === -1) s.push(id); write(KEYS.seen, s);
    },
    addPaid: function (p) {
      var list = Store.paid();
      list.unshift({
        id: p.id, name: p.name, photo: p.photo, billType: p.billType, emoji: p.emoji,
        amount: p.amount, due: p.due, paidAt: new Date().toISOString()
      });
      write(KEYS.paid, list);
    },
    addPosted: function (p) {
      var list = Store.posted(); list.unshift(p); return write(KEYS.posted, list);
    },
    resetDeck: function () { write(KEYS.seen, []); },
    resetAll: function () { localStorage.removeItem(KEYS.paid); localStorage.removeItem(KEYS.seen); }
  };

  function allProfiles() {
    var base = (window.B4T_PROFILES || []).slice();
    return Store.posted().concat(base);
  }

  // ---------- Helpers ----------
  function $(sel, root) { return (root || document).querySelector(sel); }
  function money(n) {
    var num = Number(n) || 0;
    return "$" + num.toLocaleString("en-US", { minimumFractionDigits: num % 1 ? 2 : 0, maximumFractionDigits: 2 });
  }
  function fmtDue(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T12:00:00");
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var GRADIENTS = [
    "linear-gradient(135deg,#ff4f6e,#ff9a3c)", "linear-gradient(135deg,#7f56d9,#ff4f6e)",
    "linear-gradient(135deg,#12b76a,#0ba5ec)", "linear-gradient(135deg,#f79009,#ef6820)",
    "linear-gradient(135deg,#0ba5ec,#6172f3)", "linear-gradient(135deg,#ee46bc,#7a5af8)"
  ];
  function gradientFor(name) {
    var h = 0, s = String(name || "?");
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return GRADIENTS[h % GRADIENTS.length];
  }
  function initial(name) { return esc(String(name || "?").trim().charAt(0).toUpperCase() || "?"); }

  // Image with graceful gradient fallback
  function photoMarkup(p, cls) {
    var fb = '<div class="avatar-fallback" style="background:' + gradientFor(p.name) + '">' + initial(p.name) + "</div>";
    if (!p.photo) return fb;
    return fb + '<img class="' + cls + '" src="' + esc(p.photo) + '" alt="" draggable="false" onerror="this.remove()">';
  }

  function toast(msg) {
    var t = $(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }

  // ---------- Confetti ----------
  function confetti() {
    var canvas = document.getElementById("confetti");
    if (!canvas) return;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var W = canvas.width = innerWidth * dpr, H = canvas.height = innerHeight * dpr;
    var colors = ["#ff4f6e", "#12b76a", "#ff9a3c", "#7f56d9", "#0ba5ec", "#fdb022"];
    var parts = [];
    for (var i = 0; i < 180; i++) {
      parts.push({
        x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.45,
        vx: (Math.random() - 0.5) * 22 * dpr, vy: (-Math.random() * 20 - 8) * dpr,
        w: (6 + Math.random() * 8) * dpr, h: (8 + Math.random() * 10) * dpr,
        r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
        c: colors[i % colors.length], life: 0
      });
    }
    var start = performance.now();
    cancelAnimationFrame(canvas._raf);
    (function frame(now) {
      var t = now - start;
      ctx.clearRect(0, 0, W, H);
      parts.forEach(function (p) {
        p.vy += 0.45 * dpr; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - t / 3200);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r)));
        ctx.restore();
      });
      if (t < 3200) canvas._raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, W, H);
    })(start);
  }

  // ---------- Swipe page ----------
  function initSwipe() {
    var deck = $("#deck"), tallyEl = $("#tally-amount"), btnPay = $("#btn-pay"), btnPass = $("#btn-pass");
    var modal = $("#match-modal");
    var queue = [];
    var busy = false;

    function updateTally(animate) {
      var target = Store.totalPaid();
      if (!animate) { tallyEl.textContent = money(target); return; }
      var from = Number(tallyEl.dataset.v || 0), t0 = performance.now();
      (function step(now) {
        var k = Math.min(1, (now - t0) / 700), e = 1 - Math.pow(1 - k, 3);
        tallyEl.textContent = money(Math.round(from + (target - from) * e));
        if (k < 1) requestAnimationFrame(step); else tallyEl.textContent = money(target);
      })(t0);
      tallyEl.dataset.v = target;
    }

    function buildQueue() {
      var seen = Store.seen();
      queue = allProfiles().filter(function (p) { return seen.indexOf(p.id) === -1; });
    }

    function cardEl(p) {
      var el = document.createElement("article");
      el.className = "card";
      el.setAttribute("aria-label", p.name + ", " + p.age + ". " + p.billType + " bill " + money(p.amount));
      el.innerHTML =
        photoMarkup(p, "photo") +
        '<div class="shade"></div>' +
        (p.userPosted ? '<span class="badge-new">Just posted</span>' : "") +
        '<div class="stamp stamp-pay">PAY</div>' +
        '<div class="stamp stamp-pass">PASS</div>' +
        '<div class="info">' +
          '<div class="name">' + esc(p.name) + ' <span class="age">' + esc(p.age) + "</span></div>" +
          (p.tagline ? '<div class="tagline">' + esc(p.tagline) + "</div>" : "") +
          '<p class="story">' + esc(p.story) + "</p>" +
          '<div class="bill-chip"><span>' + esc(p.emoji || "🧾") + " " + esc(p.billType) + '</span><span class="amt">' + money(p.amount) + "</span>" +
            (p.due ? '<span class="due">due ' + fmtDue(p.due) + "</span>" : "") + "</div>" +
        "</div>";
      return el;
    }

    function render() {
      deck.innerHTML = "";
      if (!queue.length) {
        deck.innerHTML =
          '<div class="empty">' +
            '<div class="big-emoji">🎉</div>' +
            "<h2>You've seen everyone!</h2>" +
            "<p>That's every bill in the deck. You paid <strong>" + money(Store.totalPaid()) + "</strong> worth. Absolute legend.</p>" +
            '<button class="btn btn-primary btn-block" id="btn-reset">Reset the deck</button>' +
            '<a class="btn btn-ghost btn-block" href="post.html">Post a bill</a>' +
          "</div>";
        $("#btn-reset").addEventListener("click", function () {
          Store.resetDeck(); buildQueue(); render(); toast("Deck reshuffled ✨");
        });
        btnPay.disabled = btnPass.disabled = true;
        return;
      }
      btnPay.disabled = btnPass.disabled = false;
      var visible = queue.slice(0, 3);
      for (var i = visible.length - 1; i >= 0; i--) {
        var el = cardEl(visible[i]);
        el.style.zIndex = 10 - i;
        el.style.transform = "translateY(" + (i * 10) + "px) scale(" + (1 - i * 0.04) + ")";
        if (i > 0) el.style.pointerEvents = "none";
        deck.appendChild(el);
        if (i === 0) attachDrag(el);
      }
    }

    function topCard() { return deck.querySelector(".card:last-child"); }

    function attachDrag(el) {
      var startX = 0, startY = 0, dx = 0, dy = 0, dragging = false, lastT = 0, lastX = 0, vx = 0;
      var stampPay = el.querySelector(".stamp-pay"), stampPass = el.querySelector(".stamp-pass");

      function setStamps(x) {
        var k = Math.min(1, Math.abs(x) / 110);
        stampPay.style.opacity = x > 0 ? k : 0;
        stampPass.style.opacity = x < 0 ? k : 0;
      }

      el.addEventListener("pointerdown", function (e) {
        if (busy || e.button > 0) return;
        dragging = true; startX = e.clientX; startY = e.clientY; dx = dy = 0;
        lastX = e.clientX; lastT = performance.now(); vx = 0;
        el.classList.add("dragging");
        el.setPointerCapture(e.pointerId);
      });
      el.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        dx = e.clientX - startX; dy = e.clientY - startY;
        var now = performance.now();
        if (now - lastT > 0) vx = (e.clientX - lastX) / (now - lastT);
        lastX = e.clientX; lastT = now;
        el.style.transform = "translate(" + dx + "px," + dy * 0.4 + "px) rotate(" + dx * 0.06 + "deg)";
        setStamps(dx);
      });
      function end() {
        if (!dragging) return;
        dragging = false;
        el.classList.remove("dragging");
        var threshold = Math.min(120, deck.offsetWidth * 0.28);
        if (dx > threshold || vx > 0.6 && dx > 30) decide("pay");
        else if (dx < -threshold || vx < -0.6 && dx < -30) decide("pass");
        else { el.style.transform = ""; setStamps(0); }
      }
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", end);
    }

    function decide(dir, viaKey) {
      if (busy || !queue.length) return;
      var el = topCard();
      if (!el) return;
      busy = true;
      var p = queue[0];
      var sign = dir === "pay" ? 1 : -1;
      el.querySelector(dir === "pay" ? ".stamp-pay" : ".stamp-pass").style.opacity = 1;
      el.classList.remove("dragging");
      el.style.transform = "translate(" + sign * (window.innerWidth + 200) + "px, -40px) rotate(" + sign * 28 + "deg)";
      el.style.opacity = "0.9";

      Store.markSeen(p.id);
      if (dir === "pay") { Store.addPaid(p); updateTally(true); }

      setTimeout(function () {
        queue.shift();
        render();
        busy = false;
        if (dir === "pay") openMatch(p, viaKey);
      }, 320);
    }

    function openMatch(p, viaKey) {
      var holder = $("#match-avatar");
      holder.innerHTML = "";
      var fb = document.createElement("div");
      fb.className = "av";
      fb.style.background = gradientFor(p.name); fb.style.color = "#fff"; fb.style.fontWeight = "800";
      fb.textContent = String(p.name || "?").charAt(0).toUpperCase();
      if (p.photo) {
        var im = document.createElement("img");
        im.className = "av"; im.alt = ""; im.src = p.photo;
        im.onerror = function () { holder.replaceChild(fb, im); };
        holder.appendChild(im);
      } else holder.appendChild(fb);
      $("#match-text").innerHTML = "You just paid " + esc(p.name) + "'s " +
        '<span class="amt">' + money(p.amount) + "</span> " + esc(String(p.billType).toLowerCase()) + " bill.";
      var lines = [
        "Somewhere, a utility company is very confused.",
        "That's the most attractive thing you've done all week.",
        "Swiping right on responsibility. Love that for you.",
        "Bills paid. Vibes immaculate.",
        "A match made in accounts receivable."
      ];
      $("#match-sub").textContent = lines[Math.floor(Math.random() * lines.length)];
      modal.hidden = false;
      requestAnimationFrame(function () { modal.classList.add("open"); });
      confetti();
      if (viaKey) setTimeout(function () { $("#btn-keep").focus(); }, 50);
    }
    function closeMatch() {
      modal.classList.remove("open");
      setTimeout(function () { modal.hidden = true; }, 250);
    }

    btnPay.addEventListener("click", function () { decide("pay"); });
    btnPass.addEventListener("click", function () { decide("pass"); });
    $("#btn-keep").addEventListener("click", closeMatch);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeMatch(); });
    document.addEventListener("keydown", function (e) {
      if (!modal.hidden) { if (e.key === "Escape") closeMatch(); return; }
      if (e.target.closest && e.target.closest("input,textarea,select")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); decide("pay", true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); decide("pass", true); }
    });

    tallyEl.dataset.v = Store.totalPaid();
    updateTally(false);
    buildQueue();
    render();
  }

  // ---------- Post page ----------
  function resizeImage(file, maxSize, cb) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        var c = document.createElement("canvas");
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = function () { cb(null); };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  var BILL_EMOJI = { Electric: "⚡", Water: "💧", Gas: "🔥", Rent: "🏠", Phone: "📱", Internet: "📶",
    Groceries: "🛒", Medical: "🩺", Tuition: "🎓", Textbooks: "📚", "Car repair": "🚗", Other: "🧾" };

  function initPost() {
    var form = $("#post-form"), preview = $("#photo-preview"), urlIn = $("#photo-url"), fileIn = $("#photo-file");
    var nameIn = $("#name"), story = $("#story"), count = $("#story-count");
    var photoData = "";

    // default due date: two weeks out
    var d = new Date(); d.setDate(d.getDate() + 14);
    $("#due").value = d.toISOString().slice(0, 10);

    function showPreview(src) {
      if (src) {
        preview.innerHTML = '<img src="' + esc(src) + '" alt="Photo preview">';
        preview.querySelector("img").onerror = function () { photoData = ""; showPreview(""); toast("Couldn't load that image"); };
      } else {
        preview.innerHTML = initial(nameIn.value || "?");
        preview.style.background = nameIn.value ? gradientFor(nameIn.value) : "";
        preview.style.color = nameIn.value ? "#fff" : "";
      }
    }
    nameIn.addEventListener("input", function () { if (!photoData) showPreview(""); });
    urlIn.addEventListener("input", function () {
      var v = urlIn.value.trim();
      if (/^https?:\/\/.+/i.test(v)) { photoData = v; fileIn.value = ""; showPreview(v); }
      else if (!v) { photoData = ""; showPreview(""); }
    });
    fileIn.addEventListener("change", function () {
      var f = fileIn.files && fileIn.files[0];
      if (!f) return;
      if (!/^image\//.test(f.type)) { toast("Please pick an image file"); return; }
      resizeImage(f, 640, function (data) {
        if (!data) { toast("Couldn't read that image"); return; }
        photoData = data; urlIn.value = ""; showPreview(data);
        $("#file-label").textContent = "✓ " + (f.name.length > 22 ? f.name.slice(0, 20) + "…" : f.name);
      });
    });
    story.addEventListener("input", function () { count.textContent = story.value.length + " / 280"; });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll(".field").forEach(function (f) { f.classList.remove("invalid"); });
      function need(id, cond) {
        var el = document.getElementById(id);
        if (!cond) { el.closest(".field").classList.add("invalid"); if (ok) el.focus(); ok = false; }
      }
      var age = Number($("#age").value), amount = Number($("#amount").value);
      need("name", nameIn.value.trim().length > 0);
      need("age", age >= 18 && age <= 120);
      need("story", story.value.trim().length >= 10);
      need("amount", amount > 0 && amount <= 100000);
      if (!ok) return;

      var billType = (form.querySelector('input[name="billType"]:checked') || {}).value || "Other";
      var profile = {
        id: "user-" + Date.now(),
        name: nameIn.value.trim(),
        age: age,
        photo: photoData,
        tagline: $("#tagline").value.trim(),
        story: story.value.trim(),
        billType: billType,
        emoji: BILL_EMOJI[billType] || "🧾",
        amount: Math.round(amount * 100) / 100,
        due: $("#due").value,
        userPosted: true
      };
      if (!Store.addPosted(profile)) {
        if (profile.photo && profile.photo.indexOf("data:") === 0) {
          profile.photo = ""; Store.addPosted(profile);
          toast("Photo was too big to save, used an avatar instead");
        } else { toast("Couldn't save. Browser storage is full."); return; }
      }
      $("#success-name").textContent = profile.name;
      $("#success-bill").textContent = money(profile.amount) + " " + billType.toLowerCase() + " bill";
      form.hidden = true; $(".demo-banner").hidden = true; $("#post-head").hidden = true;
      $("#success").hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    $("#post-another").addEventListener("click", function () {
      form.reset(); photoData = ""; showPreview(""); count.textContent = "0 / 280";
      $("#file-label").textContent = "Upload a photo";
      var d2 = new Date(); d2.setDate(d2.getDate() + 14); $("#due").value = d2.toISOString().slice(0, 10);
      form.hidden = false; $(".demo-banner").hidden = false; $("#post-head").hidden = false; $("#success").hidden = true;
      window.scrollTo({ top: 0 });
    });

    showPreview("");
  }

  // ---------- Matches page ----------
  function initMatches() {
    var list = $("#match-list"), paid = Store.paid();
    $("#sum-total").textContent = money(Store.totalPaid());
    $("#sum-count").textContent = paid.length;
    if (!paid.length) {
      $("#matches-empty").hidden = false; list.hidden = true; $("#btn-clear").hidden = true;
      return;
    }
    list.innerHTML = paid.map(function (p) {
      var thumb = p.photo
        ? '<img class="thumb" src="' + esc(p.photo) + '" alt="" onerror="this.style.background=\'' + gradientFor(p.name) + '\';this.removeAttribute(\'src\')">'
        : '<div class="thumb" style="background:' + gradientFor(p.name) + '">' + initial(p.name) + "</div>";
      var when = new Date(p.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return '<li class="match-item">' + thumb +
        '<div class="mi-body"><div class="mi-name">' + esc(p.name) + '<span class="paid-pill">PAID</span></div>' +
        '<div class="mi-bill">' + esc(p.emoji || "🧾") + " " + esc(p.billType) + " bill · paid " + when + "</div></div>" +
        '<div class="mi-amt">' + money(p.amount) + "</div></li>";
    }).join("");
    $("#btn-clear").addEventListener("click", function () {
      if (confirm("Clear your paid bills and reshuffle the deck? (It's all pretend anyway.)")) {
        Store.resetAll(); location.reload();
      }
    });
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", function () {
    var page = document.body.dataset.page;
    var y = $("#year"); if (y) y.textContent = new Date().getFullYear();
    var t = $("#hero-total"); if (t) t.textContent = money(Store.totalPaid());
    if (page === "swipe") initSwipe();
    if (page === "post") initPost();
    if (page === "matches") initMatches();
  });

  window.B4T = { Store: Store, confetti: confetti };
})();
