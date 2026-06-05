import { get } from 'svelte/store'
import { getK, TILE_SIZE } from '../kaplay.js'
import {
  hasSword, hasPickaxe,
  runTime, playerATK, maxHP, playerDEF, visionRange,
  rocksCount, waterCount, itemsCollected, metaProgress,
  enemiesKilled, playerHP,
} from '../gameState.js'

export function handleItemPickup(item) {
  const k = getK()
  const key = item.itemKey

  let msg = ''

  switch (key) {
    case 'tempo': {
      const extra = 30 + k.randi(0, 3) * 20
      runTime.update(t => t + extra)
      itemsCollected.update(n => n + 1)
      msg = `+${extra}s`
      break
    }
    case 'pedra': {
      rocksCount.update(n => n + 1)
      itemsCollected.update(n => n + 1)
      msg = '+1 Pedra'
      break
    }
    case 'agua': {
      waterCount.update(n => n + 1)
      itemsCollected.update(n => n + 1)
      msg = '+1 Água'
      break
    }
    case 'espada': {
      hasSword.set(true)
      playerATK.set(15)
      itemsCollected.update(n => n + 1)
      msg = 'Espada Enferrujada! ATK 15'
      break
    }
    case 'capacete': {
      const meta = get(metaProgress)
      if (!meta.ownedEquipment.includes('capacete')) {
        meta.ownedEquipment.push('capacete')
        metaProgress.set(meta)
      }
      applyEquipmentBonuses()
      itemsCollected.update(n => n + 1)
      msg = 'Capacete! HP+10 DEF+5%'
      break
    }
    case 'armadura': {
      const meta = get(metaProgress)
      if (!meta.ownedEquipment.includes('armadura')) {
        meta.ownedEquipment.push('armadura')
        metaProgress.set(meta)
      }
      applyEquipmentBonuses()
      itemsCollected.update(n => n + 1)
      msg = 'Armadura! HP+30 DEF+20%'
      break
    }
    case 'botas': {
      const meta = get(metaProgress)
      if (!meta.ownedEquipment.includes('botas')) {
        meta.ownedEquipment.push('botas')
        metaProgress.set(meta)
      }
      applyEquipmentBonuses()
      itemsCollected.update(n => n + 1)
      msg = 'Botas! HP+20 DEF+15%'
      break
    }
  }

  k.destroy(item)
  showPickupMessage(msg)
}

export function applyEquipmentBonuses() {
  const meta = get(metaProgress)
  const equip = meta.ownedEquipment

  let bonusHP = 0
  let bonusDef = 0

  if (equip.includes('capacete')) {
    bonusHP += 10
    bonusDef += 5
  }
  if (equip.includes('armadura')) {
    bonusHP += 30
    bonusDef += 20
  }
  if (equip.includes('botas')) {
    bonusHP += 20
    bonusDef += 15
  }

  if (equip.includes('capacete') && equip.includes('armadura') && equip.includes('botas')) {
    bonusDef += 5
  }

  bonusDef = Math.min(bonusDef, 40)

  maxHP.set(30 + bonusHP)
  playerHP.set(30 + bonusHP)
  playerDEF.set(bonusDef)

  if (equip.includes('capacete')) {
    visionRange.set(5)
  } else {
    visionRange.set(3)
  }
}

function showPickupMessage(text) {
  const k = getK()
  const w = k.width()
  const msg = k.add([
    k.text(text, { size: 16 }),
    k.pos(w / 2, k.height() - 60),
    k.anchor('center'),
    k.color(255, 255, 100),
    k.z(100),
    k.lifespan(2),
    k.opacity(1),
  ])
}
