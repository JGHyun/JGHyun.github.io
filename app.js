/* =========================================================
   Jeon GyuHyun — portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. 모바일 내비게이션 ---------- */
  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.getElementById("site-nav");
    var scrim = document.querySelector("[data-scrim]");
    if (!toggle || !nav) return;

    function setOpen(open) {
      document.body.classList.toggle("nav-open", open);
      document.body.classList.toggle("is-locked", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        var first = nav.querySelector("a");
        if (first) first.focus();
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("nav-open"));
    });

    if (scrim) scrim.addEventListener("click", function () { setOpen(false); });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    // 데스크톱으로 넓어지면 상태 초기화
    window.matchMedia("(min-width: 52.0625rem)").addEventListener("change", function (e) {
      if (e.matches) setOpen(false);
    });
  }

  /* ---------- 2. 사진 슬라이드 ---------- */
  function initDeck() {
    var deck = document.querySelector("[data-deck]");
    if (!deck) return;

    var slides = Array.prototype.slice.call(deck.querySelectorAll(".deck__slide"));
    var dotsBox = deck.querySelector("[data-deck-dots]");
    var prev = deck.querySelector("[data-deck-prev]");
    var next = deck.querySelector("[data-deck-next]");
    var frame = deck.querySelector(".deck__frame");
    if (slides.length < 2) {
      if (prev) prev.hidden = true;
      if (next) next.hidden = true;
      return;
    }

    var index = 0;
    var timer = null;
    var dots = [];

    slides.forEach(function (slide, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "deck__dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", i + 1 + "번 사진 보기");
      dot.addEventListener("click", function () { go(i); restart(); });
      dotsBox.appendChild(dot);
      dots.push(dot);
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        s.classList.toggle("is-on", n === index);
        s.setAttribute("aria-hidden", n === index ? "false" : "true");
      });
      dots.forEach(function (d, n) {
        d.setAttribute("aria-selected", n === index ? "true" : "false");
      });
    }

    function restart() {
      stop();
      if (reduceMotion) return;
      timer = window.setInterval(function () { go(index + 1); }, 2500);
    }
    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }

    if (prev) prev.addEventListener("click", function () { go(index - 1); restart(); });
    if (next) next.addEventListener("click", function () { go(index + 1); restart(); });

    deck.addEventListener("mouseenter", stop);
    deck.addEventListener("mouseleave", restart);
    deck.addEventListener("focusin", stop);
    deck.addEventListener("focusout", restart);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else restart();
    });

    deck.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { go(index - 1); restart(); }
      if (e.key === "ArrowRight") { go(index + 1); restart(); }
    });

    // 터치 스와이프
    var startX = null;
    frame.addEventListener("pointerdown", function (e) { startX = e.clientX; stop(); });
    frame.addEventListener("pointerup", function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
      startX = null;
      restart();
    });
    frame.addEventListener("pointercancel", function () { startX = null; restart(); });

    go(0);
    restart();
  }

  /* ---------- 3. 갤러리 라이트박스 ---------- */
  function initLightbox() {
    var gallery = document.querySelector("[data-gallery]");
    var dialog = document.querySelector("[data-lightbox]");
    if (!gallery || !dialog || typeof dialog.showModal !== "function") return;

    var target = dialog.querySelector("img");
    var closeBtn = dialog.querySelector(".lightbox__close");

    gallery.addEventListener("click", function (e) {
      var btn = e.target.closest("button");
      if (!btn) return;
      var img = btn.querySelector("img");
      target.src = img.getAttribute("data-full") || img.src;
      target.alt = img.alt;
      dialog.showModal();
    });

    if (closeBtn) closeBtn.addEventListener("click", function () { dialog.close(); });

    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    initNav();
    initDeck();
    initLightbox();
  });
})();
