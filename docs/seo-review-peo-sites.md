# SEO-review: gotopeo.com, peomedical.com, peodetection.com, peophotonics.com

**Datum:** 8 mei 2026
**Scope:** SEO-review van vier domeinen die voortkomen uit de splitsing van gotopeo.com (~2022) in drie vertical-sites voor de business lines Medical, Detection en Photonics.
**Bron:** Publieke SERP-data (Google-index). De sites zelf konden niet rechtstreeks worden gecrawld vanuit de review-omgeving (alle vier gaven HTTP 403 bij directe fetch). Voor harde technische cijfers (Core Web Vitals, exacte indexatie, backlink-profiel) is aanvullend Search Console- + Screaming Frog/Ahrefs-onderzoek nodig.

---

## TL;DR

De duplicatie-aanpak van drie jaar geleden is **niet afgemaakt**. Gotopeo.com bestaat nog steeds parallel met de drie vertical-sites en concurreert in Google met zijn eigen "kinderen". Dit kost ranking, autoriteit en crawl-budget. Daarnaast lekt er minimaal één staging-omgeving en circuleert er zelfs een **vierde domein** (`peo-radiation-technology.com`) met dezelfde content. Dit moet eerst opgeruimd worden voordat losse on-page-optimalisaties zinvol zijn.

---

## 1. Grootste pijn: kannibalisatie tussen de domeinen

Drie jaar na de splitsing staat dezelfde content nog op meerdere domeinen geïndexeerd:

| Onderwerp | URL 1 | URL 2 (en soms 3) |
|---|---|---|
| Bedrijfsverhaal "PEO Medical sinds 2003 / radiotherapy / imaging" | `gotopeo.com/medical/` | `peomedical.com/` |
| SunCHECK-platform | `peomedical.com/medical/research-laboratories/radiotherapy-suncheck-patient-treatment-dose-management/` | `peomedical.com/radiotherapy/qa-measurement-systems/suncheck-platform/` én `peo-radiation-technology.com/en/medical/radiotherapy-suncheck-...` |
| Qfix Alta-nieuws / Intrabeam-nieuws | `gotopeo.com/medical/news/qfix-introduces-new-alta-...` | (zelfde verhaal op `peomedical.com/news`) |
| Detection-categoriepagina | `gotopeo.com/detection/` en `gotopeo.com/peodetection/` | `peodetection.com/` |
| Photonics-categoriepagina | `gotopeo.com/photonics/products/` | `peophotonics.com/products/` |

**Gevolgen:**

- Backlinks zijn verspreid over 4+ domeinen — geen enkel domein bouwt voldoende autoriteit op.
- Google moet kiezen welk duplicaat hij toont en kiest zelden de variant die jij wil.
- Voor branded zoekopdrachten ("PEO …") levert het een rommelig SERP-resultaat op.
- Het 4e domein `peo-radiation-technology.com` zat niet in de oorspronkelijke briefing — onbekende duplicaten zijn een rode vlag.

---

## 2. Staging-/dev-omgeving lekt naar Google

`gotopeoV15.odoo.com` (Odoo v15-staging) wordt door Google geïndexeerd voor de query `"PEO" "since 2003"`. Dat domein hoort hard op `noindex` of achter HTTP-auth.

**Actie:**

- `Disallow: /` in `robots.txt` op staging.
- `<meta name="robots" content="noindex">` per pagina.
- URL Removal in Search Console aanvragen.
- Bij voorkeur de hele staging achter HTTP Basic Auth zetten zodat het probleem niet terugkomt.

---

## 3. URL-hygiëne per vertical-site

Ook *binnen* de aparte domeinen staan dubbele URL-structuren:

### peomedical.com

- `/medical/...` — legacy uit de duplicatie; segment is overbodig op een domein dat al "peomedical" heet.
- `/radiotherapy/qa-measurement-systems/suncheck-platform/` — schoon pad.
- `/products/diagnostic-imaging/` vs `/diagnostic-imaging/`.
- `/products/radiotherapy/gafchromic-film-qa/...` vs `/radiotherapy/...`.

### peophotonics.com

- `/products/light-measurement-solutions/photometers/`
- `/light-measurement-solutions/photometers/photometers/` ← bijna zeker dubbel
- `/products/advanced-radiation-and-optical-sensing-solutions/`
- `/advanced-radiation-and-optical-sensing-solutions/silicone-photodiodes/...`
- **Spelfout in pad:** `silicone` (badmat-materiaal) i.p.v. `silicon` (silicium). Killer voor het keyword "silicon photodiodes".

