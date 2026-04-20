import { NextResponse } from 'next/server'
import { isConfigured, runReport } from '@/lib/analytics/ga4'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ── Types ────────────────────────────────────────────────────────────────────

export interface TrafficRow  { key: string; sessions: number; users: number; engaged: number }
export interface EventRow    { event: string; count: number }

export interface TrafficPayload {
  configured: boolean
  range: { startDate: string; endDate: string }
  totals: { sessions: number; users: number; engagedSessions: number }
  byPath:    TrafficRow[]
  bySource:  TrafficRow[]
  byCountry: TrafficRow[]
  ctaEvents: EventRow[]
  error?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function rowNum(v: string | undefined): number {
  return v ? Number(v) : 0
}

function defaultRange(): { startDate: string; endDate: string } {
  // Last 28 days — common GA4 default, avoids same-day incomplete bucket.
  return { startDate: '28daysAgo', endDate: 'yesterday' }
}

// ── Handler ──────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const range = {
    startDate: searchParams.get('start') ?? defaultRange().startDate,
    endDate:   searchParams.get('end')   ?? defaultRange().endDate,
  }

  if (!isConfigured()) {
    const payload: TrafficPayload = {
      configured: false,
      range,
      totals:    { sessions: 0, users: 0, engagedSessions: 0 },
      byPath:    [],
      bySource:  [],
      byCountry: [],
      ctaEvents: [],
    }
    return NextResponse.json(payload)
  }

  try {
    const [totalsR, byPathR, bySourceR, byCountryR, eventsR] = await Promise.all([
      runReport({
        dateRanges: [range],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'engagedSessions' },
        ],
      }),
      runReport({
        dateRanges: [range],
        dimensions: [{ name: 'pagePath' }],
        metrics:    [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'engagedSessions' }],
        orderBys:   [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 25,
      }),
      runReport({
        dateRanges: [range],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics:    [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'engagedSessions' }],
        orderBys:   [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 15,
      }),
      runReport({
        dateRanges: [range],
        dimensions: [{ name: 'country' }],
        metrics:    [{ name: 'sessions' }, { name: 'totalUsers' }, { name: 'engagedSessions' }],
        orderBys:   [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
      runReport({
        dateRanges: [range],
        dimensions: [{ name: 'eventName' }],
        metrics:    [{ name: 'eventCount' }],
        orderBys:   [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 50,
      }),
    ])

    const totalsRow = totalsR.rows?.[0]?.metricValues
    const payload: TrafficPayload = {
      configured: true,
      range,
      totals: {
        sessions:        rowNum(totalsRow?.[0]?.value),
        users:           rowNum(totalsRow?.[1]?.value),
        engagedSessions: rowNum(totalsRow?.[2]?.value),
      },
      byPath: (byPathR.rows ?? []).map(r => ({
        key:      r.dimensionValues?.[0]?.value ?? '',
        sessions: rowNum(r.metricValues?.[0]?.value),
        users:    rowNum(r.metricValues?.[1]?.value),
        engaged:  rowNum(r.metricValues?.[2]?.value),
      })),
      bySource: (bySourceR.rows ?? []).map(r => ({
        key:      r.dimensionValues?.[0]?.value ?? '',
        sessions: rowNum(r.metricValues?.[0]?.value),
        users:    rowNum(r.metricValues?.[1]?.value),
        engaged:  rowNum(r.metricValues?.[2]?.value),
      })),
      byCountry: (byCountryR.rows ?? []).map(r => ({
        key:      r.dimensionValues?.[0]?.value ?? '',
        sessions: rowNum(r.metricValues?.[0]?.value),
        users:    rowNum(r.metricValues?.[1]?.value),
        engaged:  rowNum(r.metricValues?.[2]?.value),
      })),
      ctaEvents: (eventsR.rows ?? [])
        .map(r => ({
          event: r.dimensionValues?.[0]?.value ?? '',
          count: rowNum(r.metricValues?.[0]?.value),
        }))
        // Focus on our custom-instrumented events and conversions
        .filter(e =>
          e.event.startsWith('mentor_') ||
          e.event.startsWith('hero_') ||
          e.event.includes('calendly') ||
          e.event === 'page_view',
        ),
    }

    return NextResponse.json(payload)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    const payload: TrafficPayload = {
      configured: true,
      range,
      totals:    { sessions: 0, users: 0, engagedSessions: 0 },
      byPath:    [],
      bySource:  [],
      byCountry: [],
      ctaEvents: [],
      error:     message,
    }
    return NextResponse.json(payload, { status: 500 })
  }
}
