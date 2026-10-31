(function () {
  var D = (window.FE_DETAILS = window.FE_DETAILS || {});

  D["Feature Selection"] = [
    {
      n: "Variance threshold",
      what: "A <b>filter</b> method that looks only at the features, never at the target. A column that barely changes carries almost no information, so it cannot help a model separate rows. <code>VarianceThreshold</code> computes each column's (population) variance and drops columns at or below the cut-off. With the default threshold of 0 it removes only perfectly constant columns.",
      how: [
        "Compute the variance of every column on the <b>training</b> split: Var = mean((x - mean)&sup2;)",
        "Choose a threshold (0 = constant only; 0.01 or so = near-constant)",
        "Keep columns with variance &gt; threshold, drop the rest",
        "Apply the same kept-column mask to validation / test data via <code>transform</code>",
        "For binary 0/1 columns, Var = p(1-p), so threshold <code>.8 * (1 - .8)</code> drops columns that are the same value in 80% of rows"
      ],
      ex: "Column A = [5, 5, 5, 5] has variance 0 and is dropped. Column B = [2, 4, 6, 8] has mean 5, squared deviations 9, 1, 1, 9, so variance = 20/4 = 5 and it is kept. A 0/1 flag that is 1 in 99% of rows has variance 0.99 &times; 0.01 = 0.0099, which is below 0.01 and is dropped.",
      code: [
        "import pandas as pd",
        "from sklearn.feature_selection import VarianceThreshold",
        "",
        "# fit on the TRAIN split only",
        "sel = VarianceThreshold(threshold=0.01)",
        "X_train_s = sel.fit_transform(X_train)",
        "X_test_s = sel.transform(X_test)",
        "kept = X_train.columns[sel.get_support()]",
        "print(list(kept))"
      ].join("\n"),
      pros: ["Very fast and needs no labels", "Removes useless constant columns safely", "Easy to explain"],
      cons: ["Ignores the target, so a high-variance column can still be pure noise", "Variance depends on scale: standardised columns all have variance 1", "Only catches the most obvious junk"],
      tip: "Use it as a cheap first pass, and compare columns on the same scale (or use the binary p(1-p) rule). Put it inside the Pipeline so the mask is learned from training folds only."
    },
    {
      n: "Correlation filter",
      what: "Two features that move together give the model the same information twice. This wastes compute, makes linear-model coefficients unstable (multicollinearity) and muddies importance scores. The filter finds pairs whose absolute correlation exceeds a limit (often 0.9) and keeps only one of each pair.",
      how: [
        "Compute the correlation matrix on the training data: <code>X_train.corr().abs()</code>",
        "Keep only the upper triangle so each pair is seen once",
        "For every column, check whether any correlation with an earlier column exceeds the limit",
        "Drop the column; prefer to keep the one more correlated with the target or easier to explain",
        "Use the same drop list on validation / test data"
      ],
      ex: "x = [1, 2, 3, 4, 5] and y = [2, 4, 6, 8, 11]: the covariance sum is 22, the sums of squares are 10 and 48.8, so r = 22 / &radic;(10 &times; 48.8) = 0.996. Since 0.996 &gt; 0.9, one of x and y is dropped. A height-in-cm / height-in-inches pair would give r = 1.0.",
      code: [
        "import numpy as np",
        "",
        "corr = X_train.corr(numeric_only=True).abs()",
        "# keep upper triangle so each pair appears once",
        "upper = corr.where(np.triu(np.ones(corr.shape), k=1).astype(bool))",
        "to_drop = [c for c in upper.columns if (upper[c] > 0.9).any()]",
        "X_train_f = X_train.drop(columns=to_drop)",
        "X_test_f = X_test.drop(columns=to_drop)",
        "print('dropped:', to_drop)"
      ].join("\n"),
      pros: ["Simple, fast and transparent", "Reduces multicollinearity for linear models", "Needs no model training"],
      cons: ["Only detects linear (Pearson) relationships", "Which of the pair to drop is arbitrary unless you decide", "Pairwise only: misses a feature that is a combination of several others"],
      tip: "Trees are fairly tolerant of correlated features, linear models are not. Decide the cut-off with the model type in mind and learn the drop list from training data only."
    },
    {
      n: "Chi-square test",
      what: "The &chi;&sup2; filter asks whether a feature's values are spread across target classes differently from what chance would predict. In scikit-learn it works on <b>non-negative</b> features such as counts, TF-IDF or one-hot columns, and a categorical target. A big &chi;&sup2; score means the feature and the class are strongly dependent.",
      how: [
        "Make sure features are &ge; 0 (counts, one-hot, TF-IDF; scale with MinMax if needed)",
        "Per class, sum the feature to get the <i>observed</i> value O",
        "Expected E = class share &times; the feature's total over all rows",
        "Score = &Sigma; (O - E)&sup2; / E over classes",
        "Keep the top-k features with <code>SelectKBest(chi2, k=...)</code>"
      ],
      ex: "50 spam and 50 ham emails. The word 'free' appears 40 times in spam and 10 in ham (total 50), so E = 25 for each class: &chi;&sup2; = (40-25)&sup2;/25 + (10-25)&sup2;/25 = 9 + 9 = 18. The word 'the' appears 50 times in each, E = 50, so &chi;&sup2; = 0 and it is dropped.",
      code: [
        "from sklearn.feature_extraction.text import CountVectorizer",
        "from sklearn.feature_selection import SelectKBest, chi2",
        "",
        "vec = CountVectorizer()",
        "Xtr = vec.fit_transform(texts_train)   # counts are non-negative",
        "sel = SelectKBest(chi2, k=20).fit(Xtr, y_train)",
        "Xtr_k = sel.transform(Xtr)",
        "Xte_k = sel.transform(vec.transform(texts_test))",
        "top = vec.get_feature_names_out()[sel.get_support()]"
      ].join("\n"),
      pros: ["Very fast, works on sparse matrices", "Classic choice for text bag-of-words", "Easy to rank features"],
      cons: ["Fails on negative values (e.g. standardised data)", "Classification targets only", "Scores are not comparable across very differently scaled features"],
      tip: "Don't standardise before chi2; use counts, one-hot or MinMax-scaled data. Keep it inside the CV Pipeline so selection does not peek at validation labels."
    },
    {
      n: "ANOVA F-test",
      what: "The ANOVA F-test compares the class means of a numeric feature. If the means differ a lot relative to the spread within each class, the feature separates the classes well and gets a high F. It only detects <b>linear / mean-shift</b> effects and treats each feature on its own.",
      how: [
        "Group the feature values by target class",
        "Between-class variance: MSB = &Sigma; n<sub>k</sub>(mean<sub>k</sub> - grand mean)&sup2; / (K - 1)",
        "Within-class variance: MSW = &Sigma; (x - mean<sub>k</sub>)&sup2; / (N - K)",
        "F = MSB / MSW; larger F = more separation",
        "<code>SelectKBest(f_classif, k=10)</code> keeps the k highest F scores"
      ],
      ex: "Class A values [1, 2, 3] (mean 2), class B values [5, 6, 7] (mean 6), grand mean 4. Between: 3&times;4 + 3&times;4 = 24 with 1 df, so MSB = 24. Within: (1+0+1) + (1+0+1) = 4 with N-K = 4 df, so MSW = 1. F = 24 / 1 = 24, a very strong feature.",
      code: [
        "from sklearn.feature_selection import SelectKBest, f_classif",
        "",
        "sel = SelectKBest(score_func=f_classif, k=10)",
        "sel.fit(X_train, y_train)               # train split only",
        "X_train_k = sel.transform(X_train)",
        "X_test_k = sel.transform(X_test)",
        "scores = dict(zip(X_train.columns, sel.scores_))",
        "print(sorted(scores, key=scores.get, reverse=True)[:5])"
      ].join("\n"),
      pros: ["Fast and easy to interpret", "Handles negative and continuous values", "Gives p-values as well as scores"],
      cons: ["Misses non-linear and interaction effects", "Assumes roughly normal, similar-spread classes", "Ranks features one at a time, so redundant features all score high"],
      tip: "Great quick filter for numeric features with a classification target; use <code>f_regression</code> for a numeric target. Run it on the training folds only."
    },
    {
      n: "Mutual information",
      what: "Mutual information (MI) measures how much knowing a feature reduces uncertainty about the target. It is zero if they are independent and grows with any kind of dependency, not just straight-line ones. scikit-learn estimates it with nearest-neighbour methods for continuous features, so scores are noisy and not bounded by 1.",
      how: [
        "Choose <code>mutual_info_classif</code> (class target) or <code>mutual_info_regression</code>",
        "Tell it which features are discrete via <code>discrete_features</code>",
        "Fix <code>random_state</code>: the estimator uses random noise, so results vary",
        "Rank features by MI score (0 = independent)",
        "Keep the top-k with <code>SelectKBest(mutual_info_classif, k=...)</code>"
      ],
      ex: "Take x = [-2, -1, 0, 1, 2] and y = x&sup2; = [4, 1, 0, 1, 4]. The mean of y is 2 and the covariance sum of x &times; (y - 2) = -4 + 1 + 0 - 1 + 4 = 0, so Pearson r = 0 and a correlation filter would drop x. Yet y is perfectly determined by x, so MI is clearly positive and keeps it.",
      code: [
        "from sklearn.feature_selection import mutual_info_classif, SelectKBest",
        "import pandas as pd",
        "",
        "mi = mutual_info_classif(X_train, y_train, random_state=0)",
        "print(pd.Series(mi, index=X_train.columns).sort_values(ascending=False).head())",
        "",
        "sel = SelectKBest(mutual_info_classif, k=10).fit(X_train, y_train)",
        "X_train_k = sel.transform(X_train)",
        "X_test_k = sel.transform(X_test)"
      ].join("\n"),
      pros: ["Captures non-linear dependency", "Works for numeric and categorical features", "No distribution assumptions"],
      cons: ["Slower and noisier than F-test on small data", "Still scores each feature alone (misses interactions)", "Scores are hard to compare in absolute terms"],
      tip: "Use MI when you suspect curved or threshold effects; compare its ranking with the F-test to spot non-linear features. Always fit on the training folds only."
    },
    {
      n: "RFE (recursive elimination)",
      what: "Recursive Feature Elimination is a <b>wrapper</b> method: it trains a model, drops the least important feature(s), and repeats until the target number remains. The model's own coefficients or importances judge each round, so feature interactions are accounted for. <code>RFECV</code> adds cross-validation to pick how many features to keep.",
      how: [
        "Fit the estimator on all current features",
        "Rank features by <code>coef_</code> or <code>feature_importances_</code>",
        "Remove the weakest <code>step</code> features",
        "Repeat until the requested number is left (RFECV: score every size with CV)",
        "Pick the size with the best CV score; use <code>support_</code> and <code>ranking_</code>"
      ],
      ex: "Four features [age, income, noise, id] with |weights| 0.9, 0.5, 0.2, 0.05. Round 1 drops id (rank 3); the model is refit and noise now looks weakest, so it is dropped (rank 2). With n_features_to_select = 2 the result is ranking_ = [1, 1, 2, 3] and age and income survive.",
      code: [
        "from sklearn.feature_selection import RFECV",
        "from sklearn.linear_model import LogisticRegression",
        "from sklearn.pipeline import Pipeline",
        "from sklearn.preprocessing import StandardScaler",
        "",
        "est = LogisticRegression(max_iter=1000)",
        "rfecv = RFECV(est, step=1, cv=5, scoring='roc_auc')",
        "pipe = Pipeline([('scale', StandardScaler()), ('rfe', rfecv)])",
        "pipe.fit(X_train, y_train)",
        "print(rfecv.n_features_, X_train.columns[rfecv.support_])"
      ].join("\n"),
      pros: ["Considers feature interactions through the model", "Picks the number of features automatically (RFECV)", "Often better subsets than simple filters"],
      cons: ["Costly: many model refits", "Depends on the base estimator's importance measure", "Unstable when features are highly correlated"],
      tip: "Use it for tens to a few hundred features, scaling first for linear estimators. To get an honest score, wrap RFECV in an outer CV Pipeline."
    },
    {
      n: "Forward / backward selection",
      what: "<code>SequentialFeatureSelector</code> greedily builds a feature set. Forward selection starts empty and adds the feature that improves the cross-validated score most; backward starts with all features and removes the one that hurts least. Because each step is scored by the real model, it finds subsets that work well <i>together</i>.",
      how: [
        "Forward: start with no features",
        "Try adding each remaining feature; score each candidate set with CV",
        "Add the best one; stop at <code>n_features_to_select</code> or when gains &lt; <code>tol</code> (<code>'auto'</code>)",
        "Backward: start with all features and drop the least useful each step",
        "Cost is roughly (candidates tried) &times; cv fits, which grows fast"
      ],
      ex: "Features A, B, C with single-feature CV accuracy 0.70, 0.65, 0.60: A is chosen. Next A+B = 0.78 and A+C = 0.74, so B is added. A+B+C = 0.78 gives no gain, so selection stops with {A, B}. With 20 features choosing 5 forward needs (20+19+18+17+16) = 90 candidate sets &times; 5 folds = 450 fits.",
      code: [
        "from sklearn.feature_selection import SequentialFeatureSelector",
        "from sklearn.neighbors import KNeighborsClassifier",
        "",
        "sfs = SequentialFeatureSelector(",
        "    KNeighborsClassifier(), n_features_to_select=5,",
        "    direction='forward', cv=5, scoring='accuracy')",
        "sfs.fit(X_train, y_train)               # train split only",
        "X_train_k = sfs.transform(X_train)",
        "X_test_k = sfs.transform(X_test)",
        "print(X_train.columns[sfs.get_support()])"
      ].join("\n"),
      pros: ["Finds feature combinations that work together", "Works with any estimator", "Gives a small, explainable feature set"],
      cons: ["Slow with many features", "Greedy: can miss the best subset", "Can overfit the CV score"],
      tip: "Reserve it for small feature sets (under ~50). Forward is cheaper when you want few features, backward when you want to keep most. Nest it in a Pipeline for honest evaluation."
    },
    {
      n: "Lasso (L1) selection",
      what: "Lasso adds an L1 penalty (alpha &times; &Sigma;|w|) to linear regression. The penalty pushes weak features' weights to <b>exactly zero</b>, so feature selection happens during training: an <b>embedded</b> method. <code>SelectFromModel</code> then keeps only the features with non-zero (above-threshold) weights. A larger alpha removes more features.",
      how: [
        "Standardise features so penalties are comparable",
        "Fit <code>Lasso(alpha)</code> (or <code>LogisticRegression(penalty='l1')</code>)",
        "Objective: minimise squared error + alpha &times; &Sigma;|w|",
        "<code>SelectFromModel</code> keeps features with |w| above the threshold",
        "Tune alpha with CV (<code>LassoCV</code>) to balance sparsity and accuracy"
      ],
      ex: "On standardised data a Lasso gives coefficients [1.8, 0.0, -0.6, 0.0, 0.0] for five features. Only features 1 and 3 have non-zero weights, so 3 of 5 columns (60%) are dropped. Raising alpha could shrink -0.6 to 0 as well.",
      code: [
        "from sklearn.feature_selection import SelectFromModel",
        "from sklearn.linear_model import Lasso",
        "from sklearn.pipeline import Pipeline",
        "from sklearn.preprocessing import StandardScaler",
        "",
        "pipe = Pipeline([",
        "    ('scale', StandardScaler()),",
        "    ('sel', SelectFromModel(Lasso(alpha=0.01))),",
        "])",
        "X_train_k = pipe.fit_transform(X_train, y_train)",
        "X_test_k = pipe.transform(X_test)"
      ].join("\n"),
      pros: ["Fast: selection happens in one fit", "Yields sparse, interpretable models", "Handles many features well"],
      cons: ["Assumes linear relationships", "Among correlated features it picks one somewhat arbitrarily", "Very sensitive to scaling and alpha"],
      tip: "Always standardise first and tune alpha by CV. The selector must sit inside the Pipeline so each fold chooses its own features."
    },
    {
      n: "Tree importance",
      what: "A tree or forest records how much each split reduces impurity (Gini or variance), weighted by the number of samples reaching the split. Summing this per feature and normalising to 1 gives <code>feature_importances_</code>. It is an <b>embedded</b> measure: free once the model is trained, and it captures non-linear effects and interactions.",
      how: [
        "Train a tree ensemble such as <code>RandomForestClassifier</code>",
        "At each split, impurity decrease = parent impurity - weighted child impurity",
        "Sum the decreases per feature across all trees",
        "Normalise so importances add to 1",
        "Keep features above a threshold, e.g. with <code>SelectFromModel(forest, threshold='median')</code>"
      ],
      ex: "A root node is 50/50 (Gini 0.5) and a split gives 90/10 children (Gini = 1 - 0.81 - 0.01 = 0.18 each). Impurity decrease = 0.5 - 0.18 = 0.32 for that feature at that split. Final importances might read [0.55, 0.30, 0.15], summing to 1.",
      code: [
        "import pandas as pd",
        "from sklearn.ensemble import RandomForestClassifier",
        "from sklearn.feature_selection import SelectFromModel",
        "",
        "rf = RandomForestClassifier(n_estimators=300, random_state=0)",
        "rf.fit(X_train, y_train)",
        "imp = pd.Series(rf.feature_importances_, index=X_train.columns)",
        "print(imp.sort_values(ascending=False).head(10))",
        "sel = SelectFromModel(rf, threshold='median', prefit=True)",
        "X_train_k = sel.transform(X_train)"
      ].join("\n"),
      pros: ["Free by-product of training", "Captures non-linear effects and interactions", "Works with mixed feature types"],
      cons: ["Biased toward high-cardinality / continuous features", "Correlated features split the credit", "Measured on training data, so it can reward overfit features"],
      tip: "Treat it as a quick first look and confirm with permutation importance on held-out data. When selecting features, refit inside the CV Pipeline instead of using importances from the full data."
    },
    {
      n: "Permutation importance",
      what: "Permutation importance asks: how much worse does the model get if one feature's values are randomly shuffled? Shuffling breaks the link between that feature and the target, so a large score drop means the model relied on it. It works with any fitted model and is measured on held-out data, so it is more trustworthy than impurity importances.",
      how: [
        "Fit the model on the training split",
        "Score it on a validation / test set (baseline)",
        "Shuffle one column, re-score, and record baseline - shuffled score",
        "Repeat <code>n_repeats</code> times and average (also gives a std)",
        "Repeat for every feature and rank by mean drop"
      ],
      ex: "Baseline accuracy is 0.90. Shuffling <code>age</code> drops it to 0.74 (importance 0.16); shuffling <code>zip_code</code> gives 0.89 (importance 0.01), so zip_code is nearly useless and a candidate to remove.",
      code: [
        "from sklearn.inspection import permutation_importance",
        "",
        "model.fit(X_train, y_train)",
        "r = permutation_importance(",
        "    model, X_val, y_val, n_repeats=10,",
        "    scoring='accuracy', random_state=0)",
        "for i in r.importances_mean.argsort()[::-1][:5]:",
        "    print(X_val.columns[i], round(r.importances_mean[i], 3),",
        "          '+/-', round(r.importances_std[i], 3))"
      ].join("\n"),
      pros: ["Model-agnostic", "Measured on unseen data, so it reflects real usefulness", "Gives an uncertainty estimate"],
      cons: ["Correlated features hide each other (shuffling one, the other compensates)", "Slower: re-scores once per feature per repeat", "Shuffled rows can be unrealistic combinations"],
      tip: "Compute it on validation data, not training data. Group strongly correlated features (or drop one) first, then remove the features whose importance is about 0 and re-check the CV score."
    },
    {
      n: "SHAP values",
      what: "SHAP assigns every feature a signed contribution to <i>each individual prediction</i>, based on Shapley values from game theory. The contributions add up: base value + sum of SHAP values = model output. Averaging |SHAP| across rows gives a global importance, and the sign shows the direction of each feature's effect.",
      how: [
        "Fit a model (trees use the fast exact <code>shap.TreeExplainer</code>)",
        "Compute <code>shap_values</code> on a sample of rows",
        "Local: prediction = base value + &Sigma; SHAP<sub>i</sub>",
        "Global importance = mean(|SHAP<sub>i</sub>|) over rows",
        "Inspect with <code>shap.summary_plot</code> and drop features with consistently tiny |SHAP|"
      ],
      ex: "A house-price model has base value 200k. For one house: sqft +50k, location +30k, age -20k, so prediction = 200 + 50 + 30 - 20 = 260k. If across all rows the mean |SHAP| of <code>sqft</code> is 40k and of <code>colour</code> is 0.5k, colour is a removal candidate.",
      code: [
        "import numpy as np, shap",
        "from sklearn.ensemble import GradientBoostingRegressor",
        "",
        "model = GradientBoostingRegressor().fit(X_train, y_train)",
        "explainer = shap.TreeExplainer(model)",
        "sv = explainer.shap_values(X_val)       # shape: rows x features",
        "global_imp = np.abs(sv).mean(axis=0)",
        "print(dict(zip(X_val.columns, global_imp.round(2))))",
        "shap.summary_plot(sv, X_val)"
      ].join("\n"),
      pros: ["Explains single predictions and the whole model", "Shows direction as well as size of effects", "Consistent, additive attributions"],
      cons: ["Slow for non-tree models (KernelExplainer)", "Correlated features share credit in confusing ways", "Explains the model, not causal truth"],
      tip: "Use SHAP mainly for explanation and sanity checks (e.g. spotting a leaky feature with a suspiciously huge effect). Compute it on held-out data; if used to pick features, redo the selection inside CV."
    },
    {
      n: "Dimensionality reduction",
      what: "Instead of choosing a subset of the original columns, dimensionality reduction builds <b>new</b> features that summarise them. PCA is unsupervised: it finds orthogonal directions of maximum variance. LDA uses class labels to find directions that separate classes. t-SNE and UMAP are for 2-D visualisation, not for feeding models.",
      how: [
        "Standardise the features (PCA is scale-sensitive)",
        "Fit PCA on the training data: find directions of greatest variance",
        "Look at <code>explained_variance_ratio_</code> and its cumulative sum",
        "Keep enough components, e.g. <code>PCA(n_components=0.95)</code> keeps 95% of the variance",
        "Transform train and test with the same fitted PCA"
      ],
      ex: "Explained variance ratios are [0.60, 0.25, 0.10, 0.05]. Cumulative: 0.60, 0.85, 0.95, 1.00. To keep 95% you need 3 components, so 4 correlated features shrink to 3 uncorrelated ones.",
      code: [
        "from sklearn.decomposition import PCA",
        "from sklearn.pipeline import Pipeline",
        "from sklearn.preprocessing import StandardScaler",
        "",
        "pipe = Pipeline([('scale', StandardScaler()),",
        "                 ('pca', PCA(n_components=0.95))])",
        "X_train_p = pipe.fit_transform(X_train)",
        "X_test_p = pipe.transform(X_test)",
        "print(pipe['pca'].n_components_,",
        "      pipe['pca'].explained_variance_ratio_.cumsum())"
      ].join("\n"),
      pros: ["Removes correlation and compresses many columns", "Often speeds up training and reduces overfitting", "LDA can use labels to separate classes"],
      cons: ["New features are hard to interpret", "PCA is linear and ignores the target", "High variance does not always mean high predictive value"],
      tip: "This is feature extraction, not selection: the original columns are still needed at prediction time. Fit scaler + PCA in the Pipeline on training data only, and avoid feeding t-SNE / UMAP output to a model."
    }
  ];

  D["Pipelines & Leakage"] = [
    {
      n: "Fit on all data",
      what: "Scalers, imputers, encoders and selectors <i>learn</i> numbers from data (means, medians, categories, chosen columns). If they learn these from the full dataset before splitting, information about the test rows seeps into training. The score looks better than it will in production. The cure: split first, <code>fit</code> on train only, then only <code>transform</code> test.",
      how: [
        "Split into train / test (or CV folds) <b>first</b>",
        "Call <code>fit</code> (or <code>fit_transform</code>) on the training part only",
        "Call only <code>transform</code> on validation / test data",
        "Wrap the steps in a Pipeline so this happens automatically",
        "Never call <code>fit</code> on test data"
      ],
      ex: "Train incomes are [30, 40, 50] and the test row is 200. Correct: mean 40, std 8.16, so the test row has z = (200-40)/8.16 = 19.6, clearly an outlier. Wrong (fit on all 4 values): mean 80, std 69.6, so z = (200-80)/69.6 = 1.72, which hides the outlier and shows the test row influenced the scaler.",
      code: [
        "from sklearn.preprocessing import StandardScaler",
        "from sklearn.model_selection import train_test_split",
        "",
        "# WRONG: scaler sees test rows",
        "X_all = StandardScaler().fit_transform(X)",
        "Xtr, Xte, ytr, yte = train_test_split(X_all, y, random_state=0)",
        "",
        "# RIGHT: split first, learn from train only",
        "Xtr, Xte, ytr, yte = train_test_split(X, y, random_state=0)",
        "sc = StandardScaler().fit(Xtr)",
        "Xtr_s, Xte_s = sc.transform(Xtr), sc.transform(Xte)"
      ].join("\n"),
      pros: ["Gives honest, production-like scores", "Easy habit once Pipelines are used"],
      cons: ["Leakage from scalers is subtle and silent", "Easy to forget when preprocessing in pandas by hand"],
      tip: "If a step calls <code>fit</code>, it must see training data only. Mean imputation, target statistics, PCA and feature selection all count, not just scaling."
    },
    {
      n: "Future information",
      what: "A feature leaks the future when its value would not be known at the moment you must predict. Examples: a 'cancellation date' column when predicting churn, or a 'recovery amount' when predicting loan default. Time-based data adds a second trap: a random split mixes future rows into training, so the model learns patterns from the period it is tested on.",
      how: [
        "For each feature ask: is it known at prediction time?",
        "Drop post-event columns (outcomes, resolution codes, later aggregates)",
        "Build rolling / lag features only from data before the prediction date",
        "Split by time: train on the past, test on the future (<code>TimeSeriesSplit</code>)",
        "Leave a gap if the label is observed after a delay"
      ],
      ex: "A default model that includes <code>collections_calls</code> (made only after a customer defaults) reaches AUC 0.99 offline. Dropping it gives AUC 0.72, which is what it will score live. Similarly a random split on 2023 sales data may give R&sup2; = 0.91 but a time split (train Jan-Sep, test Oct-Dec) gives 0.78.",
      code: [
        "from sklearn.model_selection import TimeSeriesSplit, cross_val_score",
        "",
        "df = df.sort_values('date')",
        "# WRONG: random folds mix future rows into training",
        "# cross_val_score(model, X, y, cv=KFold(5, shuffle=True))",
        "",
        "# RIGHT: each fold trains on the past, tests on the future",
        "X = df.drop(columns=['target', 'date', 'collections_calls'])",
        "tscv = TimeSeriesSplit(n_splits=5)",
        "print(cross_val_score(model, X, df['target'], cv=tscv))"
      ].join("\n"),
      pros: ["Scores match real deployment", "Prevents impossible-in-production features"],
      cons: ["Needs domain knowledge to spot leaky columns", "Time splits leave less data for training"],
      tip: "Be suspicious of any score that looks too good: check the top features for post-event information. Document the 'as-of' time of every column."
    },
    {
      n: "Target leakage",
      what: "Target leakage occurs when a feature is built from the label itself. The classic case is <b>target encoding</b> (replacing a category with the mean of y for that category) computed on the same rows it will train on: each row's own label is inside its feature. Rare categories become almost a copy of the answer, and the model memorises it.",
      how: [
        "Never compute target statistics on the rows you train the model on without protection",
        "Use out-of-fold (cross-fitted) encoding: encode each fold from the other folds",
        "Add smoothing so rare categories shrink toward the global mean",
        "Use <code>TargetEncoder(cv=5)</code>, whose <code>fit_transform</code> is cross-fitted",
        "Keep it inside a Pipeline so CV re-fits it per fold"
      ],
      ex: "A city 'Hubli' appears once, with churn = 1. Naive target encoding gives it 1.0 = the label, so a tree splits perfectly: train AUC 1.00 but test AUC 0.60. With 5-fold out-of-fold encoding, that row is encoded using other folds (where Hubli is unseen, so the global mean 0.20 is used) and the leak disappears.",
      code: [
        "from sklearn.preprocessing import TargetEncoder",
        "from sklearn.ensemble import HistGradientBoostingClassifier",
        "from sklearn.pipeline import make_pipeline",
        "",
        "# WRONG: df['city_te'] = df.groupby('city')['y'].transform('mean')",
        "",
        "# RIGHT: cross-fitted encoding inside a pipeline",
        "te = TargetEncoder(cv=5, smooth='auto', random_state=0)",
        "pipe = make_pipeline(te, HistGradientBoostingClassifier())",
        "pipe.fit(X_train[['city']], y_train)",
        "print(pipe.score(X_test[['city']], y_test))"
      ].join("\n"),
      pros: ["Out-of-fold encoding keeps the power of target encoding", "Handles high-cardinality categories compactly"],
      cons: ["Slightly more complex and slower", "Still needs smoothing for very rare categories"],
      tip: "Any feature computed with y (target encoding, group means of y, WOE) is a leak candidate. If train accuracy is near perfect and test is poor, check these first."
    },
    {
      n: "Cross-validate the whole pipeline",
      what: "If you scale, impute or select features on the full dataset and <i>then</i> cross-validate only the model, every validation fold has already influenced preprocessing. Feature selection is the worst offender: with many noisy features, picking the 'best' ones using all labels gives a great-looking CV score for pure noise. Passing the whole Pipeline to <code>cross_val_score</code> re-fits every step inside each training fold.",
      how: [
        "Put imputer, scaler, selector and model into one <code>Pipeline</code>",
        "Pass the pipeline (not pre-transformed X) to <code>cross_val_score</code> / <code>GridSearchCV</code>",
        "Each fold fits all steps on its training part, transforms its validation part",
        "Tune hyper-parameters through the pipeline with names like <code>sel__k</code>",
        "Keep a final untouched test set for one last check"
      ],
      ex: "Take 100 rows with 5000 pure-noise features and random labels (true accuracy = 0.50). Selecting the top 20 features on all data and then cross-validating typically reports accuracy well above 0.80. Doing the selection inside each fold gives a score near 0.50 (e.g. 0.57), the honest answer.",
      code: [
        "import numpy as np",
        "from sklearn.feature_selection import SelectKBest, f_classif",
        "from sklearn.linear_model import LogisticRegression",
        "from sklearn.model_selection import cross_val_score",
        "from sklearn.pipeline import make_pipeline",
        "",
        "rng = np.random.RandomState(0)",
        "X, y = rng.randn(100, 5000), rng.randint(0, 2, 100)   # pure noise",
        "# WRONG: selection sees all labels before CV",
        "Xs = SelectKBest(f_classif, k=20).fit_transform(X, y)",
        "print(cross_val_score(LogisticRegression(), Xs, y, cv=5).mean())",
        "# RIGHT: selection re-fit inside each fold",
        "pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression())",
        "print(cross_val_score(pipe, X, y, cv=5).mean())"
      ].join("\n"),
      pros: ["Honest estimate of generalisation", "Makes tuning and selection safe", "Less code and fewer bugs"],
      cons: ["Slower: preprocessing repeats in every fold", "Needs every step to be a scikit-learn-compatible transformer"],
      tip: "Rule of thumb: anything that looks at y, or learns from X, belongs inside the Pipeline. For resampling (SMOTE) use the imblearn Pipeline so it only touches training folds."
    },
    {
      n: "Save the pipeline",
      what: "A model is useless without the exact preprocessing it was trained with. Saving only the classifier forces you to re-create scalers, encoders and column order by hand, and small differences silently change predictions. Saving the <b>fitted</b> Pipeline as a single object keeps preprocessing and model together.",
      how: [
        "Fit the complete Pipeline on training data",
        "Save it with <code>joblib.dump(pipe, 'model.joblib')</code>",
        "In the service, <code>joblib.load</code> it and call <code>predict</code> on raw input columns",
        "Record library versions (scikit-learn, pandas) alongside the file",
        "Only load files from sources you trust: pickles can execute code"
      ],
      ex: "Training saw cities [Delhi, Mumbai, Pune], giving 3 one-hot columns. A hand-rolled production script that one-hot-encodes a batch containing only Delhi and Pune creates 2 columns, so the model receives mis-aligned input. The saved pipeline with <code>OneHotEncoder(handle_unknown='ignore')</code> always emits the same 3 columns.",
      code: [
        "import joblib, sklearn",
        "",
        "model.fit(X_train, y_train)             # model is the full Pipeline",
        "joblib.dump(model, 'model.joblib')",
        "print('trained with scikit-learn', sklearn.__version__)",
        "",
        "# later, in the serving code",
        "loaded = joblib.load('model.joblib')",
        "preds = loaded.predict(new_raw_df)      # raw columns in, predictions out"
      ].join("\n"),
      pros: ["Training and serving use identical preprocessing", "One artefact to version and deploy"],
      cons: ["Pickles break across library versions", "Loading untrusted files is a security risk"],
      tip: "Pin library versions in the deployment environment and test the loaded pipeline on a few known rows. Consider ONNX or a model registry for long-term storage."
    },
    {
      n: "FE checklist",
      what: "A repeatable order of operations prevents most feature-engineering mistakes. The order matters because each step depends on the previous ones and because anything that learns from data must be fitted on training data only. Wrap everything after the split in a Pipeline.",
      how: [
        "<b>Split</b> (or set up CV) first: nothing learned before this can leak",
        "<b>Missing values</b>: impute early, since most later steps cannot handle NaN",
        "<b>Outliers</b>: cap / treat before scaling, otherwise they distort means and stds",
        "<b>Encode</b> categoricals, then <b>transform / scale</b> numerics (skew fix before scaling)",
        "<b>Create</b> new features, then <b>select</b> so useless or redundant ones are removed",
        "<b>Balance</b> (training folds only), then <b>validate</b> the whole pipeline with CV"
      ],
      ex: "Suppose a project has 10,000 rows and 200 features. Split 8,000 / 2,000, build the Pipeline, and CV it on the 8,000 rows (e.g. 0.84 &plusmn; 0.01). Tune once, then score the untouched 2,000 rows a single time (e.g. 0.83). The two numbers agree, so there is likely no leakage; a big gap would signal a problem.",
      code: [
        "from sklearn.pipeline import Pipeline",
        "from sklearn.impute import SimpleImputer",
        "from sklearn.preprocessing import StandardScaler",
        "from sklearn.feature_selection import SelectKBest, f_classif",
        "from sklearn.linear_model import LogisticRegression",
        "from sklearn.model_selection import cross_val_score",
        "",
        "pipe = Pipeline([('impute', SimpleImputer(strategy='median')),",
        "                 ('scale', StandardScaler()),",
        "                 ('select', SelectKBest(f_classif, k=20)),",
        "                 ('clf', LogisticRegression(class_weight='balanced', max_iter=1000))])",
        "print(cross_val_score(pipe, X_train, y_train, cv=5).mean())"
      ].join("\n"),
      pros: ["Gives a consistent routine for every project", "Prevents order-related leakage and bugs"],
      cons: ["Not every step is needed for every dataset", "Real projects iterate, so the order is a guide, not a law"],
      tip: "Skim the checklist at the start and before shipping. Whenever a step uses y or looks across rows, ask: is this inside the Pipeline and fitted on training data only?"
    }
  ];
})();
