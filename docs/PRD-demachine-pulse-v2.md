# PRD — De Machine Pulse (v2)
**Product:** Thematische collectieve opinietool voor VPRO De Machine
**Werknaam:** De Machine Pulse
**Status:** Revised concept for build
**Datum:** 2026-03-26
**Auteur:** Mark de Kock / Kirk & Blackbeard

---

## 1. Productvisie

De Machine Pulse is een journalistiek product waarmee VPRO De Machine de mening van haar publiek gestructureerd ophaalt rond terugkerende thema's in de muziekscene, met nadruk op events, festivals, artiesten, labels, platforms en aanverwante cultuuronderwerpen.

Deelnemers beoordelen een gekozen onderwerp op vijf tot zes vaste dimensies. Na het invullen zien zij hun eigen score naast het live opgebouwde collectieve beeld van andere deelnemers. Het product is nadrukkelijk geen simpele poll, maar een meerdimensionale opinielaag die journalistiek bruikbaar wordt gemaakt in podcast, site, social en rapportage.

De Machine Pulse bestaat uit twee nauw verbonden productlagen:

**1. Fans-facing experience**
De publiekslaag waarin luisteraars thema's ontdekken, onderwerpen beoordelen, hun score vergelijken en delen.

**2. Redactie-dashboard**
De journalistieke backend waarin thema's worden ingericht, onderwerpen worden toegevoegd via URL-ingest, data wordt bewaakt en output wordt voorbereid voor publicatie en podcastgebruik.

---

## 2. Productdoel

### 2.1 Publieksdoel
Luisteraars actief laten meedoen aan een vraagstuk uit de muziekscene, hun mening structureren en die laten spiegelen aan anderen.

### 2.2 Redactioneel doel
De Machine voorzien van bruikbare publieksinzichten die in podcast, site, social en analyse terugkomen als journalistiek materiaal.

### 2.3 Relationeel doel
Een terugkerend ritme opbouwen waarin luisteraars eerder terugkomen, zich inschrijven voor updates en zich mede-eigenaar voelen van de uitkomst.

---

## 3. Probleem en kans

**Probleem**
De Machine bedient een publiek met duidelijke, vaak goed onderbouwde meningen over de muziekindustrie, festivals, artiesten en scene-ontwikkelingen. Die meningen verdwijnen na de aflevering of blijven beperkt tot losse socials, appgroepen en reacties. Er is geen structureel mechanisme om die opvattingen te verzamelen, te vergelijken en redactioneel te benutten.

**Kans**
Een terugkerende thematische opinietool maakt het mogelijk om culturele en scene-specifieke meningen te verzamelen, patronen zichtbaar te maken over meerdere dimensies, trends over tijd te volgen, journalistieke stukken te bouwen op publiekssignalen en een herkenbare De Machine-rubriek te ontwikkelen.

**Verschil met een poll**
Een poll vraagt één ding. De Machine Pulse vraagt meerdere inhoudelijke dimensies tegelijk en maakt spanning zichtbaar — een festival kan hoog scoren op eco en laag op line-up durf. Dat maakt de output journalistiek veel interessanter.

---

## 4. Journalistieke uitgangspunten

De Machine Pulse is geen marktonderzoekstool en claimt geen representatieve steekproef. De uitkomsten moeten steeds worden gepresenteerd als:

> *een thematische publieksmeting onder deelnemers uit het bereik en netwerk van De Machine*

**Redactionele regels:**
- Resultaten worden altijd voorzien van context
- Kleine datasets krijgen geen harde conclusies
- Uitslagen worden niet gepresenteerd als objectieve kwaliteitsranking
- Methodologische beperkingen worden zichtbaar gemaakt waar relevant

---

## 5. Fans-facing experience

### 5.1 Fase 0 — Pre-subscriptie
Per aankomend thema toont de landingspagina een countdown, thematitel en de mogelijkheid om:
1. Een event of onderwerp te suggereren
2. Op suggesties van anderen te stemmen
3. Zich in te schrijven voor notificatie bij opening

