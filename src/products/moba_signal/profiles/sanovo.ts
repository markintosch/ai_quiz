// FILE: src/products/moba_signal/profiles/sanovo.ts
// ─── Sanovo — researched company profile ─────────────────────────────────────
//
// Desk research, 19 Nov 2026. The Sanovo site blocks automated fetches (see
// migration_moba_signal_sources_v2/v5), so this round was read from search
// results, Sanovo's indexed news pages and trade coverage. Items marked
// 'snippet' have not been opened in full: open the source before quoting.
//
// Nothing here is legal advice. The legal section names the rules so Moba's
// legal counsel can check them quickly; it does not replace that check.

import type { CompanyProfile } from '../profile'

const NEWS = 'https://www.sanovogroup.com/en/about-us/what-is-happening-in-sanovo'

export const SANOVO_PROFILE: CompanyProfile = {
  entityId: 'sanovo',
  name: 'Sanovo',
  researchedOn: '2026-11-19',
  researchedBy: 'Signal desk research',
  oneLiner:
    'Family-owned Danish group, founded in Odense in 1961. Processing is its centre of gravity; grading runs through the Staalkat heritage. ' +
    'Since late 2025 the news flow has shifted towards AI vision, on-farm sorting and hatchery technology, plus manufacturing capacity in China and Denmark.',

  facts: [
    { label: 'Legal name', value: 'Sanovo Technology A/S (parent of the Sanovo Technology Group)', sourceUrl: 'https://opencorporates.com/companies/dk/39876965', verification: 'snippet' },
    { label: 'Headquarters', value: 'Odense, Denmark', sourceUrl: 'https://www.sanovogroup.com/en/about-us/', verification: 'snippet' },
    { label: 'Founded', value: 'October 1961, Odense', sourceUrl: 'https://www.sanovogroup.com/en/about-us/', verification: 'snippet' },
    { label: 'Ultimate owner', value: 'Thornico Holding A/S, Odense (Stadil family). Thor Stadil chairs the holding companies; Christian Stadil is CEO and owner of Thornico.', sourceUrl: 'https://thornico.com/group-structure/food-technology', verification: 'snippet' },
    { label: 'Manufacturing', value: 'Denmark, the Netherlands and Italy; Shanghai office and production facility opened Oct 2025', sourceUrl: `${NEWS}/sanovo-technology-china-grand-opening/`, verification: 'snippet' },
    { label: 'Self-description', value: '"The world\'s largest supplier of equipment to the egg industry." Their claim, not an independent measure.', sourceUrl: 'https://www.sanovogroup.com/en/about-us/', verification: 'snippet' },
    { label: 'Patents', value: 'About 98 patents worldwide (third-party patent analytics count)', sourceUrl: 'https://insights.greyb.com/sanovo-technology-patents/', verification: 'snippet' },
    { label: 'Recognition', value: 'Deloitte Best Managed Companies Denmark, sixth consecutive year (2026)', sourceUrl: `${NEWS}/best-managed-company-winner-2026/`, verification: 'snippet' },
  ],

  structure: [
    { label: 'Thornico Holding A/S', depth: 0, value: 'Ultimate parent, Odense. Also parent of other food and food-technology businesses.', sourceUrl: 'https://thornico.com/group-structure/food-technology', verification: 'snippet' },
    { label: 'Thornico Food & Food Technology Group A/S', depth: 1, value: 'Intermediate holding (formerly Lactosan-Sanovo Holding).', sourceUrl: 'https://estatistik.dk/virksomhed/thornico-food-food-technology-group-as/37750913', verification: 'snippet' },
    { label: 'Sanovo Technology A/S', depth: 2, value: 'Group parent and owner of the STAALKAT trademark.', sourceUrl: 'https://trademark.justia.com/owners/sanovo-technology-a-s-2772042', verification: 'snippet' },
    { label: 'Sanovo Technology Netherlands B.V.', depth: 3, value: 'Dutch entity, Staalkat grading heritage. Party to the opposition against a Moba patent.', verification: 'snippet' },
    { label: 'Sanovo Technology Process A/S', depth: 3, value: 'Processing. 100% owned by Sanovo Technology A/S.', sourceUrl: 'https://opencorporates.com/companies/dk/39876965', verification: 'snippet' },
    { label: 'Sanovo Technology Robotics A/S', depth: 3, value: 'Robotics. Has its own LinkedIn page.', verification: 'snippet' },
    { label: 'Sanovo Technology Nikro', depth: 3, value: 'Opened a new production hall in Dec 2025.', sourceUrl: `${NEWS}/`, verification: 'snippet' },
    { label: 'Sanovo Technology China', depth: 3, value: 'Shanghai office and production, opened 17 Oct 2025.', sourceUrl: `${NEWS}/sanovo-technology-china-grand-opening/`, verification: 'snippet' },
  ],

  // Newest first in the source; the tab sorts anyway.
  digest: [
    {
      id: 'd-world', date: '2026-10-28',
      title: 'Introducing SANOVO World',
      summary: 'A new hub on sanovogroup.com that gathers news, innovations and milestones in one place.',
      topic: 'channel',
      forMoba: 'A new owned channel. Their storytelling now has one front door, which makes it easier for them to stage the IPPE 2027 launch. Signal should collect it as a source in its own right.',
      sourceUrl: `${NEWS}/`,
      verification: 'snippet',
    },
    {
      id: 'd-ippe27', date: '2026-09-28', headline: true,
      title: 'In-ovo sexing system to launch at IPPE 2027',
      summary: 'Sanovo and Canadian Egg Technologies will unveil the day-4 hyperspectral in-ovo sexing system at IPPE, Atlanta, 26 to 28 Jan 2027. They say a platform upgrade can move it to day-0 sexing without major new capital spend.',
      topic: 'product',
      forMoba: 'IPPE 2027 is now a launch stage for Sanovo. Expect hatchery and welfare messaging to dominate their presence. Brief the Moba IPPE team before the show, not after.',
      sourceUrl: 'https://www.thepoultrysite.com/news/2026/09/sanovo-cet-to-unveil-d4-egg-sexing-system-at-ippe-2027',
      verification: 'snippet',
    },
    {
      id: 'd-inovo', date: '2026-06-17', headline: true,
      title: 'Partnership with Canadian Egg Technologies and MatrixSpec on in-ovo sexing',
      summary: 'Strategic partnership to commercialise a Canadian-developed system that determines embryo sex on day 4 of incubation, non-invasively, with hyperspectral imaging. Announced as the "world\'s earliest". No accuracy figure published yet.',
      topic: 'partnership',
      forMoba: 'Sanovo moves into hatchery technology and animal welfare, a theme it did not carry before. "World\'s earliest" is their claim; there is no published accuracy number to test it against.',
      sourceUrl: `${NEWS}/sanovo-canadian-egg-technologies-and-matrixspec-solutions-unite-to-launch-worlds-earliest-non-invasive-in-ovo-egg-sexing-technology/`,
      alsoCovered: [
        { label: 'WATTAgNet', url: 'https://www.wattagnet.com/egg/press-release/15829378/partnership-aims-to-launch-day4-in-ovo-sexing-system' },
        { label: 'Egg Farmers of Canada', url: 'https://www.eggfarmers.ca/press/sanovo-technology-group-canadian-egg-technologies-and-matrixspec-solutions-unite-to-launch-worlds-earliest-non-invasive-in-ovo-egg-sexing-technology/' },
        { label: 'Asian Agribiz', url: 'https://www.asian-agribiz.com/2026/06/25/early-egg-sexing-technology-a-boon-for-incubation-management/' },
      ],
      verification: 'snippet',
    },
    {
      id: 'd-bmc26', date: '2026-06-08',
      title: 'Best Managed Company 2026, sixth year running',
      summary: 'Deloitte recognises Sanovo as one of Denmark\'s Best Managed Companies for the sixth consecutive year.',
      topic: 'corporate',
      forMoba: 'Employer-brand and stability signal, useful to them in recruiting. Low competitive impact.',
      sourceUrl: `${NEWS}/best-managed-company-winner-2026/`,
      verification: 'snippet',
    },
    {
      id: 'd-cook2peel', date: '2026-03-17',
      title: 'Cook2Peel Pro peeler launched',
      summary: 'New peeler for boiled eggs with a transparent peeling chamber.',
      topic: 'product',
      forMoba: 'Further depth in egg products, the segment where Sanovo is strongest and Moba relies on partners.',
      sourceUrl: `${NEWS}/`,
      verification: 'snippet',
    },
    {
      id: 'd-visionweigh', date: '2026-02-26', headline: true,
      title: 'Vision weighing: the next step in high-capacity grading',
      summary: 'Camera-based weighing in motion, without mechanical load cells, inside the VisionAI Detector that also handles crack and leak detection. Product page lists 288,000 eggs per hour.',
      topic: 'product',
      forMoba: 'This is Moba\'s home ground. Moba also markets vision weighing, so the claim collides head-on. Product management should check the 288,000 eggs per hour figure against our own range before sales meets it in a bake-off.',
      sourceUrl: `${NEWS}/vision-weighing-the-next-step-in-high-capacity-egg-grading/`,
      alsoCovered: [
        { label: 'Sanovo knowledge library', url: 'https://www.sanovogroup.com/en/egg/knowledge/vision-weighing-in-egg-grading/' },
        { label: 'inVISION (DE)', url: 'https://invision-news.de/ki-deep-learning/vision-weighing/' },
      ],
      verification: 'snippet',
    },
    {
      id: 'd-opposition', date: '2026-01-15', headline: true,
      title: 'Sanovo Technology Netherlands opposes a Moba patent',
      summary: 'Patent analytics list an opposition by Sanovo Technology Netherlands against a Moba patent titled "Method and system for processing a plurality of avian eggs", opposition date 15 Jan 2026. Outcome not listed.',
      topic: 'legal',
      forMoba: 'An active legal procedure between the two companies. Internal only: route every question to IP counsel and do not discuss it with customers or Sanovo staff. See the legal section.',
      sourceUrl: 'https://ipverse.greyb.com/competitive-analysis/company/Sanovo%20Technology%20Netherlands',
      verification: 'snippet',
    },
    {
      id: 'd-hatch', date: '2026-01-28',
      title: 'Donation to Hatch for Hunger',
      summary: 'Sanovo turned December business activity into a donation, reported as USD 29,610.',
      topic: 'corporate',
      forMoba: 'Corporate social responsibility content. No competitive impact.',
      sourceUrl: `${NEWS}/sanovo-technology-group-donates-to-hatch-for-hunger/`,
      verification: 'snippet',
    },
    {
      id: 'd-nikro', date: '2025-12-11',
      title: 'New production hall at Sanovo Technology Nikro',
      summary: 'Additional production capacity within the group.',
      topic: 'footprint',
      forMoba: 'Capacity investment two months after Shanghai. Read together: they are building to deliver more, not just to sell more.',
      sourceUrl: `${NEWS}/`,
      verification: 'snippet',
    },
    {
      id: 'd-shanghai', date: '2025-10-17',
      title: 'Shanghai office and production facility opened',
      summary: 'Grand opening attended by CEO Michael Midskov and local officials.',
      topic: 'footprint',
      forMoba: 'Local manufacturing in China lowers their cost into Asia, where Zenyer and NABEL already compete on price. Expect sharper Sanovo pricing in Asia Pacific tenders.',
      sourceUrl: `${NEWS}/sanovo-technology-china-grand-opening/`,
      verification: 'snippet',
    },
    {
      id: 'd-fiu', date: '2025-10-02',
      title: 'Farm Intelligence Unit: egg sorting powered by AI',
      summary: 'AI-based defect detection and sorting on the farm, positioned on early leaker removal and flock-health insight.',
      topic: 'product',
      forMoba: 'Sanovo puts vision and data upstream of the grading centre, on the farm. Whoever owns the egg data before grading gets a say in what happens after it.',
      sourceUrl: `${NEWS}/introducing-the-farm-intelligence-unit-egg-sorting-powered-by-ai/`,
      verification: 'snippet',
    },
    {
      id: 'd-oaklands', date: '2026-11-19', undated: true,
      title: 'GraderPro 800 sale to Oaklands Farm Eggs (UK)',
      summary: 'Sanovo\'s homepage features Oaklands Farm Eggs choosing the fully automated GraderPro 800. Publication date not visible in search results.',
      topic: 'product',
      forMoba: 'A named grading reference in the UK. Check with the UK account team whether Oaklands was a Moba prospect.',
      sourceUrl: 'https://sanovogroup.com/',
      verification: 'unconfirmed',
    },
  ],

  changed: [
    {
      title: 'Welfare is no longer whitespace',
      detail: 'Sanovo\'s messaging was processing, handling and service. In-ovo sexing makes animal welfare a Sanovo launch theme from IPPE 2027, ground nobody in grading had claimed.',
      affects: 'Positioning, whitespace',
    },
    {
      title: 'Capacity edge needs re-verification',
      detail: 'Sanovo now lists 288,000 eggs per hour for its VisionAI grading. Any Moba capacity claim against Sanovo needs checking against that figure first.',
      affects: 'Head to head, capacity',
      sourceUrl: `${NEWS}/vision-weighing-the-next-step-in-high-capacity-egg-grading/`,
    },
    {
      title: 'Vision weighing is a claim collision',
      detail: 'Both companies market vision weighing. Whoever publishes a verified accuracy figure first sets the terms of the comparison.',
      affects: 'Claims, detection and vision',
      sourceUrl: 'https://moba.net/news/introducing-vision-weighing/',
    },
    {
      title: 'An active IP procedure',
      detail: 'Sanovo Technology Netherlands has opposed a Moba patent. That changes what Moba people may say in public about either company\'s technology.',
      affects: 'Legal guardrails, sales battlecard',
    },
  ],

  upcoming: [
    {
      name: 'IPPE 2027', startDate: '2027-01-26', endDate: '2027-01-28', location: 'Atlanta, United States',
      note: 'Sanovo and Canadian Egg Technologies unveil the day-4 in-ovo sexing system.',
      sourceUrl: 'https://www.thepoultrysite.com/news/2026/09/sanovo-cet-to-unveil-d4-egg-sexing-system-at-ippe-2027',
      verification: 'snippet',
    },
  ],

  socials: [
    {
      platform: 'LinkedIn', handle: 'SANOVO TECHNOLOGY GROUP', url: 'https://www.linkedin.com/company/sanovo-technology-group/',
      use: 'Main corporate channel: wins, launches, trade shows, employer brand. A separate SANOVO TECHNOLOGY ROBOTICS page rolls up under Sanovo.',
      verification: 'unconfirmed',
      collection: 'Monthly LinkedIn competitor-analytics export (share of voice). No scraping: LinkedIn\'s terms forbid it.',
    },
    {
      platform: 'YouTube', handle: 'SANOVOTECHGROUP', url: 'https://www.youtube.com/user/SANOVOTECHGROUP',
      use: 'Machine videos (GraderPro 75, 220, 800; BreakerPro). Syndicated on Agriculture-XPRT.',
      verification: 'unconfirmed',
      collection: 'Not collected yet. YouTube publishes a public RSS feed per channel: proposed as a source.',
    },
    {
      platform: 'Newsroom', handle: 'What is happening in SANOVO', url: `${NEWS}/`,
      use: 'Press releases in eight languages (EN, DA, NL, FR, ZH, JA, AR, TH).',
      verification: 'snippet',
      collection: 'Live via the Internet Archive snapshot and the Google News feed. Direct fetch returns 403 and is not circumvented.',
    },
    {
      platform: 'SANOVO World', handle: 'sanovogroup.com', url: 'https://sanovogroup.com/',
      use: 'New hub (Oct 2026) for news, innovations and milestones.',
      verification: 'snippet',
      collection: 'Not collected yet: proposed as a source.',
    },
    {
      platform: 'Publications', handle: 'publications.sanovogroup.com', url: 'https://publications.sanovogroup.com/brochures/grading/vision-ai/',
      use: 'Online brochures and spec sheets. This is where capacity and accuracy claims are stated in numbers.',
      verification: 'snippet',
      collection: 'Not collected. Brochures picked up at shows can be uploaded today.',
    },
    {
      platform: 'Facebook / Instagram', handle: 'not found',
      use: 'No official account found in this research round. Check the site footer by hand.',
      verification: 'unconfirmed',
      collection: 'None.',
    },
  ],

  legal: [
    {
      id: 'l-opposition', severity: 'high',
      title: 'Opposition against a Moba patent',
      status: 'Filed, outcome not known',
      date: '2026-01-15',
      detail: 'Opponent: Sanovo Technology Netherlands. Patent title: "Method and system for processing a plurality of avian eggs" (Moba). An opposition asks the patent office to revoke or narrow a granted patent. It is an administrative procedure, not a court case.',
      guidance: 'Treat as legally sensitive. Do not comment on it to customers, press or Sanovo staff, also not informally at trade shows. Do not write opinions about its merits in email or chat: written messages can end up in the file. Questions go to Moba IP counsel. Signal tracks it from the public register only.',
      sourceUrl: 'https://ipverse.greyb.com/competitive-analysis/company/Sanovo%20Technology%20Netherlands',
      verification: 'snippet',
    },
    {
      id: 'l-claims', severity: 'medium',
      title: 'Superlative claims in Sanovo copy',
      status: 'Monitor',
      detail: 'Recurring absolute claims: "world\'s earliest" in-ovo sexing, "the world\'s largest supplier of equipment to the egg industry", "the only true full-line partner in egg processing".',
      guidance: 'Quote them with attribution ("Sanovo says"), never repeat them as fact. Whether to challenge a claim formally, through an advertising code complaint or a letter, is a legal decision. It is not a sales tactic.',
      sourceUrl: 'https://www.sanovogroup.com/en/about-us/',
      verification: 'snippet',
    },
    {
      id: 'l-tm', severity: 'low',
      title: 'Trademark portfolio',
      status: 'Monitor',
      detail: 'STAALKAT is registered to Sanovo Technology A/S. Product names such as VisionAI, GraderPro, BreakerPro and Cook2Peel appear in their copy; registration status not checked.',
      guidance: 'Use their names only to identify their products, in plain text. No logos, product photos or screenshots from their site in Moba material. A new trademark filing often shows a product name months before launch: worth a watch.',
      sourceUrl: 'https://trademark.justia.com/owners/sanovo-technology-a-s-2772042',
      verification: 'snippet',
    },
    {
      id: 'l-litigation', severity: 'low',
      title: 'Court litigation',
      status: 'None found',
      detail: 'No court case between Sanovo and Moba, or involving Sanovo on egg equipment, turned up in this research round.',
      guidance: 'Absence in search results is not proof. A docket search (EU courts, PACER) by counsel is the only reliable check.',
      verification: 'unconfirmed',
    },
  ],

  commsRules: [
    {
      rule: 'Compare only like with like, on facts that can be checked.',
      why: 'A comparison with Sanovo is allowed when it is objective, about the same kind of equipment, and about material, verifiable features such as capacity or detection rate. Adjectives without a number are where the risk sits.',
      basis: 'EU Directive 2006/114/EC on misleading and comparative advertising (B2B), art. 4. NL: art. 6:194a BW. DK: Markedsføringsloven.',
    },
    {
      rule: 'Keep the proof on file before the claim goes out.',
      why: 'In the Netherlands the advertiser has to prove a factual claim is accurate when challenged. Every Moba-versus-Sanovo number needs a dated source in Signal behind it.',
      basis: 'Art. 6:195 BW (burden of proof); Nederlandse Reclame Code.',
    },
    {
      rule: 'Never denigrate Sanovo or its people.',
      why: 'Discrediting a competitor\'s name, products or circumstances makes an otherwise allowed comparison unlawful, and can be actionable as unfair competition.',
      basis: 'Directive 2006/114/EC art. 4(d); art. 6:162 BW (tort).',
    },
    {
      rule: 'Inference stays inside Moba.',
      why: 'Signal labels inferred items (◐), for example "a local service hire means an installed base". Passing an unverified inference to a customer as fact can be misleading or damaging to Sanovo.',
      basis: 'Misleading advertising rules; unfair competition.',
    },
    {
      rule: 'Their names are for identification only.',
      why: 'Naming Sanovo or Staalkat to identify their products is allowed. Using their logos, imagery or copy is not, and suggesting a link with them is never allowed.',
      basis: 'EU Trade Mark Regulation 2017/1001 art. 14; copyright on site imagery and text.',
    },
    {
      rule: 'Green claims need a number and a method.',
      why: 'Energy and water claims from either side ("lowest energy per egg") draw the most scrutiny. Generic environmental claims are banned in consumer advertising from 27 Sep 2026, and buyers\' legal teams apply the same standard in B2B.',
      basis: 'Directive (EU) 2024/825 (empowering consumers for the green transition); ACM sustainability claims guidance.',
    },
    {
      rule: 'No comment on the opposition.',
      why: 'A pending procedure between the companies. Public statements, also casual ones, can affect it.',
      basis: 'Company policy pending IP counsel advice.',
    },
  ],

  collectionRules: [
    {
      rule: 'Public sources only, no circumvention.',
      why: 'Sanovo\'s site blocks plain fetches. Signal reads it through the Internet Archive and Google News rather than evading the block.',
      basis: 'PRD §8.6; computer misuse and database right rules.',
    },
    {
      rule: 'Never ask for a Sanovo quote or confidential document.',
      why: 'A customer who forwards a Sanovo offer may breach their NDA with Sanovo, and Moba may then hold a trade secret it should not have. If one arrives unsolicited, mark it confidential and ask legal before it enters Signal.',
      basis: 'Trade Secrets Directive (EU) 2016/943; Dutch Wet bescherming bedrijfsgeheimen.',
    },
    {
      rule: 'No exchange of sensitive information with Sanovo.',
      why: 'Prices, bids, capacity plans or customer lists must not be swapped with Sanovo people, also not at trade shows or association meetings. Learning it from public sources is fine; learning it from them is not.',
      basis: 'Art. 101 TFEU; EU Horizontal Guidelines 2023, information exchange.',
    },
    {
      rule: 'People data stays minimal.',
      why: 'Hiring and personnel signals touch personal data. Record the role and the intent, not a profile of the person. No tracking of employees\' private accounts.',
      basis: 'GDPR art. 5 and 6(1)(f), legitimate interest with data minimisation.',
    },
    {
      rule: 'LinkedIn via its own export.',
      why: 'Share of voice comes from LinkedIn\'s competitor analytics export, which LinkedIn offers for this purpose. Scraping LinkedIn breaches its user agreement.',
      basis: 'LinkedIn User Agreement §8.2.',
    },
  ],

  inputs: [
    { name: 'Sanovo newsroom (Internet Archive)', url: `${NEWS}/`, kind: 'online', feeds: 'Latest news, claims', state: 'live' },
    { name: 'Google News: Sanovo', url: 'https://news.google.com/search?q=%22Sanovo%22%20egg', kind: 'online', feeds: 'Latest news, trade coverage', state: 'live' },
    { name: 'Sanovo careers site', url: 'https://www.sanovogroup.com/careers', kind: 'online', feeds: 'Hiring signals', state: 'live' },
    { name: 'LinkedIn competitor analytics export', kind: 'upload', feeds: 'Share of voice', state: 'live', legalNote: 'Monthly manual export, inside LinkedIn\'s terms.' },
    { name: 'Espacenet patent watch on Sanovo applicants', url: 'https://worldwide.espacenet.com/', kind: 'online', feeds: 'Capability threat, 12 to 18 months early', state: 'proposed' },
    { name: 'European Patent Register: the opposition file', url: 'https://register.epo.org/', kind: 'online', feeds: 'Legal & IP: status, filings, hearing dates', state: 'proposed', legalNote: 'Public file inspection. Interpretation stays with IP counsel.' },
    { name: 'EUIPO and WIPO trademark watch', url: 'https://www.tmdn.org/tmview/', kind: 'online', feeds: 'Product names before launch', state: 'proposed' },
    { name: 'Danish business register (CVR) annual reports', url: 'https://datacvr.virk.dk/', kind: 'online', feeds: 'Revenue, headcount, management outlook, group structure', state: 'proposed', legalNote: 'Public filings, free of charge.' },
    { name: 'Thornico group newsroom', url: 'https://thornico.com/', kind: 'online', feeds: 'Owner strategy, acquisitions', state: 'proposed' },
    { name: 'SANOVO World hub', url: 'https://sanovogroup.com/', kind: 'online', feeds: 'Latest news, storytelling themes', state: 'proposed' },
    { name: 'Sanovo YouTube channel feed', url: 'https://www.youtube.com/user/SANOVOTECHGROUP', kind: 'online', feeds: 'Launches, demo claims', state: 'proposed' },
    { name: 'Partner newsrooms (Canadian Egg Technologies, MatrixSpec)', url: 'https://www.eggfarmers.ca/press/', kind: 'online', feeds: 'In-ovo sexing timeline and accuracy data', state: 'proposed' },
    { name: 'Dutch Chamber of Commerce (KvK) extract, Sanovo Technology Netherlands', url: 'https://www.kvk.nl/', kind: 'online', feeds: 'Dutch entity, directors, filings', state: 'idea', legalNote: 'Paid extract.' },
    { name: 'Brochures and spec sheets from trade shows', kind: 'upload', feeds: 'Capacity and accuracy numbers', state: 'live', legalNote: 'Public handouts. Upload as a document; OCR handles scans.' },
    { name: 'Stand photos from shows', kind: 'upload', feeds: 'Event radar, stand size, launch wording', state: 'live', legalNote: 'Photograph the stand, not people.' },
    { name: 'Field sales notes and lost-deal debriefs', kind: 'upload', feeds: 'Account risk, pricing context', state: 'live', legalNote: 'Never attach a Sanovo quote or offer.' },
    { name: 'Opposition documents from IP counsel', kind: 'upload', feeds: 'Legal & IP', state: 'idea', legalNote: 'Confidential flag on. Analyst view only.' },
  ],

  gaps: [
    'The Sanovo site blocks automated reads, so this round worked from search results. Items marked "From search" need a person to open the source.',
    'The opposition\'s patent number, status and hearing date are not confirmed. Check the European Patent Register.',
    'Official LinkedIn and YouTube URLs are inferred from page names and syndicated links. Facebook and Instagram were not found.',
    'No financials yet. Sanovo Technology A/S files public annual reports in Denmark.',
    'No in-ovo sexing accuracy figure has been published. The partners say validated data comes later.',
  ],
}
