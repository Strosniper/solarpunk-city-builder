import { tierData } from '../config/tiers.js'
import { computeMeshCoverage } from './mesh.js'
import { diffuseSoil } from './botany.js'
import { RESOURCE_ORDER } from '../config/resources.js'

// Determine whether a building is currently ACTIVE given coverage / staffing /
// substrate prerequisites. Inactive buildings produce nothing (brownout).
export function isBuildingActive(tile, td, ctx) {
  if (!td) return false
  const req = td.requires || {}
  if (req.mesh && !ctx.covered.has(tile.id)) return false
  if (req.license && !ctx.licenses[req.license]) return false
  if (req.soil && tile.soil < req.soil) return false
  return true
}

// Pure tick: state -> next derived fields. Does not mutate input.
export function simulate(state) {
  const grid = diffuseSoil(state.grid)
  const { covered, relayCount } = computeMeshCoverage(grid)
  const ctx = { covered, licenses: state.licenses }

  const delta = Object.fromEntries(RESOURCE_ORDER.map((k) => [k, 0]))

  const nextGrid = grid.map((tile) => {
    const b = tile.building
    if (!b) return { ...tile, online: false }
    const td = tierData(b.pathId, b.tier)
    const active = isBuildingActive(tile, td, ctx)

    if (active && td) {
      for (const [k, v] of Object.entries(td.produces || {})) delta[k] += v
      for (const [k, v] of Object.entries(td.consumes || {})) delta[k] -= v
    }
    return { ...tile, online: active }
  })

  // Apply: every resource accumulates; clamp the floor at zero.
  const resources = { ...state.resources }
  for (const k of RESOURCE_ORDER) {
    resources[k] = Math.max(0, +(resources[k] + delta[k]).toFixed(2))
  }

  return {
    ...state,
    tick: state.tick + 1,
    grid: nextGrid,
    resources,
    flows: delta,
    meta: { relayCount, coveredCount: covered.size },
  }
}
