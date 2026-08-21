import { useState } from 'react'
import { Icon } from '../common/Icon.jsx'

export function Delta({ pct, positiveIsGood = true, suffix = 'vs previous period' }) {
  if (Math.abs(pct) < 0.05) {
    return <span className="text-xs text-muted font-medium">No change {suffix}</span>
  }
  const isUp = pct > 0
  const good = positiveIsGood ? isUp : !isUp
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${good ? 'text-brand-600' : 'text-clay'}`}>
      <svg className={`w-3 h-3 ${isUp ? '' : 'rotate-180'}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4l8 10H4z" />
      </svg>
      {Math.abs(pct).toFixed(1)}% {suffix}
    </span>
  )
}

export function KpiCard({ icon, title, tooltip, value, sub, loading, accent = 'bg-brand-50 text-brand-600' }) {
  const [showTip, setShowTip] = useState(false)
  return (
    <div className="bg-card rounded-xl border border-line shadow-card p-4 sm:p-5 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${accent.split(' ')[0]}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon path={icon} className="w-4 h-4" />
        </div>
        {tooltip && (
          <div className="relative">
            <button
              onMouseEnter={() => setShowTip(true)}
              onMouseLeave={() => setShowTip(false)}
              className="w-5 h-5 rounded-full border border-line text-muted text-[10px] flex items-center justify-center hover:border-brand-300"
              aria-label="metric definition"
            >
              ?
            </button>
            {showTip && (
              <div className="absolute right-0 top-6 z-30 w-48 bg-ink text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-xs font-medium text-muted uppercase tracking-wide">{title}</p>
      {loading ? (
        <>
          <div className="skeleton h-7 w-20 rounded mt-2 mb-2" />
          <div className="skeleton h-3 w-28 rounded" />
        </>
      ) : (
        <>
          <p className="text-2xl font-semibold text-ink mt-1 mb-1.5 tabular-nums">{value}</p>
          {sub}
        </>
      )}
    </div>
  )
}
