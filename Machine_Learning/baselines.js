/* "Baselines & Model Selection" slide, inserted right before the Evaluation Metrics slide.
   Must load AFTER remove-slides.js (so positional removal is unaffected) and before slide-icons.js / app.js. */
(function () {
  var TABS = [
    {
      name: "🏁 Why a Baseline First?",
      intro: "A baseline is the simplest possible model you can build in minutes. Every fancy model must beat it — otherwise the fancy model is not adding value.",
      cards: [
        { t: "What is a baseline?", d: "A very simple reference solution: always predict the most common class, the average value, yesterday's value, or a hand-written rule. It sets the 'floor' for performance.", w: "Always — before any real modelling." },
        { t: "Why it matters", d: "Without a baseline, '85% accuracy' means nothing. If 85% of emails are not spam, a model that always says 'not spam' also gets 85%.", w: "When reporting any result to stakeholders." },
        { t: "Catches bugs early", d: "If your complex model barely beats (or loses to) the baseline, you probably have leakage, a bug, wrong features or a too-hard problem.", w: "Sanity-check every new pipeline." },
        { t: "Sets expectations", d: "Shows how much 'headroom' exists between trivial and perfect. Also helps decide if ML is even needed — sometimes a rule is good enough.", w: "Project kick-off / feasibility stage." },
        { t: "Golden rule", d: "Start simple → measure → add complexity only when it clearly improves the metric on validation data and justifies the extra cost.", w: "Every iteration of the project." }
      ]
    },
    {
      name: "🧱 Types of Baselines",
      intro: "Pick the baseline that matches your problem type. Usually build 2–3 of increasing strength.",
      cards: [
        { t: "Majority class (classification)", d: "Always predict the most frequent class. Shows how misleading accuracy is on imbalanced data.", w: "Any classification problem.", c: "from sklearn.dummy import DummyClassifier\nDummyClassifier(strategy='most_frequent').fit(X_train, y_train)" },
        { t: "Stratified / random guess", d: "Predict classes at random with the same proportions as training data. The 'pure luck' level.", w: "Checking a model is better than chance (AUC 0.5).", c: "DummyClassifier(strategy='stratified', random_state=0)" },
        { t: "Mean / median (regression)", d: "Always predict the training mean (minimises RMSE) or median (minimises MAE). R² of the mean baseline is 0.", w: "Any regression problem.", c: "from sklearn.dummy import DummyRegressor\nDummyRegressor(strategy='median')" },
        { t: "Naive & seasonal-naive (time series)", d: "Tomorrow = today; or next Monday = last Monday. Surprisingly hard to beat for many forecasts.", w: "Forecasting sales, demand, traffic.", c: "y_pred = y.shift(1)        # naive\ny_pred = y.shift(7)        # weekly seasonal naive" },
        { t: "Rule-based / heuristic", d: "A business rule an expert would use: 'flag transactions > ₹1 lakh from a new device'. Often what the ML model is replacing.", w: "When a manual process already exists.", c: "y_pred = ((df.amount > 100000) & df.new_device).astype(int)" },
        { t: "Simple model baseline", d: "Logistic / linear regression on a few key features, or a shallow decision tree. Strong, interpretable and fast.", w: "Second baseline after the dummy one.", c: "from sklearn.linear_model import LogisticRegression\nLogisticRegression(max_iter=1000)" },
        { t: "Existing system / human level", d: "The current production model or human expert accuracy. The real bar the business cares about.", w: "Replacing an existing solution." }
      ]
    },
    {
      name: "🧭 Choosing an Algorithm",
      intro: "No algorithm is best everywhere (the 'No Free Lunch' theorem). Use the problem, data and constraints to shortlist 2–4 candidates, then let validation decide.",
      table: {
        head: ["Situation", "Good first choices", "Why"],
        rows: [
          ["Small tabular data (< 10k rows)", "Logistic/Linear Regression, Random Forest, SVM", "Low variance, few hyperparameters"],
          ["Medium–large tabular data", "XGBoost, LightGBM, CatBoost", "Usually best accuracy on tables"],
          ["Many categorical columns", "CatBoost, LightGBM, target encoding + GBM", "Native categorical handling"],
          ["Need to explain every decision", "Logistic Regression, Decision Tree, GAMs", "Transparent coefficients / rules"],
          ["Very high-dimensional, sparse (text TF-IDF)", "Logistic Regression, Linear SVM, Naive Bayes", "Linear models shine on sparse data"],
          ["Images, audio, raw text", "CNNs, Transformers, pre-trained models (fine-tune)", "Learn features automatically"],
          ["Time series forecasting", "Seasonal naive → ETS/ARIMA → Prophet → GBM with lag features", "Respect time order & seasonality"],
          ["No labels, find groups", "K-Means, DBSCAN, Hierarchical, GMM", "Unsupervised clustering"],
          ["No labels, find rare events", "Isolation Forest, HBOS, LOF, Autoencoder", "Anomaly detection"],
          ["Very low latency / edge device", "Linear models, small trees, distilled models", "Fast and tiny"],
          ["Little data but similar pre-trained model exists", "Transfer learning / fine-tuning", "Re-uses knowledge"]
        ]
      },
      cards: [
        { t: "Questions to ask", d: "What type of problem? How much data? Tabular, text or images? Must it be explainable? Latency/memory limits? How often will it retrain? What does an error cost?", w: "Before shortlisting models." }
      ]
    },
    {
      name: "⚖️ Trade-offs",
      intro: "Model selection is about balancing competing goals, not only the highest score.",
      cards: [
        { t: "Bias vs. Variance", d: "Simple models underfit (high bias); complex models overfit (high variance). Aim for the sweet spot where validation error is lowest.", w: "Train score ≫ validation score → too complex. Both low → too simple." },
        { t: "Accuracy vs. Interpretability", d: "Boosting and deep nets are often more accurate; linear models and trees are easier to explain. Regulated domains (banking, health) may require explanations — SHAP/LIME help bridge the gap.", w: "Credit, insurance, medical decisions." },
        { t: "Accuracy vs. Speed / Cost", d: "A 0.3% gain may need 10× compute, GPUs and slower predictions. Check training time, inference latency and cloud cost.", w: "Real-time apps, mobile, large-scale batch scoring." },
        { t: "Data size vs. Complexity", d: "Deep learning needs lots of data; with small data simple models often win.", w: "Rule of thumb: tabular < 100k rows → GBMs/linear first." },
        { t: "Robustness & Maintenance", d: "Complex pipelines break more often, drift silently and are harder to debug. Simpler models are easier to monitor and retrain.", w: "Long-lived production systems." },
        { t: "Precision vs. Recall", d: "Model choice and threshold decide which mistakes you make. Pick based on business cost of false positives vs false negatives.", w: "Fraud, medical, spam problems." },
        { t: "Occam's Razor", d: "If two models perform about the same, choose the simpler one.", w: "Final model decision." }
      ]
    },
    {
      name: "🔬 Fair Comparison",
      intro: "Compare candidates on the SAME data splits with the SAME metric — otherwise the comparison is meaningless.",
      cards: [
        { t: "Train / Validation / Test", d: "Train to fit, validation to choose models & hyperparameters, test ONCE at the end for an unbiased estimate.", w: "Every project.", c: "from sklearn.model_selection import train_test_split\nX_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)" },
        { t: "K-Fold Cross-Validation", d: "Split training data into k parts; train on k−1, validate on 1, repeat k times and average. More reliable than one split.", w: "Small/medium datasets.", c: "from sklearn.model_selection import cross_val_score, StratifiedKFold\ncv = StratifiedKFold(5, shuffle=True, random_state=42)\ncross_val_score(model, X_tr, y_tr, cv=cv, scoring='f1')" },
        { t: "Time-Series Split", d: "Always train on the past and validate on the future — never shuffle time data.", w: "Forecasting, any data with time order.", c: "from sklearn.model_selection import TimeSeriesSplit\ncv = TimeSeriesSplit(n_splits=5)" },
        { t: "Group K-Fold", d: "Keep all rows of the same customer/patient in one fold to avoid leakage between folds.", w: "Multiple rows per entity.", c: "from sklearn.model_selection import GroupKFold" },
        { t: "Nested CV", d: "Inner loop tunes hyperparameters, outer loop estimates performance — avoids optimistic scores.", w: "Small datasets, research / papers." },
        { t: "Look at mean AND spread", d: "Model A: 0.85 ± 0.01 vs Model B: 0.86 ± 0.05 — A may be the safer choice. Use paired tests (e.g. 5×2 CV t-test) for close calls.", w: "When scores are very close." },
        { t: "Learning curves", d: "Plot score vs. training size. Gap between train and validation = variance; both low = bias. Tells you if more data will help.", w: "Deciding 'more data or better model?'", c: "from sklearn.model_selection import LearningCurveDisplay\nLearningCurveDisplay.from_estimator(model, X_tr, y_tr, cv=5)" }
      ]
    },
    {
      name: "🎛️ Hyperparameter Tuning",
      intro: "Hyperparameters are settings you choose before training (tree depth, learning rate, C). Tune them on validation data only.",
      cards: [
        { t: "Manual / defaults first", d: "Library defaults are often decent. Tune only after picking a promising algorithm.", w: "Early exploration." },
        { t: "Grid Search", d: "Try every combination from a list. Simple but explodes with many parameters.", w: "2–3 parameters with few values.", c: "from sklearn.model_selection import GridSearchCV\nGridSearchCV(model, {'max_depth':[3,5,7], 'n_estimators':[100,300]}, cv=5, scoring='roc_auc')" },
        { t: "Random Search", d: "Sample random combinations. Finds good settings much faster than grid for the same budget.", w: "Many parameters, limited time.", c: "from sklearn.model_selection import RandomizedSearchCV\nRandomizedSearchCV(model, param_distributions, n_iter=50, cv=5)" },
        { t: "Bayesian Optimisation (Optuna, Hyperopt)", d: "Learns from previous trials which regions look promising and tries those next. Most efficient for expensive models.", w: "Gradient boosting, deep learning.", c: "import optuna\ndef objective(trial):\n    lr = trial.suggest_float('lr', 1e-3, 0.3, log=True)\n    ...\n    return score\noptuna.create_study(direction='maximize').optimize(objective, n_trials=100)" },
        { t: "Early stopping", d: "Stop adding trees/epochs when validation score stops improving — cheap and prevents overfitting.", w: "XGBoost, LightGBM, neural networks." },
        { t: "Don't over-tune", d: "Tuning too much on one validation set overfits to it. Keep a final untouched test set.", w: "Always." }
      ]
    },
    {
      name: "💻 Workflow & Code",
      intro: "A practical end-to-end recipe: baseline → shortlist → compare with CV → tune the winner → test once.",
      code: "import pandas as pd\nfrom sklearn.dummy import DummyClassifier\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.ensemble import RandomForestClassifier\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.model_selection import StratifiedKFold, cross_validate\nfrom lightgbm import LGBMClassifier\n\ncv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\ncandidates = {\n    'Baseline (majority)': DummyClassifier(strategy='most_frequent'),\n    'Logistic Regression': make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),\n    'Random Forest':       RandomForestClassifier(n_estimators=300, random_state=42),\n    'LightGBM':            LGBMClassifier(random_state=42),\n}\n\nrows = []\nfor name, model in candidates.items():\n    r = cross_validate(model, X_train, y_train, cv=cv,\n                       scoring=['roc_auc', 'f1'], return_train_score=True)\n    rows.append({'model': name,\n                 'val_auc':   r['test_roc_auc'].mean(),\n                 'auc_std':   r['test_roc_auc'].std(),\n                 'train_auc': r['train_roc_auc'].mean(),   # big gap = overfitting\n                 'val_f1':    r['test_f1'].mean(),\n                 'fit_sec':   r['fit_time'].mean()})\n\nprint(pd.DataFrame(rows).sort_values('val_auc', ascending=False))\n# -> tune the best 1-2 models, then evaluate ONCE on the held-out test set",
      cards: [
        { t: "1. Define success", d: "Pick the business metric and the minimum acceptable score before modelling.", w: "Day 1." },
        { t: "2. Build baselines", d: "Dummy + simple rule/linear model. Record their scores.", w: "Hour 1." },
        { t: "3. Shortlist & compare", d: "2–4 algorithms, same CV folds, same metric. Track score, spread, train/val gap and time.", w: "Iteration loop." },
        { t: "4. Tune & finalise", d: "Tune the winner(s), check learning curves, error analysis, fairness; then test once.", w: "Before deployment." },
        { t: "5. Track experiments", d: "Log parameters, data versions and scores (MLflow, Weights & Biases) so results are reproducible.", w: "Throughout." }
      ]
    },
    {
      name: "⚠️ Pitfalls & Checklist",
      intro: "Common mistakes that make model selection misleading.",
      cards: [
        { t: "Skipping the baseline", d: "You cannot tell if 92% is good or terrible without it." },
        { t: "Choosing on the test set", d: "Peeking at the test set to pick models leaks information — the final score becomes optimistic." },
        { t: "Different splits per model", d: "Comparing model A on split 1 vs model B on split 2 is unfair; fix random_state and folds." },
        { t: "Wrong metric", d: "Using accuracy on imbalanced data, or RMSE when the business cares about % error." },
        { t: "Leakage in preprocessing", d: "Scaling/encoding on the full data before CV. Put preprocessing inside a Pipeline." },
        { t: "Chasing tiny gains", d: "+0.1% AUC that costs 10× latency and complexity is usually not worth it." },
        { t: "Ignoring constraints", d: "The best offline model may be too slow, too big or unexplainable for production." },
        { t: "✅ Checklist", d: "Baseline built • metric agreed • same CV for all • pipeline prevents leakage • train/val gap checked • simplest good model chosen • test set used once • results logged." }
      ]
    }
  ];

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function paneHTML(tab) {
    var h = '<p class="bm-intro">' + esc(tab.intro) + "</p>";
    if (tab.table) {
      h += '<div class="bm-table-wrap"><table class="bm-table"><thead><tr>' +
        tab.table.head.map(function (x) { return "<th>" + esc(x) + "</th>"; }).join("") + "</tr></thead><tbody>" +
        tab.table.rows.map(function (r) { return "<tr>" + r.map(function (x) { return "<td>" + esc(x) + "</td>"; }).join("") + "</tr>"; }).join("") +
        "</tbody></table></div>";
    }
    if (tab.code) h += '<pre class="bm-code bm-code-big"><code>' + esc(tab.code) + "</code></pre>";
    h += '<div class="bm-grid">' + tab.cards.map(function (c) {
      return '<div class="bm-card"><h4>' + esc(c.t) + "</h4><p>" + esc(c.d) + "</p>" +
        (c.w ? '<p class="bm-when"><b>When:</b> ' + esc(c.w) + "</p>" : "") +
        (c.c ? '<pre class="bm-code"><code>' + esc(c.c) + "</code></pre>" : "") + "</div>";
    }).join("") + "</div>";
    return h;
  }

  function css() {
    var s = document.createElement("style");
    s.textContent = [
      ".bm-slide{overflow-y:auto}",
      ".bm-lead{opacity:.85;max-width:1100px;line-height:1.55;margin:.4rem 0 1rem}",
      ".bm-tabs{display:flex;flex-wrap:wrap;gap:.4rem;padding:.6rem;border:1px solid rgba(148,163,184,.2);border-radius:12px;margin-bottom:1rem}",
      ".bm-tab{font:inherit;color:inherit;cursor:pointer;border:1px solid rgba(148,163,184,.35);background:rgba(148,163,184,.08);border-radius:8px;padding:.4rem .85rem;font-size:.85rem;transition:all .15s}",
      ".bm-tab:hover{border-color:#6c8cff}",
      ".bm-tab.active{background:linear-gradient(135deg,#6c8cff,#8b5cf6);border-color:transparent;color:#fff;font-weight:600}",
      ".bm-intro{margin:0 0 .9rem;line-height:1.55;padding:.7rem 1rem;border-left:4px solid #f5a524;background:rgba(245,165,36,.08);border-radius:8px}",
      ".bm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:.9rem;padding-bottom:1.5rem}",
      ".bm-card{border:1px solid rgba(148,163,184,.25);background:rgba(148,163,184,.06);border-radius:12px;padding:.9rem 1rem;min-width:0}",
      ".bm-card h4{margin:0 0 .45rem;font-size:.98rem}",
      ".bm-card p{margin:.2rem 0;line-height:1.5}",
      ".bm-when{font-size:.86rem;opacity:.85}",
      ".bm-code{font-family:Consolas,monospace;font-size:.8rem;white-space:pre;background:rgba(0,0,0,.35);color:#e2e8f0;border-radius:8px;padding:.65rem;margin:.5rem 0 0;overflow-x:auto}",
      ".bm-code-big{margin:0 0 1rem;font-size:.82rem}",
      ".bm-table-wrap{overflow-x:auto;margin-bottom:1rem}",
      ".bm-table{width:100%;border-collapse:collapse;font-size:.88rem}",
      ".bm-table th,.bm-table td{border:1px solid rgba(148,163,184,.25);padding:.5rem .7rem;text-align:left;vertical-align:top}",
      ".bm-table th{background:rgba(108,140,255,.18)}",
      ".bm-table tr:nth-child(even) td{background:rgba(148,163,184,.05)}"
    ].join("\n");
    document.head.appendChild(s);
  }

  function init() {
    if (document.getElementById("baselines-model-selection")) return;
    var metrics = document.getElementById("evaluation-metrics");
    var ref = metrics;
    if (!ref) {
      var slides = Array.prototype.slice.call(document.querySelectorAll("section.slide"))
        .filter(function (s) { return !s.closest("[hidden]"); });
      ref = slides[13] || null;
      if (!ref) return;
    }
    var sec = document.createElement("section");
    sec.className = "slide bm-slide";
    sec.id = "baselines-model-selection";
    sec.setAttribute("data-title", "Baselines & Model Selection");
    var grp = ref.getAttribute("data-group");
    if (grp) sec.setAttribute("data-group", grp);
    var h2 = ref.querySelector("h2");
    sec.innerHTML = '<h2 class="' + (h2 ? esc(h2.className) : "") + '">Baselines &amp; Model Selection</h2>' +
      '<p class="bm-lead">Start with a <b>simple baseline</b>, then pick candidate algorithms that fit your data and constraints, compare them <b>fairly</b>, and choose the simplest model that meets the goal.</p>' +
      '<div class="bm-tabs" role="tablist">' + TABS.map(function (t, i) {
        return '<button type="button" role="tab" class="bm-tab' + (i === 0 ? " active" : "") + '" data-i="' + i + '">' + esc(t.name) + "</button>";
      }).join("") + "</div>" +
      '<div class="bm-pane"></div>';
    ref.parentNode.insertBefore(sec, ref);
    css();

    var pane = sec.querySelector(".bm-pane");
    var btns = Array.prototype.slice.call(sec.querySelectorAll(".bm-tab"));
    function show(i) {
      btns.forEach(function (b, j) { b.classList.toggle("active", i === j); });
      pane.innerHTML = paneHTML(TABS[i]);
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function (e) { e.stopPropagation(); show(i); });
    });
    show(0);
  }

  if (document.querySelector("section.slide")) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
