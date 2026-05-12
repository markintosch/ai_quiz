/**
 * Peri-Compass — UI strings per locale (NL/EN/FR/DE).
 * Eén centrale plek voor álle copy buiten de vragen zelf.
 */

export type Lang = 'nl' | 'en' | 'fr' | 'de'

export function pickLang(input: string | string[] | undefined | null): Lang {
  const v = Array.isArray(input) ? input[0] : input
  if (v === 'en' || v === 'fr' || v === 'de' || v === 'nl') return v
  return 'nl'
}

export const LANG_LABELS: Record<Lang, string> = {
  nl: 'Nederlands',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
}

export const OG_LOCALE: Record<Lang, string> = {
  nl: 'nl_NL', en: 'en_US', fr: 'fr_FR', de: 'de_DE',
}

// ── Landing page ────────────────────────────────────────────────────────────
export const LANDING: Record<Lang, {
  metaTitle:    string
  metaDesc:     string
  eyebrow:      string
  title:        string
  intro:        string
  cta:          string
  ctaSub:       string
  whatHeading:  string
  feat: { num: string; title: string; body: string }[]
  forWhomHeading: string
  forWhom:      { strong: string; text: string }[]
  notHeading:   string
  notList:      string[]
  finalLine:    string
}> = {
  nl: {
    metaTitle:   'Peri-Compass — een nulmeting voor je dagelijkse tracking',
    metaDesc:    'Een eenmalige instap-assessment van 15 minuten. Krijg je baseline-score op 6 dimensies, drie hypothesen voor wat je ziet en een eerste experiment voor de komende 30 dagen.',
    eyebrow:     'Een nulmeting voor je transitie',
    title:       'Peri-Compass',
    intro:       'Een eenmalige assessment van 15 minuten. Daarna weet je waar je staat op zes dimensies, krijg je drie hypothesen die je antwoorden verklaren, en een eerste experiment voor de komende 30 dagen.',
    cta:         'Start je Compass →',
    ctaSub:      '~15 minuten · anoniem starten · e-mail pas bij resultaten',
    whatHeading: 'Wat krijg je terug',
    feat: [
      { num: '01', title: 'Score op 6 dimensies',  body: 'Symptomen · slaap · energie · stress · leefstijl · zelfkennis. Met radar-grafiek zodat je in één blik ziet waar je zit.' },
      { num: '02', title: 'Drie hypothesen',        body: 'Wat verklaart wat je ervaart? Drie geformuleerde hypothesen op basis van je antwoorden. Geen diagnose — startpunten voor zelfregie.' },
      { num: '03', title: 'Eerste experiment',      body: 'Eén concreet experiment voor de komende 30 dagen. Niet meer dan 5 min/dag. Iets dat zich in de Cycle app laat tracken.' },
    ],
    forWhomHeading: 'Voor wie?',
    forWhom: [
      { strong: 'Hoofddoelgroep:', text: 'vrouwen van 40-55 die perimenopauze ervaren — vermoed of vastgesteld — en hun lichaam beter willen begrijpen.' },
      { strong: 'Tweede groep:',   text: 'vrouwen met regelmatige cyclus die patronen rond hun cyclus willen leren herkennen.' },
      { strong: 'Voor wie geschikt:', text: 'mensen die bereid zijn 60 seconden per dag in een check-in te steken. Niet voor wie alleen een "test" wil zonder vervolg.' },
    ],
    notHeading: 'Wat dit niet is',
    notList: [
      'Geen medische diagnose. We schrijven niets voor en stellen geen toestand vast.',
      'Geen vervanging voor je huisarts of menopauze-arts.',
      'Geen therapeutische ruimte. Voor zware mentale klachten: zoek persoonlijke begeleiding.',
      'Geen dataverkoop — je antwoorden blijven privé en zijn alleen toegankelijk voor jou en Mark de Kock (eigenaar).',
    ],
    finalLine: 'Klaar voor je nulmeting?',
  },
  en: {
    metaTitle:   'Peri-Compass — a baseline before you start daily tracking',
    metaDesc:    'A one-time 15-minute assessment. Get your baseline score across 6 dimensions, three hypotheses for what you observe, and a first experiment for the next 30 days.',
    eyebrow:     'A baseline for your transition',
    title:       'Peri-Compass',
    intro:       'A one-time 15-minute assessment. Afterwards you know where you stand on six dimensions, get three hypotheses that explain your answers, and a first experiment for the next 30 days.',
    cta:         'Start your Compass →',
    ctaSub:      '~15 minutes · start anonymously · email only at results',
    whatHeading: 'What you get back',
    feat: [
      { num: '01', title: 'Score on 6 dimensions', body: 'Symptoms · sleep · energy · stress · lifestyle · self-knowledge. With a radar chart so you see at a glance where you stand.' },
      { num: '02', title: 'Three hypotheses',      body: 'What explains what you experience? Three formulated hypotheses based on your answers. Not a diagnosis — starting points for self-direction.' },
      { num: '03', title: 'First experiment',      body: 'One concrete experiment for the next 30 days. No more than 5 min/day. Something that fits in the Cycle app.' },
    ],
    forWhomHeading: 'For whom?',
    forWhom: [
      { strong: 'Primary audience:', text: 'women aged 40-55 experiencing perimenopause — suspected or confirmed — who want to better understand their body.' },
      { strong: 'Secondary group:',  text: 'women with a regular cycle who want to learn to recognise patterns around their cycle.' },
      { strong: 'Best fit:',         text: 'people willing to spend 60 seconds a day on a check-in. Not for those who only want a "test" without follow-up.' },
    ],
    notHeading: 'What this is not',
    notList: [
      'No medical diagnosis. We do not prescribe or determine any condition.',
      'No replacement for your GP or menopause specialist.',
      'No therapeutic space. For serious mental health concerns: seek personal support.',
      'No data sales — your answers remain private and accessible only to you and Mark de Kock (owner).',
    ],
    finalLine: 'Ready for your baseline?',
  },
  fr: {
    metaTitle:   'Peri-Compass — un point de départ avant le suivi quotidien',
    metaDesc:    'Un questionnaire unique de 15 minutes. Obtenez votre score de référence sur 6 dimensions, trois hypothèses pour ce que vous observez, et une première expérimentation pour les 30 prochains jours.',
    eyebrow:     'Un point de départ pour votre transition',
    title:       'Peri-Compass',
    intro:       'Un questionnaire unique de 15 minutes. Vous saurez où vous en êtes sur six dimensions, vous recevrez trois hypothèses qui expliquent vos réponses, et une première expérimentation pour les 30 prochains jours.',
    cta:         'Commencer votre Compass →',
    ctaSub:      '~15 minutes · démarrer anonymement · e-mail uniquement aux résultats',
    whatHeading: 'Ce que vous recevez',
    feat: [
      { num: '01', title: 'Score sur 6 dimensions', body: 'Symptômes · sommeil · énergie · stress · mode de vie · connaissance de soi. Avec un graphique radar pour visualiser en un coup d\'œil.' },
      { num: '02', title: 'Trois hypothèses',       body: 'Qu\'est-ce qui explique ce que vous vivez ? Trois hypothèses formulées à partir de vos réponses. Pas un diagnostic — des points de départ pour l\'autonomie.' },
      { num: '03', title: 'Première expérimentation', body: 'Une expérimentation concrète pour les 30 prochains jours. Pas plus de 5 min/jour. Quelque chose qui s\'intègre dans l\'app Cycle.' },
    ],
    forWhomHeading: 'Pour qui ?',
    forWhom: [
      { strong: 'Public principal :',   text: 'femmes de 40-55 ans qui vivent la périménopause — suspectée ou confirmée — et veulent mieux comprendre leur corps.' },
      { strong: 'Groupe secondaire :',  text: 'femmes au cycle régulier qui veulent apprendre à reconnaître les schémas autour de leur cycle.' },
      { strong: 'Idéal pour :',         text: 'personnes prêtes à consacrer 60 secondes par jour à un check-in. Pas pour celles qui veulent juste un "test" sans suite.' },
    ],
    notHeading: 'Ce que ce n\'est pas',
    notList: [
      'Pas un diagnostic médical. Nous ne prescrivons rien et n\'établissons aucun état.',
      'Pas un substitut à votre médecin généraliste ou spécialiste de la ménopause.',
      'Pas un espace thérapeutique. Pour des troubles mentaux sérieux : cherchez un accompagnement personnel.',
      'Pas de vente de données — vos réponses restent privées et accessibles uniquement à vous et à Mark de Kock (propriétaire).',
    ],
    finalLine: 'Prête pour votre point de départ ?',
  },
  de: {
    metaTitle:   'Peri-Compass — eine Standortbestimmung vor dem täglichen Tracking',
    metaDesc:    'Ein einmaliger 15-Minuten-Fragebogen. Erhalte deinen Ausgangswert auf 6 Dimensionen, drei Hypothesen für das, was du beobachtest, und ein erstes Experiment für die nächsten 30 Tage.',
    eyebrow:     'Eine Standortbestimmung für deine Transition',
    title:       'Peri-Compass',
    intro:       'Ein einmaliger 15-Minuten-Fragebogen. Danach weisst du, wo du auf sechs Dimensionen stehst, bekommst drei Hypothesen, die deine Antworten erklären, und ein erstes Experiment für die nächsten 30 Tage.',
    cta:         'Starte deinen Compass →',
    ctaSub:      '~15 Minuten · anonym starten · E-Mail erst bei den Ergebnissen',
    whatHeading: 'Was du zurückbekommst',
    feat: [
      { num: '01', title: 'Score auf 6 Dimensionen', body: 'Symptome · Schlaf · Energie · Stress · Lebensstil · Selbstkenntnis. Mit Radar-Diagramm, damit du auf einen Blick siehst, wo du stehst.' },
      { num: '02', title: 'Drei Hypothesen',          body: 'Was erklärt, was du erlebst? Drei formulierte Hypothesen auf Basis deiner Antworten. Keine Diagnose — Ausgangspunkte für Selbstregie.' },
      { num: '03', title: 'Erstes Experiment',        body: 'Ein konkretes Experiment für die nächsten 30 Tage. Nicht mehr als 5 Min./Tag. Etwas, das in die Cycle-App passt.' },
    ],
    forWhomHeading: 'Für wen?',
    forWhom: [
      { strong: 'Hauptzielgruppe:',  text: 'Frauen zwischen 40 und 55, die Perimenopause erleben — vermutet oder bestätigt — und ihren Körper besser verstehen wollen.' },
      { strong: 'Zweite Gruppe:',    text: 'Frauen mit regelmässigem Zyklus, die Muster rund um ihren Zyklus besser kennenlernen wollen.' },
      { strong: 'Geeignet für:',     text: 'Menschen, die bereit sind, 60 Sekunden pro Tag in einen Check-in zu investieren. Nicht für jene, die nur einen "Test" ohne Folgen wollen.' },
    ],
    notHeading: 'Was das nicht ist',
    notList: [
      'Keine medizinische Diagnose. Wir verschreiben nichts und stellen keinen Zustand fest.',
      'Kein Ersatz für deinen Hausarzt oder Menopause-Spezialisten.',
      'Kein therapeutischer Raum. Bei schweren mentalen Beschwerden: persönliche Begleitung suchen.',
      'Kein Datenverkauf — deine Antworten bleiben privat und sind nur für dich und Mark de Kock (Eigentümer) zugänglich.',
    ],
    finalLine: 'Bereit für deine Standortbestimmung?',
  },
}

