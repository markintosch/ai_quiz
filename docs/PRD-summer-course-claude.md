# Summer Course Claude AI — PRD v0.1

**Driedaagse fysieke summer course Claude AI. Door Mark de Kock & Frank Meeuwsen.**
Eerste deliverable: een inschrijfpagina met voorinschrijving + aanbetaling.

> Status: concept — input verwerkt uit gesprek 2026-05-08. Open punten staan in §13.

---

## 1. Scope & non-goals

**In scope (v0.1 — "Pre-registratie tier")**
- Eén publieke landingspagina met programma, doelen, tijdsinvestering, prijs, FAQ.
- Voorinschrijving via formulier (naam, e-mail, motivatie, dieetwensen, factuurgegevens).
- Aanbetaling via Mollie (€199, restant later op factuur).
- Bevestigingsmails (deelnemer + organisatoren) via Resend.
- Admin-overzicht van inschrijvingen onder `/admin/summer-course`.
- Nederlandstalig (cursus is NL); EN/FR niet nodig voor v0.1.

**Out of scope (v0.1)**
- Volledige boekingsflow (restant-betaling) — losse factuur via boekhouding.
- Wachtlijst-management na uitverkocht — handmatig in fase 1.
- Cursus-LMS / kennisportaal voor deelnemers — pas relevant als de cursus loopt.
- Affiliate / partner-codes.
- Annuleringsflow (handmatig in fase 1).

---

## 2. Doel van de cursus

Deelnemers verlaten de cursus met:
1. **Een werkend Claude-recept** dat verankerd is in hun eigen werk — geen losse trucs, maar een persoonlijke workflow.
2. **Bagage om zelfstandig verder te bouwen** — Projects, MCP, agents, model-keuze (Opus/Sonnet/Haiku), kostenbewustzijn.
3. **Een kritische, ethische blik** — privacy/GDPR, IP, bias, hallucinaties, "wanneer juist NIET Claude?".

Geen doel: van iedereen een developer maken. Code-skills zijn welkom maar niet vereist.

---

## 3. Doelgroep

Brede knowledge workers, **behalve hardcore programmeurs** (die hebben deze cursus niet nodig).

Specifiek welkom:
- Marketeers / contentmakers — schrijfwerk, research, contentworkflows.
- Ondernemers / freelancers / solo's — Claude als "tweede brein" en hefboom.
- Knowledge workers algemeen — strategen, consultants, beleidsmensen, redacteuren.
- Makers met technische affiniteit (geen programmeurs) — die met Claude Code, MCP en kleine automatiseringen aan de slag willen zonder volledig developer te zijn.

Niveau: **basis ervaring met ChatGPT/Claude is een pré, niet vereist.** We screenen via het motivatieveld in het inschrijfformulier.

---

## 4. Format & tijdsinvestering

- **3 aaneengesloten fysieke dagen.** (Voorkeur: di–do, ruimt ma in voor reizen, vr voor bezinking.)
- **Locatie:** TBD — voorstel: één plek met goed wifi, daglicht, lunch geregeld, parkeerruimte/OV-bereikbaar.
- **Dagschema:**
  - 09:00 – 09:30 inloop + koffie
  - 09:30 – 12:30 **vast ochtendprogramma** (theorie + demo + werkblok in groep)
  - 12:30 – 13:30 lunch (verzorgd)
  - 13:30 – 17:00 **eigen project bouwen onder begeleiding** (Mark + Frank lopen rond, korte 1-op-1's, micro-demo's op aanvraag)
  - 17:00 – 17:30 daily debrief: 3 deelnemers presenteren wat ze gebouwd hebben
- **Tussen de dagen door:** geen huiswerk verplicht, wel optioneel "blijven prutsen" — we delen een Discord/Slack voor onderling sparren.
- **Totale tijdsinvestering deelnemer:** ~24u contact + 0–10u eigen werk tussendoor.

---

## 5. Programma (concept)

