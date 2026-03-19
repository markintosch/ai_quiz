// FILE: src/products/cloud_readiness/recommendations.ts
// ─── Cloud Readiness Assessment — recommendation logic ────────────────────────
//
// Returns ordered recommendations based on dimension scores.
// Primary: the lowest-scoring dimension.
// Supporting: the next 2 weakest dimensions.
// CTAs point to TrueFullstaq services / conversations.

import type { DimensionScore } from '@/lib/scoring/engine'
import type { Recommendation } from '@/lib/scoring/recommendations'

const RECOMMENDATION_MAP: Record<string, Omit<Recommendation, 'priority'>> = {
  cloud_strategy: {
    dimension: 'cloud_strategy' as Recommendation['dimension'],
    heading: 'Cloud adoption without a clear business strategy creates waste',
    body: 'Your cloud investment lacks executive alignment or a defined roadmap. Without this, teams optimise locally and costs spiral without delivering business value.',
    cta: 'Book a Cloud Strategy Workshop',
  },
  cloud_adoption: {
    dimension: 'cloud_adoption' as Recommendation['dimension'],
    heading: 'You have room to accelerate your cloud migration',
    body: 'A significant portion of your workloads remain on-premises or are under-optimised for cloud. Identifying quick-win migrations will reduce risk and operational overhead.',
    cta: 'Schedule a Cloud Migration Assessment',
  },
  infrastructure_arch: {
    dimension: 'infrastructure_arch' as Recommendation['dimension'],
    heading: 'Manual infrastructure is slowing you down and increasing risk',
    body: 'Without Infrastructure as Code and modern architecture patterns, your team spends time on repetitive tasks instead of delivering value. Security and reliability gaps are likely.',
    cta: 'Request a Cloud Architecture Review',
  },
  devops_automation: {
    dimension: 'devops_automation' as Recommendation['dimension'],
    heading: 'Your delivery speed is limited by manual processes',
    body: 'Infrequent deployments and manual operations increase risk and slow feedback loops. Investing in CI/CD maturity and platform engineering unlocks developer productivity.',
    cta: 'Explore our DevOps Acceleration Programme',
  },
  security_compliance: {
    dimension: 'security_compliance' as Recommendation['dimension'],
    heading: 'Your cloud environment carries security and compliance exposure',
    body: 'Gaps in IAM, policy enforcement, or incident response create real risk — especially under NIS2 and GDPR. Security controls need to be automated, not manual.',
    cta: 'Book a Cloud Security Posture Review',
  },
  finops_cost: {
    dimension: 'finops_cost' as Recommendation['dimension'],
    heading: 'Your cloud costs are not under control',
    body: 'Limited visibility and weak cost governance mean you are likely overspending by 20–40%. FinOps practices pay for themselves within the first quarter.',
    cta: 'Request a FinOps Quick-Scan',
  },
}

export function generateCloudRecommendations(
  dimensionScores: DimensionScore[],
): Recommendation[] {
  const sorted = [...dimensionScores].sort((a, b) => a.normalized - b.normalized)

  const recommendations: Recommendation[] = []

  for (let i = 0; i < sorted.length; i++) {
    const rec = RECOMMENDATION_MAP[sorted[i].dimension]
    if (!rec) continue
    recommendations.push({
      ...rec,
      priority: i === 0 ? 'primary' : 'supporting',
    })
    if (recommendations.length >= 3) break
  }

  return recommendations
}