// ── Stepper UI ──────────────────────────────────────────────────────────────
export const STEPPER: Record<Lang, {
  loading:       string
  back:          string
  nextDefault:   string
  nextLast:      string
  toResults:     string
  skip:          string
  myResults:     string
  errRequired:   string
  errEmail:      string
  errNetwork:    string
  errConsent:    string
  submitting1:   string
  submitting2:   string
  firstQuestion: string
  almostDone:    string
  leadHeading:   string
  leadIntro:     string
  emailLabel:    string
  emailPlaceholder: string
  consentText:   string
}> = {
  nl: {
    loading:        'Laden…',
    back:           '← Vorige',
    nextDefault:    'Volgende →',
    nextLast:       'Naar resultaten →',
    toResults:      'Naar resultaten →',
    skip:           'Sla over (anoniem afronden)',
    myResults:      'Mijn resultaten →',
    errRequired:    'Deze vraag is verplicht. Selecteer of vul iets in.',
    errEmail:       'Ongeldig e-mailadres.',
    errNetwork:     'Netwerkfout — probeer opnieuw.',
    errConsent:     'Vink het AVG-vakje aan om je resultaten per mail te ontvangen.',
    submitting1:    'Even geduld…',
    submitting2:    'Je resultaat wordt berekend en Claude formuleert je hypothesen. Dit kan 30-60 seconden duren.',
    firstQuestion:  'Eerste vraag',
    almostDone:     'Bijna klaar',
    leadHeading:    'Waar mogen we je resultaten heen sturen?',
    leadIntro:      'Vul je e-mail in om een samenvatting te ontvangen en de Cycle app te kunnen gebruiken voor dagelijkse tracking. Sla over voor anoniem afronden — je krijgt je resultaat dan alleen op het scherm.',
    emailLabel:     'E-mail (optioneel)',
    emailPlaceholder:'naam@bedrijf.nl',
    consentText:    'Ik ga akkoord met het privacybeleid en het ontvangen van mijn Compass-resultaten per e-mail.',
  },
  en: {
    loading:        'Loading…',
    back:           '← Back',
    nextDefault:    'Next →',
    nextLast:       'To results →',
    toResults:      'To results →',
    skip:           'Skip (finish anonymously)',
    myResults:      'My results →',
    errRequired:    'This question is required. Select or enter a value.',
    errEmail:       'Invalid email.',
    errNetwork:     'Network error — please try again.',
    errConsent:     'Tick the GDPR box to receive your results by email.',
    submitting1:    'One moment…',
    submitting2:    'Your result is being calculated and Claude is formulating your hypotheses. This may take 30-60 seconds.',
    firstQuestion:  'First question',
    almostDone:     'Almost done',
    leadHeading:    'Where shall we send your results?',
    leadIntro:      'Enter your email to receive a summary and to be able to use the Cycle app for daily tracking. Skip to finish anonymously — you\'ll only get your result on screen.',
    emailLabel:     'Email (optional)',
    emailPlaceholder:'name@company.com',
    consentText:    'I agree with the privacy policy and to receive my Compass results by email.',
  },
  fr: {
    loading:        'Chargement…',
    back:           '← Précédent',
    nextDefault:    'Suivant →',
    nextLast:       'Aux résultats →',
    toResults:      'Aux résultats →',
    skip:           'Passer (finir anonymement)',
    myResults:      'Mes résultats →',
    errRequired:    'Cette question est obligatoire. Sélectionnez ou saisissez une valeur.',
    errEmail:       'E-mail invalide.',
    errNetwork:     'Erreur réseau — réessayez.',
    errConsent:     'Cochez la case RGPD pour recevoir vos résultats par e-mail.',
    submitting1:    'Un instant…',
    submitting2:    'Votre résultat est en cours de calcul et Claude formule vos hypothèses. Cela peut prendre 30 à 60 secondes.',
    firstQuestion:  'Première question',
    almostDone:     'Presque terminé',
    leadHeading:    'Où devons-nous envoyer vos résultats ?',
    leadIntro:      'Entrez votre e-mail pour recevoir un résumé et pouvoir utiliser l\'app Cycle pour le suivi quotidien. Passez pour finir anonymement — vous n\'aurez votre résultat qu\'à l\'écran.',
    emailLabel:     'E-mail (optionnel)',
    emailPlaceholder:'nom@entreprise.fr',
    consentText:    'J\'accepte la politique de confidentialité et de recevoir mes résultats Compass par e-mail.',
  },
  de: {
    loading:        'Lädt…',
    back:           '← Zurück',
    nextDefault:    'Weiter →',
    nextLast:       'Zu den Ergebnissen →',
    toResults:      'Zu den Ergebnissen →',
    skip:           'Überspringen (anonym abschliessen)',
    myResults:      'Meine Ergebnisse →',
    errRequired:    'Diese Frage ist erforderlich. Wähle oder gib einen Wert ein.',
    errEmail:       'Ungültige E-Mail.',
    errNetwork:     'Netzwerkfehler — bitte erneut versuchen.',
    errConsent:     'Aktiviere das DSGVO-Häkchen, um deine Ergebnisse per E-Mail zu erhalten.',
    submitting1:    'Einen Moment…',
    submitting2:    'Dein Ergebnis wird berechnet und Claude formuliert deine Hypothesen. Das kann 30-60 Sekunden dauern.',
    firstQuestion:  'Erste Frage',
    almostDone:     'Fast geschafft',
    leadHeading:    'Wohin sollen wir deine Ergebnisse senden?',
    leadIntro:      'Trage deine E-Mail ein, um eine Zusammenfassung zu erhalten und die Cycle-App für tägliches Tracking zu nutzen. Überspringe für anonymen Abschluss — du bekommst dein Ergebnis dann nur auf dem Bildschirm.',
    emailLabel:     'E-Mail (optional)',
    emailPlaceholder:'name@firma.de',
    consentText:    'Ich akzeptiere die Datenschutzerklärung und den Empfang meiner Compass-Ergebnisse per E-Mail.',
  },
}

