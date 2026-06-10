<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap&family=VT323&display=swap" rel="stylesheet">
</svelte:head>

<script>
  import { trocarEstadoDoJogo } from './Estado.js'

  let hoveredButton = null

  const menuButtons = [
    { id: 'new-game', label: 'NOVO JOGO', action: () => trocarEstadoDoJogo('game') },
    { id: 'how-to-play', label: 'COMO JOGAR', action: () => trocarEstadoDoJogo('ajuda') },
    { id: 'credits', label: 'CRÉDITOS', action: () => trocarEstadoDoJogo('sobre') },
  ]
</script>

<div class="menu-screen">
  <div class="bg-layer">
    <img src="/images/background.png" alt="" class="bg-image">
    <div class="bg-overlay"></div>
  </div>

  <div class="content">
    <div class="logo-container">
      <img src="/images/logo.png" alt="Maze of Mystery II" class="logo">
    </div>

    <div class="spacer"></div>

    <div class="buttons">
      {#each menuButtons as button (button.id)}
        <button
          class="menu-btn"
          on:click={button.action}
          on:mouseenter={() => hoveredButton = button.id}
          on:mouseleave={() => hoveredButton = null}
        >
          <div class="btn-bg" class:active={hoveredButton === button.id}>
            {#if hoveredButton === button.id}
              <div class="btn-glow"></div>
            {/if}
            <span class="btn-text" class:active={hoveredButton === button.id}>
              {button.label}
            </span>
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .menu-screen {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .bg-layer {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  .bg-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scale(1.1) translateX(-8px);
    transform-origin: center center;
  }

  .bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.7) 100%);
  }

  .content {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    box-sizing: border-box;
  }

  .logo-container {
    flex-shrink: 0;
    padding-top: 12px;
    padding-bottom: 6px;
    animation: float 3s ease-in-out infinite;
  }

  .logo {
    width: 100%;
    max-width: 360px;
    height: auto;
    object-fit: contain;
    filter: drop-shadow(0 0 25px rgba(34, 197, 94, 0.6));
  }

  .spacer {
    flex-grow: 0.3;
    min-height: 0;
  }

  .buttons {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    max-width: 320px;
    padding-bottom: 12px;
  }

  .menu-btn {
    position: relative;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    display: block;
    width: 100%;
    font-family: inherit;
  }

  .btn-bg {
    position: relative;
    padding: 12px 28px;
    background: linear-gradient(to bottom, #78350f, #451a03);
    border: 3px solid #b45309;
    border-radius: 12px;
    box-shadow: 0 0 0 2px #451a03, 0 4px 0 0 #451a03;
    transition: all 0.15s ease;
    image-rendering: pixelated;
  }

  .btn-bg.active {
    transform: translateY(1px);
    box-shadow: 0 0 0 2px #451a03, 0 2px 0 0 #451a03;
  }

  .btn-glow {
    position: absolute;
    inset: 0;
    background: rgba(34, 197, 94, 0.2);
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .btn-text {
    position: relative;
    z-index: 10;
    display: block;
    text-align: center;
    color: #fef3c7;
    font-family: 'Press Start 2P', cursive;
    font-size: 10px;
    line-height: 1.5;
    letter-spacing: 1px;
    text-shadow: 1px 1px 0 #000;
    transition: color 0.15s ease;
  }

  .btn-text.active {
    color: #86efac;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
</style>
