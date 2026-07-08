<script>
  import { trocarEstadoDoJogo } from './Estado.js'

  const scenes = [
    {
      img: '/images/Cutsene-1.png',
      text: 'Thomas encontrou um pergaminho antigo que fala de uma caverna perdida nas montanhas, onde um artefato de poder inimaginável está escondido...',
    },
    {
      img: '/images/Cutsene-2.png',
      text: 'Após dias de jornada, ele finalmente encontra a entrada da caverna. Uma energia misteriosa emana de seu interior.',
    },
    {
      img: '/images/Cutsene-3.png',
      text: 'No coração da caverna, Thomas descobre o artefato. Seu brilho dourado ilumina toda a câmara.',
    },
    {
      img: '/images/Cutsene-4.png',
      text: 'Assim que Thomas toca o artefato, a caverna começa a tremer! — "Preciso dar o pé daqui!" — ele exclama, enquanto pedras começam a cair.',
    },
  ]

  let current = 0
  let fading = false

  function next() {
    if (fading) return
    if (current < scenes.length - 1) {
      fading = true
      setTimeout(() => {
        current++
        fading = false
      }, 200)
    }
  }

  function prev() {
    if (fading) return
    if (current > 0) {
      fading = true
      setTimeout(() => {
        current--
        fading = false
      }, 200)
    }
  }
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap&family=VT323&display=swap" rel="stylesheet">
</svelte:head>

<div class="cutscene">
  <div class="card" on:click={next} on:keydown={(e) => { if (e.key === ' ' || e.key === 'Enter') next() }} role="button" tabindex="0">
    <img src={scenes[current].img} alt="Cena {current + 1}" class="scene-img">
    <div class="overlay">
      <div class="text-box">
        <p class="scene-text">{scenes[current].text}</p>
      </div>
      <div class="nav">
        <button class="nav-btn" on:click|stopPropagation={prev} disabled={current === 0}>◀</button>
        <span class="counter">{current + 1} / {scenes.length}</span>
        {#if current < scenes.length - 1}
          <button class="nav-btn" on:click|stopPropagation={next}>▶</button>
        {:else}
          <button class="start-btn" on:click|stopPropagation={() => trocarEstadoDoJogo('game')}>
            Entrar na Caverna
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .cutscene {
    position: fixed;
    inset: 0;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .card {
    position: relative;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
  }

  .scene-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    image-rendering: pixelated;
    filter: brightness(0.9) contrast(1.1);
  }

  .overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px 24px;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 70%, transparent 100%);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .text-box {
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }

  .scene-text {
    font-family: 'VT323', monospace;
    font-size: 28px;
    color: #fef3c7;
    text-shadow: 2px 2px 0 #000;
    line-height: 1.4;
    margin: 0;
    text-align: center;
  }

  .nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
  }

  .nav-btn {
    font-family: 'Press Start 2P', cursive;
    font-size: 14px;
    background: linear-gradient(to bottom, #78350f, #451a03);
    border: 3px solid #b45309;
    border-radius: 8px;
    color: #fef3c7;
    padding: 8px 20px;
    cursor: pointer;
    transition: all 0.15s ease;
    text-shadow: 1px 1px 0 #000;
    box-shadow: 0 2px 0 0 #451a03;
  }

  .nav-btn:hover:not(:disabled) {
    background: linear-gradient(to bottom, #92400e, #78350f);
    transform: translateY(-1px);
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .counter {
    font-family: 'Press Start 2P', cursive;
    font-size: 10px;
    color: #d4b878;
    text-shadow: 1px 1px 0 #000;
  }

  .start-btn {
    font-family: 'Press Start 2P', cursive;
    font-size: 10px;
    color: #fef3c7;
    text-shadow: 1px 1px 0 #000;
    padding: 12px 28px;
    border-radius: 12px;
    border: 3px solid #b45309;
    background: linear-gradient(to bottom, #78350f, #451a03);
    box-shadow: 0 0 0 2px #451a03, 0 4px 0 0 #451a03;
    cursor: pointer;
    transition: all 0.15s ease;
    letter-spacing: 1px;
    line-height: 1.5;
    image-rendering: pixelated;
  }

  .start-btn:hover {
    transform: translateY(1px);
    box-shadow: 0 0 0 2px #451a03, 0 2px 0 0 #451a03;
    color: #86efac;
  }
</style>
