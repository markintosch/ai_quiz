// FILE: src/lib/cycle/stats.ts
// Shared statistics helpers for insights + timeline visualisations.

export function movingAverage(values: number[], window = 5): number[] {
  if (values.length === 0) return []
  const out: number[] = []
  const half = Math.floor(window / 2)
  for (let i = 0; i < values.length; i++) {
    const lo = Math.max(0, i - half)
    const hi = Math.min(values.length, i + half + 1)
    const slice = values.slice(lo, hi)
    out.push(slice.reduce((a, b) => a + b, 0) / slice.length)
  }
  return out
}

export function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n < 5) return 0
  let sumX = 0, sumY = 0
  for (let i = 0; i < n; i++) { sumX += xs[i]; sumY += ys[i] }
  const meanX = sumX / n
  const meanY = sumY / n
  let num = 0, denX = 0, denY = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX
    const dy = ys[i] - meanY
    num  += dx * dy
    denX += dx * dx
    denY += dy * dy
  }
  if (denX === 0 || denY === 0) return 0
  return num / Math.sqrt(denX * denY)
}

export function findOutlierIndex(values: number[]): number {
  if (values.length === 0) return -1
  const ma = movingAverage(values)
  const maxIdx = ma.indexOf(Math.max(...ma))
  const minIdx = ma.indexOf(Math.min(...ma))
  const sorted = [...ma].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  return Math.abs(ma[maxIdx] - median) > Math.abs(median - ma[minIdx]) ? maxIdx : minIdx
}
