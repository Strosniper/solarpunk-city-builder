// Canonical resource ledger. Each key is tracked in game state and surfaced
// in the HUD. `flow` resources display a per-second delta; `stock` resources
// are pure accumulators.
export const RESOURCES = {
  credits:    { id: 'credits',    label: 'Credits',     icon: '◈', color: 'var(--neon-gold)',   kind: 'stock' },
  scrap:      { id: 'scrap',      label: 'Scrap',       icon: '⚙', color: '#c7ccd1',            kind: 'stock' },
  materials:  { id: 'materials',  label: 'Solar Mat.',  icon: '◇', color: 'var(--neon-cyan)',   kind: 'stock' },
  energy:     { id: 'energy',     label: 'Kinetic kW',  icon: '⚡', color: 'var(--neon-lime)',   kind: 'flow'  },
  water:      { id: 'water',      label: 'Purified H₂O',icon: '❍', color: 'var(--neon-cyan)',   kind: 'flow'  },
  food:       { id: 'food',       label: 'Biomass',     icon: '✿', color: 'var(--neon-green)',  kind: 'flow'  },
  civicTrust: { id: 'civicTrust', label: 'Civic Trust', icon: '♥', color: 'var(--neon-rose)',   kind: 'stock' },
}

export const RESOURCE_ORDER = ['credits', 'scrap', 'materials', 'energy', 'water', 'food', 'civicTrust']

export const STARTING_RESOURCES = {
  credits: 2400,
  scrap: 120,
  materials: 40,
  energy: 0,
  water: 0,
  food: 0,
  civicTrust: 50,
}
