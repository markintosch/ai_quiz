/**
 * Sysdig 555 Benchmark Self-Assessment
 * Cloud Threat Response Readiness
 * ─────────────────────────────────────────────────────────────
 * 5 dimensions × 4 questions = 20 questions total
 * Each answer scores 1–4. Dimension score = (sum/16) * 100.
 * Overall score = average of 5 dimension scores.
 */

export type DimensionId =
  | 'detection'
  | 'alertquality'
  | 'response'
  | 'visibility'
  | 'emerging'

export interface Dimension {
  id:          DimensionId
  label:       string
  subtitle:    string
  benchmark:   string   // which 555 benchmark this maps to
}

export interface ScanQuestion {
  id:          string
  dimension:   DimensionId
  text:        string
  options:     { label: string; score: number }[]
}

export interface DimensionResult {
  id:          DimensionId
  score:       number   // 0–100
  label:       string
  subtitle:    string
  benchmark:   string
  passes555:   boolean  // score >= 50
}

export interface ScanResult {
  overall:     number   // 0–100
  tier:        Tier
  dimensions:  DimensionResult[]
}

export type Tier = 'critical' | 'developing' | 'capable' | 'advanced'

// ── Dimensions ────────────────────────────────────────────────────────────────

export const DIMENSIONS: Dimension[] = [
  {
    id:        'detection',
    label:     'Detection Speed',
    subtitle:  'How fast do you see threats the moment they happen?',
    benchmark: '5 Seconds',
  },
  {
    id:        'alertquality',
    label:     'Alert Quality & Correlation',
    subtitle:  'Is your signal-to-noise ratio working for you or against you?',
    benchmark: '5 Minutes (Correlate)',
  },
  {
    id:        'response',
    label:     'Response Capability',
    subtitle:  'Once confirmed, how fast and precisely can you act?',
    benchmark: '5 Minutes (Respond)',
  },
  {
    id:        'visibility',
    label:     'Runtime Visibility',
    subtitle:  'Can you see what is actually running — not just what is configured?',
    benchmark: 'Foundation',
  },
  {
    id:        'emerging',
    label:     'AI & Emerging Threats',
    subtitle:  'Are your defences keeping pace with AI workloads and novel attacks?',
    benchmark: 'Future Readiness',
  },
]

// ── Questions ─────────────────────────────────────────────────────────────────

