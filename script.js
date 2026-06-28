/* ═══════════════════════════════════════════════════════════════════
   flaude — homepage interactions. Vanilla JS, zero libraries.
   • Hero data-rain canvas
   • Cinematic install terminal (type → stream → shaders-loaded card)
   • Scroll engine: single rAF + lerp → [T1] pinned reveal,
     [T2] horizontal panels, [T3] parallax wordmark, hero wordmark
   • [T4] halftone dot-wave canvas   • [T5] staggered reveals
   • copy buttons + waitlist
═══════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var REDUCED = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var INSTALL_CMD = "curl -fsSL https://flaude.com | sh";
  var clamp = function (v, a, b) { a = a == null ? 0 : a; b = b == null ? 1 : b; return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ─────────────────────────────────────────────────────────────
     1. HERO DATA-RAIN
  ───────────────────────────────────────────────────────────── */
  (function () {
    var canvas = document.getElementById("rain");
    if (!canvas) return;
    var ctx = canvas.getContext("2d", { alpha: true });
    var W = 0, H = 0, dpr = 1, cols = [], fontSize = 16, raf = null;
    var tokens = ["sync", "flo", "build", "✓", "▸", "caffeinate", "push", "preview", "ctx",
      "snap", "0x1f", "af3e", "7c2", "de56", "ship", "run", "claude", "photo", "awake", "wake", "loop"];
    var glyphs = "01▸✓·_/<>{}[]#$".split("");
    var pick = function (a) { return a[(Math.random() * a.length) | 0]; };

    function setup() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fontSize = Math.max(13, Math.min(18, W / 90));
      var n = Math.ceil(W / (fontSize * 1.65)); cols = [];
      for (var i = 0; i < n; i++) cols.push({ x: i * (fontSize * 1.65) + fontSize * 0.4, y: Math.random() * H, speed: 0.5 + Math.random() * 1.1, word: Math.random() < 0.22 ? pick(tokens) : null, flip: Math.random() * 60 | 0 });
    }
    function draw() {
      ctx.fillStyle = "rgba(8,6,10,0.16)"; ctx.fillRect(0, 0, W, H);
      ctx.font = fontSize + "px 'Space Mono', monospace"; ctx.textBaseline = "top";
      for (var i = 0; i < cols.length; i++) {
        var c = cols[i], text, isWord = false;
        if (c.word && (c.flip % 30 < 14)) { text = c.word; isWord = true; } else text = pick(glyphs);
        var head = Math.random() < 0.06;
        if (head) { ctx.fillStyle = "rgba(255,138,92,0.95)"; ctx.shadowColor = "rgba(255,106,90,0.8)"; ctx.shadowBlur = 8; }
        else if (isWord) { ctx.fillStyle = "rgba(222,86,86,0.5)"; ctx.shadowBlur = 0; }
        else { ctx.fillStyle = "rgba(202,140,120,0.32)"; ctx.shadowBlur = 0; }
        ctx.fillText(text, c.x, c.y); ctx.shadowBlur = 0;
        c.y += c.speed * fontSize * 0.5; c.flip++;
        if (c.y > H + fontSize) { c.y = -fontSize * 2 - Math.random() * H * 0.4; c.speed = 0.5 + Math.random() * 1.1; c.word = Math.random() < 0.22 ? pick(tokens) : null; }
      }
      raf = requestAnimationFrame(draw);
    }
    function start() {
      setup();
      if (REDUCED) { ctx.fillStyle = "rgba(8,6,10,1)"; ctx.fillRect(0, 0, W, H); ctx.font = fontSize + "px 'Space Mono', monospace"; ctx.textBaseline = "top"; for (var j = 0; j < cols.length; j++) for (var k = 0; k < 6; k++) { ctx.fillStyle = "rgba(202,140,120,0.2)"; ctx.fillText(pick(glyphs), cols[j].x, (cols[j].y + k * fontSize * 2) % H); } return; }
      if (raf) cancelAnimationFrame(raf); draw();
    }
    var rt = null;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(start, 180); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } } else if (!REDUCED && !raf) draw(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
    setTimeout(function () { if (!cols.length) start(); }, 400);
  })();

  /* ─────────────────────────────────────────────────────────────
     2. CINEMATIC INSTALL TERMINAL
  ───────────────────────────────────────────────────────────── */
  (function () {
    var typedEl = document.getElementById("typed");
    if (!typedEl) return;
    var cursorEl = document.getElementById("cursor");
    var outputEl = document.getElementById("output");
    var appstoreEl = document.getElementById("appstore");
    var replayBtn = document.getElementById("replayBtn");
    var LOG = [
      { html: '<span class="arr">▸</span> downloading flaude <span class="dim">v1.0.0…</span>', after: 520 },
      { html: '<span class="arr">▸</span> linking to Claude Code', after: 600 },
      { html: '<span class="arr">▸</span> starting the daemon <span class="dim">+ waking Flo</span>', after: 640 },
      { html: '<span class="arr">▸</span> loading shaders <span class="dim">×5</span>', after: 700 },
      { html: '<span class="arr">▸</span> enabling <span class="dim">caffeinate</span> — your laptop stays awake', after: 640 },
      { html: '<span class="tick-g">✓</span> <span class="ok">installed.</span> run, shaders on.', after: 520 }
    ];
    var timers = [];
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function wait(ms) { return new Promise(function (r) { timers.push(setTimeout(r, ms)); }); }
    function typeCmd() {
      return new Promise(function (resolve) {
        var i = 0;
        (function step() {
          typedEl.textContent = INSTALL_CMD.slice(0, i);
          if (i >= INSTALL_CMD.length) return resolve();
          i++; timers.push(setTimeout(function () { requestAnimationFrame(step); }, 26 + Math.random() * 46));
        })();
      });
    }
    function pushLine(item) { var l = document.createElement("div"); l.className = "out-line"; l.innerHTML = item.html; outputEl.appendChild(l); requestAnimationFrame(function () { requestAnimationFrame(function () { l.classList.add("show"); }); }); }
    function finalInstant() { clearTimers(); typedEl.textContent = INSTALL_CMD; outputEl.innerHTML = ""; LOG.forEach(function (it) { var l = document.createElement("div"); l.className = "out-line show"; l.innerHTML = it.html; outputEl.appendChild(l); }); appstoreEl.classList.add("show"); appstoreEl.setAttribute("aria-hidden", "false"); }
    function run() {
      clearTimers(); outputEl.innerHTML = ""; typedEl.textContent = ""; appstoreEl.classList.remove("show"); appstoreEl.setAttribute("aria-hidden", "true"); if (cursorEl) cursorEl.style.display = "";
      if (REDUCED) return finalInstant();
      typeCmd().then(function () { return wait(420); }).then(function () {
        if (cursorEl) cursorEl.style.display = "none";
        return LOG.reduce(function (ch, it) { return ch.then(function () { pushLine(it); return wait(it.after); }); }, Promise.resolve());
      }).then(function () { return wait(360); }).then(function () { appstoreEl.classList.add("show"); appstoreEl.setAttribute("aria-hidden", "false"); });
    }
    var started = false, go = function () { if (started) return; started = true; run(); };
    if ("IntersectionObserver" in window) { var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { go(); o.disconnect(); } }); }, { threshold: 0.4 }); o.observe(document.getElementById("term")); } else go();
    if (replayBtn) replayBtn.addEventListener("click", function () { started = true; if (cursorEl) cursorEl.style.display = ""; run(); });
  })();

  /* ─────────────────────────────────────────────────────────────
     3. COPY BUTTONS
  ───────────────────────────────────────────────────────────── */
  [].forEach.call(document.querySelectorAll(".copybtn"), function (btn) {
    btn.addEventListener("click", function () {
      var cmd = btn.getAttribute("data-cmd") || INSTALL_CMD;
      var done = function () { btn.classList.add("copied"); setTimeout(function () { btn.classList.remove("copied"); }, 1600); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(cmd).then(done).catch(fb); else fb();
      function fb() { var ta = document.createElement("textarea"); ta.value = cmd; ta.style.position = "absolute"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(ta); done(); }
    });
  });

  /* ─────────────────────────────────────────────────────────────
     4. SCROLL ENGINE  →  [T1] pinned reveal · [T2] panels · [T3]+hero parallax
  ───────────────────────────────────────────────────────────── */
  var isNarrow = function () { return window.matchMedia("(max-width:720px)").matches; };
  var progress = document.getElementById("progress");

  // [T1] pinned headline reveal
  var T1 = (function () {
    var wrap = document.getElementById("pin"), head = document.getElementById("revealHead"), pct = document.getElementById("pinPct");
    if (!wrap || !head) return { measure: function () {}, update: function () {} };
    var words = [], top = 0, range = 1;
    (function build() {
      var tmp = document.createElement("div"); tmp.innerHTML = head.innerHTML; head.innerHTML = "";
      [].forEach.call(tmp.childNodes, function (node) {
        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach(function (tok) {
            if (tok.trim() === "") { head.appendChild(document.createTextNode(tok)); return; }
            var s = document.createElement("span"); s.className = "w"; s.textContent = tok; head.appendChild(s); words.push(s);
          });
        } else if (node.nodeName === "EM") {
          var s = document.createElement("span"); s.className = "w"; s.appendChild(document.createElement("em")).textContent = node.textContent; head.appendChild(s); words.push(s);
        }
      });
    })();
    function measure() { var r = wrap.getBoundingClientRect(); top = r.top + window.scrollY; range = wrap.offsetHeight - window.innerHeight; }
    function update(y) {
      if (REDUCED || isNarrow() || !words.length) return;
      var p = clamp((y - top) / range); p = clamp((p - 0.05) / 0.8);
      if (pct) pct.textContent = String(Math.round(p * 100)).padStart ? String(Math.round(p * 100)).padStart(2, "0") : ("0" + Math.round(p * 100)).slice(-2);
      var lit = Math.round(p * words.length);
      for (var i = 0; i < words.length; i++) { var on = i < lit, w = words[i]; if (on !== w._lit) { w._lit = on; w.classList.toggle("lit", on); w.style.opacity = on ? "1" : ".12"; w.style.transform = on ? "translateY(0)" : "translateY(.12em)"; } }
    }
    return { measure: measure, update: update };
  })();

  // [T2] horizontal slide panels
  var T2 = (function () {
    var wrap = document.querySelector(".h-wrap"), track = document.getElementById("hTrack");
    if (!wrap || !track) return { measure: function () {}, update: function () {} };
    var cards = [].slice.call(track.querySelectorAll(".card")), top = 0, range = 1, maxX = 0, active = -1;
    function measure() {
      if (REDUCED || isNarrow()) { wrap.style.height = ""; track.style.transform = ""; return; }
      maxX = Math.max(0, track.scrollWidth - window.innerWidth);
      wrap.style.height = (window.innerHeight + maxX) + "px";
      var r = wrap.getBoundingClientRect(); top = r.top + window.scrollY; range = wrap.offsetHeight - window.innerHeight;
    }
    function update(y) {
      if (REDUCED || isNarrow()) return;
      var p = clamp((y - top) / range); track.style.transform = "translate3d(" + (-p * maxX) + "px,0,0)";
      var center = window.innerWidth / 2, best = Infinity, bestI = 0;
      cards.forEach(function (c, i) { var cr = c.getBoundingClientRect(), d = Math.abs((cr.left + cr.width / 2) - center); if (d < best) { best = d; bestI = i; } var rel = ((cr.left + cr.width / 2) - center) / window.innerWidth, g = c.querySelector(".glyph"); if (g) g.style.transform = "translate3d(" + (rel * -60) + "px," + (rel * 24) + "px,0)"; });
      if (bestI !== active) { active = bestI; cards.forEach(function (c, i) { var on = i === bestI; c.classList.toggle("active", on); c.style.transform = on ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(.985)"; }); }
    }
    return { measure: measure, update: update };
  })();

  // [T3] mid-page parallax wordmark
  var T3 = (function () {
    var sec = document.getElementById("wordSec"), mark = document.getElementById("wordmark");
    if (!sec || !mark) return { measure: function () {}, update: function () {} };
    var center = 0;
    function measure() { var r = sec.getBoundingClientRect(); center = r.top + window.scrollY + sec.offsetHeight / 2; }
    function update(y) { if (REDUCED) return; var rel = clamp(((y + window.innerHeight / 2) - center) / window.innerHeight, -1, 1); mark.style.transform = "translate3d(" + (rel * -14) + "%,0,0) scale(" + (1 + (1 - Math.abs(rel)) * 0.08).toFixed(3) + ")"; }
    return { measure: measure, update: update };
  })();

  // hero cropped wordmark parallax
  var heroWM = document.querySelector(".wordmark-wrap");
  function updateHeroWM(y) { if (REDUCED || !heroWM) return; var p = clamp(y / 600); heroWM.style.transform = "translateY(" + (p * 70) + "px) scale(" + (1 + p * 0.12) + ")"; }

  var targetY = window.scrollY, smoothY = targetY, docH = 1, need = true;
  function measureAll() { docH = document.documentElement.scrollHeight - window.innerHeight; T1.measure(); T2.measure(); T3.measure(); need = true; }
  function onScroll() { targetY = window.scrollY; need = true; }
  function frame() {
    smoothY = REDUCED ? targetY : lerp(smoothY, targetY, 0.12);
    var settled = Math.abs(smoothY - targetY) < 0.4;
    if (need || !settled) {
      if (progress) progress.style.width = (clamp(targetY / docH) * 100).toFixed(2) + "%";
      T1.update(targetY); T2.update(targetY); T3.update(smoothY); updateHeroWM(smoothY);
      if (settled) need = false;
    }
    requestAnimationFrame(frame);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", measureAll, { passive: true });
  window.addEventListener("load", measureAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureAll);
  measureAll();
  requestAnimationFrame(frame);

  /* ─────────────────────────────────────────────────────────────
     5. [T5] STAGGERED REVEALS
  ───────────────────────────────────────────────────────────── */
  (function () {
    var els = document.querySelectorAll("[data-reveal]");
    if (REDUCED || !("IntersectionObserver" in window)) { [].forEach.call(els, function (el) { el.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (!en.isIntersecting) return; var el = en.target, d = parseInt(el.dataset.delay || "0", 10); setTimeout(function () { el.classList.add("in"); }, d); io.unobserve(el); });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    [].forEach.call(els, function (el) { io.observe(el); });
  })();

  /* ─────────────────────────────────────────────────────────────
     6. [T4] HALFTONE DOT-WAVE CANVAS
  ───────────────────────────────────────────────────────────── */
  (function () {
    var cv = document.getElementById("dotwave"); if (!cv) return;
    var ctx = cv.getContext("2d"), sec = cv.parentElement;
    var CREAM = [244, 239, 230], CORAL = [222, 86, 86], GAP = 30;
    var dpr = 1, cols = 0, rows = 0, W = 0, H = 0, t = 0, running = false, visible = false;
    function resize() { dpr = Math.min(window.devicePixelRatio || 1, 2); var r = sec.getBoundingClientRect(); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); cols = Math.ceil(W / GAP) + 1; rows = Math.ceil(H / GAP) + 1; }
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H); t += REDUCED ? 0 : 0.018; var k = 0.018;
      for (var gy = 0; gy < rows; gy++) for (var gx = 0; gx < cols; gx++) {
        var x = gx * GAP, y = gy * GAP;
        var wv = Math.sin(x * k + t) * 0.6 + Math.sin(y * k * 1.3 - t * 0.8) * 0.4;
        var e = ((wv + 1) / 2); e = e * e;
        var radius = 0.7 + e * 2.4, alpha = 0.05 + e * 0.55;
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + ((CREAM[0] + (CORAL[0] - CREAM[0]) * e) | 0) + "," + ((CREAM[1] + (CORAL[1] - CREAM[1]) * e) | 0) + "," + ((CREAM[2] + (CORAL[2] - CREAM[2]) * e) | 0) + "," + alpha.toFixed(3) + ")";
        ctx.arc(x, y, radius, 0, 6.2832); ctx.fill();
      }
      if (REDUCED) { running = false; return; }
      requestAnimationFrame(draw);
    }
    function startWave() { if (!running && visible) { running = true; requestAnimationFrame(draw); } }
    function stopWave() { running = false; }
    resize();
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) { if (REDUCED) { running = true; draw(); } else startWave(); } else stopWave(); }, { threshold: 0 }).observe(sec);
    else { visible = true; startWave(); }
    window.addEventListener("resize", function () { resize(); if (REDUCED && visible) { running = true; draw(); } }, { passive: true });
  })();

  /* ─────────────────────────────────────────────────────────────
     7. WAITLIST
  ───────────────────────────────────────────────────────────── */
  (function () {
    var form = document.getElementById("waitlist"); if (!form) return;
    var input = document.getElementById("email"), msg = document.getElementById("waitlistMsg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = (input.value || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) { msg.textContent = "Hmm — that email doesn't look right."; msg.classList.add("error"); input.focus(); return; }
      msg.classList.remove("error"); msg.textContent = "You're on the list. We'll send the install command soon. ✓"; input.value = "";
      // Wire to a real endpoint / mailto later.
    });
  })();
})();
