/**
 * Nordschleife — 5-language UI strings + locale helpers.
 *
 * Locales: en (default) · de · nl · fr · es
 *
 * The user's choice is persisted in localStorage under
 * `nordschleife_locale`. On first visit we attempt to detect from
 * navigator.language; otherwise we fall back to English.
 */

export type Locale = 'en' | 'de' | 'nl' | 'fr' | 'es'

export const LOCALES: readonly Locale[] = ['en', 'de', 'nl', 'fr', 'es'] as const

export const LOCALE_LABEL: Record<Locale, string> = {
  en: 'EN',
  de: 'DE',
  nl: 'NL',
  fr: 'FR',
  es: 'ES',
}

export const LOCALE_FULL_NAME: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  nl: 'Nederlands',
  fr: 'Français',
  es: 'Español',
}

export const LOCALE_STORAGE_KEY = 'nordschleife_locale'

export function isLocale(x: unknown): x is Locale {
  return typeof x === 'string' && (LOCALES as readonly string[]).includes(x)
}

/**
 * Pick a locale at startup. Priority:
 *   1. localStorage[nordschleife_locale]
 *   2. navigator.language prefix (de, nl, fr, es) → matched locale
 *   3. 'en'
 */
export function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (isLocale(stored)) return stored
  } catch { /* localStorage unavailable */ }
  const lang = (typeof navigator !== 'undefined' ? navigator.language : 'en').toLowerCase().slice(0, 2)
  if (isLocale(lang)) return lang
  return 'en'
}

// ── UI strings ───────────────────────────────────────────────────────────────
// All strings keyed by locale. Add a key here when introducing new copy in any
// component. Components import the `t()` helper at the bottom of this file.

type Strings = Record<Locale, string>

