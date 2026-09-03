'use client'

// ─── The persistent inference convention (review §15) ────────────────────────
// One glyph, used identically everywhere in V2: a half circle for inferred
// signals, a full circle for reported events. The intellectual honesty of the
// scoring model made visible, at a glance, without a legend hunt.

export function EvidenceMark({ inference, className = '' }: { inference?: boolean; className?: string }) {
  return (
    <span
      className={`inline-block align-baseline text-[11px] leading-none ${inference ? 'text-amber-500' : 'text-emerald-600'} ${className}`}
      title={inference ? 'Inferred signal: read from a pattern, not stated by the company' : 'Reported event: stated in a source'}
      aria-label={inference ? 'Inferred signal' : 'Reported event'}
    >
      {inference ? '◐' : '●'}
    </span>
  )
}

/** The one-line legend, shown once per page rather than per item. */
export function EvidenceLegend() {
  return (
    <p className="text-[11px] text-gray-400">
      <span className="text-emerald-600" aria-hidden>●</span> reported event ·{' '}
      <span className="text-amber-500" aria-hidden>◐</span> inferred signal, read from a pattern and labelled as such
    </p>
  )
}
