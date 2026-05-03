# Results-pagina regels — wat zie je waar, wanneer

> **Status:** beschrijving van de **huidige** regels zoals ze nu in de code staan
> (commit `f28ec0c`, 2026-05-03). Bedoeld om door Mark gereviewed te worden:
> strepen in regels die anders moeten, aanvullen waar logica ontbreekt.
>
> **Niet** een specificatie. De code is leidend; dit document beschrijft wat de
> code op dit moment doet.

---

## 1 · Welke variant wordt getoond?

URL: `/[locale]/results/[id]`. De pagina kiest één van twee componenten als
hoofdlayout, op basis van twee velden uit de DB:

| `quiz_version` | `respondent.source` | Variant | Component |
|---|---|---|---|
| `lite` | (eender) | **Lite** | `LiteResultsDashboard` |
| niet-lite | `'public'` | **Extended** | `ScoreDashboard` (variant `extended`) |
| niet-lite | iets anders (bv. `'sbs'`) | **Company** | `ScoreDashboard` (variant `company`) |

> **Bron:** `src/app/[locale]/results/[id]/page.tsx:131-134`
>
> `companySlug = isCompany ? respondent.source : undefined` — bepaalt o.a. de URL voor doorverwijzingen.

---

## 2 · Render-volgorde per variant

### 2.1 Extended variant (`/[locale]/results/[id]`, public quiz)

In deze volgorde, alleen tonen als de conditie waar is:

| # | Component | Conditie |
|---|---|---|
| 1 | Score-hero (cirkel + maturity-level + beschrijving) | altijd |
| 2 | Confidentialiteits-blok (vertrouwelijkheid voor werkgever) | **niet** in extended — alleen company |
| 3 | Radar-chart | altijd |
| 4 | **Shadow AI flag** | alleen als `score.shadowAI.triggered === true` |
| 5 | Dimension-breakdown (de gekleurde balken) | altijd |
| 6 | **Benchmark-blok** (markt / cohort / rol) | alleen als er minstens 1 andere respondent is — zie §4 |
| 7 | Aanbevelingen (kop "Aanbevelingen voor u" + 1–3 cards) | alleen als `recommendations.length > 0` |
| 8 | Calendly-embed (inline) | **niet** in extended — alleen company |
| 9 | "Klaar voor de volgende stap?" CTA-blok → `/next-steps` | altijd in extended |
| 10 | "Deel je resultaat" balk (kopieer link + LinkedIn) | altijd in extended |
| 11 | Referral-sectie (anderen uitnodigen) | altijd |

> **Bron:** `src/components/results/ScoreDashboard.tsx:196-396`

### 2.2 Company variant (`/[locale]/quiz/[slug]` heeft hier ingevuld)

Identiek aan extended, behalve:

| # | Component | Conditie |
|---|---|---|
| 2 | **Confidentialiteits-blok** | altijd in company (NL/EN/FR teksten in `ScoreDashboard.tsx:168-177`) |
| 8 | **Calendly-embed (inline)** | altijd in company |
| 8b | "Prefer to explore options at your own pace?" link → `/next-steps` | alleen als `productUI.key === 'ai_maturity'` (dus niet voor PR Maturity, M&A, etc.) |
| 9 | "Klaar voor de volgende stap?" CTA-blok | **niet** in company (Calendly heeft de plek overgenomen) |
| 10 | "Deel je resultaat" balk | **niet** in company (deelbaarheid bewust uit) |
| 11 | Referral-sectie | altijd, maar wijst naar `/quiz/[slug]` ipv publieke quiz |

> **Bron:** `ScoreDashboard.tsx:255-263, 314-335, 372-394`

### 2.3 Lite variant (publieke 7-vragen-versie)

Volgorde, weer met conditie:

| # | Component | Conditie |
|---|---|---|
| 1 | Score-hero | altijd |
| 2 | Radar-chart | altijd |
| 3 | Dimension-breakdown | altijd |
| 4 | Shadow AI flag | alleen als `triggered` |
| 5 | "Wat jouw score je vertelt" blok (insight + urgency) | altijd, tekst per `maturityLevel` uit `messages/{nl,fr,en}.json` |
| 6 | Primaire aanbevelingen (1×) | alleen als `primaryRecs.length > 0` |
| 7 | "Ook het aanpakken waard" (supporting recs, max 2×) | alleen als `supportingRecs.length > 0` |
| 8 | "Doe de volledige assessment" CTA-blok | altijd in lite |
| 9 | Deel-balk | altijd in lite |
| 10 | Referral-sectie (uitklapbaar) | altijd |

