import type { Metadata } from 'next'
import {
  buildPersonSchema,
  buildProfessionalServiceSchema,
  buildWebSiteSchema,
  buildFAQSchema,
  serializeJsonLd,
} from '@/lib/seo/structured-data'

const BASE = 'https://markdekock.com'

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Strategisch mentor voor AI & executie | Mark de Kock',
  description:
    'Van AI-ambitie naar heldere richting, intern draagvlak en een eerste use case die werkt. Persoonlijke begeleiding voor senior leiders. Partner Kirk & Blackbeard. Max. 5 trajecten tegelijk.',
  metadataBase: new URL(BASE),
  robots: { index: true, follow: true },
  alternates: {
    canonical: `${BASE}/mentor`,
    languages: {
      'nl':    `${BASE}/mentor`,
      'en':    `${BASE}/mentor?lang=en`,
      'de':    `${BASE}/mentor?lang=de`,
      'x-default': `${BASE}/mentor`,
    },
  },
  openGraph: {
    title: 'Van AI-ambitie naar richting, draagvlak en een use case die werkt | Mark de Kock',
    description:
      'Persoonlijke begeleiding voor senior leiders. Geen training, geen consultancy — strategische mentoring op het punt waar ambitie concreet moet worden. Max. 5 trajecten tegelijk.',
    url: `${BASE}/mentor`,
    siteName: 'Mark de Kock',
    type: 'website',
    locale: 'nl_NL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Strategisch mentor voor AI & executie | Mark de Kock',
    description: 'Persoonlijke begeleiding voor senior leiders. Van AI-ambitie naar iets wat echt werkt.',
  },
  keywords: [
    'AI strategie directie', 'AI mentor', 'strategisch mentor AI', 'AI implementatie organisatie',
    'AI readiness management', 'Kirk & Blackbeard', 'Mark de Kock', 'AI executie',
    'digitale transformatie leiderschap', 'AI begeleiding senior leiders',
  ],
  authors: [{ name: 'Mark de Kock', url: 'https://markdekock.com' }],
}

