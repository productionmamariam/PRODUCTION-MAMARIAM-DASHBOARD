import { useEffect, useMemo, useState } from 'react'
import { Sidebar } from './components/layout/Sidebar.jsx'
import { Header } from './components/layout/Header.jsx'
import { FilterBar } from './components/filters/FilterBar.jsx'
import { KpiCard, Delta } from './components/kpi/KpiCard.jsx'
import { SkuPlatformTable } from './components/tables/SkuPlatformTable.jsx'
import { StockOutTable } from './components/tables/StockOutTable.jsx'
import { RecentOrdersTable } from './components/tables/RecentOrdersTable.jsx'
import { SalesTrendChart } from './components/charts/SalesTrendChart.jsx'
import { OrderTrendChart } from './components/charts/OrderTrendChart.jsx'
import { Top5SkuChart } from './components/charts/Top5SkuChart.jsx'
import { PlatformPerformance } from './components/charts/PlatformPerformance.jsx'
import { ICONS } from './components/common/Icon.jsx'
import { PRODUCTS, TODAY, toISO } from './data/mockData.js'
import { dataService } from './services/dataService.js'
import { proc, previousPeriodItems } from './utils/processing.js'
import { resolveDateRange } from './utils/dateUtils.js'

export default function App() {
  const [filters, setFilters] = useState({
    datePreset: 'today',
    sku: 'ALL',
    platform: 'ALL',
    custom: { start: toISO(TODAY), end: toISO(TODAY) },
  })
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 550)
    return () => clearTimeout(t)
  }, [filters.datePreset, filters.sku, filters.platform, filters.custom.start, filters.custom.end])

  const dateRange = useMemo(() => resolveDateRange(filters.datePreset, filters.custom), [filters.datePreset, filters.custom])
  const svcFilters = { dateRange, sku: filters.sku, platform: filters.platform }

  const currentItems = useMemo(
    () => dataService.getOrderItems(svcFilters),
    [dateRange.start, dateRange.end, filters.sku, filters.platform]
  )
  const prevItems = useMemo(
    () => previousPeriodItems({ dateRange, sku: filters.sku, platform: filters.platform }),
    [dateRange.start, dateRange.end, filters.sku, filters.platform]
  )

  const totalOrders = proc.uniqueOrderCount(currentItems)
  const prevOrders = proc.uniqueOrderCount(prevItems)
  const unitsSold = proc.unitsSold(currentItems)
  const prevUnits = proc.unitsSold(prevItems)
  const skuSold = proc.skuCount(currentItems)
  const prevSkuSold = proc.skuCount(prevItems)
  const topPlatform = proc.topPlatform(currentItems)

  const skuTable = useMemo(() => proc.skuByPlatformTable(currentItems), [currentItems])
  const trendItems = useMemo(() => dataService.getTrendItems(30, filters.sku, filters.platform), [filters.sku, filters.platform])
  const dailySeries = useMemo(() => proc.dailySeries(trendItems), [trendItems])
  const trendStatus = useMemo(() => proc.trendStatus(filters.sku, filters.platform), [filters.sku, filters.platform])
  const stockOutRows = useMemo(() => proc.stockOut(filters.sku, filters.platform), [filters.sku, filters.platform])
  const top5 = useMemo(() => proc.top5Sku(currentItems), [currentItems])
  const platformPerf = useMemo(() => proc.platformPerformance(currentItems), [currentItems])
  const recent = useMemo(() => proc.recentOrders(currentItems, 8), [currentItems])

  const trendSelectedLabel = filters.sku === 'ALL' ? 'All SKU' : PRODUCTS.find((p) => p.sku === filters.sku)?.productName

  return (
    <div className="min-h-screen flex">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 min-w-0">
        <Header onMenu={() => setSidebarOpen(true)} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-[1400px]">
          <FilterBar filters={filters} setFilters={setFilters} />

          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              icon={ICONS.bag}
              title="Total Orders"
              loading={loading}
              tooltip="Count of unique Order IDs in the selected period."
              value={totalOrders.toLocaleString()}
              sub={<Delta pct={proc.pctChange(totalOrders, prevOrders)} />}
            />
            <KpiCard
              icon={ICONS.package}
              title="Units Sold"
              loading={loading}
              tooltip="Total quantity of products sold during the selected period."
              value={unitsSold.toLocaleString()}
              sub={<Delta pct={proc.pctChange(unitsSold, prevUnits)} />}
            />
            <KpiCard
              icon={ICONS.boxes}
              title="SKU Sold"
              loading={loading}
              tooltip="Number of distinct SKUs with at least one unit sold."
              value={skuSold.toLocaleString()}
              sub={
                <span className="text-xs text-muted font-medium">
                  {skuSold - prevSkuSold >= 0 ? '+' : ''}{skuSold - prevSkuSold} SKU vs previous period
                </span>
              }
            />
            <KpiCard
              icon={ICONS.store}
              title="Top Platform"
              loading={loading}
              tooltip="Platform with the highest units sold in the selected period."
              value={topPlatform.platform || '—'}
              sub={<span className="text-xs text-muted font-medium">{topPlatform.share}% of units sold</span>}
            />
          </section>

          <section>
            <SkuPlatformTable rows={skuTable} loading={loading} />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <SalesTrendChart data={dailySeries} loading={loading} trend={trendStatus} />
            <OrderTrendChart data={dailySeries} loading={loading} />
          </section>
          <p className="text-xs text-muted -mt-4">
            Showing trend for <span className="font-medium text-ink">{trendSelectedLabel}</span>
            {filters.platform !== 'ALL' && <> on <span className="font-medium text-ink">{filters.platform}</span></>}, last 30 days.
          </p>

          <section>
            <StockOutTable rows={stockOutRows} loading={loading} />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Top5SkuChart data={top5} loading={loading} />
            <PlatformPerformance data={platformPerf} loading={loading} />
          </section>

          <section className="pb-10">
            <RecentOrdersTable rows={recent} loading={loading} />
          </section>
        </main>
      </div>
    </div>
  )
}
