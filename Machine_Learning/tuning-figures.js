/* SVG figures for the "Hyperparameter Tuning" chapter. Each function returns an inline <svg> string.
   Text uses currentColor so the figures follow the light / dark theme. */
(function () {
  "use strict";
  var F = (window.HT_FIG = window.HT_FIG || {});
  var C = { hp: "#f59e0b", algo: "#7c5cff", par: "#34d399", data: "#22d3ee", score: "#f472b6", grey: "#94a3b8", red: "#f87171" };

  function svg(w, h, label, inner) {
    return '<svg class="ht-svg" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + label + '">' + inner + "</svg>";
  }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function text(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || "middle") + '"' +
      (o.b ? ' font-weight="700"' : "") + (o.s ? ' font-size="' + o.s + '"' : "") +
      (o.c ? ' fill="' + o.c + '"' : "") + (o.i ? ' font-style="italic"' : "") + ">" + esc(s) + "</text>";
  }
  function lines(x, y, arr, o) {
    o = o || {};
    var gap = o.gap || 15;
    return arr.map(function (s, i) { return text(x, y + i * gap, s, i === 0 && o.firstBold ? { a: o.a, b: true, s: o.s, c: o.c } : { a: o.a, s: o.s, c: o.c }); }).join("");
  }
  function box(x, y, w, h, color, o) {
    o = o || {};
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (o.r || 10) + '" fill="' + color + '" fill-opacity="' + (o.fo || 0.16) + '" stroke="' + color + '" stroke-width="' + (o.sw || 1.6) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + "/>";
  }
  function line(x1, y1, x2, y2, color, o) {
    o = o || {};
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (color || C.grey) + '" stroke-width="' + (o.w || 1.5) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + "/>";
  }
  function head(x, y, ang, color) {
    var a = 9, b = 0.45;
    var p1 = [x - a * Math.cos(ang - b), y - a * Math.sin(ang - b)];
    var p2 = [x - a * Math.cos(ang + b), y - a * Math.sin(ang + b)];
    return '<polygon points="' + x + "," + y + " " + p1[0].toFixed(1) + "," + p1[1].toFixed(1) + " " + p2[0].toFixed(1) + "," + p2[1].toFixed(1) + '" fill="' + color + '"/>';
  }
  // polyline with an arrow head on the last segment
  function arrow(pts, color, o) {
    o = o || {};
    color = color || C.grey;
    var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0] + "," + p[1]; }).join(" ");
    var n = pts.length, ang = Math.atan2(pts[n - 1][1] - pts[n - 2][1], pts[n - 1][0] - pts[n - 2][0]);
    return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + "/>" + head(pts[n - 1][0], pts[n - 1][1], ang, color);
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* 1 - parameters vs hyperparameters */
  F.paramsVsHyper = function () {
    var s = "";
    s += box(20, 42, 210, 86, C.hp) + lines(125, 66, ["Hyperparameters", "set BEFORE training", "learning_rate, max_depth, alpha"], { firstBold: true, s: 12 });
    s += box(20, 190, 210, 86, C.data) + lines(125, 214, ["Training data", "X_train, y_train", "(rows the model learns from)"], { firstBold: true, s: 12 });
    s += box(310, 104, 190, 110, C.algo) + lines(405, 134, ["Learning algorithm", "minimises the loss", "(e.g. gradient descent,", "tree-splitting)"], { firstBold: true, s: 12 });
    s += box(580, 104, 170, 110, C.par) + lines(665, 134, ["Parameters", "learned FROM the data", "weights w, bias b,", "split points, leaf values"], { firstBold: true, s: 12 });
    s += box(790, 104, 100, 110, C.score) + lines(840, 144, ["Validation", "score", "(held-out", "data)"], { firstBold: true, s: 12 });
    s += arrow([[230, 85], [270, 85], [270, 140], [310, 140]], C.hp);
    s += arrow([[230, 233], [270, 233], [270, 180], [310, 180]], C.data);
    s += arrow([[500, 159], [580, 159]], C.algo);
    s += arrow([[750, 159], [790, 159]], C.par);
    s += arrow([[840, 104], [840, 24], [125, 24], [125, 42]], C.hp, { dash: "6 5" });
    s += text(480, 17, "Tuning loop: try other hyperparameters, keep the ones with the best validation score", { s: 12, i: true });
    s += text(665, 244, "The algorithm finds these", { s: 11, c: C.par });
    return svg(900, 290,  "Hyperparameters are set before training; parameters are learned by the algorithm; validation score feeds back to tuning", s);
  };

  /* 2 - grid search heat-map (illustrative scores) */
  F.gridHeat = function () {
    var Cs = ["100", "10", "1", "0.1", "0.01"], Gs = ["0.001", "0.01", "0.1", "1", "10"];
    var x0 = 90, y0 = 40, cw = 74, ch = 46, s = "", r, c, best = null;
    for (r = 0; r < 5; r++) for (c = 0; c < 5; c++) {
      var v = Math.exp(-(Math.pow(c - 2, 2) / 1.8 + Math.pow(r - 1, 2) / 1.5));
      var acc = 0.65 + 0.30 * v;
      if (!best || acc > best.acc) best = { r: r, c: c, acc: acc };
      s += '<rect x="' + (x0 + c * cw) + '" y="' + (y0 + r * ch) + '" width="' + (cw - 3) + '" height="' + (ch - 3) + '" rx="6" fill="#34d399" fill-opacity="' + (0.08 + 0.8 * v).toFixed(2) + '"/>';
      s += text(x0 + c * cw + (cw - 3) / 2, y0 + r * ch + 26, acc.toFixed(2), { s: 13 });
    }
    s += '<rect x="' + (x0 + best.c * cw - 1) + '" y="' + (y0 + best.r * ch - 1) + '" width="' + (cw - 1) + '" height="' + (ch - 1) + '" rx="7" fill="none" stroke="#f59e0b" stroke-width="3"/>';
    for (c = 0; c < 5; c++) s += text(x0 + c * cw + (cw - 3) / 2, y0 + 5 * ch + 16, Gs[c], { s: 12 });
    for (r = 0; r < 5; r++) s += text(x0 - 10, y0 + r * ch + 26, Cs[r], { a: "end", s: 12 });
    s += text(x0 + 2.5 * cw, y0 + 5 * ch + 38, "gamma  (log scale)", { b: true, s: 12 });
    s += '<text transform="translate(18 ' + (y0 + 2.5 * ch) + ') rotate(-90)" text-anchor="middle" font-weight="700" font-size="12">C  (log scale)</text>';
    s += text(x0 + 2.5 * cw, 24, "Mean 5-fold CV accuracy for every combination (illustrative numbers)", { s: 12, i: true });
    s += box(500, 60, 270, 150, C.hp, { fo: 0.1 });
    s += lines(515, 86, ["5 values of C  ×  5 values of gamma", "= 25 combinations", "× 5 CV folds  =  125 model fits", "+ 1 final refit on all training data", "", "Orange frame = best cell"], { a: "start", s: 13, gap: 20 });
    return svg(800, 330, "Grid search evaluates every combination of C and gamma and highlights the best cell", s);
  };

  /* 3 - grid vs random on a 2-D space */
  F.gridVsRandom = function () {
    function panel(x0, title, pts) {
      var w = 300, h = 220, yTop = 130, o = "";
      function f(x) { return Math.exp(-Math.pow(x - 0.62, 2) / 0.02); }
      var curve = "";
      for (var i = 0; i <= 60; i++) { var x = i / 60; curve += (i ? "L" : "M") + (x0 + x * w).toFixed(1) + "," + (112 - 80 * f(x)).toFixed(1) + " "; }
      o += '<path d="' + curve + '" fill="none" stroke="#f59e0b" stroke-width="2.5"/>';
      o += line(x0, 112, x0 + w, 112, C.grey);
      o += '<rect x="' + x0 + '" y="' + yTop + '" width="' + w + '" height="' + h + '" rx="6" fill="none" stroke="' + C.grey + '"/>';
      var bestX = null, bestV = -1;
      pts.forEach(function (p) {
        if (f(p[0]) > bestV) { bestV = f(p[0]); bestX = p[0]; }
        o += line(x0 + p[0] * w, yTop, x0 + p[0] * w, 112, C.grey, { dash: "2 3", w: 1 });
        o += '<circle cx="' + (x0 + p[0] * w).toFixed(1) + '" cy="' + (112 - 80 * f(p[0])).toFixed(1) + '" r="4" fill="#f59e0b"/>';
        o += '<circle cx="' + (x0 + p[0] * w).toFixed(1) + '" cy="' + (yTop + (1 - p[1]) * h).toFixed(1) + '" r="6" fill="#7c5cff" fill-opacity="0.85"/>';
      });
      o += '<circle cx="' + (x0 + bestX * w).toFixed(1) + '" cy="' + (112 - 80 * bestV).toFixed(1) + '" r="8" fill="none" stroke="#34d399" stroke-width="3"/>';
      o += text(x0 + w / 2, 372, title, { b: true, s: 13 });
      o += text(x0 + w / 2, 390, "best score found on the important axis: " + bestV.toFixed(2), { s: 12, c: "#34d399" });
      return o;
    }
    var grid = [], g = [0.2, 0.5, 0.8];
    g.forEach(function (a) { g.forEach(function (b) { grid.push([a, b]); }); });
    var xs = [0.08, 0.19, 0.33, 0.47, 0.58, 0.66, 0.74, 0.9, 0.95], ys = [0.62, 0.15, 0.83, 0.4, 0.9, 0.28, 0.55, 0.72, 0.07];
    var rnd = xs.map(function (x, i) { return [x, ys[i]]; });
    var s = panel(30, "Grid search: 9 trials, only 3 different values per axis", grid) + panel(430, "Random search: 9 trials, 9 different values per axis", rnd);
    s += text(30, 14, "Orange curve = score vs the IMPORTANT hyperparameter (x). The other hyperparameter (y) barely matters.", { a: "start", s: 12, i: true });
    return svg(760, 400, "Comparison of nine grid points and nine random points on two hyperparameters", s);
  };

  /* 4 - Bayesian optimisation loop */
  F.boLoop = function () {
    var labels = [
      ["1  Surrogate", "model fits all", "(config → score)", "pairs seen so far"],
      ["2  Acquisition", "function scores", "every candidate:", "EI, UCB, PI"],
      ["3  Pick next", "config with the", "highest", "acquisition value"],
      ["4  Evaluate", "train + cross-", "validate it", "(the costly step)"],
      ["5  Update", "add (config, score)", "to the history", "stop if budget is used"]
    ];
    var cols = [C.algo, C.hp, C.hp, C.data, C.par], s = "", i, x;
    for (i = 0; i < 5; i++) {
      x = 15 + i * 180;
      s += box(x, 30, 150, 100, cols[i]) + lines(x + 75, 56, labels[i], { firstBold: true, s: 12 });
      if (i < 4) s += arrow([[x + 150, 80], [x + 180, 80]], C.grey);
    }
    s += arrow([[15 + 4 * 180 + 75, 130], [15 + 4 * 180 + 75, 170], [90, 170], [90, 130]], C.grey, { dash: "6 5" });
    s += text(450, 190, "repeat 20 – 100 times, each time using everything learned so far", { s: 12, i: true });
    s += text(450, 18, "Bayesian optimisation = learn from past trials, then spend the next trial where it is most promising", { s: 12, b: true });
    return svg(900, 205, "Bayesian optimisation loop: surrogate, acquisition, pick, evaluate, update", s);
  };

  /* 5 - real 1-D Gaussian-process fit with expected improvement */
  F.boGP = function () {
    function trueF(x) { return 0.62 + 0.28 * Math.exp(-Math.pow(x - 0.7, 2) / 0.02) + 0.12 * Math.exp(-Math.pow(x - 0.25, 2) / 0.01); }
    var X = [0.05, 0.25, 0.45, 0.9], Y = X.map(trueF), n = X.length, ell = 0.1, sf2 = 0.02, jit = 1e-8;
    var mu0 = Y.reduce(function (a, b) { return a + b; }, 0) / n;
    function k(a, b) { return sf2 * Math.exp(-Math.pow(a - b, 2) / (2 * ell * ell)); }
    // Cholesky of K + jitter
    var L = [], i, j, m;
    for (i = 0; i < n; i++) { L.push(new Array(n).fill(0)); }
    for (i = 0; i < n; i++) for (j = 0; j <= i; j++) {
      var sum = k(X[i], X[j]) + (i === j ? jit : 0);
      for (m = 0; m < j; m++) sum -= L[i][m] * L[j][m];
      L[i][j] = i === j ? Math.sqrt(sum) : sum / L[j][j];
    }
    function solveL(b) { var y = []; for (var a = 0; a < n; a++) { var t = b[a]; for (var c = 0; c < a; c++) t -= L[a][c] * y[c]; y.push(t / L[a][a]); } return y; }
    function solveLT(y) { var x = new Array(n); for (var a = n - 1; a >= 0; a--) { var t = y[a]; for (var c = a + 1; c < n; c++) t -= L[c][a] * x[c]; x[a] = t / L[a][a]; } return x; }
    var alpha = solveLT(solveL(Y.map(function (v) { return v - mu0; })));
    function erf(x) { var t = 1 / (1 + 0.3275911 * Math.abs(x)); var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; }
    function Phi(z) { return 0.5 * (1 + erf(z / Math.SQRT2)); }
    function phi(z) { return Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI); }
    var best = Math.max.apply(null, Y), pts = [], N = 120, ei, maxEI = 0, maxX = 0, q;
    for (i = 0; i <= N; i++) {
      var x = i / N, ks = X.map(function (xi) { return k(x, xi); });
      var mu = mu0 + ks.reduce(function (a, v, q) { return a + v * alpha[q]; }, 0);
      var v = solveL(ks), var_ = sf2 - v.reduce(function (a, b) { return a + b * b; }, 0), sd = Math.sqrt(Math.max(var_, 1e-12));
      var z = (mu - best) / sd; ei = (mu - best) * Phi(z) + sd * phi(z);
      if (ei > maxEI) { maxEI = ei; maxX = x; }
      pts.push({ x: x, mu: mu, sd: sd, ei: ei });
    }
    var W = 780, x0 = 50, y0 = 30, h1 = 200, y2 = 270, h2 = 70;
    var lo = 0.4, hi = 1.0;
    function px(x) { return x0 + x * W; }
    function py(v) { return y0 + (1 - (v - lo) / (hi - lo)) * h1; }
    function clampY(v) { return Math.max(y0, Math.min(y0 + h1, v)); }
    var s = '<rect x="' + x0 + '" y="' + y0 + '" width="' + W + '" height="' + h1 + '" fill="none" stroke="' + C.grey + '" stroke-opacity="0.5"/>';
    var up = "", dn = "";
    pts.forEach(function (p, q) { up += (q ? "L" : "M") + px(p.x).toFixed(1) + "," + clampY(py(p.mu + 2 * p.sd)).toFixed(1) + " "; });
    for (q = pts.length - 1; q >= 0; q--) dn += "L" + px(pts[q].x).toFixed(1) + "," + clampY(py(pts[q].mu - 2 * pts[q].sd)).toFixed(1) + " ";
    s += '<path d="' + up + dn + 'Z" fill="#7c5cff" fill-opacity="0.18" stroke="none"/>';
    var tf = "", mf = "";
    for (i = 0; i <= N; i++) { tf += (i ? "L" : "M") + px(i / N).toFixed(1) + "," + py(trueF(i / N)).toFixed(1) + " "; }
    pts.forEach(function (p, q2) { mf += (q2 ? "L" : "M") + px(p.x).toFixed(1) + "," + clampY(py(p.mu)).toFixed(1) + " "; });
    s += '<path d="' + tf + '" fill="none" stroke="' + C.grey + '" stroke-width="2" stroke-dasharray="6 5"/>';
    s += '<path d="' + mf + '" fill="none" stroke="#7c5cff" stroke-width="3"/>';
    X.forEach(function (xi, q3) { s += '<circle cx="' + px(xi).toFixed(1) + '" cy="' + py(Y[q3]).toFixed(1) + '" r="6" fill="#f59e0b" stroke="#fff" stroke-width="1.5"/>'; });
    s += line(px(maxX), y0, px(maxX), y2 + h2, C.score, { dash: "5 4", w: 2 });
    s += text(px(maxX), y0 - 8, "next trial ▼", { c: C.score, b: true, s: 12 });
    // acquisition panel
    var eiMax = Math.max.apply(null, pts.map(function (p) { return p.ei; })) || 1, ef = "";
    s += '<rect x="' + x0 + '" y="' + y2 + '" width="' + W + '" height="' + h2 + '" fill="none" stroke="' + C.grey + '" stroke-opacity="0.5"/>';
    pts.forEach(function (p, q4) { ef += (q4 ? "L" : "M") + px(p.x).toFixed(1) + "," + (y2 + h2 - (p.ei / eiMax) * (h2 - 8)).toFixed(1) + " "; });
    s += '<path d="' + ef + 'L' + px(1) + "," + (y2 + h2) + " L" + px(0) + "," + (y2 + h2) + ' Z" fill="#34d399" fill-opacity="0.25" stroke="#34d399" stroke-width="2"/>';
    s += text(x0 - 8, y2 + 40, "EI", { a: "end", s: 12, b: true, c: "#34d399" });
    s += text(x0 - 8, y0 + 100, "score", { a: "end", s: 12 });
    s += text(px(0.5), y2 + h2 + 22, "hyperparameter value (e.g. log learning rate) →", { s: 12 });
    // legend
    s += '<circle cx="' + (x0 + 16) + '" cy="' + (y0 + 16) + '" r="5" fill="#f59e0b"/>' + text(x0 + 28, y0 + 20, "trials done", { a: "start", s: 11 });
    s += line(x0 + 110, y0 + 16, x0 + 138, y0 + 16, "#7c5cff", { w: 3 }) + text(x0 + 144, y0 + 20, "surrogate mean", { a: "start", s: 11 });
    s += '<rect x="' + (x0 + 248) + '" y="' + (y0 + 10) + '" width="26" height="12" fill="#7c5cff" fill-opacity="0.25"/>' + text(x0 + 280, y0 + 20, "± 2 std (uncertainty)", { a: "start", s: 11 });
    s += line(x0 + 420, y0 + 16, x0 + 448, y0 + 16, C.grey, { dash: "6 5", w: 2 }) + text(x0 + 454, y0 + 20, "true score (unknown)", { a: "start", s: 11 });
    return svg(860, 372, "Gaussian process surrogate with uncertainty band and expected improvement; the next trial is placed in the unexplored gap", s);
  };

  /* 6 - CV-based tuning flow */
  F.cvFlow = function () {
    var s = "", i, r, cands = [["A", "C = 0.1", "0.84"], ["B", "C = 1", "0.91"], ["C", "C = 10", "0.87"]];
    s += box(20, 16, 690, 40, C.algo) + text(365, 41, "Training set (80 %)  -  all tuning happens here", { b: true, s: 13 });
    s += box(730, 16, 150, 40, C.hp, { dash: "5 4" }) + text(805, 41, "Test set (20 %) 🔒", { b: true, s: 13 });
    s += text(130, 86, "Candidate", { s: 12, b: true });
    for (i = 0; i < 5; i++) s += text(248 + i * 100, 86, "Fold " + (i + 1), { s: 12, b: true });
    s += text(760, 86, "Mean CV score", { s: 12, b: true });
    for (r = 0; r < 3; r++) {
      var y = 98 + r * 40;
      s += text(130, y + 22, cands[r][0] + ":  " + cands[r][1], { s: 13 });
      for (i = 0; i < 5; i++) {
        s += '<rect x="' + (200 + i * 100) + '" y="' + y + '" width="96" height="30" rx="5" fill="#34d399" fill-opacity="0.2" stroke="#34d399"/>';
        s += text(248 + i * 100, y + 20, "score " + (parseFloat(cands[r][2]) + [0.01, -0.02, 0.0, 0.02, -0.01][i]).toFixed(2), { s: 11 });
      }
      var win = r === 1;
      s += box(700, y, 120, 30, win ? C.hp : C.grey, { fo: win ? 0.28 : 0.1, r: 6 }) + text(760, y + 20, cands[r][2] + (win ? "  ★ best" : ""), { b: win, s: 13 });
    }
    s += text(450, 232, "Each fold is validation exactly once (train on the other 4 folds).  Every candidate sees the same folds.", { s: 12, i: true });
    s += box(20, 252, 420, 52, C.par) + lines(230, 274, ["Refit the best config (B) on ALL training data", "→ final model"], { firstBold: true, s: 12 });
    s += arrow([[440, 278], [600, 278]], C.par);
    s += box(600, 252, 280, 52, C.hp, { dash: "5 4" }) + lines(740, 274, ["Score on the test set ONCE", "→ honest estimate for reporting"], { firstBold: true, s: 12 });
    return svg(900, 320, "Cross-validation based tuning: score every candidate on k folds, refit the best on all training data, score once on the test set", s);
  };

  /* 7 - linear vs log sampling */
  F.logScale = function () {
    var r = rng(11), N = 20, x0 = 60, W = 700, s = "", d, i;
    function pos(v) { return x0 + (Math.log10(v) + 4) / 4 * W; }
    function strip(y, title, gen) {
      var o = "", counts = [0, 0, 0, 0];
      for (d = 0; d < 4; d++) {
        o += '<rect x="' + (x0 + d * W / 4) + '" y="' + y + '" width="' + (W / 4) + '" height="64" fill="' + (d % 2 ? "#94a3b8" : "#7c5cff") + '" fill-opacity="0.08"/>';
      }
      o += text(x0, y - 8, title, { a: "start", b: true, s: 13 });
      for (i = 0; i < N; i++) {
        var v = gen(), dec = Math.min(3, Math.max(0, Math.floor(Math.log10(v) + 4)));
        counts[dec]++;
        o += '<circle cx="' + pos(v).toFixed(1) + '" cy="' + (y + 20 + (i % 4) * 8) + '" r="5" fill="#f59e0b" fill-opacity="0.9"/>';
      }
      for (d = 0; d < 4; d++) o += text(x0 + d * W / 4 + W / 8, y + 58, counts[d] + " of " + N, { s: 12, c: "#34d399" });
      return o;
    }
    s += strip(40, "Uniform(1e-4, 1)  →  samples pile up in the last decade", function () { return 1e-4 + r() * (1 - 1e-4); });
    s += strip(150, "Log-uniform(1e-4, 1)  →  every decade gets about the same number", function () { return Math.pow(10, -4 + 4 * r()); });
    var ticks = ["1e-4", "1e-3", "1e-2", "1e-1", "1"];
    for (d = 0; d < 5; d++) s += text(x0 + d * W / 4, 240, ticks[d], { s: 12 });
    s += text(x0 + W / 2, 262, "learning rate (log axis; each shaded band is one decade)", { s: 12, i: true });
    return svg(800, 275, "Twenty samples drawn uniformly versus log-uniformly between 1e-4 and 1", s);
  };

  /* 8 - overall workflow */
  F.workflow = function () {
    var steps = [
      ["1 Metric & split", "business metric,", "test set locked"], ["2 Baseline", "run the defaults,", "note the score to beat"], ["3 Search space", "ranges, scales,", "priorities"],
      ["4 Search + CV", "grid / random /", "Bayesian"], ["5 Diagnose", "curves, edge of range,", "train-val gap"], ["6 Refit & test", "once, log and ship", "the pipeline"]
    ];
    var cols = [C.data, C.grey, C.hp, C.algo, C.score, C.par], s = "", i, x;
    for (i = 0; i < 6; i++) {
      x = 10 + i * 150;
      s += box(x, 30, 132, 94, cols[i]) + lines(x + 66, 54, steps[i].filter(Boolean), { firstBold: true, s: 12 });
      if (i < 5) s += arrow([[x + 132, 77], [x + 150, 77]], C.grey);
    }
    s += arrow([[10 + 4 * 150 + 66, 124], [10 + 4 * 150 + 66, 154], [10 + 2 * 150 + 66, 154], [10 + 2 * 150 + 66, 124]], C.score, { dash: "6 5" });
    s += text(10 + 3 * 150 + 66, 172, "best value at the edge or still improving? → widen / refine the space", { s: 12, i: true });
    return svg(910, 185, "Hyperparameter tuning workflow from metric and split to final refit and test", s);
  };
})();
