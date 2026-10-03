(function () {
  "use strict";

  /* ---------- Bordas de papel rasgado (clip-path gerado) ---------- */
  function seeded(seed) {
    var s = seed;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  function edge(rand, amp, step) {
    var pts = [], x = 0;
    while (x < 100) { pts.push([x, rand() * amp]); x += step * (0.6 + rand() * 0.9); }
    pts.push([100, rand() * amp]);
    return pts;
  }

  function applyTorn(el, index) {
    var mode = el.dataset.torn || "all";
    var amp = parseFloat(el.dataset.amp || "10");
    var rand = seeded(1000 + index * 97);
    var step = amp > 8 ? 2.6 : 5;

    var top = edge(rand, mode === "all" || mode === "top" ? amp : 0, step);
    var bottom = edge(rand, mode === "all" || mode === "bottom" ? amp : 0, step);

    var poly = top.map(function (p) { return p[0].toFixed(2) + "% " + p[1].toFixed(1) + "px"; });
    bottom.reverse().forEach(function (p) {
      poly.push(p[0].toFixed(2) + "% calc(100% - " + p[1].toFixed(1) + "px)");
    });
    el.style.clipPath = "polygon(" + poly.join(",") + ")";
  }

  document.querySelectorAll("[data-torn]").forEach(applyTorn);

  /* ---------- Menu mobile ---------- */
  var toggle = document.getElementById("menu-toggle");
  var nav = document.getElementById("nav");

  function closeMenu() {
    nav.classList.remove("open");
    toggle.classList.remove("active");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  }

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.classList.toggle("active", open);
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("menu-open", open);
  });

  nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
  window.addEventListener("resize", function () { if (window.innerWidth > 900) closeMenu(); });

  /* ---------- Carrossel dos dias ---------- */
  var track = document.getElementById("days-track");
  function step() {
    var card = track.querySelector(".day-card");
    return card ? card.getBoundingClientRect().width + 22 : 320;
  }
  document.getElementById("prev").addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: "smooth" }); });
  document.getElementById("next").addEventListener("click", function () { track.scrollBy({ left: step(), behavior: "smooth" }); });

  /* ---------- Imagens ausentes: mostra o placeholder ---------- */
  document.querySelectorAll("img").forEach(function (img) {
    function fail() { img.style.display = "none"; }
    if (img.complete && img.naturalWidth === 0) fail();
    img.addEventListener("error", fail);
  });

  /* ---------- Reveal ao rolar ---------- */
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Ano do rodapé ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
  /* ---------- Loader de entrada ---------- */
  var loader = document.getElementById("page-loader");
  var progress = document.getElementById("loader-progress");
  var percent = document.getElementById("loader-percent");
  var reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  var startedAt = Date.now();
  var minimumDuration = reducedMotion ? 0 : 900;
  var maximumDuration = reducedMotion ? 0 : 2400;
  var currentProgress = 0;
  var finished = false;

  function updateLoader(value) {
    currentProgress = Math.min(100, Math.max(0, value));

    if (progress) {
      progress.style.width = currentProgress + "%";
    }

    if (percent) {
      percent.textContent = Math.round(currentProgress) + "%";
    }
  }

  function hideLoader() {
    if (finished || !loader) {
      return;
    }

    finished = true;
    updateLoader(100);

    setTimeout(function () {
      loader.classList.add("is-hidden");

      setTimeout(function () {
        loader.remove();
      }, 520);
    }, reducedMotion ? 0 : 180);
  }

  function finishWhenReady() {
    var elapsed = Date.now() - startedAt;
    var remaining = Math.max(0, minimumDuration - elapsed);

    setTimeout(hideLoader, remaining);
  }

  if (!reducedMotion) {
    var fakeProgress = setInterval(function () {
      if (currentProgress < 88) {
        updateLoader(currentProgress + Math.random() * 8 + 2);
      } else {
        clearInterval(fakeProgress);
      }
    }, 110);

    setTimeout(function () {
      if (!finished) {
        hideLoader();
      }
    }, maximumDuration);
  }

  window.addEventListener("load", finishWhenReady);