/**
 * Vrooooom Hot Lap — F1 Knowledge Time Trial
 * ─────────────────────────────────────────────────────────────────────────────
 * 30 questions in pool. Each lap = 10 randomly selected questions.
 * Sector 1 (Q1-3): Easy   | Sector 2 (Q4-7): Medium | Sector 3 (Q8-10): Hard
 *
 * Timing:
 *   - 20 seconds per question
 *   - Sector time = actual time taken in ms (capped at 20 000 if timed out)
 *   - Wrong answer or timeout: +5 000 ms penalty
 *   - Total lap time = sum of all 10 sector times
 *   - Format: M:SS.mmm  (e.g. 1:23.456)
 */

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface LapQuestion {
  id:        string
  text:      string
  options:   { value: string; label: string }[]
  correct:   string
  difficulty: Difficulty
  topic:     string
}

export interface SectorResult {
  questionId:  string
  timeMsRaw:   number   // actual ms taken (20 000 if timed out)
  timeMsTotal: number   // + 5 000 penalty if wrong/timeout
  correct:     boolean
  timedOut:    boolean
  answer:      string | null
}

export interface LapResult {
  name:       string
  email:      string
  sectors:    SectorResult[]
  totalMs:    number
  lapTime:    string    // formatted "M:SS.mmm"
  rank?:      number
  trackRecord?: number  // fastest all-time in ms
}

// ── Constants ──────────────────────────────────────────────────────────────────
export const TIME_PER_Q_MS  = 20_000
export const PENALTY_MS     = 5_000
export const QUESTIONS_PER_LAP = 10

// ── Question bank (30 questions) ───────────────────────────────────────────────

const EASY: LapQuestion[] = [
  {
    id: 'e1', difficulty: 'easy', topic: '2025 season',
    text: 'Which team did Lewis Hamilton join for the 2025 Formula 1 season?',
    options: [{ value: 'a', label: 'Mercedes' }, { value: 'b', label: 'McLaren' }, { value: 'c', label: 'Ferrari' }, { value: 'd', label: 'Aston Martin' }],
    correct: 'c',
  },
  {
    id: 'e2', difficulty: 'easy', topic: '2025 season',
    text: 'Who won the 2025 F1 Drivers\' Championship?',
    options: [{ value: 'a', label: 'Max Verstappen' }, { value: 'b', label: 'Oscar Piastri' }, { value: 'c', label: 'Lando Norris' }, { value: 'd', label: 'Charles Leclerc' }],
    correct: 'c',
  },
  {
    id: 'e3', difficulty: 'easy', topic: 'rules',
    text: 'How many points does a driver receive for winning a race?',
    options: [{ value: 'a', label: '10' }, { value: 'b', label: '20' }, { value: 'c', label: '25' }, { value: 'd', label: '30' }],
    correct: 'c',
  },
  {
    id: 'e4', difficulty: 'easy', topic: 'technical',
    text: 'What does DRS stand for in Formula 1?',
    options: [{ value: 'a', label: 'Dynamic Racing Suspension' }, { value: 'b', label: 'Drag Reduction System' }, { value: 'c', label: 'Direct Response Speed' }, { value: 'd', label: 'Driver Regulation Safety' }],
    correct: 'b',
  },
  {
    id: 'e5', difficulty: 'easy', topic: 'drivers',
    text: 'Which team does Max Verstappen drive for?',
    options: [{ value: 'a', label: 'Mercedes' }, { value: 'b', label: 'McLaren' }, { value: 'c', label: 'Ferrari' }, { value: 'd', label: 'Red Bull Racing' }],
    correct: 'd',
  },
  {
    id: 'e6', difficulty: 'easy', topic: 'circuits',
    text: 'The British Grand Prix is held at which circuit?',
    options: [{ value: 'a', label: 'Brands Hatch' }, { value: 'b', label: 'Silverstone' }, { value: 'c', label: 'Donington Park' }, { value: 'd', label: 'Thruxton' }],
    correct: 'b',
  },
  {
    id: 'e7', difficulty: 'easy', topic: 'rules',
    text: 'How many teams compete on the current Formula 1 grid?',
    options: [{ value: 'a', label: '8' }, { value: 'b', label: '10' }, { value: 'c', label: '12' }, { value: 'd', label: '14' }],
    correct: 'b',
  },
  {
    id: 'e8', difficulty: 'easy', topic: 'circuits',
    text: 'Which Italian circuit is nicknamed "The Temple of Speed"?',
    options: [{ value: 'a', label: 'Imola' }, { value: 'b', label: 'Mugello' }, { value: 'c', label: 'Monza' }, { value: 'd', label: 'Vallelunga' }],
    correct: 'c',
  },
  {
    id: 'e9', difficulty: 'easy', topic: 'drivers',
    text: 'Which nationality is Lando Norris?',
    options: [{ value: 'a', label: 'Australian' }, { value: 'b', label: 'Belgian' }, { value: 'c', label: 'Portuguese' }, { value: 'd', label: 'British' }],
    correct: 'd',
  },
  {
    id: 'e10', difficulty: 'easy', topic: '2025 season',
    text: 'Which Australian driver was runner-up in the 2025 F1 championship race for much of the season?',
    options: [{ value: 'a', label: 'Daniel Ricciardo' }, { value: 'b', label: 'Mark Webber' }, { value: 'c', label: 'Oscar Piastri' }, { value: 'd', label: 'Jack Doohan' }],
    correct: 'c',
  },
]

