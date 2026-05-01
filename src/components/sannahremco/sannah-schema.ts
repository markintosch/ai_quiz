// FILE: src/components/sannahremco/sannah-schema.ts
// Template 1 — Online Portfolio voor Sannah.

import type { Schema } from './types'

export const sannahSchema: Schema = {
  briefingType: 'sannah_portfolio',
  title:        'Online Portfolio — Sannah',
  intro:        'Aanmelding eerstegraads opleiding Breitner Academy + portfolio dat ook na de aanmelding bruikbaar blijft. Vul in op je eigen tempo. Ongeveer 15 minuten.',
  questions: [

    // ── Identificatie ──
    { id: 'meta.section', type: 'section', label: 'Eerst even kort' },
    { id: 'meta.name',  type: 'text',  label: 'Je naam',  placeholder: 'Sannah ...', required: true },
    { id: 'meta.email', type: 'email', label: 'E-mail',   placeholder: 'naam@voorbeeld.nl', required: true,
      help: 'Voor het geval Mark een vraag heeft.' },

    // ── A. Doel & deadline ──
    { id: 'a.section', type: 'section', label: 'A. Doel & deadline' },
    {
      id: 'a.deadline',
      type: 'text',
      label: '1. Wat is de exacte deadline voor de Breitner-aanmelding?',
      placeholder: 'bijv. 15 april 2026',
      required: true,
    },
    {
      id: 'a.primary_goal',
      type: 'single',
      label: '2. Wat is het primaire doel van de site?',
      required: true,
      options: [
        { value: 'aanmelding_only',       label: 'A) Puur de aanmelding — pragmatisch, snel, daarna eventueel uitbreiden' },
        { value: 'aanmelding_portfolio',  label: 'B) Aanmelding + permanent portfolio voor opdrachten / exposities' },
        { value: 'aanmelding_commercieel',label: 'C) Aanmelding + commercieel platform (verkoop)' },
        { value: 'onbekend',              label: 'D) Nog niet uitgekristalliseerd' },
      ],
    },
    {
      id: 'a.time_available',
      type: 'single',
      label: '3. Hoeveel tijd kun je de komende 1–2 weken zelf vrijmaken (selecteren, teksten, feedback)?',
      required: true,
      options: [
        { value: 'lt_2', label: 'A) <2 uur — ik leun op anderen' },
        { value: '2_5',  label: 'B) 2–5 uur' },
        { value: '5_10', label: 'C) 5–10 uur' },
        { value: 'gt_10',label: 'D) >10 uur' },
      ],
    },

    // ── B. Positionering ──
    { id: 'b.section', type: 'section', label: 'B. Positionering' },
    {
      id: 'b.presented_as',
      type: 'multi',
      label: '4. Hoe wil je gepresenteerd worden?',
      help:  'Meerdere mogelijk. In het open veld onderaan kun je eventueel rangschikken (1/2/3).',
      allowOther: true,
      options: [
        { value: 'stylist',     label: 'A) Stylist' },
        { value: 'fotograaf',   label: 'B) Fotograaf' },
        { value: 'vormgever',   label: 'C) Beeldend vormgever / docent' },
        { value: 'kunstenaar',  label: 'D) Kunstenaar / autonoom werk' },
      ],
    },
    {
      id: 'b.statement',
      type: 'single',
      label: '5. Heb je al een over-mij / artist statement?',
      required: true,
      options: [
        { value: 'klaar',       label: 'A) Ja, klaar om te gebruiken' },
        { value: 'concept',     label: 'B) Concept, moet nog herschreven' },
        { value: 'hulp_nodig',  label: 'C) Nee — wil hulp bij schrijven' },
        { value: 'zelf',        label: 'D) Nee — schrijf ik zelf nog' },
      ],
    },

    // ── C. Werk & content ──
    { id: 'c.section', type: 'section', label: 'C. Werk & content' },
    {
      id: 'c.amount',
      type: 'single',
      label: '6. Hoeveel werk wil je tonen?',
      required: true,
      options: [
        { value: '5_10',     label: 'A) 5–10 werken (scherpe selectie — past bij Breitner)' },
        { value: '10_20',    label: 'B) 10–20 werken (compleet portfolio)' },
        { value: '20_plus',  label: 'C) 20+ (uitgebreid archief)' },
        { value: 'onbekend', label: 'D) Weet ik nog niet' },
      ],
    },
    {
      id: 'c.material_state',
      type: 'single',
      label: '7. Staat van het beeldmateriaal?',
      required: true,
      options: [
        { value: 'klaar',        label: 'A) Alles digitaal, hoge resolutie, klaar' },
        { value: 'paar_nog',     label: 'B) Grotendeels digitaal, een paar werken moeten nog gefotografeerd' },
        { value: 'analoog',      label: 'C) Veel analoog — moet nog gedigitaliseerd' },
        { value: 'mix',          label: 'D) Mix — moeten samen doornemen' },
      ],
    },
    {
      id: 'c.organisation',
      type: 'multi',
      label: '8. Hoe wil je je werk ordenen?',
      help: 'Meerdere mogelijk',
      options: [
        { value: 'medium',      label: 'A) Op medium (foto / styling / beeldend)' },
        { value: 'project',     label: 'B) Op project / opdracht' },
        { value: 'thema',       label: 'C) Op thema' },
        { value: 'chronologisch', label: 'D) Chronologisch' },
        { value: 'doorlopend',  label: 'E) Geen indeling — één doorlopende stroom' },
      ],
    },

    // ── D. Stijl & uitstraling ──
    { id: 'd.section', type: 'section', label: 'D. Stijl & uitstraling' },
    {
      id: 'd.inspiration',
      type: 'inspiration',
      label: '9. Welke websites vind je inspirerend qua vormgeving en/of functionaliteit?',
      help:  'Noem 2–3, met URL en wat je aanspreekt.',
      count: 3,
    },
    {
      id: 'd.style',
      type: 'single',
      label: '10. Welke uitstraling past bij jou?',
      required: true,
      allowOther: true,
      options: [
        { value: 'minimalistisch', label: 'A) Strak / minimalistisch / type-driven (Cargo, Format, Squarespace Bedford)' },
        { value: 'editorial',      label: 'B) Editorial / magazine-achtig' },
        { value: 'persoonlijk',    label: 'C) Persoonlijk / kleurrijk / handgemaakt-gevoel' },
        { value: 'documentair',    label: 'D) Documentair / sober' },
      ],
    },
    {
      id: 'd.typography',
      type: 'single',
      label: '11. Rol van typografie?',
      options: [
        { value: 'karakter',         label: 'A) Mag karakter dragen' },
        { value: 'ondergeschikt',    label: 'B) Ondergeschikt — werk staat centraal' },
        { value: 'geen_voorkeur',    label: 'C) Geen voorkeur' },
      ],
    },

    // ── E. Functionaliteit ──
    { id: 'e.section', type: 'section', label: 'E. Functionaliteit' },
    {
      id: 'e.must_have',
      type: 'multi',
      label: '12. Wat moet er minimaal op?',
      help: 'Meerdere mogelijk',
      allowOther: true,
      options: [
        { value: 'portfolio', label: 'A) Portfolio' },
        { value: 'over_mij',  label: 'B) Over mij / bio' },
        { value: 'contact',   label: 'C) Contact' },
        { value: 'cv',        label: 'D) CV / opleiding / exposities' },
        { value: 'werkwijze', label: 'E) Werkwijze / statement' },
        { value: 'blog',      label: 'F) Blog / nieuws' },
      ],
    },
    {
      id: 'e.selling',
      type: 'single',
      label: '13. Wil je je werk online kunnen verkopen?',
      options: [
        { value: 'nee',           label: 'A) Nee — puur portfolio' },
        { value: 'later',         label: 'B) Misschien later — verkoop moet wel kunnen worden toegevoegd' },
        { value: 'launch',        label: 'C) Ja, vanaf launch (prints, originelen, opdrachten op aanvraag)' },
        { value: 'op_aanvraag',   label: 'D) Alleen "neem contact op voor prijs"' },
      ],
    },
    {
      id: 'e.languages',
      type: 'single',
      label: '14. Talen?',
      allowOther: true,
      options: [
        { value: 'nl',     label: 'A) Alleen NL' },
        { value: 'nl_en',  label: 'B) NL + EN' },
      ],
    },

    // ── F. Praktisch ──
    { id: 'f.section', type: 'section', label: 'F. Praktisch' },
    {
      id: 'f.domain',
      type: 'single',
      label: '15. Domeinnaam?',
      revealText: { 'heb_ik_al': 'Welke?' },
      options: [
        { value: 'heb_ik_al', label: 'A) Heb ik al' },
        { value: 'voorstel',  label: 'B) Nee — graag voorstel' },
      ],
    },
    {
      id: 'f.maintenance',
      type: 'single',
      label: '16. Onderhoud na launch?',
      options: [
        { value: 'zelf',         label: 'A) Ik zelf — moet zonder code te wijzigen zijn' },
        { value: 'iemand_tech',  label: 'B) Iemand anders technisch' },
        { value: 'geen',         label: 'C) Geen onderhoud — statisch is prima' },
      ],
    },
    {
      id: 'f.budget',
      type: 'single',
      label: '17. Budget-indicatie?',
      options: [
        { value: 'pragmatisch',  label: 'A) Pragmatisch (template-based, snel)' },
        { value: 'maatwerk',     label: 'B) Maatwerk binnen redelijke grenzen' },
        { value: 'tbd',          label: 'C) Nog te bepalen' },
      ],
    },

    // ── Uploads & open ──
    { id: 'g.section', type: 'section', label: 'Beeldmateriaal & opmerkingen' },
    {
      id: 'g.uploads',
      type: 'upload',
      label: 'Screenshots, voorbeeldwerk, of een paar werken die je nu al wilt delen?',
      description: 'Optioneel. PNG, JPG, WebP, HEIC, PDF — max 15 MB per bestand.',
      multiple: true,
    },
    {
      id: 'g.open',
      type: 'textarea',
      label: 'Iets wat ik niet heb gevraagd, maar wel relevant is?',
      rows: 5,
      placeholder: 'Schrijf hier vrijuit — alles is welkom.',
    },
  ],
}
