export type PlayStyleTag =
  | 'topspin'
  | 'flat'
  | 'aggressiveBaseline'
  | 'defensive'
  | 'serveAndVolley'
  | 'allCourt'

export type SkillLevelTag = 'beginner' | 'intermediate' | 'advanced' | 'pro'

export interface RacketSpecs {
  headSize: number
  weightStrungG: number
  weightUnstrungG?: number
  weightStrungOz?: number
  balancePts?: number
  balanceMm?: number
  swingWeight?: number
  beamWidth?: string
  tipShaft?: string
  mains: number
  crosses: number
  mainSkip?: string
  stiffness?: number
  composition?: string
  powerLevel?: 'Low' | 'Low-Medium' | 'Medium' | 'Medium-High' | 'High'
  stringTension?: string
  gripSizes?: string[]
  length?: number
}

export interface Racket {
  id: string
  meta: {
    brand: string
    model: string
    year: number
    series?: string
    priceRange?: 'budget' | 'mid' | 'high' | 'premium'
    imageUrl?: string
    sources?: string[]
  }
  specs: RacketSpecs
  playStyle: { tag: PlayStyleTag; fit: number }[]
  skillLevel: {
    levels: SkillLevelTag[]
    requirement: { power: number; controlSkill: number; physical: number }
  }
  experience: {
    comfort: number
    maneuverability: number
    forgiveness: number
    power: number
    control: number
    spinPotential: number
  }
  notes?: string
  verified?: boolean
}

export const PLAY_STYLE_LABELS: Record<PlayStyleTag, string> = {
  topspin: '上旋型',
  flat: '平击型',
  aggressiveBaseline: '底线进攻',
  defensive: '防守反击',
  serveAndVolley: '发球上网',
  allCourt: '全场型',
}

export const SKILL_LEVEL_LABELS: Record<SkillLevelTag, string> = {
  beginner: '初学',
  intermediate: '进阶',
  advanced: '高阶',
  pro: '职业',
}

export const EXPERIENCE_LABELS: Record<keyof Racket['experience'], string> = {
  comfort: '舒适度',
  maneuverability: '操控性',
  forgiveness: '容错性',
  power: '力量',
  control: '控制',
  spinPotential: '旋转',
}
