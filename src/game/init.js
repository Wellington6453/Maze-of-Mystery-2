import { initK } from './kaplay.js'
import { loadGameSprites, createLevelTexture } from './rendering/spriteLoader.js'
import { setupScene } from './scenes/gameScene.js'
import { CAVERN_MAP } from './levels/cavernLayout.js'

export async function initGame(container) {
  try {
    const k = initK(container)
    await loadGameSprites(k)
    const chunkInfo = await createLevelTexture(k, CAVERN_MAP)
    window.__levelChunks = chunkInfo
    setupScene(k)
    k.go('cavern')
  } catch (err) {
    console.error('initGame error:', err)
  }
}
