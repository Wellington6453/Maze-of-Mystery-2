<script>
  import { onMount, onDestroy } from 'svelte'
  import { initGame } from './game/init.js'
  import { inputCtrl } from './game/scenes/gameScene.js'
  import { paused, runActive } from './game/gameState.js'

  let container

  onMount(async () => {
    await initGame(container)
  })

  onDestroy(() => {
    runActive.set(false)
    paused.set(false)
  })

  function handleKeyUp(e) {
    const map = {
      ArrowLeft: true, ArrowRight: true,
      ArrowUp: true, ArrowDown: true,
      a: true, d: true, w: true, s: true,
      A: true, D: true, W: true, S: true,
    }
    if (map[e.key] && inputCtrl.push) {
      inputCtrl.release()
    }
  }

  function handleKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      return
    }
    if (inputCtrl.push && !$paused) {
      const map = {
        ArrowLeft: [-1, 0], ArrowRight: [1, 0],
        ArrowUp: [0, -1], ArrowDown: [0, 1],
        a: [-1, 0], d: [1, 0],
        w: [0, -1], s: [0, 1],
        A: [-1, 0], D: [1, 0],
        W: [0, -1], S: [0, 1],
      }
      const dir = map[e.key]
      if (dir) {
        e.preventDefault()
        inputCtrl.push(dir[0], dir[1])
      }
    }
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="/styles/game.css">
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap&family=VT323&display=swap" rel="stylesheet">
</svelte:head>

<svelte:window on:keydown={handleKey} on:keyup={handleKeyUp}/>

<div class="game-wrapper">
  <div bind:this={container} class="game-canvas-container"></div>
</div>

<style>
  .game-wrapper {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: #000;
  }
  .game-canvas-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .game-canvas-container :global(canvas) {
    display: block;
    max-width: 100vw;
    max-height: 100vh;
  }
</style>
