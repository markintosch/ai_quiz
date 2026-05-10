// FILE: src/lib/cycle/symptoms.ts
// Symptom catalog — stable keys + Dutch display labels, grouped by category
// for the daily check-in UI. Keys are persisted; labels are presentation-only.

export type SymptomKey =
  | 'brain_fog'
  | 'dizzy'
  | 'headache'
  | 'overstimulated'
  | 'sad'
  | 'tired'
  | 'exhausted'
  | 'interrupted_sleep'
  | 'restless_legs'
  | 'joint_pain'
  | 'back_pain'
  | 'bloating'
  | 'cramps'
  | 'cold'

export const SYMPTOM_LABEL_NL: Record<SymptomKey, string> = {
  brain_fog:          'Brain fog',
  dizzy:              'Duizelig',
  headache:           'Hoofdpijn',
  overstimulated:     'Overprikkeld',
  sad:                'Somber',
  tired:              'Vermoeid',
  exhausted:          'Uitgeput',
  interrupted_sleep:  'Onderbroken slaap',
  restless_legs:      'Rusteloze benen',
  joint_pain:         'Gewrichtspijn',
  back_pain:          'Rugpijn',
  bloating:           'Opgeblazen buik',
  cramps:             'Menstruatiekramp',
  cold:               'Koud',
}

export interface SymptomGroup {
  label: string
  keys: SymptomKey[]
}

export const SYMPTOM_GROUPS_NL: SymptomGroup[] = [
  {
    label: 'Hoofd & gevoel',
    keys:  ['brain_fog', 'dizzy', 'headache', 'overstimulated', 'sad'],
  },
  {
    label: 'Energie & slaap',
    keys:  ['tired', 'exhausted', 'interrupted_sleep', 'restless_legs'],
  },
  {
    label: 'Lichaam',
    keys:  ['joint_pain', 'back_pain', 'bloating', 'cramps', 'cold'],
  },
]

export const ALL_SYMPTOM_KEYS: SymptomKey[] = Object.keys(SYMPTOM_LABEL_NL) as SymptomKey[]

export function isValidSymptom(k: unknown): k is SymptomKey {
  return typeof k === 'string' && k in SYMPTOM_LABEL_NL
}
