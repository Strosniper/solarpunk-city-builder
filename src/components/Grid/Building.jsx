import React from 'react'

/* =========================================================================
   Inline isometric SVG building.
   Footprint = 120 x 60 diamond. Walls extrude straight up by `wh`.
   Light source = top-left: roof brightest, left-front wall mid, right-front
   wall darkest. Windows are drawn in unit space and sheared onto each face
   with an affine matrix so they sit correctly in the isometric plane.
   ========================================================================= */

export const WALL_H = {
  mesh: (t) => 30 + t * 16,       // sleek tall skyscraper
  forge: (t) => 20 + t * 9,       // squat industrial block
  biosphere: (t) => 18 + t * 11,  // terraced green tower
}

const PAL = {
  mesh: {
    roofA: '#3f5e78', roofB: '#1a2a38',
    leftA: '#2f4659', leftB: '#15212d',
    rightA: '#1d2d3b', rightB: '#0c161e',
    win: '#63e8ff', edge: '#0c1620', parapet: '#27425a',
  },
  forge: {
    roofA: '#6f5a32', roofB: '#312715',
    leftA: '#574420', leftB: '#281e10',
    rightA: '#3a2c17', rightB: '#181107',
    win: '#ffc94f', edge: '#160f06', parapet: '#473722',
  },
  biosphere: {
    roofA: '#65d68c', roofB: '#2b6a3c',
    leftA: '#318c54', leftB: '#194a2d',
    rightA: '#236040', rightB: '#103022',
    win: '#86f3c0', edge: '#0f2a1c', parapet: '#2f7d49',
  },
}

const pt = (a) => `${a[0]},${a[1]}`

function Windows({ matrix, floors, cols, fill, edge }) {
  const padX = 0.14, top = 0.10, bottom = 0.95
  const cellW = (1 - 2 * padX) / cols
  const fh = (bottom - top) / floors
  const rects = []
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const x = padX + c * cellW + cellW * 0.2
      const y = top + f * fh + fh * 0.2
      rects.push(
        <rect key={`${f}-${c}`} x={x} y={y} width={cellW * 0.6} height={fh * 0.52}
          rx={0.012} fill={fill} stroke={edge} strokeWidth={0.012} />
      )
    }
  }
  return <g transform={matrix} className="win-grid">{rects}</g>
}

export default function Building({ pathId, tier, uid, glow, offline }) {
  const wh = WALL_H[pathId](tier)
  const p = PAL[pathId]
  const M = 50                       // top margin for roof furniture
  const viewH = 60 + wh + M
  const gid = `b${uid}`

  // vertices (y grows downward; base diamond sits at the bottom)
  const Ff = [60, viewH], Lb = [0, viewH - 30], Rb = [120, viewH - 30]
  const Tf = [60, viewH - wh], Tl = [0, viewH - 30 - wh]
  const Tr = [120, viewH - 30 - wh], Tb = [60, viewH - 60 - wh]
  const roofCy = viewH - 30 - wh

  const leftMatrix = `matrix(60 30 0 ${wh} ${Tl[0]} ${Tl[1]})`
  const rightMatrix = `matrix(60 -30 0 ${wh} ${Tf[0]} ${Tf[1]})`

  const floors = Math.min(9, Math.max(2, Math.round(wh / (pathId === 'mesh' ? 11 : 13))))
  const cols = pathId === 'mesh' ? 4 : 3

  return (
    <svg
      className={'bld' + (glow ? ' glow' : '') + (offline ? ' offline' : '')}
      viewBox={`0 0 120 ${viewH}`}
      width={120}
      height={viewH}
      style={{ '--accent': p.win, left: 0, bottom: 0 }}
    >
      <defs>
        <linearGradient id={`${gid}roof`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor={p.roofA} />
          <stop offset="1" stopColor={p.roofB} />
        </linearGradient>
        <linearGradient id={`${gid}left`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor={p.leftA} />
          <stop offset="1" stopColor={p.leftB} />
        </linearGradient>
        <linearGradient id={`${gid}right`} x1="0.2" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.rightA} />
          <stop offset="1" stopColor={p.rightB} />
        </linearGradient>
        <linearGradient id={`${gid}gloss`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="0.5" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* ground contact shadow (ambient occlusion) */}
      <ellipse cx={60} cy={viewH - 30} rx={58} ry={30} fill="url(#isoAO)" />

      {/* RIGHT (shadow) face */}
      <polygon points={`${pt(Tf)} ${pt(Tr)} ${pt(Rb)} ${pt(Ff)}`} fill={`url(#${gid}right)`} stroke={p.edge} strokeWidth="0.6" />
      <Windows matrix={rightMatrix} floors={floors} cols={cols} fill={p.win} edge={p.edge} />

      {/* LEFT (lit) face */}
      <polygon points={`${pt(Tl)} ${pt(Tf)} ${pt(Ff)} ${pt(Lb)}`} fill={`url(#${gid}left)`} stroke={p.edge} strokeWidth="0.6" />
      <Windows matrix={leftMatrix} floors={floors} cols={cols} fill={p.win} edge={p.edge} />
      {/* vertical gloss sheen across the lit face */}
      <polygon points={`${pt(Tl)} ${pt(Tf)} ${pt(Ff)} ${pt(Lb)}`} fill={`url(#${gid}gloss)`} opacity="0.25" />

      {/* ROOF (brightest) */}
      <polygon points={`${pt(Tb)} ${pt(Tr)} ${pt(Tf)} ${pt(Tl)}`} fill={`url(#${gid}roof)`} stroke={p.edge} strokeWidth="0.6" />
      {/* parapet rim */}
      <polygon points={`${pt(Tb)} ${pt(Tr)} ${pt(Tf)} ${pt(Tl)}`} fill="none" stroke={p.parapet} strokeWidth="1.4" opacity="0.8" />

      {/* ---- per-type roof furniture ---- */}
      {pathId === 'mesh' && (
        <g>
          <line x1="60" y1={roofCy} x2="60" y2={roofCy - 34} stroke={p.parapet} strokeWidth="1.6" />
          <circle className="blink" cx="60" cy={roofCy - 36} r="2.6" fill={p.win} />
          <rect x="50" y={roofCy - 6} width="20" height="6" rx="1" fill={p.roofB} opacity="0.9" />
        </g>
      )}
      {pathId === 'forge' && (
        <g>
          <rect x="64" y={roofCy - 18} width="9" height="20" rx="1.5" fill={p.roofB} stroke={p.edge} strokeWidth="0.5" />
          <rect x="46" y={roofCy - 5} width="12" height="7" rx="1" fill={p.parapet} />
          <circle className="smoke" cx="68.5" cy={roofCy - 20} r="4" fill="rgba(180,170,160,0.45)" />
        </g>
      )}
      {pathId === 'biosphere' && (
        <g className="foliage">
          <circle cx="50" cy={roofCy} r="7" fill={p.roofA} />
          <circle cx="62" cy={roofCy - 5} r="9" fill="#5fcf86" />
          <circle cx="72" cy={roofCy + 1} r="6.5" fill={p.roofA} />
          <circle cx="60" cy={roofCy - 4} r="4" fill="#9bf3bf" opacity="0.8" />
        </g>
      )}
    </svg>
  )
}
