// FILE: src/app/SannahRemco/page.tsx
// Private landing page met twee briefing-formulieren (Sannah + Remco).
// Live op www.brandpwrdmedia.com/SannahRemco — niet geïndexeerd.

import Link from 'next/link'

export default function SannahRemcoLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/40 text-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">

        {/* ── Header ── */}
        <header className="mb-12 md:mb-16">
          <div className="text-xs font-semibold tracking-widest text-brand-accent uppercase mb-4">
            Brand PWRD Media · privé briefing
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-brand-dark mb-6 leading-[1.05]">
            Welkom Sannah &amp; Remco
          </h1>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl">
            Twee korte briefings — een voor Sannah&rsquo;s portfolio, een voor Remco&rsquo;s online aanwezigheid.
            Samen ongeveer 20–30 minuten. Vul ze in op je eigen tempo, je antwoorden worden direct opgeslagen.
          </p>
        </header>

        {/* ── How it works ── */}
        <section className="mb-12 grid sm:grid-cols-3 gap-4 text-sm">
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="text-brand-accent font-bold mb-1">1 · Kies een formulier</div>
            <p className="text-slate-600">Sannah en Remco vullen elk hun eigen briefing in.</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="text-brand-accent font-bold mb-1">2 · Schrijf vrijuit</div>
            <p className="text-slate-600">Multiple choice waar het kan, open velden waar het moet. URLs en screenshots zijn welkom.</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="text-brand-accent font-bold mb-1">3 · Versturen</div>
            <p className="text-slate-600">Mark krijgt een seintje en plant een vervolg in.</p>
          </div>
        </section>

        {/* ── The two forms ── */}
        <section className="grid md:grid-cols-2 gap-6">

          {/* Sannah */}
          <Link
            href="/SannahRemco/sannah"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50 border border-amber-200/70 p-8 hover:border-brand-accent/60 hover:shadow-xl transition-all"
          >
            <div className="text-xs font-bold tracking-widest text-brand-accent uppercase mb-3">
              Voor Sannah
            </div>
            <h2 className="text-3xl font-bold text-brand-dark mb-3 leading-tight">
              Online Portfolio
            </h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              Aanmelding Breitner Academy + portfolio dat ook daarna bruikbaar blijft. Stylist, fotograaf, beeldend vormgever, docent — wat past bij jou?
            </p>
            <ul className="text-sm text-slate-600 space-y-1.5 mb-8">
              <li>· Doel, deadline en positionering</li>
              <li>· Werk &amp; content (selectie, staat van beeld)</li>
              <li>· Stijl, functionaliteit en praktische zaken</li>
            </ul>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 bg-brand-dark text-white font-semibold px-5 py-2.5 rounded-full text-sm group-hover:bg-brand-accent transition-colors">
                Start briefing
                <span aria-hidden>→</span>
              </span>
              <span className="text-xs text-slate-500">~15 min · 17 vragen</span>
            </div>
          </Link>

          {/* Remco */}
          <Link
            href="/SannahRemco/remco"
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 border border-slate-200 p-8 hover:border-brand-dark/60 hover:shadow-xl transition-all"
          >
            <div className="text-xs font-bold tracking-widest text-brand-dark uppercase mb-3">
              Voor Remco
            </div>
            <h2 className="text-3xl font-bold text-brand-dark mb-3 leading-tight">
              Online Presence
            </h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              Jouw online aanwezigheid versterken — los van de portfolio-site. Acquisitie, thought leadership, persoonlijk merk: waar leg jij het accent?
            </p>
            <ul className="text-sm text-slate-600 space-y-1.5 mb-8">
              <li>· Doel, doelgroep en termijn</li>
              <li>· Content-vormen die bij je passen</li>
              <li>· Website, kanalen en wat je tegenhoudt</li>
            </ul>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 bg-brand-dark text-white font-semibold px-5 py-2.5 rounded-full text-sm group-hover:bg-brand-accent transition-colors">
                Start briefing
                <span aria-hidden>→</span>
              </span>
              <span className="text-xs text-slate-500">~12 min · 14 vragen</span>
            </div>
          </Link>
        </section>

        {/* ── Footer note ── */}
        <footer className="mt-16 pt-8 border-t border-slate-200 text-sm text-slate-500">
          <p>
            Alleen Mark heeft toegang tot de antwoorden. Alles wat je hier invult blijft tussen ons.
            Vragen? Stuur Mark een berichtje of bel even.
          </p>
        </footer>

      </div>
    </div>
  )
}
