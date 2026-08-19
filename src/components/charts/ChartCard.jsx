import { useState } from 'react'

export function TrendStatusBadge({ status, pct }) {
  const cfg = {
    INCREASING: { color: 'text-brand-700 bg-brand-50 border-brand-100', arrow: '↑' },
    STABLE: { color: 'text-slate2 bg-slate-50 border-slate-200', arrow: '→' },
    DECREASING: { color: 'text-clay bg-red-50 border-red-100', arrow: '↓' },
  }[status]
  return (
    <div className={`inline-flex flex-col gap-0.5 border rounded-lg px-3 py-2 ${cfg.color}`}>
      <span className="text-[11px] font-medium uppercase tracking-wide opacity-80">Trend Status</span>
      <span className="text-sm font-semibold">{cfg.arrow} {status}</span>
      <span className="text-xs">{pct >= 0 ? '+' : ''}{pct.toFixed(1)}% vs previous period</span>
    </div>
  )
}

export function ChartCard({ title, subtitle, tooltip, children, loading, badge }) {
  const [showTip, setShowTip] = useState(false)
  return (
    <div className="bg-card rounded-xl border border-line shadow-card p-4 sm:p-5 h-full flex flex-col">
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-ink">{title}</h3>
            {tooltip && (
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTip(true)}
                  onMouseLeave={() => setShowTip(false)}
                  className="w-4 h-4 rounded-full border border-line text-muted text-[9px] flex items-center justify-center"
                >
                  ?
                </button>
                {showTip && (
                  <div className="absolute left-0 top-5 z-30 w-48 bg-ink text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed">
                    {tooltip}
                  </div>
                )}
              </div>
            )}
          </div>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
        {badge}
      </div>
      <div className="mt-3 flex-1 min-h-[220px]">
        {loading ? <div className="skeleton h-full w-full rounded-lg" /> : children}
      </div>
    </div>
  )
}