**Actie:** kies één canonieke URL-structuur per site, 301 alle alternatieven, zet correcte `<link rel="canonical">` op elke pagina.

---

## 4. Per site: positionering & on-page

### gotopeo.com — "Access to global innovations"

- Title is generiek en mist keywords. Niemand zoekt op "global innovations".
- Bevat nog volledige product-trees voor medical / detection / photonics → moet vereenvoudigd worden tot een corporate landing of helemaal verdwijnen.
- **Aanbeveling:** maak gotopeo.com een dunne corporate-/HR-/contact-hub (Working at, Contact, About, News-overzicht met links naar de vertical-sites) en 301 alle product-/categoriepagina's naar de juiste vertical.

### peomedical.com — "Innovative medical technology"

- Goede tone-of-voice match voor zorgmarkt, maar de title mist het keyword waar je op wil ranken (bijv. "QA radiotherapie & medische beeldvorming – PEO Medical").
- Sterke USP ("100+ ziekenhuizen in BeNeLux") staat alleen in body-copy — werk dat in de H1/meta in.
- Inconsistente URL-paden (zie boven) verspreiden link-equity.

### peodetection.com — "Making the invisible visible"

- Sterke claim, maar te poëtisch voor B2B-defence/security buyer-intent. "Trace detectors", "radiation monitoring", "X-ray inspection systems" zijn de zoekwoorden — die staan niet in title/H1.
- Doelgroep (defence, customs, nuclear security) zoekt zeer specifiek; baat bij eigen landingspagina's per use-case (CBRNe / Customs / EOD / Nuclear power plants) i.p.v. enkel productcategorieën.

### peophotonics.com — "The next level of precision"

- Mooie tagline maar te abstract; "industriële sensoren / photodiodes / position sensitive detectors" hebben veel hoger zoekvolume.
- NL-versie bestaat (`/nl/`) — controleer of `hreflang="en"` ↔ `hreflang="nl"` correct zijn ingesteld + `x-default`.
- De `silicone` → `silicon` spelfout (zie §3).
- Doelgroep is engineers; technische/specsheet-achtige tone-of-voice is hier juist goed.

---

## 5. Strategische keuze die nu nodig is

Drie reële paden. Eén kiezen, dan committeren:

