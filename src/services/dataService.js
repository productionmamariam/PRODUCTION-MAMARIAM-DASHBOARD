// =============================================================================
// DATA SERVICE LAYER — the swap point for Firebase.
//
// Every function below has a signature that stays identical whether it reads
// from the in-memory mock arrays (src/data/mockData.js) or from Firestore
// collections (products / orders / order_items / stock_movements).
//
// UI components and utils/processing.js call ONLY this layer — never
// src/data/mockData.js directly. So migrating to V2 means rewriting the
// function bodies in this one file; nothing else in the app changes.
//
// Suggested V2 shape for getOrderItems, e.g.:
//   const snap = await getDocs(query(
//     collection(db, 'order_items'),
//     where('date', '>=', dateRange.start),
//     where('date', '<=', dateRange.end)
//   ))
//   return snap.docs.map(d => d.data())
// =============================================================================

import { PRODUCTS, PLATFORMS, rawStore, TODAY, toISO } from '../data/mockData.js'

export const dataService = {
  getProducts: () => PRODUCTS,
  getPlatforms: () => PLATFORMS,

  // order_items joined with each item's parent order (platform/date/status)
  getOrderItems: (filters) => {
    const { dateRange, sku, platform } = filters
    return rawStore.orderItems.filter((item) => {
      if (item.date < dateRange.start || item.date > dateRange.end) return false
      if (sku !== 'ALL' && item.sku !== sku) return false
      if (platform !== 'ALL' && item.platform !== platform) return false
      return true
    })
  },

  // Trend series intentionally ignores the Date-range KPI filter — a single
  // "Today" selection would otherwise collapse the chart to one point.
  // It still respects SKU / Platform. See README "Assumptions".
  getTrendItems: (windowDays, sku, platform) => {
    const start = new Date(TODAY)
    start.setDate(start.getDate() - (windowDays - 1))
    const startIso = toISO(start)
    return rawStore.orderItems.filter((item) => {
      if (item.date < startIso || item.date > toISO(TODAY)) return false
      if (sku !== 'ALL' && item.sku !== sku) return false
      if (platform !== 'ALL' && item.platform !== platform) return false
      return true
    })
  },

  getAllOrderItems: () => rawStore.orderItems,
}
