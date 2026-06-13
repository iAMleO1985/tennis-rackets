import { useMemo, useState } from 'react'
import { rackets } from './data'
import type { PlayStyleTag, Racket, SkillLevelTag } from './types'
import {
  EXPERIENCE_LABELS,
  PLAY_STYLE_LABELS,
  SKILL_LEVEL_LABELS,
} from './types'
import RadarChart from './RadarChart'
import RecommendView from './RecommendView'

const COMPARE_COLORS = ['#2563eb', '#dc2626', '#16a34a', '#9333ea']
const MAX_COMPARE = 4

type RangeKey = 'headSize' | 'weightStrungG' | 'stiffness'
const RANGE_DEFS: { key: RangeKey; label: string; min: number; max: number; unit: string }[] = [
  { key: 'headSize', label: '拍面', min: 95, max: 120, unit: 'sq in' },
  { key: 'weightStrungG', label: '穿线重量', min: 250, max: 340, unit: 'g' },
  { key: 'stiffness', label: '硬度 RA', min: 50, max: 75, unit: '' },
]

export default function App() {
  const [brands, setBrands] = useState<Set<string>>(new Set())
  const [levels, setLevels] = useState<Set<SkillLevelTag>>(new Set())
  const [styles, setStyles] = useState<Set<PlayStyleTag>>(new Set())
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [ranges, setRanges] = useState<Record<RangeKey, [number, number]>>({
    headSize: [95, 120],
    weightStrungG: [250, 340],
    stiffness: [50, 75],
  })
  const [compare, setCompare] = useState<string[]>([])
  const [detail, setDetail] = useState<Racket | null>(null)
  const [view, setView] = useState<'browse' | 'recommend'>('browse')

  const allBrands = useMemo(
    () => [...new Set(rackets.map((r) => r.meta.brand))].sort(),
    [],
  )

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set)
    next.has(value) ? next.delete(value) : next.add(value)
    return next
  }

  const filtered = useMemo(() => {
    return rackets.filter((r) => {
      if (brands.size && !brands.has(r.meta.brand)) return false
      if (verifiedOnly && !r.verified) return false
      if (levels.size && !r.skillLevel.levels.some((l) => levels.has(l))) return false
      if (styles.size && !r.playStyle.some((p) => styles.has(p.tag))) return false
      for (const { key } of RANGE_DEFS) {
        const v = r.specs[key]
        if (v == null) continue
        const [lo, hi] = ranges[key]
        if (v < lo || v > hi) return false
      }
      return true
    })
  }, [brands, levels, styles, verifiedOnly, ranges])

  const compareRackets = compare
    .map((id) => rackets.find((r) => r.id === id))
    .filter(Boolean) as Racket[]

  const toggleCompare = (id: string) => {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, id]
    })
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-900">网球拍分析与查询</h1>
          <nav className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <Tab active={view === 'browse'} onClick={() => setView('browse')}>查询筛选</Tab>
            <Tab active={view === 'recommend'} onClick={() => setView('recommend')}>智能推荐</Tab>
          </nav>
          {view === 'browse' && (
            <span className="text-sm text-slate-500 ml-auto">
              共 {rackets.length} 支 · 当前筛出 {filtered.length} 支
            </span>
          )}
        </div>
      </header>

      {view === 'recommend' ? (
        <RecommendView onOpen={setDetail} />
      ) : (
      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* ---------- 筛选侧栏 ---------- */}
        <aside className="w-64 shrink-0 space-y-6">
          <FilterGroup title="品牌">
            <div className="flex flex-wrap gap-2">
              {allBrands.map((b) => (
                <Chip key={b} active={brands.has(b)} onClick={() => setBrands(toggle(brands, b))}>
                  {b}
                </Chip>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="球员水平">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SKILL_LEVEL_LABELS) as SkillLevelTag[]).map((l) => (
                <Chip key={l} active={levels.has(l)} onClick={() => setLevels(toggle(levels, l))}>
                  {SKILL_LEVEL_LABELS[l]}
                </Chip>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title="适合打法">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PLAY_STYLE_LABELS) as PlayStyleTag[]).map((s) => (
                <Chip key={s} active={styles.has(s)} onClick={() => setStyles(toggle(styles, s))}>
                  {PLAY_STYLE_LABELS[s]}
                </Chip>
              ))}
            </div>
          </FilterGroup>

          {RANGE_DEFS.map(({ key, label, min, max, unit }) => (
            <FilterGroup key={key} title={`${label}（${ranges[key][0]}–${ranges[key][1]} ${unit}）`}>
              <div className="space-y-2">
                <input
                  type="range" min={min} max={max} value={ranges[key][0]}
                  onChange={(e) =>
                    setRanges((p) => ({ ...p, [key]: [Math.min(+e.target.value, p[key][1]), p[key][1]] }))
                  }
                  className="w-full"
                />
                <input
                  type="range" min={min} max={max} value={ranges[key][1]}
                  onChange={(e) =>
                    setRanges((p) => ({ ...p, [key]: [p[key][0], Math.max(+e.target.value, p[key][0])] }))
                  }
                  className="w-full"
                />
              </div>
            </FilterGroup>
          ))}

          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
            仅显示已校验数据
          </label>
        </aside>

        {/* ---------- 结果列表 ---------- */}
        <main className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
          {filtered.map((r) => (
            <RacketCard
              key={r.id}
              racket={r}
              checked={compare.includes(r.id)}
              disabled={!compare.includes(r.id) && compare.length >= MAX_COMPARE}
              onToggle={() => toggleCompare(r.id)}
              onOpen={() => setDetail(r)}
            />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-slate-400 text-sm py-12 text-center">没有匹配的球拍，放宽筛选条件试试。</p>
          )}
        </main>
      </div>
      )}

      {/* ---------- 对比浮条 ---------- */}
      {compareRackets.length > 0 && (
        <CompareBar
          rackets={compareRackets}
          onClear={() => setCompare([])}
          onRemove={(id) => toggleCompare(id)}
        />
      )}

      {detail && <DetailModal racket={detail} onClose={() => setDetail(null)} />}
    </div>
  )
}

