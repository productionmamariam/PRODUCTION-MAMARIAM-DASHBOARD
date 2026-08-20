// =============================================================================
// DATA SERVICE LAYER — the swap point for Firebase.
//
// loadData() runs once when the app boots. If Firebase env vars are set
// (see src/services/firebase.js), it fetches from the Firestore
// collections `orders`, `order_items`, and `products`, joins order_items
// with their parent order (to attach date/platform), and caches the result
// in memory. If Firebase isn't configured, or the fetch fails for any
// reason, it silently falls back to the mock data generator so the
// dashboard still works standalone.
//
// Every other function below (getOrderItems, getTrendItems, ...) reads
// from that in-memory cache — components and utils/processing.js never
// know or care whether the data came from Firestore or mock data.
// =============================================================================

import { collection, getDocs } from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase.js'
import { PRODUCTS, PLATFORMS, rawStore, TODAY, toISO } from '../data/mockData.js'

let cachedItems = rawStore.orderItems
let cachedProducts = PRODUCTS
let dataSource = 'mock' // 'mock' | 'firebase'
let lastError = null

async function fetchFromFirestore() {
  const [ordersSnap, itemsSnap, productsSnap] = await Promise.all([
    getDocs(collection(db, 'orders')),
    getDocs(collection(db, 'order_items')),
    getDocs(collection(db, 'products')),
  ])

  const ordersById = {}
  ordersSnap.forEach((docSnap) => { ordersById[docSnap.id] = docSnap.data() })

  const products = productsSnap.empty
    ? PRODUCTS
    : productsSnap.docs.map((docSnap) => docSnap.data())

  const items = itemsSnap.docs.map((docSnap) => {
    const item = docSnap.data()
    // order_items may reference their parent order either by a document ID
    // equal to the order's own ID, or by an `orderId` field — support both.
    const order = ordersById[item.orderId] || ordersById[docSnap.id] || {}
    return {
      orderId: item.orderId || docSnap.id,
      sku: item.sku,
      productName: item.productName,
      quantity: Number(item.quantity) || 0,
      date: order.date || item.date,
      platform: order.platform || item.platform,
    }
  })

  return { items, products }
}

export const dataService = {
  isUsingFirebase: () => dataSource === 'firebase',
  getLastError: () => lastError,

  // Call once on app boot (see App.jsx useEffect).
  loadData: async () => {
    lastError = null
    if (!isFirebaseConfigured) {
      cachedItems = rawStore.orderItems
      cachedProducts = PRODUCTS
      dataSource = 'mock'
      return
    }
    try {
      const { items, products } = await fetchFromFirestore()
      cachedItems = items
      cachedProducts = products
      dataSource = 'firebase'
    } catch (err) {
      console.error('Firebase load failed, falling back to mock data:', err)
      lastError = err.message || String(err)
      cachedItems = rawStore.orderItems
      cachedProducts = PRODUCTS
      dataSource = 'mock'
    }
  },

  getProducts: () => cachedProducts,
  getPlatforms: () => PLATFORMS,

  // order_items joined with each item's parent order (platform/date/status)
  getOrderItems: (filters) => {
    const { dateRange, sku, platform } = filters
    return cachedItems.filter((item) => {
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
    return cachedItems.filter((item) => {
      if (item.date < startIso || item.date > toISO(TODAY)) return false
      if (sku !== 'ALL' && item.sku !== sku) return false
      if (platform !== 'ALL' && item.platform !== platform) return false
      return true
    })
  },

  getAllOrderItems: () => cachedItems,
}