export const QUESTIONS: ScanQuestion[] = [
  // ── Detection Speed ──
  {
    id: 'det-1',
    dimension: 'detection',
    text: 'How does your organisation currently detect threats in cloud workloads?',
    options: [
      { label: 'Manual log reviews — daily or weekly', score: 1 },
      { label: 'SIEM alerts with significant delay (hours)', score: 2 },
      { label: 'Near-real-time alerts (minutes)', score: 3 },
      { label: 'Runtime behavioural monitoring — alerts in seconds', score: 4 },
    ],
  },
  {
    id: 'det-2',
    dimension: 'detection',
    text: 'What is your typical time-to-alert for a container escape attempt?',
    options: [
      { label: 'We would not know unless someone reported it', score: 1 },
      { label: 'Hours to days', score: 2 },
      { label: 'Minutes', score: 3 },
      { label: 'Seconds — we have runtime monitoring in place', score: 4 },
    ],
  },
  {
    id: 'det-3',
    dimension: 'detection',
    text: 'What percentage of your cloud environment has active security monitoring?',
    options: [
      { label: 'Less than 25%', score: 1 },
      { label: '25–50%', score: 2 },
      { label: '50–80%', score: 3 },
      { label: 'More than 80%', score: 4 },
    ],
  },
  {
    id: 'det-4',
    dimension: 'detection',
    text: 'Do you have visibility into Kubernetes runtime behaviour — not just configurations?',
    options: [
      { label: 'No Kubernetes monitoring in place', score: 1 },
      { label: 'We monitor Kubernetes configs only', score: 2 },
      { label: 'Some runtime visibility exists', score: 3 },
      { label: 'Full runtime behavioural visibility across all clusters', score: 4 },
    ],
  },

  // ── Alert Quality & Correlation ──
  {
    id: 'aq-1',
    dimension: 'alertquality',
    text: 'How would you describe your current security alert volume?',
    options: [
      { label: 'Overwhelming — we cannot triage fast enough', score: 1 },
      { label: 'High — we miss things because of the volume', score: 2 },
      { label: 'Manageable — we have some filtering in place', score: 3 },
      { label: 'Well-tuned — high signal, low noise', score: 4 },
    ],
  },
  {
    id: 'aq-2',
    dimension: 'alertquality',
    text: 'Can you correlate cloud events across accounts, containers, and hosts in a single view?',
    options: [
      { label: 'No — we look at each source separately', score: 1 },
      { label: 'Partially — some manual correlation required', score: 2 },
      { label: 'We can correlate but it takes time', score: 3 },
      { label: 'Yes — automated, real-time correlation across all sources', score: 4 },
    ],
  },
  {
    id: 'aq-3',
    dimension: 'alertquality',
    text: 'How do you prioritise vulnerabilities for remediation?',
    options: [
      { label: 'We try to fix everything — it is overwhelming', score: 1 },
      { label: 'By CVSS score only', score: 2 },
      { label: 'By CVSS score combined with asset criticality', score: 3 },
      { label: 'By runtime exploitability — we only act on what is actively at risk', score: 4 },
    ],
  },
  {
    id: 'aq-4',
    dimension: 'alertquality',
    text: 'What percentage of your security alerts turn out to be true positives?',
    options: [
      { label: 'Less than 10%', score: 1 },
      { label: '10–30%', score: 2 },
      { label: '30–60%', score: 3 },
      { label: 'More than 60%', score: 4 },
    ],
  },

  // ── Response Capability ──
  {
    id: 'res-1',
    dimension: 'response',
    text: 'Once a threat is confirmed, how quickly can your team respond?',
    options: [
      { label: 'Hours to days', score: 1 },
      { label: '30–60 minutes', score: 2 },
      { label: '5–30 minutes', score: 3 },
      { label: 'Under 5 minutes with automated containment', score: 4 },
    ],
  },
  {
    id: 'res-2',
    dimension: 'response',
    text: 'Do you have documented runbooks for cloud-native incident response?',
    options: [
      { label: 'No runbooks exist', score: 1 },
      { label: 'Runbooks exist but are rarely tested', score: 2 },
      { label: 'Tested runbooks for the main scenarios', score: 3 },
      { label: 'Automated playbooks with regular drills', score: 4 },
    ],
  },
  {
    id: 'res-3',
    dimension: 'response',
    text: 'Can you isolate a compromised container without taking down the whole service?',
    options: [
      { label: 'No — we would have to take down the entire service', score: 1 },
      { label: 'Manually, with significant disruption', score: 2 },
      { label: 'Yes, but it takes coordination and time', score: 3 },
      { label: 'Yes — automated, granular containment', score: 4 },
    ],
  },
  {
    id: 'res-4',
    dimension: 'response',
    text: 'How do you handle forensics after a cloud security incident?',
    options: [
      { label: 'Very limited post-incident visibility', score: 1 },
      { label: 'We piece together logs manually', score: 2 },
      { label: 'Structured forensics process in place', score: 3 },
      { label: 'Full audit trail with automated forensics capture', score: 4 },
    ],
  },

  // ── Runtime Visibility ──
  {
    id: 'vis-1',
    dimension: 'visibility',
    text: 'Do you know which vulnerabilities in your environment are actively being exploited?',
    options: [
      { label: 'No — we treat all CVEs equally', score: 1 },
      { label: 'We guess based on public exploitability ratings', score: 2 },
      { label: 'We use threat intelligence to prioritise', score: 3 },
      { label: 'Yes — runtime data shows exactly what is being accessed', score: 4 },
    ],
  },
  {
    id: 'vis-2',
    dimension: 'visibility',
    text: 'How do you secure third-party and open source packages in production?',
    options: [
      { label: 'We scan at build time only', score: 1 },
      { label: 'We scan and alert but remediation is slow', score: 2 },
      { label: 'Policy controls in CI/CD pipeline', score: 3 },
      { label: 'Continuous runtime scanning with automated blocking', score: 4 },
    ],
  },
  {
    id: 'vis-3',
    dimension: 'visibility',
    text: 'Do you have visibility into what processes are running inside your containers?',
    options: [
      { label: 'No — containers are black boxes to us', score: 1 },
      { label: 'Limited — we see resource metrics only', score: 2 },
      { label: 'Some — we can query on demand', score: 3 },
      { label: 'Yes — continuous behavioural profiling of all containers', score: 4 },
    ],
  },
  {
    id: 'vis-4',
    dimension: 'visibility',
    text: 'Can you detect lateral movement across your cloud environment?',
    options: [
      { label: 'No detection capability', score: 1 },
      { label: 'We would notice eventually — likely from external reports', score: 2 },
      { label: 'Some network-level detection in place', score: 3 },
      { label: 'Yes — behavioural analytics across all workloads', score: 4 },
    ],
  },

  // ── AI & Emerging Threats ──
  {
    id: 'em-1',
    dimension: 'emerging',
    text: 'Do you have security controls specific to AI and ML workloads in your environment?',
    options: [
      { label: 'No AI workloads, or no specific security controls', score: 1 },
      { label: 'We apply standard controls to AI workloads', score: 2 },
      { label: 'Some AI-specific policies in place', score: 3 },
      { label: 'Full visibility and control over AI workload behaviour', score: 4 },
    ],
  },
  {
    id: 'em-2',
    dimension: 'emerging',
    text: 'How do you protect against supply chain attacks in your container images?',
    options: [
      { label: 'We trust base images from public registries', score: 1 },
      { label: 'We scan images at build time', score: 2 },
      { label: 'Image signing and provenance verification enforced', score: 3 },
      { label: 'Continuous runtime validation and supply chain policy enforcement', score: 4 },
    ],
  },
  {
    id: 'em-3',
    dimension: 'emerging',
    text: 'How prepared is your organisation for NIS2 cloud security requirements?',
    options: [
      { label: 'We have not assessed our NIS2 posture', score: 1 },
      { label: 'We know we have gaps but have not prioritised', score: 2 },
      { label: 'We are working through a NIS2 roadmap', score: 3 },
      { label: 'Automated evidence collection ready for NIS2 audits', score: 4 },
    ],
  },
  {
    id: 'em-4',
    dimension: 'emerging',
    text: 'How does your security tooling handle novel or AI-generated attack patterns?',
    options: [
      { label: 'Signature-based detection only', score: 1 },
      { label: 'Some behavioural rules in place', score: 2 },
      { label: 'ML-based anomaly detection deployed', score: 3 },
      { label: 'Runtime behavioural baselines catch zero-day patterns automatically', score: 4 },
    ],
  },
]