// ── Results page UI ─────────────────────────────────────────────────────────
export const RESULTS: Record<Lang, {
  eyebrow:           string
  greetingFallback:  string
  perDimension:      string
  whatISee:          string
  threeHypotheses:   string
  hypothesisDisclaimer: string
  experimentEyebrow: string
  recommendedHeading:string
  recSymptoms:       string
  recFields:         string
  recHint:           string
  ctaHeading:        string
  ctaBody:           string
  ctaButton:         string
  ctaNote:           string
  bookmarkHint:      string
  ageLabel:          string
  hrtLabel:          string
}> = {
  nl: {
    eyebrow:              'Je Peri-Compass',
    greetingFallback:     'Je nulmeting',
    perDimension:         'Per dimensie',
    whatISee:             'Wat ik zie',
    threeHypotheses:      'Drie hypothesen',
    hypothesisDisclaimer: 'Hypothesen — geen diagnose. Voor medische vragen: huisarts of menopauze-arts.',
    experimentEyebrow:    'Eerste experiment · 30 dagen',
    recommendedHeading:   'Wat we voor jou voorstellen om te tracken',
    recSymptoms:          'Symptomen',
    recFields:            'Velden',
    recHint:              'Deze voorstellen worden gebruikt om je daily check-in scherm te personaliseren zodra je begint met tracken.',
    ctaHeading:           'Klaar om te beginnen?',
    ctaBody:              'Met daily check-ins van 60 seconden bouw je in 4-12 weken een patronen-overzicht dat geen enkele app je in één moment kan geven.',
    ctaButton:            'Start dagelijkse tracking →',
    ctaNote:              'Voor toegang tot de Cycle app heb je een account nodig.',
    bookmarkHint:         'Bewaar deze pagina — de URL is uniek voor jou en blijft bereikbaar.',
    ageLabel:             'leeftijd',
    hrtLabel:             'HRT',
  },
  en: {
    eyebrow:              'Your Peri-Compass',
    greetingFallback:     'Your baseline',
    perDimension:         'Per dimension',
    whatISee:             'What I see',
    threeHypotheses:      'Three hypotheses',
    hypothesisDisclaimer: 'Hypotheses — not a diagnosis. For medical questions: GP or menopause specialist.',
    experimentEyebrow:    'First experiment · 30 days',
    recommendedHeading:   'What we suggest you track',
    recSymptoms:          'Symptoms',
    recFields:            'Fields',
    recHint:              'These suggestions personalise your daily check-in screen once you start tracking.',
    ctaHeading:           'Ready to begin?',
    ctaBody:              'With 60-second daily check-ins you build a 4-12 week pattern overview that no single-moment app can give you.',
    ctaButton:            'Start daily tracking →',
    ctaNote:              'You need an account to access the Cycle app.',
    bookmarkHint:         'Bookmark this page — the URL is unique to you and stays accessible.',
    ageLabel:             'age',
    hrtLabel:             'HRT',
  },
  fr: {
    eyebrow:              'Votre Peri-Compass',
    greetingFallback:     'Votre point de départ',
    perDimension:         'Par dimension',
    whatISee:             'Ce que je vois',
    threeHypotheses:      'Trois hypothèses',
    hypothesisDisclaimer: 'Hypothèses — pas un diagnostic. Pour des questions médicales : médecin ou spécialiste de la ménopause.',
    experimentEyebrow:    'Première expérimentation · 30 jours',
    recommendedHeading:   'Ce que nous vous proposons de suivre',
    recSymptoms:          'Symptômes',
    recFields:            'Champs',
    recHint:              'Ces suggestions personnalisent votre écran de check-in quotidien dès que vous commencez le suivi.',
    ctaHeading:           'Prête à commencer ?',
    ctaBody:              'Avec des check-ins quotidiens de 60 secondes, vous construisez en 4-12 semaines un aperçu des schémas qu\'aucune app ponctuelle ne peut vous donner.',
    ctaButton:            'Démarrer le suivi quotidien →',
    ctaNote:              'Vous avez besoin d\'un compte pour accéder à l\'app Cycle.',
    bookmarkHint:         'Enregistrez cette page — l\'URL est unique pour vous et reste accessible.',
    ageLabel:             'âge',
    hrtLabel:             'THS',
  },
  de: {
    eyebrow:              'Dein Peri-Compass',
    greetingFallback:     'Deine Standortbestimmung',
    perDimension:         'Pro Dimension',
    whatISee:             'Was ich sehe',
    threeHypotheses:      'Drei Hypothesen',
    hypothesisDisclaimer: 'Hypothesen — keine Diagnose. Für medizinische Fragen: Hausarzt oder Menopause-Spezialist.',
    experimentEyebrow:    'Erstes Experiment · 30 Tage',
    recommendedHeading:   'Was wir dir zum Tracken vorschlagen',
    recSymptoms:          'Symptome',
    recFields:            'Felder',
    recHint:              'Diese Vorschläge personalisieren deinen täglichen Check-in-Bildschirm, sobald du mit dem Tracking beginnst.',
    ctaHeading:           'Bereit anzufangen?',
    ctaBody:              'Mit täglichen 60-Sekunden-Check-ins baust du in 4-12 Wochen einen Mustern-Überblick auf, den dir keine Einzelmoment-App geben kann.',
    ctaButton:            'Tägliches Tracking starten →',
    ctaNote:              'Für den Zugriff auf die Cycle-App brauchst du ein Konto.',
    bookmarkHint:         'Speichere diese Seite — die URL ist für dich einzigartig und bleibt erreichbar.',
    ageLabel:             'Alter',
    hrtLabel:             'HRT',
  },
}

