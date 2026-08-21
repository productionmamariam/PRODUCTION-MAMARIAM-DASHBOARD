import { useState } from 'react'
import { Icon, ICONS } from '../common/Icon.jsx'
import { authService } from '../../services/authService.js'
import { dataService } from '../../services/dataService.js'
import { importRows, resolveSkuAliases } from '../../services/importService.js'
import { toISO, TODAY } from '../../data/mockData.js'

const PLATFORMS = ['TikTok', 'Shopee', 'WhatsApp', 'Website', 'Other']
const STATUSES = ['Completed', 'In Transit', 'Rejected', 'Returned']

function emptyLine() {
  return { sku: '', quantity: 1 }
}

export function AddOrderForm({ user, onSignedOut, onImported }) {
  const products = dataService.getProducts()

  const [orderId, setOrderId] = useState('')
  const [date, setDate] = useState(toISO(TODAY))
  const [platform, setPlatform] = useState('TikTok')
  const [status, setStatus] = useState('Completed')
  const [lines, setLines] = useState([emptyLine()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const updateLine = (idx, patch) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }
  const addLine = () => setLines((prev) => [...prev, emptyLine()])
  const removeLine = (idx) => setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev))

  const resetForm = () => {
    setOrderId('')
    setDate(toISO(TODAY))
    setPlatform('TikTok')
    setStatus('Completed')
    setLines([emptyLine()])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(null)

    const validLines = lines.filter((l) => l.sku && Number(l.quantity) > 0)
    if (validLines.length === 0) {
      setError('Add at least one product line with a quantity greater than 0.')
      return
    }

    const finalOrderId = orderId.trim() || `MANUAL-${Date.now()}`
    const rows = validLines.map((l) => {
      const product = products.find((p) => p.sku === l.sku)
      return {
        orderId: finalOrderId,
        date,
        platform,
        status,
        sku: l.sku,
        productName: product ? product.productName : l.sku,
        quantity: Number(l.quantity),
      }
    })
    const resolved = resolveSkuAliases(rows, products)

    setSubmitting(true)
    try {
      const summary = await importRows(resolved)
      setSuccess({ orderId: finalOrderId, ...summary })
      resetForm()
      if (onImported) onImported()
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (!authService.isAvailable()) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-card border border-line rounded-xl shadow-card p-6 text-center">
        <p className="text-sm text-muted">Firebase isn't connected yet, so adding orders isn't available. Connect Firebase first (see README).</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Add Order</h2>
          <p className="text-xs text-muted">Signed in as {user?.email}</p>
        </div>
        <button
          onClick={async () => { await authService.signOutUser(); onSignedOut() }}
          className="text-xs font-medium text-muted hover:text-ink border border-line rounded-lg px-3 py-1.5"
        >
          Sign out
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-line rounded-xl shadow-card p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide">Order ID (optional)</label>
            <input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Auto-generated if left blank"
              className="mt-1 w-full text-sm border border-line rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide">Date</label>
            <input
              type="date"
              required
              value={date}
              max={toISO(TODAY)}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full text-sm border border-line rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-1 w-full text-sm border border-line rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 bg-white"
            >
              {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted uppercase tracking-wide">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full text-sm border border-line rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 bg-white"
            >
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-muted uppercase tracking-wide">Products in this order</label>
            <button type="button" onClick={addLine} className="text-xs font-medium text-brand-600 hover:text-brand-700">
              + Add product line
            </button>
          </div>
          <div className="space-y-2">
            {lines.map((line, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  value={line.sku}
                  onChange={(e) => updateLine(idx, { sku: e.target.value })}
                  className="flex-1 text-sm border border-line rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 bg-white"
                >
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p.sku} value={p.sku}>{p.productName} ({p.sku})</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={line.quantity}
                  onChange={(e) => updateLine(idx, { quantity: e.target.value })}
                  className="w-20 text-sm border border-line rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 text-center"
                />
                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  disabled={lines.length === 1}
                  className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg border border-line text-muted hover:text-clay hover:border-clay/40 disabled:opacity-30"
                  aria-label="Remove line"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-xs text-clay">{error}</p>}
        {success && (
          <p className="text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2">
            Order {success.orderId} saved — {success.itemsWritten} line item(s). It'll appear on the Dashboard tab now.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg py-2.5 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <Icon path={ICONS.bag} className="w-4 h-4" />
          {submitting ? 'Saving…' : 'Save Order'}
        </button>
      </form>
    </div>
  )
}
