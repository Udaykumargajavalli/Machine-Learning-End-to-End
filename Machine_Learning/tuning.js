/* Adds chapter "Hyperparameter Tuning" directly after "Evaluation Metrics".
   Needs tuning-figures.js and tuning-content.js. Load after remove-slides-2.js and before slide-icons.js / app.js. */
(function () {
  "use strict";

  var CSS =
    ".ht-slide{overflow-y:auto}" +
    ".ht-lead{color:var(--muted);max-width:900px;margin:0 0 16px;font-size:17px}" +
    ".ht-tabs{display:flex;flex-wrap:wrap;gap:6px;padding-bottom:12px;margin-bottom:14px;border-bottom:1px solid var(--border)}" +
    ".ht-tab{font:inherit;font-size:13.5px;cursor:pointer;border:1px solid var(--border);background:transparent;color:inherit;padding:6px 14px;border-radius:999px}" +
    ".ht-tab:hover{border-color:var(--accent)}" +
    ".ht-tab.is-on{background:var(--accent);border-color:var(--accent);color:#fff}" +
    ".ht-pane{display:none}.ht-pane.is-on{display:block}" +
    ".ht-intro{margin:0 0 14px;padding:10px 14px;border-left:3px solid var(--yellow);background:rgba(251,191,36,.1);border-radius:8px;line-height:1.55}" +
    ".ht-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:14px}" +
    ".ht-sec{min-width:0;padding:12px 16px;border:1px solid var(--border);border-radius:12px;background:var(--card-2,rgba(148,163,184,.06))}" +
    ".ht-wide{grid-column:1/-1}" +
    ".ht-sec h4{margin:0 0 8px;font-size:15px}" +
    ".ht-sec p{margin:0 0 8px;line-height:1.55}" +
    ".ht-sec ul,.ht-sec ol,.ht-pc ul{margin:0 0 6px;padding-left:20px}.ht-sec li,.ht-pc li{margin:4px 0;line-height:1.5}" +
    ".ht-code{margin:0 0 6px;padding:12px 14px;border-radius:10px;background:#0f172a;color:#e2e8f0;overflow-x:auto;line-height:1.55;font-size:13px;white-space:pre}" +
    ".ht-code code{background:transparent;padding:0;color:inherit}" +
    ".ht-fig{padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--card-2,rgba(148,163,184,.06));text-align:center}" +
    ".ht-svg{width:100%;height:auto;max-width:900px}" +
    ".ht-svg text{fill:currentColor;font-family:'Segoe UI',system-ui,sans-serif;font-size:12px}" +
    ".ht-cap{margin-top:6px;font-size:13px;color:var(--muted)}" +
    ".ht-pc{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}" +
    ".ht-pro,.ht-con{padding:12px 16px;border-radius:12px}.ht-pro h4,.ht-con h4{margin:0 0 8px;font-size:15px}" +
    ".ht-pro{background:rgba(52,211,153,.1);border-left:4px solid var(--green)}" +
    ".ht-con{background:rgba(248,113,113,.1);border-left:4px solid var(--red)}" +
    ".ht-leak{border-color:var(--green);border-left-width:4px}" +
    ".ht-qa{border-style:dashed}" +
    ".ht-tablewrap{overflow-x:auto;margin:0 0 6px}" +
    ".ht-table{border-collapse:collapse;width:100%;font-size:13.5px}" +
    /* link + table look requested for this chapter */
    ".ht-slide a{text-decoration:none;color:#464feb}" +
    ".ht-slide a:hover{text-decoration:underline}" +
    ".ht-slide tr th,.ht-slide tr td{border:1px solid #e6e6e6;padding:7px 11px;text-align:left;vertical-align:top}" +
    ".ht-slide tr th{background-color:#f5f5f5;color:#1a1f3a;text-transform:none;letter-spacing:0;font-size:13.5px}";

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
    if (document.getElementById("hyperparameter-tuning")) return;
    var tabs = window.HT_TABS;
    if (!tabs || !tabs.length) return;
    var slides = topSlides();
    var ref = document.getElementById("evaluation-metrics") || slides[Math.min(15, slides.length - 1)];
    if (!ref) return;

    var sec = document.createElement("section");
    sec.className = "slide ht-slide";
    sec.id = "hyperparameter-tuning";
    sec.setAttribute("data-title", "Hyperparameter Tuning");
    if (ref.getAttribute("data-group")) sec.setAttribute("data-group", ref.getAttribute("data-group"));
    var h2 = ref.querySelector("h2");

    sec.innerHTML = '<div class="eyebrow">Toolbox · Model tuning</div>' +
      '<h2 class="' + (h2 ? h2.className : "title") + '">Hyperparameter Tuning</h2>' +
      '<p class="ht-lead">Find the settings that make a model generalise best: understand parameters vs hyperparameters, then search with <b>Grid</b>, <b>Random</b> and <b>Bayesian</b> methods, score every trial with <b>cross-validation</b>, and design a good <b>search space</b>.</p>' +
      '<div class="ht-tabs" role="tablist">' + tabs.map(function (t, i) {
        return '<button type="button" role="tab" class="ht-tab' + (i === 0 ? " is-on" : "") + '" data-i="' + i + '">' + t.name + "</button>";
      }).join("") + "</div>" +
      tabs.map(function (t, i) {
        return '<div class="ht-pane' + (i === 0 ? " is-on" : "") + '" data-i="' + i + '">' + t.html() + "</div>";
      }).join("");

    ref.parentNode.insertBefore(sec, ref.nextSibling);
    var st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);

    sec.addEventListener("click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest(".ht-tab") : null;
      if (!b || !sec.contains(b)) return;
      e.stopPropagation();
      var i = b.getAttribute("data-i");
      sec.querySelectorAll(".ht-tab").forEach(function (x) { x.classList.toggle("is-on", x === b); });
      sec.querySelectorAll(".ht-pane").forEach(function (p) { p.classList.toggle("is-on", p.getAttribute("data-i") === i); });
      sec.scrollTop = 0;
    });
  }

  if (document.querySelector("section.slide")) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
