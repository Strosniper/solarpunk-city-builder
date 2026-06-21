import React, { useState } from 'react'
import { useGame } from './game/state/GameContext.jsx'
import TopResourceBar from './components/Hud/TopResourceBar.jsx'
import IsoGrid from './components/Grid/IsoGrid.jsx'
import IsoDefs from './components/Grid/IsoDefs.jsx'
import ContextualActionDock from './components/Dock/ContextualActionDock.jsx'
import SystemDock from './components/Hud/SystemDock.jsx'
import FinancePanel from './components/Panels/FinancePanel.jsx'
import Particles from './components/Effects/Particles.jsx'
import './App.css'

export default function App() {
  const { state } = useGame()
  const [financeOpen, setFinanceOpen] = useState(false)

  return (
    <div className="app" data-time={state.time}>
      <IsoDefs />
      <Particles />
      <TopResourceBar />
      <SystemDock onOpenFinance={() => setFinanceOpen(true)} />

      <main className="stage">
        <IsoGrid />
      </main>

      <ContextualActionDock />
      <FinancePanel open={financeOpen} onClose={() => setFinanceOpen(false)} />

      <div className="vignette" aria-hidden />
    </div>
  )
}
