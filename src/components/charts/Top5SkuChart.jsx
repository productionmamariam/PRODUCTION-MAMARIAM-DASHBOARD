import { ChartCard } from './ChartCard.jsx'
import { EmptyState } from '../common/EmptyState.jsx'

const RANK_COLORS = ['#7A1F2B', '#9B3844', '#C97B84', '#DDA8AE', '#EFD9DC']

export function Top5SkuChart({ data, loading }) {
  return (
    <ChartCard title="Top 5 Best Selling SKU" subtitle="Ranked by units sold" loading={loading}>
      {data.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3 mt-1">
          {data.map((row, idx) => (
            <div key={row.sku} className="flex items-center gap-3">
              <span className="w-5 text-xs font-semibold text-muted tabular-nums">{idx + 1}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-ink truncate max-w-[70%]" title={row.product}>{row.product}</span>
                  <span className="text-xs text-muted tabular-nums">{row.units.toLocaleString()} units · {row.share}%</span>
                </div>
                <div className="h-2 rounded-full bg-canvas overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${row.share}%`, background: RANK_COLORS[idx] || '#7A1F2B' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  )
}
