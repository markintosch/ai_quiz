/**
 * Nordschleife — Green Hell Time Trial
 * ─────────────────────────────────────────────────────────────────────────────
 * 100-question pool. Each lap = 30 randomly selected questions.
 * Sector 1 (Q1-10):  Easy   — "Hatzenbach"
 * Sector 2 (Q11-20): Medium — "Karussell"
 * Sector 3 (Q21-30): Hard   — "Döttinger Höhe"
 *
 * Timing:
 *   - 15 seconds per question
 *   - Sector time = ms taken (capped at 15 000 if timed out)
 *   - Wrong answer or timeout: +5 000 ms penalty
 *   - Total lap time = sum of all 30 sector times
 *   - Format: M:SS.mmm  (e.g. 7:23.456)
 */

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
  timeMsRaw:   number   // actual ms taken (25 000 if timed out)
  timeMsTotal: number   // + 8 000 penalty if wrong/timeout
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
export const PAID_PRODUCT_SLUG     = 'nordschleife-5-laps'
export const CREDIT_COOKIE_NAME    = 'ns_credits'
export const CREDIT_COOKIE_TTL_DAYS = 30
export const FREE_STORAGE_KEY      = 'nordschleife_free_used'

// ── Question pool (100 questions) ─────────────────────────────────────────────

