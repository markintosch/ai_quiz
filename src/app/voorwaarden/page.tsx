export const metadata = {
  title: 'Algemene Voorwaarden — markdekock.com',
  description: 'Algemene voorwaarden voor digitale producten van markdekock.com',
}

const INK    = '#0F172A'
const ACCENT = '#1D4ED8'
const BODY   = '#374151'
const MUTED  = '#94A3B8'
const BORDER = '#E2E8F0'
const ff     = "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif"

export default function VoorwaardenPage() {
  const h2Style: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 700,
    color: INK,
    margin: '40px 0 12px',
    fontFamily: ff,
  }

  const pStyle: React.CSSProperties = {
    fontSize: '15px',
    color: BODY,
    lineHeight: 1.75,
    margin: '0 0 14px',
    fontFamily: ff,
  }

  const liStyle: React.CSSProperties = {
    fontSize: '15px',
    color: BODY,
    lineHeight: 1.75,
    marginBottom: '6px',
    fontFamily: ff,
  }

  return (
    <main style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Nav — match mentor/shop nav style */}
      <nav
        style={{
          background: INK,
          padding: '0 clamp(24px, 5vw, 80px)',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontFamily: ff,
        }}
      >
        {/* Left: brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '15px' }}>Mark de Kock</span>
          <span style={{ color: MUTED, fontSize: '13px' }}>/</span>
          <span style={{ color: MUTED, fontSize: '13px' }}>Voorwaarden</span>
        </div>

        {/* Right: back link */}
        <a
          href="https://www.markdekock.com"
          style={{ color: MUTED, textDecoration: 'none', fontSize: '13px' }}
        >
          ← markdekock.com
        </a>
      </nav>

      {/* Header */}
      <div style={{ background: INK, padding: 'clamp(40px, 6vw, 72px) clamp(24px, 6vw, 80px)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 12px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: MUTED, fontFamily: ff }}>
            MARKDEKOCK.COM
          </p>
          <h1 style={{ margin: 0, fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: '#ffffff', fontFamily: ff, lineHeight: 1.15 }}>
            Algemene Voorwaarden
          </h1>
          <p style={{ margin: '16px 0 0', fontSize: '15px', color: MUTED, fontFamily: ff }}>
            Versie 1.0 · Ingangsdatum: 1 april 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: 'clamp(40px, 6vw, 72px) clamp(24px, 6vw, 80px)' }}>

        <h2 style={h2Style}>1. Dienstverlener</h2>
        <p style={pStyle}>
          Deze algemene voorwaarden zijn van toepassing op alle producten en diensten aangeboden via markdekock.com.
        </p>
        <p style={pStyle}>
          <strong>Mark de Kock</strong><br />
          Handelend als zelfstandige (ZZP)<br />
          E-mail: <a href="mailto:mark@brandpwrdmedia.com" style={{ color: ACCENT }}>mark@brandpwrdmedia.com</a><br />
          KvK-nummer: [KvK nummer invullen]<br />
          BTW-nummer: [BTW nummer invullen]
        </p>

        <h2 style={h2Style}>2. Toepasselijkheid</h2>
        <p style={pStyle}>
          Door een product aan te schaffen via markdekock.com ga je akkoord met deze algemene voorwaarden.
          De voorwaarden zijn van toepassing op alle overeenkomsten tussen Mark de Kock en de koper.
        </p>

        <h2 style={h2Style}>3. Aanbod en prijzen</h2>
        <p style={pStyle}>
          Alle prijzen op markdekock.com zijn in euro's en inclusief 21% BTW, tenzij anders aangegeven.
          Aanbiedingen zijn geldig zolang de voorraad strekt of de actieperiode duurt.
        </p>

        <h2 style={h2Style}>4. Betaling</h2>
        <p style={pStyle}>
          Betaling geschiedt vooraf via de beschikbare betaalmethoden (iDEAL, creditcard) via betaalprovider Mollie.
          Na succesvolle betaling ontvang je per e-mail een bevestiging en de leveringsdetails.
        </p>

        <h2 style={h2Style}>5. Levering van digitale producten</h2>
        <p style={pStyle}>
          Digitale producten (webinars, PDF-downloads, videocursussen) worden geleverd via e-mail na ontvangst van de betaling.
          De levertijd is doorgaans binnen 24 uur na betaling, tenzij anders vermeld bij het product.
        </p>
        <p style={pStyle}>
          Voor webinars ontvang je na aankoop de datum, tijd en toegangslink per e-mail.
          Als de webinar op een vastgestelde datum plaatsvindt die niet schikt, neem dan contact op —
          we kijken naar een passende oplossing.
        </p>

        <h2 style={h2Style}>6. Herroepingsrecht</h2>
        <p style={pStyle}>
          Op grond van de Richtlijn Consumentenrechten heb je als consument normaal gesproken het recht om een
          aankoop binnen 14 dagen te herroepen.
        </p>
        <p style={pStyle}>
          <strong>Uitzondering voor digitale producten:</strong> wanneer je bij de aankoop uitdrukkelijk toestemming
          geeft voor onmiddellijke uitvoering van de overeenkomst en afstand doet van je herroepingsrecht, vervalt
          dit recht zodra de levering is begonnen (bijv. bij het beschikbaar stellen van een download of toegangslink).
          Dit wordt bij afrekening expliciet gevraagd.
        </p>
        <p style={pStyle}>
          Voor webinars die nog niet hebben plaatsgevonden, kun je tot 48 uur voor aanvang kosteloos annuleren
          via <a href="mailto:mark@brandpwrdmedia.com" style={{ color: ACCENT }}>mark@brandpwrdmedia.com</a>.
          Na die termijn of na afloop van de webinar is restitutie niet mogelijk.
        </p>

        <h2 style={h2Style}>7. Intellectueel eigendom</h2>
        <p style={pStyle}>
          Alle content die je via markdekock.com aanschaft — inclusief presentaties, opnames en documenten —
          is eigendom van Mark de Kock en beschermd door auteursrecht.
          Het is niet toegestaan materiaal te kopiëren, distribueren of door te verkopen zonder uitdrukkelijke schriftelijke toestemming.
        </p>

        <h2 style={h2Style}>8. Aansprakelijkheid</h2>
        <p style={pStyle}>
          Mark de Kock is niet aansprakelijk voor indirecte schade, gevolgschade of gederfde winst als gevolg van
          het gebruik van of vertrouwen op de aangeboden producten en informatie.
          De maximale aansprakelijkheid is beperkt tot het door jou betaalde bedrag voor het betreffende product.
        </p>

        <h2 style={h2Style}>9. Privacy</h2>
        <p style={pStyle}>
          Persoonsgegevens die bij een aankoop worden verstrekt (naam, e-mailadres) worden uitsluitend gebruikt
          voor het verwerken van de bestelling en het verzenden van de bestelde producten.
          Gegevens worden nooit verkocht aan derden. Zie ons{' '}
          <a href="/privacy" style={{ color: ACCENT }}>privacybeleid</a> voor meer informatie.
        </p>

        <h2 style={h2Style}>10. Klachten</h2>
        <p style={pStyle}>
          Heb je een klacht of vraag over een aankoop? Neem dan contact op via{' '}
          <a href="mailto:mark@brandpwrdmedia.com" style={{ color: ACCENT }}>mark@brandpwrdmedia.com</a>.
          We streven ernaar klachten binnen 5 werkdagen te beantwoorden.
        </p>

        <h2 style={h2Style}>11. Toepasselijk recht</h2>
        <p style={pStyle}>
          Op deze algemene voorwaarden is Nederlands recht van toepassing.
          Geschillen worden bij voorkeur in onderling overleg opgelost.
          Indien nodig is de bevoegde rechter in Nederland van toepassing.
        </p>

        <h2 style={h2Style}>12. Wijzigingen</h2>
        <p style={pStyle}>
          Mark de Kock behoudt zich het recht voor deze algemene voorwaarden te wijzigen.
          De meest actuele versie is altijd beschikbaar op markdekock.com/voorwaarden.
          Voor lopende overeenkomsten gelden de voorwaarden die golden op het moment van aankoop.
        </p>

        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: `1px solid ${BORDER}` }}>
          <p style={{ ...pStyle, fontSize: '13px', color: MUTED }}>
            Vragen over deze voorwaarden?{' '}
            <a href="mailto:mark@brandpwrdmedia.com" style={{ color: ACCENT }}>mark@brandpwrdmedia.com</a>
          </p>
        </div>
      </div>
    </main>
  )
}
