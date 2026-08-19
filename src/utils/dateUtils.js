import { TODAY, toISO } from '../data/mockData.js'

export { toISO }

export function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const DATE_LABELS = {
  today: 'Today',
  yesterday: 'Yesterday',
  last7: 'Last 7 Days',
  thisMonth: 'This Month',
  custom: 'Custom Range',
}

export function resolveDateRange(preset, custom) {
  const end = toISO(TODAY)
  if (preset === 'today') return { start: end, end }
  if (preset === 'yesterday') {
    const y = new Date(TODAY); y.setDate(y.getDate() - 1)
    return { start: toISO(y), end: toISO(y) }
  }
  if (preset === 'last7') {
    const s = new Date(TODAY); s.setDate(s.getDate() - 6)
    return { start: toISO(s), end }
  }
  if (preset === 'thisMonth') {
    const s = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)
    return { start: toISO(s), end }
  }
  if (preset === 'custom' && custom.start && custom.end) {
    return { start: custom.start, end: custom.end }
  }
  return { start: end, end }
}
