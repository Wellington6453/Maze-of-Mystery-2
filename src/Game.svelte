<script>
  import { onMount, onDestroy } from 'svelte'
  import { initGame } from './game/init.js'
  import { inputCtrl } from './game/scenes/gameScene.js'
  import { paused, runActive } from './game/gameState.js'
  import { trocarEstadoDoJogo } from './Estado.js'
  import { saveGame } from './game/saveManager.js'

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
      paused.update(v => !v)
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

  function togglePause() {
    paused.update(v => !v)
  }

  function continuar() {
    paused.set(false)
  }

  function salvar() {
    saveGame()
    continuar()
  }

  function sair() {
    paused.set(false)
    runActive.set(false)
    trocarEstadoDoJogo('menu')
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="/styles/game.css">
</svelte:head>

<svelte:window on:keydown={handleKey} on:keyup={handleKeyUp}/>

<div class="game-wrapper">
  <div bind:this={container} class="game-canvas-container"></div>

  <button class="pause-btn" on:click={togglePause} title="Pausa (ESC)">
    ⚙️
  </button>
</div>

{#if $paused}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="pause-overlay" on:click|self={continuar} on:keydown={(e) => e.key === 'Escape' && continuar()}>
    <div class="pause-menu">
      <h2>PAUSA</h2>
      <button class="menu-btn primary" on:click={continuar}>▶ Continuar</button>
      <button class="menu-btn" on:click={salvar}>💾 Salvar Jogo</button>
      <button class="menu-btn danger" on:click={sair}>🚪 Sair para o Menu</button>
    </div>
  </div>
{/if}

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
  .pause-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 50;
    width: 44px;
    height: 44px;
    border-radius: 8px;
    border: 2px solid rgba(255,255,255,0.3);
    background: rgba(0,0,0,0.6);
    color: #fff;
    font-size: 22px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  .pause-btn:hover {
    background: rgba(255,255,255,0.2);
  }
  .pause-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }
  .pause-menu {
    background: #1a1a2e;
    border: 2px solid #e94560;
    border-radius: 16px;
    padding: 32px 40px;
    min-width: 280px;
    text-align: center;
  }
  .pause-menu h2 {
    color: #fff;
    font-family: 'The Wild Breath of Zelda', sans-serif;
    font-size: 28px;
    margin: 0 0 24px 0;
    letter-spacing: 2px;
  }
  .menu-btn {
    display: block;
    width: 100%;
    padding: 12px 20px;
    margin: 8px 0;
    border: 2px solid rgba(255,255,255,0.2);
    border-radius: 8px;
    background: rgba(255,255,255,0.08);
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }
  .menu-btn:hover {
    background: rgba(255,255,255,0.18);
    border-color: rgba(255,255,255,0.4);
  }
  .menu-btn.primary {
    border-color: #e94560;
    background: rgba(233,69,96,0.15);
  }
  .menu-btn.primary:hover {
    background: rgba(233,69,96,0.3);
  }
  .menu-btn.danger {
    border-color: #ff4444;
  }
  .menu-btn.danger:hover {
    background: rgba(255,68,68,0.25);
  }
</style>
