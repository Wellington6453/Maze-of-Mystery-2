import { get } from 'svelte/store'
import { TILE_SIZE } from '../kaplay.js'
import { CAVERN_MAP } from '../levels/cavernLayout.js'
import {
  resetRunState, runActive, paused, runTime, gameOver, gameWon,
  playerHP, maxHP, hasPickaxe, hasSword, inBattle, metaProgress,
  visionRange, enemiesKilled,
  runFogData, collectedTimeItems, resetPersistentRunData,
  collectedItemsPositions, collectedChecklistItems
} from '../gameState.js'
import {
  spawnPlayer, getPlayer, movePlayer, updatePlayer,
  isPlayerMoving, getPlayerGridPos,
} from '../entities/player.js'
import { spawnAll } from '../entities/enemySpawner.js'
import { handleItemPickup } from '../entities/items.js'
import { startBattle } from '../battle/battleManager.js'
import { createBattleUI, destroyBattleUI } from '../battle/battleUI.js'
import { loadMetaProgress, saveMetaProgress } from '../saveManager.js'
import { togglePause } from '../ui/pauseMenu.js'
import { showGameOver, showDesmoronamento } from '../ui/gameOverUI.js'
import { trocarEstadoDoJogo } from '../../Estado.js'

let timerInterval = null
let shakeInterval = null
export const inputCtrl = { push: null, release: null }

