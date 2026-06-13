import { get } from 'svelte/store'
import { getK } from '../kaplay.js'
import { playerHP, maxHP, rocksCount, waterCount, inBattle } from '../gameState.js'
import { getBattleState, executePlayerAction, executeEnemyAction } from './battleManager.js'
import { ENEMY_DEFS } from './enemyDefs.js'
import { spawnDamageNumber } from './damageNumbers.js'

const UI_TAG = 'battle-ui-root'
let isActionInProgress = false
let lastEnemyHpRatio = 1
let lastPlayerHpRatio = 1

export function createBattleUI() {
  const k = getK()
  isActionInProgress = false
  clearUI()
  k.add([k.rect(k.width(), k.height()), k.color(0, 0, 0, 0.6), k.z(50), k.fixed(), UI_TAG])
  render()
}

function render() {
  const k = getK()
  const state = getBattleState()

  function el(comps) {
    if (!Array.isArray(comps)) comps = [comps]
    return k.add([...comps, k.fixed(), UI_TAG])
  }

  renderInfoPanels(k, state, el)
  const { kaelPos, enemyPos, kaelSprite } = renderBattleField(k, state, el)
  renderActionMenu(k, state, kaelPos, enemyPos, kaelSprite, el)
  renderLog(k, state, el)
}

function renderInfoPanels(k, state, el) {
  const screenWidth = k.width()

  // Player panel (top-left)
  const playerHpRatio = state.playerHP / state.maxHP
  const playerHpColor = playerHpRatio > 0.5 ? [80, 200, 80] : playerHpRatio > 0.25 ? [200, 150, 50] : [255, 50, 50]

  el([k.rect(280, 90), k.pos(20, 20), k.color(40, 40, 50), k.outline(2, k.Color.fromArray([238, 210, 120])), k.z(51)])
  el([k.text('Kael', { size: 22 }), k.pos(30, 28), k.color(238, 210, 120), k.z(52)])
  el([k.rect(240, 16), k.pos(30, 50), k.color(60, 60, 60), k.z(51)])

  const playerHpBar = el([
    k.rect(240 * lastPlayerHpRatio, 16),
    k.pos(30, 50),
    k.color(...playerHpColor),
    k.z(52),
    {
      targetRatio: playerHpRatio,
      startRatio: lastPlayerHpRatio,
      animationTime: 0,
      update() {
        this.animationTime += k.dt()
        const progress = Math.min(this.animationTime / 0.5, 1)
        const currentRatio = this.startRatio + (this.targetRatio - this.startRatio) * progress
        this.width = currentRatio * 240
      }
    }
  ])
  lastPlayerHpRatio = playerHpRatio

  el([k.text(`${state.playerHP}/${state.maxHP}`, { size: 12 }), k.pos(150, 72), k.anchor('center'), k.color(255, 255, 255), k.z(52)])

  // Enemy panel (top-right)
  const enemyHpRatio = state.enemyHP / state.enemyMaxHP
  const enemyHpColor = enemyHpRatio > 0.5 ? [80, 200, 80] : enemyHpRatio > 0.25 ? [200, 150, 50] : [255, 50, 50]

  el([k.rect(280, 90), k.pos(screenWidth - 300, 20), k.color(40, 40, 50), k.outline(2, k.Color.fromArray([238, 210, 120])), k.z(51)])
  el([k.text(state.enemyName, { size: 22 }), k.pos(screenWidth - 290, 28), k.color(238, 210, 120), k.z(52)])
  el([k.rect(240, 16), k.pos(screenWidth - 290, 50), k.color(60, 60, 60), k.z(51)])

  const enemyHpBar = el([
    k.rect(240 * lastEnemyHpRatio, 16),
    k.pos(screenWidth - 290, 50),
    k.color(...enemyHpColor),
    k.z(52),
    {
      targetRatio: enemyHpRatio,
      startRatio: lastEnemyHpRatio,
      animationTime: 0,
      update() {
        this.animationTime += k.dt()
        const progress = Math.min(this.animationTime / 0.5, 1)
        const currentRatio = this.startRatio + (this.targetRatio - this.startRatio) * progress
        this.width = currentRatio * 240
      }
    }
  ])
  lastEnemyHpRatio = enemyHpRatio

  el([k.text(`${state.enemyHP}/${state.enemyMaxHP}`, { size: 12 }), k.pos(screenWidth - 170, 72), k.anchor('center'), k.color(255, 255, 255), k.z(52)])
}

function renderBattleField(k, state, el) {
  const screenWidth = k.width()
  const screenHeight = k.height()
  const kaelPos = k.vec2(280, 380)
  const enemyPos = k.vec2(screenWidth - 280, 380)

  // Kael sprite
  const kaelSprite = el([
    k.sprite('Kael', { anim: 'idle-right' }),
    k.pos(kaelPos),
    k.scale(3),
    k.z(52)
  ])

  // Enemy visual (colored rectangle)
  const enemyColor = ENEMY_DEFS[state.enemyKey]?.color || [120, 120, 120]
  const enemyLabel = { r: 'R', b: 'B', g: 'G', a: 'A', G: 'G' }[state.enemyKey] || '?'

  el([
    k.rect(80, 80),
    k.pos(enemyPos.x - 40, enemyPos.y - 40),
    k.color(...enemyColor),
    k.outline(2, k.Color.fromArray([255, 255, 255])),
    k.z(52)
  ])

  el([
    k.text(enemyLabel, { size: 40 }),
    k.pos(enemyPos),
    k.anchor('center'),
    k.color(255, 255, 255),
    k.z(53)
  ])

  return { kaelPos, enemyPos, kaelSprite }
}

