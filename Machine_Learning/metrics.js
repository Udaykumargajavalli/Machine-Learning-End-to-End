/* Evaluation Metrics slide: one tab per metric (supervised + unsupervised).
   Inserted after the 13th slide; must load before app.js. */
(function () {
  var M = [
    /* ---------------- CLASSIFICATION ---------------- */
    {
      id: "confusion", name: "Confusion Matrix", group: "Classification", type: "Supervised",
      what: "A table that counts how many predictions were right and wrong for each class: True Positives (TP), False Positives (FP), True Negatives (TN) and False Negatives (FN). Almost every classification metric is built from these four numbers.",
      when: ["Always — it is the first thing to look at for any classifier.", "When you need to see WHICH kind of mistake the model makes (false alarms vs. misses)."],
      pros: ["Shows the full picture of errors, not one summary number.", "Easy to explain to non-technical people.", "Works for binary and multi-class problems."],
      cons: ["Not a single number, so you cannot rank models with it directly.", "Gets hard to read with many classes.", "Depends on the chosen probability threshold."],
      formula: "              Predicted +   Predicted −\nActual +         TP            FN\nActual −         FP            TN",
      note: "TP = correctly caught positives, FN = missed positives, FP = false alarms, TN = correctly ignored negatives.",
      usecase: "Fraud detection: see how many frauds were caught (TP) vs. missed (FN), and how many good customers were wrongly blocked (FP).",
      code: "from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay\ncm = confusion_matrix(y_test, y_pred)\nprint(cm)\nConfusionMatrixDisplay(cm).plot()",
      fails: ["Comparing many models quickly — use a summary metric instead.", "Probability-quality questions (is 0.9 really 90%?) — it only sees hard labels."]
    },
    {
      id: "accuracy", name: "Accuracy", group: "Classification", type: "Supervised",
      what: "The share of all predictions that are correct. 'Out of 100 predictions, how many were right?'",
      when: ["Classes are roughly balanced (e.g. 50/50 cats vs dogs).", "All mistakes cost about the same."],
      pros: ["Very simple and intuitive.", "Works for multi-class.", "Good quick baseline number."],
      cons: ["Misleading on imbalanced data.", "Treats false positives and false negatives as equally bad.", "Ignores prediction confidence."],
      formula: "Accuracy = (TP + TN) / (TP + TN + FP + FN)",
      note: "Correct predictions divided by all predictions.",
      usecase: "Handwritten digit recognition (10 roughly equal classes).",
      code: "from sklearn.metrics import accuracy_score\nacc = accuracy_score(y_test, y_pred)\nprint(f'Accuracy: {acc:.2%}')",
      fails: ["Fraud with 1% positives: a model that always says 'not fraud' gets 99% accuracy but catches nothing.", "Medical screening where missing a sick patient is far worse than a false alarm."]
    },
    {
      id: "precision", name: "Precision", group: "Classification", type: "Supervised",
      what: "Of everything the model flagged as positive, how many were actually positive? 'When the model says YES, how often is it right?'",
      when: ["False positives are expensive (spam filter deleting real emails, wrongly blocking a customer).", "You act on every positive prediction and actions cost money."],
      pros: ["Directly measures the quality of positive alerts.", "Robust to many true negatives (imbalance)."],
      cons: ["Ignores missed positives (FN) — can be high while catching very few.", "Can be gamed by predicting positive only when extremely sure.", "Undefined if the model never predicts positive."],
      formula: "Precision = TP / (TP + FP)",
      note: "Correct positive predictions divided by all positive predictions.",
      usecase: "Email spam filter: you don't want real emails to land in spam.",
      code: "from sklearn.metrics import precision_score\nprecision_score(y_test, y_pred)               # binary\nprecision_score(y_test, y_pred, average='macro') # multi-class",
      fails: ["Cancer screening — high precision but low recall means many sick patients are missed.", "Model predicts only 1 positive and it is right → precision 100% but useless."]
    },
    {
      id: "recall", name: "Recall (Sensitivity / TPR)", group: "Classification", type: "Supervised",
      what: "Of all the real positives, how many did the model catch? 'How many of the guilty did we find?'",
      when: ["Missing a positive is costly (disease, fraud, safety defects).", "You can afford some false alarms that a human will review."],
      pros: ["Directly measures how many positives are missed.", "Robust to class imbalance."],
      cons: ["Ignores false alarms — predicting everything positive gives recall = 100%.", "Must be paired with precision or specificity."],
      formula: "Recall = TP / (TP + FN)",
      note: "Caught positives divided by all actual positives.",
      usecase: "Cancer detection: catch as many cancer cases as possible; doctors will double-check alarms.",
      code: "from sklearn.metrics import recall_score\nrecall_score(y_test, y_pred)",
      fails: ["When false alarms are expensive (e.g. arresting people, blocking payments).", "A 'flag everything' model looks perfect."]
    },
    {
      id: "specificity", name: "Specificity (TNR)", group: "Classification", type: "Supervised",
      what: "Of all real negatives, how many were correctly identified as negative? The 'recall' of the negative class.",
      when: ["Medical tests — together with sensitivity.", "When wrongly flagging healthy/normal cases is harmful."],
      pros: ["Shows how well the model avoids false alarms.", "Standard in medicine and diagnostics."],
      cons: ["Says nothing about catching positives.", "Is very high by default on imbalanced data (many negatives)."],
      formula: "Specificity = TN / (TN + FP)      FPR = 1 − Specificity",
      note: "Correct negatives divided by all actual negatives.",
      usecase: "COVID test: how often a healthy person correctly tests negative.",
      code: "from sklearn.metrics import recall_score\nspecificity = recall_score(y_test, y_pred, pos_label=0)",
      fails: ["Highly imbalanced data — 99% specificity can still mean thousands of false alarms.", "Used alone without recall."]
    },
    {
      id: "f1", name: "F1 Score", group: "Classification", type: "Supervised",
      what: "The harmonic mean of precision and recall — one number that is high only when BOTH are high.",
      when: ["Imbalanced classes.", "You care about both false positives and false negatives roughly equally.", "Comparing models with a single number."],
      pros: ["Balances precision and recall.", "Much better than accuracy on imbalanced data.", "Macro/weighted versions work for multi-class."],
      cons: ["Ignores true negatives.", "Assumes precision and recall are equally important.", "Hard to explain to business people; depends on threshold."],
      formula: "F1 = 2 × (Precision × Recall) / (Precision + Recall)",
      note: "The harmonic mean punishes a big gap: P=1.0, R=0.1 → F1 ≈ 0.18, not 0.55.",
      usecase: "Defect detection on a production line with 3% defective items.",
      code: "from sklearn.metrics import f1_score, classification_report\nf1_score(y_test, y_pred)                    # binary\nf1_score(y_test, y_pred, average='macro')   # multi-class\nprint(classification_report(y_test, y_pred))",
      fails: ["When one error type is much more costly — use F-beta.", "When true negatives matter (e.g. balanced problems) — use accuracy/MCC."]
    },
    {
      id: "fbeta", name: "F-beta Score", group: "Classification", type: "Supervised",
      what: "A weighted F1. β > 1 gives more weight to recall; β < 1 gives more weight to precision.",
      when: ["F2: missing positives is worse (medical, fraud).", "F0.5: false alarms are worse (spam, recommendations)."],
      pros: ["Lets you encode business priorities.", "Still a single comparable number."],
      cons: ["Choosing β is subjective.", "Ignores true negatives like F1."],
      formula: "Fβ = (1 + β²) × P × R / (β² × P + R)",
      note: "β = how many times more important recall is than precision.",
      usecase: "Fraud screening with F2 — catching fraud matters twice as much as false alarms.",
      code: "from sklearn.metrics import fbeta_score\nfbeta_score(y_test, y_pred, beta=2)    # recall-heavy\nfbeta_score(y_test, y_pred, beta=0.5)  # precision-heavy",
      fails: ["When you can put real money costs on each error — use a cost-based metric instead.", "Stakeholders cannot agree on β."]
    },
    {
      id: "balacc", name: "Balanced Accuracy", group: "Classification", type: "Supervised",
      what: "The average of recall for each class. Every class counts equally, no matter how rare.",
      when: ["Imbalanced data when you still want an 'accuracy-like' number.", "Multi-class problems with rare classes."],
      pros: ["Not fooled by the majority class (always-majority model scores 50% in binary).", "Easy to explain."],
      cons: ["Ignores precision / false alarms per class.", "Treats all classes as equally important, which may not match the business."],
      formula: "Balanced Accuracy = (Recall₁ + Recall₂ + … + Recall_k) / k\nBinary: (TPR + TNR) / 2",
      note: "Average of how well each class is caught.",
      usecase: "Classifying rare diseases among many healthy patients.",
      code: "from sklearn.metrics import balanced_accuracy_score\nbalanced_accuracy_score(y_test, y_pred)",
      fails: ["When false positives are the main cost.", "When some classes truly matter more than others."]
    },
    {
      id: "mcc", name: "Matthews Correlation Coefficient (MCC)", group: "Classification", type: "Supervised",
      what: "A correlation between true and predicted labels from −1 (all wrong) through 0 (random) to +1 (perfect). Uses all four cells of the confusion matrix.",
      when: ["Imbalanced binary classification.", "You want one honest number that is high only if the model is good on both classes."],
      pros: ["Uses TP, TN, FP and FN — hard to fool.", "Symmetric: swapping classes gives the same score.", "Considered one of the most reliable single metrics."],
      cons: ["Less intuitive for business audiences.", "Depends on threshold.", "Undefined (set to 0) if a whole row/column is empty."],
      formula: "MCC = (TP·TN − FP·FN) / √[(TP+FP)(TP+FN)(TN+FP)(TN+FN)]",
      note: "+1 perfect, 0 no better than chance, −1 completely inverted.",
      usecase: "Bioinformatics: predicting rare protein functions.",
      code: "from sklearn.metrics import matthews_corrcoef\nmatthews_corrcoef(y_test, y_pred)",
      fails: ["Explaining to non-technical stakeholders.", "When you only care about the positive class (use PR-AUC / F1)."]
    },
    {
      id: "kappa", name: "Cohen's Kappa", group: "Classification", type: "Supervised",
      what: "Measures agreement between predictions and truth AFTER removing the agreement you would get by pure chance.",
      when: ["Comparing model labels with human labels.", "Ordinal classes (weighted kappa), e.g. ratings 1–5.", "Imbalanced multi-class problems."],
      pros: ["Corrects for chance agreement.", "Weighted version respects the order of classes."],
      cons: ["Hard to interpret (what is a 'good' kappa?).", "Sensitive to class prevalence (kappa paradox)."],
      formula: "κ = (pₒ − pₑ) / (1 − pₑ)",
      note: "pₒ = observed agreement (accuracy), pₑ = agreement expected by chance.",
      usecase: "Grading diabetic retinopathy severity (0–4) with quadratic-weighted kappa.",
      code: "from sklearn.metrics import cohen_kappa_score\ncohen_kappa_score(y_test, y_pred)\ncohen_kappa_score(y_test, y_pred, weights='quadratic')",
      fails: ["Very skewed prevalence: high agreement can still give low kappa (paradox).", "Probability evaluation — it only uses labels."]
    },
    {
      id: "rocauc", name: "ROC-AUC", group: "Classification", type: "Supervised",
      what: "The ROC curve plots True Positive Rate vs False Positive Rate for EVERY threshold. AUC is the area under it: the probability that a random positive gets a higher score than a random negative.",
      when: ["You need to compare models independent of a threshold.", "Classes are not extremely imbalanced.", "Ranking quality matters (who is most risky?)."],
      pros: ["Threshold-independent.", "0.5 = random, 1.0 = perfect — easy scale.", "Insensitive to scaling of scores."],
      cons: ["Can look great on very imbalanced data while precision is poor.", "Does not check if probabilities are calibrated.", "Summarises regions of thresholds you would never use."],
      formula: "TPR = TP/(TP+FN),   FPR = FP/(FP+TN)\nAUC = ∫₀¹ TPR d(FPR) = P(score(positive) > score(negative))",
      note: "Area under the TPR–FPR curve.",
      usecase: "Credit scoring: ranking applicants from least to most likely to default.",
      code: "from sklearn.metrics import roc_auc_score, RocCurveDisplay\nproba = model.predict_proba(X_test)[:, 1]\nroc_auc_score(y_test, proba)\nRocCurveDisplay.from_predictions(y_test, proba)\n# multi-class: roc_auc_score(y, P, multi_class='ovr')",
      fails: ["0.1% fraud rate — AUC 0.95 may still mean 50 false alarms per real fraud; use PR-AUC.", "Needs scores/probabilities, not just hard labels."]
    },
    {
      id: "prauc", name: "PR-AUC (Average Precision)", group: "Classification", type: "Supervised",
      what: "Area under the Precision–Recall curve across all thresholds. Focuses only on how well the positive (rare) class is handled.",
      when: ["Highly imbalanced data (fraud, rare disease, anomalies).", "You care mainly about the positive class."],
      pros: ["Honest on imbalanced data.", "Threshold-independent.", "Ignores the huge number of easy true negatives."],
      cons: ["Baseline = positive rate (not 0.5), so values are harder to compare across datasets.", "Noisy with very few positives.", "Ignores performance on negatives."],
      formula: "AP = Σₙ (Rₙ − Rₙ₋₁) × Pₙ",
      note: "Precision at each threshold weighted by the increase in recall.",
      usecase: "Credit-card fraud detection with 0.2% fraud.",
      code: "from sklearn.metrics import average_precision_score, PrecisionRecallDisplay\naverage_precision_score(y_test, proba)\nPrecisionRecallDisplay.from_predictions(y_test, proba)",
      fails: ["Comparing across datasets with different positive rates.", "When negatives matter equally (balanced problems)."]
    },
    {
      id: "logloss", name: "Log Loss (Cross-Entropy)", group: "Classification", type: "Supervised",
      what: "Measures how good the predicted PROBABILITIES are. Confident wrong answers are punished very heavily.",
      when: ["You use the probabilities themselves (risk scores, pricing, betting).", "Kaggle-style probabilistic competitions.", "Training neural networks (it is the usual loss)."],
      pros: ["Rewards well-calibrated, honest probabilities.", "Smooth and differentiable — great as a training loss."],
      cons: ["Hard to interpret (no natural 0–100% scale).", "One very confident mistake can blow it up.", "Sensitive to label noise."],
      formula: "LogLoss = −(1/N) Σ [ yᵢ·log(pᵢ) + (1−yᵢ)·log(1−pᵢ) ]\nMulti-class: −(1/N) Σᵢ Σ_c y_ic · log(p_ic)",
      note: "Lower is better; 0 = perfect. Always guessing 0.5 gives ≈ 0.693.",
      usecase: "Predicting the probability a customer clicks an ad (CTR), used for bidding.",
      code: "from sklearn.metrics import log_loss\nlog_loss(y_test, model.predict_proba(X_test))",
      fails: ["Models without probabilities (e.g. plain SVM without calibration).", "Noisy labels — a few wrong labels dominate the score.", "Explaining results to business users."]
    },
    {
      id: "brier", name: "Brier Score", group: "Classification", type: "Supervised",
      what: "The mean squared error between predicted probabilities and the actual 0/1 outcome. Checks probability accuracy and calibration.",
      when: ["Weather / risk forecasting.", "Checking whether a '70% chance' really happens 70% of the time."],
      pros: ["Easy to understand (MSE for probabilities).", "Less explosive than log loss for confident mistakes."],
      cons: ["Not very sensitive for rare events (all small numbers).", "Does not show direction of miscalibration — pair with a calibration curve."],
      formula: "Brier = (1/N) Σ (pᵢ − yᵢ)²",
      note: "0 = perfect, 0.25 = always guessing 0.5.",
      usecase: "Rain forecast: 'probability of rain tomorrow'.",
      code: "from sklearn.metrics import brier_score_loss\nfrom sklearn.calibration import CalibrationDisplay\nbrier_score_loss(y_test, proba)\nCalibrationDisplay.from_predictions(y_test, proba)",
      fails: ["Very rare events — always predicting ~0 gives a deceptively good score.", "Ranking problems where only order matters (use AUC)."]
    },

    /* ---------------- REGRESSION ---------------- */
    {
      id: "mae", name: "MAE (Mean Absolute Error)", group: "Regression", type: "Supervised",
      what: "The average size of the errors, ignoring direction. 'On average we are off by X units.'",
      when: ["You want an error in the same units as the target.", "Data has outliers you do not want to dominate.", "All errors cost proportionally."],
      pros: ["Very easy to explain (₹, °C, minutes).", "Robust to outliers compared to MSE/RMSE."],
      cons: ["Does not punish large errors extra.", "Not differentiable at 0 (minor for training).", "Scale-dependent — cannot compare across targets."],
      formula: "MAE = (1/N) Σ |yᵢ − ŷᵢ|",
      note: "Average absolute difference between actual and predicted.",
      usecase: "Delivery-time prediction: 'we are off by 4.2 minutes on average'.",
      code: "from sklearn.metrics import mean_absolute_error\nmean_absolute_error(y_test, y_pred)",
      fails: ["When big misses are disastrous (e.g. power-grid load) — use RMSE.", "Comparing products with very different scales — use MAPE/R²."]
    },
    {
      id: "mse", name: "MSE (Mean Squared Error)", group: "Regression", type: "Supervised",
      what: "The average of the SQUARED errors. Big errors count much more than small ones.",
      when: ["Large errors are much worse than small ones.", "As a training loss for linear regression and neural networks."],
      pros: ["Smooth and differentiable — easy to optimise.", "Strongly penalises large mistakes."],
      cons: ["Units are squared (₹²) — hard to interpret.", "Very sensitive to outliers."],
      formula: "MSE = (1/N) Σ (yᵢ − ŷᵢ)²",
      note: "Squaring makes an error of 10 count 100 times more than an error of 1.",
      usecase: "Training a neural network to predict house prices.",
      code: "from sklearn.metrics import mean_squared_error\nmean_squared_error(y_test, y_pred)",
      fails: ["Data with outliers or heavy tails — a few points dominate.", "Reporting to business (squared units)."]
    },
    {
      id: "rmse", name: "RMSE (Root Mean Squared Error)", group: "Regression", type: "Supervised",
      what: "The square root of MSE — back in the original units, but still punishing large errors more.",
      when: ["The most common regression report metric.", "Large errors matter more than small ones."],
      pros: ["Same units as the target.", "Penalises big errors.", "Widely understood."],
      cons: ["Sensitive to outliers.", "Always ≥ MAE; harder to explain than MAE.", "Scale-dependent."],
      formula: "RMSE = √[ (1/N) Σ (yᵢ − ŷᵢ)² ]",
      note: "Typical size of an error, with large errors weighted more.",
      usecase: "Energy demand forecasting where big misses cause blackouts.",
      code: "from sklearn.metrics import mean_squared_error\nimport numpy as np\nnp.sqrt(mean_squared_error(y_test, y_pred))\n# sklearn >= 1.4: root_mean_squared_error(y_test, y_pred)",
      fails: ["Outlier-heavy data (use MAE / Huber).", "Comparing across different targets or scales."]
    },
    {
      id: "r2", name: "R² (Coefficient of Determination)", group: "Regression", type: "Supervised",
      what: "How much of the variation in the target the model explains, compared with just predicting the average. 1 = perfect, 0 = no better than the mean, negative = worse than the mean.",
      when: ["Explaining overall goodness of fit.", "Comparing models on the same dataset."],
      pros: ["Unit-free, easy 0–1 style scale.", "Intuitive: 'explains 80% of the variation'."],
      cons: ["Increases when you add any feature (even useless ones) on training data.", "A high R² does not mean predictions are accurate enough.", "Can be negative on test data."],
      formula: "R² = 1 − SS_res / SS_tot = 1 − Σ(yᵢ − ŷᵢ)² / Σ(yᵢ − ȳ)²",
      note: "SS_res = model errors, SS_tot = errors of always predicting the mean.",
      usecase: "Marketing mix model: how much of sales variation is explained by ad spend.",
      code: "from sklearn.metrics import r2_score\nr2_score(y_test, y_pred)",
      fails: ["Non-linear relationships judged with a linear fit.", "Time series with trend — R² looks high even for poor models.", "Very small test sets or targets with tiny variance."]
    },
    {
      id: "adjr2", name: "Adjusted R²", group: "Regression", type: "Supervised",
      what: "R² that is penalised for the number of features, so adding useless features lowers the score.",
      when: ["Comparing linear models with different numbers of features.", "Feature selection for linear/statistical models."],
      pros: ["Discourages overfitting with too many features.", "Same interpretation as R²."],
      cons: ["Mainly meaningful for linear models.", "Still an in-sample measure; use cross-validation too."],
      formula: "Adj R² = 1 − (1 − R²)(n − 1) / (n − p − 1)",
      note: "n = number of rows, p = number of features.",
      usecase: "Deciding whether adding 'weather' to a sales regression is worth it.",
      code: "from sklearn.metrics import r2_score\nr2 = r2_score(y_test, y_pred)\nn, p = X_test.shape\nadj_r2 = 1 - (1 - r2) * (n - 1) / (n - p - 1)",
      fails: ["Non-linear models (trees, boosting) where 'number of features' ≠ complexity.", "p close to n (denominator near 0)."]
    },
    {
      id: "mape", name: "MAPE (Mean Absolute % Error)", group: "Regression", type: "Supervised",
      what: "The average error as a PERCENTAGE of the actual value. 'We are off by 8% on average.'",
      when: ["Business forecasting (sales, demand) where % is natural.", "Comparing accuracy across products of different scales."],
      pros: ["Scale-free and very easy to explain.", "Comparable across series."],
      cons: ["Explodes or is undefined when actual values are 0 or near 0.", "Asymmetric: punishes over-forecasts more than under-forecasts.", "Biased towards models that under-predict."],
      formula: "MAPE = (100% / N) Σ |(yᵢ − ŷᵢ) / yᵢ|",
      note: "Average of absolute percentage errors.",
      usecase: "Monthly sales forecast for 500 stores of different sizes.",
      code: "from sklearn.metrics import mean_absolute_percentage_error\nmean_absolute_percentage_error(y_test, y_pred)  # returns a fraction, e.g. 0.08",
      fails: ["Intermittent demand with many zero-sale days.", "Temperatures in °C crossing 0.", "When over- and under-forecasting cost the same."]
    },
    {
      id: "smape", name: "sMAPE (Symmetric MAPE)", group: "Regression", type: "Supervised",
      what: "A percentage error that divides by the average of actual and predicted, making it bounded and more symmetric than MAPE.",
      when: ["Forecasting competitions (M3/M4).", "Actual values can be small and MAPE explodes."],
      pros: ["Bounded between 0% and 200%.", "Handles near-zero actuals better than MAPE."],
      cons: ["Not truly symmetric despite the name.", "Still undefined when both actual and forecast are 0.", "Less intuitive than MAPE."],
      formula: "sMAPE = (100% / N) Σ |yᵢ − ŷᵢ| / ((|yᵢ| + |ŷᵢ|) / 2)",
      note: "Percentage error relative to the average of actual and forecast.",
      usecase: "Comparing forecasting models across thousands of product time series.",
      code: "import numpy as np\ndef smape(y, yhat):\n    return 100 * np.mean(np.abs(y - yhat) / ((np.abs(y) + np.abs(yhat)) / 2))\nsmape(y_test, y_pred)",
      fails: ["Series of all zeros.", "Stakeholders expecting a 0–100% scale."]
    },
    {
      id: "rmsle", name: "RMSLE (Root Mean Squared Log Error)", group: "Regression", type: "Supervised",
      what: "RMSE computed on log(1 + value). Measures RELATIVE error and punishes under-prediction more than over-prediction.",
      when: ["Targets span many orders of magnitude (prices, counts, views).", "Under-estimating is worse than over-estimating (e.g. stock to order)."],
      pros: ["Focuses on ratios instead of absolute size.", "Large values don't dominate."],
      cons: ["Cannot be used with negative values.", "Less intuitive units."],
      formula: "RMSLE = √[ (1/N) Σ (log(1 + ŷᵢ) − log(1 + yᵢ))² ]",
      note: "An error from 10→20 counts about the same as 1000→2000.",
      usecase: "Predicting bike rentals or house prices with a wide range.",
      code: "from sklearn.metrics import mean_squared_log_error\nimport numpy as np\nnp.sqrt(mean_squared_log_error(y_test, y_pred))",
      fails: ["Targets that can be negative (profit/loss, temperature).", "When absolute money error is what the business cares about."]
    },
    {
      id: "huber", name: "Huber Loss", group: "Regression", type: "Supervised",
      what: "Behaves like MSE for small errors and like MAE for large errors — a compromise that is robust to outliers but still smooth.",
      when: ["Data has some outliers but you still want to penalise medium errors.", "Training robust regression models."],
      pros: ["Robust to outliers.", "Differentiable everywhere — good for gradient training."],
      cons: ["Needs a threshold δ to tune.", "Not commonly reported to business users."],
      formula: "L_δ(e) = ½e²            if |e| ≤ δ\n        δ(|e| − ½δ)     otherwise      (e = y − ŷ)",
      note: "δ decides where 'small error' ends and 'outlier' begins.",
      usecase: "Sensor readings with occasional spikes.",
      code: "from sklearn.linear_model import HuberRegressor\nmodel = HuberRegressor(epsilon=1.35).fit(X_train, y_train)\n# as a metric:\nimport numpy as np\ne = y_test - y_pred; d = 1.0\nhuber = np.mean(np.where(abs(e) <= d, 0.5*e**2, d*(abs(e) - 0.5*d)))",
      fails: ["When you need a simple, explainable number.", "Poorly chosen δ makes it behave like plain MSE or MAE."]
    },

    /* ---------------- CLUSTERING (internal) ---------------- */
    {
      id: "inertia", name: "Inertia / WCSS (Elbow Method)", group: "Clustering", type: "Unsupervised",
      what: "Within-Cluster Sum of Squares: total squared distance of each point to its cluster centre. Smaller = tighter clusters. Plotted against k to find the 'elbow'.",
      when: ["Choosing the number of clusters k for K-Means.", "Comparing K-Means runs with the same k."],
      pros: ["Cheap to compute; built into K-Means.", "Elbow plot is easy to understand visually."],
      cons: ["Always decreases as k increases — cannot pick k on its own.", "The elbow is often unclear.", "Assumes round (spherical) clusters."],
      formula: "WCSS = Σₖ Σ_{x ∈ Cₖ} ‖x − μₖ‖²",
      note: "μₖ = centre of cluster k.",
      usecase: "Customer segmentation: deciding between 3, 4 or 5 segments.",
      code: "from sklearn.cluster import KMeans\nimport matplotlib.pyplot as plt\nks = range(1, 11)\nwcss = [KMeans(k, n_init=10, random_state=0).fit(X).inertia_ for k in ks]\nplt.plot(ks, wcss, 'o-'); plt.xlabel('k'); plt.ylabel('WCSS')",
      fails: ["Non-spherical or density-based clusters (DBSCAN, moons, rings).", "Comparing different algorithms or different scaling.", "No visible elbow."]
    },
    {
      id: "silhouette", name: "Silhouette Score", group: "Clustering", type: "Unsupervised",
      what: "For each point: how close it is to its own cluster vs. the nearest other cluster. Ranges from −1 (wrong cluster) to +1 (well clustered).",
      when: ["Choosing k without labels.", "Comparing clustering results on the same data."],
      pros: ["Bounded, intuitive −1..1 scale.", "Works with any distance metric.", "Per-point scores show badly assigned points."],
      cons: ["O(n²) — slow on big data (use sampling).", "Favours convex, round clusters.", "Undefined for k = 1."],
      formula: "s(i) = (b(i) − a(i)) / max(a(i), b(i))\nScore = mean of s(i)",
      note: "a(i) = mean distance to own cluster, b(i) = mean distance to nearest other cluster.",
      usecase: "Grouping news articles by topic embeddings and choosing the best k.",
      code: "from sklearn.metrics import silhouette_score\nlabels = KMeans(4, n_init=10).fit_predict(X)\nsilhouette_score(X, labels)  # add sample_size=10000 for big data",
      fails: ["DBSCAN with noise points or non-convex shapes (moons).", "Very high-dimensional data where distances become similar.", "Millions of rows without sampling."]
    },
    {
      id: "dbi", name: "Davies–Bouldin Index", group: "Clustering", type: "Unsupervised",
      what: "Average 'similarity' between each cluster and its most similar neighbour, comparing cluster spread to distance between centres. LOWER is better (0 = best).",
      when: ["Quickly comparing clusterings / choosing k.", "Large datasets where silhouette is too slow."],
      pros: ["Fast to compute.", "No labels needed."],
      cons: ["Uses centroids — assumes round clusters.", "No upper bound, so harder to interpret.", "Euclidean distance only."],
      formula: "DB = (1/k) Σᵢ maxⱼ≠ᵢ (sᵢ + sⱼ) / d(cᵢ, cⱼ)",
      note: "sᵢ = average distance of points to centre i, d(cᵢ,cⱼ) = distance between centres.",
      usecase: "Segmenting store locations by sales patterns.",
      code: "from sklearn.metrics import davies_bouldin_score\ndavies_bouldin_score(X, labels)",
      fails: ["Density-based or elongated clusters.", "Comparing across datasets with different scales."]
    },
    {
      id: "chi", name: "Calinski–Harabasz Index", group: "Clustering", type: "Unsupervised",
      what: "Ratio of between-cluster spread to within-cluster spread (a.k.a. Variance Ratio Criterion). HIGHER is better.",
      when: ["Choosing k quickly on large data.", "Clusters are expected to be compact and well separated."],
      pros: ["Very fast.", "Clear 'higher is better' rule."],
      cons: ["Biased towards convex clusters and often towards larger k.", "Unbounded — only meaningful for comparison."],
      formula: "CH = [ B / (k − 1) ] / [ W / (n − k) ]",
      note: "B = between-cluster dispersion, W = within-cluster dispersion, n = points, k = clusters.",
      usecase: "Choosing the number of product groups in an e-commerce catalogue.",
      code: "from sklearn.metrics import calinski_harabasz_score\ncalinski_harabasz_score(X, labels)",
      fails: ["Non-convex clusters (rings, moons).", "Noise-heavy data clustered with DBSCAN."]
    },

    /* ---------------- CLUSTERING (external — labels known) ---------------- */
    {
      id: "ari", name: "Adjusted Rand Index (ARI)", group: "Clustering", type: "Unsupervised",
      what: "Compares a clustering with known true groups by counting pairs of points that are grouped together (or apart) in both, corrected for chance. 1 = perfect, 0 = random.",
      when: ["You have ground-truth labels for a sample to validate clustering.", "Benchmarking clustering algorithms."],
      pros: ["Chance-corrected.", "Does not care about cluster label names (0/1 swap is fine).", "Works with different numbers of clusters."],
      cons: ["Needs true labels — rarely available in real unsupervised work.", "Can be negative and hard to explain."],
      formula: "ARI = (RI − E[RI]) / (max(RI) − E[RI])\nRI = (agreeing pairs) / (all pairs)",
      note: "RI = Rand Index, E[RI] = expected value for random labelling.",
      usecase: "Checking that customer clusters match a hand-labelled sample of segments.",
      code: "from sklearn.metrics import adjusted_rand_score\nadjusted_rand_score(true_labels, cluster_labels)",
      fails: ["No ground truth available.", "Ground truth itself is just one of many valid groupings."]
    },
    {
      id: "nmi", name: "Normalized Mutual Information (NMI)", group: "Clustering", type: "Unsupervised",
      what: "How much knowing the cluster tells you about the true class (information theory), scaled to 0–1.",
      when: ["Validating clusters against known labels.", "Comparing two different clusterings."],
      pros: ["0–1 scale.", "Label-permutation invariant.", "Works when the number of clusters differs from classes."],
      cons: ["Needs labels.", "Not chance-adjusted — tends to rise with many clusters (use AMI)."],
      formula: "NMI(U, V) = I(U; V) / mean(H(U), H(V))",
      note: "I = mutual information, H = entropy.",
      usecase: "Evaluating document clustering against known news categories.",
      code: "from sklearn.metrics import normalized_mutual_info_score, adjusted_mutual_info_score\nnormalized_mutual_info_score(y_true, labels)\nadjusted_mutual_info_score(y_true, labels)",
      fails: ["Many tiny clusters inflate the score.", "No reference labels."]
    },
    {
      id: "vmeasure", name: "Homogeneity, Completeness & V-measure", group: "Clustering", type: "Unsupervised",
      what: "Homogeneity: each cluster contains only one class. Completeness: each class is in only one cluster. V-measure is their harmonic mean.",
      when: ["You want to know WHY a clustering is wrong (mixed clusters vs. split classes).", "Labels are available for validation."],
      pros: ["Explains the type of error.", "0–1 scale, intuitive."],
      cons: ["Needs labels.", "Not chance-corrected; biased with many clusters."],
      formula: "h = 1 − H(C|K)/H(C)    c = 1 − H(K|C)/H(K)\nV = 2·h·c / (h + c)",
      note: "C = true classes, K = clusters, H = entropy.",
      usecase: "Clustering support tickets and checking against known ticket categories.",
      code: "from sklearn.metrics import homogeneity_completeness_v_measure\nh, c, v = homogeneity_completeness_v_measure(y_true, labels)",
      fails: ["One cluster per point gives homogeneity = 1 (meaningless).", "Unlabelled data."]
    },

    /* ---------------- ANOMALY DETECTION ---------------- */
    {
      id: "patk", name: "Precision@K (Anomaly Ranking)", group: "Anomaly Detection", type: "Unsupervised",
      what: "Of the top-K points the model ranks as most anomalous, how many are real anomalies? Matches how analysts review a limited list.",
      when: ["Investigators can only check K alerts per day.", "Evaluating Isolation Forest / HBOS / LOF with a small labelled sample."],
      pros: ["Directly matches the business workflow.", "Easy to explain: '7 of the top 10 were real'."],
      cons: ["Needs some labels.", "Ignores everything below rank K.", "Choice of K is arbitrary."],
      formula: "Precision@K = (# true anomalies in top K) / K",
      note: "Ranking metric on anomaly scores.",
      usecase: "Daily list of 50 most suspicious transactions for the fraud team.",
      code: "import numpy as np\nfrom sklearn.ensemble import IsolationForest\nscores = -IsolationForest(random_state=0).fit(X).score_samples(X)\ntop = np.argsort(scores)[::-1][:50]\nprecision_at_k = y_true[top].mean()",
      fails: ["No labels at all (use score distributions / expert review).", "When total recall of anomalies matters (use PR-AUC)."]
    },

    /* ---------------- DIMENSIONALITY REDUCTION ---------------- */
    {
      id: "evr", name: "Explained Variance Ratio (PCA)", group: "Dimensionality Reduction", type: "Unsupervised",
      what: "The share of the data's total variance that each principal component keeps. The cumulative sum tells you how much information you keep with k components.",
      when: ["Choosing how many PCA components to keep (e.g. 95% variance).", "Checking how compressible your data is."],
      pros: ["Built into PCA, free to compute.", "Clear interpretation: 'keeps 95% of the information'."],
      cons: ["Variance ≠ usefulness for the prediction task.", "Depends heavily on feature scaling.", "Only for linear methods like PCA."],
      formula: "EVRₖ = λₖ / Σⱼ λⱼ",
      note: "λₖ = eigenvalue (variance) of component k.",
      usecase: "Compressing 784-pixel images to ~150 components that keep 95% variance.",
      code: "from sklearn.decomposition import PCA\nimport numpy as np\npca = PCA().fit(X_scaled)\ncum = np.cumsum(pca.explained_variance_ratio_)\nk = np.argmax(cum >= 0.95) + 1\n# or simply PCA(n_components=0.95)",
      fails: ["Unscaled features (salary dominates age).", "Non-linear structure (t-SNE/UMAP/autoencoders).", "Low-variance directions that are actually predictive."]
    },
    {
      id: "recon", name: "Reconstruction Error", group: "Dimensionality Reduction", type: "Unsupervised",
      what: "Compress the data, rebuild it, and measure how different the rebuilt data is from the original. Also used as an anomaly score with autoencoders.",
      when: ["Evaluating PCA or autoencoders.", "Anomaly detection: unusual points are hard to reconstruct."],
      pros: ["Works for linear and non-linear methods.", "Doubles as an anomaly score."],
      cons: ["Low error can mean overfitting / identity mapping.", "Scale-dependent.", "Does not measure how useful the representation is downstream."],
      formula: "Error = (1/N) Σ ‖xᵢ − x̂ᵢ‖²",
      note: "x̂ᵢ = reconstruction of xᵢ after encoding and decoding.",
      usecase: "Autoencoder flagging faulty machine-sensor readings.",
      code: "import numpy as np\nfrom sklearn.decomposition import PCA\npca = PCA(n_components=10).fit(X_train)\nX_rec = pca.inverse_transform(pca.transform(X_test))\nerr = np.mean((X_test - X_rec) ** 2, axis=1)  # per-row error\nanomalies = err > np.percentile(err, 99)",
      fails: ["t-SNE / UMAP — they have no inverse transform.", "Anomalies that are easy to reconstruct (look normal)."]
    },
    {
      id: "trust", name: "Trustworthiness", group: "Dimensionality Reduction", type: "Unsupervised",
      what: "Checks whether points that are neighbours in the low-dimensional picture were also neighbours in the original data. 1 = local structure fully preserved.",
      when: ["Evaluating t-SNE / UMAP / PCA visualisations.", "Comparing embedding settings (perplexity, n_neighbors)."],
      pros: ["Works for non-linear methods.", "0–1 scale."],
      cons: ["Only checks local neighbourhoods, not global distances.", "Slow on large data; depends on n_neighbors."],
      formula: "T(k) = 1 − 2/(n·k·(2n − 3k − 1)) · Σᵢ Σ_{j ∈ Uₖ(i)} (r(i,j) − k)",
      note: "Uₖ(i) = points that are new neighbours in the embedding, r(i,j) = their rank in the original space.",
      usecase: "Checking that a UMAP plot of customer embeddings is not misleading.",
      code: "from sklearn.manifold import TSNE, trustworthiness\nX2 = TSNE(n_components=2, random_state=0).fit_transform(X)\ntrustworthiness(X, X2, n_neighbors=5)",
      fails: ["Judging global cluster distances in t-SNE (those are not meaningful).", "Very large datasets without sampling."]
    }
  ];

  var GROUPS = ["All", "Classification", "Regression", "Clustering", "Anomaly Detection", "Dimensionality Reduction"];
  var ICON = { "Classification": "🎯", "Regression": "📈", "Clustering": "🧩", "Anomaly Detection": "🚨", "Dimensionality Reduction": "🗜️" };

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function list(arr) {
    return "<ul>" + arr.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
  }

  function paneHTML(m) {
    return '<div class="mt-head"><h3>' + (ICON[m.group] || "") + " " + esc(m.name) + '</h3>' +
      '<span class="mt-badge mt-' + (m.type === "Supervised" ? "sup" : "unsup") + '">' + m.type + '</span>' +
      '<span class="mt-badge">' + esc(m.group) + "</span></div>" +
      '<div class="mt-grid">' +
      '<div class="mt-card mt-wide"><h4>1️⃣ What is it?</h4><p>' + esc(m.what) + "</p></div>" +
      '<div class="mt-card"><h4>2️⃣ When to use it?</h4>' + list(m.when) + "</div>" +
      '<div class="mt-card mt-good"><h4>3️⃣ Advantages</h4>' + list(m.pros) + "</div>" +
      '<div class="mt-card mt-bad"><h4>4️⃣ Disadvantages</h4>' + list(m.cons) + "</div>" +
      '<div class="mt-card"><h4>5️⃣ Formula</h4><pre class="mt-formula">' + esc(m.formula) + '</pre><p class="mt-note">' + esc(m.note) + "</p></div>" +
      '<div class="mt-card mt-wide"><h4>6️⃣ How to implement — sample use case</h4><p><b>Use case:</b> ' + esc(m.usecase) + '</p><pre class="mt-code"><code>' + esc(m.code) + "</code></pre></div>" +
      '<div class="mt-card mt-wide mt-warn"><h4>7️⃣ Where it does NOT work</h4>' + list(m.fails) + "</div>" +
      "</div>";
  }

  function slideHTML() {
    return '<h2 class="__H2__">📏 Evaluation Metrics</h2>' +
      '<p class="mt-lead">A model is only as good as the way you measure it. Pick a metric from the tabs below — each one explains what it is, when to use it, pros &amp; cons, the formula, sample code and where it fails. ' +
      '<b>Supervised</b> metrics compare predictions with known answers; <b>Unsupervised</b> metrics judge structure when there are (usually) no answers.</p>' +
      '<div class="mt-chips">' + GROUPS.map(function (g, i) {
        return '<button type="button" class="mt-chip' + (i === 0 ? " active" : "") + '" data-g="' + esc(g) + '">' + (ICON[g] ? ICON[g] + " " : "") + esc(g) + "</button>";
      }).join("") + "</div>" +
      '<div class="mt-tabs" role="tablist">' + M.map(function (m, i) {
        return '<button type="button" role="tab" class="mt-tab' + (i === 0 ? " active" : "") + '" data-id="' + m.id + '" data-g="' + esc(m.group) + '">' + esc(m.name) + "</button>";
      }).join("") + "</div>" +
      '<div class="mt-pane"></div>';
  }

  function wire(slide) {
    var pane = slide.querySelector(".mt-pane");
    var tabs = Array.prototype.slice.call(slide.querySelectorAll(".mt-tab"));
    var chips = Array.prototype.slice.call(slide.querySelectorAll(".mt-chip"));
    function show(id) {
      var m = M.filter(function (x) { return x.id === id; })[0];
      if (!m) return;
      tabs.forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-id") === id); });
      pane.innerHTML = paneHTML(m);
    }
    tabs.forEach(function (t) {
      t.addEventListener("click", function (e) { e.stopPropagation(); show(t.getAttribute("data-id")); });
    });
    chips.forEach(function (c) {
      c.addEventListener("click", function (e) {
        e.stopPropagation();
        var g = c.getAttribute("data-g");
        chips.forEach(function (x) { x.classList.toggle("active", x === c); });
        var first = null;
        tabs.forEach(function (t) {
          var on = g === "All" || t.getAttribute("data-g") === g;
          t.style.display = on ? "" : "none";
          if (on && !first) first = t;
        });
        if (first) show(first.getAttribute("data-id"));
      });
    });
    show(M[0].id);
  }

  function css() {
    var s = document.createElement("style");
    s.textContent = [
      ".mt-slide{overflow-y:auto}",
      ".mt-lead{opacity:.85;max-width:1100px;line-height:1.55;margin:.4rem 0 1rem}",
      ".mt-chips{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem}",
      ".mt-chip,.mt-tab{font:inherit;color:inherit;cursor:pointer;border:1px solid rgba(148,163,184,.35);background:rgba(148,163,184,.08);border-radius:999px;padding:.35rem .85rem;font-size:.85rem;transition:all .15s}",
      ".mt-chip:hover,.mt-tab:hover{border-color:#6c8cff}",
      ".mt-chip.active{background:#6c8cff;border-color:#6c8cff;color:#fff}",
      ".mt-tabs{display:flex;flex-wrap:wrap;gap:.4rem;padding:.6rem;border:1px solid rgba(148,163,184,.2);border-radius:12px;margin-bottom:1rem}",
      ".mt-tab{border-radius:8px;font-size:.8rem}",
      ".mt-tab.active{background:linear-gradient(135deg,#6c8cff,#8b5cf6);border-color:transparent;color:#fff;font-weight:600}",
      ".mt-head{display:flex;align-items:center;flex-wrap:wrap;gap:.6rem;margin-bottom:.8rem}",
      ".mt-head h3{margin:0;font-size:1.35rem}",
      ".mt-badge{font-size:.72rem;padding:.2rem .6rem;border-radius:999px;background:rgba(148,163,184,.15);border:1px solid rgba(148,163,184,.3)}",
      ".mt-badge.mt-sup{background:rgba(108,140,255,.18);border-color:#6c8cff}",
      ".mt-badge.mt-unsup{background:rgba(245,165,36,.18);border-color:#f5a524}",
      ".mt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:.9rem;padding-bottom:1.5rem}",
      ".mt-card{border:1px solid rgba(148,163,184,.25);background:rgba(148,163,184,.06);border-radius:12px;padding:.9rem 1rem;min-width:0}",
      ".mt-card.mt-wide{grid-column:1/-1}",
      ".mt-card h4{margin:0 0 .5rem;font-size:.98rem}",
      ".mt-card p{margin:.2rem 0;line-height:1.5}",
      ".mt-card ul{margin:.2rem 0;padding-left:1.15rem;line-height:1.5}",
      ".mt-card li{margin:.15rem 0}",
      ".mt-good{border-left:4px solid #22c55e}",
      ".mt-bad{border-left:4px solid #ef4444}",
      ".mt-warn{border-left:4px solid #f5a524;background:rgba(245,165,36,.07)}",
      ".mt-formula{font-family:Consolas,'Cambria Math',monospace;font-size:.95rem;white-space:pre-wrap;background:rgba(108,140,255,.1);border:1px dashed rgba(108,140,255,.5);border-radius:8px;padding:.7rem;margin:.3rem 0;overflow-x:auto}",
      ".mt-note{font-size:.85rem;opacity:.8}",
      ".mt-code{font-family:Consolas,monospace;font-size:.82rem;white-space:pre;background:rgba(0,0,0,.35);color:#e2e8f0;border-radius:8px;padding:.75rem;margin:.5rem 0 0;overflow-x:auto}"
    ].join("\n");
    document.head.appendChild(s);
  }

  function topSlides() {
    var all = Array.prototype.slice.call(document.querySelectorAll("section.slide"))
      .filter(function (s) { return !s.closest("[hidden]") && !s.closest('[aria-hidden="true"]'); });
    var counts = new Map();
    all.forEach(function (s) { counts.set(s.parentElement, (counts.get(s.parentElement) || 0) + 1); });
    var deck = null, best = 0;
    counts.forEach(function (n, p) { if (n > best) { best = n; deck = p; } });
    return all.filter(function (s) { return s.parentElement === deck; });
  }

  function init() {
    if (document.getElementById("evaluation-metrics")) return;
    var slides = topSlides();
    if (!slides.length) return;
    var after = slides[Math.min(12, slides.length - 1)];
    var sec = document.createElement("section");
    sec.className = "slide mt-slide";
    sec.id = "evaluation-metrics";
    sec.setAttribute("data-title", "Evaluation Metrics");
    var grp = after.getAttribute("data-group");
    if (grp) sec.setAttribute("data-group", grp);
    var h2 = after.querySelector("h2");
    sec.innerHTML = slideHTML().replace("__H2__", h2 ? esc(h2.className) : "");
    after.parentNode.insertBefore(sec, after.nextSibling);
    css();
    wire(sec);
  }

  if (document.querySelector("section.slide")) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