const EASY: LapQuestion[] = [
  { id: 'e01', difficulty: 'easy', topic: 'geography',
    text: 'In which country is the Nordschleife located?',
    options: [{ value: 'a', label: 'Belgium' }, { value: 'b', label: 'Germany' }, { value: 'c', label: 'Austria' }, { value: 'd', label: 'Netherlands' }],
    correct: 'b' },
  { id: 'e02', difficulty: 'easy', topic: 'geography',
    text: 'The Nordschleife is approximately how long?',
    options: [{ value: 'a', label: '5 km' }, { value: 'b', label: '12 km' }, { value: 'c', label: '21 km' }, { value: 'd', label: '35 km' }],
    correct: 'c' },
  { id: 'e03', difficulty: 'easy', topic: 'culture',
    text: 'The Nordschleife\'s famous nickname is…',
    options: [{ value: 'a', label: 'The Green Hell' }, { value: 'b', label: 'The Magic Mile' }, { value: 'c', label: 'The Temple of Speed' }, { value: 'd', label: 'The Cathedral' }],
    correct: 'a' },
  { id: 'e04', difficulty: 'easy', topic: 'culture',
    text: 'Which F1 World Champion coined the "Green Hell" nickname?',
    options: [{ value: 'a', label: 'Niki Lauda' }, { value: 'b', label: 'Jackie Stewart' }, { value: 'c', label: 'Jim Clark' }, { value: 'd', label: 'James Hunt' }],
    correct: 'b' },
  { id: 'e05', difficulty: 'easy', topic: 'geography',
    text: 'The Nordschleife is part of which larger circuit complex?',
    options: [{ value: 'a', label: 'Spa-Francorchamps' }, { value: 'b', label: 'Hockenheimring' }, { value: 'c', label: 'Nürburgring' }, { value: 'd', label: 'Sachsenring' }],
    correct: 'c' },
  { id: 'e06', difficulty: 'easy', topic: 'geography',
    text: 'In which mountain range is the Nordschleife located?',
    options: [{ value: 'a', label: 'The Alps' }, { value: 'b', label: 'The Black Forest' }, { value: 'c', label: 'The Harz' }, { value: 'd', label: 'The Eifel' }],
    correct: 'd' },
  { id: 'e07', difficulty: 'easy', topic: 'corners',
    text: 'Which iconic banked corner gives drivers a head-rattling concrete ride?',
    options: [{ value: 'a', label: 'Karussell' }, { value: 'b', label: 'Bergwerk' }, { value: 'c', label: 'Flugplatz' }, { value: 'd', label: 'Hatzenbach' }],
    correct: 'a' },
  { id: 'e08', difficulty: 'easy', topic: 'culture',
    text: '"Nordschleife" literally translates to which English phrase?',
    options: [{ value: 'a', label: 'North Loop' }, { value: 'b', label: 'Green Track' }, { value: 'c', label: 'Devil\'s Curve' }, { value: 'd', label: 'Old Course' }],
    correct: 'a' },
  { id: 'e09', difficulty: 'easy', topic: '24h',
    text: 'How long is the famous endurance race held at the Nürburgring each year?',
    options: [{ value: 'a', label: '6 hours' }, { value: 'b', label: '12 hours' }, { value: 'c', label: '24 hours' }, { value: 'd', label: '48 hours' }],
    correct: 'c' },
  { id: 'e10', difficulty: 'easy', topic: 'lauda',
    text: 'Which Formula 1 driver suffered a near-fatal crash at the Nordschleife in 1976?',
    options: [{ value: 'a', label: 'James Hunt' }, { value: 'b', label: 'Niki Lauda' }, { value: 'c', label: 'Jody Scheckter' }, { value: 'd', label: 'Mario Andretti' }],
    correct: 'b' },
  { id: 'e11', difficulty: 'easy', topic: 'lauda',
    text: 'Which team did Niki Lauda drive for at the time of his 1976 Nordschleife crash?',
    options: [{ value: 'a', label: 'McLaren' }, { value: 'b', label: 'Lotus' }, { value: 'c', label: 'Brabham' }, { value: 'd', label: 'Ferrari' }],
    correct: 'd' },
  { id: 'e12', difficulty: 'easy', topic: 'history',
    text: 'In which decade did the Nürburgring first open?',
    options: [{ value: 'a', label: '1900s' }, { value: 'b', label: '1920s' }, { value: 'c', label: '1940s' }, { value: 'd', label: '1960s' }],
    correct: 'b' },
  { id: 'e13', difficulty: 'easy', topic: 'tourist',
    text: '"Touristenfahrten" at the Nordschleife means…',
    options: [{ value: 'a', label: 'Private factory test sessions' }, { value: 'b', label: 'Public laps anyone can buy a ticket for' }, { value: 'c', label: 'Pre-race driver parades' }, { value: 'd', label: 'Charity runs only' }],
    correct: 'b' },
  { id: 'e14', difficulty: 'easy', topic: 'corners',
    text: 'Which corner name translates to "mine" — and was the scene of Lauda\'s 1976 fire?',
    options: [{ value: 'a', label: 'Pflanzgarten' }, { value: 'b', label: 'Bergwerk' }, { value: 'c', label: 'Schwedenkreuz' }, { value: 'd', label: 'Brünnchen' }],
    correct: 'b' },
  { id: 'e15', difficulty: 'easy', topic: 'corners',
    text: '"Flugplatz" literally translates to…',
    options: [{ value: 'a', label: 'Flower garden' }, { value: 'b', label: 'Airfield' }, { value: 'c', label: 'Devil\'s jump' }, { value: 'd', label: 'Forest hut' }],
    correct: 'b' },
  { id: 'e16', difficulty: 'easy', topic: 'records',
    text: 'Roughly how many corners does the Nordschleife have?',
    options: [{ value: 'a', label: '20–25' }, { value: 'b', label: '40–50' }, { value: 'c', label: '70–75' }, { value: 'd', label: '120–130' }],
    correct: 'c' },
  { id: 'e17', difficulty: 'easy', topic: 'history',
    text: 'After the 1976 crash, the Nordschleife was permanently dropped from which championship?',
    options: [{ value: 'a', label: 'WRC' }, { value: 'b', label: 'Formula 1' }, { value: 'c', label: 'MotoGP' }, { value: 'd', label: 'Le Mans series' }],
    correct: 'b' },
  { id: 'e18', difficulty: 'easy', topic: 'records',
    text: 'Which German manufacturer holds the all-time outright Nordschleife lap record with the 919 Hybrid Evo?',
    options: [{ value: 'a', label: 'Mercedes' }, { value: 'b', label: 'Audi' }, { value: 'c', label: 'BMW' }, { value: 'd', label: 'Porsche' }],
    correct: 'd' },
  { id: 'e19', difficulty: 'easy', topic: 'corners',
    text: 'Which town gives its name to the village inside the Nordschleife loop?',
    options: [{ value: 'a', label: 'Adenau' }, { value: 'b', label: 'Aachen' }, { value: 'c', label: 'Augsburg' }, { value: 'd', label: 'Andernach' }],
    correct: 'a' },
  { id: 'e20', difficulty: 'easy', topic: 'culture',
    text: 'The Nürburgring sits in which German federal state?',
    options: [{ value: 'a', label: 'Bavaria' }, { value: 'b', label: 'Saxony' }, { value: 'c', label: 'Rhineland-Palatinate' }, { value: 'd', label: 'North Rhine-Westphalia' }],
    correct: 'c' },
  { id: 'e21', difficulty: 'easy', topic: 'corners',
    text: 'Which section of the Nordschleife has the long, flat-out straight nicknamed the "Heights"?',
    options: [{ value: 'a', label: 'Döttinger Höhe' }, { value: 'b', label: 'Hatzenbach' }, { value: 'c', label: 'Adenauer Forst' }, { value: 'd', label: 'Pflanzgarten' }],
    correct: 'a' },
  { id: 'e22', difficulty: 'easy', topic: 'records',
    text: 'Approximately how much elevation change is there on a full Nordschleife lap?',
    options: [{ value: 'a', label: '50 metres' }, { value: 'b', label: '150 metres' }, { value: 'c', label: '300 metres' }, { value: 'd', label: '600 metres' }],
    correct: 'c' },
  { id: 'e23', difficulty: 'easy', topic: '24h',
    text: 'The 24 Hours of Nürburgring takes place in which months of the year?',
    options: [{ value: 'a', label: 'November–December' }, { value: 'b', label: 'January–February' }, { value: 'c', label: 'May–June' }, { value: 'd', label: 'August–September' }],
    correct: 'c' },
  { id: 'e24', difficulty: 'easy', topic: 'drivers',
    text: 'Which German nicknamed "Queen of the Nürburgring" was a multiple 24h class and overall winner?',
    options: [{ value: 'a', label: 'Sabine Schmitz' }, { value: 'b', label: 'Susie Wolff' }, { value: 'c', label: 'Ellen Lohr' }, { value: 'd', label: 'Beate Nodes' }],
    correct: 'a' },
  { id: 'e25', difficulty: 'easy', topic: 'corners',
    text: '"Pflanzgarten" translates to which English phrase?',
    options: [{ value: 'a', label: 'Power garden' }, { value: 'b', label: 'Plant garden' }, { value: 'c', label: 'Pilgrim\'s gate' }, { value: 'd', label: 'Pole position' }],
    correct: 'b' },
  { id: 'e26', difficulty: 'easy', topic: 'corners',
    text: 'On a regulation Nordschleife lap, drivers run in which direction?',
    options: [{ value: 'a', label: 'Counter-clockwise' }, { value: 'b', label: 'Clockwise' }, { value: 'c', label: 'It alternates daily' }, { value: 'd', label: 'Both directions simultaneously' }],
    correct: 'b' },
  { id: 'e27', difficulty: 'easy', topic: 'history',
    text: 'The Nürburgring was originally built as a public works project under which political era?',
    options: [{ value: 'a', label: 'The German Empire' }, { value: 'b', label: 'The Weimar Republic' }, { value: 'c', label: 'East Germany (DDR)' }, { value: 'd', label: 'Post-reunification' }],
    correct: 'b' },
  { id: 'e28', difficulty: 'easy', topic: 'corners',
    text: 'Which section name literally means "swedish cross"?',
    options: [{ value: 'a', label: 'Schwalbenschwanz' }, { value: 'b', label: 'Schwedenkreuz' }, { value: 'c', label: 'Steilstrecke' }, { value: 'd', label: 'Sektor 7' }],
    correct: 'b' },
  { id: 'e29', difficulty: 'easy', topic: 'tourist',
    text: 'Roughly how much does a single tourist lap (Touristenfahrten) typically cost?',
    options: [{ value: 'a', label: '€5' }, { value: 'b', label: '€30' }, { value: 'c', label: '€150' }, { value: 'd', label: '€500' }],
    correct: 'b' },
  { id: 'e30', difficulty: 'easy', topic: 'drivers',
    text: 'Which German driver set a legendary 1983 qualifying lap that stood as the fastest time for 35 years?',
    options: [{ value: 'a', label: 'Hans-Joachim Stuck' }, { value: 'b', label: 'Stefan Bellof' }, { value: 'c', label: 'Michael Schumacher' }, { value: 'd', label: 'Bernd Schneider' }],
    correct: 'b' },
  { id: 'e31', difficulty: 'easy', topic: 'culture',
    text: 'The "Industry Pool" at the Nordschleife refers to…',
    options: [{ value: 'a', label: 'A swimming pool for engineers' }, { value: 'b', label: 'Manufacturer-funded test sessions on the closed track' }, { value: 'c', label: 'A merchandising scheme' }, { value: 'd', label: 'A driver salary fund' }],
    correct: 'b' },
  { id: 'e32', difficulty: 'easy', topic: 'records',
    text: 'A typical 24h Nürburgring race attracts approximately how many cars on the grid?',
    options: [{ value: 'a', label: '20' }, { value: 'b', label: '60' }, { value: 'c', label: '150' }, { value: 'd', label: '400' }],
    correct: 'c' },
  { id: 'e33', difficulty: 'easy', topic: 'history',
    text: 'During the Nordschleife\'s construction in the mid-1920s, the project employed approximately how many workers?',
    options: [{ value: 'a', label: '2,500' }, { value: 'b', label: '5,000' }, { value: 'c', label: '12,000' }, { value: 'd', label: '25,000' }],
    correct: 'd' },
  { id: 'e34', difficulty: 'easy', topic: 'corners',
    text: 'The "Karussell" surface is most famously made of…',
    options: [{ value: 'a', label: 'Cobblestones' }, { value: 'b', label: 'Asphalt' }, { value: 'c', label: 'Concrete' }, { value: 'd', label: 'Wood' }],
    correct: 'c' },
  { id: 'e35', difficulty: 'easy', topic: 'lauda',
    text: 'Niki Lauda\'s 1976 crash happened just before which corner?',
    options: [{ value: 'a', label: 'Karussell' }, { value: 'b', label: 'Bergwerk' }, { value: 'c', label: 'Pflanzgarten' }, { value: 'd', label: 'Brünnchen' }],
    correct: 'b' },
]

