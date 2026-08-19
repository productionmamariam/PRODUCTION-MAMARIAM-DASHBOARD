import { Icon, ICONS } from './Icon.jsx'

export function EmptyState({ label = 'No sales data available' }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-10 h-10 rounded-full bg-canvas border border-line flex items-center justify-center mb-3 text-muted">
        <Icon path={ICONS.package} className="w-5 h-5" />
      </div>
      <p className="text-sm text-muted">{label}</p>
    </div>
  )
}
