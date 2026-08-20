// =============================================================================
// DATA PROCESSING LAYER — pure aggregation functions, UI-agnostic.
// Takes arrays from dataService and returns view-ready shapes.
// =============================================================================

import { PLATFORMS, TODAY, toISO } from '../data/mockData.js'
import { dataService } from '../services/dataService.js'

export const proc = {
  uniqueOrderCount: (items) => new Set(items.map((i) => i.orderId)).size,
  unitsSold: (items) => items.reduce((sum, i) => sum + i.quantity, 0),
  skuCount: (items) => new Set(items.map((i) => i.sku)).size,

  topPlatform: (items) => {
    const byPlatform = {}
    items.forEach((i) => { byPlatform[i.platform] = (byPlatform[i.platform] || 0) + i.quantity })
    const total = proc.unitsSold(items) || 1
    let top = null, topUnits = -1
    Object.entries(byPlatform).forEach(([p, u]) => { if (u > topUnits) { top = p; topUnits = u } })
    return { platform: top, share: top ? Math.round((topUnits / total) * 100) : 0 }
  },

  skuByPlatformTable: (items) => {
    const products = dataService.getProducts()
    const rows = {}
    products.forEach((p) => {
      rows[p.sku] = { sku: p.sku, product: p.productName, TikTok: 0, Shopee: 0, WhatsApp: 0, Website: 0, Other: 0, total: 0 }
    })
    items.forEach((i) => {
      if (!rows[i.sku]) return
      rows[i.sku][i.platform] = (rows[i.sku][i.platform] || 0) + i.quantity
      rows[i.sku].total += i.quantity
    })
    return Object.values(rows)
  },

  dailySeries: (items) => {
    const units = {}
    const orderSets = {}
    items.forEach((i) => {
      units[i.date] = (units[i.date] || 0) + i.quantity
      orderSets[i.date] = orderSets[i.date] || new Set()
      orderSets[i.date].add(i.orderId)
    })
    const dates = Object.keys(units).sort()
    return dates.map((d) => ({
      date: d,
      label: new Date(d + 'T00:00:00').toLocaleDateString('en-MY', { day: '2-digit', month: 'short' }),
      units: units[d] || 0,
      orders: orderSets[d] ? orderSets[d].size : 0,
    }))
  },

  top5Sku: (items) => {
    const products = dataService.getProducts()
    const bySku = {}
    items.forEach((i) => { bySku[i.sku] = (bySku[i.sku] || 0) + i.quantity })
    const total = proc.unitsSold(items) || 1
    return Object.entries(bySku)
      .map(([sku, units]) => {
        const p = products.find((pr) => pr.sku === sku)
        return { sku, product: p ? p.productName : sku, units, share: Math.round((units / total) * 100) }
      })
      .sort((a, b) => b.units - a.units)
      .slice(0, 5)
  },

  platformPerformance: (items) => {
    const byPlatform = {}
    PLATFORMS.forEach((p) => { byPlatform[p] = { platform: p, orders: new Set(), units: 0 } })
    items.forEach((i) => {
      if (!byPlatform[i.platform]) byPlatform[i.platform] = { platform: i.platform, orders: new Set(), units: 0 }
      byPlatform[i.platform].orders.add(i.orderId)
      byPlatform[i.platform].units += i.quantity
    })
    const totalUnits = proc.unitsSold(items) || 1
    return Object.values(byPlatform)
      .map((p) => ({
        platform: p.platform,
        orders: p.orders.size,
        units: p.units,
        share: Math.round((p.units / totalUnits) * 100),
      }))
      .sort((a, b) => b.units - a.units)
  },

  stockOut: (sku, platform) => {
    const products = dataService.getProducts()
    const windows = { today: 1, week: 7, month: 30 }
    const result = {}
    products.forEach((p) => { result[p.sku] = { sku: p.sku, product: p.productName, today: 0, week: 0, month: 0 } })
    const allItems = dataService.getAllOrderItems()
    Object.entries(windows).forEach(([key, days]) => {
      const start = new Date(TODAY); start.setDate(start.getDate() - (days - 1))
      const startIso = toISO(start)
      allItems.forEach((i) => {
        if (i.date < startIso || i.date > toISO(TODAY)) return
        if (sku !== 'ALL' && i.sku !== sku) return
        if (platform !== 'ALL' && i.platform !== platform) return
        if (result[i.sku]) result[i.sku][key] += i.quantity
      })
    })
    return Object.values(result).filter((r) => sku === 'ALL' || r.sku === sku)
  },

  trendStatus: (sku, platform) => {
    const items7 = dataService.getTrendItems(7, sku, platform)
    const items14 = dataService.getTrendItems(14, sku, platform)
    const startPrev = new Date(TODAY); startPrev.setDate(startPrev.getDate() - 13)
    const endPrev = new Date(TODAY); endPrev.setDate(endPrev.getDate() - 7)
    const prevItems = items14.filter((i) => i.date >= toISO(startPrev) && i.date < toISO(endPrev))
    const curUnits = proc.unitsSold(items7)
    const prevUnits = proc.unitsSold(prevItems)
    let pct = 0
    if (prevUnits === 0) pct = curUnits > 0 ? 100 : 0
    else pct = ((curUnits - prevUnits) / prevUnits) * 100
    let status = 'STABLE'
    if (pct > 5) status = 'INCREASING'
    else if (pct < -5) status = 'DECREASING'
    return { status, pct }
  },

  recentOrders: (items, limit = 8) => {
    return [...items]
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.orderId < b.orderId ? 1 : -1))
      .slice(0, limit)
  },

  pctChange: (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  },
}

// previous-period comparison: mirrors the currently selected window length,
// shifted back one window, for the 4 KPI cards
export function previousPeriodItems(filters) {
  const start = new Date(filters.dateRange.start + 'T00:00:00')
  const end = new Date(filters.dateRange.end + 'T00:00:00')
  const spanDays = Math.round((end - start) / 86400000) + 1
  const prevEnd = new Date(start); prevEnd.setDate(prevEnd.getDate() - 1)
  const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - (spanDays - 1))
  return dataService.getOrderItems({
    dateRange: { start: toISO(prevStart), end: toISO(prevEnd) },
    sku: filters.sku,
    platform: filters.platform,
  })
}
