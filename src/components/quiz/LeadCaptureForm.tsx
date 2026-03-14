'use client'

import { useState } from 'react'
import type { LeadFormData } from '@/types'

const COMPANY_SIZES = ['1–10','11–50','51–200','201–500','501–1000','1000+']

const INDUSTRIES = [
  'Financial Services','Technology','Healthcare','Retail & E-commerce',
  'Manufacturing','Professional Services','Media & Entertainment',
  'Education','Government & Public Sector','Other',
]

interface LeadCaptureFormProps {
  variant: 'pre' | 'post'
  initialValues?: Partial<LeadFormData>
  onSubmit: (data: LeadFormData) => void | Promise<void>
  loading?: boolean
}

export function LeadCaptureForm({ variant, initialValues, onSubmit, loading = false }: LeadCaptureFormProps) {
  const [form, setForm] = useState<LeadFormData>({
    name:             initialValues?.name             ?? '',
    email:            initialValues?.email            ?? '',
    jobTitle:         initialValues?.jobTitle         ?? '',
    companyName:      initialValues?.companyName      ?? '',
    industry:         initialValues?.industry         ?? '',
    companySize:      initialValues?.companySize      ?? '',
    gdprConsent:      initialValues?.gdprConsent      ?? false,
    marketingConsent: initialValues?.marketingConsent ?? false,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({})

  function set<K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  function validate(): boolean {
    const next: typeof errors = {}
    if (!form.name.trim())        next.name        = 'Name is required'
    if (!form.email.trim())       next.email       = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                  next.email       = 'Enter a valid email address'
    if (!form.jobTitle.trim())    next.jobTitle    = 'Job title is required'
    if (!form.companyName.trim()) next.companyName = 'Company name is required'
    if (!form.gdprConsent)        next.gdprConsent = 'You must agree to continue'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field label="Full Name" error={errors.name} required>
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="Jane Smith" className={inputCls(!!errors.name)} />
      </Field>

      <Field label="Work Email" error={errors.email} required>
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
          placeholder="jane@company.com" className={inputCls(!!errors.email)} autoComplete="email" />
      </Field>

      <Field label="Job Title" error={errors.jobTitle} required>
        <input type="text" value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)}
          placeholder="Chief Digital Officer" className={inputCls(!!errors.jobTitle)} />
      </Field>

      <Field label="Company Name" error={errors.companyName} required>
        <input type="text" value={form.companyName} onChange={e => set('companyName', e.target.value)}
          placeholder="Acme Ltd" className={inputCls(!!errors.companyName)} />
      </Field>

      <Field label="Industry" error={errors.industry}>
        <select value={form.industry ?? ''} onChange={e => set('industry', e.target.value)} className={inputCls(false)}>
          <option value="">Select…</option>
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </Field>

      <Field label="Company Size" error={errors.companySize}>
        <select value={form.companySize ?? ''} onChange={e => set('companySize', e.target.value)} className={inputCls(false)}>
          <option value="">Select…</option>
          {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
        </select>
      </Field>

      {/* ── GDPR — two separate consents ── */}
      <div className="space-y-3 border border-gray-100 rounded-xl p-4 bg-gray-50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your data &amp; privacy</p>

        {/* Required: results */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.gdprConsent}
              onChange={e => set('gdprConsent', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-brand-accent flex-shrink-0" />
            <span className="text-sm text-gray-700 leading-relaxed">
              <strong>Required —</strong> I agree to Brand PWRD Media processing my personal data
              to generate and deliver my assessment results. See our{' '}
              <a href="/privacy" className="underline text-brand-accent" target="_blank" rel="noreferrer">Privacy Policy</a>.
            </span>
          </label>
          {errors.gdprConsent && (
            <p className="mt-1 text-xs text-red-600 pl-7">{errors.gdprConsent}</p>
          )}
        </div>

        {/* Optional: marketing */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={form.marketingConsent}
            onChange={e => set('marketingConsent', e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-brand-accent flex-shrink-0" />
          <span className="text-sm text-gray-500 leading-relaxed">
            <strong>Optional —</strong> I&apos;d like to receive occasional AI insights and updates
            from Brand PWRD Media. I can unsubscribe at any time.
          </span>
        </label>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-3.5 bg-brand-accent text-white font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-all text-sm">
        {loading ? 'Please wait…' : variant === 'pre' ? 'Start Assessment →' : 'Reveal My Score →'}
      </button>
    </form>
  )
}

function inputCls(hasError: boolean) {
  return [
    'w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 bg-white',
    'focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent',
    'placeholder:text-gray-400 transition-shadow',
    hasError ? 'border-red-400' : 'border-gray-300',
  ].join(' ')
}

interface FieldProps { label: string; error?: string; required?: boolean; children: React.ReactNode }
function Field({ label, error, required, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-brand-accent ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
