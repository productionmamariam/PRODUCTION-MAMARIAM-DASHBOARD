import { ChartCard } from './ChartCard.jsx'
import { EmptyState } from '../common/EmptyState.jsx'
import { Icon, ICONS } from '../common/Icon.jsx'

export function PlatformPerformance({ data, loading }) {
  return (
    <ChartCard title="Platform Performance" subtitle="Orders, units and share by platform" loading={loading}>
      {data.every((d) => d.units === 0) ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-2.5 mt-1">
          {data.map((row) => (
            <div key={row.platform} className="flex items-center justify-between border border-line rounded-lg px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Icon path={ICONS.store} className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-ink">{row.platform}</span>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-[10px] text-muted uppercase tracking-wide">Orders</p>
                  <p className="text-sm tabular-nums font-medium">{row.orders.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted uppercase tracking-wide">Units</p>
                  <p className="text-sm tabular-nums font-medium">{row.units.toLocaleString()}</p>
                </div>
                <div className="w-12">
                  <p className="text-[10px] text-muted uppercase tracking-wide">Share</p>
                  <p className="text-sm tabular-nums font-semibold text-brand-700">{row.share}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  )
}
