# 💼 FinPro — Personal Finance Dashboard

> A fully offline, browser-based personal finance manager built with vanilla HTML, CSS, and JavaScript. No backend required. All data stays on your device.

[![Live Demo](https://img.shields.io/badge/Open-Live%20Demo-6c63ff?style=flat-square)](./index.html)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-00e676?style=flat-square)](#pwa-support)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

---

## 📸 Overview

FinPro is a feature-complete personal finance dashboard designed as a final year project. It covers the full spectrum of personal finance management — from tracking daily transactions to calculating EMIs, estimating taxes, and scoring your financial health — all within a single Progressive Web App that works offline.

---

## ✨ Features

### 🏠 Dashboard
- **Summary cards** — animated counters for Total Income, Total Expenses, Net Profit, and Average Profit per Entry
- **Income vs Expense bar chart** with date-range filter (All Time / Last 7 Days / Last 30 Days)
- **Recent Transactions** feed — 8 latest entries with category emoji and color coding
- **Financial Health Score ring** with live breakdown
- **Quick Action buttons** — Add Income, Add Expense, EMI Calc, Recurring, Export PDF
- **Smart Insight strip** — personalized tips based on your data

### 💳 Transactions
- Add, edit, and delete income/expense entries
- **Sort** by Date, Income, Expense, or Profit (ascending/descending)
- **Multi-filter**: search by keyword, filter by category, type, and month
- Color-coded table rows (green = income, red = expense)
- Copy table to clipboard (TSV format for pasting into Excel)

### 📊 Budget Manager
- Set per-category monthly spending limits
- Visual progress bars (green → orange → red as you approach/exceed the limit)
- Real-time **Budget Alerts** via in-app notifications
- Overview totals: Total Budget, Total Spent, Remaining

### 🎯 Savings Goals
- Create unlimited savings goals with a target amount, deadline, and custom emoji icon
- Progress tracked against cumulative net profit
- **Confetti animation** when a goal is achieved
- Days-remaining countdown with overdue warning

### 📈 Analytics (4 charts)
| Chart | Type | Description |
|---|---|---|
| Expense by Category | Doughnut | See which categories eat your budget |
| Monthly Profit Trend | Line | Track profitability over time |
| Income vs Expense | Grouped Bar | Month-by-month comparison |
| Savings Rate % | Area Line | Monthly savings rate trend |

Plus a **Top Spending Categories** ranked table with percentage share and above/below average trend indicator.

### 📅 Spending Calendar
- Heat-map calendar view — colour-coded cells by daily spend intensity (Low / Medium / High)
- Navigate month-by-month
- Monthly summary strip: Month Total, Peak Day, Average per Day

### 📋 Reports & Export
| Export | Format | Notes |
|---|---|---|
| Full Report | PDF | jsPDF multi-page with summary header |
| Spreadsheet | XLSX | SheetJS, opens in Excel / Google Sheets |
| Backup | JSON | Full data backup (transactions, budgets, goals, recurring) |
| Import | JSON / CSV | Restore backup or import from any CSV |
| Print | Browser Print | Clean print stylesheet hides UI chrome |

Month-over-Month comparison cards and **Spending Streaks / Milestones** panel.

### 🔁 Recurring Transactions
- Track monthly subscriptions, EMIs, and regular income
- Due-soon banner (entries due within 3 days highlighted in orange)
- One-click **Log Now** to post the entry as a transaction and auto-advance the due date

### 🧮 Financial Tools (4 calculators)
| Tool | What it computes |
|---|---|
| **EMI Calculator** | Monthly instalment, total interest, total payment + doughnut chart; exports as Recurring |
| **Tax Estimator (India)** | New / Old Regime, taxable income, effective rate, monthly take-home + bar chart |
| **SIP Calculator** | Invested vs. portfolio value at maturity + growth line chart |
| **FD Calculator** | Compound interest with annual / half-yearly / quarterly / monthly compounding |

### ❤️ Financial Health Score
Algorithmic score (0–100) across 5 weighted factors:

| Factor | Weight |
|---|---|
| Savings Rate | 30 |
| Budget Adherence | 25 |
| Goal Progress | 20 |
| Spending Balance | 15 |
| Data Consistency | 10 |

Grades: **Excellent 🌟 / Good 👍 / Fair ⚠️ / Needs Work 🔴** with personalised tips.

### ⚙️ Settings
- **User name** personalises the greeting
- **Currency symbol** (₹ / $ / € / £ / ¥) — re-renders all values instantly
- Toggle **Budget Alerts**, **Goal Notifications**, and **Spending Insights**
- Default transaction type and category
- **Compact table view** toggle
- One-click **Load Sample Data** to demo the app

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic markup, PWA manifest link |
| CSS3 | Custom properties, grid/flex layout, dark & light themes, animations |
| Vanilla JavaScript (ES6+) | All app logic, no frameworks |
| [Chart.js 4](https://www.chartjs.org/) | Bar, Line, Doughnut, Area charts |
| [jsPDF 2.5](https://parall.ax/products/jspdf) | Client-side PDF generation |
| [SheetJS (xlsx)](https://sheetjs.com/) | Excel export |
| [Font Awesome 6](https://fontawesome.com/) | Icon set |
| [Google Fonts – Poppins](https://fonts.google.com/specimen/Poppins) | Typography |
| localStorage | Client-side data persistence |
| Service Worker | PWA offline caching |

---

## 📂 Project Structure

```
profit-analyzer/
├── index.html          # App shell — all 11 pages / sections
├── style.css           # Complete design system + responsive styles
├── script.js           # All app logic (~1600 lines)
├── service-worker.js   # PWA offline caching (cache-first + network-first)
├── manifest.json       # PWA manifest (installable, standalone display)
├── icon.png            # App icon (192×192)
└── README.md           # This file
```

> **No build tools. No npm. No dependencies to install.** Open `index.html` in a browser and it works.

---

## ⚙️ How to Run

### Option 1 — Open directly
```
Double-click index.html   →   Opens in your default browser
```

### Option 2 — Live Server (recommended for full PWA features)
```bash
# VS Code extension
Install "Live Server" → Right-click index.html → "Open with Live Server"

# Or with Python
python -m http.server 8080
# Then visit http://localhost:8080
```

### Option 3 — Clone & run
```bash
git clone https://github.com/your-username/profit-analyzer.git
cd profit-analyzer
# Open index.html in browser or use Live Server
```

---

## 📱 PWA Support

FinPro is a **Progressive Web App**. On supported browsers:
- **Install to home screen** (mobile & desktop)  
- **Works offline** — the service worker caches all app assets and CDN resources on first load  
- **Standalone display** — runs without browser chrome, like a native app  

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Alt + N` | Open Add Transaction modal |
| `Alt + 1–9` | Navigate to page (Dashboard → Tools) |
| `Escape` | Close any open modal |

---

## 🗂️ Data Storage

All data is stored in **localStorage** under these keys:

| Key | Contents |
|---|---|
| `fp_data` | Array of transaction objects |
| `fp_budgets` | Object mapping category → budget amount |
| `fp_goals` | Array of goal objects |
| `fp_recurring` | Array of recurring entry objects |
| `fp_settings` | User preferences (name, currency, theme, etc.) |

**No data ever leaves your device.** Export to JSON for backup or to move between browsers.

---

## 📸 Screenshots

| Dashboard | Analytics | Health Score |
|---|---|---|
| Summary cards, charts, quick actions | 4 charts + top categories table | Animated ring, score breakdown, tips |

---

## 🔮 Possible Extensions

- 🔐 Firebase / Supabase backend for cloud sync  
- 🤖 LLM-powered financial advisor (Anthropic Claude API)  
- 📊 Advanced forecasting with linear regression  
- 🏦 Bank statement auto-import (OFX/CSV parsing)  
- 👨‍👩‍👧 Multi-profile / family budgeting support  

---

## 👨‍💻 Author

**Sonu H N**  
Passionate about web development and building smart tools that solve real problems.

---

## 📜 License

This project is open-source under the [MIT License](LICENSE).
