import { useRef, useState } from 'react'
import { Icon, ICONS } from '../common/Icon.jsx'
import { authService } from '../../services/authService.js'
import { parseCsvFile, validateRows, importRows, downloadTemplateCsv, resolveSkuAliases, migrateSkuAliases } from '../../services/importService.js'
import { parseLuxanaFile, mapLuxanaRows } from '../../services/luxanaImportService.js'
import { dataService } from '../../services/dataService.js'

const STAGE = { PICK: 'pick', PREVIEW: 'preview', IMPORTING: 'importing', DONE: 'done' }
const MODE = { LUXANA: 'luxana', TEMPLATE: 'template' }

export function ImportOrders({ user, onSignedOut, onImported }) {
  const fileInputRef = useRef(null)
  const [mode, setMode] = useState(MODE.LUXANA)
  const [stage, setStage] = useState(STAGE.PICK)
  const [fileName, setFileName] = useState('')
  const [validRows, setValidRows] = useState([])
  const [errors, setErrors] = useState([])
  const [warnings, setWarnings] = useState([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [migrateResult, setMigrateResult] = useState(null)

  const handleMergeAliases = async () => {
    setMigrating(true)
    setMigrateResult(null)
    try {
      const summary = await migrateSkuAliases(dataService.getProducts(), (done, total) => setProgress({ done, total }))
      setMigrateResult(summary)
      if (onImported) onImported()
    } catch (err) {
      setMigrateResult({ error: err.message || String(err) })
    } finally {
      setMigrating(false)
    }
  }

  const handleFile = async (file) => {
    if (!file) return
    setFileName(file.name)
    setWarnings([])

    if (mode === MODE.LUXANA) {
      const rawRows = await parseLuxanaFile(file)
      const { rows, warnings: luxanaWarnings } = mapLuxanaRows(rawRows)
      const resolvedRows = resolveSkuAliases(rows, dataService.getProducts())
      const { valid, errors: rowErrors } = validateRows(resolvedRows)
      setValidRows(valid)
      setErrors(rowErrors)
      setWarnings(luxanaWarnings)
    } else {
      const rows = await parseCsvFile(file)
      const resolvedRows = resolveSkuAliases(rows, dataService.getProducts())
      const { valid, errors: rowErrors } = validateRows(resolvedRows)
      setValidRows(valid)
      setErrors(rowErrors)
    }
    setStage(STAGE.PREVIEW)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    handleFile(file)
  }

  const handleImport = async () => {
    setStage(STAGE.IMPORTING)
    try {
      const summary = await importRows(validRows, (done, total) => setProgress({ done, total }))
      setResult(summary)
      setStage(STAGE.DONE)
      if (onImported) onImported()
    } catch (err) {
      setErrors((prev) => [...prev, `Import failed: ${err.message || err}`])
      setStage(STAGE.PREVIEW)
    }
  }

  const reset = () => {
    setStage(STAGE.PICK)
    setFileName('')
    setValidRows([])
    setErrors([])
    setWarnings([])
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const switchMode = (m) => {
    setMode(m)
    reset()
  }

  const accept = mode === MODE.LUXANA ? '.xlsx,.xls' : '.csv'

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Import Orders</h2>
          <p className="text-xs text-muted">Signed in as {user?.email}</p>
        </div>
        <button
          onClick={async () => { await authService.signOutUser(); onSignedOut() }}
          className="text-xs font-medium text-muted hover:text-ink border border-line rounded-lg px-3 py-1.5"
        >
          Sign out
        </button>
      </div>

      <div className="bg-turmeric/10 border border-turmeric/20 rounded-xl p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink">Already set up a product's platform SKU aliases?</p>
          <p className="text-xs text-muted mt-0.5">
            Aliases only apply to new imports. Run this once to merge existing order data onto the canonical SKU too.
          </p>
          {migrateResult && !migrateResult.error && (
            <p className="text-xs text-brand-700 font-medium mt-1">
              Done — {migrateResult.migrated} of {migrateResult.scanned} line item(s) merged.
            </p>
          )}
          {migrateResult?.error && <p className="text-xs text-clay font-medium mt-1">Error: {migrateResult.error}</p>}
        </div>
        <button
          onClick={handleMergeAliases}
          disabled={migrating}
          className="shrink-0 text-xs font-medium text-turmeric border border-turmeric/30 bg-white hover:bg-turmeric/10 rounded-lg px-3 py-2 whitespace-nowrap disabled:opacity-50"
        >
          {migrating ? `Merging… ${progress.done}/${progress.total}` : 'Merge SKU Aliases Now'}
        </button>
      </div>

      <div className="flex gap-2 border-b border-line">
        <button
          onClick={() => switchMode(MODE.LUXANA)}
          className={`text-sm font-medium px-3 py-2 border-b-2 -mb-px transition-colors ${
            mode === MODE.LUXANA ? 'border-brand-500 text-brand-700' : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Luxana Export (.xlsx)
        </button>
        <button
          onClick={() => switchMode(MODE.TEMPLATE)}
          className={`text-sm font-medium px-3 py-2 border-b-2 -mb-px transition-colors ${
            mode === MODE.TEMPLATE ? 'border-brand-500 text-brand-700' : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          Manual Template (.csv)
        </button>
      </div>

      <div className="bg-card border border-line rounded-xl shadow-card p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          {mode === MODE.LUXANA ? (
            <p className="text-xs text-muted leading-relaxed">
              Upload the .xlsx file exactly as exported from Luxana's Orders report — no reformatting needed. Orders with multiple
              products are split automatically. Channel/Source maps to platform (tiktok → TikTok, shopee → Shopee); orders with no
              Channel/Source but a Staff Sales / Smart Partner role are mapped to WhatsApp — check the warnings below after uploading.
            </p>
          ) : (
            <p className="text-xs text-muted leading-relaxed">
              For manual entry or other systems. Each row is one product line in an order — an order with 2 products appears as 2 rows
              sharing the same Order ID.
            </p>
          )}
          {mode === MODE.TEMPLATE && (
            <button
              onClick={downloadTemplateCsv}
              className="shrink-0 text-xs font-medium text-brand-600 border border-brand-100 bg-brand-50 hover:bg-brand-100 rounded-lg px-3 py-1.5 whitespace-nowrap"
            >
              Download template
            </button>
          )}
        </div>

        {stage === STAGE.PICK && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl py-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors
              ${dragOver ? 'border-brand-400 bg-brand-50/50' : 'border-line hover:border-brand-300'}`}
          >
            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
              <Icon path={ICONS.package} className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-ink">
              Drag &amp; drop your {mode === MODE.LUXANA ? 'Luxana .xlsx' : 'CSV'} file here, or click to browse
            </p>
            {mode === MODE.TEMPLATE && (
              <p className="text-xs text-muted mt-1">Columns required: orderId, date, platform, status, sku, productName, quantity</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
        )}

        {stage === STAGE.PREVIEW && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink font-medium">{fileName}</p>
              <button onClick={reset} className="text-xs text-muted hover:text-ink">Choose a different file</button>
            </div>

            <div className="flex gap-4 text-sm">
              <span className="text-brand-700 font-medium">{validRows.length} valid row(s)</span>
              {errors.length > 0 && <span className="text-clay font-medium">{errors.length} issue(s)</span>}
              {warnings.length > 0 && <span className="text-turmeric font-medium">{warnings.length} to verify</span>}
            </div>

            {warnings.length > 0 && (
              <div className="bg-turmeric/10 border border-turmeric/20 rounded-lg p-3 max-h-32 overflow-y-auto">
                <p className="text-xs font-medium text-turmeric mb-1">Please verify these orders after import:</p>
                {warnings.map((w, i) => (
                  <p key={i} className="text-xs text-turmeric/90">{w}</p>
                ))}
              </div>
            )}

            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 max-h-32 overflow-y-auto">
                {errors.map((e, i) => (
                  <p key={i} className="text-xs text-clay">{e}</p>
                ))}
              </div>
            )}

            {validRows.length > 0 && (
              <div className="overflow-x-auto border border-line rounded-lg">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-canvas text-left text-muted uppercase tracking-wide">
                      <th className="px-3 py-2">Order ID</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Platform</th>
                      <th className="px-3 py-2">SKU</th>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validRows.slice(0, 8).map((r, i) => (
                      <tr key={i} className="border-t border-line/70">
                        <td className="px-3 py-1.5 font-mono">{r.orderId}</td>
                        <td className="px-3 py-1.5">{r.date}</td>
                        <td className="px-3 py-1.5">{r.platform}</td>
                        <td className="px-3 py-1.5 font-mono">{r.sku}</td>
                        <td className="px-3 py-1.5 max-w-[220px] truncate" title={r.productName}>{r.productName}</td>
                        <td className="px-3 py-1.5 text-right">{r.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {validRows.length > 8 && (
                  <p className="text-xs text-muted px-3 py-2 bg-canvas/50">…and {validRows.length - 8} more row(s)</p>
                )}
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={validRows.length === 0}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg py-2.5 transition-colors disabled:opacity-40"
            >
              Import {validRows.length} row(s) to Firestore
            </button>
          </div>
        )}

        {stage === STAGE.IMPORTING && (
          <div className="py-10 text-center">
            <div className="skeleton h-2 w-full rounded-full mb-3" />
            <p className="text-sm text-muted">Importing… {progress.done} / {progress.total}</p>
          </div>
        )}

        {stage === STAGE.DONE && result && (
          <div className="text-center py-8 space-y-3">
            <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Icon path={ICONS.bag} className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-ink">Import complete</p>
            <p className="text-xs text-muted">{result.ordersWritten} order(s), {result.itemsWritten} line item(s), {result.productsWritten} product(s) written.</p>
            <p className="text-xs text-muted">Reload the Dashboard tab to see the new data.</p>
            <button onClick={reset} className="text-xs font-medium text-brand-600 border border-brand-100 bg-brand-50 hover:bg-brand-100 rounded-lg px-4 py-2">
              Import another file
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