### 5.2 Fase 1 — Actieve meting
Landingsscherm toont:
- Het huidige thema + korte uitleg
- Geselecteerde entity cards (visueel herkenbaar: naam, beeld, contextregel)
- Countdown tot sluiting

### 5.3 Beoordeling
Per onderwerp: 5–6 vragen op bipolaire Likert-schaal (1–5) met inhoudelijk geformuleerde ankerpunten.

**Voorbeeld:**
Line-up → 1 = Veilig en voorspelbaar / 5 = Verrassend en eigenzinnig
Commercialisering → 1 = Voelt oprecht en scene-gedreven / 5 = Voelt overmatig merk- en sponsor-gedreven

### 5.4 Optionele lead capture
Na beoordeling: optioneel e-mail voor einduitslag + toekomstige thema's. Expliciete consent vereist.

### 5.5 Resultaatpagina

**Kerncomponenten:**
1. **Jouw radarplot** — eigen scores op alle dimensies
2. **Collectieve overlay** — live gemiddelde van alle deelnemers
3. **Deelnemersnummer** — "Jij bent deelnemer #1.247 — gebaseerd op 1.247 beoordelingen"
4. **Afwijkingsregels** — "Jij bent strenger op commercialisering dan 68% van de deelnemers"
5. **Responsstatus** — Vroege signalen / Eerste patroon zichtbaar / Groeiend beeld / Stevige responsbasis
6. **Countdown** — tot sluiting (of "definitieve uitslag" na sluiting)

### 5.6 Delen

**Primaire deelgedachte:** Niet "kijk mijn score" maar "klopt jouw mening met die van anderen?"

Kanalen: WhatsApp (primair) → Instagram Stories → LinkedIn → X

Dynamische share asset:
- Jouw radarplot (niet de collectieve overlay — die moet je zelf gaan inzien)
- Deelnemersnummer, thema + onderwerp, countdown/eindstatus, De Machine branding

---

## 6. Redactie-dashboard

### 6.1 Doelen
- Thema's aanmaken en plannen
- Onderwerpen toevoegen via URL-ingest
- Visuele en inhoudelijke content valideren
- Dimensies instellen
- Response health monitoren
- Opvallende patronen signaleren
- Output maken voor podcast, site en social

### 6.2 Dashboard-onderdelen

**Dashboard home:** actieve/aankomende/gesloten thema's, totaal responses, opvallende patronen, moderatiemeldingen

**Thema-setup:** titel, slug, beschrijving, gekoppelde aflevering, pre-sub open/sluit, meting open/sluit, publicatiestatus, disclaimer

**Entity management:** events, festivals, artiesten, labels, platforms, podia

**Dimensiebeheer:** label, ankerteksten, sortering, weging, redactionele notitie

**Response monitoring:** responses per thema/entity, verloop over tijd, drop-off, suspicious bursts

**Output tools:** toplines, polariserende dimensies, exporteerbare samenvattingen, publicatiemodus

---

## 7. Entity ingest via URL

**Principiële keuze:** nieuwe onderwerpen worden primair toegevoegd via een bron-URL (officiële festivalpagina, venue, artist, etc.)

**Wat het systeem ophaalt:**
- Titel, type entity, slug, hero image, logo, samenvatting, datum/periode, locatie, organisator, canonical URL, tags, social preview velden

**Regels:**
- Automatische ingest maakt altijd een concept — nooit directe publicatie
- Redactie moet velden controleren, copy aanscherpen, beeld goedkeuren en publicatie bevestigen

---

## 8. Agent-assisted profile builder

Bij ingest bouwt een Claude-agent een redactioneel bruikbaar basisprofiel.

**Output per event/festival:**
- Naam, type, editie, datum/periode, locatie, korte beschrijving, organizer, hero image voorstel, tags, bronverwijzingen, velden die review nodig hebben

