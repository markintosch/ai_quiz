/**
 * src/lib/analytics/ga4.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight GA4 Data API client.
 *
 * Uses a Google service account (domain-wide delegation NOT required) to
 * authenticate. Zero external dependencies: signs the JWT with Node's
 * built-in `crypto`, exchanges for an access token, and calls the
 * Data API v1beta `runReport` endpoint.
 *
 * Required env vars (add to Vercel / .env.local):
 *   GA4_PROPERTY_ID                  — numeric GA4 property id (not the G-XXX tag)
 *   GA4_SERVICE_ACCOUNT_EMAIL        — e.g. reporter@project.iam.gserviceaccount.com
 *   GA4_SERVICE_ACCOUNT_PRIVATE_KEY  — PEM (with \n line breaks preserved)
 *
 * Grant the service account "Viewer" on the GA4 property:
 *   GA4 → Admin → Property Access Management → Add user → email above.
 */

import { createSign } from 'crypto'

const TOKEN_URL  = 'https://oauth2.googleapis.com/token'
const REPORT_URL = (propertyId: string) =>
  `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`

// ── Auth ──────────────────────────────────────────────────────────────────────

interface CachedToken { token: string; expiresAt: number }
let cached: CachedToken | null = null

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=+$/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function signJwt(email: string, privateKey: string): string {
  const now    = Math.floor(Date.now() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = base64url(JSON.stringify({
    iss:   email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud:   TOKEN_URL,
    iat:   now,
    exp:   now + 3600,
  }))
  const signer = createSign('RSA-SHA256')
  signer.update(`${header}.${claims}`)
  const signature = base64url(signer.sign(privateKey))
  return `${header}.${claims}.${signature}`
}

async function getAccessToken(): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token

  const email = process.env.GA4_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GA4_SERVICE_ACCOUNT_PRIVATE_KEY
  if (!email || !rawKey) {
    throw new Error('GA4 service account env vars missing')
  }
  const privateKey = rawKey.replace(/\\n/g, '\n')
  const jwt = signJwt(email, privateKey)

  const res = await fetch(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion:  jwt,
    }).toString(),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`GA4 token exchange failed: ${res.status} ${await res.text()}`)
  }
  const json = await res.json() as { access_token: string; expires_in: number }
  cached = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 }
  return cached.token
}

// ── Data API ──────────────────────────────────────────────────────────────────

export interface RunReportRequest {
  dateRanges: Array<{ startDate: string; endDate: string }>
  dimensions?: Array<{ name: string }>
  metrics:    Array<{ name: string }>
  dimensionFilter?: object
  orderBys?:  object[]
  limit?:     number
}

export interface RunReportResponse {
  dimensionHeaders?: Array<{ name: string }>
  metricHeaders?:    Array<{ name: string; type: string }>
  rows?: Array<{
    dimensionValues?: Array<{ value: string }>
    metricValues?:    Array<{ value: string }>
  }>
  totals?: Array<{ metricValues?: Array<{ value: string }> }>
  rowCount?: number
}

export async function runReport(req: RunReportRequest): Promise<RunReportResponse> {
  const propertyId = process.env.GA4_PROPERTY_ID
  if (!propertyId) throw new Error('GA4_PROPERTY_ID not set')

  const token = await getAccessToken()
  const res = await fetch(REPORT_URL(propertyId), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
    body:  JSON.stringify(req),
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`GA4 runReport failed: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

export function isConfigured(): boolean {
  return Boolean(
    process.env.GA4_PROPERTY_ID &&
    process.env.GA4_SERVICE_ACCOUNT_EMAIL &&
    process.env.GA4_SERVICE_ACCOUNT_PRIVATE_KEY,
  )
}
