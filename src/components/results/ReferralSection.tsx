'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ReferralSectionProps {
  referrerName: string
  referrerCompany: string
  referrerScore: number
  referrerLevel: string
}

export function ReferralSection({
  referrerName,
  referrerCompany,
  referrerScore,
  referrerLevel,
}: ReferralSectionProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!consent) { setError('Please confirm consent before sending.'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inviteeName: name.trim(),
        inviteeEmail: email.trim(),
        referrerName,
        referrerCompany,
        referrerScore,
        referrerLevel,
        gdprConsent: consent,
      }),
    })

    const json = await res.json() as { ok?: boolean; error?: string }
    if (res.ok && json.ok) {
      setSent(true)
    } else {
      setError(json.error ?? 'Something went wrong.')
    }
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-lg flex-shrink-0">
          🤝
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">Know someone who should take this?</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Invite a colleague — we&apos;ll send them a personalised email with your score as context.
          </p>
        </div>
      </div>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"
        >
          <p className="text-green-700 font-semibold text-sm">✓ Invitation sent to {name}!</p>
          <p className="text-green-600 text-xs mt-1">Their email will not be stored or used again.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Their name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Jane Smith"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Their email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="jane@company.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-brand-accent flex-shrink-0"
            />
            <span className="text-xs text-gray-500 leading-relaxed">
              I confirm this person has agreed to receive this invitation. Their email will be used only to send this one message and will not be stored or added to any mailing list.
            </span>
          </label>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-accent hover:bg-orange-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors"
          >
            {loading ? 'Sending…' : 'Send invitation →'}
          </button>
        </form>
      )}
    </motion.div>
  )
}
