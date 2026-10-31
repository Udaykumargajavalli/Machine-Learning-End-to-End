/* Content for the "Hyperparameter Tuning" chapter. Needs tuning-figures.js. Exposes window.HT_TABS. */
(function () {
  "use strict";
  var FIG = function (n) { return (window.HT_FIG && window.HT_FIG[n]) ? window.HT_FIG[n]() : ""; };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function ul(a) { return "<ul>" + a.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>"; }
  function ol(a) { return "<ol>" + a.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ol>"; }
  function p(s) { return "<p>" + s + "</p>"; }
  function sec(icon, title, body, cls) { return "<div class='ht-sec " + (cls || "") + "'><h4>" + icon + " " + title + "</h4>" + body + "</div>"; }
  function code(lines) { return "<pre class='ht-code'><code>" + esc(lines.join("\n")) + "</code></pre>"; }
  function fig(svg, cap) { return "<div class='ht-fig ht-wide'>" + svg + "<div class='ht-cap'>" + cap + "</div></div>"; }
  function table(head, rows) {
    return "<div class='ht-tablewrap'><table class='ht-table'><thead><tr>" + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") +
      "</tr></thead><tbody>" + rows.map(function (r) { return "<tr>" + r.map(function (c, i) { return "<td>" + (i === 0 ? "<b>" + c + "</b>" : c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  function pc(pros, cons) {
    return "<div class='ht-pc ht-wide'><div class='ht-pro'><h4>✅ Pros</h4>" + ul(pros) + "</div><div class='ht-con'><h4>⚠️ Cons</h4>" + ul(cons) + "</div></div>";
  }
  function intro(s) { return "<p class='ht-intro'>" + s + "</p>"; }
  function grid(parts) { return "<div class='ht-grid'>" + parts.join("") + "</div>"; }
  function qa(q, a) { return sec("🎤", "Interview question", "<p><b>" + q + "</b></p><p>" + a + "</p>", "ht-qa"); }

  var TABS = [];

  /* ------------------------------------------------------------------ Overview */
  TABS.push({ name: "🧭 Overview", html: function () {
    return intro("<b>Hyperparameter tuning</b> = systematically searching for the settings you choose <i>before</i> training (learning rate, tree depth, regularisation strength …) so that the model scores best on <b>unseen</b> data. Done well it adds a few points of quality; done carelessly it just overfits your validation set.") +
      grid([
        sec("🍰", "Everyday analogy", p("Baking: oven temperature and baking time are the <b>hyperparameters</b>; the texture of the cake is the result. You bake several small test cakes (<b>trials</b>), taste each (<b>validation</b>), then bake the big one with the best recipe. Hyperparameter tuning is the tasting-and-adjusting loop.")),
        sec("📌", "What you will learn", ul(["Parameters vs hyperparameters", "Grid Search", "Random Search", "Bayesian optimisation", "Cross-validation-based tuning", "Choosing the right search space", "Tools, pitfalls and a checklist"])),
        fig(FIG("workflow"), "The tuning workflow. The test set stays locked until step 6."),
        sec("📊", "Search strategies at a glance", table(
          ["Method", "How the next trial is chosen", "Cost", "Parallel?", "Best when", "Weak spot"],
          [["Manual", "Intuition and experience", "A handful", "No", "Quick first pass, an expert on the model", "Not reproducible"],
           ["Grid Search", "Every combination of the listed values", "∏ (values per hyperparameter)", "Yes", "≤ 3 hyperparameters, fast model", "Explodes with each new hyperparameter"],
           ["Random Search", "Independent random draws from distributions", "You choose n_iter", "Yes", "4+ hyperparameters, unknown which matter", "No learning from past trials"],
           ["Bayesian (GP / TPE)", "Model of past results picks the most promising point", "20 – 100 trials", "Limited", "Each trial is expensive", "Sequential; set-up overhead"],
           ["Successive Halving / Hyperband", "Many configs get a small budget, the best get more", "Cheap per config", "Yes", "Iterative models (boosting, neural nets), large spaces", "Needs a budget resource (epochs, samples)"],
           ["Evolutionary / PBT", "Population mutates and copies the best members", "Many", "Yes", "Deep learning with schedules", "Complex to set up"]]
        ), "ht-wide"),
        sec("🧭", "Which one should I use?", ol([
          "Establish a <b>baseline with default values</b> first – you need a score to beat.",
          "≤ 3 hyperparameters and a fast model → <b>Grid Search</b>.",
          "4+ hyperparameters, or you are not sure which matter → <b>Random Search</b> (the safe default).",
          "Each trial takes minutes or hours → <b>Bayesian optimisation</b> (Optuna).",
          "Iterative models and large spaces → add <b>early stopping / pruning / Halving</b>.",
          "Always score trials with <b>cross-validation on the training set</b>; touch the test set once."
        ])),
        sec("🎰", "How many trials is enough?", p("If the best 5 % of the space is what you want, each random trial hits it with probability 0.05. After n trials: P(at least one hit) = 1 − 0.95<sup>n</sup>.") +
          table(["Trials n", "P(≥ 1 trial in the top 5 %)"], [["14", "1 − 0.95<sup>14</sup> ≈ 51 %"], ["30", "1 − 0.95<sup>30</sup> ≈ 79 %"], ["60", "1 − 0.95<sup>60</sup> ≈ 95 %"], ["100", "1 − 0.95<sup>100</sup> ≈ 99.4 %"]]) +
          p("Rule of thumb: <b>30 – 100 random trials</b>, or about 10 × the number of hyperparameters for Bayesian optimisation.")),
        sec("🥇", "What to tune first", table(["Priority", "Examples", "Why"], [
          ["1 - Capacity / regularisation", "max_depth, alpha, C, min_samples_leaf, dropout", "Directly control under- vs overfitting"],
          ["2 - Learning speed", "learning_rate, n_estimators (with early stopping), epochs", "Large effect and they interact"],
          ["3 - Sampling", "subsample, colsample_bytree, max_features", "Reduce variance, speed up"],
          ["4 - Everything else", "tolerances, solver, batch size, seeds", "Usually small effect"]])),
        qa("Why not just use the default hyperparameters?", "Defaults are reasonable for an average dataset. Your data has its own size, noise and feature scale, so tuned values commonly improve the validation score – but always measure the gain against the default baseline, and stop when the gain is smaller than the noise (the std across CV folds).")
      ]);
  } });

  /* ------------------------------------------------------------------ Parameters vs hyperparameters */
  TABS.push({ name: "1 · Parameters vs Hyperparameters", html: function () {
    return intro("<b>Parameters</b> are the numbers a model <i>learns from data</i>. <b>Hyperparameters</b> are the settings <i>you choose</i> that control how the model is built and how it learns.") +
      grid([
        sec("💡", "What is the difference?", p("A hyperparameter is fixed <b>before</b> training starts and is not changed by the training loss. Parameters start from an initial guess and are <b>updated during training</b> until the loss is small. Hyperparameters therefore cannot be learned by gradient descent on the training data – they must be <b>searched</b> using validation performance.") +
          p("<b>Analogy:</b> studying for an exam. Hyperparameters = your study plan (hours per day, revision method). Parameters = the knowledge in your head after studying. The plan is chosen first; the knowledge is the outcome.")),
        sec("🔎", "Where do you see them in code?", ul(["Hyperparameters are <b>constructor arguments</b>: <code>Ridge(alpha=1.0)</code>, read with <code>model.get_params()</code>.", "Parameters are <b>fitted attributes ending in an underscore</b>: <code>coef_</code>, <code>intercept_</code>, <code>feature_importances_</code>, <code>tree_</code>.", "Deep learning: weights and biases are parameters; learning rate, batch size, number of layers are hyperparameters."])),
        fig(FIG("paramsVsHyper"), "Hyperparameters go in; the algorithm learns parameters from data; the validation score tells you whether to change the hyperparameters."),
        sec("⚖️", "Side-by-side comparison", table(["Aspect", "Parameters", "Hyperparameters"], [
          ["Who sets them", "The learning algorithm", "You, or a search algorithm"],
          ["When", "During training (updated every step / split)", "Before training starts"],
          ["Learned from", "Training data (minimise the training loss)", "Validation score (CV or hold-out)"],
          ["How many", "Few to billions", "Usually 2 – 20"],
          ["Examples", "Linear weights w and bias b · split thresholds and leaf values of a tree · neural-network weights", "learning_rate · alpha / C · max_depth · n_estimators · k in KNN · dropout · batch size · kernel"],
          ["Stored in the model", "Yes – saved with the fitted model", "Yes, as settings – but they define the model, not learned"],
          ["Effect", "Make predictions", "Control model capacity (bias–variance), speed and stability"]]), "ht-wide"),
        sec("🗂️", "Kinds of hyperparameters", table(["Kind", "Examples", "Typical direction"], [
          ["Model structure", "max_depth, num_leaves, hidden layers and units, kernel, k (KNN)", "↑ more complex → lower bias, higher variance"],
          ["Regularisation", "alpha, lambda, C, dropout, min_samples_leaf, weight_decay", "↑ alpha (↓ C) → simpler model"],
          ["Optimisation", "learning_rate, batch size, epochs, optimizer, momentum", "Controls speed and stability of learning"],
          ["Ensembling / sampling", "n_estimators, subsample, colsample_bytree, max_features", "More trees ≈ stable; sampling reduces variance"],
          ["Pipeline choices", "imputer strategy, PCA n_components, k in SelectKBest, text n-gram range", "Treated as hyperparameters of the whole pipeline"]]), "ht-wide"),
        sec("🧩", "Common hyperparameters per algorithm", table(["Algorithm", "Hyperparameters you usually tune"], [
          ["Ridge / Lasso / Elastic Net", "alpha, l1_ratio"],
          ["Logistic regression / SVM", "C (inverse strength), penalty; SVM: kernel, gamma"],
          ["k-NN", "n_neighbors, weights, metric"],
          ["Decision tree", "max_depth, min_samples_leaf, min_samples_split, ccp_alpha"],
          ["Random forest", "n_estimators, max_depth, max_features, min_samples_leaf"],
          ["Gradient boosting (XGBoost / LightGBM)", "learning_rate, n_estimators (early stopping), max_depth / num_leaves, subsample, colsample_bytree, reg_lambda"],
          ["Neural network", "learning_rate, batch_size, layers × units, dropout, weight_decay, epochs"]]), "ht-wide"),
        sec("🐍", "Code: see both in scikit-learn", code([
          "from sklearn.datasets import make_regression",
          "from sklearn.linear_model import Ridge",
          "from sklearn.tree import DecisionTreeRegressor",
          "",
          "X, y = make_regression(n_samples=200, n_features=3, noise=10, random_state=0)",
          "",
          "ridge = Ridge(alpha=1.0)              # alpha -> HYPERPARAMETER (you choose it)",
          "ridge.fit(X, y)",
          "print(ridge.get_params()['alpha'])    # hyperparameters are listed by get_params()",
          "print(ridge.coef_, ridge.intercept_)  # PARAMETERS: learned, names end with '_'",
          "",
          "tree = DecisionTreeRegressor(max_depth=3, random_state=0).fit(X, y)   # max_depth -> hyperparameter",
          "print(tree.tree_.node_count, tree.tree_.threshold[:3])                # thresholds -> parameters"
        ]), "ht-wide"),
        sec("🛡️", "Pitfalls", ul(["Picking hyperparameters by looking at the <b>test</b> score – the test set stops being an honest exam.", "Treating a <i>learned</i> number as a hyperparameter (e.g. tuning the intercept) or vice versa.", "Comparing models with different hyperparameter budgets – tune every candidate model with the same effort."]), "ht-leak"),
        qa("Is the number of trees in a random forest a parameter or a hyperparameter?", "A hyperparameter: you decide it before training. The split features, thresholds and leaf values inside each tree are the parameters learned from the data.")
      ]);
  } });

  /* ------------------------------------------------------------------ Grid search */
  TABS.push({ name: "2 · Grid Search", html: function () {
    return intro("<b>Grid Search</b> tries <i>every</i> combination of the values you list, scores each with cross-validation and keeps the best. Simple, exhaustive and reproducible – but the cost multiplies with every extra hyperparameter.") +
      grid([
        sec("💡", "What it is", p("You give a list of candidate values for each hyperparameter. The search takes the <b>Cartesian product</b> – every combination – so the candidates form a grid in hyperparameter space. Each cell is trained and validated, and the cell with the best mean CV score wins.") + p("In scikit-learn: <code>GridSearchCV</code>. It also supports a <i>list of grids</i> for conditional settings (e.g. <code>gamma</code> only matters for the RBF kernel).")),
        sec("⚙️", "How it works", ol(["Choose the hyperparameters and a short list of values for each (use a <b>log scale</b> for C, alpha, gamma, learning rate).", "Build all combinations: n<sub>1</sub> × n<sub>2</sub> × … × n<sub>d</sub>.", "For every combination run k-fold CV (k fits) and average the validation scores.", "Rank the combinations; <code>best_params_</code> = the highest mean score.", "Refit the best combination on the <b>whole training set</b> (<code>refit=True</code>).", "Score the refit model once on the untouched test set."])),
        fig(FIG("gridHeat"), "Grid search on two hyperparameters. The numbers are illustrative; the highlighted cell is the winner."),
        sec("🧮", "Worked example – cost explosion", p("Total fits = (number of combinations) × k folds (+ 1 final refit). Suppose one fit takes 2 seconds and k = 5:") +
          table(["Hyperparameters", "Values each", "Combinations", "Fits (× 5 folds)", "Time at 2 s / fit"], [
            ["3", "5", "5<sup>3</sup> = 125", "625", "≈ 21 min"], ["4", "5", "5<sup>4</sup> = 625", "3,125", "≈ 1.7 h"], ["5", "5", "5<sup>5</sup> = 3,125", "15,625", "≈ 8.7 h"]]) +
          p("This is the <i>curse of dimensionality</i>: adding one hyperparameter multiplies the time by the number of values you give it.")),
        sec("🐍", "Code: GridSearchCV in a Pipeline", code([
          "from sklearn.datasets import load_breast_cancer",
          "from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold",
          "from sklearn.pipeline import Pipeline",
          "from sklearn.preprocessing import StandardScaler",
          "from sklearn.svm import SVC",
          "import pandas as pd",
          "",
          "X, y = load_breast_cancer(return_X_y=True)",
          "X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)",
          "",
          "pipe = Pipeline([('scale', StandardScaler()), ('svc', SVC())])   # scaler is re-fitted inside every fold",
          "param_grid = {",
          "    'svc__C':     [0.1, 1, 10, 100],          # log-spaced values",
          "    'svc__gamma': [0.001, 0.01, 0.1, 1],      # 4 x 4 = 16 combinations",
          "}",
          "cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)",
          "grid = GridSearchCV(pipe, param_grid, cv=cv, scoring='roc_auc',",
          "                    n_jobs=-1, refit=True, return_train_score=True)",
          "grid.fit(X_train, y_train)                    # 16 x 5 = 80 fits + 1 refit",
          "",
          "print(grid.best_params_, round(grid.best_score_, 4))   # best CV score",
          "print(round(grid.score(X_test, y_test), 4))            # test set used ONCE",
          "top = pd.DataFrame(grid.cv_results_).sort_values('rank_test_score')",
          "print(top[['param_svc__C', 'param_svc__gamma', 'mean_train_score',",
          "          'mean_test_score', 'std_test_score']].head())"
        ]), "ht-wide"),
        sec("🔀", "Code: conditional grids and coarse → fine", code([
          "# A list of grids: gamma only exists for the RBF kernel",
          "param_grid = [",
          "    {'svc__kernel': ['linear'], 'svc__C': [0.1, 1, 10]},",
          "    {'svc__kernel': ['rbf'], 'svc__C': [0.1, 1, 10], 'svc__gamma': [0.01, 0.1, 1]},",
          "]                                  # 3 + 9 = 12 combinations (not 3 x 2 x 3 = 18)",
          "",
          "# Coarse -> fine: zoom in around the winner of the first (coarse) grid",
          "import numpy as np",
          "c0, g0 = grid.best_params_['svc__C'], grid.best_params_['svc__gamma']",
          "fine = {'svc__C':     np.logspace(np.log10(c0) - 0.5, np.log10(c0) + 0.5, 5),",
          "        'svc__gamma': np.logspace(np.log10(g0) - 0.5, np.log10(g0) + 0.5, 5)}",
          "grid2 = GridSearchCV(pipe, fine, cv=cv, scoring='roc_auc', n_jobs=-1).fit(X_train, y_train)"
        ]), "ht-wide"),
        sec("⚙️", "Settings of GridSearchCV itself", table(["Argument", "Meaning"], [
          ["param_grid", "Dict (or list of dicts) of hyperparameter → list of values"], ["cv", "Number of folds or a splitter (StratifiedKFold, GroupKFold, TimeSeriesSplit)"], ["scoring", "Metric to optimise (roc_auc, f1, neg_root_mean_squared_error …)"],
          ["refit", "Refit the best model on all training data (default True); use a metric name when scoring has several metrics"], ["n_jobs", "Parallel workers (-1 = all cores); grid search is embarrassingly parallel"], ["return_train_score", "Also report training scores to spot overfitting (slower)"]])),
        pc(["Exhaustive inside the grid – you never miss a listed combination", "Easy to understand, explain and reproduce", "Perfectly parallel", "Works with categorical and discrete values"],
          ["Cost grows exponentially with the number of hyperparameters", "Wastes trials: only a few distinct values of each important hyperparameter", "Result limited by the grid you chose – the true optimum may lie between points", "Poor for continuous hyperparameters"]),
        sec("🎯", "When to use it", ul(["≤ 3 hyperparameters and a model that trains in seconds.", "A <b>final fine-tuning</b> step in a small region found by random search.", "Categorical choices (kernel, penalty, solver) with few options."])),
        sec("🛡️", "Avoid data leakage", ul(["Put scaling, imputing, encoding and feature selection <b>inside the Pipeline</b> so they are re-fitted on each training fold.", "Grid search sees only <code>X_train</code>; the test set is scored <b>once</b> after <code>fit</code>.", "Use group / time-aware splitters for dependent rows.", "Do not widen the grid after looking at test performance."]), "ht-leak"),
        qa("Your grid search takes 10 hours. What do you do?", "Cut the grid: switch to random search or Bayesian optimisation, use a coarse grid first, drop unimportant hyperparameters, use fewer folds or a data subsample for exploration, and use Halving search or early stopping.")
      ]);
  } });

  /* ------------------------------------------------------------------ Random search */
  TABS.push({ name: "3 · Random Search", html: function () {
    return intro("<b>Random Search</b> draws hyperparameter values at random from distributions you define. Because usually only a few hyperparameters really matter, random trials explore <i>many different values</i> of the important ones and often beat grid search for the same budget.") +
      grid([
        sec("💡", "What it is", p("Instead of a fixed list of values you describe a <b>distribution</b> for each hyperparameter (uniform, log-uniform, integers, categories). The search samples <code>n_iter</code> random combinations, evaluates each with cross-validation and keeps the best. Bergstra &amp; Bengio (2012) showed that this is more efficient than grid search when the effective dimensionality is low.")),
        sec("⚙️", "How it works", ol(["Define a distribution for every hyperparameter (log-uniform for scale-type values).", "Choose the budget <code>n_iter</code> (number of trials), e.g. 30 – 100.", "Sample one value per hyperparameter → one random configuration.", "Cross-validate it and record the mean score.", "Repeat n_iter times; the best configuration wins and is refit on all training data.", "Optionally <b>narrow the ranges</b> around the best trials and search again."])),
        fig(FIG("gridVsRandom"), "Same budget of 9 trials. The orange curve is the score along the important hyperparameter: grid tests 3 values on it, random tests 9 and lands closer to the peak."),
        sec("🧮", "Worked example", p("Goal: land in the best 5 % of the space. Each random trial succeeds with probability 0.05, so after n trials P = 1 − 0.95<sup>n</sup>:") + ul(["n = 14 → 1 − 0.4877 ≈ <b>51 %</b>", "n = 60 → 1 − 0.0460 ≈ <b>95 %</b>"]) + p("A 3 × 3 grid has 9 trials but only 3 distinct values of the important hyperparameter; 9 random trials have 9 distinct values. That is why 60 random trials often match a grid with thousands of points.")),
        sec("🐍", "Code: RandomizedSearchCV with distributions", code([
          "from scipy.stats import loguniform, randint, uniform",
          "from sklearn.ensemble import HistGradientBoostingClassifier",
          "from sklearn.model_selection import RandomizedSearchCV",
          "",
          "param_dist = {",
          "    'learning_rate':     loguniform(1e-3, 0.3),   # log scale: equal chance per decade",
          "    'max_depth':         randint(2, 12),          # integers 2..11",
          "    'max_leaf_nodes':    randint(8, 64),",
          "    'min_samples_leaf':  randint(5, 60),",
          "    'l2_regularization': loguniform(1e-6, 10),",
          "}                                                # uniform(0.5, 0.5) would mean the range 0.5 .. 1.0",
          "",
          "search = RandomizedSearchCV(",
          "    HistGradientBoostingClassifier(random_state=0), param_dist,",
          "    n_iter=40, cv=5, scoring='roc_auc', n_jobs=-1, random_state=0)   # random_state -> reproducible",
          "search.fit(X_train, y_train)                    # 40 x 5 = 200 fits + 1 refit",
          "print(search.best_params_, round(search.best_score_, 4))"
        ]), "ht-wide"),
        sec("⚙️", "Settings of RandomizedSearchCV", table(["Argument", "Meaning"], [
          ["param_distributions", "Dict of hyperparameter → list (sampled uniformly) or a scipy.stats distribution"], ["n_iter", "Number of random configurations (the budget)"], ["random_state", "Seed so the same trials are drawn again"], ["cv, scoring, n_jobs, refit", "Same meaning as in GridSearchCV"]])),
        pc(["Cost is fixed by n_iter, independent of the number of hyperparameters", "Explores many distinct values of every hyperparameter", "Handles continuous, integer and categorical values naturally", "Trivially parallel; easy to add trials later"],
          ["Trials are independent – nothing is learned from earlier results", "No guarantee of finding a narrow optimum", "Needs sensible distributions (scale!) to work well", "Results vary with the seed – use enough trials"]),
        sec("🎯", "When to use it", ul(["4 or more hyperparameters, or you do not know which ones matter (<b>the default choice</b>).", "Mixed continuous and discrete spaces.", "As a <b>first stage</b> before a zoomed-in grid or Bayesian search."])),
        sec("🛡️", "Avoid data leakage", ul(["Same rules as grid search: preprocessing inside the Pipeline, search on the training set only.", "Fix <code>random_state</code> and the CV splits so different models are compared on identical folds.", "Do not re-run random search until the <i>test</i> score looks good – that tunes to the test set."]), "ht-leak"),
        qa("Why is random search often better than grid search?", "Usually only a few hyperparameters strongly affect the score. A grid repeats the same few values of those hyperparameters many times; random search tries a new value every trial, so it covers the important dimensions much better for the same number of fits.")
      ]);
  } });

  /* ------------------------------------------------------------------ Bayesian optimisation */
  TABS.push({ name: "4 · Bayesian Optimization", html: function () {
    return intro("<b>Bayesian optimisation</b> treats tuning as optimising an <i>expensive black-box function</i> (hyperparameters → validation score). It builds a cheap statistical model of that function from past trials and uses it to pick the next trial where improvement is most likely.") +
      grid([
        sec("💡", "What it is", p("Grid and random search ignore history. Bayesian optimisation is <b>sequential and model-based</b>: a <b>surrogate model</b> (Gaussian process, TPE or random forest) predicts the score <i>and its uncertainty</i> for any untried configuration. An <b>acquisition function</b> turns that into a single number that balances <b>exploitation</b> (go where the score looks high) and <b>exploration</b> (go where we know little).")),
        fig(FIG("boLoop"), "The Bayesian optimisation loop."),
        fig(FIG("boGP"), "A real 1-D example (computed in your browser). Four trials are done. The surrogate is uncertain in the wide gap, so expected improvement (green) puts the next trial there, where the unknown higher peak is."),
        sec("⚙️", "How it works", ol(["Run a few <b>random start-up trials</b> (e.g. 10) to get initial data.", "Fit the surrogate on all (configuration → score) pairs.", "Compute the acquisition function over many candidate configurations.", "Evaluate the configuration with the highest acquisition value (train + CV).", "Add the result to the history and repeat until the budget is used.", "Return the best configuration found; refit on all training data."])),
        sec("🧮", "Acquisition functions", code([
          "Probability of Improvement  PI(x) = Φ(Z)",
          "Expected Improvement        EI(x) = (μ − f* − ξ)·Φ(Z) + σ·φ(Z)    Z = (μ − f* − ξ) / σ",
          "Upper Confidence Bound      UCB(x) = μ + κ·σ",
          "",
          "μ, σ = surrogate mean / std at x   f* = best score so far",
          "Φ, φ = normal CDF / PDF            ξ, κ = exploration knobs (larger = explore more)"
        ]) + table(["Function", "Idea", "Note"], [["PI", "Chance of beating the best", "Greedy; ignores how big the gain is"], ["EI", "Expected size of the gain", "Most widely used"], ["UCB", "Optimistic estimate", "κ directly sets exploration"]])),
        sec("🔢", "Worked example – exploration wins", p("Best CV AUC so far f* = 0.82, ξ = 0.") +
          table(["Candidate", "μ", "σ", "Z", "EI"], [["A (well explored, good)", "0.84", "0.01", "2.0", "0.02 · 0.977 + 0.01 · 0.054 ≈ <b>0.0201</b>"], ["B (unexplored)", "0.80", "0.08", "−0.25", "−0.02 · 0.401 + 0.08 · 0.387 ≈ <b>0.0229</b>"]]) +
          p("B has a <i>lower</i> predicted score but is so uncertain that its expected improvement is higher, so Bayesian optimisation tries B next. That is exploration in action.")),
        sec("🧰", "Surrogate models", table(["Surrogate", "Idea", "Good for"], [
          ["Gaussian process (GP)", "Smooth function with an uncertainty band", "Few continuous hyperparameters (≲ 20), small number of trials"],
          ["TPE (Tree-structured Parzen Estimator)", "Model p(x | good) and p(x | bad); maximise their ratio", "Mixed, categorical and conditional spaces – default in Optuna and Hyperopt"],
          ["Random-forest surrogate", "Forest predicts mean and variance", "Categorical / conditional spaces (SMAC)"]])),
        sec("🐍", "Code: Optuna (TPE) with cross-validation", code([
          "import optuna",
          "from sklearn.ensemble import HistGradientBoostingClassifier",
          "from sklearn.model_selection import cross_val_score",
          "",
          "def objective(trial):",
          "    params = {",
          "        'learning_rate':     trial.suggest_float('learning_rate', 1e-3, 0.3, log=True),",
          "        'max_depth':         trial.suggest_int('max_depth', 2, 10),",
          "        'max_leaf_nodes':    trial.suggest_int('max_leaf_nodes', 8, 64),",
          "        'l2_regularization': trial.suggest_float('l2_regularization', 1e-6, 10, log=True),",
          "    }",
          "    model = HistGradientBoostingClassifier(**params, random_state=0)",
          "    return cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc').mean()",
          "",
          "study = optuna.create_study(direction='maximize',",
          "                            sampler=optuna.samplers.TPESampler(seed=0, n_startup_trials=10))",
          "study.optimize(objective, n_trials=40)          # 10 random start-up trials, then model-guided",
          "print(study.best_params, round(study.best_value, 4))"
        ]), "ht-wide"),
        sec("✂️", "Code: pruning bad trials early", code([
          "import numpy as np, optuna",
          "from sklearn.linear_model import SGDClassifier",
          "",
          "def objective(trial):                       # X_tr/X_val: scaled train and validation parts",
          "    alpha = trial.suggest_float('alpha', 1e-6, 1e-1, log=True)",
          "    clf = SGDClassifier(alpha=alpha, random_state=0)",
          "    for step in range(1, 21):",
          "        clf.partial_fit(X_tr, y_tr, classes=np.unique(y_tr))",
          "        score = clf.score(X_val, y_val)",
          "        trial.report(score, step)            # tell Optuna the intermediate score",
          "        if trial.should_prune():             # worse than the median of earlier trials",
          "            raise optuna.TrialPruned()       # stop wasting compute",
          "    return score",
          "",
          "study = optuna.create_study(direction='maximize', pruner=optuna.pruners.MedianPruner(n_warmup_steps=5))",
          "study.optimize(objective, n_trials=50)"
        ]), "ht-wide"),
        sec("⚙️", "Settings of the optimiser itself", table(["Setting", "Meaning"], [
          ["n_trials / timeout", "Budget in trials or seconds"], ["n_startup_trials", "Random trials before the model takes over (≈ 10 or 2 × dimensions)"], ["sampler", "TPE (default), GP, CMA-ES, random"],
          ["pruner", "Median / Successive-Halving / Hyperband – stop unpromising trials early"], ["ξ, κ", "Exploration strength of EI / UCB"], ["direction", "maximize (AUC, F1) or minimize (loss, RMSE)"]])),
        pc(["Far fewer trials than grid / random for the same quality", "Excellent when one trial takes minutes or hours", "Uses uncertainty to explore wisely", "TPE supports categorical and conditional hyperparameters"],
          ["Sequential by nature – harder to parallelise (batch / async variants exist)", "Surrogate overhead; GPs scale poorly beyond ~20 dimensions", "Noisy scores can mislead the surrogate – use CV or repeated CV", "Extra library and concepts to learn"]),
        sec("🎯", "When to use it", ul(["Expensive models: gradient boosting on big data, deep learning.", "A small budget (20 – 100 trials) and a smooth-ish score surface.", "Spaces with 5 – 20 hyperparameters, including conditional ones (TPE)."])),
        sec("🛡️", "Avoid data leakage", ul(["The <b>objective function</b> must do the cross-validation on training data only – never score the test set inside it.", "Build preprocessing inside the objective (Pipeline) so each trial re-fits it per fold.", "With many trials the best CV score is <b>optimistic</b>; report a fresh test score or use nested CV."]), "ht-leak"),
        qa("Why does Bayesian optimisation need fewer trials?", "It learns from every earlier trial: the surrogate predicts which regions are good or uncertain, so each new trial is chosen deliberately instead of blindly.")
      ]);
  } });

  /* ------------------------------------------------------------------ CV-based tuning */
  TABS.push({ name: "5 · Cross-validation Tuning", html: function () {
    return intro("Every search method needs a <b>fair score</b> for each candidate. <b>Cross-validation (CV)</b> gives a more reliable estimate than one validation split, because every training row is used for validation exactly once. The key discipline: <b>tune on training data with CV, report once on the test set</b>.") +
      grid([
        sec("💡", "Why CV when tuning?", p("A single validation split is noisy: the standard error of an accuracy estimate is about √(p(1 − p)/n). With p = 0.85 and n = 200 validation rows that is ≈ 2.5 points – as large as many differences between candidates. Averaging k folds reduces this noise and wastes no data.")),
        fig(FIG("cvFlow"), "Three candidates are each scored on the same 5 folds of the training set. The best is refit on all training data and finally scored once on the test set."),
        sec("⚙️", "How CV-based tuning works", ol(["Split off a <b>test set</b> first and lock it away.", "Split the training set into k folds (k = 5 or 10).", "For each candidate: train on k − 1 folds, validate on the remaining fold, repeat k times → mean ± std.", "Pick the candidate with the best mean (or the simplest one within one standard error).", "Refit it on <b>all</b> training data.", "Evaluate once on the test set and report that number."])),
        sec("🧮", "Worked example – counting the cost", ul(["12 candidates × 5 folds = 60 fits, + 1 refit = <b>61 fits</b>.", "Nested CV (outer 5, inner 3): 5 × (12 × 3 + 1) = <b>185 fits</b>.", "Fold scores 0.90, 0.92, 0.89, 0.91, 0.93 → mean <b>0.910</b>, std ≈ 0.016, standard error = 0.016 / √5 ≈ 0.007."])),
        sec("🔀", "Pick the right splitter", table(["Your data", "Use", "scikit-learn"], [
          ["Independent rows", "K-Fold", "KFold(5, shuffle=True)"], ["Classification, imbalanced classes", "Stratified K-Fold + an imbalance-aware metric", "StratifiedKFold(5, shuffle=True)"],
          ["Several rows per patient / user", "Group K-Fold", "GroupKFold(5)  + fit(..., groups=g)"], ["Time series", "Walk-forward split with a gap", "TimeSeriesSplit(5, gap=7)"],
          ["Small dataset, noisy scores", "Repeated CV", "RepeatedStratifiedKFold(5, n_repeats=3)"], ["Huge dataset or slow model", "One hold-out validation set (+ early stopping)", "train_test_split / PredefinedSplit"]]), "ht-wide"),
        sec("🐍", "Code: tune with CV, then test once", code([
          "from sklearn.model_selection import GridSearchCV, StratifiedKFold",
          "",
          "cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)",
          "search = GridSearchCV(pipe, param_grid, cv=cv, scoring='roc_auc', return_train_score=True)",
          "search.fit(X_train, y_train)                     # tuning uses TRAIN folds only",
          "",
          "res = pd.DataFrame(search.cv_results_)",
          "print(res[['mean_train_score', 'mean_test_score']].describe().loc[['mean', 'max']])  # train >> val = overfit",
          "print('CV  :', round(search.best_score_, 4))",
          "print('TEST:', round(search.score(X_test, y_test), 4))   # exactly once"
        ]), "ht-wide"),
        sec("🪆", "Code: nested CV for an honest estimate", code([
          "from sklearn.model_selection import cross_val_score",
          "",
          "inner = StratifiedKFold(3, shuffle=True, random_state=1)    # tunes hyperparameters",
          "outer = StratifiedKFold(5, shuffle=True, random_state=2)    # scores the whole procedure",
          "search = GridSearchCV(pipe, param_grid, cv=inner, scoring='roc_auc')",
          "nested = cross_val_score(search, X_train, y_train, cv=outer, scoring='roc_auc')",
          "print(nested.mean().round(3), '+/-', nested.std().round(3))  # unbiased by the tuning itself"
        ]), "ht-wide"),
        sec("📏", "Code: simplest model within 1 standard error", code([
          "import numpy as np",
          "res = pd.DataFrame(grid.cv_results_)",
          "i = res['mean_test_score'].idxmax()",
          "limit = res.loc[i, 'mean_test_score'] - res.loc[i, 'std_test_score'] / np.sqrt(5)",
          "ok = res[res['mean_test_score'] >= limit].sort_values('param_svc__C')   # smaller C = simpler",
          "print(ok.iloc[0][['param_svc__C', 'param_svc__gamma', 'mean_test_score']])"
        ]), "ht-wide"),
        sec("⏹️", "Early stopping = an inner validation set", p("For boosting and neural networks, <code>n_estimators</code> / epochs can be chosen automatically: training stops when a validation score stops improving. In scikit-learn: <code>HistGradientBoostingClassifier(early_stopping=True, validation_fraction=0.1, n_iter_no_change=10, max_iter=1000)</code>. Set the maximum high, tune the other hyperparameters, and let early stopping pick the number of rounds.")),
        sec("🎯", "Choosing a metric", ul(["Optimise the metric the business cares about (AUC, F1, recall at a precision, RMSE, MAPE).", "Several metrics? <code>scoring={'auc': 'roc_auc', 'f1': 'f1'}, refit='auc'</code> records both and refits on the one you name.", "Imbalanced classes: avoid plain accuracy."])),
        pc(["Reliable, low-variance estimate of each candidate", "Uses all training data for both fitting and validating", "Nested CV removes the optimism of tuning", "Works with every search method"],
          ["k times more fits", "Max of many noisy scores is optimistic without nesting", "Wrong splitter (random on grouped / time data) gives leaky, flattering scores", "Large k on big data is rarely worth the cost"]),
        sec("🛡️", "Avoid data leakage", ol(["<b>Split first.</b> Test set before any statistics are computed.", "All learning steps (imputer, scaler, encoder, selector, SMOTE) live in a <b>Pipeline</b> so each fold re-fits them.", "Use the same folds for every candidate (fixed random_state).", "Group / time-aware splitters when rows are dependent.", "Never tune on the test set; if you do, collect a new test set."]), "ht-leak"),
        qa("Your tuned model scores 0.91 in CV but 0.86 on the test set. Why?", "The best of many noisy CV scores is optimistically biased (selection bias), or leakage exists in preprocessing / splits. Use a Pipeline, the right splitter, fewer trials or a simpler search space, and report nested-CV or test performance.")
      ]);
  } });

  /* ------------------------------------------------------------------ Search space */
  TABS.push({ name: "6 · Choosing the Search Space", html: function () {
    return intro("The <b>search space</b> is the set of hyperparameters and the ranges (and scales) you let the search explore. A good space matters more than a fancy search algorithm: if the best value is outside it, no method can find it.") +
      grid([
        sec("💡", "Principles", ol(["<b>Choose few, important hyperparameters</b> – each extra dimension costs trials.", "<b>Pick the scale</b>: log for values that span orders of magnitude, linear otherwise.", "<b>Centre it on sensible values</b> (library defaults, papers, prior experience), wide enough to include the optimum.", "<b>Respect structure</b>: conditional hyperparameters (gamma only for RBF) and relations (learning_rate vs n_estimators).", "<b>Iterate</b>: broad and coarse first, then narrow around the best region.", "<b>Check the edges</b>: best values at the boundary mean the space is too small."])),
        fig(FIG("logScale"), "Twenty draws between 1e-4 and 1. With a linear (uniform) range nearly everything lands in the last decade; a log range covers all four decades."),
        sec("🧮", "Worked example – why scale matters", p("Learning rate in [1e-4, 1]:") + ul(["Uniform: P(value &lt; 0.01) = 0.01 / 1 = <b>1 %</b> – almost never tries small learning rates.", "Log-uniform: P(value &lt; 0.01) = (log<sub>10</sub>0.01 − log<sub>10</sub>10<sup>−4</sup>) / 4 = 2 / 4 = <b>50 %</b>."])),
        sec("📐", "Linear or log?", table(["Use a LOG scale for", "Use a LINEAR scale for"], [
          ["learning_rate, alpha, lambda, C, gamma, weight_decay, tolerance, min_child_weight", "max_depth, n_neighbors, subsample (0.5 – 1), colsample_bytree, dropout (0 – 0.5), l1_ratio"],
          ["Anything that is naturally multiplied (×2, ×10)", "Small integer counts, fractions, probabilities"]]), "ht-wide"),
        sec("📋", "Typical starting ranges (rules of thumb)", table(["Model", "Hyperparameter", "Range", "Scale"], [
          ["Ridge / Lasso", "alpha", "1e-4 – 1e2 (features scaled)", "log"], ["Logistic regression", "C", "1e-3 – 1e2", "log"], ["SVM (RBF)", "C · gamma", "1e-2 – 1e3 · 1e-4 – 1e1", "log · log"],
          ["k-NN", "n_neighbors · weights", "1 – 50 · uniform / distance", "int · categorical"], ["Decision tree", "max_depth · min_samples_leaf", "2 – 20 · 1 – 50", "int · int (log ok)"],
          ["Random forest", "max_depth · max_features · min_samples_leaf", "4 – 30 or None · sqrt / 0.3 – 1.0 · 1 – 20", "int · mixed · int"],
          ["XGBoost / LightGBM", "learning_rate · max_depth (num_leaves) · subsample · colsample_bytree", "0.01 – 0.3 · 3 – 10 (15 – 255) · 0.5 – 1.0 · 0.5 – 1.0", "log · int · linear · linear"],
          ["Neural network", "learning_rate · batch_size · units · dropout · weight_decay", "1e-5 – 1e-1 · 16 – 512 · 32 – 1024 · 0 – 0.5 · 1e-6 – 1e-2", "log · powers of 2 · powers of 2 · linear · log"]]), "ht-wide"),
        sec("🔗", "Interacting hyperparameters", ul(["<b>learning_rate × n_estimators</b>: a smaller learning rate needs more trees. Fix n_estimators large and use early stopping, then tune the rest.", "<b>C × gamma</b> (SVM): tune together; good values lie along a diagonal.", "<b>alpha × l1_ratio</b> (Elastic Net): search jointly.", "<b>max_depth × min_samples_leaf</b>: both limit complexity – avoid over-constraining."])),
        sec("🐍", "Code: a space for random search and for Optuna", code([
          "from scipy.stats import loguniform, randint",
          "",
          "# scikit-learn: distributions",
          "svc_space = {'svc__C': loguniform(1e-2, 1e3), 'svc__gamma': loguniform(1e-4, 1e1)}",
          "",
          "# Optuna: conditional space (gamma only exists for the RBF kernel)",
          "def objective(trial):",
          "    kernel = trial.suggest_categorical('kernel', ['linear', 'rbf'])",
          "    C = trial.suggest_float('C', 1e-2, 1e3, log=True)",
          "    gamma = trial.suggest_float('gamma', 1e-4, 1e1, log=True) if kernel == 'rbf' else 'scale'",
          "    model = make_pipeline(StandardScaler(), SVC(kernel=kernel, C=C, gamma=gamma))",
          "    return cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc').mean()"
        ]), "ht-wide"),
        sec("🔍", "Code: is the best value at the edge?", code([
          "import pandas as pd",
          "rs = RandomizedSearchCV(pipe, svc_space, n_iter=30, cv=5, scoring='roc_auc',",
          "                        n_jobs=-1, random_state=0).fit(X_train, y_train)",
          "res = pd.DataFrame(rs.cv_results_)",
          "for p in ['param_svc__C', 'param_svc__gamma']:",
          "    vals = res[p].astype(float)",
          "    top5 = res.nlargest(5, 'mean_test_score')[p].astype(float)",
          "    print(p, 'searched', vals.min(), '-', vals.max(), '| top-5 trials', top5.min(), '-', top5.max())",
          "# top-5 values touching the searched min or max?  ->  widen the space in that direction"
        ]), "ht-wide"),
        sec("🪜", "Progressive narrowing", table(["Round", "Method", "Space", "Goal"], [
          ["1", "Random, 30 – 60 trials", "Wide, log scales", "Find the promising region"], ["2", "Random or Bayesian, 30 trials", "Narrowed to the top-10 trials ± margin", "Refine"], ["3 (optional)", "Small grid", "Tight around the best", "Final polish"]])),
        pc(["A well-chosen space finds good models with far fewer trials", "Log scales and priors encode your knowledge", "Narrowing rounds save compute"],
          ["Too narrow: the optimum is excluded", "Too wide: trials are wasted on absurd values", "Too many dimensions: the budget is spread thin", "A wrong scale hides the good region"]),
        sec("🛡️", "Pitfalls and leakage", ul(["Do not shrink the space using <i>test</i> results – only CV / validation results.", "Keep the same preprocessing Pipeline across rounds.", "Remove hyperparameters that never change the score (flat in the plots).", "Record every space and its results (MLflow, W&amp;B) so rounds stay reproducible."]), "ht-leak"),
        qa("The best learning rate is the largest value in your range. What next?", "The optimum may be beyond the boundary: extend the range upward (on a log scale) and search again, while checking that training stays stable.")
      ]);
  } });

  /* ------------------------------------------------------------------ Tools & checklist */
  TABS.push({ name: "🧰 Tools & Checklist", html: function () {
    return intro("Libraries that implement these strategies, a bonus technique that saves compute (Halving), the most common mistakes and a checklist.") +
      grid([
        sec("🧰", "Tools and references", table(["Tool", "Strategies", "Good for"], [
          ["<a href='https://scikit-learn.org/stable/modules/grid_search.html' target='_blank' rel='noopener'>scikit-learn: GridSearchCV, RandomizedSearchCV, Halving*</a>", "Grid, random, successive halving", "Classical ML, Pipelines"],
          ["<a href='https://optuna.org' target='_blank' rel='noopener'>Optuna</a>", "TPE, GP, CMA-ES, pruning", "Any Python model, conditional spaces"],
          ["<a href='http://hyperopt.github.io/hyperopt/' target='_blank' rel='noopener'>Hyperopt</a>", "TPE, random", "Established Bayesian-style tuning"],
          ["<a href='https://scikit-optimize.github.io/stable/' target='_blank' rel='noopener'>scikit-optimize</a>", "Gaussian-process BayesSearchCV", "Small continuous spaces"],
          ["<a href='https://docs.ray.io/en/latest/tune/index.html' target='_blank' rel='noopener'>Ray Tune</a>", "ASHA, PBT, many search algorithms", "Distributed, large-scale deep learning"],
          ["<a href='https://keras.io/keras_tuner/' target='_blank' rel='noopener'>KerasTuner</a>", "Random, Bayesian, Hyperband", "Keras / TensorFlow models"],
          ["<a href='https://learn.microsoft.com/azure/machine-learning/how-to-tune-hyperparameters' target='_blank' rel='noopener'>Azure ML sweep jobs</a>", "Grid, random, Bayesian + early termination", "Managed cloud tuning"],
          ["<a href='https://docs.wandb.ai/guides/sweeps' target='_blank' rel='noopener'>Weights &amp; Biases Sweeps</a>", "Grid, random, Bayesian", "Experiment tracking + tuning"],
          ["<a href='https://mlflow.org' target='_blank' rel='noopener'>MLflow</a>", "Tracking (not a searcher)", "Logging every trial"]]), "ht-wide"),
        sec("📚", "Further reading", ul([
          "<a href='https://www.jmlr.org/papers/v13/bergstra12a.html' target='_blank' rel='noopener'>Bergstra &amp; Bengio (2012) – Random Search for Hyper-Parameter Optimization</a>",
          "<a href='https://arxiv.org/abs/1206.2944' target='_blank' rel='noopener'>Snoek, Larochelle &amp; Adams (2012) – Practical Bayesian Optimization of ML Algorithms</a>",
          "<a href='https://arxiv.org/abs/1603.06560' target='_blank' rel='noopener'>Li et al. (2016) – Hyperband</a>"])),
        sec("⏩", "Bonus: Successive Halving and Hyperband", p("Give <b>many</b> configurations a <b>small</b> budget (few samples, few epochs), keep the best 1/factor, give them more budget, repeat. It spends most compute on promising configs.") +
          code([
            "from sklearn.experimental import enable_halving_search_cv  # noqa  (still experimental)",
            "from sklearn.model_selection import HalvingRandomSearchCV",
            "",
            "halving = HalvingRandomSearchCV(",
            "    HistGradientBoostingClassifier(random_state=0), param_dist,",
            "    factor=3, resource='n_samples', max_resources='auto',   # budget = number of training rows",
            "    cv=5, scoring='roc_auc', random_state=0, n_jobs=-1)",
            "halving.fit(X_train, y_train)",
            "print(halving.best_params_, round(halving.best_score_, 4))"
          ]), "ht-wide"),
        sec("⚠️", "Common mistakes", ul([
          "<b>Tuning on the test set</b> – the final score is no longer honest.",
          "<b>Leakage</b>: scaling / encoding / selecting on all data before CV.",
          "<b>No baseline</b>: you cannot tell if tuning helped.",
          "<b>Wrong scale</b>: linear sampling of learning rate or C.",
          "<b>Wrong splitter</b>: random folds on grouped or time-ordered data.",
          "<b>Metric mismatch</b>: accuracy on imbalanced data.",
          "<b>Over-tuning</b>: chasing +0.1 % that is inside the CV noise.",
          "<b>Not logging</b> trials, seeds and data versions."])),
        sec("✅", "Checklist", ol([
          "Test set locked; metric and splitter chosen.",
          "Baseline with default hyperparameters recorded.",
          "Pipeline contains every preprocessing step.",
          "Search space: few important hyperparameters, correct scales, sensible ranges.",
          "Search strategy matches budget (grid ≤ 3 params · random · Bayesian · Halving).",
          "Scores by CV on the training set; train–validation gap checked.",
          "Best value not at the edge of a range; narrow / widen and repeat.",
          "Refit on all training data; evaluate on the test set once; compare with the baseline.",
          "Log everything; save the fitted Pipeline."]), "ht-leak"),
        qa("How do you know you have tuned enough?", "When extra trials stop improving the CV score by more than its noise (the fold-to-fold std / standard error), and the best configuration is inside the interior of the ranges. Beyond that, better features or more data beat more tuning.")
      ]);
  } });

  window.HT_TABS = TABS;
})();
