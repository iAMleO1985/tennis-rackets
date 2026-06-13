import type { PlayStyleTag, Racket, SkillLevelTag } from './types'

export interface Prefs {
  level: SkillLevelTag | null
  style: PlayStyleTag | null
  /** 偏好倾向，各 0–5，表示用户希望该属性越高越好 */
  power: number
  control: number
  comfort: number
}

export interface Scored {
  racket: Racket
  score: number // 0–100
  reasons: string[]
}

const LEVEL_ORDER: SkillLevelTag[] = ['beginner', 'intermediate', 'advanced', 'pro']

/**
 * 打分模型（总分 100）：
 *  - 水平契合 35：完全命中满分；相邻档位按距离衰减；不匹配且要求过高则重罚
 *  - 打法契合 30：用球拍对该打法的 fit(0-5) 线性映射
 *  - 偏好契合 35：力量/控制/舒适三项，用户倾向与球拍体验值的接近度
 */
export function scoreRacket(r: Racket, p: Prefs): Scored {
  const reasons: string[] = []
  let score = 0

  // ---- 水平契合 (35) ----
  if (p.level) {
    const userIdx = LEVEL_ORDER.indexOf(p.level)
    const dists = r.skillLevel.levels.map((l) => Math.abs(LEVEL_ORDER.indexOf(l) - userIdx))
    const minDist = Math.min(...dists)
    if (minDist === 0) {
      score += 35
      reasons.push('正好契合你的水平')
    } else if (minDist === 1) {
      score += 22
      reasons.push('与你的水平接近')
    } else {
      score += 8
      // 球拍要求高于用户水平较多时，提示门槛
      const minRacketIdx = Math.min(...r.skillLevel.levels.map((l) => LEVEL_ORDER.indexOf(l)))
      if (minRacketIdx > userIdx + 1) reasons.push('上手门槛偏高，需一定技术')
    }
  } else {
    score += 20 // 未选水平，给中性分
  }

  // ---- 打法契合 (30) ----
  if (p.style) {
    const match = r.playStyle.find((s) => s.tag === p.style)
    const fit = match?.fit ?? 0
    score += (fit / 5) * 30
    if (fit >= 4) reasons.push('非常适合你的打法')
    else if (fit >= 3) reasons.push('适合你的打法')
    else if (fit === 0) reasons.push('不太契合该打法')
  } else {
    score += 18
  }

  // ---- 偏好契合 (35) ----
  // 每项满分 ~11.67：倾向越高、球拍对应体验越高，得分越高
  const prefItems: { want: number; have: number; label: string }[] = [
    { want: p.power, have: r.experience.power, label: '力量' },
    { want: p.control, have: r.experience.control, label: '控制' },
    { want: p.comfort, have: r.experience.comfort, label: '舒适' },
  ]
  const per = 35 / prefItems.length
  for (const { want, have, label } of prefItems) {
    if (want <= 1) {
      // 用户不在意该项 → 不影响（给基准分一半）
      score += per * 0.6
      continue
    }
    // 接近度：|want - have| 越小越好
    const closeness = 1 - Math.abs(want - have) / 5
    score += per * Math.max(0, closeness)
    if (want >= 4 && have >= 4) reasons.push(`${label}出色`)
  }

  return { racket: r, score: Math.round(Math.min(100, score)), reasons }
}

export function recommend(rackets: Racket[], p: Prefs, topN = 6): Scored[] {
  return rackets
    .map((r) => scoreRacket(r, p))
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
}
