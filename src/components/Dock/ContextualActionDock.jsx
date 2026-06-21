import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../../game/state/GameContext.jsx'
import { ZONES } from '../../game/config/zones.js'
import { PATHS, tierData, nextTierData, LICENSES } from '../../game/config/tiers.js'
import { RESOURCES } from '../../game/config/resources.js'
import './ContextualActionDock.css'

function CostChips({ cost }) {
  const entries = Object.entries(cost || {})
  if (!entries.length) return <span className="cost-free">free</span>
  return (
    <span className="cost-chips">
      {entries.map(([k, v]) => (
        <span className="cost-chip" key={k}>
          <span style={{ color: RESOURCES[k]?.color }}>{RESOURCES[k]?.icon}</span>
          {v}
        </span>
      ))}
    </span>
  )
}

function FlowChips({ map, sign }) {
  const entries = Object.entries(map || {})
  if (!entries.length) return null
  return (
    <span className="flow-chips">
      {entries.map(([k, v]) => (
        <span className="flow-chip" key={k}>
          <span style={{ color: RESOURCES[k]?.color }}>{RESOURCES[k]?.icon}</span>
          {sign}{v}/s
        </span>
      ))}
    </span>
  )
}

const VERB_META = {
  scavenge: { icon: '⚙', label: 'Scavenge' },
  depave:   { icon: '✸', label: 'Depave' },
  retrofit: { icon: '↻', label: 'Retrofit' },
  build:    { icon: '＋', label: 'Build New' },
}

export default function ContextualActionDock() {
  const { state, dispatch } = useGame()
  const tile = state.grid.find((t) => t.id === state.selectedTileId)

  return (
    <AnimatePresence>
      {tile && (
        <motion.aside
          className="dock glass glass-strong"
          initial={{ y: 220, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 220, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 240, damping: 28 }}
        >
          <DockBody tile={tile} state={state} dispatch={dispatch} />
          <button className="dock-close press" onClick={() => dispatch({ type: 'DESELECT' })}>✕</button>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function DockBody({ tile, state, dispatch }) {
  const zone = ZONES[tile.zone]
  const verbs = zone.actions.filter((a) => a !== 'upgrade')
  const b = tile.building
  const path = b ? PATHS[b.pathId] : null
  const cur = b ? tierData(b.pathId, b.tier) : null
  const next = b ? nextTierData(b.pathId, b.tier) : null

  const eligiblePaths = (verb) =>
    Object.values(PATHS).filter((p) => p.buildIn.includes(tile.zone) &&
      ((verb === 'build' && tile.zone === 'prairie') || (verb === 'retrofit' && tile.zone !== 'prairie')))

  const afford = (cost) => Object.entries(cost || {}).every(([k, v]) => (state.resources[k] || 0) >= v)
  const soilOK = !next?.requires?.soil || tile.soil >= next.requires.soil
  const licOK = !next?.requires?.license || state.licenses[next.requires.license]
  const canUpgrade = next && afford(next.cost) && soilOK && licOK

  return (
    <div className="dock-inner">
      <div className="dock-head">
        <div className="dock-zone" style={{ color: zone.accent }}>
          <span className="dock-zone-dot" style={{ background: zone.accent, boxShadow: `0 0 10px ${zone.glow}` }} />
          {zone.name}
        </div>
        <div className="dock-title">
          {b ? `${path.name}` : tile.terrain[0].toUpperCase() + tile.terrain.slice(1) + ' tile'}
          <span className="dock-coord">· {tile.x},{tile.y}</span>
        </div>
        <div className="dock-soil">
          <span>Soil structure</span>
          <div className="soil-bar"><div style={{ width: `${tile.soil}%` }} /></div>
          <span className="soil-num">{Math.floor(tile.soil)}</span>
        </div>
      </div>

      <div className="dock-actions">
        {/* simple verbs */}
        {verbs.includes('scavenge') && (
          <ActionBtn meta={VERB_META.scavenge} onClick={() => dispatch({ type: 'SCAVENGE', id: tile.id })} />
        )}
        {verbs.includes('depave') && (tile.terrain === 'concrete' || tile.terrain === 'asphalt') && (
          <ActionBtn meta={VERB_META.depave} onClick={() => dispatch({ type: 'DEPAVE', id: tile.id })} />
        )}

        {/* path-creating verbs (only on empty tiles) */}
        {!b && verbs.filter((v) => v === 'retrofit' || v === 'build').map((verb) =>
          eligiblePaths(verb).map((p) => {
            const cost = tierData(p.id, 1).cost
            return (
              <ActionBtn
                key={verb + p.id}
                meta={{ icon: VERB_META[verb].icon, label: `${VERB_META[verb].label}` }}
                sub={p.name}
                accent={p.accent}
                disabled={!afford(cost)}
                cost={cost}
                onClick={() => dispatch({ type: verb === 'build' ? 'BUILD' : 'RETROFIT', id: tile.id, pathId: p.id })}
              />
            )
          })
        )}
      </div>

      {/* upgrade machine */}
      {b && (
        <div className="dock-upgrade">
          <div className="up-current">
            <span className="up-tierbadge" style={{ background: path.accent }}>T{b.tier}</span>
            <div>
              <div className="up-name">{cur.name}</div>
              <div className="up-phase">{path.origin} → {path.name} · {cur.phase}</div>
            </div>
            <div className={'up-online ' + (tile.online ? 'on' : 'off')}>
              {tile.online ? 'ONLINE' : (b.tier >= 4 ? 'BROWNOUT' : 'IDLE')}
            </div>
          </div>

          <div className="up-io">
            <div className="up-io-col">
              <span className="up-io-label">Produces</span>
              <FlowChips map={cur.produces} sign="+" />
              {!Object.keys(cur.produces || {}).length && <span className="muted">—</span>}
            </div>
            <div className="up-io-col">
              <span className="up-io-label">Consumes</span>
              <FlowChips map={cur.consumes} sign="-" />
              {!Object.keys(cur.consumes || {}).length && <span className="muted">—</span>}
            </div>
          </div>

          {next ? (
            <button
              className={'up-btn press' + (canUpgrade ? '' : ' locked')}
              onClick={() => canUpgrade && dispatch({ type: 'UPGRADE', id: tile.id })}
              disabled={!canUpgrade}
            >
              <div className="up-btn-l">
                <span className="up-btn-arrow">▲</span>
                <div>
                  <div className="up-btn-name">Upgrade → {next.name}</div>
                  <div className="up-btn-req">
                    {next.requires?.soil && <span className={soilOK ? 'ok' : 'bad'}>soil {next.requires.soil}</span>}
                    {next.requires?.license && <span className={licOK ? 'ok' : 'bad'}>{LICENSES[next.requires.license].name.split(' — ')[0]}</span>}
                    {next.requires?.mesh && <span className="info">mesh-gated</span>}
                  </div>
                </div>
              </div>
              <CostChips cost={next.cost} />
            </button>
          ) : (
            <div className="up-max">✦ Apex tier reached — Tier 10</div>
          )}
        </div>
      )}
    </div>
  )
}

function ActionBtn({ meta, sub, accent, cost, disabled, onClick }) {
  return (
    <button className={'act-btn press' + (disabled ? ' disabled' : '')} onClick={disabled ? undefined : onClick}
      style={accent ? { '--act-accent': accent } : undefined}>
      <span className="act-ico" style={accent ? { color: accent } : undefined}>{meta.icon}</span>
      <span className="act-text">
        <span className="act-label">{meta.label}</span>
        {sub && <span className="act-sub">{sub}</span>}
        {cost && <CostChips cost={cost} />}
      </span>
    </button>
  )
}
