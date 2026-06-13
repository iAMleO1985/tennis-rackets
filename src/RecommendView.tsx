import { useState } from 'react'
import { rackets } from './data'
import type { PlayStyleTag, Racket, SkillLevelTag } from './types'
import { PLAY_STYLE_LABELS, SKILL_LEVEL_LABELS } from './types'
import { recommend, type Prefs } from './recommend'

interface Props {
  onOpen: (r: Racket) => void
}

const SLIDERS: { key: 'power' | 'control' | 'comfort'; label: string; hint: string }[] = [
  { key: 'power', label: '力量', hint: '希望球拍帮你借力发球' },
  { key: 'control', label: '控制', hint: '希望落点精准、可控' },
  { key: 'comfort', label: '舒适', hint: '在意减震、保护手肘手腕' },
]

export default function RecommendView({ onOpen }: Props) {
  const [prefs, setPrefs] = useState<Prefs>({
    level: 'intermediate',
    style: 'allCourt',
    power: 3,
    control: 3,
    comfort: 3,
  })
  const [submitted, setSubmitted] = useState<Prefs | null>(null)

  const results = submitted ? recommend(rackets, submitted, 6) : []

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h2 className="text-lg font-bold text-slate-900 mb-1">告诉我们你的情况，推荐合适的球拍</h2>
      <p className="text-sm text-slate-500 mb-6">基于打法契合、水平匹配与你的偏好倾向加权打分。</p>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        {/* 水平 */}
        <Field label="你的水平">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SKILL_LEVEL_LABELS) as SkillLevelTag[]).map((l) => (
              <Pick key={l} active={prefs.level === l} onClick={() => setPrefs((p) => ({ ...p, level: l }))}>
                {SKILL_LEVEL_LABELS[l]}
              </Pick>
            ))}
          </div>
        </Field>

        {/* 打法 */}
        <Field label="你的主要打法">
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PLAY_STYLE_LABELS) as PlayStyleTag[]).map((s) => (
              <Pick key={s} active={prefs.style === s} onClick={() => setPrefs((p) => ({ ...p, style: s }))}>
                {PLAY_STYLE_LABELS[s]}
              </Pick>
            ))}
          </div>
        </Field>

        {/* 偏好滑块 */}
        <Field label="你的偏好（拖动表示有多在意）">
          <div className="space-y-4">
            {SLIDERS.map(({ key, label, hint }) => (
              <div key={key} className="flex items-center gap-4">
                <div className="w-28 shrink-0">
                  <div className="text-sm font-medium text-slate-700">{label}</div>
                  <div className="text-[11px] text-slate-400">{hint}</div>
                </div>
                <input
                  type="range" min={0} max={5} value={prefs[key]}
                  onChange={(e) => setPrefs((p) => ({ ...p, [key]: +e.target.value }))}
                  className="flex-1"
                />
                <span className="w-8 text-right text-sm text-slate-600">{prefs[key]}</span>
              </div>
            ))}
          </div>
        </Field>

        <button
          onClick={() => setSubmitted({ ...prefs })}
          className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          获取推荐
        </button>
      </div>

      {/* 结果 */}
      {submitted && (
        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-semibold text-slate-500">为你推荐（按匹配度排序）</h3>
          {results.map((s, i) => (
            <div
              key={s.racket.id}
              className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition cursor-pointer"
              onClick={() => onOpen(s.racket)}
            >
              <div className="text-2xl font-bold text-slate-300 w-8 text-center">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900">{s.racket.meta.brand} {s.racket.meta.model}</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {s.reasons.map((r) => (
                    <span key={r} className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700">{r}</span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-bold text-blue-600">{s.score}</div>
                <div className="text-[11px] text-slate-400">匹配分</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{label}</div>
      {children}
    </div>
  )
}

function Pick({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm border transition ${
        active ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:border-blue-400'
      }`}
    >
      {children}
    </button>
  )
}
