import React from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../../game/state/GameContext.jsx'
import { RESOURCE_ORDER, RESOURCES } from '../../game/config/resources.js'
import './TopResourceBar.css'

function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 10_000) return (n / 1000).toFixed(1) + 'k'
  return Math.floor(n).toLocaleString()
}

export default function TopResourceBar() {
  const { state } = useGame()
  const { resources, flows = {} } = state

  return (
    <motion.header
      className="resbar glass glass-strong"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
    >
      <div className="resbar-brand">
        <span className="brand-mark">❂</span>
        <span className="brand-name">VERDANCY</span>
      </div>

      <div className="resbar-track">
        {RESOURCE_ORDER.map((key) => {
          const r = RESOURCES[key]
          const flow = flows[key] || 0
          const showFlow = r.kind === 'flow' || Math.abs(flow) > 0.001
          return (
            <div className="res-chip" key={key} title={r.label}>
              <span className="res-ico" style={{ color: r.color }}>{r.icon}</span>
              <span className="res-meta">
                <motion.span
                  key={Math.floor(resources[key])}
                  className="res-val"
                  initial={{ y: -6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.18 }}
                >
                  {fmt(resources[key])}
                </motion.span>
                {showFlow && (
                  <span className={'res-flow ' + (flow >= 0 ? 'pos' : 'neg')}>
                    {flow >= 0 ? '+' : ''}{flow.toFixed(1)}/s
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>
    </motion.header>
  )
}
