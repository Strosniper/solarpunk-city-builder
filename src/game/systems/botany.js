import { GRID } from '../config/zones.js'
import { tierData } from '../config/tiers.js'

const idx = (x, y) => y * GRID.cols + x

// Micro-spatial botany: deep-rooted biosphere tiles bleed "Soil Structure"
// into their 4-neighbours each tick. When a concrete/asphalt tile's soil
// crosses a threshold, it physically breaks down into plantable soil.
export function diffuseSoil(grid) {
  const next = grid.map((t) => ({ ...t }))
  const SOIL_BREAK = 35   // soil needed to fracture hardscape into soil terrain

  for (const tile of grid) {
    const b = tile.building
    if (!b || b.pathId !== 'biosphere') continue
    const td = tierData('biosphere', b.tier)
    if (!td) continue
    // root vigour scales with tier; apex canopies regrade fastest
    const vigour = 0.15 + b.tier * 0.12

    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = tile.x + dx
      const ny = tile.y + dy
      if (nx < 0 || ny < 0 || nx >= GRID.cols || ny >= GRID.rows) continue
      const n = next[idx(nx, ny)]
      if (n.soil < 100) n.soil = Math.min(100, n.soil + vigour)
      if ((n.terrain === 'concrete' || n.terrain === 'asphalt') && n.soil >= SOIL_BREAK) {
        n.terrain = 'soil'
      }
    }
  }
  return next
}
