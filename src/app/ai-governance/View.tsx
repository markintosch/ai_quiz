import type { AIGContent } from './content'
import SignupForm from './SignupForm'

// Self-contained presentational view. Scoped <style> block (.aig-* prefix).
// Navy/amber, professional — for a CISO/DPO/compliance audience.

export default function AIGovernanceView({ c }: { c: AIGContent }) {
  return (
    <div className="aig-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="aig-hero">
        <div className="aig-wrap">
          <span className="aig-eyebrow">{c.hero.eyebrow}</span>
          <h1>{c.hero.title}</h1>
          <p className="aig-lead">{c.hero.subtitle}</p>
          <ul className="aig-bullets">
            {c.hero.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          <div className="aig-cta">
            <a href={c.hero.ctaPrimary.href} className="aig-btn aig-btn-primary">{c.hero.ctaPrimary.label}</a>
            <a href={c.hero.ctaSecondary.href} className="aig-btn aig-btn-ghost">{c.hero.ctaSecondary.label}</a>
          </div>
          <p className="aig-note">{c.hero.note}</p>
        </div>
      </header>

      <section className="aig-sec">
        <div className="aig-wrap aig-narrow">
          <h2>{c.problem.heading}</h2>
          <p className="aig-big">{c.problem.body}</p>
        </div>
      </section>

      <section className="aig-sec aig-alt">
        <div className="aig-wrap">
          <h2>{c.audience.heading}</h2>
          <p className="aig-muted aig-narrow">{c.audience.intro}</p>
          <div className="aig-roles">
            {c.audience.roles.map((r, i) => <span key={i} className="aig-role">{r}</span>)}
          </div>
          <p className="aig-muted aig-small">{c.audience.note}</p>
        </div>
      </section>

      <section className="aig-sec" id="programma">
        <div className="aig-wrap">
          <h2>{c.program.heading}</h2>
          <p className="aig-muted aig-narrow">{c.program.intro}</p>
          <div className="aig-grid">
            {c.program.items.map((it, i) => (
              <div key={i} className="aig-card">
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="aig-sec aig-alt">
        <div className="aig-wrap aig-narrow">
          <h2>{c.takeaways.heading}</h2>
          <ul className="aig-checks">
            {c.takeaways.items.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </div>
      </section>

      <section className="aig-sec">
        <div className="aig-wrap">
          <h2>{c.hosts.heading}</h2>
          <p className="aig-muted aig-narrow">{c.hosts.intro}</p>
          <div className="aig-hosts">
            {c.hosts.people.map((p, i) => (
              <div key={i} className="aig-host">
                <div className="aig-avatar">{p.initials}</div>
                <div><h3>{p.name}</h3><p>{p.bio}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="aig-sec aig-alt">
        <div className="aig-wrap aig-narrow">
          <h2>{c.practical.heading}</h2>
          <dl className="aig-facts">
            {c.practical.facts.map((f, i) => (
              <div key={i} className="aig-fact"><dt>{f.label}</dt><dd>{f.value}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      <section className="aig-sec" id="inschrijven">
        <div className="aig-wrap aig-narrow">
          <h2>{c.signup.heading}</h2>
          <p className="aig-muted">{c.signup.intro}</p>
          <SignupForm roleOptions={c.signup.roleOptions} successMessage={c.signup.successMessage} />
        </div>
      </section>

      <section className="aig-sec aig-alt">
        <div className="aig-wrap aig-narrow">
          <h2>{c.faq.heading}</h2>
          <div className="aig-faqs">
            {c.faq.items.map((f, i) => (
              <details key={i} className="aig-faq">
                <summary>{f.q}<span className="aig-pm">+</span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="aig-footer">
        <div className="aig-wrap aig-footrow">
          <div>{c.footer.tagline}</div>
          <div>{c.footer.legal}</div>
        </div>
      </footer>
    </div>
  )
}

const CSS = `
.aig-root{--n:#0D1B2A;--n2:#13243a;--ink:#1c2433;--muted:#5a6678;--line:#e7e9ef;--acc:#E8611A;--acc2:#F5A820;--teal:#354E5E;--bg:#fbfaf8;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);line-height:1.55;-webkit-font-smoothing:antialiased}
.aig-root *{box-sizing:border-box}
.aig-root h1,.aig-root h2,.aig-root h3,.aig-root p,.aig-root ul,.aig-root dl{margin:0}
.aig-wrap{max-width:1000px;margin:0 auto;padding:0 24px}
.aig-narrow{max-width:720px}
.aig-eyebrow{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--acc2);margin-bottom:16px}
.aig-root h1{font-size:clamp(32px,5.5vw,52px);line-height:1.08;font-weight:800;letter-spacing:-.02em}
.aig-root h2{font-size:clamp(25px,4vw,36px);font-weight:800;letter-spacing:-.01em;margin-bottom:8px}
.aig-root h3{font-size:18px;font-weight:700}
.aig-muted{color:var(--muted)}
.aig-small{font-size:14px;margin-top:18px!important}
.aig-btn{display:inline-block;border:none;cursor:pointer;font:inherit;font-weight:700;border-radius:10px;padding:15px 26px;text-decoration:none;transition:transform .12s ease}
.aig-btn:hover{transform:translateY(-2px)}
.aig-btn-primary{background:linear-gradient(135deg,var(--acc2),var(--acc));color:#fff;box-shadow:0 8px 22px rgba(232,97,26,.28)}
.aig-btn-ghost{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.35)}
.aig-hero{background:radial-gradient(1100px 460px at 80% -10%,rgba(245,168,32,.16),transparent),linear-gradient(180deg,var(--n),var(--n2));color:#fff;padding:80px 0 64px}
.aig-hero h1{max-width:840px}
.aig-lead{font-size:20px;color:#b0c2d2;margin-top:18px!important;max-width:680px}
.aig-bullets{list-style:none;display:flex;flex-wrap:wrap;gap:10px 22px;margin:26px 0!important;padding:0}
.aig-bullets li{font-weight:600;font-size:15px;color:#dfe8f0;display:flex;align-items:center;gap:8px}
.aig-bullets li::before{content:"✓";color:var(--acc2);font-weight:800}
.aig-cta{display:flex;flex-wrap:wrap;gap:14px;margin-top:6px}
.aig-note{margin-top:18px!important;font-size:14px;color:#9fb2c2;max-width:680px}
.aig-sec{padding:56px 0}
.aig-alt{background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.aig-big{font-size:19px;margin-top:14px!important}
.aig-roles{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
.aig-role{background:var(--bg);border:1px solid var(--line);border-radius:999px;padding:9px 16px;font-size:14px;font-weight:600;color:var(--teal)}
.aig-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:28px}
.aig-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px}
.aig-card h3{margin-bottom:8px}
.aig-card p{color:var(--muted);font-size:14px}
.aig-checks{list-style:none;display:grid;gap:14px;margin-top:24px!important;padding:0}
.aig-checks li{display:flex;gap:12px;align-items:flex-start;font-size:17px}
.aig-checks li::before{content:"✓";flex:0 0 24px;height:24px;border-radius:6px;background:linear-gradient(135deg,var(--acc2),var(--acc));color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:14px}
.aig-hosts{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:28px}
.aig-host{display:flex;gap:16px;align-items:flex-start;background:#fff;border:1px solid var(--line);border-radius:14px;padding:20px}
.aig-host p{color:var(--muted);font-size:14px;margin-top:6px!important}
.aig-avatar{flex:0 0 56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--n));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px}
.aig-facts{margin-top:20px;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:#fff}
.aig-fact{display:grid;grid-template-columns:200px 1fr;border-top:1px solid var(--line)}
.aig-fact:first-child{border-top:none}
.aig-fact dt{padding:14px 18px;font-weight:700;color:var(--teal);background:#f8f9fb}
.aig-fact dd{padding:14px 18px;color:var(--muted);margin:0}
.aig-form{background:#fff;border:1px solid var(--line);border-radius:16px;padding:24px;margin-top:24px}
.aig-frow{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.aig-form label,.aig-full{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:700;color:var(--ink)}
.aig-full{margin-bottom:14px}
.aig-form input,.aig-form select,.aig-form textarea{font:inherit;font-weight:400;padding:11px 13px;border:1.5px solid var(--line);border-radius:9px;background:#fdfdfd}
.aig-form input:focus,.aig-form select:focus,.aig-form textarea:focus{outline:none;border-color:var(--acc)}
.aig-form textarea{resize:vertical}
.aig-check{flex-direction:row!important;align-items:flex-start;gap:10px;font-weight:400!important;font-size:14px!important;color:var(--muted)!important;margin-bottom:16px}
.aig-check input{margin-top:3px}
.aig-formfoot{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.aig-form-err{color:#b03b3b;font-size:14px}
.aig-form-done{background:#fff;border:1px solid var(--line);border-radius:16px;padding:32px;font-size:17px;font-weight:600;color:var(--n);margin-top:24px}
.aig-faqs{margin-top:18px}
.aig-faq{border-bottom:1px solid var(--line);padding:18px 0}
.aig-faq summary{cursor:pointer;font-weight:700;font-size:17px;list-style:none;display:flex;justify-content:space-between;gap:16px}
.aig-faq summary::-webkit-details-marker{display:none}
.aig-faq p{color:var(--muted);margin-top:10px!important;font-size:15px}
.aig-pm{color:var(--acc);font-weight:800}
.aig-footer{background:var(--n);color:#9fb2c2;padding:32px 0;font-size:14px}
.aig-footrow{display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px}
@media(max-width:880px){.aig-grid{grid-template-columns:1fr 1fr}.aig-hosts{grid-template-columns:1fr}.aig-fact{grid-template-columns:140px 1fr}}
@media(max-width:560px){.aig-grid{grid-template-columns:1fr}.aig-frow{grid-template-columns:1fr}}
`