export const STR = {
  // ── Header / nav / banner ──
  header_subtitle:           { en: '🌲 GREEN HELL · TIME TRIAL',                    de: '🌲 GRÜNE HÖLLE · ZEITFAHREN',                nl: '🌲 GROENE HEL · TIME TRIAL',              fr: '🌲 ENFER VERT · CONTRE-LA-MONTRE',         es: '🌲 INFIERNO VERDE · CONTRARRELOJ' },
  live_banner:               { en: '🏁 Live now: 24 HOURS OF NÜRBURGRING — kill the boring laps with trivia',
                               de: '🏁 Live: 24 STUNDEN VOM NÜRBURGRING — überbrücke die langweiligen Runden mit Trivia',
                               nl: '🏁 Nu live: 24 UUR VAN DE NÜRBURGRING — vermoord saaie rondes met trivia',
                               fr: '🏁 En direct : 24 HEURES DU NÜRBURGRING — meublez les tours ennuyeux avec du trivia',
                               es: '🏁 En directo: 24 HORAS DE NÜRBURGRING — mata los giros aburridos con trivia' },

  // ── Landing hero ──
  hero_kicker:               { en: '20.832 km · 170+ corners · 1 lap',               de: '20,832 km · 170+ Kurven · 1 Runde',           nl: '20,832 km · 170+ bochten · 1 ronde',       fr: '20,832 km · 170+ virages · 1 tour',        es: '20,832 km · 170+ curvas · 1 vuelta' },
  hero_title_part1:          { en: 'The',                                            de: 'Die',                                          nl: 'De',                                       fr: "L'",                                        es: 'El' },
  hero_title_green:          { en: 'Green',                                          de: 'Grüne',                                        nl: 'Groene',                                   fr: 'Enfer',                                     es: 'Infierno' },
  hero_title_hell:           { en: 'Hell',                                           de: 'Hölle',                                        nl: 'Hel',                                      fr: 'Vert',                                      es: 'Verde' },
  hero_title_suffix:         { en: 'Time Trial.',                                    de: 'Zeitfahren.',                                  nl: 'Time Trial.',                              fr: 'contre-la-montre.',                         es: 'contrarreloj.' },
  hero_body:                 { en: '30 trivia questions about the most legendary track in motorsport. 15 seconds each. Wrong answer or timeout = +5 second penalty. Your total time is your lap time. Set the track record.',
                               de: '30 Trivia-Fragen über die legendärste Rennstrecke der Welt. 15 Sekunden pro Frage. Falsche Antwort oder Timeout = +5 Sekunden Strafe. Deine Gesamtzeit ist deine Rundenzeit. Knacke den Streckenrekord.',
                               nl: '30 trivia-vragen over het meest legendarische circuit in de motorsport. 15 seconden per vraag. Fout antwoord of timeout = +5 seconden straf. Je totale tijd is je rondetijd. Vestig een baanrecord.',
                               fr: '30 questions de trivia sur le circuit le plus légendaire du sport auto. 15 secondes par question. Mauvaise réponse ou timeout = +5 secondes de pénalité. Votre temps total est votre temps au tour. Battez le record.',
                               es: '30 preguntas de trivia sobre el circuito más legendario del motorsport. 15 segundos por pregunta. Respuesta incorrecta o tiempo agotado = +5 segundos de penalización. Tu tiempo total es tu vuelta. Bate el récord.' },
  hero_cta_start:            { en: 'Start the lap →',                                de: 'Runde starten →',                              nl: 'Start de ronde →',                         fr: 'Démarrer le tour →',                        es: 'Empezar la vuelta →' },
  hero_cta_footnote:         { en: 'First {free} laps free · {paid} more for €{price}',
                               de: 'Erste {free} Runden gratis · {paid} weitere für {price} €',
                               nl: 'Eerste {free} rondes gratis · {paid} extra voor € {price}',
                               fr: '{free} premiers tours gratuits · {paid} de plus pour {price} €',
                               es: 'Primeras {free} vueltas gratis · {paid} más por {price} €' },

  // ── Rules grid ──
  rules_heading:             { en: 'How it works',                                   de: 'So funktioniert es',                           nl: 'Hoe het werkt',                            fr: 'Comment ça marche',                         es: 'Cómo funciona' },
  rules_time_t:              { en: 'Time is your score',                             de: 'Zeit ist dein Score',                          nl: 'Tijd is je score',                         fr: 'Le temps est votre score',                  es: 'El tiempo es tu puntuación' },
  rules_time_b:              { en: 'Your lap time = total seconds spent answering. Faster = better.',
                               de: 'Deine Rundenzeit = die Summe aller Antwortzeiten. Schneller = besser.',
                               nl: 'Je rondetijd = totale seconden die je nodig hebt om te antwoorden. Sneller = beter.',
                               fr: 'Votre temps au tour = total des secondes passées à répondre. Plus rapide = meilleur.',
                               es: 'Tu vuelta = segundos totales para responder. Más rápido = mejor.' },
  rules_pen_t:               { en: '+5 second penalty',                              de: '+5 Sekunden Strafe',                           nl: '+5 seconden straf',                        fr: '+5 secondes de pénalité',                   es: '+5 segundos de penalización' },
  rules_pen_b:               { en: 'Wrong answer or timeout adds 5 seconds to that sector.',
                               de: 'Falsche Antwort oder Timeout fügt 5 Sekunden zum Sektor hinzu.',
                               nl: 'Fout antwoord of timeout telt 5 seconden bij die sector op.',
                               fr: 'Mauvaise réponse ou timeout ajoute 5 secondes à ce secteur.',
                               es: 'Una respuesta incorrecta o tiempo agotado añade 5 segundos al sector.' },
  rules_sect_t:              { en: '3 sectors · 30 questions',                       de: '3 Sektoren · 30 Fragen',                       nl: '3 sectoren · 30 vragen',                   fr: '3 secteurs · 30 questions',                 es: '3 sectores · 30 preguntas' },
  rules_sect_b:              { en: 'Hatzenbach (easy) → Karussell (medium) → Döttinger Höhe (hard).',
                               de: 'Hatzenbach (leicht) → Karussell (mittel) → Döttinger Höhe (schwer).',
                               nl: 'Hatzenbach (makkelijk) → Karussell (gemiddeld) → Döttinger Höhe (moeilijk).',
                               fr: 'Hatzenbach (facile) → Karussell (moyen) → Döttinger Höhe (difficile).',
                               es: 'Hatzenbach (fácil) → Karussell (medio) → Döttinger Höhe (difícil).' },
  rules_pool_t:              { en: '100-question pool',                              de: '100-Fragen-Pool',                              nl: '100-vragen pool',                          fr: 'Banque de 100 questions',                   es: 'Banco de 100 preguntas' },
  rules_pool_b:              { en: 'Every lap pulls 30 from a 100-question Nordschleife trivia bank.',
                               de: 'Jede Runde zieht 30 Fragen aus einem Pool von 100 Nordschleife-Trivia.',
                               nl: 'Elke ronde trekt 30 vragen uit een pool van 100 Nordschleife-trivia.',
                               fr: 'Chaque tour tire 30 questions parmi 100 sur la Nordschleife.',
                               es: 'Cada vuelta saca 30 preguntas de un banco de 100 sobre la Nordschleife.' },
  rules_purple_t:            { en: 'Purple = track record',                          de: 'Lila = Streckenrekord',                        nl: 'Paars = baanrecord',                       fr: 'Violet = record du tour',                   es: 'Morado = récord de la pista' },
  rules_purple_b:            { en: 'Fastest ever. Gold = your personal best this session.',
                               de: 'Schnellste Zeit aller Zeiten. Gold = deine persönliche Bestzeit der Session.',
                               nl: 'Snelste ooit. Goud = je persoonlijke beste deze sessie.',
                               fr: 'Le plus rapide jamais réalisé. Or = votre meilleur perso de cette session.',
                               es: 'El más rápido de la historia. Oro = tu mejor marca personal de esta sesión.' },
  rules_paid_t:              { en: '{free} free, then €{price}',                     de: '{free} gratis, dann {price} €',                nl: '{free} gratis, daarna € {price}',         fr: '{free} gratuits, puis {price} €',           es: '{free} gratis, luego {price} €' },
  rules_paid_b:              { en: '{free} attempts free per device, then {paid} more for €{price}.',
                               de: '{free} Versuche gratis pro Gerät, danach {paid} weitere für {price} €.',
                               nl: '{free} pogingen gratis per apparaat, daarna {paid} extra voor € {price}.',
                               fr: '{free} essais gratuits par appareil, puis {paid} de plus pour {price} €.',
                               es: '{free} intentos gratis por dispositivo, luego {paid} más por {price} €.' },

  // ── Sector preview / labels ──
  sector_preview_heading:    { en: 'Your lap, sector by sector',                     de: 'Deine Runde, Sektor für Sektor',               nl: 'Je ronde, sector voor sector',             fr: 'Votre tour, secteur par secteur',           es: 'Tu vuelta, sector a sector' },
  sector_1:                  { en: 'SECTOR 1',                                       de: 'SEKTOR 1',                                     nl: 'SECTOR 1',                                 fr: 'SECTEUR 1',                                 es: 'SECTOR 1' },
  sector_2:                  { en: 'SECTOR 2',                                       de: 'SEKTOR 2',                                     nl: 'SECTOR 2',                                 fr: 'SECTEUR 2',                                 es: 'SECTOR 2' },
  sector_3:                  { en: 'SECTOR 3',                                       de: 'SEKTOR 3',                                     nl: 'SECTOR 3',                                 fr: 'SECTEUR 3',                                 es: 'SECTOR 3' },
  difficulty_easy:           { en: 'Easy',                                           de: 'Leicht',                                       nl: 'Makkelijk',                                fr: 'Facile',                                    es: 'Fácil' },
  difficulty_medium:         { en: 'Medium',                                         de: 'Mittel',                                       nl: 'Gemiddeld',                                fr: 'Moyen',                                     es: 'Medio' },
  difficulty_hard:           { en: 'Hard',                                           de: 'Schwer',                                       nl: 'Moeilijk',                                 fr: 'Difficile',                                 es: 'Difícil' },

  // ── Leaderboard card ──
  leaderboard_heading:       { en: '🏁 Track Records',                               de: '🏁 Streckenrekorde',                           nl: '🏁 Baanrecords',                           fr: '🏁 Records du tour',                        es: '🏁 Récords de pista' },
  leaderboard_live:          { en: 'LIVE · update in {sec}s',                        de: 'LIVE · Update in {sec}s',                      nl: 'LIVE · update over {sec}s',                fr: 'LIVE · maj dans {sec}s',                    es: 'EN VIVO · actualizar en {sec}s' },
  leaderboard_warmup:        { en: 'Warming up the timing screens…',                 de: 'Zeitnahme-Bildschirme werden hochgefahren…',   nl: 'Tijdregistratie wordt opgewarmd…',         fr: 'Préchauffage des écrans de chrono…',        es: 'Calentando las pantallas de cronometraje…' },
  leaderboard_empty:         { en: 'No laps set yet. Be first into the Eifel.',      de: 'Noch keine Runden gesetzt. Sei der Erste in der Eifel.',
                               nl: 'Nog geen rondes gezet. Wees de eerste in de Eifel.',
                               fr: 'Aucun tour encore. Soyez le premier dans l\'Eifel.',
                               es: 'Aún sin vueltas. Sé el primero en la Eifel.' },
  leaderboard_alltime:       { en: 'All time',                                       de: 'Bestenliste',                                  nl: 'Aller tijden',                             fr: 'De tous les temps',                         es: 'Histórico' },
  leaderboard_cta:           { en: 'Challenge the record →',                         de: 'Rekord herausfordern →',                       nl: 'Daag het record uit →',                    fr: 'Défier le record →',                        es: 'Reta el récord →' },

  // ── Presence ──
  presence_badge:            { en: '{count} racers on track right now',              de: '{count} Fahrer gerade auf der Strecke',        nl: '{count} racers nu op de baan',             fr: '{count} pilotes en piste maintenant',       es: '{count} pilotos en pista ahora mismo' },

  // ── Attempts ──
  attempts_free_left:        { en: '{count} free lap left',                          de: '{count} freie Runde übrig',                    nl: '{count} gratis ronde over',                fr: '{count} tour gratuit restant',              es: '{count} vuelta gratis restante' },
  attempts_free_left_plural: { en: '{count} free laps left',                         de: '{count} freie Runden übrig',                   nl: '{count} gratis rondes over',               fr: '{count} tours gratuits restants',           es: '{count} vueltas gratis restantes' },
  attempts_plus_paid:        { en: ' · +{count} paid',                               de: ' · +{count} bezahlt',                          nl: ' · +{count} betaald',                      fr: ' · +{count} payés',                         es: ' · +{count} pagados' },
  attempts_none:             { en: 'No laps left — buy a 5-pack to keep going',      de: 'Keine Runden mehr — 5er-Pack kaufen, um weiterzumachen',
                               nl: 'Geen rondes meer — koop een 5-pack om door te gaan',
                               fr: 'Plus de tours — achetez un pack de 5 pour continuer',
                               es: 'Sin vueltas — compra un pack de 5 para seguir' },

  // ── Challenge banner ──
  challenge_kicker:          { en: "You've been challenged",                         de: 'Du wurdest herausgefordert',                   nl: 'Je bent uitgedaagd',                       fr: 'Vous avez été défié',                       es: 'Has sido retado' },
  challenge_body:            { en: 'set',                                             de: 'fuhr',                                          nl: 'zette',                                     fr: 'a fait',                                     es: 'marcó' },
  challenge_beat:            { en: 'Beat it.',                                       de: 'Schlag das.',                                  nl: 'Sla dat.',                                 fr: 'Faites mieux.',                             es: 'Supéralo.' },

  // ── Countdown / play screen ──
  countdown_kicker:          { en: 'ROLLING OUT OF THE PITS…',                       de: 'AUS DER BOX ROLLEN…',                          nl: 'PITSTRAAT VERLATEN…',                      fr: 'SORTIE DES STANDS…',                        es: 'SALIENDO DEL BOX…' },
  countdown_ready:           { en: 'Get ready — the timing loop starts now',         de: 'Bereit machen — die Zeitnahme startet jetzt',  nl: 'Maak je klaar — de tijdmeting begint nu',  fr: 'Prêt — le chrono démarre maintenant',       es: 'Listos — el crono empieza ya' },
  play_seconds_remaining:    { en: 'SECONDS REMAINING',                              de: 'SEKUNDEN ÜBRIG',                               nl: 'SECONDEN OVER',                            fr: 'SECONDES RESTANTES',                        es: 'SEGUNDOS RESTANTES' },
  play_q_of:                 { en: 'Q{n}/{total}',                                   de: 'F{n}/{total}',                                 nl: 'V{n}/{total}',                             fr: 'Q{n}/{total}',                              es: 'P{n}/{total}' },
  play_brand_label:          { en: '🌲 NORDSCHLEIFE',                                de: '🌲 NORDSCHLEIFE',                              nl: '🌲 NORDSCHLEIFE',                          fr: '🌲 NORDSCHLEIFE',                           es: '🌲 NORDSCHLEIFE' },
  play_feedback_timeout:     { en: "Time's up! +{pen}s penalty",                     de: 'Zeit abgelaufen! +{pen}s Strafe',              nl: 'Tijd om! +{pen}s straf',                   fr: 'Temps écoulé ! +{pen}s de pénalité',         es: '¡Tiempo! +{pen}s de penalización' },
  play_feedback_correct:     { en: 'Correct! {t}s',                                  de: 'Richtig! {t}s',                                nl: 'Goed! {t}s',                               fr: 'Correct ! {t}s',                             es: '¡Correcto! {t}s' },
  play_feedback_wrong:       { en: 'Wrong — +{pen}s penalty',                        de: 'Falsch — +{pen}s Strafe',                      nl: 'Fout — +{pen}s straf',                     fr: 'Faux — +{pen}s de pénalité',                 es: 'Incorrecto — +{pen}s de penalización' },
  play_correct_was:          { en: 'Correct:',                                       de: 'Richtig:',                                     nl: 'Juist:',                                   fr: 'Bonne réponse :',                           es: 'Correcto:' },

  // ── Gate / paywall screen ──
  gate_used_free:            { en: "You've used your {free} free laps",              de: 'Deine {free} freien Runden sind aufgebraucht', nl: 'Je hebt je {free} gratis rondes gebruikt', fr: 'Vous avez utilisé vos {free} tours gratuits', es: 'Has gastado tus {free} vueltas gratis' },
  gate_still_paid:           { en: 'You still have {count} paid lap on this device — start a new lap to use one.',
                               de: 'Du hast noch {count} bezahlte Runde auf diesem Gerät — starte eine neue Runde.',
                               nl: 'Je hebt nog {count} betaalde ronde op dit apparaat — start een nieuwe ronde.',
                               fr: 'Il vous reste {count} tour payé sur cet appareil — lancez un nouveau tour.',
                               es: 'Te queda {count} vuelta pagada en este dispositivo — empieza una nueva.' },
  gate_still_paid_plural:    { en: 'You still have {count} paid laps on this device — start a new lap to use one.',
                               de: 'Du hast noch {count} bezahlte Runden auf diesem Gerät — starte eine neue Runde.',
                               nl: 'Je hebt nog {count} betaalde rondes op dit apparaat — start een nieuwe ronde.',
                               fr: 'Il vous reste {count} tours payés sur cet appareil — lancez un nouveau tour.',
                               es: 'Te quedan {count} vueltas pagadas en este dispositivo — empieza una nueva.' },
  gate_eifel_unforgiving:    { en: 'The Eifel is unforgiving. Grab 5 more for €2 and keep chasing the track record.',
                               de: 'Die Eifel verzeiht nichts. Hol dir 5 weitere für 2 € und jag weiter den Streckenrekord.',
                               nl: 'De Eifel is meedogenloos. Pak er 5 extra voor € 2 en blijf het baanrecord najagen.',
                               fr: "L'Eifel ne pardonne pas. Prenez 5 tours de plus pour 2 € et continuez la chasse au record.",
                               es: 'La Eifel no perdona. Compra 5 más por 2 € y sigue cazando el récord.' },
  gate_cta_buy:              { en: 'Get 5 more laps · €2 →',                         de: '5 weitere Runden · 2 € →',                     nl: 'Krijg 5 extra rondes · € 2 →',             fr: '5 tours de plus · 2 € →',                   es: '5 vueltas más · 2 € →' },
  gate_back:                 { en: 'Back to landing',                                de: 'Zurück zur Startseite',                        nl: 'Terug naar landing',                       fr: "Retour à l'accueil",                        es: 'Volver al inicio' },
  gate_used:                 { en: '{used}/{free} free attempts used on this device.',
                               de: '{used}/{free} freie Versuche auf diesem Gerät benutzt.',
                               nl: '{used}/{free} gratis pogingen gebruikt op dit apparaat.',
                               fr: '{used}/{free} essais gratuits utilisés sur cet appareil.',
                               es: '{used}/{free} intentos gratis usados en este dispositivo.' },

  // ── Results page ──
  results_kicker:            { en: '🏁 LAP COMPLETE',                                de: '🏁 RUNDE BEENDET',                             nl: '🏁 RONDE VOLTOOID',                        fr: '🏁 TOUR TERMINÉ',                           es: '🏁 VUELTA COMPLETA' },
  results_your_lap_time:     { en: 'YOUR LAP TIME',                                  de: 'DEINE RUNDENZEIT',                             nl: 'JOUW RONDETIJD',                           fr: 'VOTRE TEMPS AU TOUR',                       es: 'TU VUELTA' },
  results_new_record:        { en: '🟣 New Nordschleife track record!',              de: '🟣 Neuer Nordschleife-Streckenrekord!',        nl: '🟣 Nieuw Nordschleife-baanrecord!',        fr: '🟣 Nouveau record du tour Nordschleife !',  es: '🟣 ¡Nuevo récord de la Nordschleife!' },
  results_breakdown:         { en: 'Sector breakdown',                               de: 'Sektor-Aufschlüsselung',                       nl: 'Sectoren-overzicht',                       fr: 'Détail par secteur',                        es: 'Desglose por sector' },
  results_lap:               { en: 'LAP',                                            de: 'RUNDE',                                        nl: 'RONDE',                                    fr: 'TOUR',                                      es: 'VUELTA' },
  stats_correct:             { en: 'Correct',                                        de: 'Richtig',                                      nl: 'Goed',                                     fr: 'Correctes',                                 es: 'Correctas' },
  stats_penalties:           { en: 'Penalties',                                      de: 'Strafen',                                      nl: 'Straffen',                                 fr: 'Pénalités',                                 es: 'Penalizaciones' },
  stats_accuracy:            { en: 'Accuracy',                                       de: 'Trefferquote',                                 nl: 'Nauwkeurigheid',                           fr: 'Précision',                                 es: 'Precisión' },
  results_saved_heading:     { en: 'Lap time saved',                                 de: 'Rundenzeit gespeichert',                       nl: 'Rondetijd opgeslagen',                     fr: 'Temps au tour enregistré',                  es: 'Vuelta guardada' },
  results_youre_p:           { en: "You're",                                          de: 'Du bist',                                       nl: 'Je bent',                                   fr: 'Vous êtes',                                  es: 'Eres' },
  results_on_leaderboard:    { en: 'on the leaderboard.',                            de: 'in der Bestenliste.',                          nl: 'in het klassement.',                       fr: 'au classement.',                            es: 'en la clasificación.' },
  results_save_heading:      { en: '🏁 Save your lap to the leaderboard',            de: '🏁 Speichere deine Runde in der Bestenliste',  nl: '🏁 Bewaar je ronde in het klassement',     fr: '🏁 Enregistrez votre tour au classement',   es: '🏁 Guarda tu vuelta en la clasificación' },
  results_save_sub:          { en: 'Name shown publicly. Email never is.',           de: 'Name öffentlich. E-Mail bleibt privat.',       nl: 'Naam wordt openbaar getoond. E-mail nooit.', fr: "Nom affiché publiquement. L'e-mail jamais.", es: 'Nombre público. El email nunca lo es.' },
  results_input_name:        { en: 'Your name or alias',                             de: 'Dein Name oder Alias',                         nl: 'Je naam of alias',                         fr: 'Votre nom ou pseudo',                       es: 'Tu nombre o alias' },
  results_input_email:       { en: 'Email (not shown publicly)',                     de: 'E-Mail (nicht öffentlich)',                    nl: 'E-mail (niet openbaar)',                   fr: 'E-mail (non affiché)',                      es: 'Email (no se muestra)' },
  results_err_name:          { en: 'Please enter your name or alias.',               de: 'Bitte gib deinen Namen oder Alias ein.',       nl: 'Vul je naam of alias in.',                 fr: 'Entrez votre nom ou pseudo.',               es: 'Introduce tu nombre o alias.' },
  results_err_email:         { en: 'Please enter a valid email.',                    de: 'Bitte gib eine gültige E-Mail-Adresse ein.',   nl: 'Vul een geldig e-mailadres in.',           fr: 'Entrez un e-mail valide.',                  es: 'Introduce un email válido.' },
  results_err_save:          { en: 'Something went wrong saving your lap — it may have still been recorded.',
                               de: 'Beim Speichern deiner Runde ist etwas schiefgelaufen — möglicherweise wurde sie trotzdem aufgezeichnet.',
                               nl: 'Er ging iets mis bij het opslaan — mogelijk is je ronde toch geregistreerd.',
                               fr: "Erreur lors de l'enregistrement — votre tour a peut-être quand même été pris en compte.",
                               es: 'Algo falló al guardar — puede que tu vuelta sí se haya registrado.' },
  results_submitting:        { en: 'Saving lap…',                                    de: 'Speichere Runde…',                             nl: 'Ronde opslaan…',                           fr: 'Enregistrement…',                           es: 'Guardando…' },
  results_submit:            { en: 'Post lap time →',                                de: 'Rundenzeit posten →',                          nl: 'Rondetijd plaatsen →',                     fr: 'Publier le temps →',                        es: 'Publicar la vuelta →' },
  results_another:           { en: 'Another lap →',                                  de: 'Noch eine Runde →',                            nl: 'Nog een ronde →',                          fr: 'Encore un tour →',                          es: 'Otra vuelta →' },
  results_buy_more:          { en: 'Buy {paid} more laps · €{price} →',              de: '{paid} weitere Runden kaufen · {price} € →',   nl: 'Koop {paid} extra rondes · € {price} →',   fr: 'Acheter {paid} tours de plus · {price} € →', es: 'Compra {paid} vueltas más · {price} € →' },
  results_to_leaderboard:    { en: 'Leaderboard',                                    de: 'Bestenliste',                                  nl: 'Klassement',                               fr: 'Classement',                                es: 'Clasificación' },
  results_laps_remaining:    { en: '{total} lap left on this device · {detail}',     de: '{total} Runde übrig auf diesem Gerät · {detail}', nl: '{total} ronde over op dit apparaat · {detail}', fr: '{total} tour restant sur cet appareil · {detail}', es: '{total} vuelta restante en este dispositivo · {detail}' },
  results_laps_remaining_plural: { en: '{total} laps left on this device · {detail}', de: '{total} Runden übrig auf diesem Gerät · {detail}', nl: '{total} rondes over op dit apparaat · {detail}', fr: '{total} tours restants sur cet appareil · {detail}', es: '{total} vueltas restantes en este dispositivo · {detail}' },
  results_paid:              { en: '{n} paid',                                       de: '{n} bezahlt',                                  nl: '{n} betaald',                              fr: '{n} payés',                                 es: '{n} pagadas' },
  results_free:              { en: '{n} free',                                       de: '{n} gratis',                                   nl: '{n} gratis',                               fr: '{n} gratuits',                              es: '{n} gratis' },

  // ── Share panel ──
  share_heading:             { en: '📣 Challenge your friends',                      de: '📣 Fordere deine Freunde heraus',              nl: '📣 Daag je vrienden uit',                  fr: '📣 Défiez vos amis',                        es: '📣 Reta a tus amigos' },
  share_tag:                 { en: 'VIRAL · 1-TAP SHARE',                            de: 'VIRAL · 1-KLICK TEILEN',                       nl: 'VIRAL · 1-TIK DELEN',                      fr: 'VIRAL · PARTAGE 1 CLIC',                    es: 'VIRAL · COMPARTIR EN 1 TOQUE' },
  share_native:              { en: 'Share my lap…',                                  de: 'Meine Runde teilen…',                          nl: 'Mijn ronde delen…',                        fr: 'Partager mon tour…',                        es: 'Compartir mi vuelta…' },
  share_label_email:         { en: 'E-mail',                                         de: 'E-Mail',                                       nl: 'E-mail',                                   fr: 'E-mail',                                    es: 'Email' },
  share_label_copylink:      { en: 'Copy link',                                      de: 'Link kopieren',                                nl: 'Link kopiëren',                            fr: 'Copier le lien',                            es: 'Copiar enlace' },
  share_label_copylink_ok:   { en: 'Copied',                                         de: 'Kopiert',                                      nl: 'Gekopieerd',                               fr: 'Copié',                                     es: 'Copiado' },
  share_label_copytext:      { en: 'Copy text',                                      de: 'Text kopieren',                                nl: 'Tekst kopiëren',                           fr: 'Copier le texte',                           es: 'Copiar texto' },
  share_label_copytext_ok:   { en: '✓ Copied',                                       de: '✓ Kopiert',                                    nl: '✓ Gekopieerd',                             fr: '✓ Copié',                                   es: '✓ Copiado' },
  share_msg_tag:             { en: 'MSG',                                            de: 'MSG',                                          nl: 'MSG',                                      fr: 'MSG',                                       es: 'MSG' },
  share_tv_heading:          { en: '📺 Live on TV?',                                 de: '📺 Live im TV?',                               nl: '📺 Live op TV?',                           fr: '📺 En direct à la TV ?',                    es: '📺 ¿En directo en TV?' },
  share_tv_body:             { en: "Point your phone's camera at this QR. Anyone watching the screen can scan it and start their own lap right now.",
                               de: 'Richte die Handykamera auf diesen QR-Code. Wer auf den Bildschirm schaut, scannt mit und legt sofort los.',
                               nl: 'Richt je telefooncamera op deze QR. Iedereen die het scherm ziet kan scannen en meteen z\'n eigen ronde starten.',
                               fr: "Pointez l'appareil photo de votre téléphone sur ce QR. N'importe quel téléspectateur peut scanner et lancer son propre tour.",
                               es: "Apunta la cámara del móvil a este QR. Cualquiera que vea la pantalla puede escanearlo y empezar su propia vuelta." },
  share_preview_og:          { en: 'Preview the share image →',                      de: 'Vorschau des Share-Bildes →',                  nl: 'Preview de share-afbeelding →',            fr: "Aperçu de l'image de partage →",            es: 'Previsualizar la imagen →' },
  share_message_template:    { en: '{who} just hot-lapped the Nordschleife trivia time-trial in {time}.{rank} Can you beat it?',
                               de: '{who} hat soeben das Nordschleife-Trivia-Zeitfahren in {time} hingelegt.{rank} Schaffst du das besser?',
                               nl: '{who} legde net een hot lap neer in de Nordschleife trivia time-trial in {time}.{rank} Kun jij het beter?',
                               fr: '{who} vient de boucler le contre-la-montre trivia Nordschleife en {time}.{rank} Vous faites mieux ?',
                               es: '{who} acaba de hacer una vuelta rápida en la trivia Nordschleife en {time}.{rank} ¿Puedes superarla?' },
  share_rank_first:          { en: ' 🟣 New track record!',                          de: ' 🟣 Neuer Streckenrekord!',                    nl: ' 🟣 Nieuw baanrecord!',                    fr: ' 🟣 Nouveau record !',                      es: ' 🟣 ¡Nuevo récord!' },
  share_rank_at:             { en: ' 🏁 P{n} on the leaderboard.',                   de: ' 🏁 P{n} in der Bestenliste.',                 nl: ' 🏁 P{n} in het klassement.',              fr: ' 🏁 P{n} au classement.',                   es: ' 🏁 P{n} en la clasificación.' },
  share_who_default:         { en: 'A friend',                                       de: 'Ein Freund',                                   nl: 'Een vriend',                               fr: 'Un ami',                                    es: 'Un amigo' },
  share_who_self:            { en: 'I',                                              de: 'Ich',                                          nl: 'Ik',                                       fr: 'Je',                                        es: 'Yo' },

  // ── Buy page ──
  buy_kicker:                { en: '💸 BUY MORE LAPS',                               de: '💸 MEHR RUNDEN KAUFEN',                        nl: '💸 KOOP MEER RONDES',                      fr: '💸 ACHETER PLUS DE TOURS',                  es: '💸 COMPRAR MÁS VUELTAS' },
  buy_title:                 { en: '{paid} extra laps',                              de: '{paid} zusätzliche Runden',                    nl: '{paid} extra rondes',                      fr: '{paid} tours supplémentaires',              es: '{paid} vueltas extra' },
  buy_body:                  { en: 'Top up with {paid} more attempts on the Nordschleife trivia time trial. Credits activate immediately after payment and stay on this device for 30 days.',
                               de: 'Lade {paid} weitere Versuche fürs Nordschleife-Trivia-Zeitfahren auf. Die Credits werden direkt nach der Zahlung aktiviert und bleiben 30 Tage auf diesem Gerät.',
                               nl: 'Vul aan met {paid} extra pogingen op de Nordschleife trivia time-trial. De credits worden direct na betaling geactiveerd en blijven 30 dagen op dit apparaat.',
                               fr: 'Rechargez {paid} essais supplémentaires sur le contre-la-montre Nordschleife. Les crédits sont activés dès le paiement et restent 30 jours sur cet appareil.',
                               es: 'Recarga {paid} intentos más en la trivia Nordschleife. Los créditos se activan al instante tras el pago y duran 30 días en este dispositivo.' },
  buy_total:                 { en: 'Total',                                          de: 'Gesamt',                                       nl: 'Totaal',                                   fr: 'Total',                                     es: 'Total' },
  buy_vat:                   { en: 'incl. 21% VAT',                                  de: 'inkl. 21 % MwSt.',                             nl: 'incl. 21% btw',                            fr: 'TVA 21 % incl.',                            es: 'IVA 21 % incl.' },
  buy_input_name:            { en: 'Your name',                                      de: 'Dein Name',                                    nl: 'Je naam',                                  fr: 'Votre nom',                                 es: 'Tu nombre' },
  buy_input_email:           { en: 'Email for the receipt',                          de: 'E-Mail für die Quittung',                      nl: 'E-mail voor de bon',                       fr: 'E-mail pour le reçu',                       es: 'Email para el recibo' },
  buy_cta:                   { en: 'Pay €{price}.00 with Mollie →',                  de: '{price},00 € mit Mollie zahlen →',             nl: 'Betaal € {price},00 met Mollie →',         fr: 'Payer {price},00 € avec Mollie →',          es: 'Pagar {price},00 € con Mollie →' },
  buy_cta_busy:              { en: 'Opening Mollie checkout…',                       de: 'Mollie-Checkout wird geöffnet…',               nl: 'Mollie-checkout openen…',                  fr: 'Ouverture du paiement Mollie…',             es: 'Abriendo el pago de Mollie…' },
  buy_err_name:              { en: 'Please enter your name.',                        de: 'Bitte gib deinen Namen ein.',                  nl: 'Vul je naam in.',                          fr: 'Entrez votre nom.',                         es: 'Introduce tu nombre.' },
  buy_err_email:             { en: 'Please enter a valid email.',                    de: 'Bitte gib eine gültige E-Mail-Adresse ein.',   nl: 'Vul een geldig e-mailadres in.',           fr: 'Entrez un e-mail valide.',                  es: 'Introduce un email válido.' },
  buy_err_network:           { en: 'Network error. Please try again.',               de: 'Netzwerkfehler. Bitte erneut versuchen.',      nl: 'Netwerkfout. Probeer opnieuw.',            fr: 'Erreur réseau. Réessayez.',                 es: 'Error de red. Inténtalo de nuevo.' },
  buy_powered:               { en: 'Powered by Mollie. Pay with iDEAL, card, Bancontact, Apple Pay and more.',
                               de: 'Bezahlt durch Mollie. iDEAL, Karte, Bancontact, Apple Pay und mehr.',
                               nl: 'Powered by Mollie. Betaal met iDEAL, kaart, Bancontact, Apple Pay en meer.',
                               fr: 'Propulsé par Mollie. Payez par iDEAL, carte, Bancontact, Apple Pay, etc.',
                               es: 'Con tecnología de Mollie. Paga con iDEAL, tarjeta, Bancontact, Apple Pay y más.' },
  buy_after_paying:          { en: "After paying you'll return here and click",      de: 'Nach der Zahlung kommst du zurück und klickst auf', nl: 'Na betalen kom je hier terug en klik je op', fr: 'Après le paiement, vous reviendrez ici et cliquerez sur', es: 'Tras pagar volverás aquí y harás clic en' },
  buy_after_paying_btn:      { en: 'Claim 5 laps',                                   de: '5 Runden einlösen',                            nl: '5 rondes claimen',                         fr: 'Récupérer 5 tours',                         es: 'Reclamar 5 vueltas' },
  buy_after_paying_tail:     { en: "— your credits are stored as a signed cookie on this device.",
                               de: '— deine Credits werden als signiertes Cookie auf diesem Gerät gespeichert.',
                               nl: '— je credits worden als ondertekende cookie op dit apparaat opgeslagen.',
                               fr: '— vos crédits sont stockés dans un cookie signé sur cet appareil.',
                               es: '— tus créditos quedan en una cookie firmada en este dispositivo.' },
  buy_back:                  { en: '← Back to the track',                            de: '← Zurück zur Strecke',                         nl: '← Terug naar de baan',                     fr: '← Retour à la piste',                       es: '← Volver a la pista' },

  // ── Claim page ──
  claim_activating:          { en: 'Activating your laps…',                          de: 'Aktiviere deine Runden…',                      nl: 'Rondes activeren…',                        fr: 'Activation de vos tours…',                  es: 'Activando tus vueltas…' },
  claim_one_moment:          { en: 'One moment.',                                    de: 'Einen Moment.',                                nl: 'Een moment.',                              fr: 'Un instant.',                               es: 'Un momento.' },
  claim_activated:           { en: '{paid} laps activated',                          de: '{paid} Runden aktiviert',                      nl: '{paid} rondes geactiveerd',                fr: '{paid} tours activés',                      es: '{paid} vueltas activadas' },
  claim_stored:              { en: 'Your credits are now stored on this device.',    de: 'Deine Credits sind jetzt auf diesem Gerät gespeichert.',
                               nl: 'Je credits staan nu op dit apparaat.',
                               fr: 'Vos crédits sont maintenant stockés sur cet appareil.',
                               es: 'Tus créditos están ahora en este dispositivo.' },
  claim_total_avail:         { en: ' Total available: {count}.',                     de: ' Insgesamt verfügbar: {count}.',               nl: ' Totaal beschikbaar: {count}.',            fr: ' Total disponible : {count}.',              es: ' Total disponible: {count}.' },
  claim_start_lap:           { en: 'Start a lap →',                                  de: 'Eine Runde starten →',                         nl: 'Start een ronde →',                        fr: 'Démarrer un tour →',                        es: 'Empezar una vuelta →' },
  claim_back:                { en: 'Back to landing',                                de: 'Zurück zur Startseite',                        nl: 'Terug naar landing',                       fr: "Retour à l'accueil",                        es: 'Volver al inicio' },
  claim_pending:             { en: 'Payment is still processing',                    de: 'Zahlung wird noch verarbeitet',                nl: 'Betaling wordt nog verwerkt',              fr: 'Paiement encore en cours',                  es: 'Pago aún en proceso' },
  claim_pending_body:        { en: 'Banks sometimes take a minute. Reload this page in a moment to claim your laps.',
                               de: 'Banken brauchen manchmal eine Minute. Lade die Seite in einem Moment neu, um die Runden einzulösen.',
                               nl: 'Banken hebben soms een minuutje nodig. Herlaad deze pagina zo om je rondes te claimen.',
                               fr: 'Les banques mettent parfois une minute. Rechargez la page dans un instant pour récupérer vos tours.',
                               es: 'Los bancos a veces tardan un minuto. Recarga la página en un momento para reclamar tus vueltas.' },
  claim_reload:              { en: 'Reload & try again',                             de: 'Neu laden & erneut versuchen',                 nl: 'Herlaad & probeer opnieuw',                fr: 'Recharger & réessayer',                     es: 'Recargar y reintentar' },
  claim_error:               { en: 'Could not activate',                             de: 'Konnte nicht aktiviert werden',                nl: 'Activeren mislukt',                        fr: "Impossible d'activer",                      es: 'No se pudo activar' },
  claim_err_default:         { en: 'Please email mark@brandpwrdmedia.com with your order ID.',
                               de: 'Bitte schreibe an mark@brandpwrdmedia.com mit deiner Bestellnummer.',
                               nl: 'Mail mark@brandpwrdmedia.com met je order-ID.',
                               fr: 'Écrivez à mark@brandpwrdmedia.com avec votre numéro de commande.',
                               es: 'Escribe a mark@brandpwrdmedia.com con tu ID de pedido.' },
  claim_order_id_label:      { en: 'Order ID:',                                      de: 'Bestellnummer:',                               nl: 'Order-ID:',                                fr: 'Numéro de commande :',                      es: 'ID de pedido:' },

  // ── Footer ──
  footer_text:               { en: 'Nordschleife Time Trial · Built by Kirk & Blackbeard · Trivia is for fun, not for ride-sharing your real laps.',
                               de: 'Nordschleife Time Trial · Gebaut von Kirk & Blackbeard · Trivia ist zum Spaß, nicht zum Mitteilen echter Rundenzeiten.',
                               nl: 'Nordschleife Time Trial · Gebouwd door Kirk & Blackbeard · Trivia is voor de fun, niet om echte rondetijden te delen.',
                               fr: 'Nordschleife Time Trial · Créé par Kirk & Blackbeard · Trivia pour le plaisir, pas pour partager vos vrais tours.',
                               es: 'Nordschleife Time Trial · Creado por Kirk & Blackbeard · La trivia es por diversión, no para compartir tus vueltas reales.' },
} satisfies Record<string, Strings>

export type StringKey = keyof typeof STR

/**
 * t(key, locale, vars?) — fetch a localised string with optional {placeholder}
 * substitution. Missing keys return the EN string (graceful fallback).
 */
export function t(key: StringKey, locale: Locale, vars?: Record<string, string | number>): string {
  const row = STR[key]
  let s = row?.[locale] ?? row?.en ?? String(key)
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v))
    }
  }
  return s
}
