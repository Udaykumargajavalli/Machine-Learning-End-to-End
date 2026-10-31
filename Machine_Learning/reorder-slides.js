/* Moves the "Data & Features" slide to directly after "The ML Lifecycle".
   Must load after all slide-adding/removing scripts and before app.js. */
(function () {
  function topSlides() {
    var all = Array.prototype.slice.call(document.querySelectorAll("section.slide"))
      .filter(function (s) { return !s.closest("[hidden]") && !s.closest('[aria-hidden="true"]'); });
    var counts = new Map();
    all.forEach(function (s) { counts.set(s.parentElement, (counts.get(s.parentElement) || 0) + 1); });
    var deck = null, best = 0;
    counts.forEach(function (n, p) { if (n > best) { best = n; deck = p; } });
    return all.filter(function (s) { return s.parentElement === deck; });
  }

  function titleOf(s) {
    var h = s.querySelector("h1, h2");
    var t = (s.getAttribute("data-title") || "") + " | " + (h ? h.textContent : "");
    return t.replace(/&amp;/g, "&").replace(/\s+/g, " ").toLowerCase();
  }

  function init() {
    var slides = topSlides();
    var isData = function (s) {
      var t = titleOf(s);
      return /data\s*(&|and)\s*features?\b/.test(t) && !/engineering/.test(t);
    };
    var isLife = function (s) { return /\b(ml|machine learning)?\s*life\s*-?\s*cycle\b/.test(titleOf(s)); };
    var data = slides.filter(isData)[0];
    var life = slides.filter(isLife)[0];
    if (!data || !life || data === life) {
      console.warn("[reorder-slides] Could not find slides", { data: !!data, lifecycle: !!life });
      return;
    }
    if (life.nextElementSibling !== data) life.parentNode.insertBefore(data, life.nextElementSibling);
    console.info("[reorder-slides] Moved 'Data & Features' after 'The ML Lifecycle'");
  }

  if (document.querySelector("section.slide")) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
