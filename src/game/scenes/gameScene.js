import { get } from 'svelte/store'
import { TILE_SIZE } from '../kaplay.js'
import { CAVERN_MAP } from '../levels/cavernLayout.js'
import {
  resetRunState, runActive, paused, runTime, gameOver, gameWon,
  playerHP, maxHP, hasPickaxe, hasSword, inBattle, metaProgress,
  visionRange, enemiesKilled, rocksCount, waterCount,
} from '../gameState.js'
import {
  spawnPlayer, getPlayer, movePlayer, updatePlayer,
  isPlayerMoving, getPlayerGridPos,
} from '../entities/player.js'
import { spawnAll } from '../entities/enemySpawner.js'
import { handleItemPickup, applyEquipmentBonuses } from '../entities/items.js'
import { startBattle } from '../battle/battleManager.js'
import { createBattleUI, destroyBattleUI } from '../battle/battleUI.js'
import { loadMetaProgress, saveMetaProgress } from '../saveManager.js'

let timerInterval = null
export const inputCtrl = { push: null, release: null }

export function setupScene(k) {
  k.scene('cavern', () => {
    if (timerInterval) clearInterval(timerInterval)

    const savedMeta = loadMetaProgress()
    if (savedMeta) metaProgress.set(savedMeta)
    resetRunState()

    const meta = get(metaProgress)
    let baseTime = 30
    if (meta.timeUpgrade) baseTime += 90
    runTime.set(baseTime)
    applyEquipmentBonuses()

    k.setBackground(10, 10, 18)

    const COLS = CAVERN_MAP[0].length
    const ROWS = CAVERN_MAP.length

    const chunkInfo = window.__levelChunks
    if (chunkInfo) {
      for (let cy = 0; cy < chunkInfo.numChunksY; cy++)
        for (let cx = 0; cx < chunkInfo.numChunksX; cx++)
          k.add([
            k.sprite(`lvl-${cx}-${cy}`),
            k.pos(cx * chunkInfo.chunkSize * TILE_SIZE, cy * chunkInfo.chunkSize * TILE_SIZE),
            k.z(0),
          ])
    }

    spawnAll(k, CAVERN_MAP)

    spawnPlayer(2, 2)
    k.camScale(1)
    runActive.set(true)

    const inputQueue = []
    let heldDir = null

    inputCtrl.push = (dx, dy) => {
      if (get(paused) || get(inBattle) || get(gameOver) || get(gameWon)) return
      heldDir = [dx, dy]
      inputQueue.push([dx, dy])
    }
    inputCtrl.release = () => { heldDir = null }

    function isWalkable(px, py) {
      const col = Math.floor(px / TILE_SIZE)
      const row = Math.floor(py / TILE_SIZE)
      if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return false
      const cell = CAVERN_MAP[row][col]
      if (cell === '#') return false
      if (cell === 'x' && !get(hasPickaxe)) return false
      if ((cell === 'g' || cell === 'a' || cell === 'G') && !get(hasSword)) return false
      return true
    }

    function showMessage(text) {
      k.add([
        k.text(text, { size: 22 }),
        k.pos(k.width() / 2, k.height() - 30),
        k.anchor('center'), k.color(255, 255, 100),
        k.z(100), k.fixed(), k.lifespan(1.8),
      ])
    }

    let exitPos = null
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (CAVERN_MAP[r][c] === 'E') exitPos = { x: c, y: r }

    function checkExitTile() {
      if (get(gameWon) || get(gameOver)) return
      const pos = getPlayerGridPos()
      if (!pos || !exitPos) return
      if (pos.x === exitPos.x && pos.y === exitPos.y) {
        if (!get(hasPickaxe)) { showMessage('A saída está bloqueada por pedras!'); return }
        gameWon.set(true)
        runActive.set(false)
        const m = get(metaProgress)
        m.totalRuns++; m.totalEscapes++
        if (!m.timeUpgrade) m.timeUpgrade = true
        const remaining = get(runTime)
        if (remaining > m.bestTime) m.bestTime = remaining
        m.totalEnemiesKilled = (m.totalEnemiesKilled || 0) + get(enemiesKilled)
        saveMetaProgress(m)
        k.add([k.text('Vitória!', { size: 48 }), k.pos(k.width() / 2, k.height() / 2),
          k.anchor('center'), k.color(100, 255, 100), k.z(200), k.fixed()])
        k.wait(4, () => k.go('cavern'))
      }
    }

    k.onCollide('player', 'item', (p, item) => {
      if (get(inBattle) || get(gameOver) || get(gameWon) || get(paused)) return
      handleItemPickup(item)
    })

    timerInterval = setInterval(() => {
      if (get(paused) || get(gameOver) || get(gameWon)) return
      runTime.update(t => {
        if (t <= 1) {
          gameOver.set(true); runActive.set(false)
          const m = get(metaProgress)
          m.totalRuns++
          saveMetaProgress(m)
          k.wait(2, () => k.go('cavern'))
          return 0
        }
        return t - 1
      })
    }, 1000)

    function createHUD() {
      const hpText = k.add([
        k.text('HP: 30/30', { size: 24 }), k.pos(12, 12),
        k.color(255, 80, 80), k.fixed(), k.z(90), 'hud-hp',
      ])
      const timeText = k.add([
        k.text('0:00', { size: 24 }),
        k.pos(k.width() - 12, 12), k.anchor('topright'),
        k.color(200, 200, 255), k.fixed(), k.z(90), 'hud-time',
      ])
      const invText = k.add([
        k.text('', { size: 18 }), k.pos(12, 40),
        k.color(200, 200, 180), k.fixed(), k.z(90), 'hud-inv',
      ])
      const eqText = k.add([
        k.text('', { size: 18 }), k.pos(12, 64),
        k.color(180, 200, 180), k.fixed(), k.z(90), 'hud-eq',
      ])
      k.onUpdate(() => {
        if (!getPlayer()) return
        hpText.text = `HP: ${get(playerHP)}/${get(maxHP)}`
        const t = get(runTime)
        timeText.text = `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`
        invText.text = `Pedras:${get(rocksCount)}  Água:${get(waterCount)}`
        const eq = get(metaProgress).ownedEquipment
        eqText.text = eq.length > 0 ? eq.join(' ') : ''
      })
    }
    createHUD()

    const revealed = new Set()
    const fogPool = new Map()

    function revealTiles(cx, cy, radius) {
      for (let r = cy - radius; r <= cy + radius; r++)
        for (let c = cx - radius; c <= cx + radius; c++)
          if (Math.sqrt((c - cx) ** 2 + (r - cy) ** 2) <= radius && r >= 0 && r < ROWS && c >= 0 && c < COLS)
            revealed.add(`${r},${c}`)
    }

    function getFogTile(row, col) {
      const key = `${row},${col}`
      let tile = fogPool.get(key)
      if (!tile) {
        tile = k.add([k.rect(TILE_SIZE, TILE_SIZE), k.pos(col * TILE_SIZE, row * TILE_SIZE),
          k.color(0, 0, 0, 0.85), k.z(20), 'fog-tile'])
        fogPool.set(key, tile)
      }
      return tile
    }

    function updateFog() {
      const pPos = getPlayerGridPos()
      if (!pPos) return
      revealTiles(pPos.x, pPos.y, get(visionRange))
      const camPos = k.camPos()
      const vl = Math.floor((camPos.x - k.width() / 2) / TILE_SIZE) - 1
      const vr = Math.floor((camPos.x + k.width() / 2) / TILE_SIZE) + 1
      const vt = Math.floor((camPos.y - k.height() / 2) / TILE_SIZE) - 1
      const vb = Math.floor((camPos.y + k.height() / 2) / TILE_SIZE) + 1
      for (const tile of fogPool.values()) tile.hidden = true
      for (let r = vt; r <= vb; r++)
        for (let c = vl; c <= vr; c++)
          if (r >= 0 && r < ROWS && c >= 0 && c < COLS && !revealed.has(`${r},${c}`)) {
            const fog = getFogTile(r, c)
            fog.hidden = false
            fog.pos.x = c * TILE_SIZE
            fog.pos.y = r * TILE_SIZE
          }
    }

    let lastFogKey = null
    let moveTargetCell = null

    k.onUpdate(() => {
      if (get(paused)) { updatePlayer(k.dt()); return }
      updatePlayer(k.dt())

      // 1) Grid check: célula recém-pisada (antes de processar novo movimento)
      if (!isPlayerMoving() && moveTargetCell && !get(inBattle) && !get(gameOver) && !get(gameWon)) {
        const { x: mc, y: mr } = moveTargetCell
        moveTargetCell = null
        if (mr >= 0 && mr < ROWS && mc >= 0 && mc < COLS) {
          const cell = CAVERN_MAP[mr][mc]
          if ((cell === 'r' || cell === 'b' || cell === 'g' || cell === 'a' || cell === 'G') && !get(inBattle)) {
            const enemyObj = k.get('enemy').find(e => {
              const ec = Math.floor(e.pos.x / TILE_SIZE)
              const er = Math.floor(e.pos.y / TILE_SIZE)
              return ec === mc && er === mr
            })
            if (enemyObj) {
              const key = enemyObj.enemyKey
              if ((key === 'g' || key === 'a' || key === 'G') && !get(hasSword)) {
                showMessage('Preciso de algo mais forte...')
              } else {
                inputQueue.length = 0
                inBattle.set(true) // Congela o jogador, mas não abre o menu
                startBattle(enemyObj, (won) => {
                  if (!won) {
                    gameOver.set(true); runActive.set(false)
                    const m = get(metaProgress)
                    m.totalRuns++
                    m.totalEnemiesKilled = (m.totalEnemiesKilled || 0) + get(enemiesKilled)
                    saveMetaProgress(m)
                    k.add([k.text('Derrota!', { size: 48 }), k.pos(k.width()/2, k.height()/2),
                      k.anchor('center'), k.color(255, 80, 80), k.z(200), k.fixed()])
                    k.wait(3, () => k.go('cavern'))
                  } else {
                    if (enemyObj.labelRef) k.destroy(enemyObj.labelRef)
                    k.destroy(enemyObj)
                    destroyBattleUI()
                    inBattle.set(false) // Libera o jogador ao vencer
                    if (key === 'G') {
                      moveTargetCell = null
                      inputQueue.length = 0
                      for (const rock of k.get('rock-obstacle')) k.destroy(rock)
                      showMessage('Picareta adquirida! Pedras destruídas!')
                    }
                  }
                })
                createBattleUI()
              }
            }
          } else if (cell === 'E' && !get(gameWon) && !get(gameOver)) {
            checkExitTile()
          }
          const itemChars =         { t: 1, p: 1, w: 1, S: 1, '1': 1, '2': 1, '4': 1 }
          if (itemChars[cell] && !get(inBattle)) {
            const itemObj = k.get('item').find(e => {
              const ec = Math.floor(e.pos.x / TILE_SIZE)
              const er = Math.floor(e.pos.y / TILE_SIZE)
              return ec === mc && er === mr
            })
            if (itemObj) handleItemPickup(itemObj)
          }
        }
      }

      // 2) Queue direção segurada
      if (!isPlayerMoving() && heldDir && inputQueue.length === 0)
        inputQueue.push(heldDir)

      // 3) Processar próximo movimento
      if (inputQueue.length > 0 && !get(inBattle) && !get(gameOver) && !get(gameWon)) {
        const [dx, dy] = inputQueue.shift()
        const p = getPlayer()
        if (p) moveTargetCell = {
          x: Math.floor((p.pos.x + dx * TILE_SIZE) / TILE_SIZE),
          y: Math.floor((p.pos.y + dy * TILE_SIZE) / TILE_SIZE),
        }
        movePlayer(dx, dy, (tx, ty) => isWalkable(tx, ty))
      }

      // 4) Câmera e fog
      const p = getPlayer()
      if (p) {
        k.camPos(p.pos)
        const gPos = getPlayerGridPos()
        const fk = `${gPos.x},${gPos.y}`
        if (fk !== lastFogKey) { lastFogKey = fk; updateFog(); checkExitTile() }
      }
    })
  })
}