const MEDIUM: LapQuestion[] = [
  { id: 'm01', difficulty: 'medium', topic: 'records',
    text: 'In what year did Stefan Bellof set his iconic Nordschleife qualifying lap?',
    options: [{ value: 'a', label: '1976' }, { value: 'b', label: '1980' }, { value: 'c', label: '1983' }, { value: 'd', label: '1990' }],
    correct: 'c' },
  { id: 'm02', difficulty: 'medium', topic: 'records',
    text: 'What car did Stefan Bellof drive for that legendary 1983 lap?',
    options: [{ value: 'a', label: 'Porsche 956' }, { value: 'b', label: 'Porsche 911 GT1' }, { value: 'c', label: 'BMW M1' }, { value: 'd', label: 'Sauber-Mercedes C9' }],
    correct: 'a' },
  { id: 'm03', difficulty: 'medium', topic: 'records',
    text: 'Which Porsche driver took the all-time Nordschleife record in the 919 Hybrid Evo in June 2018?',
    options: [{ value: 'a', label: 'Mark Webber' }, { value: 'b', label: 'Timo Bernhard' }, { value: 'c', label: 'Brendon Hartley' }, { value: 'd', label: 'Romain Dumas' }],
    correct: 'b' },
  { id: 'm04', difficulty: 'medium', topic: 'records',
    text: 'The Porsche 919 Evo became the first car to break which barrier on the Nordschleife?',
    options: [{ value: 'a', label: 'Sub-7 minutes' }, { value: 'b', label: 'Sub-6 minutes' }, { value: 'c', label: 'Sub-5 minutes' }, { value: 'd', label: 'Sub-4 minutes' }],
    correct: 'b' },
  { id: 'm05', difficulty: 'medium', topic: 'history',
    text: 'In which exact year did the Nürburgring open its gates to its first races?',
    options: [{ value: 'a', label: '1923' }, { value: 'b', label: '1927' }, { value: 'c', label: '1931' }, { value: 'd', label: '1939' }],
    correct: 'b' },
  { id: 'm06', difficulty: 'medium', topic: 'history',
    text: 'Which German driver won the very first race at the brand-new Nürburgring in 1927?',
    options: [{ value: 'a', label: 'Rudolf Caracciola' }, { value: 'b', label: 'Bernd Rosemeyer' }, { value: 'c', label: 'Hans Stuck Sr.' }, { value: 'd', label: 'Tazio Nuvolari' }],
    correct: 'a' },
  { id: 'm07', difficulty: 'medium', topic: 'corners',
    text: 'The Karussell\'s full official name honours which pre-WWII racing legend?',
    options: [{ value: 'a', label: 'Tazio Nuvolari' }, { value: 'b', label: 'Rudolf Caracciola' }, { value: 'c', label: 'Bernd Rosemeyer' }, { value: 'd', label: 'Manfred von Brauchitsch' }],
    correct: 'b' },
  { id: 'm08', difficulty: 'medium', topic: '24h',
    text: 'In what year was the first 24 Hours of Nürburgring held?',
    options: [{ value: 'a', label: '1953' }, { value: 'b', label: '1970' }, { value: 'c', label: '1982' }, { value: 'd', label: '1995' }],
    correct: 'b' },
  { id: 'm09', difficulty: 'medium', topic: 'lauda',
    text: 'Niki Lauda\'s 1976 crash happened during which Grand Prix?',
    options: [{ value: 'a', label: 'Belgian GP' }, { value: 'b', label: 'German GP' }, { value: 'c', label: 'Austrian GP' }, { value: 'd', label: 'Monaco GP' }],
    correct: 'b' },
  { id: 'm10', difficulty: 'medium', topic: 'lauda',
    text: 'On what date in 1976 did Lauda\'s fiery crash take place?',
    options: [{ value: 'a', label: 'April 25' }, { value: 'b', label: 'June 6' }, { value: 'c', label: 'August 1' }, { value: 'd', label: 'October 10' }],
    correct: 'c' },
  { id: 'm11', difficulty: 'medium', topic: 'corners',
    text: 'How many distinct "jumps" do drivers traditionally count through the Pflanzgarten section?',
    options: [{ value: 'a', label: '1' }, { value: 'b', label: '2' }, { value: 'c', label: '3' }, { value: 'd', label: '5' }],
    correct: 'b' },
  { id: 'm12', difficulty: 'medium', topic: 'corners',
    text: '"Schwalbenschwanz" — a famously tricky section — translates to…',
    options: [{ value: 'a', label: 'Swallow\'s tail' }, { value: 'b', label: 'Black bend' }, { value: 'c', label: 'Iron forest' }, { value: 'd', label: 'Devil\'s mouth' }],
    correct: 'a' },
  { id: 'm13', difficulty: 'medium', topic: 'corners',
    text: '"Galgenkopf" — the right-hander before Döttinger Höhe — translates to…',
    options: [{ value: 'a', label: 'Gallows head' }, { value: 'b', label: 'Golden head' }, { value: 'c', label: 'Great gate' }, { value: 'd', label: 'Goalpost bend' }],
    correct: 'a' },
  { id: 'm14', difficulty: 'medium', topic: 'records',
    text: 'Roughly how many years did Stefan Bellof\'s outright qualifying lap stand as the absolute Nordschleife record before Porsche\'s 2018 919 Evo finally beat it?',
    options: [{ value: 'a', label: '10 years' }, { value: 'b', label: '20 years' }, { value: 'c', label: '35 years' }, { value: 'd', label: '50 years' }],
    correct: 'c' },
  { id: 'm15', difficulty: 'medium', topic: '24h',
    text: 'The 24h Nürburgring race uses a combined circuit of approximately what total length?',
    options: [{ value: 'a', label: '15 km' }, { value: 'b', label: '20 km' }, { value: 'c', label: '25 km' }, { value: 'd', label: '40 km' }],
    correct: 'c' },
  { id: 'm16', difficulty: 'medium', topic: 'history',
    text: 'Until 1973, the Nürburgring complex also included a second loop called the…',
    options: [{ value: 'a', label: 'Mittelschleife' }, { value: 'b', label: 'Südschleife' }, { value: 'c', label: 'Ostschleife' }, { value: 'd', label: 'Westschleife' }],
    correct: 'b' },
  { id: 'm17', difficulty: 'medium', topic: 'history',
    text: 'In which year was the Südschleife permanently closed for racing?',
    options: [{ value: 'a', label: '1961' }, { value: 'b', label: '1973' }, { value: 'c', label: '1981' }, { value: 'd', label: '1992' }],
    correct: 'b' },
  { id: 'm18', difficulty: 'medium', topic: 'drivers',
    text: 'Stefan Bellof, who set the legendary 1983 lap, was tragically killed in a sportscar race at which circuit two years later?',
    options: [{ value: 'a', label: 'Le Mans' }, { value: 'b', label: 'Spa-Francorchamps' }, { value: 'c', label: 'Daytona' }, { value: 'd', label: 'Sebring' }],
    correct: 'b' },
  { id: 'm19', difficulty: 'medium', topic: 'records',
    text: 'A modern, full Nordschleife lap features approximately how many marshal posts watching for incidents?',
    options: [{ value: 'a', label: '15' }, { value: 'b', label: '40' }, { value: 'c', label: '100' }, { value: 'd', label: '300' }],
    correct: 'c' },
  { id: 'm20', difficulty: 'medium', topic: 'records',
    text: 'Which Chinese-founded electric supercar set an electric Nordschleife record of 6:45.9 in 2017?',
    options: [{ value: 'a', label: 'BYD Han' }, { value: 'b', label: 'NIO EP9' }, { value: 'c', label: 'XPeng P7' }, { value: 'd', label: 'Polestar 1' }],
    correct: 'b' },
  { id: 'm21', difficulty: 'medium', topic: 'lauda',
    text: 'Niki Lauda was pulled from his burning Ferrari by four fellow drivers. Which of these was NOT among them?',
    options: [{ value: 'a', label: 'Arturo Merzario' }, { value: 'b', label: 'Brett Lunger' }, { value: 'c', label: 'Guy Edwards' }, { value: 'd', label: 'James Hunt' }],
    correct: 'd' },
  { id: 'm22', difficulty: 'medium', topic: 'lauda',
    text: 'How many weeks after the crash did Niki Lauda astonishingly return to F1 — at Monza?',
    options: [{ value: 'a', label: '2 weeks' }, { value: 'b', label: '6 weeks' }, { value: 'c', label: '4 months' }, { value: 'd', label: 'The following season' }],
    correct: 'b' },
  { id: 'm23', difficulty: 'medium', topic: 'records',
    text: 'A typical "fast" amateur Touristenfahrten lap on a road car sits around what time?',
    options: [{ value: 'a', label: '5 minutes' }, { value: 'b', label: '6 minutes' }, { value: 'c', label: '8 minutes' }, { value: 'd', label: '15 minutes' }],
    correct: 'c' },
  { id: 'm24', difficulty: 'medium', topic: 'manufacturers',
    text: 'Which German manufacturer has accumulated the most overall 24h Nürburgring victories in the modern era?',
    options: [{ value: 'a', label: 'BMW' }, { value: 'b', label: 'Mercedes' }, { value: 'c', label: 'Porsche' }, { value: 'd', label: 'Audi' }],
    correct: 'a' },
  { id: 'm25', difficulty: 'medium', topic: 'corners',
    text: 'How wide (approximately) is the Nordschleife at its narrowest point?',
    options: [{ value: 'a', label: '4 metres' }, { value: 'b', label: '8 metres' }, { value: 'c', label: '15 metres' }, { value: 'd', label: '25 metres' }],
    correct: 'b' },
  { id: 'm26', difficulty: 'medium', topic: '24h',
    text: 'Sabine Schmitz won the 24 Hours of Nürburgring overall in 1996 and again in 1997 driving for which brand?',
    options: [{ value: 'a', label: 'Audi' }, { value: 'b', label: 'BMW' }, { value: 'c', label: 'Porsche' }, { value: 'd', label: 'Mercedes' }],
    correct: 'b' },
  { id: 'm27', difficulty: 'medium', topic: 'culture',
    text: 'The VLN (now Nürburgring Endurance Series) consists of around how many races per year on the combined Nordschleife?',
    options: [{ value: 'a', label: '3' }, { value: 'b', label: '6' }, { value: 'c', label: '10' }, { value: 'd', label: '20' }],
    correct: 'c' },
  { id: 'm28', difficulty: 'medium', topic: 'records',
    text: 'Which Mercedes-AMG hypercar broke the production-car Nordschleife record at 6:30.7 in 2024?',
    options: [{ value: 'a', label: 'AMG GT Black Series' }, { value: 'b', label: 'AMG GT R Pro' }, { value: 'c', label: 'AMG ONE' }, { value: 'd', label: 'AMG Project Three' }],
    correct: 'c' },
  { id: 'm29', difficulty: 'medium', topic: 'corners',
    text: 'The "Fuchsröhre" (Fox Hole) is famous for being…',
    options: [{ value: 'a', label: 'A blind, downhill compression flat-out' }, { value: 'b', label: 'A sharp uphill hairpin' }, { value: 'c', label: 'A long banked corner' }, { value: 'd', label: 'A pit-lane shortcut' }],
    correct: 'a' },
  { id: 'm30', difficulty: 'medium', topic: 'history',
    text: 'In which year was the very last Formula 1 World Championship race held on the Nordschleife?',
    options: [{ value: 'a', label: '1971' }, { value: 'b', label: '1974' }, { value: 'c', label: '1976' }, { value: 'd', label: '1980' }],
    correct: 'c' },
  { id: 'm31', difficulty: 'medium', topic: 'records',
    text: 'Approximately how big is the total elevation difference between Hohe Acht (highest point) and Breidscheid (low point)?',
    options: [{ value: 'a', label: '50 metres' }, { value: 'b', label: '150 metres' }, { value: 'c', label: '300 metres' }, { value: 'd', label: '500 metres' }],
    correct: 'c' },
  { id: 'm32', difficulty: 'medium', topic: '24h',
    text: 'Which manufacturer scored its first overall 24h Nürburgring victory in 2012 with the R8 LMS Ultra?',
    options: [{ value: 'a', label: 'Aston Martin' }, { value: 'b', label: 'Lamborghini' }, { value: 'c', label: 'Audi' }, { value: 'd', label: 'Mercedes' }],
    correct: 'c' },
  { id: 'm33', difficulty: 'medium', topic: 'corners',
    text: 'The Nordschleife passes which famous village near its midpoint?',
    options: [{ value: 'a', label: 'Adenau' }, { value: 'b', label: 'Trier' }, { value: 'c', label: 'Koblenz' }, { value: 'd', label: 'Heidelberg' }],
    correct: 'a' },
  { id: 'm34', difficulty: 'medium', topic: 'drivers',
    text: 'Sabine Schmitz famously claimed she could lap the Nordschleife under 10 minutes in which TV-show vehicle?',
    options: [{ value: 'a', label: 'A double-decker bus' }, { value: 'b', label: 'A Ford Transit van' }, { value: 'c', label: 'A Smart ForTwo' }, { value: 'd', label: 'A Jaguar XJ taxi' }],
    correct: 'b' },
  { id: 'm35', difficulty: 'medium', topic: 'manufacturers',
    text: 'For decades, many road-car makers used Nordschleife development to brand their cars "…" tuned.',
    options: [{ value: 'a', label: '"Eifel"' }, { value: 'b', label: '"Ring"' }, { value: 'c', label: '"Hell"' }, { value: 'd', label: '"Loop"' }],
    correct: 'b' },
]

