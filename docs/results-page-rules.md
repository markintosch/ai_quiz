# Results-pagina regels — wat zie je waar, wanneer

> **Status:** beschrijving van de **huidige** regels zoals ze nu in de code staan
> (gemerged op 2026-05-03). Bedoeld om door Mark gereviewed te worden.

---

## 1 · Welke variant wordt getoond?

URL: `/[locale]/results/[id]`. De pagina kiest één van twee componenten als hoofdlayout op basis van twee velden uit de DB:

| `quiz_version` | `respondent.source` | Variant | Component |
|---|---|---|---|
| `lite` | (eender) | **Lite** | `LiteResultsDashboard` |
| niet-lite | `'public'` | **Extended** | `ScoreDashboard` (variant `extended`) |
| niet-lite | iets anders (bv. `'sbs'`) | **Company** | `ScoreDashboard` (variant `company`) |

---

## 2 · Render-volgorde per variant

### 2.1 Extended variant (publieke quiz)

| # | Component | Conditie |
|---|---|---|
| 1 | Score-hero (cirkel + maturity-level + beschrijving) | altijd |
| 2 | **"Wat jouw score je vertelt" blok** (insight + urgency per maturity-niveau) | altijd ★ NIEUW: was alleen lite |
| 3 | Radar-chart | altijd |
| 4 | Shadow AI flag | alleen als `shadowAI.triggered` |
| 5 | Dimension-breakdown (gekleurde balken) | altijd |
| 6 | Benchmark-blok (markt / cohort / rol) | als ≥1 andere respondent — zie §6 |
| 7 | Aanbevelingen (1–3 cards) | als er ≥1 is |
| 8 | "Volgende stap" CTA-blok → `/next-steps` | altijd, **tekst is maturity-band gestuurd** ★ NIEUW |
| 9 | "Deel je resultaat" balk | altijd |
| 10 | Referral-sectie | altijd |

### 2.2 Company variant

Identiek aan extended, behalve:

- **Vertrouwelijkheids-blok** wordt toegevoegd direct onder de hero (vóór "Wat jouw score je vertelt")
- **Calendly-embed inline** ipv "Volgende stap" blok
- **Geen deel-balk** (bewust: company-resultaten niet publiek delen)
- **Referral wijst naar de company-quiz URL** (`/quiz/[slug]`)

### 2.3 Lite variant

| # | Component | Conditie |
|---|---|---|
| 1 | Score-hero | altijd |
| 2 | Radar | altijd |
| 3 | Dimension-breakdown | altijd |
| 4 | Shadow AI-flag | alleen als triggered |
| 5 | "Wat jouw score je vertelt" | altijd |
| 6 | Primaire aanbeveling (1×) | altijd als er een is |
| 7 | "Ook het aanpakken waard" (max 2× supporting) | altijd als er ≥1 is |
| 8 | "Volgende stap" CTA-blok | altijd, **tekst is maturity-band gestuurd** ★ NIEUW |
| 9 | "Doe de uitgebreide assessment" CTA → `/a/extended` | altijd (behalve fitness/PR products) |
| 10 | Deel-balk | altijd |
| 11 | Referral (uitklapbaar) | altijd |

> **Lite heeft GEEN benchmark, GEEN inline Calendly, GEEN vertrouwelijkheidsblok** — maar **WEL** Calendly-link op iedere recommendation card (★ NIEUW: was er niet).

---

## 3 · Hoe worden aanbevelingen gekozen?

Twee fases: (A) basis-selectie op dimensiescores, (B) overrides op rol + bedrijfsgrootte.

### 3.1 Basis-selectie

```
1. Shadow AI severity = 'high'?
   → primair = Shadow AI
   → supporting #1 = laagste dimensie
   → supporting #2 = op-één-na-laagste
   STOP

2. Anders:
   sorteer dimensies oplopend (laagste eerst)
   tiebreak: strategy_vision → governance_risk → data_readiness
             → talent_culture → current_usage → opportunity_awareness

3. Primair = laagste dimensie

4. Shadow AI getriggerd (maar niet 'high')?
   → supporting #1 = Shadow AI
   → supporting #2 = op-één-na-laagste
   Anders:
   → supporting #1 = op-één-na-laagste
   → supporting #2 = derde-laagste

Maximum 3 cards.
```

