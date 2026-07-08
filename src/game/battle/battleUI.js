import { get } from 'svelte/store'
import { getK } from '../kaplay.js'
import { playerHP, maxHP, inBattle } from '../gameState.js'
import { getBattleState, executePlayerAction, executeEnemyAction } from './battleManager.js'
import { spawnDamageNumber } from './damageNumbers.js'

const BATTLE_UI_HEIGHT = 190
const UI_TAG = 'battle-ui-root'
let isActionInProgress = false
let lastEnemyHpRatio = 1
let lastPlayerHpRatio = 1

export function createBattleUI() {
  const k = getK()
  isActionInProgress = false
  clearUI()
  k.add([k.sprite('battle-bg'), k.pos(0, 0), k.anchor('topleft'), k.scale(Math.max(k.width() / 1536, k.height() / 1024)), k.z(50), k.fixed(), UI_TAG])
  k.add([k.rect(k.width(), k.height()), k.color(0, 0, 0), k.opacity(0.3), k.z(50), k.fixed(), UI_TAG])
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
  el([k.text('Thomas', { size: 22 }), k.pos(30, 28), k.color(238, 210, 120), k.z(52)])
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

  el([k.text(`${state.playerHP}/${state.maxHP}`, { size: 20 }), k.pos(150, 82), k.anchor('center'), k.color(255, 255, 255), k.z(52)])

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

  el([k.text(`${state.enemyHP}/${state.enemyMaxHP}`, { size: 20 }), k.pos(screenWidth - 170, 82), k.anchor('center'), k.color(255, 255, 255), k.z(52)])
}

function renderBattleField(k, state, el) {
  const screenWidth = k.width()
  const screenHeight = k.height()
  const BATTLE_GROUND_OFFSET = 185
  const groundY = screenHeight - BATTLE_GROUND_OFFSET
  const kaelPos = k.vec2(280, groundY)
  const enemyPos = k.vec2(screenWidth - 280, groundY)

  // Kael sprite
  const kaelSprite = el([
    k.sprite('Kael', { anim: 'idle-right' }),
    k.pos(kaelPos),
    k.anchor('bot'),
    k.scale(3),
    k.z(52)
  ])

  const frogSprite = el([
    k.sprite('frog', { anim: 'idle' }),
    k.pos(enemyPos),
    k.anchor('bot'),
    k.scale(2.2),
    k.z(52),
  ])
  frogSprite.flipX = true

  // Player attack animation
  if (state.playerAction === 'attack') {
    kaelSprite.play('attack-right')
    kaelSprite.onAnimEnd((anim) => {
      if (anim === 'attack-right') kaelSprite.play('idle-right')
    })
  }

  // Player taking damage
  if (state.playerHit) {
    kaelSprite.color = k.Color.fromArray([255, 60, 60])
    k.shake(4)
    k.wait(0.3, () => {
      if (!kaelSprite.exists()) return
      kaelSprite.color = k.Color.fromArray([255, 255, 255])
    })
  }

  switch (state.enemyAction) {
    case 'hit':
      frogSprite.color = k.Color.fromArray([255, 60, 60])
      k.shake(4)
      k.wait(0.3, () => {
        if (!frogSprite.exists()) return
        frogSprite.color = k.Color.fromArray([255, 255, 255])
      })
      break

    case 'attack': {
      const origX = frogSprite.pos.x
      k.tween(origX, origX - 35, 0.15, (v) => { if (frogSprite.exists()) frogSprite.pos.x = v }, k.easings.easeOutQuad)
      k.wait(0.15, () => {
        if (!frogSprite.exists()) return
        k.tween(frogSprite.pos.x, origX, 0.25, (v) => { if (frogSprite.exists()) frogSprite.pos.x = v }, k.easings.easeInQuad)
      })
      break
    }

    case 'jato':
      frogSprite.color = k.Color.fromArray([80, 140, 255])
      k.shake(3)
      k.wait(0.5, () => {
        if (!frogSprite.exists()) return
        frogSprite.color = k.Color.fromArray([255, 255, 255])
      })
      break

    case 'regen':
      frogSprite.onUpdate(() => {
        const pulse = 0.6 + 0.4 * Math.sin(k.time() * 4)
        frogSprite.opacity = pulse
        frogSprite.color = k.Color.fromArray([80, 255, 80])
      })
      break
  }

  return { kaelPos, enemyPos, kaelSprite }
}

