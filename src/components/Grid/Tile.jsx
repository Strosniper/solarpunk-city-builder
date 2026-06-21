import React from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../../game/state/GameContext.jsx'
import { tierData, PATHS } from '../../game/config/tiers.js'
import './Tile.css'

const GLYPH = { biosphere: '✿', mesh: '☷', forge: '⬢' }

function Tile({ tile, selected, night }) {
  const { dispatch } = useGame()
  const b = tile.building
  const td = b ? tierData(b.pathId, b.tier) : null
  const path = b ? PATHS[b.pathId] : null
  const height = b ? 10 + b.tier * 7 : 0
  const glowing = night && td && td.glow
  const offline = b && !tile.online
  const isRelay = td && td.isRelay

  const onClick = (e) => {
    e.stopPropagation()
    dispatch({ type: 'SELECT_TILE', id: tile.id })
  }

  // soil tint visualises botany progress on hardscape
  const soilTint = Math.min(0.7, tile.soil / 140)

  return (
    <div
      className={
        'tile' +
        ` t-${tile.terrain}` +
        ` z-${tile.zone}` +
        (selected ? ' selected' : '')
      }
      onClick={onClick}
    >
      <div className="tile-face">
        <div className="soil-veil" style={{ opacity: soilTint }} />
        {tile.terrain === 'river' && <div className="river-shimmer" />}
        {isRelay && !offline && <div className="mesh-ring" style={{ borderColor: path.accent }} />}
      </div>

      {b && (
        <div className="struct-lift" style={{ transform: `translateZ(${height}px)`, '--accent': path.accent, '--h': `${height}px` }}>
          <motion.div
            key={b.tier}
            className={'struct' + (offline ? ' offline' : '') + (glowing ? ' glow' : '')}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <div className="struct-body" />
            <div className="struct-cap" />
            <div className="struct-label">
              <span className="struct-glyph">{GLYPH[b.pathId]}</span>
              <span className="struct-tier">T{b.tier}</span>
            </div>
            {offline && <div className="brownout">⚠</div>}
            {isRelay && !offline && <span className="logi-sprite" />}
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default React.memo(Tile)
