// 2:1 isometric projection constants. The whole city is drawn in screen space
// (no CSS 3D rotation) so we get full control over building façades, depth and
// paint order — the way classic browser city-builders are rendered.
export const TW = 120          // tile footprint width  (diamond)
export const TH = 60           // tile footprint height (diamond)
export const TOP_PAD = 320     // headroom above the grid for tall towers

// world (grid) coords -> screen offset of the tile's top-left bounding box
export function isoPos(x, y) {
  return {
    sx: (x - y) * (TW / 2),
    sy: (x + y) * (TH / 2),
  }
}

// origin shift so the left-most column lands at x=0 instead of negative
export function originX(rows) {
  return (rows - 1) * (TW / 2)
}