export function setupScene(k) {
  k.scene('cavern', () => {
    if (timerInterval) clearInterval(timerInterval)
    const savedMeta = loadMetaProgress()
    if (savedMeta) metaProgress.set(savedMeta)
    
    resetRunState()
    
    const meta = get(metaProgress)
    let baseTime = 30 + (get(collectedTimeItems) * 60)
    
    if (meta.timeUpgrade) baseTime += 90
    runTime.set(baseTime)
    
    k.setBackground(10, 10, 18)
    
    const COLS = CAVERN_MAP[0].length
    const ROWS = CAVERN_MAP.length
    
    // ── Filtragem do mapa: Apaga itens pegos e junta a string corretamente ──
    const itensPegos = get(collectedItemsPositions)
    const mapaFiltrado = CAVERN_MAP.map((linha, r) => {
      return Array.from(linha).map((celula, c) => {
        if (itensPegos.includes(`${r},${c}`)) {
          return ' ' // Substitui o item coletado por chão vazio
        }
        return celula
      }).join('') // Junta de volta em uma String!
    })

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
    
    // Passa o mapa modificado sem os itens antigos
    spawnAll(k, mapaFiltrado)
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
      // Aqui usamos o mapaFiltrado para a colisão também bater com o visual
      const cell = mapaFiltrado[row][col]
      if (cell === '#') return false
      if (cell === 'x' && !get(hasPickaxe)) return false
      if (cell === 'f' && !get(hasSword)) return false
      return true
    }
    
    function showMessage(text) {
      k.add([
        k.text(text, { size: 22 }),
        k.pos(k.width() / 2, k.height() - 30),
        k.anchor('center'), k.color(255, 255, 100),
        k.opacity(1),
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
        resetPersistentRunData()
        
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
      
      const ic = Math.floor(item.pos.x / TILE_SIZE)
      const ir = Math.floor(item.pos.y / TILE_SIZE)
      collectedItemsPositions.update(list => [...list, `${ir},${ic}`])
      
      handleItemPickup(item)
    })

    timerInterval = setInterval(() => {
      if (get(paused) || get(gameOver) || get(gameWon) || get(inBattle)) return
      runTime.update(t => {
        if (t <= 3 && t > 0 && !shakeInterval) {
          shakeInterval = setInterval(() => {
            const remaining = get(runTime)
            if (remaining <= 0) {
              clearInterval(shakeInterval)
              shakeInterval = null
              return
            }
            const intensity = Math.max(0.5, (4 - remaining) * 1.5)
            k.camShake(intensity)
          }, 300)
        }

        if (t <= 1) {
          gameOver.set(true); runActive.set(false)
          if (shakeInterval) { clearInterval(shakeInterval); shakeInterval = null }
          runFogData.set(Array.from(revealed))
          const m = get(metaProgress)
          m.totalRuns++
          saveMetaProgress(m)
          showDesmoronamento(k, () => showGameOver(k))
          return 0
        }
        return t - 1
      })
    }, 1000)
    
    // ── HUD ──────────────────────────────────────────────────────
    function createHUD() {
      const timeText = k.add([
        k.text('0:00', { size: 48 }),
        k.pos(k.width() / 2, 40),
        k.anchor('center'),
        k.color(212, 184, 120), k.fixed(), k.z(90), 'hud',
      ])
      const checklistText = k.add([
        k.text('', { size: 20, font: 'ubuntu' }),
        k.pos(18, 80),
        k.color(212, 184, 120), k.fixed(), k.z(90), 'hud',
      ])
      k.onUpdate(() => {
        const inBattleNow = get(inBattle)
        timeText.hidden = inBattleNow
        checklistText.hidden = inBattleNow

        const t = get(runTime)
        timeText.text = `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`
        if (t <= 3 && t > 0) {
          timeText.color = k.Color.fromArray([200, 40, 40])
        } else {
          timeText.color = k.Color.fromArray([212, 184, 120])
        }

        const collected = get(collectedChecklistItems)
        const allItems = ['espada', 'capacete', 'armadura', 'botas']
        const labels = { espada: 'Espada', capacete: 'Capacete', armadura: 'Armadura', botas: 'Botas' }
        if (collected.length > 0) {
          checklistText.text = allItems.map(key =>
            `${collected.includes(key) ? '☑' : '☐'} ${labels[key]}`
          ).join('\n')
        } else {
          checklistText.text = ''
        }
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
      'pause-btn', 'hud',
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
      resetPersistentRunData()
      k.wait(0.1, () => k.go('cavern'))
    })

    k.onClick('continueButton', (btn) => {
      btn.frame = 1
      k.wait(0.1, () => k.go('cavern'))
    })

    k.onClick('exitButton', (btn) => {
      btn.frame = 1
      resetPersistentRunData()
      k.wait(0.1, () => {
        paused.set(false)
        runActive.set(false)
        trocarEstadoDoJogo('menu')
      })
    })
    
 // ── Fog of war ───────────────────────────────────────────────
    const revealed = new Set(get(runFogData))
    const fogPool = [] // Transformado em Array para reaproveitamento real
    
    function revealTiles(cx, cy, radius) {
      for (let r = cy - radius; r <= cy + radius; r++)
        for (let c = cx - radius; c <= cx + radius; c++)
          if (Math.sqrt((c - cx) ** 2 + (r - cy) ** 2) <= radius && r >= 0 && r < ROWS && c >= 0 && c < COLS)
            revealed.add(`${r},${c}`)
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
      
      // Esconde todos os tiles do pool antes de reposicionar os necessários
      for (const tile of fogPool) tile.hidden = true
      
      let poolIndex = 0
      
      for (let r = vt; r <= vb; r++) {
        for (let c = vl; c <= vr; c++) {
          if (r >= 0 && r < ROWS && c >= 0 && c < COLS && !revealed.has(`${r},${c}`)) {
            let fog
            // Pega um tile existente ou cria um novo se o pool não tiver o suficiente para a tela atual
            if (poolIndex < fogPool.length) {
              fog = fogPool[poolIndex]
            } else {
              fog = k.add([
                k.rect(TILE_SIZE, TILE_SIZE), 
                k.pos(0, 0),
                k.color(0, 0, 0, 0.85), 
                k.z(20), 
                'fog-tile'
              ])
              fogPool.push(fog)
            }
            fog.hidden = false
            fog.pos.x = c * TILE_SIZE
            fog.pos.y = r * TILE_SIZE
            poolIndex++
          }
        }
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
          const cell = mapaFiltrado[mr][mc] // Ajustado aqui para ler do mapaFiltrado
          if (cell === 'f' && !get(inBattle)) {
            const enemyObj = k.get('enemy').find(e => {
              const ec = Math.floor(e.pos.x / TILE_SIZE)
              const er = Math.floor(e.pos.y / TILE_SIZE)
              return ec === mc && er === mr
            })
            if (enemyObj) {
              const key = enemyObj.enemyKey
              if (key === 'f' && !get(hasSword)) {
                showMessage('Preciso de algo mais forte...')
              } else {
                inputQueue.length = 0
                inBattle.set(true)
                startBattle(enemyObj, (won) => {
                  if (!won) {
                    destroyBattleUI()
                    gameOver.set(true); runActive.set(false)
                    runFogData.set(Array.from(revealed))
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
                    if (key === 'f') {
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
          const itemChars = { t: 1, S: 1, '1': 1, '2': 1, '4': 1 }
          if (itemChars[cell] && !get(inBattle)) {
            const itemObj = k.get('item').find(e => {
              const ec = Math.floor(e.pos.x / TILE_SIZE)
              const er = Math.floor(e.pos.y / TILE_SIZE)
              return ec === mc && er === mr
            })
            
            if (itemObj) {
              collectedItemsPositions.update(list => [...list, `${mr},${mc}`])
              handleItemPickup(itemObj)
            }
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
      if (shakeInterval) clearInterval(shakeInterval)
    })
  })
}