const MEDIUM: LapQuestion[] = [
  {
    id: 'm1', difficulty: 'medium', topic: 'technical',
    text: 'In what year did the current hybrid power unit era begin in Formula 1?',
    options: [{ value: 'a', label: '2010' }, { value: 'b', label: '2012' }, { value: 'c', label: '2014' }, { value: 'd', label: '2016' }],
    correct: 'c',
  },
  {
    id: 'm2', difficulty: 'medium', topic: '2025 season',
    text: 'Which driver scored their very first F1 podium in their 239th race start in 2025?',
    options: [{ value: 'a', label: 'Fernando Alonso' }, { value: 'b', label: 'Valtteri Bottas' }, { value: 'c', label: 'Nico Hülkenberg' }, { value: 'd', label: 'Kevin Magnussen' }],
    correct: 'c',
  },
  {
    id: 'm3', difficulty: 'medium', topic: '2025 season',
    text: 'Who replaced Lewis Hamilton at Mercedes for the 2025 season?',
    options: [{ value: 'a', label: 'George Russell' }, { value: 'b', label: 'Kimi Antonelli' }, { value: 'c', label: 'Carlos Sainz' }, { value: 'd', label: 'Franco Colapinto' }],
    correct: 'b',
  },
  {
    id: 'm4', difficulty: 'medium', topic: '2025 season',
    text: 'Which team won the 2025 F1 Constructors\' Championship?',
    options: [{ value: 'a', label: 'Red Bull' }, { value: 'b', label: 'Ferrari' }, { value: 'c', label: 'Mercedes' }, { value: 'd', label: 'McLaren' }],
    correct: 'd',
  },
  {
    id: 'm5', difficulty: 'medium', topic: 'history',
    text: 'How many F1 World Championships does Lewis Hamilton hold?',
    options: [{ value: 'a', label: '5' }, { value: 'b', label: '6' }, { value: 'c', label: '7' }, { value: 'd', label: '8' }],
    correct: 'c',
  },
  {
    id: 'm6', difficulty: 'medium', topic: 'history',
    text: 'How many races did Max Verstappen win in his record-breaking 2023 season?',
    options: [{ value: 'a', label: '15' }, { value: 'b', label: '17' }, { value: 'c', label: '19' }, { value: 'd', label: '21' }],
    correct: 'c',
  },
  {
    id: 'm7', difficulty: 'medium', topic: 'technical',
    text: 'What does KERS stand for?',
    options: [{ value: 'a', label: 'Kinetic Energy Recovery System' }, { value: 'b', label: 'Key Engine Response System' }, { value: 'c', label: 'Kinematic Exhaust Regulation Standard' }, { value: 'd', label: 'Kinetic Electric Racing System' }],
    correct: 'a',
  },
  {
    id: 'm8', difficulty: 'medium', topic: 'history',
    text: 'How old was Sebastian Vettel when he became the youngest F1 World Champion in 2010?',
    options: [{ value: 'a', label: '21' }, { value: 'b', label: '22' }, { value: 'c', label: '23' }, { value: 'd', label: '24' }],
    correct: 'c',
  },
  {
    id: 'm9', difficulty: 'medium', topic: 'circuits',
    text: 'The Suzuka Grand Prix is held in which country?',
    options: [{ value: 'a', label: 'South Korea' }, { value: 'b', label: 'China' }, { value: 'c', label: 'Japan' }, { value: 'd', label: 'Singapore' }],
    correct: 'c',
  },
  {
    id: 'm10', difficulty: 'medium', topic: '2025 season',
    text: 'By how many points did Lando Norris beat Max Verstappen to win the 2025 championship?',
    options: [{ value: 'a', label: '1' }, { value: 'b', label: '2' }, { value: 'c', label: '5' }, { value: 'd', label: '10' }],
    correct: 'b',
  },
]

