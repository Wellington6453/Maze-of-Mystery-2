import { get } from 'svelte/store'
import { getK } from '../kaplay.js'
import { ENEMY_DEFS } from './enemyDefs.js'
import {
  playerHP, maxHP, playerATK, playerDEF,
  hasSword, hasPickaxe, inBattle, currentEnemy,
  rocksCount, waterCount, enemiesKilled,
} from '../gameState.js'

let enemyObj = null
let enemyHP = 0
let enemyMaxHP = 0
let enemyKey = ''
let enemyName = ''
let enemyAtk = 0
let enemyDef = 0
let enemySpeed = 0

let playerTurn = true
let battleLog = []
let battleOver = false

let confusionTurns = 0
let wetTurns = 0

let onBattleEnd = null

export function startBattle(enemy, onEnd) {
  const k = getK()
  enemyObj = enemy
  onBattleEnd = onEnd || null

  const data = ENEMY_DEFS[enemy.enemyKey]
  if (!data) return

  enemyKey = enemy.enemyKey
  enemyName = data.name

  enemyHP = enemy.hp || data.hp
  enemyMaxHP = enemy.maxHp || data.hp
  enemyAtk = data.atk
  enemyDef = data.def
  enemySpeed = data.speed

  confusionTurns = 0
  wetTurns = 0
  battleLog = [`Um ${enemyName} selvagem apareceu!`]
  battleOver = false

  const pSpeed = 5

  playerTurn = pSpeed >= enemySpeed

  inBattle.set(true)
  currentEnemy.set({
    name: enemyName,
    hp: enemyHP,
    maxHp: enemyMaxHP,
    key: enemyKey,
  })
}

export function getBattleState() {
  return {
    enemyName,
    enemyHP,
    enemyMaxHP,
    enemyKey,
    playerHP: get(playerHP),
    maxHP: get(maxHP),
    playerTurn,
    battleLog,
    battleOver,
    confusionTurns,
    wetTurns,
  }
}

export function executePlayerAction(action) {
  if (battleOver) return

  const log = []
  playerActs(action, log)

  if (battleOver) {
    finishBattle(log)
    return
  }

  battleLog = [...battleLog, ...log]
  currentEnemy.set({
    name: enemyName,
    hp: enemyHP,
    maxHp: enemyMaxHP,
    key: enemyKey,
  })
}

export function executeEnemyAction() {
  if (battleOver) return

  const log = []
  enemyActs(log)
  updateStatuses(log)

  if (battleOver) {
    finishBattle(log)
    return
  }

  battleLog = [...battleLog, ...log]
  currentEnemy.set({
    name: enemyName,
    hp: enemyHP,
    maxHp: enemyMaxHP,
    key: enemyKey,
  })

  playerTurn = true
}

export function executeAction(action) {
  if (battleOver) return

  const k = getK()
  const log = []

  if (!playerTurn) {
    enemyActs(log)
    if (battleOver) return finishBattle(log)
    playerActs(action, log)
  } else {
    playerActs(action, log)
    if (battleOver) return finishBattle(log)
    enemyActs(log)
  }

  updateStatuses(log)

  if (battleOver) return finishBattle(log)

  battleLog = log
  currentEnemy.set({
    name: enemyName,
    hp: enemyHP,
    maxHp: enemyMaxHP,
    key: enemyKey,
  })

  playerTurn = !playerTurn
}

function playerActs(action, log) {
  if (battleOver) return

  switch (action) {
    case 'attack':
      playerAttack(log)
      break
    case 'dodge':
      playerDodge(log)
      break
    case 'rock':
      playerRock(log)
      break
    case 'water':
      playerWater(log)
      break
    default:
      playerAttack(log)
  }
}

function playerAttack(log) {
  if (enemyKey !== 'r' && enemyKey !== 'b' && !get(hasSword)) {
    log.push('Preciso de algo mais forte!')
    return
  }

  let dmg = get(playerATK) - enemyDef
  dmg = Math.max(1, dmg)

  if (wetTurns > 0 && enemyKey === 'G') {
    dmg = Math.floor(dmg * 1.5)
    log.push('Golem molhado! Dano +50%!')
  }

  enemyHP -= dmg
  log.push(`Você ataca! ${dmg} de dano.`)
}

function playerDodge(log) {
  log.push('Você se prepara para esquivar...')
}

function playerRock(log) {
  if (get(rocksCount) <= 0) {
    log.push('Sem pedras!')
    return
  }
  rocksCount.update(n => n - 1)

  if (enemyKey === 'G') {
    log.push('Pedra ricocheteia no Golem!')
    return
  }

  let dmg = 3
  enemyHP -= dmg
  log.push(`Pedra atinge! ${dmg} de dano.`)

  if (Math.random() < 0.4) {
    confusionTurns = 2
    log.push(`${enemyName} está confuso!`)
  }
}

function playerWater(log) {
  if (get(waterCount) <= 0) {
    log.push('Sem água!')
    return
  }
  waterCount.update(n => n - 1)

  wetTurns = 3

  if (enemyKey === 'b') {
    log.push('Morcego cai no chão! Perdeu vantagem aérea!')
  } else if (enemyKey === 'G') {
    log.push('Golem encharcado! Receberá +50% de dano!')
  } else {
    log.push(`${enemyName} está molhado! ATK reduzido!`)
  }
}

function enemyActs(log) {
  if (battleOver) return

  if (confusionTurns > 0 && Math.random() < 0.5) {
    log.push(`${enemyName} está confuso e erra o ataque!`)
    return
  }

  if (confusionTurns > 0 && Math.random() < 0.3) {
    const selfDmg = Math.max(1, Math.floor(enemyAtk * 0.3))
    enemyHP -= selfDmg
    log.push(`${enemyName} se machuca na confusão! ${selfDmg} de dano.`)
    return
  }

  let atk = enemyAtk
  if (wetTurns > 0 && enemyKey !== 'G') {
    atk = Math.floor(atk * 0.5)
    log.push(`${enemyName} está molhado! ATK reduzido!`)
  }

  const defPct = get(playerDEF)
  let dmg = atk - Math.floor(atk * defPct / 100)
  dmg = Math.max(1, dmg)

  playerHP.update(hp => hp - dmg)
  log.push(`${enemyName} ataca! ${dmg} de dano.`)

  if (get(playerHP) <= 0) {
    playerHP.set(0)
    battleOver = true
    log.push('Você foi derrotado!')
  }
}

function updateStatuses(log) {
  if (confusionTurns > 0) {
    confusionTurns--
  }
  if (wetTurns > 0) {
    wetTurns--
  }

  if (enemyHP <= 0) {
    enemyHP = 0
    battleOver = true
    log.push(`${enemyName} foi derrotado!`)
  }
}

function finishBattle(log) {
  battleLog = log

  if (get(playerHP) <= 0) {
    endBattle(false)
  } else {
    endBattle(true)
  }
}

export function endBattle(won) {
  const k = getK()

  if (won) {
    enemiesKilled.update(n => n + 1)

    if (enemyKey === 'G') {
      hasPickaxe.set(true)
      battleLog.push('Golem derrotado! Picareta Antiga adquirida!')
    }
  }

  battleOver = true

  if (onBattleEnd) {
    onBattleEnd(won)
  }

  setTimeout(() => {
    inBattle.set(false)
    currentEnemy.set(null)
    battleLog = []
    enemyObj = null
  }, 1500)
}

export function isBattleActive() {
  return get(inBattle)
}
