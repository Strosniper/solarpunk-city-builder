import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame } from '../../game/state/GameContext.jsx'
import './SystemDock.css'

export default function SystemDock({ onOpenFinance }) {
  const { state, dispatch, saveNow, exportString, importString } = useGame()
  const [menu, setMenu] = useState(false)
  const [io, setIo] = useState('')
  const [flash, setFlash] = useState('')

  const doExport = () => {
    const s = exportString()
    setIo(s)
    navigator.clipboard?.writeText(s).catch(() => {})
    setFlash('Save string copied to clipboard')
    setTimeout(() => setFlash(''), 2200)
  }
  const doImport = () => {
    if (importString(io)) setFlash('City imported')
    else setFlash('Invalid save string')
    setTimeout(() => setFlash(''), 2200)
  }

  return (
    <div className="sysdock">
      <button className="sys-btn press" title="Toggle Day / Night"
        onClick={() => dispatch({ type: 'TOGGLE_TIME' })}>
        {state.time === 'night' ? '☾' : '☀'}
      </button>
      <button className="sys-btn press" title="Green Revenue Dashboard"
        onClick={onOpenFinance}>◈</button>
      <button className="sys-btn press" title="Save"
        onClick={() => { saveNow(); setFlash('City saved'); setTimeout(() => setFlash(''), 1600) }}>⤓</button>
      <button className={'sys-btn press ' + (menu ? 'on' : '')} title="Transfer save"
        onClick={() => setMenu((m) => !m)}>⇄</button>

      <AnimatePresence>
        {menu && (
          <motion.div className="sys-pop glass glass-strong"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16 }}>
            <div className="pop-title">Export / Import Save</div>
            <textarea className="pop-area" value={io} placeholder="Paste a save string here…"
              onChange={(e) => setIo(e.target.value)} spellCheck={false} />
            <div className="pop-row">
              <button className="pop-act press" onClick={doExport}>Export</button>
              <button className="pop-act press" onClick={doImport}>Import</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {flash && (
          <motion.div className="sys-flash glass"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {flash}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
