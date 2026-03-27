'use client'

import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'

export interface BenchmarkData {
  market:  { avg: number; count: number }
  cohort?: { avg: number; count: number; name: string }
  role?:   { avg: number; count: number; role: string }
}

interface BenchmarkComparisonProps {
  yourScore: number
  benchmark: BenchmarkData
}

interface BarRowProps {
  label: string
  sublabel: string
  score: number
  yourScore: number
  index: number
  vsYouLabel: string
  yourScoreLabel: string
}

function BarRow({ label, sublabel, score, yourScore, index, vsYouLabel, yourScoreLabel }: BarRowProps) {
  const isAhead = yourScore > score
  const diff = Math.round(Math.abs(yourScore - score) * 10) / 10

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-500 text-xs ml-2">{sublabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">{Math.round(score)}</span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
            isAhead
              ? 'bg-green-100 text-green-700'
              : diff === 0
                ? 'bg-gray-100 text-gray-500'
                : 'bg-orange-100 text-orange-700'
          }`}>
            {isAhead ? `+${diff}` : diff === 0 ? '=' : `-${diff}`} {vsYouLabel}
          </span>
        </div>
      </div>

      <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
        {/* Benchmark bar */}
        <motion.div
          className="absolute inset-y-0 left-0 bg-gray-300 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ delay: 0.3 + index * 0.1, duration: 0.7, ease: 'easeOut' }}
        />
        {/* Your score marker */}
        <motion.div
          className="absolute inset-y-0 w-0.5 bg-brand-accent"
          initial={{ left: 0 }}
          animate={{ left: `${yourScore}%` }}
          transition={{ delay: 0.5, duration: 0.7, ease: 'easeOut' }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>0</span>
        <span className="text-brand-accent font-medium">{yourScoreLabel}{yourScore}</span>
        <span>100</span>
      </div>
    </motion.div>
  )
}

export function BenchmarkComparison({ yourScore, benchmark }: BenchmarkComparisonProps) {
  const locale = useLocale()

  const i18n = {
    title:       locale === 'nl' ? 'Hoe scoort u vergeleken met anderen'   : locale === 'fr' ? 'Comment vous vous comparez'                : 'How you compare',
    subtitle:    locale === 'nl' ? 'Uw score vergeleken met anderen die deze assessment hebben ingevuld.' : locale === 'fr' ? 'Votre score comparé aux autres participants.' : 'Your score benchmarked against others who took this assessment.',
    marketAvg:   locale === 'nl' ? 'Marktgemiddelde'  : locale === 'fr' ? 'Moyenne du marché' : 'Market average',
    respondents: locale === 'nl' ? 'deelnemers'       : locale === 'fr' ? 'participants'      : 'respondents',
    cohortLabel: locale === 'nl' ? 'Uw cohort'        : locale === 'fr' ? 'Votre cohorte'     : 'Your cohort',
    people:      locale === 'nl' ? 'deelnemers'       : locale === 'fr' ? 'participants'      : 'people',
    sameRole:    locale === 'nl' ? 'Zelfde rol'       : locale === 'fr' ? 'Même rôle'         : 'Same role',
    vsYou:       locale === 'nl' ? 'vs u'             : locale === 'fr' ? 'vs vous'           : 'vs you',
    yourScore:   locale === 'nl' ? 'U: '              : locale === 'fr' ? 'Vous : '           : 'You: ',
    lowSample:   locale === 'nl' ? 'De benchmark wordt betrouwbaarder naarmate meer organisaties de assessment invullen.' : locale === 'fr' ? 'Les benchmarks deviennent plus significatifs à mesure que plus de personnes complètent l\'évaluation.' : 'Benchmarks become more meaningful as more people complete the assessment.',
  }

  const rows: { label: string; sublabel: string; score: number }[] = [
    {
      label: i18n.marketAvg,
      sublabel: `${benchmark.market.count.toLocaleString()} ${i18n.respondents}`,
      score: benchmark.market.avg,
    },
  ]

  if (benchmark.cohort) {
    rows.push({
      label: i18n.cohortLabel,
      sublabel: `${benchmark.cohort.name} · ${benchmark.cohort.count} ${i18n.people}`,
      score: benchmark.cohort.avg,
    })
  }

  if (benchmark.role) {
    rows.push({
      label: i18n.sameRole,
      sublabel: `${benchmark.role.role} · ${benchmark.role.count} ${i18n.people}`,
      score: benchmark.role.avg,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-lg flex-shrink-0">
          📊
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">{i18n.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{i18n.subtitle}</p>
        </div>
      </div>

      <div className="space-y-5">
        {rows.map((row, i) => (
          <BarRow
            key={row.label}
            label={row.label}
            sublabel={row.sublabel}
            score={row.score}
            yourScore={yourScore}
            index={i}
            vsYouLabel={i18n.vsYou}
            yourScoreLabel={i18n.yourScore}
          />
        ))}
      </div>

      {benchmark.market.count < 10 && (
        <p className="text-xs text-gray-500 mt-4 border-t border-gray-50 pt-3">
          {i18n.lowSample}
        </p>
      )}
    </motion.div>
  )
}
