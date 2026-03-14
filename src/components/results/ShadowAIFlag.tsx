import type { ShadowAIResult } from '@/types'

const SEVERITY_CONFIG = {
  low: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-300',
    badge: 'bg-yellow-100 text-yellow-800',
    icon: '⚠️',
    label: 'Low Risk',
  },
  medium: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    badge: 'bg-orange-100 text-orange-800',
    icon: '🔶',
    label: 'Medium Risk',
  },
  high: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    badge: 'bg-red-100 text-red-800',
    icon: '🚨',
    label: 'High Risk',
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
        <span className="text-xl">{config.icon}</span>
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
