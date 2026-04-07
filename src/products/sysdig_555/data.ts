/**
 * Sysdig 555 Challenge — Cloud Security Knowledge Time Trial
 * ─────────────────────────────────────────────────────────────────────────────
 * 30 questions in pool. Each run = 10 randomly selected questions.
 * Phase 1 (Q1-3): Entry    | Phase 2 (Q4-7): Analyst | Phase 3 (Q8-10): Expert
 *
 * Timing:
 *   - 15 seconds per question (tighter than F1 — security demands speed)
 *   - Wrong answer or timeout: +10 000 ms penalty (a missed alert costs time)
 *   - Total time = sum of all 10 question times
 *   - Format: M:SS.mmm
 */

export type Difficulty = 'entry' | 'analyst' | 'expert'

export interface GameQuestion {
  id:          string
  text:        string
  options:     { value: string; label: string }[]
  correct:     string
  difficulty:  Difficulty
  topic:       string
  explanation: string
}

export interface QuestionResult {
  questionId:  string
  timeMsRaw:   number   // actual ms taken (15 000 if timed out)
  timeMsTotal: number   // + 10 000 ms penalty if wrong/timeout
  correct:     boolean
  timedOut:    boolean
  answer:      string | null
}

export interface GameRun {
  name:       string
  email:      string
  questions:  QuestionResult[]
  totalMs:    number
  timeStr:    string
  rank?:      number
  topTime?:   number
}

// ── Constants ──────────────────────────────────────────────────────────────────
export const TIME_PER_Q_MS  = 15_000
export const PENALTY_MS     = 10_000
export const QUESTIONS_PER_RUN = 10

// ── Phases (like F1 sectors but security-themed) ──────────────────────────────
export function getPhase(index: number): 1 | 2 | 3 {
  if (index <= 2) return 1
  if (index <= 6) return 2
  return 3
}

export const PHASE_LABELS: Record<1 | 2 | 3, string> = {
  1: 'Entry — Fundamentals',
  2: 'Analyst — Cloud & Container',
  3: 'Expert — Advanced',
}

// ── Tier labels (map to 555 assessment tiers) ─────────────────────────────────
export function getTier(totalMs: number): { label: string; colour: string } {
  if (totalMs < 40_000)  return { label: 'Operationally Mature',   colour: '#00C58E' }
  if (totalMs < 70_000)  return { label: 'Operationally Capable',  colour: '#3B82F6' }
  if (totalMs < 100_000) return { label: 'Building Foundations',   colour: '#F59E0B' }
  return                        { label: 'Flying Blind',           colour: '#EF4444' }
}

