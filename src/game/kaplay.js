import kaplay from 'kaplay'

let _k = null
let _canvas = null

export function initK(rootElement) {
  if (_k) {
    if (_canvas && rootElement && _canvas.parentElement !== rootElement) {
      rootElement.appendChild(_canvas)
    }
    return _k
  }

  _k = kaplay({
    root: rootElement,
    background: [10, 10, 18],
    width: 1280,
    height: 720,
    letterbox: true,
    maxFPS: 60,
  })

  _canvas = rootElement.querySelector('canvas')

  return _k
}

export function getK() {
  return _k
}

export const TILE_SIZE = 64
