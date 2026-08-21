import { EmptyState } from '../common/EmptyState.jsx'
import { fmtDate } from '../../utils/dateUtils.js'
import { platformColor } from '../../utils/platformColors.js'

export function RecentOrdersTable({ rows, loading }) {
  return (
    <div className="bg-card rounded-xl border border-line shadow-card">
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-line">
        <h3 className="text-sm font-semibold text-ink">Recent Orders</h3>
        <button
          className="text-xs font-medium text-brand-600 border border-brand-100 bg-brand-50 hover:bg-brand-100 rounded-lg px-3 py-1.5 transition-colors cursor-not-allowed opacity-80"
          title="Coming in V2"
        >
          View All Orders
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead>
            <tr className="text-left text-xs text-muted uppercase tracking-wide border-b border-line">
              <th className="px-4 py-2.5 font-medium">Date</th>
              <th className="px-4 py-2.5 font-medium">Order ID</th>
              <th className="px-4 py-2.5 font-medium">Platform</th>
              <th className="px-4 py-2.5 font-medium">SKU</th>
              <th className="px-4 py-2.5 font-medium">Product</th>
              <th className="px-4 py-2.5 font-medium text-right">Qty</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-line/70">
                    <td colSpan={6} className="px-4 py-3"><div className="skeleton h-4 w-full rounded" /></td>
                  </tr>
                ))
              : rows.length === 0
              ? (<tr><td colSpan={6}><EmptyState /></td></tr>)
              : rows.map((r, idx) => (
                <tr key={r.orderId + r.sku + idx} className="border-b border-line/70 hover:bg-canvas/60">
                  <td className="px-4 py-2.5 whitespace-nowrap text-muted">{fmtDate(r.date)}</td>
                  <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap">{r.orderId}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${platformColor(r.platform).chip}`}>
                      {r.platform}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted whitespace-nowrap">{r.sku}</td>
                  <td className="px-4 py-2.5 font-medium text-ink max-w-[220px] truncate" title={r.productName}>{r.productName}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{r.quantity}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
