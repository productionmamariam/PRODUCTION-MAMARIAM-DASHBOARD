// =============================================================================
// MOCK DATA — the only place raw records live for V1.
// In V2, this file is replaced by reads from Firestore collections:
//   products, orders, order_items, stock_movements
// Nothing outside src/services/dataService.js should import from here.
// =============================================================================

export const PRODUCTS = [
  { sku: 'JUS001', productName: 'Jus Mamariam', category: 'Juice' },
  { sku: 'KOK001', productName: 'Koko Zuriat', category: 'Cocoa' },
  { sku: 'MOC001', productName: 'Susu Mocha', category: 'Milk' },
  { sku: 'HAZ001', productName: 'Susu Hazelnut', category: 'Milk' },
  { sku: 'JAM001', productName: 'Jamu Manjaratu', category: 'Herbal' },
]

export const PLATFORMS = ['TikTok', 'Shopee', 'WhatsApp', 'Website', 'Other']

export const TODAY = new Date('2026-08-19T00:00:00')

export function toISO(d) {
  return d.toISOString().slice(0, 10)
}

// deterministic PRNG so the dashboard looks the same on every load
function makeRng(seed) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}
const rng = makeRng(19082026)

const PLATFORM_WEIGHTS = [
  ['TikTok', 0.52], ['Shopee', 0.21], ['WhatsApp', 0.13], ['Website', 0.08], ['Other', 0.06],
]
function weightedPlatform(r) {
  let acc = 0
  for (const [p, w] of PLATFORM_WEIGHTS) { acc += w; if (r <= acc) return p }
  return 'Other'
}

const SKU_WEIGHTS = [
  ['JUS001', 0.40], ['KOK001', 0.22], ['MOC001', 0.16], ['HAZ001', 0.13], ['JAM001', 0.09],
]
function weightedSku(r) {
  let acc = 0
  for (const [s, w] of SKU_WEIGHTS) { acc += w; if (r <= acc) return s }
  return 'JAM001'
}

const PREFIXES = { TikTok: 'TT', Shopee: 'SH', WhatsApp: 'WA', Website: 'WB', Other: 'OT' }

function generateData() {
  const orders = []
  const orderItems = []
  let orderSeq = 10001

  for (let dayOffset = 44; dayOffset >= 0; dayOffset--) {
    const d = new Date(TODAY)
    d.setDate(d.getDate() - dayOffset)
    const iso = toISO(d)

    const weekday = d.getDay()
    const weekendDip = (weekday === 0 || weekday === 6) ? 0.8 : 1
    const trendLift = 1 + (44 - dayOffset) * 0.006
    const baseOrders = Math.round((8 + rng() * 9) * weekendDip * trendLift)

    for (let i = 0; i < baseOrders; i++) {
      const platform = weightedPlatform(rng())
      const orderId = `${PREFIXES[platform]}-${orderSeq}`
      orderSeq += 1

      orders.push({ orderId, date: iso, platform, status: 'Completed' })

      const itemCount = rng() < 0.78 ? 1 : (rng() < 0.85 ? 2 : 3)
      const usedSkus = new Set()
      for (let k = 0; k < itemCount; k++) {
        let sku = weightedSku(rng())
        let guard = 0
        while (usedSkus.has(sku) && guard < 5) { sku = weightedSku(rng()); guard++ }
        usedSkus.add(sku)
        const product = PRODUCTS.find(p => p.sku === sku)
        const quantity = 1 + Math.floor(rng() * 3)
        orderItems.push({ orderId, sku, productName: product.productName, quantity, date: iso, platform })
      }
    }
  }
  return { orders, orderItems }
}

export const rawStore = generateData()
