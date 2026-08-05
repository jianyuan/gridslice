export const UPLOAD_ASPECT = 4 / 5 // 0.8   width / height
export const GRID_ASPECT = 3 / 4 // 0.75  width / height

/** Standard Instagram portrait upload height in pixels. */
export const DEFAULT_TILE_HEIGHT = 1350

export type TileGeometry = {
  tileHeight: number
  tileWidth: number // full 4:5 upload width
  contentWidth: number // visible 3:4 safe zone width
  marginSide: number // left/right margin in px
  marginPct: number // margin per side as % of tile width
  contentPct: number // safe-zone width as % of tile width
}

export function getTileGeometry(
  tileHeight = DEFAULT_TILE_HEIGHT,
): TileGeometry {
  const tileWidth = tileHeight * UPLOAD_ASPECT
  const contentWidth = tileHeight * GRID_ASPECT
  const marginSide = (tileWidth - contentWidth) / 2
  return {
    tileHeight,
    tileWidth,
    contentWidth,
    marginSide,
    marginPct: (marginSide / tileWidth) * 100,
    contentPct: (contentWidth / tileWidth) * 100,
  }
}

/**
 * Overall crop aspect (width / height) the user should select for a
 * `rows` × `columns` block of 3:4 tiles.
 *   width  = columns * 3   (content units)
 *   height = rows    * 4   (content units)
 * e.g. 1×3 -> 9/4 = 2.25, 3×3 -> 9/12 = 0.75, 2×3 -> 9/8 = 1.125.
 */
export function overallCropAspect(columns: number, rows = 1): number {
  return (columns * 3) / (rows * 4)
}

export type PixelCrop = { x: number; y: number; width: number; height: number }

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = src
  })
}

export type GeneratedTile = {
  /** 4:5 image with side margins — this is what you upload to Instagram. */
  uploadUrl: string
  /** 3:4 center crop — exactly what shows in the profile grid. */
  gridUrl: string
  /** Zero-based row index (top to bottom). */
  row: number
  /** Zero-based column index (left to right). */
  col: number
}

/**
 * Split a cropped region of the source image into a `rows` × `columns` block of
 * cells and render each one as a padded 4:5 tile plus its 3:4 grid preview.
 * Tiles are returned in reading order (row-major: left→right, top→bottom).
 */
export async function generateTiles(opts: {
  imageSrc: string
  crop: PixelCrop
  columns: number
  rows?: number
  marginColor: string
  tileHeight?: number
}): Promise<GeneratedTile[]> {
  const { imageSrc, crop, columns, marginColor } = opts
  const rows = opts.rows ?? 1
  const geo = getTileGeometry(opts.tileHeight ?? DEFAULT_TILE_HEIGHT)
  const image = await loadImage(imageSrc)

  const srcColWidth = crop.width / columns
  const srcRowHeight = crop.height / rows
  const tiles: GeneratedTile[] = []

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const sx = crop.x + c * srcColWidth
      const sy = crop.y + r * srcRowHeight
      const sw = srcColWidth
      const sh = srcRowHeight

      // --- 4:5 upload tile with left/right margin ---------------------------
      const upload = document.createElement('canvas')
      upload.width = Math.round(geo.tileWidth)
      upload.height = Math.round(geo.tileHeight)
      const uctx = upload.getContext('2d')!
      uctx.imageSmoothingQuality = 'high'
      uctx.fillStyle = marginColor
      uctx.fillRect(0, 0, upload.width, upload.height)
      uctx.drawImage(
        image,
        sx,
        sy,
        sw,
        sh,
        geo.marginSide,
        0,
        geo.contentWidth,
        geo.tileHeight,
      )

      // --- 3:4 grid preview (no margin, this is the visible crop) -----------
      const grid = document.createElement('canvas')
      grid.width = Math.round(geo.contentWidth)
      grid.height = Math.round(geo.tileHeight)
      const gctx = grid.getContext('2d')!
      gctx.imageSmoothingQuality = 'high'
      gctx.drawImage(image, sx, sy, sw, sh, 0, 0, grid.width, grid.height)

      tiles.push({
        uploadUrl: upload.toDataURL('image/png'),
        gridUrl: grid.toDataURL('image/png'),
        row: r,
        col: c,
      })
    }
  }

  return tiles
}
