(function () {
  var D = (window.FE_DETAILS = window.FE_DETAILS || {});

  D["Creating Features"] = [
    {
      n: "Binning / discretisation",
      what: "Binning replaces a continuous number with the <b>range (bin)</b> it falls into, such as age 37 → \"30–60\". It lets a linear model learn a different effect for each range (a step-shaped curve), tames outliers because extremes just land in the last bin, and gives interpretable groups. You choose bin edges by <b>domain knowledge</b>, by <b>equal width</b>, by <b>equal frequency (quantiles)</b>, or by <b>k-means</b> clustering of the values.",
      how: [
        "Pick the strategy: domain edges, 'uniform' (equal width), 'quantile' (equal counts) or 'kmeans'",
        "Pick the number of bins (usually 3–10)",
        "<b>Fit</b> the bin edges on the training set only",
        "Assign each value to a bin and output ordinal codes or one-hot columns",
        "Apply the same edges to validation / test / new data"
      ],
      ex: "Ages 18, 25, 37, 52, 70 with domain edges [0, 30, 60, 120] become young, young, adult, adult, senior. With KBinsDiscretizer(n_bins=3, strategy='quantile') the learned edges are [18, 29, 47, 70], so the ordinal codes are 0, 0, 1, 2, 2.",
      code: "import pandas as pd\nfrom sklearn.preprocessing import KBinsDiscretizer\n\ndf = pd.DataFrame({'age': [18, 25, 37, 52, 70]})\n# domain-knowledge bins\ndf['age_group'] = pd.cut(df['age'], bins=[0, 30, 60, 120], labels=['young', 'adult', 'senior'])\n# data-driven quantile bins\nkb = KBinsDiscretizer(n_bins=3, encode='ordinal', strategy='quantile')\ndf['age_bin'] = kb.fit_transform(df[['age']]).ravel()\nprint(df)",
      pros: ["Captures non-linear, step-like effects in linear models", "Reduces the influence of outliers", "Easy to explain (\"customers aged 30–60\")"],
      cons: ["Throws away within-bin detail", "Values just either side of an edge are treated as very different", "Number and position of bins are extra choices to tune"],
      tip: "Tree-based models already split numbers on their own, so binning rarely helps them. For linear models, prefer quantile bins for skewed data, and fit the edges inside the training fold only."
    },
    {
      n: "Interaction features",
      what: "An interaction is a new column built by <b>combining two or more features</b>, most often by multiplying them. It is useful when the effect of one feature <i>depends on</i> another, which a plain additive model cannot express. For example, a garden adds a lot of value to a big house but little to a flat.",
      how: [
        "Use domain knowledge to guess which pairs interact",
        "Create the combined column: a * b (numeric), or concatenate categories (city + '_' + product)",
        "Optionally let sklearn generate all pairs with PolynomialFeatures(interaction_only=True)",
        "Check with cross-validation that the new column helps"
      ],
      ex: "Rows (length, width) = (10, 5), (12, 4), (8, 8) give area = 50, 48, 64. Neither length nor width alone separates the second and third plots as well as their product does.",
      code: "import pandas as pd\nfrom sklearn.preprocessing import PolynomialFeatures\n\ndf = pd.DataFrame({'length': [10, 12, 8], 'width': [5, 4, 8]})\ndf['area'] = df['length'] * df['width']          # manual interaction\n# automatic: only the cross-terms, no squares\npf = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)\nX = pf.fit_transform(df[['length', 'width']])\nprint(pf.get_feature_names_out())\nprint(df)",
      pros: ["Lets simple models capture \"it depends\" effects", "Often a very strong, interpretable signal", "Cheap to compute"],
      cons: ["Number of possible pairs explodes with many columns", "Most random interactions are noise and cause overfitting", "Hard to interpret if built blindly"],
      tip: "Linear and logistic models benefit most; gradient-boosted trees find many interactions themselves. Start from domain-guided pairs rather than generating every combination."
    },
    {
      n: "Polynomial features",
      what: "Polynomial expansion adds powers and cross-products of the inputs (x², x³, x₁·x₂) so that a <b>linear model can fit a curved relationship</b>. The model stays linear in its coefficients, but the features are non-linear in the original inputs. Higher degrees fit more wiggly curves and overfit more easily.",
      how: [
        "Choose a degree (2 is the usual start, 3 occasionally)",
        "Scale the inputs first so high powers do not explode",
        "Fit PolynomialFeatures on the training data and transform all splits",
        "Pair with regularisation (Ridge / Lasso) to control the extra columns",
        "Pick the degree by cross-validation"
      ],
      ex: "With degree=2 and include_bias=False, a row (x₁, x₂) = (2, 3) becomes [x₁, x₂, x₁², x₁x₂, x₂²] = [2, 3, 4, 6, 9]. The row (1, 4) becomes [1, 4, 1, 4, 16].",
      code: "import numpy as np\nfrom sklearn.preprocessing import PolynomialFeatures\n\nX = np.array([[2, 3], [1, 4]])\npoly = PolynomialFeatures(degree=2, include_bias=False)\nXp = poly.fit_transform(X)\nprint(poly.get_feature_names_out())   # x0 x1 x0^2 x0 x1 x1^2\nprint(Xp)                             # [[2 3 4 6 9], [1 4 1 4 16]]",
      pros: ["Linear models can capture curves and interactions", "Built into scikit-learn, one line", "Works with regularised regression"],
      cons: ["Columns grow quickly: 20 features at degree 3 give 1,770 columns", "High degrees overfit and extrapolate wildly", "Features become highly correlated"],
      tip: "Keep the degree low and always use Ridge/Lasso with it. If the curve is smooth, splines (SplineTransformer) are often more stable than high-degree polynomials."
    },
    {
      n: "Ratios & differences",
      what: "Dividing or subtracting two related columns often expresses the <b>real signal</b> better than either raw column. A loan of 20,000 means very different things to someone earning 30,000 vs 300,000, so debt-to-income is more informative. Differences capture change, such as price minus cost = profit.",
      how: [
        "Look for pairs with a natural meaning: part/whole, amount/size, new − old",
        "Compute a / b or a − b",
        "Guard against division by zero (replace 0 with NaN or add a small epsilon)",
        "Check the distribution; ratios are often skewed, so a log may help"
      ],
      ex: "Debt / income: 20,000/80,000 = 0.25 and 15,000/30,000 = 0.50, so the second person is far more stretched even though their debt is lower. BMI = weight/height²: 70 kg at 1.75 m → 70/3.0625 = 22.86; 90 kg at 1.80 m → 27.78; 55 kg at 1.60 m → 21.48.",
      code: "import numpy as np\nimport pandas as pd\n\ndf = pd.DataFrame({'weight': [70, 90, 55], 'height': [1.75, 1.80, 1.60],\n                   'debt': [20000, 15000, 5000], 'income': [80000, 30000, 0]})\ndf['bmi'] = df['weight'] / df['height'] ** 2\n# avoid division by zero: 0 income becomes NaN instead of inf\ndf['debt_to_income'] = df['debt'] / df['income'].replace(0, np.nan)\nprint(df.round(2))",
      pros: ["Encodes domain meaning that trees and linear models struggle to build", "Removes the effect of size / scale", "Cheap and highly interpretable"],
      cons: ["Division by zero and tiny denominators create infinities and extreme values", "Ratios are often heavily skewed", "Needs domain insight to pick sensible pairs"],
      tip: "Handle zeros and missing values explicitly, and keep the original columns too unless they are redundant. Trees cannot easily divide two columns themselves, so explicit ratios help them a lot."
    },
    {
      n: "Aggregations (group-by)",
      what: "When rows belong to a larger entity (customer, store, device), you can <b>summarise the many rows into one set of numbers</b> per entity: count, sum, mean, max, std, number of unique items. These aggregate features describe behaviour and are then joined back to the main table, one row per entity or per original row.",
      how: [
        "Choose the grouping key (customer_id, store, day)",
        "Choose the statistics: count, sum, mean, min, max, std, nunique",
        "df.groupby(key)[col].agg([...]) to compute them",
        "Merge the result back with the key (or use transform to keep the row count)",
        "Only use data available at prediction time"
      ],
      ex: "Customer A has orders of 100 and 300; customer B has 50, 70 and 30. Aggregates: A → count 2, mean 200, max 300; B → count 3, mean 50, max 70. These three numbers immediately tell A (big, rare buyer) apart from B (small, frequent buyer).",
      code: "import pandas as pd\n\norders = pd.DataFrame({'cust': ['A', 'A', 'B', 'B', 'B'],\n                       'amt': [100, 300, 50, 70, 30]})\nagg = orders.groupby('cust')['amt'].agg(['count', 'mean', 'max']).reset_index()\nprint(agg)\n# keep original rows: add each customer's mean to every row\norders['cust_mean_amt'] = orders.groupby('cust')['amt'].transform('mean')\nprint(orders)",
      pros: ["Turns transactional data into one row per entity", "Captures behaviour such as spend level and variability", "Simple and very effective"],
      cons: ["Entities with few rows give noisy statistics", "Easy to leak future rows into the aggregate", "Many possible aggregations to try"],
      tip: "Compute aggregates only from rows that happened before the prediction date. If you aggregate the target itself (like a target mean), do it inside cross-validation folds."
    },
    {
      n: "Date-time parts",
      what: "A raw timestamp is hard for most models to use, but its <b>components</b> carry patterns: weekday vs weekend, rush hour, month and season, quarter, holidays. Extracting them as separate columns lets the model learn calendar effects such as higher sales on Fridays or in December.",
      how: [
        "Convert the column with pd.to_datetime",
        "Extract parts through the .dt accessor: year, month, day, dayofweek, hour, quarter",
        "Derive flags: is_weekend, is_month_end, is_holiday (from a holiday calendar)",
        "Treat periodic parts (hour, month) cyclically if the model is linear / neural",
        "Drop or keep the raw timestamp depending on the model"
      ],
      ex: "2024-03-15 08:30 → year 2024, month 3, dayofweek 4 (Friday), hour 8, quarter 1, is_weekend 0. 2024-03-16 → dayofweek 5, is_weekend 1. 2024-12-25 → dayofweek 2 (Wednesday), quarter 4.",
      code: "import pandas as pd\n\ndf = pd.DataFrame({'ts': ['2024-03-15 08:30', '2024-03-16 14:00', '2024-12-25 23:15']})\ndf['ts'] = pd.to_datetime(df['ts'])\ndf['year'] = df['ts'].dt.year\ndf['month'] = df['ts'].dt.month\ndf['dayofweek'] = df['ts'].dt.day_of_week    # Monday=0 ... Sunday=6\ndf['hour'] = df['ts'].dt.hour\ndf['quarter'] = df['ts'].dt.quarter\ndf['is_weekend'] = (df['dayofweek'] >= 5).astype(int)\nprint(df)",
      pros: ["Exposes seasonality and weekly / daily patterns", "Trivial to create", "Works for almost every dataset with timestamps"],
      cons: ["Integer codes imply a false order or break at wrap-around (Dec → Jan)", "Using year as a number can fail to extrapolate to future years", "Time zones and daylight saving can silently mislead"],
      tip: "Make sure all timestamps are in a consistent time zone before extracting parts. For forecasting, split by time, not randomly, to avoid leakage."
    },
    {
      n: "Cyclical encoding",
      what: "Hour, weekday and month wrap around: 23:00 is only one hour from 00:00, but as plain numbers they are 23 apart. Mapping the value onto a <b>circle</b> with a sine and a cosine column makes neighbours across the wrap-around close together. Both columns are needed because sine alone gives the same value for two different times.",
      how: [
        "Pick the period P: 24 for hour, 7 for weekday, 12 for month (0–11)",
        "angle = 2π · value / P",
        "sin_feature = sin(2π·hour/24)",
        "cos_feature = cos(2π·hour/24)",
        "Use both columns and drop the raw one (for linear / NN / KNN models)"
      ],
      ex: "hour 0 → (sin, cos) = (0, 1); hour 6 → (1, 0); hour 12 → (0, −1); hour 23 → (−0.259, 0.966). The distance between hour 23 and hour 0 on the circle is about 0.26, whereas the raw difference is 23.",
      code: "import numpy as np\nimport pandas as pd\n\ndf = pd.DataFrame({'hour': [0, 6, 12, 23]})\nangle = 2 * np.pi * df['hour'] / 24          # period = 24 hours\ndf['hour_sin'] = np.sin(angle)\ndf['hour_cos'] = np.cos(angle)\nprint(df.round(3))\n# for month (1-12) use (month - 1) / 12 so January and December are neighbours",
      pros: ["Respects the wrap-around of time", "Smooth numeric input for linear, NN and distance-based models", "Only two columns per cycle"],
      cons: ["Two columns are less readable than one", "Adds little for tree models, which can split the raw hour directly", "Assumes a smooth cycle; sharp events (office opens at 9) are not captured well"],
      tip: "Always use sine and cosine together. If you use trees, try the raw integer as well; compare by cross-validation."
    },
    {
      n: "Time since / until",
      what: "Instead of a raw date, measure the <b>elapsed time from or to a reference event</b>: days since signup, days since last purchase, days until contract expiry. Recency and tenure are among the most predictive features in customer behaviour, churn and risk models because they describe how fresh or stale a relationship is.",
      how: [
        "Pick a reference point: the prediction date (snapshot), signup date, expiry date",
        "Convert columns with pd.to_datetime",
        "Subtract the dates: (reference − event)",
        "Take .dt.days (or hours / minutes) to get a number",
        "Use the same snapshot date logic in training and production"
      ],
      ex: "With a snapshot date of 2024-06-30: a user who signed up on 2024-01-01 has tenure 181 days and last bought on 2024-06-20, i.e. 10 days ago. Another signed up 2024-06-01 (29 days) and bought on 2024-06-28 (2 days ago).",
      code: "import pandas as pd\n\ndf = pd.DataFrame({'signup': ['2024-01-01', '2024-06-01'],\n                   'last_buy': ['2024-06-20', '2024-06-28']})\ndf[['signup', 'last_buy']] = df[['signup', 'last_buy']].apply(pd.to_datetime)\nref = pd.Timestamp('2024-06-30')                 # snapshot / prediction date\ndf['tenure_days'] = (ref - df['signup']).dt.days\ndf['days_since_purchase'] = (ref - df['last_buy']).dt.days\nprint(df)",
      pros: ["Captures recency and tenure directly", "Numeric and easy to interpret", "Often a top-ranked feature in behavioural models"],
      cons: ["Depends on the choice of reference date", "Using \"today\" at training time makes old rows look stale", "Missing dates need a deliberate rule"],
      tip: "For each training row use the snapshot date at that moment, not the date you run the code. Otherwise the feature leaks information or becomes meaningless in production."
    },
    {
      n: "Lag & rolling features",
      what: "In time series the best predictors of the next value are usually <b>recent past values</b>. A lag feature is the value k steps earlier; a rolling feature is a statistic (mean, std, max) over a moving window of previous steps. Together they give the model memory, level and volatility.",
      how: [
        "Sort the data by time (and group by series, e.g. per store)",
        "Lag: s.shift(k) uses the value from k steps ago",
        "Rolling: s.shift(1).rolling(window).mean() uses only past values",
        "Drop or impute the first rows that have no history",
        "Split train / test by time, never randomly"
      ],
      ex: "Sales = [10, 12, 11, 15, 14]. lag_1 = [NaN, 10, 12, 11, 15]. The 3-day rolling mean of past values (shifted by 1) = [NaN, NaN, NaN, 11.0, 12.67]: for the fourth day (15) it is (10 + 12 + 11)/3 = 11, and for the fifth day (14) it is (12 + 11 + 15)/3 = 12.67.",
      code: "import pandas as pd\n\ns = pd.Series([10, 12, 11, 15, 14], name='sales')\ndf = s.to_frame()\ndf['lag_1'] = s.shift(1)\n# shift(1) first, so today's value is NOT inside its own window\ndf['roll_mean_3'] = s.shift(1).rolling(window=3).mean()\ndf['roll_std_3'] = s.shift(1).rolling(window=3).std()\nprint(df)\n# per group: df.groupby('store')['sales'].shift(1)",
      pros: ["Gives models memory of recent history", "Handles trend and level shifts", "Works with any tabular model"],
      cons: ["Creates NaNs at the start of every series", "Easy to leak the future by forgetting shift", "Features need to be recomputed in production as new data arrives"],
      tip: "A plain s.rolling(7).mean() includes the current row, which leaks the target if you are predicting s. Always shift first and validate with time-based splits (TimeSeriesSplit)."
    },
    {
      n: "RFM features",
      what: "RFM summarises each customer with three numbers: <b>Recency</b> (how long since the last order), <b>Frequency</b> (how many orders) and <b>Monetary</b> value (how much they spent). It is a compact, proven description of customer value used in marketing, churn prediction and customer lifetime value models.",
      how: [
        "Choose a snapshot date (the day you score customers)",
        "Recency = snapshot − date of the last order (in days)",
        "Frequency = number of orders in the period",
        "Monetary = total (or average) amount spent",
        "Optionally score each into quintiles (1–5) with pd.qcut and combine"
      ],
      ex: "Snapshot 2024-07-01. Customer A ordered on 06-28 (50), 06-15 (30) and 05-20 (20): R = 3 days, F = 3, M = 100. Customer B ordered once on 03-01 (200): R = 122 days, F = 1, M = 200. A is recent and active, B is a big but lapsed one-off buyer.",
      code: "import pandas as pd\n\no = pd.DataFrame({'cust': ['A', 'A', 'A', 'B'],\n                  'date': pd.to_datetime(['2024-06-28', '2024-06-15', '2024-05-20', '2024-03-01']),\n                  'amt': [50, 30, 20, 200]})\nsnap = pd.Timestamp('2024-07-01')\nrfm = o.groupby('cust').agg(last=('date', 'max'), F=('amt', 'count'), M=('amt', 'sum'))\nrfm['R'] = (snap - rfm['last']).dt.days\nprint(rfm[['R', 'F', 'M']])",
      pros: ["Simple, interpretable and powerful", "Needs only customer id, date and amount", "Works for segmentation and as model features"],
      cons: ["Ignores product, channel and other context", "Depends on the chosen time window and snapshot", "Monetary is dominated by a few big spenders"],
      tip: "Compute RFM only from orders before the snapshot date, and use a later period as the label. Take a log of M if it is heavily skewed."
    },
    {
      n: "Text: Bag-of-Words / TF-IDF",
      what: "Bag-of-Words turns each document into a vector of <b>word counts</b>, ignoring word order. TF-IDF multiplies each count by an <b>inverse document frequency</b> so that words found in almost every document (\"the\") get low weight and distinctive words get high weight. N-grams (word pairs, triples) bring back a little word order.",
      how: [
        "Tokenise, lower-case and optionally remove stop words",
        "tf = count of the term in the document",
        "scikit-learn: idf = ln((1 + n_docs) / (1 + doc_freq)) + 1",
        "tf-idf = tf × idf, then each row is L2-normalised",
        "Fit the vocabulary on training texts only; use ngram_range=(1, 2) for phrases"
      ],
      ex: "Docs: \"cat sat\", \"cat ran\", \"dog ran\" (n = 3). \"cat\" appears in 2 docs: idf = ln(4/3) + 1 = 1.288. \"sat\" appears in 1: idf = ln(4/2) + 1 = 1.693. Doc 1 raw = [1.288, 1.693]; its L2 length is 2.127, so the normalised vector is cat 0.605, sat 0.796. The rarer word weighs more.",
      code: "from sklearn.feature_extraction.text import TfidfVectorizer\n\ndocs = ['cat sat', 'cat ran', 'dog ran']\n# use ngram_range=(1, 2) to add word pairs\nvec = TfidfVectorizer(ngram_range=(1, 1))\nX = vec.fit_transform(docs)                 # fit on TRAIN docs only\nprint(vec.get_feature_names_out())          # ['cat' 'dog' 'ran' 'sat']\nprint(X.toarray().round(3)[0])              # row for 'cat sat'\nprint(vec.transform(['dog sat']).toarray().round(3))",
      pros: ["Fast, strong baseline for text classification", "Interpretable: each column is a word", "Sparse output works well with linear models"],
      cons: ["Ignores meaning: \"car\" and \"automobile\" are unrelated", "Vocabulary can be huge and sparse", "Unseen words at prediction time are dropped"],
      tip: "Limit the size with min_df, max_df or max_features. Fit the vectorizer inside a Pipeline so the vocabulary and idf come from the training data only."
    },
    {
      n: "Text: embeddings",
      what: "An embedding maps a word, sentence or document to a <b>dense vector of numbers</b> (often 300–1,024 dimensions) so that texts with similar meaning end up close together. Models such as Word2Vec, BERT or sentence-transformers learned these vectors from huge text collections, so \"refund my order\" and \"I want my money back\" land near each other even with few shared words.",
      how: [
        "Choose a pre-trained model (for sentences: 'all-MiniLM-L6-v2')",
        "model.encode(texts) → one vector per text",
        "Use the vectors as features for any classifier, or compare them with cosine similarity",
        "Optionally reduce dimensions (PCA) or fine-tune the model on your task",
        "Embed new text with the same model at prediction time"
      ],
      ex: "Toy 2-D vectors: u = (0.8, 0.6) and v = (0.6, 0.8). Cosine similarity = 0.8·0.6 + 0.6·0.8 = 0.96, so the texts are very similar. A real model does the same with e.g. 384 dimensions (all-MiniLM-L6-v2).",
      code: "from sentence_transformers import SentenceTransformer\nfrom sklearn.metrics.pairwise import cosine_similarity\n\nmodel = SentenceTransformer('all-MiniLM-L6-v2')   # 384-dimensional vectors\ntexts = ['refund my order', 'I want my money back', 'best pizza in town']\nE = model.encode(texts)                            # shape (3, 384)\nprint(E.shape)\nprint(cosine_similarity(E).round(2))               # first two texts are most similar\n# E can be fed directly to LogisticRegression etc.",
      pros: ["Captures meaning and synonyms", "Dense, low-dimensional input for any model", "Strong results with little text preprocessing"],
      cons: ["Needs a model download and more compute", "Features are not individually interpretable", "Pre-trained models can miss domain jargon"],
      tip: "Start with TF-IDF as a baseline; move to embeddings when meaning matters and you have limited labelled data. Use the same model version in training and production."
    },
    {
      n: "Text: simple stats",
      what: "Simple statistics describe <b>how a text looks</b> rather than what it says: number of characters, words, exclamation marks, share of capital letters, digits, URLs, or a sentiment score. They are cheap, language-agnostic and surprisingly effective for spam, fake-review and toxicity detection.",
      how: [
        "Length: df.text.str.len()",
        "Word count: df.text.str.split().str.len()",
        "Punctuation / digit counts: str.count('!') etc.",
        "Capital ratio = capital letters / letters",
        "Optionally add a sentiment score from a lexicon or model"
      ],
      ex: "\"FREE prize!!! Click NOW\" → 23 characters, 4 words, 3 exclamation marks, 8 capitals out of 17 letters = 0.47. \"See you at lunch\" → 16 characters, 4 words, 0 exclamations, 1 capital of 13 letters = 0.08. The capital ratio and exclamation count flag the spam.",
      code: "import pandas as pd\n\ndf = pd.DataFrame({'text': ['FREE prize!!! Click NOW', 'See you at lunch']})\ndf['n_chars'] = df['text'].str.len()\ndf['n_words'] = df['text'].str.split().str.len()\ndf['n_excl'] = df['text'].str.count('!')\n# share of uppercase letters among all letters\ndf['cap_ratio'] = df['text'].str.count('[A-Z]') / df['text'].str.count('[A-Za-z]')\nprint(df.round(2))",
      pros: ["Very fast and simple", "Complements TF-IDF or embeddings", "Works in any language"],
      cons: ["Says nothing about meaning on its own", "Can be easily gamed or be dataset-specific", "Length features may reflect data collection quirks"],
      tip: "Use these alongside a text vectoriser (e.g. via ColumnTransformer), not instead of one. Check that a suspiciously strong length feature is not a data artefact."
    },
    {
      n: "Image features",
      what: "Models need numbers, and an image is already a grid of pixel values, but raw pixels are bulky and fragile. <b>Hand-crafted features</b> summarise them (colour histograms, edges, textures), while <b>CNN embeddings</b> from a pre-trained network (e.g. ResNet) give a compact vector describing the content. <b>Augmentation</b> (flip, rotate, crop, brightness) creates extra training variants of each image.",
      how: [
        "Resize / normalise images to a fixed size and range",
        "Hand-crafted: colour histogram, edge or texture descriptors (HOG, LBP)",
        "Deep: pass the image through a pre-trained CNN and keep the layer before the classifier",
        "Augment the training images only (random flips, crops, rotations)",
        "Feed the features to a classifier (logistic regression, gradient boosting)"
      ],
      ex: "A 2×2 grey image [[0, 255], [255, 128]] with a 2-bin histogram over 0–255 has counts [1, 3] (only the pixel 0 falls in the 0–127 bin), i.e. normalised [0.25, 0.75]. Flipping it left-to-right gives [[255, 0], [128, 255]], a new training sample with the same label.",
      code: "import numpy as np\n\nimg = np.array([[0, 255], [255, 128]], dtype=np.uint8)\nhist, _ = np.histogram(img, bins=2, range=(0, 256))\nfeatures = hist / hist.sum()                 # [0.25, 0.75]\nflipped = np.fliplr(img)                     # simple augmentation\nprint(features, flipped.tolist())\n# CNN features (torchvision): m = models.resnet18(weights='DEFAULT'); m.fc = torch.nn.Identity()\n# then m.eval() and m(batch) returns a 512-d vector per image",
      pros: ["Reduces huge pixel grids to compact vectors", "Pre-trained CNN features transfer well to small datasets", "Augmentation reduces overfitting"],
      cons: ["Hand-crafted features miss complex patterns", "CNN features need a GPU or patience and a deep-learning library", "Augmentations must not change the label (a flipped '6' is not a '9')"],
      tip: "With little data, extract pre-trained CNN embeddings and train a simple classifier on top. Apply augmentation only to the training split, never to validation or test."
    },
    {
      n: "Geospatial features",
      what: "Latitude and longitude as raw numbers are rarely useful, because the real signal is <b>relative location</b>: how far to the city centre, which neighbourhood, how many shops nearby. Distances between points on Earth use the <b>haversine formula</b>; clustering coordinates or joining region statistics adds area-level context.",
      how: [
        "Convert degrees to radians",
        "a = sin²(Δφ/2) + cos φ₁ · cos φ₂ · sin²(Δλ/2)",
        "d = 2R · asin(√a), with Earth radius R = 6371 km",
        "Create distances to key points (centre, airport, competitor)",
        "Add cluster ids (KMeans), geohash cells or region-level aggregates"
      ],
      ex: "Mumbai (19.0760, 72.8777) to Pune (18.5204, 73.8567): a ≈ 8.89e-5, so d = 2 · 6371 · asin(√8.89e-5) ≈ 120 km. A delivery model can use this distance directly instead of the raw coordinates.",
      code: "import numpy as np\n\ndef haversine_km(lat1, lon1, lat2, lon2):\n    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])\n    a = np.sin((lat2 - lat1) / 2) ** 2 + np.cos(lat1) * np.cos(lat2) * np.sin((lon2 - lon1) / 2) ** 2\n    return 2 * 6371 * np.arcsin(np.sqrt(a))\n\nprint(round(haversine_km(19.0760, 72.8777, 18.5204, 73.8567), 1))   # ~120.2 km\n# works on whole columns too: haversine_km(df.lat, df.lon, 19.07, 72.87)",
      pros: ["Turns coordinates into meaningful distances", "Vectorised and fast with numpy", "Cluster / region features add neighbourhood context"],
      cons: ["Straight-line distance ignores roads and barriers", "Raw lat/lon in a linear model are not meaningful", "Needs external reference points or data for the best features"],
      tip: "Use the haversine for large areas; for a small city a flat approximation is fine. Compute neighbourhood statistics from training data only so they do not leak the target."
    },
    {
      n: "Automated FE",
      what: "Automated feature engineering tools <b>generate many candidate features</b> from the raw tables for you. Featuretools uses <b>Deep Feature Synthesis (DFS)</b>: it follows relationships between tables (customers → orders) and stacks primitives such as sum, mean, count and max to build features like MEAN(orders.amount). It saves time, and surfaces ideas you might not try.",
      how: [
        "Load your tables as pandas DataFrames",
        "Create an EntitySet and add each DataFrame with its index",
        "Declare relationships between parent and child tables",
        "Run ft.dfs(...) with chosen aggregation primitives and max_depth",
        "Prune the output with feature selection and check for leakage"
      ],
      ex: "With customers (A, B) and orders (A: 100, 300), DFS on the customers table creates COUNT(orders) = 2, SUM(orders.amount) = 400, MEAN(orders.amount) = 200 and MAX(orders.amount) = 300 for customer A without writing any group-by code.",
      code: "import pandas as pd\nimport featuretools as ft\n\ncust = pd.DataFrame({'cust_id': ['A', 'B']})\norders = pd.DataFrame({'order_id': [1, 2, 3], 'cust_id': ['A', 'A', 'B'], 'amount': [100, 300, 50]})\nes = ft.EntitySet(id='shop')\nes.add_dataframe(dataframe_name='customers', dataframe=cust, index='cust_id')\nes.add_dataframe(dataframe_name='orders', dataframe=orders, index='order_id')\nes.add_relationship('customers', 'cust_id', 'orders', 'cust_id')\nfm, defs = ft.dfs(entityset=es, target_dataframe_name='customers',\n                  agg_primitives=['count', 'sum', 'mean', 'max'], max_depth=1)\nprint(fm)",
      pros: ["Fast exploration on relational data", "Systematic and reproducible", "Finds aggregates you might not think of"],
      cons: ["Can create hundreds of noisy features", "Features may be hard to explain", "Needs a time index (cutoff times) to avoid leakage"],
      tip: "Always pass cutoff times so features use only past data, and follow DFS with feature selection. Treat the output as candidates, not a finished feature set."
    }
  ];

  D["Imbalanced Data"] = [
    {
      n: "Class weights",
      what: "Class weights tell the learning algorithm that <b>mistakes on the rare class cost more</b>. The 'balanced' setting scales each class by n_samples / (n_classes × n_in_class), so a minority example counts as much, in total, as the majority. No data is added or removed, which makes this the cheapest first thing to try.",
      how: [
        "Count the class frequencies in the training set",
        "weight_c = n_samples / (n_classes × n_c)",
        "Pass class_weight='balanced' (or a dict) to the estimator",
        "For XGBoost / LightGBM binary tasks use scale_pos_weight = n_negative / n_positive",
        "Evaluate with precision, recall, F1 or PR-AUC rather than accuracy"
      ],
      ex: "1,000 rows with 950 negatives and 50 positives. weight_neg = 1000 / (2 × 950) = 0.526 and weight_pos = 1000 / (2 × 50) = 10. A missed positive now costs about 19 times more than a missed negative (950/50 = 19).",
      code: "from sklearn.datasets import make_classification\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import classification_report\nfrom sklearn.model_selection import train_test_split\nfrom sklearn.utils.class_weight import compute_class_weight\nimport numpy as np\n\nX, y = make_classification(n_samples=1000, weights=[0.95], flip_y=0, random_state=0)\nXtr, Xte, ytr, yte = train_test_split(X, y, stratify=y, random_state=0)\nprint(compute_class_weight('balanced', classes=np.array([0, 1]), y=ytr))\nclf = LogisticRegression(class_weight='balanced', max_iter=1000).fit(Xtr, ytr)\nprint(classification_report(yte, clf.predict(Xte)))",
      pros: ["No change to the data", "One argument in most scikit-learn models", "Often as good as resampling"],
      cons: ["Not every algorithm supports it", "Can lower precision and produce more false alarms", "Predicted probabilities become miscalibrated"],
      tip: "Try this before any resampling. If you need real probabilities afterwards, recalibrate (CalibratedClassifierCV) or tune the decision threshold."
    },
    {
      n: "Random oversampling",
      what: "Random oversampling <b>duplicates rare-class rows</b> (sampled with replacement) until the classes are balanced or reach a chosen ratio. The model sees the minority class as often as the majority one. It is simple but adds no new information, so the model can memorise the repeated examples.",
      how: [
        "Split into train and test first",
        "Count the rows per class in the training set",
        "Sample minority rows with replacement until the target ratio is reached",
        "Train on the enlarged training set",
        "Evaluate on the untouched test set"
      ],
      ex: "A training set has 8 negatives and 2 positives. Oversampling draws 6 more positives (copies of the 2 originals) so it becomes 8 vs 8: 16 rows, but only 2 distinct positive points.",
      code: "from collections import Counter\nfrom imblearn.over_sampling import RandomOverSampler\nfrom sklearn.datasets import make_classification\n\nX, y = make_classification(n_samples=200, weights=[0.9], flip_y=0, random_state=0)\nprint('before', Counter(y))\nros = RandomOverSampler(sampling_strategy='auto', random_state=0)   # balance fully\nX_res, y_res = ros.fit_resample(X, y)                                # TRAIN data only\nprint('after', Counter(y_res))",
      pros: ["Very simple, works with any model", "Keeps all majority-class information", "Fast"],
      cons: ["Exact duplicates encourage overfitting", "Training time grows with the data size", "Adds no new information"],
      tip: "Best for small datasets. Never resample before splitting or cross-validation, or duplicates will appear in both train and test and inflate your score."
    },
    {
      n: "Random undersampling",
      what: "Random undersampling <b>removes majority-class rows</b> at random until the classes are closer in size. The data gets smaller and training faster, but you throw away potentially useful examples. It works best when the majority class is huge and redundant.",
      how: [
        "Split into train and test first",
        "Choose the target ratio (1.0 = fully balanced, 0.5 = minority half the majority)",
        "Randomly keep only that many majority rows",
        "Train on the reduced training set",
        "Optionally repeat with different samples and ensemble the models"
      ],
      ex: "A training set has 950 negatives and 50 positives. With sampling_strategy=0.5 the sampler keeps 100 negatives and all 50 positives (50/100 = 0.5): 150 rows instead of 1,000.",
      code: "from collections import Counter\nfrom imblearn.under_sampling import RandomUnderSampler\nfrom sklearn.datasets import make_classification\n\nX, y = make_classification(n_samples=1000, weights=[0.95], flip_y=0, random_state=0)\nprint('before', Counter(y))\n# minority / majority ratio of 0.5 after resampling\nrus = RandomUnderSampler(sampling_strategy=0.5, random_state=0)\nX_res, y_res = rus.fit_resample(X, y)                # apply to TRAIN data only\nprint('after', Counter(y_res))",
      pros: ["Smaller data and faster training", "No duplicate or synthetic data", "Helpful for very large datasets"],
      cons: ["Discards information that may matter", "Result varies with the random sample", "May hurt when data is already small"],
      tip: "Use it when you have millions of majority rows. Repeating it with several random subsets and averaging (e.g. BalancedBaggingClassifier) recovers much of the lost information."
    },
    {
      n: "SMOTE",
      what: "SMOTE (Synthetic Minority Over-sampling TEchnique) creates <b>new, synthetic minority points</b> instead of copies. For a minority sample x it picks one of its k nearest minority neighbours and places a new point somewhere on the straight line between them. This fills in the minority region rather than repeating points.",
      how: [
        "For each chosen minority sample x, find its k nearest minority neighbours (default k = 5)",
        "Pick one neighbour x_n at random",
        "Draw a random number λ between 0 and 1",
        "x_new = x + λ × (x_n − x)",
        "Repeat until the classes reach the target ratio"
      ],
      ex: "x = (2, 4), neighbour x_n = (4, 8), λ = 0.25. x_new = (2 + 0.25 × (4 − 2), 4 + 0.25 × (8 − 4)) = (2.5, 5). With λ = 0 you get x and with λ = 1 you get x_n, so new points always lie between the two.",
      code: "from collections import Counter\nfrom imblearn.over_sampling import SMOTE\nfrom sklearn.datasets import make_classification\nfrom sklearn.model_selection import train_test_split\n\nX, y = make_classification(n_samples=1000, weights=[0.95], flip_y=0, random_state=0)\nXtr, Xte, ytr, yte = train_test_split(X, y, stratify=y, random_state=0)\nsm = SMOTE(k_neighbors=5, random_state=0)\nXtr_res, ytr_res = sm.fit_resample(Xtr, ytr)         # resample TRAIN only\nprint(Counter(ytr), Counter(ytr_res))                # test set stays untouched",
      pros: ["Adds variety, so less duplicate-driven overfitting", "Works well on numeric data", "Easy to use with imbalanced-learn"],
      cons: ["Needs numeric features and a meaningful distance (scale first)", "Can create noisy points in overlapping regions or from outliers", "k_neighbors must be smaller than the number of minority samples"],
      tip: "Scale features before SMOTE since it uses distances, and put it in an imblearn Pipeline so it only runs on training folds. Do not expect miracles: compare it with plain class weights."
    },
    {
      n: "ADASYN / SMOTE-NC / SMOTE-Tomek",
      what: "These are SMOTE variants for specific problems. <b>ADASYN</b> generates more synthetic points for minority samples that sit in <b>hard regions</b> (many majority neighbours). <b>SMOTE-NC</b> handles <b>mixed numeric and categorical</b> columns. <b>SMOTE-Tomek</b> oversamples with SMOTE and then <b>cleans</b> overlapping Tomek links (opposite-class nearest-neighbour pairs).",
      how: [
        "ADASYN: for each minority sample compute r = (majority neighbours) / k, then normalise r over all samples",
        "ADASYN: generate synthetic points in proportion to the normalised r",
        "SMOTE-NC: pass the categorical column indices; numeric parts are interpolated, categories take the most common neighbour value",
        "SMOTE-Tomek: run SMOTE, then remove Tomek-link points to sharpen the boundary",
        "Check the class counts after resampling"
      ],
      ex: "ADASYN with k = 5: minority sample A has 4 majority neighbours (r = 0.8) and B has 1 (r = 0.2). Normalised weights are 0.8 and 0.2, so if 10 synthetic points are needed, A gets 8 and B gets 2.",
      code: "from imblearn.combine import SMOTETomek\nfrom imblearn.over_sampling import ADASYN, SMOTENC\nfrom sklearn.datasets import make_classification\n\nX, y = make_classification(n_samples=500, weights=[0.9], flip_y=0, random_state=1)\nX_a, y_a = ADASYN(random_state=1).fit_resample(X, y)\nX_t, y_t = SMOTETomek(random_state=1).fit_resample(X, y)\nXc = X.copy()\nXc[:, 0] = (Xc[:, 0] > 0).astype(int)          # pretend column 0 is categorical\nX_n, y_n = SMOTENC(categorical_features=[0], random_state=1).fit_resample(Xc, y)\nprint(len(y_a), len(y_t), len(y_n))",
      pros: ["Targets the difficult regions (ADASYN)", "Handles categorical columns (SMOTE-NC)", "Cleaner class boundary (SMOTE-Tomek)"],
      cons: ["ADASYN amplifies noise and outliers", "More parameters and more compute than SMOTE", "Gains over plain SMOTE are often small"],
      tip: "Reach for these only when plain SMOTE is clearly failing. Use SMOTE-NC rather than one-hot encoding before SMOTE, since interpolating one-hot columns produces invalid fractional values."
    },
    {
      n: "Threshold tuning",
      what: "Most classifiers output a probability and predict \"positive\" above 0.5, but 0.5 is rarely the best cut-off for a rare class. <b>Lowering the threshold</b> finds more positives (higher recall, lower precision); raising it does the opposite. You choose the threshold that fits the cost of each kind of error, using the precision-recall curve on validation data.",
      how: [
        "Train the model and get probabilities with predict_proba on a validation set",
        "precision_recall_curve(y_val, proba) returns precision, recall and thresholds",
        "Choose a threshold: maximise F1, or the best precision for a required recall",
        "Predict positive when proba ≥ threshold",
        "Check the final result once on the test set"
      ],
      ex: "Probabilities [0.9, 0.7, 0.45, 0.35, 0.2, 0.1] for true labels [1, 0, 1, 1, 0, 0]. At 0.5: TP = 1, FP = 1, precision 0.50, recall 1/3. At 0.3: TP = 3, FP = 1, precision 0.75, recall 1.00. Lowering the cut-off improved both here.",
      code: "import numpy as np\nfrom sklearn.datasets import make_classification\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import precision_recall_curve\nfrom sklearn.model_selection import train_test_split\n\nX, y = make_classification(n_samples=2000, weights=[0.95], flip_y=0, random_state=0)\nXtr, Xval, ytr, yval = train_test_split(X, y, stratify=y, random_state=0)\nproba = LogisticRegression(max_iter=1000).fit(Xtr, ytr).predict_proba(Xval)[:, 1]\np, r, t = precision_recall_curve(yval, proba)\nf1 = 2 * p[:-1] * r[:-1] / (p[:-1] + r[:-1] + 1e-12)   # thresholds has one fewer entry\nprint('best threshold', t[np.argmax(f1)])",
      pros: ["No change to the data or model", "Directly reflects business costs", "Works with any probabilistic classifier"],
      cons: ["Needs reasonably calibrated probabilities", "Threshold may not stay optimal if class balance shifts", "Choosing it on the test set overstates performance"],
      tip: "Pick the threshold on validation data (or via cross-validation), not on the test set. It can be combined with class weights or resampling, and scikit-learn's TunedThresholdClassifierCV (1.5+) automates it."
    },
    {
      n: "Resample training data only",
      what: "Resampling is part of <b>training</b>, not of evaluation. If you oversample before splitting, copies or synthetic neighbours of the same rows land in both train and test, so the model is tested on near-duplicates of what it has seen and the score is falsely high. The test set must keep the real class ratio.",
      how: [
        "Split into train / test first (use stratify=y)",
        "Resample only the training part",
        "Inside cross-validation, resample only the training fold",
        "Use imblearn.pipeline.Pipeline so this happens automatically",
        "Evaluate on untouched data with PR-AUC, recall, precision or F1"
      ],
      ex: "900 negatives and 100 positives; 20% test → train 720/80, test 180/20. Correct: SMOTE only the train part to 720/720 and keep the test at 180/20. Wrong: SMOTE the full data to 900/900 first, then split; the test positives are interpolations of train positives and recall looks inflated.",
      code: "from imblearn.over_sampling import SMOTE\nfrom imblearn.pipeline import Pipeline\nfrom sklearn.datasets import make_classification\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import StratifiedKFold, cross_val_score\n\nX, y = make_classification(n_samples=1000, weights=[0.9], flip_y=0, random_state=0)\n# SMOTE runs only on each training fold, never on the validation fold\npipe = Pipeline([('smote', SMOTE(random_state=0)), ('clf', LogisticRegression(max_iter=1000))])\ncv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)\nprint(cross_val_score(pipe, X, y, cv=cv, scoring='average_precision').mean())",
      pros: ["Gives an honest estimate of real-world performance", "Pipeline makes it automatic and repeatable", "Prevents train/test contamination"],
      cons: ["Needs imblearn's Pipeline (sklearn's Pipeline does not accept samplers)", "Slightly more code", "Easy to forget when working in notebooks"],
      tip: "Evaluate on data with the true class ratio and report precision, recall and PR-AUC, not accuracy. The same rule applies to scalers, encoders and imputers: fit on the training data only."
    }
  ];
})();