### 3.2 Overrides op rol + bedrijfsgrootte ★ NIEUW

Worden toegepast NA de basis-selectie, vóór de cards op het scherm verschijnen:

**Regel A — CEO-rol** (job_title bevat 'CEO', 'Chief Executive', 'Algemeen Directeur', 'General Manager', 'Directeur Eigenaar', 'Directeur Général'):
- Voegt een **CEO MT-sessie** card toe als **PRIMAIR**
- Demoot de bestaande primaire dimensie-aanbeveling tot supporting
- Trimt de lijst tot max 3 cards
- Heading: *"Lijn je MT in één werksessie uit op AI"*
- CTA gaat naar Calendly strategy-link (30 min)

**Regel B — Corporate bedrijfsgrootte** (`501–1000` of `1000+`):
- Voegt een **opleiding/teamontwikkeling** card toe als supporting
- Als er al 3 cards zijn: vervangt de laatste supporting
- Heading: *"Investeer in AI-bekwaamheid van je teams"*

### 3.3 Tekst per card

`heading`, `body` en `cta` worden per dimensie + locale opgezocht in `RECOMMENDATION_MAP` en `OVERRIDE_RECOMMENDATION_MAP` (`src/lib/scoring/recommendations.ts`). Talen: `en`, `nl`, `fr`.

Bestaande database-rijen bevatten Engelstalige teksten — de results-pagina hervertaalt op render-moment via `localizeRecommendations()` (geen DB-migratie nodig).

### 3.4 Calendly-link onder elke card

| Conditie | Link |
|---|---|
| `productUI` heeft eigen rules (bv. M&A) | resolveer via `productUI.calendlyRules` |
| AI Maturity, `overall < 50` | discovery (15 min) |
| AI Maturity, `overall ≥ 50` | strategy (30 min) |

**Lite cards** krijgen nu ook deze ctaHref ★ NIEUW.

---

## 4 · "Volgende stap" CTA-blok — maturity-band gestuurd ★ NIEUW

De heading + body + CTA-tekst onder dit blok past zich aan op de maturity-band:

| Band | Niveaus | Framing |
|---|---|---|
| **Starter** | Unaware · Exploring · Experimenting | "Leg de basis voor AI in je bedrijf" — focus op richting, governance, eerste use cases |
| **Scaler** | Scaling · Leading | "Schaal je AI-momentum op met strategische sturing" — focus op investeren, consolideren, voorsprong behouden |

CTA-tekst:
- Starter → "Plan een begeleidingsgesprek →"
- Scaler  → "Plan een strategiesessie →"

Geldt zowel in extended als lite. Te configureren in `getNextStepsCopy()` in `src/lib/scoring/recommendations.ts`.

---

## 5 · "Wat jouw score je vertelt" blok — nu overal ★ NIEUW

Dit blok stond eerder alleen in lite. Verschijnt nu ook in extended en company.

Bron: `messages/{nl,fr,en}.json → results.maturityLevels.{level}.insight + .urgency`

Per maturity-niveau is er een vaste insight-tekst en een urgency-tekst. Te wijzigen door alleen de messages-bestanden aan te passen — geen code-wijziging nodig.

---

## 6 · Welke benchmark-panelen verschijnen?

Drie kolommen, elk apart gegate:

| Paneel | Wordt getoond als |
|---|---|
| **Markt** | ≥1 andere full-assessment respondent in DB |
| **Cohort** | respondent heeft `cohort_id` + ≥1 ander cohortlid |
| **Rol** | respondent heeft `job_title` + ≥1 ander persoon met dezelfde job_title (case-insensitive) |

Disclaimer "dit zijn gemiddelden, geen oordelen" verschijnt alleen als markt < 10 personen.

> Alleen extended/company krijgt benchmark — lite niet.

