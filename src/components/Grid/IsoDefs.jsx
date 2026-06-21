import React from 'react'

// One hidden SVG holding every shared gradient + texture filter, referenced by
// id from each tile/building. Keeping these global means ~100 tiles share a few
// GPU filters instead of each allocating its own.
export default function IsoDefs() {
  return (
    <svg className="iso-defs" width="0" height="0" aria-hidden focusable="false">
      <defs>
        {/* ---- terrain gradients (light from top-left) ---- */}
        <linearGradient id="gPrairie" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5aa86a" />
          <stop offset="0.55" stopColor="#347a48" />
          <stop offset="1" stopColor="#1f5430" />
        </linearGradient>
        <linearGradient id="gSoil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#86603a" />
          <stop offset="0.55" stopColor="#5a3f25" />
          <stop offset="1" stopColor="#3c2917" />
        </linearGradient>
        <linearGradient id="gConcrete" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b6168" />
          <stop offset="0.55" stopColor="#3c4147" />
          <stop offset="1" stopColor="#2a2e33" />
        </linearGradient>
        <linearGradient id="gAsphalt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#474b52" />
          <stop offset="0.6" stopColor="#2e3138" />
          <stop offset="1" stopColor="#1e2127" />
        </linearGradient>
        <linearGradient id="gRiver" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#56c7e6" />
          <stop offset="0.5" stopColor="#2b8fb8" />
          <stop offset="1" stopColor="#175e85" />
        </linearGradient>

        {/* ---- contact shadow / ambient occlusion under buildings ---- */}
        <radialGradient id="isoAO" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="0.7" stopColor="rgba(0,0,0,0.32)" />
          <stop offset="1" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* ---- organic surface textures (turbulence clipped to the tile) ---- */}
        <filter id="texGrass" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55 0.8" numOctaves="2" seed="11" result="n" />
          <feColorMatrix in="n" type="matrix"
            values="0 0 0 0 0.12  0 0 0 0 0.34  0 0 0 0 0.18  0.55 0 0 0 -0.12" result="t" />
          <feComposite in="t" in2="SourceGraphic" operator="in" result="c" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="c" /></feMerge>
        </filter>
        <filter id="texDirt" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.4 0.55" numOctaves="3" seed="4" result="n" />
          <feColorMatrix in="n" type="matrix"
            values="0 0 0 0 0.20  0 0 0 0 0.13  0 0 0 0 0.07  0.5 0 0 0 -0.1" result="t" />
          <feComposite in="t" in2="SourceGraphic" operator="in" result="c" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="c" /></feMerge>
        </filter>
        <filter id="texConcrete" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.9" numOctaves="2" seed="2" result="n" />
          <feColorMatrix in="n" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.35 0 0 0 -0.08" result="t" />
          <feComposite in="t" in2="SourceGraphic" operator="in" result="c" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="c" /></feMerge>
        </filter>
        <filter id="texWater" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="turbulence" baseFrequency="0.02 0.12" numOctaves="2" seed="9" result="n">
            <animate attributeName="baseFrequency" dur="14s" values="0.02 0.12;0.03 0.16;0.02 0.12" repeatCount="indefinite" />
          </feTurbulence>
          <feColorMatrix in="n" type="matrix"
            values="0 0 0 0 0.6  0 0 0 0 0.9  0 0 0 0 1  0.3 0 0 0 -0.05" result="t" />
          <feComposite in="t" in2="SourceGraphic" operator="in" result="c" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="c" /></feMerge>
        </filter>
      </defs>
    </svg>
  )
}
