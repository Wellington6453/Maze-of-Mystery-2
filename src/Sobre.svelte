<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap&family=VT323&display=swap" rel="stylesheet">
</svelte:head>

<script>
  import { trocarEstadoDoJogo } from './Estado.js'
</script>

<div class="screen">
  <div class="bg-layer">
    <img src="/images/background.png" alt="" class="bg-image">
    <div class="bg-overlay"></div>
  </div>

  <div class="scroll-area">
    <div class="container">
      <h1 class="title">CRÉDITOS</h1>

      <div class="card">
        <p class="text">
          Fazendo o joguin por pura diversão e para entregar na materia de design.
        </p>

        <div class="links">
          <a href="https://github.com/Pancosta" target="_blank" rel="noopener" class="link">
            Gustavo Pancosta de Oliveira
          </a>
          <a href="https://github.com/Wellington6453" target="_blank" rel="noopener" class="link">
            Wellington Ramos da Silva
          </a>
        </div>

        <p class="thanks">OBRIGADA POR JOGAR!</p>
      </div>

      <div class="back-wrapper">
        <button class="back-btn" on:click={() => trocarEstadoDoJogo('menu')}>
          <div class="back-bg">
            <div class="back-glow"></div>
            <span class="back-label">VOLTAR</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .screen {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .bg-layer {
    position: fixed;
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
    background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.7) 100%);
  }

  .scroll-area {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    box-sizing: border-box;
  }

  .container {
    max-width: 480px;
    margin: 0 auto;
  }

  .title {
    text-align: center;
    color: #fef3c7;
    margin-bottom: 10px;
    font-family: 'Press Start 2P', cursive;
    font-size: 16px;
    line-height: 1.4;
    letter-spacing: 1px;
    text-shadow: 2px 2px 0 #000;
  }

  .card {
    background: rgba(0,0,0,0.6);
    border: 3px solid #b45309;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 0 0 2px #451a03;
  }

  .text {
    color: rgba(254, 243, 199, 0.9);
    margin-bottom: 12px;
    font-family: 'VT323', monospace;
    font-size: 22px;
    line-height: 1.4;
    text-shadow: 1px 1px 0 #000;
    text-align: center;
  }

  .links {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .link {
    color: #3fc9a8;
    font-family: 'VT323', monospace;
    font-size: 22px;
    line-height: 1.4;
    text-shadow: 1px 1px 0 #000;
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .link:hover {
    color: #d4b878;
    text-decoration: underline;
  }

  .thanks {
    text-align: center;
    color: #d4b878;
    font-family: 'VT323', monospace;
    font-size: 24px;
    line-height: 1.4;
    text-shadow: 1px 1px 0 #000;
    margin-bottom: 0;
  }

  .back-wrapper {
    display: flex;
    justify-content: center;
    padding-bottom: 16px;
  }

  .back-btn {
    position: relative;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-family: inherit;
  }

  .back-bg {
    position: relative;
    padding: 10px 36px;
    background: linear-gradient(to bottom, #78350f, #451a03);
    border: 3px solid #b45309;
    border-radius: 12px;
    box-shadow: 0 0 0 2px #451a03, 0 4px 0 0 #451a03;
    transition: all 0.15s ease;
    image-rendering: pixelated;
  }

  .back-btn:hover .back-bg {
    transform: translateY(1px);
    box-shadow: 0 0 0 2px #451a03, 0 2px 0 0 #451a03;
  }

  .back-glow {
    position: absolute;
    inset: 0;
    background: rgba(34, 197, 94, 0.2);
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .back-btn:hover .back-glow {
    opacity: 1;
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  .back-label {
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

  .back-btn:hover .back-label {
    color: #86efac;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .scroll-area::-webkit-scrollbar { width: 8px; }
  .scroll-area::-webkit-scrollbar-track { background: rgba(0,0,0,0.3); }
  .scroll-area::-webkit-scrollbar-thumb { background: #b45309; border-radius: 4px; }
</style>
