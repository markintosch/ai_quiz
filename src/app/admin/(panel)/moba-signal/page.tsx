'use client'

// FILE: src/app/admin/moba-signal/page.tsx
// ─── Moba Signal — collection console ─────────────────────────────────────────
// The human half of the pipeline: run collectors per source, review what the
// agents propose, decide curator proposals. Everything approved here appears
// on /moba/signal; everything rejected stays stored as learning-loop data.

import { useCallback, useEffect, useState } from 'react'
import { PositioningPaperView } from '@/components/moba/signal/Positioning'
import type { PositioningPaper } from '@/products/moba_signal/types'

export const dynamic = 'force-dynamic'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

interface State {
  sources: Row[]
  pending: Row[]
  recent: Row[]
  runs: Row[]
  proposals: Row[]
  entities: Row[]
  context: Row[]
}

const SCORE_HINT = 'proximity · materiality · credibility'

/** Review-date state for a context item: overdue, due soon, or fine. */
function ctxReviewState(reviewBy?: string | null): { label: string; cls: string; urgent: boolean } {
  if (!reviewBy) return { label: 'no review date', cls: 'bg-gray-100 text-gray-500 border-gray-200', urgent: false }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const due = new Date(`${reviewBy}T00:00:00`)
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000)
  if (days < 0)  return { label: `overdue ${-days}d`,  cls: 'bg-red-50 text-red-700 border-red-200',       urgent: true }
  if (days <= 30) return { label: `due in ${days}d`,    cls: 'bg-amber-50 text-amber-700 border-amber-200', urgent: true }
  return { label: `review ${reviewBy}`, cls: 'bg-gray-100 text-gray-500 border-gray-200', urgent: false }
}

/** Default next review date: today + 90 days, as YYYY-MM-DD. */
function defaultNextReview(): string {
  const d = new Date(); d.setDate(d.getDate() + 90)
  return d.toISOString().slice(0, 10)
}