const HARD: LapQuestion[] = [
  { id: 'h01', difficulty: 'hard', topic: 'records',
    text: 'What is the precise length of the Nordschleife (Müllenbach loop excluded)?',
    options: [{ value: 'a', label: '19.273 km' }, { value: 'b', label: '20.832 km' }, { value: 'c', label: '22.510 km' }, { value: 'd', label: '23.180 km' }],
    correct: 'b' },
  { id: 'h02', difficulty: 'hard', topic: 'records',
    text: 'Stefan Bellof\'s 1983 qualifying time on the Nordschleife was…',
    options: [{ value: 'a', label: '5:48.27' }, { value: 'b', label: '6:11.13' }, { value: 'c', label: '6:25.91' }, { value: 'd', label: '7:02.40' }],
    correct: 'b' },
  { id: 'h03', difficulty: 'hard', topic: 'records',
    text: 'The Porsche 919 Hybrid Evo\'s outright Nordschleife record (June 29, 2018) was…',
    options: [{ value: 'a', label: '5:19.55' }, { value: 'b', label: '5:41.31' }, { value: 'c', label: '6:01.02' }, { value: 'd', label: '6:25.50' }],
    correct: 'a' },
  { id: 'h04', difficulty: 'hard', topic: 'history',
    text: 'Combined, the original Nordschleife + Südschleife layout (pre-1973) totalled about…',
    options: [{ value: 'a', label: '14 km' }, { value: 'b', label: '22 km' }, { value: 'c', label: '28 km' }, { value: 'd', label: '36 km' }],
    correct: 'c' },
  { id: 'h05', difficulty: 'hard', topic: 'lauda',
    text: 'In his Ferrari 312T2 in 1975, Niki Lauda set what was then a stunning Nordschleife lap record of approximately…',
    options: [{ value: 'a', label: '6:58' }, { value: 'b', label: '7:23' }, { value: 'c', label: '8:01' }, { value: 'd', label: '8:45' }],
    correct: 'a' },
  { id: 'h06', difficulty: 'hard', topic: 'history',
    text: 'On what date did the Nürburgring complex officially open?',
    options: [{ value: 'a', label: 'May 1, 1925' }, { value: 'b', label: 'June 18, 1927' }, { value: 'c', label: 'July 14, 1929' }, { value: 'd', label: 'August 1, 1931' }],
    correct: 'b' },
  { id: 'h07', difficulty: 'hard', topic: 'corners',
    text: 'The banking angle of the original Karussell\'s concrete section is approximately…',
    options: [{ value: 'a', label: '6°' }, { value: 'b', label: '16°' }, { value: 'c', label: '32°' }, { value: 'd', label: '45°' }],
    correct: 'b' },
  { id: 'h08', difficulty: 'hard', topic: 'records',
    text: 'A "Hohe Acht" sits at roughly what altitude — the highest point on the circuit?',
    options: [{ value: 'a', label: '350 m' }, { value: 'b', label: '617 m' }, { value: 'c', label: '845 m' }, { value: 'd', label: '1,120 m' }],
    correct: 'b' },
  { id: 'h09', difficulty: 'hard', topic: 'history',
    text: 'In what year was the German GP moved away from the Nordschleife to Hockenheim for safety?',
    options: [{ value: 'a', label: '1972' }, { value: 'b', label: '1977' }, { value: 'c', label: '1981' }, { value: 'd', label: '1985' }],
    correct: 'b' },
  { id: 'h10', difficulty: 'hard', topic: 'lauda',
    text: 'Lauda\'s pre-race campaign in 1976 famously asked drivers to vote to BOYCOTT the German GP. The vote went how?',
    options: [{ value: 'a', label: 'Drivers voted to boycott — the race was cancelled' }, { value: 'b', label: 'Drivers voted to race — Lauda was overruled' }, { value: 'c', label: 'The vote was tied; the FIA broke it' }, { value: 'd', label: 'No vote was held' }],
    correct: 'b' },
  { id: 'h11', difficulty: 'hard', topic: 'records',
    text: 'The Lamborghini Aventador SVJ Nordschleife production-car lap (2018) was…',
    options: [{ value: 'a', label: '6:09.7' }, { value: 'b', label: '6:44.97' }, { value: 'c', label: '7:08.30' }, { value: 'd', label: '7:32.50' }],
    correct: 'b' },
  { id: 'h12', difficulty: 'hard', topic: 'records',
    text: 'The Porsche 911 GT2 RS Manthey set a manufacturer-recognised Nordschleife production lap of…',
    options: [{ value: 'a', label: '5:58.32' }, { value: 'b', label: '6:43.300' }, { value: 'c', label: '7:01.114' }, { value: 'd', label: '7:18.460' }],
    correct: 'b' },
  { id: 'h13', difficulty: 'hard', topic: 'culture',
    text: 'Jackie Stewart\'s 1968 German GP win, which inspired the "Green Hell" name, was set in what infamous weather conditions?',
    options: [{ value: 'a', label: 'Snowstorm' }, { value: 'b', label: 'Dust storm' }, { value: 'c', label: 'Torrential rain and fog' }, { value: 'd', label: 'Hailstorm' }],
    correct: 'c' },
  { id: 'h14', difficulty: 'hard', topic: 'manufacturers',
    text: 'During the Nordschleife\'s F1 era, which manufacturer\'s pre-war "Silver Arrows" dominated the circuit alongside Auto Union?',
    options: [{ value: 'a', label: 'Maserati' }, { value: 'b', label: 'Alfa Romeo' }, { value: 'c', label: 'Mercedes-Benz' }, { value: 'd', label: 'Bugatti' }],
    correct: 'c' },
  { id: 'h15', difficulty: 'hard', topic: 'drivers',
    text: 'Juan Manuel Fangio\'s legendary 1957 comeback drive at the Nordschleife (where he chased and passed two Ferraris) was in which car?',
    options: [{ value: 'a', label: 'Maserati 250F' }, { value: 'b', label: 'Mercedes W196' }, { value: 'c', label: 'Lancia D50' }, { value: 'd', label: 'Alfa Romeo 159' }],
    correct: 'a' },
  { id: 'h16', difficulty: 'hard', topic: '24h',
    text: 'A typical 24h Nürburgring winning car covers approximately how many laps of the combined circuit?',
    options: [{ value: 'a', label: '55' }, { value: 'b', label: '95' }, { value: 'c', label: '155' }, { value: 'd', label: '230' }],
    correct: 'c' },
  { id: 'h17', difficulty: 'hard', topic: 'culture',
    text: 'Around 2012–2014, the Nürburgring complex fell into a high-profile…',
    options: [{ value: 'a', label: 'Government nationalisation' }, { value: 'b', label: 'Insolvency / bankruptcy proceeding' }, { value: 'c', label: 'Volcanic damage closure' }, { value: 'd', label: 'F1 buyout' }],
    correct: 'b' },
  { id: 'h18', difficulty: 'hard', topic: 'corners',
    text: '"Adenauer Forst" sits just before which downhill, blind right-hander?',
    options: [{ value: 'a', label: 'Metzgesfeld' }, { value: 'b', label: 'Breidscheid' }, { value: 'c', label: 'Pflanzgarten' }, { value: 'd', label: 'Brünnchen' }],
    correct: 'a' },
  { id: 'h19', difficulty: 'hard', topic: 'records',
    text: 'Approximately how many lateral g-forces do drivers experience through the original Karussell\'s downhill concrete banking?',
    options: [{ value: 'a', label: '0.5 g' }, { value: 'b', label: '1.5 g' }, { value: 'c', label: '2.5 g' }, { value: 'd', label: '4.0 g' }],
    correct: 'b' },
  { id: 'h20', difficulty: 'hard', topic: 'manufacturers',
    text: 'Which Japanese sportscar\'s Nordschleife development time of 7:29 (claimed in 2009) sparked huge controversy when rivals disputed the methodology?',
    options: [{ value: 'a', label: 'Toyota Supra' }, { value: 'b', label: 'Nissan GT-R' }, { value: 'c', label: 'Lexus LFA' }, { value: 'd', label: 'Honda NSX' }],
    correct: 'b' },
  { id: 'h21', difficulty: 'hard', topic: 'corners',
    text: 'How many turns long is the "Hatzenbach" complex roughly considered to be?',
    options: [{ value: 'a', label: '2' }, { value: 'b', label: '4' }, { value: 'c', label: '7' }, { value: 'd', label: '12' }],
    correct: 'c' },
  { id: 'h22', difficulty: 'hard', topic: 'history',
    text: 'The Nordschleife was completed in just over two years using a workforce mostly drawn from which group?',
    options: [{ value: 'a', label: 'Conscripted soldiers' }, { value: 'b', label: 'Unemployed German workers (work-creation scheme)' }, { value: 'c', label: 'Italian prison labour' }, { value: 'd', label: 'Foreign volunteer engineers' }],
    correct: 'b' },
  { id: 'h23', difficulty: 'hard', topic: 'corners',
    text: 'The treacherous downhill "Schwedenkreuz" was historically a flat-out (or near-flat) section in modern prototypes at what kind of speed?',
    options: [{ value: 'a', label: '~100 km/h' }, { value: 'b', label: '~180 km/h' }, { value: 'c', label: '~250 km/h' }, { value: 'd', label: '~330 km/h' }],
    correct: 'c' },
  { id: 'h24', difficulty: 'hard', topic: 'drivers',
    text: 'Stefan Bellof was driving in which championship when he set his outright Nordschleife qualifying lap?',
    options: [{ value: 'a', label: 'Formula 1' }, { value: 'b', label: 'World Sportscar Championship' }, { value: 'c', label: 'DTM' }, { value: 'd', label: 'European Touring Car Championship' }],
    correct: 'b' },
  { id: 'h25', difficulty: 'hard', topic: 'records',
    text: 'Approximately how many crashes (per year) occur on the Nordschleife during public Touristenfahrten sessions?',
    options: [{ value: 'a', label: 'Fewer than 10' }, { value: 'b', label: '40–60' }, { value: 'c', label: '~150' }, { value: 'd', label: 'Over 1,000' }],
    correct: 'c' },
  { id: 'h26', difficulty: 'hard', topic: '24h',
    text: 'Which manufacturer scored back-to-back overall 24h Nürburgring wins in 2017 and 2018 (and again in subsequent years) with its M6 GT3?',
    options: [{ value: 'a', label: 'BMW' }, { value: 'b', label: 'Mercedes' }, { value: 'c', label: 'Audi' }, { value: 'd', label: 'Porsche' }],
    correct: 'a' },
  { id: 'h27', difficulty: 'hard', topic: 'manufacturers',
    text: 'Which production-EV brand briefly held the EV-record at the Nordschleife at 7:25.231 in 2021?',
    options: [{ value: 'a', label: 'Porsche Taycan' }, { value: 'b', label: 'Tesla Model S Plaid' }, { value: 'c', label: 'Lucid Air' }, { value: 'd', label: 'Polestar 2' }],
    correct: 'b' },
  { id: 'h28', difficulty: 'hard', topic: 'corners',
    text: '"Brünnchen" is famous among fans for which spectator activity?',
    options: [{ value: 'a', label: 'A grandstand finish straight' }, { value: 'b', label: 'A camping & barbeque crowd over the crest where many crashes happen' }, { value: 'c', label: 'A children\'s karting park' }, { value: 'd', label: 'A pit-lane viewing tunnel' }],
    correct: 'b' },
  { id: 'h29', difficulty: 'hard', topic: 'drivers',
    text: 'Sabine Schmitz, the "Queen of the Nürburgring", sadly passed away in which year?',
    options: [{ value: 'a', label: '2017' }, { value: 'b', label: '2019' }, { value: 'c', label: '2021' }, { value: 'd', label: '2023' }],
    correct: 'c' },
  { id: 'h30', difficulty: 'hard', topic: 'history',
    text: 'Following the 1976 boycott calls, the FIA mandated which key change at the Nordschleife — that ultimately proved impossible to fully meet?',
    options: [{ value: 'a', label: 'Permanent armco along its entire length' }, { value: 'b', label: 'A maximum 200 km/h speed limit' }, { value: 'c', label: 'Resurfacing every two years' }, { value: 'd', label: 'Compulsory pace cars for every session' }],
    correct: 'a' },
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
  1: 'Hatzenbach',
  2: 'Karussell',
  3: 'Döttinger Höhe',
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
