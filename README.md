# Sleeper Fantasy Football Web App & Analytics

A modern, responsive web application and data exploration suite for **Sleeper Fantasy Football** leagues, pre-configured for **"The Few, The Proud"** (League ID: `1365771765128663040`).

Built with **Next.js (App Router), TypeScript, and Tailwind CSS** for zero-configuration deployment to **Vercel**, plus a **Jupyter Notebook** environment for exploratory data analysis and custom visualizations with Pandas.

---

## Features

- **Direct Sleeper API Integration:** Zero dependencies on unofficial, fragile SDKs. Built-in Next.js caching (`revalidate`) for high performance.
- **League Standings & Power Rankings:** Live rank, W-L-T records, win percentage, Points For (PF), Points Against (PA), scoring differentials, streaks, and FAAB waiver budgets.
- **Weekly Matchups Viewer:** Week-by-week (Weeks 1–18) head-to-head score tracking with margin calculations and winner highlights.
- **Roster Explorer:** Full rosters, starter vs. bench breakdowns, and manager avatars directly from Sleeper CDN.
- **League ID Switcher:** Easily explore different Sleeper leagues on the fly.
- **Python Jupyter Playground:** Interactive notebook with pandas dataframes, weekly head-to-head calculations, and matplotlib charts.

---

## 1. Web App Setup (Next.js & Vercel)

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploying to Vercel

Because this is a standard Next.js application, deploying to Vercel requires no Docker or server setup:

#### Method A: Git Push (Recommended)
1. Push your repository to GitHub, GitLab, or Bitbucket:
   ```bash
   git add .
   git commit -m "Initialize Sleeper fantasy football web app"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository. Vercel will automatically detect Next.js and deploy with optimal settings.

#### Method B: Vercel CLI
```bash
npx vercel
```

---

## 2. Python Jupyter Exploration Notebook

A pre-configured notebook is provided in `notebooks/sleeper_exploration.ipynb` for custom statistics, power rankings, and charts.

### Setup Instructions

1. Create and activate a Python virtual environment:
   ```bash
   # Windows PowerShell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Launch Jupyter:
   ```bash
   jupyter notebook notebooks/sleeper_exploration.ipynb
   # OR
   jupyter lab
   ```

*(You can also open `notebooks/sleeper_exploration.ipynb` directly in VS Code by selecting your `.venv` Python kernel).*

---

## Project Structure

```
sleeper-fantasy-football/
├── notebooks/
│   └── sleeper_exploration.ipynb  # Interactive Python data analysis
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── league/route.ts    # Complete league data API endpoint
│   │   │   └── matchups/route.ts  # Weekly matchup data endpoint
│   │   ├── globals.css            # Dark sports theme Tailwind styles
│   │   ├── layout.tsx             # Root app layout
│   │   └── page.tsx               # Main interactive dashboard UI
│   └── lib/
│       └── sleeper.ts             # Typed Sleeper REST API client & helpers
├── .gitignore
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── requirements.txt               # Python dependencies for Jupyter
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```