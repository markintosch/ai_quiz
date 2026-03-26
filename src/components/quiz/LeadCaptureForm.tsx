'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { LeadFormData } from '@/types'

const COMPANY_SIZES = ['1–10','11–50','51–200','201–500','501–1000','1000+']

interface LeadCaptureFormProps {
  variant: 'pre' | 'post'
  initialValues?: Partial<LeadFormData>
  onSubmit: (data: LeadFormData) => void | Promise<void>
  loading?: boolean
  /** 'full' = all fields (default); 'minimal' = name + email only */
  mode?: 'full' | 'minimal'
  /** Company name — replaces "Brand PWRD Media" in GDPR text when provided */
  companyName?: string
}

export function LeadCaptureForm({ variant, initialValues, onSubmit, loading = false, mode = 'full', companyName }: LeadCaptureFormProps) {
  const t = useTranslations('quiz.lead')
  const industries = t.raw('industries') as string[]
  const isMinimal = mode === 'minimal'
  // Brand name shown in GDPR text: use company name if provided, otherwise fall back to translation default
  const brandName = companyName ?? t('brand')

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
    if (!form.name.trim())        next.name        = t('errors.nameRequired')
    if (!form.email.trim())       next.email       = t('errors.emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                  next.email       = t('errors.emailInvalid')
    if (!isMinimal && !form.jobTitle.trim())    next.jobTitle    = t('errors.jobTitleRequired')
    if (!isMinimal && !form.companyName.trim()) next.companyName = t('errors.companyRequired')
    if (!form.gdprConsent)        next.gdprConsent = t('errors.gdprRequired')
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
      <Field label={t('fullName')} error={errors.name} required>
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
          placeholder={t('fullNamePh')} className={inputCls(!!errors.name)} />
      </Field>

      <Field label={t('email')} error={errors.email} required>
        <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
          placeholder={t('emailPh')} className={inputCls(!!errors.email)} autoComplete="email" />
      </Field>

      {!isMinimal && (
        <>
          <Field label={t('jobTitle')} error={errors.jobTitle} required>
            <input type="text" value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)}
              placeholder={t('jobTitlePh')} className={inputCls(!!errors.jobTitle)} />
          </Field>

          <Field label={t('company')} error={errors.companyName} required>
            <input type="text" value={form.companyName} onChange={e => set('companyName', e.target.value)}
              placeholder={t('companyPh')} className={inputCls(!!errors.companyName)} />
          </Field>

          <Field label={t('industry')} error={errors.industry}>
            <select value={form.industry ?? ''} onChange={e => set('industry', e.target.value)} className={inputCls(false)}>
              <option value="">{t('industrySel')}</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>

          <Field label={t('companySize')} error={errors.companySize}>
            <select value={form.companySize ?? ''} onChange={e => set('companySize', e.target.value)} className={inputCls(false)}>
              <option value="">{t('industrySel')}</option>
              {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}{t('companySizeSuffix')}</option>)}
            </select>
          </Field>
        </>
      )}

      {/* ── GDPR — two separate consents ── */}
      <div className="space-y-3 border border-gray-100 rounded-xl p-4 bg-gray-50">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('privacyLabel')}</p>

        {/* Required: results */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={form.gdprConsent}
              onChange={e => set('gdprConsent', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-brand-accent flex-shrink-0" />
            <span className="text-sm text-gray-700 leading-relaxed">
              {t.rich('gdprRequired', {
                brand: brandName,
                link: (chunks) => (
                  <a href="/privacy" className="underline text-brand-accent" target="_blank" rel="noreferrer">
                    {chunks}
                  </a>
                ),
              })}
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
            {t.rich('gdprOptional', { brand: brandName })}
          </span>
        </label>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-3.5 bg-brand-accent text-white font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-all text-sm">
        {loading ? t('submitLoading') : variant === 'pre' ? t('submitPre') : t('submitPost')}
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
