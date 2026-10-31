(function () {
  var D = (window.FE_DETAILS = window.FE_DETAILS || {});

  D["Encoding Categories"] = [
    {
      n: "One-hot encoding",
      what: "One-hot encoding replaces a single categorical column with one new 0/1 column per category. Exactly one of those columns is 1 for each row, so the model sees each category as its own independent switch and never assumes a fake order between them (Red is not 'less than' Blue).",
      how: [
        "Learn the list of distinct categories from the <b>training</b> data.",
        "Create one binary column per category.",
        "For each row put 1 in the column of its category and 0 everywhere else.",
        "At prediction time, categories never seen in training are mapped to all zeros (<code>handle_unknown='ignore'</code>)."
      ],
      ex: "Column color = [Red, Green, Blue, Green]. Columns are sorted alphabetically: [Blue, Green, Red]. Red → [0, 0, 1], Green → [0, 1, 0], Blue → [1, 0, 0], Green → [0, 1, 0]. A new test value 'Purple' becomes [0, 0, 0].",
      code: "import pandas as pd\nfrom sklearn.preprocessing import OneHotEncoder\ntrain = pd.DataFrame({'color': ['Red', 'Green', 'Blue', 'Green']})\ntest = pd.DataFrame({'color': ['Red', 'Purple']})\nenc = OneHotEncoder(handle_unknown='ignore', sparse_output=False)  # sparse_output: sklearn >= 1.2\nenc.fit(train)  # learn categories on train only\nprint(enc.get_feature_names_out())  # color_Blue, color_Green, color_Red\nprint(enc.transform(test))  # Red -> [0,0,1]; unseen Purple -> [0,0,0]",
      pros: [
        "No artificial ordering is introduced.",
        "Works well with linear models, KNN, SVM and neural networks.",
        "Simple, deterministic and easy to explain."
      ],
      cons: [
        "Column count grows with the number of categories (curse of dimensionality).",
        "Very sparse for high-cardinality columns such as zip codes.",
        "The columns are perfectly collinear (they sum to 1), which matters for unregularised linear models."
      ],
      tip: "Always use <code>handle_unknown='ignore'</code> inside a Pipeline so new categories at serving time don't crash. For columns with many levels, add <code>min_frequency</code> or switch to target / frequency / hashing encoding."
    },
    {
      n: "Dummy encoding",
      what: "Dummy encoding is one-hot encoding with one column removed. The dropped category becomes the <i>reference level</i> and is represented by all zeros. This removes the redundancy in one-hot columns (they always sum to 1), which otherwise makes the intercept and coefficients of an unregularised linear model non-identifiable - the 'dummy variable trap'.",
      how: [
        "Pick a reference category (alphabetically first by default, or choose one that is meaningful, e.g. the most common).",
        "Create k − 1 binary columns for the k categories.",
        "The reference category is encoded as all zeros.",
        "Each coefficient is then read as 'effect versus the reference category'."
      ],
      ex: "color = [Red, Green, Blue, Green]. With Blue as the dropped (first alphabetical) level, columns are [Green, Red]: Red → [0, 1], Green → [1, 0], Blue → [0, 0], Green → [1, 0]. Three categories need only 2 columns.",
      code: "import pandas as pd\nfrom sklearn.preprocessing import OneHotEncoder\ndf = pd.DataFrame({'color': ['Red', 'Green', 'Blue', 'Green']})\n# pandas: drops the first level ('Blue')\nprint(pd.get_dummies(df['color'], prefix='color', drop_first=True, dtype=int))\n# sklearn equivalent, safe for unseen test categories\nenc = OneHotEncoder(drop='first', handle_unknown='ignore', sparse_output=False)\nprint(enc.fit_transform(df))",
      pros: [
        "Removes perfect multicollinearity for plain linear / logistic regression.",
        "One fewer column than one-hot.",
        "Coefficients have a clear 'versus baseline' meaning."
      ],
      cons: [
        "The baseline choice changes how coefficients read.",
        "Unseen categories silently look like the baseline.",
        "Makes no difference for tree models and little for regularised models."
      ],
      tip: "Use it for statsmodels-style linear regression where you want interpretable coefficients. With Ridge / Lasso, trees or neural nets, full one-hot is fine and avoids the hidden 'unknown = baseline' behaviour."
    },
    {
      n: "Label encoding",
      what: "Label encoding maps each category to an integer (0, 1, 2, ...). It is compact, but the integers imply an order and distances that don't exist for nominal data - a linear model will treat 'dog = 2' as twice 'cat = 1'. In scikit-learn, <code>LabelEncoder</code> is designed for the <b>target</b> y; for input features use <code>OrdinalEncoder</code>.",
      how: [
        "Sort the distinct labels (alphabetical by default).",
        "Assign integer codes 0 … k − 1 in that order.",
        "Replace each label by its code.",
        "Keep the fitted encoder so you can <code>inverse_transform</code> predictions back to names."
      ],
      ex: "animal = [cat, dog, bird, dog]. Sorted classes are [bird, cat, dog] → bird = 0, cat = 1, dog = 2. The column becomes [1, 2, 0, 2]. A linear model would wrongly think dog (2) is 'greater' than cat (1).",
      code: "from sklearn.preprocessing import LabelEncoder\ny_train = ['cat', 'dog', 'bird', 'dog']\nle = LabelEncoder()\ny_enc = le.fit_transform(y_train)  # fit on train labels only\nprint(le.classes_)  # ['bird' 'cat' 'dog']\nprint(y_enc)  # [1 2 0 2]\nprint(le.inverse_transform([2, 0]))  # back to names: ['dog' 'bird']",
      pros: [
        "Very compact: one numeric column.",
        "Perfect for class labels of a classifier.",
        "Fine for tree-based models that only split on thresholds."
      ],
      cons: [
        "Creates a fake order for nominal features.",
        "Misleads linear models, KNN, SVM and neural nets.",
        "<code>LabelEncoder</code> raises an error on labels unseen during fit."
      ],
      tip: "Use LabelEncoder only for the target. For features use OrdinalEncoder (real order) or one-hot / target encoding (no order). Many gradient-boosting libraries can also take native categorical columns."
    },
    {
      n: "Ordinal encoding",
      what: "Ordinal encoding assigns integers to categories <b>that have a genuine natural order</b>, such as Low &lt; Medium &lt; High or education level. Because you specify the order explicitly, the numbers carry real meaning: bigger means 'more'. The gaps are assumed equal, which is a simplification.",
      how: [
        "Decide the correct order of categories from domain knowledge.",
        "Pass that order to <code>OrdinalEncoder(categories=[[...]])</code> (otherwise it sorts alphabetically, which is usually wrong).",
        "Map each category to its position 0, 1, 2, ...",
        "Choose how to treat unseen values with <code>handle_unknown='use_encoded_value'</code> and <code>unknown_value=-1</code>."
      ],
      ex: "size = [Low, High, Medium, Low] with order Low &lt; Medium &lt; High gives Low = 0, Medium = 1, High = 2 → [0, 2, 1, 0]. Without specifying the order, alphabetical sorting would give High = 0, Low = 1, Medium = 2, which is wrong.",
      code: "import pandas as pd\nfrom sklearn.preprocessing import OrdinalEncoder\ntrain = pd.DataFrame({'size': ['Low', 'High', 'Medium', 'Low']})\ntest = pd.DataFrame({'size': ['Medium', 'Huge']})\nenc = OrdinalEncoder(categories=[['Low', 'Medium', 'High']],  # explicit order\n                     handle_unknown='use_encoded_value', unknown_value=-1)\nprint(enc.fit_transform(train).ravel())  # [0. 2. 1. 0.]\nprint(enc.transform(test).ravel())  # [ 1. -1.] (unseen 'Huge' -> -1)",
      pros: [
        "Keeps order information in a single column.",
        "Compact and works with every model type.",
        "Easy to interpret."
      ],
      cons: [
        "Assumes equal spacing between levels.",
        "Wrong or alphabetical order silently hurts the model.",
        "Not appropriate for nominal categories."
      ],
      tip: "Always list the categories explicitly. If the gaps clearly aren't equal (e.g. salary bands), consider mapping to meaningful numbers (band midpoints) instead of 0, 1, 2."
    },
    {
      n: "Target / mean encoding",
      what: "Target encoding replaces each category with a (smoothed) average of the target for that category, which packs a lot of signal into one numeric column even for thousands of categories. Rare categories have noisy means, so they are pulled toward the global mean: <b>encoded = (n·mean_cat + m·global_mean) / (n + m)</b>, where n is the category's row count and m the smoothing strength.",
      how: [
        "Compute the global target mean and, per category, its count n and mean.",
        "Blend: encoded = (n·mean_cat + m·global_mean) / (n + m).",
        "Compute the training encoding with <b>cross-fitting</b> (out-of-fold), so a row never sees its own label.",
        "For test data use the encodings learned on the full training set."
      ],
      ex: "Four rows with city = [A, A, A, B] and y = [1, 1, 0, 0]: A has y = [1, 1, 0] (n = 3, mean 0.667), B has y = [0] (n = 1, mean 0), global mean = 0.5, m = 2. A → (3·0.667 + 2·0.5)/5 = 0.6; B → (1·0 + 2·0.5)/3 = 0.333. The single-row category B is pulled strongly toward 0.5.",
      code: "import numpy as np, pandas as pd\nfrom sklearn.preprocessing import TargetEncoder  # sklearn >= 1.3\nrng = np.random.default_rng(0)\nX = pd.DataFrame({'city': rng.choice(['A', 'B', 'C'], 200)})\ny = (rng.random(200) < np.where(X['city'] == 'A', 0.8, 0.3)).astype(int)\nX_tr, X_te, y_tr = X[:150], X[150:], y[:150]\nte = TargetEncoder(smooth='auto', target_type='binary')\nX_tr_enc = te.fit_transform(X_tr, y_tr)  # internal cross-fitting\nX_te_enc = te.transform(X_te)  # uses full-train encodings",
      pros: [
        "One column no matter how many categories.",
        "Captures the relationship with the target directly.",
        "Good for high-cardinality features like zip code."
      ],
      cons: [
        "High risk of target leakage and overfitting if done naively.",
        "Needs smoothing and cross-fitting for rare categories.",
        "Distribution shift changes the meaning of the encoding."
      ],
      tip: "Never compute category means on the whole dataset before splitting. Use <code>fit_transform</code> on train only (it cross-fits) and <code>transform</code> on validation / test, ideally inside a Pipeline."
    },
    {
      n: "Frequency / count encoding",
      what: "Frequency encoding replaces each category with how often it occurs (a raw count or a proportion) in the training data. It uses no target information, so it can't leak, and it helps when popularity itself is informative (a frequent product or a common browser). Different categories with equal counts get the same number, which is a collision.",
      how: [
        "Count how many times each category appears in the <b>training</b> set.",
        "Optionally divide by the number of rows to get a proportion.",
        "Map each row's category to its count or proportion.",
        "For unseen test categories use 0 (or a small constant)."
      ],
      ex: "c = [A, B, A, C, A, B, ...] → counts A = 3, B = 2, C = 1 out of 6 rows. Count encoding gives A → 3, B → 2, C → 1; proportion encoding gives A → 0.5, B → 0.333, C → 0.167.",
      code: "import pandas as pd\ntrain = pd.DataFrame({'c': list('ABACAB')})\ntest = pd.DataFrame({'c': ['A', 'C', 'Z']})\nfreq = train['c'].value_counts(normalize=True)  # A .5, B .333, C .167\ntrain['c_freq'] = train['c'].map(freq)\ntest['c_freq'] = test['c'].map(freq).fillna(0)  # unseen 'Z' -> 0\nprint(train)\nprint(test)",
      pros: [
        "No leakage because the target isn't used.",
        "One numeric column; very fast.",
        "Works naturally with high-cardinality features."
      ],
      cons: [
        "Different categories with the same count become indistinguishable.",
        "Only useful if frequency correlates with the target.",
        "Counts shift if the data distribution changes."
      ],
      tip: "Compute the mapping on the training set only and reuse it for test. Often combined with another encoding (e.g. target encoding) so that equal-count categories can still be told apart."
    },
    {
      n: "Binary encoding",
      what: "Binary encoding first gives every category an integer id, then writes that integer in binary and spreads the bits over several 0/1 columns. k categories need only about log2(k) columns, so it is a middle ground between label encoding (1 column) and one-hot (k columns).",
      how: [
        "Assign each category an integer id (1, 2, 3, ...).",
        "Write the id in binary.",
        "Pad with zeros to the same number of bits, ceil(log2(k + 1)).",
        "Each bit position becomes its own 0/1 column."
      ],
      ex: "Five cities in order of appearance: Delhi = 1, Pune = 2, Goa = 3, Agra = 4, Kochi = 5. In 3 bits: Delhi 001, Pune 010, Goa 011, Agra 100, Kochi 101. So 5 categories use 3 columns instead of 5; 1,000 categories would need only 10.",
      code: "import pandas as pd\nimport category_encoders as ce  # pip install category_encoders\ntrain = pd.DataFrame({'city': ['Delhi', 'Pune', 'Goa', 'Agra', 'Kochi', 'Pune']})\ntest = pd.DataFrame({'city': ['Goa', 'Kochi']})\nbe = ce.BinaryEncoder(cols=['city'])\nprint(be.fit_transform(train))  # columns city_0, city_1, city_2\nprint(be.transform(test))  # reuse the learned mapping",
      pros: [
        "Far fewer columns than one-hot for many categories.",
        "No target used, so no leakage.",
        "Deterministic and invertible."
      ],
      cons: [
        "Bits share columns, so unrelated categories look partly similar.",
        "Harder to interpret than one-hot.",
        "Not ideal for linear models that need clean category effects."
      ],
      tip: "A good compromise for 20 - 1,000 categories with tree or neural models. For linear models, one-hot or target encoding usually gives cleaner results."
    },
    {
      n: "Hashing trick",
      what: "The hashing trick passes each category string through a hash function and uses the result modulo n_features as the column index. You choose a fixed number of output columns up front, so no vocabulary is stored and brand-new categories are handled automatically. Different categories can collide into the same column.",
      how: [
        "Choose the output width n_features (e.g. 32 or 1024).",
        "Compute hash(category) mod n_features to pick a column.",
        "Add 1 (or ±1 when <code>alternate_sign=True</code>) in that column.",
        "No fitting is needed: the transformer is stateless."
      ],
      ex: "10,000 distinct zip codes hashed into n_features = 32 columns means about 10,000 / 32 ≈ 312 zip codes share each column on average. The model sees a compact 32-dimensional vector; unseen zip codes at test time still land in some column.",
      code: "import pandas as pd\nfrom sklearn.feature_extraction import FeatureHasher\ndf = pd.DataFrame({'zip': ['10001', '94105', '60601', '10001']})\nh = FeatureHasher(n_features=8, input_type='string', alternate_sign=False)\n# each row must be a list of strings\nX = h.transform([[z] for z in df['zip']]).toarray()\nprint(X.shape)  # (4, 8)\nprint(X[0].argmax() == X[3].argmax())  # same zip -> same column: True",
      pros: [
        "Fixed memory and column count regardless of cardinality.",
        "Handles unseen categories and streaming data.",
        "No fit step; very fast."
      ],
      cons: [
        "Collisions mix unrelated categories.",
        "Columns are not interpretable and can't be inverted.",
        "Needs n_features large enough to keep collisions rare."
      ],
      tip: "Set <code>alternate_sign=False</code> if you want plain non-negative counts (e.g. for Naive Bayes). Try a few n_features values and keep the smallest that doesn't hurt validation score."
    },
    {
      n: "Leave-one-out / CatBoost encoding",
      what: "These are target encodings designed to reduce leakage. <b>Leave-one-out</b> computes each training row's category mean from <i>all the other rows</i> of that category. <b>CatBoost (ordered) encoding</b> goes through the rows in order and uses only the rows that came <i>before</i>, plus a prior, so a row never sees its own label.",
      how: [
        "Leave-one-out: encoded = (sum_of_y_in_category − own_y) / (n − 1).",
        "CatBoost: encoded = (sum_of_previous_y + prior·a) / (count_previous + a).",
        "Fit on the training data only.",
        "For test rows use the full-category statistics (no exclusion)."
      ],
      ex: "Category A has y = [1, 0, 1, 1] (sum 3, n = 4). Leave-one-out gives [(3−1)/3, 3/3, (3−1)/3, (3−1)/3] = [0.667, 1.0, 0.667, 0.667]. Note the row with y = 0 gets the <i>higher</i> value, so within a category the encoding still leaks the label inversely.",
      code: "import pandas as pd\nimport category_encoders as ce\nX = pd.DataFrame({'city': ['A', 'A', 'A', 'A', 'B', 'B']})\ny = pd.Series([1, 0, 1, 1, 0, 1])\nloo = ce.LeaveOneOutEncoder(cols=['city'], sigma=0.05, random_state=42)  # noise on train\nX_loo = loo.fit_transform(X, y)  # target needed when fitting\ncb = ce.CatBoostEncoder(cols=['city'], random_state=42)  # ordered encoding\nX_cb = cb.fit_transform(X, y)\nprint(X_loo.round(3).T)\nprint(X_cb.round(3).T)",
      pros: [
        "One numeric column for any cardinality.",
        "Less leakage than naive target encoding.",
        "CatBoost's ordered scheme closely mimics unseen-data behaviour."
      ],
      cons: [
        "Plain leave-one-out still leaks (row's own label shifts its value).",
        "CatBoost encoding depends on row order.",
        "Noisy for very small categories."
      ],
      tip: "Add noise (<code>sigma</code>) or shuffle rows before ordered encoding when using leave-one-out with tree models, and validate on a truly held-out set - leaky encodings give deceptively good CV scores."
    },
    {
      n: "Weight of Evidence (WoE)",
      what: "WoE measures how strongly a category separates the two classes: <b>WoE = ln(%good / %bad)</b>, where %good is the share of all 'good' cases falling in the category and %bad the share of all 'bad' cases. Positive means the category is richer in 'good', negative richer in 'bad'. It's popular in credit scoring because it linearises the effect for logistic regression. <i>Convention warning:</i> which class is 'good' varies; <code>category_encoders.WOEEncoder</code> uses target = 1 as the numerator class.",
      how: [
        "Count total good and total bad cases in the training data.",
        "For each category compute %good = good_in_cat / total_good and %bad = bad_in_cat / total_bad.",
        "WoE = ln(%good / %bad).",
        "Add smoothing (regularisation) to avoid dividing by zero for empty cells."
      ],
      ex: "Totals: 800 good, 200 bad. Job X: 400 good, 50 bad → %good 0.5, %bad 0.25 → ln(2) = +0.693. Job Y: 100 good, 100 bad → 0.125 / 0.5 → ln(0.25) = −1.386. Job Z: 300 good, 50 bad → 0.375 / 0.25 → ln(1.5) = +0.405.",
      code: "import pandas as pd\nimport category_encoders as ce\nX = pd.DataFrame({'job': ['X', 'X', 'X', 'Y', 'Y', 'Z', 'Z', 'Z']})\ny = pd.Series([1, 1, 0, 1, 0, 1, 1, 0])  # 1 = the 'numerator' class\nwoe = ce.WOEEncoder(cols=['job'], regularization=1.0)  # smoothing avoids ln(0)\nX_woe = woe.fit_transform(X, y)  # learn on train only\nprint(X_woe['job'].round(3).tolist())\nprint(woe.transform(pd.DataFrame({'job': ['X', 'Y']})))",
      pros: [
        "Monotonic, interpretable log-odds style feature.",
        "Handles any cardinality with one column.",
        "Standard in scorecard modelling."
      ],
      cons: [
        "Binary targets only.",
        "Leaks if fitted on all the data; empty cells give ±infinity without smoothing.",
        "Sign convention differs between tools."
      ],
      tip: "State which class is 'good' in your documentation and keep it consistent. Fit on training data only and keep the smoothing on; bin rare categories first."
    },
    {
      n: "Entity embeddings",
      what: "An entity embedding gives every category a small learnable vector (say 8 numbers) stored in a lookup table inside a neural network. Training adjusts the vectors so categories that behave similarly end up close together, so the model can learn relationships you never specified. The vectors can be reused as features for other models.",
      how: [
        "Map each category to an integer id 0 … k − 1.",
        "Create an embedding table of shape k × d (d is often min(50, (k + 1) // 2)).",
        "Look up the row for each id and feed it to the rest of the network.",
        "Train end to end so the table is learned with the other weights."
      ],
      ex: "A store column with 1,000 stores and d = 8 gives a 1,000 × 8 table (8,000 trainable numbers) instead of 1,000 one-hot columns. Store id 17 simply fetches row 17, e.g. a vector like [0.12, −0.40, ...], which training refines.",
      code: "import torch\nimport torch.nn as nn\nemb = nn.Embedding(num_embeddings=1000, embedding_dim=8)  # 1000 stores -> 8-d vectors\nstore_ids = torch.tensor([3, 17, 17])  # integer-coded categories\nvecs = emb(store_ids)  # shape (3, 8)\nprint(vecs.shape)\nprint(torch.equal(vecs[1], vecs[2]))  # same id -> same vector: True\n# in a model: concat vecs with numeric features, then Linear layers",
      pros: [
        "Compact dense representation for very high cardinality.",
        "Learns similarity between categories.",
        "Embeddings can be reused in other models."
      ],
      cons: [
        "Needs a neural network and enough data.",
        "Rare categories get poorly trained vectors.",
        "Less interpretable and slower to build than simple encoders."
      ],
      tip: "Reserve an id for 'unknown' so new categories map to a trained fallback vector. For small tabular datasets, target or one-hot encoding with gradient boosting is often just as good."
    },
    {
      n: "Rare-label grouping",
      what: "Rare-label grouping merges infrequent categories into one shared 'Other' (infrequent) level. Very rare categories give the model too few examples to learn from and produce lots of almost-empty one-hot columns, so combining them reduces dimensionality and overfitting.",
      how: [
        "Count each category's frequency in the training set.",
        "Choose a threshold: <code>min_frequency</code> as a count (int) or fraction (float), or <code>max_categories</code>.",
        "Merge every category below the threshold into one 'infrequent' level.",
        "Then apply the chosen encoding (usually one-hot)."
      ],
      ex: "1,000 rows with A = 500, B = 300, C = 150, D = 30, E = 20. With min_frequency = 0.05 (50 rows), D (3%) and E (2%) are merged. One-hot output has 4 columns: A, B, C and infrequent (50 rows) instead of 5.",
      code: "import pandas as pd\nfrom sklearn.preprocessing import OneHotEncoder\ntrain = pd.DataFrame({'x': ['A'] * 50 + ['B'] * 30 + ['C'] * 15 + ['D'] * 3 + ['E'] * 2})\nenc = OneHotEncoder(min_frequency=0.05, handle_unknown='infrequent_if_exist',\n                    sparse_output=False)  # needs sklearn >= 1.1\nenc.fit(train)\nprint(enc.get_feature_names_out())  # x_A, x_B, x_C, x_infrequent_sklearn\nprint(enc.transform(pd.DataFrame({'x': ['E', 'Q']})))  # both -> infrequent column",
      pros: [
        "Fewer, denser columns.",
        "Reduces overfitting to rare categories.",
        "Gives unseen categories a sensible home."
      ],
      cons: [
        "Loses detail if a rare category is actually predictive (e.g. fraud).",
        "Threshold is a hyper-parameter.",
        "Merged group may mix unrelated categories."
      ],
      tip: "Decide the threshold from the training set only, and check that rare groups aren't the ones carrying the signal (e.g. rare but high-risk merchants). Treat the cut-off as a hyper-parameter and validate it."
    }
  ];

  D["Scaling & Transforms"] = [
    {
      n: "Standardisation (Z-score)",
      what: "Standardisation recentres a feature to mean 0 and rescales it to standard deviation 1, so each value says 'how many standard deviations from the average'. It puts features measured in different units (rupees vs. years) on a comparable footing. It doesn't change the shape of the distribution.",
      how: [
        "Compute mean μ and standard deviation σ on the <b>training</b> data.",
        "z = (x − μ) / σ",
        "Apply the same μ and σ to validation and test data.",
        "StandardScaler uses the population std (divides by n, ddof = 0)."
      ],
      ex: "x = [10, 20, 30, 40, 50]: mean = 30, σ = √((400 + 100 + 0 + 100 + 400)/5) = √200 = 14.142. z = [−1.414, −0.707, 0, 0.707, 1.414]. The new mean is 0 and std is 1.",
      code: "import numpy as np\nfrom sklearn.preprocessing import StandardScaler\nX_train = np.array([[10.], [20.], [30.], [40.], [50.]])\nX_test = np.array([[60.]])\nsc = StandardScaler()\nprint(sc.fit_transform(X_train).ravel().round(3))  # [-1.414 -0.707 0. 0.707 1.414]\nprint(sc.transform(X_test).round(3))  # (60-30)/14.142 = 2.121\nprint(sc.mean_, sc.scale_)  # learned on train only",
      pros: [
        "Required by many models (SVM, KNN, logistic regression, PCA, neural nets).",
        "Makes regularisation and gradient descent behave evenly across features.",
        "Not bounded, so new extremes are preserved."
      ],
      cons: [
        "Mean and std are sensitive to outliers.",
        "Doesn't fix skew.",
        "Values are not in a fixed range."
      ],
      tip: "Fit the scaler on training data only (use a Pipeline) to avoid leakage. If outliers dominate, prefer RobustScaler or transform the feature first."
    },
    {
      n: "Min-Max scaling",
      what: "Min-Max scaling linearly squeezes a feature into a fixed range, usually 0 to 1, with the smallest training value mapped to 0 and the largest to 1. The shape of the distribution is unchanged, only its scale and offset.",
      how: [
        "Find min and max of each feature on the <b>training</b> data.",
        "x' = (x − min) / (max − min)",
        "For another range [a, b]: x'' = a + x'·(b − a).",
        "Apply the stored min and max to new data (values outside can fall below 0 or above 1)."
      ],
      ex: "Ages [20, 30, 40, 60]: min = 20, max = 60 (range 40). Scaled: [0, 0.25, 0.5, 1.0]. A new test age of 70 gives (70 − 20)/40 = 1.25, outside the 0-1 range.",
      code: "import numpy as np\nfrom sklearn.preprocessing import MinMaxScaler\nX_train = np.array([[20.], [30.], [40.], [60.]])\nX_test = np.array([[70.]])\nmm = MinMaxScaler(feature_range=(0, 1))\nprint(mm.fit_transform(X_train).ravel())  # [0. 0.25 0.5 1.]\nprint(mm.transform(X_test))  # [[1.25]] - not clipped by default\n# MinMaxScaler(clip=True) would cap test values to 0..1",
      pros: [
        "Bounded output range suits neural nets and image pixels.",
        "Simple and keeps the original shape.",
        "Easy to interpret."
      ],
      cons: [
        "A single outlier compresses all other values into a tiny range.",
        "Test data can fall outside the range.",
        "Doesn't centre the data."
      ],
      tip: "Use it when you need a bounded range or the data is free of extreme outliers. Otherwise, StandardScaler or RobustScaler is usually safer."
    },
    {
      n: "Robust scaling",
      what: "Robust scaling centres on the <b>median</b> and divides by the <b>interquartile range</b> (IQR = Q3 − Q1). Median and IQR ignore the extreme 25% at each end, so a few huge outliers barely change the scale of the typical values.",
      how: [
        "Compute median, Q1 (25th percentile) and Q3 (75th percentile) on training data.",
        "IQR = Q3 − Q1",
        "x' = (x − median) / IQR",
        "Apply the same statistics to test data."
      ],
      ex: "x = [10, 12, 14, 16, 200]: median = 14, Q1 = 12, Q3 = 16, IQR = 4. Scaled = [−1, −0.5, 0, 0.5, 46.5], so the outlier stays obvious. StandardScaler would instead give the four normal values roughly −0.54 … −0.46 (squashed together) because the outlier inflates the std to about 74.8.",
      code: "import numpy as np\nfrom sklearn.preprocessing import RobustScaler\nX_train = np.array([[10.], [12.], [14.], [16.], [200.]])\nrs = RobustScaler(quantile_range=(25.0, 75.0))\nprint(rs.fit_transform(X_train).ravel())  # [-1. -0.5 0. 0.5 46.5]\nprint(rs.center_, rs.scale_)  # median 14, IQR 4\n# the outlier is still visible but doesn't distort the others",
      pros: [
        "Resistant to outliers.",
        "Keeps the typical values on a sensible scale.",
        "Simple drop-in replacement for StandardScaler."
      ],
      cons: [
        "Output is not bounded.",
        "Outliers remain huge in the scaled data.",
        "IQR can be 0 for features with many repeated values."
      ],
      tip: "Great default for messy real-world numeric data. If you also want to limit the influence of outliers, combine it with capping or a log transform."
    },
    {
      n: "MaxAbs scaling",
      what: "MaxAbs scaling divides each feature by its largest absolute value, producing values in [−1, 1]. Since it doesn't shift the data, zeros stay zeros - so a sparse matrix stays sparse.",
      how: [
        "Find max |x| for each feature on training data.",
        "x' = x / max|x|",
        "Apply the same divisor to test data.",
        "No centring is done, so the mean is generally not 0."
      ],
      ex: "x = [−4, 0, 2, 8]: max |x| = 8. Scaled = [−0.5, 0, 0.25, 1.0]. The zero stays exactly 0, which is why sparse data is preserved.",
      code: "import numpy as np\nfrom scipy import sparse\nfrom sklearn.preprocessing import MaxAbsScaler\nX_train = np.array([[-4.], [0.], [2.], [8.]])\nma = MaxAbsScaler()\nprint(ma.fit_transform(X_train).ravel())  # [-0.5 0. 0.25 1.]\nX_sp = sparse.csr_matrix(X_train)  # works directly on sparse input\nprint(ma.transform(X_sp).toarray().ravel())",
      pros: [
        "Preserves sparsity and zeros.",
        "Output bounded in [−1, 1].",
        "Very cheap."
      ],
      cons: [
        "A single outlier shrinks all other values.",
        "Doesn't centre the data.",
        "Test data can exceed ±1."
      ],
      tip: "Choose it for sparse features such as TF-IDF or one-hot output, where centring (StandardScaler with mean) would destroy sparsity. For sparse data you can also use <code>StandardScaler(with_mean=False)</code>."
    },
    {
      n: "Normalisation (unit vector)",
      what: "Unlike the other scalers, this works per <b>row</b>, not per column: each sample vector is divided by its own length so that its norm is 1. That removes the effect of overall magnitude (document length, total volume) and keeps only the direction, which is what cosine similarity compares.",
      how: [
        "Pick a norm: l2 (Euclidean), l1 (sum of absolute values) or max.",
        "Compute the norm of each row.",
        "x' = x / ||x||",
        "No fitting is needed (stateless transformer)."
      ],
      ex: "Rows [3, 4] and [6, 8]: L2 norms are √(9 + 16) = 5 and √(36 + 64) = 10. Both become [0.6, 0.8], so two rows that differ only in magnitude become identical. Check: 0.6² + 0.8² = 1.",
      code: "import numpy as np\nfrom sklearn.preprocessing import Normalizer\nX = np.array([[3., 4.], [6., 8.], [1., 0.]])\nnorm = Normalizer(norm='l2')  # row-wise scaling, stateless\nXn = norm.fit_transform(X)\nprint(Xn)  # [[0.6 0.8] [0.6 0.8] [1. 0.]]\nprint(np.linalg.norm(Xn, axis=1))  # [1. 1. 1.]",
      pros: [
        "Makes rows comparable regardless of magnitude.",
        "Ideal for cosine similarity, text vectors, clustering.",
        "No leakage concerns (stateless)."
      ],
      cons: [
        "Discards absolute magnitude information.",
        "Not a replacement for column scaling.",
        "All-zero rows stay zero."
      ],
      tip: "Don't confuse it with 'normalising columns' (Min-Max). Use it when direction matters more than size, e.g. TF-IDF vectors for k-means or nearest-neighbour search."
    },
    {
      n: "Log transform",
      what: "A log transform compresses large values much more than small ones, which pulls a long right tail in toward the bulk of the data and often makes relationships more linear and variances more stable. <code>log1p(x) = ln(1 + x)</code> is the safe version because it works at x = 0.",
      how: [
        "Check that the feature is non-negative (x &gt; −1 for log1p).",
        "x' = ln(1 + x) using <code>np.log1p</code>.",
        "Model on the transformed values.",
        "To go back, use <code>np.expm1</code> = e^x' − 1 (important for a log-transformed target)."
      ],
      ex: "x = [0, 9, 99, 999] → log1p = [0, 2.303, 4.605, 6.908]. The raw values span a factor of 1,000, but the logs are almost evenly spaced (each step ×10 adds 2.303).",
      code: "import numpy as np\nx = np.array([0, 9, 99, 999, 99999])  # skewed, e.g. incomes or counts\nx_log = np.log1p(x)  # ln(1 + x), safe at 0\nprint(x_log.round(3))  # [ 0. 2.303 4.605 6.908 11.513]\nprint(np.expm1(x_log).round(0))  # inverse: back to original values\n# for sklearn pipelines: FunctionTransformer(np.log1p, inverse_func=np.expm1)",
      pros: [
        "Fixes strong right skew and tames outliers.",
        "Simple and invertible.",
        "Turns multiplicative effects into additive ones."
      ],
      cons: [
        "Only valid for values &gt; −1 (log1p).",
        "Changes interpretation of coefficients.",
        "Can over-correct mild skew or create a left tail."
      ],
      tip: "Check the histogram before and after. If you log-transform the target, remember to invert predictions with <code>expm1</code>. Tree models don't need it."
    },
    {
      n: "Square-root / reciprocal",
      what: "These are gentler skew fixes than the log. The square root suits counts (it roughly stabilises Poisson variance) and moderate skew. The reciprocal 1/x flips the order and strongly shrinks large values, helpful for rates or time-per-unit measures.",
      how: [
        "Square root: x' = √x (needs x ≥ 0).",
        "Reciprocal: x' = 1 / x (needs x ≠ 0, ideally x &gt; 0).",
        "Rule of thumb for right skew, mildest to strongest: √x, then ln x, then 1/x.",
        "Check the histogram, then keep the transform that looks most symmetric."
      ],
      ex: "Counts [0, 1, 4, 9, 100] → √ = [0, 1, 2, 3, 10]; the extreme value 100 shrinks to just 10. Reciprocal of [2, 4, 5] = [0.5, 0.25, 0.2], which reverses the order: the largest x becomes the smallest value.",
      code: "import numpy as np\ncounts = np.array([0, 1, 4, 9, 100])\nprint(np.sqrt(counts))  # [ 0. 1. 2. 3. 10.]\ntimes = np.array([2., 4., 5.])\nprint(1 / times)  # [0.5 0.25 0.2 ] - order is reversed\n# for zeros use a small offset, e.g. 1 / (x + 1)",
      pros: [
        "Works with zeros (sqrt) where log needs log1p.",
        "Milder than log when skew is moderate.",
        "Reciprocal can linearise rate-like relationships."
      ],
      cons: [
        "Sqrt can't handle negatives; reciprocal can't handle zero.",
        "Reciprocal reverses order and is hard to interpret.",
        "May under- or over-correct the skew."
      ],
      tip: "Try several transforms and compare histograms or Q-Q plots. If you don't want to pick by hand, use PowerTransformer (Box-Cox / Yeo-Johnson) to find the best power automatically."
    },
    {
      n: "Box-Cox",
      what: "Box-Cox is a family of power transforms controlled by a parameter λ, which is chosen by maximum likelihood so that the result looks as Gaussian as possible. λ = 1 is almost no change, λ = 0.5 is like a square root, λ = 0 is the log, and λ = −1 is like a reciprocal. It requires <b>strictly positive</b> data.",
      how: [
        "Check that all training values are &gt; 0.",
        "y = (x^λ − 1) / λ for λ ≠ 0, and y = ln(x) for λ = 0.",
        "Estimate λ for each feature by maximum likelihood on training data.",
        "Reuse the learned λ on test data (and by default standardise the output)."
      ],
      ex: "With λ = 0.5 and x = [1, 4, 9]: y = (√x − 1)/0.5 = [0, 2, 4]. A skewed-looking sequence becomes evenly spaced. In practice λ is learned automatically, not chosen by hand.",
      code: "import numpy as np\nfrom sklearn.preprocessing import PowerTransformer\nrng = np.random.default_rng(0)\nX_train = rng.lognormal(mean=0, sigma=1, size=(200, 1))  # positive, skewed\nX_test = rng.lognormal(mean=0, sigma=1, size=(20, 1))\npt = PowerTransformer(method='box-cox', standardize=True)\nX_tr = pt.fit_transform(X_train)  # lambda fitted on train only\nX_te = pt.transform(X_test)\nprint(pt.lambdas_)  # close to 0 (i.e. log) for lognormal data",
      pros: [
        "Automatically finds a good power for each feature.",
        "Often makes data much closer to normal.",
        "Reversible with <code>inverse_transform</code>."
      ],
      cons: [
        "Only for strictly positive values.",
        "Harder to explain than log.",
        "Sensitive to outliers when estimating λ."
      ],
      tip: "If your data has zeros or negatives, use Yeo-Johnson instead. Fit inside a Pipeline so λ is learned from training data only."
    },
    {
      n: "Yeo-Johnson",
      what: "Yeo-Johnson extends Box-Cox so it works for zero and negative values too. It is a power transform with a parameter λ (fitted by maximum likelihood) that uses different formulas for the positive and negative parts so the result is smooth. It is the default method of scikit-learn's <code>PowerTransformer</code>.",
      how: [
        "x ≥ 0, λ ≠ 0: y = ((x + 1)^λ − 1) / λ ; x ≥ 0, λ = 0: y = ln(x + 1).",
        "x &lt; 0, λ ≠ 2: y = −((1 − x)^(2 − λ) − 1) / (2 − λ) ; x &lt; 0, λ = 2: y = −ln(1 − x).",
        "λ is estimated per feature on the training data.",
        "Output is standardised by default; apply the same fit to test data."
      ],
      ex: "With λ = 0 and x = [−1, 0, 3]: for x = −1, y = −((1 + 1)² − 1)/2 = −1.5; for x = 0, y = ln(1) = 0; for x = 3, y = ln(4) = 1.386. Result: [−1.5, 0, 1.386] (before optional standardisation).",
      code: "import numpy as np\nfrom sklearn.preprocessing import PowerTransformer\nrng = np.random.default_rng(1)\nX_train = rng.exponential(scale=2.0, size=(300, 1)) - 1.0  # skewed with negatives\nX_test = rng.exponential(scale=2.0, size=(30, 1)) - 1.0\npt = PowerTransformer(method='yeo-johnson')  # default; standardize=True\nX_tr = pt.fit_transform(X_train)\nX_te = pt.transform(X_test)  # reuse train lambda\nprint(pt.lambdas_, X_tr.mean().round(3), X_tr.std().round(3))",
      pros: [
        "Handles positive, zero and negative values.",
        "Learns λ automatically.",
        "Invertible and built into scikit-learn."
      ],
      cons: [
        "Formulas are harder to explain.",
        "Doesn't guarantee a perfectly normal result.",
        "Outliers can distort the fitted λ."
      ],
      tip: "A safe default when you don't know whether a skewed column has non-positive values. For strictly positive data Box-Cox and Yeo-Johnson give similar results."
    },
    {
      n: "Quantile transform",
      what: "A quantile transform replaces each value with its rank-based position in the training distribution, then maps that to a uniform or normal distribution. It is non-linear and rank-preserving, and flattens any weird shape (multi-modal, heavy-tailed) and neutralises outliers.",
      how: [
        "Estimate the empirical CDF (quantiles) of each feature on the training data.",
        "Map each value to its cumulative probability (uniform output, range 0-1).",
        "Optionally pass the probabilities through the inverse normal CDF for a Gaussian output (<code>output_distribution='normal'</code>).",
        "Test values outside the training range are clipped to the min / max."
      ],
      ex: "x = [1, 2, 3, 4, 100] with 5 quantiles: ranks map to [0, 0.25, 0.5, 0.75, 1.0] (uniform). The outlier 100 is just 'the largest' = 1.0, no more extreme than it needs to be. A test value 500 also maps to 1.0.",
      code: "import numpy as np\nfrom sklearn.preprocessing import QuantileTransformer\nX_train = np.array([[1.], [2.], [3.], [4.], [100.]])\nqt = QuantileTransformer(n_quantiles=5, output_distribution='uniform')\nprint(qt.fit_transform(X_train).ravel())  # [0. 0.25 0.5 0.75 1.]\nprint(qt.transform([[500.]]).ravel())  # [1.] - clipped\n# output_distribution='normal' gives a bell-shaped result (needs more data)",
      pros: [
        "Handles any distribution shape and outliers.",
        "Output has a well-defined distribution.",
        "Rank-preserving."
      ],
      cons: [
        "Distorts distances and linear relationships between values.",
        "Can overfit on small samples.",
        "Clips unseen extreme values."
      ],
      tip: "Use it when other transforms fail or for very irregular features; use a few hundred or more samples. Fit on training data only; consider PowerTransformer first because it keeps more of the original structure."
    },
    {
      n: "Trees don't need it",
      what: "Decision trees, random forests and gradient boosting split a feature using thresholds such as 'income ≤ 45,000'. Any monotonic rescaling (standardising, min-max, log) preserves the ordering of values, so the same partitions are found and predictions are unchanged. These models are scale-invariant.",
      how: [
        "A tree tests 'feature ≤ threshold' and only looks at the ordering of values.",
        "Standardising, min-max or log keep that ordering, so the best splits are identical.",
        "Skip scaling for pure tree-based models and save the pipeline complexity.",
        "Still scale for linear models, SVM, KNN, neural nets, PCA, or when mixing models."
      ],
      ex: "income = [30000, 60000, 90000]: mean = 60000, std = √(6×10⁸) = 24,495 → z = [−1.225, 0, 1.225]. The split 'income ≤ 45,000' is the same as 'z ≤ −0.612' because (45000 − 60000)/24495 = −0.612, so both put the same rows on each side.",
      code: "import numpy as np\nfrom sklearn.tree import DecisionTreeClassifier\nfrom sklearn.preprocessing import StandardScaler\nX = np.array([[30000.], [60000.], [90000.], [120000.]])\ny = np.array([0, 0, 1, 1])\nXs = StandardScaler().fit_transform(X)\nraw = DecisionTreeClassifier(random_state=0).fit(X, y).predict(X)\nscaled = DecisionTreeClassifier(random_state=0).fit(Xs, y).predict(Xs)\nprint(np.array_equal(raw, scaled))  # True - scaling changed nothing",
      pros: [
        "Less preprocessing and fewer leakage risks.",
        "Robust to outliers and wildly different units.",
        "Predictions don't change under monotonic transforms."
      ],
      cons: [
        "Doesn't apply to linear models, SVM, KNN or neural networks.",
        "Skew-fixing can still help a tree-based model if the target is transformed.",
        "Scaled inputs are still needed if trees are stacked with scale-sensitive models."
      ],
      tip: "If your final model is Random Forest / XGBoost / LightGBM, skip scaling. If you compare several model types in one pipeline, scale only inside the pipelines of the scale-sensitive ones."
    }
  ];
})();