### Dag 1 — Foundations & mindset
**Ochtend (vast):**
- Wat ís Claude eigenlijk? (Anthropic, constitutional AI, Opus/Sonnet/Haiku — wanneer welk model)
- Mentale modellen: Claude.ai vs API vs Claude Code — wat is wat, wat past bij wie
- Prompting voorbij de basis: context, structuur, denkstappen, persona's
- Live demo: Mark & Frank doen elk een "echt" stuk werk met Claude voor de groep
- Werkblok: Projects opzetten, custom instructions, eerste eigen prompts

**Middag (begeleid bouwen):**
- Iedereen kiest een eigen project ("waar wil ik aan eind van dag 3 mee thuiskomen?")
- Mark & Frank lopen rond, helpen scopen, eerste prompts
- Daily debrief: 3 deelnemers laten zien

### Dag 2 — Diepte & gereedschap
**Ochtend (vast):**
- Projects, artifacts, file uploads — als productieomgeving
- MCP (Model Context Protocol) uitgelegd voor niet-developers — wat het is, wat het ontsluit (Notion, Gmail, Calendar, Drive)
- Agents en workflows: wanneer een chat, wanneer een agent, wanneer Claude Code
- Light intro Claude Code voor niet-programmeurs ("conversationeel bouwen")
- Werkblok: MCP-koppeling maken naar eigen tools

**Middag (begeleid bouwen):**
- Doorbouwen aan eigen project, nu met Projects + MCP
- Korte "office hours" stijl 1-op-1's met Mark of Frank op inschrijving
- Daily debrief

### Dag 3 — Shippen & volhouden
**Ochtend (vast):**
- "Is dit goed?" — output evalueren, hallucinaties spotten, bronnen checken
- Ethiek, bias, IP, privacy, GDPR, NDA-werk — wat mag wel/niet in Claude
- Kostenbewustzijn — tokens, abonnementen, API-prijzen, wanneer is het waard
- Volhouden: hoe houd je dit in de lucht na de cursus? (rituelen, prompts-bibliotheek, communities)

**Middag (afronden):**
- Eindsprint eigen project
- Slot-presentaties: iedereen 5 min — wat heb je gebouwd, wat ga je er morgen mee doen
- Borrel

---

## 6. Prijs & business case

| Item | Bedrag |
|---|---|
| Reguliere prijs (excl. BTW) | **€899 p.p.** |
| Voorinschrijfprijs / early-bird (excl. BTW) | **€799 p.p.** (eerste 6 plekken) |
| Aanbetaling om plek te reserveren | €199 (verrekend met restant) |
| Restbedrag | factuur, betalen uiterlijk 14 dagen vóór startdatum |
| Maximale groepsgrootte | 12 |
| Minimum om door te gaan | 6 (anders: aanbetaling 100% retour) |

**Bruto omzet bij vol (12×):** €10.788 (regulier) of €9.588 (alle early-bird).
**Mix-aanname:** 6 early-bird + 6 regulier = €10.188.

**Kostenposten (indicatie):**
- Locatie 3 dagen incl. lunch & koffie: €1.500–€2.500
- Borrel slot: €250
- Materialen / cursusboek (digitaal): €0 (eigen productie)
- Mollie + Stripe fees: ~2% = €200
- Marketing: TBD
- **Honorarium Mark & Frank:** restant — uitwerken.

**Inclusief in deelname:**
- 3 dagen begeleiding door Mark & Frank
- Lunch + koffie/thee + slotborrel
- Digitale cursusgids met alle prompts, voorbeelden en links
- 3 maanden toegang tot een afterparty-Slack/Discord
- Eén 30-min 1-op-1 follow-up gesprek na 4 weken (online)

---

## 7. Inschrijfpagina — sectie-IA

URL-voorstel: `/[locale]/summer-course` of standalone `/summer-course` (zie §10).

