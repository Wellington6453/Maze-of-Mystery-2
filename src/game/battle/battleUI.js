import { get } from 'svelte/store'
import { getK } from '../kaplay.js'
import { playerHP, maxHP, rocksCount, waterCount } from '../gameState.js'
import { getBattleState, executeAction } from './battleManager.js'

const UI_TAG = 'battle-ui-root'

export function createBattleUI() {
  const k = getK()
  clearUI()
  k.add([k.rect(k.width(), k.height()), k.color(0, 0, 0, 0.6), k.z(50), k.fixed(), UI_TAG])
  render()
}

function render() {
  const k = getK()
  const state = getBattleState()
  const screenWidth = k.width()
  const cx = screenWidth / 2

  function el(comps) {
    if (!Array.isArray(comps)) comps = [comps]
    return k.add([...comps, k.fixed(), UI_TAG])
  }

  el([k.text(state.enemyName, { size: 32 }), k.pos(cx, 70), k.anchor('center'), k.color(255, 100, 100), k.z(51)])

  const hpWidth = 300, hpHeight = 24
  const hpRatio = state.enemyHP / state.enemyMaxHP
  el([k.rect(hpWidth, hpHeight), k.pos(cx - hpWidth / 2, 105), k.color(80, 80, 80), k.outline(2, k.Color.fromArray([200, 200, 200])), k.z(51)])
  el([k.rect(hpWidth * hpRatio, hpHeight), k.pos(cx - hpWidth / 2, 105),
    k.color(hpRatio > 0.5 ? 80 : hpRatio > 0.25 ? 200 : 255, hpRatio > 0.5 ? 200 : hpRatio > 0.25 ? 150 : 50, hpRatio > 0.5 ? 80 : hpRatio > 0.25 ? 50 : 50),
    k.z(52)])
  el([k.text(`${state.enemyHP}/${state.enemyMaxHP}`, { size: 16 }), k.pos(cx, 117), k.anchor('center'), k.color(255, 255, 255), k.z(53)])

  const dividerY = 160
  el([k.rect(screenWidth - 40, 2), k.pos(20, dividerY), k.color(100, 100, 100), k.z(51)])

  const playerHPVal = get(playerHP), playerMax = get(maxHP)
  const playerHpRatio = playerHPVal / playerMax
  el([k.rect(hpWidth, hpHeight), k.pos(cx - hpWidth / 2, dividerY + 20), k.color(60, 60, 60), k.outline(2, k.Color.fromArray([200, 200, 200])), k.z(51)])
  el([k.rect(hpWidth * playerHpRatio, hpHeight), k.pos(cx - hpWidth / 2, dividerY + 20), k.color(60, 200, 60), k.z(52)])
  el([k.text(`HP: ${playerHPVal}/${playerMax}`, { size: 16 }), k.pos(cx, dividerY + 32), k.anchor('center'), k.color(255, 255, 255), k.z(53)])

  const infoY = dividerY + 70
  el([k.text(`Pedras: ${get(rocksCount)}  |  Água: ${get(waterCount)}`, { size: 20 }),
    k.pos(cx, infoY), k.anchor('center'), k.color(200, 200, 180), k.z(51)])

  const menuY = infoY + 55
  const acts = [['Atacar', 'attack'], ['Esquivar', 'dodge'], ['Pedra', 'rock'], ['Água', 'water']]
  const btnWidth = 180, btnHeight = 52, gap = 14
  const totalWidth = acts.length * btnWidth + (acts.length - 1) * gap
  const startX = cx - totalWidth / 2

  acts.forEach(([label, key], i) => {
    const btnX = startX + i * (btnWidth + gap)
    const btn = k.add([k.rect(btnWidth, btnHeight), k.pos(btnX, menuY), k.color(50, 50, 70),
      k.outline(2, k.Color.fromArray([140, 140, 180])), k.area(), k.fixed(), k.z(55), UI_TAG])
    k.add([k.text(label, { size: 22 }), k.pos(btnX + btnWidth / 2, menuY + btnHeight / 2),
      k.anchor('center'), k.color(220, 220, 255), k.fixed(), k.z(56), UI_TAG])
    btn.onClick(() => {
      executeAction(key)
      const newState = getBattleState()
      if (newState.battleOver) destroyBattleUI()
      else setTimeout(() => recreateBattleUI(), 0)
    })
  })

  const log = state.battleLog
  const logY = menuY + 75
  el([k.rect(screenWidth - 40, 130), k.pos(20, logY - 10), k.color(0, 0, 0, 0.4), k.z(51), UI_TAG])
  const visibleLog = log.slice(-6)
  visibleLog.forEach((entry, i) => {
    el([k.text(entry, { size: 16 }), k.pos(30, logY + i * 20),
      k.color(220, 220, 200), k.z(51)])
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
