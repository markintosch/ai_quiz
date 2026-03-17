'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SUPPORT_TYPES = [
  'Strategy',
  'Team training',
  'Leadership alignment',
  'AI implementation',
  'Governance / policy',
  'Other',
]

const TEAM_SIZES = [
  '1–10 people',
  '11–50 people',
  '51–200 people',
  '200+ people',
]

const TIMING_OPTIONS = [
  'As soon as possible',
  'Within 1 month',
  'Within 3 months',
  'Exploring only',
]

interface CustomProjectFormProps {
  responseId?: string
  initialName?: string
  initialEmail?: string
  initialCompany?: string
}

export function CustomProjectForm({
  responseId,
  initialName = '',
  initialEmail = '',
  initialCompany = '',
}: CustomProjectFormProps) {
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [company, setCompany] = useState(initialCompany)
  const [role, setRole] = useState('')
  const [challenge, setChallenge] = useState('')
  const [supportTypes, setSupportTypes] = useState<string[]>([])
  const [teamSize, setTeamSize] = useState('')
  const [timing, setTiming] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function toggleSupportType(type: string) {
    setSupportTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !challenge.trim()) return

    setStatus('submitting')

    const options: Record<string, unknown> = {
      role: role.trim() || undefined,
      challengeDescription: challenge.trim(),
      supportTypes: supportTypes.length > 0 ? supportTypes : undefined,
      teamSize: teamSize || undefined,
      timing: timing || undefined,
      phone: phone.trim() || undefined,
      company: company.trim() || undefined,
    }

    // Remove undefined keys
    Object.keys(options).forEach(k => options[k] === undefined && delete options[k])

    try {
      const res = await fetch('/api/next-steps/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceKey: 'custom_project',
          responseId,
          name: name.trim(),
          email: email.trim(),
          options,
        }),
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
        <p className="text-lg font-semibold text-gray-900 mb-2">Request received</p>
        <p className="text-sm text-gray-600">
          Thanks — we&apos;ll review your request and get back to you with the most relevant next step.
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name + Email row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            First name
            {initialName && <span className="ml-1 text-xs text-gray-400 font-normal">(prefilled)</span>}
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Work email
            {initialEmail && <span className="ml-1 text-xs text-gray-400 font-normal">(prefilled)</span>}
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            placeholder="you@company.com"
          />
        </div>
      </div>

      {/* Company + Role row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Company
            {initialCompany && <span className="ml-1 text-xs text-gray-400 font-normal">(prefilled)</span>}
          </label>
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            placeholder="Company name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Your role <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            placeholder="e.g. Head of Operations"
          />
        </div>
      </div>

      {/* Challenge description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          What challenge are you looking to solve?
        </label>
        <textarea
          value={challenge}
          onChange={e => setChallenge(e.target.value)}
          required
          rows={4}
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand resize-none"
          placeholder="Describe your AI challenge, ambition or question as concretely as you can…"
        />
      </div>

      {/* Support type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          What kind of support are you exploring?{' '}
          <span className="text-gray-400 font-normal">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SUPPORT_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => toggleSupportType(type)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                supportTypes.includes(type)
                  ? 'bg-brand border-brand text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-brand hover:text-brand'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Team size + Timing row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Team or company size <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            value={teamSize}
            onChange={e => setTeamSize(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
          >
            <option value="">Select…</option>
            {TEAM_SIZES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Preferred timing <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select
            value={timing}
            onChange={e => setTiming(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
          >
            <option value="">Select…</option>
            {TIMING_OPTIONS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Phone (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Phone <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          placeholder="+31 6 …"
        />
      </div>

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
        disabled={status === 'submitting' || !name.trim() || !email.trim() || !challenge.trim()}
        className="w-full px-6 py-3 bg-brand-accent hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
      >
        {status === 'submitting' ? 'Sending…' : 'Submit your request →'}
      </button>
    </form>
  )
}