// ── Stage labels (gebruikt op landing/result/admin) ─────────────────────────
export const STAGE_LABELS: Record<Lang, Record<string, string>> = {
  nl: {
    regular_cycle:           'Regelmatige cyclus',
    irregular_cycle:         'Onregelmatige cyclus / vermoedelijk perimenopauze',
    perimenopause_diagnosed: 'Perimenopauze (vastgesteld)',
    postmenopause:           'Postmenopauze',
    unknown:                 'Cyclus-stadium onbekend',
  },
  en: {
    regular_cycle:           'Regular cycle',
    irregular_cycle:         'Irregular cycle / suspected perimenopause',
    perimenopause_diagnosed: 'Perimenopause (diagnosed)',
    postmenopause:           'Postmenopause',
    unknown:                 'Cycle stage unknown',
  },
  fr: {
    regular_cycle:           'Cycle régulier',
    irregular_cycle:         'Cycle irrégulier / périménopause suspectée',
    perimenopause_diagnosed: 'Périménopause (diagnostiquée)',
    postmenopause:           'Post-ménopause',
    unknown:                 'Stade du cycle inconnu',
  },
  de: {
    regular_cycle:           'Regelmässiger Zyklus',
    irregular_cycle:         'Unregelmässiger Zyklus / vermutete Perimenopause',
    perimenopause_diagnosed: 'Perimenopause (diagnostiziert)',
    postmenopause:           'Postmenopause',
    unknown:                 'Zyklus-Stadium unbekannt',
  },
}

// ── Field labels for recommended tracking ───────────────────────────────────
export const FIELD_LABELS: Record<Lang, Record<string, string>> = {
  nl: { sleep: 'Slaap',     mood: 'Stemming', stress: 'Stress', energy: 'Energie', hrt_taken: 'HRT-compliance', alcohol: 'Alcohol', busy_day: 'Drukke dag',  activity: 'Beweging',  nap: 'Dutje' },
  en: { sleep: 'Sleep',     mood: 'Mood',     stress: 'Stress', energy: 'Energy',  hrt_taken: 'HRT compliance', alcohol: 'Alcohol', busy_day: 'Busy day',    activity: 'Activity',  nap: 'Nap'   },
  fr: { sleep: 'Sommeil',   mood: 'Humeur',   stress: 'Stress', energy: 'Énergie', hrt_taken: 'Observance THS', alcohol: 'Alcool',  busy_day: 'Journée chargée', activity: 'Activité', nap: 'Sieste' },
  de: { sleep: 'Schlaf',    mood: 'Stimmung', stress: 'Stress', energy: 'Energie', hrt_taken: 'HRT-Einnahme',   alcohol: 'Alkohol', busy_day: 'Voller Tag',  activity: 'Bewegung',  nap: 'Nickerchen' },
}
