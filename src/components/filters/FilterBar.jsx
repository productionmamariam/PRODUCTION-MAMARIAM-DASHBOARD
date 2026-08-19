import { Icon, ICONS } from '../common/Icon.jsx'
import { PRODUCTS, PLATFORMS, TODAY, toISO } from '../../data/mockData.js'
import { DATE_LABELS } from '../../utils/dateUtils.js'

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-line rounded-lg pl-3 pr-8 py-2 text-sm text-ink
                   hover:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500
                   transition-colors cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <Icon path={ICONS.chevronDown} className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
    </div>
  )
}

export function FilterBar({ filters, setFilters }) {
  const dateOptions = Object.entries(DATE_LABELS).map(([value, label]) => ({ value, label }))
  const skuOptions = [{ value: 'ALL', label: 'All SKU' }, ...PRODUCTS.map((p) => ({ value: p.sku, label: p.productName }))]
  const platformOptions = [{ value: 'ALL', label: 'All Platform' }, ...PLATFORMS.map((p) => ({ value: p, label: p }))]

  const isDirty = filters.datePreset !== 'today' || filters.sku !== 'ALL' || filters.platform !== 'ALL'

  return (
    <div className="sticky top-[64px] z-20 bg-canvas/95 backdrop-blur border-b border-line -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted uppercase tracking-wide mr-1">Filters</span>

        <Select value={filters.datePreset} onChange={(v) => setFilters((f) => ({ ...f, datePreset: v }))} options={dateOptions} />

        {filters.datePreset === 'custom' && (
          <div className="flex items-center gap-1.5 bg-white border border-line rounded-lg px-2 py-1">
            <input
              type="date"
              value={filters.custom.start}
              max={toISO(TODAY)}
              onChange={(e) => setFilters((f) => ({ ...f, custom: { ...f.custom, start: e.target.value } }))}
              className="text-sm text-ink outline-none bg-transparent"
            />
            <span className="text-muted text-xs">to</span>
            <input
              type="date"
              value={filters.custom.end}
              max={toISO(TODAY)}
              onChange={(e) => setFilters((f) => ({ ...f, custom: { ...f.custom, end: e.target.value } }))}
              className="text-sm text-ink outline-none bg-transparent"
            />
          </div>
        )}

        <Select value={filters.sku} onChange={(v) => setFilters((f) => ({ ...f, sku: v }))} options={skuOptions} />
        <Select value={filters.platform} onChange={(v) => setFilters((f) => ({ ...f, platform: v }))} options={platformOptions} />

        {isDirty && (
          <button
            onClick={() =>
              setFilters({ datePreset: 'today', sku: 'ALL', platform: 'ALL', custom: { start: toISO(TODAY), end: toISO(TODAY) } })
            }
            className="flex items-center gap-1.5 text-sm text-clay hover:text-red-700 font-medium px-2.5 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Icon path={ICONS.reset} className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  )
}
