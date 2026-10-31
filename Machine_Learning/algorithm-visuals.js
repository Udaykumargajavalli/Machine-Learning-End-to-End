/* Simple explanatory SVG diagrams for each algorithm tab (keyed by algorithm id).
   Uses currentColor so it works in both light and dark themes. */
(function () {
  "use strict";

  const C = { blue: "#6c8cff", orange: "#f5a524", green: "#22c55e", red: "#ef4444", purple: "#a855f7", grey: "#94a3b8" };

  let seed = 7;
  const setSeed = (s) => { seed = s; };
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const jit = (s) => (rnd() - 0.5) * 2 * s;
  const gauss = (s) => (rnd() + rnd() + rnd() - 1.5) * s * 1.4;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const f = (n) => Number(n).toFixed(1);

  const defs =
    '<defs><marker id="algoArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
    '<path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity=".65"/></marker></defs>';

  const svg = (inner, label) =>
    '<svg viewBox="0 0 360 200" role="img" aria-label="' + label + '" xmlns="http://www.w3.org/2000/svg" font-size="11">' +
    defs + inner + "</svg>";

  const axes = (xl, yl) =>
    '<g stroke="currentColor" stroke-opacity=".35" stroke-width="1.2"><line x1="30" y1="180" x2="350" y2="180"/><line x1="30" y1="180" x2="30" y2="10"/></g>' +
    (xl ? tx(345, 195, xl, { a: "end", op: 0.7, s: 10 }) : "") +
    (yl ? tx(34, 12, yl, { a: "start", op: 0.7, s: 10 }) : "");

  const dot = (x, y, c, r, extra) =>
    '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + (r || 4.5) + '" fill="' + c + '" ' + (extra || "") + "/>";

  const ln = (x1, y1, x2, y2, c, w, dash, op) =>
    '<line x1="' + f(x1) + '" y1="' + f(y1) + '" x2="' + f(x2) + '" y2="' + f(y2) + '" stroke="' + (c || "currentColor") +
    '" stroke-width="' + (w || 1.5) + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") +
    (op ? ' stroke-opacity="' + op + '"' : "") + ' stroke-linecap="round"/>';

  const arrow = (x1, y1, x2, y2) =>
    '<line x1="' + f(x1) + '" y1="' + f(y1) + '" x2="' + f(x2) + '" y2="' + f(y2) +
    '" stroke="currentColor" stroke-opacity=".65" stroke-width="1.5" marker-end="url(#algoArrow)"/>';

  function tx(x, y, s, o) {
    o = o || {};
    return '<text x="' + f(x) + '" y="' + f(y) + '" fill="' + (o.c || "currentColor") + '" text-anchor="' + (o.a || "middle") +
      '" font-size="' + (o.s || 11) + '"' + (o.b ? ' font-weight="700"' : "") + (o.op ? ' fill-opacity="' + o.op + '"' : "") + ">" + s + "</text>";
  }

  const box = (x, y, w, h, label, c, o) =>
    '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + c + '" fill-opacity=".16" stroke="' + c + '" stroke-width="1.5"/>' +
    tx(x + w / 2, y + h / 2 + 4, label, o);

  const star = (cx, cy, r, c) => {
    let p = "";
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      p += f(cx + rr * Math.cos(a)) + "," + f(cy + rr * Math.sin(a)) + " ";
    }
    return '<polygon points="' + p + '" fill="' + c + '" stroke="currentColor" stroke-width="1"/>';
  };

  const cross = (x, y, c, s) => ln(x - s, y - s, x + s, y + s, c, 3.5) + ln(x - s, y + s, x + s, y - s, c, 3.5);

  // ---------- diagrams ----------

  function linreg() {
    setSeed(3);
    const line = (x) => 165 - ((x - 40) * 125) / 295;
    let res = "", dots = "";
    for (let i = 0; i < 10; i++) {
      const x = 55 + i * 29, y = line(x) + jit(20);
      res += ln(x, y, x, line(x), C.red, 1.3, "3 3");
      dots += dot(x, y, C.blue);
    }
    return svg(axes("House size →", "↑ Price") + res + ln(40, line(40), 340, line(340), C.orange, 3) + dots +
      tx(330, line(330) - 12, "best-fit line", { a: "end", c: C.orange, b: 1 }) +
      tx(120, 40, "red dashes = errors", { c: C.red, s: 10 }), "Line through points");
  }

  function coefBars(after, title, col) {
    const before = [70, -50, 40, -30, 20];
    const panel = (vals, x0, name, c) => {
      let g = tx(x0 + 72, 16, name, { b: 1 }) + ln(x0, 100, x0 + 144, 100, "currentColor", 1, "", 0.4);
      vals.forEach((v, i) => {
        const x = x0 + 10 + i * 27;
        if (v === 0) {
          g += '<circle cx="' + (x + 9) + '" cy="100" r="5" fill="none" stroke="' + C.red + '" stroke-width="1.5"/>' +
            tx(x + 9, 88, "0", { c: C.red, b: 1, s: 10 });
        } else {
          g += '<rect x="' + x + '" y="' + (v > 0 ? 100 - v : 100) + '" width="18" height="' + Math.abs(v) + '" rx="3" fill="' + c + '" fill-opacity=".85"/>';
        }
        g += tx(x + 9, 190, "w" + (i + 1), { op: 0.7, s: 10 });
      });
      return g;
    };
    return svg(panel(before, 15, "Plain linear regression", C.grey) + arrow(165, 100, 193, 100) +
      panel(after, 200, title, col), title + " weights");
  }

  function logreg() {
    setSeed(11);
    const sig = (x) => 170 - 140 / (1 + Math.exp(-(x - 190) / 22));
    let p = "M40," + f(sig(40));
    for (let x = 45; x <= 340; x += 5) p += " L" + x + "," + f(sig(x));
    let d = "";
    for (let i = 0; i < 9; i++) d += dot(50 + i * 18 + jit(5), 170, C.blue);
    for (let i = 0; i < 9; i++) d += dot(185 + i * 18 + jit(5), 30, C.orange);
    return svg(axes("Score (e.g. income) →", "↑ Probability") +
      ln(30, 100, 350, 100, "currentColor", 1, "5 4", 0.5) + tx(345, 94, "0.5 threshold", { a: "end", s: 10, op: 0.8 }) +
      '<path d="' + p + '" fill="none" stroke="' + C.purple + '" stroke-width="3"/>' + d +
      tx(40, 24, "1 = Yes", { a: "start", c: C.orange, b: 1 }) + tx(40, 164, "0 = No", { a: "start", c: C.blue, b: 1 }),
    "S-shaped probability curve");
  }

  function tree() {
    return svg(
      ln(180, 40, 85, 80) + ln(180, 40, 280, 80) + ln(85, 110, 55, 150) + ln(85, 110, 165, 150) +
      tx(122, 62, "Yes", { c: C.green, b: 1, s: 10 }) + tx(240, 62, "No", { c: C.red, b: 1, s: 10 }) +
      tx(60, 134, "Yes", { c: C.green, b: 1, s: 10 }) + tx(135, 134, "No", { c: C.red, b: 1, s: 10 }) +
      box(120, 10, 120, 30, "Income &gt; 50k?", C.blue, { b: 1 }) +
      box(25, 80, 120, 30, "Credit &gt; 700?", C.blue, { b: 1 }) +
      box(230, 80, 100, 30, "❌ Reject", C.red) +
      box(10, 150, 95, 30, "✅ Approve", C.green) +
      box(120, 150, 95, 30, "🔍 Review", C.orange),
    "Decision tree flowchart");
  }

  function miniTree(cx, top, c) {
    const n = [[cx, top], [cx - 25, top + 32], [cx + 25, top + 32], [cx - 38, top + 64], [cx - 12, top + 64], [cx + 12, top + 64], [cx + 38, top + 64]];
    let g = ln(n[0][0], n[0][1], n[1][0], n[1][1], c, 1.5, "", 0.6) + ln(n[0][0], n[0][1], n[2][0], n[2][1], c, 1.5, "", 0.6) +
      ln(n[1][0], n[1][1], n[3][0], n[3][1], c, 1.5, "", 0.6) + ln(n[1][0], n[1][1], n[4][0], n[4][1], c, 1.5, "", 0.6) +
      ln(n[2][0], n[2][1], n[5][0], n[5][1], c, 1.5, "", 0.6) + ln(n[2][0], n[2][1], n[6][0], n[6][1], c, 1.5, "", 0.6);
    n.forEach((p) => { g += dot(p[0], p[1], c, 5); });
    return g;
  }

  function forest() {
    const votes = [["Yes", C.green], ["Yes", C.green], ["No", C.red]];
    let g = "";
    [70, 180, 290].forEach((cx, i) => {
      g += tx(cx, 12, "Tree " + (i + 1) + " (random data)", { s: 10, op: 0.7 }) + miniTree(cx, 24, C.green);
      g += box(cx - 25, 104, 50, 22, votes[i][0], votes[i][1], { b: 1 }) + arrow(cx, 128, 180 + (cx - 180) * 0.25, 156);
    });
    return svg(g + box(95, 160, 170, 30, "Majority vote → Yes ✅", C.blue, { b: 1 }), "Many trees voting");
  }

  function boost() {
    const errs = [90, 50, 20];
    let g = "";
    [20, 140, 260].forEach((x, i) => {
      g += box(x, 15, 80, 30, "Tree " + (i + 1), C.blue, { b: 1 });
      if (i < 2) g += arrow(x + 82, 30, x + 118, 30) + tx(x + 100, 22, "fixes", { s: 9, op: 0.75 });
      g += '<rect x="' + (x + 20) + '" y="' + (160 - errs[i]) + '" width="40" height="' + errs[i] + '" rx="4" fill="' + C.red + '" fill-opacity=".75"/>';
      g += tx(x + 40, 174, "error left", { s: 10, op: 0.75 });
    });
    return svg(g + tx(180, 195, "Prediction = Tree 1 + Tree 2 + Tree 3 + …", { b: 1 }), "Trees fixing errors in sequence");
  }

  function adaboost() {
    const P = [[0.2, 0.3, 0], [0.3, 0.75, 0], [0.12, 0.55, 0], [0.75, 0.25, 1], [0.85, 0.6, 1], [0.68, 0.82, 1], [0.6, 0.45, 0], [0.38, 0.2, 1]];
    const wrong = [6, 7];
    let g = "";
    const panels = [
      { x: 8, t: "Round 1", big: false, cuts: [["v", 0.5]] },
      { x: 126, t: "Round 2", big: true, cuts: [["v", 0.5, 0.25], ["h", 0.35]] },
      { x: 244, t: "Final: weighted vote", big: false, cuts: [["v", 0.5, 0.35], ["h", 0.35, 0.35], ["v", 0.66]] }
    ];
    panels.forEach((p, pi) => {
      const W = 108, H = 140, y0 = 26;
      g += tx(p.x + W / 2, 18, p.t, { b: 1, s: 10 });
      g += '<rect x="' + p.x + '" y="' + y0 + '" width="' + W + '" height="' + H + '" rx="6" fill="none" stroke="currentColor" stroke-opacity=".3"/>';
      p.cuts.forEach((c) => {
        g += c[0] === "v"
          ? ln(p.x + c[1] * W, y0, p.x + c[1] * W, y0 + H, C.purple, 2.2, "6 4", c[2])
          : ln(p.x, y0 + c[1] * H, p.x + W, y0 + c[1] * H, C.purple, 2.2, "6 4", c[2]);
      });
      P.forEach((q, i) => {
        const isWrong = wrong.indexOf(i) >= 0;
        const r = p.big && isWrong ? 9 : 4.5;
        const ring = pi === 0 && isWrong ? 'stroke="' + C.red + '" stroke-width="2.5"' : "";
        g += dot(p.x + q[0] * W, y0 + q[1] * H, q[2] ? C.orange : C.blue, r, ring);
      });
    });
    return svg(g + tx(180, 190, "Mistakes (red rings) get bigger weight → next stump focuses on them", { s: 10, op: 0.85 }), "AdaBoost rounds");
  }

  function catboost() {
    const cities = ["Delhi", "Mumbai", "Delhi", "Pune"], vals = ["0.62", "0.40", "0.58", "0.51"];
    let g = tx(55, 16, "Category", { b: 1, s: 10 }) + tx(165, 16, "Number", { b: 1, s: 10 });
    cities.forEach((c, i) => {
      const y = 26 + i * 30;
      g += box(15, y, 80, 24, c, C.orange) + arrow(98, y + 12, 122, y + 12) + box(125, y, 80, 24, vals[i], C.blue, { b: 1 });
    });
    g += tx(110, 160, "avg. target of earlier rows", { s: 10, op: 0.75 });
    // symmetric tree
    g += tx(290, 16, "Symmetric tree", { b: 1, s: 10 });
    g += ln(290, 40, 255, 85) + ln(290, 40, 325, 85) + ln(255, 85, 235, 135) + ln(255, 85, 275, 135) + ln(325, 85, 305, 135) + ln(325, 85, 345, 135);
    g += box(255, 26, 70, 26, "City &gt; .5?", C.purple, { s: 10 }) + box(222, 74, 66, 24, "Age &gt; 30?", C.purple, { s: 10 }) +
      box(292, 74, 66, 24, "Age &gt; 30?", C.purple, { s: 10 });
    [235, 275, 305, 345].forEach((x) => { g += dot(x, 140, C.green, 6); });
    g += tx(290, 160, "same question per level", { s: 10, op: 0.75 });
    return svg(g + tx(180, 190, "Categories → numbers, then balanced boosted trees", { b: 1 }), "CatBoost encoding and symmetric tree");
  }

  function knn() {
    setSeed(21);
    const pts = [];
    for (let i = 0; i < 12; i++) pts.push([clamp(110 + gauss(40), 40, 340), clamp(115 + gauss(35), 20, 175), 0]);
    for (let i = 0; i < 12; i++) pts.push([clamp(245 + gauss(40), 40, 340), clamp(85 + gauss(35), 20, 175), 1]);
    const q = [182, 100];
    const d = pts.map((p) => ({ p, d: Math.hypot(p[0] - q[0], p[1] - q[1]) })).sort((a, b) => a.d - b.d).slice(0, 5);
    const nOrange = d.filter((x) => x.p[2] === 1).length;
    const win = nOrange >= 3 ? "orange" : "blue";
    let g = '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + f(d[4].d + 8) + '" fill="' + C.purple + '" fill-opacity=".08" stroke="' + C.purple + '" stroke-dasharray="5 4"/>';
    d.forEach((x) => { g += ln(q[0], q[1], x.p[0], x.p[1], C.purple, 1.2, "", 0.7); });
    pts.forEach((p) => { g += dot(p[0], p[1], p[2] ? C.orange : C.blue); });
    g += star(q[0], q[1], 10, C.purple);
    return svg(g + tx(180, 195, "New ★: " + nOrange + " of its 5 nearest are orange → predict " + win, { b: 1 }), "Nearest neighbours");
  }

  function nb() {
    let g = '<rect x="15" y="45" width="90" height="62" rx="6" fill="' + C.blue + '" fill-opacity=".12" stroke="' + C.blue + '" stroke-width="1.5"/>' +
      '<path d="M15,47 L60,82 L105,47" fill="none" stroke="' + C.blue + '" stroke-width="1.5"/>' + tx(60, 125, "New email", { b: 1 });
    g += tx(225, 16, "How often each word appears in…", { s: 10, op: 0.75 });
    g += '<rect x="170" y="24" width="10" height="10" fill="' + C.red + '"/>' + tx(184, 33, "Spam", { a: "start", s: 10 }) +
      '<rect x="235" y="24" width="10" height="10" fill="' + C.green + '"/>' + tx(249, 33, "Normal mail", { a: "start", s: 10 });
    [["FREE", 0.8, 0.1], ["WINNER", 0.7, 0.05], ["meeting", 0.1, 0.6]].forEach((w, i) => {
      const y = 50 + i * 38;
      g += tx(160, y + 12, w[0], { a: "end", b: 1 });
      g += '<rect x="170" y="' + y + '" width="' + w[1] * 160 + '" height="10" rx="3" fill="' + C.red + '"/>';
      g += '<rect x="170" y="' + (y + 13) + '" width="' + w[2] * 160 + '" height="10" rx="3" fill="' + C.green + '"/>';
    });
    g += arrow(110, 76, 125, 76);
    return svg(g + box(110, 165, 200, 28, "Multiply the clues → Spam 97% 🚫", C.red, { b: 1 }), "Word probabilities");
  }

  function svm() {
    setSeed(5);
    const bx = (y) => 70 + ((180 - y) * 250) / 165;
    let g = ln(bx(180) - 30, 180, bx(15) - 30, 15, C.blue, 1.3, "5 4", 0.8) + ln(bx(180) + 30, 180, bx(15) + 30, 15, C.orange, 1.3, "5 4", 0.8) +
      ln(bx(180), 180, bx(15), 15, C.purple, 3);
    for (let i = 0; i < 11; i++) { const y = 25 + rnd() * 150; g += dot(clamp(bx(y) - 40 - rnd() * 80, 35, 345), y, C.blue); }
    for (let i = 0; i < 11; i++) { const y = 25 + rnd() * 150; g += dot(clamp(bx(y) + 40 + rnd() * 80, 35, 345), y, C.orange); }
    [[bx(130) - 30, 130, C.blue], [bx(60) - 30, 60, C.blue], [bx(95) + 30, 95, C.orange]].forEach((s) => {
      g += dot(s[0], s[1], s[2]) + '<circle cx="' + f(s[0]) + '" cy="' + f(s[1]) + '" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>';
    });
    const my = 160;
    g += '<line x1="' + f(bx(my) - 30) + '" y1="' + my + '" x2="' + f(bx(my) + 30) + '" y2="' + my + '" stroke="currentColor" stroke-width="1.5" marker-start="url(#algoArrow)" marker-end="url(#algoArrow)"/>';
    g += tx(bx(my) + 36, my + 4, "widest gap (margin)", { a: "start", s: 10, b: 1 });
    return svg(g + tx(20, 195, "◯ = support vectors (the only points that matter)", { a: "start", s: 10, op: 0.85 }), "Maximum margin line");
  }

  function kmeans() {
    setSeed(9);
    const cs = [[90, 60, C.blue], [265, 70, C.orange], [175, 145, C.green]];
    let g = "";
    cs.forEach((c) => {
      for (let i = 0; i < 13; i++) {
        const x = clamp(c[0] + gauss(28), 15, 345), y = clamp(c[1] + gauss(22), 10, 185);
        g += ln(x, y, c[0], c[1], c[2], 1, "", 0.25) + dot(x, y, c[2]);
      }
    });
    cs.forEach((c) => { g += cross(c[0], c[1], "currentColor", 7); });
    return svg(g + tx(345, 195, "✕ = cluster centers (K = 3)", { a: "end", s: 10, b: 1 }), "Three clusters with centers");
  }

  function dbscan() {
    setSeed(13);
    let g = tx(95, 14, "DBSCAN", { b: 1 }) + tx(275, 14, "Hierarchical", { b: 1 });
    for (let i = 0; i < 22; i++) {
      const a = Math.PI * (0.1 + 0.8 * (i / 21)), r = 55 + jit(6);
      g += dot(95 + r * Math.cos(a), 45 + r * Math.sin(a), C.blue, 4);
    }
    for (let i = 0; i < 10; i++) g += dot(55 + gauss(12), 160 + gauss(9), C.orange, 4);
    [[20, 30], [170, 40], [160, 175], [25, 120], [175, 130]].forEach((p) => { g += cross(p[0], p[1], C.grey, 4); });
    g += tx(140, 178, "✕ noise", { s: 10, c: C.grey, b: 1 });
    g += ln(190, 20, 190, 185, "currentColor", 1, "3 4", 0.3);
    // dendrogram
    const Y = 175, L = [210, 235, 260, 290, 315, 340];
    const u = (x1, x2, y1a, y1b, y, c) => ln(x1, y1a, x1, y, c, 2) + ln(x2, y1b, x2, y, c, 2) + ln(x1, y, x2, y, c, 2);
    g += u(L[0], L[1], Y, Y, 150, C.blue) + u((L[0] + L[1]) / 2, L[2], 150, Y, 120, C.blue) +
      u(L[3], L[4], Y, Y, 140, C.orange) + u((L[3] + L[4]) / 2, L[5], 140, Y, 110, C.orange) +
      u(((L[0] + L[1]) / 2 + L[2]) / 2, ((L[3] + L[4]) / 2 + L[5]) / 2, 120, 110, 55, C.grey);
    L.forEach((x, i) => { g += tx(x, 190, String.fromCharCode(65 + i), { s: 10, op: 0.75 }); });
    g += ln(198, 90, 352, 90, C.red, 1.5, "5 4") + tx(350, 84, "cut → 2 clusters", { a: "end", s: 10, c: C.red, b: 1 });
    return svg(g, "Density clusters and dendrogram");
  }

  function pca() {
    setSeed(17);
    const cx = 180, cy = 100, u = [0.92, -0.39], v = [0.39, 0.92];
    let g = "";
    for (let i = 0; i < 40; i++) {
      const t = jit(1) * 140, s = gauss(16);
      g += dot(cx + t * u[0] + s * v[0], cy + t * u[1] + s * v[1], C.blue, 3.8, 'fill-opacity=".75"');
    }
    g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + f(cx + 150 * u[0]) + '" y2="' + f(cy + 150 * u[1]) + '" stroke="' + C.orange + '" stroke-width="4" marker-end="url(#algoArrow)"/>';
    g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + f(cx - 42 * v[0]) + '" y2="' + f(cy - 42 * v[1]) + '" stroke="' + C.green + '" stroke-width="4" marker-end="url(#algoArrow)"/>';
    g += tx(cx + 150 * u[0], cy + 150 * u[1] - 10, "PC1: most spread", { a: "end", c: C.orange, b: 1 });
    g += tx(cx - 46 * v[0] - 4, cy - 46 * v[1] - 4, "PC2", { a: "end", c: C.green, b: 1 });
    return svg(axes("Feature 1 →", "↑ Feature 2") + g + tx(345, 170, "Keep PC1 → 2 columns become 1", { a: "end", s: 10, op: 0.85 }), "Principal components");
  }

  function iforest() {
    setSeed(19);
    let g = '<rect x="20" y="20" width="320" height="155" rx="6" fill="none" stroke="currentColor" stroke-opacity=".35"/>';
    [[90, 20, 90, 175], [20, 130, 280, 130], [200, 20, 200, 175], [90, 85, 200, 85], [140, 85, 140, 175], [200, 105, 280, 105], [160, 130, 160, 175]].forEach((c) => {
      g += ln(c[0], c[1], c[2], c[3], C.grey, 1.2, "4 4", 0.8);
    });
    for (let i = 0; i < 28; i++) g += dot(clamp(150 + gauss(32), 30, 270), clamp(115 + gauss(22), 30, 170), C.blue, 4);
    g += ln(280, 20, 280, 175, C.red, 2.5) + ln(280, 70, 340, 70, C.red, 2.5);
    g += tx(286, 165, "cut 1", { a: "start", c: C.red, s: 10, b: 1 }) + tx(336, 84, "cut 2", { a: "end", c: C.red, s: 10, b: 1 });
    g += dot(312, 42, C.red, 6, 'stroke="currentColor" stroke-width="1.5"');
    g += tx(26, 34, "Normal points: need many cuts", { a: "start", s: 10, op: 0.85 });
    return svg(g + tx(180, 195, "The odd one out (red) is isolated in just 2 random cuts → anomaly", { b: 1, s: 10 }), "Isolation by random cuts");
  }

  function hbos() {
    const h = [8, 22, 55, 95, 130, 120, 85, 45, 18, 0, 6];
    let g = axes("Feature value (e.g. transaction amount) →", "↑ How many");
    h.forEach((v, i) => {
      if (!v) return;
      const x = 36 + i * 28, rare = i === 10;
      g += '<rect x="' + x + '" y="' + (180 - v) + '" width="24" height="' + v + '" rx="3" fill="' + (rare ? C.red : C.blue) + '" fill-opacity="' + (rare ? 1 : 0.75) + '"/>';
    });
    const rx = 36 + 10 * 28 + 12;
    g += dot(rx, 160, "currentColor", 4) + arrow(rx - 40, 110, rx - 4, 165);
    g += tx(rx - 44, 104, "rare bin → high outlier score", { a: "end", c: C.red, b: 1, s: 10 });
    g += tx(140, 30, "common values = tall bars = normal", { s: 10, op: 0.85 });
    return svg(g, "Histogram with rare bin");
  }

  function nn() {
    const layers = [[3, 55, C.blue, "Inputs"], [4, 145, C.purple, "Hidden"], [4, 235, C.purple, "Hidden"], [2, 320, C.orange, "Output"]];
    const pos = layers.map((l) => Array.from({ length: l[0] }, (_, i) => [l[1], 95 + (i - (l[0] - 1) / 2) * 38]));
    let g = "";
    for (let k = 0; k < pos.length - 1; k++) pos[k].forEach((a) => pos[k + 1].forEach((b) => { g += ln(a[0], a[1], b[0], b[1], "currentColor", 1, "", 0.22); }));
    pos.forEach((col, k) => {
      col.forEach((p) => { g += '<circle cx="' + p[0] + '" cy="' + f(p[1]) + '" r="11" fill="' + layers[k][2] + '" fill-opacity=".85" stroke="currentColor" stroke-opacity=".4"/>'; });
      g += tx(layers[k][1], 185, layers[k][3], { b: 1, s: 10 });
    });
    ["size", "rooms", "age"].forEach((s, i) => { g += tx(38, pos[0][i][1] + 4, s, { a: "end", s: 9, op: 0.8 }); });
    ["Yes", "No"].forEach((s, i) => { g += tx(337, pos[3][i][1] + 4, s, { a: "start", s: 9, op: 0.8 }); });
    return svg(g + tx(190, 18, "Signals flow left → right; weights on each line are learned", { s: 10, op: 0.85 }), "Neural network layers");
  }

  const V = {
    linreg: [linreg, "The model finds the line that makes the red error lines as short as possible."],
    ridge: [() => coefBars([45, -32, 26, -18, 12], "Ridge (L2)", C.blue), "Ridge shrinks every weight a bit, but keeps all features."],
    lasso: [() => coefBars([55, 0, 25, 0, 0], "Lasso (L1)", C.orange), "Lasso shrinks weights and switches weak features off (exactly 0)."],
    elastic: [() => coefBars([50, -15, 22, 0, 0], "Elastic Net (L1 + L2)", C.purple), "Elastic Net does both: shrinks some, removes others."],
    logreg: [logreg, "Scores are squeezed into a 0–1 probability; above 0.5 means \"Yes\"."],
    tree: [tree, "Answer one question at a time until you reach a decision (a leaf)."],
    forest: [forest, "Each tree sees slightly different data; together they vote."],
    boost: [boost, "Each new tree learns from the previous trees' mistakes, so the error shrinks."],
    adaboost: [adaboost, "Tiny one-line models take turns; wrongly classified points become \"heavier\"."],
    catboost: [catboost, "Text categories become smart numbers, then balanced trees are boosted."],
    knn: [knn, "Look at the closest neighbours and follow the majority."],
    nb: [nb, "Each word is a clue; the probabilities of all clues are combined."],
    svm: [svm, "Pick the dividing line with the widest empty road between the two groups."],
    kmeans: [kmeans, "Points join the nearest center; centers move to the middle of their group."],
    dbscan: [dbscan, "DBSCAN follows dense areas (any shape) and marks loners as noise. Hierarchical builds a family tree of groups."],
    pca: [pca, "Find the direction with the most spread and describe the data along it."],
    iforest: [iforest, "Random cuts isolate unusual points very quickly."],
    hbos: [hbos, "Values that land in nearly empty histogram bars are suspicious."],
    nn: [nn, "Layers of neurons pass signals forward; training adjusts the weights."]
  };

  const out = {};
  Object.keys(V).forEach((k) => {
    try { out[k] = { svg: V[k][0](), caption: V[k][1] }; } catch (e) { /* skip a broken diagram rather than break the slide */ }
  });
  window.ALGO_VISUALS = out;
})();
