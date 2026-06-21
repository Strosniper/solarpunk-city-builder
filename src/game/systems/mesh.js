import { GRID } from '../config/zones.js'
import { tierData } from '../config/tiers.js'

// Build a boolean coverage map of every tile that sits inside the overlapping
// radius of at least one ACTIVE mesh relay. Automated buildings only run when
// they fall inside coverage — knock a relay offline (storm/brownout) and whole
// sectors go dark.
export function computeMeshCoverage(grid, downedTileIds = new Set()) {
  const covered = new Set()
  const relays = []

  for (const tile of grid) {
    const b = tile.building
    if (!b || b.pathId !== 'mesh') continue
    if (downedTileIds.has(tile.id)) continue
    const td = tierData('mesh', b.tier)
    if (!td || !td.isRelay) continue
    relays.push({ x: tile.x, y: tile.y, r: td.meshRadius || 0 })
  }

  for (let y = 0; y < GRID.rows; y++) {
    for (let x = 0; x < GRID.cols; x++) {
      for (const relay of relays) {
        const dx = x - relay.x
        const dy = y - relay.y
        if (dx * dx + dy * dy <= relay.r * relay.r) {
          covered.add(`${x}_${y}`)
          break
        }
      }
    }
  }
  return { covered, relayCount: relays.length }
}
