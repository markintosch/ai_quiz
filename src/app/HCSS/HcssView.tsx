import type { HcssContent } from './content'
import ContactForm from './ContactForm'

// Self-contained presentational view for the HCSS site. Styling lives in a
// scoped <style> block (selectors prefixed with .hcss-root) so it doesn't leak.
// Navy base + amber accent, per the brand strategy. Native <details> for FAQ.

export default function HcssView({ c }: { c: HcssContent }) {
  return (
    <div className="hcss-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* NAV */}
      <nav className="hcss-nav">
        <div className="hcss-wrap hcss-navrow">
          <a href="#top" className="hcss-brand">HCSS</a>
          <div className="hcss-navlinks">
            {c.nav.links.map((l, i) => <a key={i} href={l.href}>{l.label}</a>)}
            <a href={c.nav.cta.href} className="hcss-btn hcss-btn-primary hcss-btn-sm">{c.nav.cta.label}</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hcss-hero" id="top">
        <div className="hcss-wrap">
          <h1>{c.hero.title}</h1>
          <p className="hcss-lead">{c.hero.subtitle}</p>
          <div className="hcss-cta">
            <a href={c.hero.ctaPrimary.href} className="hcss-btn hcss-btn-primary">{c.hero.ctaPrimary.label}</a>
            <a href={c.hero.ctaSecondary.href} className="hcss-btn hcss-btn-ghost">{c.hero.ctaSecondary.label}</a>
          </div>
          <div className="hcss-trust">
            {c.hero.trustBar.map((t, i) => <span key={i} className="hcss-pill">{t}</span>)}
          </div>
        </div>
      </header>

      {/* PROBLEM */}
      <section className="hcss-sec">
        <div className="hcss-wrap hcss-narrow">
          <h2>{c.problem.heading}</h2>
          <p className="hcss-big">{c.problem.body}</p>
          <p className="hcss-big hcss-accent-text">{c.problem.closing}</p>
        </div>
      </section>

      {/* SERVICES */}
      <section className="hcss-sec hcss-alt" id="diensten">
        <div className="hcss-wrap">
          <h2>{c.services.heading}</h2>
          <p className="hcss-muted hcss-narrow">{c.services.intro}</p>
          <div className="hcss-grid4">
            {c.services.cards.map((card, i) => (
              <div key={i} className="hcss-card">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ASSESSMENT — lead generator */}
      <section className="hcss-sec hcss-assess" id="assessment">
        <div className="hcss-wrap">
          <span className="hcss-eyebrow">{c.assessment.eyebrow}</span>
          <h2>{c.assessment.heading}</h2>
          <p className="hcss-lead-light">{c.assessment.body}</p>
          <ul className="hcss-bullets">
            {c.assessment.bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
          <div className="hcss-cta">
            <a href={c.assessment.ctaHref} className="hcss-btn hcss-btn-primary">{c.assessment.ctaLabel}</a>
          </div>
          <p className="hcss-note">{c.assessment.note}</p>

          <div className="hcss-tiers">
            {c.assessment.tiers.map((t, i) => (
              <div key={i} className="hcss-tier">
                <div className="hcss-tier-name">{t.name}</div>
                <div className="hcss-tier-for">{t.forWho}</div>
                <p>{t.contains}</p>
              </div>
            ))}
          </div>
          <p className="hcss-note">{c.assessment.tiersNote}</p>
        </div>
      </section>

      {/* WERKWIJZE */}
      <section className="hcss-sec hcss-alt" id="werkwijze">
        <div className="hcss-wrap">
          <h2>{c.werkwijze.heading}</h2>
          <p className="hcss-muted hcss-narrow">{c.werkwijze.intro}</p>
          <ol className="hcss-steps">
            {c.werkwijze.steps.map((s, i) => (
              <li key={i}>
                <span className="hcss-stepnum">{i + 1}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* WAAROM */}
      <section className="hcss-sec">
        <div className="hcss-wrap">
          <h2>{c.waarom.heading}</h2>
          <div className="hcss-grid4">
            {c.waarom.items.map((it, i) => (
              <div key={i} className="hcss-card">
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — role-attributed, no names */}
      {c.testimonials.items.length > 0 && (
        <section className="hcss-sec hcss-quote-sec">
          <div className="hcss-wrap">
            <h2 className="hcss-quote-heading">{c.testimonials.heading}</h2>
            <div className="hcss-quotes">
              {c.testimonials.items.map((tm, i) => (
                <figure key={i} className="hcss-quote-card">
                  <blockquote>“{tm.quote}”</blockquote>
                  <figcaption>{tm.role}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* OVER / FOUNDER */}
      <section className="hcss-sec hcss-alt" id="over">
        <div className="hcss-wrap">
          <h2>{c.founder.heading}</h2>
          <div className="hcss-founder">
            <div className="hcss-founder-photo" aria-hidden="true">{initials(c.founder.name)}</div>
            <div className="hcss-founder-body">
              <h3>{c.founder.name}</h3>
              <p>{c.founder.bio}</p>
              <a href={c.founder.ctaHref} className="hcss-btn hcss-btn-primary hcss-btn-sm">{c.founder.ctaLabel}</a>
            </div>
          </div>
          <h3 className="hcss-creds-title">{c.founder.credsTitle}</h3>
          <div className="hcss-creds">
            {c.founder.creds.map((cr, i) => (
              <div key={i} className="hcss-cred">
                <div className="hcss-cred-cat">{cr.category}</div>
                <div className="hcss-cred-detail">{cr.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="hcss-sec" id="contact">
        <div className="hcss-wrap">
          <h2>{c.contact.heading}</h2>
          <p className="hcss-muted hcss-narrow">{c.contact.intro}</p>
          <div className="hcss-contact-grid">
            <ContactForm successMessage={c.contact.successMessage} />
            <aside className="hcss-contact-aside">
              <h3>{c.contact.expectTitle}</h3>
              <ul className="hcss-expect">
                {c.contact.expect.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
              <h3>{c.contact.directTitle}</h3>
              <ul className="hcss-direct">
                {c.contact.email && <li>E-mail: <a href={`mailto:${c.contact.email}`}>{c.contact.email}</a></li>}
                {c.contact.phone && <li>Telefoon: <a href={`tel:${c.contact.phone}`}>{c.contact.phone}</a></li>}
                {c.contact.linkedin && <li>LinkedIn: <a href={c.contact.linkedin} target="_blank" rel="noopener">{linkedinLabel(c.contact.linkedin)}</a></li>}
                {c.contact.kvk && <li>KvK: {c.contact.kvk}</li>}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="hcss-sec hcss-alt">
        <div className="hcss-wrap hcss-narrow">
          <h2>{c.faq.heading}</h2>
          <div className="hcss-faqs">
            {c.faq.items.map((f, i) => (
              <details key={i} className="hcss-faq">
                <summary>{f.q}<span className="hcss-pm">+</span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hcss-footer">
        <div className="hcss-wrap">
          <div className="hcss-footrow">
            <div>
              <div className="hcss-brand">HCSS</div>
              <p className="hcss-foottag">{c.footer.tagline}</p>
            </div>
            <div className="hcss-footnav">
              {c.nav.links.map((l, i) => <a key={i} href={l.href}>{l.label}</a>)}
              <a href="/privacy">Privacy</a>
            </div>
          </div>
          <p className="hcss-legal">{c.footer.legal}</p>
        </div>
      </footer>
    </div>
  )
}

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
}
function linkedinLabel(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

const CSS = `
.hcss-root{--n:#0D1B2A;--n2:#13243a;--n3:#1b3252;--ink:#1c2433;--muted:#5a6678;--line:#e7e9ef;--acc:#E8611A;--acc2:#F5A820;--bg:#fbfaf8;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);line-height:1.55;-webkit-font-smoothing:antialiased}
.hcss-root *{box-sizing:border-box}
.hcss-root h1,.hcss-root h2,.hcss-root h3,.hcss-root p,.hcss-root ul,.hcss-root ol,.hcss-root blockquote{margin:0}
.hcss-wrap{max-width:1040px;margin:0 auto;padding:0 24px}
.hcss-narrow{max-width:720px}
.hcss-btn{display:inline-block;border:none;cursor:pointer;font:inherit;font-weight:700;border-radius:10px;padding:15px 26px;text-decoration:none;transition:transform .12s ease,box-shadow .12s ease}
.hcss-btn:hover{transform:translateY(-2px)}
.hcss-btn-sm{padding:11px 18px;font-size:14px}
.hcss-btn-primary{background:linear-gradient(135deg,var(--acc2),var(--acc));color:#fff;box-shadow:0 8px 22px rgba(232,97,26,.28)}
.hcss-btn-ghost{background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.35)}
.hcss-eyebrow{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--acc2);margin-bottom:14px}
.hcss-root h1{font-size:clamp(34px,6vw,56px);line-height:1.06;font-weight:800;letter-spacing:-.02em}
.hcss-root h2{font-size:clamp(26px,4vw,38px);font-weight:800;letter-spacing:-.01em;margin-bottom:8px}
.hcss-root h3{font-size:20px;font-weight:700}
.hcss-muted{color:var(--muted)}
/* NAV */
.hcss-nav{position:sticky;top:0;z-index:20;background:rgba(13,27,42,.92);backdrop-filter:saturate(140%) blur(8px);border-bottom:1px solid rgba(255,255,255,.08)}
.hcss-navrow{display:flex;align-items:center;justify-content:space-between;height:64px}
.hcss-brand{color:#fff;font-weight:800;font-size:22px;letter-spacing:.04em;text-decoration:none}
.hcss-navlinks{display:flex;align-items:center;gap:24px}
.hcss-navlinks a{color:#cdd6df;text-decoration:none;font-size:15px;font-weight:600}
.hcss-navlinks a:hover{color:#fff}
.hcss-navlinks .hcss-btn-primary{color:#fff}
/* HERO */
.hcss-hero{background:radial-gradient(1100px 460px at 78% -10%,rgba(245,168,32,.16),transparent),linear-gradient(180deg,var(--n),var(--n2));color:#fff;padding:84px 0 72px}
.hcss-hero h1{max-width:880px}
.hcss-lead{font-size:21px;color:#b0c2d2;margin-top:18px!important;max-width:660px}
.hcss-cta{display:flex;flex-wrap:wrap;gap:14px;margin-top:30px}
.hcss-trust{display:flex;flex-wrap:wrap;gap:10px;margin-top:34px}
.hcss-pill{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:8px 16px;font-size:13px;font-weight:600;color:#cdd6df}
/* SECTIONS */
.hcss-sec{padding:60px 0}
.hcss-alt{background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.hcss-big{font-size:19px;margin-top:16px!important}
.hcss-accent-text{font-weight:600;color:var(--n)}
.hcss-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;margin-top:28px}
.hcss-card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:22px}
.hcss-alt .hcss-card{background:var(--bg)}
.hcss-card h3{font-size:17px;margin-bottom:8px}
.hcss-card p{color:var(--muted);font-size:14px}
/* ASSESSMENT */
.hcss-assess{background:linear-gradient(180deg,var(--n2),var(--n));color:#fff}
.hcss-assess h2{color:#fff}
.hcss-lead-light{font-size:19px;color:#b0c2d2;max-width:680px;margin-top:8px!important}
.hcss-bullets{list-style:none;display:flex;flex-wrap:wrap;gap:10px 22px;margin:22px 0!important;padding:0}
.hcss-bullets li{font-weight:600;font-size:15px;color:#dfe8f0;display:flex;align-items:center;gap:8px}
.hcss-bullets li::before{content:"✓";color:var(--acc2);font-weight:800}
.hcss-note{margin-top:14px!important;font-size:14px;color:#9fb2c2}
.hcss-tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:34px}
.hcss-tier{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:20px}
.hcss-tier-name{font-weight:800;font-size:18px;color:#fff}
.hcss-tier-for{color:var(--acc2);font-size:13px;font-weight:600;margin:4px 0 10px}
.hcss-tier p{color:#b0c2d2;font-size:14px}
/* STEPS */
.hcss-steps{list-style:none;counter-reset:none;margin-top:28px!important;padding:0;display:grid;gap:14px}
.hcss-steps li{display:flex;gap:16px;align-items:flex-start;background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:18px 20px}
.hcss-stepnum{flex:0 0 34px;height:34px;border-radius:9px;background:linear-gradient(135deg,var(--acc2),var(--acc));color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center}
.hcss-steps p{color:var(--muted);font-size:15px;margin-top:4px!important}
/* TESTIMONIALS */
.hcss-quote-sec{background:var(--n);color:#fff}
.hcss-quote-heading{color:#fff;text-align:center;margin-bottom:28px!important}
.hcss-quotes{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.hcss-quote-card{display:flex;flex-direction:column;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:14px;padding:22px;margin:0}
.hcss-quote-card blockquote{margin:0;flex:1;font-size:15px;line-height:1.5;color:#eaf1f7}
.hcss-quote-card figcaption{margin-top:16px;color:var(--acc2);font-weight:600;font-size:13px}
/* FOUNDER */
.hcss-founder{display:flex;gap:26px;align-items:flex-start;margin-top:24px}
.hcss-founder-photo{flex:0 0 110px;height:110px;border-radius:16px;background:linear-gradient(135deg,var(--n3),var(--n));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:34px}
.hcss-founder-body p{color:var(--muted);margin:8px 0 16px!important}
.hcss-creds-title{margin-top:40px;margin-bottom:6px}
.hcss-creds{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:14px}
.hcss-cred{background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
.hcss-cred-cat{font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--acc)}
.hcss-cred-detail{font-size:14px;color:var(--ink);margin-top:4px}
/* CONTACT */
.hcss-contact-grid{display:grid;grid-template-columns:1.3fr .9fr;gap:28px;margin-top:28px}
.hcss-form{background:#fff;border:1px solid var(--line);border-radius:16px;padding:24px}
.hcss-frow{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
.hcss-form label,.hcss-full{display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:700;color:var(--ink)}
.hcss-full{margin-bottom:14px}
.hcss-form input,.hcss-form select,.hcss-form textarea{font:inherit;font-weight:400;padding:11px 13px;border:1.5px solid var(--line);border-radius:9px;background:#fdfdfd}
.hcss-form input:focus,.hcss-form select:focus,.hcss-form textarea:focus{outline:none;border-color:var(--acc)}
.hcss-form textarea{resize:vertical}
.hcss-formfoot{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.hcss-form-err{color:#b03b3b;font-size:14px}
.hcss-form-done{background:#fff;border:1px solid var(--line);border-radius:16px;padding:32px;font-size:17px;font-weight:600;color:var(--n)}
.hcss-contact-aside h3{font-size:16px;margin-bottom:10px}
.hcss-contact-aside h3:nth-of-type(2){margin-top:24px}
.hcss-expect,.hcss-direct{list-style:none;padding:0;display:grid;gap:8px}
.hcss-expect li{font-size:14px;color:var(--muted);display:flex;gap:9px}
.hcss-expect li::before{content:"✓";color:var(--acc);font-weight:800}
.hcss-direct li{font-size:14px;color:var(--muted)}
.hcss-direct a{color:var(--acc);font-weight:600;text-decoration:none}
/* FAQ */
.hcss-faqs{margin-top:20px}
.hcss-faq{border-bottom:1px solid var(--line);padding:18px 0}
.hcss-faq summary{cursor:pointer;font-weight:700;font-size:17px;list-style:none;display:flex;justify-content:space-between;gap:16px}
.hcss-faq summary::-webkit-details-marker{display:none}
.hcss-faq p{color:var(--muted);margin-top:10px!important;font-size:15px}
.hcss-pm{color:var(--acc);font-weight:800}
/* FOOTER */
.hcss-footer{background:var(--n);color:#9fb2c2;padding:44px 0 32px}
.hcss-footrow{display:flex;justify-content:space-between;flex-wrap:wrap;gap:20px}
.hcss-foottag{margin-top:8px!important;max-width:340px;font-size:14px}
.hcss-footnav{display:flex;flex-wrap:wrap;gap:18px;align-items:center}
.hcss-footnav a{color:#cdd6df;text-decoration:none;font-size:14px}
.hcss-legal{margin-top:28px!important;font-size:13px;color:#6f8498}
@media(max-width:880px){.hcss-grid4{grid-template-columns:1fr 1fr}.hcss-tiers{grid-template-columns:1fr}.hcss-quotes{grid-template-columns:1fr}.hcss-contact-grid{grid-template-columns:1fr}.hcss-creds{grid-template-columns:1fr}.hcss-founder{flex-direction:column}}
@media(max-width:560px){.hcss-grid4{grid-template-columns:1fr}.hcss-frow{grid-template-columns:1fr}.hcss-navlinks{gap:14px}.hcss-navlinks a:not(.hcss-btn){display:none}}
`
