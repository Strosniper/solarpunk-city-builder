import { GRID, zoneForColumn, ZONES } from '../config/zones.js'
import { STARTING_RESOURCES } from '../config/resources.js'

let _seed = 1337
function rng() {
  // deterministic LCG so a fresh game always lays out the same world
  _seed = (_seed * 1103515245 + 12345) & 0x7fffffff
  return _seed / 0x7fffffff
}

function makeTile(x, y) {
  const zone = zoneForColumn(x)
  let terrain = ZONES[zone].defaultTerrain
  let soil = 0

  if (zone === 'prairie') {
    soil = 60 + Math.floor(rng() * 30)
    if (rng() < 0.16) terrain = 'river'
  } else if (zone === 'town') {
    soil = 6 + Math.floor(rng() * 10)
  } else {
    soil = 0
  }

  // Seed a few pre-existing structures to retrofit/upgrade.
  let building = null
  if (zone === 'metropolis' && rng() < 0.18) building = { pathId: 'mesh', tier: 1, hp: 100 }
  if (zone === 'town' && rng() < 0.16) building = { pathId: 'forge', tier: 1, hp: 100 }

  return {
    id: `${x}_${y}`,
    x, y, zone, terrain, soil,
    building,
    online: false,   // recomputed each tick by the mesh system
  }
}

export function createGrid() {
  const tiles = []
  for (let y = 0; y < GRID.rows; y++) {
    for (let x = 0; x < GRID.cols; x++) tiles.push(makeTile(x, y))
  }
  return tiles
}

export function createInitialState() {
  _seed = 1337
  return {
    version: 1,
    createdAt: Date.now(),
    tick: 0,
    time: 'night',                 // 'night' | 'day'
    resources: { ...STARTING_RESOURCES },
    flows: {},                     // last-tick per-second deltas, for HUD
    grid: createGrid(),
    licenses: {},                  // { class6: true } once academy funded
    selectedTileId: null,
    log: [{ t: Date.now(), msg: 'A new city wakes. The concrete remembers the prairie.' }],
  }
}
