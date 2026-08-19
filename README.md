# Mamariam — Production & Operation Dashboard (V1)

Sales & Stock Monitoring dashboard for Mamariam Sdn Bhd. Built with **React + Vite + Tailwind CSS (compiled at build time, no CDN) + Recharts**, running on mock data for V1.

## Project structure

```
src/
  data/            mock data — the only place raw records live for V1
    mockData.js
  services/
    dataService.js  ← the single file to rewrite when connecting Firebase
  utils/
    processing.js   pure aggregation logic (KPIs, tables, trends)
    dateUtils.js    date range / formatting helpers
  components/
    layout/         Sidebar, Header
    filters/         FilterBar
    kpi/             KpiCard, Delta
    tables/          SkuPlatformTable, StockOutTable, RecentOrdersTable
    charts/          SalesTrendChart, OrderTrendChart, Top5SkuChart, PlatformPerformance, ChartCard
    common/          Icon, EmptyState
  App.jsx
  main.jsx
  index.css
```

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

To build a production bundle:

```bash
npm run build
npm run preview
```

## Push to GitHub

```bash
git init
git add .
git commit -m "Mamariam dashboard V1"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(Create the empty repo on GitHub first — no README/license, since this project already has one — then run the commands above from this folder.)

## Deploy to Vercel

**Option A — Dashboard (no CLI needed)**
1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import the repo you just pushed.
3. Vercel auto-detects the Vite framework (build command `npm run build`, output `dist` — already set in `vercel.json` too). Click **Deploy**.
4. Every future `git push` to `main` redeploys automatically.

**Option B — CLI**
```bash
npm i -g vercel
vercel        # first deploy, follow prompts
vercel --prod # promote to production
```

## Connecting Firebase later (V2)

Only **`src/services/dataService.js`** needs to change. Its three functions (`getOrderItems`, `getTrendItems`, `getAllOrderItems`) already have the shape Firestore reads would return — swap their bodies for `getDocs`/`query` calls against the `products`, `orders`, `order_items`, and `stock_movements` collections. Nothing in `utils/processing.js` or any component needs to change, since they only ever call the service layer.

Suggested steps:
1. `npm install firebase`
2. Add a `src/services/firebase.js` with your Firebase config (use Vercel environment variables for the keys — don't commit them).
3. Rewrite the function bodies in `dataService.js` to query Firestore instead of `rawStore`.
4. If Firebase isn't configured (no env vars present), keep falling back to mock data so the app still runs standalone.

## Assumptions (carried over from V1 spec)

- Daily trend charts always show a fixed trailing 30-day window, independent of the Date filter (a "Today" selection would otherwise flatten the chart to a single point). SKU/Platform filters still apply to the charts.
- "vs previous period" KPI deltas compare the selected window to an equal-length immediately preceding window.
- Sidebar items other than Dashboard (Sales, Inventory, Production, Operation, Reports, Settings) are placeholders — clicking shows a "Coming in V2" toast.
- Header notification bell and user avatar are static for V1.
