import { Icon, ICONS } from '../common/Icon.jsx'
import { EmptyState } from '../common/EmptyState.jsx'

export function StockOutTable({ rows, loading }) {
  return (
    <div className="bg-card rounded-xl border border-line shadow-card">
      <div className="p-4 sm:p-5 border-b border-line flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-turmeric/10 text-turmeric flex items-center justify-center">
          <Icon path={ICONS.warehouse} className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-sm font-semibold text-ink">Stock Out Summary</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-line">
              <th className="px-4 py-2.5 font-medium">SKU</th>
              <th className="px-4 py-2.5 font-medium">Product</th>
              <th className="px-4 py-2.5 font-medium text-right">Today</th>
              <th className="px-4 py-2.5 font-medium text-right">This Week</th>
              <th className="px-4 py-2.5 font-medium text-right">This Month</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-line/70">
                    <td colSpan={5} className="px-4 py-3"><div className="skeleton h-4 w-full rounded" /></td>
                  </tr>
                ))
              : rows.length === 0
              ? (<tr><td colSpan={5}><EmptyState /></td></tr>)
              : rows.map((r) => (
                <tr key={r.sku} className="border-b border-line/70 hover:bg-canvas/60">
                  <td className="px-4 py-2.5 font-mono text-xs text-muted">{r.sku}</td>
                  <td className="px-4 py-2.5 font-medium text-ink max-w-[240px] truncate" title={r.product}>{r.product}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.today.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.week.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.month.toLocaleString()}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted px-4 sm:px-5 py-3 border-t border-line bg-canvas/50 rounded-b-xl">
        V1: Stock Out is based on recorded sales quantity. Actual inventory movement will be connected in V2.
      </p>
    </div>
  )
}
