(function () {
  // ---- Edit business details here ----
  var WHATSAPP = "2349055094051";
  var APTS = window.CLIFFORD_APTS || [];
  var naira = function (n) { return "₦" + n.toLocaleString("en-NG"); };
  var $ = function (id) { return document.getElementById(id); };

  // Mobile menu
  var mb = $("menuBtn"), menu = $("menu");
  if (mb && menu) {
    mb.addEventListener("click", function () { var o = menu.classList.toggle("open"); mb.setAttribute("aria-expanded", o); });
  }
  var yr = $("yr"); if (yr) yr.textContent = new Date().getFullYear();

  // Copy buttons
  function copyText(text, btn) {
    var done = function () { var t = btn.textContent; btn.textContent = "Copied"; setTimeout(function () { btn.textContent = t; }, 1500); };
    try { navigator.clipboard.writeText(text).then(done, function () {}); } catch (e) {}
  }
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () { copyText($(b.dataset.copy).textContent.trim(), b); });
  });

  // Gallery lightbox
  var tiles = Array.prototype.slice.call(document.querySelectorAll(".gallery .ph img"));
  if (tiles.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox"; lb.hidden = true; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
    lb.innerHTML = '<figure style="margin:0;text-align:center"><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-close" aria-label="Close">×</button><button class="lb-prev" aria-label="Previous">‹</button><button class="lb-next" aria-label="Next">›</button>';
    document.body.appendChild(lb);
    var idx = 0, big = lb.querySelector("img"), cap = lb.querySelector("figcaption");
    var show = function (i) { idx = (i + tiles.length) % tiles.length; big.src = tiles[idx].src; big.alt = tiles[idx].alt; cap.textContent = tiles[idx].alt; lb.hidden = false; };
    tiles.forEach(function (t, i) {
      var tile = t.parentNode; tile.tabIndex = 0; tile.setAttribute("role", "button");
      tile.addEventListener("click", function () { show(i); });
      tile.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(i); } });
    });
    lb.querySelector(".lb-close").onclick = function () { lb.hidden = true; };
    lb.querySelector(".lb-prev").onclick = function () { show(idx - 1); };
    lb.querySelector(".lb-next").onclick = function () { show(idx + 1); };
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.hidden = true; });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") lb.hidden = true;
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  // Booking form (contact page)
  var form = $("bookForm");
  if (!form) return;
  var sel = $("fApt"), fin = $("fIn"), fout = $("fOut"), err = $("formErr");
  APTS.forEach(function (a) {
    var o = document.createElement("option"); o.value = a.id; o.textContent = a.name + " — " + naira(a.rate); sel.appendChild(o);
  });
  var want = (location.hash || "").replace("#", "");
  sel.value = APTS.some(function (a) { return a.id === want; }) ? want : APTS[1].id;

  var iso = function (d) { return d.toISOString().slice(0, 10); };
  var today = new Date(); today.setHours(12, 0, 0, 0);
  var start = new Date(today); start.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
  var end = new Date(start); end.setDate(start.getDate() + 3);
  fin.value = iso(start); fout.value = iso(end); fin.min = iso(today); fout.min = iso(today);

  function nights() { var a = new Date(fin.value), b = new Date(fout.value); return (isNaN(a) || isNaN(b)) ? 0 : Math.round((b - a) / 864e5); }
  function update() {
    var n = nights(), apt = APTS.find(function (a) { return a.id === sel.value; });
    $("estNights").textContent = n > 0 ? "Estimated total · " + n + " night" + (n > 1 ? "s" : "") : "Estimated total";
    $("estTotal").textContent = n > 0 ? naira(n * apt.rate) : "—";
  }
  [fin, fout, sel].forEach(function (el) { el.addEventListener("change", update); });
  update();

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = $("fName").value.trim(), phone = $("fPhone").value.trim(), n = nights();
    if (!name || !phone) { err.textContent = "Add your name and phone number so we can reach you."; err.hidden = false; return; }
    if (n < 1) { err.textContent = "Check-out must be at least one day after check-in."; err.hidden = false; return; }
    err.hidden = true;
    var apt = APTS.find(function (a) { return a.id === sel.value; }), note = $("fNote").value.trim();
    var msg = "Hello Clifford Apartment, I'd like to book:\nName: " + name + "\nPhone: " + phone +
      "\nApartment: " + apt.name + "\nCheck-in: " + fin.value + "\nCheck-out: " + fout.value +
      " (" + n + " night" + (n > 1 ? "s" : "") + ")\nGuests: " + $("fGuests").value +
      "\nEstimated total: " + naira(n * apt.rate) + (note ? "\nRequests: " + note : "");
    $("outText").textContent = msg;
    $("waLink").href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
    $("out").hidden = false;
  });
  $("copyReq").addEventListener("click", function () { copyText($("outText").textContent, this); });
})();

// Hero slider
(function () {
  var root = document.getElementById("heroSlider");
  if (!root) return;
  var slides = root.querySelectorAll(".slide"), dots = root.querySelectorAll(".sl-dots button");
  var count = root.querySelector(".sl-count b"), i = 0, timer = null;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function go(n) {
    slides[i].classList.remove("is-active"); slides[i].setAttribute("aria-hidden", "true"); dots[i].removeAttribute("aria-selected");
    i = (n + slides.length) % slides.length;
    slides[i].classList.add("is-active"); slides[i].setAttribute("aria-hidden", "false"); dots[i].setAttribute("aria-selected", "true");
    count.textContent = i + 1;
    var nextImg = slides[(i + 1) % slides.length].querySelector("img"); if (nextImg) nextImg.loading = "eager";
  }
  function start() { stop(); if (!reduce) timer = setInterval(function () { go(i + 1); }, 5000); }
  function stop() { if (timer) clearInterval(timer); timer = null; }
  root.querySelector(".sl-prev").addEventListener("click", function () { go(i - 1); start(); });
  root.querySelector(".sl-next").addEventListener("click", function () { go(i + 1); start(); });
  dots.forEach(function (d, k) { d.addEventListener("click", function () { go(k); start(); }); });
  root.addEventListener("mouseenter", stop); root.addEventListener("mouseleave", start);
  var x0 = null;
  root.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
  root.addEventListener("touchend", function (e) {
    if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1); start();
  });
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
  start();
})();