// ── Structured data (JSON-LD) ─────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    question: 'Hoe ziet een traject er in de praktijk uit?',
    answer:
      'Dat verschilt per klant. Afhankelijk van onze eerste gesprekken en prioriteiten bepalen we samen waar behoefte aan is. Soms werk ik 2–3 weken intensief samen. Andere keren komen we 1 keer samen en werk ik bijvoorbeeld een workshop of visiedocument uit om te bespreken. Ik ben altijd bereikbaar voor kortere vragen of beslismomenten. Elk gesprek heeft een concreet doel: een openstaande vraag beantwoorden, een keuze maken of een volgende stap vastleggen.',
  },
  {
    question: 'Hoe vaak spreken we af?',
    answer:
      'Afhankelijk van de grootte en het belang van de opdracht maken we samen afspraken hoe vaak we elkaar zien — fysiek en/of online. Bij de meeste opdrachten is met name het begin veel meer fysiek en in contact met alle spelers, medewerkers en partners. Het ritme past zich aan op basis van wat er speelt.',
  },
  {
    question: 'Is dit voor de CEO/CDO/CTO/CMO zelf of voor het hele managementteam?',
    answer:
      'Het begint vaak met 1 persoon en idealiter heb ik contact met het hele team. AI is niet iets dat je half moet aanpakken binnen 1 deel van de organisatie. Waar we bijvoorbeeld eerst aan de slag gaan met marketing en sales, kan het goed zijn om een bredere workshop te houden met het hele MT — zodat iedereen op hetzelfde kennisniveau komt en de muren tussen afdelingen mogelijk ook worden geslecht door een verbindend element zoals AI. Uiteraard waar wenselijk en mogelijk.',
  },
  {
    question: 'Werkt dit ook als mijn organisatie nog nauwelijks met AI bezig is?',
    answer:
      'Juist dan. Het meeste werk zit niet in de technologie — het zit in de vraag welke richting je op wilt en hoe je dat intern voor elkaar krijgt. Daar begin je mee, ongeacht hoe ver je al bent.',
  },
  {
    question: 'Wat als we al een AI-strategie hebben?',
    answer:
      'Dan kijken we of die strategie werkt — of hij gedeeld wordt, of hij vertaald is naar keuzes die mensen daadwerkelijk maken. Een strategie op papier is iets anders dan beweging in een organisatie.',
  },
  {
    question: 'Ik weet nog niet goed wat ik nodig heb. Heeft het al zin om contact op te nemen?',
    answer:
      'Dat is precies het goede moment. De intake is er juist voor om dat samen helder te krijgen — wat er speelt, wat de echte blokkade is, en wat een zinvolle eerste stap zou zijn. Je committeert je aan niets. Als er geen match is, zeg ik dat gewoon.',
  },
  {
    question: 'Moet ik meteen een volledig traject afnemen?',
    answer:
      'Nee. We beginnen altijd met een gratis intakegesprek om te kijken of er een match is. Daarna volgt een korte verkenningsfase — zodat we snel helder krijgen wat jouw situatie vraagt. Pas dan beslissen we samen wat logisch is. Sommige trajecten lopen over drie maanden. Andere bestaan uit een reeks gerichte gesprekken. De structuur past zich aan jouw situatie aan, niet andersom.',
  },
  {
    question: 'Wat kost een traject?',
    answer:
      'Je betaalt per fase, niet voor een volledig traject vooraf. Dat wordt pas helder na het intakegesprek — afhankelijk van omvang en context. Ik zorg er altijd voor dat de stappen behapbaar zijn en voorzien van duidelijke deliverables per fase. Zo kun je te allen tijde beslissen om te stoppen als de realiteit van alle dag daarom vraagt. Je zult ook altijd de opgeleverde documenten, presentaties, data en agents bezitten. Het intakegesprek zelf is gratis en vrijblijvend.',
  },
  {
    question: 'Hoe snel kan ik starten?',
    answer:
      'Vaak kunnen we binnen 1 à 2 weken beginnen met een kick-off zodat we snel duidelijk krijgen wat de beste aanpak is. Ik werk met maximaal vijf trajecten tegelijk.',
  },
  {
    question: 'In welke sectoren heb je gewerkt?',
    answer:
      'Door mijn brede ervaring heb ik voor bijna alle sectoren gewerkt. Denk aan Automotive, Finance, Gezondheidszorg, FMCG, Overheid, Publiek/privaat, duurzaamheid en klantbeleving. Maar AI-vraagstukken voor leiders zijn sectoroverstijdend — de patronen die ik zie, herhalen zich ongeacht de branche.',
  },
  {
    question: 'Waarom Kirk & Blackbeard?',
    answer:
      'Kirk & Blackbeard is een netwerk van senior operators — mensen met brede ervaring in strategie, groei en executie. Ik werk vanuit dat netwerk omdat het mij de ruimte geeft om selectief en persoonlijk te zijn. Geen groot bureau, geen junior consultants. Daarnaast hebben we een netwerk van mensen die bewezen kwaliteit leveren, waar we dus ook eerder mee hebben gewerkt en voor hun kwaliteit kunnen instaan.',
  },
  {
    question: 'Wat maakt dit anders dan een coach of consultant?',
    answer:
      'Een coach werkt aan jou als persoon. Een consultant lost een probleem op. Ik doe iets ertussenin: ik help jou als leidinggevende de juiste beslissingen nemen over een specifiek strategisch vraagstuk — en zorg dat je het daarna zelf kunt. Terwijl ik ook de stakeholders binnen jouw omgeving meeneem op de reis naar hun doelen, met de ondersteuning van AI. Want AI zelf is nooit het doel.',
  },
]

const jsonLd = serializeJsonLd([
  buildWebSiteSchema(`${BASE}`, 'Mark de Kock'),
  buildPersonSchema({
    name:        'Mark de Kock',
    url:         'https://markdekock.com',
    jobTitle:    'Strategisch mentor voor AI & executie',
    description: 'Senior operator en partner bij Kirk & Blackbeard. Twintig jaar ervaring in strategie, groei, klantbeleving en executie. Begeleidt leidinggevenden bij het vertalen van AI-ambitie naar richting, draagvlak en een eerste werkende use case.',
    orgName:     'Kirk & Blackbeard',
    orgUrl:      'https://kirkandblackbeard.com',
    country:     'NL',
    knowsAbout:  [
      'AI strategie', 'Digitale transformatie', 'Verandermanagement', 'Executie', 'Klantbeleving', 'Groei',
      'AI strategy', 'Digital transformation', 'Change management', 'Execution', 'Customer experience',
      'AI implementation', 'Strategic leadership', 'AI readiness',
    ],
    linkedin:    'https://www.linkedin.com/in/markdekock/',
  }),
  buildProfessionalServiceSchema({
    name:        'Strategisch mentorschap AI & executie | Mark de Kock',
    url:         'https://markdekock.com',
    description: 'Persoonlijke begeleiding voor senior leiders: van AI-ambitie naar heldere prioriteiten, intern draagvlak en een eerste use case die werkt. Fase per fase, aangepast aan jouw situatie.',
    providerName: 'Mark de Kock',
    country:     'Netherlands',
    languages:   ['nl', 'en'],
    freeIntake:  true,
  }),
  buildFAQSchema(FAQ_ITEMS),
])

// ── Layout ────────────────────────────────────────────────────────────────────

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      {children}
    </>
  )
}