**Absolute regel:** de agent publiceert nooit zelfstandig. Output is voorstel, concept, redactioneel hulpmiddel — niet definitieve copy.

---

## 9. Data- en methodiekprincipes

**Type data:** thematisch, publieksgedreven, zelfselecterend, cultureel contextueel — geen formele representatieve populatiemeting

**Presentatieprincipes:**
- Gebruik: "onder deelnemers aan deze Pulse", "binnen deze meting ontstaat dit beeld"
- Vermijd: "statistisch bewezen", objectieve eindranglijsten, absolute kwaliteitsclaims

**Confidence labels (op basis van n=, spreiding, stabiliteit):**
- Vroege signalen
- Eerste patroon zichtbaar
- Groeiend collectief beeld
- Stevige responsbasis

---

## 10. Deduplicatie en misbruikpreventie

- 1 response per entity per gebruiker/device binnen logische periode
- Soft update flow: eerdere response aanpassen i.p.v. opnieuw aanmaken
- Signalen: ip_hash, session heuristics, suspicious burst detection
- Dashboard markeert verdachte patronen voor review — geen automatische blokkades

---

## 11. Privacy en governance

- Strikte scheiding: opiniedata / contactdata / technische misbruikpreventiedata
- Lead capture: expliciete consent, duidelijk doel, geen verborgen opt-in
- Bewaartermijnen per datatype
- Publicatierechten expliciet belegd bij redactie

---

## 12. Datamodel

```sql
pulse_themes (
  id UUID PK,
  slug TEXT UNIQUE,
  title TEXT,
  description TEXT,
  editorial_intro TEXT,
  linked_episode_url TEXT,
  presub_open_at TIMESTAMP,
  presub_close_at TIMESTAMP,
  opens_at TIMESTAMP,
  closes_at TIMESTAMP,
  published BOOLEAN DEFAULT false,
  disclaimer_text TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

pulse_entities (
  id UUID PK,
  theme_id UUID FK,
  entity_type TEXT,              -- event, festival, artist, label, platform, venue, org
  slug TEXT,
  label TEXT,
  subtitle TEXT,
  description_short TEXT,
  source_url TEXT,
  source_domain TEXT,
  canonical_url TEXT,
  hero_image_url TEXT,
  og_image_url TEXT,
  logo_url TEXT,
  location_text TEXT,
  organizer_name TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  edition_label TEXT,
  ingest_status TEXT,            -- draft, reviewed, approved, live
  metadata_reviewed_by TEXT,
  last_fetched_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

pulse_dimensions (
  id UUID PK,
  theme_id UUID FK,
  slug TEXT,
  label TEXT,
  anchor_low TEXT,
  anchor_high TEXT,
  weight DECIMAL DEFAULT 1.0,
  editorial_note TEXT,
  sort_order INT
)

pulse_responses (
  id UUID PK,
  theme_id UUID FK,
  entity_id UUID FK,
  respondent_id UUID NULL,
  scores JSONB,
  submitted_at TIMESTAMP,
  ip_hash TEXT,
  session_hash TEXT,
  revision_of UUID NULL
)

pulse_leads (
  id UUID PK,
  email TEXT,
  theme_id UUID FK,
  consent_marketing BOOLEAN DEFAULT false,
  consent_results BOOLEAN DEFAULT true,
  created_at TIMESTAMP
)

pulse_suggestions (
  id UUID PK,
  theme_id UUID FK,
  suggested_label TEXT,
  suggested_url TEXT,
  suggested_by_email TEXT NULL,
  vote_count INT DEFAULT 0,
  status TEXT,                   -- open, shortlisted, rejected, selected
  created_at TIMESTAMP
)

pulse_agent_profiles (
  id UUID PK,
  entity_id UUID FK,
  generated_title TEXT,
  generated_summary TEXT,
  generated_tags JSONB,
  generated_fields JSONB,
  confidence_flags JSONB,
  created_at TIMESTAMP
)

pulse_anomaly_flags (
  id UUID PK,
  theme_id UUID FK,
  entity_id UUID FK,
  flag_type TEXT,
  severity TEXT,
  details JSONB,
  created_at TIMESTAMP
)
```

