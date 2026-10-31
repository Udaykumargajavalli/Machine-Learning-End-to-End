/* Content for the "Fixing overfitting" section - train/validation/test split and cross-validation variants. */
(function () {
  var T = (window.OVERFIT_TECHNIQUES = window.OVERFIT_TECHNIQUES || []);

  T.push({
    g: "Validation", id: "holdout", name: "Train / Validation / Test", icon: "🧪",
    tag: "Hold out data the model never trains on, so you can see overfitting and tune without cheating.",
    mech: {
      text: "Split the data into three disjoint parts. The <b>training set</b> fits the model's parameters, the <b>validation set</b> compares models and tunes hyperparameters (it is 'seen' only through your decisions), and the <b>test set</b> gives one final, unbiased score. It does not stop a model from overfitting by itself – it <b>measures</b> overfitting through the gap between training and validation scores.",
      formula: [
        "Typical split: 60 / 20 / 20  or  70 / 15 / 15  (or 80 / 20, then CV inside the 80)",
        "Overfitting gap = score_train − score_validation",
        "Std. error of an accuracy estimate ≈ √( p(1 − p) / n_val )"
      ],
      steps: [
        "Shuffle (or stratify by class; or sort by time) and cut the data into train / validation / test.",
        "Fit each candidate model / hyperparameter setting on train only.",
        "Score on validation; pick the best setting.",
        "Optionally refit the chosen setting on train + validation.",
        "Score on test <b>once</b> and report that number."
      ],
      example: "10,000 rows → 6,000 train / 2,000 validation / 2,000 test. A deep tree scores 100% on train but 78% on validation → overfitting (gap 22 pts). Limiting depth gives 88% train / 86% validation → healthy. With p = 0.85 and n_val = 200 the standard error is √(0.85·0.15/200) ≈ <b>2.5 points</b>, so differences smaller than that are just noise."
    },
    types: [
      "<b>Detects A and B</b> (too complex / too many features) – it is the diagnostic, not the cure.",
      "<b>D – overfitting the validation set</b>: the separate test set exposes it when you tuned too many times.",
      "<b>F – a single lucky/unlucky split</b> is a weakness – this is why cross-validation exists."
    ],
    hyper: [
      ["test_size / val_size", "Share of rows held out. Bigger holdouts → more reliable score but less training data."],
      ["stratify", "Keep class proportions the same in every part (classification, especially imbalanced)."],
      ["shuffle / random_state", "Shuffle for i.i.d. data; <b>no shuffle</b> (cut by time) for time series. Fix the seed for reproducibility."],
      ["Group / time awareness", "Keep all rows of one patient/user together, or put the latest period in test."]
    ],
    effect: [
      "<b>Training score</b> is optimistic and keeps improving as the model gets more complex.",
      "<b>Validation score</b> improves, peaks, then falls – the point where it peaks is the sweet spot.",
      "A large <b>train ≫ validation</b> gap = overfitting; both low = underfitting.",
      "If you tune many times, even the validation score becomes optimistic – the untouched <b>test score will be lower</b>."
    ],
    helps: [
      "Large datasets: cheap (one fit per setting) and simple.",
      "Slow models (deep nets) where K-fold is too expensive.",
      "Final unbiased reporting."
    ],
    hurts: [
      "Small datasets: little data left to learn from and a very noisy score.",
      "Rare classes: validation may contain almost none.",
      "Dependent rows (patients, time): a random split leaks and flatters the score.",
      "Re-using the same validation set for dozens of experiments overfits it."
    ],
    tune: [
      "Make the validation set large enough for the precision you need (use the standard-error formula).",
      "Compare settings by validation score; treat differences below ~1 standard error as ties and prefer the simpler model.",
      "Plot a <b>validation curve</b> (score vs. a complexity knob) and a <b>learning curve</b> (score vs. training size) to see whether more data or more regularisation helps.",
      "Limit the number of tuning rounds, or move to cross-validation / nested CV when data is small.",
      "After choosing, refit on train + validation, then evaluate once on test."
    ],
    leak: [
      "<b>Split first</b>, before imputing, scaling, encoding, feature selection or resampling.",
      "Fit every preprocessing step on the training part only, then only <i>transform</i> validation and test (Pipeline).",
      "Remove duplicates before splitting; keep groups together; split time series chronologically.",
      "Never peek at the test set while tuning; if you do, collect a new test set.",
      "Oversample (SMOTE) only the training part."
    ],
    code: [
      "from sklearn.model_selection import train_test_split",
      "from sklearn.pipeline import make_pipeline",
      "from sklearn.preprocessing import StandardScaler",
      "from sklearn.linear_model import LogisticRegression",
      "",
      "X_tmp, X_test, y_tmp, y_test = train_test_split(X, y, test_size=0.20, stratify=y, random_state=0)",
      "X_tr, X_val, y_tr, y_val = train_test_split(X_tmp, y_tmp, test_size=0.25, stratify=y_tmp, random_state=0)  # 60/20/20",
      "",
      "for C in [0.01, 0.1, 1, 10]:",
      "    m = make_pipeline(StandardScaler(), LogisticRegression(C=C, max_iter=1000)).fit(X_tr, y_tr)",
      "    print(C, 'train', round(m.score(X_tr, y_tr), 3), 'val', round(m.score(X_val, y_val), 3))",
      "# pick best C on VAL, refit on train+val, then score X_test exactly once"
    ].join("\n")
  });

  T.push({
    g: "Validation", id: "kfold", name: "K-Fold CV", icon: "🔁",
    tag: "Split into k folds; each fold is the validation set once. Average the k scores.",
    mech: {
      text: "Cross-validation re-uses the data: the training set is cut into <b>k equal folds</b>. For each fold, train on the other k−1 folds and validate on the held-out one. Every row is used for validation exactly once and for training k−1 times, giving a more stable estimate than a single split.",
      formula: [
        "CV score = (1/k) · Σ score_i          Spread = std(score_1 … score_k)",
        "Each model trains on (k−1)/k of the data  (k = 5 → 80 %, k = 10 → 90 %)",
        "Cost = k model fits per setting"
      ],
      steps: [
        "Shuffle and split the training data into k folds (k = 5 or 10 is the usual choice).",
        "For i = 1…k: fit on all folds except i, score on fold i.",
        "Report mean ± std of the k scores.",
        "Repeat for each candidate hyperparameter setting; choose the best mean.",
        "Refit the chosen setting on all training data."
      ],
      example: "100 rows, k = 5 → 5 models, each trained on 80 rows and validated on 20. Fold accuracies 0.82, 0.86, 0.80, 0.84, 0.83 → <b>0.83 ± 0.02</b>. Every row was validated exactly once."
    },
    types: [
      "<b>F – noisy single-split estimate</b>: averaging over folds reduces luck.",
      "<b>A / B</b>: reveals overfitting via train-vs-validation fold scores (cross_validate with return_train_score) and selects the regularisation strength.",
      "Does not fix <b>D</b> (validation overfitting) or <b>E</b> (dependent rows) – see nested / group / time-series CV."
    ],
    hyper: [
      ["n_splits (k)", "Small k (3–5): faster, more pessimistic bias (less training data). Large k (10): less bias, more cost. 5 or 10 is the default."],
      ["shuffle", "True for i.i.d. rows; the default is False, so shuffle if your file is ordered."],
      ["random_state", "Seed for the shuffle so results are reproducible."],
      ["scoring", "Metric to average (accuracy, F1, ROC-AUC, neg RMSE …); must match the business goal."]
    ],
    effect: [
      "<b>Training score per fold</b> stays high for flexible models; the validation folds show the honest score.",
      "The <b>mean CV score</b> is slightly pessimistic (each model sees only (k−1)/k of the data).",
      "A large <b>std across folds</b> means an unstable model or too little data.",
      "Regularisation or simpler models raise the CV mean and shrink the train–CV gap."
    ],
    helps: [
      "Small / medium datasets where a single holdout is too noisy.",
      "Comparing models or tuning hyperparameters reliably.",
      "i.i.d. tabular data with balanced classes."
    ],
    hurts: [
      "k times the compute – painful for deep nets or huge data.",
      "Imbalanced classes (use stratified) or grouped / time-ordered data (use group / time CV).",
      "Tuning a large grid on the same folds slowly overfits the CV score."
    ],
    tune: [
      "Start with k = 5 (or 10 for small data). If the std is large or the dataset tiny, use more folds or repeats.",
      "Use <code>GridSearchCV / RandomizedSearchCV(cv=KFold(...))</code> on the training set to choose hyperparameters; take the best mean, or the simplest within 1 std.",
      "Look at <code>mean_train_score − mean_test_score</code> across the grid to see where overfitting starts.",
      "Keep a separate test set for the final score."
    ],
    leak: [
      "All preprocessing (impute, scale, encode, select, resample) must be inside a <b>Pipeline</b> so it is re-fitted in every training fold.",
      "Never scale/impute/select on the full data and then run CV.",
      "Split off the test set <b>before</b> any CV; CV runs only on the training part.",
      "SMOTE/oversampling only inside the training folds (imblearn Pipeline)."
    ],
    code: [
      "from sklearn.model_selection import KFold, cross_validate",
      "from sklearn.pipeline import make_pipeline",
      "from sklearn.preprocessing import StandardScaler",
      "from sklearn.linear_model import Ridge",
      "",
      "cv = KFold(n_splits=5, shuffle=True, random_state=0)",
      "model = make_pipeline(StandardScaler(), Ridge(alpha=1.0))   # scaler re-fitted in every fold",
      "res = cross_validate(model, X_train, y_train, cv=cv, scoring='r2', return_train_score=True)",
      "print('train', res['train_score'].mean().round(3))",
      "print('valid', res['test_score'].mean().round(3), '+/-', res['test_score'].std().round(3))"
    ].join("\n")
  });

  T.push({
    g: "Validation", id: "strat", name: "Stratified K-Fold", icon: "⚖️",
    tag: "K-Fold that keeps the class ratio the same in every fold – the default for classification.",
    mech: {
      text: "Stratified K-Fold builds each fold so that it contains <b>about the same proportion of every class</b> as the full dataset. Plain K-Fold can, by bad luck, give a fold with few or no minority examples, making that fold's score meaningless.",
      formula: [
        "For class c with n_c rows: each fold gets ≈ n_c / k rows of that class",
        "Fold class share ≈ overall class share (e.g. 5 % positives in every fold)",
        "Score = mean of k fold scores (same as K-Fold)"
      ],
      steps: [
        "Sort / group the rows by class label.",
        "Deal the rows of each class evenly across the k folds.",
        "Train on k−1 folds, validate on the remaining one; repeat k times.",
        "Average the k scores."
      ],
      example: "100 rows with 5 positives, k = 5: stratified gives <b>exactly 1 positive per fold</b>. Plain K-Fold can give one fold 3 positives and another 0, where recall/AUC cannot even be computed."
    },
    types: [
      "<b>F – noisy / unreliable estimates</b> caused by class imbalance in the folds.",
      "Makes the detection of <b>A / B</b> overfitting trustworthy for rare-class problems.",
      "Does not address groups, time or validation-set overfitting."
    ],
    hyper: [
      ["n_splits", "Must not exceed the number of rows of the rarest class (e.g. 5 positives → at most 5 folds)."],
      ["shuffle, random_state", "Shuffle inside classes; fix the seed."],
      ["scoring", "Use imbalance-aware metrics: F1, PR-AUC, ROC-AUC, balanced accuracy – not plain accuracy."],
      ["Variants", "RepeatedStratifiedKFold, StratifiedShuffleSplit, StratifiedGroupKFold (classes + groups)."]
    ],
    effect: [
      "Training scores look the same as in K-Fold.",
      "<b>Validation scores have lower variance</b> between folds, because each fold has the same difficulty.",
      "Metrics for the rare class become defined and comparable fold to fold.",
      "Reveals overfitting to the majority class (high train recall, poor validation recall)."
    ],
    helps: [
      "Any classification task, especially imbalanced or multi-class with rare classes.",
      "Small datasets where a rare class may vanish from a fold."
    ],
    hurts: [
      "Regression (no classes – bin the target first if you want stratification).",
      "Grouped data: it can put the same patient/user in train and validation (use StratifiedGroupKFold).",
      "Time series: stratified shuffling breaks the order."
    ],
    tune: [
      "Use it as the default <code>cv</code> for classifiers in GridSearchCV (an integer cv for classifiers is already stratified).",
      "Choose k so the rarest class has at least ~10 rows per fold when possible; otherwise reduce k or add repeats.",
      "Pick hyperparameters by the mean of an imbalance-aware metric; compare the train and validation scores of the minority class."
    ],
    leak: [
      "Stratification only uses the <b>labels</b> to assign rows to folds; all learning steps still happen inside each training fold.",
      "Resample (SMOTE / class weights) inside the training folds only – never before building folds.",
      "Put scalers, encoders and selectors in a Pipeline.",
      "Keep the test set separate and stratified too."
    ],
    code: [
      "from sklearn.model_selection import StratifiedKFold, cross_val_score",
      "from sklearn.pipeline import make_pipeline",
      "from sklearn.preprocessing import StandardScaler",
      "from sklearn.linear_model import LogisticRegression",
      "",
      "cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)",
      "model = make_pipeline(StandardScaler(), LogisticRegression(class_weight='balanced', max_iter=1000))",
      "scores = cross_val_score(model, X_train, y_train, cv=cv, scoring='average_precision')",
      "print(scores.round(3), scores.mean().round(3))"
    ].join("\n")
  });

  T.push({
    g: "Validation", id: "repeated", name: "Repeated K-Fold", icon: "🎰",
    tag: "Run K-Fold several times with different shuffles and average everything.",
    mech: {
      text: "Repeated K-Fold performs the whole k-fold procedure <b>R times</b>, each with a fresh random partition, and averages all k × R scores. This removes the dependence on one particular way of cutting the data and gives a better estimate of both the mean and its uncertainty.",
      formula: [
        "Score = (1 / (k·R)) · Σ_{r=1..R} Σ_{i=1..k} score_{r,i}",
        "Cost = k × R fits per setting",
        "Std. error shrinks roughly like 1/√R for the split-randomness part"
      ],
      steps: [
        "Choose k (5 or 10) and the number of repeats R (3–10).",
        "For each repeat r, shuffle with seed r and run k-fold.",
        "Collect all k·R validation scores.",
        "Report the mean and std (or a confidence interval)."
      ],
      example: "k = 5, R = 3 → 15 fits and 15 scores. Single 5-fold gave 0.83 on one seed and 0.86 on another; the repeated mean is <b>0.845 ± 0.02</b>, a number you can trust more."
    },
    types: [
      "<b>F – high variance of the estimate</b> on small datasets.",
      "Gives a steadier basis for comparing models, so you are less likely to chase noise (a mild guard against <b>D</b>).",
      "Does not help with grouped / time-dependent leakage."
    ],
    hyper: [
      ["n_splits (k)", "Folds per repeat, usually 5 or 10."],
      ["n_repeats (R)", "More repeats → steadier estimate but R× the cost. 3–10 is typical."],
      ["random_state", "Seeds the sequence of repeat shuffles."],
      ["Variant", "RepeatedStratifiedKFold for classification."]
    ],
    effect: [
      "Training scores per fit look like K-Fold's; nothing changes in how complex the model is.",
      "The <b>mean validation score barely moves</b> but its <b>variance drops</b>.",
      "Makes small differences between models visible (or shows that they are not real).",
      "Scores from different repeats are correlated (same data), so the effective sample size is smaller than k·R."
    ],
    helps: [
      "Small data, where the result changes with the random seed.",
      "Careful model comparison and reporting a confidence interval."
    ],
    hurts: [
      "Slow models: R times the cost of K-Fold.",
      "Does not remove bias: if your CV protocol leaks, repeating it just repeats the leak.",
      "Large data: a single K-Fold is already stable."
    ],
    tune: [
      "Increase R until the mean stops moving in the 2nd decimal.",
      "Use it for the <b>final comparison of 2–3 finalists</b> rather than for a big grid search (to limit cost).",
      "Compare models on the same splits (same random_state) – a paired comparison is more sensitive."
    ],
    leak: [
      "Same rules as K-Fold: preprocessing inside a Pipeline, test set held out before the repeated CV.",
      "Use identical splits for all models, but never reuse the final test set across repeats.",
      "Do not average repeats first and then pick features/hyperparameters on the averaged data."
    ],
    code: [
      "from sklearn.model_selection import RepeatedStratifiedKFold, cross_val_score",
      "from sklearn.pipeline import make_pipeline",
      "from sklearn.preprocessing import StandardScaler",
      "from sklearn.linear_model import LogisticRegression",
      "",
      "cv = RepeatedStratifiedKFold(n_splits=5, n_repeats=5, random_state=0)   # 25 fits",
      "model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))",
      "s = cross_val_score(model, X_train, y_train, cv=cv, scoring='roc_auc')",
      "print(s.mean().round(3), '+/-', s.std().round(3), 'over', len(s), 'scores')"
    ].join("\n")
  });

  T.push({
    g: "Validation", id: "loo", name: "Leave-One-Out / Leave-P-Out", icon: "1️⃣",
    tag: "Extreme K-Fold: validate on a single row (or p rows) at a time.",
    mech: {
      text: "Leave-One-Out CV (LOOCV) is K-Fold with <b>k = n</b>: each row is the validation set once and the model trains on the other n−1 rows. Leave-P-Out validates on every possible subset of p rows. Because training sets are almost the full data, the estimate has very <b>low bias</b>, but the n training sets overlap almost completely, so the estimate can have <b>high variance</b>.",
      formula: [
        "LOOCV score = (1/n) · Σ loss(y_i , ŷ_(−i))      ŷ_(−i) = prediction without row i",
        "Leave-P-Out: C(n, p) splits (n = 20, p = 2 → 190)",
        "Linear / Ridge shortcut: e_(−i) = e_i / (1 − h_ii)   (h_ii = leverage) – no refitting needed"
      ],
      steps: [
        "For i = 1…n: remove row i, fit the model on the other n−1 rows.",
        "Predict row i and record the error.",
        "Average the n errors (n = number of fits).",
        "For Leave-P-Out repeat for every subset of p rows (usually only feasible for very small n and p)."
      ],
      example: "n = 30 rows → 30 fits, each on 29 rows. For Ridge you can get all 30 errors from one fit with e_i/(1−h_ii): a point with residual 2.0 and leverage 0.5 has LOO error <b>2.0 / 0.5 = 4.0</b>, showing that high-leverage points are hard to predict."
    },
    types: [
      "<b>F – unreliable estimate on tiny datasets</b> where every row counts.",
      "Detects <b>A / B</b> overfitting and tunes λ for linear models cheaply (RidgeCV uses LOO).",
      "Not for <b>D</b>, <b>E</b>: it still leaks if rows are dependent (one patient with many rows)."
    ],
    hyper: [
      ["p (Leave-P-Out)", "Rows left out each time; the number of splits explodes combinatorially."],
      ["scoring", "LOOCV validation sets have 1 row, so score per row (error) and average; metrics like R²/AUC are undefined per fold."],
      ["Alternative", "K-Fold with k = 10–20 often matches LOOCV at a fraction of the cost."]
    ],
    effect: [
      "<b>Training performance</b> in each fit ≈ the full-data model (n−1 rows).",
      "<b>Validation estimate has the lowest bias</b> (almost no pessimism from less data).",
      "But the fits are highly correlated, so the average can have <b>high variance</b> and be sensitive to outliers.",
      "Unstable models (e.g. 1-NN, deep trees) give erratic LOO errors."
    ],
    helps: [
      "Very small datasets (tens to a few hundred rows).",
      "Linear models with a closed-form LOO shortcut (Ridge, OLS, Gaussian processes, KNN).",
      "Deterministic: no random splits."
    ],
    hurts: [
      "n fits: far too slow for large data or heavy models.",
      "High-variance estimate; poor for model selection with noisy data.",
      "Unsuitable for classification with imbalanced classes (a one-row fold has no class balance) and for grouped / time data."
    ],
    tune: [
      "Use <code>RidgeCV</code> (efficient LOO) to choose alpha, or <code>cross_val_score(cv=LeaveOneOut())</code> for other cheap models.",
      "Score with a per-row metric (neg MSE, log-loss) and average; for accuracy-type metrics compute the overall accuracy from the pooled predictions.",
      "If it is too slow or noisy, switch to repeated 10-fold."
    ],
    leak: [
      "The left-out row must not influence anything: scalers, imputers and selectors are re-fitted on the n−1 training rows (Pipeline).",
      "If one entity has several rows, leaving out one row still leaves its siblings in training → use LeaveOneGroupOut.",
      "Keep a final test set if you have enough data; with tiny data prefer nested CV for the final estimate."
    ],
    code: [
      "from sklearn.model_selection import LeaveOneOut, cross_val_predict",
      "from sklearn.pipeline import make_pipeline",
      "from sklearn.preprocessing import StandardScaler",
      "from sklearn.linear_model import Ridge",
      "from sklearn.metrics import mean_squared_error",
      "",
      "model = make_pipeline(StandardScaler(), Ridge(alpha=1.0))      # scaler re-fitted on n-1 rows each time",
      "pred = cross_val_predict(model, X, y, cv=LeaveOneOut())       # n fits, 1 prediction each",
      "print('LOOCV RMSE', mean_squared_error(y, pred) ** 0.5)"
    ].join("\n")
  });

  T.push({
    g: "Validation", id: "shuffle", name: "Shuffle-Split (Monte Carlo CV)", icon: "🎲",
    tag: "Many random train/validation splits of any size you choose; folds may overlap.",
    mech: {
      text: "ShuffleSplit repeats the simple holdout <b>n_splits times</b>: each time it draws a fresh random train and validation subset with the sizes <i>you</i> choose. Unlike K-Fold, validation sets can overlap and some rows may never be validated, but you control the number of splits and the train/validation ratio independently.",
      formula: [
        "For s = 1…S: draw random train (1 − t)·n rows and validation t·n rows",
        "Score = (1/S) · Σ score_s",
        "Cost = S fits per setting"
      ],
      steps: [
        "Pick S (number of splits) and the validation fraction t (e.g. 0.2).",
        "For each split, shuffle, take t·n rows for validation and the rest (or train_size·n) for training.",
        "Fit on train, score on validation.",
        "Average the S scores; examine their spread."
      ],
      example: "n = 1,000, t = 0.2, S = 10 → 10 models, each trained on 800 rows and validated on 200 random rows. Mean accuracy 0.874, std 0.012. A given row appears in validation about 10 × 0.2 = <b>2 times on average</b>, but some rows may appear 0 times."
    },
    types: [
      "<b>F – noisy single-split estimate</b>, when K-Fold's fixed k and ratio are inconvenient.",
      "Detects <b>A / B</b> overfitting via the train–validation gap, on large data where only a few splits are affordable.",
      "Does not solve <b>D</b> or <b>E</b> by itself."
    ],
    hyper: [
      ["n_splits (S)", "Number of random splits; more → steadier mean, more cost."],
      ["test_size / train_size", "Validation and training fractions or counts; can leave rows unused (train + test &lt; 1)."],
      ["random_state", "Seeds the draws."],
      ["Variant", "StratifiedShuffleSplit (class-balanced), GroupShuffleSplit (keeps groups together)."]
    ],
    effect: [
      "<b>Training score</b> depends on train_size: less training data → lower training and validation scores.",
      "<b>Validation score</b> is an average over random subsets; its spread shows how split-dependent the model is.",
      "Because validation sets overlap, the S scores are correlated and the std slightly underestimates real uncertainty."
    ],
    helps: [
      "Large datasets where you want 10–20 % validation and only a few fits.",
      "Learning curves: vary train_size with a fixed validation fraction.",
      "Custom ratios that K-Fold cannot give (e.g. 90 % validation of a small train set)."
    ],
    hurts: [
      "Some rows may never be validated and others many times – a slightly less efficient use of data than K-Fold.",
      "Not appropriate for time series or grouped rows without the group-aware variant.",
      "Overlapping validation sets inflate confidence in small differences."
    ],
    tune: [
      "Choose S large enough that the mean stabilises (10–30).",
      "Choose t so each validation set is big enough for the metric precision you need.",
      "Use it inside GridSearchCV(cv=ShuffleSplit(...)) for hyperparameters; for the final comparison use repeated K-Fold if affordable."
    ],
    leak: [
      "Preprocessing inside a Pipeline so it is re-fitted on each random training subset.",
      "Use GroupShuffleSplit when rows share an entity; split by time when order matters.",
      "Keep a separate test set that is never part of any ShuffleSplit draw."
    ],
    code: [
      "from sklearn.model_selection import StratifiedShuffleSplit, cross_val_score",
      "from sklearn.pipeline import make_pipeline",
      "from sklearn.preprocessing import StandardScaler",
      "from sklearn.ensemble import RandomForestClassifier",
      "",
      "cv = StratifiedShuffleSplit(n_splits=10, test_size=0.2, random_state=0)",
      "model = make_pipeline(StandardScaler(), RandomForestClassifier(max_depth=6, random_state=0))",
      "s = cross_val_score(model, X_train, y_train, cv=cv)",
      "print(s.mean().round(3), '+/-', s.std().round(3))"
    ].join("\n")
  });

  T.push({
    g: "Validation", id: "group", name: "Group K-Fold", icon: "👥",
    tag: "Keep all rows of the same entity (patient, user, device, store) in the same fold.",
    mech: {
      text: "When rows are not independent – several rows per patient, user, house or image source – a random split puts siblings on both sides and the model simply <b>recognises the entity</b>. Group K-Fold assigns whole groups to folds, so validation always contains entities the model has never seen, which mimics real deployment on new patients/users.",
      formula: [
        "Folds are built from groups: every group appears in exactly one validation fold",
        "Group sizes are balanced across folds (GroupKFold) – no shuffling by default",
        "k ≤ number of groups.  LeaveOneGroupOut: k = number of groups"
      ],
      steps: [
        "Create a <code>groups</code> array (patient id, user id …), same length as the rows.",
        "Assign each group, as a whole, to one of k folds.",
        "Train on rows of the other groups; validate on the held-out groups.",
        "Average the k scores. Use StratifiedGroupKFold if you also need class balance."
      ],
      example: "1,000 scans from 50 patients (20 each). Random 5-fold puts each patient in both train and validation: accuracy <b>0.97</b> (model memorised patient quirks). GroupKFold keeps 10 patients entirely out in each fold: accuracy <b>0.78</b>, the honest number for a new patient."
    },
    types: [
      "<b>E – optimistic validation from dependent / duplicated rows</b> (group leakage). This is the main use.",
      "Reveals hidden <b>A</b> overfitting: models that memorise entity-specific noise look perfect under random CV and poor under group CV.",
      "Also protects <b>D</b> indirectly because tuning follows honest scores."
    ],
    hyper: [
      ["n_splits (k)", "At most the number of groups; use 5–10 when there are many groups."],
      ["groups", "The identifier column – the most important 'hyperparameter'; choose the unit you must generalise to (user, site, hospital)."],
      ["Variant", "StratifiedGroupKFold (class ratio + groups), LeaveOneGroupOut, GroupShuffleSplit, LeavePGroupsOut."],
      ["shuffle (StratifiedGroupKFold)", "Optionally shuffle group assignment with random_state."]
    ],
    effect: [
      "<b>Training score</b> is unchanged (still optimistic).",
      "<b>Validation score drops</b> compared with random K-Fold – that drop is the leakage you were hiding.",
      "Fold scores vary more, because each fold holds out different entities (with few groups this is large).",
      "Model ranking can change: simpler, entity-agnostic models win."
    ],
    helps: [
      "Multiple rows per patient, customer, device, document, session; repeated measures; images from the same video.",
      "Any task where the model will see <b>new entities</b> in production."
    ],
    hurts: [
      "Few groups (e.g. 5 hospitals): k is limited and scores are noisy.",
      "Very unequal group sizes → unbalanced folds.",
      "Forgetting to pass <code>groups=</code> silently falls back to non-group behaviour in some APIs.",
      "If production does see the same entities again, it is too pessimistic."
    ],
    tune: [
      "Pass <code>groups</code> to <code>cross_val_score / GridSearchCV.fit(..., groups=g)</code>.",
      "Pick k ≤ number of groups; with &lt; 10 groups use LeaveOneGroupOut.",
      "Select hyperparameters by group-CV scores; compare with random-CV – a big gap is evidence of leakage.",
      "For imbalanced classes use StratifiedGroupKFold."
    ],
    leak: [
      "Define groups by what must not be shared between train and validation (patient, not scan).",
      "Make the final test set group-disjoint as well (<code>GroupShuffleSplit</code>).",
      "Fit preprocessing and group-level aggregate features (e.g. user mean) inside training folds only.",
      "Check for duplicate entities hiding under different ids."
    ],
    code: [
      "from sklearn.model_selection import GroupKFold, cross_val_score",
      "from sklearn.pipeline import make_pipeline",
      "from sklearn.preprocessing import StandardScaler",
      "from sklearn.ensemble import RandomForestClassifier",
      "",
      "# groups[i] = patient id of row i",
      "cv = GroupKFold(n_splits=5)",
      "model = make_pipeline(StandardScaler(), RandomForestClassifier(random_state=0))",
      "s = cross_val_score(model, X_train, y_train, groups=groups_train, cv=cv)",
      "print('group CV', s.mean().round(3))   # compare with plain KFold to measure the leakage"
    ].join("\n")
  });

  T.push({
    g: "Validation", id: "ts", name: "Time-Series Split", icon: "⏳",
    tag: "Walk-forward validation: always train on the past and validate on the future.",
    mech: {
      text: "With time-ordered data, random folds let the model train on the future and predict the past – an impossible situation in production. <b>TimeSeriesSplit</b> uses <b>expanding</b> (or rolling) training windows: each validation block comes strictly <i>after</i> its training block. This respects causality and measures how the model copes with <b>drift</b>.",
      formula: [
        "Fold i: train on [0 … t_i), validate on [t_i + gap … t_i + gap + h)",
        "Default test block size h = n // (n_splits + 1)",
        "gap = rows skipped between train and validation (label horizon); max_train_size → rolling window"
      ],
      steps: [
        "Sort the rows by time (never shuffle).",
        "Create n_splits increasing cut-off points.",
        "For each cut-off: train on everything before it, validate on the next block.",
        "Average the scores and look at the trend over folds (are later periods worse?).",
        "Final model: refit on all data up to the test period."
      ],
      example: "12 months, n_splits = 3 → block size 12 // 4 = 3: <b>fold 1</b> train months 1–3 → validate 4–6; <b>fold 2</b> train 1–6 → validate 7–9; <b>fold 3</b> train 1–9 → validate 10–12. The earliest months are never validated."
    },
    types: [
      "<b>E – look-ahead / temporal leakage</b>: the main purpose.",
      "<b>A – overfitting to a past regime</b>: shows degradation under drift.",
      "<b>D</b> when combined with a final, later, untouched test period."
    ],
    hyper: [
      ["n_splits", "Number of walk-forward folds (3–10). More folds → smaller early training windows."],
      ["test_size", "Length of each validation block (e.g. the forecast horizon)."],
      ["gap", "Rows dropped between train and validation to avoid leakage from overlapping labels/lag features (e.g. a 7-day target → gap ≥ 7)."],
      ["max_train_size", "Cap for a rolling window (forget old regimes); None = expanding window."]
    ],
    effect: [
      "<b>Training score</b> is high on the past; <b>validation score is typically lower</b> than under random CV, because the future differs.",
      "Early folds have little training data → worse scores; later folds are better or worse depending on drift.",
      "A downward trend of fold scores signals concept drift; a rolling window may help."
    ],
    helps: [
      "Forecasting, demand, finance, sensor and log data, churn with timestamps.",
      "Any problem where the model predicts the future from the past."
    ],
    hurts: [
      "Few time points or strong seasonality that needs full-year windows.",
      "Small early folds make the first scores noisy.",
      "Not suitable for i.i.d. data (wastes early rows) or panel data without handling entities (combine with groups or custom splits)."
    ],
    tune: [
      "Set <code>test_size</code> to the real forecast horizon and <code>gap</code> to the label / feature look-ahead length.",
      "Compare expanding vs rolling windows (<code>max_train_size</code>) in the search.",
      "Use <code>GridSearchCV(cv=TimeSeriesSplit(...))</code>; inspect the score per fold, not just the mean.",
      "Reserve the <b>most recent period</b> as the final test set."
    ],
    leak: [
      "Compute lags, rolling means, target encodings and scalers using only data <b>before</b> each validation block (inside the Pipeline or per fold).",
      "Never shuffle; never fit imputers or scalers on the whole series.",
      "Use a gap equal to the prediction horizon so labels do not overlap.",
      "Ensure features are available at prediction time (no future info)."
    ],
    code: [
      "from sklearn.model_selection import TimeSeriesSplit, cross_val_score",
      "from sklearn.pipeline import make_pipeline",
      "from sklearn.preprocessing import StandardScaler",
      "from sklearn.ensemble import HistGradientBoostingRegressor",
      "",
      "# rows MUST be sorted by time",
      "cv = TimeSeriesSplit(n_splits=5, test_size=30, gap=7)   # 30-day blocks, 7-day gap",
      "model = make_pipeline(StandardScaler(), HistGradientBoostingRegressor())",
      "s = cross_val_score(model, X_sorted, y_sorted, cv=cv, scoring='neg_mean_absolute_error')",
      "print(s.round(2))   # look at the trend across folds"
    ].join("\n")
  });

  T.push({
    g: "Validation", id: "nested", name: "Nested CV", icon: "🪆",
    tag: "CV inside CV: the inner loop tunes, the outer loop gives an honest score for the whole tuning procedure.",
    mech: {
      text: "If you tune hyperparameters with CV and then report that same best CV score, the number is <b>optimistically biased</b> – you picked the maximum of many noisy scores. Nested CV separates the two jobs: an <b>inner loop</b> selects hyperparameters on each outer training set, and an <b>outer loop</b> scores the selected model on data the inner loop never saw. It estimates the performance of the <i>whole procedure</i> “tune + fit”.",
      formula: [
        "Outer: for each of k_out folds → inner search on the outer-train part",
        "Inner: k_in-fold CV over the grid → best setting → refit on outer-train",
        "Score the refit model on the outer-validation fold; average over k_out",
        "Cost = k_out × (k_in × |grid| + 1) fits"
      ],
      steps: [
        "Outer split: 5 folds. Hold out fold j as outer-validation.",
        "On the other 4 folds run GridSearchCV with 3-fold inner CV.",
        "Refit the best setting on those 4 folds; score on fold j.",
        "Repeat for j = 1…5 and average the 5 outer scores = estimate of generalisation.",
        "For the deployed model run one last search on <b>all</b> training data."
      ],
      example: "Outer 5 × inner 3 × grid of 10 settings = 5 × (3×10 + 1) = <b>155 fits</b>. The inner best-CV score was 0.91 (optimistic); the outer score is <b>0.88 ± 0.02</b> – the honest figure to report."
    },
    types: [
      "<b>D – overfitting the validation set / selection bias</b> from extensive tuning. This is its purpose.",
      "Lets you compare very different pipelines (Lasso vs forest) fairly, including how well each was tuned.",
      "Use group / time variants of the outer and inner splitters to also cover <b>E</b>."
    ],
    hyper: [
      ["Outer n_splits (k_out)", "Usually 5; sets the number of performance estimates."],
      ["Inner n_splits (k_in)", "Usually 3–5; used for the search."],
      ["Search space / strategy", "GridSearchCV or RandomizedSearchCV (n_iter) – the bigger it is, the more nesting matters."],
      ["Splitters", "Same type as the data requires: Stratified / Group / TimeSeries in both loops."],
      ["scoring, refit, n_jobs", "Metric to optimise; refit the best model each time; parallelise the outer loop."]
    ],
    effect: [
      "Nested does not change the final model; it changes the <b>estimate</b>.",
      "<b>Inner CV score ≥ outer score</b>; the difference is the optimism from tuning.",
      "Training performance of each inner model is unchanged; the outer validation score is the unbiased estimate.",
      "A large inner/outer gap means the search space is too big for the data – simplify or regularise."
    ],
    helps: [
      "Small / medium datasets with extensive tuning.",
      "Fair comparison of different algorithms or feature-selection procedures.",
      "Reporting results in a paper or a business case."
    ],
    hurts: [
      "Computationally heavy (hundreds of fits).",
      "Unnecessary if you have plenty of data and a dedicated, untouched test set.",
      "It only estimates performance; it does not give a tuned model unless you rerun the search on all data."
    ],
    tune: [
      "Keep the grid modest (or use RandomizedSearchCV); use 3-fold inner and 5-fold outer to control cost.",
      "Use <code>n_jobs=-1</code> in the outer <code>cross_val_score</code>.",
      "Report the mean and std of the outer scores; look at which hyperparameters each outer fold chose – if they vary a lot the choice is unstable.",
      "Final model: run the inner search once on all training data and keep the held-out test set for a last check."
    ],
    leak: [
      "All preprocessing / feature selection / resampling lives in the Pipeline that is <b>inside</b> the inner search.",
      "Outer-validation rows must never be used by the inner search – that is the whole point of the nesting.",
      "Use the same splitter family (group / time) for both loops.",
      "Do not tune again after seeing outer scores and then report them as unbiased."
    ],
    code: [
      "from sklearn.model_selection import GridSearchCV, KFold, cross_val_score",
      "from sklearn.pipeline import Pipeline",
      "from sklearn.preprocessing import StandardScaler",
      "from sklearn.linear_model import ElasticNet",
      "",
      "pipe = Pipeline([('sc', StandardScaler()), ('en', ElasticNet(max_iter=10000))])",
      "grid = {'en__alpha': [0.01, 0.1, 1, 10], 'en__l1_ratio': [0.2, 0.5, 0.8, 1.0]}",
      "inner = KFold(3, shuffle=True, random_state=1)",
      "outer = KFold(5, shuffle=True, random_state=2)",
      "search = GridSearchCV(pipe, grid, cv=inner, scoring='r2')          # inner loop: tuning",
      "scores = cross_val_score(search, X_train, y_train, cv=outer)       # outer loop: honest estimate",
      "print(scores.mean().round(3), '+/-', scores.std().round(3))"
    ].join("\n")
  });
})();
