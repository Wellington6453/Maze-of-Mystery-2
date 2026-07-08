import { get } from 'svelte/store'
import { getK } from '../kaplay.js'
import { ENEMY_DEFS } from './enemyDefs.js'
import {
  playerHP, maxHP, playerATK, playerDEF,
  hasSword, hasPickaxe, inBattle, currentEnemy,
  enemiesKilled,
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
let rockCooldown = 0
let waterCooldown = 0
let bleedTurns = 0
let enemyMissTurns = 0

let dodgeActive = false

let enemyAction = ''
let playerAction = ''
let playerHit = false
let regenTurns = 0
let usedStrongRegen = false
let playerAtkDebuff = 0
let roundLog = []

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

  dodgeActive = false
  confusionTurns = 0
  wetTurns = 0
  rockCooldown = 0
  waterCooldown = 0
  bleedTurns = 0
  enemyMissTurns = 0
  enemyAction = ''
  playerAction = ''
  playerHit = false
  regenTurns = 0
  usedStrongRegen = false
  playerAtkDebuff = 0
  roundLog = []
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
    rockCooldown,
    waterCooldown,
    bleedTurns,
    enemyMissTurns,
    enemyAction,
    playerAction,
    playerHit,
    regenTurns,
    playerAtkDebuff,
    roundLog,
  }
}

export function executePlayerAction(action) {
  if (battleOver) return

  playerAction = action
  playerHit = false
  enemyAction = ''
  roundLog = []

  const log = []
  playerActs(action, log)
  roundLog.push(...log)

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

  enemyAction = ''
  playerAction = ''
  playerHit = false

  const log = []
  enemyActs(log)
  updateStatuses(log)
  roundLog.push(...log)

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
  if (!get(hasSword)) {
    log.push('Preciso de algo mais forte!')
    return
  }

  let dmg = get(playerATK) - enemyDef
  if (playerAtkDebuff > 0) {
    dmg = Math.floor(dmg * 0.7)
  }
  dmg = Math.max(1, dmg)

  enemyHP -= dmg
  log.push(`Thomas usou Ataque! Causou ${dmg} de dano.`)
  if (playerAtkDebuff > 0) {
    log.push('ATK reduzido pelo jato d\'água!')
  }
  enemyAction = 'hit'
}

function playerDodge(log) {
  dodgeActive = true
  log.push('Thomas usou Esquiva!')
}

function playerRock(log) {
  if (rockCooldown > 0) {
    log.push(`Pedra recarregando... ${rockCooldown} turnos`)
    return
  }

  rockCooldown = 3
  bleedTurns = 3
  enemyMissTurns = 3

  let dmg = 8
  enemyHP -= dmg
  log.push(`Thomas usou Pedra! ${dmg} de dano. Sangramento!`)
  enemyAction = 'hit'
}

function playerWater(log) {
  if (waterCooldown > 0) {
    log.push(`Água recarregando... ${waterCooldown} turnos`)
    return
  }

  waterCooldown = 3
  wetTurns = 3
  log.push(`Thomas usou Água! ${enemyName} molhado! ATK reduzido!`)
}

function enemyActs(log) {
  if (battleOver) return

  if (dodgeActive) {
    log.push(`${enemyName} errou o ataque!`)
    dodgeActive = false
    return
  }

  if (confusionTurns > 0 && Math.random() < 0.5) {
    log.push(`${enemyName} está confuso e erra o ataque!`)
    return
  }

  if (confusionTurns > 0 && Math.random() < 0.3) {
    const selfDmg = Math.max(1, Math.floor(enemyAtk * 0.3))
    enemyHP -= selfDmg
    log.push(`${enemyName} se machuca na confusão! ${selfDmg} de dano.`)
    enemyAction = 'hit'
    if (enemyHP <= 0) {
      enemyHP = 0
      battleOver = true
      log.push(`${enemyName} foi derrotado!`)
    }
    return
  }

  if (enemyMissTurns > 0 && Math.random() < 0.2) {
    log.push(`${enemyName} tenta atacar mas falha devido ao ferimento!`)
    return
  }

  // --- Action selection ---
  const hpRatio = enemyHP / enemyMaxHP
  let chosenAction = 'attack'

  if (!usedStrongRegen && hpRatio <= 0.5) {
    chosenAction = 'strong-regen'
  } else {
    const roll = Math.random()
    if (roll < 0.6) {
      chosenAction = 'attack'
    } else if (roll < 0.85) {
      chosenAction = 'jato'
    } else {
      chosenAction = 'regen'
    }
  }

  switch (chosenAction) {
    case 'strong-regen':
      usedStrongRegen = true
      const healAmount = 50
      const actualHeal = Math.min(healAmount, enemyMaxHP - enemyHP)
      enemyHP += actualHeal
      enemyAction = 'regen'
      log.push(`${enemyName} usou Regeneração Poderosa! +${actualHeal} HP!`)
      break

    case 'attack': {
      let atk = enemyAtk
      if (wetTurns > 0) {
        atk = Math.floor(atk * 0.5)
      }
      const defPct = get(playerDEF)
      let dmg = atk - Math.floor(atk * defPct / 100)
      dmg = Math.max(1, dmg)
      playerHP.update(hp => hp - dmg)
      playerHit = true
      log.push(`${enemyName} usou Ataque! Causou ${dmg} de dano.`)
      if (wetTurns > 0) {
        log.push(`${enemyName} molhado! ATK reduzido!`)
      }
      enemyAction = 'attack'
      break
    }

    case 'jato': {
      playerAtkDebuff = 2
      let atk = Math.floor(enemyAtk * 0.8)
      if (wetTurns > 0) {
        atk = Math.floor(atk * 0.5)
      }
      const defPct = get(playerDEF)
      let dmg = atk - Math.floor(atk * defPct / 100)
      dmg = Math.max(1, dmg)
      playerHP.update(hp => hp - dmg)
      playerHit = true
      log.push(`${enemyName} usou Jato d'água! Causou ${dmg} de dano!`)
      enemyAction = 'jato'
      break
    }

    case 'regen':
      regenTurns = 3
      enemyAction = 'regen'
      log.push(`${enemyName} usou Regeneração!`)
      break
  }

  if (get(playerHP) <= 0) {
    playerHP.set(0)
    battleOver = true
    log.push('Você foi derrotado!')
  }
}

function updateStatuses(log) {
  if (confusionTurns > 0) confusionTurns--
  if (wetTurns > 0) wetTurns--
  if (rockCooldown > 0) rockCooldown--
  if (waterCooldown > 0) waterCooldown--
  if (enemyMissTurns > 0) enemyMissTurns--
  if (playerAtkDebuff > 0) playerAtkDebuff--

  if (bleedTurns > 0) {
    const bleedDmg = Math.floor(enemyMaxHP * 0.08)
    enemyHP -= bleedDmg
    log.push(`Sangramento causa ${bleedDmg} de dano!`)
    bleedTurns--
    if (bleedTurns === 0) {
      log.push(`O sangramento de ${enemyName} acabou.`)
    }
  }

  if (regenTurns > 0) {
    const heal = Math.max(1, Math.floor(enemyMaxHP * 0.03))
    enemyHP = Math.min(enemyMaxHP, enemyHP + heal)
    log.push(`${enemyName} regenera ${heal} de HP!`)
    regenTurns--
    if (regenTurns === 0) {
      log.push(`A regeneração de ${enemyName} acabou.`)
    }
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

    if (enemyKey === 'f') {
      hasPickaxe.set(true)
      battleLog.push('Rei Sapo derrotado! Picareta Antiga adquirida!')
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
