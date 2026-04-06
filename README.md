# Study Time Optimizer — 0/1 Knapsack

A full React web application that uses the **0/1 Knapsack dynamic programming** algorithm to optimally allocate study hours across subjects.

---

## Quick Start (VS Code)

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm start
```

The app opens at **http://localhost:3000** automatically.

---

## Build for Production

```bash
npm run build
```

Creates an optimized `build/` folder. Deploy its contents to any static host.

---

## Deploy Options

### Vercel (recommended — free)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag the build/ folder to https://app.netlify.com/drop
```

### GitHub Pages
```bash
npm install --save-dev gh-pages
# Add to package.json: "homepage": "https://yourusername.github.io/study-optimizer"
# Add scripts: "predeploy": "npm run build", "deploy": "gh-pages -d build"
npm run deploy
```

---

## Project Structure

```
study-optimizer/
├── public/
│   └── index.html              # HTML shell
├── src/
│   ├── index.js                # React entry point
│   ├── index.css               # Global design system (tokens, buttons, inputs)
│   ├── App.jsx                 # Root component — state & layout
│   ├── utils/
│   │   └── knapsack.js         # 0/1 Knapsack DP algorithm + helpers
│   └── components/
│       ├── SubjectForm.jsx     # Add subject form with validation
│       ├── SubjectList.jsx     # Subject cards with selected/skipped indicators
│       ├── ConstraintsPanel.jsx# Time budget slider + strategy picker
│       ├── ResultsPanel.jsx    # Optimization results + schedule
│       ├── ChartPanel.jsx      # Bar chart, radar chart, efficiency ranking
│       ├── DPTable.jsx         # Interactive DP table visualization
│       └── HistoryPanel.jsx    # Past optimization runs
└── package.json
```

---

## Features

| Feature | Description |
|---|---|
| Subject management | Add/remove subjects with name, hours, priority, score boost, urgency |
| 0/1 Knapsack | Full bottom-up DP, traceback for selected items |
| 3 strategies | Weighted, max score boost, max priority |
| Results view | Metric cards, per-subject breakdown, suggested schedule |
| Charts | Bar chart (value vs hours), efficiency ranking, radar profile |
| DP Table | Full dynamic programming table with highlighted cells |
| Run history | Save, restore, and compare past optimization runs |
| Responsive | Works on desktop and tablet |

---

## Algorithm Details

The knapsack runs in **O(n × W)** time and space, where:
- **n** = number of subjects
- **W** = total study hours (budget)

Value function per strategy:
- `weighted` → `priority × score_boost × urgency / 10`
- `score`    → `score_boost × urgency`
- `priority` → `priority × urgency × 10`

Urgency multipliers: Low=1.0, Medium=1.3, High=1.6, Critical=2.0
