export const STATS_KEY = 'hastmatte-stats-v1'

export interface AppStats {
  /** Samlade morötter (lätta belöningar). */
  carrots: number
  completedRounds: number
}

export const defaultStats: AppStats = {
  carrots: 0,
  completedRounds: 0,
}

export function loadStats(): AppStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return { ...defaultStats }
    const p = JSON.parse(raw) as Partial<AppStats>
    return {
      carrots: Math.max(0, Number(p.carrots ?? 0)),
      completedRounds: Math.max(0, Number(p.completedRounds ?? 0)),
    }
  } catch {
    return { ...defaultStats }
  }
}

export function saveStats(s: AppStats): void {
  localStorage.setItem(STATS_KEY, JSON.stringify(s))
}

export function addRoundReward(stars: 1 | 2 | 3): AppStats {
  const prev = loadStats()
  const next: AppStats = {
    carrots: prev.carrots + stars,
    completedRounds: prev.completedRounds + 1,
  }
  saveStats(next)
  return next
}
