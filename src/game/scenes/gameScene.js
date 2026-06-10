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
import { togglePause } from '../ui/pauseMenu.js'
import { showGameOver } from '../ui/gameOverUI.js'
import { trocarEstadoDoJogo } from '../../Estado.js'

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
          showGameOver(k)
          return 0
        }
        return t - 1
      })
    }, 1000)

    // ── HUD ──────────────────────────────────────────────────────
    function createHUD() {
      const hpFrame = k.add([
        k.sprite('mold'),
        k.scale(3),
        k.pos(10, 20),
        k.fixed(), k.z(89), 'hud-hp-bg',
      ])

      const hpFill = k.add([
        k.sprite('bar'),
        k.scale(3),
        k.pos(69, 50),
        k.fixed(), k.z(88), 'hud-hp-fill',
      ])

      const hpText = k.add([
        k.text('HP: 30/30', { size: 16, font: 'forwa' }),
        k.pos(10, 20),
        k.anchor('left'),
        k.color(255, 255, 255), k.fixed(), k.z(91), 'hud-hp',
      ])

      const timeText = k.add([
        k.text('0:00', { size: 48 }),
        k.pos(k.width() / 2, 40),
        k.anchor('center'),
        k.color(212, 184, 120), k.fixed(), k.z(90), 'hud-time',
      ])

      const invText = k.add([
        k.text('', { size: 16 }),
        k.pos(14, 75),
        k.color(200, 200, 180), k.fixed(), k.z(90), 'hud-inv',
      ])

      const eqText = k.add([
        k.text('', { size: 16 }),
        k.pos(14, 99),
        k.color(180, 200, 180), k.fixed(), k.z(90), 'hud-eq',
      ])

      k.onUpdate(() => {
        if (!getPlayer()) return
        const hp = get(playerHP)
        const mhp = get(maxHP)
        const ratio = Math.max(0, hp / mhp)
        hpFill.scale.x = ratio * 3
        if (ratio > 0.5) {
          hpFill.color = k.Color.fromHex('#50c850')
        } else if (ratio > 0.25) {
          hpFill.color = k.Color.fromHex('#c89632')
        } else {
          hpFill.color = k.Color.fromHex('#ff3232')
        }
        hpText.text = `HP: ${hp}/${mhp}`
        const t = get(runTime)
        timeText.text = `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`
        invText.text = `\u25C6 Pedras:${get(rocksCount)}  \u2668 Água:${get(waterCount)}`
        const eq = get(metaProgress).ownedEquipment
        eqText.text = eq.length > 0 ? eq.join('  ') : ''
      })
    }
    createHUD()

    // ── Pause button ─────────────────────────────────────────────
    k.add([
      k.sprite('pause-btn'),
      k.scale(1.5),
      k.pos(k.width() - 40, 40),
      k.fixed(),
      k.area(),
      k.anchor('center'),
      k.z(90),
      'pause-btn',
    ])

    // ── ESC / P pause toggling ───────────────────────────────────
    k.onKeyPress('escape', () => {
      if (get(gameOver) || get(gameWon)) return
      togglePause(k)
    })
    k.onKeyPress('p', () => {
      if (get(gameOver) || get(gameWon)) return
      togglePause(k)
    })
    k.onClick('pause-btn', () => {
      if (get(gameOver) || get(gameWon)) return
      togglePause(k)
    })

    // ── Pause-menu button handlers ───────────────────────────────
    k.onClick('resumeButton', (btn) => {
      btn.frame = 1
      k.wait(0.1, () => togglePause(k))
    })
    k.onClick('restartButton', (btn) => {
      btn.frame = 1
      k.wait(0.1, () => k.go('cavern'))
    })
    k.onClick('exitButton', (btn) => {
      btn.frame = 1
      k.wait(0.1, () => {
        paused.set(false)
        runActive.set(false)
        trocarEstadoDoJogo('menu')
      })
    })

    // ── Fog of war ───────────────────────────────────────────────
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
                inBattle.set(true)
                startBattle(enemyObj, (won) => {
                  if (!won) {
                    destroyBattleUI()
                    gameOver.set(true); runActive.set(false)
                    const m = get(metaProgress)
                    m.totalRuns++
                    m.totalEnemiesKilled = (m.totalEnemiesKilled || 0) + get(enemiesKilled)
                    saveMetaProgress(m)
                    showGameOver(k)
                  } else {
                    if (enemyObj.labelRef) k.destroy(enemyObj.labelRef)
                    k.destroy(enemyObj)
                    destroyBattleUI()
                    inBattle.set(false)
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
          const itemChars = { t: 1, p: 1, w: 1, S: 1, '1': 1, '2': 1, '4': 1 }
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

    // ── Cleanup on scene re-enter ────────────────────────────────
    k.on('sceneLeave', () => {
      if (timerInterval) clearInterval(timerInterval)
    })
  })
}
