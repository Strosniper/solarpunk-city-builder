import React, { useRef, useState, useCallback, useMemo } from 'react'
import { useGame } from '../../game/state/GameContext.jsx'
import { GRID } from '../../game/config/zones.js'
import { TW, TH, TOP_PAD, isoPos, originX } from './iso.js'
import Tile from './Tile.jsx'
import './IsoGrid.css'

const MIN_SCALE = 0.5
const MAX_SCALE = 1.6

export default function IsoGrid() {
  const { state, dispatch } = useGame()
  const [view, setView] = useState({ x: 0, y: -10, scale: 0.95 })
  const drag = useRef(null)

  const ox = originX(GRID.rows)
  const planeW = ox + (GRID.cols - 1) * (TW / 2) + TW
  const planeH = TOP_PAD + (GRID.cols - 1 + GRID.rows - 1) * (TH / 2) + TH + 80

  // place every tile and paint back-to-front (smaller x+y first) so nearer
  // buildings correctly occlude the ones behind them
  const placed = useMemo(() => {
    return state.grid
      .map((tile) => {
        const { sx, sy } = isoPos(tile.x, tile.y)
        return { tile, left: ox + sx, top: TOP_PAD + sy, depth: tile.x + tile.y }
      })
      .sort((a, b) => a.depth - b.depth)
  }, [state.grid, ox])

  const onPointerDown = useCallback((e) => {
    drag.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y, moved: false }
  }, [view.x, view.y])

  const onPointerMove = useCallback((e) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.sx
    const dy = e.clientY - drag.current.sy
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.current.moved = true
    setView((v) => ({ ...v, x: drag.current.ox + dx, y: drag.current.oy + dy }))
  }, [])

  const onPointerUp = useCallback((e) => {
    if (drag.current && !drag.current.moved &&
      (e.target.classList.contains('iso-surface') || e.target.classList.contains('iso-plane'))) {
      dispatch({ type: 'DESELECT' })
    }
    drag.current = null
  }, [dispatch])

  const onWheel = useCallback((e) => {
    setView((v) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale - e.deltaY * 0.0011))
      return { ...v, scale: next }
    })
  }, [])

  return (
    <div
      className="iso-surface"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
    >
      <div className="iso-pan" style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>
        <div className="iso-plane" style={{ width: planeW, height: planeH }}>
          {placed.map(({ tile, left, top, depth }) => (
            <Tile
              key={tile.id}
              tile={tile}
              left={left}
              top={top}
              depth={depth}
              selected={state.selectedTileId === tile.id}
              night={state.time === 'night'}
            />
          ))}
        </div>
      </div>

      <div className="iso-hint glass">drag to pan · scroll to zoom · click a tile</div>
    </div>
  )
}
