import { get } from 'svelte/store'
import { paused } from '../gameState.js'

let lastAnims = new Map()

export function togglePause(k) {
  const animatedObjects = k.get('animated')
  const pauseButton = k.get('pause-btn')[0]

  if (!get(paused)) {
    animatedObjects.forEach(obj => {
      const curAnim = obj.getCurAnim()
      if (curAnim) {
        lastAnims.set(obj.id, curAnim.name)
      }
      if (obj.stop) obj.stop()
    })

    paused.set(true)
    if (pauseButton) pauseButton.frame = 1

    const menu = k.add([
      k.sprite('pause-menu'),
      k.scale(3),
      k.pos(k.width() / 2, k.height() / 2),
      k.anchor('center'),
      k.fixed(),
      k.z(100),
      'menuArea',
    ])

    menu.add([
      k.sprite('primary-btn-lg'),
      k.fixed(),
      k.z(101),
      k.area(),
      k.pos(0, -20),
      k.anchor('center'),
      'resumeButton',
    ])

    menu.add([
      k.sprite('secondary-btn-lg'),
      k.fixed(),
      k.z(101),
      k.area(),
      k.pos(0, 10),
      k.anchor('center'),
      'restartButton',
    ])

    menu.add([
      k.sprite('danger-btn-lg'),
      k.fixed(),
      k.z(101),
      k.area(),
      k.pos(0, 34),
      k.anchor('center'),
      'exitButton',
    ])
  } else {
    animatedObjects.forEach(obj => {
      const lastAnim = lastAnims.get(obj.id)
      if (lastAnim && obj.play) {
        obj.play(lastAnim)
      }
    })

    lastAnims.clear()
    k.get('menuArea').forEach(menu => k.destroy(menu))
    paused.set(false)
    if (pauseButton) pauseButton.frame = 0
  }
}
