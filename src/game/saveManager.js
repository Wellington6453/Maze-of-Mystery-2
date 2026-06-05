import { get } from 'svelte/store'
import {
  playerHP, maxHP, playerATK, playerDEF,
  hasSword, hasPickaxe, runTime, enemiesKilled, itemsCollected,
  metaProgress,
} from './gameState.js'

const SAVE_KEY = 'maze_of_mystery_2_save'
const META_KEY = 'maze_meta_progress'

export function saveGame() {
  const data = {
    hp: get(playerHP),
    maxHp: get(maxHP),
    atk: get(playerATK),
    def: get(playerDEF),
    hasSword: get(hasSword),
    hasPickaxe: get(hasPickaxe),
    timeLeft: get(runTime),
    enemiesKilled: get(enemiesKilled),
    itemsCollected: get(itemsCollected),
    timestamp: Date.now(),
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  return true
}

export function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY)
  if (!raw) return null
  return JSON.parse(raw)
}

export function restoreGame(data) {
  if (!data) return false
  playerHP.set(data.hp ?? 30)
  maxHP.set(data.maxHp ?? 30)
  playerATK.set(data.atk ?? 5)
  playerDEF.set(data.def ?? 0)
  hasSword.set(data.hasSword ?? false)
  hasPickaxe.set(data.hasPickaxe ?? false)
  runTime.set(data.timeLeft ?? 30)
  enemiesKilled.set(data.enemiesKilled ?? 0)
  itemsCollected.set(data.itemsCollected ?? 0)
  return true
}

export function deleteSave() {
  localStorage.removeItem(SAVE_KEY)
}

export function saveMetaProgress(meta) {
  localStorage.setItem(META_KEY, JSON.stringify(meta))
}

export function loadMetaProgress() {
  const raw = localStorage.getItem(META_KEY)
  if (!raw) return null
  return JSON.parse(raw)
}
