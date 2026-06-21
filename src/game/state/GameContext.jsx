import React, { createContext, useContext, useEffect, useReducer, useRef, useCallback } from 'react'
import { gameReducer } from './gameReducer.js'
import { createInitialState } from './initialState.js'
import { saveCity, loadCity, exportSave, importSave } from '../hooks/useLocalStorage.js'

const GameCtx = createContext(null)

const TICK_MS = 1000        // simulation cadence
const AUTOSAVE_MS = 60000   // persist every 60s per spec

function init() {
  return loadCity() || createInitialState()
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, init)
  const stateRef = useRef(state)
  stateRef.current = state

  // --- simulation loop ---
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), TICK_MS)
    return () => clearInterval(id)
  }, [])

  // --- autosave loop (reads latest via ref so the interval never restarts) ---
  useEffect(() => {
    const id = setInterval(() => saveCity(stateRef.current), AUTOSAVE_MS)
    // also persist on tab hide so a refresh never loses progress
    const onHide = () => saveCity(stateRef.current)
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('beforeunload', onHide)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('beforeunload', onHide)
    }
  }, [])

  // reflect day/night onto <body> for the CSS theme
  useEffect(() => {
    document.body.dataset.time = state.time
  }, [state.time])

  const api = {
    state,
    dispatch,
    saveNow: useCallback(() => saveCity(stateRef.current), []),
    exportString: useCallback(() => exportSave(stateRef.current), []),
    importString: useCallback((str) => {
      const parsed = importSave(str)
      if (parsed) dispatch({ type: 'LOAD', payload: parsed })
      return !!parsed
    }, []),
  }

  return <GameCtx.Provider value={api}>{children}</GameCtx.Provider>
}

export function useGame() {
  const ctx = useContext(GameCtx)
  if (!ctx) throw new Error('useGame must be used within <GameProvider>')
  return ctx
}
