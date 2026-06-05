import { writable } from 'svelte/store'

export const playerHP = writable(30)
export const maxHP = writable(30)
export const playerATK = writable(5)
export const playerDEF = writable(0)
export const visionRange = writable(3)
export const hasSword = writable(false)
export const hasPickaxe = writable(false)
export const runTime = writable(30)
export const enemiesKilled = writable(0)
export const itemsCollected = writable(0)
export const runActive = writable(false)
export const gameOver = writable(false)
export const gameWon = writable(false)
export const paused = writable(false)

export const inBattle = writable(false)
export const currentEnemy = writable(null)
export const rocksCount = writable(0)
export const waterCount = writable(0)

export const metaProgress = writable({
  totalRuns: 0,
  bestTime: 0,
  timeUpgrade: false,
  ownedEquipment: [],
  totalEnemiesKilled: 0,
  totalEscapes: 0,
})

export function resetRunState() {
  playerHP.set(30)
  maxHP.set(30)
  playerATK.set(5)
  playerDEF.set(0)
  visionRange.set(3)
  hasSword.set(false)
  hasPickaxe.set(false)
  runTime.set(30)
  enemiesKilled.set(0)
  itemsCollected.set(0)
  gameOver.set(false)
  gameWon.set(false)
  paused.set(false)
  inBattle.set(false)
  currentEnemy.set(null)
  rocksCount.set(0)
  waterCount.set(0)
}
