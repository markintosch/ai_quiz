-- ─────────────────────────────────────────────────────────────────────────────
-- migration_atelier_v07.sql
-- Atelier v0.7 — starter ICPs + business_type dimension.
-- Allows ICPs without a session (starter / seed library) and tags every ICP
-- as B2B / B2C / B2B2C / B2G.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. session_id mag NULL zijn voor starter ICPs
ALTER TABLE atelier_icp_profiles
  ALTER COLUMN session_id DROP NOT NULL;

-- 2. is_starter flag + business_type
ALTER TABLE atelier_icp_profiles
  ADD COLUMN IF NOT EXISTS is_starter BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS archetype_label TEXT,    -- bv. "NL B2B SaaS scale-up" — alleen op starters
  ADD COLUMN IF NOT EXISTS business_type TEXT
    CHECK (business_type IN ('b2b','b2c','b2b2c','b2g'));

CREATE INDEX IF NOT EXISTS idx_atelier_icp_starter ON atelier_icp_profiles (is_starter);
CREATE INDEX IF NOT EXISTS idx_atelier_icp_business_type ON atelier_icp_profiles (business_type);

-- 3. Seed 12 starter ICPs (idempotent — rerun-safe via ON CONFLICT op archetype_label)
-- Eerst archetype_label uniek maken voor starters:
CREATE UNIQUE INDEX IF NOT EXISTS uq_atelier_icp_starter_archetype
  ON atelier_icp_profiles (archetype_label) WHERE is_starter = TRUE;

INSERT INTO atelier_icp_profiles
  (is_starter, archetype_label, business_type, industry, role, company_size, triggers, jobs, pains, buying_committee, rationale)
