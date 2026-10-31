/* Adds "Backend assumptions" and "Mathematics behind it" to every algorithm tab. */
(function () {
  "use strict";

  var M = {
    linreg: {
      assume: [
        ["Linearity", "The target changes in a straight-line way with each feature."],
        ["Independent errors", "One row's mistake tells you nothing about another row's mistake (watch out for time series)."],
        ["Constant error spread (homoscedasticity)", "Errors are about equally big for small and large predictions."],
        ["Normally distributed errors", "Needed for trustworthy p-values and confidence intervals, not for the prediction itself."],
        ["Low multicollinearity", "Features should not be near-copies of each other, otherwise coefficients become unstable."],
        ["Few extreme outliers", "Squared errors let a single outlier pull the whole line."]
      ],
      math: [
        ["ŷ = β<sub>0</sub> + β<sub>1</sub>x<sub>1</sub> + β<sub>2</sub>x<sub>2</sub> + … + β<sub>p</sub>x<sub>p</sub>", "Prediction = starting value (intercept) + a weight for every feature."],
        ["MSE = <sup>1</sup>&frasl;<sub>n</sub> Σ (y<sub>i</sub> − ŷ<sub>i</sub>)<sup>2</sup>", "The loss: average squared distance between truth and prediction."],
        ["β = (X<sup>T</sup>X)<sup>−1</sup> X<sup>T</sup>y", "Normal equation: the exact best weights in one shot (Ordinary Least Squares)."],
        ["β ← β − η · ∇MSE", "Gradient descent alternative: take small steps (η = learning rate) downhill on the loss."],
        ["R<sup>2</sup> = 1 − SS<sub>res</sub> / SS<sub>tot</sub>", "Share of the target's variation the model explains (1 = perfect, 0 = no better than the average)."]
      ]
    },
    ridge: {
      assume: [
        ["Same core assumptions as linear regression", "Linear relationship, independent errors, roughly constant error spread."],
        ["Multicollinearity is allowed", "Ridge is designed for correlated features; it shares weight between them."],
        ["Features are scaled", "The penalty treats all weights equally, so features must be on the same scale (standardize first)."],
        ["Most features matter a little", "Ridge shrinks weights towards 0 but never makes them exactly 0."],
        ["λ is tuned", "The penalty strength is chosen with cross-validation."]
      ],
      math: [
        ["Loss = Σ (y<sub>i</sub> − ŷ<sub>i</sub>)<sup>2</sup> + λ Σ β<sub>j</sub><sup>2</sup>", "Normal error + an L2 penalty on the size of the weights."],
        ["β = (X<sup>T</sup>X + λI)<sup>−1</sup> X<sup>T</sup>y", "Closed form: adding λ to the diagonal makes the matrix always invertible (stable)."],
        ["λ = 0 → OLS &nbsp;&nbsp; λ → ∞ → β → 0", "λ is the dial between plain regression and \"flatten everything\"."],
        ["Bias ↑ , Variance ↓", "Accept a little bias to get a much more stable model (bias–variance trade-off)."],
        ["β ~ Normal(0, σ<sup>2</sup>/λ)", "Bayesian view: Ridge = believing weights are probably small (Gaussian prior)."]
      ]
    },
    lasso: {
      assume: [
        ["Same core assumptions as linear regression", "Linear relationship, independent errors."],
        ["Sparsity", "Only a few features truly matter; the rest can be switched off (weight = 0)."],
        ["Features are scaled", "Otherwise the penalty unfairly hits features with small units."],
        ["Correlated features", "Among a group of correlated features Lasso keeps roughly one and drops the others, somewhat arbitrarily."],
        ["λ is tuned", "Chosen with cross-validation; larger λ = fewer features kept."]
      ],
      math: [
        ["Loss = <sup>1</sup>&frasl;<sub>2n</sub> Σ (y<sub>i</sub> − ŷ<sub>i</sub>)<sup>2</sup> + λ Σ |β<sub>j</sub>|", "Normal error + an L1 penalty (absolute values)."],
        ["β<sub>j</sub> = sign(z<sub>j</sub>) · max(|z<sub>j</sub>| − λ, 0)", "Soft-thresholding: any weight smaller than λ is set to exactly 0 → automatic feature selection."],
        ["Solved by coordinate descent", "No closed form (|β| has a corner at 0), so weights are updated one at a time."],
        ["β ~ Laplace(0, b)", "Bayesian view: a sharp prior peaked at zero, which is why many weights land on 0."]
      ]
    },
    elastic: {
      assume: [
        ["Same core assumptions as linear regression", "Linear relationship, independent errors."],
        ["Groups of correlated features", "Elastic Net keeps or drops correlated features together instead of picking one at random."],
        ["Some sparsity", "Many features are useless, but useful ones may come in groups."],
        ["Features are scaled", "Both penalties depend on weight size."],
        ["Two knobs tuned", "λ (overall strength) and α (mix of L1 vs L2) are chosen by cross-validation."]
      ],
      math: [
        ["Loss = Σ (y<sub>i</sub> − ŷ<sub>i</sub>)<sup>2</sup> + λ [ α Σ |β<sub>j</sub>| + <sup>(1 − α)</sup>&frasl;<sub>2</sub> Σ β<sub>j</sub><sup>2</sup> ]", "Error + a blend of the Lasso (L1) and Ridge (L2) penalties."],
        ["α = 1 → Lasso &nbsp;&nbsp; α = 0 → Ridge", "α (called l1_ratio in scikit-learn) slides between the two."],
        ["L1 part → zeros &nbsp;&nbsp; L2 part → grouping & stability", "You get feature selection and stability with correlated features at the same time."]
      ]
    },
    logreg: {
      assume: [
        ["Linear in the log-odds", "Each feature pushes the log-odds up or down by a fixed amount."],
        ["Independent observations", "Rows are not repeated measurements of the same thing."],
        ["Low multicollinearity", "Correlated features make coefficients unstable and hard to interpret."],
        ["Enough data per class", "Rule of thumb: ≥ 10 examples of the rarer class per feature."],
        ["No perfect separation", "If one feature splits the classes perfectly, weights blow up (regularization fixes this)."],
        ["Features scaled", "Needed for regularization and faster convergence."]
      ],
      math: [
        ["z = β<sub>0</sub> + β<sub>1</sub>x<sub>1</sub> + … + β<sub>p</sub>x<sub>p</sub>", "Same weighted sum as linear regression – a \"score\"."],
        ["p = σ(z) = 1 / (1 + e<sup>−z</sup>)", "The sigmoid squashes any score into a probability between 0 and 1."],
        ["log( p / (1 − p) ) = z", "Log-odds (logit) are linear in the features."],
        ["Log loss = −<sup>1</sup>&frasl;<sub>n</sub> Σ [ y log p + (1 − y) log(1 − p) ]", "Binary cross-entropy: big penalty for confident wrong answers."],
        ["∇ = <sup>1</sup>&frasl;<sub>n</sub> X<sup>T</sup>(p − y)", "Gradient used by gradient descent to update the weights."],
        ["Odds ratio = e<sup>β<sub>j</sub></sup>", "+1 unit of x<sub>j</sub> multiplies the odds by e<sup>β<sub>j</sub></sup>."]
      ]
    },
    tree: {
      assume: [
        ["Non-parametric", "No assumption about data distribution or linearity."],
        ["Boundaries are axis-aligned", "Splits are \"feature ≤ threshold\", so diagonal boundaries need many steps."],
        ["Greedy is good enough", "Each split is the best one right now; the tree never looks ahead."],
        ["No scaling needed", "Only the order of values matters, not their units."],
        ["Depth must be controlled", "Without max_depth / min_samples_leaf the tree memorises noise (overfits)."]
      ],
      math: [
        ["Gini = 1 − Σ p<sub>k</sub><sup>2</sup>", "Impurity: chance of mislabelling a random item in the node (0 = pure)."],
        ["Entropy H = −Σ p<sub>k</sub> log<sub>2</sub> p<sub>k</sub>", "Alternative impurity measure: \"surprise\" in the node."],
        ["IG = H(parent) − Σ <sup>n<sub>j</sub></sup>&frasl;<sub>n</sub> H(child<sub>j</sub>)", "Information gain: pick the split that reduces impurity the most."],
        ["Regression: minimise Σ (y − ȳ<sub>leaf</sub>)<sup>2</sup>", "For numbers, choose splits that minimise the variance in each child."],
        ["ŷ = majority class (or mean) of the leaf", "Prediction = what most training rows in that leaf were."]
      ]
    },
    forest: {
      assume: [
        ["Trees make different mistakes", "Averaging only helps if trees' errors are not perfectly correlated – hence random rows and features."],
        ["Bootstrap samples represent the data", "Rows are i.i.d., so resampling them is meaningful."],
        ["Individual trees are low-bias", "Deep trees are fine; averaging removes their variance."],
        ["No scaling or distribution assumptions", "Inherits the robustness of decision trees."]
      ],
      math: [
        ["Bootstrap: draw n rows with replacement", "Each tree sees ≈ 1 − 1/e ≈ 63.2% unique rows; the rest are \"out-of-bag\" (free validation)."],
        ["m ≈ √p (classification), p/3 (regression)", "Features randomly considered at each split."],
        ["ŷ = <sup>1</sup>&frasl;<sub>B</sub> Σ<sub>b</sub> T<sub>b</sub>(x) &nbsp; or &nbsp; majority vote", "Average (regression) or vote (classification) of B trees."],
        ["Var = ρσ<sup>2</sup> + <sup>(1 − ρ)</sup>&frasl;<sub>B</sub> σ<sup>2</sup>", "More trees (B) and less correlation (ρ) → lower variance."],
        ["Importance = Σ impurity decrease from feature j", "How feature importance is computed (averaged over all trees)."]
      ]
    },
    boost: {
      assume: [
        ["Errors can be fixed step by step", "Many weak trees added in sequence can build a strong model."],
        ["Loss is differentiable", "We need its gradient (MSE, log loss, …)."],
        ["Labels are fairly clean", "Boosting chases errors, so noisy labels/outliers can be over-fitted."],
        ["Small learning rate + early stopping", "Each tree contributes a little; validation decides when to stop."],
        ["No scaling needed", "Tree-based, so units do not matter."]
      ],
      math: [
        ["F<sub>0</sub>(x) = argmin<sub>c</sub> Σ L(y<sub>i</sub>, c)", "Start with a constant (e.g. the mean of y)."],
        ["r<sub>im</sub> = −∂L(y<sub>i</sub>, F(x<sub>i</sub>)) / ∂F(x<sub>i</sub>)", "Pseudo-residuals: the direction that reduces the loss. For MSE this is simply y − F(x)."],
        ["Fit tree h<sub>m</sub>(x) to r<sub>im</sub>", "The new tree learns to predict the current mistakes."],
        ["F<sub>m</sub>(x) = F<sub>m−1</sub>(x) + η · h<sub>m</sub>(x)", "Add a shrunk copy of it (η = learning rate)."],
        ["XGBoost: Ω = γT + ½ λ Σ w<sup>2</sup>", "Extra penalty on number of leaves T and leaf weights w to prevent overfitting."]
      ]
    },
    adaboost: {
      assume: [
        ["Weak learners beat random guessing", "Each stump must have error ε < 0.5."],
        ["Clean labels", "Mislabelled rows get ever-larger weights and can dominate."],
        ["Binary labels y ∈ {−1, +1}", "The classic formulation (multi-class versions such as SAMME exist)."],
        ["Simple base models", "Usually depth-1 trees (decision stumps)."]
      ],
      math: [
        ["w<sub>i</sub> = 1/n", "Start: every row equally important."],
        ["ε<sub>m</sub> = Σ w<sub>i</sub> · 1[y<sub>i</sub> ≠ h<sub>m</sub>(x<sub>i</sub>)]", "Weighted error of the new stump."],
        ["α<sub>m</sub> = ½ ln( (1 − ε<sub>m</sub>) / ε<sub>m</sub> )", "Say of the stump: accurate stumps get a bigger vote."],
        ["w<sub>i</sub> ← w<sub>i</sub> · e<sup>−α<sub>m</sub> y<sub>i</sub> h<sub>m</sub>(x<sub>i</sub>)</sup> , then normalise", "Misclassified rows get heavier, correct ones lighter."],
        ["H(x) = sign( Σ α<sub>m</sub> h<sub>m</sub>(x) )", "Final answer: weighted vote of all stumps."],
        ["Minimises exponential loss e<sup>−y F(x)</sup>", "Why it is so sensitive to outliers."]
      ]
    },
    catboost: {
      assume: [
        ["Categories carry signal", "Category values (city, brand…) relate to the target and can be encoded with target statistics."],
        ["Row order can be randomly permuted", "Ordered statistics use only \"earlier\" rows in a random order to avoid target leakage."],
        ["Symmetric trees generalise well", "Same split at every node of a level acts as a regulariser and makes prediction very fast."],
        ["Gradient boosting assumptions", "Differentiable loss, fairly clean labels."]
      ],
      math: [
        ["x̂<sub>i</sub> = ( Σ<sub>j&lt;i, x<sub>j</sub>=x<sub>i</sub></sub> y<sub>j</sub> + a·P ) / ( count<sub>j&lt;i, x<sub>j</sub>=x<sub>i</sub></sub> + a )", "Ordered target statistic: a category becomes the smoothed average target of earlier rows with the same category (P = prior, a = its weight)."],
        ["Ordered boosting", "The residual for row i is computed by a model that never saw row i → removes prediction shift."],
        ["Leaf index = Σ<sub>k</sub> 2<sup>k</sup> · 1[x<sub>f<sub>k</sub></sub> &gt; t<sub>k</sub>]", "Oblivious tree of depth d: d yes/no questions → one of 2<sup>d</sup> leaves."],
        ["F<sub>m</sub>(x) = F<sub>m−1</sub>(x) + η · h<sub>m</sub>(x)", "Same additive update as gradient boosting."]
      ]
    },
    knn: {
      assume: [
        ["Similar things are close", "Points near each other in feature space have similar labels (smoothness)."],
        ["Features on the same scale", "Otherwise the feature with the largest units dominates the distance."],
        ["Distance is meaningful", "A suitable metric exists (Euclidean, Manhattan, cosine…)."],
        ["Low-to-moderate dimensions", "In high dimensions all points look equally far (curse of dimensionality)."],
        ["Training data stays available", "It is a \"lazy\" learner: no training, all work happens at prediction time."]
      ],
      math: [
        ["d(x, x') = √( Σ<sub>j</sub> (x<sub>j</sub> − x'<sub>j</sub>)<sup>2</sup> )", "Euclidean distance (straight line)."],
        ["d(x, x') = Σ<sub>j</sub> |x<sub>j</sub> − x'<sub>j</sub>|", "Manhattan distance (city blocks)."],
        ["ŷ = mode{ y<sub>(1)</sub>, …, y<sub>(k)</sub> }", "Classification: majority vote of the k nearest neighbours."],
        ["ŷ = Σ (1/d<sub>i</sub>) y<sub>i</sub> / Σ (1/d<sub>i</sub>)", "Optional distance weighting: closer neighbours count more (regression average)."],
        ["z = (x − μ) / σ", "Standardisation applied before computing distances."]
      ]
    },
    nb: {
      assume: [
        ["Conditional independence (the \"naive\" part)", "Given the class, features do not influence each other. Rarely true, yet it often works."],
        ["A distribution per feature", "Gaussian (numbers), Multinomial (word counts) or Bernoulli (yes/no)."],
        ["Class priors are representative", "Class frequencies in training reflect the real world."],
        ["Unseen values are handled", "Smoothing prevents zero probabilities."]
      ],
      math: [
        ["P(C | x) = P(x | C) · P(C) / P(x)", "Bayes' theorem: update the prior with the evidence."],
        ["P(x | C) = Π<sub>j</sub> P(x<sub>j</sub> | C)", "Naive assumption: multiply each feature's probability."],
        ["ŷ = argmax<sub>C</sub> [ log P(C) + Σ<sub>j</sub> log P(x<sub>j</sub> | C) ]", "Use logs so tiny numbers are added instead of multiplied."],
        ["P(w | C) = (count(w, C) + 1) / (total words in C + V)", "Laplace smoothing (V = vocabulary size)."],
        ["P(x<sub>j</sub> | C) = <sup>1</sup>&frasl;<sub>√(2πσ<sup>2</sup>)</sub> e<sup>−(x<sub>j</sub> − μ)<sup>2</sup> / 2σ<sup>2</sup></sup>", "Gaussian Naive Bayes for numeric features."]
      ]
    },
    svm: {
      assume: [
        ["Classes are separable by a margin", "Possibly only after mapping into a higher dimension with a kernel."],
        ["Features are scaled", "Margins and kernels are distance-based."],
        ["Right kernel & C", "Linear, polynomial or RBF; C and γ tuned by cross-validation."],
        ["Moderate dataset size", "Training cost grows roughly O(n<sup>2</sup>)–O(n<sup>3</sup>)."]
      ],
      math: [
        ["w · x + b = 0", "The separating line / hyperplane."],
        ["Margin = 2 / ‖w‖", "Width of the street; maximising it = minimising ‖w‖."],
        ["min ½‖w‖<sup>2</sup> &nbsp; s.t. &nbsp; y<sub>i</sub>(w · x<sub>i</sub> + b) ≥ 1", "Hard margin: every point on the correct side of the street."],
        ["min ½‖w‖<sup>2</sup> + C Σ ξ<sub>i</sub>", "Soft margin: slack ξ allows some violations; C sets how costly they are."],
        ["Hinge loss = max(0, 1 − y · f(x))", "Equivalent loss view."],
        ["K(x, x') = exp(−γ ‖x − x'‖<sup>2</sup>)", "RBF kernel trick: similarity in an infinite-dimensional space without computing it."],
        ["f(x) = sign( Σ α<sub>i</sub> y<sub>i</sub> K(x<sub>i</sub>, x) + b )", "Only support vectors (α<sub>i</sub> &gt; 0) affect the prediction."]
      ]
    },
    kmeans: {
      assume: [
        ["Clusters are round (spherical)", "And of similar size and density."],
        ["k is known", "You pick it (elbow method, silhouette)."],
        ["Euclidean distance is meaningful", "Features scaled, mostly numeric."],
        ["Few outliers", "Means get dragged by extreme points."],
        ["Initialisation matters", "Use k-means++ and several restarts (n_init)."]
      ],
      math: [
        ["J = Σ<sub>k</sub> Σ<sub>x ∈ C<sub>k</sub></sub> ‖x − μ<sub>k</sub>‖<sup>2</sup>", "Objective: within-cluster sum of squares (inertia) – make clusters tight."],
        ["c<sub>i</sub> = argmin<sub>k</sub> ‖x<sub>i</sub> − μ<sub>k</sub>‖<sup>2</sup>", "Assignment step: each point joins its nearest centre."],
        ["μ<sub>k</sub> = <sup>1</sup>&frasl;<sub>|C<sub>k</sub>|</sub> Σ<sub>x ∈ C<sub>k</sub></sub> x", "Update step: move each centre to the mean of its points. Repeat until stable."],
        ["s = (b − a) / max(a, b)", "Silhouette: a = distance to own cluster, b = to nearest other cluster (closer to 1 = better)."]
      ]
    },
    dbscan: {
      assume: [
        ["Clusters are dense regions", "Separated by sparse areas; shape can be anything."],
        ["Similar density across clusters", "One ε / minPts must fit every cluster (HDBSCAN relaxes this)."],
        ["Meaningful, scaled distance", "Neighbourhoods depend on it."],
        ["Hierarchical clustering", "Assumes a nested structure; the linkage choice defines \"distance between clusters\"."]
      ],
      math: [
        ["N<sub>ε</sub>(p) = { q : d(p, q) ≤ ε }", "ε-neighbourhood of point p."],
        ["core if |N<sub>ε</sub>(p)| ≥ minPts", "Core point; border = near a core point; noise = neither."],
        ["Density-reachable: p → p<sub>1</sub> → … → q via core points", "Clusters = all points connected through chains of core points."],
        ["ε from the elbow of the sorted k-distance plot", "Common way to pick ε (k = minPts)."],
        ["Single: min d &nbsp; Complete: max d &nbsp; Ward: min ΔSSE", "Hierarchical linkage rules; cut the dendrogram to get clusters."]
      ]
    },
    pca: {
      assume: [
        ["Linear structure", "Useful directions are straight-line combinations of features."],
        ["Variance = information", "Directions with the most spread are the most important."],
        ["Features standardised", "Otherwise large-unit features dominate."],
        ["Components are orthogonal", "Each new axis is at a right angle to the previous ones."],
        ["Sensitive to outliers", "Extreme points inflate variance."]
      ],
      math: [
        ["z = (x − μ) / σ", "Standardise every feature."],
        ["Σ = <sup>1</sup>&frasl;<sub>n − 1</sub> X<sup>T</sup>X", "Covariance matrix: how features vary together."],
        ["Σ v = λ v", "Eigenvectors v = new directions (principal components); eigenvalues λ = variance along them."],
        ["Explained variance = λ<sub>k</sub> / Σ λ", "Keep enough components to reach e.g. 95%."],
        ["Z = X W<sub>k</sub>", "Project data onto the top-k eigenvectors."],
        ["X = U S V<sup>T</sup>", "In practice computed via SVD; columns of V are the components."]
      ]
    },
    iforest: {
      assume: [
        ["Anomalies are few and different", "So they are isolated with fewer random cuts."],
        ["Random axis-parallel cuts can separate them", "Works best when anomalies stand out in some features."],
        ["Contamination rate is roughly known", "Sets the score threshold."],
        ["Subsampling is enough", "Small samples (ψ ≈ 256) per tree reduce masking and swamping."]
      ],
      math: [
        ["h(x)", "Path length: number of cuts needed to isolate x in one tree."],
        ["c(n) = 2H(n − 1) − 2(n − 1)/n, &nbsp; H(i) ≈ ln(i) + 0.5772", "Average path length in a random tree – used to normalise."],
        ["s(x, n) = 2<sup>− E[h(x)] / c(n)</sup>", "Anomaly score averaged over all trees."],
        ["s → 1 anomaly &nbsp;&nbsp; s ≲ 0.5 normal", "How to read the score."],
        ["Typical: t = 100 trees, ψ = 256 samples", "Default settings from the original paper."]
      ]
    },
    hbos: {
      assume: [
        ["Features are independent", "Scores from each feature are simply added up."],
        ["Anomalies fall in rare bins", "Low-frequency values in at least one feature."],
        ["Good bin choice", "Too few bins hides anomalies, too many makes everything look rare."],
        ["Speed over interactions", "Linear time, but cannot detect anomalies that only appear in feature combinations."]
      ],
      math: [
        ["hist<sub>j</sub>(x<sub>j</sub>) = height of x<sub>j</sub>'s bin / max height", "Per-feature histogram, normalised so the tallest bin = 1."],
        ["HBOS(x) = Σ<sub>j</sub> log( 1 / hist<sub>j</sub>(x<sub>j</sub>) )", "Rarer bins → larger score; logs turn a product into a sum."],
        ["Bins k ≈ √n", "Common rule for static bin count."],
        ["Flag top contamination % of scores", "Threshold = percentile of HBOS scores."]
      ]
    },
    nn: {
      assume: [
        ["Lots of data", "Many parameters need many examples."],
        ["Differentiable model and loss", "Required for backpropagation."],
        ["Inputs scaled", "Normalised inputs keep gradients healthy."],
        ["Train and test are i.i.d.", "Same distribution in training and real use."],
        ["Architecture fits the data", "Dense for tables, CNN for images, Transformers for text."]
      ],
      math: [
        ["a = f(w · x + b)", "One neuron: weighted sum + bias, passed through an activation f."],
        ["ReLU(z) = max(0, z) &nbsp;&nbsp; σ(z) = 1/(1 + e<sup>−z</sup>)", "Common activations that add non-linearity."],
        ["a<sup>(l)</sup> = f( W<sup>(l)</sup> a<sup>(l−1)</sup> + b<sup>(l)</sup> )", "Forward pass layer by layer."],
        ["softmax(z)<sub>i</sub> = e<sup>z<sub>i</sub></sup> / Σ<sub>j</sub> e<sup>z<sub>j</sub></sup>", "Turns final scores into class probabilities."],
        ["L = −Σ y log ŷ", "Cross-entropy loss."],
        ["∂L/∂W = ∂L/∂a · ∂a/∂z · ∂z/∂W", "Backpropagation = the chain rule, applied backwards."],
        ["W ← W − η · ∂L/∂W", "Gradient descent update (Adam, SGD …)."]
      ]
    }
  };
  window.ALGO_MATH = M;

  var PATTERNS = [
    ["iforest", /isolation/i], ["hbos", /hbos|histogram/i],
    ["adaboost", /ada\s*boost/i], ["catboost", /cat\s*boost/i], ["boost", /gradient|xgboost|boost/i],
    ["elastic", /elastic/i], ["ridge", /ridge/i], ["lasso", /lasso/i],
    ["linreg", /linear\s*reg/i], ["logreg", /logistic/i],
    ["forest", /random\s*forest/i], ["tree", /decision\s*tree/i],
    ["knn", /nearest|\bknn\b|k-nn/i], ["nb", /bayes/i], ["svm", /\bsvm\b|support\s*vector/i],
    ["kmeans", /k\s*-?\s*means/i], ["dbscan", /dbscan|hierarch/i], ["pca", /\bpca\b|principal/i],
    ["nn", /neural/i]
  ];

  function norm(s) {
    var d = document.createElement("div");
    d.innerHTML = String(s || "");
    return (d.textContent || "").replace(/\s+/g, " ").trim().toLowerCase();
  }
  function byText(t) {
    if (!t) return null;
    for (var i = 0; i < PATTERNS.length; i++) if (PATTERNS[i][1].test(t)) return PATTERNS[i][0];
    return null;
  }

  function identify(fig) {
    var V = window.ALGO_VISUALS || {};
    var cap = fig.querySelector("figcaption");
    var capText = cap ? norm(cap.textContent) : "";
    if (capText) {
      for (var id in V) {
        if (!Object.prototype.hasOwnProperty.call(V, id) || !M[id]) continue;
        var v = V[id] || {};
        var c = norm(v.caption || v.cap || v.text || "");
        if (c && (c === capText || capText.indexOf(c) !== -1)) return id;
      }
    }
    var root = document.getElementById("algorithms") || document;
    var sels = ['[role="tab"][aria-selected="true"]', ".algo-tab.active", ".tab.active", "button.active", ".active"];
    for (var s = 0; s < sels.length; s++) {
      var els = root.querySelectorAll(sels[s]);
      for (var e = 0; e < els.length; e++) {
        var hit = byText(els[e].textContent);
        if (hit) return hit;
      }
    }
    var panel = fig.parentElement;
    if (panel) {
      var h = panel.querySelector("h1,h2,h3");
      var hit2 = h && byText(h.textContent);
      if (hit2) return hit2;
    }
    return null;
  }

  function build(id) {
    var d = M[id];
    var a = d.assume.map(function (x) {
      return "<li><strong>" + x[0] + "</strong><span>" + x[1] + "</span></li>";
    }).join("");
    var m = d.math.map(function (x, i) {
      return '<li><div class="am-formula"><span class="am-step">' + (i + 1) + "</span>" + x[0] +
        '</div><div class="am-explain">' + x[1] + "</div></li>";
    }).join("");
    var wrap = document.createElement("div");
    wrap.className = "algo-deep";
    wrap.setAttribute("data-algo", id);
    wrap.innerHTML =
      '<details class="am-box am-assume" open><summary>🧩 Backend assumptions <small>what the algorithm silently expects about your data</small></summary><ul>' + a + "</ul></details>" +
      '<details class="am-box am-math" open><summary>📐 Mathematics behind it <small>each formula explained in plain English</small></summary><ol>' + m + "</ol></details>";
    return wrap;
  }

  function scan() {
    var figs = document.querySelectorAll("figure.algo-visual");
    for (var i = 0; i < figs.length; i++) {
      var fig = figs[i];
      var panel = fig.parentElement;
      if (!panel) continue;
      var id = identify(fig);
      var existing = panel.querySelector(":scope > .algo-deep");
      if (existing && existing.getAttribute("data-algo") === id) continue;
      if (existing) existing.remove();
      if (!id || !M[id]) continue;
      try { panel.appendChild(build(id)); } catch (err) { /* keep the tab usable */ }
    }
  }

  var css =
    ".algo-deep{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px}" +
    "@media (max-width:900px){.algo-deep{grid-template-columns:1fr}}" +
    ".am-box{border:1px solid rgba(148,163,184,.3);border-radius:14px;padding:14px 16px;background:rgba(148,163,184,.07)}" +
    ".am-assume{border-top:3px solid #f5a524}.am-math{border-top:3px solid #6c8cff}" +
    ".am-box summary{cursor:pointer;font-weight:700;font-size:1.05em;list-style:none}" +
    ".am-box summary::-webkit-details-marker{display:none}" +
    ".am-box summary small{display:block;font-weight:400;opacity:.65;font-size:.78em;margin-top:2px}" +
    ".am-box ul,.am-box ol{margin:12px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}" +
    ".am-assume li{display:flex;flex-direction:column;gap:2px;padding-left:12px;border-left:2px solid rgba(245,165,36,.55)}" +
    ".am-assume li span{opacity:.8;font-size:.92em}" +
    ".am-formula{font-family:'Cambria Math','Times New Roman',serif;font-size:1.08em;background:rgba(108,140,255,.12);" +
    "border-radius:8px;padding:8px 10px;overflow-x:auto;white-space:nowrap;line-height:1.7}" +
    ".am-step{display:inline-block;min-width:20px;height:20px;line-height:20px;text-align:center;border-radius:50%;" +
    "background:#6c8cff;color:#fff;font-family:system-ui,sans-serif;font-size:.7em;margin-right:8px;vertical-align:middle}" +
    ".am-explain{font-size:.9em;opacity:.8;margin:4px 2px 0}";

  function init() {
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
    scan();
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; scan(); }, 0);
    }).observe(document.body, { childList: true, subtree: true });
    document.addEventListener("click", function () { setTimeout(scan, 0); }, true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
