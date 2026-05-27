import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { DEFAULT_CONTENT, mergeContent, type AILContent } from '../content'

export const dynamic = 'force-dynamic'

const PRODUCT_KEY = 'ai_leiderschap'
const LOCALE = 'nl'

async function loadContent(): Promise<AILContent> {
  try {
    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any)
      .from('site_content')
      .select('content')
      .eq('locale', LOCALE)
      .eq('product_key', PRODUCT_KEY)
      .single() as { data: { content: Record<string, unknown> } | null }
    return mergeContent(DEFAULT_CONTENT, data?.content)
  } catch {
    return DEFAULT_CONTENT
  }
}

export default async function ProjectenPage() {
  const content = await loadContent()
  const c = content.projectenPage

  return (
    <div className="ail-root">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <nav className="ail-nav">
        <div className="ail-nav-left">
          <Link href="/ai-leiderschap" className="ail-nav-back">{c.backLabel}</Link>
        </div>
        <a href={c.ctaHref} target="_blank" rel="noopener" className="ail-btn ail-btn-primary ail-nav-cta">Plan gesprek</a>
      </nav>

      <header className="ail-hero">
        <div className="ail-wrap">
          <span className="ail-eyebrow">{c.heroEyebrow}</span>
          <h1>{c.heroTitle}</h1>
          <p className="ail-lead">{c.heroSub}</p>
          <p className="ail-intro">{c.intro}</p>
          <div className="ail-cta">
            <a href={c.ctaHref} target="_blank" rel="noopener" className="ail-btn ail-btn-primary">{c.ctaLabel}</a>
          </div>
        </div>
      </header>

      <section className="ail-sec ail-alt">
        <div className="ail-wrap">
          <h2>{c.teamHeading}</h2>
          <div className="ail-team">
            {c.team.map((p, i) => (
              <div key={i} className="ail-team-card">
                <h3>{p.name}</h3>
                <p className="ail-team-role">{p.role}</p>
                <p className="ail-team-bio">{p.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ail-sec">
        <div className="ail-wrap">
          <h2>{c.workingHeading}</h2>
          <div className="ail-grid3">
            {c.working.map((it, i) => (
              <div key={i} className="ail-card">
                <h3>{it.title}</h3>
                <p>{it.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ail-sec ail-alt">
        <div className="ail-wrap">
          <h2>{c.scenariosHeading}</h2>
          <div className="ail-scenarios-grid">
            {c.scenarios.map((s, i) => (
              <div key={i} className="ail-scenario">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ail-sec ail-cta-sec">
        <div className="ail-wrap ail-narrow ail-center">
          <h2>{c.ctaHeading}</h2>
          <div className="ail-cta-row">
            <a href={c.ctaHref} target="_blank" rel="noopener" className="ail-btn ail-btn-primary ail-btn-lg">{c.ctaLabel}</a>
          </div>
          <Link href="/ai-leiderschap" className="ail-back-link">{c.backLabel}</Link>
        </div>
      </section>

      <footer className="ail-footer">
        <div className="ail-wrap ail-footrow">
          <div>{content.footer.tagline}</div>
          <div>{content.footer.legal}</div>
        </div>
      </footer>
    </div>
  )
}

const CSS = `
.ail-root{--n:#0D1B2A;--n2:#13243a;--ink:#1c2433;--muted:#5a6678;--line:#e7e9ef;--acc:#E8611A;--acc2:#F5A820;--teal:#354E5E;--bg:#fbfaf8;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Helvetica,Arial,sans-serif;color:var(--ink);background:var(--bg);line-height:1.55;-webkit-font-smoothing:antialiased}
.ail-root *{box-sizing:border-box}
.ail-root h1,.ail-root h2,.ail-root h3,.ail-root p,.ail-root ul{margin:0}
.ail-wrap{max-width:1020px;margin:0 auto;padding:0 24px}
.ail-narrow{max-width:740px}
.ail-center{text-align:center}
.ail-eyebrow{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--acc2);margin-bottom:16px}
.ail-root h1{font-size:clamp(32px,5vw,48px);line-height:1.08;font-weight:800;letter-spacing:-.02em}
.ail-root h2{font-size:clamp(24px,3.6vw,34px);font-weight:800;letter-spacing:-.01em;margin-bottom:8px}
.ail-root h3{font-size:18px;font-weight:700}
.ail-muted{color:var(--muted)}
.ail-btn{display:inline-block;border:none;cursor:pointer;font:inherit;font-weight:700;border-radius:10px;padding:13px 24px;text-decoration:none;transition:transform .12s ease}
.ail-btn:hover{transform:translateY(-2px)}
.ail-btn-lg{padding:16px 30px;font-size:16px}
.ail-btn-primary{background:linear-gradient(135deg,var(--acc2),var(--acc));color:#fff;box-shadow:0 8px 22px rgba(232,97,26,.28)}
.ail-nav{position:fixed;top:0;left:0;right:0;z-index:30;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:24px;background:rgba(13,27,42,.82);backdrop-filter:saturate(140%) blur(12px);border-bottom:1px solid rgba(255,255,255,.06)}
.ail-nav-back{color:rgba(255,255,255,.7);text-decoration:none;font-size:14px;font-weight:600}
.ail-nav-back:hover{color:#fff}
.ail-nav-cta{padding:9px 18px;font-size:14px}
.ail-hero{background:radial-gradient(1100px 460px at 80% -10%,rgba(245,168,32,.16),transparent),linear-gradient(180deg,var(--n),var(--n2));color:#fff;padding:120px 0 64px}
.ail-hero h1{max-width:820px}
.ail-lead{font-size:19px;color:#b0c2d2;margin-top:18px!important;max-width:780px}
.ail-intro{font-size:17px;color:#9fb2c2;margin-top:14px!important;max-width:780px}
.ail-cta{display:flex;gap:14px;margin-top:24px;flex-wrap:wrap}
.ail-sec{padding:60px 0}
.ail-alt{background:#fff;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.ail-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:24px}
.ail-card{background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:22px}
.ail-card h3{margin-bottom:8px}
.ail-card p{color:var(--muted);font-size:14px}
.ail-team{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-top:24px}
.ail-team-card{background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:24px}
.ail-team-card h3{font-size:19px;margin-bottom:4px}
.ail-team-role{color:var(--acc);font-weight:600;font-size:13px;margin-bottom:14px!important}
.ail-team-bio{color:var(--muted);font-size:14px;line-height:1.6}
.ail-scenarios-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:24px}
.ail-scenario{background:#fff;border:1px solid var(--line);border-radius:14px;padding:24px;border-left:3px solid var(--acc)}
.ail-scenario h3{margin-bottom:10px;font-size:18px;color:var(--ink)}
.ail-scenario p{color:var(--muted);font-size:14px;line-height:1.55}
.ail-cta-sec{background:linear-gradient(180deg,#fff,#fff8f2)}
.ail-cta-row{margin:24px 0 18px}
.ail-back-link{display:inline-block;margin-top:24px;color:var(--teal);text-decoration:none;font-size:14px;font-weight:600}
.ail-back-link:hover{text-decoration:underline}
.ail-footer{background:var(--n);color:#9fb2c2;padding:32px 0;font-size:14px}
.ail-footrow{display:flex;justify-content:space-between;flex-wrap:wrap;gap:14px}
@media(max-width:880px){.ail-grid3,.ail-scenarios-grid,.ail-team{grid-template-columns:1fr}}
`