// ── Scoring ───────────────────────────────────────────────────────────────────

export function computeResults(answers: Record<string, number>): ScanResult {
  const dimensions: DimensionResult[] = DIMENSIONS.map(dim => {
    const qs = QUESTIONS.filter(q => q.dimension === dim.id)
    const total = qs.reduce((sum, q) => sum + (answers[q.id] ?? 1), 0)
    const score = Math.round(((total - qs.length) / (qs.length * 3)) * 100)
    return {
      id:       dim.id,
      score,
      label:    dim.label,
      subtitle: dim.subtitle,
      benchmark: dim.benchmark,
      passes555: score >= 50,
    }
  })

  const overall = Math.round(
    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
  )

  const tier: Tier =
    overall >= 71 ? 'advanced' :
    overall >= 51 ? 'capable'  :
    overall >= 31 ? 'developing' :
    'critical'

  return { overall, tier, dimensions }
}

export const TIER_META: Record<Tier, { label: string; colour: string; description: string }> = {
  critical:   { label: 'Flying Blind',       colour: '#EF4444', description: 'Critical gaps across detection, response, and visibility. Significant exposure to cloud-native threats.' },
  developing: { label: 'Building Foundations', colour: '#F59E0B', description: 'Some controls in place but reactive posture. Threats are likely already inside before you know.' },
  capable:    { label: 'Operationally Capable', colour: '#3B82F6', description: 'Solid baseline with room to close the 555 gap. Targeted improvements will significantly reduce risk.' },
  advanced:   { label: 'Operationally Mature', colour: '#00C58E', description: 'Strong cloud security posture. Focus on maintaining runtime coverage as your environment evolves.' },
}
