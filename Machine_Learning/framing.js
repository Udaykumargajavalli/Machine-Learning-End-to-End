/* "Problem Framing & Success Criteria" slide, inserted before the 5th tab.
   Must load AFTER remove-slides.js and before slide-icons.js / app.js. */
(function () {
  var TABS = [
    {
      name: "🎯 Business Goal",
      intro: "Every ML project starts with a business problem, not with an algorithm. If you can't say what decision the model improves and how it creates value, stop here.",
      cards: [
        { t: "Write the problem statement", d: "One sentence: WHO has WHAT problem, and WHAT decision would improve if we could predict something.", ex: "\"The retention team doesn't know which customers will cancel next month, so offers go to the wrong people.\"" },
        { t: "Identify stakeholders", d: "Who asks for it, who uses the output, who is affected by mistakes, who maintains it (business owner, end users, data/IT, legal).", ex: "Retention manager (owner), call-centre agents (users), customers (affected)." },
        { t: "Understand the current process", d: "How is the decision made today? Rules, gut feeling, manual review? This becomes your baseline.", ex: "Agents call random customers whose contract ends this month." },
        { t: "Define the value / ROI", d: "Estimate the money, time or risk saved. Compare against the cost of building and running the model.", ex: "Saving 5% of churners = ₹2 Cr/year; project cost ₹30 L." },
        { t: "Is ML even needed?", d: "Use ML only if the pattern is too complex for simple rules, data exists, and errors are tolerable. Otherwise a rule, a report or a dashboard may be enough.", ex: "If 'contract ends in 30 days' already finds 90% of churners — a rule may do." },
        { t: "Define the action", d: "A prediction is useless without an action. What will someone DO with the output, and how fast?", ex: "Top 1,000 risky customers get a discount call every Monday." }
      ]
    },
    {
      name: "🔄 ML Formulation",
      intro: "Translate the business question into a precise ML task: what exactly is predicted, for whom, when, and using which information.",
      table: {
        head: ["Business question", "ML task", "Target (y)", "Output"],
        rows: [
          ["Will this customer leave?", "Binary classification", "churned in next 30 days (1/0)", "Probability / risk score"],
          ["How much will we sell next week?", "Regression / forecasting", "units sold per store-week", "Number (+ interval)"],
          ["Which category is this ticket?", "Multi-class classification", "ticket category", "Class label"],
          ["Which products will this user like?", "Ranking / recommendation", "click / purchase", "Ordered list"],
          ["What kinds of customers do we have?", "Clustering (unsupervised)", "— no label —", "Segment ID"],
          ["Is this transaction unusual?", "Anomaly detection", "— often no label —", "Anomaly score"],
          ["What does this document say?", "NLP / GenAI (summarise, extract)", "text / fields", "Text / JSON"]
        ]
      },
      cards: [
        { t: "Define the target precisely", d: "Ambiguous labels kill projects. 'Churn' = no purchase for 60 days? Contract cancelled? Account closed?", ex: "y = 1 if subscription cancelled within 30 days after the scoring date." },
        { t: "Unit of prediction", d: "One prediction per what? Customer, transaction, store-day, image, sentence?", ex: "One row = one customer on one scoring date." },
        { t: "Prediction timing & horizon", d: "When is the prediction made and how far ahead? Features must only use data available at that moment (prevents leakage).", ex: "Score every Monday; predict the next 30 days; use data up to Sunday." },
        { t: "Label availability", d: "Do historical labels exist? How many positives? How long until we know the true outcome (label delay)?", ex: "2 years of history, 4% churn rate, labels known after 30 days." },
        { t: "Output format", d: "Hard class, probability, ranking, number with uncertainty? Pick what the action needs.", ex: "Probability so the team can choose the top-N." },
        { t: "Error costs", d: "Which mistake is worse — false positive or false negative? This drives the metric and the threshold.", ex: "Missed churner loses ₹10,000; unnecessary offer costs ₹500 → favour recall." }
      ]
    },
    {
      name: "🚧 Constraints",
      intro: "Real projects are limited by data, time, money, law and infrastructure. Write constraints down early — they rule out some algorithms before you start.",
      cards: [
        { t: "Data", d: "Volume, quality, history length, label noise, access rights, refresh frequency.", ex: "Only 6 months of clean data; CRM updated nightly." },
        { t: "Latency & throughput", d: "Real-time (milliseconds) or batch (hours)? How many predictions per second/day?", ex: "Fraud check must answer in < 100 ms at 2,000 req/s." },
        { t: "Compute & cost", d: "Training/inference budget, GPU availability, cloud cost per prediction.", ex: "CPU-only servers; ≤ ₹1 L/month cloud spend." },
        { t: "Interpretability & regulation", d: "Must decisions be explainable (credit, insurance, healthcare)? Regulations such as GDPR, RBI, HIPAA, EU AI Act.", ex: "Loan rejections must list the top reasons." },
        { t: "Privacy & security", d: "PII, consent, data residency, anonymisation, who can see predictions.", ex: "No customer names/phones in the training set." },
        { t: "Fairness & ethics", d: "Could the model treat groups unfairly? Which attributes must be excluded or audited?", ex: "Check approval rates across gender and region." },
        { t: "Deployment environment", d: "Cloud API, batch job, mobile/edge device, inside an existing app? Integration effort matters.", ex: "Batch scores written to the CRM table every Monday 6 AM." },
        { t: "Timeline & team", d: "Deadline, skills available, maintenance ownership after launch.", ex: "MVP in 6 weeks; 1 DS + 1 data engineer." }
      ]
    },
    {
      name: "📊 KPIs & Success Criteria",
      intro: "Define success at three levels BEFORE modelling, with concrete numbers: the business KPI, the ML metric that predicts it, and operational/guardrail metrics.",
      table: {
        head: ["Level", "What it measures", "Examples"],
        rows: [
          ["Business KPI (north star)", "The real outcome leadership cares about", "Churn rate ↓, revenue ↑, fraud losses ↓, hours saved"],
          ["ML / offline metric", "Model quality on held-out data (proxy for the KPI)", "Recall@top-10%, PR-AUC, RMSE, MAPE, F1"],
          ["Operational metric", "Is the system healthy in production?", "Latency p95, uptime, cost per 1k predictions, data freshness"],
          ["Guardrail metric", "Things that must NOT get worse", "Customer complaints, false-block rate, fairness gaps"],
          ["Online / A/B metric", "Real impact vs. control group", "Retention uplift of treated vs. untreated customers"]
        ]
      },
      cards: [
        { t: "Make criteria SMART", d: "Specific, Measurable, Achievable, Relevant, Time-bound.", ex: "\"Reduce monthly churn from 4.0% to 3.5% within 2 quarters.\"" },
        { t: "Set a minimum bar", d: "State the ML threshold needed to be useful, and compare against the baseline / current process.", ex: "Recall ≥ 60% in the top 10% riskiest customers (current rule: 35%)." },
        { t: "Link metric to money", d: "Translate the confusion matrix into ₹ using error costs so stakeholders understand trade-offs.", ex: "Profit = TP×₹9,500 − FP×₹500." },
        { t: "Offline ≠ online", d: "A better offline score doesn't guarantee business impact. Plan an A/B test or pilot to prove it.", ex: "Pilot in 2 regions for 4 weeks with a control group." },
        { t: "Define 'done' and 'stop'", d: "Agree when the model is good enough to ship — and when to abandon if the target isn't reachable.", ex: "Ship if pilot uplift ≥ 0.3 pp; stop if PR-AUC < 0.3 after 4 weeks." },
        { t: "Plan monitoring", d: "Which metrics are tracked after launch, alert thresholds and retraining triggers.", ex: "Alert if weekly recall drops > 10% or data drift PSI > 0.2." }
      ]
    },
    {
      name: "🧾 Worked Example",
      intro: "A complete one-page problem framing (a 'ML Problem Canvas') for customer churn — use it as a template for interviews and real projects.",
      canvas: [
        ["Business goal", "Reduce telecom customer churn to protect recurring revenue."],
        ["Decision / action", "Retention team calls the top 1,000 highest-risk customers weekly with a targeted offer."],
        ["Current baseline", "Call customers whose contract ends this month (catches ~35% of churners)."],
        ["ML task", "Binary classification — P(cancel within next 30 days)."],
        ["Unit & timing", "One row per active customer, scored every Monday using data up to Sunday."],
        ["Target", "1 if the subscription is cancelled within 30 days of the scoring date, else 0 (≈4% positives)."],
        ["Features (available at scoring)", "Tenure, plan, monthly bill, usage trend, complaints, payment delays, network issues."],
        ["Constraints", "Batch, CPU only, top reasons must be shown to agents, no PII in features, MVP in 6 weeks."],
        ["Offline success", "Recall@top-1000 ≥ 60% and PR-AUC ≥ 0.35 on the last 3 months (time-based split)."],
        ["Business KPI", "Monthly churn 4.0% → 3.5% within 2 quarters; campaign ROI > 3×."],
        ["Guardrails", "Offer cost ≤ budget; no drop in NPS; similar recall across regions."],
        ["Validation plan", "4-week A/B pilot: model-selected vs. rule-selected customers."],
        ["Monitoring", "Weekly recall on matured labels, feature drift (PSI), score distribution, job success."]
      ],
      cards: []
    },
    {
      name: "⚠️ Pitfalls & Checklist",
      intro: "Most failed ML projects fail at framing, not at modelling.",
      cards: [
        { t: "Solution looking for a problem", d: "Starting with 'let's use deep learning / GenAI' instead of a clear business need." },
        { t: "Vague target", d: "'Predict customer happiness' without a measurable label." },
        { t: "Leaky features", d: "Using information not available at prediction time (e.g. 'refund issued' to predict complaints)." },
        { t: "Wrong metric", d: "Optimising accuracy when the business cares about catching rare cases or about ₹ impact." },
        { t: "No action attached", d: "Great predictions that nobody uses because there is no process to act on them." },
        { t: "Ignoring constraints", d: "A model that's too slow, too costly or not explainable enough to deploy." },
        { t: "No baseline / no A/B", d: "No way to prove the model is better than what existed before." },
        { t: "✅ Framing checklist", d: "Problem statement • stakeholders • action • value estimate • ML task & target • unit & timing • data/labels available • constraints • business KPI + ML metric + guardrails with numbers • baseline • pilot plan • monitoring plan." }
      ]
    }
  ];

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function paneHTML(tab) {
    var h = '<p class="pf-intro">' + esc(tab.intro) + "</p>";
    if (tab.table) {
      h += '<div class="pf-table-wrap"><table class="pf-table"><thead><tr>' +
        tab.table.head.map(function (x) { return "<th>" + esc(x) + "</th>"; }).join("") + "</tr></thead><tbody>" +
        tab.table.rows.map(function (r) { return "<tr>" + r.map(function (x) { return "<td>" + esc(x) + "</td>"; }).join("") + "</tr>"; }).join("") +
        "</tbody></table></div>";
    }
    if (tab.canvas) {
      h += '<div class="pf-canvas">' + tab.canvas.map(function (r) {
        return '<div class="pf-cv-row"><div class="pf-cv-k">' + esc(r[0]) + '</div><div class="pf-cv-v">' + esc(r[1]) + "</div></div>";
      }).join("") + "</div>";
    }
    if (tab.cards.length) {
      h += '<div class="pf-grid">' + tab.cards.map(function (c) {
        return '<div class="pf-card"><h4>' + esc(c.t) + "</h4><p>" + esc(c.d) + "</p>" +
          (c.ex ? '<p class="pf-ex"><b>Example:</b> ' + esc(c.ex) + "</p>" : "") + "</div>";
      }).join("") + "</div>";
    }
    return h;
  }

  function css() {
    var s = document.createElement("style");
    s.textContent = [
      ".pf-slide{overflow-y:auto}",
      ".pf-lead{opacity:.85;max-width:1100px;line-height:1.55;margin:.4rem 0 1rem}",
      ".pf-flow{display:flex;flex-wrap:wrap;align-items:center;gap:.4rem;margin:0 0 1rem;font-size:.85rem}",
      ".pf-flow span{padding:.3rem .7rem;border-radius:999px;background:rgba(108,140,255,.15);border:1px solid rgba(108,140,255,.45)}",
      ".pf-flow i{font-style:normal;opacity:.6}",
      ".pf-tabs{display:flex;flex-wrap:wrap;gap:.4rem;padding:.6rem;border:1px solid rgba(148,163,184,.2);border-radius:12px;margin-bottom:1rem}",
      ".pf-tab{font:inherit;color:inherit;cursor:pointer;border:1px solid rgba(148,163,184,.35);background:rgba(148,163,184,.08);border-radius:8px;padding:.4rem .85rem;font-size:.85rem;transition:all .15s}",
      ".pf-tab:hover{border-color:#6c8cff}",
      ".pf-tab.active{background:linear-gradient(135deg,#6c8cff,#8b5cf6);border-color:transparent;color:#fff;font-weight:600}",
      ".pf-intro{margin:0 0 .9rem;line-height:1.55;padding:.7rem 1rem;border-left:4px solid #f5a524;background:rgba(245,165,36,.08);border-radius:8px}",
      ".pf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:.9rem;padding-bottom:1.5rem}",
      ".pf-card{border:1px solid rgba(148,163,184,.25);background:rgba(148,163,184,.06);border-radius:12px;padding:.9rem 1rem;min-width:0}",
      ".pf-card h4{margin:0 0 .45rem;font-size:.98rem}",
      ".pf-card p{margin:.2rem 0;line-height:1.5}",
      ".pf-ex{font-size:.86rem;padding:.45rem .6rem;margin-top:.5rem !important;border-radius:8px;background:rgba(34,197,94,.08);border-left:3px solid #22c55e}",
      ".pf-table-wrap{overflow-x:auto;margin-bottom:1rem}",
      ".pf-table{width:100%;border-collapse:collapse;font-size:.88rem}",
      ".pf-table th,.pf-table td{border:1px solid rgba(148,163,184,.25);padding:.5rem .7rem;text-align:left;vertical-align:top}",
      ".pf-table th{background:rgba(108,140,255,.18)}",
      ".pf-table tr:nth-child(even) td{background:rgba(148,163,184,.05)}",
      ".pf-canvas{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:.5rem;padding-bottom:1.5rem}",
      ".pf-cv-row{display:grid;grid-template-columns:170px 1fr;border:1px solid rgba(148,163,184,.25);border-radius:10px;overflow:hidden}",
      ".pf-cv-k{padding:.55rem .7rem;font-weight:600;font-size:.86rem;background:rgba(108,140,255,.15)}",
      ".pf-cv-v{padding:.55rem .7rem;font-size:.88rem;line-height:1.45}"
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
    if (document.getElementById("problem-framing")) return;
    var slides = topSlides();
    var ref = slides[4];
    if (!ref) return;
    var sec = document.createElement("section");
    sec.className = "slide pf-slide";
    sec.id = "problem-framing";
    sec.setAttribute("data-title", "Problem Framing & Success Criteria");
    var grp = ref.getAttribute("data-group");
    if (grp) sec.setAttribute("data-group", grp);
    var h2 = ref.querySelector("h2");
    sec.innerHTML = '<h2 class="' + (h2 ? esc(h2.className) : "") + '">Problem Framing &amp; Success Criteria</h2>' +
      '<p class="pf-lead">Before touching data or algorithms, agree on <b>why</b> we are building a model, <b>what</b> exactly it predicts, the <b>constraints</b> it must respect, and the <b>numbers</b> that will prove it worked.</p>' +
      '<div class="pf-flow"><span>🎯 Business goal</span><i>→</i><span>🔄 ML formulation</span><i>→</i><span>🚧 Constraints</span><i>→</i><span>📊 KPIs &amp; success criteria</span><i>→</i><span>🚀 Build &amp; validate</span></div>' +
      '<div class="pf-tabs" role="tablist">' + TABS.map(function (t, i) {
        return '<button type="button" role="tab" class="pf-tab' + (i === 0 ? " active" : "") + '" data-i="' + i + '">' + esc(t.name) + "</button>";
      }).join("") + "</div>" +
      '<div class="pf-pane"></div>';
    ref.parentNode.insertBefore(sec, ref);
    css();

    var pane = sec.querySelector(".pf-pane");
    var btns = Array.prototype.slice.call(sec.querySelectorAll(".pf-tab"));
    function show(i) {
      btns.forEach(function (b, j) { b.classList.toggle("active", i === j); });
      pane.innerHTML = paneHTML(TABS[i]);
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function (e) { e.stopPropagation(); show(i); });
    });
    show(0);
  }

  if (document.querySelector("section.slide")) init();
  else document.addEventListener("DOMContentLoaded", init);
})();