/** Platform errors (413 Request Entity Too Large, timeouts) are plain text, not JSON. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function safeJson(res: Response): Promise<Record<string, any>> {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    const msg = text.slice(0, 120) || `HTTP ${res.status}`
    return { error: /request entity too large/i.test(text)
      ? 'File too large for the server (limit ~4 MB). Save the page as HTML instead of PDF, or split the file.'
      : msg }
  }
}

function fmtTs(v?: string | null): string {
  if (!v) return '—'
  return new Date(v).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function MobaSignalAdmin() {
  const [state, setState] = useState<State | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [noticeErr, setNoticeErr] = useState(false)
  const [entityPick, setEntityPick] = useState<Record<string, string>>({})
  const [upFiles, setUpFiles] = useState<File[]>([])
  const [upSource, setUpSource] = useState('')
  const [upUrl, setUpUrl] = useState('')
  const [upKind, setUpKind] = useState('news')
  const [upNote, setUpNote] = useState('')
  const [sovFile, setSovFile] = useState<File | null>(null)
  const [brief, setBrief] = useState<Row | null>(null)
  const [briefEdits, setBriefEdits] = useState<Record<string, string>>({})
  const [paperDraft, setPaperDraft] = useState<Row | null>(null)
  const [paperApproved, setPaperApproved] = useState<Row | null>(null)
  const [paperPages, setPaperPages] = useState<Row[]>([])
  const [paperImpl, setPaperImpl] = useState<string | null>(null)
  const [paperXY, setPaperXY] = useState<Record<string, { x: number; y: number }>>({})
  const [paperOpen, setPaperOpen] = useState(false)
  const [dispoPick, setDispoPick] = useState<Record<string, string>>({})
  const [actionPick, setActionPick] = useState<Record<string, string>>({})
  const [ctxDate, setCtxDate] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/moba-signal')
      const json = await safeJson(res)
      if (!res.ok || json.error) throw new Error(json.error ?? `HTTP ${res.status}`)
      setState(json as State)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
    try {
      const res = await fetch('/api/admin/moba-signal/brief')
      const json = await safeJson(res)
      if (res.ok && !json.error) { setBrief(json.draft ?? null); setBriefEdits({}) }
    } catch { /* brief table may not exist yet */ }
    try {
      const res = await fetch('/api/admin/moba-signal/paper')
      const json = await safeJson(res)
      if (res.ok && !json.error) {
        setPaperDraft(json.draft ?? null)
        setPaperApproved(json.approved ?? null)
        setPaperPages(json.pages ?? [])
        setPaperImpl(null)
        setPaperXY({})
      }
    } catch { /* paper tables may not exist yet */ }
  }, [])

  useEffect(() => { load() }, [load])

  async function runOne(sourceId: string): Promise<string> {
    try {
      const res = await fetch('/api/admin/moba-signal/run', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId }),
      })
      const json = await safeJson(res)
      return res.ok
        ? `${sourceId}: ${json.pagesFetched} pages, ${json.itemsFound} found, ${json.itemsNew} new`
        : `${sourceId} failed: ${json.error ?? res.status}`
    } catch (e) {
      return `${sourceId} failed: ${e instanceof Error ? e.message : e}`
    }
  }

  async function runSource(sourceId: string) {
    setBusy(`run:${sourceId}`)
    setNotice(null)
    setNotice(await runOne(sourceId))
    setBusy(null)
    load()
  }

  // Full sweep, sequential so one slow site cannot pile up parallel load.
  // Failures are isolated per source; the summary counts them.
  async function runAll() {
    const active = (state?.sources ?? []).filter(s => s.active !== false)
    let newTotal = 0
    let failures = 0
    for (let i = 0; i < active.length; i++) {
      const src = active[i]
      setBusy(`run:${src.id}`)
      setNotice(`Sweep ${i + 1}/${active.length}: running ${src.id}…`)
      const msg = await runOne(src.id)
      const m = msg.match(/(\d+) new$/)
      if (m) newTotal += Number(m[1])
      if (msg.includes('failed')) failures++
      load()
    }
    setBusy(null)
    setNotice(`Sweep done: ${active.length} sources, ${newTotal} new items${failures ? `, ${failures} failed` : ''}`)
    load()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function review(body: Record<string, any>, key: string) {
    setBusy(key)
    try {
      const res = await fetch('/api/admin/moba-signal/review', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await safeJson(res)
      if (!res.ok) { setNotice(json.error ?? `HTTP ${res.status}`); setNoticeErr(true) }
      else {
        setNotice(
          json.reviewBy ? `Review date updated to ${json.reviewBy}`
          : json.created ? `Created ${json.created}`
          : 'Saved',
        )
        setNoticeErr(false)
      }
    } catch (e) {
      setNotice(e instanceof Error ? e.message : String(e)); setNoticeErr(true)
    }
    setBusy(null)
    load()
  }

  async function uploadDocument() {
    if (upFiles.length === 0 || !upSource || !upUrl) return
    setBusy('upload')
    setNoticeErr(false)

    // One request per file: each stays under the serverless size limit, and a
    // single bad file cannot fail the whole batch. Same source/URL/kind/note
    // applies to all — a batch is pages from one company's site.
    let newTotal = 0, foundTotal = 0, done = 0, ocrCount = 0
    const skipped: string[] = []
    const failed: string[] = []
    for (let i = 0; i < upFiles.length; i++) {
      const f = upFiles[i]
      setNotice(`Uploading ${i + 1}/${upFiles.length}: ${f.name}…`)
      if (f.size > 4_000_000) {
        skipped.push(`${f.name} (${(f.size / 1e6).toFixed(1)} MB, over 4 MB)`)
        continue
      }
      try {
        const fd = new FormData()
        fd.append('file', f)
        fd.append('sourceId', upSource)
        fd.append('sourceUrl', upUrl)
        fd.append('kind', upKind)
        if (upNote) fd.append('note', upNote)
        const res = await fetch('/api/admin/moba-signal/upload', { method: 'POST', body: fd })
        const json = await safeJson(res)
        if (!res.ok) { failed.push(`${f.name}: ${json.error ?? res.status}`) }
        else { newTotal += json.itemsNew ?? 0; foundTotal += json.itemsFound ?? 0; done++; if (json.ocr) ocrCount++ }
      } catch (e) {
        failed.push(`${f.name}: ${e instanceof Error ? e.message : e}`)
      }
      load()
    }

    const bits = [`${done}/${upFiles.length} file${upFiles.length === 1 ? '' : 's'} ingested${ocrCount ? ` (${ocrCount} read by OCR)` : ''} · ${foundTotal} items found, ${newTotal} new in the review queue`]
    if (skipped.length) bits.push(`skipped: ${skipped.join('; ')} — save as HTML or split`)
    if (failed.length) bits.push(`failed: ${failed.join(' · ')}`)
    setNotice(bits.join(' · '))
    setNoticeErr(failed.length > 0 || skipped.length > 0)
    if (done > 0) { setUpFiles([]); setUpNote('') }
    setBusy(null)
    load()
  }

  async function importSocial() {
    if (!sovFile) return
    setBusy('sov')
    setNotice(`Importing ${sovFile.name}…`)
    try {
      const fd = new FormData()
      fd.append('file', sovFile)
      const res = await fetch('/api/admin/moba-signal/social', { method: 'POST', body: fd })
      const json = await safeJson(res)
      if (!res.ok) { setNotice(json.error ?? `HTTP ${res.status}`); setNoticeErr(true) }
      else {
        const bits = [`${json.statsUpserted} page-periods stored (${json.sheetsParsed} sheet${json.sheetsParsed === 1 ? '' : 's'})`]
        if (json.excluded?.length) bits.push(`excluded: ${json.excluded.join(', ')}`)
        if (json.unmapped?.length) bits.push(`unmapped pages (not on dashboard yet): ${json.unmapped.join(', ')}`)
        if (json.newPages?.length) bits.push(`new pages: ${json.newPages.join('; ')}`)
        setNotice(bits.join(' · '))
        setNoticeErr(false)
        setSovFile(null)
      }
    } catch (e) {
      setNotice(e instanceof Error ? e.message : String(e)); setNoticeErr(true)
    }
    setBusy(null)
    load()
  }

  async function briefAction(action: 'draft' | 'approve') {
    setBusy(`brief:${action}`)
    setNotice(action === 'draft' ? 'Drafting the brief…' : 'Approving…')
    try {
      const res = await fetch('/api/admin/moba-signal/brief', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'draft'
          ? { action: 'draft' }
          : { action: 'approve', briefId: brief?.id, edits: briefEdits }),
      })
      const json = await safeJson(res)
      if (!res.ok || json.error) { setNotice(json.error ?? `HTTP ${res.status}`); setNoticeErr(true) }
      else { setNotice(action === 'draft' ? `Brief drafted from ${json.itemsUsed ?? '?'} items` : 'Brief approved: now live on the dashboard'); setNoticeErr(false) }
    } catch (e) {
      setNotice(e instanceof Error ? e.message : String(e)); setNoticeErr(true)
    }
    setBusy(null)
    load()
  }

  async function paperAction(action: 'draft' | 'approve') {
    setBusy(`paper:${action}`)
    setNotice(action === 'draft'
      ? 'Drafting the positioning paper: fetching public pages and running the Positioning agent. This takes a few minutes…'
      : 'Approving the edition…')
    setNoticeErr(false)
    try {
      const content = paperDraft?.content as PositioningPaper | undefined
      const res = await fetch('/api/admin/moba-signal/paper', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'draft'
          ? { action: 'draft' }
          : { action: 'approve', edition: content?.edition, implications: paperImpl ?? undefined, placements: paperXY }),
      })
      const json = await safeJson(res)
      if (!res.ok || json.error) { setNotice(json.error ?? `HTTP ${res.status}`); setNoticeErr(true) }
      else {
        setNotice(action === 'draft'
          ? `Edition ${json.edition} drafted: ${json.pagesFetched} pages read${json.pagesFailed?.length ? `, ${json.pagesFailed.length} unreachable` : ''}, ${json.itemsUsed} approved items used. Review below.`
          : 'Edition approved: now the reference on the dashboard and /moba/signal/paper.')
        setNoticeErr(false)
        if (action === 'draft') setPaperOpen(true)
      }
    } catch (e) {
      setNotice(e instanceof Error ? e.message : String(e)); setNoticeErr(true)
    }
    setBusy(null)
    load()
  }

  if (error) {
    return (
      <main className="p-8 max-w-3xl">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Moba Signal — collection</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      </main>
    )
  }
  if (!state) return <main className="p-8 text-sm text-gray-400">Loading…</main>

  return (
    <main className="p-6 lg:p-8 max-w-6xl space-y-8">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Moba Signal — collection console</h1>
          <p className="text-xs text-gray-500 mt-1">
            Agents collect and propose; nothing reaches <a className="underline" href="/moba/signal" target="_blank">/moba/signal</a> until approved here.
          </p>
        </div>
        {notice && <span className={`text-xs px-3 py-1.5 rounded-lg ${noticeErr ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700'}`}>{noticeErr ? '⚠ ' : ''}{notice}</span>}
      </header>

      {/* ── Sources ── */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-gray-900">Sources</h2>
          <button
            onClick={runAll}
            disabled={busy !== null}
            className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-brand text-white disabled:opacity-40"
          >
            {busy?.startsWith('run:') ? 'Sweeping…' : 'Run all sources'}
          </button>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
          {state.sources.map(s => (
            <div key={s.id} className="px-4 py-2.5 flex flex-wrap items-center gap-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                s.status === 'ok' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : s.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                {s.status}
              </span>
              <div className="min-w-0 flex-1">
                <span className="block text-sm text-gray-800">{s.name}</span>
                <span className="block text-[11px] text-gray-400">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline break-all hover:text-brand">{s.url}</a> · last run {fmtTs(s.last_run_at)}
                  {s.failure_reason && <span className="text-red-600"> · {s.failure_reason}</span>}
                </span>
              </div>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 hover:border-brand-accent hover:text-brand-accent transition-colors"
              >
                Review ↗
              </a>
              <button
                onClick={() => runSource(s.id)}
                disabled={busy !== null}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-40"
              >
                {busy === `run:${s.id}` ? 'Running…' : 'Run now'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Upload evidence ── */}
      <section>
        <h2 className="text-sm font-bold text-gray-900 mb-1">Upload evidence</h2>
        <p className="text-xs text-gray-500 mb-3">
          For what the crawler cannot reach: save a blocked press page as PDF or HTML, or feed in a research
          report. Same pipeline, same review queue — uploading never publishes directly.
        </p>
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select value={upKind} onChange={e => setUpKind(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white">
              <option value="news">Press or news page</option>
              <option value="research">Research report / whitepaper</option>
              <option value="notes">Field notes / meeting intel</option>
            </select>
            <select value={upSource} onChange={e => setUpSource(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white">
              <option value="">— file under source —</option>
              {state.sources.map(s2 => (
                <option key={s2.id} value={s2.id}>{s2.name}{s2.active === false ? ' (blocked: uploads welcome)' : ''}</option>
              ))}
            </select>
            <input
              type="file"
              multiple
              accept=".pdf,.html,.htm,.txt,.md,.png,.jpg,.jpeg,.webp"
              onChange={e => setUpFiles(e.target.files ? Array.from(e.target.files) : [])}
              className="text-xs text-gray-600 file:mr-2 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-gray-300 file:bg-white file:text-xs file:font-semibold"
            />
            {upFiles.length > 1 && (
              <span className="text-[11px] text-gray-500">{upFiles.length} files selected</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="url" placeholder="Original page URL (provenance, required)"
              value={upUrl} onChange={e => setUpUrl(e.target.value)}
              className="flex-1 min-w-[260px] text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-700"
            />
            <input
              type="text" placeholder="Why you are adding this (optional)"
              value={upNote} onChange={e => setUpNote(e.target.value)}
              className="flex-1 min-w-[200px] text-xs border border-gray-200 rounded-lg px-3 py-2 text-gray-700"
            />
            <button
              onClick={uploadDocument}
              disabled={busy !== null || upFiles.length === 0 || !upSource || !upUrl}
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-brand text-white disabled:opacity-40"
            >
              {busy === 'upload' ? 'Processing…' : upFiles.length > 1 ? `Ingest ${upFiles.length} files` : 'Ingest'}
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            PDF, HTML or text, max 4 MB each. Select several at once to upload a batch: the source, kind,
            URL and note apply to all of them, so batch pages from one company&rsquo;s site (each file is
            processed on its own, one bad file never fails the rest). Research reports are chunked deep and
            historical items are kept: that is also the route for loading the Asia landscape research into
            the timeline. Field notes enter at credibility 1 by rule. Screenshot PDFs and image files
            (PNG/JPG) have no text layer, so they are read by OCR: slower, and accurate on clear captures.
            Saved HTML or Print → PDF still extract fastest when you have the choice.
          </p>
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">Share of voice:</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={e => setSovFile(e.target.files?.[0] ?? null)}
              className="text-xs text-gray-600 file:mr-2 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-gray-300 file:bg-white file:text-xs file:font-semibold"
            />
            <button
              onClick={importSocial}
              disabled={busy !== null || !sovFile}
              className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-brand text-white disabled:opacity-40"
            >
              {busy === 'sov' ? 'Importing…' : 'Import LinkedIn export'}
            </button>
            <span className="text-[11px] text-gray-400">
              The LinkedIn competitor analytics .xlsx, any period length. Numbers, not items: feeds the
              Share of voice card, never the signal feed.
            </span>
          </div>
        </div>
      </section>

      {/* ── Weekly brief ── */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h2 className="text-sm font-bold text-gray-900">Weekly competitive brief</h2>
          <button onClick={() => briefAction('draft')} disabled={busy !== null}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-40">
            {busy === 'brief:draft' ? 'Drafting…' : brief ? 'Redraft from current items' : 'Draft now'}
          </button>
        </div>
        {!brief && <p className="text-sm text-gray-400">No draft waiting. The Editor agent drafts one every Monday morning, or draft now.</p>}
        {brief && (
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span>Week of {brief.week_start}</span>
              <span>· temperature</span>
              <select
                value={briefEdits.temperature ?? brief.temperature ?? 'normal'}
                onChange={e => setBriefEdits(p2 => ({ ...p2, temperature: e.target.value }))}
                className="border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700">
                <option value="elevated">Elevated</option>
                <option value="normal">Normal</option>
                <option value="quiet">Quiet</option>
              </select>
            </div>
            {([['headline','Headline'],['what_happened','What happened'],['key_development','Key development'],['why_it_matters','Why it matters'],['moba_advantage','Moba advantage'],['marketing_response','Marketing response'],['sales_response','Sales response'],['watch_next','Watch next']] as const).map(([k, label]) => (
              <div key={k}>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{label}</label>
                <textarea
                  value={briefEdits[k] ?? brief[k] ?? ''}
                  onChange={e => setBriefEdits(p2 => ({ ...p2, [k]: e.target.value }))}
                  rows={k === 'headline' ? 2 : 2}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700"
                />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <button onClick={() => briefAction('approve')} disabled={busy !== null}
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-brand text-white disabled:opacity-40">
                {busy === 'brief:approve' ? '…' : 'Approve and publish'}
              </button>
              <span className="text-[11px] text-gray-400">Your wording is final: the agent never edits an approved brief.</span>
            </div>
          </div>
        )}
      </section>

      {/* ── Brand & positioning paper ── */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h2 className="text-sm font-bold text-gray-900">Brand &amp; positioning paper</h2>
          <button onClick={() => paperAction('draft')} disabled={busy !== null}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 hover:border-brand-accent hover:text-brand-accent transition-colors disabled:opacity-40">
            {busy === 'paper:draft' ? 'Drafting (takes minutes)…' : paperDraft ? 'Redraft this edition' : 'Draft edition now'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Quarterly reference: how Moba, Sanovo and NABEL position themselves publicly. The Positioning agent
          reads {paperPages.length || 'the configured'} public pages plus approved signals, drafts to the fixed
          structure, and the edition goes live only after approval here. Auto-drafts on 1 Feb, 1 May, 1 Aug and 1 Nov.
          {paperApproved && <> Current approved edition: <a className="underline" href="/moba/signal/paper" target="_blank">{paperApproved.edition}</a>.</>}
        </p>
        {!paperDraft && <p className="text-sm text-gray-400 rounded-xl border border-gray-200 bg-white px-4 py-3">No draft waiting.</p>}
        {paperDraft && (() => {
          const content = paperDraft.content as PositioningPaper
          const entityName = (id: string) => {
            const e = state.entities.find(x => x.id === id)
            return e ? `${e.name}${e.ownership_kind === 'moba' && id !== 'moba' ? ' (part of Moba)' : e.parent_name ? ` (part of ${e.parent_name})` : ''}` : id
          }
          return (
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="font-semibold text-gray-800">Draft · edition {content.edition}</span>
                <span>generated {fmtTs(paperDraft.generated_at)}</span>
                <button onClick={() => setPaperOpen(v => !v)} className="underline text-brand">
                  {paperOpen ? 'Hide preview' : 'Show full preview'}
                </button>
              </div>

              {paperOpen && (
                <div className="border border-gray-100 rounded-lg p-3 bg-gray-50/60">
                  <PositioningPaperView paper={content} entityName={entityName} />
                </div>
              )}

              {/* Analyst controls: coordinates and the implications wording */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Map placement (0–100: integration breadth × innovation posture)</label>
                <div className="flex flex-wrap gap-4">
                  {content.map.placements.map(p => (
                    <div key={p.entityId} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="font-semibold">{entityName(p.entityId)}</span>
                      <input type="number" min={0} max={100}
                        value={paperXY[p.entityId]?.x ?? p.x}
                        onChange={e => setPaperXY(prev => ({ ...prev, [p.entityId]: { x: Number(e.target.value), y: prev[p.entityId]?.y ?? p.y } }))}
                        className="w-14 border border-gray-200 rounded-lg px-1.5 py-1 text-right" aria-label={`${p.entityId} x`} />
                      <span>×</span>
                      <input type="number" min={0} max={100}
                        value={paperXY[p.entityId]?.y ?? p.y}
                        onChange={e => setPaperXY(prev => ({ ...prev, [p.entityId]: { x: prev[p.entityId]?.x ?? p.x, y: Number(e.target.value) } }))}
                        className="w-14 border border-gray-200 rounded-lg px-1.5 py-1 text-right" aria-label={`${p.entityId} y`} />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Implications for Moba (your wording is final)</label>
                <textarea
                  value={paperImpl ?? content.implications}
                  onChange={e => setPaperImpl(e.target.value)}
                  rows={4}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700"
                />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => paperAction('approve')} disabled={busy !== null}
                  className="text-xs font-semibold px-4 py-2 rounded-lg bg-brand text-white disabled:opacity-40">
                  {busy === 'paper:approve' ? '…' : 'Approve and publish edition'}
                </button>
                <span className="text-[11px] text-gray-400">
                  Profile content regenerates on redraft; wrong facts mean fixing the input (pages, approved items), not the output.
                </span>
              </div>
            </div>
          )
        })()}
      </section>

      {/* ── Review queue ── */}
      <section>
        <h2 className="text-sm font-bold text-gray-900 mb-2">
          Review queue · {state.pending.length} proposed
        </h2>
        {state.pending.length === 0 && (
          <p className="text-sm text-gray-400">Nothing waiting. Run a source above to collect.</p>
        )}
        <div className="space-y-3">
          {state.pending.map(item => {
            const picked = entityPick[item.id] ?? item.entity_id ?? ''
            return (
              <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                  <span className="text-[11px] text-gray-400">
                    {item.event_date} · {item.type} · {item.region} · {item.category} ·{' '}
                    <span title={SCORE_HINT}>{item.proximity}/{item.materiality}/{item.credibility}</span>
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{item.summary}</p>
                {(item.quotes ?? []).map((q: string, i: number) => (
                  <p key={i} className="text-xs text-gray-500 italic mt-1">&ldquo;{q}&rdquo;</p>
                ))}
                <p className="text-[11px] text-gray-400 mt-1">
                  <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="underline break-all">{item.source_url}</a>
                  {item.inference && <span className="ml-2 text-purple-600">inference</span>}
                  {item.entity_guess && <span className="ml-2 text-amber-700">unlinked: &ldquo;{item.entity_guess}&rdquo;</span>}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <select
                    value={picked}
                    onChange={e => setEntityPick(p => ({ ...p, [item.id]: e.target.value }))}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white"
                  >
                    <option value="">— link entity —</option>
                    {item.entity_guess && (
                      <option value="__new__">＋ Create &ldquo;{item.entity_guess}&rdquo; as new tracked entity</option>
                    )}
                    {state.entities.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name}{e.ownership_kind === 'moba' ? ' (part of Moba)' : e.parent_name ? ` (part of ${e.parent_name})` : ''}
                      </option>
                    ))}
                  </select>
                  <select
                    value={dispoPick[item.id] ?? 'watch'}
                    onChange={e => setDispoPick(p2 => ({ ...p2, [item.id]: e.target.value }))}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white"
                    title="What is this for Moba?"
                  >
                    <option value="threat">Threat</option>
                    <option value="opportunity">Opportunity</option>
                    <option value="watch">Watch</option>
                    <option value="neutral">Neutral</option>
                  </select>
                  <select
                    value={actionPick[item.id] ?? 'monitor'}
                    onChange={e => setActionPick(p2 => ({ ...p2, [item.id]: e.target.value }))}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 bg-white"
                    title="Recommended action"
                  >
                    <option value="ignore">Ignore</option>
                    <option value="monitor">Monitor</option>
                    <option value="investigate">Investigate</option>
                    <option value="respond">Respond</option>
                  </select>
                  <button
                    onClick={() => review({ itemId: item.id, action: 'approve', entityId: picked || undefined, newEntityName: picked === '__new__' ? item.entity_guess : undefined, disposition: dispoPick[item.id] ?? 'watch', recommended_action: actionPick[item.id] ?? 'monitor' }, `ap:${item.id}`)}
                    disabled={busy !== null || !picked}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand text-white disabled:opacity-40"
                  >
                    {busy === `ap:${item.id}` ? '…' : 'Approve'}
                  </button>
                  <button
                    onClick={() => review({ itemId: item.id, action: 'reject' }, `rj:${item.id}`)}
                    disabled={busy !== null}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-40"
                  >
                    Reject
                  </button>
                  {!picked && (
                    <span className="text-[11px] text-amber-700">Link an entity (or create one from the dropdown) to enable Approve.</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Context corpus review ── */}
      <section>
        <h2 className="text-sm font-bold text-gray-900 mb-2">
          Context — review
          {(() => {
            const due = state.context.filter(c => ctxReviewState(c.review_by).urgent).length
            return due > 0 ? <span className="ml-2 text-amber-700">· {due} need review</span> : null
          })()}
        </h2>
        <p className="text-xs text-gray-500 mb-2">
          The internal material the agents read everything through: messaging house, strategic accounts,
          research baselines. Never scored, never in the feed. A stale lens corrupts scoring silently, so
          each item carries a review date. Mark it reviewed to push the date forward.
        </p>
        {state.context.length === 0 && (
          <p className="text-sm text-gray-400">No context loaded yet.</p>
        )}
        <div className="space-y-2">
          {state.context.map(c => {
            const st = ctxReviewState(c.review_by)
            return (
              <div key={c.id} className={`rounded-xl border bg-white px-4 py-3 ${st.urgent ? 'border-amber-200' : 'border-gray-200'}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-900">{c.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${st.cls}`}>{st.label}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Owner: {c.owner} · loaded {c.loaded_on}
                  {Array.isArray(c.account_names) && c.account_names.length > 0 && <> · {c.account_names.length} account{c.account_names.length === 1 ? '' : 's'}</>}
                </p>
                {c.note && <p className="text-xs text-gray-600 mt-1">{c.note}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <label className="text-[11px] text-gray-500">Next review</label>
                  <input
                    type="date"
                    value={ctxDate[c.id] ?? defaultNextReview()}
                    onChange={e => setCtxDate(p => ({ ...p, [c.id]: e.target.value }))}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 bg-white"
                  />
                  <button
                    onClick={() => review({ action: 'mark-context-reviewed', contextId: c.id, reviewBy: ctxDate[c.id] ?? defaultNextReview() }, `ctx:${c.id}`)}
                    disabled={busy !== null}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand text-white disabled:opacity-40"
                  >
                    {busy === `ctx:${c.id}` ? '…' : 'Mark reviewed'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Curator proposals ── */}
      {state.proposals.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-2">Curator proposals · {state.proposals.length}</h2>
          <div className="space-y-2">
            {state.proposals.map(p => (
              <div key={p.id} className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <span className="block text-sm text-gray-800">{p.title}</span>
                  <span className="block text-[11px] text-gray-400">{p.rationale}</span>
                </div>
                <button onClick={() => review({ proposalId: p.id, action: 'accept-proposal' }, `pa:${p.id}`)} disabled={busy !== null}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand text-white disabled:opacity-40">Accept</button>
                <button onClick={() => review({ proposalId: p.id, action: 'reject-proposal' }, `pr:${p.id}`)} disabled={busy !== null}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 disabled:opacity-40">Reject</button>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Accepting an entity or source proposal creates the row immediately (entities as independent
            competitors; adjust ownership in Supabase when a brand belongs to a group). Data-pipeline and
            watchlist proposals are workplans: accepting records the decision only.
          </p>
        </section>
      )}

      {/* ── Recent runs and decisions ── */}
      <section className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2">Recent runs</h2>
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 text-xs">
            {state.runs.length === 0 && <p className="px-4 py-3 text-gray-400">No runs yet.</p>}
            {state.runs.map(r => (
              <div key={r.id} className="px-4 py-2 flex items-center gap-2">
                <span className={r.ok === false ? 'text-red-600' : r.ok ? 'text-emerald-600' : 'text-gray-400'}>
                  {r.ok === false ? '✕' : r.ok ? '✓' : '…'}
                </span>
                <span className="text-gray-700">{r.source_id}</span>
                <span className="text-gray-400 ml-auto">
                  {fmtTs(r.started_at)} · {r.pages_fetched}p · {r.items_found} found · {r.items_new} new
                  {r.sitemap_urls > 0 && (
                    <span> · sitemap {r.sitemap_urls}u{r.sitemap_new > 0 && <span className="text-amber-700 font-medium">, +{r.sitemap_new}</span>}</span>
                  )}
                  {r.error && <span className="text-red-600"> · {r.error}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2">Recent decisions</h2>
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 text-xs">
            {state.recent.length === 0 && <p className="px-4 py-3 text-gray-400">No decisions yet.</p>}
            {state.recent.map(r => (
              <div key={r.id} className="px-4 py-2 flex items-center gap-2">
                <span className={r.review_status === 'approved' ? 'text-emerald-600' : 'text-red-500'}>
                  {r.review_status === 'approved' ? '✓' : '✕'}
                </span>
                <span className="text-gray-700 truncate">{r.title}</span>
                <span className="text-gray-400 ml-auto shrink-0">{r.event_date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
