'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DEMO_SUBMISSIONS } from '@/products/moba_marketing/demo'
import { aggregateMoba } from '@/lib/moba/aggregate'
import { MobaGroupReport } from '@/components/moba/MobaGroupReport'
import type { MobaContent } from '@/lib/moba/content'
import { MobaFeedback } from './MobaFeedback'

type Step = 'intro' | 'questions' | 'priority' | 'open' | 'segment' | 'submitting' | 'done' | 'error' | 'demoReport'

interface MobaSurveyProps {
  submitToken: string
  teamName: string
  segmentationEnabled: boolean
  /** Editable survey copy, merged (DB overrides on code defaults) server-side. */
  content: MobaContent
  /** Demo/evaluation mode: walk through the flow without saving anything. */
  demo?: boolean
  /** Start directly on a given step (demo only) — e.g. jump to the sample report. */
  initialStep?: Step
}

export function MobaSurvey({ submitToken, teamName, segmentationEnabled, content, demo = false, initialStep = 'intro' }: MobaSurveyProps) {
  const questions = content.questions
  const priorityOptions = content.priorityOptions
  const priorityTotal = content.priorityTotal
  const openQuestions = content.openQuestions
  const segmentQuestion = content.segment

  const [step, setStep] = useState<Step>(initialStep)
  const [qIndex, setQIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [priorities, setPriorities] = useState<Record<string, number>>(
    () => Object.fromEntries(priorityOptions.map(o => [o.key, 0]))
  )
  const [openAnswers, setOpenAnswers] = useState<Record<string, string>>({})
  const [segment, setSegment] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const totalQ = questions.length
  const currentQ = questions[qIndex]
  const answered = answers[currentQ?.code] !== undefined

  // Progress across the whole survey (questions + 3 closing steps)
  const closingSteps = segmentationEnabled ? 3 : 2
  const totalSteps = totalQ + closingSteps
  const stepNumber =
    step === 'questions' ? qIndex + 1
    : step === 'priority' ? totalQ + 1
    : step === 'open' ? totalQ + 2
    : step === 'segment' ? totalQ + 3
    : totalSteps
  const pct = Math.round((stepNumber / totalSteps) * 100)

  const prioritySum = useMemo(
    () => Object.values(priorities).reduce((a, b) => a + b, 0),
    [priorities]
  )
  const priorityRemaining = priorityTotal - prioritySum

  // ── Navigation ─────────────────────────────────────────────
  function answerQuestion(value: number) {
    setAnswers(prev => ({ ...prev, [currentQ.code]: value }))
  }

  function nextQuestion() {
    if (!answered) return
    if (qIndex < totalQ - 1) {
      setDirection(1)
      setQIndex(i => i + 1)
    } else {
      setStep('priority')
    }
  }

  function prevQuestion() {
    if (qIndex > 0) {
      setDirection(-1)
      setQIndex(i => i - 1)
    } else {
      setStep('intro')
    }
  }

  function adjustPriority(key: string, delta: number) {
    setPriorities(prev => {
      const next = Math.max(0, (prev[key] ?? 0) + delta)
      // Don't allow going over the total budget
      const others = Object.entries(prev).reduce((s, [k, v]) => (k === key ? s : s + v), 0)
      if (others + next > priorityTotal) return prev
      return { ...prev, [key]: next }
    })
  }

  // Demo aggregate (n=12) — computed once, stable.
  const demoData = useMemo(() => aggregateMoba(DEMO_SUBMISSIONS, openQuestions), [openQuestions])

  async function submit() {
    // Demo/evaluation mode: nothing is saved — show the sample dashboard.
    if (demo) {
      setStep('demoReport')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setStep('submitting')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/moba/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submitToken,
          answers,
          priorities,
          openAnswers,
          segment: segmentationEnabled ? segment : null,
        }),
      })
      if (!res.ok) {
        const b = await res.json().catch(() => ({}))
        throw new Error(b.error ?? `Serverfout ${res.status}`)
      }
      setStep('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Er ging iets mis. Probeer het opnieuw.')
      setStep('error')
    }
  }

  // ── Shell ──────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-5">
      <div className={`${step === 'demoReport' ? 'max-w-3xl' : 'max-w-xl'} mx-auto`}>
        {/* Header */}
        {step !== 'demoReport' && (
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-1">
              {teamName}
            </p>
            <p className="text-xs text-gray-500">Marketing Survey · anoniem</p>
          </div>
        )}

        {/* Progress (hidden on intro/done/report) */}
        {step !== 'intro' && step !== 'done' && step !== 'error' && step !== 'demoReport' && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Stap {stepNumber} van {totalSteps}
              </span>
              <span className="text-xs font-bold text-brand-accent">{pct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className="h-1.5 rounded-full bg-brand-accent"
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* ── INTRO / management summary ── */}
        {step === 'intro' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Waar staan we als marketingteam?
            </h1>

            <div className="space-y-5 text-sm leading-relaxed">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-1.5">De gedachte</p>
                <p className="text-gray-600">
                  Richting het jaarplan 2027 willen we als team scherp krijgen waar we staan in
                  onze marktbenadering. Deze survey vullen we vooraf in. Het doel is geen
                  individueel rapport, maar een gedeeld beeld: waar zijn we het eens, en waar
                  lopen onze meningen uiteen. Juist die verschillen zijn het gesprek voor de sessie.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-1.5">De opzet</p>
                <p className="text-gray-600">
                  Zes thema's, achttien korte stellingen, zo'n 6 tot 8 minuten. Daarna verdeel je
                  tien punten over de thema's voor 2027 en beantwoord je drie open vragen. Invullen
                  is <strong>anoniem</strong>: geen naam, geen e-mail.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-accent mb-1.5">Wat het oplevert</p>
                <p className="text-gray-600">
                  Eén teamoverzicht dat per thema het gemiddelde én de spreiding laat zien, en
                  automatisch de thema's markeert waar we het meest van mening verschillen. Dat is
                  het startpunt voor de sessie. Aan het eind van deze doorloop zie je een voorbeeld
                  van dat overzicht.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-sm text-gray-600">
                Loop de survey gerust zelf een keer door om te voelen hoe het werkt. Er zijn geen
                goede of foute antwoorden.
              </p>
            </div>

            <button
              type="button"
              onClick={() => { setStep('questions'); setQIndex(0); setDirection(1) }}
              className="mt-6 w-full px-8 py-3.5 bg-brand-accent text-white font-semibold rounded-xl hover:bg-orange-700 transition-all"
            >
              Doorloop de survey zelf →
            </button>

            {demo && (
              <button
                type="button"
                onClick={() => { setStep('demoReport'); window.scrollTo({ top: 0 }) }}
                className="mt-3 w-full px-8 py-3 text-brand-accent font-semibold rounded-xl border border-brand-accent/40 hover:bg-orange-50 transition-all"
              >
                Of bekijk direct een voorbeeld-uitkomst →
              </button>
            )}
          </motion.div>
        )}

        {/* ── QUESTIONS ── */}
        {step === 'questions' && currentQ && (
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentQ.code}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6 leading-snug">
                  {currentQ.text}
                </h2>
                <div className="space-y-2.5">
                  {currentQ.options.map((opt, i) => {
                    const selected = answers[currentQ.code] === opt.value
                    return (
                      <motion.button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => typeof opt.value === 'number' && answerQuestion(opt.value)}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left px-5 py-3.5 rounded-xl border text-sm font-medium transition-colors ${
                          selected
                            ? 'bg-brand text-white border-brand'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-brand hover:bg-gray-50'
                        }`}
                      >
                        {opt.label}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex justify-between items-center">
              <button type="button" onClick={prevQuestion}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                ← Terug
              </button>
              <button type="button" onClick={nextQuestion} disabled={!answered}
                className="px-8 py-3 bg-brand-accent text-white font-semibold rounded-xl disabled:opacity-40 hover:bg-orange-700 transition-all">
                Volgende →
              </button>
            </div>
          </div>
        )}

        {/* ── PRIORITY (10 points) ── */}
        {step === 'priority' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 leading-snug">
              Waar moet onze marketingenergie in 2027 vooral heen?
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Verdeel {priorityTotal} punten over de zes thema's. Meer punten = hogere prioriteit.
            </p>

            <div className={`mb-5 text-sm font-semibold ${priorityRemaining === 0 ? 'text-green-600' : 'text-brand-accent'}`}>
              Nog te verdelen: {priorityRemaining} van {priorityTotal}
            </div>

            <div className="space-y-3">
              {priorityOptions.map(opt => {
                const v = priorities[opt.key] ?? 0
                return (
                  <div key={opt.key} className="flex items-center gap-3">
                    <span className="flex-1 text-sm text-gray-700">{opt.label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={() => adjustPriority(opt.key, -1)} disabled={v === 0}
                        className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 disabled:opacity-30 hover:border-brand-accent hover:text-brand-accent transition-colors">
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-gray-900">{v}</span>
                      <button type="button" onClick={() => adjustPriority(opt.key, +1)} disabled={priorityRemaining === 0}
                        className="w-8 h-8 rounded-full border border-gray-300 text-gray-600 disabled:opacity-30 hover:border-brand-accent hover:text-brand-accent transition-colors">
                        +
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-7 flex justify-between items-center">
              <button type="button" onClick={() => { setStep('questions'); setQIndex(totalQ - 1); setDirection(-1) }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                ← Terug
              </button>
              <button type="button" onClick={() => setStep('open')} disabled={priorityRemaining !== 0}
                className="px-8 py-3 bg-brand-accent text-white font-semibold rounded-xl disabled:opacity-40 hover:bg-orange-700 transition-all">
                Volgende →
              </button>
            </div>
          </motion.div>
        )}

        {/* ── OPEN QUESTIONS ── */}
        {step === 'open' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 leading-snug">Nog een paar open vragen</h2>
            <p className="text-sm text-gray-500 mb-6">
              Kort mag. Deze antwoorden tonen we anoniem in het teamoverzicht. Overslaan mag ook.
            </p>
            <div className="space-y-5">
              {openQuestions.map(q => (
                <div key={q.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{q.text}</label>
                  <textarea
                    value={openAnswers[q.key] ?? ''}
                    onChange={e => setOpenAnswers(prev => ({ ...prev, [q.key]: e.target.value }))}
                    rows={3}
                    maxLength={2000}
                    className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent placeholder-gray-400"
                    placeholder="Jouw antwoord…"
                  />
                </div>
              ))}
            </div>

            <div className="mt-7 flex justify-between items-center">
              <button type="button" onClick={() => setStep('priority')}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                ← Terug
              </button>
              <button type="button" onClick={() => { if (segmentationEnabled) setStep('segment'); else submit() }}
                className="px-8 py-3 bg-brand-accent text-white font-semibold rounded-xl hover:bg-orange-700 transition-all">
                {segmentationEnabled ? 'Volgende →' : 'Versturen'}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── SEGMENT ── */}
        {step === 'segment' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 leading-snug">
              {segmentQuestion.text}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Eén laatste vraag. Dit helpt ons in het overzicht te zien of verschillende
              invalshoeken anders naar de markt kijken. Blijft anoniem.
            </p>

            <div className="flex items-center justify-between gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setSegment(n)}
                  className={`flex-1 h-12 rounded-xl border text-sm font-bold transition-colors ${
                    segment === n
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-brand'
                  }`}>
                  {n}
                </button>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{segmentQuestion.minLabel}</span>
              <span>{segmentQuestion.maxLabel}</span>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <button type="button" onClick={() => setStep('open')}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                ← Terug
              </button>
              <button type="button" onClick={submit}
                className="px-8 py-3 bg-brand-accent text-white font-semibold rounded-xl hover:bg-orange-700 transition-all">
                Versturen
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-gray-400">Je mag deze vraag overslaan.</p>
          </motion.div>
        )}

        {/* ── SUBMITTING ── */}
        {step === 'submitting' && (
          <div className="text-center py-20">
            <div className="inline-block w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-gray-600 font-medium">Bezig met opslaan…</p>
          </div>
        )}

        {/* ── DONE ── */}
        {step === 'done' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dank je wel</h2>
            <p className="text-gray-600 text-sm max-w-sm mx-auto">
              Je bijdrage is opgeslagen en telt anoniem mee in het teamoverzicht dat we in de
              sessie bespreken. Je kunt dit venster sluiten.
            </p>
          </motion.div>
        )}

        {/* ── DEMO REPORT (evaluation only) ── */}
        {step === 'demoReport' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5 rounded-2xl bg-brand text-white p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
                Zo ziet de uitkomst eruit
              </p>
              <h2 className="text-xl font-bold mb-2">Voorbeeld-teamoverzicht</h2>
              <p className="text-sm text-white/80">
                Dit is het rapport dat we straks live in de sessie bespreken, hier gevuld met
                fictieve data van 12 teamleden. Er is niets van jouw invulling opgeslagen.
              </p>
            </div>

            <MobaGroupReport data={demoData} teamName={teamName} demo />

            <div className="mt-6">
              <MobaFeedback />
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => { setStep('intro'); setQIndex(0); setAnswers({}); window.scrollTo({ top: 0 }) }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ↺ Opnieuw beginnen
              </button>
            </div>
          </motion.div>
        )}

        {/* ── ERROR ── */}
        {step === 'error' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Er ging iets mis</h2>
            <p className="text-gray-600 text-sm mb-6">{errorMsg}</p>
            <button type="button" onClick={submit}
              className="px-8 py-3 bg-brand-accent text-white font-semibold rounded-xl hover:bg-orange-700 transition-all">
              Opnieuw versturen
            </button>
          </motion.div>
        )}
      </div>
    </main>
  )
}
