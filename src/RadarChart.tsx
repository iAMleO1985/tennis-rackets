import type { Racket } from './types'
import { EXPERIENCE_LABELS } from './types'

const AXES = Object.keys(EXPERIENCE_LABELS) as (keyof Racket['experience'])[]

interface Props {
  series: { racket: Racket; color: string }[]
  size?: number
}

export default function RadarChart({ series, size = 240 }: Props) {
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 28
  const n = AXES.length
  const max = 5

  const point = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2
    const dist = (value / max) * r
    return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)]
  }

  const gridLevels = [1, 2, 3, 4, 5]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* grid rings */}
      {gridLevels.map((lvl) => (
        <polygon
          key={lvl}
          points={AXES.map((_, i) => point(i, lvl).join(',')).join(' ')}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={1}
        />
      ))}
      {/* spokes + labels */}
      {AXES.map((axis, i) => {
        const [x, y] = point(i, max)
        const [lx, ly] = point(i, max + 0.9)
        return (
          <g key={axis}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth={1} />
            <text
              x={lx}
              y={ly}
              fontSize={11}
              fill="#475569"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {EXPERIENCE_LABELS[axis]}
            </text>
          </g>
        )
      })}
      {/* data polygons */}
      {series.map(({ racket, color }) => (
        <polygon
          key={racket.id}
          points={AXES.map((axis, i) => point(i, racket.experience[axis]).join(',')).join(' ')}
          fill={color}
          fillOpacity={0.15}
          stroke={color}
          strokeWidth={2}
        />
      ))}
    </svg>
  )
}
