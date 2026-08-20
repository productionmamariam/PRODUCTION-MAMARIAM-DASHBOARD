import { Icon, ICONS } from '../common/Icon.jsx'
import { TODAY } from '../../data/mockData.js'

export function Header({ onMenu, usingFirebase }) {
  const dateStr = TODAY.toLocaleDateString('en-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header className="h-16 sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-line flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg border border-line text-muted">
          <Icon path={ICONS.grid} className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-ink leading-tight">Sales &amp; Stock Monitoring</h1>
          <p className="text-xs text-muted">{dateStr}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
            usingFirebase ? 'text-brand-700 bg-brand-50 border-brand-100' : 'text-turmeric bg-turmeric/10 border-turmeric/20'
          }`}
          title={usingFirebase ? 'Connected to Firebase — showing live data' : 'Firebase not connected — showing demo data'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${usingFirebase ? 'bg-brand-500' : 'bg-turmeric'}`} />
          {usingFirebase ? 'Live: Firebase' : 'Demo data'}
        </span>
        <button className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-muted hover:text-ink hover:border-brand-300 transition-colors relative">
          <Icon path={ICONS.bell} className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-turmeric rounded-full border border-white" />
        </button>
        <div className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs font-semibold flex items-center justify-center">
          OP
        </div>
      </div>
    </header>
  )
}
