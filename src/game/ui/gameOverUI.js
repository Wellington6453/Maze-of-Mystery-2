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
    'restartButton',
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
