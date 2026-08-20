// =============================================================================
// LUXANA IMPORT SERVICE — parses the .xlsx export from Luxana OMS directly
// (Orders sheet), and maps its columns to the standard row shape used by
// importService.js: { orderId, date, platform, status, sku, productName, quantity }
//
// Luxana's export is one row per ORDER (not one row per line item). When an
// order has multiple products, the `SKUs` and `Products` columns each hold
// comma-separated lists for that single row. This service splits those into
// individual line items.
//
// Known Luxana columns used (others are ignored):
//   Order Date       e.g. "01/07/26 00:06"  (DD/MM/YY HH:MM)
//   Order ID         e.g. 1528419
//   Status           e.g. completed | in_transit | rejected | returned
//   Products         comma-separated product names, each ending in " x<qty>"
//   SKUs             comma-separated SKU codes, same order as Products
//   Total Quantity   total units across all line items in the order
//   Channel/Source   tiktok | shopee | (blank for direct/offline sales)
//   Sales Role       Staff Sales | Smart Partner | Super Admin (used as a
//                    fallback signal when Channel/Source is blank)
//
// ASSUMPTIONS (surfaced to the user in the import preview / README):
// - Orders with a blank Channel/Source but a "Staff Sales" or "Smart Partner"
//   Sales Role are mapped to platform "WhatsApp" (direct/manual sales) —
//   adjust mapPlatform() below if that doesn't match how your team actually
//   takes those orders.
// - When an order has multiple SKUs, quantities are split from the Products
//   text by finding each " x<number>" marker. If the number of parsed
//   segments doesn't match the number of SKUs, this falls back to dividing
//   Total Quantity evenly across the SKUs and flags the order as ambiguous
//   in the returned `warnings` array — worth a manual check for those orders.
// =============================================================================

import * as XLSX from 'xlsx'

export function parseLuxanaFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames.includes('Orders') ? 'Orders' : workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
        resolve(rows)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

function convertLuxanaDate(raw) {
  if (!raw) return null
  const datePart = String(raw).trim().split(' ')[0] // "01/07/26 00:06" -> "01/07/26"
  const parts = datePart.split('/')
  if (parts.length !== 3) return null
  const [dd, mm, yy] = parts
  const yyyy = yy.length === 2 ? `20${yy}` : yy
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
}

function mapStatus(raw) {
  const s = String(raw || '').trim().toLowerCase()
  const map = {
    completed: 'Completed',
    in_transit: 'In Transit',
    rejected: 'Rejected',
    returned: 'Returned',
  }
  return map[s] || (s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Completed')
}

function mapPlatform(channelSource, salesRole) {
  const c = String(channelSource || '').trim().toLowerCase()
  if (c === 'tiktok') return 'TikTok'
  if (c === 'shopee') return 'Shopee'
  const role = String(salesRole || '').trim().toLowerCase()
  if (role === 'staff sales' || role === 'smart partner') return 'WhatsApp'
  return 'Other'
}

// Splits a Luxana "Products" cell into [{ name, qty }] by finding every
// " x<number>" marker (each product segment ends with one).
function splitProductSegments(productsStr) {
  const regex = /\sx(\d+)(?:,\s*|$)/g
  const segments = []
  let lastIndex = 0
  let match
  while ((match = regex.exec(productsStr)) !== null) {
    const name = productsStr.slice(lastIndex, match.index).trim()
    segments.push({ name, qty: Number(match[1]) })
    lastIndex = regex.lastIndex
  }
  return segments
}

export function mapLuxanaRows(rawRows) {
  const output = []
  const warnings = []

  rawRows.forEach((row, idx) => {
    const lineNo = idx + 2
    const orderId = String(row['Order ID'] || '').trim()
    const dateRaw = row['Order Date']
    const date = convertLuxanaDate(dateRaw)
    const status = mapStatus(row['Status'])
    const platform = mapPlatform(row['Channel/Source'], row['Sales Role'])
    const productsStr = String(row['Products'] || '').trim()
    const skusStr = String(row['SKUs'] || '').trim()
    const totalQty = Number(row['Total Quantity']) || 0

    if (!orderId || !date || !skusStr) {
      warnings.push(`Row ${lineNo}: missing Order ID, Order Date, or SKUs — skipped.`)
      return
    }

    const skuList = skusStr.split(',').map((s) => s.trim()).filter(Boolean)

    if (skuList.length === 1) {
      // Common case: single product. Total Quantity applies directly.
      const cleanName = productsStr.replace(/\s*x\d+\s*$/, '').trim() || skuList[0]
      output.push({
        orderId,
        date,
        platform,
        status,
        sku: skuList[0],
        productName: cleanName,
        quantity: totalQty || 1,
      })
      return
    }

    // Multiple SKUs in one order — try to split Products text to match.
    const segments = splitProductSegments(productsStr)
    if (segments.length === skuList.length) {
      skuList.forEach((sku, i) => {
        output.push({
          orderId,
          date,
          platform,
          status,
          sku,
          productName: segments[i].name,
          quantity: segments[i].qty,
        })
      })
    } else {
      // Fallback: split Total Quantity evenly, flag for manual review.
      warnings.push(
        `Order ${orderId}: ${skuList.length} SKUs but could not cleanly match product text — quantity split evenly (${totalQty} ÷ ${skuList.length}). Please verify.`
      )
      const evenQty = Math.max(1, Math.round(totalQty / skuList.length))
      skuList.forEach((sku) => {
        output.push({
          orderId,
          date,
          platform,
          status,
          sku,
          productName: sku,
          quantity: evenQty,
        })
      })
    }
  })

  return { rows: output, warnings }
}
