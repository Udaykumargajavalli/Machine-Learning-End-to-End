/* Adds a tabbed "Fixing overfitting" section (regularization + validation techniques) to the
   "Demo: Overfitting" slide. Needs overfit-regularization.js and overfit-validation.js. Load before app.js. */
(function () {
  "use strict";

  var TYPES = [
    ["A", "Over-complex model (high variance)", "Huge weights, wiggly fit; train ≫ validation", "L1 / L2 / Elastic Net, simpler model, more data"],
    ["B", "Too many irrelevant / noisy features", "Many features, few rows; weights on junk columns", "L1, Elastic Net, feature selection"],
    ["C", "Unstable coefficients (correlated features)", "Weights flip sign / explode between resamples", "L2, Elastic Net"],
    ["D", "Overfitting the validation set", "Validation score great, test score worse after lots of tuning", "Separate test set, nested CV, fewer tuning rounds"],
    ["E", "Optimistic validation from dependent data", "Random-CV score far above real-life score (groups, time, duplicates)", "Group K-Fold, Time-Series Split"],
    ["F", "Noisy estimate from one small split", "Score changes a lot with the random seed", "K-Fold, Repeated, Stratified, LOO"]
  ];

  var SUMMARY = [
    ["L1 (Lasso)", "A, B", "alpha (λ)", "↑ slightly", "U-shaped in λ", "Scaler + model in a Pipeline; tune λ with CV"],
    ["L2 (Ridge)", "A, C", "alpha (λ)", "↑ slightly", "U-shaped, flat minimum", "Same; never scale on all data"],
    ["Elastic Net", "B + C", "alpha, l1_ratio", "↑ slightly", "U-shaped in both", "Search both together inside CV"],
    ["Train / Val / Test", "detects A, B; D", "split sizes, stratify", "unchanged", "honest if used once", "Split first, test set once"],
    ["K-Fold", "F", "k, shuffle", "per fold ↑", "mean ± std of k", "Pipeline refits each fold"],
    ["Stratified K-Fold", "F (imbalance)", "k ≤ rare-class count", "per fold ↑", "less fold variance", "Resample inside folds only"],
    ["Repeated K-Fold", "F", "k, n_repeats", "per fold ↑", "lower variance", "Same splits for all models"],
    ["Leave-One-Out", "F (tiny data)", "p (Leave-P-Out)", "≈ full model", "low bias, high variance", "Refit on n−1 rows; group-aware if needed"],
    ["Shuffle-Split", "F", "n_splits, test_size", "depends on train size", "mean of S random splits", "Group variant for dependent rows"],
    ["Group K-Fold", "E", "k ≤ #groups, groups", "per fold ↑", "drops vs random CV (honest)", "Whole entities per fold"],
    ["Time-Series Split", "E (time)", "n_splits, gap, test_size", "per fold ↑", "usually lower than random CV", "Past → future, gap, features before cut"],
    ["Nested CV", "D", "k_out, k_in, grid", "inner ↑", "outer = unbiased", "Search inside the outer loop"]
  ];

  var WORKFLOW = [
    "Hold out a <b>test set first</b> (stratified / by group / by time).",
    "Build one <b>Pipeline</b>: impute → encode → scale → (select) → model.",
    "Diagnose with <b>train vs. validation</b> scores, a <b>learning curve</b> and a <b>validation curve</b>.",
    "Reduce variance: regularise (L1 / L2 / Elastic Net), simplify, add data.",
    "Pick the splitter that matches the data: Stratified, Group or TimeSeries.",
    "Tune with CV on the training set; use nested CV to report the tuned model honestly.",
    "Refit on all training data; score on the test set <b>once</b>."
  ];

  var CURVE_CODE = [
    "import numpy as np",
    "from sklearn.model_selection import validation_curve, learning_curve",
    "from sklearn.pipeline import make_pipeline",
    "from sklearn.preprocessing import StandardScaler",
    "from sklearn.linear_model import Ridge",
    "",
    "pipe = make_pipeline(StandardScaler(), Ridge())",
    "alphas = np.logspace(-3, 3, 13)",
    "tr, va = validation_curve(pipe, X_train, y_train, param_name='ridge__alpha',",
    "                          param_range=alphas, cv=5, scoring='r2')",
    "print('best alpha', alphas[va.mean(axis=1).argmax()])      # train falls, validation peaks",
    "",
    "sizes, tr, va = learning_curve(pipe, X_train, y_train, cv=5,",
    "                               train_sizes=np.linspace(.1, 1, 6), scoring='r2')",
    "# big, persistent gap -> more data / regularisation;  both low -> more complex model"
  ].join("\n");

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function ul(a, tag) { return "<" + (tag || "ul") + ">" + a.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</" + (tag || "ul") + ">"; }
  function sec(n, title, body, cls) { return '<div class="of-sec ' + (cls || "") + '"><h4><span class="of-n">' + n + "</span>" + title + "</h4>" + body + "</div>"; }
  function table(head, rows) {
    return '<div class="of-tablewrap"><table class="of-table"><thead><tr>' + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") +
      "</tr></thead><tbody>" + rows.map(function (r) {
        return "<tr>" + r.map(function (v, i) { return "<td>" + (i === 0 ? "<b>" + v + "</b>" : v) + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>";
  }

  function techniquePane(t) {
    var m = t.mech;
    return '<p class="of-intro"><b>' + t.icon + " " + t.name + "</b> – " + t.tag + "</p>" +
      '<div class="of-grid">' +
      sec(1, "Mechanism",
        "<p>" + m.text + "</p>" +
        '<pre class="of-formula">' + esc(m.formula.join("\n")) + "</pre>" +
        ul(m.steps, "ol") +
        '<div class="of-example"><b>🧮 Example:</b> ' + m.example + "</div>", "of-wide") +
      sec(2, "Type of overfitting it addresses", ul(t.types)) +
      sec(3, "Important hyperparameters",
        '<table class="of-hp"><tbody>' + t.hyper.map(function (h) { return "<tr><th>" + h[0] + "</th><td>" + h[1] + "</td></tr>"; }).join("") + "</tbody></table>") +
      sec(4, "Effect on training &amp; validation performance", ul(t.effect), "of-wide") +
      '<div class="of-wide of-pc"><div class="of-pro"><h4><span class="of-n">5</span>✅ When it helps</h4>' + ul(t.helps) + "</div>" +
      '<div class="of-con"><h4><span class="of-n">5</span>⚠️ When it hurts</h4>' + ul(t.hurts) + "</div></div>" +
      sec(6, "How to tune it (CV / validation set)", ul(t.tune, "ol")) +
      sec(7, "How to apply it without data leakage", ul(t.leak), "of-leak") +
      sec("🐍", "Code", '<pre class="of-code"><code>' + esc(t.code) + "</code></pre>", "of-wide") +
      "</div>";
  }

  function overviewPane() {
    return '<p class="of-intro">Overfitting = the model memorises noise: <b>training score ≫ validation score</b>. There are two families of remedies – <b>regularization</b> (make the model simpler / smaller-weighted) and <b>validation</b> (measure generalisation honestly and tune safely). Pick the technique by the <i>type</i> of overfitting you have.</p>' +
      "<h4>🧭 Six kinds of overfitting (used in every tab)</h4>" +
      table(["Type", "Name", "Typical symptom", "Remedies"], TYPES.map(function (r) { return [r[0], r[1], r[2], r[3]]; })) +
      "<h4>📋 All techniques at a glance</h4>" +
      table(["Technique", "Addresses", "Key hyperparameters", "Training score", "Validation score", "Leak-safe rule"], SUMMARY) +
      '<div class="of-grid"><div class="of-sec">' + "<h4>🧱 Safe workflow</h4>" + ul(WORKFLOW, "ol") + "</div>" +
      '<div class="of-sec"><h4>📈 Diagnose with curves</h4><pre class="of-code"><code>' + esc(CURVE_CODE) + "</code></pre></div></div>";
  }

  var CSS =
    ".of-wrap{margin:26px 0 8px;text-align:left}" +
    ".of-wrap>h3{font-size:22px;margin:0 0 4px}" +
    ".of-lead{color:var(--muted);margin:0 0 12px}" +
    ".of-tabs{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--border)}" +
    ".of-grp{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:0 4px 0 10px}" +
    ".of-grp:first-child{margin-left:0}" +
    ".of-tab{font:inherit;font-size:13.5px;cursor:pointer;border:1px solid var(--border);background:transparent;color:inherit;padding:6px 13px;border-radius:999px}" +
    ".of-tab:hover{border-color:var(--accent)}" +
    ".of-tab.is-on{background:var(--accent);border-color:var(--accent);color:#fff}" +
    ".of-pane{display:none}.of-pane.is-on{display:block}" +
    ".of-intro{margin:0 0 12px;padding:10px 14px;border-left:3px solid var(--yellow);background:rgba(251,191,36,.1);border-radius:8px}" +
    ".of-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:14px}" +
    ".of-sec{min-width:0;padding:12px 16px;border:1px solid var(--border);border-radius:12px;background:var(--card-2,rgba(148,163,184,.06))}" +
    ".of-wide{grid-column:1/-1}" +
    ".of-sec h4,.of-pc h4{margin:0 0 8px;font-size:15px;display:flex;align-items:center;gap:8px}" +
    ".of-n{display:inline-flex;min-width:22px;height:22px;padding:0 4px;align-items:center;justify-content:center;border-radius:999px;background:var(--accent);color:#fff;font-size:12px}" +
    ".of-sec p{margin:0 0 8px;line-height:1.55}" +
    ".of-sec ul,.of-sec ol,.of-pc ul{margin:0;padding-left:20px}.of-sec li,.of-pc li{margin:4px 0;line-height:1.5}" +
    ".of-formula,.of-code{margin:0 0 10px;padding:10px 14px;border-radius:10px;background:#0f172a;color:#e2e8f0;overflow-x:auto;line-height:1.55;font-size:13px;white-space:pre}" +
    ".of-code{margin:0}.of-code code,.of-formula{background:transparent}" +
    ".of-formula{color:#93c5fd;white-space:pre-wrap;word-break:break-word}" +
    ".of-example{margin-top:10px;padding:8px 12px;border-radius:8px;background:rgba(124,92,255,.12)}" +
    ".of-hp{border-collapse:collapse;width:100%;font-size:13.5px}" +
    ".of-hp th{text-align:left;vertical-align:top;padding:5px 10px 5px 0;width:32%;text-transform:none;letter-spacing:0;font-size:13px;color:var(--accent-2,var(--accent))}" +
    ".of-hp td{padding:5px 0;line-height:1.45;border-top:1px solid var(--border)}.of-hp tr:first-child td{border-top:0}" +
    ".of-pc{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px}" +
    ".of-pro,.of-con{padding:12px 16px;border-radius:12px}" +
    ".of-pro{background:rgba(52,211,153,.1);border-left:4px solid var(--green)}" +
    ".of-con{background:rgba(248,113,113,.1);border-left:4px solid var(--red)}" +
    ".of-leak{border-color:var(--green);border-left-width:4px}" +
    ".of-tablewrap{overflow-x:auto;border:1px solid var(--border);border-radius:12px;margin:0 0 14px}" +
    ".of-table{border-collapse:collapse;width:100%;font-size:13.5px}" +
    ".of-table th{background:var(--accent);color:#fff;text-align:left;padding:8px 12px}" +
    ".of-table td{padding:8px 12px;border-top:1px solid var(--border);vertical-align:top}" +
    ".of-table tbody tr:nth-child(even){background:rgba(148,163,184,.06)}";

  function init() {
    var slide = null;
    Array.prototype.forEach.call(document.querySelectorAll("section.slide"), function (s) {
      if (!slide && /Demo:\s*Overfitting/i.test(s.getAttribute("data-title") || "")) slide = s;
    });
    var techs = window.OVERFIT_TECHNIQUES;
    if (!slide || !techs || !techs.length || slide.querySelector(".of-wrap")) return;

    var st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);

    var tabs = '<button type="button" class="of-tab is-on" data-i="0">📚 Overview</button>';
    var panes = '<div class="of-pane is-on" data-i="0">' + overviewPane() + "</div>";
    var last = "";
    techs.forEach(function (t, k) {
      var i = k + 1;
      if (t.g !== last) {
        tabs += '<span class="of-grp">' + (t.g === "Regularization" ? "🧲 Regularization" : "🧪 Validation") + "</span>";
        last = t.g;
      }
      tabs += '<button type="button" class="of-tab" data-i="' + i + '">' + t.icon + " " + t.name + "</button>";
      panes += '<div class="of-pane" data-i="' + i + '">' + techniquePane(t) + "</div>";
    });

    var wrap = document.createElement("div");
    wrap.className = "of-wrap";
    wrap.innerHTML = "<h3>🛡️ Fixing overfitting in detail: regularization &amp; validation</h3>" +
      '<p class="of-lead">For each technique: mechanism, the type of overfitting it targets, key hyperparameters, effect on training vs. validation scores, when it helps or hurts, how to tune it and how to apply it without data leakage.</p>' +
      '<div class="of-tabs" role="tablist">' + tabs + "</div>" + panes;
    wrap.addEventListener("click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest(".of-tab") : null;
      if (!b || !wrap.contains(b)) return;
      var i = b.getAttribute("data-i");
      wrap.querySelectorAll(".of-tab").forEach(function (x) { x.classList.toggle("is-on", x === b); });
      wrap.querySelectorAll(".of-pane").forEach(function (p) { p.classList.toggle("is-on", p.getAttribute("data-i") === i); });
    });

    var tip = slide.querySelector(".callout.tip");
    if (tip) slide.insertBefore(wrap, tip); else slide.appendChild(wrap);
  }

  if (document.querySelector("section.slide")) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
