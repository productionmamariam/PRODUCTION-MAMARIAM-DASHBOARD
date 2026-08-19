import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartCard } from './ChartCard.jsx'

export function OrderTrendChart({ data, loading }) {
  return (
    <ChartCard
      title="Daily Order Trend"
      subtitle="Unique orders per day (last 30 days)"
      tooltip="Count of unique Order IDs — one order can contain multiple units or SKUs."
      loading={loading}
    >
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E7E0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#727C73' }} axisLine={{ stroke: '#E4E7E0' }} tickLine={false} interval={4} />
          <YAxis tick={{ fontSize: 11, fill: '#727C73' }} axisLine={false} tickLine={false} width={36} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E4E7E0' }} labelStyle={{ fontWeight: 600 }} />
          <Line type="monotone" dataKey="orders" stroke="#C97B2E" strokeWidth={2} dot={false} activeDot={{ r: 4 }} name="Orders" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
