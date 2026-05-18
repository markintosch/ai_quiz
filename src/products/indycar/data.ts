/**
 * IndyCar — Indy 500 Time Trial
 * ─────────────────────────────────────────────────────────────────────────────
 * 100-question pool. Each lap = 30 randomly selected questions.
 * Sector 1 (Q1-10):  Easy   — "Front Straight"
 * Sector 2 (Q11-20): Medium — "Turn 1"
 * Sector 3 (Q21-30): Hard   — "Yard of Bricks"
 *
 * Timing:
 *   - 15 seconds per question
 *   - Sector time = ms taken (capped at 15 000 if timed out)
 *   - Wrong answer or timeout: +5 000 ms penalty
 *   - Total lap time = sum of all 30 sector times
 *   - Format: M:SS.mmm  (e.g. 7:23.456)
 *
 * Localisation:
 *   The canonical English question pool lives here. Translations for
 *   DE / NL / FR / ES live in ./translations.ts. Components should call
 *   localizeQuestion(q, locale) when rendering.
 */

import { TRANSLATIONS } from './translations'
import type { Locale } from './i18n'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface LapQuestion {
  id:         string
  text:       string
  options:    { value: string; label: string }[]
  correct:    string
  difficulty: Difficulty
  topic:      string
}

export interface SectorResult {
  questionId:  string
  timeMsRaw:   number   // actual ms taken (15 000 if timed out)
  timeMsTotal: number   // + 5 000 penalty if wrong/timeout
  correct:     boolean
  timedOut:    boolean
  answer:      string | null
}

export interface LapResult {
  name:        string
  email:       string
  sectors:     SectorResult[]
  totalMs:     number
  lapTime:     string    // formatted "M:SS.mmm"
  rank?:       number
  trackRecord?: number
}

// ── Constants ──────────────────────────────────────────────────────────────────
export const TIME_PER_Q_MS     = 15_000
export const PENALTY_MS        = 5_000
export const QUESTIONS_PER_LAP = 30
export const QUESTIONS_PER_SECTOR = 10

// ── Pricing / gating ──────────────────────────────────────────────────────────
export const FREE_ATTEMPTS         = 3
export const PAID_BUNDLE_ATTEMPTS  = 5
export const PAID_BUNDLE_PRICE_EUR = 2
export const PAID_PRODUCT_SLUG     = 'indycar-5-laps'
export const CREDIT_COOKIE_NAME    = 'ic_credits'
export const CREDIT_COOKIE_TTL_DAYS = 30
export const FREE_STORAGE_KEY      = 'indycar_free_used'

// ── Question pool (100 questions, all fact-anchored against research May 2026) ──

