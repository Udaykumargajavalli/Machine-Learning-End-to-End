/* Removes tabs 17, 18 and 19 (1-based, in the final order).
   Must load after reorder-slides.js and before slide-icons.js / app.js. */
(function () {
  var REMOVE = [17, 18, 19];

  function topSlides() {
    var all = Array.prototype.slice.call(document.querySelectorAll("section.slide"))
      .filter(function (s) { return !s.closest("[hidden]") && !s.closest('[aria-hidden="true"]'); });
    var counts = new Map();
    all.forEach(function (s) { counts.set(s.parentElement, (counts.get(s.parentElement) || 0) + 1); });
    var deck = null, best = 0;
    counts.forEach(function (n, p) { if (n > best) { best = n; deck = p; } });
    return all.filter(function (s) { return s.parentElement === deck; });
  }

  function init() {
    var slides = topSlides();
    var targets = REMOVE.map(function (n) { return slides[n - 1]; }).filter(Boolean);
    targets.forEach(function (s) {
      var h = s.querySelector("h1, h2");
      console.info("[remove-slides-2] Removed:", s.getAttribute("data-title") || (h && h.textContent) || s.id);
      s.parentNode.removeChild(s);
    });
  }

  if (document.querySelector("section.slide")) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
