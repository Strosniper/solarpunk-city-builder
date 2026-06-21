// The three geographic biomes. A tile's column band determines its zone.
// Each zone gates which ACTION VERBS are legal — this is the core of the
// "physically route resources between biomes" loop.
export const ZONES = {
  metropolis: {
    id: 'metropolis',
    name: 'Metropolis Core',
    blurb: '100% concrete. Salvage the old world; retrofit what stands.',
    accent: '#9aa3ab',
    glow: 'rgba(154,163,171,0.5)',
    actions: ['scavenge', 'retrofit'],   // build disabled
    defaultTerrain: 'concrete',
  },
  town: {
    id: 'town',
    name: 'Developed Town',
    blurb: 'Medium density. Depave to reclaim soil; forge clean materials.',
    accent: 'var(--neon-cyan)',
    glow: 'rgba(33,212,216,0.5)',
    actions: ['depave', 'retrofit', 'upgrade'],
    defaultTerrain: 'asphalt',
  },
  prairie: {
    id: 'prairie',
    name: 'Untouched Prairie',
    blurb: 'Living soil and rivers. Raise apex structures; export to the Core.',
    accent: 'var(--neon-green)',
    glow: 'rgba(52,224,161,0.55)',
    actions: ['build', 'upgrade'],        // retrofit disabled
    defaultTerrain: 'prairie',
  },
}

// Grid: 12 columns x 9 rows. Column bands map to zones.
export const GRID = { cols: 12, rows: 9 }

export function zoneForColumn(x) {
  if (x < 4) return 'metropolis'
  if (x < 8) return 'town'
  return 'prairie'
}
