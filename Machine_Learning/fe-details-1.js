(function () {
  var D = (window.FE_DETAILS = window.FE_DETAILS || {});

  D["Overview"] = [
    {
      n: "Clean",
      what: "Cleaning is the first stage: it fixes the raw table so later steps do not crash or learn from garbage. It covers missing values, impossible or extreme values, duplicate rows, inconsistent text (<code>'NY'</code> vs <code>'new york'</code>) and wrong data types (numbers stored as strings, dates stored as text). Intuition: a model cannot tell a typo from a real signal, so you must.",
      how: [
        "Fix types first: parse dates, convert numeric strings, standardise text case and spelling.",
        "Drop exact duplicates and obviously invalid rows (negative age, future birth date).",
        "Handle missing values (drop, impute, or add an indicator).",
        "Handle outliers (investigate, then cap, transform or keep).",
        "Do the fitted parts (imputation statistics) on the training split only."
      ],
      ex: "A housing table has price = ['250000', '310000', 'N/A', '9999999'] stored as text. Converting to numbers gives 250000, 310000, NaN, 9999999; the NaN is imputed with the median 310000 and the 9,999,999 is flagged as a likely typo and capped at the 99th percentile.",
      code: "import pandas as pd\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.model_selection import train_test_split\ndf = df.drop_duplicates()\ndf['price'] = pd.to_numeric(df['price'], errors='coerce')  # 'N/A' -> NaN\ndf['city'] = df['city'].str.strip().str.lower()\ndf = df[df['age'].between(0, 110)]           # remove impossible ages\ntrain, test = train_test_split(df, test_size=0.2, random_state=0)\nimp = SimpleImputer(strategy='median').fit(train[['price']])\ntrain[['price']] = imp.transform(train[['price']])\ntest[['price']] = imp.transform(test[['price']])",
      pros: ["Prevents crashes and silent errors downstream", "Often the cheapest big quality gain", "Makes later stages (scaling, encoding) reliable"],
      cons: ["Needs domain judgement; easy to delete real signal", "Imputation choices can bias the data"],
      tip: "Rule-based fixes (types, typos, duplicates) can be done on the whole table, but anything that learns a statistic (median, cap value) must be fitted on the training split only."
    },
    {
      n: "Encode",
      what: "Encoding converts categories and text into numbers because most algorithms only do arithmetic. The right method depends on whether the category has an order (ordinal) or not (nominal), how many distinct values it has (cardinality) and which model you use. Wrong encoding can invent a fake order or explode the column count.",
      how: [
        "Nominal, few values: one-hot encoding.",
        "Ordered values: ordinal encoding with an explicit order.",
        "High cardinality: target, frequency, hashing or rare-label grouping.",
        "Trees can often use ordinal/label codes; linear models, KNN and NNs prefer one-hot.",
        "Encode after cleaning and before scaling (one-hot columns usually need no scaling)."
      ],
      ex: "Colour = [Red, Green, Red, Blue] becomes three columns: Red = [1,0,1,0], Green = [0,1,0,0], Blue = [0,0,0,1]. Size = [S, M, L] with order S &lt; M &lt; L becomes [0, 1, 2].",
      code: "from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder\nfrom sklearn.compose import ColumnTransformer\nenc = ColumnTransformer([\n    ('nom', OneHotEncoder(handle_unknown='ignore'), ['colour']),\n    ('ord', OrdinalEncoder(categories=[['S', 'M', 'L']]), ['size']),\n], remainder='passthrough')\nX_train_enc = enc.fit_transform(X_train)  # learn categories on train only\nX_test_enc = enc.transform(X_test)",
      pros: ["Lets every model consume categorical data", "Choice of encoding can inject useful structure (order, target mean)"],
      cons: ["One-hot explodes with high cardinality", "Target-based encodings can leak the label if done carelessly"],
      tip: "Never label-encode a nominal feature for a linear model: it implies Green &gt; Red. Always use <code>handle_unknown='ignore'</code> so unseen test categories do not crash."
    },
    {
      n: "Scale / transform",
      what: "Scaling puts numeric features on comparable ranges, and transforms (log, power) reduce skew. Models that use distances (KNN, SVM, K-means), gradients (linear models, neural nets) or variance (PCA) are dominated by large-valued features unless you rescale. Trees only compare thresholds, so they do not care.",
      how: [
        "Standardise: z = (x − mean) / std.",
        "Min-max: x' = (x − min) / (max − min).",
        "Skewed positives: log1p(x) or a power transform (Yeo-Johnson).",
        "Many outliers: RobustScaler (median and IQR).",
        "Fit the scaler on train, then apply the same parameters to test."
      ],
      ex: "Age = [20, 30, 40] and income = [20000, 50000, 80000]. Without scaling, income dominates any distance. After standardising, age = [−1.22, 0, 1.22] and income = [−1.22, 0, 1.22], so both contribute equally.",
      code: "import numpy as np\nfrom sklearn.preprocessing import StandardScaler\nX_train['income'] = np.log1p(X_train['income'])   # tame right skew\nX_test['income'] = np.log1p(X_test['income'])\nscaler = StandardScaler()\nnum = ['age', 'income']\nX_train[num] = scaler.fit_transform(X_train[num])  # fit on train only\nX_test[num] = scaler.transform(X_test[num])",
      pros: ["Faster, more stable gradient training", "Fair feature weighting in distance-based models", "Makes regularisation penalties comparable"],
      cons: ["Changes units, so coefficients are harder to read", "Useless for tree models", "Scalers are sensitive to outliers (except robust ones)"],
      tip: "Scale after splitting. Fitting <code>StandardScaler</code> on the full data leaks test mean and std into training."
    },
    {
      n: "Create",
      what: "Feature creation builds new columns from existing ones using domain knowledge: ratios, differences, date parts, text lengths, group aggregates, interactions. It makes patterns easy for a model that could not discover them alone (a linear model cannot divide two columns). It is often the stage with the largest accuracy gain.",
      how: [
        "Ratios and differences: price / area, debt / income.",
        "Date parts: month, weekday, is_weekend, days since an event.",
        "Aggregates: customer's mean order value, count of past purchases.",
        "Interactions and polynomials: x1 * x2, x1^2.",
        "Compute any aggregate using training rows only."
      ],
      ex: "A house has price = 300000 and area = 1500 sqft, so <code>price_per_sqft</code> = 300000 / 1500 = 200. A date 2024-03-09 (a Saturday) gives month = 3, weekday = 5, is_weekend = 1.",
      code: "import pandas as pd\ndf['price_per_sqft'] = df['price'] / df['area']\ndf['date'] = pd.to_datetime(df['date'])\ndf['month'] = df['date'].dt.month\ndf['is_weekend'] = (df['date'].dt.weekday >= 5).astype(int)\n# group aggregate: use train-only means to avoid leakage\ncity_mean = train.groupby('city')['price'].mean()\ndf['city_mean_price'] = df['city'].map(city_mean)",
      pros: ["Often the biggest accuracy boost", "Encodes domain knowledge directly", "Can make simple models competitive"],
      cons: ["Needs time and domain understanding", "Easy to create redundant or leaky features", "More features raise overfitting risk"],
      tip: "Beware of features built from the target or from the future (for example, next month's sales). Ask: would I know this value at prediction time?"
    },
    {
      n: "Select / reduce",
      what: "Selection removes features that are noisy, redundant or leaky; reduction compresses many features into fewer new ones. This lowers overfitting, speeds training and improves interpretability. Filter methods score features independently, wrapper methods (RFE) retrain models, and embedded methods (L1, tree importance) select during training.",
      how: [
        "Drop constant and near-constant columns (VarianceThreshold).",
        "Drop one of each highly correlated pair (|r| &gt; 0.9).",
        "Filter: SelectKBest with f_classif or mutual_info_classif.",
        "Wrapper/embedded: RFE, L1 regularisation, tree importances.",
        "Reduce: PCA keeps directions of highest variance (scale first)."
      ],
      ex: "With 100 features, 40 are constant or near-duplicates. After removing them and keeping the top 20 by mutual information, cross-validated accuracy stays at 0.91 but training time falls by about 5x.",
      code: "from sklearn.feature_selection import VarianceThreshold, SelectKBest, f_classif\nfrom sklearn.pipeline import make_pipeline\nsel = make_pipeline(\n    VarianceThreshold(threshold=0.0),   # drop constant columns\n    SelectKBest(f_classif, k=20),       # keep 20 best by ANOVA F-score\n)\nX_train_s = sel.fit_transform(X_train, y_train)  # uses train labels only\nX_test_s = sel.transform(X_test)",
      pros: ["Less overfitting and faster models", "Simpler, more explainable results", "Removes leaky or useless columns"],
      cons: ["Univariate filters miss feature interactions", "Wrappers are slow", "PCA components are hard to interpret"],
      tip: "Selection uses the target, so it must be inside cross-validation or a pipeline. Selecting on the full dataset first gives falsely optimistic scores."
    },
    {
      n: "Balance",
      what: "In imbalanced classification (fraud 1%, disease 0.5%) a model can score 99% accuracy by always predicting the majority class. Balancing makes the minority class matter, either by changing the data (over/under-sampling, SMOTE) or the loss (class weights). Metrics such as precision, recall and PR-AUC are needed to judge the result.",
      how: [
        "Split first; keep the test set at its natural class ratio.",
        "Simplest: <code>class_weight='balanced'</code> so errors on the rare class cost more.",
        "Random over-sampling duplicates minority rows; under-sampling drops majority rows.",
        "SMOTE creates synthetic minority points between neighbours (imbalanced-learn).",
        "Tune the decision threshold and evaluate with recall, precision, F1, PR-AUC."
      ],
      ex: "A training set has 990 legit and 10 fraud rows. With 'balanced' weights the fraud class weight is 1000 / (2 × 10) = 50 and legit is 1000 / (2 × 990) ≈ 0.505, so one fraud error counts about 100x more.",
      code: "from sklearn.linear_model import LogisticRegression\nfrom imblearn.over_sampling import SMOTE\nfrom imblearn.pipeline import Pipeline\n# option 1: re-weight the loss\nclf = LogisticRegression(class_weight='balanced', max_iter=1000)\n# option 2: SMOTE applied only to training folds inside a pipeline\npipe = Pipeline([('smote', SMOTE(random_state=0)), ('clf', LogisticRegression(max_iter=1000))])\npipe.fit(X_train, y_train)",
      pros: ["Improves recall on the rare class", "class_weight is trivial to add"],
      cons: ["Over-sampling can overfit duplicates", "Under-sampling throws away information", "Can distort predicted probabilities"],
      tip: "Never resample before the train/test split or the test set will contain copies or synthetic neighbours of training rows. Use <code>imblearn.pipeline.Pipeline</code>."
    },
    {
      n: "Fit on train only",
      what: "Every transformation that learns something (mean, min, category list, target mean, selected features) must learn it from the training split only, then be applied unchanged to validation and test data. Otherwise information about the test set leaks into training and the score is too optimistic. Pipelines make this automatic, including inside cross-validation.",
      how: [
        "Split the data into train and test first.",
        "Call <code>fit</code> (or <code>fit_transform</code>) only on training data.",
        "Call <code>transform</code> on test and new data with the stored parameters.",
        "Wrap steps in Pipeline + ColumnTransformer so each CV fold refits from scratch.",
        "Save the whole fitted pipeline for deployment."
      ],
      ex: "Train ages = [20, 30, 40] (mean 30), test age = 50. Correct: scale with mean 30 and std 8.16, so 50 → 2.45. Leaky: fitting on all four values (mean 35) shifts every value and hides how far 50 really is.",
      code: "from sklearn.pipeline import Pipeline\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.linear_model import LogisticRegression\nnum = Pipeline([('imp', SimpleImputer(strategy='median')), ('sc', StandardScaler())])\nprep = ColumnTransformer([('num', num, ['age', 'income']),\n                          ('cat', OneHotEncoder(handle_unknown='ignore'), ['city'])])\nmodel = Pipeline([('prep', prep), ('clf', LogisticRegression())])\nmodel.fit(X_train, y_train)\nprint(model.score(X_test, y_test))",
      pros: ["Gives honest performance estimates", "Pipelines are reproducible and deployable", "Prevents most leakage bugs automatically"],
      cons: ["Slightly more code than ad-hoc pandas steps", "Custom steps must follow the fit/transform API"],
      tip: "If you ever call <code>fit</code> on data containing test rows, or compute a statistic on the whole DataFrame before splitting, you have leakage. For time series, split by time, not randomly."
    }
  ];

  D["Missing Values"] = [
    {
      n: "Drop rows / columns",
      what: "The simplest fix: delete rows that contain gaps, or delete a column that is mostly empty. It is safe only when the missing data is small and random (MCAR: missing completely at random), because then the remaining rows are still a fair sample. If missingness depends on other data (MAR) or on the hidden value itself (MNAR), dropping biases the dataset.",
      how: [
        "Count missing values per column: <code>df.isna().mean()</code>.",
        "Drop columns above a threshold (for example &gt; 60% missing).",
        "Drop rows with missing values in key columns, or use <code>thresh</code> to require enough valid values.",
        "Check how many rows remain and whether class balance changed."
      ],
      ex: "A table has 1,000 rows. Column 'fax' is 92% empty, so drop it. Column 'age' is missing in 15 rows (1.5%); dropping those leaves 985 rows, which is a negligible loss.",
      code: "import pandas as pd\nmiss = df.isna().mean()\nprint(miss.sort_values(ascending=False).head())\ndf = df.drop(columns=miss[miss > 0.6].index)   # mostly-empty columns\ndf = df.dropna(subset=['age'])                  # few missing rows\n# keep rows with at least 5 non-null values\ndf = df.dropna(thresh=5)",
      pros: ["Trivial and needs no assumptions about values", "No fake data introduced"],
      cons: ["Loses information and sample size", "Biased results unless data is MCAR", "Cannot be used if new data will also have gaps"],
      tip: "Deployed models still receive missing values, so dropping rows during training does not remove the need for an imputation strategy at prediction time."
    },
    {
      n: "Mean / median imputation",
      what: "Replace each missing number with the column's mean or median. The mean suits roughly symmetric data; the median is robust to outliers and skew, so it is the safer default. It keeps all rows but shrinks variance and can weaken correlations, because every filled value is identical.",
      how: [
        "Split the data into train and test.",
        "Learn the statistic from the training column only: <code>SimpleImputer(strategy='median').fit(X_train)</code>.",
        "Replace NaN in train and test with that stored value.",
        "Optionally add a missing indicator column."
      ],
      ex: "Salaries = [30, 32, 35, NaN, 400] (in thousands). Mean of the known values = 124.25, which is distorted by 400. Median = (32 + 35) / 2 = 33.5, a much more sensible fill.",
      code: "from sklearn.impute import SimpleImputer\nimp = SimpleImputer(strategy='median')\nnum_cols = ['age', 'salary']\nX_train[num_cols] = imp.fit_transform(X_train[num_cols])  # median from train\nX_test[num_cols] = imp.transform(X_test[num_cols])\nprint(imp.statistics_)  # the learned medians",
      pros: ["Fast, simple, keeps every row", "Median is robust to outliers", "Works inside pipelines"],
      cons: ["Reduces variance and distorts correlations", "Ignores relationships with other features", "Misleading when many values are missing"],
      tip: "Default to median for skewed columns such as income. Always compute it on the training split, not on the whole dataset."
    },
    {
      n: "Mode / most-frequent",
      what: "For categorical columns there is no mean, so you fill gaps with the most common category (the mode). It is simple and keeps the column valid for encoding, but it exaggerates the majority category and hides that the value was unknown. It also works for discrete numeric codes.",
      how: [
        "Compute the most frequent value on the training data.",
        "Use <code>SimpleImputer(strategy='most_frequent')</code>.",
        "Fill NaN in train and test with that same category.",
        "Consider a separate 'Missing' category if many values are missing."
      ],
      ex: "City = [Delhi, Delhi, Mumbai, NaN, Delhi, Pune]. Counts: Delhi 3, Mumbai 1, Pune 1, so the NaN becomes Delhi, giving Delhi 4 of 6 rows (67%).",
      code: "from sklearn.impute import SimpleImputer\nimp = SimpleImputer(strategy='most_frequent')\ncols = ['city', 'colour']\nX_train[cols] = imp.fit_transform(X_train[cols])  # mode learned on train\nX_test[cols] = imp.transform(X_test[cols])\n# pandas alternative\nmode = train['city'].mode()[0]\ntrain['city'] = train['city'].fillna(mode)",
      pros: ["Works for strings and categories", "Very fast and easy"],
      cons: ["Inflates the majority class", "Hides the fact that data was missing", "Poor when no category clearly dominates"],
      tip: "If missingness could be meaningful, use a 'Missing' category instead of the mode so the model can tell the difference."
    },
    {
      n: "Constant / 'Missing' category",
      what: "Fill gaps with a fixed value you choose: 0 for a number, 'Unknown' or 'Missing' for a category. It is correct when the blank itself has a real meaning, such as no garage meaning garage area 0. For categories it turns 'missing' into an ordinary level that the model can learn from.",
      how: [
        "Decide what the blank actually means from domain knowledge.",
        "Pick a constant: 0, -1, or 'Missing'.",
        "<code>SimpleImputer(strategy='constant', fill_value=...)</code> or <code>fillna()</code>.",
        "Apply the same constant to train and test."
      ],
      ex: "GarageArea = [400, NaN, 250, NaN] where NaN means no garage. Filling with 0 gives [400, 0, 250, 0], which is exactly the truth. For Alley = [Grvl, NaN, Pave], filling with 'None' makes three valid categories.",
      code: "from sklearn.impute import SimpleImputer\nnum_imp = SimpleImputer(strategy='constant', fill_value=0)\ncat_imp = SimpleImputer(strategy='constant', fill_value='Missing')\nX_train[['garage_area']] = num_imp.fit_transform(X_train[['garage_area']])\nX_test[['garage_area']] = num_imp.transform(X_test[['garage_area']])\nX_train[['alley']] = cat_imp.fit_transform(X_train[['alley']])\nX_test[['alley']] = cat_imp.transform(X_test[['alley']])",
      pros: ["Preserves the information that data was missing", "Exact when blank truly means zero or none", "Simple"],
      cons: ["A made-up number like 0 or -1 can distort linear and distance models", "Wrong if the blank is genuinely unknown"],
      tip: "Use a constant only when you know what the blank means. For a truly unknown number, combine a neutral fill (median) with a missing indicator instead of 0."
    },
    {
      n: "Missing indicator",
      what: "Add an extra 0/1 column saying whether the original value was missing, then impute the original as usual. This matters when the missingness itself predicts the target (MNAR: missing not at random), for example high earners skipping an income question or sensors failing before a breakdown. The model gets both a filled value and the fact that it was filled.",
      how: [
        "Create flag = 1 if the value is NaN, else 0.",
        "Impute the original column (median, mode, etc.).",
        "Keep both columns as features.",
        "In scikit-learn: <code>SimpleImputer(add_indicator=True)</code> or <code>MissingIndicator</code>."
      ],
      ex: "Income = [50, NaN, 70, NaN] with median 60. Result: income = [50, 60, 70, 60] and income_missing = [0, 1, 0, 1]. If missing incomes default more often, the model can learn that from the flag.",
      code: "from sklearn.impute import SimpleImputer\nimp = SimpleImputer(strategy='median', add_indicator=True)\nX_train_i = imp.fit_transform(X_train[['income', 'age']])\n# columns: income, age, then one flag per column that had NaN in train\nX_test_i = imp.transform(X_test[['income', 'age']])\nprint(X_train_i[:3])\n# pandas version\ndf['income_missing'] = df['income'].isna().astype(int)",
      pros: ["Captures information carried by missingness", "Combines with any imputation method", "Cheap to add"],
      cons: ["Adds extra columns", "Useless noise if missingness is random", "Flag columns can be collinear with each other"],
      tip: "By default the indicator is added only for columns that had missing values in the training data, so a column missing only in test gets no flag. Check the output shape."
    },
    {
      n: "KNN imputation",
      what: "For each row with a gap, find the k most similar rows (using the features that are present) and fill the blank with the average of their values. It uses relationships between features, so the fill is more realistic than a global mean. It is distance-based, so features must be scaled first.",
      how: [
        "Scale the numeric features so no column dominates distance.",
        "For a row with a missing value, compute distance to other rows using the non-missing features.",
        "Take the k nearest rows that have that feature observed.",
        "Fill with their mean (optionally distance-weighted).",
        "Fit on train, transform test."
      ],
      ex: "Rows (height, weight): A (170, 65), B (172, 68), C (190, 95), D (171, NaN). D's nearest neighbours by height are A and B, so with k = 2 the weight is (65 + 68) / 2 = 66.5, not the global mean of 76.",
      code: "from sklearn.impute import KNNImputer\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.pipeline import make_pipeline\nnum = ['height', 'weight', 'age']\npipe = make_pipeline(StandardScaler(),\n                     KNNImputer(n_neighbors=5, weights='distance'))\nX_train_f = pipe.fit_transform(X_train[num])  # NaNs are ignored by the scaler\nX_test_f = pipe.transform(X_test[num])",
      pros: ["Uses relationships between features", "Fills with realistic local values", "Easy to understand"],
      cons: ["Slow on large datasets (distance to all rows)", "Needs scaling and numeric features", "Sensitive to the choice of k and irrelevant features"],
      tip: "Scale first, then impute. Start with k = 5 and compare against median imputation with cross-validation; for big data it is often not worth the cost."
    },
    {
      n: "Iterative / MICE",
      what: "Multiple Imputation by Chained Equations style imputation models each feature with missing values as a function of the other features. It starts with a simple fill, then repeatedly re-predicts each column using a regression until the values stabilise. It captures multivariate structure better than single-column fills.",
      how: [
        "Initial fill each column (for example with the mean).",
        "Pick a column, train a regressor on rows where it is observed using the other columns.",
        "Predict and overwrite that column's missing entries.",
        "Cycle through all columns for several rounds (max_iter) until changes are small.",
        "Fit on train, transform test."
      ],
      ex: "Features age and income are strongly correlated. If a row has age = 40 and income missing, the model fitted on other rows (income ≈ 1500 × age) predicts about 60,000 instead of the global mean 45,000.",
      code: "from sklearn.experimental import enable_iterative_imputer  # required\nfrom sklearn.impute import IterativeImputer\nfrom sklearn.linear_model import BayesianRidge\nimp = IterativeImputer(estimator=BayesianRidge(), max_iter=10, random_state=0)\nX_train_f = imp.fit_transform(X_train[['age', 'income', 'tenure']])\nX_test_f = imp.transform(X_test[['age', 'income', 'tenure']])",
      pros: ["Models correlations between many features", "Flexible: any regressor can be used", "Often more accurate than simple fills"],
      cons: ["Slower and more complex", "Still experimental in scikit-learn", "Single imputation understates uncertainty (true MICE draws multiple datasets)"],
      tip: "Import <code>enable_iterative_imputer</code> before <code>IterativeImputer</code> or you will get an ImportError. Use it when features are clearly related and the dataset is small to medium."
    },
    {
      n: "Forward / backward fill, interpolation",
      what: "In ordered data such as time series, the neighbouring values are the best guess. Forward fill copies the last known value forward, backward fill copies the next value back, and interpolation draws a line (or curve) between the known points. They exploit time-ordering instead of the column's overall average.",
      how: [
        "Sort by time (and by group, such as sensor or customer).",
        "Forward fill: <code>df.ffill()</code>; backward fill: <code>df.bfill()</code>.",
        "Interpolate: <code>df.interpolate(method='linear')</code> or <code>'time'</code> with a datetime index.",
        "Limit the gap length with <code>limit=</code> to avoid long fabricated stretches."
      ],
      ex: "Temperature at hours 1-4 = [20, NaN, NaN, 26]. ffill gives [20, 20, 20, 26]; bfill gives [20, 26, 26, 26]; linear interpolation gives [20, 22, 24, 26].",
      code: "import pandas as pd\ns = pd.Series([20, None, None, 26],\n              index=pd.date_range('2024-01-01', periods=4, freq='h'))\nprint(s.ffill().tolist())                 # [20, 20, 20, 26]\nprint(s.interpolate(method='time').tolist())  # [20, 22, 24, 26]\n# per-group fill for many sensors\ndf = df.sort_values(['sensor', 'time'])\ndf['temp'] = df.groupby('sensor')['temp'].ffill(limit=3)",
      pros: ["Respects time structure", "Simple and fast", "Interpolation gives smooth, plausible values"],
      cons: ["bfill and interpolation use future values (leakage in forecasting)", "Poor for long gaps", "Not meaningful for unordered data"],
      tip: "In forecasting, only forward-fill (past information). Backward fill or interpolation uses the future and leaks it into training. Fill within each group, never across groups."
    },
    {
      n: "Group-wise imputation",
      what: "Fill a gap with a statistic computed from a similar group rather than the whole column. People in the same job, products in the same category or houses in the same neighbourhood resemble each other, so the group median is a sharper guess than the global one. It is a cheap way to use one categorical feature to inform the fill.",
      how: [
        "Choose a grouping column related to the missing feature (job, city, category).",
        "Compute the group median (or mean/mode) on training rows.",
        "Fill each missing value with its group's statistic.",
        "Fall back to the global median for groups unseen or empty in train."
      ],
      ex: "Ages: Engineer = [30, 34, NaN], Student = [20, 22, NaN]. Group medians are 32 and 21, so the NaNs become 32 and 21. The global median (26) would have been a poor fit for both.",
      code: "med = train.groupby('job')['age'].median()       # learned on train only\nglobal_med = train['age'].median()\ndef fill(df):\n    out = df.copy()\n    out['age'] = out['age'].fillna(out['job'].map(med))\n    return out.assign(age=out['age'].fillna(global_med))\ntrain = fill(train)\ntest = fill(test)\n# one-line version when leakage is not a concern:\n# df['age'] = df.groupby('job')['age'].transform(lambda s: s.fillna(s.median()))",
      pros: ["Uses domain structure and is interpretable", "Cheap and fast", "More accurate than a global fill"],
      cons: ["Small groups give unstable statistics", "Needs a fallback for new groups", "Only uses one or a few grouping columns"],
      tip: "The common <code>groupby().transform('median')</code> one-liner on the full DataFrame leaks test information. For modelling, learn group medians on train and map them to test."
    },
    {
      n: "Let the model handle it",
      what: "Some algorithms accept NaN directly. Gradient-boosting libraries (XGBoost, LightGBM, CatBoost) and scikit-learn's <code>HistGradientBoosting</code> learn at each split which branch missing values should follow, so the 'missingness' pattern itself becomes usable. This avoids inventing values and often performs very well.",
      how: [
        "Leave NaN in the numeric features (do not impute).",
        "During training, each split tries sending missing rows left or right and keeps the better option.",
        "At prediction time, NaN follows the learned direction.",
        "Check that your chosen model really supports NaN."
      ],
      ex: "Feature income has values [50, 60, NaN, 80] and the target is default risk. If the NaN rows are mostly defaulters, a split 'income &lt; 55 or missing → high risk' captures this directly without any filled number.",
      code: "import numpy as np\nfrom sklearn.ensemble import HistGradientBoostingClassifier\nX_train = np.array([[50.0], [60.0], [np.nan], [80.0], [np.nan], [90.0]])\ny_train = np.array([0, 0, 1, 0, 1, 0])\nclf = HistGradientBoostingClassifier(max_iter=20, min_samples_leaf=1)\nclf.fit(X_train, y_train)          # NaN handled natively\nprint(clf.predict([[np.nan], [70.0]]))",
      pros: ["No imputation code or bias", "Missingness can be learned as a signal", "Less preprocessing"],
      cons: ["Only some models support it (not linear models, SVM, KNN, classic RandomForest in older versions)", "Harder to inspect what the model did with NaN"],
      tip: "This works only for models that explicitly support NaN. Check the documentation, and still use a pipeline imputer if you plan to swap in a model that does not."
    }
  ];

  D["Outliers"] = [
    {
      n: "Investigate first",
      what: "An outlier is a value far from the rest, but far does not mean wrong. It may be a data-entry error (extra zeros), a sensor glitch, or a genuine rare event such as a billionaire customer or a fraud transaction. The correct action depends on which case it is, so look before changing anything.",
      how: [
        "Visualise: box plot, histogram, scatter plot.",
        "Detect candidates: IQR rule (outside Q1 − 1.5·IQR or Q3 + 1.5·IQR) or |z| &gt; 3.",
        "Inspect the rows: check units, source, and related columns.",
        "Ask a domain expert whether the value is possible.",
        "Then decide: fix, remove, cap, transform, or keep."
      ],
      ex: "Salaries (thousands) = [40, 45, 50, 55, 60, 99999]. Q1 = 45, Q3 = 60, IQR = 15, upper fence = 60 + 22.5 = 82.5, so 99999 is flagged. A check shows it was typed as 99,999 instead of 99.9, so it is a typo to fix, not a real value.",
      code: "import pandas as pd\nq1, q3 = df['salary'].quantile([0.25, 0.75])\niqr = q3 - q1\nlow, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr\nsuspects = df[(df['salary'] < low) | (df['salary'] > high)]\nprint(len(suspects), 'candidate outliers')\nprint(suspects.sort_values('salary').tail())  # inspect before acting\ndf['salary'].plot(kind='box')",
      pros: ["Avoids deleting real, valuable data", "Finds data-quality bugs early"],
      cons: ["Manual and needs domain knowledge", "Rules of thumb (1.5·IQR, 3σ) flag valid points in skewed data"],
      tip: "Never auto-delete outliers because a rule flagged them. Log the reason for every change so the cleaning is reproducible and explainable."
    },
    {
      n: "Remove (trimming)",
      what: "Trimming drops rows whose value lies outside an accepted range, defined by domain limits, the IQR fences or a z-score threshold. It is appropriate when the points are clearly errors and you have plenty of data. It makes mean-based and least-squares models more stable, but it permanently loses rows.",
      how: [
        "Compute fences: IQR rule, or z = (x − mean) / std with |z| &gt; 3.",
        "Compute the thresholds from the training data only.",
        "Filter training rows inside the fences: <code>df[(x &gt;= low) &amp; (x &lt;= high)]</code>.",
        "Compare model quality and sample size before and after."
      ],
      ex: "Ages = [25, 30, 28, 35, 31, 240]. Mean = 64.8, std = 83.6 so z for 240 is 2.1 (std itself is inflated by the outlier!). With the IQR rule: Q1 = 28.5, Q3 = 34, IQR = 5.5, upper fence = 42.25, so 240 is removed, leaving 5 rows.",
      code: "q1, q3 = train['age'].quantile([0.25, 0.75])\niqr = q3 - q1\nlow, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr\nmask = train['age'].between(low, high)\nprint('removed', (~mask).sum(), 'rows')\ntrain_clean = train[mask]\n# do NOT trim the test set: it should represent real-world data\n# z-score alternative\nz = (train['age'] - train['age'].mean()) / train['age'].std()\ntrain_z = train[z.abs() <= 3]",
      pros: ["Simple and effective for genuine errors", "Improves linear model fit"],
      cons: ["Loses data and may remove rare but real cases", "Z-score is distorted by the outliers it tries to find", "Introduces bias if outliers are informative"],
      tip: "Trim only the training data; the test set and production data will contain outliers too, and the model must cope with them. Prefer the IQR or median-based rules over z-scores on skewed data."
    },
    {
      n: "Capping / winsorisation",
      what: "Instead of deleting an extreme row, clip its value to a limit, typically the 1st and 99th percentile. The row stays, but its influence is bounded. This is called winsorising (strictly, replacing by the nearest allowed value). It is a good compromise when extremes are plausible but too influential.",
      how: [
        "Choose limits: percentiles (1% / 99%), IQR fences, or domain limits.",
        "Learn the limits from the training data.",
        "Clip: values below the lower limit become the lower limit, values above become the upper limit.",
        "Apply the same limits to test data."
      ],
      ex: "Incomes = [20, 25, 30, 35, 40, 500] (thousands). Suppose a domain cap of 100 is chosen. Capping turns 500 into 100, so the mean drops from 108.3 to 41.7 while all six rows are kept.",
      code: "lo, hi = X_train['income'].quantile([0.01, 0.99])   # learn on train\nX_train['income'] = X_train['income'].clip(lo, hi)\nX_test['income'] = X_test['income'].clip(lo, hi)    # reuse same limits\n# or as a reusable transformer step\nimport numpy as np\nfrom sklearn.preprocessing import FunctionTransformer\ncap = FunctionTransformer(lambda a: np.clip(a, lo, hi))",
      pros: ["Keeps all rows", "Limits the influence of extremes", "Very easy to implement"],
      cons: ["Distorts the true values and distribution tails", "Percentile choice is arbitrary", "Creates a pile-up at the cap value"],
      tip: "Learn the clip limits on train and reuse them on test. Consider adding an outlier flag so the model still knows the value was extreme."
    },
    {
      n: "Transform",
      what: "A monotonic transform such as log, square root or Box-Cox compresses large values more than small ones, so a long right tail becomes closer to symmetric and extremes no longer dominate. All rows are kept and their order is unchanged. It is especially natural for quantities that grow multiplicatively, like prices and incomes.",
      how: [
        "Check skew: histogram or <code>df[c].skew()</code>.",
        "Positive data: <code>np.log1p(x)</code> = ln(1 + x), which also handles zeros.",
        "Data with negatives: Yeo-Johnson via <code>PowerTransformer</code>.",
        "Re-check the distribution, and invert predictions if the target was transformed."
      ],
      ex: "Prices = [10, 20, 30, 40, 10000]. After log10: [1, 1.30, 1.48, 1.60, 4]. The outlier is now 4 versus 1.6 instead of 10000 versus 40, so it is far less dominant.",
      code: "import numpy as np\nfrom sklearn.preprocessing import PowerTransformer\nX_train['price_log'] = np.log1p(X_train['price'])\nX_test['price_log'] = np.log1p(X_test['price'])\n# learned power transform (handles zeros and negatives)\npt = PowerTransformer(method='yeo-johnson')\nX_train[['income']] = pt.fit_transform(X_train[['income']])\nX_test[['income']] = pt.transform(X_test[['income']])",
      pros: ["Keeps every row", "Reduces skew and the pull of extremes", "Often improves linear models"],
      cons: ["Changes interpretation (effects become multiplicative)", "log fails for values &le; -1 with log1p", "Does not help symmetric outliers"],
      tip: "If you transform the target, remember to invert predictions (<code>np.expm1</code>). Tree models do not need transforms for outliers."
    },
    {
      n: "Binning",
      what: "Binning (discretisation) converts a numeric column into ranges, so every extreme value simply falls into the first or last bin. The exact size of an outlier stops mattering. It also lets simple models capture non-linear effects, at the cost of throwing away fine detail.",
      how: [
        "Choose bins: equal-width (<code>pd.cut</code>) or equal-frequency quantiles (<code>pd.qcut</code>).",
        "Learn the bin edges from training data.",
        "Assign each value to its bin; extremes land in the edge bins.",
        "Treat bins as ordinal numbers or one-hot encode them."
      ],
      ex: "Ages = [22, 25, 31, 38, 45, 90] cut into quantile bins [0-30, 30-40, 40+] give bins 0, 0, 1, 1, 2, 2. The age 90 simply joins the 40+ group.",
      code: "import pandas as pd\nfrom sklearn.preprocessing import KBinsDiscretizer\n# pandas: quantile bins with open-ended edges\nedges = X_train['age'].quantile([0, .25, .5, .75, 1]).values\nedges[0], edges[-1] = -float('inf'), float('inf')\nX_test['age_bin'] = pd.cut(X_test['age'], bins=edges, labels=False)\n# sklearn: fit on train, transform test\nkb = KBinsDiscretizer(n_bins=4, encode='ordinal', strategy='quantile')\nX_train[['age_bin']] = kb.fit_transform(X_train[['age']])",
      pros: ["Neutralises extreme magnitudes", "Easy to explain (age bands)", "Captures non-linear patterns in linear models"],
      cons: ["Loses detail inside bins", "Bin edges are arbitrary", "Values near edges can jump bins"],
      tip: "Use <code>qcut</code>-style edges learned from the training set and reuse them on test data, otherwise the same value may fall into different bins."
    },
    {
      n: "Outlier flag",
      what: "Add a 0/1 column marking which rows are outliers, and optionally cap the original value as well. When extremes carry signal, such as a fraudulent transaction amount, deleting or squashing them throws that signal away, while the flag lets the model learn it explicitly.",
      how: [
        "Define the rule: |z| &gt; 3, IQR fences, or a domain threshold.",
        "Learn the thresholds from training data.",
        "Create <code>is_outlier</code> = 1 if outside the limits, else 0.",
        "Optionally cap or transform the original column too."
      ],
      ex: "Transaction amounts = [20, 35, 40, 25, 5000]. With IQR fences of 0 and 60, the flags are [0, 0, 0, 0, 1]. If most fraud cases carry flag 1, the model learns it directly even after the amount is capped.",
      code: "q1, q3 = X_train['amount'].quantile([0.25, 0.75])\niqr = q3 - q1\nlow, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr\nfor d in (X_train, X_test):\n    d['amount_outlier'] = ((d['amount'] < low) | (d['amount'] > high)).astype(int)\n    d['amount'] = d['amount'].clip(low, high)   # also limit its influence\nprint(X_train['amount_outlier'].mean())",
      pros: ["Keeps the signal that extremes carry", "Works alongside capping or transforms", "Cheap and interpretable"],
      cons: ["Extra feature; useless if outliers are just noise", "Needs a sensible threshold"],
      tip: "Compute the threshold on the training data only. A flag derived from the whole dataset leaks information about the test distribution."
    },
    {
      n: "Robust models / losses",
      what: "Instead of changing the data, pick methods that are naturally insensitive to extremes. Tree-based models split on thresholds, so a huge value is just 'greater than' a cut. Huber loss behaves like squared error for small residuals and like absolute error for large ones, and RobustScaler uses median and IQR. This is useful when outliers are numerous and legitimate.",
      how: [
        "Trees and forests: a huge value affects only which side of a split it falls on.",
        "Huber loss: quadratic for |error| &le; δ, linear beyond, so big errors have limited pull.",
        "Median-based scaling: x' = (x − median) / IQR.",
        "Other options: quantile regression, RANSAC, L1 (absolute) loss."
      ],
      ex: "Data y = [10, 11, 12, 13, 500] fitted by a constant: least squares gives the mean 109.2, which is far from 4 of 5 points, while an absolute-error (median) fit gives 12. Huber regression gives a result close to 12 as well.",
      code: "import numpy as np\nfrom sklearn.linear_model import HuberRegressor, LinearRegression\nX = np.arange(10).reshape(-1, 1)\ny = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 100.0])   # last point is an outlier\nprint('OLS  :', LinearRegression().fit(X, y).coef_)\nprint('Huber:', HuberRegressor().fit(X, y).coef_)  # slope stays near 1\nfrom sklearn.preprocessing import RobustScaler\nscaler = RobustScaler().fit(X_train)  # median/IQR from train",
      pros: ["Keeps all data unchanged", "Needs little manual outlier handling", "Good when outliers are frequent and genuine"],
      cons: ["Slightly less efficient when data is clean", "Extra hyperparameters (such as epsilon)", "Predictions on extreme inputs may still be poor"],
      tip: "Evaluate with a metric that matches your goal (MAE for robustness, RMSE if large errors truly matter). Tree models are robust to outliers in features, but not to outliers in the target when using squared error."
    }
  ];
})();
