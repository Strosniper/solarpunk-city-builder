// Robust persistence layer. Auto-saves the entire city, and produces a
// portable Base64 "save string" for Export / Import.
const KEY = 'verdancy.save.v1'

export function saveCity(state) {
  try {
    const payload = JSON.stringify({ ...state, savedAt: Date.now() })
    localStorage.setItem(KEY, payload)
    return true
  } catch (e) {
    console.error('[save] failed', e)
    return false
  }
}

export function loadCity() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.version !== 1) return null
    return parsed
  } catch (e) {
    console.error('[load] failed', e)
    return null
  }
}

export function clearCity() {
  try { localStorage.removeItem(KEY) } catch (_) {}
}

// Encode/decode unicode-safe Base64 for the share/transfer string.
export function exportSave(state) {
  const json = JSON.stringify(state)
  const bytes = new TextEncoder().encode(json)
  let bin = ''
  bytes.forEach((b) => { bin += String.fromCharCode(b) })
  return btoa(bin)
}

export function importSave(str) {
  try {
    const bin = atob(str.trim())
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json)
    if (!parsed || parsed.version !== 1) throw new Error('Unsupported save version')
    return parsed
  } catch (e) {
    console.error('[import] failed', e)
    return null
  }
}
