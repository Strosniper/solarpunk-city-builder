import React from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../../game/state/GameContext.jsx'
import { tierData, PATHS } from '../../game/config/tiers.js'
import { TW, TH } from './iso.js'
import Building, { WALL_H } from './Building.jsx'
import './Tile.css'

const GLYPH = { biosphere: '✿', mesh: '☷', forge: '⬢' }
const DIAMOND = '60,0 120,30 60,60 0,30'

const TERRAIN = {
  prairie:  { grad: 'gPrairie',  tex: 'texGrass' },
  soil:     { grad: 'gSoil',     tex: 'texDirt' },
  concrete: { grad: 'gConcrete', tex: 'texConcrete' },
  asphalt:  { grad: 'gAsphalt',  tex: 'texConcrete' },
  river:    { grad: 'gRiver',    tex: 'texWater' },
}

function Tile({ tile, left, top, depth, selected, night }) {
  const { dispatch } = useGame()
  const b = tile.building
  const td = b ? tierData(b.pathId, b.tier) : null
  const glow = night && td && td.glow
  const offline = b && !tile.online
  const isRelay = td && td.isRelay
  const terrain = TERRAIN[tile.terrain] || TERRAIN.concrete
  const soilTint = Math.min(0.6, tile.soil / 160)

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
      <svg className="ground" viewBox="0 0 120 60" width={TW} height={TH}>
        <polygon points={DIAMOND} fill={`url(#${terrain.grad})`} filter={`url(#${terrain.tex})`} />
        {soilTint > 0.02 && <polygon className="soil-veil" points={DIAMOND} fill="#34e0a1" opacity={soilTint} />}
        {/* top-left highlight edge + bottom-right shaded edge for depth */}
        <polyline points="0,30 60,0 120,30" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
        <polyline points="0,30 60,60 120,30" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
        <polygon className="sel" points={DIAMOND} fill="none" strokeWidth="3" />
      </svg>

      {isRelay && !offline && (
        <svg className="coverage" viewBox="0 0 120 60" width={TW} height={TH}>
          <polygon className="cov-ring" points="60,4 116,30 60,56 4,30" fill="none" strokeWidth="1.6" strokeDasharray="5 4" />
        </svg>
      )}

      {b && (
        <motion.div
          className="bld-mount"
          key={b.tier}
          initial={{ scale: 0.55, opacity: 0, y: 6 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 18 }}
        >
          <Building pathId={b.pathId} tier={b.tier} uid={tile.id.replace('_', '')} glow={glow} offline={offline} />
          <div className="tier-tag" style={{ '--accent': PATHS[b.pathId].accent, top: `calc(-${WALL_H[b.pathId](b.tier)}px - 16px)` }}>
            <span className="tag-glyph">{GLYPH[b.pathId]}</span>
            <span className="tag-num">{b.tier}</span>
          </div>
          {offline && <div className="brownout" style={{ top: `calc(-${WALL_H[b.pathId](b.tier)}px - 36px)` }}>⚠</div>}
        </motion.div>
      )}
    </div>
  )
}

export default React.memo(Tile)