VALUES
  -- ── B2B (4) ─────────────────────────────────────────────────────────────
  (TRUE, 'NL B2B SaaS scale-up', 'b2b',
    'B2B SaaS / software',
    'CMO of VP Marketing',
    '50–250 medewerkers',
    '["Series A/B fundingronde","Productlaunch","Categorie verzadigt — concurrenten klinken hetzelfde","Nieuw segment betreden (US, EU expansion)"]'::jsonb,
    '["Pijplijn vergroten zonder dat de boodschap als ruis voelt","Differentiatie ten opzichte van directe concurrenten","Marketing/sales op één verhaal krijgen"]'::jsonb,
    '["Onderscheid is moeilijk — alle SaaS klinkt hetzelfde","CAC stijgt sneller dan deal value","Demand-gen team levert leads die sales niet wil"]'::jsonb,
    '[{"role":"CMO","influence":"decision_maker"},{"role":"CEO","influence":"decision_maker","motivation":"groei en exit-waardering"},{"role":"VP Sales","influence":"champion"},{"role":"Head of Demand Gen","influence":"end_user"},{"role":"CFO","influence":"gatekeeper","motivation":"budget signoff"}]'::jsonb,
    'Klassiek B2B SaaS-archetype. Snel-groeiende NL/EU scale-up die uit de "early adopter"-fase moet komen en een merk-laag nodig heeft op een product dat tot nu toe op features-niveau verkocht is.'
  ),
  (TRUE, 'Tech-enabled service business', 'b2b',
    'Fintech · Healthtech · Pro-services',
    'Head of Marketing of Founder',
    '30–200 medewerkers',
    '["Repositioning na product-pivot","Marktentree in nieuwe categorie","Concurrent met meer marketing-spend kapt segment weg","Consolidatie in markt"]'::jsonb,
    '["Complex aanbod simpel uitleggen aan niet-technische kopers","Premium pricing rechtvaardigen tegenover commodity-aanbieders","Vertrouwen winnen in een gereguleerde context"]'::jsonb,
    '["Vastzitten in features-jargon","Vergeleken worden met goedkopere generieke alternatieven","Kennis van de organisatie zit in de techniek, niet in het verhaal"]'::jsonb,
    '[{"role":"Head of Marketing","influence":"decision_maker"},{"role":"Founder/CEO","influence":"decision_maker"},{"role":"Head of Product","influence":"champion"},{"role":"Compliance Officer","influence":"gatekeeper","motivation":"regulering"}]'::jsonb,
    'Tussenvorm tussen pure SaaS en service-business. Vaak gereguleerd (financieel, gezondheid, juridisch). Brief gaat doorgaans over hoe een technisch superieur aanbod zich onderscheidt zonder in jargon te verzanden.'
  ),
  (TRUE, 'Creative/strategy pod (peer)', 'b2b',
    'Bureau · Studio · Boutique consultancy',
    'Strategy of Creative Director / Founder',
    '5–30 medewerkers',
    '["Big new-business pitch","Talent-werving in krappe arbeidsmarkt","Verlies van een sleutel-klant","Pivot van execution naar strategie"]'::jsonb,
    '["Onderscheid van andere bureaus die hetzelfde claimen","Eigen positionering scherp houden terwijl je voor klanten werkt","Talent aantrekken dat keuze heeft"]'::jsonb,
    '["Ziet er uit als elk ander bureau","Eigen verhaal verwatert door dat we voor anderen werken","Cobbler-children-no-shoes — eigen merk laag op prioriteitenlijst"]'::jsonb,
    '[{"role":"Founder / Managing Partner","influence":"decision_maker"},{"role":"Strategy Director","influence":"decision_maker"},{"role":"Creative Director","influence":"champion"},{"role":"Head of New Business","influence":"end_user"}]'::jsonb,
    'Bureau dat zijn eigen positionering aanpakt. Gevoelige opdrachtgever — heeft mening over alles, vergelijkt continu met eigen werk voor klanten. Belangrijkste: niet patroniserend.'
  ),
  (TRUE, 'Professional services repositioning', 'b2b',
    'Legal · Accountancy · Strategy consulting',
    'Marketing Director of Managing Partner',
    '100–1000 medewerkers',
    '["Generatiewissel in partnerschap","Concurrent positioneert agressiever (e.g. Big-4 vs niche)","Talent-uitdaging: jonge professionals willen meer dan corporate","M&A pressure"]'::jsonb,
    '["Modern relevant overkomen zonder de gravitas te verliezen","Nieuwe generatie partners + talent aantrekken","Onderscheidende positie tegenover Big-4 of grote concurrenten"]'::jsonb,
    '["Conservatief publiek (klanten + partners) verzet zich tegen verandering","Wat onderscheidt ons concreet van directe concurrenten?","Branding voelt alsof het over de partners gaat, niet over de klanten"]'::jsonb,
    '[{"role":"Managing Partner","influence":"decision_maker","motivation":"reputatie + talent"},{"role":"Marketing Director","influence":"champion"},{"role":"Senior Partner Group","influence":"gatekeeper","motivation":"behouden van wat werkt"},{"role":"HR Director","influence":"evaluator","motivation":"talent attraction"}]'::jsonb,
    'Klassiek partnerschap dat moet vernieuwen zonder zijn waardigheid te verliezen. Politiek geladen: elke beslissing moet door de partnergroep heen. Brief gaat vaak over toon en houding, niet alleen over visuele identiteit.'
  ),
  -- ── B2C (5) ─────────────────────────────────────────────────────────────
  (TRUE, 'FMCG / consumer brand', 'b2c',
    'FMCG · Retail · Food & beverage',
    'Brand Manager',
    '200–1000 medewerkers',
    '["Seizoenscampagne","Productlaunch / line extension","Marktaandeel-erosie tegenover private label","Categorie-disruptie door D2C-newcomer"]'::jsonb,
    '["Relevantie bij Gen Z / jongere doelgroep behouden","Onderscheidende campagne-uitvoering die in retail werkt","Trade marketing en consumer marketing op één lijn"]'::jsonb,
    '["Voelt als een generiek merk in een drukke categorie","Trade promotie eet de marketingbudget op","Brand love bestaat alleen op papier — niet bij consument"]'::jsonb,
    '[{"role":"Brand Manager","influence":"end_user"},{"role":"Marketing Director","influence":"decision_maker"},{"role":"Trade Marketing","influence":"evaluator","motivation":"retail-acceptatie"},{"role":"CMO","influence":"decision_maker"},{"role":"Sales Director","influence":"gatekeeper","motivation":"shopper-impact"}]'::jsonb,
    'Klassieke FMCG-omgeving. Marketing speelt twee schakels: consument en retail. Briefs landen vaak in de spanning tussen brand-campagne en short-term sales-doelen.'
  ),
  (TRUE, 'Sustainability-challenger D2C', 'b2c',
    'D2C · Sustainable goods · Wellness',
    'Founder / Head of Brand',
    '11–50 medewerkers',
    '["Opschalen voorbij early adopters","Series A/B funding","Concurrent met grote marketingspend pakt category-narratief over","Mainstream retail-distributie wordt mogelijk"]'::jsonb,
    '["Behoud authenticiteit terwijl het merk groeit","Bereiken van mainstream consument zonder de community te verliezen","Differentiatie tegenover greenwashing-incumbents"]'::jsonb,
    '["Risico op preachy / belerend overkomen","Verschilt nauwelijks meer van de duurzame variant van grote merken","Ondoorgrondelijk: \"hoe groen ben je écht?\""]'::jsonb,
    '[{"role":"Founder","influence":"decision_maker","motivation":"behoud van missie"},{"role":"Head of Brand","influence":"decision_maker"},{"role":"Investors","influence":"gatekeeper","motivation":"groei en exit"},{"role":"Head of Community","influence":"champion","motivation":"bestaande klantbasis"}]'::jsonb,
    'Challenger-merken in de duurzaamheid-categorie staan op een breekpunt: schalen zonder de stem te verliezen die ze opvallend maakte. Brief gaat doorgaans over rebranding-met-respect-voor-origin.'
  ),
  (TRUE, 'Cultural institution', 'b2c',
    'Cultuur · Museum · Theater · Festival',
    'Marketing Director of Director',
    '50–500 medewerkers',
    '["Vergrijzing van publiek","Subsidie- of fondsenwerving-cyclus","Nieuw seizoen / programma","Concurrentie van streaming en thuiscultuur"]'::jsonb,
    '["Relevantie bij jongere generaties (18–35)","Bezoek-conversie verhogen zonder het programma te verarmen","Mandaat communiceren naar bestuurder/subsidiegever"]'::jsonb,
    '["Out-of-touch perceptie","Communicatie spreekt al-publiek aan, mist specifieke doelgroep","Marketing-budget structureel laag tegenover commercieel-publieke aanbieders"]'::jsonb,
    '[{"role":"Director","influence":"decision_maker","motivation":"artistiek mandaat"},{"role":"Marketing Director","influence":"decision_maker"},{"role":"Programmaleiding","influence":"gatekeeper","motivation":"behoud van inhoudelijk niveau"},{"role":"Bestuur / RvT","influence":"gatekeeper","motivation":"verantwoording naar fonds/subsidie"}]'::jsonb,
    'Cultuur balanceert tussen artistieke missie en publiek-bereik. Gevoeligheden zijn anders dan commerciële brands: programmering is heilig, marketing mag het niet bagatelliseren. Brief gaat vaak over toon en distributie, niet over fundamentele propositie.'
  ),
  (TRUE, 'Health / wellness consumer', 'b2c',
    'Healthcare · Pharma · OTC · Wellness',
    'Brand Lead of Marketing Director',
    '500+ medewerkers',
    '["Productlaunch (Rx of OTC)","Patient-advocacy moment / awareness-week","Regulatory venster (label-update, indication)","Concurrent in adjacent categorie betreedt segment"]'::jsonb,
    '["Menselijke stem op gereguleerde communicatie","Patient-language ipv klinische taal","Onderscheidende campagne in een categorie waar iedereen serieus klinkt"]'::jsonb,
    '["Regulering plat-walst de boodschap","Compliance-team is langzaam","Eindgebruiker (patiënt) krijgt zelden het woord — alleen de arts"]'::jsonb,
    '[{"role":"Brand Lead","influence":"decision_maker"},{"role":"Medical Affairs","influence":"gatekeeper","motivation":"regulering en risico"},{"role":"Patient Advocacy","influence":"champion"},{"role":"Marketing Director","influence":"decision_maker"},{"role":"Legal/Compliance","influence":"gatekeeper"}]'::jsonb,
    'Health/pharma-omgeving is uniek: regulering bepaalt veel van de speelruimte. Sterkste werk komt uit de patiëntenkant — niet uit klinische data. Brief gaat doorgaans over hoe je menselijk klinkt binnen wat juridisch mag.'
  ),
  (TRUE, 'Retail / lifestyle brand', 'b2c',
    'Retail · Fashion · Home · Lifestyle',
    'Marketing Manager / Brand Director',
    '100–500 medewerkers',
    '["Seizoenslaunch / collectie-drop","E-commerce conversie-druk","Concurrent met sterker beeld pakt aandeel","DTC-pivot of fysiek-naar-digitaal transitie"]'::jsonb,
    '["Visuele identiteit die zowel in winkel als online werkt","Consistente brand-stem over alle touchpoints","Onderscheid in prijssegment zonder \"premium\" te claimen zonder dekking"]'::jsonb,
    '["Beeld lijkt op concurrenten in zelfde prijssegment","Influencer-content is on-trend maar niet on-brand","Conversie-druk verstikt brand-bouwen — alles wordt promotioneel"]'::jsonb,
    '[{"role":"Brand Director / Marketing Manager","influence":"decision_maker"},{"role":"Creative Director","influence":"champion","motivation":"merkesthetiek"},{"role":"E-commerce Lead","influence":"gatekeeper","motivation":"conversie-impact"},{"role":"Buying Director","influence":"evaluator","motivation":"productverhaal"}]'::jsonb,
    'Lifestyle / retail leeft van beeld en gevoel. Brief gaat zelden over woorden alleen — bijna altijd over hoe het merk visueel samenkomt over alle aanrakingspunten van etalage tot Instagram.'
  ),
  -- ── B2B2C (1) ───────────────────────────────────────────────────────────
  (TRUE, 'Financial services (legacy)', 'b2b2c',
    'Bank · Verzekering · Vermogensbeheer',
    'Director Communications of Marketing Director',
    '1000+ medewerkers',
    '["Vertrouwens-moment / publieke crisis","Digitale transformatie","Regelgeving-update (DGA, Mifid, etc.)","Generatiewissel in klantbestand"]'::jsonb,
    '["Re-humaniseren van een institutioneel merk","Vertrouwen herstellen of versterken","Onderscheid tegenover andere grote partijen die allemaal hetzelfde claimen"]'::jsonb,
    '["Stijfheid en formele toon","Klinkt als andere banken/verzekeraars","Compliance-cyclus en juridische review trekken alle scherpte uit communicatie"]'::jsonb,
    '[{"role":"Director Communications","influence":"decision_maker"},{"role":"CMO","influence":"decision_maker"},{"role":"Compliance / Legal","influence":"gatekeeper","motivation":"regelgeving"},{"role":"Risk","influence":"gatekeeper"},{"role":"Customer Experience Lead","influence":"champion","motivation":"klantbeleving"}]'::jsonb,
    'Klassieke financial-services context: B2C in propositie maar met B2B-niveau aan stakeholders en compliance. Brief landt vaak op de spanning tussen menselijke stem en juridische vereisten.'
  ),
  -- ── B2G (2) ─────────────────────────────────────────────────────────────
  (TRUE, 'Rijksoverheid campagne', 'b2g',
    'Ministerie · Rijksdienst (RIVM, RDW, CBS, etc.)',
    'Communicatieadviseur / Hoofd Communicatie',
    '1000+ medewerkers',
    '["Politiek mandaat / coalitieakkoord","Gedragsverandering-campagne (klimaat, gezondheid, veiligheid)","Crisis-respons","Wetswijziging die uitleg vereist"]'::jsonb,
    '["Effectieve gedragsverandering bij specifieke doelgroepen","Vertrouwen / draagvlak voor beleid","Toegankelijke uitleg van complexe regels of programmas"]'::jsonb,
    '["\"Uit-de-toren\"-perceptie van burgers","Stijve formele toon die niemand bereikt","Politiek-gevoeligheid maakt scherpte moeilijk","Doelgroep voelt zich aangesproken in plaats van gezien"]'::jsonb,
    '[{"role":"Hoofd Communicatie","influence":"decision_maker"},{"role":"Beleidsdirectie","influence":"decision_maker","motivation":"inhoudelijk mandaat"},{"role":"Politieke leiding (DG/minister)","influence":"gatekeeper","motivation":"politieke risicos"},{"role":"Voorlichting","influence":"end_user"},{"role":"Juridisch","influence":"gatekeeper"}]'::jsonb,
    'Rijksoverheid-campagne met gedragsdoel. Hoogste politieke gevoeligheid, langzame review-cyclus, maar reëel mandaat tot creatief werk. Briefs gaan om effectief én verantwoord — niet alleen opvallend.'
  ),
  (TRUE, 'Lokale overheid / publieke uitvoeringsdienst', 'b2g',
    'Gemeente · Provincie · NS · NPO · ProRail · Waterschap',
    'Director Communicatie / Hoofd Marketing',
    '200–5000 medewerkers',
    '["Bestuurlijke transitie (nieuwe collegeperiode)","Publieke verantwoording / jaarverslag","Audience-aging in publieke dienstverlening","Reputatie-incident of klanttevredenheids-druk"]'::jsonb,
    '["Verbinding met inwoners / reizigers / kijkers","Modernisering zonder publieke kerntaak los te laten","Transparantie tonen op een manier die vertrouwen wekt"]'::jsonb,
    '["Defensieve communicatie","Format-cultuur (folder, jaarverslag, nieuwsbrief) bereikt jongere doelgroep niet","Behoudend bestuur dat verandering remt","Kwaliteit voelt als \"alles voor iedereen\" — niemand voelt zich specifiek gezien"]'::jsonb,
    '[{"role":"Director Communicatie","influence":"decision_maker"},{"role":"Algemeen Directeur / Wethouder","influence":"decision_maker","motivation":"publieke verantwoording"},{"role":"Klantbeleving / Diensten","influence":"champion","motivation":"end-user-impact"},{"role":"Politieke leiding","influence":"gatekeeper"}]'::jsonb,
    'Semi-publieke uitvoeringsorganisaties balanceren tussen merk-werk en publieke taak. Briefs zijn complex: politiek gevoelig, klantgericht, en vaak met legacy-formats die afgebroken moeten worden.'
  )
ON CONFLICT (archetype_label) WHERE is_starter = TRUE DO UPDATE SET
  business_type    = EXCLUDED.business_type,
  industry         = EXCLUDED.industry,
  role             = EXCLUDED.role,
  company_size     = EXCLUDED.company_size,
  triggers         = EXCLUDED.triggers,
  jobs             = EXCLUDED.jobs,
  pains            = EXCLUDED.pains,
  buying_committee = EXCLUDED.buying_committee,
  rationale        = EXCLUDED.rationale;
