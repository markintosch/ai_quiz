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
    metaTitle:   'Perimenopause Compass — een nulmeting voor je dagelijkse tracking',
    metaDesc:    'Een eenmalige instap-assessment van 15 minuten. Krijg je baseline-score op 6 dimensies, drie hypothesen voor wat je ziet en een eerste experiment voor de komende 30 dagen.',
    eyebrow:     'Een nulmeting voor je transitie',
    title:       'Perimenopause Compass',
    intro:       'Voelt je energie, slaap of stemming ineens minder voorspelbaar? Met één nulmeting van ~15 minuten krijg je inzicht in je belangrijkste patronen én een praktisch experiment voor de komende 30 dagen.',
    cta:         'Start je Compass →',
    ctaSub:      '~15 minuten · anoniem starten · e-mail pas bij resultaten',
    whatHeading: 'Wat krijg je terug',
    feat: [
      { num: '01', title: 'Score op 6 dimensies',  body: 'Symptomen · slaap · energie · stress · leefstijl · zelfkennis. Met radar-grafiek zodat je in één blik ziet waar je zit.' },
      { num: '02', title: 'Drie hypothesen',        body: 'Wat verklaart wat je ervaart? Drie geformuleerde hypothesen op basis van je antwoorden. Geen diagnose — startpunten voor zelfregie.' },
      { num: '03', title: 'Een evidence-based experiment', body: 'Eén concreet experiment voor 30 dagen, gekozen uit erkende menopauze-richtlijnen (NAMS, NICE, IMS, NHS). Met expliciete bronvermelding.' },
      { num: '04', title: 'Een logboek voor je arts', body: 'Het experiment log je in de Cycle app. Na 4 weken heb je objectieve data om mee te nemen naar je huisarts of menopauze-arts.' },
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
      'Geen dataverkoop. Het platform en je antwoorden worden beheerd door Brand PWRD Media — zie het privacybeleid voor details.',
    ],
    finalLine: 'Klaar voor je nulmeting?',
  },
  en: {
    metaTitle:   'Perimenopause Compass — a baseline before you start daily tracking',
    metaDesc:    'A one-time 15-minute assessment. Get your baseline score across 6 dimensions, three hypotheses for what you observe, and a first experiment for the next 30 days.',
    eyebrow:     'A baseline for your transition',
    title:       'Perimenopause Compass',
    intro:       'Does your energy, sleep or mood feel suddenly less predictable? A one-time ~15-minute baseline gives you insight into your key patterns and a practical experiment for the next 30 days.',
    cta:         'Start your Compass →',
    ctaSub:      '~15 minutes · start anonymously · email only at results',
    whatHeading: 'What you get back',
    feat: [
      { num: '01', title: 'Score on 6 dimensions', body: 'Symptoms · sleep · energy · stress · lifestyle · self-knowledge. With a radar chart so you see at a glance where you stand.' },
      { num: '02', title: 'Three hypotheses',      body: 'What explains what you experience? Three formulated hypotheses based on your answers. Not a diagnosis — starting points for self-direction.' },
      { num: '03', title: 'An evidence-based experiment', body: 'One concrete experiment for 30 days, chosen from recognised menopause guidelines (NAMS, NICE, IMS, NHS). Source attribution included.' },
      { num: '04', title: 'A logbook for your doctor', body: 'You track the experiment in the Cycle app. After 4 weeks you have objective data to bring to your GP or menopause specialist.' },
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
      'No data sales. The platform and your answers are managed by Brand PWRD Media — see the privacy policy for details.',
    ],
    finalLine: 'Ready for your baseline?',
  },
  fr: {
    metaTitle:   'Perimenopause Compass — un point de départ avant le suivi quotidien',
    metaDesc:    'Un questionnaire unique de 15 minutes. Obtenez votre score de référence sur 6 dimensions, trois hypothèses pour ce que vous observez, et une première expérimentation pour les 30 prochains jours.',
    eyebrow:     'Un point de départ pour votre transition',
    title:       'Perimenopause Compass',
    intro:       'Votre énergie, votre sommeil ou votre humeur semblent soudainement moins prévisibles ? Un questionnaire unique de ~15 minutes vous donne un aperçu de vos schémas clés et une expérimentation pratique pour les 30 prochains jours.',
    cta:         'Commencer votre Compass →',
    ctaSub:      '~15 minutes · démarrer anonymement · e-mail uniquement aux résultats',
    whatHeading: 'Ce que vous recevez',
    feat: [
      { num: '01', title: 'Score sur 6 dimensions', body: 'Symptômes · sommeil · énergie · stress · mode de vie · connaissance de soi. Avec un graphique radar pour visualiser en un coup d\'œil.' },
      { num: '02', title: 'Trois hypothèses',       body: 'Qu\'est-ce qui explique ce que vous vivez ? Trois hypothèses formulées à partir de vos réponses. Pas un diagnostic — des points de départ pour l\'autonomie.' },
      { num: '03', title: 'Une expérimentation evidence-based', body: 'Une expérimentation concrète pour 30 jours, choisie dans des recommandations menopause reconnues (NAMS, NICE, IMS, NHS). Source citée explicitement.' },
      { num: '04', title: 'Un journal pour votre médecin', body: 'Vous suivez l\'expérimentation dans l\'app Cycle. Après 4 semaines, vous avez des données objectives à apporter à votre médecin ou spécialiste de la ménopause.' },
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
      'Pas de vente de données. La plateforme et vos réponses sont gérées par Brand PWRD Media — voir la politique de confidentialité pour plus de détails.',
    ],
    finalLine: 'Prête pour votre point de départ ?',
  },
  de: {
    metaTitle:   'Perimenopause Compass — eine Standortbestimmung vor dem täglichen Tracking',
    metaDesc:    'Ein einmaliger 15-Minuten-Fragebogen. Erhalte deinen Ausgangswert auf 6 Dimensionen, drei Hypothesen für das, was du beobachtest, und ein erstes Experiment für die nächsten 30 Tage.',
    eyebrow:     'Eine Standortbestimmung für deine Transition',
    title:       'Perimenopause Compass',
    intro:       'Fühlt sich deine Energie, dein Schlaf oder deine Stimmung plötzlich weniger vorhersehbar an? Ein einmaliger ~15-Minuten-Fragebogen gibt dir Einblick in deine wichtigsten Muster und ein praktisches Experiment für die nächsten 30 Tage.',
    cta:         'Starte deinen Compass →',
    ctaSub:      '~15 Minuten · anonym starten · E-Mail erst bei den Ergebnissen',
    whatHeading: 'Was du zurückbekommst',
    feat: [
      { num: '01', title: 'Score auf 6 Dimensionen', body: 'Symptome · Schlaf · Energie · Stress · Lebensstil · Selbstkenntnis. Mit Radar-Diagramm, damit du auf einen Blick siehst, wo du stehst.' },
      { num: '02', title: 'Drei Hypothesen',          body: 'Was erklärt, was du erlebst? Drei formulierte Hypothesen auf Basis deiner Antworten. Keine Diagnose — Ausgangspunkte für Selbstregie.' },
      { num: '03', title: 'Ein evidenzbasiertes Experiment', body: 'Ein konkretes Experiment für 30 Tage, ausgewählt aus anerkannten Menopause-Leitlinien (NAMS, NICE, IMS, NHS). Mit expliziter Quellenangabe.' },
      { num: '04', title: 'Ein Logbuch für deinen Arzt', body: 'Du trackst das Experiment in der Cycle-App. Nach 4 Wochen hast du objektive Daten, die du zu deinem Hausarzt oder Menopause-Spezialisten mitnehmen kannst.' },
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
      'Kein Datenverkauf. Plattform und deine Antworten werden von Brand PWRD Media verwaltet — Details in der Datenschutzerklärung.',
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
  backToCompass:     string
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
  cycleAppExplain:   string
  bookmarkHint:      string
  bookmarkSecurity:  string
  sourceLabel:       string
  evidenceFooter:    string
  logbookHeading:    string
  logbookBody:       string
  logbookCta:        string
  copyLink:          string
  copyLinkDone:      string
  emailMeResults:    string
  emailLabel:        string
  emailPlaceholder:  string
  emailConsentText:  string
  emailSendBtn:      string
  emailSending:      string
  emailSentOk:       string
  emailSentErr:      string
  ageLabel:          string
  hrtLabel:          string
  /** Sectie tussen score-card en dimensie-bars: dominante dimensie als focus */
  topLeverHeading:   string
  topLeverFor:       Record<string, string>      // dimension code → korte uitleg
  meaningHeading:    string                       // 'Wat dit kan betekenen' subkop
  whyExperimentLabel:string                       // 'Waarom dit experiment?'
  startCheckinCta:   string                       // Lagere-drempel CTA
  startCheckinSub:   string                       // '60 sec/dag, kun altijd stoppen'
}> = {
  nl: {
    eyebrow:              'Je Peri-Compass',
    greetingFallback:     'Je nulmeting',
    backToCompass:        '← Terug naar uitleg',
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
    ctaButton:            'Maak je Cycle-account aan →',
    ctaNote:              'Cycle is de tracking-app — een 60-seconden check-in per dag, met je Compass als startpunt. Klikken brengt je naar de inlogpagina; je krijgt een magic link in je inbox.',
    cycleAppExplain:      'Cycle is je dagelijkse logboek: één scherm, ~60 seconden per dag — slaap, energie, stemming, symptomen die voor jou tellen. Met je Compass als nulmeting zie je na 4-12 weken patronen die met geheugen alleen niet opvallen.',
    bookmarkHint:         'Bewaar deze pagina — de URL is uniek voor jou en blijft bereikbaar.',
    bookmarkSecurity:     'De link bevat een willekeurig ID en is niet te raden. Deel \'m alleen met wie je vertrouwt. Anonieme afnames blijven 12 maanden bewaard, daarna automatisch verwijderd.',
    sourceLabel:          'Bron',
    evidenceFooter:       'Alle voorgestelde experimenten zijn gekozen uit erkende menopauze-richtlijnen (NAMS, NICE, IMS, NHS, AASM, ACSM, WHO). Specifieke bron staat onder elk experiment.',
    logbookHeading:       'Logboek voor je arts',
    logbookBody:          'Track dit experiment 30 dagen lang in de Cycle app — slaap, energie, stemming en symptomen. Daarna heb je objectieve data om mee te nemen naar je huisarts of menopauze-arts. Concrete data versnelt het gesprek over behandelopties.',
    logbookCta:           'Begin met loggen in Cycle →',
    copyLink:             '🔗 Kopieer link',
    copyLinkDone:         '✓ Gekopieerd',
    emailMeResults:       'Stuur me dit per e-mail',
    emailLabel:           'Je e-mailadres',
    emailPlaceholder:     'naam@bedrijf.nl',
    emailConsentText:     'Ik ga akkoord met het privacybeleid en het ontvangen van mijn Compass-resultaten per e-mail.',
    emailSendBtn:         'Verstuur',
    emailSending:         'Versturen…',
    emailSentOk:          'Verstuurd! Check je inbox over een minuutje.',
    emailSentErr:         'Er ging iets mis. Probeer het zo opnieuw.',
    ageLabel:             'leeftijd',
    hrtLabel:             'HRT',
    topLeverHeading:      'Je grootste hefboom nu',
    topLeverFor: {
      symptom_burden:  'Je symptomen vragen het meest aandacht. Begin daar — kleine afkoeling-, ademhaling- of vermijdings-experimenten kunnen snel verschil maken.',
      sleep_recovery:  'Je herstel staat onder druk. Slaap is meestal de hoeksteen — als die rust krijgt, volgen energie en stemming vaak vanzelf.',
      energy_capacity: 'Je energie zakt eerder weg dan je zou willen. Vaak heeft dat te maken met slaap, daglicht of recoverytijd na drukke dagen.',
      stress_context:  'Je systeem staat onder druk van buitenaf. Een dagelijkse rust-anker (5 min) kan het meest opleveren voor wat verder ook speelt.',
      lifestyle:       'Hier zit nog ongebruikte ruimte. Eén kleine, herhaalbare aanpassing (beweging, eiwit, alcoholvrije nachten) kan over weken stapelen.',
      self_awareness:  'Je hebt nog weinig zicht op je eigen patronen. Dat geeft de Compass juist ruimte: in 30 dagen zie je vaak meer dan in een jaar terugkijken.',
    },
    meaningHeading:       'Wat dit kan betekenen',
    whyExperimentLabel:   'Waarom dit experiment?',
    startCheckinCta:      'Start met je eerste check-in →',
    startCheckinSub:      '60 seconden per dag. Je kunt altijd stoppen.',
  },
  en: {
    eyebrow:              'Your Peri-Compass',
    greetingFallback:     'Your baseline',
    backToCompass:        '← Back to overview',
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
    ctaButton:            'Create your Cycle account →',
    ctaNote:              'Cycle is the tracking app — a 60-second daily check-in, with your Compass as starting point. Clicking takes you to the login page; you\'ll get a magic link in your inbox.',
    cycleAppExplain:      'Cycle is your daily log: one screen, ~60 seconds per day — sleep, energy, mood, the symptoms that matter to you. With your Compass as baseline you\'ll see patterns within 4-12 weeks that memory alone misses.',
    bookmarkHint:         'Bookmark this page — the URL is unique to you and stays accessible.',
    bookmarkSecurity:     'The link contains a random ID and cannot be guessed. Only share with people you trust. Anonymous results are kept for 12 months, then automatically deleted.',
    sourceLabel:          'Source',
    evidenceFooter:       'All suggested experiments are chosen from recognised menopause guidelines (NAMS, NICE, IMS, NHS, AASM, ACSM, WHO). Specific source listed under each experiment.',
    logbookHeading:       'Logbook for your doctor',
    logbookBody:          'Track this experiment for 30 days in the Cycle app — sleep, energy, mood, symptoms. Then you have objective data to bring to your GP or menopause specialist. Concrete data accelerates the treatment conversation.',
    logbookCta:           'Start logging in Cycle →',
    copyLink:             '🔗 Copy link',
    copyLinkDone:         '✓ Copied',
    emailMeResults:       'Email me a copy',
    emailLabel:           'Your email',
    emailPlaceholder:     'name@company.com',
    emailConsentText:     'I agree with the privacy policy and to receive my Compass results by email.',
    emailSendBtn:         'Send',
    emailSending:         'Sending…',
    emailSentOk:          'Sent! Check your inbox in a minute.',
    emailSentErr:         'Something went wrong. Please try again.',
    ageLabel:             'age',
    hrtLabel:             'HRT',
    topLeverHeading:      'Your biggest lever right now',
    topLeverFor: {
      symptom_burden:  'Your symptoms need the most attention. Start there — small cooling, breathing or trigger-avoidance experiments can make quick differences.',
      sleep_recovery:  'Your recovery is under pressure. Sleep is usually the cornerstone — when it gets rest, energy and mood often follow.',
      energy_capacity: 'Your energy fades faster than you\'d like. Often this connects to sleep, daylight, or recovery time after busy days.',
      stress_context:  'Your system is under external pressure. A daily 5-minute rest anchor often delivers most for whatever else is going on.',
      lifestyle:       'There\'s unused space here. One small repeatable change (movement, protein, alcohol-free nights) can compound over weeks.',
      self_awareness:  'You don\'t yet have much sight on your own patterns. That\'s exactly the Compass\'s opening: in 30 days you often see more than in a year of looking back.',
    },
    meaningHeading:       'What this might mean',
    whyExperimentLabel:   'Why this experiment?',
    startCheckinCta:      'Start with your first check-in →',
    startCheckinSub:      '60 seconds per day. You can stop any time.',
  },
  fr: {
    eyebrow:              'Votre Peri-Compass',
    greetingFallback:     'Votre point de départ',
    backToCompass:        '← Retour à la présentation',
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
    ctaButton:            'Créer votre compte Cycle →',
    ctaNote:              'Cycle est l\'app de suivi — un check-in quotidien de 60 secondes, avec votre Compass comme point de départ. Cliquer vous amène à la page de connexion ; vous recevrez un lien magique dans votre boîte mail.',
    cycleAppExplain:      'Cycle est votre carnet quotidien : un écran, ~60 secondes par jour — sommeil, énergie, humeur, les symptômes qui comptent pour vous. Avec votre Compass comme base, vous verrez en 4-12 semaines des schémas que la mémoire seule ne capte pas.',
    bookmarkHint:         'Enregistrez cette page — l\'URL est unique pour vous et reste accessible.',
    bookmarkSecurity:     'Le lien contient un ID aléatoire et ne peut être deviné. Ne partagez qu\'avec des personnes de confiance. Les résultats anonymes sont conservés 12 mois puis supprimés automatiquement.',
    sourceLabel:          'Source',
    evidenceFooter:       'Toutes les expérimentations proposées sont choisies dans des recommandations menopause reconnues (NAMS, NICE, IMS, NHS, AASM, ACSM, OMS). Source spécifique sous chaque expérimentation.',
    logbookHeading:       'Journal pour votre médecin',
    logbookBody:          'Suivez cette expérimentation 30 jours dans l\'app Cycle — sommeil, énergie, humeur, symptômes. Vous aurez ensuite des données objectives à apporter à votre médecin ou spécialiste de la ménopause. Les données concrètes accélèrent la discussion sur les traitements.',
    logbookCta:           'Commencer à journaliser dans Cycle →',
    copyLink:             '🔗 Copier le lien',
    copyLinkDone:         '✓ Copié',
    emailMeResults:       'M\'envoyer une copie par e-mail',
    emailLabel:           'Votre e-mail',
    emailPlaceholder:     'nom@entreprise.fr',
    emailConsentText:     'J\'accepte la politique de confidentialité et de recevoir mes résultats Compass par e-mail.',
    emailSendBtn:         'Envoyer',
    emailSending:         'Envoi…',
    emailSentOk:          'Envoyé ! Vérifiez votre boîte mail dans une minute.',
    emailSentErr:         'Une erreur s\'est produite. Réessayez.',
    ageLabel:             'âge',
    hrtLabel:             'THS',
    topLeverHeading:      'Votre principal levier actuel',
    topLeverFor: {
      symptom_burden:  'Vos symptômes demandent le plus d\'attention. Commencez là — de petites expérimentations de rafraîchissement, respiration ou évitement des déclencheurs font vite la différence.',
      sleep_recovery:  'Votre récupération est sous pression. Le sommeil est souvent la pierre angulaire — quand il se calme, l\'énergie et l\'humeur suivent.',
      energy_capacity: 'Votre énergie chute plus vite que vous ne le souhaiteriez. Cela tient souvent au sommeil, à la lumière du jour ou au temps de récupération après des journées chargées.',
      stress_context:  'Votre système subit une pression externe. Un ancrage de repos quotidien de 5 min peut faire le plus de différence pour tout le reste.',
      lifestyle:       'Il y a ici de l\'espace inexploité. Un petit changement répétable (mouvement, protéines, nuits sans alcool) peut s\'accumuler sur des semaines.',
      self_awareness:  'Vous n\'avez pas encore beaucoup de visibilité sur vos propres schémas. C\'est précisément l\'ouverture du Compass : en 30 jours, vous voyez souvent plus qu\'en un an de rétrospective.',
    },
    meaningHeading:       'Ce que cela peut signifier',
    whyExperimentLabel:   'Pourquoi cette expérimentation ?',
    startCheckinCta:      'Commencer par votre premier check-in →',
    startCheckinSub:      '60 secondes par jour. Vous pouvez arrêter à tout moment.',
  },
  de: {
    eyebrow:              'Dein Peri-Compass',
    greetingFallback:     'Deine Standortbestimmung',
    backToCompass:        '← Zurück zur Übersicht',
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
    ctaButton:            'Cycle-Konto erstellen →',
    ctaNote:              'Cycle ist die Tracking-App — ein 60-Sekunden-Check-in pro Tag, mit deinem Compass als Ausgangspunkt. Beim Klick landest du auf der Login-Seite; du bekommst einen Magic Link in dein Postfach.',
    cycleAppExplain:      'Cycle ist dein tägliches Logbuch: ein Bildschirm, ~60 Sekunden pro Tag — Schlaf, Energie, Stimmung, die Symptome, die für dich zählen. Mit deinem Compass als Basis siehst du in 4-12 Wochen Muster, die das Gedächtnis allein verpasst.',
    bookmarkHint:         'Speichere diese Seite — die URL ist für dich einzigartig und bleibt erreichbar.',
    bookmarkSecurity:     'Der Link enthält eine zufällige ID und kann nicht erraten werden. Teile ihn nur mit Personen, denen du vertraust. Anonyme Ergebnisse werden 12 Monate aufbewahrt und dann automatisch gelöscht.',
    sourceLabel:          'Quelle',
    evidenceFooter:       'Alle vorgeschlagenen Experimente sind aus anerkannten Menopause-Leitlinien gewählt (NAMS, NICE, IMS, NHS, AASM, ACSM, WHO). Spezifische Quelle unter jedem Experiment.',
    logbookHeading:       'Logbuch für deinen Arzt',
    logbookBody:          'Tracke dieses Experiment 30 Tage lang in der Cycle-App — Schlaf, Energie, Stimmung, Symptome. Danach hast du objektive Daten, die du zu deinem Hausarzt oder Menopause-Spezialisten mitnehmen kannst. Konkrete Daten beschleunigen das Gespräch über Behandlungsoptionen.',
    logbookCta:           'Beginne mit dem Logging in Cycle →',
    copyLink:             '🔗 Link kopieren',
    copyLinkDone:         '✓ Kopiert',
    emailMeResults:       'Per E-Mail senden',
    emailLabel:           'Deine E-Mail',
    emailPlaceholder:     'name@firma.de',
    emailConsentText:     'Ich akzeptiere die Datenschutzerklärung und den Empfang meiner Compass-Ergebnisse per E-Mail.',
    emailSendBtn:         'Senden',
    emailSending:         'Wird gesendet…',
    emailSentOk:          'Gesendet! Prüfe dein Postfach in einer Minute.',
    emailSentErr:         'Etwas ist schiefgegangen. Bitte erneut versuchen.',
    ageLabel:             'Alter',
    hrtLabel:             'HRT',
    topLeverHeading:      'Dein grösster Hebel jetzt',
    topLeverFor: {
      symptom_burden:  'Deine Symptome brauchen die meiste Aufmerksamkeit. Fang dort an — kleine Abkühlungs-, Atem- oder Trigger-Vermeidungs-Experimente können schnell einen Unterschied machen.',
      sleep_recovery:  'Deine Erholung steht unter Druck. Schlaf ist meist der Eckpfeiler — wenn er Ruhe bekommt, folgen Energie und Stimmung oft von selbst.',
      energy_capacity: 'Deine Energie sackt schneller ab als du möchtest. Oft hängt das mit Schlaf, Tageslicht oder Erholungszeit nach vollen Tagen zusammen.',
      stress_context:  'Dein System steht unter äusserem Druck. Ein täglicher 5-Minuten-Ruhe-Anker kann am meisten bringen für alles, was sonst noch spielt.',
      lifestyle:       'Hier liegt noch ungenutzter Raum. Eine kleine, wiederholbare Anpassung (Bewegung, Eiweiss, alkoholfreie Nächte) kann sich über Wochen aufstapeln.',
      self_awareness:  'Du hast noch wenig Blick auf deine eigenen Muster. Das ist genau die Öffnung des Compass: in 30 Tagen siehst du oft mehr als in einem Jahr Rückblick.',
    },
    meaningHeading:       'Was das bedeuten kann',
    whyExperimentLabel:   'Warum dieses Experiment?',
    startCheckinCta:      'Starte mit deinem ersten Check-in →',
    startCheckinSub:      '60 Sekunden pro Tag. Du kannst jederzeit aufhören.',
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

// ── HRT-status labels (zoals getoond op results page) ───────────────────────
export const HRT_STATUS_LABELS: Record<Lang, Record<string, string>> = {
  nl: { none: 'geen',           considering: 'overweegt',     using: 'in gebruik',  stopped: 'gestopt',  prefer_not_say: 'niet opgegeven' },
  en: { none: 'no',             considering: 'considering',   using: 'using',       stopped: 'stopped',  prefer_not_say: 'not disclosed'   },
  fr: { none: 'aucun',          considering: 'envisagé',      using: 'en cours',    stopped: 'arrêté',   prefer_not_say: 'non précisé'     },
  de: { none: 'keine',          considering: 'erwägt',        using: 'in Anwendung',stopped: 'beendet',  prefer_not_say: 'nicht angegeben' },
}