1. **Hero** — titel, ondertitel ("3 dagen, 12 mensen, je eigen Claude-recept"), data, locatie, twee CTA's (primair: "Reserveer je plek (€199 aanbetaling)", secundair: "Lees het programma").
2. **Voor wie is dit** — 3 persona-blokken, één weglatende ("Niet voor: hardcore programmeurs — voor jullie hebben we andere dingen.").
3. **Wat ga je leren / waar loop je mee weg** — 3 outcome-bullets (zie §2).
4. **Programma** — 3 cards (één per dag), uitklapbaar voor detail.
5. **Tijdsinvestering** — visual: dagschema 09:00–17:30.
6. **Mark & Frank** — twee korte bio's, foto, één-zin-waarom.
7. **Investering** — prijstabel, wat zit erbij in, voorinschrijfvoordeel.
8. **FAQ** — voorzien: niveau, taal (NL), eten/dieet, parkeren, annulering, wat als <6 inschrijvingen, factuur op bedrijfsnaam, BTW.
9. **Inschrijfformulier** — zie §8.
10. **Footer** — privacy, contact, voorwaarden.

---

## 8. Inschrijfformulier — velden

**Persoon**
- Voornaam *
- Achternaam *
- E-mail *
- Telefoon *

**Werk & motivatie**
- Bedrijf / praktijk (optioneel)
- Functie / wat doe je
- "Waar wil je aan het eind van dag 3 mee thuiskomen?" (vrije tekst, max 500 tekens) *
- Ervaring met Claude/ChatGPT (none / beginner / dagelijks gebruik / bouw er al mee)
- Code-ervaring (geen / een beetje HTML-CSS / wel eens script / dev)

**Praktisch**
- Dieetwensen / allergieën (vrije tekst)
- Hoe heb je over deze cursus gehoord (dropdown + "anders")

**Factuur**
- Op naam van: privé / bedrijf
- Bij bedrijf: bedrijfsnaam, KvK, BTW-nr, factuuradres

**Akkoord**
- ☐ Ik ga akkoord met de voorwaarden en het privacybeleid *
- ☐ Houd me op de hoogte van toekomstige cursussen (optioneel)

**Submit-flow:**
1. Validatie client + server.
2. Insert row in `summer_course_registrations` (status: `pending_payment`).
3. Redirect naar Mollie checkout (€199).
4. Mollie webhook → status `confirmed` of `failed`.
5. Bevestigingsmail naar deelnemer (Resend) + notificatie naar `ADMIN_EMAIL`.

---

## 9. Tech & integraties

Alles bestaande infra hergebruiken:

- **Next.js 14 App Router** — nieuwe route.
- **Supabase** — nieuwe tabel `summer_course_registrations` (zie §11).
- **Resend** — twee nieuwe email-templates: `summerCourseConfirmation.tsx`, `summerCourseAdminNotice.tsx`.
- **Mollie** — nieuw, want Stripe is nog niet in repo. Minimaal: `mollie-api-node`, twee env vars (`MOLLIE_API_KEY`, `MOLLIE_WEBHOOK_SECRET`), één webhook route `/api/summer-course/mollie-webhook`.
- **Tailwind + Framer Motion** — bestaande styling.
- **next-intl** — overslaan voor v0.1 (NL-only). Als standalone subtree à la `/Cycle` of `/mentor`: bypass middleware.

**Env vars (nieuw):**
```
MOLLIE_API_KEY=
MOLLIE_WEBHOOK_SECRET=
SUMMER_COURSE_DEPOSIT_CENTS=19900
SUMMER_COURSE_EARLYBIRD_SLOTS=6
```

---

## 10. Deployment-aanpak — twee opties

**Optie A: Geïntegreerd onder `/[locale]/summer-course`** (binnen next-intl tree)
- Voordeel: kant-en-klare i18n, zelfde layout/CMS als rest van quiz.
- Nadeel: NL-only voor v0.1 voelt geforceerd; locale-prefix `/nl/summer-course` oogt raar.

**Optie B: Standalone subtree `/SummerCourse` (mirrors `/Cycle`, `/mentor`)** ← **aanbevolen**
- Voordeel: eigen layout/styling/branding (Mark + Frank, niet K&B), middleware-bypass, geen i18n-druk, eigen tempo.
- Nadeel: één extra middleware-regel, geen automatische taal-switch.
- Implementatie: `src/app/SummerCourse/` met eigen `layout.tsx` + `page.tsx` + `success/page.tsx`. API onder `src/app/api/summer-course/*`. Tabellen `summer_course_*`.

