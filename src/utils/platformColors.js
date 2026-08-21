// Shared color coding per platform so the same platform always looks the
// same wherever it appears (Recent Orders badge, Platform Performance,
// Top Platform KPI, etc). Uses Tailwind's default palette (no custom config
// needed) so each platform reads distinctly without clashing with the
// brand green used for primary actions/metrics.

export const PLATFORM_COLORS = {
  TikTok: { chip: 'bg-ink text-white border-ink', iconBg: 'bg-ink text-white', dot: 'bg-fuchsia-400' },
  Shopee: { chip: 'bg-orange-50 text-orange-700 border-orange-200', iconBg: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500' },
  WhatsApp: { chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', iconBg: 'bg-emerald-50 text-emerald-600', dot: 'bg-emerald-500' },
  Website: { chip: 'bg-blue-50 text-blue-700 border-blue-200', iconBg: 'bg-blue-50 text-blue-600', dot: 'bg-blue-500' },
  Other: { chip: 'bg-slate-100 text-slate-600 border-slate-200', iconBg: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
}

export function platformColor(platform) {
  return PLATFORM_COLORS[platform] || PLATFORM_COLORS.Other
}
