/* Inserts "EDA" and "Feature Engineering" slides before the "Data & Features" slide. Must run before app.js. */
(function () {
  "use strict";

  // card = [title, plain-English meaning, when to use / why, code or example]
  var EDA = {
    id: "eda",
    title: "EDA",
    full: "Exploratory Data Analysis (EDA)",
    emoji: "🔍",
    lead: "Before building any model, a data scientist <b>interviews the data</b>: what is in it, what is broken, what is surprising and which columns relate to the target. EDA = looking, counting, plotting and questioning.",
    tabs: [
      { name: "What & Why", intro: "EDA is like a doctor's check-up for your dataset – you examine it before prescribing a model.", cards: [
        ["🎯 Goal", "Understand structure, quality and patterns of the data.", "Always – it is the first step of every ML project.", "Garbage in → garbage out"],
        ["🧾 Ask questions", "What does one row represent? What is the target? How was data collected? What period does it cover?", "Start of the project, with domain experts.", "1 row = 1 customer per month"],
        ["🗺️ EDA workflow", "1 Understand → 2 Clean / check quality → 3 Univariate → 4 Bivariate → 5 Multivariate → 6 Summarise insights.", "Use as a checklist.", "Write findings in a notebook"],
        ["💡 Outputs of EDA", "Data-quality issues, hypotheses, feature ideas, choice of metric and model, cleaning plan.", "Feeds Feature Engineering and modelling.", "\"Income is skewed → log-transform\""],
        ["📊 Descriptive vs. inferential", "Descriptive = summarise what you see. Inferential = test whether patterns are real (statistical tests).", "Use tests when a decision depends on the pattern.", "t-test, chi-square"],
        ["⚠️ Golden rule", "Do deep EDA on the training split only, so the test set stays an honest \"exam\".", "Prevents data leakage.", "train_test_split first"]
      ]},
      { name: "Understand the Data", intro: "Get the big picture: size, columns, types and meaning.", cards: [
        ["📐 Shape", "Number of rows (examples) and columns (features).", "First command you run.", "df.shape"],
        ["🔤 Data types", "Numeric (continuous / discrete), categorical (nominal / ordinal), date-time, text, boolean, IDs.", "Decides which plots, statistics and encodings apply.", "df.dtypes, df.info()"],
        ["👀 Peek at rows", "Look at real examples to spot oddities quickly.", "Always.", "df.head(), df.sample(5)"],
        ["📋 Summary statistics", "Count, mean, std, min, quartiles, max for numbers; unique / top / freq for categories.", "Spot impossible values (age = −3) and scales.", "df.describe(include='all')"],
        ["📖 Data dictionary", "Meaning, unit and source of each column.", "Prevents misinterpreting columns.", "price = INR, incl. tax"],
        ["🎯 Target variable", "What we predict; its type decides regression vs. classification.", "Check its distribution early.", "df['churn'].value_counts(normalize=True)"],
        ["🔢 Cardinality", "Number of unique values per column.", "High-cardinality categories need special encoding; columns with 1 value are useless.", "df.nunique()"],
        ["🧱 Granularity & keys", "What makes a row unique; duplicates of the key = problem.", "Before joins and aggregations.", "df['id'].is_unique"]
      ]},
      { name: "Data Quality", intro: "Find what is missing, wrong, duplicated or extreme.", cards: [
        ["❓ Missing values", "Count and % of empty cells per column; visualise patterns.", "Decide drop vs. impute.", "df.isna().mean().sort_values()"],
        ["🧩 Why is it missing?", "MCAR = completely random; MAR = depends on other columns; MNAR = depends on the missing value itself.", "MNAR often means \"missing\" is itself a signal → add an indicator.", "Rich people skip the income question (MNAR)"],
        ["👯 Duplicates", "Exact or near-duplicate rows inflate patterns and leak between train and test.", "Before splitting.", "df.duplicated().sum()"],
        ["🏷️ Inconsistent categories", "Same thing spelled differently: 'NY', 'New York', 'new york '.", "Clean before encoding.", "df['city'].str.strip().str.lower()"],
        ["🔧 Wrong types", "Numbers stored as text, dates as strings, '1,200' with commas.", "Fix before analysis.", "pd.to_numeric, pd.to_datetime"],
        ["🚫 Invalid values", "Impossible or placeholder values: age 200, −1, 9999, 'N/A'.", "Domain rules / range checks.", "df.query('age < 0 or age > 110')"],
        ["📍 Outliers – IQR rule", "Outside Q1 − 1.5·IQR or Q3 + 1.5·IQR (IQR = Q3 − Q1).", "Robust, works for skewed data.", "Box plot whiskers"],
        ["📏 Outliers – Z-score", "z = (x − mean) / std; |z| > 3 is unusual.", "Roughly normal data.", "scipy.stats.zscore"],
        ["🕵️ Data leakage check", "Columns that would not be known at prediction time, or are copies of the target.", "Before modelling – leakage gives fake-perfect scores.", "'refund_issued' predicting 'complaint'"],
        ["⏳ Time consistency / drift", "Distribution of features changes over time.", "Data spanning months/years.", "Compare stats per month"]
      ]},
      { name: "Univariate", intro: "Look at one column at a time.", cards: [
        ["📍 Central tendency", "Mean (average), median (middle value), mode (most common).", "Median is safer with skew/outliers.", "Income: mean ≫ median → right-skewed"],
        ["↔️ Spread", "Range, variance, standard deviation, IQR, coefficient of variation.", "How much values vary.", "df['x'].std()"],
        ["📐 Percentiles / quantiles", "Value below which p% of data falls (P25, P50, P75, P99).", "Thresholds, capping, SLA metrics.", "df['x'].quantile([.01,.5,.99])"],
        ["↗️ Skewness", "Asymmetry: > 0 long right tail, < 0 long left tail, ≈ 0 symmetric.", "|skew| > 1 → consider log / Box-Cox.", "df['x'].skew()"],
        ["🏔️ Kurtosis", "How heavy the tails are (how many extreme values).", "High kurtosis → many outliers.", "df['x'].kurt()"],
        ["📊 Histogram / KDE", "Shape of a numeric distribution (normal, skewed, bimodal).", "Every numeric column.", "sns.histplot(df, x='x', kde=True)"],
        ["📦 Box / violin plot", "Median, quartiles and outliers at a glance.", "Compare spread, spot outliers.", "sns.boxplot(x=df['x'])"],
        ["📈 Q-Q plot", "Compares data to a normal distribution – straight line = normal.", "Check normality assumptions.", "scipy.stats.probplot"],
        ["🔠 Frequency / bar chart", "Counts and % per category.", "Every categorical column.", "df['c'].value_counts()"],
        ["🐜 Rare categories", "Categories with very few rows (< 1%).", "Group them into 'Other' later.", "value_counts(normalize=True) < 0.01"]
      ]},
      { name: "Bivariate & Multivariate", intro: "Look at relationships – especially between each feature and the target.", cards: [
        ["🔵 Num ↔ Num: scatter plot", "Each point = one row; shows trend, clusters, non-linearity.", "Two numeric columns.", "sns.scatterplot(x='age', y='income')"],
        ["📏 Pearson correlation", "Strength of a <b>linear</b> relationship, −1 to +1.", "Linear, roughly normal data.", "df.corr(numeric_only=True)"],
        ["🪜 Spearman / Kendall", "Rank-based correlation; captures monotonic (always up / down) relationships.", "Skewed data or ordinal values.", "df.corr(method='spearman')"],
        ["🌡️ Correlation heatmap", "Colour grid of all pairwise correlations.", "Find redundant features and strong predictors.", "sns.heatmap(df.corr(), annot=True)"],
        ["📦 Cat ↔ Num: grouped box / violin", "Distribution of a number for each category.", "e.g. salary by job title.", "sns.boxplot(x='job', y='salary')"],
        ["🧪 t-test / ANOVA", "Are group means really different, or is it chance? (p-value < 0.05 → likely real)", "2 groups → t-test; 3+ → ANOVA.", "scipy.stats.f_oneway"],
        ["🔲 Cat ↔ Cat: crosstab", "Count table of two categories; stacked bar chart.", "e.g. churn by plan type.", "pd.crosstab(df.plan, df.churn, normalize='index')"],
        ["χ² Chi-square & Cramér's V", "Tests whether two categoricals are related; Cramér's V gives strength (0–1).", "Categorical feature vs. categorical target.", "scipy.stats.chi2_contingency"],
        ["🔗 Mutual information", "Measures any kind of dependency (linear or not).", "Rank features vs. target.", "mutual_info_classif"],
        ["🧮 Pair plot", "Scatter plots of every pair, coloured by target.", "Small number of features.", "sns.pairplot(df, hue='target')"],
        ["🔁 Multicollinearity (VIF)", "Variance Inflation Factor; VIF > 5–10 = feature is explained by others.", "Before linear / logistic regression.", "statsmodels variance_inflation_factor"],
        ["🌌 PCA / t-SNE / UMAP plots", "Squash many dimensions into 2-D to see clusters / separability.", "High-dimensional data.", "TSNE(n_components=2)"]
      ]},
      { name: "Target & Special Data", intro: "Extra checks depending on the problem type.", cards: [
        ["⚖️ Class imbalance", "One class is rare (fraud 0.5%).", "Changes metric (F1, PR-AUC) and needs resampling / class weights.", "y.value_counts(normalize=True)"],
        ["📉 Skewed numeric target", "Long-tailed target (prices, sales).", "Log-transform target, use MAE / RMSLE.", "np.log1p(y)"],
        ["📅 Time series: trend & seasonality", "Long-term direction and repeating patterns (weekly, yearly).", "Any time-indexed data.", "seasonal_decompose"],
        ["🔂 Autocorrelation (ACF / PACF)", "How much today relates to previous days.", "Choosing lags for forecasting.", "plot_acf(series)"],
        ["〰️ Stationarity", "Mean/variance constant over time (ADF test).", "Classical forecasting models.", "adfuller(series)"],
        ["📝 Text data", "Document length, word frequencies, n-grams, word clouds, language.", "NLP problems.", "Counter(text.split())"],
        ["🖼️ Image data", "Image sizes, class balance, sample grid, brightness, corrupt files.", "Computer vision.", "Plot 5 images per class"],
        ["🗺️ Geospatial data", "Plot points on a map, density, region-level stats.", "Location columns.", "plotly scatter_mapbox"]
      ]},
      { name: "Which Plot When?", intro: "A quick guide for picking the right chart.", table: [
        ["Question", "Data", "Best chart"],
        ["How is one number distributed?", "1 numeric", "Histogram, KDE, box plot"],
        ["How common is each category?", "1 categorical", "Bar chart (sorted)"],
        ["Do two numbers move together?", "2 numeric", "Scatter plot, hexbin, heatmap of correlations"],
        ["Does a number differ by group?", "numeric + categorical", "Box / violin / bar of means"],
        ["Are two categories related?", "2 categorical", "Crosstab, stacked / grouped bar, mosaic"],
        ["How does it change over time?", "date + numeric", "Line chart, rolling average"],
        ["Where are the missing values?", "all columns", "Missingness matrix / heatmap (missingno)"],
        ["Many features at once?", "many numeric", "Pair plot, correlation heatmap, PCA / t-SNE"],
        ["Composition of a whole?", "categorical %", "Stacked bar (avoid pie with many slices)"]
      ]},
      { name: "Tools & Code", intro: "Popular Python tools for fast EDA.", code:
        "import pandas as pd, seaborn as sns, matplotlib.pyplot as plt\n\n" +
        "df = pd.read_csv('data.csv')\n" +
        "df.shape; df.info(); df.head()\n" +
        "df.describe(include='all').T          # summary stats\n" +
        "df.isna().mean().sort_values()        # % missing\n" +
        "df.duplicated().sum()                 # duplicates\n" +
        "df.nunique()                          # cardinality\n" +
        "df['target'].value_counts(normalize=True)\n\n" +
        "sns.histplot(df, x='income', kde=True)\n" +
        "sns.boxplot(data=df, x='plan', y='income')\n" +
        "sns.heatmap(df.corr(numeric_only=True), annot=True, cmap='coolwarm')\n" +
        "plt.show()\n\n" +
        "# One-line automatic report\n" +
        "from ydata_profiling import ProfileReport\n" +
        "ProfileReport(df).to_file('eda_report.html')",
        cards: [
          ["🐼 pandas", "Load, inspect, filter and summarise tables.", "Always.", "pd.read_csv"],
          ["🎨 matplotlib / seaborn", "Static statistical charts.", "Notebook analysis.", "sns.histplot"],
          ["🖱️ plotly", "Interactive zoomable charts.", "Presentations / dashboards.", "px.scatter"],
          ["⚡ ydata-profiling, Sweetviz, D-Tale", "Automatic full EDA reports in one line.", "Quick first look.", "ProfileReport(df)"],
          ["🕳️ missingno", "Visualise missing-value patterns.", "Columns with gaps.", "msno.matrix(df)"],
          ["📐 scipy / statsmodels", "Statistical tests (t-test, chi-square, ADF, VIF).", "Confirm patterns.", "stats.ttest_ind"]
        ]}
    ]
  };

  var FE = {
    id: "feature-engineering",
    title: "Feature Engineering",
    full: "Feature Engineering",
    emoji: "🛠️",
    lead: "Feature engineering turns raw columns into <b>signals a model can learn from</b>: filling gaps, converting text to numbers, rescaling, creating new informative columns and keeping only the useful ones. Good features often beat fancy algorithms.",
    tabs: [
      { name: "Overview", intro: "Think of it as preparing ingredients before cooking – cleaned, cut and measured.", cards: [
        ["🧹 Clean", "Handle missing values, outliers, wrong types.", "First.", "Imputation, capping"],
        ["🔤 Encode", "Turn categories and text into numbers.", "Models only understand numbers.", "One-hot, target encoding"],
        ["📏 Scale / transform", "Put features on comparable scales and fix skew.", "Distance / gradient based models.", "StandardScaler, log"],
        ["✨ Create", "Build new features from domain knowledge, dates, ratios, aggregations.", "Biggest accuracy gains.", "price_per_sqft"],
        ["✂️ Select / reduce", "Remove noisy, redundant or leaky features.", "Many features, overfitting, speed.", "RFE, PCA"],
        ["⚖️ Balance", "Handle rare classes.", "Imbalanced classification.", "SMOTE, class_weight"],
        ["🔒 Fit on train only", "Learn means, encodings, scalers from training data; apply to test.", "Always – avoids leakage.", "Pipeline + ColumnTransformer"]
      ]},
      { name: "Missing Values", intro: "Imputation = filling in the blanks sensibly.", cards: [
        ["🗑️ Drop rows / columns", "Remove rows with gaps, or columns that are mostly empty (> 60–70%).", "Few missing rows, or useless column.", "df.dropna(); df.drop(columns=...)"],
        ["➗ Mean / median imputation", "Fill numbers with the average or middle value.", "Median for skewed data.", "SimpleImputer(strategy='median')"],
        ["🔁 Mode / most-frequent", "Fill categories with the most common value.", "Categorical columns.", "strategy='most_frequent'"],
        ["🏷️ Constant / 'Missing' category", "Fill with a fixed value like 0 or 'Unknown'.", "Missing has meaning (no garage → 0).", "strategy='constant'"],
        ["🚩 Missing indicator", "Extra 0/1 column saying \"this was missing\".", "When missingness is informative (MNAR).", "SimpleImputer(add_indicator=True)"],
        ["👥 KNN imputation", "Fill using values of the k most similar rows.", "Related features, medium data size.", "KNNImputer(n_neighbors=5)"],
        ["🔄 Iterative / MICE", "Predict each missing column from the others, repeat.", "Complex dependencies.", "IterativeImputer()"],
        ["⏩ Forward / backward fill, interpolation", "Use the previous / next / in-between value.", "Time series.", "df.ffill(); df.interpolate()"],
        ["🧠 Group-wise imputation", "Fill with the median of a similar group.", "e.g. fill age by job title.", "groupby('job')['age'].transform('median')"],
        ["🌲 Let the model handle it", "XGBoost, LightGBM, CatBoost, HistGradientBoosting learn where to send NaNs.", "Tree-boosting models.", "No imputation needed"]
      ]},
      { name: "Encoding Categories", intro: "Converting labels like 'Red', 'Green' or 'Mumbai' into numbers.", cards: [
        ["🔥 One-hot encoding", "One 0/1 column per category.", "Nominal, low cardinality (< ~15). Linear models, KNN, NN.", "OneHotEncoder(handle_unknown='ignore')"],
        ["➖ Dummy encoding", "One-hot minus one column (avoids the dummy-variable trap).", "Linear regression without regularisation.", "pd.get_dummies(drop_first=True)"],
        ["🔢 Label encoding", "Each category → an integer (0, 1, 2…).", "Target labels or tree models.", "LabelEncoder()"],
        ["🪜 Ordinal encoding", "Integers that respect a natural order.", "Low < Medium < High, education levels.", "OrdinalEncoder(categories=[[...]])"],
        ["🎯 Target / mean encoding", "Replace category with the average target of that category (smoothed, cross-fitted).", "High cardinality (zip codes). Beware leakage.", "TargetEncoder()  # sklearn ≥ 1.3"],
        ["📊 Frequency / count encoding", "Replace category with how often it appears.", "High cardinality; popularity matters.", "df['c'].map(df['c'].value_counts())"],
        ["💾 Binary encoding", "Category id written in binary across a few columns.", "Medium–high cardinality, fewer columns than one-hot.", "category_encoders.BinaryEncoder"],
        ["#️⃣ Hashing trick", "Hash categories into a fixed number of columns.", "Huge / streaming vocabularies.", "FeatureHasher(n_features=32)"],
        ["🙈 Leave-one-out / CatBoost encoding", "Target encoding that excludes the current row to reduce leakage.", "High cardinality with tree models.", "category_encoders.LeaveOneOutEncoder"],
        ["⚖️ Weight of Evidence (WoE)", "ln(% good / % bad) per category.", "Credit scoring with logistic regression.", "category_encoders.WOEEncoder"],
        ["🧬 Entity embeddings", "Learned dense vectors per category inside a neural net.", "Many categories, deep learning.", "nn.Embedding"],
        ["🐜 Rare-label grouping", "Merge infrequent categories into 'Other'.", "Before one-hot to reduce columns.", "OneHotEncoder(min_frequency=0.01)"]
      ]},
      { name: "Scaling & Transforms", intro: "Change the scale or shape of numbers so models learn better.", cards: [
        ["📏 Standardisation (Z-score)", "z = (x − mean) / std → mean 0, std 1.", "Linear/logistic, SVM, KNN, PCA, NN.", "StandardScaler()"],
        ["📦 Min-Max scaling", "x' = (x − min) / (max − min) → range 0–1.", "Neural nets, images, bounded features.", "MinMaxScaler()"],
        ["🛡️ Robust scaling", "Uses median and IQR instead of mean and std.", "Data with outliers.", "RobustScaler()"],
        ["➗ MaxAbs scaling", "Divide by max |x| → −1 to 1; keeps zeros.", "Sparse data.", "MaxAbsScaler()"],
        ["🧭 Normalisation (unit vector)", "Each row scaled to length 1.", "Text vectors, cosine similarity.", "Normalizer(norm='l2')"],
        ["🪵 Log transform", "log(1 + x) squashes long right tails.", "Skewed positives: income, prices, counts.", "np.log1p(x)"],
        ["√ Square-root / reciprocal", "Milder skew fixes.", "Counts, moderate skew.", "np.sqrt(x)"],
        ["📈 Box-Cox", "Finds the best power transform (positive values only).", "Make data more normal.", "PowerTransformer(method='box-cox')"],
        ["📉 Yeo-Johnson", "Like Box-Cox but allows zero and negatives.", "Mixed-sign skewed data.", "PowerTransformer()"],
        ["🎚️ Quantile transform", "Maps values to a uniform or normal distribution by rank.", "Very irregular distributions.", "QuantileTransformer(output_distribution='normal')"],
        ["🌲 Trees don't need it", "Tree-based models are scale-invariant.", "Save effort for Forest / Boosting.", "—"]
      ]},
      { name: "Outliers", intro: "Extreme values: errors to fix or rare truths to keep?", cards: [
        ["🔍 Investigate first", "Data-entry error or a real extreme event?", "Always – never delete blindly.", "Salary = 99,999,999 ?"],
        ["🗑️ Remove (trimming)", "Drop rows outside a threshold.", "Clear errors, plenty of data.", "IQR or |z| > 3"],
        ["✂️ Capping / winsorisation", "Clip to e.g. 1st and 99th percentile.", "Keep the row, limit its influence.", "x.clip(x.quantile(.01), x.quantile(.99))"],
        ["🪵 Transform", "Log / Box-Cox pulls extremes closer.", "Skewed positive data.", "np.log1p(x)"],
        ["🧺 Binning", "Put values into ranges so extremes land in the last bin.", "Interpretable models.", "pd.qcut(x, 10)"],
        ["🚩 Outlier flag", "Add 0/1 \"is_outlier\" feature.", "When extremes carry signal (fraud).", "(z.abs() > 3).astype(int)"],
        ["🛡️ Robust models / losses", "Tree models, Huber loss, RobustScaler.", "Many natural outliers.", "HuberRegressor()"]
      ]},
      { name: "Creating Features", intro: "Domain knowledge + creativity = new columns that make patterns obvious.", cards: [
        ["🧺 Binning / discretisation", "Turn numbers into ranges: equal-width, equal-frequency (quantile), k-means, or domain bins.", "Non-linear effects for linear models; age groups.", "KBinsDiscretizer(n_bins=5, strategy='quantile')"],
        ["✖️ Interaction features", "Multiply / combine two features.", "Effect of one depends on another.", "area = length × width"],
        ["🔺 Polynomial features", "x², x³, x₁·x₂ to capture curves.", "Linear models on curved data.", "PolynomialFeatures(degree=2)"],
        ["➗ Ratios & differences", "Divide or subtract related columns.", "Often the real signal.", "debt_to_income, price_per_sqft, BMI"],
        ["Σ Aggregations (group-by)", "Count, mean, max, std per customer / store / day.", "Transactional / relational data.", "groupby('cust')['amt'].agg(['mean','max','count'])"],
        ["📅 Date-time parts", "Year, month, day, weekday, hour, quarter, is_weekend, is_holiday.", "Any timestamp.", "df['dt'].dt.dayofweek"],
        ["🕐 Cyclical encoding", "sin / cos of hour or month so 23:00 is close to 00:00.", "Periodic features.", "sin(2π·hour/24), cos(2π·hour/24)"],
        ["⏱️ Time since / until", "Days since signup, since last purchase, until expiry.", "Customer behaviour (recency).", "(today − last_buy).dt.days"],
        ["🔙 Lag & rolling features", "Previous values and moving averages / std over windows.", "Time-series forecasting.", "s.shift(1); s.rolling(7).mean()"],
        ["🛒 RFM features", "Recency, Frequency, Monetary value per customer.", "Marketing, churn, CLV.", "R = days since last order"],
        ["📝 Text: Bag-of-Words / TF-IDF", "Count words, weight rare-but-important words higher; n-grams capture phrases.", "Classic NLP.", "TfidfVectorizer(ngram_range=(1,2))"],
        ["🧠 Text: embeddings", "Dense vectors capturing meaning (Word2Vec, BERT, sentence-transformers).", "Semantic similarity, modern NLP.", "model.encode(texts)"],
        ["🔡 Text: simple stats", "Length, word count, % capitals, punctuation, sentiment score.", "Spam, reviews.", "df.text.str.len()"],
        ["🖼️ Image features", "Pixels, colour histograms, edges, or CNN embeddings; augmentation (flip, rotate, crop).", "Computer vision.", "ResNet features"],
        ["🗺️ Geospatial features", "Distance to a point (haversine), clusters of locations, region stats.", "Delivery, real estate.", "distance_to_city_centre"],
        ["🤖 Automated FE", "Tools that generate many candidate features automatically.", "Relational data, quick exploration.", "Featuretools (deep feature synthesis)"]
      ]},
      { name: "Feature Selection", intro: "Keep the features that help; drop the noise. Fewer features = faster, simpler, less overfitting.", cards: [
        ["🧹 Variance threshold", "Drop (near-)constant columns.", "Quick first filter.", "VarianceThreshold(0.01)"],
        ["🔗 Correlation filter", "Drop one of two highly correlated features (|r| > 0.9).", "Redundant features, linear models.", "df.corr().abs()"],
        ["χ² Chi-square test", "Dependency of non-negative feature and categorical target.", "Text counts, categorical data.", "SelectKBest(chi2, k=20)"],
        ["📊 ANOVA F-test", "Do feature means differ across target classes?", "Numeric features, classification.", "SelectKBest(f_classif)"],
        ["🔀 Mutual information", "Any dependency (linear or not) with the target.", "General-purpose filter.", "mutual_info_classif"],
        ["🔁 RFE (recursive elimination)", "Train, drop the weakest feature, repeat.", "Wrapper method, medium feature count.", "RFECV(estimator, cv=5)"],
        ["➡️ Forward / backward selection", "Add (or remove) one feature at a time while the score improves.", "Small feature sets.", "SequentialFeatureSelector"],
        ["🎯 Lasso (L1) selection", "Weights pushed to exactly 0 are dropped.", "Embedded method for linear models.", "SelectFromModel(Lasso(alpha=0.01))"],
        ["🌲 Tree importance", "Features that reduce impurity most.", "Embedded method for tree models.", "model.feature_importances_"],
        ["🔀 Permutation importance", "Shuffle a feature; how much does the score drop?", "Model-agnostic, more reliable.", "permutation_importance(model, X, y)"],
        ["🧩 SHAP values", "Contribution of each feature to each prediction.", "Explainability and selection.", "shap.TreeExplainer(model)"],
        ["🌀 Dimensionality reduction", "PCA (unsupervised), LDA (uses labels), autoencoders; t-SNE / UMAP for visualisation.", "Too many correlated features.", "PCA(n_components=0.95)"]
      ]},
      { name: "Imbalanced Data", intro: "When one class is rare, models ignore it – these techniques fix that.", cards: [
        ["⚖️ Class weights", "Make mistakes on the rare class cost more.", "First thing to try; no new data.", "class_weight='balanced'"],
        ["⬆️ Random oversampling", "Duplicate rare-class rows.", "Small data.", "RandomOverSampler()"],
        ["⬇️ Random undersampling", "Drop common-class rows.", "Very large data.", "RandomUnderSampler()"],
        ["🧪 SMOTE", "Create synthetic rare rows between existing neighbours.", "Numeric features.", "SMOTE().fit_resample(X_train, y_train)"],
        ["🧪 ADASYN / SMOTE-NC / SMOTE-Tomek", "SMOTE variants: harder regions, categoricals, cleaning overlaps.", "When plain SMOTE struggles.", "imblearn.over_sampling"],
        ["🎚️ Threshold tuning", "Move the 0.5 cut-off to trade precision vs. recall.", "Probability-based models.", "precision_recall_curve"],
        ["⚠️ Resample training data only", "Never oversample before splitting / in the test set.", "Always.", "imblearn Pipeline"]
      ]},
      { name: "Pipelines & Leakage", intro: "Put every step in a Pipeline so it is learned on training data only and applied identically everywhere.", code:
        "from sklearn.compose import ColumnTransformer\n" +
        "from sklearn.pipeline import Pipeline\n" +
        "from sklearn.impute import SimpleImputer\n" +
        "from sklearn.preprocessing import StandardScaler, OneHotEncoder\n" +
        "from sklearn.ensemble import HistGradientBoostingClassifier\n\n" +
        "num = ['age', 'income']\n" +
        "cat = ['city', 'plan']\n\n" +
        "prep = ColumnTransformer([\n" +
        "    ('num', Pipeline([('impute', SimpleImputer(strategy='median')),\n" +
        "                      ('scale', StandardScaler())]), num),\n" +
        "    ('cat', Pipeline([('impute', SimpleImputer(strategy='most_frequent')),\n" +
        "                      ('onehot', OneHotEncoder(handle_unknown='ignore'))]), cat),\n" +
        "])\n\n" +
        "model = Pipeline([('prep', prep), ('clf', HistGradientBoostingClassifier())])\n" +
        "model.fit(X_train, y_train)      # learns imputers/scalers on TRAIN only\n" +
        "model.score(X_test, y_test)",
        cards: [
          ["🚫 Fit on all data", "Scaling / encoding / imputing with stats from the full dataset leaks test information.", "Always split first.", "fit on train → transform test"],
          ["🔮 Future information", "Features not available at prediction time (post-event data).", "Time-based problems.", "Use time-based splits"],
          ["🎯 Target leakage", "Features derived from the target (target encoding without cross-fitting).", "Use out-of-fold encoding.", "TargetEncoder(cv=5)"],
          ["🔁 Cross-validate the whole pipeline", "Preprocessing inside each fold.", "Honest scores.", "cross_val_score(model, X, y, cv=5)"],
          ["🧾 Save the pipeline", "Ship preprocessing + model together.", "Deployment.", "joblib.dump(model, 'model.pkl')"],
          ["📋 FE checklist", "Missing → outliers → encode → transform/scale → create → select → balance → validate.", "Use for every project.", "—"]
        ]}
    ]
  };

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function list(items, tag) {
    return "<" + tag + ">" + items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</" + tag + ">";
  }

  // Detail text is authored HTML (trusted); code is escaped.
  function detailHTML(x) {
    return '<details class="ef-more"><summary>📖 Detailed explanation</summary><div class="ef-detail">' +
      '<div class="ef-sec"><h4>💡 What it is</h4><p>' + x.what + "</p></div>" +
      '<div class="ef-sec"><h4>⚙️ How it works</h4>' + list(x.how, "ol") + "</div>" +
      '<div class="ef-sec"><h4>🧮 Worked example</h4><p>' + x.ex + "</p></div>" +
      '<div class="ef-sec"><h4>🐍 Code</h4><pre class="ef-pre ef-pre-sm"><code>' + esc(x.code) + "</code></pre></div>" +
      '<div class="ef-pc"><div class="ef-pro"><h4>✅ Pros</h4>' + list(x.pros, "ul") + "</div>" +
      '<div class="ef-con"><h4>⚠️ Cons</h4>' + list(x.cons, "ul") + "</div></div>" +
      '<div class="ef-tip"><b>💬 Tip:</b> ' + x.tip + "</div></div></details>";
  }

  function cardsHTML(cards, details) {
    return '<div class="ef-grid">' + cards.map(function (c, i) {
      return '<div class="ef-card"><div class="ef-title">' + c[0] + '</div><div class="ef-desc">' + c[1] + '</div>' +
        '<div class="ef-when"><span>When</span>' + c[2] + '</div>' +
        (c[3] && c[3] !== "—" ? '<code class="ef-code">' + esc(c[3]) + "</code>" : "") +
        (details && details[i] ? detailHTML(details[i]) : "") + "</div>";
    }).join("") + "</div>";
  }

  function tableHTML(rows) {
    return '<div class="ef-tablewrap"><table class="ef-table"><thead><tr>' + rows[0].map(function (h) { return "<th>" + h + "</th>"; }).join("") +
      "</tr></thead><tbody>" + rows.slice(1).map(function (r) {
        return "<tr>" + r.map(function (v, i) { return "<td>" + (i === 2 ? "<b>" + v + "</b>" : v) + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table></div>";
  }

  function slideHTML(d, headingClass) {
    var tabs = d.tabs.map(function (t, i) {
      return '<button type="button" class="ef-tab' + (i === 0 ? " is-on" : "") + '" data-i="' + i + '">' + t.name + "</button>";
    }).join("");
    var panes = d.tabs.map(function (t, i) {
      return '<div class="ef-pane' + (i === 0 ? " is-on" : "") + '" data-i="' + i + '"><p class="ef-intro">' + t.intro + "</p>" +
        (t.table ? tableHTML(t.table) : "") +
        (t.code ? '<pre class="ef-pre"><code>' + esc(t.code) + "</code></pre>" : "") +
        (t.cards ? cardsHTML(t.cards, d.id === "feature-engineering" && window.FE_DETAILS ? window.FE_DETAILS[t.name] : null) : "") + "</div>";
    }).join("");
    return '<div class="ef-wrap"><h2' + (headingClass ? ' class="' + headingClass + '"' : "") + ">" + d.emoji + " " + d.full + "</h2>" +
      '<p class="ef-lead">' + d.lead + "</p>" +
      '<div class="ef-tabs" role="tablist">' + tabs + "</div>" + panes + "</div>";
  }

  var CSS =
    ".ef-slide{overflow-y:auto}" +
    ".ef-wrap{text-align:left;max-width:1200px;margin:0 auto;width:100%}" +
    ".ef-lead{opacity:.85;margin:6px 0 14px;line-height:1.6}" +
    ".ef-tabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid rgba(148,163,184,.3)}" +
    ".ef-tab{font:inherit;font-size:.86em;cursor:pointer;border:1px solid rgba(148,163,184,.4);background:transparent;color:inherit;padding:6px 14px;border-radius:999px;transition:background .15s}" +
    ".ef-tab:hover{background:rgba(108,140,255,.12)}" +
    ".ef-tab.is-on{background:#6c8cff;border-color:#6c8cff;color:#fff}" +
    ".ef-pane{display:none}.ef-pane.is-on{display:block;animation:efIn .25s ease}" +
    "@keyframes efIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}" +
    ".ef-intro{margin:0 0 12px;padding:10px 14px;border-left:3px solid #f5a524;background:rgba(245,165,36,.1);border-radius:8px}" +
    ".ef-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}" +
    ".ef-card{display:flex;flex-direction:column;gap:6px;padding:12px 14px;border-radius:12px;border:1px solid rgba(148,163,184,.3);background:rgba(148,163,184,.06);font-size:.9em}" +
    ".ef-card:hover{border-color:#6c8cff}" +
    ".ef-title{font-weight:700;font-size:1.02em}" +
    ".ef-desc{line-height:1.5}" +
    ".ef-when{font-size:.88em;opacity:.85}.ef-when span{display:inline-block;font-size:.75em;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#22c55e;margin-right:6px}" +
    ".ef-code{display:block;margin-top:auto;font-size:.8em;padding:5px 8px;border-radius:6px;background:rgba(108,140,255,.12);white-space:pre-wrap;word-break:break-word}" +
    ".ef-card:has(>.ef-more[open]){grid-column:1/-1;border-color:#6c8cff}" +
    ".ef-more{margin-top:4px;border-top:1px dashed rgba(148,163,184,.35);padding-top:8px}" +
    ".ef-more>summary{cursor:pointer;font-weight:600;font-size:.9em;color:#6c8cff;list-style:none;user-select:none}" +
    ".ef-more>summary::-webkit-details-marker{display:none}" +
    ".ef-more>summary::after{content:' ▾'}.ef-more[open]>summary::after{content:' ▴'}" +
    ".ef-detail{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px;margin-top:10px;line-height:1.55}" +
    ".ef-sec,.ef-pc,.ef-tip{min-width:0}" +
    ".ef-sec h4,.ef-pc h4{margin:0 0 4px;font-size:.92em}" +
    ".ef-sec p{margin:0}.ef-detail ol,.ef-detail ul{margin:0;padding-left:20px}.ef-detail li{margin:2px 0}" +
    ".ef-sec:nth-child(3),.ef-sec:nth-child(4),.ef-tip{grid-column:1/-1}" +
    ".ef-pc{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}" +
    ".ef-pro,.ef-con{padding:8px 12px;border-radius:10px;font-size:.92em}" +
    ".ef-pro{background:rgba(34,197,94,.1);border-left:3px solid #22c55e}" +
    ".ef-con{background:rgba(239,68,68,.1);border-left:3px solid #ef4444}" +
    ".ef-tip{padding:10px 14px;border-left:3px solid #f5a524;background:rgba(245,165,36,.1);border-radius:8px}" +
    ".ef-detail .ef-pre{margin:0;font-size:.85em}" +
    ".ef-pre{margin:0 0 14px;padding:14px;border-radius:12px;background:#0f172a;color:#e2e8f0;font-size:.8em;overflow-x:auto;line-height:1.5}" +
    ".ef-tablewrap{overflow-x:auto;border:1px solid rgba(148,163,184,.3);border-radius:12px}" +
    ".ef-table{border-collapse:collapse;width:100%;font-size:.88em}" +
    ".ef-table th{background:#6c8cff;color:#fff;text-align:left;padding:8px 12px}" +
    ".ef-table td{padding:8px 12px;border-top:1px solid rgba(148,163,184,.2)}" +
    ".ef-table tbody tr:nth-child(even){background:rgba(148,163,184,.06)}";

  function wire(slide) {
    slide.addEventListener("click", function (e) {
      var t = e.target && e.target.closest ? e.target.closest(".ef-tab") : null;
      if (!t || !slide.contains(t)) return;
      var i = t.getAttribute("data-i");
      slide.querySelectorAll(".ef-tab").forEach(function (b) { b.classList.toggle("is-on", b === t); });
      slide.querySelectorAll(".ef-pane").forEach(function (p) { p.classList.toggle("is-on", p.getAttribute("data-i") === i); });
    });
  }

  function findDataSlide(slides) {
    var re = /data\s*(&|&amp;|and)\s*feature/i, i;
    for (i = 0; i < slides.length; i++) if (re.test(slides[i].getAttribute("data-title") || "")) return slides[i];
    for (i = 0; i < slides.length; i++) {
      var h = slides[i].querySelector("h1,h2");
      if (h && re.test(h.textContent)) return slides[i];
    }
    return slides[5] || null;
  }

  function init() {
    if (document.getElementById("eda")) return;
    var slides = Array.prototype.filter.call(document.querySelectorAll("section.slide"), function (s) {
      return s.offsetParent !== null || !s.closest("[hidden]");
    });
    var target = findDataSlide(slides);
    if (!target) return;

    var st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);

    var h = target.querySelector("h2");
    var headingClass = h ? h.className : "";
    [EDA, FE].forEach(function (d) {
      var s = document.createElement("section");
      s.className = "slide ef-slide";
      s.id = d.id;
      s.setAttribute("data-title", d.title);
      if (target.getAttribute("data-group")) s.setAttribute("data-group", target.getAttribute("data-group"));
      s.innerHTML = slideHTML(d, headingClass);
      target.parentNode.insertBefore(s, target);
      wire(s);
    });
  }

  if (document.querySelector("section.slide")) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