> **Bron:** `LiteResultsDashboard.tsx:196-490`. Geen Calendly, geen benchmark, geen confidentialiteits-blok.

---

## 3 · Welke aanbevelingen verschijnen?

Twee fases: (a) selectie — welke dimensies krijgen een card; (b) tekst —
welke heading/body/cta krijgt elke card.

### 3.1 Selectie

> **Bron:** `src/lib/scoring/recommendations.ts:168-220`

```
Stap 1 — Override: Shadow AI severity = 'high'?
  → primair = Shadow AI
  → supporting #1 = laagst-scorende dimensie
  → supporting #2 = op-één-na-laagst
  → KLAAR (max 3 cards)

Stap 2 — Sorteer dimensies op normalized score (oplopend)
  Tiebreak: strategy_vision → governance_risk → data_readiness
            → talent_culture → current_usage → opportunity_awareness

Stap 3 — Primair = laagste dimensie

Stap 4 — Shadow AI triggered (maar niet 'high')?
  → supporting #1 = Shadow AI
  → supporting #2 = op-één-na-laagste dimensie
  Anders:
  → supporting #1 = op-één-na-laagste dimensie
  → supporting #2 = derde-laagste dimensie

Max 3 cards in totaal.
```

### 3.2 Tekst per card

`heading`, `body` en `cta` worden per dimensie + locale opgezocht in
`RECOMMENDATION_MAP` (`recommendations.ts:14-152`). Talen: `en`, `nl`, `fr`.

Bestaande database-rijen bevatten Engelstalige teksten — de results-pagina
hervertaalt op render-moment via `localizeRecommendations()` (geen DB-migratie
nodig).

### 3.3 Calendly-link onder elke recommendation

> **Bron:** `ScoreDashboard.tsx:132-134, 190-192` + `src/products/types.ts:resolveCalendlyUrl()`

| Conditie | Calendly-link |
|---|---|
| `productUI` heeft eigen rules (niet-AI-Maturity products) | resolveer via `productUI.calendlyRules` (per product te configureren) |
| `productUI.key === 'ai_maturity'`, `overall < 50` | discovery (15 min, `NEXT_PUBLIC_CALENDLY_DISCOVERY_URL`) |
| `productUI.key === 'ai_maturity'`, `overall >= 50` | strategy (30 min, `NEXT_PUBLIC_CALENDLY_STRATEGY_URL`) |

---

## 4 · Welke benchmark-panelen verschijnen?

> **Bron:** `src/app/[locale]/results/[id]/page.tsx:184-285` + `BenchmarkComparison.tsx`

Drie kolommen, elk onafhankelijk gegate:

| Paneel | Wordt getoond als | Bron |
|---|---|---|
| **Markt** (alle assessments) | minstens 1 andere full-assessment respondent in DB | altijd geprobeerd |
| **Cohort** | respondent heeft `cohort_id`, en cohort heeft minstens 1 andere persoon | alleen company variant heeft meestal `cohort_id` |
| **Rol** | respondent heeft `job_title`, en minstens 1 andere persoon met dezelfde job_title (case-insensitive `ilike`) | overal mogelijk |

Het hele benchmark-blok wordt verborgen als markt < 1 (minder dan 2 respondenten totaal).

> **Disclaimer-tekst** ("dit zijn gemiddelden, geen absolute oordelen") verschijnt alleen als `market.count < 10` — `BenchmarkComparison.tsx:155`.

---

## 5 · Maturity-level (Unaware → Leading)

> **Bron:** `productConfig.scoring.maturityThresholds` in elk product-config-bestand

Bepaald door `overall` score, in oplopende volgorde:

| Score | Level (default AI Maturity) |
|---|---|
| ≤ 19 | Unaware |
| 20–39 | Exploring |
| 40–59 | Experimenting |
| 60–79 | Scaling |
| 80–100 | Leading |