// ── Timing helpers ─────────────────────────────────────────────────────────────
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes      = Math.floor(totalSeconds / 60)
  const seconds      = totalSeconds % 60
  const millis       = ms % 1000
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`
}

export function computeTotalMs(questions: QuestionResult[]): number {
  return questions.reduce((sum, q) => sum + q.timeMsTotal, 0)
}

export function scoreQuestion(timeMsRaw: number, correct: boolean, timedOut: boolean): number {
  const base    = Math.min(timeMsRaw, TIME_PER_Q_MS)
  const penalty = (!correct || timedOut) ? PENALTY_MS : 0
  return base + penalty
}

// ── Question bank ──────────────────────────────────────────────────────────────

const ENTRY: GameQuestion[] = [
  {
    id: 'e1', difficulty: 'entry', topic: '555 Benchmark',
    text: 'According to the Sysdig 555 Benchmark, what is the target time to detect a cloud threat?',
    options: [{ value: 'a', label: '5 seconds' }, { value: 'b', label: '30 seconds' }, { value: 'c', label: '5 minutes' }, { value: 'd', label: '1 minute' }],
    correct: 'a',
    explanation: 'The 555 benchmark: 5 seconds to detect, 5 minutes to triage, 5 minutes to respond. Industry average MTTD is ~6 days — a 100,000x gap.',
  },
  {
    id: 'e2', difficulty: 'entry', topic: 'Incident Response',
    text: 'What does MTTD stand for in security operations?',
    options: [{ value: 'a', label: 'Maximum Threat to Data' }, { value: 'b', label: 'Mean Time to Detect' }, { value: 'c', label: 'Minimum Threat Detection Duration' }, { value: 'd', label: 'Mean Time to Deploy' }],
    correct: 'b',
    explanation: 'MTTD = Mean Time to Detect — a core SOC metric measuring how long between a threat occurring and it being identified.',
  },
  {
    id: 'e3', difficulty: 'entry', topic: 'Security Basics',
    text: 'What does SOC stand for in cybersecurity?',
    options: [{ value: 'a', label: 'System Operations Core' }, { value: 'b', label: 'Security Operations Centre' }, { value: 'c', label: 'Software Oversight Committee' }, { value: 'd', label: 'Secure Orchestration Core' }],
    correct: 'b',
    explanation: 'A Security Operations Centre (SOC) is the team responsible for monitoring, detecting, and responding to threats in real time.',
  },
  {
    id: 'e4', difficulty: 'entry', topic: 'Sysdig Open Source',
    text: 'Which open-source CNCF project did Sysdig create for cloud-native runtime threat detection?',
    options: [{ value: 'a', label: 'Trivy' }, { value: 'b', label: 'OPA' }, { value: 'c', label: 'Falco' }, { value: 'd', label: 'Tetragon' }],
    correct: 'c',
    explanation: 'Falco is the open-source runtime security engine created by Sysdig. It detects anomalous behaviour using kernel syscalls and is a CNCF Graduated project.',
  },
  {
    id: 'e5', difficulty: 'entry', topic: 'Runtime Security',
    text: 'What does runtime security protect that image scanning alone cannot?',
    options: [{ value: 'a', label: 'Known CVEs in base images' }, { value: 'b', label: 'Source code vulnerabilities' }, { value: 'c', label: 'Attacks active in running containers — zero-days, process injection, credential theft' }, { value: 'd', label: 'Misconfigured cloud storage buckets' }],
    correct: 'c',
    explanation: 'Image scanning catches known vulnerabilities before deployment. Runtime security detects attacks happening live — including zero-days and techniques that leave no CVE to scan for.',
  },
  {
    id: 'e6', difficulty: 'entry', topic: 'Attack Techniques',
    text: 'In a cloud attack kill chain, what is "lateral movement"?',
    options: [{ value: 'a', label: 'Exfiltrating data from a cloud bucket' }, { value: 'b', label: 'Moving from one compromised resource to access others' }, { value: 'c', label: 'Escalating container privileges to root' }, { value: 'd', label: 'Deleting logs to cover tracks' }],
    correct: 'b',
    explanation: 'Lateral movement is when an attacker uses their initial foothold to pivot to other systems, accounts, or services — expanding blast radius.',
  },
  {
    id: 'e7', difficulty: 'entry', topic: 'Security Basics',
    text: 'What is a "zero-day" vulnerability?',
    options: [{ value: 'a', label: 'A vulnerability patched within 24 hours' }, { value: 'b', label: 'An unknown flaw with no patch available yet' }, { value: 'c', label: 'A vulnerability rated zero severity' }, { value: 'd', label: 'A flaw discovered at product launch' }],
    correct: 'b',
    explanation: 'A zero-day is unknown or unpatched — the vendor has had zero days to fix it. This is why runtime detection matters beyond vulnerability scanning.',
  },
  {
    id: 'e8', difficulty: 'entry', topic: 'Cloud Threats',
    text: 'What is the most common initial access vector in cloud-native attacks?',
    options: [{ value: 'a', label: 'Exploiting a kernel CVE' }, { value: 'b', label: 'Phishing the cloud admin' }, { value: 'c', label: 'Compromised or stolen credentials' }, { value: 'd', label: 'Unpatched container image' }],
    correct: 'c',
    explanation: 'Compromised credentials — from exposed API keys, misconfigured IAM, or stolen tokens — are the leading cloud attack entry point according to Sysdig research.',
  },
  {
    id: 'e9', difficulty: 'entry', topic: 'Technology',
    text: 'What does eBPF stand for?',
    options: [{ value: 'a', label: 'Extended Binary Packet Filter' }, { value: 'b', label: 'Enhanced Bytecode Processing Framework' }, { value: 'c', label: 'Extended Berkeley Packet Filter' }, { value: 'd', label: 'Enterprise Baseline Packet Firewall' }],
    correct: 'c',
    explanation: 'eBPF (Extended Berkeley Packet Filter) allows programs to run safely in the Linux kernel — giving deep visibility without kernel modules or agents.',
  },
  {
    id: 'e10', difficulty: 'entry', topic: 'Compliance',
    text: 'What is the primary focus of the EU NIS2 Directive?',
    options: [{ value: 'a', label: 'Data privacy and personal data processing' }, { value: 'b', label: 'Cybersecurity requirements for critical infrastructure and essential services' }, { value: 'c', label: 'Cookie consent and tracking transparency' }, { value: 'd', label: 'AI system transparency and bias auditing' }],
    correct: 'b',
    explanation: 'NIS2 mandates cybersecurity risk management, incident reporting, and supply chain security for organisations in critical sectors across the EU.',
  },
]

const ANALYST: GameQuestion[] = [
  {
    id: 'm1', difficulty: 'analyst', topic: 'Technology',
    text: 'Why is eBPF preferred over traditional kernel modules for runtime security?',
    options: [{ value: 'a', label: 'It uses less CPU' }, { value: 'b', label: 'It can be loaded without rebooting' }, { value: 'c', label: 'It runs safely in the kernel — a bug can\'t crash the host' }, { value: 'd', label: 'It works across Windows and Linux equally' }],
    correct: 'c',
    explanation: 'eBPF programs are verified by the kernel before execution. A buggy eBPF program is rejected rather than crashing the kernel — unlike kernel modules which have no safety net.',
  },
  {
    id: 'm2', difficulty: 'analyst', topic: 'Container Security',
    text: 'What is a "container escape" attack?',
    options: [{ value: 'a', label: 'A container consuming all available memory' }, { value: 'b', label: 'An attacker breaking out of container isolation to access the host' }, { value: 'c', label: 'A pod being evicted from its node' }, { value: 'd', label: 'A container image deleted from registry' }],
    correct: 'b',
    explanation: 'A container escape exploits vulnerabilities in container runtimes or misconfigurations (e.g., privileged containers) to gain access to the underlying host OS and beyond.',
  },
  {
    id: 'm3', difficulty: 'analyst', topic: 'Frameworks',
    text: 'What does the MITRE ATT&CK for Cloud framework document?',
    options: [{ value: 'a', label: 'Security patch compliance requirements' }, { value: 'b', label: 'Adversary tactics, techniques and procedures targeting cloud environments' }, { value: 'c', label: 'Cloud provider SLA obligations' }, { value: 'd', label: 'Vulnerability severity scoring standards' }],
    correct: 'b',
    explanation: 'MITRE ATT&CK for Cloud catalogs known attacker behaviours specific to AWS, GCP, Azure, Kubernetes, and SaaS environments.',
  },
  {
    id: 'm4', difficulty: 'analyst', topic: 'Container Security',
    text: 'What is "container drift" in runtime security?',
    options: [{ value: 'a', label: 'A container moving between nodes' }, { value: 'b', label: 'A new executable appearing in a running container not present in the original image' }, { value: 'c', label: 'Configuration divergence between dev and prod' }, { value: 'd', label: 'Container resource limits changing dynamically' }],
    correct: 'b',
    explanation: 'Drift detection alerts when a running container\'s filesystem changes from its immutable image — a strong signal of compromise or malicious tooling being dropped.',
  },
  {
    id: 'm5', difficulty: 'analyst', topic: 'Cloud Security',
    text: 'What is the key difference between CSPM and CWPP?',
    options: [{ value: 'a', label: 'CSPM is for containers; CWPP is for VMs' }, { value: 'b', label: 'CSPM protects configurations and posture; CWPP protects running workloads' }, { value: 'c', label: 'CSPM is a Sysdig product; CWPP is from CrowdStrike' }, { value: 'd', label: 'No meaningful difference — same category' }],
    correct: 'b',
    explanation: 'CSPM = Cloud Security Posture Management (configuration, compliance). CWPP = Cloud Workload Protection Platform (runtime protection of actual workloads).',
  },
  {
    id: 'm6', difficulty: 'analyst', topic: 'Kubernetes',
    text: 'In Kubernetes, what does etcd store?',
    options: [{ value: 'a', label: 'Container images and layers' }, { value: 'b', label: 'Runtime logs and audit events' }, { value: 'c', label: 'The entire cluster state — all objects and configurations' }, { value: 'd', label: 'Network routing tables for pods' }],
    correct: 'c',
    explanation: 'etcd is Kubernetes\'s key-value store holding all cluster state: deployments, secrets, RBAC policies. Compromise of etcd = total cluster compromise.',
  },
  {
    id: 'm7', difficulty: 'analyst', topic: 'Attack Techniques',
    text: 'What is a software supply chain attack in cloud-native context?',
    options: [{ value: 'a', label: 'Attacking the CI/CD pipeline or dependencies to inject malicious code before deployment' }, { value: 'b', label: 'Intercepting container network traffic' }, { value: 'c', label: 'Overloading a cloud service to cause resource exhaustion' }, { value: 'd', label: 'Stealing cloud API keys from the console' }],
    correct: 'a',
    explanation: 'Supply chain attacks target the software delivery pipeline — poisoning dependencies, CI/CD systems, or base images so malicious code ships in "legitimate" software.',
  },
  {
    id: 'm8', difficulty: 'analyst', topic: 'Container Security',
    text: 'Why is a privileged container a critical security risk in Kubernetes?',
    options: [{ value: 'a', label: 'It uses more CPU and memory' }, { value: 'b', label: 'It bypasses network policies' }, { value: 'c', label: 'It has full host kernel and filesystem access — equivalent to root on the node' }, { value: 'd', label: 'It cannot be stopped by the kubelet' }],
    correct: 'c',
    explanation: 'A privileged container runs with all Linux capabilities and host access — an attacker inside can trivially escape to the node and potentially own the entire cluster.',
  },
  {
    id: 'm9', difficulty: 'analyst', topic: 'Image Security',
    text: 'What is the fundamental limitation of container image scanning as a sole security strategy?',
    options: [{ value: 'a', label: 'Too slow for CI/CD pipelines' }, { value: 'b', label: 'It only catches known CVEs — does nothing against runtime attacks or zero-days' }, { value: 'c', label: 'Cannot scan private registry images' }, { value: 'd', label: 'Too many false positives' }],
    correct: 'b',
    explanation: 'Image scanning catches known vulnerabilities at build time. Attackers increasingly use zero-days, stolen credentials, and living-off-the-land techniques with no CVE to scan for.',
  },
  {
    id: 'm10', difficulty: 'analyst', topic: '555 Benchmark',
    text: 'In the 555 framework, what happens if you can\'t contain a threat within 5 minutes of triage?',
    options: [{ value: 'a', label: 'The attacker\'s tools become less effective' }, { value: 'b', label: 'Nothing significant — most attacks take hours' }, { value: 'c', label: 'The attacker achieves full lateral movement and persistence before containment' }, { value: 'd', label: 'Compliance frameworks automatically flag the incident' }],
    correct: 'c',
    explanation: 'Cloud attacks can complete in under 10 minutes. A response taking longer than 5 minutes gives attackers time to move laterally and establish persistence — dramatically expanding blast radius.',
  },
]

const EXPERT: GameQuestion[] = [
  {
    id: 'h1', difficulty: 'expert', topic: 'Technology',
    text: 'Which syscall pattern in a container is a strong indicator of a container escape attempt?',
    options: [{ value: 'a', label: 'read() on a large file' }, { value: 'b', label: 'ptrace() against a host PID or accessing /proc/1/ns' }, { value: 'c', label: 'fork() spawning more than 10 child processes' }, { value: 'd', label: 'connect() to an external IP address' }],
    correct: 'b',
    explanation: 'ptrace on host PIDs and accessing /proc/1/ns are classic container escape patterns. Falco ships default rules that watch for these specific syscall behaviours.',
  },
  {
    id: 'h2', difficulty: 'expert', topic: 'Sysdig',
    text: 'In Falco, what format are detection rules written in?',
    options: [{ value: 'a', label: 'Rego (used by OPA)' }, { value: 'b', label: 'CEL (Common Expression Language)' }, { value: 'c', label: 'YAML with Falco filter syntax — condition fields like proc.name and fd.name' }, { value: 'd', label: 'Lua scripting language' }],
    correct: 'c',
    explanation: 'Falco rules are YAML files with a condition field using Sysdig\'s filter syntax (e.g., proc.name = "bash" and container.id != host). Readable, auditable, and version-controlled.',
  },
  {
    id: 'h3', difficulty: 'expert', topic: 'Threat Intelligence',
    text: 'According to Sysdig\'s 2025 Cloud-Native Security Report, how fast can attackers move from initial access to full impact?',
    options: [{ value: 'a', label: 'Under 10 minutes' }, { value: 'b', label: '1–4 hours' }, { value: 'c', label: '24–48 hours' }, { value: 'd', label: 'Several days' }],
    correct: 'a',
    explanation: 'Sysdig research found attackers can move from initial access to full impact in under 10 minutes in cloud environments — which is exactly why the 5-5-5 targets exist.',
  },
  {
    id: 'h4', difficulty: 'expert', topic: 'Cloud Threats',
    text: 'What is "crypto-jacking" in a cloud-native context?',
    options: [{ value: 'a', label: 'Stealing cryptographic keys from a key management service' }, { value: 'b', label: 'Hijacking compromised cloud compute resources to mine cryptocurrency at the victim\'s expense' }, { value: 'c', label: 'Decrypting TLS traffic in a service mesh' }, { value: 'd', label: 'Brute-forcing a JWT signing secret' }],
    correct: 'b',
    explanation: 'Crypto-jacking is one of the most common cloud attacks. Runtime tools detect the mining process spawning — a new executable not present in the original container image.',
  },
  {
    id: 'h5', difficulty: 'expert', topic: 'Security Strategy',
    text: 'What does "shift left" mean in cloud-native security — and what does it NOT replace?',
    options: [{ value: 'a', label: 'Moving security ops to a different time zone' }, { value: 'b', label: 'It replaces runtime security with static analysis' }, { value: 'c', label: 'Integrating security at build/code time — but it does not replace runtime detection' }, { value: 'd', label: 'Prioritising perimeter security over workload protection' }],
    correct: 'c',
    explanation: 'Shift left catches issues earlier in the pipeline — but zero-days and living-off-the-land attacks evade build-time checks entirely. You need both shift left and runtime.',
  },
  {
    id: 'h6', difficulty: 'expert', topic: 'Kubernetes',
    text: 'Which Kubernetes mechanism enforces security policies before a pod is created?',
    options: [{ value: 'a', label: 'NetworkPolicy' }, { value: 'b', label: 'ValidatingWebhookConfiguration or MutatingWebhookConfiguration' }, { value: 'c', label: 'RBAC ClusterRole' }, { value: 'd', label: 'ResourceQuota' }],
    correct: 'b',
    explanation: 'Admission webhooks fire before objects are persisted in etcd. OPA/Gatekeeper and Kyverno use them to enforce policies like "no privileged containers" or "required security labels".',
  },
  {
    id: 'h7', difficulty: 'expert', topic: 'Sysdig',
    text: 'Falco reached which CNCF maturity level in 2024?',
    options: [{ value: 'a', label: 'Sandbox' }, { value: 'b', label: 'Incubating' }, { value: 'c', label: 'Graduated' }, { value: 'd', label: 'Archived' }],
    correct: 'c',
    explanation: 'Falco achieved CNCF Graduated status in 2024 — the highest maturity level, alongside Kubernetes, Prometheus, and Argo. This validates it as production-ready security infrastructure.',
  },
  {
    id: 'h8', difficulty: 'expert', topic: 'Attack Techniques',
    text: 'Which attack technique is hardest to detect without runtime behavioural visibility?',
    options: [{ value: 'a', label: 'Initial access via a known CVE' }, { value: 'b', label: 'Living-off-the-land — using legitimate binaries already on the system' }, { value: 'c', label: 'Port scanning the internal network' }, { value: 'd', label: 'Downloading a known malware binary' }],
    correct: 'b',
    explanation: '"Living off the land" uses legitimate tools (curl, python, cloud CLIs) already present — no malicious binary to scan for. Only behavioural detection catches process chains and abnormal usage.',
  },
  {
    id: 'h9', difficulty: 'expert', topic: 'Kubernetes',
    text: 'A compromised pod with a cluster-admin service account token — what is the blast radius?',
    options: [{ value: 'a', label: 'Limited to the pod\'s own namespace' }, { value: 'b', label: 'Limited to the node the pod runs on' }, { value: 'c', label: 'Full cluster compromise — create/exec/delete any resource across all namespaces' }, { value: 'd', label: 'Limited to reading secrets in the current namespace' }],
    correct: 'c',
    explanation: 'cluster-admin is the most privileged Kubernetes role. A compromised workload with this token can read all secrets, spawn pods, exec into any container, and fully own the cluster.',
  },
  {
    id: 'h10', difficulty: 'expert', topic: '555 Benchmark',
    text: 'If industry average MTTD is ~6 days, what is the 555 Benchmark\'s detection target — and by what factor is it faster?',
    options: [{ value: 'a', label: '5 minutes — 1,700× faster' }, { value: 'b', label: '1 hour — 144× faster' }, { value: 'c', label: '5 seconds — over 100,000× faster' }, { value: 'd', label: '5 hours — 28× faster' }],
    correct: 'c',
    explanation: 'The 555 target is 5 seconds detection vs. a 6-day industry average — a >100,000× improvement. Cloud attackers operate in minutes, not days. The gap is the problem.',
  },
]

export const ALL_QUESTIONS: GameQuestion[] = [...ENTRY, ...ANALYST, ...EXPERT]

// ── Game builder: picks 3 entry + 4 analyst + 3 expert ────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildGame(): GameQuestion[] {
  return [
    ...shuffle(ENTRY).slice(0, 3),
    ...shuffle(ANALYST).slice(0, 4),
    ...shuffle(EXPERT).slice(0, 3),
  ]
}
