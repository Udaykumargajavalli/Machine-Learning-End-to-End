# Machine Learning End to End

An interactive, beginner-friendly tour of a machine-learning project—from framing a business problem to deploying and monitoring a model. The dashboard is designed for people exploring Data Science, ML Engineering, and AI Engineering, and does not require prior machine-learning knowledge.

**[Open the live learning dashboard](https://udaykumargajavalli.github.io/Machine-Learning-End-to-End/)**

## What you'll learn

The dashboard is organized as a guided sequence of topics:

- ML fundamentals, including how AI, machine learning, deep learning, and generative AI relate
- Supervised, unsupervised, reinforcement, and self-supervised learning
- The end-to-end ML lifecycle: problem definition, data collection and preparation, feature engineering, model selection, training, evaluation, deployment, and monitoring
- Model evaluation, common algorithms, deep learning, generative AI, and MLOps
- Data Scientist, ML Engineer, and AI Engineer career paths, plus a learning roadmap, project ideas, interview preparation, glossary, and quiz

Interactive examples let you train a simple house-price model, explore underfitting and overfitting, and adjust a spam-classification threshold to see how evaluation metrics change. The dashboard also includes a presentation mode and an option to print or save the slides as a PDF.

## Explore the dashboard

- Use the sidebar or the **←** and **→** arrow keys to navigate between topics.
- Press **P** to toggle presentation mode.
- Try the controls in the demos; use the roadmap to track learning topics.
- Toggle light and dark themes with the theme button.

The selected theme and roadmap progress are saved in your browser's local storage.

## Run locally

No build step, package installation, or backend is required. Clone the repository and serve the dashboard directory with any static file server. For example, with Python:

```bash
git clone https://github.com/Udaykumargajavalli/Machine-Learning-End-to-End.git
cd Machine-Learning-End-to-End/Machine_Learning
python -m http.server 8000
```

Then open <http://localhost:8000> in your browser. You can also open `Machine_Learning/index.html` directly, though using a local server is more reliable.

## Project structure

```text
Machine_Learning/
  index.html       Dashboard content and layout
  styles.css       Dashboard styling
  *.js             Navigation, demos, visualizations, and PDF export
.github/workflows/
  pages.yml        GitHub Pages deployment workflow
```

## Deployment

GitHub Pages is configured to publish the `Machine_Learning/` directory. The workflow in `.github/workflows/pages.yml` deploys it when changes are pushed to `main`; it can also be started manually from the repository's Actions tab.
