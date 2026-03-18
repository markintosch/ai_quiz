'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ServiceKey = 'intro_training' | 'ai_coding'

interface InterestFormProps {
  serviceKey: ServiceKey
  responseId?: string
  initialName?: string
  initialEmail?: string
}

const inputCls = 'w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand'

const CONTENT = {
  intro_training: {
    headline: 'Interested in an online introduction to AI?',
    intro:
      'We are preparing practical introduction sessions for individuals and groups who want to better understand AI, its opportunities, and how to apply it in real work contexts. Register your interest and we\'ll keep you informed about upcoming sessions.',
    interestTypeLabel: 'I am interested as',
    interestTypeOptions: ['Individual', 'Team', 'Company / group'],
    formatLabel: 'Preferred format',
    formatOptions: ['Online', 'In-company', 'No preference'],
    successMessage:
      'Thanks for registering your interest. We\'ll keep you informed about upcoming sessions and formats.',
  },
  ai_coding: {
    headline: 'Interested in hands-on self-coding with AI?',
    intro:
      'This practical training is designed for developers and technical professionals who want to use AI directly in their coding workflows. Register your interest to hear more about upcoming sessions and formats.',
    experienceLabel: 'Experience level',
    experienceOptions: ['Beginner', 'Intermediate', 'Advanced'],
    interestTypeLabel: 'I am interested as',
    interestTypeOptions: ['Individual', 'Team', 'Company / group'],
    mainInterestLabel: 'Main interest',
    mainInterestOptions: [
      'Coding productivity',
      'AI-assisted development',
      'Tooling / workflows',
      'Learning by doing',
    ],
    successMessage:
      'Thanks for registering your interest. We\'ll keep you informed about upcoming hands-on training opportunities.',
  },
} as const

export function InterestForm({
  serviceKey,
  responseId,
  initialName = '',
  initialEmail = '',
}: InterestFormProps) {
  const content = CONTENT[serviceKey]

  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [interestType, setInterestType] = useState('')
  const [format, setFormat] = useState('')           // intro_training only
  const [experience, setExperience] = useState('')   // ai_coding only
  const [mainInterest, setMainInterest] = useState('') // ai_coding only
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const nameIsPrefilled = !!initialName
  const emailIsPrefilled = !!initialEmail

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    setStatus('submitting')

    const options: Record<string, string> = {}
    if (interestType) options.interestType = interestType
    if (serviceKey === 'intro_training' && format) options.format = format
    if (serviceKey === 'ai_coding' && experience) options.experience = experience
    if (serviceKey === 'ai_coding' && mainInterest) options.mainInterest = mainInterest

    try {
      const res = await fetch('/api/next-steps/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceKey, responseId, name: name.trim(), email: email.trim(), options }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Something went wrong')
      }

      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10 px-6"
      >
        <div className="text-4xl mb-4">✓</div>
        <p className="text-lg font-semibold text-gray-900 mb-2">You&apos;re on the list</p>
        <p className="text-sm text-gray-600">{content.successMessage}</p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          First name
          {nameIsPrefilled && (
            <span className="ml-2 text-xs text-gray-400 font-normal">(prefilled from your assessment)</span>
          )}
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className={inputCls}
          placeholder="Your name"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Work email
          {emailIsPrefilled && (
            <span className="ml-2 text-xs text-gray-400 font-normal">(prefilled)</span>
          )}
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={inputCls}
          placeholder="you@company.com"
        />
      </div>

      {/* Interest type (both) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {content.interestTypeLabel} <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {content.interestTypeOptions.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setInterestType(interestType === opt ? '' : opt)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                interestType === opt
                  ? 'bg-brand border-brand text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-brand hover:text-brand'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* intro_training: format preference */}
      {serviceKey === 'intro_training' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {'formatLabel' in content ? content.formatLabel : ''}{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {'formatOptions' in content && content.formatOptions.map((opt: string) => (
              <button
                key={opt}
                type="button"
                onClick={() => setFormat(format === opt ? '' : opt)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  format === opt
                    ? 'bg-brand border-brand text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-brand hover:text-brand'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ai_coding: experience level */}
      {serviceKey === 'ai_coding' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {'experienceLabel' in content ? content.experienceLabel : ''}{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {'experienceOptions' in content && content.experienceOptions.map((opt: string) => (
              <button
                key={opt}
                type="button"
                onClick={() => setExperience(experience === opt ? '' : opt)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  experience === opt
                    ? 'bg-brand border-brand text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-brand hover:text-brand'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ai_coding: main interest */}
      {serviceKey === 'ai_coding' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {'mainInterestLabel' in content ? content.mainInterestLabel : ''}{' '}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {'mainInterestOptions' in content && content.mainInterestOptions.map((opt: string) => (
              <button
                key={opt}
                type="button"
                onClick={() => setMainInterest(mainInterest === opt ? '' : opt)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  mainInterest === opt
                    ? 'bg-brand border-brand text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-brand hover:text-brand'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-red-600"
          >
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'submitting' || !name.trim() || !email.trim()}
        className="w-full px-6 py-3 bg-brand-accent hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
      >
        {status === 'submitting' ? 'Sending…' : 'Register my interest →'}
      </button>
    </form>
  )
}