function renderActionMenu(k, state, kaelPos, enemyPos, kaelSprite, el) {
  const actions = [
    { label: 'Atacar', key: 'attack' },
    { label: 'Esquivar', key: 'dodge' },
    { label: 'Pedra', key: 'rock' },
    { label: 'Água', key: 'water' }
  ]

  const btnWidth = 280
  const btnHeight = 48
  const gap = 8
  const startX = 20
  const startY = k.height() - 240

  actions.forEach((action, i) => {
    const btnX = startX
    const btnY = startY + i * (btnHeight + gap)

    const btn = el([
      k.rect(btnWidth, btnHeight),
      k.pos(btnX, btnY),
      k.color(120, 53, 15),
      k.outline(2, k.Color.fromArray([180, 83, 9])),
      k.area(),
      k.z(55),
      {
        isPressed: false,
        originalColor: [120, 53, 15],
        update() {
          if (this.isPressed) {
            this.color = k.Color.fromArray([90, 40, 10])
          } else {
            this.color = k.Color.fromArray(this.originalColor)
          }
        }
      }
    ])

    el([
      k.text(action.label, { size: 18 }),
      k.pos(btnX + btnWidth / 2, btnY + btnHeight / 2),
      k.anchor('center'),
      k.color(254, 243, 199),
      k.z(56)
    ])

    btn.onClick(() => {
      if (isActionInProgress) return

      // Color feedback
      btn.isPressed = true
      setTimeout(() => {
        btn.isPressed = false
      }, 150)

      isActionInProgress = true

      // Attack animation
      if (action.key === 'attack' && kaelSprite) {
        kaelSprite.play('attack-right')
      }

      const stateBefore = getBattleState()
      const hpBefore = { player: stateBefore.playerHP, enemy: stateBefore.enemyHP }

      // Execute player action
      executePlayerAction(action.key)
      const stateAfterPlayer = getBattleState()
      const hpAfterPlayer = { player: stateAfterPlayer.playerHP, enemy: stateAfterPlayer.enemyHP }

      // Spawn player damage number
      if (hpBefore.enemy > hpAfterPlayer.enemy) {
        spawnDamageNumber(k, enemyPos, hpBefore.enemy - hpAfterPlayer.enemy)
      }

      // Recreate UI to show player action messages (delay lets attack anim play)
      setTimeout(() => {
        // Battle may have already ended and destroyed the UI - don't resurrect it
        if (!get(inBattle)) {
          isActionInProgress = false
          return
        }

        recreateBattleUI()

        // Check if battle ended after player action
        const stateAfterUI = getBattleState()
        if (stateAfterUI.battleOver) {
          isActionInProgress = false
          return
        }

        // Wait for player animation + log display, then execute enemy action
        setTimeout(() => {
          if (!get(inBattle)) {
            isActionInProgress = false
            return
          }

          const stateBeforeEnemy = getBattleState()
          const hpBeforeEnemy = { player: stateBeforeEnemy.playerHP, enemy: stateBeforeEnemy.enemyHP }

          executeEnemyAction()
          const stateAfterEnemy = getBattleState()
          const hpAfterEnemy = { player: stateAfterEnemy.playerHP, enemy: stateAfterEnemy.enemyHP }

          // Spawn enemy damage number
          if (hpBeforeEnemy.player > hpAfterEnemy.player) {
            spawnDamageNumber(k, kaelPos, hpBeforeEnemy.player - hpAfterEnemy.player, { color: [255, 50, 50] })
          }

          // Recreate UI to show enemy action messages
          setTimeout(() => {
            if (get(inBattle)) recreateBattleUI()
            isActionInProgress = false
          }, 200)
        }, 2500)
      }, 500)
    })
  })
}

function renderLog(k, state, el) {
  const logX = 320
  const logY = k.height() - 240
  const logWidth = k.width() - 20 - logX
  const logHeight = 220

  el([k.rect(logWidth, logHeight), k.pos(logX, logY), k.color(40, 40, 50), k.outline(2, k.Color.fromArray([238, 210, 120])), k.z(51)])

  const visibleLog = state.battleLog.slice(-12)
  const isLastEntry = (index) => index === visibleLog.length - 1

  visibleLog.forEach((entry, i) => {
    // Only apply typewriter to the most recent entry
    if (isLastEntry(i)) {
      const textObj = {
        fullText: entry,
        displayedChars: 0,
        charDelay: 20,
        lastCharTime: k.time()
      }

      el([
        k.text('', { size: 14 }),
        k.pos(logX + 10, logY + 10 + i * 18),
        k.color(220, 220, 200),
        k.z(52),
        {
          update() {
            const now = k.time()
            if (now - this.lastCharTime > this.charDelay / 1000) {
              if (this.displayedChars < this.fullText.length) {
                this.displayedChars++
                this.lastCharTime = now
              }
            }
            this.text = this.fullText.substring(0, this.displayedChars)
          },
          fullText: textObj.fullText,
          displayedChars: textObj.displayedChars,
          charDelay: textObj.charDelay,
          lastCharTime: textObj.lastCharTime
        }
      ])
    } else {
      // Show old entries completely without typewriter
      el([
        k.text(entry, { size: 14 }),
        k.pos(logX + 10, logY + 10 + i * 18),
        k.color(220, 220, 200),
        k.z(52)
      ])
    }
  })
}

function clearUI() {
  const k = getK()
  for (const obj of k.get(UI_TAG)) k.destroy(obj)
}

function recreateBattleUI() {
  const k = getK()
  clearUI()
  k.add([k.rect(k.width(), k.height()), k.color(0, 0, 0, 0.6), k.z(50), k.fixed(), UI_TAG])
  render()
}

export function destroyBattleUI() {
  clearUI()
}