const HARD: LapQuestion[] = [
  {
    id: 'h1', difficulty: 'hard', topic: 'history',
    text: 'Which F1 constructor has won the most Constructors\' Championships in history?',
    options: [{ value: 'a', label: 'McLaren' }, { value: 'b', label: 'Williams' }, { value: 'c', label: 'Ferrari' }, { value: 'd', label: 'Red Bull' }],
    correct: 'c',
  },
  {
    id: 'h2', difficulty: 'hard', topic: 'technical',
    text: 'How many cylinders does a current Formula 1 power unit\'s internal combustion engine have?',
    options: [{ value: 'a', label: '4' }, { value: 'b', label: '6' }, { value: 'c', label: '8' }, { value: 'd', label: '10' }],
    correct: 'b',
  },
  {
    id: 'h3', difficulty: 'hard', topic: 'history',
    text: 'Who was the last McLaren driver before Lando Norris to win the F1 Drivers\' Championship?',
    options: [{ value: 'a', label: 'Mika Häkkinen' }, { value: 'b', label: 'David Coulthard' }, { value: 'c', label: 'Lewis Hamilton' }, { value: 'd', label: 'Jenson Button' }],
    correct: 'c',
  },
  {
    id: 'h4', difficulty: 'hard', topic: 'history',
    text: 'Which driver holds the all-time record for the most fastest laps in Formula 1?',
    options: [{ value: 'a', label: 'Michael Schumacher' }, { value: 'b', label: 'Lewis Hamilton' }, { value: 'c', label: 'Alain Prost' }, { value: 'd', label: 'Kimi Räikkönen' }],
    correct: 'd',
  },
  {
    id: 'h5', difficulty: 'hard', topic: 'history',
    text: 'In which year was the Formula 1 World Championship first held?',
    options: [{ value: 'a', label: '1948' }, { value: 'b', label: '1950' }, { value: 'c', label: '1952' }, { value: 'd', label: '1955' }],
    correct: 'b',
  },
  {
    id: 'h6', difficulty: 'hard', topic: 'history',
    text: 'Fernando Alonso won both his World Championships driving for which team?',
    options: [{ value: 'a', label: 'McLaren' }, { value: 'b', label: 'Ferrari' }, { value: 'c', label: 'Renault' }, { value: 'd', label: 'Honda' }],
    correct: 'c',
  },
  {
    id: 'h7', difficulty: 'hard', topic: 'history',
    text: 'Max Verstappen won his first F1 World Championship at which Grand Prix?',
    options: [{ value: 'a', label: 'Brazilian GP' }, { value: 'b', label: 'Saudi Arabian GP' }, { value: 'c', label: 'Abu Dhabi GP' }, { value: 'd', label: 'Japanese GP' }],
    correct: 'c',
  },
  {
    id: 'h8', difficulty: 'hard', topic: 'circuits',
    text: 'Which circuit features the iconic high-speed "130R" corner?',
    options: [{ value: 'a', label: 'Spa-Francorchamps' }, { value: 'b', label: 'Monza' }, { value: 'c', label: 'Suzuka' }, { value: 'd', label: 'Barcelona' }],
    correct: 'c',
  },
  {
    id: 'h9', difficulty: 'hard', topic: 'history',
    text: 'In which year did Ayrton Senna win his last F1 World Championship?',
    options: [{ value: 'a', label: '1989' }, { value: 'b', label: '1990' }, { value: 'c', label: '1991' }, { value: 'd', label: '1992' }],
    correct: 'c',
  },
  {
    id: 'h10', difficulty: 'hard', topic: 'history',
    text: 'Who was the first Formula 1 World Champion, winning in 1950?',
    options: [{ value: 'a', label: 'Juan Manuel Fangio' }, { value: 'b', label: 'Giuseppe Farina' }, { value: 'c', label: 'Alberto Ascari' }, { value: 'd', label: 'Stirling Moss' }],
    correct: 'b',
  },
]

export const ALL_QUESTIONS: LapQuestion[] = [...EASY, ...MEDIUM, ...HARD]

// ── Lap builder: picks 3 easy + 4 medium + 3 hard ─────────────────────────────

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
    ...shuffle(EASY).slice(0, 3),
    ...shuffle(MEDIUM).slice(0, 4),
    ...shuffle(HARD).slice(0, 3),
  ]
}

// ── Sector labelling ──────────────────────────────────────────────────────────
export function getSector(index: number): 1 | 2 | 3 {
  if (index <= 2) return 1
  if (index <= 6) return 2
  return 3
}

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

// ── Lap time colouring (like F1 timing screens) ───────────────────────────────
export type SectorColor = 'purple' | 'green' | 'yellow' | 'red'

export function sectorColor(ms: number, personalBest: number | null, trackRecord: number | null): SectorColor {
  if (trackRecord !== null && ms <= trackRecord) return 'purple'
  if (personalBest !== null && ms <= personalBest) return 'green'
  if (ms < TIME_PER_Q_MS) return 'yellow'
  return 'red'
}
