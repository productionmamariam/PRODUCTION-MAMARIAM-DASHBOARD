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

## Firebase is already connected — here's how to switch it on

`src/services/firebase.js` initializes Firebase from environment variables, and `src/services/dataService.js` automatically reads from Firestore when those variables are present — otherwise it quietly falls back to mock data. The header shows a small **"Live: Firebase"** or **"Demo data"** badge so you always know which one is active.

### 1. Create a Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** → follow the prompts (Google Analytics is optional, you can skip it).
2. Once created, click the **Web** icon (`</>`) to register a web app. Give it any nickname (e.g. "Mamariam Dashboard"). You do **not** need Firebase Hosting.
3. Firebase will show you a `firebaseConfig` object with keys like `apiKey`, `authDomain`, `projectId`, etc. Keep this tab open — you'll copy these in step 3.

### 2. Create Firestore and the three collections
1. In the left sidebar, click **Build > Firestore Database** → **Create database** → choose a location close to Malaysia (e.g. `asia-southeast1`) → start in **test mode** for now (you can lock it down later — see the security note below).
2. Create three collections by clicking **Start collection**:
   - **`products`** — one document per SKU. Example document (Document ID can be auto or the SKU itself, e.g. `JUS001`):
     ```json
     { "sku": "JUS001", "productName": "Jus Mamariam", "category": "Juice" }
     ```
   - **`orders`** — one document per order (Document ID = your Order ID, e.g. `TT-10001`):
     ```json
     { "date": "2026-08-19", "platform": "TikTok", "status": "Completed" }
     ```
   - **`order_items`** — one document per line item in an order (auto-generate Document ID is fine):
     ```json
     { "orderId": "TT-10001", "sku": "JUS001", "productName": "Jus Mamariam", "quantity": 3 }
     ```
   Repeat for each product / order / order item. `orderId` in `order_items` must match the Document ID you used in `orders` so the dashboard can join them.

   A `stock_movements` collection is reserved for a future V2 (real inventory in/out) — not required to get the dashboard working with sales data.

3. **Security rules** (Firestore Database > Rules tab) — test mode expires after 30 days. A simple **read-only public** rule works well for an internal dashboard with no login yet:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read: if true;
         allow write: if false;
       }
     }
   }
   ```
   This lets the dashboard read data but blocks public writes — you'll add/edit data from the Firebase Console itself (or a future admin form with Firebase Authentication).

### 3. Add your config keys
1. Locally: copy `.env.example` to `.env.local`, and fill in the values from the `firebaseConfig` object you saw in step 1.
2. On Vercel: go to your project → **Settings > Environment Variables** → add each `VITE_FIREBASE_...` name with its value → redeploy (Vercel does this automatically on the next push, or click **Redeploy** manually).

### 4. Confirm it worked
Open the dashboard — the header badge should switch from **"Demo data"** to **"Live: Firebase"**. If it still shows demo data, double-check the env var names match exactly and that you redeployed after adding them.

### Updating data day-to-day — Import Orders (recommended)

The dashboard has a built-in **Import Orders** screen (Sidebar → "Import Data") with two modes:

**Mode 1 — Luxana Export (.xlsx)** — the recommended path. Export your Orders report from Luxana as-is and upload the `.xlsx` file directly; no reformatting needed. The importer (`src/services/luxanaImportService.js`) automatically:
- Splits orders with multiple products into separate line items (matched by the `SKUs` and `Products` columns).
- Converts Luxana's `DD/MM/YY` order date to the dashboard's date format.
- Maps `Channel/Source` → platform: `tiktok` → TikTok, `shopee` → Shopee.
- **Assumption:** orders with a blank `Channel/Source` but a `Staff Sales` or `Smart Partner` value in `Sales Role` are mapped to **WhatsApp** (treated as direct/manual sales). If that's not accurate for your workflow, this mapping is one function (`mapPlatform`) in `luxanaImportService.js` — easy to adjust.
- Auto-creates any new SKU as a product in Firestore (`sku` + `productName`) if it doesn't already exist, so new products show up in the dashboard tables without manual setup.
- Flags orders where product/quantity splitting was ambiguous (shown as "to verify" warnings in the import preview) — these use an even split of the order's Total Quantity across its SKUs as a best-effort fallback.

**Known V1 limits:**
- All order statuses (`completed`, `in_transit`, `rejected`, `returned`) are currently imported and counted the same way in KPIs — the dashboard doesn't yet exclude rejected/returned orders from Units Sold or Total Orders. Flag if you'd like that changed.
- Re-importing the same Luxana file is safe — matching Order IDs and SKU line items are updated in place, not duplicated.

**Mode 2 — Manual Template (.csv)** — for one-off manual entry or other systems. Click "Download template" inside the Import screen for the exact column headers needed: `orderId, date, platform, status, sku, productName, quantity`. One row = one product line in an order.

### Setting up staff accounts (for Import access)

Viewing the dashboard itself needs no login. Importing data does, so random visitors can't write to your database.

1. In Firebase Console → **Build > Authentication** → click **Get started** → under "Sign-in method", enable **Email/Password**.
2. Go to the **Users** tab → **Add user** → enter an email and password for each staff member who should be able to import orders.
3. That's it — they can now sign in on the Import Data screen with those credentials.

### Firestore security rules (updated for Import)

Since Import now writes data, update your rules to require login for writes, while keeping the dashboard itself publicly readable:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Paste this in Firebase Console → Firestore Database → **Rules** tab → **Publish**.

## Assumptions (carried over from V1 spec)

- Daily trend charts always show a fixed trailing 30-day window, independent of the Date filter (a "Today" selection would otherwise flatten the chart to a single point). SKU/Platform filters still apply to the charts.
- "vs previous period" KPI deltas compare the selected window to an equal-length immediately preceding window.
- Sidebar items other than Dashboard (Sales, Inventory, Production, Operation, Reports, Settings) are placeholders — clicking shows a "Coming in V2" toast.
- Header notification bell and user avatar are static for V1.