---

## 7 · Maturity-niveau drempels

Bepaald door `overall` score, in oplopende volgorde:

| Score | Niveau (default AI Maturity) | Band |
|---|---|---|
| ≤ 19 | Unaware | starter |
| 20–39 | Exploring | starter |
| 40–59 | Experimenting | starter |
| 60–79 | Scaling | scaler |
| 80–100 | Leading | scaler |

Per product configureerbaar via `src/products/{key}/config.ts → scoring.maturityThresholds`.

---

## 8 · Wat de rol (`job_title`) wel én niet stuurt

**Wel** ★ NIEUW:
- Bij CEO-achtige titel → primaire recommendation wordt MT-sessie (zie §3.2 Regel A)
- Rol-benchmark-paneel (vergelijking met dezelfde job_title)

**Niet:**
- Welke teksten in welk component verschijnen (insights, score-vertelt, etc.)
- Of de Shadow AI-flag verschijnt
- Of de vertrouwelijkheids-tekst verschijnt
- De volgorde van de blokken

## 8b · Wat de bedrijfsgrootte (`company_size`) wel én niet stuurt

**Wel** ★ NIEUW:
- Bij `501–1000` of `1000+` → opleiding/teamontwikkeling supporting recommendation toegevoegd

**Niet:**
- Geen invloed op insights, primary recommendation, of CTA-tekst

---

## 9 · Per-product overrides (white-label)

| Wat | Configureerbaar per product? | Waar |
|---|---|---|
| Maturity drempels + namen + kleuren | ✅ | `products/{key}/config.ts → scoring.maturityThresholds` |
| Maturity beschrijvingen | ✅ | `products/{key}/config.ts → maturityDescriptions` |
| Calendly URL routing | ✅ | `products/{key}/config.ts → calendly.rules` |
| Recommendation-teksten + selectielogica | ✅ | `products/{key}/recommendations.ts` |
| Score-label op de cirkel | ✅ | `defaultCopy[locale].scoreLabelOverride` |
| Maturity-band CTA-copy (Starter / Scaler) | ❌ | hardcoded in `getNextStepsCopy()` — geldt voor alle products |
| CEO + corporate overrides | ❌ | hardcoded in `applyRoleAndSizeOverrides()` — geldt voor alle products |
| Vertrouwelijkheids-blok aan/uit | ❌ | hardcoded: alleen company-variant |
| Render-volgorde van blokken | ❌ | hardcoded in `ScoreDashboard.tsx` / `LiteResultsDashboard.tsx` |
| Deel-balk | ❌ | hardcoded: alleen lite + extended |

---

## 10 · Open vragen — nog te beslissen

1. **Andere C-suite rollen?** Nu detecteren we alleen CEO-achtige titels. Wil je ook CTO/CFO/CMO/CIO andere overrides geven (bv. CFO → ROI-framed CTA, CTO → tech-stack assessment), of blijft CEO de enige rol-override?
2. **Tussen-grootte (51–500)?** Nu krijgen alleen 501+ corporates de training-card. Moet 51–200 of 201–500 ook iets specifieks krijgen (mid-market framing)?
3. **MT-sessie Calendly-link.** De CEO-override gebruikt nu de standaard strategy URL. Wil je een dedicated Calendly-link voor de MT-sessie?
4. **Lite vs extended detail-niveau bij Starter-band.** Voor Unaware/Exploring is de insight-tekst nu identiek tussen lite en extended. Wil je dat extended hier rijker wordt, of houden we het simpel?
5. **Stoppen met lite of niet.** Mark heeft eerder gezegd lite moet kans krijgen om door te gaan naar extended. Die "Doe de uitgebreide assessment" CTA staat er, maar gaat naar `/a/extended` (een nieuwe quiz). Wil je een continuatie-flow waarin de 7 lite-vragen behouden blijven en alleen de extra 19 vragen worden aangeboden?

---

## Hoe dit te updaten

Streep door wat anders moet, vul aan met nieuwe regels. Daarna pas ik de code en dit document aan.
