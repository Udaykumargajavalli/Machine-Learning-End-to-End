/* Extends the "Algorithm Cheat Sheet" slide with a detailed, searchable reference. Runs before app.js. */
(function () {
  "use strict";

  // name, family, task, scaling, missing values, interpretability, speed, key hyperparameters, library, metrics, pitfall, complexity
  var ROWS = [
    ["Linear Regression", "Supervised", "Regression", "Optional", "No", "High", "⚡ Fast", "fit_intercept", "LinearRegression", "RMSE, MAE, R²", "Outliers and correlated features distort weights", "O(n·p²)"],
    ["Ridge", "Supervised", "Regression", "Yes", "No", "High", "⚡ Fast", "alpha", "Ridge", "RMSE, R²", "Forgetting to scale features", "O(n·p²)"],
    ["Lasso", "Supervised", "Regression", "Yes", "No", "High", "⚡ Fast", "alpha", "Lasso", "RMSE, R²", "Randomly keeps one of several correlated features", "O(n·p) per iter"],
    ["Elastic Net", "Supervised", "Regression", "Yes", "No", "High", "⚡ Fast", "alpha, l1_ratio", "ElasticNet", "RMSE, R²", "Two knobs to tune – use ElasticNetCV", "O(n·p) per iter"],
    ["Logistic Regression", "Supervised", "Classification", "Yes", "No", "High", "⚡ Fast", "C, penalty, class_weight", "LogisticRegression", "ROC-AUC, F1, Log loss", "Assumes a straight-line boundary", "O(n·p) per iter"],
    ["Decision Tree", "Supervised", "Both", "No", "Partly*", "High", "⚡ Fast", "max_depth, min_samples_leaf, criterion", "DecisionTreeClassifier / Regressor", "Accuracy, F1 / RMSE", "Overfits if not pruned", "O(n·p·log n)"],
    ["Random Forest", "Supervised", "Both", "No", "Partly*", "Medium", "🙂 Medium", "n_estimators, max_features, max_depth", "RandomForestClassifier / Regressor", "ROC-AUC, F1 / RMSE", "Big models in memory; importances biased to high-cardinality features", "O(B·n·√p·log n)"],
    ["Gradient Boosting (XGBoost/LightGBM)", "Supervised", "Both", "No", "Yes", "Medium", "🙂 Medium", "learning_rate, n_estimators, max_depth, subsample", "HistGradientBoosting, XGBoost, LightGBM", "ROC-AUC, F1 / RMSE", "Overfits without early stopping", "O(M·n·p)"],
    ["AdaBoost", "Supervised", "Both", "No", "No", "Medium", "⚡ Fast", "n_estimators, learning_rate", "AdaBoostClassifier / Regressor", "Accuracy, F1", "Very sensitive to noisy labels and outliers", "O(M·n·p)"],
    ["CatBoost", "Supervised", "Both", "No", "Yes", "Medium", "🙂 Medium", "iterations, depth, learning_rate, cat_features", "catboost.CatBoostClassifier", "ROC-AUC, F1 / RMSE", "Forgetting to pass cat_features", "O(M·n·p)"],
    ["K-Nearest Neighbours", "Supervised", "Both", "Yes", "No", "Medium", "🐢 Slow predict", "n_neighbors, weights, metric", "KNeighborsClassifier / Regressor", "Accuracy, F1 / RMSE", "Unscaled features; many dimensions", "Predict O(n·p)"],
    ["Naive Bayes", "Supervised", "Classification", "No", "No", "Medium", "⚡ Very fast", "alpha / var_smoothing", "GaussianNB, MultinomialNB", "Accuracy, F1", "Probabilities over-confident with correlated features", "O(n·p)"],
    ["SVM", "Supervised", "Both", "Yes", "No", "Low (RBF)", "🐢 Slow on big data", "C, kernel, gamma", "SVC / SVR, LinearSVC", "ROC-AUC, F1", "Not scaling; >100k rows becomes slow", "O(n²)–O(n³)"],
    ["K-Means", "Unsupervised", "Clustering", "Yes", "No", "Medium", "⚡ Fast", "n_clusters, init, n_init", "KMeans", "Silhouette, Inertia", "Assumes round, equal-size clusters", "O(n·k·p·iters)"],
    ["DBSCAN / Hierarchical", "Unsupervised", "Clustering", "Yes", "No", "Medium", "🙂 Medium", "eps, min_samples / linkage", "DBSCAN, AgglomerativeClustering", "Silhouette, Davies–Bouldin", "Clusters with different densities", "O(n log n)–O(n²)"],
    ["PCA", "Unsupervised", "Dimensionality reduction", "Yes", "No", "Low–Medium", "⚡ Fast", "n_components", "PCA", "Explained variance", "Fitting on test data (leakage)", "O(n·p² + p³)"],
    ["Isolation Forest", "Unsupervised", "Anomaly detection", "No", "No", "Low", "⚡ Fast", "n_estimators, max_samples, contamination", "IsolationForest", "Precision@k, PR-AUC", "Wrong contamination setting", "O(t·ψ·log ψ)"],
    ["HBOS", "Unsupervised", "Anomaly detection", "No", "No", "Medium", "⚡ Very fast", "n_bins, contamination", "pyod.models.hbos.HBOS", "Precision@k, PR-AUC", "Misses anomalies that only show in feature combinations", "O(n·p)"],
    ["Neural Network", "Deep Learning", "Both", "Yes", "No", "Low", "🐢 Slow (GPU helps)", "layers, units, learning_rate, batch_size, epochs, dropout", "MLPClassifier, PyTorch, Keras", "Log loss, Accuracy / RMSE", "Too little data; no early stopping", "O(epochs·n·weights)"]
  ];

  var PICKS = [
    ["📈", "Predict a number, need to explain it", "Linear Regression → Ridge"],
    ["🎯", "Hundreds of features, want only the important ones", "Lasso / Elastic Net"],
    ["✅", "Yes/No answer with explainable reasons", "Logistic Regression"],
    ["🏆", "Tabular data, want best accuracy", "Gradient Boosting (XGBoost / LightGBM)"],
    ["🏷️", "Many text categories (city, brand, product)", "CatBoost"],
    ["🌲", "Strong baseline with little tuning", "Random Forest"],
    ["✉️", "Text / spam, tiny data, need speed", "Naive Bayes"],
    ["🧭", "Small-to-medium data, complex boundary", "SVM (RBF kernel)"],
    ["👥", "Group customers, number of groups known", "K-Means"],
    ["🌀", "Odd-shaped groups plus noise", "DBSCAN"],
    ["🗜️", "Too many features or need a 2-D plot", "PCA"],
    ["🚨", "Find fraud / defects without labels", "Isolation Forest / HBOS"],
    ["🧠", "Images, audio, text or huge datasets", "Neural Networks"]
  ];

  var METRICS = [
    ["Regression", "MAE", "Average absolute error, in the target's units", "Easy to explain to business"],
    ["Regression", "RMSE", "Square-root of average squared error", "Punishes big mistakes more"],
    ["Regression", "R²", "Share of variation explained (0–1)", "Quick overall fit check"],
    ["Regression", "MAPE", "Average % error", "When relative error matters (avoid if y ≈ 0)"],
    ["Classification", "Accuracy", "% predictions correct", "Only for balanced classes"],
    ["Classification", "Precision", "Of predicted positives, how many are right", "False alarms are costly (spam filter)"],
    ["Classification", "Recall", "Of real positives, how many we caught", "Misses are costly (cancer, fraud)"],
    ["Classification", "F1", "Harmonic mean of precision and recall", "Imbalanced classes"],
    ["Classification", "ROC-AUC", "Ranking quality over all thresholds", "Comparing models"],
    ["Classification", "PR-AUC", "Precision–recall trade-off curve area", "Very rare positives"],
    ["Classification", "Log loss", "Penalises confident wrong probabilities", "When probabilities matter"],
    ["Clustering", "Silhouette", "How well points fit their own vs. nearest cluster (−1 to 1)", "Choosing k"],
    ["Clustering", "Davies–Bouldin", "Cluster overlap (lower = better)", "Comparing clusterings"],
    ["Anomaly", "Precision@k", "How many of the top-k flagged items are real anomalies", "Investigation teams with limited capacity"]
  ];

  var TIPS = [
    "Split train / test <b>before</b> any preprocessing, and wrap steps in a <code>Pipeline</code> to avoid data leakage.",
    "Always build a simple baseline first (mean value, majority class, or Logistic/Linear Regression).",
    "Scale features for distance- or gradient-based models: Linear family, Logistic, KNN, SVM, K-Means, PCA, Neural Nets.",
    "Tree-based models (Tree, Forest, Boosting) don't need scaling and handle non-linear patterns well.",
    "Use cross-validation (<code>cross_val_score</code>, <code>StratifiedKFold</code>) instead of a single split.",
    "Tune with <code>GridSearchCV</code>, <code>RandomizedSearchCV</code> or Optuna; use early stopping for boosting and neural nets.",
    "Imbalanced classes? Use <code>class_weight='balanced'</code>, resampling (SMOTE) and judge with F1 / PR-AUC, not accuracy.",
    "Explain predictions with feature importance, SHAP or partial-dependence plots."
  ];

  var GLOSS = [
    ["Bias", "Error from a model that is too simple (underfitting)."],
    ["Variance", "Error from a model that is too sensitive to training data (overfitting)."],
    ["Regularisation", "A penalty that keeps the model simple (L1, L2, dropout, max_depth)."],
    ["Hyperparameter", "A setting you choose before training (k, depth, learning rate)."],
    ["Data leakage", "Information from the test set or the future sneaking into training."],
    ["Ensemble", "Combining many models (bagging = in parallel, boosting = in sequence)."]
  ];

  function td(v) { return "<td>" + v + "</td>"; }
  function tag(v) {
    var cls = /^yes/i.test(v) ? "cs-yes" : /^no/i.test(v) ? "cs-no" : "cs-mid";
    return '<span class="cs-pill ' + cls + '">' + v + "</span>";
  }

  function tableHTML() {
    var head = ["Algorithm", "Task", "Scale features?", "Handles missing?", "Interpretable", "Speed", "Key hyperparameters", "Python (sklearn & co.)", "Evaluate with", "Common pitfall", "Training cost"];
    var rows = ROWS.map(function (r) {
      return '<tr data-family="' + r[1] + '" data-search="' + r.join(" ").toLowerCase().replace(/"/g, "") + '">' +
        "<td><strong>" + r[0] + '</strong><div class="cs-fam">' + r[1] + "</div></td>" +
        td(r[2]) + td(tag(r[3])) + td(tag(r[4])) + td(r[5]) + td(r[6]) +
        td("<code>" + r[7] + "</code>") + td("<code>" + r[8] + "</code>") + td(r[9]) + td(r[10]) + td("<code>" + r[11] + "</code>") + "</tr>";
    }).join("");
    return '<div class="cs-tablewrap"><table class="cs-table"><thead><tr>' +
      head.map(function (h) { return "<th>" + h + "</th>"; }).join("") +
      "</tr></thead><tbody>" + rows + '</tbody></table></div><p class="cs-note">* scikit-learn ≥ 1.3 trees accept missing values; XGBoost, LightGBM, CatBoost and HistGradientBoosting handle them natively. n = rows, p = features, B/M/t = number of trees, k = clusters.</p>';
  }

  function picksHTML() {
    return '<div class="cs-picks">' + PICKS.map(function (p) {
      return '<div class="cs-pick"><div class="cs-ico">' + p[0] + '</div><div><div class="cs-q">' + p[1] + '</div><div class="cs-a">→ ' + p[2] + "</div></div></div>";
    }).join("") + "</div>";
  }

  function metricsHTML() {
    return '<div class="cs-tablewrap"><table class="cs-table cs-small"><thead><tr><th>Problem</th><th>Metric</th><th>What it means</th><th>Use it when</th></tr></thead><tbody>' +
      METRICS.map(function (m) { return "<tr>" + td('<span class="cs-pill cs-mid">' + m[0] + "</span>") + td("<strong>" + m[1] + "</strong>") + td(m[2]) + td(m[3]) + "</tr>"; }).join("") +
      "</tbody></table></div>";
  }

  function tipsHTML() {
    return '<div class="cs-two"><div class="cs-card"><h4>🛠️ Golden rules</h4><ol>' +
      TIPS.map(function (t) { return "<li>" + t + "</li>"; }).join("") +
      '</ol></div><div class="cs-card"><h4>📖 Must-know terms</h4><dl>' +
      GLOSS.map(function (g) { return "<dt>" + g[0] + "</dt><dd>" + g[1] + "</dd>"; }).join("") +
      '</dl><h4>⚖️ Bias–variance at a glance</h4><p class="cs-bv"><b>Underfitting</b> (high bias): Linear models, shallow trees, large k in KNN, strong regularisation.<br><b>Overfitting</b> (high variance): Deep trees, small k in KNN, too many boosting rounds, big neural nets.</p></div></div>';
  }

  function sectionHTML() {
    return '<div class="cs-head"><h3>📚 Extended algorithm cheat sheet</h3>' +
      '<div class="cs-tabs" role="tablist">' +
      '<button class="cs-tab is-on" data-cs="table">Comparison table</button>' +
      '<button class="cs-tab" data-cs="picks">Which one when?</button>' +
      '<button class="cs-tab" data-cs="metrics">Metrics</button>' +
      '<button class="cs-tab" data-cs="tips">Rules & terms</button></div></div>' +
      '<div class="cs-pane is-on" data-pane="table"><div class="cs-tools"><input class="cs-search" type="search" placeholder="Search algorithms, parameters, metrics…" aria-label="Search cheat sheet">' +
      '<div class="cs-chips"><button class="cs-chip is-on" data-f="all">All</button><button class="cs-chip" data-f="Supervised">Supervised</button><button class="cs-chip" data-f="Unsupervised">Unsupervised</button><button class="cs-chip" data-f="Deep Learning">Deep Learning</button></div></div>' +
      tableHTML() + "</div>" +
      '<div class="cs-pane" data-pane="picks">' + picksHTML() + "</div>" +
      '<div class="cs-pane" data-pane="metrics">' + metricsHTML() + "</div>" +
      '<div class="cs-pane" data-pane="tips">' + tipsHTML() + "</div>";
  }

  var CSS =
    ".cs-ext{margin-top:22px;text-align:left}" +
    ".cs-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}" +
    ".cs-head h3{margin:0}" +
    ".cs-tabs,.cs-chips{display:flex;flex-wrap:wrap;gap:6px}" +
    ".cs-tab,.cs-chip{font:inherit;font-size:.85em;cursor:pointer;border:1px solid rgba(148,163,184,.4);background:transparent;color:inherit;padding:6px 12px;border-radius:999px}" +
    ".cs-tab.is-on,.cs-chip.is-on{background:#6c8cff;border-color:#6c8cff;color:#fff}" +
    ".cs-pane{display:none}.cs-pane.is-on{display:block}" +
    ".cs-tools{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:10px}" +
    ".cs-search{flex:1;min-width:220px;font:inherit;padding:8px 12px;border-radius:10px;border:1px solid rgba(148,163,184,.4);background:rgba(148,163,184,.08);color:inherit}" +
    ".cs-tablewrap{overflow:auto;max-height:60vh;border:1px solid rgba(148,163,184,.3);border-radius:12px}" +
    ".cs-table{border-collapse:collapse;width:100%;font-size:.82em;min-width:1100px}" +
    ".cs-table.cs-small{min-width:640px}" +
    ".cs-table th{position:sticky;top:0;background:#6c8cff;color:#fff;text-align:left;padding:8px 10px;white-space:nowrap;z-index:1}" +
    ".cs-table td{padding:8px 10px;border-top:1px solid rgba(148,163,184,.2);vertical-align:top}" +
    ".cs-table tbody tr:nth-child(even){background:rgba(148,163,184,.06)}" +
    ".cs-table tbody tr:hover{background:rgba(108,140,255,.12)}" +
    ".cs-table code{font-size:.92em;background:rgba(148,163,184,.15);padding:1px 5px;border-radius:5px}" +
    ".cs-fam{font-size:.8em;opacity:.6}" +
    ".cs-pill{display:inline-block;padding:2px 8px;border-radius:999px;font-size:.85em;font-weight:600;white-space:nowrap}" +
    ".cs-yes{background:rgba(34,197,94,.18);color:#16a34a}.cs-no{background:rgba(239,68,68,.15);color:#ef4444}.cs-mid{background:rgba(245,165,36,.18);color:#d48806}" +
    ".cs-note{font-size:.75em;opacity:.65;margin:8px 2px 0}" +
    ".cs-picks{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}" +
    ".cs-pick{display:flex;gap:10px;align-items:flex-start;padding:12px;border-radius:12px;border:1px solid rgba(148,163,184,.3);background:rgba(148,163,184,.06)}" +
    ".cs-ico{font-size:1.5em;line-height:1}.cs-q{font-size:.9em;opacity:.8}.cs-a{font-weight:700;margin-top:3px;color:#6c8cff}" +
    ".cs-two{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media (max-width:900px){.cs-two{grid-template-columns:1fr}}" +
    ".cs-card{padding:14px 16px;border-radius:12px;border:1px solid rgba(148,163,184,.3);background:rgba(148,163,184,.06);font-size:.9em}" +
    ".cs-card h4{margin:0 0 8px}.cs-card h4:not(:first-child){margin-top:14px}.cs-card ol{margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px}" +
    ".cs-card dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:4px 12px}.cs-card dt{font-weight:700}.cs-card dd{margin:0;opacity:.85}" +
    ".cs-bv{margin:0;line-height:1.6}";

  function wire(root) {
    var search = root.querySelector(".cs-search");
    var fam = "all";
    function apply() {
      var q = (search.value || "").trim().toLowerCase();
      var rows = root.querySelectorAll(".cs-table tbody tr[data-family]");
      for (var i = 0; i < rows.length; i++) {
        var r = rows[i];
        var ok = (fam === "all" || r.getAttribute("data-family") === fam) && (!q || r.getAttribute("data-search").indexOf(q) !== -1);
        r.style.display = ok ? "" : "none";
      }
    }
    // Stop keys typed into the search box from triggering slide navigation shortcuts.
    ["keydown", "keyup", "keypress"].forEach(function (t) {
      search.addEventListener(t, function (e) { e.stopPropagation(); });
    });
    search.addEventListener("input", apply);
    root.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var chip = t.closest(".cs-chip");
      if (chip) {
        fam = chip.getAttribute("data-f");
        root.querySelectorAll(".cs-chip").forEach(function (c) { c.classList.toggle("is-on", c === chip); });
        apply();
        return;
      }
      var tab = t.closest(".cs-tab");
      if (tab) {
        var k = tab.getAttribute("data-cs");
        root.querySelectorAll(".cs-tab").forEach(function (c) { c.classList.toggle("is-on", c === tab); });
        root.querySelectorAll(".cs-pane").forEach(function (p) { p.classList.toggle("is-on", p.getAttribute("data-pane") === k); });
      }
    });
  }

  function findCheatSlide() {
    var slides = document.querySelectorAll("section.slide");
    var i;
    for (i = 0; i < slides.length; i++) {
      if (/cheat/i.test(slides[i].getAttribute("data-title") || "") || /cheat/i.test(slides[i].id || "")) return slides[i];
    }
    for (i = 0; i < slides.length; i++) {
      var h = slides[i].querySelector("h1,h2");
      if (h && /cheat/i.test(h.textContent)) return slides[i];
    }
    return null;
  }

  function init() {
    if (document.querySelector(".cs-ext")) return;
    var st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);

    var slide = findCheatSlide();
    var host;
    if (slide) {
      var h = slide.querySelector("h1,h2");
      host = (h && h.parentElement) || slide;
    } else {
      var algo = document.getElementById("algorithms");
      var ref = algo || document.querySelectorAll("section.slide")[0];
      if (!ref) return;
      slide = document.createElement("section");
      slide.className = "slide";
      slide.id = "cheatsheet";
      slide.setAttribute("data-title", "Algorithm Cheat Sheet");
      if (ref.getAttribute("data-group")) slide.setAttribute("data-group", ref.getAttribute("data-group"));
      slide.innerHTML = "<h2>Algorithm Cheat Sheet</h2>";
      ref.parentNode.insertBefore(slide, ref.nextSibling);
      host = slide;
    }
    slide.style.overflowY = "auto";
    var ext = document.createElement("div");
    ext.className = "cs-ext";
    ext.innerHTML = sectionHTML();
    host.appendChild(ext);
    wire(ext);
  }

  // Run immediately (slides are already parsed) so app.js sees any new slide when it builds navigation.
  if (document.querySelector("section.slide")) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
