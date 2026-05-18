/**
 * IndyCar — per-question translations (DE / NL / FR / ES).
 *
 * v1 ships with EMPTY translation maps — `localizeQuestion()` in data.ts falls
 * back to the English question text for any locale where a translation is
 * missing. A v2 PR will populate these via the same parallel-agent flow used
 * for Nordschleife.
 *
 * Shape mirrors `data.ts`: each question id maps to { text, options[4] }.
 */

import type { Locale } from './i18n'

export interface QuestionTranslation {
  text:    string
  options: [string, string, string, string]
}

export type TranslationMap = Record<string, QuestionTranslation>

export const DE: TranslationMap = {}
export const NL: TranslationMap = {}
export const FR: TranslationMap = {}
export const ES: TranslationMap = {}

export const TRANSLATIONS: Record<Exclude<Locale, 'en'>, TranslationMap> = {
  de: DE,
  nl: NL,
  fr: FR,
  es: ES,
}
