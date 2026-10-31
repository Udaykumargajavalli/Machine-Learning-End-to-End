/* Adds emojis to the EDA, Feature Engineering and Evaluation Metrics tabs,
   matching however the other slides show their emoji. Load before app.js. */
(function () {
  var ICONS = { "eda": "🔍", "feature-engineering": "🛠️", "evaluation-metrics": "📏", "hyperparameter-tuning": "🎛️", "interpretability-explainability": "🔎", "baselines-model-selection": "🏁", "problem-framing": "🧭", "ml-use-cases": "💼" };
  var EMOJI = /^\s*(\p{Extended_Pictographic}|\p{Regional_Indicator})/u;
  var ICON_ATTRS = ["data-icon", "data-emoji"];

  function run() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("section.slide"))
      .filter(function (s) { return !s.closest("[hidden]"); });
    var refs = slides.filter(function (s) { return !ICONS[s.id]; });
    if (!refs.length) return;
    function share(test) {
      return refs.filter(test).length / refs.length >= 0.5;
    }
    var titleHasEmoji = share(function (s) { return EMOJI.test(s.getAttribute("data-title") || ""); });
    var headHasEmoji = share(function (s) {
      var h = s.querySelector("h1,h2");
      return h && EMOJI.test(h.textContent);
    });
    var iconAttrs = ICON_ATTRS.filter(function (a) {
      return share(function (s) { return s.hasAttribute(a); });
    });

    Object.keys(ICONS).forEach(function (id) {
      var s = document.getElementById(id);
      if (!s) return;
      var e = ICONS[id];
      iconAttrs.forEach(function (a) { if (!s.getAttribute(a)) s.setAttribute(a, e); });
      var t = s.getAttribute("data-title") || "";
      if (titleHasEmoji && !EMOJI.test(t)) s.setAttribute("data-title", e + " " + t);
      var h = s.querySelector("h1,h2");
      if (h && (headHasEmoji || !iconAttrs.length) && !EMOJI.test(h.textContent)) {
        h.insertBefore(document.createTextNode(e + " "), h.firstChild);
      }
      // Fallback when nothing else carries an icon: put it in the nav title.
      if (!titleHasEmoji && !iconAttrs.length && !EMOJI.test(t)) s.setAttribute("data-title", e + " " + t);
    });
  }

  if (document.querySelector("section.slide")) run();
  else document.addEventListener("DOMContentLoaded", run);
})();
