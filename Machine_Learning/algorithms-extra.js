/* Adds t-SNE, UMAP, LightGBM, LDA and LOF tabs to the "Algorithms Explained" slide.
   Self-contained: injects its own tab buttons, panel, SVG diagrams and CSS.
   Must load after algorithms.js. */
(function () {
  function rng(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  function svg(inner) { return '<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg" role="img">' + inner + "</svg>"; }
  function dot(x, y, c, r) { return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (r || 3.5) + '" fill="' + c + '"/>'; }
  function txt(x, y, t, size, anchor, fill) { return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 11) + '" text-anchor="' + (anchor || "middle") + '" fill="' + (fill || "currentColor") + '">' + t + "</text>"; }
  function line(x1, y1, x2, y2, c, w, dash) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="' + (w || 1.5) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + "/>"; }
  var ARROW = '<defs><marker id="axArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#94a3b8"/></marker></defs>';
  function arrow(x1, y1, x2, y2) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#94a3b8" stroke-width="2" marker-end="url(#axArrow)"/>'; }
  var COLS = ["#6c8cff", "#f5a524", "#22c55e"];

  function vizTSNE() {
    var r = rng(7), h = ARROW, i, k;
    h += '<rect x="10" y="25" width="140" height="150" rx="10" fill="none" stroke="#94a3b8" stroke-dasharray="4 3"/>';
    for (i = 0; i < 45; i++) h += dot(20 + r() * 120, 35 + r() * 130, COLS[i % 3], 3);
    h += txt(80, 18, "High-dimensional data (mixed)", 10);
    h += arrow(158, 100, 200, 100) + txt(179, 90, "t-SNE", 10);
    var centers = [[245, 60], [320, 80], [270, 150]];
    for (k = 0; k < 3; k++) for (i = 0; i < 15; i++) h += dot(centers[k][0] + (r() - 0.5) * 34, centers[k][1] + (r() - 0.5) * 30, COLS[k], 3);
    h += txt(280, 18, "2-D map: similar points together", 10);
    h += txt(180, 195, "Keeps neighbours close; distances between clusters are not meaningful", 9, "middle", "#94a3b8");
    return svg(h);
  }

  function vizUMAP() {
    var r = rng(11), h = ARROW, pts = [], i, j;
    for (i = 0; i < 24; i++) { var g = i % 3; pts.push([30 + g * 40 + r() * 35, 40 + r() * 120, g]); }
    for (i = 0; i < pts.length; i++) {
      var d = pts.map(function (p, j2) { return [Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), j2]; }).sort(function (a, b) { return a[0] - b[0]; });
      for (j = 1; j <= 2; j++) { var q = pts[d[j][1]]; h += line(pts[i][0], pts[i][1], q[0], q[1], "#94a3b8", 0.8); }
    }
    pts.forEach(function (p) { h += dot(p[0], p[1], COLS[p[2]], 3.5); });
    h += txt(85, 18, "1. Build k-nearest-neighbour graph", 10);
    h += arrow(168, 100, 205, 100) + txt(186, 90, "UMAP", 10);
    var centers = [[235, 70], [285, 110], [330, 150]];
    for (var k = 0; k < 3; k++) for (i = 0; i < 12; i++) h += dot(centers[k][0] + (r() - 0.5) * 30, centers[k][1] + (r() - 0.5) * 28, COLS[k], 3);
    h += txt(285, 18, "2. Lay it out in 2-D", 10);
    h += txt(180, 195, "Preserves local neighbours AND more of the global layout; fast", 9, "middle", "#94a3b8");
    return svg(h);
  }

  function vizLGBM() {
    var h = "";
    function node(x, y, c) { return '<circle cx="' + x + '" cy="' + y + '" r="8" fill="' + c + '" stroke="currentColor" stroke-width="0.6"/>'; }
    h += txt(90, 16, "Level-wise (XGBoost default)", 10);
    var L = [[90, 35], [55, 75], [125, 75], [35, 115], [75, 115], [105, 115], [145, 115]];
    [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]].forEach(function (e) { h += line(L[e[0]][0], L[e[0]][1], L[e[1]][0], L[e[1]][1], "#94a3b8", 1.2); });
    L.forEach(function (p) { h += node(p[0], p[1], "#6c8cff"); });
    h += txt(270, 16, "Leaf-wise (LightGBM)", 10);
    var R = [[270, 35], [235, 70], [305, 70], [280, 105], [330, 105], [260, 140], [300, 140]];
    [[0, 1], [0, 2], [2, 3], [2, 4], [3, 5], [3, 6]].forEach(function (e) { h += line(R[e[0]][0], R[e[0]][1], R[e[1]][0], R[e[1]][1], "#94a3b8", 1.2); });
    R.forEach(function (p, i) { h += node(p[0], p[1], i === 3 || i === 2 ? "#22c55e" : "#f5a524"); });
    h += txt(300, 165, "grows the leaf with biggest loss drop", 9, "middle", "#22c55e");
    var bars = [12, 22, 34, 26, 16, 9];
    bars.forEach(function (b, i) { h += '<rect x="' + (30 + i * 16) + '" y="' + (185 - b) + '" width="12" height="' + b + '" fill="#8b5cf6" opacity=".8"/>'; });
    h += txt(150, 182, "Histogram bins → fast split search", 9, "start", "#94a3b8");
    return svg(h);
  }

  function vizLDA() {
    var r = rng(5), h = ARROW, i;
    for (i = 0; i < 18; i++) { var t = r() * 2 - 1; h += dot(70 + t * 40 + (r() - 0.5) * 16, 120 - t * 25 + (r() - 0.5) * 20 - 25, "#6c8cff", 3); }
    for (i = 0; i < 18; i++) { var u = r() * 2 - 1; h += dot(110 + u * 40 + (r() - 0.5) * 16, 120 - u * 25 + (r() - 0.5) * 20 + 25, "#f5a524", 3); }
    h += line(40, 185, 175, 20, "#22c55e", 2, "5 4");
    h += txt(150, 20, "best projection", 9, "middle", "#22c55e");
    h += txt(95, 196, "2 classes in 2-D", 9);
    h += arrow(185, 100, 215, 100);
    h += line(225, 150, 350, 150, "currentColor", 1);
    function bell(cx, col) {
      var d = "M" + (cx - 40) + ",150";
      for (var x = -40; x <= 40; x += 4) d += " L" + (cx + x) + "," + (150 - 70 * Math.exp(-(x * x) / 200)).toFixed(1);
      return '<path d="' + d + '" fill="' + col + '" fill-opacity=".25" stroke="' + col + '" stroke-width="1.5"/>';
    }
    h += bell(260, "#6c8cff") + bell(318, "#f5a524");
    h += txt(289, 170, "Projected: means far apart,", 9) + txt(289, 182, "spread within each class small", 9);
    return svg(h);
  }

  function vizLOF() {
    var r = rng(3), h = "", i;
    for (i = 0; i < 26; i++) h += dot(90 + (r() - 0.5) * 60, 100 + (r() - 0.5) * 60, "#6c8cff", 3);
    for (i = 0; i < 10; i++) h += dot(250 + (r() - 0.5) * 90, 100 + (r() - 0.5) * 90, "#22c55e", 3);
    h += '<circle cx="90" cy="100" r="14" fill="none" stroke="#6c8cff" stroke-dasharray="3 2"/>';
    h += '<circle cx="165" cy="45" r="5" fill="#ef4444"/>';
    h += '<circle cx="165" cy="45" r="38" fill="none" stroke="#ef4444" stroke-dasharray="3 2"/>';
    h += txt(165, 100, "LOF ≫ 1", 10, "middle", "#ef4444");
    h += txt(90, 160, "dense cluster: LOF ≈ 1", 9);
    h += txt(250, 170, "sparse cluster: still LOF ≈ 1", 9);
    h += txt(180, 195, "Compares each point's local density with its neighbours' density", 9, "middle", "#94a3b8");
    return svg(h);
  }

  var EXTRA = [
    {
      id: "tsne", icon: "🗺️", after: /pca|principal/i, name: "t-SNE", family: "Unsupervised · Dimensionality reduction", viz: vizTSNE,
      caption: "t-SNE squeezes many-dimensional data into a 2-D picture where similar points form visible groups.",
      idea: "t-SNE (t-distributed Stochastic Neighbor Embedding) turns data with many columns into a 2-D or 3-D scatter plot so you can SEE groups. It only cares about keeping close neighbours close.",
      analogy: "Seating guests at a wedding: friends who know each other sit at the same table. The tables' positions in the hall don't mean much — only who sits together.",
      how: ["Measure how similar every pair of points is in the original space (turned into probabilities).", "Place points randomly on a 2-D map.", "Measure similarity on the map using a heavy-tailed t-distribution.", "Move points step by step (gradient descent) until map similarities match original similarities."],
      when: ["Visualising high-dimensional data (embeddings, images, gene expression).", "Checking whether classes or clusters look separable.", "Exploring data — not as model input."],
      example: "Plotting 60,000 handwritten digit images (784 pixels each) in 2-D: the 10 digits appear as 10 islands.",
      pros: ["Beautiful, clear cluster visualisations", "Captures non-linear structure", "Works well on embeddings"],
      cons: ["Slow on large data (O(n²), Barnes-Hut ≈ O(n log n))", "Cluster sizes and distances between clusters are not meaningful", "Results change with perplexity and random seed", "Can't transform new points (no .transform)"],
      params: "perplexity (≈ number of neighbours, 5–50), learning_rate, n_iter, init='pca', random_state",
      code: "from sklearn.manifold import TSNE\nX2 = TSNE(n_components=2, perplexity=30, init='pca',\n          random_state=42).fit_transform(X_scaled)\nplt.scatter(X2[:,0], X2[:,1], c=y)",
      interview: "Q: Can you use the distance between two t-SNE clusters to say how different they are? — No. t-SNE preserves local neighbourhoods only; global distances and cluster sizes are distorted.",
      assumptions: ["Similarity is meaningful through (usually Euclidean) distance — scale features first.", "Local neighbourhood structure is what matters, not global geometry.", "Perplexity matches the true neighbourhood size; very small data or wrong perplexity gives fake clusters.", "Data fits in memory; pairwise similarities are computed."],
      math: [
        ["High-dim similarity", "p(j|i) = exp(−‖xᵢ − xⱼ‖² / 2σᵢ²) / Σₖ≠ᵢ exp(−‖xᵢ − xₖ‖² / 2σᵢ²),   pᵢⱼ = (p(j|i) + p(i|j)) / 2n", "Each point spreads a Gaussian around itself; σᵢ is chosen so the 'effective number of neighbours' equals the perplexity."],
        ["Low-dim similarity", "qᵢⱼ = (1 + ‖yᵢ − yⱼ‖²)⁻¹ / Σₖ≠ₗ (1 + ‖yₖ − yₗ‖²)⁻¹", "A Student-t (heavy tails) lets dissimilar points sit far apart, avoiding the 'crowding problem'."],
        ["Objective", "KL(P ‖ Q) = Σᵢ Σⱼ pᵢⱼ log(pᵢⱼ / qᵢⱼ)", "Minimised by gradient descent; heavily penalises putting real neighbours far apart."]
      ]
    },
    {
      id: "umap", icon: "🕸️", after: /t-sne/i, name: "UMAP", family: "Unsupervised · Dimensionality reduction", viz: vizUMAP,
      caption: "UMAP builds a neighbour graph, then lays it out in 2-D keeping both local and more global structure.",
      idea: "UMAP (Uniform Manifold Approximation and Projection) also squeezes many columns into a few, like t-SNE, but it is faster, keeps more of the big-picture layout, and can transform new data.",
      analogy: "Drawing a subway map: first note which stations are directly connected, then draw a simple map that keeps those connections and roughly where lines go.",
      how: ["For every point find its k nearest neighbours and build a weighted graph.", "Make the graph symmetric (fuzzy union of neighbourhoods).", "Create a low-dimensional layout with a similar graph.", "Optimise the layout so connected points attract and unconnected points repel."],
      when: ["Visualising large datasets quickly (millions of rows).", "Reducing dimensions before clustering (e.g. UMAP + HDBSCAN).", "Embeddings from text/images; when you need .transform() for new data."],
      example: "Reducing 384-dim sentence embeddings of customer reviews to 10 dims, then clustering to find complaint topics.",
      pros: ["Much faster than t-SNE, scales to large data", "Preserves more global structure", "Can transform new points; any output dimension", "Supports supervised/semi-supervised mode"],
      cons: ["Still stochastic; results vary by seed and parameters", "Distances/densities in the map can mislead", "Extra library (umap-learn)", "Less interpretable than PCA"],
      params: "n_neighbors (local vs global, 5–50), min_dist (how tightly points pack, 0–0.99), n_components, metric",
      code: "import umap\nreducer = umap.UMAP(n_neighbors=15, min_dist=0.1,\n                    n_components=2, random_state=42)\nX2 = reducer.fit_transform(X_scaled)\nX_new2 = reducer.transform(X_new)",
      interview: "Q: UMAP vs t-SNE vs PCA? — PCA: linear, fast, interpretable. t-SNE: best local visualisation, slow, no transform. UMAP: non-linear, fast, keeps more global structure and can transform new data.",
      assumptions: ["Data lies on a lower-dimensional manifold.", "Data is (roughly) uniformly distributed on that manifold — distances are rescaled locally to make this true.", "The manifold is locally connected.", "Chosen distance metric is meaningful (scale features)."],
      math: [
        ["Local fuzzy graph", "wᵢⱼ = exp(−(d(xᵢ, xⱼ) − ρᵢ) / σᵢ)", "ρᵢ = distance to the nearest neighbour; σᵢ normalises so each point has about n_neighbors 'effective' neighbours."],
        ["Symmetrise", "wᵢⱼ(sym) = wᵢⱼ + wⱼᵢ − wᵢⱼ·wⱼᵢ", "Fuzzy set union: an edge exists if either point considers the other a neighbour."],
        ["Low-dim similarity", "vᵢⱼ = 1 / (1 + a‖yᵢ − yⱼ‖^(2b))", "a, b are fitted from min_dist."],
        ["Objective (cross-entropy)", "CE = Σ wᵢⱼ log(wᵢⱼ / vᵢⱼ) + (1 − wᵢⱼ) log((1 − wᵢⱼ) / (1 − vᵢⱼ))", "First term pulls neighbours together; second pushes non-neighbours apart (via negative sampling)."]
      ]
    },
    {
      id: "lightgbm", icon: "⚡", after: /catboost/i, name: "LightGBM", family: "Supervised · Classification & Regression", viz: vizLGBM,
      caption: "LightGBM grows trees leaf-wise and uses histogram bins, making gradient boosting very fast.",
      idea: "LightGBM is a gradient boosting library from Microsoft. Like XGBoost it builds many small trees, each fixing the previous errors — but it is engineered to be much faster and lighter on memory for big tabular data.",
      analogy: "A team of editors each correcting the previous draft — and the smartest editor always fixes the paragraph with the most mistakes first (leaf-wise growth).",
      how: ["Bucket each feature into histogram bins (e.g. 255) for fast split finding.", "Start with a simple prediction (e.g. the mean).", "Compute gradients (errors) for every row.", "Grow a tree leaf-wise: always split the leaf that reduces loss the most.", "Add the tree × learning_rate; repeat. GOSS keeps rows with large errors, EFB bundles sparse features."],
      when: ["Large tabular datasets (100k – 100M rows).", "Kaggle-style accuracy on structured data.", "Need fast training/inference; categorical features (native support)."],
      example: "Fraud detection on 50M transactions or click-through-rate prediction for ads.",
      pros: ["Very fast training, low memory", "Top accuracy on tabular data", "Handles missing values and categoricals natively", "Supports ranking, monotonic constraints, GPU"],
      cons: ["Leaf-wise trees can overfit small datasets", "Many hyperparameters", "Less interpretable (use SHAP)", "Sensitive to num_leaves/min_data_in_leaf"],
      params: "num_leaves, max_depth, learning_rate, n_estimators (+ early stopping), min_data_in_leaf, feature_fraction, bagging_fraction, lambda_l1/l2",
      code: "import lightgbm as lgb\nmodel = lgb.LGBMClassifier(n_estimators=2000, learning_rate=0.05,\n                           num_leaves=31, subsample=0.8, colsample_bytree=0.8)\nmodel.fit(X_tr, y_tr, eval_set=[(X_val, y_val)],\n          callbacks=[lgb.early_stopping(100)])",
      interview: "Q: Why is LightGBM faster than classic GBM? — Histogram-based splits, leaf-wise growth, GOSS (sample rows with small gradients) and EFB (bundle exclusive sparse features).",
      assumptions: ["No linearity or distribution assumptions; trees handle non-linearity and interactions.", "Rows are independent (use time-based splits for temporal data).", "Train and future data come from the same distribution.", "Enough data — leaf-wise growth overfits small datasets unless constrained."],
      math: [
        ["Additive model", "F_m(x) = F_{m−1}(x) + η · h_m(x)", "Each new tree h_m is scaled by the learning rate η and added to the ensemble."],
        ["Gradients", "gᵢ = ∂L(yᵢ, F(xᵢ))/∂F,   hᵢ = ∂²L/∂F²", "First and second derivatives of the loss tell each tree which direction to correct."],
        ["Split gain", "Gain = ½ [G_L²/(H_L+λ) + G_R²/(H_R+λ) − (G_L+G_R)²/(H_L+H_R+λ)] − γ", "G, H = sums of gradients/hessians in left/right child; λ, γ regularise. The leaf with the highest gain is split next."],
        ["Leaf value", "w* = −G / (H + λ)", "Optimal output value of each leaf."]
      ]
    },
    {
      id: "lda", icon: "📐", after: /naive|bayes/i, name: "Linear Discriminant Analysis (LDA)", family: "Supervised · Classification & Dimensionality reduction", viz: vizLDA,
      caption: "LDA finds the direction that pushes class means apart while keeping each class tight.",
      idea: "LDA is both a classifier and a dimensionality-reduction method. It finds the line (or few axes) that best separates known classes, then classifies a point by which class it is closest to on that line.",
      analogy: "Finding the best camera angle for a team photo so the two teams look clearly separated, not overlapping.",
      how: ["Compute the mean of each class and the overall mean.", "Measure spread within classes (S_W) and between classes (S_B).", "Find directions w that maximise between-class spread ÷ within-class spread.", "Project data onto those directions (at most classes − 1 axes).", "Classify with Bayes' rule assuming Gaussian classes with shared covariance."],
      when: ["Small/medium datasets with roughly Gaussian features.", "Need a fast, interpretable linear classifier.", "Supervised dimensionality reduction before another model or for 2-D class plots."],
      example: "Classifying wine cultivars from 13 chemical measurements and plotting them in 2 LDA dimensions.",
      pros: ["Simple, fast, closed-form solution", "Works well with small samples", "Gives supervised dimension reduction", "Probabilistic outputs"],
      cons: ["Assumes Gaussian classes with equal covariance", "Linear boundaries only (use QDA for curved ones)", "Sensitive to outliers", "Max components = classes − 1"],
      params: "solver ('svd', 'lsqr', 'eigen'), shrinkage (for many features / few rows), n_components, priors",
      code: "from sklearn.discriminant_analysis import LinearDiscriminantAnalysis\nlda = LinearDiscriminantAnalysis(n_components=2)\nX2 = lda.fit_transform(X_train, y_train)\nprint(lda.score(X_test, y_test))",
      interview: "Q: PCA vs LDA? — PCA is unsupervised and keeps directions of maximum variance; LDA is supervised and keeps directions that best separate the classes.",
      assumptions: ["Each class is multivariate normal (Gaussian).", "All classes share the same covariance matrix (homoscedasticity).", "Features are not perfectly collinear (S_W must be invertible; use shrinkage otherwise).", "Observations are independent; outliers are limited."],
      math: [
        ["Scatter matrices", "S_W = Σ_k Σ_{x∈k} (x − μ_k)(x − μ_k)ᵀ,   S_B = Σ_k n_k (μ_k − μ)(μ_k − μ)ᵀ", "Within-class spread vs between-class spread."],
        ["Fisher criterion", "J(w) = (wᵀ S_B w) / (wᵀ S_W w)", "Maximised by the top eigenvectors of S_W⁻¹ S_B; for two classes w ∝ S_W⁻¹(μ₁ − μ₂)."],
        ["Discriminant function", "δ_k(x) = xᵀ Σ⁻¹ μ_k − ½ μ_kᵀ Σ⁻¹ μ_k + log π_k", "Predict the class with the largest δ_k; π_k is the class prior."]
      ]
    },
    {
      id: "lof", icon: "🏝️", after: /hbos/i, name: "Local Outlier Factor (LOF)", family: "Unsupervised · Anomaly detection", viz: vizLOF,
      caption: "LOF flags points whose neighbourhood is much less dense than their neighbours' neighbourhoods.",
      idea: "LOF finds anomalies by comparing how crowded a point's neighbourhood is with how crowded its neighbours' neighbourhoods are. A point in a much emptier area than its neighbours is an outlier.",
      analogy: "A house standing alone just outside a busy village looks unusual — but a house in a quiet countryside area with other spread-out farms does not.",
      how: ["Find each point's k nearest neighbours.", "Compute its local reachability density (how close its neighbours are).", "Compare that density with the densities of its neighbours.", "LOF ≈ 1 → normal; LOF clearly > 1 → outlier."],
      when: ["Anomalies relative to local density (clusters with different densities).", "Small/medium datasets with numeric features.", "Fraud, sensor faults, network intrusion exploration."],
      example: "Detecting unusual credit-card transactions where normal behaviour varies a lot between customer groups.",
      pros: ["Finds local outliers that global methods miss", "Handles clusters of different density", "Score is interpretable (ratio of densities)", "No labels needed"],
      cons: ["Slow on large data (neighbour search)", "Sensitive to k (n_neighbors) and scaling", "Struggles in very high dimensions", "Novelty mode needed to score new data"],
      params: "n_neighbors (typically 20), contamination, metric, novelty=True (to score new data)",
      code: "from sklearn.neighbors import LocalOutlierFactor\nlof = LocalOutlierFactor(n_neighbors=20, contamination=0.01)\nlabels = lof.fit_predict(X_scaled)      # -1 = outlier\nscores = -lof.negative_outlier_factor_",
      interview: "Q: Isolation Forest vs LOF? — Isolation Forest isolates points with random splits (global, fast, scales well). LOF compares local densities (better for clusters of varying density, slower).",
      assumptions: ["Normal points live in dense neighbourhoods; outliers live in sparser ones.", "Distances are meaningful — scale features; curse of dimensionality hurts.", "k is large enough to estimate density but smaller than the smallest real cluster.", "Outliers are a small fraction of the data."],
      math: [
        ["k-distance & reachability", "reach-dist_k(A, B) = max(k-distance(B), d(A, B))", "Smooths distances: very close points use B's k-distance instead."],
        ["Local reachability density", "lrd_k(A) = 1 / ( Σ_{B∈N_k(A)} reach-dist_k(A, B) / |N_k(A)| )", "Inverse of the average reachability distance — high = dense."],
        ["LOF score", "LOF_k(A) = ( Σ_{B∈N_k(A)} lrd_k(B) / lrd_k(A) ) / |N_k(A)|", "≈ 1 similar density to neighbours; > 1 lower density → outlier."]
      ]
    }
  ];

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function ul(a) { return "<ul>" + a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>"; }

  function panelHTML(a) {
    var v = "";
    try { v = a.viz(); } catch (e) { v = ""; }
    return '<div class="ax-head"><h3>' + a.icon + " " + esc(a.name) + '</h3><span class="ax-fam">' + esc(a.family) + "</span></div>" +
      '<p class="ax-idea">' + esc(a.idea) + "</p>" +
      (v ? '<figure class="ax-visual">' + v + "<figcaption>" + esc(a.caption) + "</figcaption></figure>" : "") +
      '<div class="ax-analogy">💡 <b>Analogy:</b> ' + esc(a.analogy) + "</div>" +
      '<div class="ax-grid">' +
      '<div class="ax-box"><h4>⚙️ How it works</h4><ol>' + a.how.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ol></div>" +
      '<div class="ax-box"><h4>🎯 When to use</h4>' + ul(a.when) + "</div>" +
      '<div class="ax-box"><h4>🌍 Real example</h4><p>' + esc(a.example) + "</p><h4>🎛️ Key parameters</h4><p>" + esc(a.params) + "</p></div>" +
      '<div class="ax-box ax-good"><h4>✅ Strengths</h4>' + ul(a.pros) + "</div>" +
      '<div class="ax-box ax-bad"><h4>⚠️ Weaknesses</h4>' + ul(a.cons) + "</div>" +
      '<div class="ax-box"><h4>🐍 Python</h4><pre><code>' + esc(a.code) + "</code></pre></div>" +
      "</div>" +
      '<details class="ax-deep" open><summary>🧱 Backend assumptions</summary>' + ul(a.assumptions) + "</details>" +
      '<details class="ax-deep" open><summary>📐 Mathematics behind it</summary>' + a.math.map(function (m) {
        return '<div class="ax-math"><b>' + esc(m[0]) + '</b><div class="ax-formula">' + esc(m[1]) + "</div><p>" + esc(m[2]) + "</p></div>";
      }).join("") + "</details>" +
      '<div class="ax-interview">🎤 <b>Interview:</b> ' + esc(a.interview) + "</div>";
  }

  function css() {
    if (document.getElementById("ax-style")) return;
    var s = document.createElement("style");
    s.id = "ax-style";
    s.textContent = [
      ".ax-panel{padding:.5rem 0 1.5rem}",
      ".ax-head{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem;margin-bottom:.4rem}",
      ".ax-head h3{margin:0;font-size:1.35rem}",
      ".ax-fam{font-size:.78rem;padding:.2rem .6rem;border-radius:999px;background:rgba(108,140,255,.15);border:1px solid rgba(108,140,255,.45)}",
      ".ax-idea{line-height:1.55;margin:.3rem 0 .8rem}",
      ".ax-visual{margin:0 0 .9rem;padding:.6rem;border:1px solid rgba(148,163,184,.25);border-radius:12px;background:rgba(148,163,184,.05);text-align:center}",
      ".ax-visual svg{width:100%;max-width:560px;height:auto}",
      ".ax-visual figcaption{font-size:.85rem;opacity:.85;margin-top:.3rem}",
      ".ax-analogy,.ax-interview{padding:.6rem .9rem;border-radius:10px;margin:.6rem 0;line-height:1.5}",
      ".ax-analogy{border-left:4px solid #f5a524;background:rgba(245,165,36,.08)}",
      ".ax-interview{border-left:4px solid #8b5cf6;background:rgba(139,92,246,.1)}",
      ".ax-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:.8rem;margin:.6rem 0}",
      ".ax-box{border:1px solid rgba(148,163,184,.25);background:rgba(148,163,184,.06);border-radius:12px;padding:.7rem .9rem;min-width:0}",
      ".ax-box h4{margin:.1rem 0 .4rem;font-size:.95rem}",
      ".ax-box ul,.ax-box ol{margin:0;padding-left:1.1rem}",
      ".ax-box li{margin:.2rem 0;line-height:1.45;font-size:.9rem}",
      ".ax-box p{margin:.2rem 0 .5rem;line-height:1.45;font-size:.9rem}",
      ".ax-good{border-color:rgba(34,197,94,.45)}",
      ".ax-bad{border-color:rgba(239,68,68,.45)}",
      ".ax-box pre{margin:0;overflow-x:auto;font-size:.78rem;padding:.5rem;border-radius:8px;background:rgba(0,0,0,.25)}",
      ".ax-deep{border:1px solid rgba(148,163,184,.25);border-radius:12px;padding:.6rem .9rem;margin:.6rem 0}",
      ".ax-deep summary{cursor:pointer;font-weight:700}",
      ".ax-deep ul{margin:.5rem 0 0;padding-left:1.1rem}",
      ".ax-deep li{margin:.25rem 0;line-height:1.45}",
      ".ax-math{margin:.6rem 0}",
      ".ax-formula{font-family:Consolas,'Courier New',monospace;padding:.45rem .7rem;margin:.3rem 0;border-radius:8px;background:rgba(108,140,255,.12);overflow-x:auto;white-space:pre-wrap}",
      ".ax-math p{margin:.2rem 0;opacity:.9;font-size:.9rem}"
    ].join("\n");
    document.head.appendChild(s);
  }

  var slide, bar, ownPanel, origPanel, activeClass = "active";

  function findSlide() {
    return document.getElementById("algorithms") ||
      Array.prototype.slice.call(document.querySelectorAll("section.slide")).filter(function (s) {
        return /algorithms?\s+explained/i.test(s.getAttribute("data-title") || "");
      })[0];
  }

  function findBar() {
    var best = null, bestN = 0;
    Array.prototype.slice.call(slide.querySelectorAll("*")).forEach(function (el) {
      var n = 0;
      Array.prototype.forEach.call(el.children, function (c) {
        if (/^(button|a)$/i.test(c.tagName) && /regression|k-means|kmeans|random forest|svm|naive|forest|boost/i.test(c.textContent)) n++;
      });
      if (n > bestN) { bestN = n; best = el; }
    });
    return bestN >= 3 ? best : null;
  }

  function sampleBtn() {
    var btns = Array.prototype.filter.call(bar.children, function (c) { return /^(button|a)$/i.test(c.tagName) && !c.hasAttribute("data-ax"); });
    return btns;
  }

  function detectActiveClass(btns) {
    var counts = {};
    btns.forEach(function (b) { Array.prototype.forEach.call(b.classList, function (c) { counts[c] = (counts[c] || 0) + 1; }); });
    var rare = Object.keys(counts).filter(function (c) { return counts[c] === 1 && /active|selected|current|on/i.test(c); });
    return rare[0] || "active";
  }

  function findOrigPanel() {
    var fig = slide.querySelector("figure.algo-visual");
    var n = fig;
    while (n && n.parentElement && n.parentElement !== slide && !n.parentElement.contains(bar)) n = n.parentElement;
    if (n && n.parentElement && n !== slide) return n;
    var after = bar.nextElementSibling;
    return after && !after.classList.contains("ax-panel") ? after : null;
  }

  function showOwn(a, btn) {
    origPanel = findOrigPanel() || origPanel;
    sampleBtn().forEach(function (b) { b.classList.remove(activeClass); b.setAttribute("aria-selected", "false"); });
    Array.prototype.forEach.call(bar.querySelectorAll("[data-ax]"), function (b) { b.classList.remove(activeClass); b.setAttribute("aria-selected", "false"); });
    btn.classList.add(activeClass);
    btn.setAttribute("aria-selected", "true");
    if (!ownPanel || !ownPanel.isConnected) {
      ownPanel = document.createElement("div");
      ownPanel.className = "ax-panel";
      if (origPanel && origPanel.parentNode) origPanel.parentNode.insertBefore(ownPanel, origPanel.nextSibling);
      else slide.appendChild(ownPanel);
    }
    if (origPanel) origPanel.style.display = "none";
    ownPanel.style.display = "";
    ownPanel.innerHTML = panelHTML(a);
  }

  function hideOwn() {
    if (ownPanel) ownPanel.style.display = "none";
    if (origPanel) origPanel.style.display = "";
    Array.prototype.forEach.call(bar.querySelectorAll("[data-ax]"), function (b) { b.classList.remove(activeClass); b.setAttribute("aria-selected", "false"); });
  }

  function currentFilter() {
    var f = Array.prototype.slice.call(slide.querySelectorAll("button")).filter(function (b) {
      return !b.hasAttribute("data-ax") && b.parentElement !== bar && /^\W*(all|supervised|unsupervised)\b/i.test(b.textContent.trim()) &&
        (b.classList.contains(activeClass) || b.classList.contains("active") || b.getAttribute("aria-pressed") === "true" || b.getAttribute("aria-selected") === "true");
    })[0];
    if (!f) return "all";
    var t = f.textContent.toLowerCase();
    return /unsupervised/.test(t) ? "Unsupervised" : /supervised/.test(t) ? "Supervised" : "all";
  }

  function applyFilter() {
    var f = currentFilter();
    Array.prototype.forEach.call(bar.querySelectorAll("[data-ax]"), function (b) {
      var fam = b.getAttribute("data-family").split(" · ")[0];
      b.style.display = f === "all" || fam === f ? "" : "none";
    });
  }

  var EMOJI_ONLY = /^[\s\u200d\ufe0f\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}]+$/u;
  function setLabel(b, a) {
    var els = Array.prototype.slice.call(b.querySelectorAll("*")).filter(function (e) { return !e.children.length; });
    var iconEl = els.filter(function (e) { return e.textContent.trim() && EMOJI_ONLY.test(e.textContent.trim()); })[0];
    var nameEl = els.filter(function (e) { return e !== iconEl && e.textContent.trim() && !EMOJI_ONLY.test(e.textContent.trim()); })[0];
    if (iconEl && nameEl) {
      iconEl.textContent = a.icon;
      nameEl.textContent = a.name;
      Array.prototype.forEach.call(b.childNodes, function (n) { if (n.nodeType === 3 && n.textContent.trim()) n.textContent = ""; });
    } else {
      b.textContent = a.icon + " " + a.name;
    }
  }

  function injectButtons() {
    if (!bar || !bar.isConnected) bar = findBar();
    if (!bar || bar.querySelector("[data-ax]")) return;
    var btns = sampleBtn();
    if (!btns.length) return;
    activeClass = detectActiveClass(btns);
    var tmpl = btns[0];
    EXTRA.forEach(function (a) {
      var b = tmpl.cloneNode(true);
      Array.prototype.slice.call(b.attributes).forEach(function (at) {
        if (at.name === "id" || at.name === "href" || at.name === "onclick" || /^(data-|aria-controls)/.test(at.name)) b.removeAttribute(at.name);
      });
      b.classList.remove(activeClass);
      b.setAttribute("data-ax", a.id);
      b.setAttribute("data-family", a.family);
      b.setAttribute("role", tmpl.getAttribute("role") || "tab");
      setLabel(b, a);
      b.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); showOwn(a, b); });
      var ref = sampleBtn().concat(Array.prototype.slice.call(bar.querySelectorAll("[data-ax]"))).filter(function (x) { return a.after.test(x.textContent); }).pop();
      if (ref && ref.parentNode === bar) bar.insertBefore(b, ref.nextSibling);
      else bar.appendChild(b);
    });
    applyFilter();
  }

  function init() {
    slide = findSlide();
    if (!slide) return;
    bar = findBar();
    if (!bar) return;
    css();
    injectButtons();
    slide.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("button, a") : null;
      if (!b || b.hasAttribute("data-ax")) return;
      if (b.parentElement === bar) hideOwn();
      setTimeout(function () { injectButtons(); applyFilter(); }, 0);
    });
    new MutationObserver(function () {
      if (!bar || !bar.isConnected || !bar.querySelector("[data-ax]")) { bar = null; injectButtons(); }
    }).observe(slide, { childList: true, subtree: true });
  }

  if (document.querySelector("section.slide")) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