---

## 11. Datamodel (Supabase)

### `summer_course_registrations`
| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| first_name | text | |
| last_name | text | |
| email | text | |
| phone | text | |
| company | text nullable | |
| job_title | text nullable | |
| motivation | text | "Waar wil je mee thuiskomen" |
| claude_experience | text | enum: `none`,`beginner`,`daily`,`builder` |
| code_experience | text | enum: `none`,`html_css`,`scripts`,`dev` |
| dietary_notes | text nullable | |
| referral_source | text nullable | |
| invoice_to | text | enum: `personal`,`company` |
| invoice_company | text nullable | |
| invoice_kvk | text nullable | |
| invoice_vat | text nullable | |
| invoice_address | text nullable | |
| price_tier | text | enum: `early_bird`,`regular` |
| price_cents | integer | full course price (€799 of €899 in cents) |
| deposit_cents | integer | default 19900 |
| status | text | enum: `pending_payment`,`confirmed`,`failed`,`cancelled`,`waitlist` |
| mollie_payment_id | text nullable | |
| paid_at | timestamptz nullable | |
| marketing_consent | boolean default false | |
| gdpr_consent | boolean | |
| created_at | timestamptz | default now() |

**RLS:** alleen service-role schrijft; admin-rol leest. Geen public read.

---

## 12. E-mailflows

### Naar deelnemer (`summerCourseConfirmation.tsx`)
**Trigger:** Mollie webhook → `confirmed`.
**Inhoud:**
- "Yes, je plek is gereserveerd"
- Datum + locatie + dagschema
- Wat meebrengen (laptop, opladen, claude.ai-account)
- Restbedrag-bedrag + uiterste betaaldatum
- 1 voorbereiding-tip ("denk vast na over je project")
- Slack/Discord-uitnodiging (handmatig later, of straks geautomatiseerd)

### Naar admin (`summerCourseAdminNotice.tsx`)
**Trigger:** elke nieuwe registratie (zowel `pending` als `confirmed`).
**Inhoud:** alle ingevulde velden in compacte lijst + status + Mollie link.

### Bij `pending_payment` > 30 min zonder betaling
- Reminder-mail "je plek staat 24u open" (cron / Vercel scheduled).
- Na 24u: status → `cancelled`, plek vrij.

---

## 13. Open vragen & beslispunten

1. **Datum.** Welke week in juli/augustus? (impact op marketingdeadline)
2. **Locatie.** Eén voorstel of opties uitvragen via voorinschrijving?
3. **Hoogte aanbetaling.** €199 redelijk? Frank's voorkeur?
4. **BTW-positie.** Mark + Frank facturen apart of via één entiteit?
5. **Annuleringsvoorwaarden.** Restitutie-staffel? (>30 dagen 100%, 14–30 dagen 50%, <14 dagen 0%?)
6. **Branding.** K&B-stijl meeliften, of eigen "Summer Course" merk (Mark + Frank persoonlijk)?
7. **Wachtlijst.** Bij 12 vol — wachtlijstformulier of "stuur ons een mail"?
8. **Slack vs Discord vs Whatsapp** voor afterparty-community?
9. **Volgorde:** eerst datum vastleggen + locatie, dán pagina live? Of "data binnenkort"-modus?
10. **Inspiratie van [cursusclaudecode.nl/mdk](https://cursusclaudecode.nl/mdk)** verwerken — welke elementen specifiek?

---

## 14. Volgende stappen (voorstel)

1. Akkoord op deze PRD (of revisies in v0.2).
2. Open vragen §13 sluiten.
3. Wireframe van de inschrijfpagina (kan in code direct, geen Figma nodig).
4. Implementatie:
   - SQL-migratie `summer_course_registrations`.
   - Mollie integratie + webhook.
   - Twee Resend templates.
   - `/SummerCourse` standalone subtree + form.
   - Admin-pagina `/admin/summer-course`.
5. Test-betaling met Mollie test-modus.
6. Pagina live op een eigen pad (bijv. `/summer-course-2026`) — eerst onaangekondigd, dan launch.
