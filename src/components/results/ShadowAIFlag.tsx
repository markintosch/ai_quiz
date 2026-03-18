import type { ShadowAIResult } from '@/types'

// ── Icon ──────────────────────────────────────────────────────
function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
      <line x1="12" x2="12" y1="9" y2="13"/>
      <line x1="12" x2="12.01" y1="17" y2="17"/>
    </svg>
  )
}

// ── Config ────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  low: {
    bg:        'bg-yellow-50',
    border:    'border-yellow-300',
    badge:     'bg-yellow-100 text-yellow-800',
    iconClass: 'text-yellow-600',
    label:     'Low Risk',
  },
  medium: {
    bg:        'bg-orange-50',
    border:    'border-orange-300',
    badge:     'bg-orange-100 text-orange-800',
    iconClass: 'text-orange-500',
    label:     'Medium Risk',
  },
  high: {
    bg:        'bg-red-50',
    border:    'border-red-300',
    badge:     'bg-red-100 text-red-800',
    iconClass: 'text-red-600',
    label:     'High Risk',
  },
}

interface ShadowAIFlagProps {
  shadowAI: ShadowAIResult
}

export function ShadowAIFlag({ shadowAI }: ShadowAIFlagProps) {
  if (!shadowAI.triggered || !shadowAI.severity) return null

  const config = SEVERITY_CONFIG[shadowAI.severity]

  return (
    <div className={`rounded-2xl border p-5 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <AlertTriangleIcon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconClass}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="text-sm font-semibold text-gray-900">Shadow AI Detected</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.badge}`}>
              {config.label}
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Your organisation&apos;s AI <em>usage</em> is significantly ahead of your{' '}
            <em>strategy</em> and <em>governance</em>. This gap of{' '}
            <strong>{Math.round(shadowAI.gap)} points</strong> creates real data,
            legal, and reputational exposure. Establishing guardrails is more urgent
            than expanding adoption.
          </p>
        </div>
      </div>
    </div>
  )
}
