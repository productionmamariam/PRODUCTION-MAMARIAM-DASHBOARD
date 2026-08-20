// =============================================================================
// IMPORT SERVICE — turns an uploaded CSV into Firestore writes.
//
// Expected CSV columns (see the "Download template" button in the Import
// screen, or README "Import Orders"):
//   orderId, date, platform, status, sku, productName, quantity
//
// One row = one order line item. If an order has 2 products, it appears as
// 2 rows sharing the same orderId — matching how order_items already works
// elsewhere in this app (see src/data/mockData.js).
//
// Writes are batched (Firestore's limit is 500 writes per batch) and use
// deterministic document IDs so re-importing the same file updates existing
// records instead of creating duplicates:
//   orders/{orderId}
//   order_items/{orderId}__{sku}
// (This assumes at most one line per SKU per order — the common case. If
// an order legitimately has the same SKU twice as separate lines, they'll
// merge into one document; flag this in the README as a known V1 limit.)
// =============================================================================

import Papa from 'papaparse'
import { doc, writeBatch } from 'firebase/firestore'
import { db } from './firebase.js'

const REQUIRED_COLUMNS = ['orderId', 'date', 'platform', 'status', 'sku', 'productName', 'quantity']
const BATCH_LIMIT = 400 // stay comfortably under Firestore's 500-write cap (2 writes per row)

export function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => resolve(results.data),
      error: (err) => reject(err),
    })
  })
}

export function validateRows(rows) {
  const errors = []
  if (rows.length === 0) {
    return { valid: [], errors: ['File is empty.'] }
  }
  const headerCols = Object.keys(rows[0])
  const missing = REQUIRED_COLUMNS.filter((c) => !headerCols.includes(c))
  if (missing.length > 0) {
    return { valid: [], errors: [`Missing column(s): ${missing.join(', ')}`] }
  }

  const valid = []
  rows.forEach((row, idx) => {
    const lineNo = idx + 2 // +1 header row, +1 for 1-indexing
    const qty = Number(row.quantity)
    if (!row.orderId || !row.date || !row.sku) {
      errors.push(`Row ${lineNo}: missing orderId, date, or sku — skipped.`)
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
      errors.push(`Row ${lineNo}: date "${row.date}" is not in YYYY-MM-DD format — skipped.`)
      return
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      errors.push(`Row ${lineNo}: quantity "${row.quantity}" is not a valid positive number — skipped.`)
      return
    }
    valid.push({
      orderId: String(row.orderId).trim(),
      date: row.date.trim(),
      platform: (row.platform || 'Other').trim(),
      status: (row.status || 'Completed').trim(),
      sku: String(row.sku).trim(),
      productName: (row.productName || row.sku).trim(),
      quantity: qty,
    })
  })
  return { valid, errors }
}

export async function importRows(rows, onProgress) {
  if (!db) throw new Error('Firebase is not configured yet.')

  // group into unique orders (date/platform/status) + line items
  const ordersById = {}
  const productsBySku = {}
  rows.forEach((r) => {
    ordersById[r.orderId] = { date: r.date, platform: r.platform, status: r.status }
    if (!productsBySku[r.sku]) productsBySku[r.sku] = r.productName
  })

  const orderEntries = Object.entries(ordersById)
  const productEntries = Object.entries(productsBySku)
  const itemEntries = rows

  const allOps = [
    ...orderEntries.map(([orderId, data]) => ({ type: 'order', orderId, data })),
    ...productEntries.map(([sku, productName]) => ({ type: 'product', sku, productName })),
    ...itemEntries.map((r) => ({ type: 'item', row: r })),
  ]

  let written = 0
  for (let i = 0; i < allOps.length; i += BATCH_LIMIT) {
    const chunk = allOps.slice(i, i + BATCH_LIMIT)
    const batch = writeBatch(db)
    chunk.forEach((op) => {
      if (op.type === 'order') {
        batch.set(doc(db, 'orders', op.orderId), op.data, { merge: true })
      } else if (op.type === 'product') {
        // merge:true means this only fills in sku/productName — it won't
        // overwrite a `category` field you've already set on an existing product.
        batch.set(doc(db, 'products', op.sku), { sku: op.sku, productName: op.productName }, { merge: true })
      } else {
        const id = `${op.row.orderId}__${op.row.sku}`
        batch.set(
          doc(db, 'order_items', id),
          {
            orderId: op.row.orderId,
            sku: op.row.sku,
            productName: op.row.productName,
            quantity: op.row.quantity,
          },
          { merge: true }
        )
      }
    })
    await batch.commit()
    written += chunk.length
    if (onProgress) onProgress(written, allOps.length)
  }

  return { ordersWritten: orderEntries.length, itemsWritten: itemEntries.length, productsWritten: productEntries.length }
}

export function downloadTemplateCsv() {
  const header = REQUIRED_COLUMNS.join(',')
  const example = 'TT-10001,2026-08-19,TikTok,Completed,JUS001,Jus Mamariam,3'
  const csv = `${header}\n${example}\n`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'mamariam-order-import-template.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
