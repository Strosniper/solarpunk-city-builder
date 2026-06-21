import React, { useMemo } from 'react'
import { useGame } from '../../game/state/GameContext.jsx'
import './Particles.css'

function field(count, seedBase) {
  return Array.from({ length: count }, (_, i) => {
    const s = Math.sin(seedBase + i * 12.9898) * 43758.5453
    const r = s - Math.floor(s)
    const s2 = Math.sin(seedBase + i * 78.233) * 12543.123
    const r2 = s2 - Math.floor(s2)
    return {
      left: `${(r * 100).toFixed(2)}%`,
      delay: `${(r2 * 14).toFixed(2)}s`,
      dur: `${(10 + r * 12).toFixed(2)}s`,
      drift: `${(r2 * 60 - 30).toFixed(0)}px`,
      scale: (0.6 + r2 * 0.9).toFixed(2),
    }
  })
}

export default function Particles() {
  const { state } = useGame()

  // pollen scales with thriving botany; smog with raw concrete + low-tier forges
  const pollen = useMemo(() => {
    const apex = state.grid.filter((t) => t.building?.pathId === 'biosphere' && t.building.tier >= 6).length
    return field(Math.min(26, 6 + apex * 3), 1.1)
  }, [Math.floor(state.tick / 20)]) // recompute occasionally, not every tick

  const smog = useMemo(() => {
    const dirty = state.grid.filter(
      (t) => t.terrain === 'concrete' || (t.building?.pathId === 'forge' && t.building.tier <= 3)
    ).length
    return field(Math.min(20, Math.floor(dirty / 3)), 7.7)
  }, [Math.floor(state.tick / 20)])

  return (
    <div className="fx" aria-hidden>
      <div className="fx-layer smog">
        {smog.map((p, i) => (
          <span key={i} className="p-smog"
            style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur, '--drift': p.drift, '--s': p.scale }} />
        ))}
      </div>
      <div className="fx-layer pollen">
        {pollen.map((p, i) => (
          <span key={i} className="p-pollen"
            style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur, '--drift': p.drift, '--s': p.scale }} />
        ))}
      </div>
    </div>
  )
}
