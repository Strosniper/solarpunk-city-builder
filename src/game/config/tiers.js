/* ============================================================
   THE 10-TIER UPGRADE TREES (deep state machine, data-driven)

   Each path is an ordered list of 10 tiers. A building stores only
   { pathId, tier }; all behaviour is resolved by indexing this table.

   Tier fields:
     name      display name at this tier
     phase     narrative band (drives iconography/color)
     cost      resources consumed to UPGRADE INTO this tier
     produces  per-tick output once active (gated by mesh/license)
     consumes  per-tick input required to stay active
     requires  spatial / staffing prerequisites
                 soil   : min soil-structure on the tile (Path A)
                 mesh   : true => must be inside a live mesh radius
                 license: workforce class id required to staff
     automated true => silent unless powered by mesh coverage
     glow      true => emits bioluminescent glow at night (Tier 8+)
   ============================================================ */

const A = (tier, name, phase, cost, produces, consumes, requires, flags = {}) =>
  ({ tier, name, phase, cost, produces, consumes, requires, ...flags })

// ---- PATH A: Concrete Lot -> Urban Biosphere -------------------------------
export const PATH_A = {
  id: 'biosphere',
  name: 'Urban Biosphere',
  origin: 'Concrete Lot',
  accent: 'var(--neon-green)',
  buildIn: ['prairie', 'town'],
  tiers: [
    A(1, 'Depaved Plot',          'reclaim', { scrap: 10 },                 {},                        {},               { soil: 5 }),
    A(2, 'Scavenged Substrate',   'reclaim', { scrap: 18 },                 {},                        {},               { soil: 12 }),
    A(3, 'Geometric Scaffolding', 'reclaim', { scrap: 30, materials: 6 },   { food: 0.3 },             {},               { soil: 20 }),
    A(4, 'Pioneer Sowing',        'living',  { materials: 14, food: 4 },    { food: 0.8, water: -0.2 },{ water: 0.2 },   { soil: 32 }),
    A(5, 'Micro-Irrigation Grid', 'living',  { materials: 22 },             { food: 1.4 },             { water: 0.4 },   { soil: 40 }, { automated: true }),
    A(6, 'Deep-Root Anchors',     'living',  { materials: 30 },             { food: 2.1, water: 0.3 }, { water: 0.2 },   { soil: 50 }),
    A(7, 'Symbiotic Guilds',      'symbiotic',{ materials: 44, credits: 200},{ food: 3.4, water: 0.8 },{},              { soil: 62 }),
    A(8, 'Solar-Glass Canopy',    'symbiotic',{ materials: 60, credits: 360},{ food: 4.6, energy: 1.2 },{},             { soil: 70 }, { glow: true }),
    A(9, 'Apex Canopy',           'apex',    { materials: 90, credits: 700},{ food: 6.5, water: 1.6, energy: 1.0 }, {}, { soil: 80 }, { glow: true }),
    A(10,'Bioluminescent Apex',   'apex',    { materials: 140, credits: 1200},{ food: 9, water: 2.4, energy: 1.8, civicTrust: 0.4 }, {}, { soil: 90 }, { glow: true }),
  ],
}

