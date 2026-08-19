import { useMemo, useState } from 'react'
import { Icon, ICONS } from '../common/Icon.jsx'
import { EmptyState } from '../common/EmptyState.jsx'

const COLS = [
  { key: 'sku', label: 'SKU' },
  { key: 'product', label: 'Product' },
  { key: 'TikTok', label: 'TikTok' },
  { key: 'Shopee', label: 'Shopee' },
  { key: 'WhatsApp', label: 'WhatsApp' },
  { key: 'Website', label: 'Website' },
  { key: 'Other', label: 'Other' },
  { key: 'total', label: 'Total' },
]
const NUMERIC_COLS = ['TikTok', 'Shopee', 'WhatsApp', 'Website', 'Other', 'total']

export function SkuPlatformTable({ rows, loading }) {
  const [sortKey, setSortKey] = useState('total')
  const [sortDir, setSortDir] = useState('desc')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    let r = rows.filter(
      (row) => row.product.toLowerCase().includes(query.toLowerCase()) || row.sku.toLowerCase().includes(query.toLowerCase())
    )
    r = [...r].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      return sortDir === 'asc' ? av - bv : bv - av
    })
    return r
  }, [rows, query, sortKey, sortDir])

  const totals = useMemo(() => {
    const t = { TikTok: 0, Shopee: 0, WhatsApp: 0, Website: 0, Other: 0, total: 0 }
    rows.forEach((r) => { Object.keys(t).forEach((k) => { t[k] += r[k] }) })
    return t
  }, [rows])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
  }

  return (
    <div className="bg-card rounded-xl border border-line shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-line">
        <h3 className="text-sm font-semibold text-ink">Order Sold by SKU &amp; Platform</h3>
        <div className="relative">
          <Icon path={ICONS.search} className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKU or product"
            className="text-sm border border-line rounded-lg pl-8 pr-3 py-1.5 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500 w-56"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-line">
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className={`px-4 py-2.5 font-medium cursor-pointer select-none whitespace-nowrap ${
                    c.key === 'total' ? 'bg-brand-50/60 text-brand-700' : ''
                  } ${NUMERIC_COLS.includes(c.key) ? 'text-right' : ''}`}
                  onClick={() => toggleSort(c.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {sortKey === c.key && <span className="text-brand-600">{sortDir === 'asc' ? '↑' : '↓'}</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-line/70">
                    <td colSpan={8} className="px-4 py-3"><div className="skeleton h-4 w-full rounded" /></td>
                  </tr>
                ))
              : filtered.length === 0
              ? (
                <tr><td colSpan={8}><EmptyState /></td></tr>
              )
              : filtered.map((row) => (
                <tr key={row.sku} className="border-b border-line/70 hover:bg-canvas/60 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-muted whitespace-nowrap">{row.sku}</td>
                  <td className="px-4 py-2.5 font-medium text-ink whitespace-nowrap">{row.product}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{row.TikTok.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{row.Shopee.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{row.WhatsApp.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{row.Website.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{row.Other.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-brand-700 bg-brand-50/60">{row.total.toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
          {!loading && filtered.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-line font-semibold text-ink">
                <td className="px-4 py-2.5" colSpan={2}>Total</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{totals.TikTok.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{totals.Shopee.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{totals.WhatsApp.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{totals.Website.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">{totals.Other.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right tabular-nums bg-brand-50/60 text-brand-700">{totals.total.toLocaleString()}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}
