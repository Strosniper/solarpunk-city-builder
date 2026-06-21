import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../../game/state/GameContext.jsx'
import { RESOURCES } from '../../game/config/resources.js'
import { LICENSES } from '../../game/config/tiers.js'
import './FinancePanel.css'

const ACADEMY_COST = { class6: 800, class63: 1100 }

function Gauge({ label, value, unit, color, flow }) {
  return (
    <div className="gauge">
      <div className="gauge-top">
        <span className="gauge-label">{label}</span>
        {flow !== undefined && (
          <span className={'gauge-flow ' + (flow >= 0 ? 'pos' : 'neg')}>
            {flow >= 0 ? '+' : ''}{flow.toFixed(1)}/s
          </span>
        )}
      </div>
      <div className="gauge-val" style={{ color }}>{Math.floor(value).toLocaleString()}<small>{unit}</small></div>
      <div className="gauge-track"><div style={{ width: `${Math.min(100, Math.abs(value) / 50)}%`, background: color }} /></div>
    </div>
  )
}

export default function FinancePanel({ open, onClose }) {
  const { state, dispatch } = useGame()
  const { resources, flows = {}, meta = {} } = state
  const buildings = state.grid.filter((t) => t.building)
  const online = state.grid.filter((t) => t.online).length
  const creditFlow = flows.credits || 0
  const bankruptcyRisk = resources.credits < 200 && creditFlow < 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fin-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}>
          <motion.div className="fin glass glass-strong"
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 26 }}
            onClick={(e) => e.stopPropagation()}>

            <div className="fin-head">
              <div>
                <div className="fin-kicker">GREEN REVENUE DASHBOARD</div>
                <div className="fin-title">Civic Endowment & Resource Flows</div>
              </div>
              <button className="fin-close press" onClick={onClose}>✕</button>
            </div>

            {bankruptcyRisk && (
              <div className="fin-alert">⚠ Treasury critical — net credit flow is negative. Curb consumption or raise Forge output.</div>
            )}

            <div className="fin-gauges">
              <Gauge label="Treasury" value={resources.credits} unit="◈" color="var(--neon-gold)" flow={creditFlow} />
              <Gauge label="Kinetic Energy" value={resources.energy} unit="kW" color="var(--neon-lime)" flow={flows.energy} />
              <Gauge label="Purified Water" value={resources.water} unit="❍" color="var(--neon-cyan)" flow={flows.water} />
              <Gauge label="Biomass" value={resources.food} unit="✿" color="var(--neon-green)" flow={flows.food} />
              <Gauge label="Civic Trust" value={resources.civicTrust} unit="♥" color="var(--neon-rose)" flow={flows.civicTrust} />
              <Gauge label="Solar Materials" value={resources.materials} unit="◇" color="var(--neon-cyan)" flow={flows.materials} />
            </div>

            <div className="fin-grid">
              <div className="fin-card">
                <div className="fin-card-title">Infrastructure</div>
                <div className="fin-stat"><span>Structures</span><b>{buildings.length}</b></div>
                <div className="fin-stat"><span>Online now</span><b className="ok">{online}</b></div>
                <div className="fin-stat"><span>Mesh relays</span><b>{meta.relayCount ?? 0}</b></div>
                <div className="fin-stat"><span>Tiles in coverage</span><b>{meta.coveredCount ?? 0}</b></div>
              </div>

              <div className="fin-card">
                <div className="fin-card-title">Workforce Academies</div>
                <p className="fin-note">Tier 7+ buildings need certified labor. Fund academies to unlock licenses.</p>
                {Object.values(LICENSES).map((lic) => {
                  const owned = !!state.licenses[lic.id]
                  const cost = ACADEMY_COST[lic.id]
                  const can = resources.credits >= cost
                  return (
                    <div className="lic-row" key={lic.id}>
                      <div className="lic-info">
                        <div className="lic-name">{lic.name}</div>
                        <div className="lic-guild">Guild: {lic.guild}</div>
                      </div>
                      {owned ? (
                        <span className="lic-owned">✓ Certified</span>
                      ) : (
                        <button className={'lic-fund press' + (can ? '' : ' locked')}
                          disabled={!can}
                          onClick={() => dispatch({ type: 'FUND_ACADEMY', licenseId: lic.id })}>
                          Fund · {cost}◈
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="fin-log">
              <div className="fin-card-title">City Log</div>
              <div className="log-scroll">
                {state.log.slice(0, 12).map((l, i) => (
                  <div className="log-line" key={i}><span className="log-dot" />{l.msg}</div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
