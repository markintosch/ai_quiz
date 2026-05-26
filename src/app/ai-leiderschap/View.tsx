import type { AILContent } from './content'
import WaitlistForm from './WaitlistForm'

// Self-contained presentational view. Scoped <style> block (.ail-* prefix).
// Navy/amber, executive feel.

function isBookable(href: string): boolean {
  return /^https?:\/\//i.test(href) && !/REPLACE_WITH/i.test(href)
}

export default function AILeiderschapView({ c }: { c: AILContent }) {
  return (
    <div className="ail-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <nav className="ail-nav">
        <a href="https://markdekock.com" className="ail-nav-back">← markdekock.com</a>
        <a href="#boeken" className="ail-btn ail-btn-primary ail-nav-cta">Boek je plek</a>
      </nav>

      <header className="ail-hero">
        <div className="ail-wrap">
          <span className="ail-eyebrow">{c.hero.eyebrow}</span>
          <h1>{c.hero.title}</h1>
          <p className="ail-lead">{c.hero.subtitle}</p>
          <ul className="ail-bullets">
            {c.hero.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          <div className="ail-cta">
            <a href={c.hero.ctaPrimary.href} className="ail-btn ail-btn-primary">{c.hero.ctaPrimary.label}</a>
            <a href={c.hero.ctaSecondary.href} className="ail-btn ail-btn-ghost">{c.hero.ctaSecondary.label}</a>
          </div>
          <p className="ail-note">{c.hero.note}</p>
        </div>
      </header>

      <section className="ail-sec">
        <div className="ail-wrap ail-narrow">
          <h2>{c.problem.heading}</h2>
          <p className="ail-big">{c.problem.body}</p>
        </div>
      </section>

      <section className="ail-sec ail-alt">
        <div className="ail-wrap">
          <h2>{c.audience.heading}</h2>
          <p className="ail-muted ail-narrow">{c.audience.intro}</p>
          <div className="ail-roles">
            {c.audience.roles.map((r, i) => <span key={i} className="ail-role">{r}</span>)}
          </div>
          {c.audience.scenarios.length > 0 && (
            <ul className="ail-scenarios">
              {c.audience.scenarios.map((s, i) => <li key={i}>{s}</li>)}
            </ul>
          )}
          <p className="ail-muted ail-small">{c.audience.note}</p>
        </div>
      </section>

      <section className="ail-sec" id="programma">
        <div className="ail-wrap">
          <h2>{c.program.heading}</h2>
          <p className="ail-muted ail-narrow">{c.program.intro}</p>
          <div className="ail-grid">
            {c.program.items.map((it, i) => (
              <div key={i} className="ail-card">
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ail-sec ail-alt" id="traject">
        <div className="ail-wrap">
          <h2>{c.trajectory.heading}</h2>
          <p className="ail-muted ail-narrow">{c.trajectory.intro}</p>
          <ol className="ail-traj">
            {c.trajectory.steps.map((s, i) => (
              <li key={i}>
                <span className="ail-traj-label">{s.label}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="ail-sec">
        <div className="ail-wrap">
          <h2>{c.hosts.heading}</h2>
          <p className="ail-muted ail-narrow">{c.hosts.intro}</p>
          <div className="ail-hosts">
            {c.hosts.people.map((p, i) => (
              <div key={i} className="ail-host">
                {p.photo
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img className="ail-avatar ail-avatar-img" src={p.photo} alt={p.name} />
                  : <div className="ail-avatar">{p.initials}</div>}
                <div>
                  <h3>{p.name}</h3>
                  <p className="ail-host-role">{p.role}</p>
                  <p>{p.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {c.testimonials.items.length > 0 && (
        <section className="ail-sec">
          <div className="ail-wrap ail-narrow">
            <h2>{c.testimonials.heading}</h2>
            <div className="ail-testimonials">
              {c.testimonials.items.map((t, i) => (
                <blockquote key={i} className="ail-quote">
                  <p>“{t.quote}”</p>
                  <cite>{[t.name, t.role].filter(Boolean).join(' · ')}</cite>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="ail-sec ail-alt">
        <div className="ail-wrap ail-narrow">
          <h2>{c.practical.heading}</h2>
          <dl className="ail-facts">
            {c.practical.facts.map((f, i) => (
              <div key={i} className="ail-fact"><dt>{f.label}</dt><dd>{f.value}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      {/* SLOTS — Mollie payment buttons (vervang URL's in CMS of content.ts) */}
      <section className="ail-sec ail-pay-sec" id="boeken">
        <div className="ail-wrap">
          <h2>{c.slots.heading}</h2>
          <p className="ail-muted ail-narrow">{c.slots.intro}</p>
          <div className="ail-slots">
            {c.slots.items.map((slot) => {
              const bookable = isBookable(slot.mollieHref)
              return (
                <a key={slot.id} href={bookable ? slot.mollieHref : '#voorinschrijving'} className={`ail-slot ${bookable ? '' : 'ail-slot-soon'}`}>
                  <span className="ail-slot-label">{slot.label}</span>
                  <span className="ail-slot-time">{slot.time}</span>
                  <span className="ail-slot-price">{slot.price}</span>
                  <span className="ail-slot-note">{slot.note}</span>
                  <span className="ail-slot-cta">{bookable ? 'Boek + betaal →' : 'Boeking opent binnenkort'}</span>
                </a>
              )
            })}
          </div>
          <p className="ail-pay-note">{c.slots.payNote}</p>
        </div>
      </section>

      {/* WAITLIST — voor wie niet kan op 29 juni */}
      <section className="ail-sec" id="voorinschrijving">
        <div className="ail-wrap ail-narrow">
          <h2>{c.waitlist.heading}</h2>
          <p className="ail-muted">{c.waitlist.intro}</p>
          <WaitlistForm successMessage={c.waitlist.successMessage} />
        </div>
      </section>

      <section className="ail-sec ail-alt">
        <div className="ail-wrap ail-narrow">
          <h2>{c.faq.heading}</h2>
          <div className="ail-faqs">
            {c.faq.items.map((f, i) => (
              <details key={i} className="ail-faq">
                <summary>{f.q}<span className="ail-pm">+</span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="ail-footer">
        <div className="ail-wrap ail-footrow">
          <div>{c.footer.tagline}</div>
          <div>{c.footer.legal}</div>
        </div>
      </footer>
    </div>
  )
}

const CSS = `
.ail-root{--n:#0D1B2A;--n2:#13243a;--ink:#1c2433;--muted:#5a6678;--line:#e7e9ef;--acc:#E8611A;--acc2:#F5A820;--teal:#354E5E;--bg:#fbfaf8;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);line-height:1.55;-webkit-font-smoothing:antialiased}
.ail-root *{box-sizing:border-box}
.ail-root h1,.ail-root h2,.ail-root h3,.ail-root p,.ail-root ul,.ail-root ol,.ail-root dl{margin:0}
.ail-wrap{max-width:1020px;margin:0 auto;padding:0 24px}
.ail-narrow{max-width:740px}
.ail-eyebrow{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--acc2);margin-bottom:16px}
.ail-root h1{font-size:clamp(34px,5.8vw,56px);line-height:1.06;font-weight:800;letter-spacing:-.02em}
.ail-root h2{font-size:clamp(26px,4vw,38px);font-weight:800;letter-spacing:-.01em;margin-bottom:8px}
.ail-root h3{font-size:19px;font-weight:700}
.ail-muted{color:var(--muted)}
.ail-small{font-size:14px;margin-top:18px!important}
.ail-btn{display:inline-block;border:none;cursor:pointer;font:inherit;font-weight:700;border-radius:10px;padding:15px 26px;text-decoration:none;transition:transform .12s ease}
.ail-btn:hover{transform:translateY(-2px)}
.ail-btn-primary{background:linear-gradient(135deg,var(--acc2),var(--acc));color:#fff;box-shadow:0 8px 22px rgba(232,97,26,.28)}
.ail-btn-ghost{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.35)}
.ail-nav{position:absolute;top:0;left:0;right:0;z-index:10;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;gap:16px}
.ail-nav-back{color:rgba(255,255,255,.65);text-decoration:none;font-size:14px;font-weight:600}
.ail-nav-back:hover{color:#fff}
.ail-nav-cta{padding:10px 20px;font-size:14px}
.ail-root{position:relative}
.ail-hero{background:radial-gradient(1100px 460px at 80% -10%,rgba(245,168,32,.16),transparent),linear-gradient(180deg,var(--n),var(--n2));color:#fff;padding:120px 0 68px}
.ail-hero h1{max-width:840px}
.ail-lead{font-size:20px;color:#b0c2d2;margin-top:18px!important;max-width:720px}
.ail-bullets{list-style:none;display:flex;flex-wrap:wrap;gap:10px 22px;margin:26px 0!important;padding:0}
.ail-bullets li{font-weight:600;font-size:15px;color:#dfe8f0;display:flex;align-items:center;gap:8px}
.ail-bullets li::before{content:"✓";color:var(--acc2);font-weight:800}
.ail-cta{display:flex;flex-wrap:wrap;gap:14px;margin-top:8px}
.ail-note{margin-top:20px!important;font-size:14px;color:#9fb2c2;max-width:720px}
.ail-sec{padding:60px 0}
.ail-alt{background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.ail-big{font-size:19px;margin-top:14px!important}
.ail-roles{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
.ail-role{background:var(--bg);border:1px solid var(--line);border-radius:999px;padding:9px 16px;font-size:14px;font-weight:600;color:var(--teal)}
.ail-scenarios{list-style:none;padding:0;margin:28px 0 0!important;display:grid;gap:10px;max-width:740px}
.ail-scenarios li{font-size:16px;color:var(--ink);padding-left:24px;position:relative}
.ail-scenarios li::before{content:"";position:absolute;left:0;top:9px;width:14px;height:2px;background:var(--acc);border-radius:2px}
.ail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:28px}
.ail-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px}
.ail-card h3{margin-bottom:8px}
.ail-card p{color:var(--muted);font-size:14px}
.ail-traj{list-style:none;display:grid;gap:14px;margin-top:24px!important;padding:0}
.ail-traj li{display:flex;gap:16px;align-items:flex-start;background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px 20px}
.ail-traj-label{flex:0 0 100px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--acc);padding-top:4px}
.ail-traj p{color:var(--muted);font-size:14px;margin-top:4px!important}
.ail-hosts{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:28px}
.ail-host{display:flex;gap:16px;align-items:flex-start;background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px}
.ail-host p{color:var(--muted);font-size:14px;margin-top:6px!important}
.ail-host-role{color:var(--acc)!important;font-weight:600;font-size:13px!important;margin-top:2px!important}
.ail-avatar{flex:0 0 56px;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--n));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px}
.ail-avatar-img{object-fit:cover;background:#eee}
.ail-testimonials{display:grid;gap:18px;margin-top:24px}
.ail-quote{background:#fff;border:1px solid var(--line);border-radius:14px;padding:24px;margin:0;border-left:3px solid var(--acc)}
.ail-quote p{font-size:17px;line-height:1.55;color:var(--ink);font-style:italic;margin:0}
.ail-quote cite{display:block;margin-top:12px;font-size:14px;font-style:normal;font-weight:600;color:var(--muted)}
.ail-slot-soon{opacity:.88;border-style:dashed}
.ail-slot-soon .ail-slot-cta{background:#7a8a98}
.ail-facts{margin-top:20px;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff}
.ail-fact{display:grid;grid-template-columns:200px 1fr;border-top:1px solid var(--line)}
.ail-fact:first-child{border-top:none}
.ail-fact dt{padding:14px 18px;font-weight:700;color:var(--teal);background:#f8f9fb}
.ail-fact dd{padding:14px 18px;color:var(--muted);margin:0}
/* Slots / Mollie buttons */
.ail-pay-sec{background:linear-gradient(180deg,#fff,#fff8f2);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.ail-slots{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:780px;margin:32px auto 0}
.ail-slot{display:flex;flex-direction:column;gap:6px;background:#fff;border:1.5px solid var(--line);border-radius:18px;padding:30px 26px;text-decoration:none;color:var(--ink);transition:transform .12s ease,box-shadow .12s ease,border-color .12s ease}
.ail-slot:hover{transform:translateY(-3px);box-shadow:0 16px 32px rgba(28,36,51,.12);border-color:var(--acc)}
.ail-slot-label{font-size:13px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--acc)}
.ail-slot-time{font-size:16px;font-weight:600;color:var(--ink);margin-top:4px}
.ail-slot-price{font-size:42px;font-weight:800;letter-spacing:-.02em;margin-top:10px}
.ail-slot-note{font-size:13px;color:var(--muted);margin-bottom:14px}
.ail-slot-cta{margin-top:auto;background:linear-gradient(135deg,var(--acc2),var(--acc));color:#fff;font-weight:700;padding:12px 22px;border-radius:10px;font-size:15px;align-self:flex-start}
.ail-pay-note{margin-top:24px!important;font-size:14px;color:var(--muted);max-width:680px;margin-left:auto;margin-right:auto;text-align:center}
/* Waitlist form */
.ail-form{background:#fff;border:1px solid var(--line);border-radius:16px;padding:24px;margin-top:24px}
.ail-frow{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.ail-form label,.ail-full{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:700;color:var(--ink)}
.ail-full{margin-bottom:14px}
.ail-form input,.ail-form select,.ail-form textarea{font:inherit;font-weight:400;padding:11px 13px;border:1.5px solid var(--line);border-radius:9px;background:#fdfdfd}
.ail-form input:focus,.ail-form select:focus,.ail-form textarea:focus{outline:none;border-color:var(--acc)}
.ail-check{flex-direction:row!important;align-items:flex-start;gap:10px;font-weight:400!important;font-size:14px!important;color:var(--muted)!important;margin-bottom:16px}
.ail-check input{margin-top:3px}
.ail-formfoot{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.ail-form-err{color:#b03b3b;font-size:14px}
.ail-form-done{background:#fff;border:1px solid var(--line);border-radius:16px;padding:32px;font-size:17px;font-weight:600;color:var(--n);margin-top:24px}
.ail-faqs{margin-top:18px}
.ail-faq{border-bottom:1px solid var(--line);padding:18px 0}
.ail-faq summary{cursor:pointer;font-weight:700;font-size:17px;list-style:none;display:flex;justify-content:space-between;gap:16px}
.ail-faq summary::-webkit-details-marker{display:none}
.ail-faq p{color:var(--muted);margin-top:10px!important;font-size:15px}
.ail-pm{color:var(--acc);font-weight:800}
.ail-footer{background:var(--n);color:#9fb2c2;padding:32px 0;font-size:14px}
.ail-footrow{display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px}
@media(max-width:880px){.ail-grid{grid-template-columns:1fr 1fr}.ail-hosts{grid-template-columns:1fr}.ail-slots{grid-template-columns:1fr;max-width:480px}.ail-traj li{flex-direction:column;gap:8px}.ail-traj-label{flex:auto;padding-top:0}.ail-fact{grid-template-columns:140px 1fr}}
@media(max-width:560px){.ail-grid{grid-template-columns:1fr}.ail-frow{grid-template-columns:1fr}}
`
