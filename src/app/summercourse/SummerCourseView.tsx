import type { SummerCourseContent } from './content'

// Self-contained presentational view. Styling lives in a scoped <style> block
// (all selectors prefixed with .sc-root) so it doesn't leak into the rest of
// the app. Uses native <details> for the accordions — no client JS needed.

export default function SummerCourseView({ c }: { c: SummerCourseContent }) {
  return (
    <div className="sc-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="sc-hero">
        <div className="sc-wrap">
          <span className="sc-eyebrow">{c.hero.eyebrow}</span>
          <h1>{c.hero.title}</h1>
          <p className="sc-lead">{c.hero.subtitle}</p>
          <ul className="sc-bullets">
            {c.hero.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          <div className="sc-cta">
            <a href="#inschrijven" className="sc-btn sc-btn-primary">{c.hero.ctaPrimary}</a>
            <a href="#programma" className="sc-btn sc-btn-ghost">{c.hero.ctaSecondary}</a>
          </div>
          <p className="sc-cred">{c.hero.credibility}</p>
          <p className="sc-note">{c.hero.note}</p>
        </div>
      </header>

      {/* PROBLEM */}
      <section>
        <div className="sc-wrap sc-narrow-block">
          <h2>{c.problem.heading}</h2>
          {c.problem.paragraphs.map((p, i) => (
            <p key={i} className="sc-bigtext">{p}</p>
          ))}
        </div>
      </section>

      {/* OUTCOME — high on the page, the key conversion block */}
      <section className="sc-alt">
        <div className="sc-wrap">
          <h2>{c.outcome.heading}</h2>
          <p className="sc-muted sc-narrow">{c.outcome.intro}</p>
          <ol className="sc-outcome">
            {c.outcome.items.map((it, i) => (
              <li key={i}><span className="sc-num">{i + 1}</span>{it}</li>
            ))}
          </ol>
        </div>
      </section>

      {/* AUDIENCE */}
      <section>
        <div className="sc-wrap">
          <h2>{c.audience.heading}</h2>
          <p className="sc-muted sc-narrow">{c.audience.intro}</p>
          <div className="sc-grid2">
            <div className="sc-card sc-for">
              <h3>{c.audience.forTitle}</h3>
              <ul>{c.audience.forItems.map((it, i) => <li key={i}>{it}</li>)}</ul>
            </div>
            <div className="sc-card sc-not">
              <h3>{c.audience.notTitle}</h3>
              <ul>{c.audience.notItems.map((it, i) => <li key={i}>{it}</li>)}</ul>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAM */}
      <section className="sc-alt" id="programma">
        <div className="sc-wrap">
          <h2>{c.program.heading}</h2>
          <p className="sc-muted">{c.program.intro}</p>

          <div className="sc-phase">
            <span className="sc-phase-label">{c.program.intake.label}</span>
            <div>
              <h3>{c.program.intake.title}</h3>
              <p>{c.program.intake.body}</p>
            </div>
          </div>

          {c.program.days.map((d, i) => (
            <details key={i} className="sc-day" open={i === 0}>
              <summary>
                <div>
                  <span className="sc-daynum">{d.daynum}</span>
                  <h3>{d.title}</h3>
                </div>
                <span className="sc-chev">+</span>
              </summary>
              <div className="sc-day-body">
                <div className="sc-blk">
                  <span className="sc-tag">Ochtend · vast</span>
                  <ul>{d.morning.map((m, j) => <li key={j}>{m}</li>)}</ul>
                </div>
                <div className="sc-blk">
                  <span className="sc-tag">Middag · bouwen aan je eigen case</span>
                  <ul>{d.afternoon.map((m, j) => <li key={j}>{m}</li>)}</ul>
                </div>
              </div>
            </details>
          ))}

          <div className="sc-phase">
            <span className="sc-phase-label">{c.program.after.label}</span>
            <div>
              <h3>{c.program.after.title}</h3>
              <p>{c.program.after.body}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SCHEDULE */}
      <section>
        <div className="sc-wrap">
          <h2>{c.schedule.heading}</h2>
          <p className="sc-muted">{c.schedule.intro}</p>
          <div className="sc-sched">
            {c.schedule.rows.map((r, i) => (
              <div key={i} className="sc-srow">
                <div className="sc-t">{r.time}</div>
                <div className="sc-d">{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOSTS */}
      <section className="sc-alt">
        <div className="sc-wrap">
          <h2>{c.hosts.heading}</h2>
          <p className="sc-muted sc-narrow">{c.hosts.intro}</p>
          <div className="sc-grid2">
            {c.hosts.people.map((p, i) => (
              <div key={i} className="sc-card sc-host">
                <div className="sc-avatar">{p.initials}</div>
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="investering">
        <div className="sc-wrap">
          <h2>{c.pricing.heading}</h2>
          <p className="sc-vs">{c.pricing.onlineVsLive}</p>
          <div className="sc-price-wrap">
            <div className="sc-price-card">
              <span className="sc-eb">{c.pricing.ebLabel}</span>
              <div className="sc-amt">
                {c.pricing.ebPrice} <small>excl. btw</small> <span className="sc-old">{c.pricing.regPrice}</span>
              </div>
              <p className="sc-deposit">{c.pricing.depositLine}</p>
              <a href="#inschrijven" className="sc-btn sc-btn-primary">{c.pricing.ctaLabel}</a>
            </div>
            <div className="sc-incl">
              <h3>{c.pricing.inclTitle}</h3>
              <ul>{c.pricing.incl.map((it, i) => <li key={i}>{it}</li>)}</ul>
            </div>
          </div>
          <p className="sc-scarcity">{c.pricing.scarcity}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="sc-alt">
        <div className="sc-wrap">
          <h2>{c.faq.heading}</h2>
          <div className="sc-faqs">
            {c.faq.items.map((f, i) => (
              <details key={i} className="sc-faq">
                <summary>{f.q}<span className="sc-pm">+</span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNUP */}
      <section id="inschrijven">
        <div className="sc-wrap sc-signup">
          <h2>{c.signup.heading}</h2>
          <p className="sc-muted">{c.signup.intro}</p>
          <a href={c.signup.ctaHref} className="sc-btn sc-btn-primary">{c.signup.ctaLabel}</a>
        </div>
      </section>

      <footer className="sc-footer">
        <div className="sc-wrap sc-footrow">
          <div>Summer Course Claude AI · Frank Meeuwsen &amp; Mark de Kock</div>
          <div><a href="/privacy">Privacy</a> · <a href="/voorwaarden">Voorwaarden</a></div>
        </div>
      </footer>
    </div>
  )
}

const CSS = `
.sc-root{--sc-ink:#1c2433;--sc-muted:#5a6678;--sc-line:#e7e9ef;--sc-accent:#E8611A;--sc-gold:#F5A820;--sc-teal:#354E5E;--sc-teal-dk:#1E3340;--sc-bg:#fbfaf8;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Helvetica,Arial,sans-serif;color:var(--sc-ink);background:var(--sc-bg);line-height:1.55;-webkit-font-smoothing:antialiased}
.sc-root *{box-sizing:border-box}
.sc-root h1,.sc-root h2,.sc-root h3,.sc-root p,.sc-root ul,.sc-root ol{margin:0}
.sc-wrap{max-width:980px;margin:0 auto;padding:0 24px}
.sc-narrow{max-width:640px}
.sc-narrow-block{max-width:720px}
.sc-eyebrow{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--sc-accent);margin-bottom:16px}
.sc-root h1{font-size:clamp(34px,6vw,56px);line-height:1.06;font-weight:800;letter-spacing:-.02em}
.sc-root h2{font-size:clamp(26px,4vw,38px);font-weight:800;letter-spacing:-.01em;margin-bottom:8px}
.sc-root h3{font-size:20px;font-weight:700}
.sc-lead{font-size:20px;color:var(--sc-muted);margin-top:18px!important;max-width:660px}
.sc-bigtext{font-size:19px;color:var(--sc-ink);margin-top:16px!important}
.sc-muted{color:var(--sc-muted)}
.sc-btn{display:inline-block;border:none;cursor:pointer;font:inherit;font-weight:700;border-radius:12px;padding:16px 26px;text-decoration:none;transition:transform .12s ease,box-shadow .12s ease}
.sc-btn:hover{transform:translateY(-2px)}
.sc-btn-primary{background:linear-gradient(135deg,var(--sc-gold),var(--sc-accent));color:#fff;box-shadow:0 10px 24px rgba(232,97,26,.28)}
.sc-btn-ghost{background:#fff;color:var(--sc-ink);border:1.5px solid var(--sc-line)}
.sc-hero{background:radial-gradient(1200px 500px at 80% -10%,rgba(245,168,32,.16),transparent),linear-gradient(180deg,#fff,var(--sc-bg));padding:64px 0 56px;border-bottom:1px solid var(--sc-line)}
.sc-bullets{list-style:none;display:flex;flex-wrap:wrap;gap:10px 22px;margin:26px 0!important;padding:0}
.sc-bullets li{font-weight:600;font-size:15px;color:var(--sc-teal);display:flex;align-items:center;gap:8px}
.sc-bullets li::before{content:"✓";color:var(--sc-accent);font-weight:800}
.sc-cta{display:flex;flex-wrap:wrap;gap:14px;margin-top:4px}
.sc-cred{margin-top:22px!important;font-size:14px;color:var(--sc-muted);max-width:680px;border-left:3px solid var(--sc-gold);padding-left:14px}
.sc-note{margin-top:14px!important;font-size:13px;color:var(--sc-muted)}
.sc-root section{padding:56px 0}
.sc-root section.sc-alt{background:#fff;border-top:1px solid var(--sc-line);border-bottom:1px solid var(--sc-line)}
.sc-grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:28px}
.sc-card{background:#fff;border:1px solid var(--sc-line);border-radius:16px;padding:24px}
.sc-card h3{margin-bottom:12px}
.sc-card ul{list-style:none;display:grid;gap:10px;padding:0}
.sc-card li{font-size:15px;color:var(--sc-muted);display:flex;gap:10px}
.sc-for li::before{content:"✓";color:#1f9d57;font-weight:800}
.sc-not{background:#f4f5f7;border-style:dashed}
.sc-not li::before{content:"✕";color:#b03b3b;font-weight:800}
.sc-outcome{list-style:none;counter-reset:none;margin-top:28px!important;display:grid;gap:14px;padding:0}
.sc-outcome li{display:flex;gap:14px;align-items:flex-start;font-size:18px;background:#fff;border:1px solid var(--sc-line);border-radius:14px;padding:16px 18px}
.sc-num{flex:0 0 30px;height:30px;border-radius:8px;background:linear-gradient(135deg,var(--sc-gold),var(--sc-accent));color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:15px}
.sc-phase{display:flex;gap:18px;align-items:flex-start;background:#fff;border:1px dashed var(--sc-line);border-radius:14px;padding:18px 20px;margin-top:18px}
.sc-phase-label{flex:0 0 84px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--sc-accent);padding-top:3px}
.sc-phase p{color:var(--sc-muted);font-size:15px;margin-top:4px!important}
.sc-tag{font-size:12px;font-weight:700;color:var(--sc-accent);text-transform:uppercase;letter-spacing:.08em}
.sc-day{background:#fff;border:1px solid var(--sc-line);border-radius:16px;margin-top:14px;overflow:hidden}
.sc-day summary{list-style:none;cursor:pointer;padding:22px 24px;display:flex;justify-content:space-between;align-items:center;gap:16px}
.sc-day summary::-webkit-details-marker{display:none}
.sc-daynum{font-size:13px;font-weight:700;color:var(--sc-accent);text-transform:uppercase;letter-spacing:.08em;display:block;margin-bottom:4px}
.sc-chev{color:var(--sc-muted);font-size:22px;transition:transform .2s}
.sc-day[open] .sc-chev{transform:rotate(45deg)}
.sc-day-body{padding:0 24px 24px;border-top:1px solid var(--sc-line)}
.sc-blk{margin-top:18px}
.sc-blk .sc-tag{display:block;margin-bottom:8px}
.sc-blk ul{margin:0 0 0 18px;color:var(--sc-muted);font-size:15px}
.sc-sched{margin-top:28px;border:1px solid var(--sc-line);border-radius:16px;overflow:hidden;background:#fff}
.sc-srow{display:grid;grid-template-columns:140px 1fr;border-top:1px solid var(--sc-line)}
.sc-srow:first-child{border-top:none}
.sc-t{padding:14px 18px;font-weight:700;color:var(--sc-teal);background:#f8f9fb}
.sc-d{padding:14px 18px;color:var(--sc-muted)}
.sc-host{display:flex;gap:18px;align-items:flex-start}
.sc-host p{margin-top:6px;color:var(--sc-muted);font-size:15px}
.sc-avatar{flex:0 0 64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--sc-teal),var(--sc-teal-dk));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px}
.sc-vs{margin-top:6px!important;font-size:17px;font-weight:600;color:var(--sc-teal);max-width:640px}
.sc-price-wrap{display:grid;grid-template-columns:1.1fr .9fr;gap:20px;margin-top:24px}
.sc-price-card{background:var(--sc-teal-dk);color:#fff;border-radius:20px;padding:32px}
.sc-amt{font-size:52px;font-weight:800;letter-spacing:-.02em}
.sc-amt small{font-size:18px;font-weight:600;color:#cdd6df}
.sc-old{color:#9fb0bd;text-decoration:line-through;font-size:18px;margin-left:8px}
.sc-eb{display:inline-block;background:var(--sc-gold);color:#1E3340;font-weight:800;font-size:12px;padding:6px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:.06em;margin-bottom:14px}
.sc-deposit{color:#cdd6df;margin:12px 0 20px!important}
.sc-incl{background:#fff;border:1px solid var(--sc-line);border-radius:20px;padding:28px}
.sc-incl ul{list-style:none;display:grid;gap:12px;margin-top:8px;padding:0}
.sc-incl li{display:flex;gap:10px;font-size:15px;color:var(--sc-muted)}
.sc-incl li::before{content:"✓";color:var(--sc-accent);font-weight:800}
.sc-scarcity{margin-top:20px!important;font-size:15px;color:var(--sc-muted);font-style:italic}
.sc-faqs{margin-top:20px}
.sc-faq{border-bottom:1px solid var(--sc-line);padding:18px 0}
.sc-faq summary{cursor:pointer;font-weight:700;font-size:17px;list-style:none;display:flex;justify-content:space-between;gap:16px}
.sc-faq summary::-webkit-details-marker{display:none}
.sc-faq p{color:var(--sc-muted);margin-top:10px!important;font-size:15px}
.sc-pm{color:var(--sc-accent);font-weight:800}
.sc-signup{text-align:center}
.sc-signup .sc-muted{max-width:560px;margin:8px auto 24px}
.sc-footer{background:var(--sc-teal-dk);color:#aebcc7;padding:36px 0;font-size:14px}
.sc-footer a{color:#fff;text-decoration:none}
.sc-footrow{display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px}
@media(max-width:760px){.sc-grid2,.sc-price-wrap{grid-template-columns:1fr}.sc-srow{grid-template-columns:110px 1fr}}
`
