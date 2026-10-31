/* Content for the "Fixing overfitting" section of the Demo: Overfitting slide - regularization techniques.
   Types of overfitting: A variance / over-complex model, B too many noisy features, C unstable correlated
   coefficients, D overfitting the validation set, E optimistic validation from dependent data, F noisy estimate. */
(function () {
  var T = (window.OVERFIT_TECHNIQUES = window.OVERFIT_TECHNIQUES || []);

  T.push({
    g: "Regularization", id: "l1", name: "L1 (Lasso)", icon: "✂️",
    tag: "Penalise the sum of |weights| – shrinks weights and sets weak ones exactly to 0.",
    mech: {
      text: "Lasso adds a penalty proportional to the <b>absolute size</b> of every weight to the normal training loss. A weight only stays non-zero if the error it removes is worth more than the penalty it costs, so useless features are switched off. This is <b>feature selection built into training</b>.",
      formula: [
        "J(w) = MSE(w) + λ · Σ |w_j|        (intercept is not penalised)",
        "Orthonormal features: w_j = sign(w_ols) · max(|w_ols| − λ/2, 0)   ← soft-thresholding",
        "Logistic regression: C = 1/λ  (smaller C = stronger penalty)"
      ],
      steps: [
        "Standardise the features so one penalty λ treats every weight fairly.",
        "Minimise MSE + λΣ|w| (coordinate descent, because |w| has a kink at 0 and no ordinary gradient there).",
        "Each coordinate update is a soft-threshold: subtract λ/2 from the weight's size, and if that crosses zero, set it to exactly 0.",
        "Geometry: the constraint region Σ|w| ≤ t is a diamond with corners on the axes; the loss contours usually touch a corner, which means some weights are exactly 0.",
        "Bayesian view: L1 = a Laplace prior (\"most weights are probably exactly zero\")."
      ],
      example: "Three OLS weights are 3.0, 0.8 and −0.3 (orthonormal features, λ = 1 → threshold λ/2 = 0.5). Lasso gives <b>2.5, 0.3, 0</b>: every weight shrinks by 0.5 and the small one is removed."
    },
    types: [
      "<b>B – too many irrelevant / noisy features</b> (p close to or larger than n): the main use case.",
      "<b>A – over-complex linear model</b>: shrinks large weights that were fitted to noise.",
      "Only partly helps <b>C</b>: with correlated features Lasso arbitrarily keeps one and drops the others, so the chosen set can change between samples."
    ],
    hyper: [
      ["alpha (λ) / C", "Overall strength. alpha ↑ → more zeros. Search on a log grid, e.g. 1e-4 … 1e1. In logistic regression / SVM use C = 1/λ."],
      ["max_iter, tol", "Coordinate-descent budget and stopping tolerance; raise max_iter if you see ConvergenceWarning."],
      ["fit_intercept", "Keep True; the intercept is never penalised."],
      ["selection ('cyclic' / 'random')", "Order of coordinate updates; 'random' can converge faster on wide data."],
      ["Feature scale", "Not a parameter, but essential: standardise first, otherwise the penalty depends on units."],
      ["Solver / penalty", "LogisticRegression(penalty='l1', solver='saga' or 'liblinear')."]
    ],
    effect: [
      "<b>Training error rises</b> smoothly as λ grows (λ = 0 is plain least squares; very large λ sets every weight to 0 and predicts the mean).",
      "<b>Validation error is U-shaped</b>: falls at first because noise features vanish, then rises as real signal is removed (underfitting).",
      "The <b>train–validation gap shrinks</b> as λ increases; the best λ sits near the minimum of the validation curve.",
      "The number of non-zero weights drops step by step along the 'regularisation path'."
    ],
    helps: [
      "Many features and few rows (p ≫ n), most of them useless.",
      "You want a <b>sparse, explainable</b> model or an automatic feature filter.",
      "The true relationship really is sparse (a few strong drivers)."
    ],
    hurts: [
      "Strongly correlated features: it keeps one at random and the selection is unstable.",
      "Many small true effects: it zeroes real signal.",
      "It <b>biases</b> large weights downward (shrinkage); can select at most n features when p &gt; n.",
      "Unscaled features: the penalty hits large-unit features unfairly."
    ],
    tune: [
      "Put <code>StandardScaler</code> + <code>Lasso</code> in a Pipeline.",
      "Use <code>LassoCV</code> (or GridSearchCV) with a log-spaced alpha grid and 5–10-fold CV; it reuses warm starts along the path so it is fast.",
      "Pick alpha at the <b>minimum validation error</b>, or the largest alpha within 1 standard error of it (the \"1-SE rule\") for a simpler model.",
      "Plot mean CV error and the number of non-zero weights against alpha; check the path is not at the edge of the grid.",
      "Check stability: refit on bootstrap samples and keep features chosen in most of them."
    ],
    leak: [
      "Fit the scaler and the Lasso <b>only on training folds</b> – keep both inside one Pipeline so cross-validation does it for you.",
      "Do not run Lasso on the full dataset to \"pick features\" and then cross-validate a second model on those features – that leaks labels into validation.",
      "Choose alpha with CV on the training set; report on a test set used <b>once</b>, or use nested CV for an honest estimate.",
      "Time series / grouped rows: use TimeSeriesSplit / GroupKFold in the CV."
    ],
    code: [
      "from sklearn.pipeline import make_pipeline",
      "from sklearn.preprocessing import StandardScaler",
      "from sklearn.linear_model import LassoCV",
      "from sklearn.model_selection import train_test_split",
      "",
      "X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0)",
      "model = make_pipeline(StandardScaler(),",
      "                      LassoCV(alphas=None, cv=5, random_state=0))  # alpha grid chosen automatically",
      "model.fit(X_tr, y_tr)                         # scaler + alpha search use TRAIN only",
      "lasso = model[-1]",
      "print('best alpha', lasso.alpha_, '| non-zero weights', (lasso.coef_ != 0).sum())",
      "print('train R2', model.score(X_tr, y_tr), '| test R2', model.score(X_te, y_te))"
    ].join("\n")
  });

  T.push({
    g: "Regularization", id: "l2", name: "L2 (Ridge)", icon: "⛰️",
    tag: "Penalise the sum of squared weights – shrinks all weights smoothly, rarely to exactly 0.",
    mech: {
      text: "Ridge adds λ times the <b>sum of squared weights</b> to the loss. Large weights are punished much more than small ones, so the model spreads its reliance across features instead of leaning on a few huge coefficients. Because the penalty is smooth, weights get <b>small but almost never exactly 0</b>.",
      formula: [
        "J(w) = MSE(w) + λ · Σ w_j²",
        "Closed form: w = (XᵀX + n·λ·I)⁻¹ Xᵀ y      (adding to the diagonal keeps it invertible)",
        "Orthonormal features: w_j = w_ols / (1 + λ)",
        "SVD view: direction i is shrunk by d_i² / (d_i² + nλ) – weak directions shrink most"
      ],
      steps: [
        "Standardise the features.",
        "Add λ to the diagonal of XᵀX (or use gradient descent with an extra term 2λw in the gradient – this is <b>weight decay</b> in neural nets).",
        "Solve for w. Highly correlated features no longer make the matrix near-singular, so their weights stop exploding in opposite directions.",
        "Geometry: the constraint region Σw² ≤ t is a circle/sphere – no corners, so no exact zeros.",
        "Bayesian view: L2 = a Gaussian prior (\"weights are probably small\")."
      ],
      example: "Same OLS weights 3.0, 0.8, −0.3 with λ = 1: Ridge divides by (1 + λ) = 2 → <b>1.5, 0.4, −0.15</b>. Nothing is removed, everything is shrunk by the same factor. Two near-duplicate features with OLS weights +50 and −48 become about +1 and +1."
    },
    types: [
      "<b>A – over-complex / high-variance model</b>: large weights that wiggle to fit noise (e.g. high-degree polynomials).",
      "<b>C – unstable coefficients from correlated features</b>: the classic fix for multicollinearity.",
      "Helps <b>B</b> only mildly – it down-weights noisy features but keeps them all."
    ],
    hyper: [
      ["alpha (λ) / C", "Strength. alpha ↑ → smaller weights, simpler model. Log grid, e.g. 1e-3 … 1e3. For logistic regression / SVM, C = 1/λ."],
      ["solver", "'auto', 'svd', 'cholesky', 'lsqr', 'sag' … – affects speed and conditioning, not the model definition."],
      ["fit_intercept", "Keep True; the intercept is not penalised."],
      ["weight_decay (neural nets)", "Same idea in PyTorch/Keras optimisers. With Adam prefer <code>AdamW</code> (decoupled decay)."],
      ["Feature scale", "Standardise first, otherwise the penalty depends on the units."]
    ],
    effect: [
      "<b>Training error rises slightly</b> as λ grows; the fit is a little worse on the data it has seen.",
      "<b>Validation error falls first, then rises</b>: shrinking noisy weights removes variance, too much shrinkage adds bias.",
      "The <b>train–validation gap narrows</b>; the optimum is usually a fairly broad, flat minimum, so Ridge is forgiving about λ.",
      "Coefficients on collinear features become stable from one resample to the next."
    ],
    helps: [
      "Correlated predictors (multicollinearity); many features that each carry a little signal.",
      "More features than rows, when you do not need to drop columns.",
      "Neural networks and any model trained by gradient descent (weight decay)."
    ],
    hurts: [
      "You need a <b>sparse</b> or easily explained model – all features stay in.",
      "Few true drivers among many junk features: noise features keep small non-zero weights.",
      "Unscaled features, or one-hot columns with very different frequencies, get penalised unevenly.",
      "Too large λ → underfitting (high bias)."
    ],
    tune: [
      "Pipeline: <code>StandardScaler</code> → <code>Ridge</code>.",
      "<code>RidgeCV(alphas=np.logspace(-3, 3, 25))</code> uses an efficient leave-one-out shortcut; or GridSearchCV / cross_val_score with 5–10 folds.",
      "Choose the alpha with the lowest mean validation error; with a flat minimum take the larger alpha (simpler model).",
      "Plot a validation curve: train score and CV score versus alpha (log axis) and look for where they meet.",
      "For a neural net tune weight_decay (e.g. 1e-6 … 1e-2) on a validation set together with learning rate."
    ],
    leak: [
      "Scaler and Ridge are fitted <b>inside each training fold only</b> (Pipeline).",
      "Never standardise the whole dataset before splitting – the mean/std would contain validation information.",
      "Tune alpha on validation/CV data; keep the test set for a single final evaluation, or use nested CV.",
      "Use GroupKFold / TimeSeriesSplit when rows are not independent."
    ],
    code: [
      "import numpy as np",
      "from sklearn.pipeline import make_pipeline",
      "from sklearn.preprocessing import StandardScaler",
      "from sklearn.linear_model import RidgeCV",
      "from sklearn.model_selection import train_test_split",
      "",
      "X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0)",
      "model = make_pipeline(StandardScaler(),",
      "                      RidgeCV(alphas=np.logspace(-3, 3, 25)))   # efficient LOO-CV inside",
      "model.fit(X_tr, y_tr)",
      "print('best alpha', model[-1].alpha_)",
      "print('train R2', model.score(X_tr, y_tr), '| test R2', model.score(X_te, y_te))"
    ].join("\n")
  });

  T.push({
    g: "Regularization", id: "enet", name: "Elastic Net", icon: "🕸️",
    tag: "Blend of L1 and L2 – sparse like Lasso, stable with correlated features like Ridge.",
    mech: {
      text: "Elastic Net minimises the loss plus <b>both</b> penalties. It has two dials: the <b>overall strength</b> (λ, called <code>alpha</code> in scikit-learn) and the <b>mixing ratio ρ</b> (<code>l1_ratio</code>) between L1 and L2. The L2 part makes correlated features share weight (the \"grouping effect\"); the L1 part still removes useless ones.",
      formula: [
        "J(w) = MSE(w) + λ · [ ρ · Σ|w_j| + (1 − ρ) · Σ w_j² ]      0 ≤ ρ ≤ 1",
        "ρ = 1 → Lasso      ρ → 0 → Ridge",
        "Orthonormal features: w_j = soft-threshold(w_ols, λρ/2) / (1 + λ(1 − ρ))",
        "scikit-learn: (1/2n)‖y − Xw‖² + α·ρ‖w‖₁ + α(1 − ρ)/2·‖w‖²"
      ],
      steps: [
        "Standardise the features.",
        "Choose ρ (how sparse vs how smooth) and λ (how strong).",
        "Coordinate descent: each update soft-thresholds (L1 part) and then divides by an L2 shrink factor.",
        "Correlated features enter or leave together instead of one being picked at random.",
        "Geometry: the constraint region is a diamond with rounded corners – still sparse, but more stable."
      ],
      example: "OLS weights 3.0, 0.8, −0.3 with λ = 1, ρ = 0.8: threshold = λρ/2 = 0.4, divisor = 1 + 1·0.2 = 1.2 → <b>(3.0−0.4)/1.2 = 2.17, (0.8−0.4)/1.2 = 0.33, 0</b>. Lasso (ρ = 1) would give 2.5, 0.3, 0 and Ridge (ρ = 0) would give 1.5, 0.4, −0.15."
    },
    types: [
      "<b>B – many noisy features</b> and <b>C – correlated features</b> at the same time (typical of genomics, text, wide tabular data).",
      "<b>A – over-complex linear models</b>: shrinks weights like Ridge.",
      "Removes the Lasso limitation of keeping at most n features when p &gt; n."
    ],
    hyper: [
      ["alpha (λ)", "Overall strength of the combined penalty. Larger → simpler model. Log grid."],
      ["l1_ratio (ρ)", "Mix: 1 = pure Lasso (sparse), 0 = pure Ridge (dense). Common grid: [0.1, 0.5, 0.7, 0.9, 0.95, 0.99, 1]. Use values near 1 when you expect sparsity."],
      ["max_iter, tol", "Convergence controls."],
      ["Feature scale", "Standardise first."],
      ["Interaction", "alpha and l1_ratio interact – tune them together in a 2-D grid, not one after the other."]
    ],
    effect: [
      "<b>Training error rises</b> with alpha, a bit more slowly than for Lasso at the same sparsity.",
      "<b>Validation error is U-shaped in alpha</b> for every ρ; the best ρ shifts the whole curve down when features are correlated.",
      "Gap between train and validation shrinks; selected feature sets are <b>more stable</b> across resamples than Lasso's.",
      "Non-zero count is between that of Ridge (all) and Lasso (fewest)."
    ],
    helps: [
      "Groups of correlated features where you still want some zeros.",
      "p ≫ n with a sparse-ish signal.",
      "When you cannot decide between Lasso and Ridge – tuning ρ decides for you."
    ],
    hurts: [
      "Two hyper-parameters → bigger search, more CV cost and a little more selection-bias risk.",
      "Still needs scaling and a linear-model assumption.",
      "Very small n: noisy CV makes the (alpha, ρ) choice unreliable.",
      "Extra shrinkage can bias the large weights further."
    ],
    tune: [
      "Pipeline: StandardScaler → ElasticNetCV.",
      "<code>ElasticNetCV(l1_ratio=[.1,.5,.7,.9,.95,.99,1], cv=5)</code> searches an alpha path for each ratio; or use GridSearchCV over alpha and l1_ratio.",
      "Compare mean CV error across the grid; choose the best or the simplest model within 1 standard error.",
      "Check the winning ρ is not stuck at a boundary (0 or 1); if it is, a simpler model (Ridge/Lasso) is enough.",
      "For an honest estimate of the tuned model, wrap the search in an outer CV loop (nested CV)."
    ],
    leak: [
      "Scaler, imputer and ElasticNet all live in one Pipeline and are fitted on training folds only.",
      "Search over (alpha, ρ) using only training data; touch the test set once at the very end.",
      "Do not use the non-zero coefficients to pre-filter features on the whole dataset before CV.",
      "Respect group / time structure with GroupKFold / TimeSeriesSplit."
    ],
    code: [
      "from sklearn.pipeline import make_pipeline",
      "from sklearn.preprocessing import StandardScaler",
      "from sklearn.linear_model import ElasticNetCV",
      "from sklearn.model_selection import train_test_split",
      "",
      "X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0)",
      "enet = ElasticNetCV(l1_ratio=[.1, .5, .7, .9, .95, .99, 1], cv=5, random_state=0)",
      "model = make_pipeline(StandardScaler(), enet).fit(X_tr, y_tr)   # train only",
      "print('alpha', enet.alpha_, '| l1_ratio', enet.l1_ratio_)",
      "print('non-zero', (enet.coef_ != 0).sum(), 'of', X_tr.shape[1])",
      "print('train R2', model.score(X_tr, y_tr), '| test R2', model.score(X_te, y_te))"
    ].join("\n")
  });
})();
