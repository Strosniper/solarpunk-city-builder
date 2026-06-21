# ❂ Verdancy — Solarpunk City Builder

A premium, systemic city-builder built in **React + Vite**. You inherit a dead
concrete metropolis and regrow it into a living, bioluminescent solarpunk city —
scavenging the old world, depaving asphalt back into soil, and routing clean
energy and biomass from the prairie to keep the Core from collapse.

Designed to *feel* like a top-tier mobile builder in the browser: a true 2.5D
isometric world, glassmorphism HUD, a sleek contextual action dock, day/night
ambience with bioluminescent glows, and live logistics/particle effects.

> **Status: playable foundation (v0.1).** The core loop, visual system, 3-zone
> ruleset, 3×10 upgrade trees, mesh-gated simulation, botany soil-diffusion,
> workforce licensing, finance dashboard, and localStorage save system are all
> implemented and wired. Several late-game systems from the design doc are
> scaffolded as clearly-marked extension points (see **Roadmap**).

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in /dist
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **New Project → Import** the repo.
3. Vercel auto-detects Vite (`vercel.json` is included). Build `npm run build`,
   output `dist`. Click **Deploy**.

---

## How it plays

The grid is split into three biomes by column band:

| Zone | Terrain | Legal actions |
|------|---------|---------------|
| **Metropolis Core** | concrete | Scavenge, Retrofit (build disabled) |
| **Developed Town** | asphalt | Depave, Retrofit, Upgrade |
| **Untouched Prairie** | soil / river | Build New, Upgrade (retrofit disabled) |

Click any tile → the **Contextual Action Dock** slides up with only the actions
that biome allows. Build/retrofit a structure onto one of three upgrade paths,
then climb its 10 tiers. Tier 4+ buildings are **automated** and only run inside
a live **Mesh Relay** radius; Tier 7+ need **certified labor** from academies.

### The three upgrade paths (10 tiers each, in `src/game/config/tiers.js`)
- **Path A — Concrete Lot → Urban Biosphere** (`biosphere`): depave → pioneer
  plants → symbiotic guilds → bioluminescent apex canopy.
- **Path B — Defunct Telecom → Decentralized Mesh Hub** (`mesh`): scavenged
  nodes → seed-bot arrays → scriptable terminals → quantum city backbone. *These
  are the relays that power everything automated.*
- **Path C — Abandoned Factory → Circular Economy Forge** (`forge`):
  mycoremediation → bio-resin printing → drone foundry → closed-loop arcology.

---

## Architecture

```
src/
  game/
    config/      resources, zones, tiers  (pure data — tune the game here)
    state/       initialState, gameReducer, GameContext (sim loop + autosave)
    systems/     simulation, mesh (coverage), botany (soil diffusion)
    hooks/       useLocalStorage (save/load/export/import)
  components/
    Hud/         TopResourceBar, SystemDock
    Grid/        IsoGrid (pan/zoom), Tile (3D structures)
    Dock/        ContextualActionDock (actions + upgrade machine)
    Panels/      FinancePanel (Green Revenue Dashboard + academies)
    Effects/     Particles (pollen / smog)
  styles/        tokens.css (design system), global.css
```

**State** is a single immutable object driven through `gameReducer`. A 1 Hz
**simulation tick** (`systems/simulation.js`) is pure: it diffuses soil, computes
mesh coverage, decides which buildings are active, and applies resource deltas.
**Autosave** writes the whole city to `localStorage` every 60 s, on tab-hide, and
on unload; **Export/Import** produce a portable Base64 save string (SystemDock ⇄).

### Key systems
- **Mesh networks** (`systems/mesh.js`): relays project a tier-scaled radius;
  automated buildings outside coverage brown out.
- **Micro-spatial botany** (`systems/botany.js`): biosphere tiles bleed *Soil
  Structure* into neighbours each tick; hardscape fractures into soil past a
  threshold — concrete literally turns plantable over time.
- **Workforce licensing** (`config/tiers.js` + FinancePanel): fund academies to
  certify Class 6 (Finance) / Class 63 (Network) labor for high tiers.

### Visual system
All theming flows from CSS custom properties in `styles/tokens.css`
(`--glass-bg`, `--neon-green`, iso geometry, shadows). Day/night swaps the token
set on `<body data-time>`. The isometric plane uses `rotateX/rotateZ` with
`preserve-3d`; structures are raised on a `translateZ` lift so they overlap tiles
behind them with real depth.

---

## Roadmap (design-doc systems scaffolded for extension)
- Extreme-weather events damaging non-triangulated / shallow-root structures
- Heritage-site restoration + Catalyst events for the three Guilds
- Green Municipal Bonds / "Old Money" zero-decay premium materials
- Python-scriptable Tier 7 terminal automation
- Maintenance decay + repair loop

These hook cleanly into the existing reducer (`gameReducer.js`) and tick
(`simulation.js`) — each is an added action type and/or a tick pass.

---

*Built as a foundation to extend. Tune the whole economy from `src/game/config/`.*