| Optie | Wat | Voor | Tegen |
|---|---|---|---|
| **A. Hub-and-spoke (aanbevolen)** | gotopeo.com = corporate/HR/news-hub. Alle product-content alleen op de drie vertical-domeinen. | Behoudt de drie verschillende look & feel + tone of voice die in 2022 gewenst was. Concentreert link-equity per vertical. | Eenmalig redirect-project (~paar honderd 301's). |
| **B. Consolideer terug naar 1 domein** | Alles terug onder gotopeo.com (of liever: peo.com / peo.eu) met subdirectories. | Sterkste autoriteit. Eén SEO-traject. | Verlies van de aparte branding; tegenovergesteld van wat in 2022 gekozen is. |
| **C. Status quo** | Alles laten bestaan. | Geen werk. | Sites blijven met zichzelf concurreren. Geen reële optie. |

**Aanbevolen: optie A** — respecteert de oorspronkelijke strategische keuze maar maakt 'm af.

---

## 6. Quick wins (direct uitvoerbaar, los van de strategische keuze)

1. **Staging blokkeren:** `noindex` + robots-disallow op `gotopeov15.odoo.com` en alle vergelijkbare hosts.
2. **Audit het 4e domein** `peo-radiation-technology.com`: wat is het, en kies — 301 of behouden als hoofdsite.
3. **Canonicals fixen:** elke pagina op peomedical/peodetection/peophotonics moet een `<link rel="canonical">` naar zichzelf hebben (zonder query strings, zonder legacy `/medical/`-pad).
4. **301 dubbele URL's binnen elk domein** (bijv. `/medical/research-laboratories/...` → `/radiotherapy/...`).
5. **Spelfout-redirect:** `silicone-photodiodes` → `silicon-photodiodes` (incl. interne links, menu's, sitemap).
6. **Title tags + meta descriptions** rewriten met keywords + USP per pagina, niet met merkslogan.
7. **Onderlinge linking** tussen de drie vertical-sites: alleen via de gotopeo-hub, niet kris-kras (dat verdunt thematische autoriteit). Gebruik `rel="noopener"`, niet `nofollow`.
8. **Hreflang** op peophotonics.com (en op de andere sites zodra er NL-versies komen).
9. **XML-sitemaps schoon trekken** per domein, en per Search Console-property indienen (4 properties: gotopeo, peomedical, peodetection, peophotonics + eventueel domain-property).
10. **Schema.org** `Organization` met juiste `sameAs`-links naar de andere domeinen + LinkedIn op elk van de vier sites — helpt Google snappen dat het één concern is.

---

## 7. Wat nog nodig is voordat de migratie kan starten

In dit review kon geen rechtstreekse crawl worden uitgevoerd. Voor de migratie is het volgende nodig:

- Aantal geïndexeerde URL's per domein (Search Console — verwacht: gotopeo.com heeft er nog veel te veel).
- Top-20 pagina's per domein op organisch verkeer.
- Backlink-profiel per domein (Ahrefs/Majestic) — bepaalt welke URL's *moeten* worden behouden via 301.
- Core Web Vitals per template.
- Eventuele `hreflang`-fouten.

Met die data kan een prioriteitenlijst voor de 301-mapping worden gebouwd die geen verkeer verliest.

---

## 8. Content-strategie

Aanvullend advies bij de SEO-review. Dit is bewust strategisch en niet exhaustief — verfijn met data uit GA4/HubSpot/LinkedIn.

### 8.1 Eén funnel-model, drie verschillende invullingen

De drie vertical-sites hebben drie compleet verschillende buyer journeys, dus content moet je ook splitsen — niet alleen tone of voice.

| Funnel-fase | Medical | Detection | Photonics |
|---|---|---|---|
| **TOFU** (awareness) | Klinische trends, regulatory updates (CE/MDR/IEC), congresreports (ESTRO, RSNA) | Compliance-trends (CBRNe, IAEA-richtlijnen), threat-landscape briefings | Engineering-blogs: "How to choose a photodiode", meetfundamentals, app-notes |
| **MOFU** (consideratie) | Vergelijkingen QA-platforms, ROI-calculators, ziekenhuis-cases, on-demand webinars met klinisch fysici | Use-case landingspagina's per vertical (Customs / EOD / Nuclear / Defence), proof-of-concept video's | Spec-comparison-tabellen, integratiegidsen, CAD-files & datasheet-downloads, demo-loaners |
| **BOFU** (beslissing) | Configurator/quote-formulier per modaliteit, ziekenhuis-referenties, training-/SLA-pakketten | Tender-ondersteuning, NDA-gated specs, security-clearance-info | Quick-quote per onderdeelnummer, trial units, customer-engineering support |

Vandaag staat ~80% van de content op alle drie de sites op MOFU/product-categorieniveau. TOFU en BOFU zijn vrijwel afwezig — daar zit het organische verkeer dat nu wordt gemist.

### 8.2 Pillar-cluster aanpak per site

Per vertical-domein 5-10 pillars (~3000 woorden, hoge waarde) met elk 8-15 supporting articles.

**peomedical.com**
- Pillar: *Patient-specific QA in radiotherapy* → cluster: SunCHECK vs Mobius vs RadCalc, in-vivo dosimetrie, machine QA workflows, casus AVL/Erasmus MC, IROC/ESTRO-richtlijnen.
- Pillar: *Radiation safety for hospitals* → cluster: persoonlijke dosimetrie, area monitoring, radiologie afscherming, software voor RPA's.

**peodetection.com**
- Pillar: *Cargo & vehicle X-ray screening* → cluster: portal-systemen, mobile units, dual-energy vs single, doorvoer per uur, beoordeling false-positives.
- Pillar: *Radiation portal monitoring for nuclear power* → cluster: HPGe-detectoren, area monitors, kalibratieservice, traceerbaarheid.

**peophotonics.com**
- Pillar: *Position sensitive detection for sub-micron alignment* → cluster: PSDs, SEEPOS, wafer-stage applicaties (semicon), keuzehulp.
- Pillar: *Light measurement for LED & display QA* → cluster: spectrometers, photometers, integrating spheres, GL Optic ecosysteem, NEN/DIN-conformiteit.

Pillars zijn ook precies de pagina's voor backlink-PR en paid-traffic.

### 8.3 Content-formats die voor B2B/distributie hard werken

- **Casestudies/referenties** (1 per kwartaal per vertical). Medical heeft 100+ ziekenhuizen — daar liggen verhalen. Video + geschreven artikel.
- **Datasheet-hub met gated downloads** = HubSpot-lead met productinteresse. Photonics is bij uitstek geschikt.
- **Webinars / on-demand replays.** Werkt goed in medical en detection. Co-branded met partner-fabrikanten (Sun Nuclear, GL Optic, CEIA …) = audience-share zonder eigen mediabudget.
- **Tools/calculators** (X-ray rental ROI, PSD distance-to-resolution selector). Genereert backlinks en sessietijd.
- **Glossary / kennisbank** per site. Pakt veel longtail-searches.

### 8.4 Vertaling / lokalisatie

PEO bedient BeNeLux + EU. Photonics heeft `/nl/`. Aanbeveling: **EN als hoofdsysteem, NL voor NL/BE, FR voor BE-Wallonie**, met goede `hreflang` + `x-default`. Detection en Medical hebben nu geen NL — terwijl 100+ NL/BE-ziekenhuizen klant zijn. Daar laat je organische zichtbaarheid liggen.

### 8.5 Owned audience opbouwen

- **Eén nieuwsbrief per vertical** (niet één voor alles). Maandelijks: productnieuws + 1 thought-leadership artikel.
- **LinkedIn:** PEO heeft één gedeelde company page voor alle business lines. Overweeg **showcase pages** per vertical onder de hoofdpagina — scherpere targeting, betere volger-segmentatie.

---

## 9. Paid Media-strategie

### 9.1 Kanaalkeuze per vertical

| Kanaal | Medical | Detection | Photonics |
|---|---|---|---|
| **Google Search** | ★★★ kerngedreven door specifieke productnamen + use-cases | ★★ veel zoekvolume rond compliance-termen | ★★★ engineers zoeken op part numbers / specs |
| **Google Display + Performance Max** | ★ contextueel op medische publicaties | ★ alleen retargeting | ★★ retargeting + tech-publishers |
| **LinkedIn Ads** | ★★★ targetbaar op job titles (medical physicist, radiation oncologist) | ★★★ defence/customs/security-titels (moeilijker bereikbaar) | ★★ R&D engineers, principal engineer in semicon/aerospace |
| **YouTube** | ★★ uitleg-/casus-video's | ★ beperkt | ★★ pre-roll voor electronics/photonics-content |
| **Industry trade media** | ★★ AuntMinnie, Medical Physics Web, RadiologyToday | ★★★ Defense News, Jane's, IAEA-publicaties | ★★ Photonics.com, Laser Focus World, Optics & Photonics News |
| **Trade shows & sponsoring** | ★★★ ESTRO, RSNA, ECR | ★★★ DSEI, Milipol, World Customs Org | ★★ SPIE Photonics West, Laser World of Photonics |

### 9.2 Concrete campagne-architectuur

Drie aparte ad-accounts (of in elk geval drie aparte sub-accounts/labels) — niet één PEO-account dat alles vermengt.

**Per vertical 4 lagen:**

1. **Brand defence search** (always-on, klein budget). Bid op "PEO Medical", "PEO Detection", "PEO Photonics", "gotopeo", productpartner-namen ("SunCHECK distributor BeNeLux"). Voorkom dat concurrenten/resellers boven je staan.
2. **High-intent non-brand search** (60-70% budget). Long-tail B2B-termen ("radiation portal monitor BeNeLux", "silicon photodiode integrated amplifier", "patient QA radiotherapy software"). Stuur naar use-case landingspagina's, niet de homepage. Pure phrase/exact match, geen brede match zonder smart-bidding én ruime negative-list.
3. **LinkedIn ABM** (20-30% budget).
   - Medical: targets `Medical Physicist`, `Radiation Oncologist`, `Radiation Therapist`, NL/BE/DE bij ziekenhuizen >250 fte. Lead-gen-formulier op cases/webinar.
   - Detection: account-based-targeting op specifieke organisaties (Belgische Defensie, NL Douane, COVRA, NRG Petten, …) i.p.v. job-title-targeting.
   - Photonics: `Optical Engineer`, `R&D Engineer Semicon`, `Principal Engineer Photonics` bij ASML/Thermo Fisher/TNO/imec.
   - Format: Document Ads (datasheets) en Conversation Ads voor demo-aanvragen.
4. **Retargeting** (5-10% budget). Bezoekers van pillar-pagina's terughalen met cases/demo. Per vertical apart — geen radiotherapie-ad voor een photonics-bezoeker.

### 9.3 Conversies & meetbaarheid

- **Server-side GA4 + GTM-server** om iOS/ITP-issues te omzeilen.
- **Conversion-events per vertical:** demo-aanvraag, datasheet-download, contact-formulier, telefoon-klik, webinar-aanmelding. Per event een waarde (demo ~€500, datasheet-download ~€20).
- **Cross-domein tracking** tussen gotopeo.com (corporate) en de drie verticals: één GA4-property per vertical, plus één rollup-property.
- **CRM-integratie** (HubSpot/Salesforce). Closed-loop attribution. Voor B2B met lange cycli (medical = 6-18 maanden) is dit het verschil tussen "wat we denken dat werkt" en "wat echt werkt".

### 9.4 Budgetverdeling indicatief (eerste 12 maanden)

- **40-45%** Google Search (verdeeld over 3 verticals naar rato van marktomvang).
- **25-30%** LinkedIn (vooral Medical en Photonics).
- **10%** Retargeting (Display + LinkedIn).
- **10%** Trade-media-sponsoring (per vertical 1 vakblad).
- **5-10%** Experiment-budget (YouTube pre-roll, Reddit voor Photonics-engineers, etc.).

Reserveer minimaal **15% test-budget per kwartaal** — anders fossiliseert de mix.

### 9.5 Eerste 90 dagen — concrete to-do

- **Week 1-2:** tracking schoon (GA4 + GTM + CRM-koppeling), conversie-events definiëren.
- **Week 3-4:** 3 sets van ~15 long-tail keyword-clusters bouwen (1 per vertical). LinkedIn-doelgroepen + matched audiences uploaden.
- **Week 5-8:** 3 pillar-pagina's live (1 per vertical) — zonder die heeft paid weinig zin.
- **Week 9-12:** campagnes live, ~€10k/maand verspreid over de mix, wekelijkse optimalisatie. Eerste "wat werkt"-rapportage na 8 weken.

### 9.6 Volgorde t.o.v. SEO-cleanup

Niet alles sequentieel — drie sporen parallel beleggen zodra de migratie *gepland* is.

**Wachten tot SEO-fundament écht klaar is:**
- Pillar-pagina's bouwen op de nieuwe canonical URL-structuur (anders 301'en).
- Backlink-/PR-campagnes voor pillars (links via 301 = ~5-15% equity-verlies).
- Grote Google Search-campagnes naar landingspagina's die straks veranderen.

**Wel parallel mogelijk:**
- Tracking & meetbaarheid op orde (sterker: nodig om migratie-impact te meten).
- LinkedIn ABM-campagnes (verwijzen meestal naar één gated landingspagina, los van site-structuur).
- Brand-defence search-campagnes (klein, on-brand, geen ranking-risico).
- Content *plannen* en de eerste pillar al schrijven mits op de definitieve URL.

**Praktisch:** SEO-fixes + tracking + één pillar per vertical = ~8 weken parallel. Daarna zwaardere paid-campagnes opentrekken. Helemaal wachten tot alle 301's zijn afgerond is overdreven — maar paid op een nog vervuilde site is zonde van het geld.

---

## Bronnen

Publieke SERP-data die voor deze review is gebruikt:

- [PEO – Access to global innovations](https://gotopeo.com/)
- [PEO Medical – Innovative medical technology](https://peomedical.com/)
- [PEO Detection – Making the invisible visible](https://peodetection.com/)
- [PEO Photonics – The next level of precision](https://peophotonics.com/)
- [Staging-leak: gotopeoV15.odoo.com](https://gotopeov15.odoo.com/)
- [Vierde duplicaatdomein: peo-radiation-technology.com (SunCHECK)](https://www.peo-radiation-technology.com/en/medical/radiotherapy-suncheck-patient-treatment-dose-management/)
- [Duplicaat SunCHECK op peomedical.com (legacy /medical/-pad)](https://peomedical.com/medical/research-laboratories/radiotherapy-suncheck-patient-treatment-dose-management/)
- [Duplicaat SunCHECK op peomedical.com (schoon pad)](https://peomedical.com/radiotherapy/qa-measurement-systems/suncheck-platform/)
- [gotopeo.com/medical/ nog actief](https://gotopeo.com/medical/)
- [peophotonics.com photometers — schoon pad](https://peophotonics.com/products/light-measurement-solutions/photometers/)
- [peophotonics.com photometers — duplicaat pad](https://peophotonics.com/light-measurement-solutions/photometers/photometers/)
- [Spelfout silicone-photodiodes](https://peophotonics.com/advanced-radiation-and-optical-sensing-solutions/silicone-photodiodes/photodiodes-with-integrated-amplifiers/)
