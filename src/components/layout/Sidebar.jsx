import { useState } from 'react'
import { Icon, ICONS } from '../common/Icon.jsx'

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: ICONS.grid, functional: true },
  { key: 'import', label: 'Import Data', icon: ICONS.upload, functional: true },
  { key: 'sales', label: 'Sales', icon: ICONS.chart },
  { key: 'inventory', label: 'Inventory', icon: ICONS.boxes },
  { key: 'production', label: 'Production', icon: ICONS.layers },
  { key: 'operation', label: 'Operation', icon: ICONS.store },
  { key: 'reports', label: 'Reports', icon: ICONS.clip },
  { key: 'settings', label: 'Settings', icon: ICONS.cog },
]

export function Sidebar({ open, setOpen, activeView, setActiveView }) {
  const [toast, setToast] = useState(null)

  const handleClick = (item) => {
    if (item.functional) {
      setActiveView(item.key)
    } else {
      setToast(item.label)
      setTimeout(() => setToast(null), 1600)
    }
    setOpen(false)
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-ink/30 z-30 lg:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-60 bg-white border-r border-line z-40
                    transform transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-line">
          <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-display text-sm">
            M
          </div>
          <div className="leading-tight">
            <p className="font-display text-[15px] tracking-wide text-ink">MAMARIAM</p>
            <p className="text-[10px] text-muted uppercase tracking-wider">Production &amp; Operation</p>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.functional && activeView === item.key
            return (
              <button
                key={item.key}
                onClick={() => handleClick(item)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                  ${isActive ? 'bg-brand-50 text-brand-700 font-medium' : 'text-muted hover:bg-canvas hover:text-ink'}`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon path={item.icon} className="w-4 h-4" />
                  {item.label}
                </span>
                {!item.functional && (
                  <span className="text-[9px] uppercase tracking-wide text-muted/70 border border-line rounded px-1.5 py-0.5">
                    V2
                  </span>
                )}
              </button>
            )
          })}
        </nav>
        <div className="absolute bottom-4 left-3 right-3">
          <div className="tag-stamp rounded-lg px-3 py-2 text-[11px] font-mono flex items-center justify-between">
            <span>DASH · V1</span>
            <span>LIVE</span>
          </div>
        </div>
      </aside>
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 lg:left-[280px] lg:translate-x-0 z-50 bg-ink text-white text-sm rounded-lg px-4 py-2 shadow-lg">
          {toast} — Coming in V2
        </div>
      )}
    </>
  )
}
