// FILE: src/components/sannahremco/remco-schema.ts
// Template 2 — Online Presence voor Remco.

import type { Schema } from './types'

export const remcoSchema: Schema = {
  briefingType: 'remco_presence',
  title:        'Online Presence — Remco',
  intro:        'Jouw online aanwezigheid versterken — los van de portfolio-site van Sannah. Vul in op je eigen tempo. Ongeveer 12 minuten.',
  questions: [

    // ── Identificatie ──
    { id: 'meta.section', type: 'section', label: 'Eerst even kort' },
    { id: 'meta.name',  type: 'text',  label: 'Je naam',  placeholder: 'Remco ...', required: true },
    { id: 'meta.email', type: 'email', label: 'E-mail',   placeholder: 'naam@voorbeeld.nl', required: true },

    // ── A. Doel ──
    { id: 'a.section', type: 'section', label: 'A. Doel' },
    {
      id: 'a.primary_goal',
      type: 'rank',
      label: '1. Wat is het primaire doel?',
      help:  'Rangschik je top 3 (1 = belangrijkst).',
      topN:  3,
      options: [
        { value: 'acquisitie',         label: 'A) Acquisitie nieuwe klanten / opdrachten' },
        { value: 'thought_leadership', label: 'B) Thought leadership in je vakgebied' },
        { value: 'persoonlijk_merk',   label: 'C) Persoonlijk merk (los van bedrijf)' },
        { value: 'recruiting',         label: 'D) Recruiting / talent aantrekken' },
      ],
    },
    {
      id: 'a.goal_other',
      type: 'text',
      label: 'Ander doel (optioneel)',
      placeholder: 'Iets anders dat hier nog bij hoort?',
    },
    {
      id: 'a.term',
      type: 'single',
      label: '2. Termijn waarop je resultaat wil zien?',
      required: true,
      options: [
        { value: '3_maanden',  label: 'A) 3 maanden — snelle wins, profiel-update, eerste content' },
        { value: '6_12_maanden', label: 'B) 6–12 maanden — consistente opbouw' },
        { value: 'lange_adem', label: 'C) Langere adem (1–2 jaar visie)' },
      ],
    },

    // ── B. Positionering ──
    { id: 'b.section', type: 'section', label: 'B. Positionering' },
    {
      id: 'b.one_liner',
      type: 'textarea',
      label: '3. Wat doe je, in één zin?',
      rows:  3,
      required: true,
      placeholder: 'Eén zin. Geen baan-titel — wat lever je op voor wie?',
    },
    {
      id: 'b.audience',
      type: 'multi',
      label: '4. Voor wie is je verhaal vooral bedoeld?',
      help:  'Meerdere mogelijk',
      options: [
        { value: 'bestaande_klanten',  label: 'A) Bestaande klanten / opdrachtgevers' },
        { value: 'potentiele_klanten', label: 'B) Potentiële klanten' },
        { value: 'vakgenoten',         label: 'C) Vakgenoten / netwerk' },
        { value: 'recruiters',         label: 'D) Recruiters / werkgevers' },
        { value: 'pers',               label: 'E) Pers / media' },
      ],
    },
    {
      id: 'b.main_channel',
      type: 'single',
      label: '5. Belangrijkste online kanaal nu?',
      options: [
        { value: 'linkedin',     label: 'A) LinkedIn' },
        { value: 'website',      label: 'B) Eigen website' },
        { value: 'instagram',    label: 'C) Instagram / andere social' },
        { value: 'nieuwsbrief',  label: 'D) Nieuwsbrief' },
        { value: 'geen',         label: 'E) Geen actief kanaal' },
      ],
    },

    // ── C. Content ──
    { id: 'c.section', type: 'section', label: 'C. Content' },
    {
      id: 'c.formats',
      type: 'multi',
      label: '6. Welke content-vormen passen bij jou?',
      help:  'Meerdere mogelijk',
      options: [
        { value: 'korte_posts',   label: 'A) Korte LinkedIn-posts / observaties' },
        { value: 'essays',        label: 'B) Lange-vorm essays / artikelen' },
        { value: 'interviews',    label: 'C) Interviews / podcast (gast of host)' },
        { value: 'cases',         label: 'D) Cases / project-verhalen' },
        { value: 'beeld',         label: 'E) Visueel werk / beeldverhalen' },
        { value: 'video',         label: 'F) Video / spreken voor camera' },
      ],
    },
    {
      id: 'c.time_per_week',
      type: 'single',
      label: '7. Realistische tijd per week?',
      required: true,
      options: [
        { value: '1_2',  label: 'A) 1–2 uur — laagdrempelig' },
        { value: '3_5',  label: 'B) 3–5 uur — consistent ritme' },
        { value: '5_plus', label: 'C) 5+ uur — serieuze opbouw' },
      ],
    },
    {
      id: 'c.existing_material',
      type: 'single',
      label: '8. Bestaand materiaal dat herbruikbaar is?',
      options: [
        { value: 'veel',     label: 'A) Veel (presentaties, oude posts, interne docs)' },
        { value: 'losse',    label: 'B) Losse stukken' },
        { value: 'scratch',  label: 'C) Nauwelijks — vanaf scratch' },
      ],
    },

    // ── D. Stijl ──
    { id: 'd.section', type: 'section', label: 'D. Stijl' },
    {
      id: 'd.inspiration',
      type: 'inspiration',
      label: '9. Welke online presence van anderen vind je goed gedaan?',
      help:  '2–3 namen of URLs, met wat je aanspreekt.',
      count: 3,
    },
    {
      id: 'd.tone',
      type: 'single',
      label: '10. Toon die bij jou past?',
      required: true,
      options: [
        { value: 'zakelijk',   label: 'A) Zakelijk / professioneel' },
        { value: 'persoonlijk',label: 'B) Persoonlijk / verhalend' },
        { value: 'scherp',     label: 'C) Scherp / opiniërend' },
        { value: 'onderzoek',  label: 'D) Onderzoekend / nuancerend' },
        { value: 'speels',     label: 'E) Speels / luchtig' },
      ],
    },

    // ── E. Website ──
    { id: 'e.section', type: 'section', label: 'E. Website' },
    {
      id: 'e.site_status',
      type: 'single',
      label: '11. Status eigen website?',
      options: [
        { value: 'actief',     label: 'A) Actief en up-to-date' },
        { value: 'verouderd', label: 'B) Bestaat, maar verouderd' },
        { value: 'geen',       label: 'C) Geen — alleen LinkedIn' },
        { value: 'in_opbouw',  label: 'D) In opbouw' },
      ],
    },
    {
      id: 'e.site_url',
      type: 'text',
      label: 'URL van je huidige site (als die er is)?',
      placeholder: 'https://...',
    },
    {
      id: 'e.new_site',
      type: 'single',
      label: '12. Wil je een (nieuwe) eigen site?',
      options: [
        { value: 'ja_prio',     label: 'A) Ja, prioriteit' },
        { value: 'linkedin_eerst', label: 'B) Eerst LinkedIn op orde, daarna site' },
        { value: 'nee',         label: 'C) Nee — LinkedIn is voldoende' },
        { value: 'twijfel',     label: 'D) Twijfel' },
      ],
    },
    {
      id: 'e.site_function',
      type: 'multi',
      label: '13. Wil je via je site iets kunnen verkopen / boeken?',
      help:  'Meerdere mogelijk',
      options: [
        { value: 'nee',          label: 'A) Nee' },
        { value: 'boeken',       label: 'B) Boeken (afspraken, calls, sprekersopdrachten)' },
        { value: 'producten',    label: 'C) Producten / diensten direct verkopen' },
        { value: 'nieuwsbrief',  label: 'D) Nieuwsbrief-inschrijvingen verzamelen' },
      ],
    },

    // ── F. Blokkade ──
    { id: 'f.section', type: 'section', label: 'F. Blokkade' },
    {
      id: 'f.blocker',
      type: 'single',
      label: '14. Wat is op dit moment je grootste blokkade?',
      required: true,
      options: [
        { value: 'tijd',           label: 'A) Geen tijd' },
        { value: 'waar_beginnen',  label: 'B) Niet weten waar te beginnen' },
        { value: 'positionering',  label: 'C) Twijfel over wat te zeggen / positionering' },
        { value: 'onzichtbaar',    label: 'D) Onzichtbaarheid voor doelgroep' },
        { value: 'ritme',          label: 'E) Geen consistent ritme' },
      ],
    },

    // ── Uploads & open ──
    { id: 'g.section', type: 'section', label: 'Materiaal & opmerkingen' },
    {
      id: 'g.uploads',
      type: 'upload',
      label: 'Screenshots, voorbeeld-posts, decks of cases die we kunnen hergebruiken?',
      description: 'Optioneel. PNG, JPG, WebP, HEIC, PDF — max 15 MB per bestand.',
      multiple: true,
    },
    {
      id: 'g.open',
      type: 'textarea',
      label: 'Iets wat ik niet heb gevraagd, maar wel relevant is?',
      rows: 5,
      placeholder: 'Schrijf hier vrijuit.',
    },
  ],
}
