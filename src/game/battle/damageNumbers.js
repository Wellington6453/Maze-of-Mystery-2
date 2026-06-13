export function spawnDamageNumber(k, pos, amount, opts = {}) {
  const color = opts.color || [255, 50, 50]
  const x = Array.isArray(pos) ? pos[0] : pos.x
  const y = Array.isArray(pos) ? pos[1] : pos.y
  const startY = y
  const endY = y - 80
  const duration = 2.5

  const damageText = k.add([
    k.text(`-${amount}`, { size: 32 }),
    k.pos(x, y),
    k.color(...color),
    k.opacity(),
    k.lifespan(duration, { fade: 1.5 }),
    k.fixed(),
    k.z(60),
    'damage-number',
    {
      time: 0,
      update() {
        this.time += k.dt()
        const progress = Math.min(this.time / duration, 1)
        this.pos.y = startY + (endY - startY) * progress
      }
    }
  ])
}
