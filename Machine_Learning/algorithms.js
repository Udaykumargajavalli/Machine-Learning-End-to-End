/* Algorithms Explained: replaces the "Deep Learning & GenAI" slide with one tab per algorithm.
   Must load BEFORE app.js so the navigation is built from the new slide. */
(function () {
  "use strict";

  const ALGOS = [
    {
      id: "linreg", name: "Linear Regression", icon: "📈", family: "Supervised · Regression",
      idea: "Draws the best straight line through your data so you can predict a number.",
      analogy: "Guessing a house price from its size: every extra square foot adds roughly the same amount of money. The model just finds that \"amount per square foot\".",
      how: ["Start with a random line.", "Measure how far each point is from the line (the error).", "Nudge the slope and starting point to shrink the total error (gradient descent).", "Stop when the line can't get any better."],
      use: "Predicting a number when the relationship is roughly straight: prices, sales, temperature.",
      pros: ["Very fast and simple", "Easy to explain to anyone", "Great baseline model"],
      cons: ["Misses curved patterns", "Sensitive to outliers"],
      example: "Estimating a used car's price from its age and mileage.",
      interview: "What assumptions does linear regression make? (Straight-line relationship, independent errors, constant spread of errors.)"
    },
    {
      id: "ridge", name: "Ridge Regression", icon: "⛰️", family: "Supervised · Regression",
      idea: "Linear regression with a \"don't get too extreme\" rule: it shrinks all the weights a little so the model doesn't overfit.",
      analogy: "A teacher who says \"don't put all your faith in one source\". Every feature still gets a say, but none is allowed to shout too loudly.",
      how: ["Fit a line like linear regression.", "Add a penalty for large weights (the sum of squared weights, called L2).", "A setting called alpha (λ) controls how strong the penalty is.", "Result: every weight shrinks toward zero, but none becomes exactly zero."],
      use: "Many features that are related to each other (multicollinearity), or when plain linear regression overfits.",
      pros: ["Reduces overfitting", "Stable when features are correlated", "Still fast and explainable"],
      cons: ["Keeps every feature, so no automatic feature selection", "Needs scaled features and a tuned alpha"],
      example: "Predicting house prices from 50 related features (rooms, area, bathrooms…) that overlap a lot.",
      interview: "What does the alpha in Ridge control? (Penalty strength: 0 = plain linear regression, large = weights pushed close to zero.)"
    },
    {
      id: "lasso", name: "Lasso Regression", icon: "🤠", family: "Supervised · Regression",
      idea: "Linear regression that can switch useless features off completely, setting their weights to exactly zero.",
      analogy: "Packing a suitcase with a strict weight limit: you leave behind anything that isn't really needed.",
      how: ["Fit a line like linear regression.", "Add a penalty on the absolute size of the weights (L1).", "The penalty pushes weak features all the way to zero.", "What remains is a smaller, simpler set of features."],
      use: "When you suspect only a few of many features actually matter and want automatic feature selection.",
      pros: ["Built-in feature selection", "Simpler, more explainable models", "Reduces overfitting"],
      cons: ["With correlated features it picks one somewhat randomly", "Can drop useful features if alpha is too high"],
      example: "Finding which 10 of 500 customer attributes really drive spending.",
      interview: "Why does Lasso produce zero weights but Ridge doesn't? (The L1 penalty has sharp corners at zero, so the optimum often lands exactly on zero.)"
    },
    {
      id: "elastic", name: "Elastic Net", icon: "🔗", family: "Supervised · Regression",
      idea: "A mix of Ridge and Lasso: it shrinks weights AND can switch some features off.",
      analogy: "A balanced diet plan: cut the junk completely (Lasso) and eat everything else in moderation (Ridge).",
      how: ["Fit a line like linear regression.", "Add both penalties: L1 (Lasso) and L2 (Ridge).", "A mixing setting (l1_ratio) chooses how much of each.", "Tune alpha and l1_ratio with cross-validation."],
      use: "Many correlated features where you still want some feature selection.",
      pros: ["Best of Ridge and Lasso", "Handles groups of correlated features well", "Selects features"],
      cons: ["Two settings to tune instead of one", "Still a linear model"],
      example: "Predicting disease risk from thousands of correlated genetic markers.",
      interview: "When pick Elastic Net over Lasso? (When features are highly correlated; Lasso picks one arbitrarily, Elastic Net keeps the group.)"
    },
    {
      id: "logreg", name: "Logistic Regression", icon: "🔀", family: "Supervised · Classification",
      idea: "Despite the name, it answers yes/no questions by giving a probability between 0 and 1.",
      analogy: "A bank officer adds up points for income, debt and history, then squeezes the total into a \"chance of repaying\" percentage.",
      how: ["Combine the inputs into a score, like linear regression.", "Squash the score into 0–1 with an S-shaped curve (sigmoid).", "If the probability is above a threshold (e.g. 0.5), say \"yes\"."],
      use: "Two-choice problems where you also want a probability and an explanation.",
      pros: ["Gives probabilities", "Coefficients are explainable", "Fast to train"],
      cons: ["Only draws straight decision boundaries", "Needs feature engineering for complex patterns"],
      example: "Will this customer cancel their subscription next month?",
      interview: "Why not use linear regression for classification? (Its outputs aren't bounded to 0–1 and outliers distort it.)"
    },
    {
      id: "tree", name: "Decision Tree", icon: "🌳", family: "Supervised · Both",
      idea: "Asks a series of yes/no questions, like a flowchart, until it reaches an answer.",
      analogy: "The game \"20 Questions\": \"Is it bigger than a breadbox? Does it live in water?\" Each answer narrows the options.",
      how: ["Find the question that best splits the data into pure groups.", "Repeat the process inside each group.", "Stop when groups are pure or the tree hits a size limit.", "To predict, follow the questions down to a leaf."],
      use: "When you need rules people can read and follow.",
      pros: ["Very easy to visualize and explain", "Handles numbers and categories", "No scaling needed"],
      cons: ["Overfits easily if allowed to grow deep", "Small data changes can change the whole tree"],
      example: "Loan approval rules: income > 50k? → credit score > 700? → approve.",
      interview: "How does a tree decide where to split? (Gini impurity or entropy / information gain for classification, variance for regression.)"
    },
    {
      id: "forest", name: "Random Forest", icon: "🌲", family: "Supervised · Ensemble",
      idea: "Builds hundreds of slightly different decision trees and lets them vote.",
      analogy: "Asking 500 friends for advice instead of one. Individual friends make mistakes, but the majority is usually right.",
      how: ["Give each tree a random sample of the rows (bagging).", "Let each tree look at a random subset of the columns at each split.", "Grow many trees independently.", "Average their answers (regression) or take a majority vote (classification)."],
      use: "A strong, reliable default for tabular (spreadsheet-like) data.",
      pros: ["Accurate with little tuning", "Resists overfitting", "Shows feature importance"],
      cons: ["Slower and larger than one tree", "Harder to explain a single prediction"],
      example: "Detecting fraudulent credit-card transactions.",
      interview: "What's the difference between bagging and boosting? (Bagging builds models in parallel and averages; boosting builds them in sequence, each fixing the last one's errors.)"
    },
    {
      id: "boost", name: "Gradient Boosting (XGBoost)", icon: "🚀", family: "Supervised · Ensemble",
      idea: "Builds small trees one after another, each one fixing the mistakes of the trees before it.",
      analogy: "A student who reviews only the questions they got wrong on each practice test, getting a little better every round.",
      how: ["Start with a simple guess (e.g. the average).", "Measure the errors (residuals).", "Train a small tree to predict those errors.", "Add it in with a small learning rate and repeat hundreds of times."],
      use: "When you want top accuracy on tabular data. Popular libraries: XGBoost, LightGBM, CatBoost.",
      pros: ["Often the most accurate on tabular data", "Handles missing values", "Wins many competitions"],
      cons: ["More settings to tune", "Can overfit if trained too long", "Trains sequentially, so slower"],
      example: "Ranking search results or predicting insurance claim costs.",
      interview: "What does the learning rate do in boosting? (Shrinks each tree's contribution; smaller = more trees needed but better generalization.)"
    },
    {
      id: "adaboost", name: "AdaBoost", icon: "⚡", family: "Supervised · Ensemble",
      idea: "The original boosting method: tiny one-question models take turns, and each new one pays extra attention to the examples the last ones got wrong.",
      analogy: "A quiz team where after each round, the hardest questions get highlighted so the next teammate focuses on them. In the end everyone votes, and better teammates' votes count more.",
      how: ["Give every training example the same weight.", "Train a tiny model (a one-split \"stump\").", "Increase the weight of the examples it got wrong.", "Train the next stump on the re-weighted data. Repeat.", "Final answer = weighted vote of all stumps (more accurate stumps get bigger votes)."],
      use: "Clean, small-to-medium datasets and as a classic way to understand boosting.",
      pros: ["Simple and effective", "Few settings to tune", "Turns weak models into a strong one"],
      cons: ["Very sensitive to noisy data and outliers", "Usually beaten by gradient boosting today"],
      example: "The famous Viola-Jones face detector in early digital cameras.",
      interview: "How does AdaBoost differ from Gradient Boosting? (AdaBoost re-weights misclassified examples; gradient boosting fits each new tree to the remaining errors.)"
    },
    {
      id: "catboost", name: "CatBoost", icon: "🐱", family: "Supervised · Ensemble",
      idea: "A gradient boosting library that is especially good with categories (text labels like city, brand, color) with almost no preprocessing.",
      analogy: "A translator that turns words like \"Delhi\" or \"Mumbai\" into meaningful numbers automatically, then hands them to a very disciplined boosting team.",
      how: ["Turn each category into a number using the average target of earlier rows (ordered target statistics), which avoids cheating/leakage.", "Build symmetric (balanced) trees: the same question at every node of a level.", "Add trees one by one like gradient boosting.", "Predict fast thanks to the regular tree shape."],
      use: "Tabular data with many categorical columns: customers, products, locations.",
      pros: ["Handles categories natively", "Strong results with default settings", "Less overfitting, fast predictions"],
      cons: ["Training can be slower than LightGBM", "Large model files", "Less interpretable than a single tree"],
      example: "Predicting delivery time from city, restaurant type and weekday.",
      interview: "Why is plain target encoding risky and how does CatBoost fix it? (It leaks the answer into the feature; CatBoost only uses rows that came before, in a random order.)"
    },
    {
      id: "knn", name: "K-Nearest Neighbors", icon: "📍", family: "Supervised · Both",
      idea: "To label something new, look at the K most similar examples and copy what they are.",
      analogy: "\"You are the average of your 5 closest friends.\" To guess a new neighbor's favorite team, ask the 5 houses nearest to them.",
      how: ["Store all the training data (no real training step).", "For a new point, measure the distance to every stored point.", "Pick the K closest.", "Vote (classification) or average (regression)."],
      use: "Small datasets and recommendation-style \"find similar\" problems.",
      pros: ["Very simple idea", "No training time", "Naturally handles many classes"],
      cons: ["Slow predictions on big data", "Needs feature scaling", "Struggles with many features"],
      example: "\"Customers similar to you also bought…\"",
      interview: "How do you choose K? (Cross-validation; small K overfits, large K underfits.)"
    },
    {
      id: "nb", name: "Naive Bayes", icon: "📨", family: "Supervised · Classification",
      idea: "Uses probabilities of each clue, assuming clues are independent, to pick the most likely class.",
      analogy: "A spam filter that notices \"FREE\", \"WINNER\" and \"click now\" each make spam more likely, and multiplies those hints together.",
      how: ["Count how often each word/feature appears in each class.", "Turn counts into probabilities.", "For a new item, multiply the probabilities for each class (Bayes' theorem).", "Pick the class with the highest score."],
      use: "Text classification and quick baselines.",
      pros: ["Extremely fast", "Works with little data", "Great for text"],
      cons: ["The \"independent clues\" assumption is rarely true", "Probabilities can be poorly calibrated"],
      example: "Sorting emails into spam / not spam, or reviews into positive / negative.",
      interview: "Why is it called \"naive\"? (It assumes all features are independent given the class.)"
    },
    {
      id: "svm", name: "Support Vector Machine", icon: "↔️", family: "Supervised · Classification",
      idea: "Finds the dividing line that leaves the widest possible gap between two groups.",
      analogy: "Building a road between two villages: you want the widest road possible that doesn't touch any house on either side.",
      how: ["Find the boundary with the biggest margin between classes.", "Only the closest points (support vectors) matter.", "Use the \"kernel trick\" to bend the boundary for curved patterns."],
      use: "Medium-sized datasets with clear separation, including high-dimensional data like text.",
      pros: ["Strong on high-dimensional data", "Robust with a clear margin", "Kernels allow curved boundaries"],
      cons: ["Slow on very large datasets", "Needs scaling and tuning", "No direct probabilities"],
      example: "Classifying handwritten digits or gene-expression data.",
      interview: "What is the kernel trick? (Computing similarity as if data were in a higher dimension without actually transforming it.)"
    },
    {
      id: "kmeans", name: "K-Means Clustering", icon: "🎯", family: "Unsupervised · Clustering",
      idea: "Groups unlabeled data into K clusters of similar items.",
      analogy: "Placing K pizza shops in a city so that every home is as close as possible to its nearest shop.",
      how: ["Pick K random centers.", "Assign every point to its nearest center.", "Move each center to the middle of its points.", "Repeat until centers stop moving."],
      use: "Finding natural groups when you have no labels.",
      pros: ["Simple and fast", "Scales to large data", "Easy to explain"],
      cons: ["You must choose K", "Assumes round, similar-sized clusters", "Sensitive to scaling and starting points"],
      example: "Customer segmentation: bargain hunters, loyal regulars, big spenders.",
      interview: "How do you pick K? (Elbow method or silhouette score, plus business sense.)"
    },
    {
      id: "dbscan", name: "DBSCAN & Hierarchical", icon: "🧩", family: "Unsupervised · Clustering",
      idea: "Clustering methods that find groups by density (DBSCAN) or by merging step by step (hierarchical).",
      analogy: "DBSCAN: crowds at a festival. Dense crowds are groups; people standing alone are outliers. Hierarchical: a family tree that joins the closest relatives first.",
      how: ["DBSCAN: points with many close neighbors form a cluster core; clusters grow outward; isolated points become noise.", "Hierarchical: start with every point alone, keep merging the two closest groups, then cut the tree (dendrogram) at the level you want."],
      use: "When clusters have odd shapes, you don't know K, or you need to flag outliers.",
      pros: ["No need to pick K (DBSCAN)", "Finds any shape and flags noise", "Dendrogram shows structure (hierarchical)"],
      cons: ["DBSCAN is sensitive to its distance setting", "Hierarchical is slow on big data"],
      example: "Finding hotspots on a map of delivery locations.",
      interview: "When would you prefer DBSCAN over K-Means? (Non-round clusters, unknown K, or noisy data with outliers.)"
    },
    {
      id: "pca", name: "PCA", icon: "🗜️", family: "Unsupervised · Dimensionality reduction",
      idea: "Compresses many columns into a few new ones that keep most of the information.",
      analogy: "Taking a photo of a 3D object from the angle that shows the most detail. You lose a dimension but keep the important shape.",
      how: ["Scale the features.", "Find the direction where the data varies the most (1st component).", "Find the next direction at a right angle to it, and so on.", "Keep only the top few components."],
      use: "Visualizing high-dimensional data, speeding up models, removing redundancy.",
      pros: ["Reduces noise and size", "Great for 2D/3D visualization", "Removes correlated features"],
      cons: ["New features are hard to interpret", "Only captures straight-line relationships"],
      example: "Squeezing 100 survey answers into 3 personality scores.",
      interview: "What does \"explained variance\" mean? (The share of the data's total spread each component keeps.)"
    },
    {
      id: "iforest", name: "Isolation Forest", icon: "🏝️", family: "Unsupervised · Anomaly detection",
      idea: "Finds unusual data points (anomalies) by checking how quickly random cuts can separate them from everything else.",
      analogy: "Finding the one person standing alone in a field: with just one or two lines you can fence them off. People in the crowd need many fences.",
      how: ["Pick a random feature and a random cut point. Repeat to split the data.", "Count how many cuts it takes to isolate each point.", "Do this with many random trees.", "Points isolated with very few cuts on average are flagged as anomalies."],
      use: "Fraud detection, network intrusion, faulty sensors, when you have few or no labeled anomalies.",
      pros: ["Fast and scales to big data", "No labels needed", "Works with many features"],
      cons: ["You must guess the expected share of anomalies (contamination)", "Scores can be hard to explain"],
      example: "Flagging a credit card purchase that is unusually large and in an unusual country.",
      interview: "Why do anomalies get short paths in an Isolation Forest? (They are few and different, so random cuts separate them quickly.)"
    },
    {
      id: "hbos", name: "HBOS", icon: "📊", family: "Unsupervised · Anomaly detection",
      idea: "Histogram-Based Outlier Score: builds a histogram for each feature and flags points that fall into rare bins.",
      analogy: "In a class height chart, most students are in the middle bars. Someone in an almost-empty bar at the far end stands out immediately.",
      how: ["For each feature, draw a histogram (count values in bins).", "Rare bins (low bars) mean unusual values.", "Score each point by how rare its bin is, feature by feature.", "Add the scores up. The highest totals are outliers."],
      use: "Very large datasets where you need a quick anomaly check.",
      pros: ["Extremely fast", "Simple to understand", "No labels needed"],
      cons: ["Treats features independently, so it misses unusual combinations", "Depends on bin size choice"],
      example: "Spotting server machines with unusual CPU or memory readings across millions of logs.",
      interview: "What is HBOS's main weakness compared to Isolation Forest? (It ignores relationships between features, so a point that is normal on each feature but odd in combination goes unnoticed.)"
    },
    {
      id: "nn", name: "Neural Networks", icon: "🧠", family: "Deep Learning",
      idea: "Layers of simple math units (neurons) that together learn very complex patterns.",
      analogy: "A factory assembly line: each station does a tiny job, and together they turn raw materials (pixels, words) into a finished answer.",
      how: ["Inputs flow through layers; each neuron multiplies inputs by weights, adds them, and applies an activation.", "The output is compared to the right answer (loss).", "Backpropagation works out how much each weight caused the error.", "Gradient descent adjusts all weights a little. Repeat over many examples (epochs)."],
      use: "Large datasets with complex patterns: images, sound, text.",
      pros: ["Learns features automatically", "State of the art on unstructured data", "Very flexible"],
      cons: ["Needs lots of data and compute", "Hard to explain", "Many settings to tune"],
      example: "Predicting whether a medical scan shows disease.",
      interview: "What is an activation function and why is it needed? (Adds non-linearity; without it, many layers collapse into one straight line.)"
    }
  ];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }
  const list = (arr) => "<ul>" + arr.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul>";

  function panelHTML(a) {
    return (
      '<div class="algo-head"><span class="algo-icon">' + a.icon + "</span><div><h3>" + esc(a.name) +
      '</h3><span class="algo-family">' + esc(a.family) + "</span></div></div>" +
      '<p class="algo-idea">' + esc(a.idea) + "</p>" +
      ((window.ALGO_VISUALS || {})[a.id]
        ? '<figure class="algo-visual">' + window.ALGO_VISUALS[a.id].svg +
          "<figcaption>" + esc(window.ALGO_VISUALS[a.id].caption) + "</figcaption></figure>"
        : "") +
      '<div class="algo-analogy"><strong>💡 Everyday analogy</strong><p>' + esc(a.analogy) + "</p></div>" +
      '<div class="algo-grid">' +
      '<div class="algo-box"><h4>⚙️ How it works</h4><ol>' + a.how.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ol></div>" +
      '<div class="algo-box"><h4>🎯 When to use it</h4><p>' + esc(a.use) + '</p><h4>🌍 Real-world example</h4><p>' + esc(a.example) + "</p></div>" +
      '<div class="algo-box good"><h4>👍 Strengths</h4>' + list(a.pros) + "</div>" +
      '<div class="algo-box bad"><h4>👎 Weaknesses</h4>' + list(a.cons) + "</div>" +
      "</div>" +
      '<div class="algo-interview"><strong>🎤 Interview question</strong><p>' + esc(a.interview) + "</p></div>"
    );
  }

  function build() {
    const slides = Array.from(document.querySelectorAll("section.slide"));
    const old = slides.find((s) => /deep\s*learning/i.test(s.dataset.title || ""));
    if (!old || document.getElementById("algorithms")) return;

    const sec = document.createElement("section");
    sec.className = "slide";
    sec.id = "algorithms";
    sec.dataset.title = "Algorithms Explained";
    sec.dataset.group = old.dataset.group || "Models";
    sec.dataset.icon = "🧮";

    const families = [...new Set(ALGOS.map((a) => a.family.split(" · ")[0]))];
    sec.innerHTML =
      '<h2>🧮 Algorithms Explained</h2>' +
      '<p class="algo-sub">Pick an algorithm tab to see what it does, an everyday analogy, how it works, and when to use it.</p>' +
      '<div class="algo-filter" role="group" aria-label="Filter by family">' +
      '<button class="on" data-fam="">All</button>' +
      families.map((f) => '<button data-fam="' + esc(f) + '">' + esc(f) + "</button>").join("") +
      "</div>" +
      '<div class="algo-tabs" role="tablist">' +
      ALGOS.map((a, i) =>
        '<button role="tab" id="tab-' + a.id + '" aria-controls="panel-algo" aria-selected="' + (i === 0) +
        '" data-algo="' + a.id + '" data-fam="' + esc(a.family.split(" · ")[0]) + '">' + a.icon + " " + esc(a.name) + "</button>"
      ).join("") +
      "</div>" +
      '<div class="algo-panel" id="panel-algo" role="tabpanel"></div>';

    // Keep the old slide in a hidden holder so any existing app.js lookups still find their elements.
    const holder = document.createElement("div");
    holder.hidden = true;
    holder.style.display = "none";
    old.parentNode.insertBefore(sec, old);
    old.classList.remove("slide", "active");
    holder.appendChild(old);
    sec.parentNode.appendChild(holder);

    const panel = sec.querySelector(".algo-panel");
    const tabs = Array.from(sec.querySelectorAll(".algo-tabs button"));
    function select(id) {
      const a = ALGOS.find((x) => x.id === id) || ALGOS[0];
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.algo === a.id)));
      panel.setAttribute("aria-labelledby", "tab-" + a.id);
      panel.innerHTML = panelHTML(a);
    }
    tabs.forEach((t) => t.addEventListener("click", () => select(t.dataset.algo)));

    sec.querySelectorAll(".algo-filter button").forEach((b) =>
      b.addEventListener("click", () => {
        sec.querySelectorAll(".algo-filter button").forEach((x) => x.classList.toggle("on", x === b));
        const fam = b.dataset.fam;
        let first = null;
        tabs.forEach((t) => {
          const show = !fam || t.dataset.fam === fam;
          t.hidden = !show;
          if (show && !first) first = t;
        });
        const cur = tabs.find((t) => t.getAttribute("aria-selected") === "true");
        if (first && (!cur || cur.hidden)) select(first.dataset.algo);
      })
    );
    select(ALGOS[0].id);
  }

  if (document.readyState !== "loading" || document.querySelector("section.slide")) build();
  else document.addEventListener("DOMContentLoaded", build);
})();