/* ============ 子组件 ============ */

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-sm font-medium transition ${
        active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
    </button>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs border transition ${
        active
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400'
      }`}
    >
      {children}
    </button>
  )
}

function RacketCard({
  racket: r, checked, disabled, onToggle, onOpen,
}: {
  racket: Racket; checked: boolean; disabled: boolean; onToggle: () => void; onOpen: () => void
}) {
  const topStyle = [...r.playStyle].sort((a, b) => b.fit - a.fit)[0]
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <button onClick={onOpen} className="text-left">
          <div className="font-semibold text-slate-900 leading-tight hover:text-blue-600">{r.meta.brand} {r.meta.model}</div>
          <div className="text-xs text-slate-400">{r.meta.year} · {r.meta.series}</div>
        </button>
        {r.verified
          ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 shrink-0">已校验</span>
          : <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 shrink-0">近似</span>}
      </div>

      <div className="grid grid-cols-3 gap-y-1.5 text-xs text-slate-600">
        <Spec label="拍面" value={`${r.specs.headSize}`} />
        <Spec label="重量" value={`${r.specs.weightStrungG}g`} />
        <Spec label="硬度" value={`${r.specs.stiffness ?? '-'}`} />
        <Spec label="挥重" value={`${r.specs.swingWeight ?? '-'}`} />
        <Spec label="弦床" value={`${r.specs.mains}×${r.specs.crosses}`} />
        <Spec label="力量" value={r.specs.powerLevel ?? '-'} />
      </div>

      <div className="flex flex-wrap gap-1">
        <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700">{PLAY_STYLE_LABELS[topStyle.tag]}</span>
        {r.skillLevel.levels.map((l) => (
          <span key={l} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">{SKILL_LEVEL_LABELS[l]}</span>
        ))}
      </div>

      <label className={`mt-auto flex items-center gap-2 text-xs ${disabled ? 'text-slate-300' : 'text-slate-600 cursor-pointer'}`}>
        <input type="checkbox" checked={checked} disabled={disabled} onChange={onToggle} />
        加入对比
      </label>
    </div>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-slate-400">{label} </span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function CompareBar({ rackets: rs, onClear, onRemove }: { rackets: Racket[]; onClear: () => void; onRemove: (id: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 shadow-lg z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">对比 ({rs.length}/{MAX_COMPARE})：</span>
          <div className="flex gap-2 flex-1 overflow-x-auto">
            {rs.map((r, i) => (
              <span key={r.id} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full text-white shrink-0" style={{ background: COMPARE_COLORS[i] }}>
                {r.meta.model}
                <button onClick={() => onRemove(r.id)} className="ml-1 opacity-80 hover:opacity-100">×</button>
              </span>
            ))}
          </div>
          <button onClick={() => setOpen(true)} className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white">查看对比</button>
          <button onClick={onClear} className="text-sm px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600">清空</button>
        </div>
      </div>
      {open && <CompareModal rackets={rs} onClose={() => setOpen(false)} />}
    </>
  )
}

const COMPARE_ROWS: { label: string; get: (r: Racket) => string | number | undefined; numeric?: boolean }[] = [
  { label: '拍面 (sq in)', get: (r) => r.specs.headSize, numeric: true },
  { label: '穿线重量 (g)', get: (r) => r.specs.weightStrungG, numeric: true },
  { label: '平衡 (pts)', get: (r) => r.specs.balancePts, numeric: true },
  { label: '挥重', get: (r) => r.specs.swingWeight, numeric: true },
  { label: '硬度 RA', get: (r) => r.specs.stiffness, numeric: true },
  { label: '拍框 (mm)', get: (r) => r.specs.beamWidth },
  { label: '弦床', get: (r) => `${r.specs.mains}×${r.specs.crosses}` },
  { label: '材质', get: (r) => r.specs.composition },
  { label: '力量等级', get: (r) => r.specs.powerLevel },
  { label: '推荐磅数', get: (r) => r.specs.stringTension },
]

function CompareModal({ rackets: rs, onClose }: { rackets: Racket[]; onClose: () => void }) {
  return (
    <Modal onClose={onClose} wide>
      <h2 className="text-lg font-bold mb-4">球拍对比</h2>
      <div className="flex gap-8 flex-wrap">
        <table className="text-sm border-collapse flex-1 min-w-[420px]">
          <thead>
            <tr>
              <th className="text-left text-slate-400 font-normal p-2"></th>
              {rs.map((r, i) => (
                <th key={r.id} className="p-2 text-left">
                  <span className="inline-block w-2 h-2 rounded-full mr-1 align-middle" style={{ background: COMPARE_COLORS[i] }} />
                  {r.meta.brand}<br />{r.meta.model}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ROWS.map((row) => {
              const vals = rs.map(row.get)
              const nums = row.numeric ? (vals.filter((v) => typeof v === 'number') as number[]) : []
              const hi = nums.length ? Math.max(...nums) : null
              const lo = nums.length ? Math.min(...nums) : null
              const diff = hi !== lo
              return (
                <tr key={row.label} className="border-t border-slate-100">
                  <td className="p-2 text-slate-500 whitespace-nowrap">{row.label}</td>
                  {vals.map((v, i) => {
                    const isHi = row.numeric && diff && v === hi
                    const isLo = row.numeric && diff && v === lo
                    return (
                      <td key={i} className={`p-2 font-medium ${isHi ? 'text-green-600' : isLo ? 'text-red-500' : 'text-slate-700'}`}>
                        {v ?? '-'}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="flex flex-col items-center gap-2">
          <RadarChart size={300} series={rs.map((r, i) => ({ racket: r, color: COMPARE_COLORS[i] }))} />
          <p className="text-xs text-slate-400">使用体验对比（绿=最高 / 红=最低）</p>
        </div>
      </div>
    </Modal>
  )
}

function DetailModal({ racket: r, onClose }: { racket: Racket; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-lg font-bold">{r.meta.brand} {r.meta.model}</h2>
        {r.verified
          ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700">已校验</span>
          : <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">近似值</span>}
      </div>
      <p className="text-xs text-slate-400 mb-4">{r.meta.year} · {r.meta.series} 系列</p>

      <div className="flex gap-6 flex-wrap">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm flex-1 min-w-[260px]">
          <Spec label="拍面" value={`${r.specs.headSize} sq in`} />
          <Spec label="穿线重量" value={`${r.specs.weightStrungG} g`} />
          <Spec label="平衡" value={r.specs.balancePts != null ? `${r.specs.balancePts} pts` : '-'} />
          <Spec label="挥重" value={`${r.specs.swingWeight ?? '-'}`} />
          <Spec label="硬度 RA" value={`${r.specs.stiffness ?? '-'}`} />
          <Spec label="拍框" value={`${r.specs.beamWidth ?? '-'} mm`} />
          <Spec label="弦床" value={`${r.specs.mains}×${r.specs.crosses}`} />
          <Spec label="材质" value={r.specs.composition ?? '-'} />
          <Spec label="力量等级" value={r.specs.powerLevel ?? '-'} />
          <Spec label="推荐磅数" value={r.specs.stringTension ?? '-'} />
        </div>
        <div className="flex flex-col items-center">
          <RadarChart series={[{ racket: r, color: '#2563eb' }]} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {[...r.playStyle].sort((a, b) => b.fit - a.fit).map((p) => (
          <span key={p.tag} className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
            {PLAY_STYLE_LABELS[p.tag]} {p.fit}/5
          </span>
        ))}
        {r.skillLevel.levels.map((l) => (
          <span key={l} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{SKILL_LEVEL_LABELS[l]}</span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <Spec label="力量需求" value={`${r.skillLevel.requirement.power}/5`} />
        <Spec label="控制要求" value={`${r.skillLevel.requirement.controlSkill}/5`} />
        <Spec label="体能要求" value={`${r.skillLevel.requirement.physical}/5`} />
      </div>

      {r.notes && <p className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{r.notes}</p>}

      <div className="mt-3 grid grid-cols-3 gap-1.5 text-xs text-slate-500">
        {(Object.keys(EXPERIENCE_LABELS) as (keyof Racket['experience'])[]).map((k) => (
          <span key={k}>{EXPERIENCE_LABELS[k]}: <b className="text-slate-700">{r.experience[k]}/5</b></span>
        ))}
      </div>
    </Modal>
  )
}

function Modal({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl p-6 max-h-[90vh] overflow-auto ${wide ? 'max-w-4xl' : 'max-w-2xl'} w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="float-right text-slate-400 hover:text-slate-700 text-xl leading-none">×</button>
        {children}
      </div>
    </div>
  )
}
