// FILE: src/components/admin/ScoreBadge.tsx

interface ScoreBadgeProps {
  level: string
}

const LEVEL_STYLES: Record<string, string> = {
  Unaware: 'bg-red-100 text-red-800',
  Exploring: 'bg-orange-100 text-orange-800',
  Experimenting: 'bg-yellow-100 text-yellow-800',
  Scaling: 'bg-teal-100 text-teal-800',
  Leading: 'bg-green-100 text-green-800',
}

export default function ScoreBadge({ level }: ScoreBadgeProps) {
  const styles = LEVEL_STYLES[level] ?? 'bg-gray-100 text-gray-800'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${styles}`}>
      {level || '—'}
    </span>
  )
}
