(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable (e.g. private mode) */ }
    },
  };

  // Deterministic random numbers so demos are reproducible until "New data" is clicked.
  function rng(seed) {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function gauss(rand) {
    const u = Math.max(rand(), 1e-9);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  }

  /* =====================================================================
   * NAVIGATION
   * ===================================================================== */
  const slides = $$(".slide");
  const nav = $("#nav");
  const slideHooks = {};
  let current = 0;

  let lastGroup = null;
  slides.forEach((s, i) => {
    const group = s.dataset.group;
    if (group !== lastGroup) {
      const g = document.createElement("div");
      g.className = "nav-group";
      g.textContent = group;
      nav.appendChild(g);
      lastGroup = group;
    }
    const b = document.createElement("button");
    b.innerHTML = `<span class="num">${i + 1}</span><span>${s.dataset.icon || ""} ${s.dataset.title}</span>`;
    b.addEventListener("click", () => { show(i); document.body.classList.remove("nav-open"); });
    nav.appendChild(b);

    const footer = document.createElement("div");
    footer.className = "slide-footer";
    const prev = slides[i - 1], next = slides[i + 1];
    footer.innerHTML =
      (prev ? `<button class="btn" data-goto="${i - 1}">← ${prev.dataset.title}</button>` : "<span></span>") +
      (next ? `<button class="btn primary" data-goto="${i + 1}">${next.dataset.title} →</button>` : "<span></span>");
    s.appendChild(footer);
  });
  const navButtons = $$("button", nav);

  function show(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    current = i;
    slides.forEach((s, k) => s.classList.toggle("active", k === i));
    navButtons.forEach((b, k) => b.classList.toggle("active", k === i));
    navButtons[i].scrollIntoView({ block: "nearest" });
    $("#progressBar").style.width = `${((i + 1) / slides.length) * 100}%`;
    $("#counter").textContent = `${i + 1} / ${slides.length}`;
    if (location.hash !== `#${i + 1}`) history.replaceState(null, "", `#${i + 1}`);
    window.scrollTo({ top: 0 });
    const hook = slideHooks[slides[i].dataset.title];
    if (hook) hook();
  }

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-goto],[data-goto-id]");
    if (!t) return;
    e.preventDefault();
    if (t.dataset.goto !== undefined) show(+t.dataset.goto);
    else show(slides.indexOf(document.getElementById(t.dataset.gotoId)));
  });

  document.addEventListener("keydown", (e) => {
    if (e.target.closest?.("input, textarea, select")) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (["ArrowRight", "PageDown"].includes(e.key)) { e.preventDefault(); show(current + 1); }
    else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); show(current - 1); }
    else if (e.key === "Home") show(0);
    else if (e.key === "End") show(slides.length - 1);
    else if (e.key.toLowerCase() === "p") togglePresent();
  });

  function togglePresent() {
    const on = document.body.classList.toggle("present");
    $("#presentBtn").textContent = on ? "■ Exit" : "▶ Present";
    try {
      if (on && !document.fullscreenElement) document.documentElement.requestFullscreen?.()?.catch(() => {});
      else if (!on && document.fullscreenElement) document.exitFullscreen?.()?.catch(() => {});
    } catch { /* fullscreen not allowed */ }
  }
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && document.body.classList.contains("present")) {
      document.body.classList.remove("present");
      $("#presentBtn").textContent = "▶ Present";
    }
  });
  $("#presentBtn").addEventListener("click", togglePresent);
  $("#menuBtn").addEventListener("click", () => {
    if (window.innerWidth <= 760) document.body.classList.toggle("nav-open");
    else document.body.classList.toggle("present");
  });

  const theme = store.get("mlTheme", "dark");
  document.documentElement.dataset.theme = theme;
  $("#themeBtn").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    store.set("mlTheme", next);
    const hook = slideHooks[slides[current].dataset.title];
    if (hook) hook();
  });

  /* =====================================================================
   * AI CIRCLES
   * ===================================================================== */
  const circleData = {
    ai: {
      t: "🤖 Artificial Intelligence",
      d: "The broadest idea: any technique that makes computers do things that seem 'smart' — including hand-written rules.",
      e: ["Chess programs from the 1990s", "Rule-based customer-service bots", "Route planners"],
    },
    ml: {
      t: "📈 Machine Learning",
      d: "A subset of AI where the computer learns patterns from data instead of being given rules.",
      e: ["Spam filters", "House-price prediction", "Fraud detection", "Product recommendations"],
    },
    dl: {
      t: "🕸️ Deep Learning",
      d: "A subset of ML using large 'neural networks' with many layers. Shines on messy data like images, audio and text, given lots of data and computing power.",
      e: ["Face unlock", "Voice assistants", "Self-driving perception", "Medical image analysis"],
    },
    gen: {
      t: "✨ Generative AI & LLMs",
      d: "Deep-learning models that create new content. Large Language Models (LLMs) are trained on huge amounts of text to predict the next word.",
      e: ["ChatGPT / Copilot", "Image generators", "Code assistants", "AI agents"],
    },
  };
  function showCircle(k) {
    const c = circleData[k];
    $$(".circle").forEach((el) => el.classList.toggle("sel", el.dataset.k === k));
    $("#circleInfo").innerHTML = `<h3>${c.t}</h3><p>${c.d}</p><p class="small muted"><b>Examples:</b></p>${c.e.map((x) => `<span class="tag">${x}</span>`).join("")}
      <div class="callout analogy small">Like Russian nesting dolls: all Generative AI is Deep Learning, all Deep Learning is Machine Learning, and all Machine Learning is AI — but not the other way round.</div>`;
  }
  $$(".circle").forEach((el) => el.addEventListener("click", () => showCircle(el.dataset.k)));
  showCircle("ml");

  /* =====================================================================
   * LIFECYCLE PIPELINE
   * ===================================================================== */
  const steps = [
    { e: "🎯", t: "Define the problem", what: "Turn a business question into an ML question, and decide how success will be measured. Sometimes the answer is 'we don't need ML'.",
      ex: "A real-estate site wants to show a fair 'estimated price' on every listing. ML task: <b>regression</b> — predict price. Success: typical error under 5%.",
      out: "Problem statement, success metric, constraints (speed, cost, fairness)", tools: ["Stakeholder interviews", "Docs"], who: "DS · Product" },
    { e: "📥", t: "Collect data", what: "Gather the examples the model will learn from — from databases, logs, APIs, public datasets or by labelling new data.",
      ex: "Pull 50,000 past house sales: size, bedrooms, location, age, amenities and final sale price.",
      out: "Raw dataset(s)", tools: ["SQL", "APIs", "Web scraping", "Kaggle"], who: "DS · Data Eng" },
    { e: "🧽", t: "Clean data", what: "Fix the mess: missing values, duplicates, typos, wrong units, impossible values.",
      ex: "Remove a '95,000 sq ft' typo, fill missing 'age' with the median, merge 'Bangalore' and 'Bengaluru'.",
      out: "Clean, trustworthy dataset", tools: ["pandas", "SQL"], who: "DS" },
    { e: "📊", t: "Explore (EDA)", what: "Exploratory Data Analysis: use charts and statistics to understand the data and form hypotheses.",
      ex: "Discover price rises with size, city matters hugely, and very old houses sell cheaper — except heritage homes.",
      out: "Insights, charts, list of useful features", tools: ["pandas", "Matplotlib", "Seaborn", "Power BI"], who: "DS" },
    { e: "🛠️", t: "Feature engineering", what: "Turn raw columns into helpful clues (features) that make patterns easier to learn. Convert text and categories into numbers.",
      ex: "Create 'distance to nearest metro', 'age bucket', and convert 'city' into numeric columns (one-hot encoding). Scale numbers to similar ranges.",
      out: "Model-ready feature table", tools: ["pandas", "scikit-learn"], who: "DS · MLE" },
    { e: "🧪", t: "Choose a model", what: "Start with a simple baseline, then try a few candidate algorithms suited to the problem and data size.",
      ex: "Baseline: 'average price per sq ft in that city'. Candidates: linear regression, random forest, XGBoost.",
      out: "Shortlist of models to train", tools: ["scikit-learn", "XGBoost", "PyTorch"], who: "DS · MLE" },
    { e: "🏋️", t: "Train", what: "Feed the training data to the algorithm so it adjusts its internal settings (parameters) to reduce error. Tune 'hyperparameters' (knobs you set) using validation data.",
      ex: "Train XGBoost on 70% of sales; try different tree depths and learning rates; keep the best on validation data.",
      out: "Trained model file", tools: ["scikit-learn", "XGBoost", "PyTorch", "GPU / cloud"], who: "DS · MLE" },
    { e: "📏", t: "Evaluate", what: "Measure performance on the untouched test set using the success metric from step 1. Check errors for different groups and edge cases.",
      ex: "Test error: ±4.2% on average ✅. But 12% error for luxury villas — flag that as a known limitation.",
      out: "Metrics report, go / no-go decision", tools: ["scikit-learn metrics", "SHAP"], who: "DS · MLE" },
    { e: "🚀", t: "Deploy", what: "Put the model into production so real users or systems can get predictions — usually behind an API.",
      ex: "Wrap the model in a FastAPI service in Docker, deploy to the cloud; the website calls it to show 'Estimated price'.",
      out: "Live prediction service", tools: ["FastAPI", "Docker", "Kubernetes", "Azure ML / SageMaker"], who: "MLE · AI Eng" },
    { e: "🩺", t: "Monitor & improve", what: "Watch the model in the real world: accuracy, speed, cost and data drift. Retrain when performance drops.",
      ex: "Six months later, prices rise with inflation and errors creep up to 9% → alert fires → retrain on recent sales.",
      out: "Dashboards, alerts, retrained versions", tools: ["MLflow", "Prometheus / Grafana", "Evidently"], who: "MLE" },
  ];
  const pipeline = $("#pipeline");
  steps.forEach((s, i) => {
    const b = document.createElement("button");
    b.className = "pstep";
    b.innerHTML = `<span class="n">STEP ${i + 1}</span><span class="e">${s.e}</span><span class="t">${s.t}</span>`;
    b.addEventListener("click", () => showStep(i));
    pipeline.appendChild(b);
  });
  function showStep(i) {
    const s = steps[i];
    $$(".pstep").forEach((el, k) => el.classList.toggle("active", k === i));
    $("#pdetail").innerHTML = `
      <div class="card tint-purple">
        <div class="eyebrow">Step ${i + 1} of ${steps.length}</div>
        <h3 style="font-size:22px">${s.e} ${s.t}</h3>
        <p>${s.what}</p>
        <div class="callout" style="margin-bottom:0"><b>🏠 In our house-price example:</b><br />${s.ex}</div>
      </div>
      <div class="card">
        <p class="small muted">OUTPUT OF THIS STEP</p><p>${s.out}</p>
        <p class="small muted">TYPICAL TOOLS</p><p>${s.tools.map((t) => `<span class="tag">${t}</span>`).join("")}</p>
        <p class="small muted">WHO USUALLY OWNS IT</p><p>${s.who}</p>
        <div class="controls">
          <button class="btn small" ${i === 0 ? "disabled" : ""} data-step="${i - 1}">← Prev step</button>
          <button class="btn small primary" ${i === steps.length - 1 ? "disabled" : ""} data-step="${i + 1}">Next step →</button>
        </div>
      </div>`;
    $$("[data-step]", $("#pdetail")).forEach((b) => b.addEventListener("click", () => showStep(+b.dataset.step)));
  }
  showStep(0);

  /* =====================================================================
   * CANVAS HELPERS
   * ===================================================================== */
  function makePlot(canvas, xr, yr, pad = { l: 60, r: 20, t: 20, b: 46 }) {
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const px = (x) => pad.l + ((x - xr[0]) / (xr[1] - xr[0])) * (W - pad.l - pad.r);
    const py = (y) => H - pad.b - ((y - yr[0]) / (yr[1] - yr[0])) * (H - pad.t - pad.b);
    function axes(xlabel, ylabel, xticks, yticks, fmtX = (v) => v, fmtY = (v) => v) {
      ctx.clearRect(0, 0, W, H);
      ctx.font = "13px Segoe UI, system-ui, sans-serif";
      ctx.strokeStyle = cssVar("--border");
      ctx.fillStyle = cssVar("--muted");
      ctx.lineWidth = 1;
      xticks.forEach((v) => {
        ctx.beginPath(); ctx.moveTo(px(v), pad.t); ctx.lineTo(px(v), H - pad.b); ctx.stroke();
        ctx.textAlign = "center"; ctx.fillText(fmtX(v), px(v), H - pad.b + 18);
      });
      yticks.forEach((v) => {
        ctx.beginPath(); ctx.moveTo(pad.l, py(v)); ctx.lineTo(W - pad.r, py(v)); ctx.stroke();
        ctx.textAlign = "right"; ctx.fillText(fmtY(v), pad.l - 8, py(v) + 4);
      });
      ctx.textAlign = "center";
      ctx.fillText(xlabel, (pad.l + W - pad.r) / 2, H - 8);
      ctx.save(); ctx.translate(16, (pad.t + H - pad.b) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(ylabel, 0, 0); ctx.restore();
    }
    function clip(fn) {
      ctx.save();
      ctx.beginPath(); ctx.rect(pad.l, pad.t, W - pad.l - pad.r, H - pad.t - pad.b); ctx.clip();
      fn(); ctx.restore();
    }
    function dot(x, y, color, r = 6) {
      ctx.beginPath(); ctx.arc(px(x), py(y), r, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.lineWidth = 1; ctx.stroke();
    }
    return { ctx, px, py, axes, clip, dot };
  }

  /* =====================================================================
   * DEMO 1: GRADIENT DESCENT
   * ===================================================================== */
  const gd = (() => {
    const canvas = $("#gdCanvas");
    const plot = makePlot(canvas, [500, 3000], [0, 200]);
    const LRS = [
      { v: 0.02, label: "0.02 — very low (slow)" },
      { v: 0.3, label: "0.3 — good" },
      { v: 0.7, label: "0.7 — high (wobbly)" },
      { v: 0.9, label: "0.9 — too high (explodes!)" },
    ];
    const Y_SCALE = 200;
    let seed = 7, pts = [], w, b, iter, timer = null, initRmse = 1;

    const norm = (x) => (x - 500) / 2500;
    function makeData() {
      const r = rng(seed);
      pts = Array.from({ length: 30 }, () => {
        const x = 600 + r() * 2300;
        const y = 0.055 * x + 12 + gauss(r) * 12;
        return { x, y: Math.max(5, y) };
      });
    }
    function mse() {
      return pts.reduce((s, p) => s + (w * norm(p.x) + b - p.y / Y_SCALE) ** 2, 0) / pts.length;
    }
    function reset() {
      stop();
      w = -0.4; b = 0.75; iter = 0;
      initRmse = Math.sqrt(mse()) * Y_SCALE;
      draw();
    }
    function step() {
      const lr = LRS[+$("#gdLr").value].v;
      let dw = 0, db = 0;
      pts.forEach((p) => {
        const err = w * norm(p.x) + b - p.y / Y_SCALE;
        dw += err * norm(p.x); db += err;
      });
      w -= lr * (2 / pts.length) * dw;
      b -= lr * (2 / pts.length) * db;
      iter++;
      draw();
      const rmse = Math.sqrt(mse()) * Y_SCALE;
      if (iter >= 400 || !isFinite(rmse) || rmse > 1e5) stop();
    }
    function play() {
      if (timer) { stop(); return; }
      timer = setInterval(step, 50);
      $("#gdPlay").textContent = "⏸ Pause";
    }
    function stop() {
      clearInterval(timer); timer = null;
      $("#gdPlay").textContent = "▶ Train";
    }
    const lineY = (x) => (w * norm(x) + b) * Y_SCALE;
    function draw() {
      plot.axes("House size (sq ft)", "Price (₹ lakh)", [500, 1000, 1500, 2000, 2500, 3000], [0, 50, 100, 150, 200]);
      const ctx = plot.ctx;
      plot.clip(() => {
        ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(248,113,113,.7)"; ctx.lineWidth = 1.5;
        pts.forEach((p) => { ctx.beginPath(); ctx.moveTo(plot.px(p.x), plot.py(p.y)); ctx.lineTo(plot.px(p.x), plot.py(lineY(p.x))); ctx.stroke(); });
        ctx.setLineDash([]);
        ctx.strokeStyle = cssVar("--accent-2"); ctx.lineWidth = 3.5;
        ctx.beginPath(); ctx.moveTo(plot.px(500), plot.py(lineY(500))); ctx.lineTo(plot.px(3000), plot.py(lineY(3000))); ctx.stroke();
      });
      pts.forEach((p) => plot.dot(p.x, p.y, cssVar("--accent")));
      ctx.fillStyle = cssVar("--muted"); ctx.textAlign = "left"; ctx.font = "12px Segoe UI, sans-serif";
      ctx.fillText("Red dashes = error for each house", 70, 36);

      const rmse = Math.sqrt(mse()) * Y_SCALE;
      const slope = (w * Y_SCALE) / 2500;
      const intercept = Y_SCALE * (b - (w * 500) / 2500);
      $("#gdIter").textContent = iter;
      $("#gdEq").textContent = isFinite(slope) && Math.abs(slope) < 1e6
        ? `price = ${slope.toFixed(3)}×size ${intercept >= 0 ? "+" : "−"} ${Math.abs(intercept).toFixed(1)}`
        : "💥 diverged";
      $("#gdLoss").textContent = isFinite(rmse) && rmse < 1e6 ? `±₹${rmse.toFixed(1)} L` : "∞ 💥";
      $("#gdLossBar").style.width = `${Math.min(100, isFinite(rmse) ? (rmse / initRmse) * 100 : 100)}%`;
    }
    function updateLr() { $("#lrVal").textContent = LRS[+$("#gdLr").value].label; }

    $("#gdPlay").addEventListener("click", play);
    $("#gdStep").addEventListener("click", () => { stop(); step(); });
    $("#gdReset").addEventListener("click", reset);
    $("#gdNew").addEventListener("click", () => { seed = Math.floor(Math.random() * 1e9); makeData(); reset(); });
    $("#gdLr").addEventListener("input", updateLr);
    makeData(); updateLr(); reset();
    return { draw, stop };
  })();
  slideHooks["Demo: How a Model Learns"] = () => gd.draw();

  /* =====================================================================
   * DEMO 2: OVERFITTING (polynomial fit with Legendre basis for stability)
   * ===================================================================== */
  const fit = (() => {
    const canvas = $("#fitCanvas");
    const plot = makePlot(canvas, [0, 1], [-2, 2]);
    const truth = (x) => Math.sin(2 * Math.PI * x);
    let seed = 11, train = [], test = [], coef = [];

    function basis(x, d) {
      const t = 2 * x - 1;
      const P = [1, t];
      for (let n = 1; n < d; n++) P.push(((2 * n + 1) * t * P[n] - n * P[n - 1]) / (n + 1));
      return P.slice(0, d + 1);
    }
    function solve(A, y) {
      const n = y.length;
      const M = A.map((row, i) => [...row, y[i]]);
      for (let c = 0; c < n; c++) {
        let p = c;
        for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
        [M[c], M[p]] = [M[p], M[c]];
        if (Math.abs(M[c][c]) < 1e-14) continue;
        for (let r = 0; r < n; r++) {
          if (r === c) continue;
          const f = M[r][c] / M[c][c];
          for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
        }
      }
      return M.map((row, i) => (Math.abs(row[i]) < 1e-14 ? 0 : row[n] / row[i]));
    }
    function fitPoly(d) {
      const X = train.map((p) => basis(p.x, d));
      const k = d + 1;
      const A = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => X.reduce((s, r) => s + r[i] * r[j], 0) + (i === j ? 1e-9 : 0)));
      const yv = Array.from({ length: k }, (_, i) => X.reduce((s, r, n) => s + r[i] * train[n].y, 0));
      coef = solve(A, yv);
    }
    const predict = (x) => basis(x, coef.length - 1).reduce((s, v, i) => s + v * coef[i], 0);
    const rmse = (set) => Math.sqrt(set.reduce((s, p) => s + (predict(p.x) - p.y) ** 2, 0) / set.length);

    function makeData() {
      const r = rng(seed);
      const mk = (n) => Array.from({ length: n }, (_, i) => {
        const x = (i + 0.15 + r() * 0.7) / n;
        return { x, y: truth(x) + gauss(r) * 0.25 };
      });
      train = mk(14); test = mk(14);
    }
    function draw() {
      const d = +$("#degree").value;
      $("#degVal").textContent = `${d}${d === 1 ? " (a straight line)" : ""}`;
      fitPoly(d);
      plot.axes("Input (x)", "Output (y)", [0, 0.25, 0.5, 0.75, 1], [-2, -1, 0, 1, 2]);
      const ctx = plot.ctx;
      plot.clip(() => {
        ctx.setLineDash([6, 6]); ctx.strokeStyle = cssVar("--muted"); ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i <= 200; i++) { const x = i / 200; i ? ctx.lineTo(plot.px(x), plot.py(truth(x))) : ctx.moveTo(plot.px(x), plot.py(truth(x))); }
        ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = cssVar("--accent-2"); ctx.lineWidth = 3.5;
        ctx.beginPath();
        for (let i = 0; i <= 400; i++) {
          const x = i / 400;
          const y = Math.max(-50, Math.min(50, predict(x)));
          i ? ctx.lineTo(plot.px(x), plot.py(y)) : ctx.moveTo(plot.px(x), plot.py(y));
        }
        ctx.stroke();
      });
      train.forEach((p) => plot.dot(p.x, p.y, cssVar("--accent")));
      test.forEach((p) => plot.dot(p.x, p.y, cssVar("--yellow"), 5));
      ctx.fillStyle = cssVar("--muted"); ctx.textAlign = "left"; ctx.font = "12px Segoe UI, sans-serif";
      ctx.fillText("Dashed grey = the true pattern (unknown in real life)", 70, 36);

      const tr = rmse(train), te = rmse(test);
      $("#trErr").textContent = tr.toFixed(3);
      $("#teErr").textContent = te > 99 ? "> 99 💥" : te.toFixed(3);
      const v = $("#fitVerdict");
      if (tr > 0.4) { v.className = "verdict meh"; v.textContent = "😴 Underfitting — the model is too simple to capture the curve."; }
      else if (te > 1.5 * tr && te > 0.38) { v.className = "verdict bad"; v.textContent = "🤓 Overfitting — tiny training error, but it fails on new data!"; }
      else { v.className = "verdict good"; v.textContent = "🎯 Good fit — it learned the real pattern and generalises."; }
    }
    $("#degree").addEventListener("input", draw);
    $("#fitNew").addEventListener("click", () => { seed = Math.floor(Math.random() * 1e9); makeData(); draw(); });
    makeData(); draw();
    return { draw };
  })();
  slideHooks["Demo: Overfitting"] = () => fit.draw();

  /* =====================================================================
   * DEMO 3: THRESHOLD / CONFUSION MATRIX
   * ===================================================================== */
  const emails = [
    ...[98, 91, 85, 77, 66, 54, 42, 31].map((s) => ({ s, spam: true })),
    ...[72, 61, 48, 39, 28, 22, 17, 12, 9, 6, 4, 2].map((s) => ({ s, spam: false })),
  ].sort((a, b) => b.s - a.s);
  const pct = (v) => (isFinite(v) ? `${(v * 100).toFixed(0)}%` : "—");
  function drawEmails() {
    const th = +$("#threshold").value;
    $("#thVal").textContent = th;
    let tp = 0, fp = 0, fn = 0, tn = 0;
    $("#emails").innerHTML = emails.map((e) => {
      const flag = e.s > th;
      if (flag && e.spam) tp++; else if (flag) fp++; else if (e.spam) fn++; else tn++;
      return `<div class="email ${flag ? "flag" : "pass"}" title="Score ${e.s} — actually ${e.spam ? "spam" : "a real email"}">${e.spam ? "😈" : "🙂"}<small>${e.s}</small></div>`;
    }).join("");
    $("#cm").innerHTML = `
      <div class="h"></div><div class="h">Flagged as spam</div><div class="h">Sent to inbox</div>
      <div class="h">Actually spam 😈</div>
      <div class="good"><b>${tp}</b>True positive<br /><span class="muted">caught spam</span></div>
      <div class="bad"><b>${fn}</b>False negative<br /><span class="muted">spam slipped through</span></div>
      <div class="h">Actually real 🙂</div>
      <div class="bad"><b>${fp}</b>False positive<br /><span class="muted">real email lost!</span></div>
      <div class="good"><b>${tn}</b>True negative<br /><span class="muted">correctly delivered</span></div>`;
    const acc = (tp + tn) / emails.length;
    const pre = tp / (tp + fp);
    const rec = tp / (tp + fn);
    const f1 = (2 * pre * rec) / (pre + rec);
    $("#mAcc").textContent = pct(acc);
    $("#mPre").textContent = pct(pre);
    $("#mRec").textContent = pct(rec);
    $("#mF1").textContent = pct(f1);
  }
  $("#threshold").addEventListener("input", drawEmails);
  drawEmails();

  /* =====================================================================
   * ROLES
   * ===================================================================== */
  const roles = [
    { icon: "📊", name: "Data Scientist", tint: "tint-purple",
      one: "Finds insights in data and builds models that answer business questions.",
      day: "Analyses data, runs experiments (A/B tests), builds and explains models, presents findings to stakeholders.",
      skills: [["Statistics & maths", 90], ["Python / SQL", 80], ["ML modelling", 80], ["Communication & storytelling", 90], ["Software engineering", 40]],
      tools: ["Python", "SQL", "pandas", "scikit-learn", "Jupyter", "Power BI / Tableau"] },
    { icon: "⚙️", name: "ML Engineer", tint: "tint-cyan",
      one: "Turns models into reliable, scalable production systems.",
      day: "Builds training & data pipelines, deploys models as services, optimises speed and cost, sets up monitoring and retraining.",
      skills: [["Software engineering", 90], ["ML modelling", 75], ["MLOps & cloud", 90], ["Statistics & maths", 60], ["Communication", 60]],
      tools: ["Python", "PyTorch", "Docker", "Kubernetes", "MLflow", "Airflow", "Azure / AWS / GCP"] },
    { icon: "✨", name: "AI Engineer", tint: "tint-pink",
      one: "Builds products and features on top of LLMs and other foundation models.",
      day: "Designs prompts, builds RAG pipelines and agents, integrates AI into apps, evaluates quality, adds safety guardrails.",
      skills: [["Software / API engineering", 90], ["LLMs, RAG & agents", 90], ["Product sense", 75], ["ML modelling", 50], ["Statistics & maths", 40]],
      tools: ["Python / TypeScript", "OpenAI / Azure OpenAI", "LangChain / Semantic Kernel", "Vector DBs", "Hugging Face"] },
  ];
  $("#roleCards").innerHTML = roles.map((r) => `
    <div class="card role ${r.tint}">
      <div class="head"><div class="icon">${r.icon}</div><h3 style="margin:0">${r.name}</h3></div>
      <p><b>${r.one}</b></p>
      <p class="small muted">${r.day}</p>
      ${r.skills.map(([s, v]) => `<div class="skill">${s}<div class="meter"><div style="width:${v}%"></div></div></div>`).join("")}
      <div style="margin-top:6px">${r.tools.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
    </div>`).join("");

  /* =====================================================================
   * ROADMAP
   * ===================================================================== */
  const roadmap = [
    { t: "Phase 1 · Foundations", time: "Weeks 1–6", items: [
      "Python basics: variables, loops, functions, lists, dictionaries",
      "NumPy & pandas: load, filter, group and join data",
      "SQL: SELECT, WHERE, GROUP BY, JOIN, window functions",
      "Statistics: mean/median, distributions, probability, hypothesis testing",
      "Maths intuition: vectors, matrices, derivatives (concepts, not proofs)",
      "Git & GitHub: commit, push, branches" ] },
    { t: "Phase 2 · Data Analysis", time: "Weeks 7–10", items: [
      "Data cleaning: missing values, outliers, duplicates",
      "Visualisation with Matplotlib / Seaborn",
      "Complete one full EDA project on a Kaggle dataset",
      "Write up insights as a short report or dashboard" ] },
    { t: "Phase 3 · Core Machine Learning", time: "Weeks 11–18", items: [
      "Train/validation/test splits and cross-validation",
      "Linear & logistic regression with scikit-learn",
      "Decision trees, random forests, gradient boosting (XGBoost)",
      "Metrics: MAE/RMSE, precision, recall, F1, ROC-AUC",
      "Overfitting, regularization, hyperparameter tuning",
      "Clustering (K-Means) and PCA",
      "End-to-end project: house prices or churn prediction" ] },
    { t: "Phase 4 · Deep Learning & GenAI", time: "Weeks 19–26", items: [
      "Neural network basics with PyTorch",
      "CNNs for images and transfer learning",
      "Transformers, embeddings and how LLMs work",
      "Prompt engineering and calling LLM APIs",
      "Build a RAG app with a vector database",
      "Evaluate LLM outputs and add guardrails" ] },
    { t: "Phase 5 · Production & MLOps", time: "Weeks 27–32", items: [
      "Serve a model with FastAPI",
      "Containerise with Docker",
      "Deploy to a cloud platform (Azure / AWS / GCP)",
      "Track experiments with MLflow",
      "Set up CI/CD with GitHub Actions",
      "Monitor for data drift" ] },
    { t: "Phase 6 · Job Ready", time: "Ongoing", items: [
      "3 polished portfolio projects with READMEs and demos",
      "Resume highlighting impact and metrics",
      "Practise SQL & Python coding questions",
      "Practise ML concept & system-design questions",
      "Mock interviews and networking (LinkedIn, meetups)" ] },
  ];
  let done = store.get("mlRoadmap", {});
  function renderRoadmap() {
    let total = 0, checked = 0;
    $("#timeline").innerHTML = roadmap.map((ph, pi) => {
      const n = ph.items.filter((_, ii) => done[`${pi}-${ii}`]).length;
      total += ph.items.length; checked += n;
      return `<div class="phase card ${n === ph.items.length ? "done" : ""}">
        <div class="ph-head"><h3 style="margin:0">${ph.t}</h3><span class="tag">${ph.time} · ${n}/${ph.items.length}</span></div>
        ${ph.items.map((it, ii) => `<label class="check"><input type="checkbox" data-k="${pi}-${ii}" ${done[`${pi}-${ii}`] ? "checked" : ""} /><span>${it}</span></label>`).join("")}
      </div>`;
    }).join("");
    const p = Math.round((checked / total) * 100);
    $("#roadBar").style.width = `${p}%`;
    $("#roadPct").textContent = `${p}%`;
  }
  $("#timeline").addEventListener("change", (e) => {
    const k = e.target.dataset.k;
    if (!k) return;
    if (e.target.checked) done[k] = true; else delete done[k];
    store.set("mlRoadmap", done);
    renderRoadmap();
  });
  $("#roadReset").addEventListener("click", () => { done = {}; store.set("mlRoadmap", done); renderRoadmap(); });
  renderRoadmap();

  /* =====================================================================
   * GLOSSARY
   * ===================================================================== */
  const glossary = [
    ["Algorithm", "The learning method or recipe used to build a model from data (e.g. random forest)."],
    ["Model", "What you get after training: a function that turns inputs into predictions."],
    ["Feature", "An input column / clue the model uses, like house size or number of bedrooms."],
    ["Label / Target", "The answer we want to predict, like the house price or 'spam'."],
    ["Training", "The process of the model adjusting itself to fit the example data."],
    ["Inference / Prediction", "Using a trained model to make predictions on new data."],
    ["Parameters", "Internal numbers the model learns by itself during training (e.g. the slope of a line)."],
    ["Hyperparameters", "Settings you choose before training, like learning rate or tree depth."],
    ["Loss function", "A score of how wrong the model is. Training tries to make it as small as possible."],
    ["Gradient descent", "Repeatedly nudging parameters 'downhill' to reduce the loss."],
    ["Learning rate", "How big each gradient-descent step is. Too big overshoots; too small is slow."],
    ["Epoch", "One full pass through the entire training dataset."],
    ["Batch", "A small chunk of training examples processed together in one step."],
    ["Overfitting", "Memorising the training data (including noise) so the model fails on new data."],
    ["Underfitting", "The model is too simple to capture the real pattern."],
    ["Generalisation", "How well a model performs on data it has never seen. The real goal."],
    ["Regularization", "Techniques that penalise complexity to reduce overfitting."],
    ["Cross-validation", "Rotating which part of the data is used for validation, for a more reliable score."],
    ["Train / Validation / Test split", "Separate data for learning, tuning, and the final honest exam."],
    ["Data leakage", "When information unavailable in real life sneaks into training, giving falsely great results."],
    ["Baseline", "A simple reference model your real model must beat."],
    ["Regression", "Predicting a number (price, temperature)."],
    ["Classification", "Predicting a category (spam / not spam)."],
    ["Clustering", "Grouping similar items without labels."],
    ["Precision", "Of the items flagged positive, how many really were positive."],
    ["Recall", "Of all real positives, how many the model caught."],
    ["F1 score", "A single number balancing precision and recall."],
    ["Confusion matrix", "A 2×2 table of correct and incorrect predictions by type."],
    ["Feature engineering", "Creating better input features from raw data."],
    ["One-hot encoding", "Turning a category like 'city' into several 0/1 columns."],
    ["Normalization / Scaling", "Putting numbers on similar ranges so no feature dominates unfairly."],
    ["Neural network", "A model made of layers of simple connected units ('neurons')."],
    ["Deep learning", "Machine learning with many-layered neural networks."],
    ["Transformer", "The neural-network design behind modern LLMs, using 'attention'."],
    ["LLM", "Large Language Model — a huge transformer trained on text to predict the next word."],
    ["Token", "A chunk of text (roughly ¾ of a word) that LLMs read and write."],
    ["Embedding", "A list of numbers representing meaning; similar things get similar numbers."],
    ["Vector database", "A database that finds items with similar embeddings — used for semantic search and RAG."],
    ["RAG", "Retrieval-Augmented Generation: fetch relevant documents, then let the LLM answer using them."],
    ["Fine-tuning", "Further training a pre-trained model on your own data to specialise it."],
    ["Prompt engineering", "Crafting instructions and examples to get better results from an LLM."],
    ["Hallucination", "When an AI confidently produces false or made-up information."],
    ["AI agent", "An LLM that plans and uses tools in a loop to complete multi-step tasks."],
    ["Deployment", "Making a model available for real use, usually as an API."],
    ["MLOps", "Practices and tools for deploying, monitoring and maintaining ML in production."],
    ["Data drift", "When real-world data changes over time so the model becomes less accurate."],
    ["A/B test", "Comparing two versions with real users to see which performs better."],
    ["Bias (fairness)", "When a model systematically treats some groups unfairly, often due to skewed data."],
  ];
  function renderGloss() {
    const q = $("#glossSearch").value.trim().toLowerCase();
    const hits = glossary.filter(([t, d]) => !q || t.toLowerCase().includes(q) || d.toLowerCase().includes(q));
    $("#gloss").innerHTML = hits.length
      ? hits.map(([t, d]) => `<div class="card"><h4>${t}</h4><p class="small" style="margin:0">${d}</p></div>`).join("")
      : `<p class="muted">No matching terms.</p>`;
  }
  $("#glossSearch").addEventListener("input", renderGloss);
  renderGloss();

  /* =====================================================================
   * QUIZ
   * ===================================================================== */
  const quiz = [
    { q: "What is the key difference between traditional programming and machine learning?",
      o: ["ML uses faster computers", "In ML the computer learns the rules from examples instead of a human writing them", "ML doesn't need any data", "Traditional programs can't make predictions"], a: 1,
      x: "Traditional programming: rules + data → answers. ML: data + answers → rules (the model)." },
    { q: "Predicting tomorrow's temperature in °C is which type of problem?",
      o: ["Classification", "Clustering", "Regression", "Reinforcement learning"], a: 2,
      x: "We're predicting a number, so it's regression. Predicting 'hot / mild / cold' would be classification." },
    { q: "You group customers into segments without any labels. This is…",
      o: ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Data leakage"], a: 1,
      x: "No answer key → unsupervised. Clustering (like K-Means) is the classic example." },
    { q: "A model scores 99% on training data but 60% on test data. What's happening?",
      o: ["Underfitting", "Overfitting", "Perfect generalisation", "The test set is too big"], a: 1,
      x: "Great on seen data, poor on new data = memorisation = overfitting." },
    { q: "Why do we keep a separate test set that the model never sees during training?",
      o: ["To make training faster", "To get an honest estimate of performance on new, real-world data", "Because the data is too large", "It's only needed for deep learning"], a: 1,
      x: "The test set is the 'final exam'. If the model has seen it, the score is no longer honest." },
    { q: "For a cancer-screening model, missing a sick patient is very costly. Which metric should you prioritise?",
      o: ["Precision", "Recall", "Accuracy", "Training loss"], a: 1,
      x: "Recall measures how many real positives you catch. In screening, false negatives are the most dangerous." },
    { q: "Only 1% of transactions are fraud. A model that always says 'not fraud' has 99% accuracy. Is it good?",
      o: ["Yes, 99% is excellent", "No — it catches zero fraud; accuracy is misleading on imbalanced data", "Yes, if training was fast", "Only if it's a neural network"], a: 1,
      x: "Its recall is 0%. With imbalanced classes, look at precision, recall, F1 or ROC-AUC." },
    { q: "Roughly where do practitioners spend most of their time in an ML project?",
      o: ["Choosing the fanciest algorithm", "Data collection, cleaning and feature engineering", "Writing research papers", "Buying GPUs"], a: 1,
      x: "Data work typically takes 60–80% of the effort. Good data beats clever algorithms." },
    { q: "Your deployed house-price model gets worse months later because the market changed. This is called…",
      o: ["Data drift", "Overfitting", "Gradient descent", "One-hot encoding"], a: 0,
      x: "The real-world data distribution shifted. Monitoring catches it; retraining fixes it." },
    { q: "An AI Engineer wants an LLM to answer questions using the company's internal documents. The most common first approach is…",
      o: ["Train a new LLM from scratch", "RAG — retrieve relevant documents and give them to the LLM", "Use K-Means clustering", "Increase the learning rate"], a: 1,
      x: "RAG is cheap, keeps answers grounded in your documents, and is easy to update. Fine-tuning comes later if needed." },
    { q: "If the learning rate in gradient descent is much too high, what typically happens?",
      o: ["Training becomes perfectly accurate", "The model overshoots and the error can explode", "Nothing changes", "The dataset gets bigger"], a: 1,
      x: "Steps are so large the model jumps past the minimum — try it in the 'Watch a model learn' demo!" },
    { q: "Which role is MOST focused on deploying, scaling and monitoring models in production?",
      o: ["Data Scientist", "ML Engineer", "Business Analyst", "UX Designer"], a: 1,
      x: "ML Engineers specialise in production systems and MLOps; Data Scientists focus more on analysis and modelling." },
  ];
  let answers = {};
  function renderQuiz() {
    $("#quiz").innerHTML = quiz.map((q, qi) => `
      <div class="card q" data-q="${qi}">
        <b>Q${qi + 1}. ${q.q}</b>
        <div class="opts">${q.o.map((o, oi) => `<button class="opt" data-o="${oi}">${String.fromCharCode(65 + oi)}. ${o}</button>`).join("")}</div>
        <div class="explain"></div>
      </div>`).join("");
    updateScore();
  }
  function updateScore() {
    const n = Object.keys(answers).length;
    const right = Object.entries(answers).filter(([qi, oi]) => quiz[qi].a === oi).length;
    $("#quizScore").textContent = `Score: ${right} / ${n}${n === quiz.length ? ` — ${right >= 10 ? "🏆 Excellent!" : right >= 7 ? "👍 Good job!" : "📚 Review & retry!"}` : ` (of ${quiz.length})`}`;
  }
  $("#quiz").addEventListener("click", (e) => {
    const btn = e.target.closest(".opt");
    if (!btn || btn.disabled) return;
    const card = btn.closest(".q");
    const qi = +card.dataset.q, oi = +btn.dataset.o, q = quiz[qi];
    answers[qi] = oi;
    $$(".opt", card).forEach((b, k) => {
      b.disabled = true;
      if (k === q.a) b.classList.add("right");
      else if (k === oi) b.classList.add("wrong");
    });
    const ex = $(".explain", card);
    ex.innerHTML = `${oi === q.a ? "✅ Correct!" : "❌ Not quite."} ${q.x}`;
    ex.classList.add("show");
    updateScore();
  });
  $("#quizReset").addEventListener("click", () => { answers = {}; renderQuiz(); });
  renderQuiz();

  /* =====================================================================
   * START
   * ===================================================================== */
  const fromHash = parseInt(location.hash.slice(1), 10);
  show(Number.isFinite(fromHash) ? fromHash - 1 : 0);
  window.addEventListener("hashchange", () => {
    const n = parseInt(location.hash.slice(1), 10);
    if (Number.isFinite(n) && n - 1 !== current) show(n - 1);
  });
})();
