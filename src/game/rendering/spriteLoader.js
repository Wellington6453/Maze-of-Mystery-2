import { TILE_SIZE } from '../kaplay.js'

export async function loadGameSprites(k) {
  await k.loadSpriteAtlas('/assets/sprites/Player.png', {
    Kael: {
      x: 0, y: 0, width: 192, height: 320, sliceX: 6, sliceY: 10,
      anims: {
        'idle-down':   { from: 0,  to: 5,  speed: 3,  loop: true },
        'idle-right':  { from: 6,  to: 11, speed: 5,  loop: true },
        'idle-up':     { from: 12, to: 17, speed: 5,  loop: true },
        'run-down':    { from: 18, to: 23, speed: 13, loop: true },
        'run-right':   { from: 24, to: 29, speed: 13, loop: true },
        'run-up':      { from: 30, to: 35, speed: 13, loop: true },
        'attack-down': { from: 36, to: 39, speed: 5,  loop: true },
        'attack-right':{ from: 42, to: 45, speed: 5,  loop: true },
        'attack-up':   { from: 48, to: 51, speed: 5,  loop: true },
        'dead':        { from: 54, to: 57, speed: 3,  loop: false },
      },
    },
  })

  await k.loadSprite('heart', '/assets/sprites/heart.png')
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function createLevelTexture(k, mapData) {
  const cols = mapData[0].length
  const rows = mapData.length
  const ts = TILE_SIZE
  const chunk = 24

  const floorImg = await loadImage('/assets/sprites/free_floor_TileSheet.png')
  const wallsImg = await loadImage('/assets/sprites/free_walls&doors_TileSheet.png')

  // Floor: tile único (13,3) — marrom com pedras arredondadas
  const floorFrame = { x: 13 * 16, y: 3 * 16 }

  // Walls: dois tiles fixos da seção Brown Wall Tiles (row 2)
  // wall_horizontal (col 3, row 2) → pixel (48, 32) — parede larga
  // wall_vertical   (col 1, row 2) → pixel (16, 32) — pilar estreito vertical
  const wallHFrames = [{ x: 48, y: 32 }]
  const wallVFrames = [{ x: 16, y: 32 }]

  const numChunksX = Math.ceil(cols / chunk)
  const numChunksY = Math.ceil(rows / chunk)

  const loadPromises = []
  for (let cy = 0; cy < numChunksY; cy++) {
    for (let cx = 0; cx < numChunksX; cx++) {
      const startCol = cx * chunk
      const startRow = cy * chunk
      const endCol = Math.min(startCol + chunk, cols)
      const endRow = Math.min(startRow + chunk, rows)

      const canvas = document.createElement('canvas')
      canvas.width = (endCol - startCol) * ts
      canvas.height = (endRow - startRow) * ts
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = false

      for (let r = startRow; r < endRow; r++) {
        for (let c = startCol; c < endCol; c++) {
          const ch = mapData[r][c]
          if (ch === '#') {
            const up = r > 0 && mapData[r - 1][c] === '#'
            const down = r < rows - 1 && mapData[r + 1][c] === '#'
            const left = c > 0 && mapData[r][c - 1] === '#'
            const right = c < cols - 1 && mapData[r][c + 1] === '#'
            const vertical = (up && down) || (up && !left && !right) || (down && !left && !right)
            const horizontal = (left && right) || (left && !up && !down) || (right && !up && !down)
            const frame = (horizontal && !vertical ? wallHFrames : wallVFrames)[0]
            ctx.drawImage(wallsImg, frame.x, frame.y, 16, 16, (c - startCol) * ts | 0, (r - startRow) * ts | 0, ts, ts)
          } else {
            ctx.drawImage(floorImg, floorFrame.x, floorFrame.y, 16, 16, (c - startCol) * ts | 0, (r - startRow) * ts | 0, ts, ts)
          }
        }
      }

      loadPromises.push(k.loadSprite(`lvl-${cx}-${cy}`, canvas))
    }
  }

  await Promise.all(loadPromises)
  return { numChunksX, numChunksY, chunkSize: chunk }
}