const EASY: LapQuestion[] = [
  { id: 'e01', difficulty: 'easy', topic: 'history',
    text: 'In which country is the Indianapolis 500 held?',
    options: [{ value: 'a', label: 'USA' }, { value: 'b', label: 'Canada' }, { value: 'c', label: 'Mexico' }, { value: 'd', label: 'Brazil' }],
    correct: 'a' },
  { id: 'e02', difficulty: 'easy', topic: '500-specific',
    text: 'How long is the Indianapolis 500 race?',
    options: [{ value: 'a', label: '300 miles' }, { value: 'b', label: '400 miles' }, { value: 'c', label: '500 miles' }, { value: 'd', label: '600 miles' }],
    correct: 'c' },
  { id: 'e03', difficulty: 'easy', topic: '500-specific',
    text: 'How many laps does the Indy 500 cover?',
    options: [{ value: 'a', label: '150' }, { value: 'b', label: '200' }, { value: 'c', label: '250' }, { value: 'd', label: '300' }],
    correct: 'b' },
  { id: 'e04', difficulty: 'easy', topic: 'circuits',
    text: 'How long is one lap at Indianapolis Motor Speedway?',
    options: [{ value: 'a', label: '1.5 mi' }, { value: 'b', label: '2.0 mi' }, { value: 'c', label: '2.5 mi' }, { value: 'd', label: '3.0 mi' }],
    correct: 'c' },
  { id: 'e05', difficulty: 'easy', topic: 'traditions',
    text: 'What drink does the winner of the Indy 500 traditionally drink in Victory Lane?',
    options: [{ value: 'a', label: 'Champagne' }, { value: 'b', label: 'Milk' }, { value: 'c', label: 'Beer' }, { value: 'd', label: 'Water' }],
    correct: 'b' },
  { id: 'e06', difficulty: 'easy', topic: 'traditions',
    text: 'What is the name of the trophy awarded to the Indy 500 winner?',
    options: [{ value: 'a', label: 'Borg-Warner Trophy' }, { value: 'b', label: 'Astor Cup' }, { value: 'c', label: 'Harmsworth Trophy' }, { value: 'd', label: 'Vanderbilt Cup' }],
    correct: 'a' },
  { id: 'e07', difficulty: 'easy', topic: '500-specific',
    text: 'In which month is the Indy 500 held every year?',
    options: [{ value: 'a', label: 'April' }, { value: 'b', label: 'May' }, { value: 'c', label: 'June' }, { value: 'd', label: 'July' }],
    correct: 'b' },
  { id: 'e08', difficulty: 'easy', topic: 'circuits',
    text: 'What shape is the Indianapolis Motor Speedway?',
    options: [{ value: 'a', label: 'Triangle' }, { value: 'b', label: 'Rectangular oval' }, { value: 'c', label: 'Circle' }, { value: 'd', label: 'D-shaped' }],
    correct: 'b' },
  { id: 'e09', difficulty: 'easy', topic: 'teams',
    text: 'Which famous team owner founded Team Penske?',
    options: [{ value: 'a', label: 'Roger Penske' }, { value: 'b', label: 'Chip Ganassi' }, { value: 'c', label: 'Michael Andretti' }, { value: 'd', label: 'Bobby Rahal' }],
    correct: 'a' },
  { id: 'e10', difficulty: 'easy', topic: 'drivers',
    text: 'Which legendary American family includes Mario, Michael and Marco as IndyCar drivers?',
    options: [{ value: 'a', label: 'Unser' }, { value: 'b', label: 'Andretti' }, { value: 'c', label: 'Foyt' }, { value: 'd', label: 'Rahal' }],
    correct: 'b' },
  { id: 'e11', difficulty: 'easy', topic: 'drivers',
    text: 'Which family has won the Indy 500 a combined record number of times with Al, Bobby and Al Jr.?',
    options: [{ value: 'a', label: 'Andretti' }, { value: 'b', label: 'Rahal' }, { value: 'c', label: 'Unser' }, { value: 'd', label: 'Mears' }],
    correct: 'c' },
  { id: 'e12', difficulty: 'easy', topic: 'records',
    text: 'How many Indianapolis 500 wins does Helio Castroneves have?',
    options: [{ value: 'a', label: '2' }, { value: 'b', label: '3' }, { value: 'c', label: '4' }, { value: 'd', label: '5' }],
    correct: 'c' },
  { id: 'e13', difficulty: 'easy', topic: 'traditions',
    text: 'What song is traditionally sung before the start of the Indy 500?',
    options: [{ value: 'a', label: '\'Sweet Caroline\'' }, { value: 'b', label: '\'Back Home Again in Indiana\'' }, { value: 'c', label: '\'God Bless America\'' }, { value: 'd', label: '\'America the Beautiful\'' }],
    correct: 'b' },
  { id: 'e14', difficulty: 'easy', topic: 'history',
    text: 'In what year was the first Indianapolis 500 held?',
    options: [{ value: 'a', label: '1901' }, { value: 'b', label: '1911' }, { value: 'c', label: '1921' }, { value: 'd', label: '1931' }],
    correct: 'b' },
  { id: 'e15', difficulty: 'easy', topic: 'teams',
    text: 'Which team is owned by Chip Ganassi?',
    options: [{ value: 'a', label: 'Chip Ganassi Racing' }, { value: 'b', label: 'Arrow McLaren' }, { value: 'c', label: 'Meyer Shank Racing' }, { value: 'd', label: 'Andretti Global' }],
    correct: 'a' },
  { id: 'e16', difficulty: 'easy', topic: 'circuits',
    text: 'What is the nickname of the Indianapolis Motor Speedway?',
    options: [{ value: 'a', label: 'The Monster Mile' }, { value: 'b', label: 'The Brickyard' }, { value: 'c', label: 'The Magic Mile' }, { value: 'd', label: 'The Lady in Black' }],
    correct: 'b' },
  { id: 'e17', difficulty: 'easy', topic: 'traditions',
    text: 'After winning at Indianapolis, drivers traditionally do what at the start-finish line?',
    options: [{ value: 'a', label: 'Kiss the bricks' }, { value: 'b', label: 'Light a cigar' }, { value: 'c', label: 'Wave a checkered flag' }, { value: 'd', label: 'Throw their helmet' }],
    correct: 'a' },
  { id: 'e18', difficulty: 'easy', topic: 'drivers',
    text: 'Scott Dixon races for which team?',
    options: [{ value: 'a', label: 'Team Penske' }, { value: 'b', label: 'Chip Ganassi Racing' }, { value: 'c', label: 'Arrow McLaren' }, { value: 'd', label: 'Andretti Global' }],
    correct: 'b' },
  { id: 'e19', difficulty: 'easy', topic: 'history',
    text: 'How many turns does the Indianapolis Motor Speedway oval have?',
    options: [{ value: 'a', label: '2' }, { value: 'b', label: '4' }, { value: 'c', label: '6' }, { value: 'd', label: '8' }],
    correct: 'b' },
  { id: 'e20', difficulty: 'easy', topic: 'drivers',
    text: 'Which legendary driver has 4 Indy 500 wins from 1961, 1964, 1967 and 1977?',
    options: [{ value: 'a', label: 'A.J. Foyt' }, { value: 'b', label: 'Mario Andretti' }, { value: 'c', label: 'Rick Mears' }, { value: 'd', label: 'Bobby Unser' }],
    correct: 'a' },
  { id: 'e21', difficulty: 'easy', topic: 'modern',
    text: 'Which series do top open-wheel single-seater races like the Indy 500 belong to?',
    options: [{ value: 'a', label: 'NASCAR' }, { value: 'b', label: 'IndyCar Series' }, { value: 'c', label: 'IMSA' }, { value: 'd', label: 'Formula 1' }],
    correct: 'b' },
  { id: 'e22', difficulty: 'easy', topic: 'teams',
    text: 'Which iconic IndyCar team is owned by Michael Andretti\'s family business?',
    options: [{ value: 'a', label: 'Andretti Global' }, { value: 'b', label: 'Rahal Letterman Lanigan' }, { value: 'c', label: 'Meyer Shank Racing' }, { value: 'd', label: 'Ed Carpenter Racing' }],
    correct: 'a' },
  { id: 'e23', difficulty: 'easy', topic: 'drivers',
    text: 'Which Brazilian driver won the Indy 500 in back-to-back years 2001 and 2002?',
    options: [{ value: 'a', label: 'Tony Kanaan' }, { value: 'b', label: 'Helio Castroneves' }, { value: 'c', label: 'Gil de Ferran' }, { value: 'd', label: 'Rubens Barrichello' }],
    correct: 'b' },
  { id: 'e24', difficulty: 'easy', topic: 'history',
    text: 'The first Indy 500 was won by which driver in 1911?',
    options: [{ value: 'a', label: 'Louis Meyer' }, { value: 'b', label: 'Wilbur Shaw' }, { value: 'c', label: 'Ray Harroun' }, { value: 'd', label: 'Eddie Rickenbacker' }],
    correct: 'c' },
  { id: 'e25', difficulty: 'easy', topic: 'circuits',
    text: 'In which U.S. state is the Indianapolis Motor Speedway located?',
    options: [{ value: 'a', label: 'Ohio' }, { value: 'b', label: 'Illinois' }, { value: 'c', label: 'Indiana' }, { value: 'd', label: 'Kentucky' }],
    correct: 'c' },
  { id: 'e26', difficulty: 'easy', topic: 'teams',
    text: 'Which Japanese automaker is a current engine supplier in IndyCar?',
    options: [{ value: 'a', label: 'Toyota' }, { value: 'b', label: 'Honda' }, { value: 'c', label: 'Nissan' }, { value: 'd', label: 'Mazda' }],
    correct: 'b' },
  { id: 'e27', difficulty: 'easy', topic: 'teams',
    text: 'Which American automaker supplies engines to teams like Penske and Arrow McLaren?',
    options: [{ value: 'a', label: 'Ford' }, { value: 'b', label: 'Chevrolet' }, { value: 'c', label: 'Dodge' }, { value: 'd', label: 'Cadillac' }],
    correct: 'b' },
  { id: 'e28', difficulty: 'easy', topic: 'drivers',
    text: 'Which American driver won the Indy 500 in both 2023 and 2024 for Team Penske?',
    options: [{ value: 'a', label: 'Alexander Rossi' }, { value: 'b', label: 'Josef Newgarden' }, { value: 'c', label: 'Will Power' }, { value: 'd', label: 'Graham Rahal' }],
    correct: 'b' },
  { id: 'e29', difficulty: 'easy', topic: 'traditions',
    text: 'What is added to the Borg-Warner Trophy for every Indy 500 winner?',
    options: [{ value: 'a', label: 'The bricks' }, { value: 'b', label: 'A bas-relief sculpture of the winner' }, { value: 'c', label: 'A bronze helmet' }, { value: 'd', label: 'Their racing gloves' }],
    correct: 'b' },
  { id: 'e30', difficulty: 'easy', topic: 'drivers',
    text: 'Mario Andretti won the Indy 500 in which year?',
    options: [{ value: 'a', label: '1965' }, { value: 'b', label: '1969' }, { value: 'c', label: '1972' }, { value: 'd', label: '1978' }],
    correct: 'b' },
  { id: 'e31', difficulty: 'easy', topic: 'modern',
    text: 'IndyCars on ovals reach top speeds of approximately what?',
    options: [{ value: 'a', label: '150 mph' }, { value: 'b', label: '180 mph' }, { value: 'c', label: '220+ mph' }, { value: 'd', label: '300+ mph' }],
    correct: 'c' },
  { id: 'e32', difficulty: 'easy', topic: 'teams',
    text: 'Which team is co-owned by talk show host David Letterman?',
    options: [{ value: 'a', label: 'Rahal Letterman Lanigan Racing' }, { value: 'b', label: 'Meyer Shank Racing' }, { value: 'c', label: 'Ed Carpenter Racing' }, { value: 'd', label: 'Juncos Hollinger Racing' }],
    correct: 'a' },
  { id: 'e33', difficulty: 'easy', topic: '500-specific',
    text: 'The Indy 500 is part of which informal motorsport \'Triple Crown\'?',
    options: [{ value: 'a', label: 'Monaco GP, Le Mans, Indy 500' }, { value: 'b', label: 'Daytona 500, Indy 500, Brickyard 400' }, { value: 'c', label: 'Indy 500, Bathurst, Nürburgring 24h' }, { value: 'd', label: 'Indy 500, Le Mans, Daytona 500' }],
    correct: 'a' },
  { id: 'e34', difficulty: 'easy', topic: 'history',
    text: 'Indianapolis Motor Speedway opened in which year?',
    options: [{ value: 'a', label: '1899' }, { value: 'b', label: '1909' }, { value: 'c', label: '1919' }, { value: 'd', label: '1929' }],
    correct: 'b' },
  { id: 'e35', difficulty: 'easy', topic: 'drivers',
    text: 'Pato O\'Ward, a popular IndyCar driver, is from which country?',
    options: [{ value: 'a', label: 'Brazil' }, { value: 'b', label: 'Spain' }, { value: 'c', label: 'Mexico' }, { value: 'd', label: 'Argentina' }],
    correct: 'c' },
]

