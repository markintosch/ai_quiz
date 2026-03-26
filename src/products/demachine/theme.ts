export const FESTIVALS_THEME = {
  id: 'festivals-2026',
  title: 'Nederlandse Festivals 2026',
  subtitle: 'Wat vinden De Machine-luisteraars écht?',
  description:
    'Beoordeel je favoriete festival op vijf dimensies. Zie waar jij staat ten opzichte van alle andere luisteraars.',

  // Phase 0: suggestion/pre-subscription window
  suggestionsOpenAt: new Date('2026-04-01T09:00:00Z'),
  suggestionsCloseAt: new Date('2026-04-08T23:59:00Z'),

  // Phase 1: assessment window
  assessmentOpenAt: new Date('2026-04-09T09:00:00Z'),
  assessmentCloseAt: new Date('2026-04-22T23:59:00Z'),

  subjects: [
    { slug: 'lowlands', label: 'Lowlands', emoji: '🏕️' },
    { slug: 'awakenings', label: 'Awakenings', emoji: '🖤' },
    { slug: 'dgtl', label: 'DGTL', emoji: '🤖' },
    { slug: 'dekmantel', label: 'Dekmantel', emoji: '🎛️' },
    { slug: 'best-kept-secret', label: 'Best Kept Secret', emoji: '🌿' },
  ],

  dimensions: [
    {
      slug: 'lineup',
      label: 'Line-up',
      anchorLow: 'Veilig en voorspelbaar',
      anchorHigh: 'Verrassend en eigenzinnig',
    },
    {
      slug: 'commercial',
      label: 'Commercialisering',
      anchorLow: 'Artist-first',
      anchorHigh: 'Sponsor-first',
    },
    {
      slug: 'eco',
      label: 'Eco footprint',
      anchorLow: 'Verantwoord',
      anchorHigh: 'Onverschillig',
    },
    {
      slug: 'access',
      label: 'Toegankelijkheid',
      anchorLow: 'Inclusief geprijsd',
      anchorHigh: 'Elitair',
    },
    {
      slug: 'impact',
      label: 'Culturele impact',
      anchorLow: 'Bepalend voor de scene',
      anchorHigh: 'Volgend',
    },
  ],
}

export type Theme = typeof FESTIVALS_THEME
export type Subject = (typeof FESTIVALS_THEME.subjects)[0]
export type Dimension = (typeof FESTIVALS_THEME.dimensions)[0]
