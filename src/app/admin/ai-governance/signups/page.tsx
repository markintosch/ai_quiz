import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface Signup {
  id: string
  first_name: string
  last_name: string
  email: string
  organisation: string | null
  role: string | null
  company_size: string | null
  question: string | null
  created_at: string
}

async function loadSignups(): Promise<{ rows: Signup[]; error: string | null }> {
  try {
    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('ai_governance_signups')
      .select('id, first_name, last_name, email, organisation, role, company_size, question, created_at')
      .order('created_at', { ascending: false }) as { data: Signup[] | null; error: { message: string } | null }
    if (error) return { rows: [], error: error.message }
    return { rows: data ?? [], error: null }
  } catch (e) {
    return { rows: [], error: e instanceof Error ? e.message : 'Onbekende fout' }
  }
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export default async function AIGovernanceSignupsPage() {
  const { rows, error } = await loadSignups()

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand">AI Governance · voorinschrijvingen</h1>
          <p className="text-sm text-gray-500 mt-1">{rows.length} inschrijving{rows.length === 1 ? '' : 'en'}</p>
        </div>
        <a href="/admin/ai-governance" className="text-sm text-brand-accent underline">Pagina-inhoud bewerken →</a>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Kon inschrijvingen niet laden: {error}. Controleer of de tabel <code>ai_governance_signups</code> bestaat (migration_ai_governance_signups.sql).
        </div>
      )}

      {rows.length === 0 && !error ? (
        <p className="text-gray-500">Nog geen voorinschrijvingen.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Datum</th>
                <th className="px-4 py-3">Naam</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Organisatie</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Grootte</th>
                <th className="px-4 py-3">Vraag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">{fmtDate(r.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{r.first_name} {r.last_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><a href={`mailto:${r.email}`} className="text-brand-accent underline">{r.email}</a></td>
                  <td className="px-4 py-3">{r.organisation ?? '—'}</td>
                  <td className="px-4 py-3">{r.role ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{r.company_size ?? '—'}</td>
                  <td className="px-4 py-3 max-w-xs text-gray-600">{r.question ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