const MEDIUM: LapQuestion[] = [
  { id: 'm01', difficulty: 'medium', topic: '500-specific',
    text: 'Who won the 2020 Indianapolis 500?',
    options: [{ value: 'a', label: 'Takuma Sato' }, { value: 'b', label: 'Scott Dixon' }, { value: 'c', label: 'Alexander Rossi' }, { value: 'd', label: 'Simon Pagenaud' }],
    correct: 'a' },
  { id: 'm02', difficulty: 'medium', topic: '500-specific',
    text: 'Who won the 2022 Indianapolis 500?',
    options: [{ value: 'a', label: 'Pato O\'Ward' }, { value: 'b', label: 'Marcus Ericsson' }, { value: 'c', label: 'Scott Dixon' }, { value: 'd', label: 'Alex Palou' }],
    correct: 'b' },
  { id: 'm03', difficulty: 'medium', topic: '500-specific',
    text: 'Who won the 2025 Indianapolis 500?',
    options: [{ value: 'a', label: 'Pato O\'Ward' }, { value: 'b', label: 'Josef Newgarden' }, { value: 'c', label: 'Alex Palou' }, { value: 'd', label: 'Scott Dixon' }],
    correct: 'c' },
  { id: 'm04', difficulty: 'medium', topic: 'drivers',
    text: 'Alex Palou, the 2025 Indy 500 winner, is the first driver from which country to win it?',
    options: [{ value: 'a', label: 'Spain' }, { value: 'b', label: 'Italy' }, { value: 'c', label: 'France' }, { value: 'd', label: 'Portugal' }],
    correct: 'a' },
  { id: 'm05', difficulty: 'medium', topic: 'drivers',
    text: 'Which woman was the first to qualify for and race in the Indianapolis 500?',
    options: [{ value: 'a', label: 'Danica Patrick' }, { value: 'b', label: 'Janet Guthrie' }, { value: 'c', label: 'Lyn St. James' }, { value: 'd', label: 'Sarah Fisher' }],
    correct: 'b' },
  { id: 'm06', difficulty: 'medium', topic: 'drivers',
    text: 'In what year did Janet Guthrie become the first woman to race in the Indy 500?',
    options: [{ value: 'a', label: '1971' }, { value: 'b', label: '1974' }, { value: 'c', label: '1977' }, { value: 'd', label: '1982' }],
    correct: 'c' },
  { id: 'm07', difficulty: 'medium', topic: 'records',
    text: 'How many IndyCar series championships has Scott Dixon won?',
    options: [{ value: 'a', label: '4' }, { value: 'b', label: '5' }, { value: 'c', label: '6' }, { value: 'd', label: '7' }],
    correct: 'c' },
  { id: 'm08', difficulty: 'medium', topic: 'records',
    text: 'A.J. Foyt holds the record for most IndyCar championships with how many titles?',
    options: [{ value: 'a', label: '5' }, { value: 'b', label: '6' }, { value: 'c', label: '7' }, { value: 'd', label: '8' }],
    correct: 'c' },
  { id: 'm09', difficulty: 'medium', topic: 'modern',
    text: 'Which IndyCar driver won Season 5 of \'Dancing with the Stars\' in 2007?',
    options: [{ value: 'a', label: 'Tony Kanaan' }, { value: 'b', label: 'Helio Castroneves' }, { value: 'c', label: 'Dario Franchitti' }, { value: 'd', label: 'Sam Hornish Jr.' }],
    correct: 'b' },
  { id: 'm10', difficulty: 'medium', topic: 'technical',
    text: 'The IndyCar hybrid power unit debuted on which weekend in 2024?',
    options: [{ value: 'a', label: 'Long Beach' }, { value: 'b', label: 'Indianapolis 500' }, { value: 'c', label: 'Mid-Ohio' }, { value: 'd', label: 'Laguna Seca finale' }],
    correct: 'c' },
  { id: 'm11', difficulty: 'medium', topic: 'technical',
    text: 'IndyCar\'s push-to-pass overtake system is currently banned on which type of track?',
    options: [{ value: 'a', label: 'Street circuits' }, { value: 'b', label: 'Road courses' }, { value: 'c', label: 'Ovals' }, { value: 'd', label: 'Airfield tracks' }],
    correct: 'c' },
  { id: 'm12', difficulty: 'medium', topic: '500-specific',
    text: 'Who won the 2021 Indianapolis 500, securing his fourth career win?',
    options: [{ value: 'a', label: 'Scott Dixon' }, { value: 'b', label: 'Helio Castroneves' }, { value: 'c', label: 'Will Power' }, { value: 'd', label: 'Takuma Sato' }],
    correct: 'b' },
  { id: 'm13', difficulty: 'medium', topic: 'teams',
    text: 'Marcus Ericsson won the 2022 Indy 500 driving for which team?',
    options: [{ value: 'a', label: 'Team Penske' }, { value: 'b', label: 'Chip Ganassi Racing' }, { value: 'c', label: 'Andretti Autosport' }, { value: 'd', label: 'Arrow McLaren' }],
    correct: 'b' },
  { id: 'm14', difficulty: 'medium', topic: 'drivers',
    text: 'Marcus Ericsson, 2022 Indy 500 winner, is from which country?',
    options: [{ value: 'a', label: 'Sweden' }, { value: 'b', label: 'Finland' }, { value: 'c', label: 'Denmark' }, { value: 'd', label: 'Norway' }],
    correct: 'a' },
  { id: 'm15', difficulty: 'medium', topic: 'modern',
    text: 'Which IndyCar driver was paralyzed from the waist down after a 2018 crash at Pocono?',
    options: [{ value: 'a', label: 'James Hinchcliffe' }, { value: 'b', label: 'Robert Wickens' }, { value: 'c', label: 'Sebastien Bourdais' }, { value: 'd', label: 'Mikhail Aleshin' }],
    correct: 'b' },
  { id: 'm16', difficulty: 'medium', topic: 'safety',
    text: 'IndyCar driver Dan Wheldon tragically died in a 15-car crash at which oval in 2011?',
    options: [{ value: 'a', label: 'Texas Motor Speedway' }, { value: 'b', label: 'Las Vegas Motor Speedway' }, { value: 'c', label: 'Auto Club Speedway' }, { value: 'd', label: 'Homestead-Miami' }],
    correct: 'b' },
  { id: 'm17', difficulty: 'medium', topic: '500-specific',
    text: 'How many Indianapolis 500 victories did Dan Wheldon have at the time of his death?',
    options: [{ value: 'a', label: '1' }, { value: 'b', label: '2' }, { value: 'c', label: '3' }, { value: 'd', label: '4' }],
    correct: 'b' },
  { id: 'm18', difficulty: 'medium', topic: 'safety',
    text: 'IndyCar introduced its canopy-style cockpit protection device, known as the Aeroscreen, in which year?',
    options: [{ value: 'a', label: '2018' }, { value: 'b', label: '2019' }, { value: 'c', label: '2020' }, { value: 'd', label: '2022' }],
    correct: 'c' },
  { id: 'm19', difficulty: 'medium', topic: 'safety',
    text: 'IndyCar partnered with which F1-linked company to develop the Aeroscreen?',
    options: [{ value: 'a', label: 'Mercedes High Performance Powertrains' }, { value: 'b', label: 'Red Bull Advanced Technologies' }, { value: 'c', label: 'Ferrari Performance Engineering' }, { value: 'd', label: 'McLaren Applied' }],
    correct: 'b' },
  { id: 'm20', difficulty: 'medium', topic: 'records',
    text: 'Marco Andretti famously lost the 2006 Indy 500 to which driver on the final lap?',
    options: [{ value: 'a', label: 'Dan Wheldon' }, { value: 'b', label: 'Helio Castroneves' }, { value: 'c', label: 'Sam Hornish Jr.' }, { value: 'd', label: 'Scott Dixon' }],
    correct: 'c' },
  { id: 'm21', difficulty: 'medium', topic: 'history',
    text: 'How did Ray Harroun innovate in winning the very first Indy 500?',
    options: [{ value: 'a', label: 'He used the first turbocharger' }, { value: 'b', label: 'He used a rear-view mirror' }, { value: 'c', label: 'He used radio communication' }, { value: 'd', label: 'He drove with a co-driver' }],
    correct: 'b' },
  { id: 'm22', difficulty: 'medium', topic: 'modern',
    text: 'Who was the 2020 IndyCar series champion?',
    options: [{ value: 'a', label: 'Scott Dixon' }, { value: 'b', label: 'Josef Newgarden' }, { value: 'c', label: 'Alex Palou' }, { value: 'd', label: 'Will Power' }],
    correct: 'a' },
  { id: 'm23', difficulty: 'medium', topic: 'modern',
    text: 'Will Power, the 2022 IndyCar series champion, is from which country?',
    options: [{ value: 'a', label: 'New Zealand' }, { value: 'b', label: 'Australia' }, { value: 'c', label: 'Great Britain' }, { value: 'd', label: 'South Africa' }],
    correct: 'b' },
  { id: 'm24', difficulty: 'medium', topic: 'drivers',
    text: 'Justin Wilson was killed in 2015 after being struck by debris at which IndyCar oval?',
    options: [{ value: 'a', label: 'Texas' }, { value: 'b', label: 'Iowa' }, { value: 'c', label: 'Pocono' }, { value: 'd', label: 'Auto Club' }],
    correct: 'c' },
  { id: 'm25', difficulty: 'medium', topic: 'modern',
    text: 'For the 2026 season, Will Power moved from Team Penske to which team?',
    options: [{ value: 'a', label: 'Chip Ganassi Racing' }, { value: 'b', label: 'Andretti Global' }, { value: 'c', label: 'Arrow McLaren' }, { value: 'd', label: 'Rahal Letterman Lanigan' }],
    correct: 'b' },
  { id: 'm26', difficulty: 'medium', topic: 'modern',
    text: 'Which former F1 driver joined RLL Racing for 2026 in the #47 car?',
    options: [{ value: 'a', label: 'Romain Grosjean' }, { value: 'b', label: 'Mick Schumacher' }, { value: 'c', label: 'Marcus Ericsson' }, { value: 'd', label: 'Kevin Magnussen' }],
    correct: 'b' },
  { id: 'm27', difficulty: 'medium', topic: 'modern',
    text: 'Which oval was REMOVED from the 2026 IndyCar calendar?',
    options: [{ value: 'a', label: 'Texas' }, { value: 'b', label: 'Iowa Speedway' }, { value: 'c', label: 'Gateway' }, { value: 'd', label: 'Milwaukee' }],
    correct: 'b' },
  { id: 'm28', difficulty: 'medium', topic: 'drivers',
    text: 'Danica Patrick\'s best Indy 500 finish, achieved in 2005, was which position?',
    options: [{ value: 'a', label: '4th' }, { value: 'b', label: '7th' }, { value: 'c', label: '2nd' }, { value: 'd', label: '9th' }],
    correct: 'a' },
  { id: 'm29', difficulty: 'medium', topic: 'teams',
    text: 'Helio Castroneves won his historic 4th Indy 500 in 2021 driving for which team?',
    options: [{ value: 'a', label: 'Team Penske' }, { value: 'b', label: 'Meyer Shank Racing' }, { value: 'c', label: 'Chip Ganassi Racing' }, { value: 'd', label: 'Andretti Autosport' }],
    correct: 'b' },
  { id: 'm30', difficulty: 'medium', topic: 'records',
    text: 'How many career IndyCar Series championships has Alex Palou won through the end of 2025?',
    options: [{ value: 'a', label: '2' }, { value: 'b', label: '3' }, { value: 'c', label: '4' }, { value: 'd', label: '5' }],
    correct: 'c' },
  { id: 'm31', difficulty: 'medium', topic: 'circuits',
    text: 'Mid-Ohio Sports Car Course is which type of circuit?',
    options: [{ value: 'a', label: 'Oval' }, { value: 'b', label: 'Permanent road course' }, { value: 'c', label: 'Street circuit' }, { value: 'd', label: 'Superspeedway' }],
    correct: 'b' },
  { id: 'm32', difficulty: 'medium', topic: 'circuits',
    text: 'The Long Beach IndyCar race is held on what kind of track?',
    options: [{ value: 'a', label: 'Oval' }, { value: 'b', label: 'Road course' }, { value: 'c', label: 'Street circuit' }, { value: 'd', label: 'Airfield circuit' }],
    correct: 'c' },
  { id: 'm33', difficulty: 'medium', topic: 'history',
    text: 'The Indy 500 is run on which holiday weekend in the United States?',
    options: [{ value: 'a', label: 'Independence Day' }, { value: 'b', label: 'Labor Day' }, { value: 'c', label: 'Memorial Day' }, { value: 'd', label: 'Thanksgiving' }],
    correct: 'c' },
  { id: 'm34', difficulty: 'medium', topic: 'traditions',
    text: 'Drivers entered in the Indy 500 pre-select which milk preference for Victory Lane?',
    options: [{ value: 'a', label: 'Skim, 2%, or whole' }, { value: 'b', label: 'Soy, oat or almond' }, { value: 'c', label: 'Whole, almond or coconut' }, { value: 'd', label: 'Only whole milk is offered' }],
    correct: 'a' },
  { id: 'm35', difficulty: 'medium', topic: 'teams',
    text: 'Arrow McLaren\'s IndyCar program is the result of McLaren partnering with which team?',
    options: [{ value: 'a', label: 'Schmidt Peterson Motorsports' }, { value: 'b', label: 'Andretti Autosport' }, { value: 'c', label: 'Carlin' }, { value: 'd', label: 'Ed Carpenter Racing' }],
    correct: 'a' },
]