---

## 13. Live aggregation

```sql
SELECT
  d.slug,
  d.label,
  ROUND(AVG((r.scores->>d.slug)::numeric), 2) AS avg_score,
  COUNT(*) AS n
FROM pulse_responses r
JOIN pulse_dimensions d ON d.theme_id = r.theme_id
WHERE r.theme_id = $1
  AND r.entity_id = $2
GROUP BY d.slug, d.label;
```

Bij groei: materialized views, cached aggregation, scheduled refresh.

---

## 14. Design- en experienceprincipes

**3voor12 / VPRO design tokens:**
- Zwart (`#000`) · gebroken wit (`#f4f4f4` / `#fcfdeb`) · geel-groen (`#e3ef38`)
- Paars (`#2e0f3d`, `#9a32cd`) alleen op focus/active input states
- Nul border-radius op alles behalve radio buttons
- Inter als fallback voor proprietary VPRO Simplistic Sans

**Toon:** scherp, redactioneel, cultureel geloofwaardig — niet corporate, niet gimmicky

---

## 15. MVP-scope

| In MVP | Buiten MVP |
|---|---|
| 1 actief thema tegelijk | Meerdere gelijktijdige thema's |
| Pre-subscriptie fase | Meerdere entities per sessie vergelijken |
| Entity ingest via URL | Trendlijnen over edities/jaren |
| Agent-generated concept profile | Archetypen |
| Redactionele reviewflow | Geavanceerde AI-redactietools |
| Live collectieve overlay | White-label self-service |
| Deelnemersnummer + countdown | |
| Optionele lead capture | |
| Dashboard: theme setup, entity mgmt, response monitoring | |
| Share asset generation | |

---

## 16. Priority build order

1. Theme + entity schema (SQL migration)
2. Dashboard theme builder
3. URL ingest flow
4. Agent-generated profile draft (Claude API)
5. Entity review screen
6. Fans-facing landing + entity selection
7. Question flow
8. Result page met live collective overlay
9. Share asset generation
10. Response monitoring + anomaly flags
11. Publish/final mode

---

## 17. Claude agent setup

| Agent | Model | Verantwoordelijk voor |
|---|---|---|
| Lead architect / orchestration | Opus 4.6 | Productstructuur, samenhang, finale kwaliteitscontrole |
| Redactioneel format | Opus 4.6 | Journalistieke framing, toon, disclaimers, culturele geloofwaardigheid |
| Content ingest & profile builder | Sonnet 4.6 | URL parsing, metadata extractie, conceptprofielen, ontbrekende velden |
| Taxonomy & metadata | Sonnet 4.6 | Entity types, tags, slugs, veldconsistentie |
| UX copy & interaction | Sonnet 4.6 | Fans-facing copy, CTA's, microcopy, share tekst, feedback states |
| Data method & insight | Opus 4.6 | Confidence labels, afwijkingslogica, methodische guardrails |
| Privacy / governance / risk | Opus 4.6 | Consent, dataseparatie, reputatierisico, publicatievoorwaarden |
| Front-end systems | Sonnet 4.6 | Componentarchitectuur, routing, dashboard states |
| Fast utility | Haiku 4.5 | Formatting, cleanup, batch tags, eenvoudige transformaties |

---

## 18. Succescriteria

- ≥ 500 geldige responses per thema binnen 2 weken
- Data bruikbaar in ≥ 1 aflevering of artikel per thema
- Redactie ervaart dashboard als hulpmiddel, niet als last
- Resultaatpagina laadt snel genoeg voor mobiel

---

## 19. One-line summary

De Machine Pulse is a two-layer editorial product: a fans-facing music culture experience that captures structured opinion, and a redactioneel dashboard that turns that input into journalistically usable insight.
