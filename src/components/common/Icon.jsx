export const ICONS = {
  bag: 'M6 7h12l1 13H5L6 7Z M9 7a3 3 0 0 1 6 0',
  package: 'M21 8 12 3 3 8v8l9 5 9-5V8Z M3 8l9 5 9-5 M12 13v8',
  boxes: 'M4 7 8 4l4 3v6l-4 3-4-3V7Z M12 7l4-3 4 3v6l-4 3-4-3',
  store: 'M4 4h16l1 5H3l1-5Z M4 9v11h16V9 M9 20v-6h6v6',
  trend: 'M4 15 10 9l4 4 6-8 M17 5h3v3',
  warehouse: 'M3 21V9l9-6 9 6v12H3Z M9 21v-7h6v7',
  search: 'M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z M21 21l-4.3-4.3',
  chevronDown: 'M6 9l6 6 6-6',
  reset: 'M4 4v5h5 M20 20v-5h-5 M4 9a8 8 0 0 1 14.5-3.5 M20 15a8 8 0 0 1-14.5 3.5',
  bell: 'M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z M10 21a2 2 0 0 0 4 0',
  grid: 'M4 4h6v6H4V4Z M14 4h6v6h-6V4Z M4 14h6v6H4v-6Z M14 14h6v6h-6v-6Z',
  chart: 'M4 20V10 M11 20V4 M18 20v-7',
  layers: 'M12 3 3 8l9 5 9-5-9-5Z M3 13l9 5 9-5 M3 17l9 5 9-5',
  cog: 'M4 20V10 M11 20V4 M18 20v-7',
  clip: 'M9 4h6v3H9V4Z M6 7h12v13H6V7Z M9 12h6 M9 16h6',
}

export function Icon({ path, className = 'w-4 h-4' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d={path} />
    </svg>
  )
}
