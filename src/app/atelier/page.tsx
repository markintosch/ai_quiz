// FILE: src/app/atelier/page.tsx
// Atelier landing — explains the wedge + links to the new-session form.

import Link from 'next/link'

export default function AtelierLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/40 text-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">

        <header className="mb-12 md:mb-16">
          <div className="text-xs font-semibold tracking-widest text-brand-accent uppercase mb-4">
            Atelier · v0.5 framework · privé preview
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-brand-dark mb-6 leading-[1.05]">
            Van brief naar verdedigbare richting — in uren, niet dagen.
          </h1>
          <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl">
            Atelier is een Nederlandstalige werkpartner voor brand- en creatieve teams.
            Het decodeert een brief naar de echte JTBD, brengt de doelgroep in beeld
            via twee aparte sporen (Street Signal + Ground Truth), kiest referenties met
            taste, en levert 2–3 directional routes — klaar voor een werksessie.
          </p>
        </header>

        <section className="grid sm:grid-cols-3 gap-4 text-sm mb-12">
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="text-brand-accent font-bold mb-1">1 · Brief erin</div>
            <p className="text-slate-600">Plak een brief en optioneel wat brand context.</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="text-brand-accent font-bold mb-1">2 · Meervoudige analyse</div>
            <p className="text-slate-600">JTBD, ICP, audience, referenties, tensies, 3 lenzen, live signalen — parallel.</p>
          </div>
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="text-brand-accent font-bold mb-1">3 · One-pager + doorvragen</div>
            <p className="text-slate-600">One-pager met provenance per claim. Daarna chat-Q&amp;A op de hele bundle.</p>
          </div>
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50 border border-amber-200/70 p-8 mb-10">
          <h2 className="text-2xl font-bold text-brand-dark mb-3">Start een nieuwe sessie</h2>
          <p className="text-slate-700 mb-6">
            Plak een brief, klik op start. Eén run duurt ~30–60 seconden en kost meestal € 0,03–0,08 aan model-tokens.
          </p>
          <Link
            href="/atelier/new"
            className="inline-flex items-center gap-2 bg-brand-dark text-white font-semibold px-6 py-3 rounded-full hover:bg-brand-accent transition-colors"
          >
            Start nieuwe brief →
          </Link>
        </section>

        <section className="text-sm text-slate-600 space-y-3">
          <h3 className="font-semibold text-brand-dark">Wat zit er onder de motorkap</h3>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Brief & JTBD</strong> — decodeert tot job-to-be-done, hidden assumptions, missing pieces</li>
            <li><strong>ICP profile</strong> — industry, rol, bedrijfsgrootte, triggers, jobs, pains, buying committee</li>
            <li><strong>Reference & retrieval</strong> — seed-corpus van Nederlandstalige creatieve referenties + Claude-gestuurde keuze met taste-note</li>
            <li><strong>Audience evidence</strong> — twee-spoor signaalmodel (Street Signal vs Ground Truth) — nooit vermengd</li>
            <li><strong>3 lenzen</strong> — brand-archetype, concurrentie/whitespace, cultureel-moment</li>
            <li><strong>Live signalen</strong> — actuele signalen via web-search (met inferred-fallback als de tool niet beschikbaar is)</li>
            <li><strong>Tension & synthesis</strong> — 2–3 directional routes met evidence- en audience-refs</li>
            <li><strong>Output packaging</strong> — markdown one-pager met provenance per claim</li>
            <li><strong>Q&amp;A</strong> — chat over de hele bundle om door te vragen op routes, ICP, signalen</li>
          </ul>
          <p className="pt-3 text-xs text-slate-500">
            Framework draait op Anthropic Claude (Sonnet 4.6 voor synthesis, Haiku 4.5 voor retrieval). Elke call wordt gelogd in <code>atelier_module_runs</code> met latency, cost, model.
          </p>
        </section>

      </div>
    </div>
  )
}
