import { simulate } from '../systems/simulation.js'
import { tierData, nextTierData, PATHS, LICENSES } from '../config/tiers.js'
import { ZONES } from '../config/zones.js'
import { createInitialState } from './initialState.js'

const ACADEMY_COST = { class6: 800, class63: 1100 }

function canAfford(resources, cost) {
  return Object.entries(cost || {}).every(([k, v]) => (resources[k] || 0) >= v)
}
function pay(resources, cost) {
  const out = { ...resources }
  for (const [k, v] of Object.entries(cost || {})) out[k] = +(out[k] - v).toFixed(2)
  return out
}
function logLine(state, msg) {
  return [{ t: Date.now(), msg }, ...state.log].slice(0, 40)
}
function mapTile(state, id, fn) {
  return state.grid.map((t) => (t.id === id ? fn(t) : t))
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...action.payload, selectedTileId: null }

    case 'RESET':
      return createInitialState()

    case 'TICK':
      return simulate(state)

    case 'SELECT_TILE':
      return { ...state, selectedTileId: action.id }

    case 'DESELECT':
      return { ...state, selectedTileId: null }

    case 'TOGGLE_TIME':
      return { ...state, time: state.time === 'night' ? 'day' : 'night' }

    case 'SCAVENGE': {
      const tile = state.grid.find((t) => t.id === action.id)
      if (!tile || tile.zone === 'prairie') return state
      const yield_ = 8 + Math.floor((tile.x + tile.y) % 5)
      return {
        ...state,
        resources: { ...state.resources, scrap: +(state.resources.scrap + yield_).toFixed(2) },
        log: logLine(state, `Scavenged ${yield_} scrap from the Core.`),
      }
    }

    case 'DEPAVE': {
      const tile = state.grid.find((t) => t.id === action.id)
      if (!tile || ZONES[tile.zone].actions.indexOf('depave') === -1) return state
      if (tile.terrain !== 'concrete' && tile.terrain !== 'asphalt') return state
      return {
        ...state,
        grid: mapTile(state, action.id, (t) => ({
          ...t,
          terrain: 'soil',
          soil: Math.max(t.soil, 28),
        })),
        resources: { ...state.resources, scrap: +(state.resources.scrap + 4).toFixed(2) },
        log: logLine(state, 'Depaved asphalt — living soil reclaimed.'),
      }
    }

    case 'RETROFIT':
    case 'BUILD': {
      const tile = state.grid.find((t) => t.id === action.id)
      if (!tile) return state
      const path = PATHS[action.pathId]
      if (!path) return state
      // legality: build only in prairie; retrofit only in metropolis/town
      const verb = action.type === 'BUILD' ? 'build' : 'retrofit'
      if (ZONES[tile.zone].actions.indexOf(verb) === -1) return state
      if (path.buildIn.indexOf(tile.zone) === -1) return state
      if (tile.building) return state
      const cost = tierData(action.pathId, 1).cost
      if (!canAfford(state.resources, cost)) {
        return { ...state, log: logLine(state, `Not enough resources to ${verb} ${path.name}.`) }
      }
      return {
        ...state,
        resources: pay(state.resources, cost),
        grid: mapTile(state, action.id, (t) => ({ ...t, building: { pathId: action.pathId, tier: 1, hp: 100 } })),
        log: logLine(state, `${verb === 'build' ? 'Raised' : 'Retrofitted into'} ${path.name} (T1).`),
      }
    }

    case 'UPGRADE': {
      const tile = state.grid.find((t) => t.id === action.id)
      if (!tile || !tile.building) return state
      const b = tile.building
      const next = nextTierData(b.pathId, b.tier)
      if (!next) return { ...state, log: logLine(state, 'Already at Apex tier (10).') }
      const req = next.requires || {}
      if (req.soil && tile.soil < req.soil)
        return { ...state, log: logLine(state, `Needs soil structure ${req.soil} (have ${Math.floor(tile.soil)}).`) }
      if (req.license && !state.licenses[req.license])
        return { ...state, log: logLine(state, `Requires ${LICENSES[req.license].name}. Fund the academy.`) }
      if (!canAfford(state.resources, next.cost))
        return { ...state, log: logLine(state, `Not enough resources to reach ${next.name}.`) }
      return {
        ...state,
        resources: pay(state.resources, next.cost),
        grid: mapTile(state, action.id, (t) => ({ ...t, building: { ...b, tier: b.tier + 1 } })),
        log: logLine(state, `Upgraded to ${next.name} (T${b.tier + 1}).`),
      }
    }

    case 'FUND_ACADEMY': {
      const lic = LICENSES[action.licenseId]
      if (!lic) return state
      if (state.licenses[action.licenseId]) return state
      const cost = { credits: ACADEMY_COST[action.licenseId] }
      if (!canAfford(state.resources, cost))
        return { ...state, log: logLine(state, `Need ${cost.credits} credits to certify ${lic.name}.`) }
      return {
        ...state,
        resources: pay(state.resources, cost),
        licenses: { ...state.licenses, [action.licenseId]: true },
        log: logLine(state, `Academy funded — ${lic.name} certified.`),
      }
    }

    default:
      return state
  }
}