> **Per product configureerbaar** via `src/products/{key}/config.ts → scoring.maturityThresholds`.
> Andere products (PR Maturity, M&A, Cloud Readiness, etc.) hebben eigen niveau-namen + drempels.

De **kleur** van de score-cirkel + level-naam komt uit `threshold.colorClass / bgClass / ringClass`. De **beschrijving** komt uit `productConfig.maturityDescriptions[level]`.

---

## 6 · Wat de rol (`job_title`) NIET stuurt

Op dit moment heeft `job_title` alleen invloed op het **rol-benchmark-paneel**
(of er een "vs. zelfde rol" kolom verschijnt).

Wat NIET door rol wordt gestuurd:

- Welke aanbevelingen je krijgt
- Welke teksten in welk component verschijnen
- Welke Calendly-link je ziet
- Of de Shadow AI flag wordt getoond
- Of de confidentialiteits-tekst verschijnt
- Of de "next-steps" CTA verschijnt

Als je hier rol-gestuurd gedrag wilt (bv. "voor CEO's andere recommendations" of
"voor engineers extra technische sectie") — dan moet er nieuwe logica bij. Geef
aan welke regel je wilt en waar.

---

## 7 · Per-product overrides (white-label)

Sommige regels zijn per product-config te overschrijven, andere zijn
hardcoded in de results-component. Snel overzicht:

| Wat | Configureerbaar per product? | Waar |
|---|---|---|
| Maturity drempels + namen + kleuren | ✅ | `products/{key}/config.ts → scoring.maturityThresholds` |
| Maturity beschrijvingen | ✅ | `products/{key}/config.ts → maturityDescriptions` |
| Calendly URL routing | ✅ | `products/{key}/config.ts → calendly.rules` |
| Recommendation-teksten + selectielogica | ✅ | `products/{key}/recommendations.ts` (eigen `generateRecommendations`) |
| Score-label op de cirkel | ✅ | `defaultCopy[locale].scoreLabelOverride` |
| Confidentialiteits-blok aan/uit | ❌ | hardcoded: alleen company-variant |
| Shadow AI logica | ⚠️ | per product flag-detector (`products.flags`), maar UI hardcoded |
| Render-volgorde van blokken | ❌ | hardcoded in `ScoreDashboard.tsx` / `LiteResultsDashboard.tsx` |
| "Klaar voor volgende stap?" CTA | ❌ | hardcoded: alleen extended-variant |
| "Prefer to explore options" link | ❌ | hardcoded: alleen `ai_maturity` company |
| Deel-balk | ❌ | hardcoded: alleen lite + extended (niet company) |

---

## 8 · Wat ontbreekt — open vragen voor Mark

Wat ik **niet** in de code zie, dus waar geen logica voor is:

1. **Per-rol recommendations.** Als CEO en engineer dezelfde dimensiescores hebben, krijgen ze identieke recommendations. Wil je hier wel onderscheid?
2. **Per-sector / per-industry overrides.** Geen logica die op `industry` of `company_size` reageert, hoewel die velden wel op `respondents` staan.
3. **Dynamische CTA-tekst per maturity-level.** De "Klaar voor de volgende stap?" header is een vaste zin, niet aangepast aan score.
4. **"Wat jouw score je vertelt"** — alleen lite-variant heeft dit blok (uit `messages/*.json` per maturity-level). De extended/company-variant heeft alleen de korte beschrijving onder de cirkel. Wil je deze block ook daar?
5. **Score-band overrides voor recommendations** (bv. "bij score < 30 ook Shadow AI tonen ongeacht trigger"). Dat soort drempel-logica is nu strikt op dimensie-rangschikking gebaseerd.

---

## Hoe dit te updaten

Streep door wat anders moet, vul aan met nieuwe regels, en vermeld bij elke
wijziging welk gedrag je verwacht. Daarna pas ik de code aan en dit document
mee.

Als je een hele nieuwe regel wilt zoals "bij score X + rol Y → toon component
Z" — graag concreet:
- Wanneer (welke condities)
- Wat (welk component, welke tekst, welke link)
- In welke variant (lite / extended / company / alle)