const HARD: LapQuestion[] = [
  { id: 'h01', difficulty: 'hard', topic: 'records',
    text: 'What is the all-time 4-lap qualifying record speed at Indianapolis, set by Arie Luyendyk in 1996?',
    options: [{ value: 'a', label: '232.482 mph' }, { value: 'b', label: '234.046 mph' }, { value: 'c', label: '236.986 mph' }, { value: 'd', label: '239.260 mph' }],
    correct: 'c' },
  { id: 'h02', difficulty: 'hard', topic: 'records',
    text: 'Scott Dixon set the official Indy 500 pole-position record in 2022 with what 4-lap average speed?',
    options: [{ value: 'a', label: '232.184 mph' }, { value: 'b', label: '233.546 mph' }, { value: 'c', label: '234.046 mph' }, { value: 'd', label: '236.986 mph' }],
    correct: 'c' },
  { id: 'h03', difficulty: 'hard', topic: 'records',
    text: 'Who is the youngest winner of the Indianapolis 500 at 22 years and 80 days?',
    options: [{ value: 'a', label: 'Marco Andretti' }, { value: 'b', label: 'Troy Ruttman' }, { value: 'c', label: 'Bill Vukovich' }, { value: 'd', label: 'Jim Clark' }],
    correct: 'b' },
  { id: 'h04', difficulty: 'hard', topic: 'records',
    text: 'Who is the oldest winner of the Indy 500, at 47 years and 360 days in 1987?',
    options: [{ value: 'a', label: 'A.J. Foyt' }, { value: 'b', label: 'Rick Mears' }, { value: 'c', label: 'Al Unser' }, { value: 'd', label: 'Bobby Unser' }],
    correct: 'c' },
  { id: 'h05', difficulty: 'hard', topic: 'circuits',
    text: 'What is the banking angle of the corners at Indianapolis Motor Speedway?',
    options: [{ value: 'a', label: '4°' }, { value: 'b', label: '9°12\'' }, { value: 'c', label: '18°' }, { value: 'd', label: '24°' }],
    correct: 'b' },
  { id: 'h06', difficulty: 'hard', topic: 'circuits',
    text: 'Each of IMS\'s 4 corners covers what length?',
    options: [{ value: 'a', label: '0.10 mi' }, { value: 'b', label: '0.25 mi' }, { value: 'c', label: '0.40 mi' }, { value: 'd', label: '0.625 mi' }],
    correct: 'b' },
  { id: 'h07', difficulty: 'hard', topic: 'circuits',
    text: 'How long are each of the two main straights at Indianapolis Motor Speedway?',
    options: [{ value: 'a', label: '0.375 mi' }, { value: 'b', label: '0.500 mi' }, { value: 'c', label: '0.625 mi' }, { value: 'd', label: '0.750 mi' }],
    correct: 'c' },
  { id: 'h08', difficulty: 'hard', topic: 'traditions',
    text: 'In which year was the Borg-Warner Trophy first awarded to an Indy 500 winner?',
    options: [{ value: 'a', label: '1911' }, { value: 'b', label: '1925' }, { value: 'c', label: '1936' }, { value: 'd', label: '1946' }],
    correct: 'c' },
  { id: 'h09', difficulty: 'hard', topic: 'traditions',
    text: 'Which driver was the first to receive the Borg-Warner Trophy in 1936?',
    options: [{ value: 'a', label: 'Wilbur Shaw' }, { value: 'b', label: 'Louis Meyer' }, { value: 'c', label: 'Ray Harroun' }, { value: 'd', label: 'Mauri Rose' }],
    correct: 'b' },
  { id: 'h10', difficulty: 'hard', topic: 'traditions',
    text: 'The tradition of kissing the bricks at IMS actually started in 1996 from which race and driver?',
    options: [{ value: 'a', label: 'Indy 500 winner Buddy Lazier' }, { value: 'b', label: 'NASCAR Brickyard 400 winner Dale Jarrett' }, { value: 'c', label: 'Brickyard 400 winner Jeff Gordon' }, { value: 'd', label: 'Indy 500 polesitter Scott Brayton' }],
    correct: 'b' },
  { id: 'h11', difficulty: 'hard', topic: 'technical',
    text: 'What is the current IndyCar engine specification used by Honda and Chevrolet?',
    options: [{ value: 'a', label: '2.4L V8 naturally aspirated' }, { value: 'b', label: '2.2L twin-turbo V6' }, { value: 'c', label: '1.6L turbo V6 hybrid' }, { value: 'd', label: '3.5L V10' }],
    correct: 'b' },
  { id: 'h12', difficulty: 'hard', topic: 'technical',
    text: 'IndyCars have used a universal aero kit since which year?',
    options: [{ value: 'a', label: '2012' }, { value: 'b', label: '2015' }, { value: 'c', label: '2018' }, { value: 'd', label: '2021' }],
    correct: 'c' },
  { id: 'h13', difficulty: 'hard', topic: 'technical',
    text: 'The current IndyCar chassis built by Dallara is known by which designation?',
    options: [{ value: 'a', label: 'IR-12' }, { value: 'b', label: 'IR-18' }, { value: 'c', label: 'IR-22' }, { value: 'd', label: 'IR-25' }],
    correct: 'b' },
  { id: 'h14', difficulty: 'hard', topic: 'technical',
    text: 'Approximately how much extra horsepower does IndyCar\'s push-to-pass deliver?',
    options: [{ value: 'a', label: '20 hp' }, { value: 'b', label: '60 hp' }, { value: 'c', label: '120 hp' }, { value: 'd', label: '200 hp' }],
    correct: 'b' },
  { id: 'h15', difficulty: 'hard', topic: 'technical',
    text: 'The IndyCar hybrid system uses what type of energy storage?',
    options: [{ value: 'a', label: 'Lithium-ion battery' }, { value: 'b', label: 'Flywheel KERS' }, { value: 'c', label: 'Ultracapacitor' }, { value: 'd', label: 'Solid-state battery' }],
    correct: 'c' },
  { id: 'h16', difficulty: 'hard', topic: 'history',
    text: 'What was the average speed of Ray Harroun\'s winning run in the 1911 Indy 500?',
    options: [{ value: 'a', label: '62.21 mph' }, { value: 'b', label: '74.59 mph' }, { value: 'c', label: '85.42 mph' }, { value: 'd', label: '101.13 mph' }],
    correct: 'b' },
  { id: 'h17', difficulty: 'hard', topic: 'history',
    text: 'Ray Harroun\'s winning Marmon Wasp in 1911 wore which yellow car number?',
    options: [{ value: 'a', label: '7' }, { value: 'b', label: '14' }, { value: 'c', label: '32' }, { value: 'd', label: '99' }],
    correct: 'c' },
  { id: 'h18', difficulty: 'hard', topic: 'drivers',
    text: 'By exactly what margin did Marco Andretti lose the 2006 Indy 500 to Sam Hornish Jr. on the final lap?',
    options: [{ value: 'a', label: '0.0162 sec' }, { value: 'b', label: '0.0635 sec' }, { value: 'c', label: '0.1130 sec' }, { value: 'd', label: '0.2350 sec' }],
    correct: 'b' },
  { id: 'h19', difficulty: 'hard', topic: 'traditions',
    text: 'Which singer performed \'Back Home Again in Indiana\' before the Indy 500 a record 36 times between 1972 and 2014?',
    options: [{ value: 'a', label: 'Jim Nabors' }, { value: 'b', label: 'Florence Henderson' }, { value: 'c', label: 'Jim Cornelison' }, { value: 'd', label: 'Wayne Newton' }],
    correct: 'a' },
  { id: 'h20', difficulty: 'hard', topic: 'modern',
    text: 'By how many points did Alex Palou clinch the 2025 IndyCar championship over Pato O\'Ward, a modern-era record?',
    options: [{ value: 'a', label: '88' }, { value: 'b', label: '142' }, { value: 'c', label: '196' }, { value: 'd', label: '244' }],
    correct: 'c' },
  { id: 'h21', difficulty: 'hard', topic: 'modern',
    text: 'For the 2026 IndyCar season, which driver replaced Will Power at Team Penske?',
    options: [{ value: 'a', label: 'Rinus VeeKay' }, { value: 'b', label: 'Christian Lundgaard' }, { value: 'c', label: 'David Malukas' }, { value: 'd', label: 'Kyle Kirkwood' }],
    correct: 'c' },
  { id: 'h22', difficulty: 'hard', topic: 'modern',
    text: 'Which former Andretti IndyCar driver was named a Cadillac F1 test driver after leaving the team in 2025?',
    options: [{ value: 'a', label: 'Colton Herta' }, { value: 'b', label: 'Kyle Kirkwood' }, { value: 'c', label: 'Marcus Ericsson' }, { value: 'd', label: 'Marco Andretti' }],
    correct: 'a' },
  { id: 'h23', difficulty: 'hard', topic: 'modern',
    text: 'Which former F1 driver joined Dale Coyne Racing for the 2026 IndyCar season?',
    options: [{ value: 'a', label: 'Daniil Kvyat' }, { value: 'b', label: 'Romain Grosjean' }, { value: 'c', label: 'Pietro Fittipaldi' }, { value: 'd', label: 'Felipe Nasr' }],
    correct: 'b' },
  { id: 'h24', difficulty: 'hard', topic: 'modern',
    text: 'In which IMSA series did Robert Wickens return to competition in 2023 using hand controls?',
    options: [{ value: 'a', label: 'IMSA WeatherTech SportsCar Championship' }, { value: 'b', label: 'IMSA Pilot Challenge TCR' }, { value: 'c', label: 'Trans Am Series' }, { value: 'd', label: 'IMSA Prototype Challenge' }],
    correct: 'b' },
  { id: 'h25', difficulty: 'hard', topic: 'modern',
    text: 'Which driver claimed victory in IndyCar\'s first race with the hybrid power unit at Mid-Ohio in July 2024?',
    options: [{ value: 'a', label: 'Scott Dixon' }, { value: 'b', label: 'Pato O\'Ward' }, { value: 'c', label: 'Josef Newgarden' }, { value: 'd', label: 'Alex Palou' }],
    correct: 'b' },
  { id: 'h26', difficulty: 'hard', topic: 'records',
    text: 'How many career Indy 500 wins did Al Unser, Rick Mears, A.J. Foyt and Helio Castroneves each accumulate?',
    options: [{ value: 'a', label: '3 each' }, { value: 'b', label: '4 each' }, { value: 'c', label: '5 each' }, { value: 'd', label: 'Different totals each' }],
    correct: 'b' },
  { id: 'h27', difficulty: 'hard', topic: 'traditions',
    text: 'The milk-in-Victory-Lane tradition began in 1936 after which driver drank buttermilk after winning?',
    options: [{ value: 'a', label: 'Wilbur Shaw' }, { value: 'b', label: 'Louis Meyer' }, { value: 'c', label: 'Mauri Rose' }, { value: 'd', label: 'Tony Hulman' }],
    correct: 'b' },
  { id: 'h28', difficulty: 'hard', topic: 'history',
    text: 'In what year did Janet Guthrie finish 9th at the Indy 500, the best result by a woman until Danica Patrick in 2005?',
    options: [{ value: 'a', label: '1976' }, { value: 'b', label: '1977' }, { value: 'c', label: '1978' }, { value: 'd', label: '1981' }],
    correct: 'c' },
  { id: 'h29', difficulty: 'hard', topic: 'history',
    text: 'Alex Palou\'s 2025 Indy 500 and championship double was the first by any driver since which year?',
    options: [{ value: 'a', label: '2005' }, { value: 'b', label: '2008' }, { value: 'c', label: '2010' }, { value: 'd', label: '2014' }],
    correct: 'c' },
  { id: 'h30', difficulty: 'hard', topic: 'safety',
    text: 'IndyCar\'s Aeroscreen combines a titanium halo with what other key material?',
    options: [{ value: 'a', label: 'Carbon fiber mesh' }, { value: 'b', label: 'Kevlar weave' }, { value: 'c', label: 'Ballistic polycarbonate' }, { value: 'd', label: 'Tempered Gorilla Glass' }],
    correct: 'c' },
]

