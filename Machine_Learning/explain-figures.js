/* SVG figures for the "Interpretability & Explainability" chapter. Numbers in the bar charts, PDP/ICE, SHAP and LIME
   figures come from one run of the example code in the chapter (seeded data, GradientBoostingClassifier). */
(function () {
  "use strict";
  var F = (window.EX_FIG = window.EX_FIG || {});
  var C = { a: "#7c5cff", b: "#22d3ee", g: "#34d399", o: "#f59e0b", r: "#f87171", p: "#f472b6", grey: "#94a3b8" };

  function svg(w, h, label, inner) { return '<svg class="ex-svg" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + label + '">' + inner + "</svg>"; }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function text(x, y, s, o) {
    o = o || {};
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + (o.a || "middle") + '"' + (o.b ? ' font-weight="700"' : "") + (o.s ? ' font-size="' + o.s + '"' : "") +
      (o.c ? ' fill="' + o.c + '"' : "") + (o.i ? ' font-style="italic"' : "") + ">" + esc(s) + "</text>";
  }
  function lines(x, y, arr, o) {
    o = o || {};
    return arr.map(function (s, i) { return text(x, y + i * (o.gap || 15), s, { a: o.a, s: o.s, c: o.c, b: i === 0 && o.firstBold }); }).join("");
  }
  function box(x, y, w, h, col, o) {
    o = o || {};
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (o.r || 10) + '" fill="' + col + '" fill-opacity="' + (o.fo || 0.16) + '" stroke="' + col + '" stroke-width="' + (o.sw || 1.6) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + "/>";
  }
  function line(x1, y1, x2, y2, col, o) {
    o = o || {};
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (col || C.grey) + '" stroke-width="' + (o.w || 1.5) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + "/>";
  }
  function arrow(pts, col, o) {
    o = o || {}; col = col || C.grey;
    var d = pts.map(function (p, i) { return (i ? "L" : "M") + p[0] + "," + p[1]; }).join(" "), n = pts.length;
    var ang = Math.atan2(pts[n - 1][1] - pts[n - 2][1], pts[n - 1][0] - pts[n - 2][0]), x = pts[n - 1][0], y = pts[n - 1][1], a = 9, b = 0.45;
    return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + (o.w || 2) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : "") + "/>" +
      '<polygon points="' + x + "," + y + " " + (x - a * Math.cos(ang - b)).toFixed(1) + "," + (y - a * Math.sin(ang - b)).toFixed(1) + " " + (x - a * Math.cos(ang + b)).toFixed(1) + "," + (y - a * Math.sin(ang + b)).toFixed(1) + '" fill="' + col + '"/>';
  }
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  /* horizontal bar chart; items: {label, v, err, color}. Supports negative values. */
  function bars(x0, y0, W, items, o) {
    o = o || {};
    var labW = o.labW || 150, rowH = o.rowH || 30, bh = rowH - 12, valW = 70, aw = W - labW - valW, min = o.min || 0, max = o.max, s = "";
    function px(v) { return x0 + labW + (v - min) / (max - min) * aw; }
    var zero = px(0), fmt = o.fmt || function (v) { return v.toFixed(3); };
    items.forEach(function (it, i) {
      var y = y0 + i * rowH, col = it.color || o.color || C.a, x1 = px(Math.min(0, it.v)), x2 = px(Math.max(0, it.v)), cy = y + bh / 2;
      s += text(x0 + labW - 8, cy + 4, it.label, { a: "end", s: 12 });
      s += '<rect x="' + x1.toFixed(1) + '" y="' + y + '" width="' + Math.max(1.5, x2 - x1).toFixed(1) + '" height="' + bh + '" rx="3" fill="' + col + '" fill-opacity="0.85"/>';
      var right = Math.max(x2, it.err ? px(Math.max(0, it.v) + it.err) : x2);
      if (it.err) {
        var a = px(it.v - it.err), b = px(it.v + it.err);
        s += line(a, cy, b, cy, "#e2e8f0", { w: 1.5 }) + line(a, cy - 4, a, cy + 4, "#e2e8f0", { w: 1.5 }) + line(b, cy - 4, b, cy + 4, "#e2e8f0", { w: 1.5 });
        right = Math.max(right, b);
      }
      if (it.v < 0 && x2 - x1 > 34) s += text(x1 - 6, cy + 4, fmt(it.v), { a: "end", s: 12 });
      else s += text(right + 6, cy + 4, fmt(it.v), { a: "start", s: 12 });
    });
    s += line(zero, y0 - 4, zero, y0 + items.length * rowH - 6, C.grey, { w: 1 });
    return s;
  }

  /* 1 - landscape of techniques */
  F.taxonomy = function () {
    var s = "", cw = 380, ch = 118, x0 = 130, y0 = 44;
    s += text(x0 + cw / 2, 22, "Model-specific  (uses model internals)", { b: true, s: 13 }) + text(x0 + cw + 12 + cw / 2, 22, "Model-agnostic  (only needs predict)", { b: true, s: 13 });
    s += '<text transform="translate(60 ' + (y0 + ch / 2) + ') rotate(-90)" text-anchor="middle" font-weight="700" font-size="13">Global (whole model)</text>';
    s += '<text transform="translate(60 ' + (y0 + ch + 12 + ch / 2) + ') rotate(-90)" text-anchor="middle" font-weight="700" font-size="13">Local (one prediction)</text>';
    var cells = [
      [["Linear coefficients / odds ratios", "Impurity importance (MDI / gain)", "Tree structure, rules"], C.a],
      [["Permutation importance", "Partial dependence (PDP), ALE", "Global SHAP (mean |SHAP|), surrogate trees"], C.g],
      [["Decision path of a tree", "TreeSHAP for one row", "Contribution = coefficient × value"], C.b],
      [["LIME", "KernelSHAP", "ICE curves · counterfactuals · anchors"], C.o]
    ];
    cells.forEach(function (c, i) {
      var x = x0 + (i % 2) * (cw + 12), y = y0 + Math.floor(i / 2) * (ch + 12);
      s += box(x, y, cw, ch, c[1], { fo: 0.12 });
      c[0].forEach(function (t, k) { s += text(x + 18, y + 34 + k * 30, "•  " + t, { a: "start", s: 13 }); });
    });
    var yb = y0 + 2 * (ch + 12) + 6;
    s += box(x0, yb, 2 * cw + 12, 44, C.p, { fo: 0.1, dash: "5 4" }) + text(x0 + cw + 6, yb + 27, "Intrinsically interpretable models: linear / logistic regression · small trees · rules · GAM / EBM", { b: true, s: 13 });
    return svg(920, yb + 56, "Explainability techniques arranged by global versus local scope and model-specific versus model-agnostic", s);
  };

  /* 2 - impurity importance (real numbers) */
  F.mdiBars = function () {
    var items = [["debt_to_income", 0.296], ["income", 0.191], ["credit_history_years", 0.175], ["late_payments", 0.169], ["random_noise", 0.098], ["loan_amount", 0.072]].map(function (r) {
      return { label: r[0], v: r[1], color: r[0] === "random_noise" ? C.r : C.a };
    });
    var s = text(20, 18, "Impurity-based importance (feature_importances_), sums to 1", { a: "start", b: true, s: 13 }) + bars(10, 34, 640, items, { max: 0.35, labW: 160, rowH: 34 });
    s += box(600, 70, 270, 100, C.r, { fo: 0.1 }) + lines(615, 94, ["random_noise was generated", "with NO link to the target,", "yet it receives 0.098 – more", "than the real feature loan_amount."], { a: "start", s: 12, gap: 17 });
    return svg(900, 250, "Impurity based feature importance for six features including a pure noise feature", s);
  };

  /* 3 - MDI vs permutation */
  F.mdiVsPerm = function () {
    var order = ["debt_to_income", "income", "late_payments", "credit_history_years", "loan_amount", "random_noise"];
    var mdi = { debt_to_income: 0.296, income: 0.191, credit_history_years: 0.175, late_payments: 0.169, random_noise: 0.098, loan_amount: 0.072 };
    var perm = { debt_to_income: [0.1227, 0.0133], income: [0.0701, 0.011], late_payments: [0.0534, 0.0087], credit_history_years: [0.0485, 0.0078], loan_amount: [0.0095, 0.0038], random_noise: [-0.0007, 0.0047] };
    var a = order.map(function (k) { return { label: k, v: mdi[k], color: k === "random_noise" ? C.r : C.a }; });
    var b = order.map(function (k) { return { label: k, v: perm[k][0], err: perm[k][1], color: k === "random_noise" ? C.r : C.g }; });
    var s = text(20, 18, "Impurity importance (training data)", { a: "start", b: true, s: 13 }) + bars(10, 34, 440, a, { max: 0.35, labW: 150, rowH: 32, fmt: function (v) { return v.toFixed(3); } });
    s += text(470, 18, "Permutation importance (test data, AUC drop ± 1 std)", { a: "start", b: true, s: 13 }) + bars(460, 34, 440, b, { min: -0.02, max: 0.16, labW: 150, rowH: 32, fmt: function (v) { return (v < 0 ? "−" : "") + Math.abs(v).toFixed(4); } });
    s += text(450, 252, "Same model, same data: the noise feature looks important on the left and correctly sits at ≈ 0 on the right.", { s: 12, i: true });
    return svg(910, 268, "Impurity importance versus permutation importance for the same model", s);
  };

  /* 4 - permutation procedure */
  F.permProcedure = function () {
    function table(x, y, title, rows, hl) {
      var o = text(x + 105, y - 10, title, { b: true, s: 12 }), cols = ["debt_to_income", "late", "default"], cw = [92, 50, 58];
      var cx = x, k, r;
      for (k = 0; k < 3; k++) { o += text(cx + cw[k] / 2, y + 14, cols[k], { s: 11, b: true }); cx += cw[k]; }
      for (r = 0; r < rows.length; r++) {
        cx = x;
        for (k = 0; k < 3; k++) {
          o += '<rect x="' + cx + '" y="' + (y + 22 + r * 28) + '" width="' + (cw[k] - 2) + '" height="26" rx="4" fill="' + (k === 0 && hl ? C.o : C.grey) + '" fill-opacity="' + (k === 0 && hl ? 0.3 : 0.1) + '" stroke="' + (k === 0 && hl ? C.o : C.grey) + '" stroke-opacity="0.6"/>';
          o += text(cx + cw[k] / 2 - 1, y + 40 + r * 28, rows[r][k], { s: 12 });
          cx += cw[k];
        }
      }
      return o;
    }
    var orig = [["0.62", "3", "1"], ["0.25", "0", "0"], ["0.48", "2", "1"], ["0.30", "1", "0"]];
    var shuf = [["0.30", "3", "1"], ["0.48", "0", "0"], ["0.25", "2", "1"], ["0.62", "1", "0"]];
    var s = table(20, 40, "1  Held-out test rows", orig, false) + table(360, 40, "2  Shuffle ONE column", shuf, true);
    s += arrow([[225, 100], [345, 100]], C.o) + text(285, 90, "shuffle", { s: 11, c: C.o });
    s += box(700, 30, 190, 62, C.g) + lines(795, 54, ["3  Score the model on each", "version (e.g. ROC-AUC)"], { s: 12, firstBold: true });
    s += arrow([[600, 100], [700, 80]], C.g);
    s += box(20, 176, 860, 70, C.p, { fo: 0.1 }) + lines(450, 200, ["importance(feature) = score(original)  −  score(shuffled)       repeat K times and average", "Example from the chapter's run:  AUC 0.760  →  0.637 after shuffling debt_to_income   ⇒   importance ≈ 0.123"], { s: 13, gap: 24, firstBold: true });
    s += text(450, 270, "Big drop = the model relied on that feature.  No drop = the model ignored it (or it is fully redundant).", { s: 12, i: true });
    return svg(900, 285, "Permutation importance procedure: shuffle one column and measure the score drop", s);
  };

  /* 5 - PDP + ICE (real) */
  F.pdpIce = function () {
    var g = [0.159, 0.194, 0.229, 0.265, 0.3, 0.335, 0.37, 0.405, 0.44, 0.476, 0.511, 0.546];
    var avg = [0.16, 0.189, 0.195, 0.276, 0.314, 0.314, 0.311, 0.403, 0.45, 0.479, 0.508, 0.57];
    var ice = [[0.328, 0.418, 0.418, 0.52, 0.511, 0.511, 0.487, 0.555, 0.63, 0.683, 0.7, 0.728], [0.225, 0.244, 0.244, 0.372, 0.4, 0.4, 0.38, 0.521, 0.545, 0.559, 0.587, 0.662], [0.031, 0.032, 0.032, 0.031, 0.039, 0.039, 0.046, 0.058, 0.07, 0.082, 0.095, 0.105],
      [0.098, 0.1, 0.1, 0.124, 0.181, 0.181, 0.177, 0.238, 0.31, 0.32, 0.36, 0.537], [0.301, 0.394, 0.394, 0.577, 0.569, 0.569, 0.545, 0.677, 0.732, 0.766, 0.779, 0.814], [0.087, 0.102, 0.102, 0.191, 0.244, 0.244, 0.229, 0.427, 0.462, 0.443, 0.485, 0.539],
      [0.092, 0.123, 0.123, 0.168, 0.183, 0.183, 0.204, 0.251, 0.386, 0.465, 0.488, 0.425], [0.234, 0.352, 0.503, 0.763, 0.801, 0.801, 0.785, 0.849, 0.86, 0.867, 0.863, 0.877]];
    var X0 = 70, Y0 = 30, W = 520, H = 250, xmin = 0.15, xmax = 0.56;
    function px(v) { return X0 + (v - xmin) / (xmax - xmin) * W; }
    function py(v) { return Y0 + (1 - v) * H; }
    var s = '<rect x="' + X0 + '" y="' + Y0 + '" width="' + W + '" height="' + H + '" fill="none" stroke="' + C.grey + '" stroke-opacity="0.5"/>', i, k;
    for (i = 0; i <= 4; i++) { s += line(X0, py(i / 4), X0 + W, py(i / 4), C.grey, { w: 0.6, dash: "2 4" }) + text(X0 - 8, py(i / 4) + 4, (i * 25) + " %", { a: "end", s: 11 }); }
    [0.2, 0.3, 0.4, 0.5].forEach(function (t) { s += text(px(t), Y0 + H + 18, t.toFixed(1), { s: 11 }); });
    ice.forEach(function (c) { var d = ""; for (k = 0; k < g.length; k++) d += (k ? "L" : "M") + px(g[k]).toFixed(1) + "," + py(c[k]).toFixed(1) + " "; s += '<path d="' + d + '" fill="none" stroke="' + C.grey + '" stroke-opacity="0.75" stroke-width="1.5"/>'; });
    var d2 = ""; for (k = 0; k < g.length; k++) d2 += (k ? "L" : "M") + px(g[k]).toFixed(1) + "," + py(avg[k]).toFixed(1) + " ";
    s += '<path d="' + d2 + '" fill="none" stroke="' + C.o + '" stroke-width="4"/>';
    s += text(X0 + W / 2, Y0 + H + 40, "debt_to_income (the feature being varied; all other features keep each customer's own values)", { s: 12 });
    s += '<text transform="translate(18 ' + (Y0 + H / 2) + ') rotate(-90)" text-anchor="middle" font-size="12">predicted default risk</text>';
    s += line(610, 60, 640, 60, C.o, { w: 4 }) + text(648, 64, "PDP = average of all curves", { a: "start", s: 12 });
    s += line(610, 90, 640, 90, C.grey, { w: 1.5 }) + text(648, 94, "ICE = one customer each", { a: "start", s: 12 });
    s += lines(610, 140, ["Reading the chart:", "• risk rises as debt-to-income rises", "• the curve is not a straight line", "  (a plateau around 0.30 – 0.37)", "• one customer (bottom curve) is", "  almost flat: the average hides this"], { a: "start", s: 12, gap: 18, firstBold: true });
    return svg(900, 330, "Partial dependence and individual conditional expectation curves for debt to income", s);
  };

  /* 6 - SHAP waterfall (real) */
  F.shapWaterfall = function () {
    var base = -0.744, items = [["debt_to_income = 0.686", 2.089], ["late_payments = 3", 1.289], ["loan_amount = 84,388", 0.559], ["credit_history_years = 24", -0.418], ["income = 93,828", -0.384], ["random_noise = −0.149", -0.052]];
    var X0 = 250, W = 520, min = -1.2, max = 3.0, y0 = 70, rh = 38;
    function px(v) { return X0 + (v - min) / (max - min) * W; }
    var s = text(20, 20, "One applicant explained with SHAP (units: log-odds of default)", { a: "start", b: true, s: 13 }), cur = base, i;
    s += line(px(base), 46, px(base), y0 + items.length * rh + 10, C.grey, { dash: "4 4" }) + text(px(base), 40, "base value  −0.74  (32 % risk)", { s: 12 });
    items.forEach(function (it, k) {
      var a = cur, b = cur + it[1], y = y0 + k * rh, col = it[1] > 0 ? C.r : C.b;
      s += text(X0 - 10, y + 17, it[0], { a: "end", s: 12 });
      s += '<rect x="' + px(Math.min(a, b)).toFixed(1) + '" y="' + y + '" width="' + Math.abs(px(b) - px(a)).toFixed(1) + '" height="24" rx="3" fill="' + col + '" fill-opacity="0.85"/>';
      s += text(px(Math.max(a, b)) + 6, y + 17, (it[1] > 0 ? "+" : "−") + Math.abs(it[1]).toFixed(2), { a: "start", s: 12 });
      if (k < items.length - 1) s += line(px(b), y + 24, px(b), y + rh, C.grey, { w: 1, dash: "2 3" });
      cur = b;
    });
    var yEnd = y0 + items.length * rh + 12;
    s += line(px(cur), 46, px(cur), yEnd + 10, C.p, { dash: "4 4" }) + text(px(cur), yEnd + 28, "final f(x) = 2.34  →  91 % predicted risk", { b: true, s: 12 });
    s += text(450, yEnd + 56, "Red bars push the prediction towards default, blue bars away from it. Base value + all contributions = the model output.", { s: 12, i: true });
    return svg(900, yEnd + 70, "SHAP waterfall plot for a single applicant", s);
  };

  /* 7 - Shapley coalition lattice (toy) */
  F.shapLattice = function () {
    var v = { "": 0.20, D: 0.35, L: 0.30, H: 0.15, DL: 0.55, DH: 0.30, LH: 0.25, DLH: 0.50 };
    var pos = { "": [60, 150], D: [270, 40], L: [270, 150], H: [270, 260], DL: [500, 40], DH: [500, 150], LH: [500, 260], DLH: [730, 150] };
    var edges = [["", "D"], ["", "L"], ["", "H"], ["D", "DL"], ["D", "DH"], ["L", "DL"], ["L", "LH"], ["H", "DH"], ["H", "LH"], ["DL", "DLH"], ["DH", "DLH"], ["LH", "DLH"]];
    var nm = { D: "debt_to_income", L: "late_payments", H: "credit_history" };
    function label(k) { return k === "" ? "no features" : k.split("").map(function (c) { return c; }).join(" + "); }
    var s = "";
    edges.forEach(function (e) {
      var a = pos[e[0]], b = pos[e[1]], d = v[e[1]] - v[e[0]], t = 0.62;
      s += line(a[0] + 50, a[1] + 20, b[0] - 50, b[1] + 20, C.grey, { w: 1.2 });
      s += text(a[0] + 50 + (b[0] - 50 - a[0] - 50) * t, a[1] + 20 + (b[1] - a[1]) * t - 4, (d >= 0 ? "+" : "−") + Math.abs(d).toFixed(2), { s: 11, c: d >= 0 ? C.r : C.b });
    });
    Object.keys(pos).forEach(function (k) {
      var p = pos[k];
      s += box(p[0] - 50, p[1], 100, 40, k === "DLH" ? C.p : (k === "" ? C.g : C.a), { fo: 0.18 }) + text(p[0], p[1] + 17, label(k), { s: 12, b: true }) + text(p[0], p[1] + 33, "v = " + v[k].toFixed(2), { s: 12 });
    });
    s += text(400, 12, "D = " + nm.D + ",  L = " + nm.L + ",  H = " + nm.H, { s: 11, i: true });
    s += text(400, 26, "v(S) = model output when only the features in S are known.  Line labels = marginal contribution of the added feature.", { s: 11, i: true });
    return svg(800, 315, "Coalition lattice for three features showing marginal contributions used to compute Shapley values", s);
  };

  /* 8 - LIME concept (computed) */
  F.limeConcept = function () {
    function f(x) { return 0.5 + 0.42 * Math.tanh(4 * (x - 0.5)) + 0.05 * Math.sin(16 * x); }
    var X0 = 50, Y0 = 20, W = 600, H = 250, x0 = 0.62, sig = 0.12, r = rng(5), pts = [], i;
    function px(v) { return X0 + v * W; }
    function py(v) { return Y0 + (1 - v) * H; }
    for (i = 0; i < 45; i++) { var u1 = r(), u2 = r(), z = Math.sqrt(-2 * Math.log(u1 + 1e-9)) * Math.cos(2 * Math.PI * u2), x = Math.max(0.02, Math.min(0.98, x0 + 0.22 * z)); pts.push({ x: x, y: f(x), w: Math.exp(-Math.pow(x - x0, 2) / (2 * sig * sig)) }); }
    var sw = 0, sx = 0, sy = 0, sxx = 0, sxy = 0;
    pts.forEach(function (p) { sw += p.w; sx += p.w * p.x; sy += p.w * p.y; sxx += p.w * p.x * p.x; sxy += p.w * p.x * p.y; });
    var b = (sw * sxy - sx * sy) / (sw * sxx - sx * sx), a = (sy - b * sx) / sw;
    var s = '<rect x="' + X0 + '" y="' + Y0 + '" width="' + W + '" height="' + H + '" fill="none" stroke="' + C.grey + '" stroke-opacity="0.5"/>';
    s += '<rect x="' + px(x0 - 2 * sig).toFixed(1) + '" y="' + Y0 + '" width="' + (px(x0 + 2 * sig) - px(x0 - 2 * sig)).toFixed(1) + '" height="' + H + '" fill="' + C.o + '" fill-opacity="0.08"/>';
    var d = ""; for (i = 0; i <= 120; i++) d += (i ? "L" : "M") + px(i / 120).toFixed(1) + "," + py(f(i / 120)).toFixed(1) + " ";
    s += '<path d="' + d + '" fill="none" stroke="' + C.a + '" stroke-width="3"/>';
    pts.forEach(function (p) { s += '<circle cx="' + px(p.x).toFixed(1) + '" cy="' + py(p.y).toFixed(1) + '" r="' + (2 + 5 * p.w).toFixed(1) + '" fill="' + C.g + '" fill-opacity="' + (0.25 + 0.6 * p.w).toFixed(2) + '"/>'; });
    var xa = x0 - 0.28, xb = x0 + 0.28;
    s += line(px(xa), py(a + b * xa), px(xb), py(a + b * xb), C.o, { w: 3.5 });
    s += '<circle cx="' + px(x0) + '" cy="' + py(f(x0)) + '" r="8" fill="' + C.p + '" stroke="#fff" stroke-width="2"/>';
    s += text(px(x0), Y0 + H + 18, "x₀ (the instance to explain)", { s: 12 }) + text(X0 + W / 2, Y0 + H + 40, "feature value", { s: 12 });
    s += '<text transform="translate(16 ' + (Y0 + H / 2) + ') rotate(-90)" text-anchor="middle" font-size="12">model output</text>';
    s += line(670, 50, 700, 50, C.a, { w: 3 }) + text(708, 54, "black-box f(x)", { a: "start", s: 12 });
    s += '<circle cx="685" cy="82" r="6" fill="' + C.g + '"/>' + lines(708, 78, ["perturbed samples", "(size = closeness weight)"], { a: "start", s: 12 });
    s += line(670, 124, 700, 124, C.o, { w: 3.5 }) + lines(708, 120, ["weighted linear model", "= the explanation", "(slope b = " + b.toFixed(2) + ")"], { a: "start", s: 12 });
    s += '<circle cx="685" cy="176" r="7" fill="' + C.p + '"/>' + text(708, 180, "instance x₀", { a: "start", s: 12 });
    s += lines(670, 215, ["Valid only near x₀: the straight", "line is wrong far away."], { a: "start", s: 11, c: C.grey });
    return svg(900, 320, "LIME fits a weighted linear model to perturbed samples around one instance", s);
  };

  /* 9 - global vs local */
  F.globalVsLocal = function () {
    var g = [["debt_to_income", 0.516], ["credit_history_years", 0.416], ["income", 0.412], ["late_payments", 0.365], ["random_noise", 0.164], ["loan_amount", 0.161]].map(function (r) { return { label: r[0], v: r[1], color: r[0] === "random_noise" ? C.grey : C.a }; });
    var l = [["debt_to_income", 2.089], ["late_payments", 1.289], ["loan_amount", 0.559], ["credit_history_years", -0.418], ["income", -0.384], ["random_noise", -0.052]].map(function (r) { return { label: r[0], v: r[1], color: r[1] > 0 ? C.r : C.b }; });
    var s = box(10, 8, 430, 258, C.a, { fo: 0.06 }) + text(225, 32, "GLOBAL: what does the model rely on overall?", { b: true, s: 13 }) + text(225, 50, "mean |SHAP| over 1,000 test customers", { s: 12, i: true });
    s += bars(20, 66, 410, g, { max: 0.6, labW: 140, rowH: 32, fmt: function (v) { return v.toFixed(2); } });
    s += box(460, 8, 430, 258, C.o, { fo: 0.06 }) + text(675, 32, "LOCAL: why did THIS applicant get 91 % risk?", { b: true, s: 13 }) + text(675, 50, "SHAP contribution (log-odds)", { s: 12, i: true });
    s += bars(470, 66, 410, l, { min: -1, max: 2.6, labW: 140, rowH: 32, fmt: function (v) { return (v < 0 ? "−" : "+") + Math.abs(v).toFixed(2); } });
    s += arrow([[445, 137], [455, 137]], C.grey);
    s += text(450, 292, "Average the local explanations → the global view.   The global view alone cannot tell you why one person was flagged.", { s: 12, i: true });
    return svg(900, 308, "Global feature importance beside the local explanation for one applicant", s);
  };

  /* 10 - from model output to plain language */
  F.commFlow = function () {
    var st = [["Model output", "91 % risk,", "decision: refer"], ["Top drivers", "SHAP / LIME:", "3 biggest factors"], ["Plain language", "feature dictionary", "no jargon"], ["What-if", "counterfactual:", "what could change it"], ["Test & review", "do real users", "understand it?"]];
    var cols = [C.a, C.o, C.g, C.b, C.p], s = "", i;
    for (i = 0; i < 5; i++) {
      var x = 12 + i * 178;
      s += box(x, 30, 150, 80, cols[i]) + lines(x + 75, 56, ["" + (i + 1) + "  " + st[i][0], st[i][1], st[i][2]], { firstBold: true, s: 12 });
      if (i < 4) s += arrow([[x + 150, 70], [x + 178, 70]], C.grey);
    }
    s += text(450, 140, "Keep the technical detail (SHAP values, LIME weights) in the audit log; show people the translated message.", { s: 12, i: true });
    return svg(900, 155, "Pipeline from model output to a plain language explanation", s);
  };
})();
