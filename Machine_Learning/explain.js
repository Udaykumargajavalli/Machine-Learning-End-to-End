/* Adds chapter "Interpretability & Explainability" directly after "Hyperparameter Tuning".
   Needs explain-figures.js and explain-content.js. Load after tuning.js and before slide-icons.js / app.js. */
(function () {
  "use strict";

  var CSS =
    ".ex-slide{overflow-y:auto}" +
    ".ex-lead{color:var(--muted);max-width:900px;margin:0 0 16px;font-size:17px}" +
    ".ex-tabs{display:flex;flex-wrap:wrap;gap:6px;padding-bottom:12px;margin-bottom:14px;border-bottom:1px solid var(--border)}" +
    ".ex-tab{font:inherit;font-size:13.5px;cursor:pointer;border:1px solid var(--border);background:transparent;color:inherit;padding:6px 14px;border-radius:999px}" +
    ".ex-tab:hover{border-color:var(--accent)}" +
    ".ex-tab.is-on{background:var(--accent);border-color:var(--accent);color:#fff}" +
    ".ex-pane{display:none}.ex-pane.is-on{display:block}" +
    ".ex-intro{margin:0 0 14px;padding:10px 14px;border-left:3px solid var(--yellow);background:rgba(251,191,36,.1);border-radius:8px;line-height:1.55}" +
    ".ex-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:14px}" +
    ".ex-sec{min-width:0;padding:12px 16px;border:1px solid var(--border);border-radius:12px;background:var(--card-2,rgba(148,163,184,.06))}" +
    ".ex-wide{grid-column:1/-1}" +
    ".ex-sec h4{margin:0 0 8px;font-size:15px}" +
    ".ex-sec p{margin:0 0 8px;line-height:1.55}" +
    ".ex-sec ul,.ex-sec ol,.ex-pc ul{margin:0 0 6px;padding-left:20px}.ex-sec li,.ex-pc li{margin:4px 0;line-height:1.5}" +
    ".ex-code{margin:0 0 6px;padding:12px 14px;border-radius:10px;background:#0f172a;color:#e2e8f0;overflow-x:auto;line-height:1.55;font-size:13px;white-space:pre}" +
    ".ex-code code{background:transparent;padding:0;color:inherit}" +
    ".ex-fig{padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:var(--card-2,rgba(148,163,184,.06));text-align:center}" +
    ".ex-svg{width:100%;height:auto;max-width:900px}" +
    ".ex-svg text{fill:currentColor;font-family:'Segoe UI',system-ui,sans-serif;font-size:12px}" +
    ".ex-cap{margin-top:6px;font-size:13px;color:var(--muted)}" +
    ".ex-pc{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}" +
    ".ex-pro,.ex-con{padding:12px 16px;border-radius:12px}.ex-pro h4,.ex-con h4{margin:0 0 8px;font-size:15px}" +
    ".ex-pro{background:rgba(52,211,153,.1);border-left:4px solid var(--green)}" +
    ".ex-con{background:rgba(248,113,113,.1);border-left:4px solid var(--red)}" +
    ".ex-leak{border-color:var(--green);border-left-width:4px}" +
    ".ex-qa{border-style:dashed}" +
    ".ex-tablewrap{overflow-x:auto;margin:0 0 8px}" +
    ".ex-table{border-collapse:collapse;width:100%;font-size:13.5px}" +
    ".ex-msg{max-width:640px;border:1px solid #e6e6e6;border-radius:12px;overflow:hidden;background:#fff;color:#1a1f3a}" +
    ".ex-msg-h{padding:12px 16px;background:#f5f5f5;border-bottom:1px solid #e6e6e6}" +
    ".ex-msg-b{padding:12px 16px;line-height:1.55}.ex-msg-b ol{margin:4px 0 10px;padding-left:20px}" +
    ".ex-msg-s{font-size:12.5px;color:#5b6491}" +
    /* link + table look requested for this chapter */
    ".ex-slide a{text-decoration:none;color:#464feb}" +
    ".ex-slide a:hover{text-decoration:underline}" +
    ".ex-slide tr th,.ex-slide tr td{border:1px solid #e6e6e6;padding:7px 11px;text-align:left;vertical-align:top}" +
    ".ex-slide tr th{background-color:#f5f5f5;color:#1a1f3a;text-transform:none;letter-spacing:0;font-size:13.5px}";

  function init() {
    if (document.getElementById("interpretability-explainability")) return;
    var tabs = window.EX_TABS;
    if (!tabs || !tabs.length) return;
    var ref = document.getElementById("hyperparameter-tuning") || document.getElementById("evaluation-metrics");
    if (!ref) return;

    var sec = document.createElement("section");
    sec.className = "slide ex-slide";
    sec.id = "interpretability-explainability";
    sec.setAttribute("data-title", "Interpretability & Explainability");
    if (ref.getAttribute("data-group")) sec.setAttribute("data-group", ref.getAttribute("data-group"));
    var h2 = ref.querySelector("h2");

    sec.innerHTML = '<div class="eyebrow">Toolbox · Trust and transparency</div>' +
      '<h2 class="' + (h2 ? h2.className : "title") + '">Interpretability &amp; Explainability</h2>' +
      '<p class="ex-lead">Open the black box: see what a model relies on (<b>feature &amp; permutation importance</b>, <b>partial dependence</b>), explain single predictions (<b>SHAP</b>, <b>LIME</b>), know when to use <b>global vs local</b> views, and turn the result into a message <b>non-technical users</b> can understand.</p>' +
      '<div class="ex-tabs" role="tablist">' + tabs.map(function (t, i) {
        return '<button type="button" role="tab" class="ex-tab' + (i === 0 ? " is-on" : "") + '" data-i="' + i + '">' + t.name + "</button>";
      }).join("") + "</div>" +
      tabs.map(function (t, i) {
        return '<div class="ex-pane' + (i === 0 ? " is-on" : "") + '" data-i="' + i + '">' + t.html() + "</div>";
      }).join("");

    ref.parentNode.insertBefore(sec, ref.nextSibling);
    var st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);

    sec.addEventListener("click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest(".ex-tab") : null;
      if (!b || !sec.contains(b)) return;
      e.stopPropagation();
      var i = b.getAttribute("data-i");
      sec.querySelectorAll(".ex-tab").forEach(function (x) { x.classList.toggle("is-on", x === b); });
      sec.querySelectorAll(".ex-pane").forEach(function (pn) { pn.classList.toggle("is-on", pn.getAttribute("data-i") === i); });
      sec.scrollTop = 0;
    });
  }

  if (document.querySelector("section.slide")) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
