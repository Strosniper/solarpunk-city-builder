import React from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../../game/state/GameContext.jsx'
import { tierData, PATHS } from '../../game/config/tiers.js'
import { TW, TH } from './iso.js'
import './Tile.css'

const GLYPH = { biosphere: '✿', mesh: '☷', forge: '⬢' }

// body height grows with tier; each path has its own silhouette
const BODY_H = {
  biosphere: (t) => 14 + t * 9,
  mesh: (t) => 24 + t * 12,
  forge: (t) => 16 + t * 8,
}

function Building({ pathId, tier, glow, offline }) {
  const bh = BODY_H[pathId](tier)
  const accent = PATHS[pathId].accent

  return (
    <div
      className={`bld b-${pathId}` + (glow ? ' glow' : '') + (offline ? ' offline' : '')}
      style={{ '--bh': `${bh}px`, '--accent': accent, top: `-${bh}px` }}
    >
      {glow && <div className="emit" />}

      {/* three iso faces (paint order: back walls first, roof last) */}
      <div className="face f-left" />
      <div className="face f-right" />
      <div className="face f-top" />

      {/* path-specific roof furniture */}
      {pathId === 'mesh' && (
        <div className="mast"><span className="mast-line" /><span className="mast-blink" /></div>
      )}
      {pathId === 'forge' && <div className="stack" />}
      {pathId === 'biosphere' && (
        <div className="garden"><span /><span /><span /></div>
      )}

      <div className="tier-tag">
        <span className="tag-glyph">{GLYPH[pathId]}</span>
        <span className="tag-num">{tier}</span>
      </div>
      {offline && <div className="brownout">⚠</div>}
    </div>
  )
}

function Tile({ tile, left, top, depth, selected, night }) {
  const { dispatch } = useGame()
  const b = tile.building
  const td = b ? tierData(b.pathId, b.tier) : null
  const glow = night && td && td.glow
  const offline = b && !tile.online
  const isRelay = td && td.isRelay

  // small deterministic jitter so terrain doesn't look like a uniform grid
  const h = (tile.x * 73 + tile.y * 31) % 7
  const soilTint = Math.min(0.65, tile.soil / 150)

  const onClick = (e) => {
    e.stopPropagation()
    dispatch({ type: 'SELECT_TILE', id: tile.id })
  }

  return (
    <div
      className={`tile z-${tile.zone}` + (selected ? ' selected' : '')}
      style={{ left, top, width: TW, height: TH, zIndex: depth + 1 }}
      onClick={onClick}
    >
      <div className="sel-diamond" />
      <div className={`ground t-${tile.terrain} v${h}`}>
        <div className="soil-veil" style={{ opacity: soilTint }} />
        {tile.terrain === 'river' && <span className="ripple" />}
      </div>
      {isRelay && !offline && <div className="coverage" style={{ borderColor: PATHS.mesh.accent }} />}

      {b && (
        <motion.div
          className="bld-mount"
          key={b.tier}
          initial={{ scale: 0.5, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18 }}
        >
          <Building pathId={b.pathId} tier={b.tier} glow={glow} offline={offline} />
        </motion.div>
      )}
    </div>
  )
}

export default React.memo(Tile)
