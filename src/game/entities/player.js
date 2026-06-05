import { getK, TILE_SIZE } from '../kaplay.js'

let playerObj = null
let currentDir = 'down'

let isMoving = false
let moveTimer = 0
let moveStartPos = null
let moveTargetPos = null
const MOVE_DURATION = 0.15

function playIdleAnim(dir) {
  if (!playerObj) return
  const animDir = dir === 'left' ? 'right' : dir
  playerObj.flipX = dir === 'left'
  playerObj.play('idle-' + animDir)
}

function playRunAnim(dir) {
  if (!playerObj) return
  const animDir = dir === 'left' ? 'right' : dir
  playerObj.flipX = dir === 'left'
  playerObj.play('run-' + animDir)
}

export function updatePlayer(dt) {
  if (!isMoving || !playerObj) return

  moveTimer += dt
  const t = Math.min(moveTimer / MOVE_DURATION, 1)
  playerObj.pos = moveStartPos.lerp(moveTargetPos, t)

  if (t >= 1) {
    playerObj.pos.x = moveTargetPos.x
    playerObj.pos.y = moveTargetPos.y
    isMoving = false
    playIdleAnim(currentDir)
  }
}

export function isPlayerMoving() {
  return isMoving
}

export function spawnPlayer(mapX, mapY) {
  const k = getK()

  playerObj = k.add([
    k.sprite('Kael', { anim: 'idle-down' }),
    k.pos(mapX * TILE_SIZE + TILE_SIZE / 2, mapY * TILE_SIZE + TILE_SIZE / 2),
    k.anchor('center'),
    k.scale(2),
    k.area({ shape: new k.Rect(k.vec2(-14, -14), 28, 28) }),
    k.z(10),
    'player',
    'kael',
  ])
  isMoving = false
  return playerObj
}

export function getPlayer() {
  return playerObj
}

export function getPlayerGridPos() {
  if (!playerObj) return { x: 0, y: 0 }
  return {
    x: Math.floor(playerObj.pos.x / TILE_SIZE),
    y: Math.floor(playerObj.pos.y / TILE_SIZE),
  }
}

export function movePlayer(dx, dy, checkWalkable) {
  if (!playerObj || isMoving) return false

  if (dx > 0) currentDir = 'right'
  else if (dx < 0) currentDir = 'left'
  else if (dy > 0) currentDir = 'down'
  else if (dy < 0) currentDir = 'up'

  const targetX = playerObj.pos.x + dx * TILE_SIZE
  const targetY = playerObj.pos.y + dy * TILE_SIZE

  if (checkWalkable && !checkWalkable(targetX, targetY)) return false

  moveStartPos = playerObj.pos.clone()
  moveTargetPos = getK().vec2(targetX, targetY)
  moveTimer = 0
  isMoving = true

  playRunAnim(currentDir)
  return true
}

export function destroyPlayer() {
  if (playerObj) {
    getK().destroy(playerObj)
    playerObj = null
    isMoving = false
  }
}
