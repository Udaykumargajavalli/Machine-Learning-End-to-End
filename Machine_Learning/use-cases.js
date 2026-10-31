/* "ML Use Cases" slide: one tab per use case, each solved end to end.
   Appended as the last tab. Must load after remove-slides-2.js and before slide-icons.js / app.js. */
(function () {
  var FLOW_LABELS = ["Business Problem", "Data", "Feature Engineering", "Experimentation", "Evaluation", "Selected Model", "Deployment / Monitoring"];
  var FLOW_ICONS = ["🎯", "🗄️", "🛠️", "🧪", "📏", "⭐", "🚀"];

  var CASES = [
    {
      icon: "🏦", tab: "Loan Approval", title: "Loan Approval (Approve / Decline)",
      summary: "Decide quickly and consistently whether a loan application should be approved, declined or sent for manual review.",
      model: "LightGBM with monotonic constraints + SHAP reason codes",
      metric: "ROC-AUC (plus approval rate at the agreed risk level)",
      problem: [
        ["Objective", "Automate the approve/decline decision so good applicants get fast answers and risky ones are filtered out."],
        ["Users", "Loan officers, underwriters, credit policy team, applicants."],
        ["Decision improved", "Auto-approve / auto-decline / refer to an underwriter."],
        ["Expected value", "Shorter time-to-decision, fewer bad loans, less manual review effort."],
        ["Business success", "Higher approval rate at the same or lower bad-loan rate; lower manual-review share."],
        ["ML success", "ROC-AUC clearly above the rule baseline on an out-of-time holdout; reliable reason codes."]
      ],
      data: [
        ["Sources", "Application form, credit bureau report, bank statements, KYC, internal past loans and repayments."],
        ["Features", "Income, employment type & length, loan amount, term, purpose, existing EMIs, bureau score, past delinquencies, credit-history length."],
        ["Target", "Good (approved and repaid) vs bad (defaulted). Rejected applicants have no outcome → reject inference needed."],
        ["Volume", "Tabular, one row per application; typically tens of thousands to millions of rows (illustrative)."],
        ["Quality issues", "Missing/unverified self-employed income, inconsistent employer names, selection bias, class imbalance."]
      ],
      fe: [
        ["Missing values", "Median impute income/employment fields + 'is_missing' flags (missingness itself is predictive)."],
        ["Categoricals", "One-hot for purpose/term; target encoding (out-of-fold) for employer, city, branch."],
        ["Ratios", "Debt-to-income, loan-to-income, EMI-to-income, credit utilisation."],
        ["Outliers", "Cap income and loan amount at the 1st/99th percentiles; verify extreme values."],
        ["Scaling", "Standardise only for Logistic Regression; trees don't need it."],
        ["Imbalance", "Class weights / scale_pos_weight instead of naive oversampling."],
        ["Leakage", "Drop anything known only after the decision: disbursed amount, collections status, final interest rate."]
      ],
      baseline: "Current policy rules (bureau score cut-off + DTI cap), then a Logistic Regression.",
      algos: [
        ["Logistic Regression", "Transparent, easy to explain to regulators", "Misses non-linear interactions"],
        ["Decision Tree", "Produces readable approval rules", "Unstable, overfits easily"],
        ["Random Forest", "Robust, little tuning", "Slower, harder to explain"],
        ["LightGBM / XGBoost", "Best accuracy on tabular data, handles missing values", "Needs SHAP for explanations"],
        ["CatBoost", "Native handling of high-cardinality categoricals", "Slower training"]
      ],
      selection: [
        ["Validation", "Stratified 5-fold CV on the training period + out-of-time holdout (most recent months)."],
        ["Compare on", "AUC, reason-code quality, latency of a real-time API, fairness gaps."],
        ["Recommendation", "LightGBM with monotonic constraints (e.g. higher DTI ⇒ never lower risk) and SHAP reason codes. Keep the LR scorecard as a fallback if explainability rules demand it."]
      ],
      evals: [
        ["Primary metric", "ROC-AUC; also KS and precision/recall at the chosen cut-off."],
        ["Business link", "Expected profit = good loans approved × margin − bad loans approved × loss; pick the threshold that maximises it."],
        ["Error analysis", "Review false approvals and false declines by segment (new-to-credit, self-employed)."],
        ["Fairness", "Compare approval and error rates across gender, age group and region."],
        ["Explainability", "Top-3 SHAP reasons per decision for adverse-action notices."],
        ["Robustness", "PSI on inputs and scores; stress-test with income shocks."]
      ],
      tuning: [
        ["Key hyperparameters", "num_leaves, max_depth, learning_rate, n_estimators, min_child_samples, scale_pos_weight, reg_lambda."],
        ["Approach", "Optuna (Bayesian/TPE), ~50–100 trials (illustrative) with stratified CV."],
        ["Avoid overfitting", "Early stopping; never tune on the out-of-time holdout; prefer simpler settings when scores tie."]
      ],
      flow: ["Approve or decline?", "Application + bureau", "Ratios, encoding, flags", "LR → RF → LightGBM", "AUC, KS, fairness", "LightGBM + SHAP", "Real-time API, PSI drift"]
    },
    {
      icon: "🏠", tab: "House Prices", title: "House Price Prediction",
      summary: "Estimate the fair market price of a property from its characteristics and location.",
      model: "LightGBM / CatBoost on log(price)",
      metric: "MAPE (and % of estimates within ±10% of sale price)",
      problem: [
        ["Objective", "Give instant, consistent property valuations."],
        ["Users", "Buyers, sellers, real-estate agents, mortgage lenders, valuers."],
        ["Decision improved", "Listing price, offer price, loan-to-value checks."],
        ["Expected value", "Faster valuations, fewer over-/under-priced listings, lower appraisal cost."],
        ["Business success", "Higher share of properties sold close to estimate; faster time-to-sale."],
        ["ML success", "Lower MAPE than the locality price-per-sqft baseline on future sales."]
      ],
      data: [
        ["Sources", "Past transactions/registrations, listing portals, property records, maps/POI data, listing photos and descriptions."],
        ["Features", "Built-up area, bedrooms, bathrooms, floor, age, parking, amenities, locality, latitude/longitude, distance to metro/schools, sale date."],
        ["Target", "Final sale price (modelled as log(price))."],
        ["Volume", "Thousands to a few million transactions (illustrative); plus optional text and images."],
        ["Quality issues", "Duplicate listings, area-unit mix-ups (sq ft vs sq m), typos, missing area, under-reported prices."]
      ],
      fe: [
        ["Target transform", "log(price) to reduce skew; convert predictions back with exp()."],
        ["Missing values", "Impute area/age with locality median; add missing flags."],
        ["Categoricals", "Out-of-fold target encoding for locality; one-hot for property type."],
        ["Geo features", "Distance to city centre/metro, neighbourhood clusters, average price-per-sqft of nearby past sales (only earlier sales)."],
        ["Temporal", "Sale year/month, property age at sale, market index."],
        ["Outliers", "Remove impossible values (0 sqft, 50 bedrooms); cap extreme price-per-sqft."],
        ["Text / image", "TF-IDF keywords from descriptions (e.g. 'sea view'); optional CNN image embeddings."],
        ["Leakage", "Don't use the final negotiated price or post-sale fields; neighbour averages must use past sales only."]
      ],
      baseline: "Locality median price-per-sqft × area.",
      algos: [
        ["Linear / Ridge Regression", "Simple, interpretable coefficients per feature", "Assumes linear effects"],
        ["Lasso / Elastic Net", "Automatic feature selection with many dummies", "Still linear"],
        ["Random Forest", "Captures non-linear location effects", "Can't extrapolate beyond seen prices"],
        ["LightGBM / XGBoost", "Top accuracy on tabular data", "Needs tuning; less transparent"],
        ["CatBoost", "Handles locality/builder categoricals natively", "Slower training"]
      ],
      selection: [
        ["Validation", "Time-based split (train on older sales, test on the latest) + GroupKFold by locality to check unseen areas."],
        ["Compare on", "MAPE, error spread by price band, inference speed, explainability for valuers."],
        ["Recommendation", "LightGBM or CatBoost on log(price) with geo features; quantile models for a price range."]
      ],
      evals: [
        ["Primary metric", "MAPE; also MAE, RMSLE and R²."],
        ["Business link", "% of valuations within ±10% of actual sale price drives trust and lender acceptance."],
        ["Error analysis", "Errors by locality, price band and property type; luxury homes often worst."],
        ["Fairness", "Check for systematic under-valuation in specific neighbourhoods."],
        ["Explainability", "SHAP: 'area +₹X, metro distance −₹Y' style breakdown."],
        ["Robustness", "Retrain when market index shifts; monitor error on new sales monthly."]
      ],
      tuning: [
        ["Key hyperparameters", "learning_rate, num_leaves, min_data_in_leaf, feature_fraction, lambda_l1/l2, n_estimators."],
        ["Approach", "Optuna with time-series CV folds."],
        ["Avoid overfitting", "Early stopping; target encoding computed inside folds; final check on the untouched latest period."]
      ],
      flow: ["What's this home worth?", "Sales + geo + listings", "log target, geo, encoding", "Ridge → RF → LightGBM", "MAPE, ±10% hit rate", "LightGBM on log(price)", "Valuation API, monthly drift check"]
    },
    {
      icon: "💲", tab: "Price Optimization", title: "Price Optimization",
      summary: "Set the price for each product that maximises profit while respecting business rules.",
      model: "LightGBM demand model (price monotonic) + price optimiser",
      metric: "WAPE of demand forecast → margin uplift in A/B test",
      problem: [
        ["Objective", "Find the price that balances volume and margin per product, store and time."],
        ["Users", "Pricing managers, category managers, revenue teams."],
        ["Decision improved", "Regular price, discount depth, promotion timing."],
        ["Expected value", "Higher gross margin/revenue, less stock waste, fewer unnecessary discounts."],
        ["Business success", "Gross-margin uplift vs. control stores without volume collapse."],
        ["ML success", "Accurate demand forecasts at different prices (low WAPE) and sensible elasticities."]
      ],
      data: [
        ["Sources", "POS transactions, price & promotion history, competitor prices, inventory, costs, calendar/holidays, weather."],
        ["Features", "Own price, discount %, competitor price gap, promo flags, lagged sales, seasonality, stock level, related-product prices."],
        ["Target", "Units sold per product-store-day (demand)."],
        ["Volume", "Large time series: products × stores × days, often millions of rows (illustrative)."],
        ["Quality issues", "Little price variation (hard to learn elasticity), stock-outs hide true demand, promo overlaps."]
      ],
      fe: [
        ["Price features", "log(price), price relative to competitor and to the product's usual price, discount depth."],
        ["Temporal", "Day-of-week, week, holidays, paydays, lags (7/14/28 days) and rolling means."],
        ["Cross effects", "Prices of substitute/complement products."],
        ["Censored demand", "Flag or remove stock-out days so low sales aren't read as low demand."],
        ["Missing values", "Forward-fill competitor prices; flag gaps."],
        ["Categoricals", "Product category, store format, region (encoding or native categorical)."],
        ["Leakage", "Lags must only use past data; don't use same-day inventory after sales."]
      ],
      baseline: "Current cost-plus price with last year's same-period demand (seasonal naive).",
      algos: [
        ["Log-log Linear Regression", "Coefficient on log(price) = price elasticity, easy to explain", "Constant elasticity, ignores interactions"],
        ["Poisson / Tweedie GLM", "Fits count demand with many zeros", "Limited non-linearity"],
        ["LightGBM demand model", "Captures seasonality, promos, cross effects", "Elasticity must be checked; needs monotonic price constraint"],
        ["Bayesian hierarchical model", "Shares elasticity across similar products (sparse data)", "Slower, more expertise needed"],
        ["Contextual bandits", "Learns online by testing prices safely", "Needs experimentation infrastructure"]
      ],
      selection: [
        ["Validation", "Rolling-origin backtesting (train up to week t, forecast t+1…t+4, slide forward)."],
        ["Compare on", "WAPE, plausibility of elasticity (demand should fall as price rises), run time for all SKUs."],
        ["Recommendation", "LightGBM demand model with monotonic decreasing price constraint, then optimise price over an allowed grid with rules (min margin, max change, price endings)."]
      ],
      evals: [
        ["Primary metric", "WAPE of demand forecasts; also bias and MAE per product."],
        ["Business link", "Simulated and then A/B (or switchback) measured margin & revenue uplift."],
        ["Error analysis", "Forecast errors on promo days, new products, holiday periods."],
        ["Fairness / ethics", "Avoid personalised prices based on sensitive attributes; respect price regulations."],
        ["Explainability", "Show elasticity curves and the expected profit at each candidate price."],
        ["Robustness", "Guardrails on max price change; monitor competitor reactions and demand drift."]
      ],
      tuning: [
        ["Key hyperparameters", "learning_rate, num_leaves, min_data_in_leaf, feature_fraction, lag/rolling window sizes, Tweedie variance power."],
        ["Approach", "Optuna across rolling backtest folds."],
        ["Avoid overfitting", "Tune on backtests only, keep the last period untouched, check elasticities remain sensible."]
      ],
      flow: ["What price maximises profit?", "Sales, prices, competitors", "Price ratios, lags, holidays", "Log-log → GLM → LightGBM", "WAPE + margin uplift", "LightGBM + optimiser", "Weekly prices, A/B & drift"]
    },
    {
      icon: "⚙️", tab: "Equipment Failure", title: "Equipment Failure Detection (Anomaly Detection)",
      summary: "Spot abnormal machine behaviour early so maintenance happens before a breakdown.",
      model: "Isolation Forest on rolling sensor features (LSTM autoencoder as upgrade)",
      metric: "Event-level recall at a fixed false-alarm budget",
      problem: [
        ["Objective", "Detect early warning signs of failure from sensor data."],
        ["Users", "Maintenance engineers, plant/operations managers, reliability teams."],
        ["Decision improved", "When to inspect or service a machine (predictive instead of reactive or fixed-schedule)."],
        ["Expected value", "Less unplanned downtime, lower repair costs, longer equipment life, safer operations."],
        ["Business success", "Fewer unplanned stoppages and downtime hours vs. previous period."],
        ["ML success", "Most past failures flagged with useful lead time while alarms stay within the team's capacity."]
      ],
      data: [
        ["Sources", "IoT sensors (vibration, temperature, pressure, current, RPM), SCADA logs, maintenance work orders, machine metadata."],
        ["Features", "Raw sensor readings, operating mode, load, ambient temperature, time since last maintenance, machine age/model."],
        ["Target", "Usually unlabelled; failure events (few) from work orders used to validate or to build 'fails within N hours' labels."],
        ["Volume", "High-frequency time series, possibly billions of readings across machines (illustrative)."],
        ["Quality issues", "Sensor dropouts, drift/miscalibration, noisy readings, inconsistent maintenance logs, very rare failures."]
      ],
      fe: [
        ["Resampling", "Aggregate to fixed windows (e.g. per minute/hour)."],
        ["Rolling stats", "Mean, std, min, max, slope over several windows."],
        ["Frequency domain", "FFT band energies and peaks for vibration signals."],
        ["Normalisation", "Scale per machine/operating mode so 'normal' is comparable."],
        ["Missing values", "Short gaps: interpolate; long gaps: flag (a dead sensor can itself be a signal)."],
        ["Outliers", "Don't remove them blindly — they may be the anomalies; only drop known sensor errors."],
        ["Leakage", "Exclude readings after failure/repair started; train 'normal' models on healthy periods only."]
      ],
      baseline: "Fixed threshold rules (e.g. temperature above limit) and z-score alerts per sensor.",
      algos: [
        ["Statistical (z-score / control charts)", "Simple, explainable per sensor", "Misses multi-sensor patterns"],
        ["Isolation Forest", "Fast, unsupervised, multi-feature", "Point-based; needs window features for time context"],
        ["One-Class SVM", "Learns a boundary around normal data", "Scales poorly, sensitive to scaling"],
        ["LSTM / Conv Autoencoder", "Learns normal temporal patterns; high reconstruction error = anomaly", "Needs more data, compute, expertise"],
        ["LightGBM (supervised)", "Best when enough labelled failures exist", "Rare labels; only catches known failure types"]
      ],
      selection: [
        ["Validation", "Time-based split; GroupKFold by machine to test on unseen machines; evaluate on known failure windows."],
        ["Compare on", "Event recall, lead time, false alarms per week, edge/cloud compute cost, explainability for engineers."],
        ["Recommendation", "Start with Isolation Forest on rolling + FFT features (fast and simple); move to an LSTM autoencoder when multivariate temporal patterns matter."]
      ],
      evals: [
        ["Primary metric", "Event-level recall (failures caught ahead of time) at a fixed false-alarm budget."],
        ["Other metrics", "PR-AUC on labelled windows, average lead time, false alarms per machine per week."],
        ["Business link", "Downtime hours avoided × cost per hour − cost of inspections triggered by alarms."],
        ["Error analysis", "Review missed failures and noisy alarms by machine type and operating mode."],
        ["Explainability", "Show which sensors/features contributed most to each alert."],
        ["Robustness", "Handle sensor replacement/recalibration; retrain after maintenance changes 'normal'."]
      ],
      tuning: [
        ["Key hyperparameters", "Isolation Forest: contamination, n_estimators, max_samples, max_features; window lengths; alert threshold. Autoencoder: latent size, layers, window length."],
        ["Approach", "Bayesian optimisation (Optuna) maximising event recall at the alarm budget on a validation period with known failures."],
        ["Avoid overfitting", "Few labelled failures → keep the search small, use separate validation and test periods, prefer stable settings."]
      ],
      flow: ["Catch failures early", "Sensors + work orders", "Windows, rolling stats, FFT", "Rules → IF → Autoencoder", "Event recall, false alarms", "Isolation Forest", "Streaming scores, alerts, retrain"]
    },
    {
      icon: "👥", tab: "Customer Segmentation", title: "Customer Segmentation for Targeted Marketing",
      summary: "Group customers with similar behaviour so each group gets the right message and offer.",
      model: "K-Means on scaled RFM + behaviour features",
      metric: "Silhouette score + campaign uplift per segment",
      problem: [
        ["Objective", "Discover meaningful customer groups to personalise marketing."],
        ["Users", "Marketing, CRM and product teams."],
        ["Decision improved", "Which offer, channel and message each group receives."],
        ["Expected value", "Higher campaign response, less wasted spend, better retention."],
        ["Business success", "Conversion/response uplift of segment-targeted campaigns vs. one-size-fits-all."],
        ["ML success", "Well-separated, stable and interpretable clusters of usable size."]
      ],
      data: [
        ["Sources", "Transactions, loyalty program, web/app behaviour, demographics, campaign responses."],
        ["Features", "Recency, Frequency, Monetary (RFM), basket size, category mix, channel preference, discount usage, tenure."],
        ["Target", "None — unsupervised learning."],
        ["Volume", "One row per customer: thousands to millions (illustrative)."],
        ["Quality issues", "Duplicate customer IDs, inactive customers, highly skewed spend, missing demographics."]
      ],
      fe: [
        ["Aggregation", "Turn transactions into one row per customer (RFM, category shares)."],
        ["Skew & outliers", "Log-transform spend/frequency; cap extreme spenders (or treat VIPs separately)."],
        ["Scaling", "Standardise all features — essential for distance-based K-Means."],
        ["Categoricals", "One-hot for channel/region, or use K-Prototypes/Gower distance for mixed data."],
        ["Dimensionality", "PCA to remove correlated features and help visualisation."],
        ["Missing values", "Impute or drop sparse demographic fields; don't let one feature dominate."],
        ["Sensitive data", "Exclude protected attributes (religion, ethnicity) from clustering."]
      ],
      baseline: "Rule-based RFM quantile segments (e.g. 'Champions', 'At risk', 'Lost').",
      algos: [
        ["K-Means", "Fast, simple, easy-to-explain centroids", "Assumes round, similar-sized clusters; must choose k"],
        ["Gaussian Mixture Model", "Soft membership, elliptical clusters", "More parameters, sensitive to init"],
        ["Hierarchical (Ward)", "Dendrogram helps choose number of groups", "Doesn't scale to millions"],
        ["DBSCAN / HDBSCAN", "Finds odd shapes and noise customers", "Hard to tune on high-dimensional data"],
        ["K-Prototypes", "Handles numeric + categorical directly", "Less tooling support"]
      ],
      selection: [
        ["Validation", "No labels: internal scores (silhouette, Davies-Bouldin), stability across bootstrap samples and time periods, business review."],
        ["Compare on", "Separation, segment sizes, interpretability of profiles, actionability for marketing."],
        ["Recommendation", "K-Means on standardised RFM + behaviour features; choose k (often a handful) via elbow + silhouette + business review."]
      ],
      evals: [
        ["Primary metric", "Silhouette score (technical) + campaign uplift per segment (business)."],
        ["Other metrics", "Davies-Bouldin, Calinski-Harabasz, segment stability (Adjusted Rand Index between runs)."],
        ["Business link", "A/B test: segment-tailored campaign vs. generic campaign response and revenue."],
        ["Error analysis", "Inspect tiny or overlapping clusters; merge or split as needed."],
        ["Explainability", "Segment profile cards and a decision-tree surrogate that describes each segment in rules."],
        ["Robustness", "Re-run monthly; track how customers move between segments."]
      ],
      tuning: [
        ["Key hyperparameters", "k (number of clusters), init (k-means++), n_init, feature set/weights, PCA components."],
        ["Approach", "Grid search over k and feature sets (search space is small); Optuna if many options."],
        ["Avoid overfitting", "Prefer fewer, stable clusters; validate stability on a different time period."]
      ],
      flow: ["Who are our customers?", "Transactions + behaviour", "RFM, log, scaling, PCA", "RFM rules → K-Means → GMM", "Silhouette + uplift", "K-Means segments", "CRM tags, monthly refresh"]
    },
    {
      icon: "🕵️", tab: "Fraud Detection", title: "Suspicious Payments & Claims Detection (Anomaly Detection)",
      summary: "Flag payments or insurance claims that look fraudulent before money is lost.",
      model: "LightGBM (supervised) + Isolation Forest score as a feature",
      metric: "PR-AUC and Recall at the investigation capacity",
      problem: [
        ["Objective", "Catch fraud early while keeping genuine customers happy."],
        ["Users", "Fraud analysts, claims investigators, risk & compliance teams."],
        ["Decision improved", "Allow / block / step-up verification / send to investigation."],
        ["Expected value", "Less fraud loss, better use of investigators, fewer false blocks."],
        ["Business success", "Fraud losses down, investigator hit rate up, customer complaints not up."],
        ["ML success", "High PR-AUC; more fraud caught at the same review volume than rules."]
      ],
      data: [
        ["Sources", "Payment/claim transactions, customer & account history, device/IP, merchant/provider data, investigation outcomes, chargebacks."],
        ["Features", "Amount, merchant/provider, channel, location, time, device, customer history, policy details, claim description."],
        ["Target", "Confirmed fraud (very rare, arrives weeks later); unlabelled for new patterns."],
        ["Volume", "Millions of events, extreme imbalance (fraud often well below 1%, illustrative)."],
        ["Quality issues", "Label delay, uninvestigated cases treated as 'not fraud', changing fraud tactics."]
      ],
      fe: [
        ["Velocity", "Number/amount of transactions in the last 1h/24h/7d per card, device, IP."],
        ["Deviation", "Amount vs customer's usual amount, new merchant/device/country flags, distance from home."],
        ["Temporal", "Hour of day, weekend, time since account opened or policy started."],
        ["Graph", "Shared devices/addresses/bank accounts between customers or claimants (fraud rings)."],
        ["Categoricals", "Target-encode merchant/provider risk (out-of-fold)."],
        ["Text", "Keywords/embeddings from claim descriptions."],
        ["Imbalance", "Class weights or undersample the majority in training only; never on test."],
        ["Leakage", "Exclude chargeback/investigation fields and anything known after the event."]
      ],
      baseline: "Existing rule engine (amount limits, velocity rules, blacklists).",
      algos: [
        ["Logistic Regression", "Simple, fast, explainable", "Misses complex patterns"],
        ["Isolation Forest / HBOS", "Unsupervised; detects new, unseen fraud patterns", "Many false alarms alone"],
        ["Random Forest", "Robust, handles mixed features", "Larger models, slower scoring"],
        ["LightGBM / XGBoost", "Best accuracy with engineered features, low latency", "Needs labels and SHAP"],
        ["Graph models / Autoencoders", "Catch fraud rings and complex behaviour", "Complex to build and serve"]
      ],
      selection: [
        ["Validation", "Time-based split respecting label maturity; group by customer/card so the same entity isn't in train and test."],
        ["Compare on", "PR-AUC, recall at review capacity, scoring latency for real-time decisions, explainability for analysts."],
        ["Recommendation", "Hybrid: LightGBM trained on confirmed labels with Isolation Forest anomaly score as an extra feature, plus rules as guardrails."]
      ],
      evals: [
        ["Primary metric", "PR-AUC; Recall and Precision@K at the daily investigation capacity."],
        ["Business link", "Fraud amount prevented − investigation cost − cost of blocking genuine customers."],
        ["Error analysis", "Study missed fraud types and false-positive customer segments."],
        ["Fairness", "Check false-block rates across regions and customer groups."],
        ["Explainability", "SHAP reasons shown to analysts for each alert."],
        ["Robustness", "Fraudsters adapt → monitor drift, retrain frequently, keep unsupervised layer for new patterns."]
      ],
      tuning: [
        ["Key hyperparameters", "LightGBM: scale_pos_weight, num_leaves, learning_rate, min_child_samples, feature_fraction. Isolation Forest: contamination, max_samples."],
        ["Approach", "Optuna optimising PR-AUC on time-based validation folds."],
        ["Avoid overfitting", "Small number of positives → early stopping, keep a later untouched test month, avoid tuning thresholds on test."]
      ],
      flow: ["Is this payment/claim fraud?", "Transactions, devices, labels", "Velocity, deviation, graph", "Rules → IF → LightGBM", "PR-AUC, Recall@capacity", "LightGBM + IF hybrid", "Real-time scoring, analyst feedback"]
    },
    {
      icon: "📈", tab: "Lead Scoring", title: "Lead Scoring",
      summary: "Rank sales prospects by how likely they are to convert so sales teams call the best leads first.",
      model: "CatBoost classifier (calibrated) + SHAP",
      metric: "Conversion rate / lift in the top decile (Precision@K)",
      problem: [
        ["Objective", "Prioritise leads with the highest chance of becoming customers."],
        ["Users", "Sales reps, sales managers, marketing ops."],
        ["Decision improved", "Which leads to contact first and which to nurture via marketing."],
        ["Expected value", "More deals per rep hour, shorter sales cycle, better marketing ROI."],
        ["Business success", "Higher conversion rate and pipeline value from prioritised leads."],
        ["ML success", "Strong lift in the top deciles vs. current points-based scoring."]
      ],
      data: [
        ["Sources", "CRM (lead/opportunity records), marketing automation, website analytics, product trial usage, firmographic data providers."],
        ["Features", "Lead source, industry, company size, job title, country, email opens/clicks, web visits, demo request, trial activity."],
        ["Target", "Converted to opportunity / closed-won within N days of lead creation."],
        ["Volume", "Thousands to hundreds of thousands of leads (illustrative)."],
        ["Quality issues", "Duplicate leads, free-text job titles, missing firmographics, CRM fields filled in inconsistently."]
      ],
      fe: [
        ["Engagement", "Counts of visits/opens/clicks with recency weighting; pricing-page visits."],
        ["Text", "Job title → seniority/function (rule-based or keyword features)."],
        ["Categoricals", "Lead source, industry, country — native CatBoost handling or target encoding."],
        ["Temporal", "Days since first touch, time since last activity, created month."],
        ["Missing values", "Missing firmographics as their own category + flag."],
        ["Imbalance", "Class weights; evaluate with ranking metrics, not accuracy."],
        ["Leakage", "Exclude fields updated by sales after qualifying (opportunity stage, rep notes, meeting booked after conversion)."]
      ],
      baseline: "Existing manual points scoring (e.g. +10 for demo request).",
      algos: [
        ["Logistic Regression", "Interpretable weights sales trusts", "Linear only"],
        ["Decision Tree", "Simple rules to share with sales", "Unstable"],
        ["Random Forest", "Good default, robust", "Less calibrated probabilities"],
        ["LightGBM / XGBoost", "High accuracy with engagement features", "Needs encoding of many categoricals"],
        ["CatBoost", "Excellent with many categorical fields, little preprocessing", "Slower training"]
      ],
      selection: [
        ["Validation", "Time-based split on lead creation date (labels need N days to mature); stratified folds inside training period."],
        ["Compare on", "Top-decile lift, AUC, calibration, ease of explanation in the CRM."],
        ["Recommendation", "CatBoost with probability calibration and SHAP reasons, scores pushed into the CRM daily."]
      ],
      evals: [
        ["Primary metric", "Lift / conversion rate in the top 10% of scored leads (Precision@K)."],
        ["Other metrics", "ROC-AUC, PR-AUC, calibration (Brier score), cumulative gains chart."],
        ["Business link", "Expected deals = conversion rate × leads reps can contact; compare pipeline value vs. old scoring."],
        ["Error analysis", "High-score leads that never convert (bad fit?) and converted low-score leads (missing signals)."],
        ["Fairness", "Make sure regions/segments aren't ignored because of sparse data."],
        ["Explainability", "Top reasons shown next to each lead ('visited pricing page 3×')."]
      ],
      tuning: [
        ["Key hyperparameters", "depth, learning_rate, iterations, l2_leaf_reg, class_weights / auto_class_weights."],
        ["Approach", "Optuna with time-based CV optimising top-decile lift or PR-AUC."],
        ["Avoid overfitting", "Early stopping, limit depth, final check on the most recent untouched leads."]
      ],
      flow: ["Which leads to call first?", "CRM + marketing data", "Engagement, title, recency", "Points → LR → CatBoost", "Top-decile lift, AUC", "Calibrated CatBoost", "Daily CRM scores, monitor conversion"]
    },
    {
      icon: "💳", tab: "Credit Risk Scoring", title: "Credit Risk Scoring (Probability of Default)",
      summary: "Estimate the probability that a borrower will default so risk can be priced, limited and provisioned.",
      model: "WoE Logistic Regression scorecard (champion) + LightGBM challenger",
      metric: "Gini / KS with calibration (predicted vs actual default rate)",
      problem: [
        ["Objective", "Produce a calibrated Probability of Default (PD) for each borrower/account."],
        ["Users", "Credit risk team, pricing, collections, finance (provisioning), regulators."],
        ["Decision improved", "Credit limits, interest-rate pricing, early collections, loss provisioning."],
        ["Expected value", "Lower credit losses, risk-based pricing, regulatory compliance (e.g. IFRS 9 / Basel)."],
        ["Business success", "Lower loss rate for the same portfolio growth; accurate provisions."],
        ["ML success", "Good rank-ordering (Gini/KS), well-calibrated PDs, stable over time (low PSI)."]
      ],
      data: [
        ["Sources", "Credit bureau, internal repayment history, account behaviour, application data, macroeconomic indicators."],
        ["Features", "Days past due history, utilisation, number of enquiries, credit age, income, outstanding balance, payment ratio, macro trends."],
        ["Target", "Default = 90+ days past due within 12 months after the observation date."],
        ["Volume", "Hundreds of thousands to millions of account snapshots (illustrative)."],
        ["Quality issues", "Few defaults in good years, changing definitions, missing bureau data for new-to-credit, survivorship bias."]
      ],
      fe: [
        ["Observation window", "Build features only from data before the observation date; outcome from the next 12 months."],
        ["WoE binning", "Bin each variable and convert to Weight of Evidence; use Information Value (IV) to select features."],
        ["Behaviour features", "Max DPD in last 3/6/12 months, utilisation trend, number of recent enquiries."],
        ["Missing values", "Treat as a separate bin (e.g. 'no bureau record')."],
        ["Outliers", "Binning naturally caps extremes."],
        ["Monotonicity", "Bins should show logical risk trends (more delinquencies ⇒ higher risk)."],
        ["Leakage", "No information after the observation date (collections actions, write-off flags)."]
      ],
      baseline: "Bureau score alone (or existing scorecard).",
      algos: [
        ["WoE Logistic Regression (scorecard)", "Industry standard, transparent points per attribute, regulator-friendly", "Lower accuracy on complex patterns"],
        ["Decision Tree", "Segment portfolio into risk groups", "Coarse probabilities"],
        ["LightGBM / XGBoost", "Higher Gini, captures interactions", "Needs monotonic constraints, SHAP, model-risk approval"],
        ["Survival models (Cox)", "Predict when default happens (lifetime PD for IFRS 9)", "More complex assumptions"],
        ["Neural networks", "Use rich transaction sequences", "Hard to explain and validate"]
      ],
      selection: [
        ["Validation", "Out-of-time validation on later cohorts + out-of-sample stratified split; vintage analysis."],
        ["Compare on", "Gini, KS, calibration, stability (PSI), explainability and regulatory acceptance."],
        ["Recommendation", "WoE Logistic scorecard as champion; monotonic LightGBM as challenger, promoted only if the uplift is material and explainable."]
      ],
      evals: [
        ["Primary metric", "Gini (= 2×AUC − 1) and KS for ranking; calibration plots / Brier score for PD accuracy."],
        ["Stability", "PSI of score distribution and characteristic stability over time."],
        ["Business link", "Expected Loss = PD × LGD × EAD drives pricing, limits and provisions."],
        ["Error analysis", "Under-predicted segments (new-to-credit, specific products)."],
        ["Fairness", "Check adverse impact across protected groups; exclude prohibited variables."],
        ["Explainability", "Scorecard points per attribute; SHAP for the challenger; documented for model validation."]
      ],
      tuning: [
        ["Key hyperparameters", "Scorecard: number of bins, min bin size, regularisation C. LightGBM: monotone_constraints, max_depth, num_leaves, learning_rate, min_child_samples."],
        ["Approach", "Grid search for scorecard binning; Optuna for LightGBM using stratified CV within the development period."],
        ["Avoid overfitting", "Minimum bin size, few well-chosen features, OOT sample never used in tuning, check PSI between dev and OOT."]
      ],
      flow: ["Probability of default?", "Bureau + repayment history", "Windows, WoE, IV selection", "Bureau score → Scorecard → LightGBM", "Gini, KS, calibration, PSI", "WoE Scorecard (+ GBM challenger)", "Batch PD, PSI & back-testing"]
    }
  ];

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function list(rows) {
    return "<ul>" + rows.map(function (r) { return "<li><b>" + esc(r[0]) + ":</b> " + esc(r[1]) + "</li>"; }).join("") + "</ul>";
  }

  function section(n, icon, title, body, extra) {
    return '<div class="uc-sec' + (extra ? " " + extra : "") + '"><div class="uc-sec-h"><span class="uc-num">' + n + "</span>" + icon + " " + esc(title) + "</div>" + body + "</div>";
  }

  function paneHTML(c) {
    var algos = '<p class="uc-base"><b>Baseline first:</b> ' + esc(c.baseline) + "</p>" +
      '<div class="uc-tw"><table class="uc-table"><thead><tr><th>#</th><th>Algorithm</th><th>Why it fits</th><th>Trade-off</th></tr></thead><tbody>' +
      c.algos.map(function (a, i) { return "<tr><td>" + (i + 1) + "</td><td><b>" + esc(a[0]) + "</b></td><td>" + esc(a[1]) + "</td><td>" + esc(a[2]) + "</td></tr>"; }).join("") +
      "</tbody></table></div>";
    var flow = '<div class="uc-flow">' + c.flow.map(function (f, i) {
      return (i ? '<span class="uc-arrow">➜</span>' : "") +
        '<div class="uc-step' + (i === 5 ? " uc-step-hi" : "") + '"><div class="uc-step-i">' + FLOW_ICONS[i] + '</div><div class="uc-step-l">' + FLOW_LABELS[i] + '</div><div class="uc-step-d">' + esc(f) + "</div></div>";
    }).join("") + "</div>";

    return '<div class="uc-head"><div class="uc-icon">' + c.icon + '</div><div class="uc-head-t"><h3>' + esc(c.title) + '</h3><p>' + esc(c.summary) + "</p></div></div>" +
      '<div class="uc-hl"><div class="uc-badge uc-b-model"><span>⭐ Recommended model</span><b>' + esc(c.model) + '</b></div>' +
      '<div class="uc-badge uc-b-metric"><span>🎯 Primary metric</span><b>' + esc(c.metric) + "</b></div></div>" +
      '<div class="uc-grid">' +
      section(1, "🎯", "Business Problem", list(c.problem)) +
      section(2, "🗄️", "Typical Data", list(c.data)) +
      section(3, "🛠️", "Feature Engineering", list(c.fe)) +
      section(4, "🧪", "Model Experimentation", algos, "uc-wide") +
      section(5, "🏆", "Model Selection", list(c.selection)) +
      section(6, "📏", "Evaluation", list(c.evals)) +
      section(7, "🎛️", "Hyperparameter Tuning", list(c.tuning)) +
      section(8, "🔁", "Final Solution Flow", flow, "uc-wide") +
      "</div>";
  }

  function css() {
    var s = document.createElement("style");
    s.textContent = [
      ".uc-slide{overflow-y:auto}",
      ".uc-lead{opacity:.85;max-width:1100px;line-height:1.55;margin:.4rem 0 1rem}",
      ".uc-tabs{display:flex;flex-wrap:wrap;gap:.4rem;padding:.6rem;border:1px solid rgba(148,163,184,.2);border-radius:12px;margin-bottom:1rem}",
      ".uc-tab{font:inherit;color:inherit;cursor:pointer;border:1px solid rgba(148,163,184,.35);background:rgba(148,163,184,.08);border-radius:8px;padding:.4rem .8rem;font-size:.85rem;transition:all .15s}",
      ".uc-tab:hover{border-color:#6c8cff}",
      ".uc-tab.active{background:linear-gradient(135deg,#6c8cff,#8b5cf6);border-color:transparent;color:#fff;font-weight:600}",
      ".uc-head{display:flex;gap:1rem;align-items:center;padding:1rem 1.2rem;border-radius:14px;background:linear-gradient(135deg,rgba(108,140,255,.18),rgba(139,92,246,.12));border:1px solid rgba(108,140,255,.35)}",
      ".uc-icon{font-size:2.4rem;line-height:1}",
      ".uc-head h3{margin:0 0 .25rem;font-size:1.25rem}",
      ".uc-head p{margin:0;opacity:.9;line-height:1.45}",
      ".uc-hl{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:.7rem;margin:.8rem 0}",
      ".uc-badge{display:flex;flex-direction:column;gap:.2rem;padding:.6rem .9rem;border-radius:10px;font-size:.9rem}",
      ".uc-badge span{font-size:.75rem;text-transform:uppercase;letter-spacing:.04em;opacity:.85}",
      ".uc-b-model{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.55)}",
      ".uc-b-metric{background:rgba(245,165,36,.1);border:1px solid rgba(245,165,36,.6)}",
      ".uc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:.8rem;padding-bottom:1.5rem}",
      ".uc-sec{border:1px solid rgba(148,163,184,.25);background:rgba(148,163,184,.06);border-radius:12px;padding:.8rem 1rem;min-width:0}",
      ".uc-wide{grid-column:1/-1}",
      ".uc-sec-h{display:flex;align-items:center;gap:.45rem;font-weight:700;font-size:1rem;margin-bottom:.5rem;padding-bottom:.4rem;border-bottom:1px solid rgba(148,163,184,.2)}",
      ".uc-num{display:inline-flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem;border-radius:50%;background:linear-gradient(135deg,#6c8cff,#8b5cf6);color:#fff;font-size:.8rem}",
      ".uc-sec ul{margin:0;padding-left:1.1rem}",
      ".uc-sec li{margin:.25rem 0;line-height:1.45;font-size:.9rem}",
      ".uc-base{margin:0 0 .6rem;padding:.45rem .7rem;border-left:4px solid #f5a524;background:rgba(245,165,36,.08);border-radius:8px;font-size:.9rem}",
      ".uc-tw{overflow-x:auto}",
      ".uc-table{width:100%;border-collapse:collapse;font-size:.87rem}",
      ".uc-table th,.uc-table td{border:1px solid rgba(148,163,184,.25);padding:.45rem .6rem;text-align:left;vertical-align:top}",
      ".uc-table th{background:rgba(108,140,255,.18)}",
      ".uc-flow{display:flex;flex-wrap:wrap;align-items:stretch;gap:.35rem}",
      ".uc-step{flex:1 1 120px;min-width:110px;border:1px solid rgba(108,140,255,.4);background:rgba(108,140,255,.08);border-radius:10px;padding:.5rem;text-align:center}",
      ".uc-step-hi{border-color:#22c55e;background:rgba(34,197,94,.12)}",
      ".uc-step-i{font-size:1.3rem}",
      ".uc-step-l{font-weight:700;font-size:.78rem;margin:.15rem 0}",
      ".uc-step-d{font-size:.78rem;opacity:.85;line-height:1.35}",
      ".uc-arrow{align-self:center;opacity:.6}",
      ".uc-note{font-size:.8rem;opacity:.7;margin-top:.4rem}"
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
    if (document.getElementById("ml-use-cases")) return;
    var slides = topSlides();
    var last = slides[slides.length - 1];
    if (!last) return;
    var sec = document.createElement("section");
    sec.className = "slide uc-slide";
    sec.id = "ml-use-cases";
    sec.setAttribute("data-title", "ML Use Cases (End to End)");
    var grp = last.getAttribute("data-group");
    if (grp) sec.setAttribute("data-group", grp);
    var h2 = last.querySelector("h2");
    sec.innerHTML = '<h2 class="' + (h2 ? esc(h2.className) : "") + '">ML Use Cases — End to End</h2>' +
      '<p class="uc-lead">Eight real business problems, each solved with the same 8-step recipe: business problem → data → features → experiments → selection → evaluation → tuning → final flow. Numbers shown as ranges are <b>illustrative</b>, not measured results.</p>' +
      '<div class="uc-tabs" role="tablist">' + CASES.map(function (c, i) {
        return '<button type="button" role="tab" class="uc-tab' + (i === 0 ? " active" : "") + '" data-i="' + i + '">' + c.icon + " " + (i + 1) + ". " + esc(c.tab) + "</button>";
      }).join("") + "</div>" +
      '<div class="uc-pane"></div>';
    last.parentNode.insertBefore(sec, last.nextSibling);
    css();

    var pane = sec.querySelector(".uc-pane");
    var btns = Array.prototype.slice.call(sec.querySelectorAll(".uc-tab"));
    function show(i) {
      btns.forEach(function (b, j) { b.classList.toggle("active", i === j); });
      pane.innerHTML = paneHTML(CASES[i]);
      sec.scrollTop = 0;
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function (e) { e.stopPropagation(); show(i); });
    });
    show(0);
  }

  if (document.querySelector("section.slide")) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