// ---- PATH B: Defunct Telecom -> Decentralized Mesh Hub ---------------------
export const PATH_B = {
  id: 'mesh',
  name: 'Decentralized Mesh Hub',
  origin: 'Defunct Telecom',
  accent: 'var(--neon-cyan)',
  buildIn: ['prairie', 'town', 'metropolis'],
  tiers: [
    A(1, 'Hardware Scavenge',     'salvage', { scrap: 14 },                 {},                        {},               {}),
    A(2, 'Ruggedized Node',       'salvage', { scrap: 24, materials: 4 },   {},                        {},               {}, { meshRadius: 1.6 }),
    A(3, 'Meshtastic Relay',      'salvage', { scrap: 36, materials: 10 },  { civicTrust: 0.1 },       {},               {}, { meshRadius: 2.2, isRelay: true }),
    A(4, 'Seed-Bot Array',        'auto',    { materials: 22, credits: 180},{ civicTrust: 0.2 },       { energy: 0.4 },  { mesh: true }, { meshRadius: 2.6, isRelay: true, automated: true }),
    A(5, 'Logistics Swarm',       'auto',    { materials: 34, credits: 260},{ civicTrust: 0.3 },       { energy: 0.6 },  { mesh: true }, { meshRadius: 3.0, isRelay: true, automated: true }),
    A(6, 'Sensor Lattice',        'auto',    { materials: 48, credits: 420},{ civicTrust: 0.5 },       { energy: 0.8 },  { mesh: true }, { meshRadius: 3.4, isRelay: true, automated: true }),
    A(7, 'Scriptable Terminal',   'compute', { materials: 64, credits: 640},{ civicTrust: 0.7, credits: 2 }, { energy: 1.0 }, { mesh: true, license: 'class63' }, { meshRadius: 3.8, isRelay: true, automated: true }),
    A(8, 'Automation Cortex',     'compute', { materials: 88, credits: 900},{ civicTrust: 1.0, credits: 4 }, { energy: 1.3 }, { mesh: true, license: 'class63' }, { meshRadius: 4.2, isRelay: true, automated: true, glow: true }),
    A(9, 'Quantum Backbone',      'quantum', { materials: 130, credits: 1500},{ civicTrust: 1.6, credits: 7 },{ energy: 1.6 },{ mesh: true, license: 'class63' }, { meshRadius: 5.0, isRelay: true, automated: true, glow: true }),
    A(10,'City Spine (Resilient)','quantum', { materials: 200, credits: 2400},{ civicTrust: 2.4, credits: 12 },{ energy: 2.0 },{ mesh: true, license: 'class63' }, { meshRadius: 6.0, isRelay: true, automated: true, glow: true }),
  ],
}

// ---- PATH C: Abandoned Factory -> Circular Economy Forge -------------------
export const PATH_C = {
  id: 'forge',
  name: 'Circular Economy Forge',
  origin: 'Abandoned Factory',
  accent: 'var(--neon-gold)',
  buildIn: ['town', 'metropolis'],
  tiers: [
    A(1, 'Mycoremediation',       'detox',   { scrap: 16 },                 {},                        {},               {}),
    A(2, 'E-Waste Sorting',       'detox',   { scrap: 28 },                 { materials: 0.4 },        { scrap: 0.6 },   {}),
    A(3, 'Toxin Scrubbers',       'detox',   { scrap: 40, materials: 8 },   { materials: 0.8 },        { scrap: 1.0 },   {}),
    A(4, 'Bio-Resin Printer',     'fabricate',{ materials: 24, credits: 200},{ materials: 1.6 },       { scrap: 1.4, energy: 0.5 }, { license: 'class6' }, { automated: true }),
    A(5, 'Kinetic Battery Line',  'fabricate',{ materials: 36, credits: 300},{ materials: 2.2, energy: 1.5 }, { scrap: 1.8 }, { license: 'class6' }, { automated: true }),
    A(6, 'Closed Water Loop',     'fabricate',{ materials: 50, credits: 460},{ materials: 3.0, water: 1.0 }, { scrap: 2.0 }, { license: 'class6' }, { automated: true }),
    A(7, 'Drone Assembly Bay',    'autoforge',{ materials: 70, credits: 700},{ materials: 4.2, energy: 2.0 }, { scrap: 2.4 }, { mesh: true, license: 'class6' }, { automated: true }),
    A(8, 'Autonomous Foundry',    'autoforge',{ materials: 96, credits: 980},{ materials: 5.6, energy: 2.8 }, { scrap: 2.8 }, { mesh: true, license: 'class6' }, { automated: true, glow: true }),
    A(9, 'Arcology Core',         'arcology',{ materials: 150, credits: 1700},{ materials: 8, energy: 3.6, food: 1.5 }, {}, { mesh: true, license: 'class6' }, { automated: true, glow: true }),
    A(10,'Closed-Loop Arcology',  'arcology',{ materials: 230, credits: 2800},{ materials: 12, energy: 5, food: 2.5, civicTrust: 0.6 }, {}, { mesh: true, license: 'class6' }, { automated: true, glow: true }),
  ],
}

export const PATHS = { biosphere: PATH_A, mesh: PATH_B, forge: PATH_C }

export function tierData(pathId, tier) {
  const p = PATHS[pathId]
  if (!p) return null
  return p.tiers[Math.min(Math.max(tier, 1), 10) - 1]
}

export function nextTierData(pathId, tier) {
  if (tier >= 10) return null
  return tierData(pathId, tier + 1)
}

// Workforce licensing — academies certify these classes.
export const LICENSES = {
  class6:  { id: 'class6',  name: 'Class 6 — Municipal Finance', guild: 'salvage' },
  class63: { id: 'class63', name: 'Class 63 — Network Regulations', guild: 'techweavers' },
}
