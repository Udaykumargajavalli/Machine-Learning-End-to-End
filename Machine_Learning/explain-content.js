/* Content for the "Interpretability & Explainability" chapter. Needs explain-figures.js. Exposes window.EX_TABS. */
(function () {
  "use strict";
  var FIG = function (n) { return (window.EX_FIG && window.EX_FIG[n]) ? window.EX_FIG[n]() : ""; };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function ul(a) { return "<ul>" + a.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>"; }
  function ol(a) { return "<ol>" + a.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ol>"; }
  function p(s) { return "<p>" + s + "</p>"; }
  function sec(icon, title, body, cls) { return "<div class='ex-sec " + (cls || "") + "'><h4>" + icon + " " + title + "</h4>" + body + "</div>"; }
  function code(lines) { return "<pre class='ex-code'><code>" + esc(lines.join("\n")) + "</code></pre>"; }
  function fig(svg, cap) { return "<div class='ex-fig ex-wide'>" + svg + "<div class='ex-cap'>" + cap + "</div></div>"; }
  function table(head, rows) {
    return "<div class='ex-tablewrap'><table class='ex-table'><thead><tr>" + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") +
      "</tr></thead><tbody>" + rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return "<td>" + (i === 0 ? "<b>" + c + "</b>" : c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  function pc(pros, cons, t1, t2) {
    return "<div class='ex-pc ex-wide'><div class='ex-pro'><h4>" + (t1 || "✅ Pros") + "</h4>" + ul(pros) + "</div><div class='ex-con'><h4>" + (t2 || "⚠️ Cons") + "</h4>" + ul(cons) + "</div></div>";
  }
  function intro(s) { return "<p class='ex-intro'>" + s + "</p>"; }
  function grid(parts) { return "<div class='ex-grid'>" + parts.join("") + "</div>"; }
  function qa(q, a) { return sec("🎤", "Interview question", "<p><b>" + q + "</b></p><p>" + a + "</p>", "ex-qa"); }
  function link(u, t) { return "<a href='" + u + "' target='_blank' rel='noopener'>" + t + "</a>"; }

  var TABS = [];

  /* ------------------------------------------------------------ Overview */
  TABS.push({ name: "🧭 Overview", html: function () {
    return intro("A model that is accurate but opaque is hard to <b>trust, debug, audit or defend</b>. <b>Interpretability</b> is how well a person can understand <i>how</i> a model works; <b>explainability</b> is being able to give <i>reasons</i> for what it predicts – often with post-hoc tools applied to a black box.") +
      grid([
        sec("❓", "Why it matters", ul(["<b>Debugging</b>: spot leakage, bugs and features the model should not rely on.", "<b>Trust and adoption</b>: people use tools they understand.", "<b>Fairness</b>: check that protected attributes or their proxies do not drive decisions.", "<b>Regulation and accountability</b>: for example reasons for adverse credit decisions, safeguards for automated decisions (GDPR Art. 22) and transparency duties for high-risk AI (EU AI Act). This is not legal advice.", "<b>Improvement</b>: explanations suggest better features and data fixes."])),
        sec("📖", "Key vocabulary", table(["Term", "Meaning"], [
          ["Interpretable (intrinsic)", "The model itself is understandable: linear / logistic regression, small trees, rules, GAM / EBM"],
          ["Post-hoc explanation", "A tool applied <i>after</i> training to explain a black box (SHAP, LIME, PDP, permutation)"],
          ["Global", "Describes the <b>whole model</b>: what does it rely on overall?"],
          ["Local", "Describes <b>one prediction</b>: why did this person get this score?"],
          ["Model-specific / agnostic", "Uses model internals (tree splits) vs needs only <code>predict()</code>"],
          ["Faithfulness", "How accurately the explanation reflects what the model really does"]])),
        fig(FIG("taxonomy"), "The techniques in this chapter, arranged by scope (global or local) and by what they need from the model."),
        sec("📊", "Techniques at a glance", table(["Technique", "Scope", "Works with", "Answers", "Main caveat"], [
          ["Coefficients / odds ratios", "Global", "Linear models", "How does +1 unit change the outcome?", "Standardise features; correlated features distort"],
          ["Impurity importance (MDI)", "Global", "Tree ensembles", "Which features split the data most?", "Biased; computed on training data"],
          ["Permutation importance", "Global", "Any model", "How much does the score drop without this feature?", "Use held-out data; correlated features"],
          ["Partial dependence / ICE", "Global / local", "Any model", "What is the shape of the effect?", "Assumes feature independence"],
          ["SHAP", "Local + global", "Any (fast for trees)", "How much did each feature push this prediction?", "Cost; background-data choice"],
          ["LIME", "Local", "Any model", "Which features matter near this instance?", "Unstable; low local fit possible"],
          ["Surrogate model", "Global", "Any model", "Can a simple model mimic it?", "Only as good as its fidelity"],
          ["Counterfactuals", "Local", "Any model", "What would change the decision?", "Must be feasible and actionable"]]), "ex-wide"),
        sec("⚖️", "Interpretable model or black box + explanation?", ul(["Start with the <b>simplest model that meets the goal</b>; a well-built logistic regression or small GAM is often close in accuracy.", "For <b>high-stakes</b> decisions (credit, health, justice) prefer inherently interpretable models when accuracy is similar.", "If a gradient-boosted model is clearly better, use it <i>and</i> explain it with SHAP / permutation / PDP, and document the limits.", "Explanations <b>describe the model, not the real world</b>: they show what the model uses, not what causes the outcome."])),
        sec("🧪", "Running example used in every tab", p("A synthetic <b>loan default</b> dataset (4,000 applicants, 6 features, one of them pure noise on purpose) and a gradient-boosting classifier. Run this setup once; the code in the other tabs assumes these variables exist. The numbers shown in the figures come from this exact code.") +
          code([
            "import numpy as np, pandas as pd",
            "from sklearn.model_selection import train_test_split",
            "from sklearn.ensemble import GradientBoostingClassifier",
            "",
            "rng = np.random.default_rng(0)",
            "n = 4000",
            "income = rng.lognormal(10.8, 0.4, n)                          # annual income",
            "loan_amount = income * rng.uniform(0.2, 1.2, n)               # correlated with income",
            "dti = np.clip(rng.normal(0.35, 0.12, n), 0.02, 0.9)           # debt-to-income ratio",
            "history = rng.integers(0, 30, n)                              # years of credit history",
            "late = rng.poisson(1.0, n)                                    # late payments, last 2 years",
            "noise = rng.normal(size=n)                                    # irrelevant on purpose",
            "logit = (-0.5 + 6 * (dti - 0.35) + 0.5 * late - 0.06 * history",
            "         - 1.0 * np.log(income / 50000) + 0.8 * (loan_amount / income - 0.7))",
            "y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)    # 1 = default",
            "X = pd.DataFrame({'income': income.round(0), 'loan_amount': loan_amount.round(0),",
            "                  'debt_to_income': dti.round(3), 'credit_history_years': history,",
            "                  'late_payments': late, 'random_noise': noise.round(3)})",
            "",
            "X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)",
            "model = GradientBoostingClassifier(n_estimators=200, max_depth=3, learning_rate=0.05,",
            "                                   random_state=0).fit(X_train, y_train)    # test AUC is about 0.76"
          ]), "ex-wide"),
        sec("🧭", "Which technique when?", ol(["<b>What does my model rely on?</b> → permutation importance (global).", "<b>What is the shape of the effect?</b> → partial dependence + ICE.", "<b>Why this prediction?</b> → SHAP (first choice) or LIME.", "<b>Quick sanity check of a tree model?</b> → impurity importance, but confirm with permutation.", "<b>Need to tell a customer?</b> → local explanation + plain-language translation + what-if."])),
        sec("📏", "Golden rules", ul(["Explain on <b>held-out data</b> when you assess generalisation.", "Always sanity-check with <b>domain experts</b>: does the direction make sense?", "Correlated features split or share credit – explain <b>groups</b> of features when needed.", "A dominant, suspiciously good feature is often <b>target leakage</b>.", "Explanations can be <b>unstable</b>; fix seeds and check several runs."]), "ex-leak"),
        qa("Is a high feature importance proof that the feature causes the outcome?", "No. Importance only says the <i>model</i> uses the feature. The feature may be a proxy for something else or correlated with the true cause. Causal claims need experiments or causal modelling.")
      ]);
  } });

  /* ------------------------------------------------------------ Feature importance */
  TABS.push({ name: "1 · Feature Importance", html: function () {
    return intro("<b>Feature importance</b> gives each feature a score for how much the model relies on it. It is a <b>global</b>, usually <b>model-specific</b> view: linear coefficients for linear models, impurity-based importance for trees, and gain / cover / weight for boosters.") +
      grid([
        sec("💡", "What it is", p("The three common flavours: <b>(1) coefficients</b> – in logistic regression each standardised coefficient is the change in log-odds for +1 standard deviation; <b>(2) impurity importance (MDI)</b> – how much a feature's splits reduce impurity in a forest or boosted trees; <b>(3) booster scores</b> – XGBoost / LightGBM report <i>weight</i> (number of splits), <i>cover</i> (samples affected) and <i>gain</i> (improvement in the objective).")),
        sec("⚙️", "How impurity importance works", ol(["For every split in every tree compute the impurity decrease: <code>N<sub>t</sub>/N · (G − N<sub>L</sub>/N<sub>t</sub> · G<sub>L</sub> − N<sub>R</sub>/N<sub>t</sub> · G<sub>R</sub>)</code>, with Gini <code>G = 1 − Σ p<sup>2</sup></code>.", "Add the decreases to the feature used by that split.", "Sum over all trees (average for a forest).", "Normalise so the scores add up to 1."])),
        fig(FIG("mdiBars"), "Impurity importance from the example model. The pure-noise feature gets a higher score than a real feature."),
        sec("🧮", "Worked example – one split", p("A node holds 100 samples, 50 default and 50 repaid: G = 1 − 0.5² − 0.5² = <b>0.50</b>. Splitting on debt_to_income gives:") +
          table(["Child", "Samples", "Default / repaid", "Gini"], [["Left (low DTI)", "40", "4 / 36", "1 − 0.1² − 0.9² = 0.18"], ["Right (high DTI)", "60", "46 / 14", "1 − 0.767² − 0.233² ≈ 0.358"]]) +
          p("Weighted child impurity = 0.4 × 0.18 + 0.6 × 0.358 ≈ 0.287, so the decrease is 0.50 − 0.287 ≈ <b>0.213</b>. If the node holds 100 of the tree's 1,000 samples, its weighted contribution to debt_to_income is 0.213 × 0.1 ≈ 0.021. Add such contributions over all splits and trees, then normalise.")),
        sec("🔢", "Linear model: standardised coefficients", table(["Feature", "Coefficient (per +1 std)", "Odds ratio"], [["debt_to_income", "+0.70", "× 2.01"], ["income", "−0.64", "× 0.53"], ["late_payments", "+0.56", "× 1.76"], ["credit_history_years", "−0.52", "× 0.59"], ["loan_amount", "+0.31", "× 1.36"], ["random_noise", "+0.12", "× 1.13"]]) + p("Odds ratio = e<sup>coefficient</sup>. One standard deviation more debt-to-income multiplies the odds of default by about 2. Always <b>standardise</b> first, otherwise coefficients depend on units. (Noise gets a small non-zero value purely by chance.)")),
        sec("🐍", "Code: three kinds of feature importance", code([
          "import pandas as pd, numpy as np",
          "from sklearn.pipeline import make_pipeline",
          "from sklearn.preprocessing import StandardScaler",
          "from sklearn.linear_model import LogisticRegression",
          "",
          "# 1) impurity-based importance of the tree ensemble",
          "imp = pd.Series(model.feature_importances_, index=X_train.columns).sort_values(ascending=False)",
          "print(imp.round(3))",
          "",
          "# 2) linear model: STANDARDISE so coefficients are comparable",
          "lr = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X_train, y_train)",
          "coef = pd.Series(lr[-1].coef_[0], index=X_train.columns)",
          "print(coef.sort_values(key=abs, ascending=False).round(2))",
          "print(np.exp(coef).round(2).to_dict())          # odds ratio per +1 standard deviation",
          "",
          "# 3) XGBoost / LightGBM: choose the importance type explicitly",
          "# booster.get_score(importance_type='gain')      # also 'weight', 'cover', 'total_gain'"
        ]), "ex-wide"),
        pc(["Free: computed during training", "Instant, easy to plot and explain", "Coefficients give <b>direction and size</b> for linear models"],
          ["Impurity importance is <b>biased</b> towards continuous and high-cardinality features, and it can give credit to pure noise", "It is computed on <b>training data</b>, so it can reflect overfitting", "Correlated features split the credit between them", "No direction for trees; says nothing about causation"]),
        sec("🎯", "When to use it", ul(["A quick first look at a tree model or a linear model.", "Reporting an <b>interpretable linear model</b> (odds ratios).", "Spotting leakage: one feature dominating at 0.9 deserves an investigation.", "Then <b>confirm with permutation importance</b> on held-out data."])),
        sec("🛡️", "Avoid data leakage and wrong conclusions", ul(["Do not use importance computed on the full dataset to <b>select features</b> and then cross-validate the reduced model – put selection inside the CV <b>Pipeline</b>.", "Fit scalers inside the pipeline; standardise using training statistics only.", "Prefer importance measured on <b>validation / test</b> data (see permutation importance).", "Treat a suspiciously dominant feature as a possible leak: ask whether it is known at prediction time."]), "ex-leak"),
        qa("Why can a random feature get a non-zero impurity importance?", "Trees keep splitting until leaves are pure, and a noise feature always offers <i>some</i> split that reduces training impurity by chance, especially if it has many distinct values. Impurity importance is measured on training data, so it cannot tell chance from signal.")
      ]);
  } });

  /* ------------------------------------------------------------ Permutation importance */
  TABS.push({ name: "2 · Permutation Importance", html: function () {
    return intro("<b>Permutation importance</b> asks a simple question: <i>how much worse does the model get if this feature's information is destroyed?</i> It shuffles one column of held-out data and measures the drop in score. It is <b>model-agnostic</b> and <b>global</b>.") +
      grid([
        sec("💡", "What it is", p("Shuffling a column keeps its distribution but breaks its relationship with the target. If the model relied on the feature, the score falls; if it ignored it, the score stays the same. Because it measures the effect on <b>real predictive performance</b>, it is more trustworthy than impurity importance, and it works for any model (forests, boosting, neural networks, SVMs).")),
        fig(FIG("permProcedure"), "Permutation importance: shuffle one column, re-score, take the difference."),
        sec("⚙️", "How it works", ol(["Fit the model; compute the baseline score <i>s</i> on held-out data (validation or test).", "For feature <i>j</i>: shuffle that column randomly and compute the score <i>s<sub>k,j</sub></i>.", "Repeat K times (e.g. 10 – 30) to average out luck.", "Importance<sub>j</sub> = <i>s</i> − mean(<i>s<sub>k,j</sub></i>); keep the std as an uncertainty band.", "Rank the features; values near 0 (or negative) mean no useful signal."])),
        fig(FIG("mdiVsPerm"), "Same model: impurity importance (left, training data) rewards the noise feature, permutation importance (right, test data) does not."),
        sec("🧮", "Worked example", p("Baseline test AUC = <b>0.760</b>. After shuffling debt_to_income the AUC is about 0.637, so importance = 0.760 − 0.637 ≈ <b>0.123</b>. Shuffling random_noise changes AUC by −0.0007 ± 0.0047: indistinguishable from zero.") +
          table(["Feature", "Impurity (train)", "Permutation (test)"], [["debt_to_income", "0.296", "0.123 ± 0.013"], ["income", "0.191", "0.070 ± 0.011"], ["late_payments", "0.169", "0.053 ± 0.009"], ["credit_history_years", "0.175", "0.049 ± 0.008"], ["loan_amount", "0.072", "0.010 ± 0.004"], ["random_noise", "0.098", "−0.001 ± 0.005"]]) +
          p("<b>Training vs test:</b> permutation importance of random_noise computed on the <i>training</i> data is 0.031 – the model memorised noise – but on test data it is ≈ 0. Always use held-out data.")),
        sec("🐍", "Code: scikit-learn and from scratch", code([
          "from sklearn.inspection import permutation_importance",
          "from sklearn.metrics import roc_auc_score",
          "import numpy as np, pandas as pd",
          "",
          "result = permutation_importance(model, X_test, y_test, scoring='roc_auc',",
          "                                n_repeats=20, random_state=0, n_jobs=-1)",
          "imp = pd.DataFrame({'mean': result.importances_mean, 'std': result.importances_std},",
          "                   index=X_test.columns).sort_values('mean', ascending=False)",
          "print(imp.round(4))",
          "",
          "# From scratch, also for GROUPS of correlated features (shuffled together)",
          "def perm_importance(model, X, y, cols, n_repeats=10, seed=0):",
          "    rng = np.random.default_rng(seed)",
          "    base = roc_auc_score(y, model.predict_proba(X)[:, 1])",
          "    drops = []",
          "    for _ in range(n_repeats):",
          "        Xp = X.copy()",
          "        Xp[cols] = Xp[cols].values[rng.permutation(len(Xp))]    # same shuffle for all listed columns",
          "        drops.append(base - roc_auc_score(y, model.predict_proba(Xp)[:, 1]))",
          "    return np.mean(drops), np.std(drops)",
          "",
          "print(perm_importance(model, X_test, y_test, ['income']))                  # about 0.073",
          "print(perm_importance(model, X_test, y_test, ['income', 'loan_amount']))   # about 0.048 (group)"
        ]), "ex-wide"),
        sec("🔗", "Correlated features", p("income and loan_amount are correlated and the model uses their ratio. Shuffling <b>income alone</b> creates impossible pairs (a tiny income with a huge loan), which hurts the model a lot (≈ 0.073). Shuffling the <b>pair together</b> keeps the pairs realistic and gives ≈ 0.048. Single-feature permutation can therefore <i>exaggerate</i> importance, and credit for a redundant feature can look small because the other copy still carries the information. Permute <b>groups of related features</b> together and interpret with care.")),
        sec("⚙️", "Settings", table(["Setting", "Meaning"], [["scoring", "Metric whose drop is measured (roc_auc, f1, neg_root_mean_squared_error …) – importance is relative to this metric"], ["n_repeats", "Shuffles per feature; more repeats = smaller std"], ["max_samples", "Rows per shuffle for large data"], ["Data used", "Held-out validation / test set, <b>not</b> training data"], ["Feature groups", "Shuffle correlated columns together (custom code)"]])),
        pc(["Model-agnostic and easy to explain", "Measures importance for <b>actual predictive performance</b>", "Not fooled by noise features the way impurity importance is", "Can be computed for any metric and any feature group"],
          ["Needs many predictions (features × repeats) – slow for big models", "Correlated features: unrealistic shuffles, shared or hidden importance", "Says how much the <i>model</i> relies on a feature, not whether it is causal", "No direction or shape of the effect"]),
        sec("🎯", "When to use it", ul(["As the <b>default global importance</b> for any model.", "To check or replace impurity importance.", "To decide which features can be dropped (then verify with CV).", "To compare importance across models on the same data."])),
        sec("🛡️", "Avoid data leakage", ul(["Compute on a <b>held-out set</b> that was not used to fit or tune the model.", "If you use the result to drop features, do it on a <b>validation</b> set and evaluate the final model on an untouched test set.", "Permute the <b>raw input columns</b> of the whole Pipeline (so preprocessing is applied after shuffling), not intermediate encoded columns.", "For time series, shuffle within a time block or use a time-based holdout; plain shuffling can leak the future."]), "ex-leak"),
        qa("Why prefer permutation importance over impurity importance?", "It is measured on held-out data with the real metric, works for every model, and does not reward features that are only useful for memorising the training set. Impurity importance is cheaper but biased.")
      ]);
  } });

  /* ------------------------------------------------------------ Partial dependence */
  TABS.push({ name: "3 · Partial Dependence", html: function () {
    return intro("<b>Partial dependence plots (PDP)</b> show <i>how the prediction changes on average as one feature changes</i>. <b>ICE curves</b> show the same thing for every individual. Together they reveal the <b>shape</b> of a feature's effect: linear, threshold, plateau, U-shaped.") +
      grid([
        sec("💡", "What it is", p("Feature importance tells you <i>that</i> a feature matters; partial dependence tells you <i>how</i>. For a feature <i>x<sub>j</sub></i> the PDP at value <i>v</i> is the model's average prediction when <i>x<sub>j</sub></i> is forced to <i>v</i> for every row while all other features keep their own values:") + code(["PD(v) = (1/n) · Σ_i  f( x_j = v ,  x_other(i) )"]) + p("An <b>ICE curve</b> is one term of that sum – one row's own curve. A <b>centered ICE</b> subtracts each curve's starting value so you compare slopes. A <b>2-D PDP</b> shows interaction between two features.")),
        sec("⚙️", "How it works", ol(["Choose a grid of values for the feature (e.g. 12 points between its 5th and 95th percentile).", "For each grid value, overwrite that column in <b>all rows</b> of a reference dataset.", "Predict for every modified row.", "ICE: keep each row's curve. PDP: average the predictions per grid value.", "Plot prediction vs feature value (add a rug of the data to see where the data is)."])),
        fig(FIG("pdpIce"), "Real PDP and ICE curves for debt_to_income (probability of default). Eight random customers in grey, the average in orange."),
        sec("🧮", "Worked example", p("Three customers' predicted default risk when debt_to_income is forced to 0.50: A = 0.70, B = 0.10, C = 0.55. PDP(0.50) = (0.70 + 0.10 + 0.55) / 3 = <b>0.45</b>. The average looks like a medium risk, yet B is almost immune. In the figure one customer's curve is nearly flat (0.03 → 0.11) while others climb steeply – a sign of an <b>interaction</b> that the PDP average hides. ICE curves reveal it.")),
        sec("🐍", "Code: PDP, ICE and 2-D PDP", code([
          "from sklearn.inspection import PartialDependenceDisplay, partial_dependence",
          "",
          "X_pdp = X_train.astype(float)       # scikit-learn PDP does not accept integer columns",
          "",
          "# average effect (PDP) of two features and their interaction",
          "PartialDependenceDisplay.from_estimator(",
          "    model, X_pdp, ['debt_to_income', 'late_payments', ('debt_to_income', 'late_payments')],",
          "    kind='average')",
          "",
          "# individual curves (ICE) + the average, centered so curves start at 0",
          "PartialDependenceDisplay.from_estimator(model, X_pdp, ['debt_to_income'],",
          "    kind='both', subsample=50, centered=True, random_state=0)",
          "",
          "# raw numbers if you want to plot yourself",
          "res = partial_dependence(model, X_pdp, ['debt_to_income'], kind='both', grid_resolution=12)",
          "print(res['grid_values'][0].round(2)[:3], res['average'][0].round(2)[:3], res['individual'][0].shape)"
        ]), "ex-wide"),
        sec("🔁", "Cousin: ALE (Accumulated Local Effects)", p("When features are <b>correlated</b> the PDP averages over unrealistic combinations (e.g. a very high loan with a very low income). <b>ALE plots</b> use only realistic neighbours and are safer in that situation (packages: <code>alibi</code>, <code>PyALE</code>).")),
        pc(["Intuitive: one curve per feature", "Shows direction, thresholds and plateaus", "Model-agnostic; ICE exposes heterogeneity", "Good for checking <b>monotonic</b> behaviour against domain knowledge"],
          ["Assumes the plotted feature is independent of the others", "The average can hide opposite effects (use ICE)", "Only 1 – 2 features at a time", "Unreliable where there is little data (use a rug / quantile grid)"]),
        sec("🎯", "When to use it", ul(["After importance has told you <i>which</i> features matter.", "To validate monotonic relationships with domain experts.", "To find thresholds for business rules.", "To explain a model's behaviour to technical stakeholders."])),
        sec("🛡️", "Avoid data leakage and misreading", ul(["Describe the <b>model</b>, not reality: use the training or validation data as reference, never tune the model to make the PDP look nice on the test set.", "Do not read the curve outside the range of observed data (extrapolation).", "With correlated features prefer ALE or group features together.", "Convert integer columns to float for scikit-learn, and keep preprocessing inside the Pipeline you pass to the function."]), "ex-leak"),
        qa("The PDP of a feature is flat but the feature has high importance. How is that possible?", "The feature can matter through <b>interactions</b>: opposite effects for different customers cancel in the average. ICE curves or a 2-D PDP will show it.")
      ]);
  } });

  /* ------------------------------------------------------------ SHAP */
  TABS.push({ name: "4 · SHAP", html: function () {
    return intro("<b>SHAP</b> (SHapley Additive exPlanations) splits a prediction into <b>one contribution per feature</b>, using Shapley values from game theory – the only way to share a payout fairly under a few natural rules. It gives <b>local</b> explanations that add up exactly, and <b>global</b> ones by averaging them.") +
      grid([
        sec("💡", "What it is", p("Think of the features as <b>players</b> in a team and the prediction minus the average prediction as the <b>prize</b>. A feature's SHAP value is its fair share, averaged over all orders in which the players could join. The result is an <b>additive explanation</b>:") + code(["f(x) = φ₀ + φ₁ + φ₂ + … + φ_M", "φ₀ = base value (average prediction)   φ_j = contribution of feature j for this row"]) + p("<b>Properties:</b> local accuracy (contributions sum to the prediction), missingness (an absent feature gets 0) and consistency (if a model relies more on a feature, its value does not drop).")),
        sec("⚙️", "How it works", ol(["Define a value function <i>v(S)</i>: the model output when only the features in <i>S</i> are known (the others are filled from background data).", "For a feature <i>j</i>, compute its <b>marginal contribution</b> <i>v(S ∪ {j}) − v(S)</i> for every subset <i>S</i> of the other features.", "Average these with the Shapley weights: <code>φ_j = Σ_S |S|!(M−|S|−1)!/M! · [v(S∪{j}) − v(S)]</code>.", "<b>TreeSHAP</b> computes this exactly and fast for trees; <b>KernelSHAP</b> approximates it for any model; DeepSHAP / GradientExplainer serve neural nets; LinearSHAP serves linear models.", "Plot: waterfall / force (one row), beeswarm and bar (global), dependence plot (shape + interactions)."])),
        fig(FIG("shapLattice"), "Toy model with 3 features: each line adds one feature to the known set; its label is that feature's marginal contribution."),
        sec("🧮", "Worked example – exact Shapley values", p("With v(∅) = 0.20 (average risk) and v(all three) = 0.50, average each feature's marginal contribution over the 6 orders in which features can arrive (D = debt_to_income, L = late_payments, H = credit_history):") +
          table(["Order", "D adds", "L adds", "H adds"], [["D, L, H", "+0.15", "+0.20", "−0.05"], ["D, H, L", "+0.15", "+0.20", "−0.05"], ["L, D, H", "+0.25", "+0.10", "−0.05"], ["L, H, D", "+0.25", "+0.10", "−0.05"], ["H, D, L", "+0.15", "+0.20", "−0.05"], ["H, L, D", "+0.25", "+0.10", "−0.05"], ["<b>Average = SHAP</b>", "<b>+0.20</b>", "<b>+0.15</b>", "<b>−0.05</b>"]]) +
          p("Check: 0.20 + 0.15 − 0.05 = <b>0.30</b> = 0.50 − 0.20, the full difference between this prediction and the average. Credit is fully and fairly distributed.")),
        fig(FIG("shapWaterfall"), "A real SHAP waterfall for one high-risk applicant (TreeSHAP on the example model)."),
        sec("📖", "Reading the waterfall", ul(["Start at the <b>base value</b> −0.74 log-odds (32 % average risk).", "debt_to_income = 0.686 adds <b>+2.09</b>; three late payments add <b>+1.29</b>; the loan size adds +0.56.", "Long credit history (−0.42) and income (−0.38) reduce the risk; noise ≈ 0 (−0.05).", "Total 2.34 log-odds = <b>91 %</b>: 1 / (1 + e<sup>−2.34</sup>) = 0.91. For a classifier trained with log-loss the units are log-odds, not probabilities."])),
        sec("🐍", "Code: TreeSHAP, plots and KernelSHAP", code([
          "import shap, numpy as np",
          "",
          "explainer = shap.TreeExplainer(model)                  # exact and fast for tree models",
          "shap_values = explainer.shap_values(X_test)             # shape (n_rows, n_features), log-odds",
          "print(explainer.expected_value)                         # base value",
          "",
          "shap.summary_plot(shap_values, X_test)                  # global beeswarm: colour = feature value",
          "shap.summary_plot(shap_values, X_test, plot_type='bar')  # global: mean |SHAP|",
          "shap.dependence_plot('debt_to_income', shap_values, X_test)   # shape of the effect + interactions",
          "",
          "exp = explainer(X_test)                                 # Explanation object for the new plots API",
          "p = model.predict_proba(X_test)[:, 1]; i = int(np.argsort(-p)[5])",
          "shap.plots.waterfall(exp[i])                            # local: one applicant",
          "base = float(np.ravel(explainer.expected_value)[0])",
          "print(1 / (1 + np.exp(-(base + shap_values[i].sum()))), p[i])   # identical: local accuracy",
          "",
          "# Any model: KernelSHAP with a small background sample (slow, so explain few rows)",
          "background = shap.sample(X_train, 100, random_state=0)",
          "kexp = shap.KernelExplainer(lambda d: model.predict_proba(d)[:, 1], background)",
          "kvals = kexp.shap_values(X_test.iloc[:3], nsamples=200)  # contributions in probability units"
        ]), "ex-wide"),
        sec("🔀", "Which explainer?", table(["Explainer", "Models", "Speed", "Note"], [["TreeExplainer", "Random forest, XGBoost, LightGBM, CatBoost, sklearn trees / GBM", "Fast, exact", "Output in the model's margin (log-odds for classifiers)"], ["LinearExplainer", "Linear / logistic regression", "Instant", "Respects feature correlations if asked"], ["DeepExplainer / GradientExplainer", "Neural networks", "Medium", "Needs a background batch"], ["KernelExplainer / PermutationExplainer", "Any model", "Slow (many model calls)", "Use a small background and few rows"]])),
        pc(["Local <b>and</b> global in one framework: averaging local values gives global importance", "Contributions add up exactly to the prediction", "Solid theory; TreeSHAP is fast", "Rich plots; handles interactions (SHAP interaction values)"],
          ["KernelSHAP is expensive (exponential in features, approximated by sampling)", "Results depend on the <b>background data</b> and value function", "With correlated features, credit can go to features the model barely uses", "Easy to misread as <i>causal</i>; units (log-odds) confuse non-experts"]),
        sec("🎯", "When to use it", ul(["Explaining individual predictions of tree ensembles (the first choice).", "Global importance with direction (beeswarm).", "Debugging: find rows with a strange contribution pattern.", "Producing the raw material for reason codes (see the last lessons)."])),
        sec("🛡️", "Avoid data leakage", ul(["Pick the <b>background data from the training set</b> only; do not use test rows to define the baseline.", "Explain <b>held-out</b> rows; SHAP on training rows reflects what the model memorised.", "Compute SHAP for the final model after the pipeline is frozen; do not tune features by peeking at test-set SHAP values.", "A feature with huge SHAP that is unavailable at prediction time reveals target leakage."]), "ex-leak"),
        qa("What does a SHAP value of +0.5 for a feature mean?", "For this row the feature pushed the model output <b>0.5 units above the average prediction</b> (log-odds for a classifier). It describes the model's behaviour, not a causal effect of changing the feature.")
      ]);
  } });

  /* ------------------------------------------------------------ LIME */
  TABS.push({ name: "5 · LIME", html: function () {
    return intro("<b>LIME</b> (Local Interpretable Model-agnostic Explanations) explains <b>one prediction</b> of any black box by fitting a small, simple model on <i>perturbed copies of that instance</i>, so that the simple model is accurate <i>locally</i>.") +
      grid([
        sec("💡", "What it is", p("A complex model may be impossible to describe globally, but in a small neighbourhood it behaves almost like a straight line. LIME builds that line: it creates many slightly changed versions of the instance, asks the black box for their predictions, weights each version by how close it is to the original, and fits a sparse weighted linear model. The coefficients are the explanation.")),
        fig(FIG("limeConcept"), "LIME in one dimension (computed in your browser). The straight orange line is valid close to x₀ and wrong elsewhere."),
        sec("⚙️", "How it works", ol(["Take the instance <i>x₀</i>. Generate N perturbed samples (tabular: draw each feature from the training distribution / its bins; text: remove words; images: switch superpixels off).", "Predict all samples with the black-box model.", "Weight each sample by proximity: <code>π(z) = exp(−d(x₀, z)² / σ²)</code> with kernel width σ.", "Fit a sparse weighted linear model <code>g</code> by minimising <code>Σ π(z)·(f(z) − g(z))² + Ω(g)</code>.", "Report the K largest coefficients as the explanation and the model's local R² as a quality check."])),
        sec("🧮", "Worked example – the same applicant as in SHAP", table(["LIME feature condition", "Weight", "Meaning"], [["late_payments &gt; 2", "+0.26", "raises the default probability"], ["debt_to_income &gt; 0.44", "+0.23", "raises it"], ["income &gt; 63,825", "−0.17", "lowers it"], ["credit_history_years &gt; 22", "−0.15", "lowers it"], ["loan_amount &gt; 48,951", "+0.10", "raises it"], ["−0.66 &lt; random_noise ≤ 0.01", "−0.04", "≈ nothing"]]) +
          p("Weights are in <b>probability units</b> and refer to the bin the feature falls into (tabular LIME discretises). The local R² is only <b>0.52</b>: the local linear model explains about half of the variation, so treat the numbers as indicative. Running LIME a second time gave 0.245 for late_payments instead of 0.260 – LIME is <b>random</b>; fix the seed and use more samples.")),
        sec("🐍", "Code: LimeTabularExplainer", code([
          "from lime.lime_tabular import LimeTabularExplainer",
          "",
          "explainer = LimeTabularExplainer(",
          "    X_train.values,                              # training data defines the perturbation distribution",
          "    feature_names=list(X_train.columns),",
          "    class_names=['repaid', 'default'],",
          "    mode='classification',",
          "    random_state=0)                              # LIME is random: fix the seed",
          "",
          "i = int(np.argsort(-model.predict_proba(X_test)[:, 1])[5])   # same applicant as in the SHAP tab",
          "e = explainer.explain_instance(X_test.iloc[i].values, model.predict_proba,",
          "                               num_features=6, num_samples=5000)",
          "print(e.as_list())                               # [(condition, weight), ...] for class 'default'",
          "print('local R2:', round(e.score, 2))            # how well the local linear model fits",
          "e.as_pyplot_figure()                             # bar chart (or e.show_in_notebook())"
        ]), "ex-wide"),
        sec("⚖️", "LIME vs SHAP", table(["", "LIME", "SHAP"], [["Idea", "Local linear surrogate", "Shapley values (fair attribution)"], ["Guarantees", "None (local fit only)", "Contributions add up; consistency"], ["Stability", "Random; depends on kernel width and sampling", "Deterministic for TreeSHAP"], ["Speed", "Medium (N predictions per row)", "TreeSHAP fast; Kernel slow"], ["Data types", "Tabular, text, images", "Tabular, text, images"], ["Best for", "Quick model-agnostic local view; text / image highlights", "Rigorous local + global explanations"]]), "ex-wide"),
        pc(["Works with <b>any</b> model, including text and image classifiers", "Easy to understand: a short list of weighted features", "Intuitive local picture", "Few dependencies on model internals"],
          ["<b>Unstable</b>: different runs and kernel widths give different explanations", "Perturbations can be unrealistic; discretised bins for tabular data", "Local fit can be poor (check the R²) and gives no global picture", "Can be manipulated or misleading if the model is highly non-linear nearby"]),
        sec("🎯", "When to use it", ul(["Quick local explanation for models SHAP cannot handle easily.", "Text (which words drove the label) and images (which regions).", "A <b>second opinion</b> next to SHAP: if both agree, you can trust the story more."])),
        sec("🛡️", "Avoid data leakage and instability", ul(["The explainer only needs the <b>training features</b> (for distribution statistics); never pass test data to define it.", "Explain held-out rows with the final, frozen model.", "Fix <code>random_state</code>, use ≥ 5,000 samples, repeat several times and report only features that <b>consistently</b> appear.", "Check the local R² and the kernel width before presenting a LIME result to anyone."]), "ex-leak"),
        qa("Why can LIME give different explanations for the same row?", "It generates random perturbations and fits a model to them. Different samples, kernel widths or discretisation give different local fits. Fix the seed, increase the number of samples and look at stability.")
      ]);
  } });

  /* ------------------------------------------------------------ Global vs local */
  TABS.push({ name: "6 · Global vs Local", html: function () {
    return intro("<b>Global</b> explanations describe how the model behaves <i>overall</i>; <b>local</b> explanations describe <i>one</i> prediction. You usually need both: the global view to <b>audit and improve</b> the model, the local view to <b>justify a single decision</b>.") +
      grid([
        sec("🌍", "Global vs local at a glance", table(["", "Global", "Local"], [
          ["Question", "What does the model rely on overall?", "Why did <i>this</i> person get this score?"],
          ["Audience", "Data scientists, risk, auditors, regulators", "Customers, case workers, support, domain experts"],
          ["Typical tools", "Permutation importance, PDP, mean |SHAP|, surrogate tree, coefficients", "SHAP waterfall, LIME, ICE, counterfactuals, decision path"],
          ["Use", "Debugging, feature selection, fairness audit, model documentation", "Decision support, appeals, reason codes, debugging single errors"],
          ["Risk", "Hides individual differences", "May not generalise; unstable (LIME)"]]), "ex-wide"),
        fig(FIG("globalVsLocal"), "Global (left): mean |SHAP| over 1,000 test customers. Local (right): the contributions for one applicant. The two views tell different stories."),
        sec("🔗", "Moving between the two", ul(["<b>Local → global</b>: aggregate local explanations. Mean |SHAP| over many rows is a global importance; a beeswarm shows all rows.", "<b>Global → local</b> is <i>not</i> automatic: a feature that is important overall may be irrelevant for a particular person (in the PDP/ICE figure one customer's curve is almost flat).", "<b>Cohorts</b> in between: aggregate explanations for a segment (e.g. applicants with ≥ 2 late payments) to find group-specific drivers."])),
        sec("🧮", "Worked example", p("Globally, debt_to_income has the largest mean |SHAP| (0.52) and late_payments is fourth (0.36). For the applicant in the waterfall, debt_to_income contributes +2.09 and late_payments +1.29, so both matter <i>more</i> than average for this person. For a customer with no late payments, late_payments would contribute almost nothing. Knowing only the global ranking you would miss this.")),
        sec("🪜", "Global surrogate model", p("A <b>surrogate</b> is a simple model (e.g. a depth-3 tree) trained to <b>mimic the black box's predictions</b>, not the true labels. Its rules give a readable global approximation. Measure <b>fidelity</b> – how often it agrees with the black box on held-out data.") +
          code([
            "# simplified from export_text(surrogate)",
            "|--- debt_to_income <= 0.42",
            "|   |--- late_payments <= 2.50   -> mostly low risk",
            "|   |--- late_payments >  2.50   -> mostly high risk",
            "|--- debt_to_income >  0.42",
            "|   |--- credit_history_years <= 13.50  -> high risk",
            "|   |--- credit_history_years >  13.50  -> depends on DTI",
            "fidelity on test data = 0.82   (a simplified view: 18 % of predictions differ)"
          ])),
        sec("🐍", "Code: surrogate tree, local → global, cohort view", code([
          "import numpy as np, pandas as pd, shap",
          "from sklearn.tree import DecisionTreeClassifier, export_text",
          "",
          "# 1) Global surrogate: mimic the BLACK BOX predictions",
          "surrogate = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X_train, model.predict(X_train))",
          "print('fidelity:', surrogate.score(X_test, model.predict(X_test)))   # agreement with the model",
          "print(export_text(surrogate, feature_names=list(X_train.columns)))",
          "",
          "# 2) Local -> global: aggregate SHAP values",
          "shap_values = shap.TreeExplainer(model).shap_values(X_test)",
          "sv = pd.DataFrame(shap_values, columns=X_test.columns)",
          "print(sv.abs().mean().sort_values(ascending=False).round(2))      # global importance",
          "",
          "# 3) Cohort explanation: what drives risk for applicants with >= 2 late payments?",
          "mask = (X_test['late_payments'] >= 2).values",
          "print(sv[mask].mean().sort_values(ascending=False).round(2))"
        ]), "ex-wide"),
        pc(["Global view finds systematic problems and supports audits", "Local view justifies single decisions and finds odd cases", "Consistent frameworks (SHAP) provide both", "Cohort views reveal subgroup behaviour"],
          ["Global summaries hide individual differences", "Local explanations do not describe the whole model", "A surrogate is only as good as its fidelity", "Different tools may disagree – investigate rather than pick the nicest story"], "✅ Why use both", "⚠️ Pitfalls"),
        sec("🛡️", "Avoid data leakage", ul(["Build the surrogate on <b>training</b> inputs and the model's predictions; measure fidelity on held-out data.", "Aggregate SHAP on a representative <b>held-out</b> sample.", "Cohorts must be defined from information available at prediction time.", "Never choose the model or features because they make the explanations on the test set look better."]), "ex-leak"),
        qa("Your global importance says feature A is the most important, but a customer asks why they were declined and A is not mentioned in their explanation. Is something wrong?", "Not necessarily. Global importance averages over everyone; for this customer other features can dominate (A may be within the normal range). The local explanation answers the customer's question. Check consistency with ICE / SHAP, not with the global ranking.")
      ]);
  } });

  /* ------------------------------------------------------------ Non-technical */
  TABS.push({ name: "7 · Explaining to Non-technical Users", html: function () {
    return intro("An explanation is only useful if the <b>listener understands it and can act on it</b>. Customers, managers and regulators do not need SHAP values – they need clear reasons, honest limits and a way forward.") +
      grid([
        fig(FIG("commFlow"), "Translate the technical explanation before you show it. Keep the raw values for auditors."),
        sec("👥", "Know your audience", table(["Audience", "What they want", "Format", "Technique behind it"], [
          ["Customer / end user", "Why this decision? What can I do?", "2 – 3 plain sentences, what-if", "Local SHAP / LIME → reason codes, counterfactual"],
          ["Business stakeholder", "Is the model sensible? Where does it fail?", "Charts, rules of thumb, examples", "Permutation, PDP, surrogate rules"],
          ["Domain expert (doctor, underwriter)", "Does it agree with my knowledge?", "Feature effects, similar cases", "PDP / ICE, SHAP dependence, case review"],
          ["Regulator / auditor", "Is it documented, fair and consistent?", "Model card, global + local evidence", "Global importance, fairness metrics, logs"],
          ["Data scientist", "Why does the model behave like this?", "Full technical plots", "SHAP, PDP, permutation, diagnostics"]]), "ex-wide"),
        sec("📝", "From technical to plain language", table(["Technical output", "Plain-language message"], [
          ["SHAP(debt_to_income) = +2.09 log-odds", "Your monthly debts are high compared with your income. This was the biggest reason."],
          ["SHAP(late_payments) = +1.29", "There were 3 late payments in the last 2 years."],
          ["SHAP(credit_history_years) = −0.42", "Your long credit history worked in your favour."],
          ["p = 0.91", "Based on past customers with a similar profile, around 9 in 10 did not repay on time."],
          ["Counterfactual: DTI 0.69 → 0.40, late payments 3 → 1", "If your debts were lower relative to income and you had no more than one late payment, the estimated risk would be much lower."]])),
        sec("🪟", "Example of a customer-facing explanation", "<div class='ex-msg'><div class='ex-msg-h'>Decision: <b>not approved automatically</b> – a specialist will review your application</div>" +
          "<div class='ex-msg-b'><b>Main reasons</b><ol><li>Your monthly debts are high compared with your income.</li><li>There were late payments in the last 2 years.</li><li>The requested loan is large compared with your income.</li></ol>" +
          "<b>In your favour:</b> long credit history.<br><br><b>What could change this:</b> lower debt relative to income (for example around 0.40 instead of 0.69) and fewer late payments would reduce the estimated risk from about 91 % to about 18 %.<br><br>" +
          "<span class='ex-msg-s'>This is an estimate based on patterns in past data, not a judgement about you. You can ask for a human review and correct any wrong data.</span></div></div>"),
        sec("🐍", "Code: reason codes and what-if from SHAP", code([
          "import pandas as pd",
          "",
          "NAMES = {'debt_to_income': 'Your monthly debts are high compared with your income',",
          "         'late_payments': 'There were late payments in the last 2 years',",
          "         'loan_amount': 'The requested loan is large compared with your income',",
          "         'credit_history_years': 'Your credit history is short',",
          "         'income': 'Your income is lower than typical for this loan size'}   # the feature dictionary",
          "",
          "def reason_codes(i, top=3):",
          "    contrib = pd.Series(shap_values[i], index=X_test.columns).drop('random_noise')",
          "    risky = contrib[contrib > 0].sort_values(ascending=False).head(top)    # only factors that INCREASED risk",
          "    return [NAMES[f] for f in risky.index]",
          "",
          "def what_if(row, feature, values):                 # simple counterfactual probe",
          "    out = {}",
          "    for v in values:",
          "        r = row.copy(); r[feature] = v",
          "        out[v] = round(model.predict_proba(r.to_frame().T.astype(X_test.dtypes))[0, 1], 2)",
          "    return out",
          "",
          "print(reason_codes(i))",
          "print(what_if(X_test.iloc[i], 'debt_to_income', [0.60, 0.50, 0.40, 0.30]))   # {0.6: 0.91, 0.5: 0.57, 0.4: 0.49, 0.3: 0.38}"
        ]), "ex-wide"),
        sec("🧭", "Principles", ol(["<b>Lead with the answer</b>, then the top 2 – 3 reasons. More than five reasons is noise.", "<b>Plain words, not feature names.</b> Keep a reviewed dictionary from feature to sentence.", "<b>Direction and relative size</b> (“biggest reason”), not raw log-odds.", "<b>Make it actionable</b>: only suggest changes the person can really make, and never based on protected attributes or their proxies.", "<b>Be honest about uncertainty</b>: “estimate”, “based on past data”, “not a judgement about you”.", "<b>Offer a path</b>: human review, appeal, how to correct data.", "<b>Test with real users</b>: ask them to restate the explanation and say what they would do."])),
        pc(["Lead with the decision and 2 – 3 reasons", "Use everyday language and examples", "Show what could change the outcome (feasible actions)", "State limits and offer human review", "Log the technical explanation for audit"],
          ["Show raw SHAP / LIME numbers or charts to laypeople", "Imply causation (“X caused your default”)", "Hide behind the model (“the algorithm decided”)", "Offer fake precision (“91.37 %”)", "Give advice that is impossible or gameable"], "✅ Do", "🚫 Don't"),
        sec("⚠️", "Faithful, not just persuasive", ul(["An explanation must reflect what the model really did; a nice story that is not faithful is <b>fairwashing</b>.", "Counterfactuals describe the <b>model</b>; changing the input in real life may not change the real risk.", "Check explanations for <b>fairness</b>: do proxies (postcode, name) appear as reasons?", "Compliance wording (e.g. adverse-action reasons, automated-decision rights) differs by country – involve legal and compliance teams."]), "ex-leak"),
        sec("🛡️", "Avoid data leakage and privacy problems", ul(["Reasons and what-ifs may only use information the person <b>supplied or is entitled to see</b>; do not reveal other people's data or internal thresholds that enable gaming.", "Generate explanations from the <b>final, frozen</b> model and a background set drawn from training data.", "Version the model, features and explanation code together so every message can be reproduced during an appeal.", "Log explanations and the inputs used; protect these logs as personal data."]), "ex-leak"),
        qa("A customer asks: “Why was I declined, and what should I do?” What do you say?", "Give the 2 – 3 main reasons in plain words from the local explanation (e.g. high debt relative to income, recent late payments), mention anything that helped them, suggest realistic changes based on a feasible counterfactual, state that it is an estimate from past data, and offer a human review and a way to correct wrong data.")
      ]);
  } });

  /* ------------------------------------------------------------ Tools & checklist */
  TABS.push({ name: "🧰 Tools & Checklist", html: function () {
    return intro("Libraries, reading and a checklist for putting explainability into practice.") +
      grid([
        sec("🧰", "Tools", table(["Tool", "What it offers", "Good for"], [
          [link("https://shap.readthedocs.io", "SHAP"), "TreeSHAP, KernelSHAP, deep and linear explainers, many plots", "Local + global attribution"],
          [link("https://github.com/marcotcr/lime", "LIME"), "Tabular, text and image explainers", "Quick local explanations"],
          [link("https://scikit-learn.org/stable/modules/permutation_importance.html", "scikit-learn: permutation importance"), "<code>permutation_importance</code>", "Model-agnostic global importance"],
          [link("https://scikit-learn.org/stable/modules/partial_dependence.html", "scikit-learn: partial dependence"), "PDP, ICE, 2-D PDP", "Shape of effects"],
          [link("https://interpret.ml", "InterpretML (EBM)"), "Explainable Boosting Machines, dashboards, SHAP / LIME wrappers", "Glass-box models with high accuracy"],
          [link("https://github.com/interpretml/DiCE", "DiCE"), "Diverse counterfactual explanations", "“What would change the decision?”"],
          [link("https://captum.ai", "Captum"), "Attribution for PyTorch models", "Deep learning"],
          [link("https://learn.microsoft.com/azure/machine-learning/concept-responsible-ai-dashboard", "Azure ML Responsible AI dashboard"), "Error analysis, explanations, counterfactuals, fairness in one place", "Enterprise model reviews"],
          [link("https://fairlearn.org", "Fairlearn"), "Fairness metrics and mitigation", "Auditing explanations for bias"]]), "ex-wide"),
        sec("📚", "Further reading", ul([
          link("https://christophm.github.io/interpretable-ml-book/", "Molnar – Interpretable Machine Learning (free book)"),
          link("https://arxiv.org/abs/1705.07874", "Lundberg &amp; Lee (2017) – A Unified Approach to Interpreting Model Predictions (SHAP)"),
          link("https://arxiv.org/abs/1602.04938", "Ribeiro et al. (2016) – “Why Should I Trust You?” (LIME)"),
          link("https://arxiv.org/abs/1801.01489", "Fisher, Rudin &amp; Dominici – All Models are Wrong, but Many are Useful (permutation importance and model class reliance)")])),
        sec("⚠️", "Common mistakes", ul(["Trusting impurity importance without checking on held-out data.", "Explaining training rows and calling it generalisation.", "Ignoring correlated features (shuffling or averaging unrealistic combinations).", "Reading SHAP / PDP as causal effects.", "Showing technical plots to non-technical audiences.", "Running LIME once and believing it.", "Using explanations to pick features on the test set.", "Not versioning the explanation code with the model."])),
        sec("✅", "Checklist", ol(["Start with an interpretable baseline (logistic regression / small tree).", "Global view: permutation importance on held-out data + PDP / ICE for top features.", "Local view: SHAP waterfall for typical, borderline and wrong predictions.", "Cross-check two methods (e.g. SHAP and LIME, or MDI and permutation); investigate disagreements.", "Sanity-check directions with domain experts; look for leakage and proxy features.", "Translate the top reasons into plain language with a reviewed feature dictionary; add a what-if where feasible.", "State limits (estimate, not causal) and offer human review.", "Version model, data, explainer and messages; log explanations for audit."]), "ex-leak"),
        qa("How would you explain a gradient-boosting model to a risk committee?", "Show a global ranking from permutation importance on a test set, PDP / ICE for the top features to confirm sensible directions, SHAP examples for typical and borderline cases, fairness checks across groups, and the known limits (correlated features, not causal). Provide the simple logistic-regression baseline for comparison.")
      ]);
  } });

  window.EX_TABS = TABS;
})();
