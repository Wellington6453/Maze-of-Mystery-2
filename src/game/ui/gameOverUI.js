export function showGameOver(k) {
  const menu = k.add([
    k.sprite('game-over'),
    k.scale(3),
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor('center'),
    k.fixed(),
    k.z(100),
    'menuArea',
  ])

  menu.add([
    k.sprite('primary-btn-sm'),
    k.fixed(),
    k.z(101),
    k.area(),
    k.pos(-32, 10),
    k.anchor('center'),
    'continueButton',
  ])

  menu.add([
    k.sprite('danger-btn-sm'),
    k.fixed(),
    k.z(101),
    k.area(),
    k.pos(33, 10),
    k.anchor('center'),
    'exitButton',
  ])
}

export function showDesmoronamento(k, callback) {
  const TAG = 'desmoronamento-overlay'

  k.add([
    k.rect(k.width(), k.height()),
    k.color(0, 0, 0),
    k.opacity(0.7),
    k.fixed(),
    k.z(98),
    TAG,
  ])

  k.add([
    k.sprite('desmoronamento'),
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor('center'),
    k.scale(k.width() / 1672, k.height() / 941),
    k.fixed(),
    k.z(99),
    TAG,
  ])

  k.add([
    k.text('Thomas não conseguiu escapar...\nQuem sabe da próxima vez.', {
      size: 36,
      font: 'vt323',
    }),
    k.anchor('center'),
    k.pos(k.width() / 2, k.height() - 80),
    k.color(254, 243, 199),
    k.outline(2, k.Color.fromArray([0, 0, 0])),
    k.fixed(),
    k.z(100),
    TAG,
  ])

  const clickOverlay = k.add([
    k.rect(k.width(), k.height()),
    k.opacity(0),
    k.area(),
    k.fixed(),
    k.z(101),
    TAG,
  ])

  let canClick = false
  k.wait(2, () => { canClick = true })

  clickOverlay.onClick(() => {
    if (!canClick) return
    k.get(TAG).forEach(obj => k.destroy(obj))
    callback()
  })
}