function renderActionMenu(k, state, kaelPos, enemyPos, kaelSprite, el) {
  const actions = [
    { label: 'Atacar', key: 'attack' },
    { label: 'Esquivar', key: 'dodge' },
    { label: 'Pedra', key: 'rock' },
    { label: 'Água', key: 'water' }
  ]

  const desc = {
    attack: 'Ataque básico. Causa dano baseado no seu ATK.',
    dodge: 'Desvia do próximo ataque inimigo. Recarga: 2 turnos.',
    rock: '8 de dano + sangramento (8% HP, 3 turnos). Recarga: 3.',
    water: 'Molha o inimigo, reduz ATK dele. Recarga: 3 turnos.',
  }

  const btnWidth = 280
  const btnHeight = 38
  const gap = 6
  const startX = 20
  const startY = k.height() - BATTLE_UI_HEIGHT + 10

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
      k.text(action.label, { size: 22 }),
      k.pos(btnX + btnWidth / 2, btnY + btnHeight / 2),
      k.anchor('center'),
      k.color(254, 243, 199),
      k.z(56)
    ])

    let tooltip = null
    let tooltipText = null

    btn.onHover(() => {
      if (tooltip) return
      const tipX = btnX + btnWidth + 10
      const tipY = btnY
      tooltipText = k.add([
        k.text(desc[action.key], { size: 18, font: 'vt323' }),
        k.pos(tipX + 6, tipY + 7),
        k.color(220, 220, 200),
        k.fixed(),
        k.z(61),
      ])
      const tw = tooltipText.width + 14
      const th = 32
      tooltip = k.add([
        k.rect(tw, th),
        k.pos(tipX, tipY),
        k.color(30, 30, 40),
        k.outline(2, k.Color.fromArray([238, 210, 120])),
        k.fixed(),
        k.z(60),
      ])
    })

    btn.onHoverEnd(() => {
      if (tooltip) {
        k.destroy(tooltip)
        tooltip = null
      }
      if (tooltipText) {
        k.destroy(tooltipText)
        tooltipText = null
      }
    })

    btn.onClick(() => {
      if (isActionInProgress) return

      btn.isPressed = true
      setTimeout(() => { btn.isPressed = false }, 150)

      isActionInProgress = true

      const state0 = getBattleState()
      const playerFirst = state0.playerTurn
      const hp0 = { player: state0.playerHP, enemy: state0.enemyHP }

      // Phase 1 — first attacker acts
      if (playerFirst) {
        executePlayerAction(action.key)
      } else {
        executeEnemyAction()
      }
      const state1 = getBattleState()

      // Damage number for phase 1
      if (playerFirst && hp0.enemy > state1.enemyHP) {
        spawnDamageNumber(k, enemyPos, hp0.enemy - state1.enemyHP)
      } else if (!playerFirst && hp0.player > state1.playerHP) {
        spawnDamageNumber(k, kaelPos, hp0.player - state1.playerHP, { color: [255, 50, 50] })
      }

      if (state1.battleOver) {
        recreateBattleUI()
        isActionInProgress = false
        return
      }

      recreateBattleUI()

      setTimeout(() => {
        if (!get(inBattle)) { isActionInProgress = false; return }

        // Phase 2 — second attacker acts (if battle not over)
        if (!state1.battleOver) {
          const hp1 = { player: state1.playerHP, enemy: state1.enemyHP }

          if (playerFirst) {
            executeEnemyAction()
          } else {
            executePlayerAction(action.key)
          }
          const state2 = getBattleState()

          if (playerFirst && hp1.player > state2.playerHP) {
            spawnDamageNumber(k, kaelPos, hp1.player - state2.playerHP, { color: [255, 50, 50] })
          } else if (!playerFirst && hp1.enemy > state2.enemyHP) {
            spawnDamageNumber(k, enemyPos, hp1.enemy - state2.enemyHP)
          }

          recreateBattleUI()
        }

        setTimeout(() => { isActionInProgress = false }, 3000)
      }, 1200)
    })
  })
}

function renderLog(k, state, el) {
  const logX = 320
  const logY = k.height() - BATTLE_UI_HEIGHT + 10
  const logWidth = k.width() - logX - 10
  const logHeight = BATTLE_UI_HEIGHT - 20

  el([k.rect(logWidth, logHeight), k.pos(logX, logY), k.color(40, 40, 50), k.outline(2, k.Color.fromArray([238, 210, 120])), k.z(51)])

  if (state.roundLog.length > 0) {
    el([
      k.text(state.roundLog.join('\n'), { size: 30, font: 'vt323' }),
      k.pos(logX + 14, logY + 16),
      k.color(220, 220, 200),
      k.z(52)
    ])
  }
}

function clearUI() {
  const k = getK()
  for (const obj of k.get(UI_TAG)) k.destroy(obj)
}

function recreateBattleUI() {
  const k = getK()
  clearUI()
  k.add([k.sprite('battle-bg'), k.pos(0, 0), k.anchor('topleft'), k.scale(Math.max(k.width() / 1536, k.height() / 1024)), k.z(50), k.fixed(), UI_TAG])
  k.add([k.rect(k.width(), k.height()), k.color(0, 0, 0), k.opacity(0.3), k.z(50), k.fixed(), UI_TAG])
  render()
}

export function destroyBattleUI() {
  clearUI()
}
