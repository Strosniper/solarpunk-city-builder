import React, { useRef, useState, useCallback } from 'react'
import { useGame } from '../../game/state/GameContext.jsx'
import { GRID } from '../../game/config/zones.js'
import Tile from './Tile.jsx'
import './IsoGrid.css'

const MIN_SCALE = 0.55
const MAX_SCALE = 1.7

export default function IsoGrid() {
  const { state, dispatch } = useGame()
  const [view, setView] = useState({ x: 0, y: 0, scale: 0.92 })
  const drag = useRef(null)

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
    // a click that didn't pan = deselect (clicking empty space)
    if (drag.current && !drag.current.moved && e.target.classList.contains('iso-surface')) {
      dispatch({ type: 'DESELECT' })
    }
    drag.current = null
  }, [dispatch])

  const onWheel = useCallback((e) => {
    setView((v) => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale - e.deltaY * 0.0012))
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
      <div
        className="iso-pan"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
      >
        <div
          className="iso-plane"
          style={{ gridTemplateColumns: `repeat(${GRID.cols}, var(--tile))` }}
        >
          {state.grid.map((tile) => (
            <Tile
              key={tile.id}
              tile={tile}
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
