/* Removes tabs 16, 17 and 20 (1-based, in final navigation order).
   Must load after every slide-injecting script and before app.js. */
(function () {
  var REMOVE = [16, 17, 20];

  function topSlides() {
    var all = Array.prototype.slice.call(document.querySelectorAll("section.slide"))
      .filter(function (s) { return !s.closest("[hidden]") && !s.closest('[aria-hidden="true"]'); });
    var counts = new Map();
    all.forEach(function (s) { counts.set(s.parentElement, (counts.get(s.parentElement) || 0) + 1); });
    var deck = null, best = 0;
    counts.forEach(function (n, p) { if (n > best) { best = n; deck = p; } });
    return all.filter(function (s) { return s.parentElement === deck; });
  }

  function run() {
    var slides = topSlides();
    var targets = REMOVE.map(function (n) { return slides[n - 1]; }).filter(Boolean);
    targets.forEach(function (s) {
      var h = s.querySelector("h1,h2");
      console.info("[remove-slides] removed:", s.getAttribute("data-title") || (h && h.textContent.trim()) || s.id);
      s.parentNode.removeChild(s);
    });
  }

  if (document.querySelector("section.slide")) run();
  else document.addEventListener("DOMContentLoaded", run);
})();
