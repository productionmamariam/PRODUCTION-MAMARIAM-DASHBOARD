import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartCard, TrendStatusBadge } from './ChartCard.jsx'

export function SalesTrendChart({ data, loading, trend }) {
  return (
    <ChartCard
      title="Daily Unit Sold Trend"
      subtitle="Daily movement of units sold (last 30 days)"
      tooltip="Total quantity of products sold during the selected period."
      loading={loading}
      badge={<TrendStatusBadge status={trend.status} pct={trend.pct} />}
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D8" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7A6F68' }} axisLine={{ stroke: '#E8E0D8' }} tickLine={false} interval={4} />
          <YAxis tick={{ fontSize: 11, fill: '#7A6F68' }} axisLine={false} tickLine={false} width={36} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E8E0D8' }} labelStyle={{ fontWeight: 600 }} />
          <Line type="monotone" dataKey="units" stroke="#7A1F2B" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Units Sold" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