export const ALL_QUESTIONS: LapQuestion[] = [...EASY, ...MEDIUM, ...HARD]

// ── Lap builder: 10 easy + 10 medium + 10 hard (in difficulty order) ──────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildLap(): LapQuestion[] {
  return [
    ...shuffle(EASY).slice(0, QUESTIONS_PER_SECTOR),
    ...shuffle(MEDIUM).slice(0, QUESTIONS_PER_SECTOR),
    ...shuffle(HARD).slice(0, QUESTIONS_PER_SECTOR),
  ]
}

// ── Sector mapping (Q-index → 1/2/3) ───────────────────────────────────────────
export function getSector(index: number): 1 | 2 | 3 {
  if (index < QUESTIONS_PER_SECTOR) return 1
  if (index < QUESTIONS_PER_SECTOR * 2) return 2
  return 3
}

export const SECTOR_NAMES = {
  1: 'Front Straight',
  2: 'Turn 1',
  3: 'Yard of Bricks',
} as const

// ── Timing helpers ────────────────────────────────────────────────────────────
export function formatLapTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes      = Math.floor(totalSeconds / 60)
  const seconds      = totalSeconds % 60
  const millis       = ms % 1000
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
}

export function computeLapMs(sectors: SectorResult[]): number {
  return sectors.reduce((sum, s) => sum + s.timeMsTotal, 0)
}

export function scoreSector(
  timeMsRaw: number,
  correct: boolean,
  timedOut: boolean
): SectorResult['timeMsTotal'] {
  const base    = Math.min(timeMsRaw, TIME_PER_Q_MS)
  const penalty = (!correct || timedOut) ? PENALTY_MS : 0
  return base + penalty
}

// ── Locale-aware projection ───────────────────────────────────────────────────
/**
 * Returns a copy of the question with `text` and `options[].label` swapped to
 * the requested locale. English is the source — for `en`, returns the input
 * unchanged. Falls back gracefully to English if any translation is missing.
 */
export function localizeQuestion(q: LapQuestion, locale: Locale): LapQuestion {
  if (locale === 'en') return q
  const tr = TRANSLATIONS[locale]?.[q.id]
  if (!tr) return q
  return {
    ...q,
    text: tr.text,
    options: q.options.map((opt, i) => ({
      value: opt.value,
      label: tr.options[i] ?? opt.label,
    })),
  }
}
