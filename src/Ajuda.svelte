<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap&family=VT323&display=swap" rel="stylesheet">
</svelte:head>

<script>
  import { trocarEstadoDoJogo } from './Estado.js'

  let activeTab = 'historia'
</script>

<div class="screen">
  <div class="bg-layer">
    <img src="/images/background.png" alt="" class="bg-image">
    <div class="bg-overlay"></div>
  </div>

  <div class="scroll-area">
    <div class="container">
      <h1 class="title">COMO JOGAR</h1>

      <div class="card">
        <div class="tabs">
          <button class="tab" class:active={activeTab === 'historia'} on:click={() => activeTab = 'historia'}>História</button>
          <button class="tab" class:active={activeTab === 'controles'} on:click={() => activeTab = 'controles'}>Controles</button>
          <button class="tab" class:active={activeTab === 'dicas'} on:click={() => activeTab = 'dicas'}>Dicas</button>
          <button class="tab" class:active={activeTab === 'sobre'} on:click={() => activeTab = 'sobre'}>Sobre</button>
        </div>

        {#if activeTab === 'historia'}
          <h2 class="subtitle">Aventura na Caverna dos Mistérios</h2>
          <p class="text">
            Após retornar de suas antigas explorações, Thomas se vê novamente preso em um lugar desconhecido. Desta vez, uma gigantesca caverna está entrando em colapso, e escapar não será tão simples quanto encontrar uma saída.
          </p>
          <p class="text">
            Corredores escuros escondem equipamentos, criaturas perigosas e segredos esquecidos pelo tempo. Apenas os exploradores mais persistentes conseguirão sobreviver.
          </p>
          <h2 class="subtitle">Sua Missão</h2>
          <p class="text">Seu objetivo é escapar da Caverna dos Mistérios antes que ela desmorone completamente.</p>
        {/if}

        {#if activeTab === 'controles'}
          <h2 class="subtitle green">Controles</h2>
          <p class="text">Use as teclas WASD para movimentar Thomas:</p>
          <div class="controls">
            {#each [
              { key: 'W', desc: 'Tecla W — Mover para cima' },
              { key: 'S', desc: 'Tecla S — Mover para baixo' },
              { key: 'A', desc: 'Tecla A — Mover para a esquerda' },
              { key: 'D', desc: 'Tecla D — Mover para a direita' },
            ] as control}
              <p class="control-item">
                <span class="key-badge">{control.key}</span>
                {control.desc}
              </p>
            {/each}
          </div>
        {/if}

        {#if activeTab === 'dicas'}
          <h2 class="subtitle">Dicas do Explorador</h2>
          <div class="list">
            {#each [
              'Explore todos os cantos do labirinto.',
              'Alguns caminhos parecem inúteis, mas podem esconder recompensas.',
              'Nem toda batalha precisa ser enfrentada imediatamente.',
              'Equipamentos podem fazer a diferença entre escapar ou ficar preso para sempre.',
              'O tempo está sempre correndo.',
            ] as tip}
              <p class="list-item"><span class="bullet">•</span> {tip}</p>
            {/each}
          </div>
          <h2 class="subtitle green">Lembre-se</h2>
          <p class="text italic">
            "Os tesouros da caverna atraíram Thomas para as profundezas...
          </p>
          <p class="text italic">
            Agora, encontrar a saída pode ser o maior desafio de sua vida."
          </p>
        {/if}

        {#if activeTab === 'sobre'}
          <h3 class="subsubtitle green">Explore</h3>
          <p class="text">Ao longo da jornada você encontrará:</p>
          <div class="list">
            {#each [
              'Equipamentos esquecidos',
              'Recursos que podem ajudar em futuras explorações',
              'Tesouros escondidos',
              'Novos caminhos e atalhos',
            ] as item}
              <p class="list-item"><span class="bullet">•</span> {item}</p>
            {/each}
          </div>
          <h3 class="subsubtitle red">Sobreviva</h3>
          <p class="text">Nem todos os habitantes da caverna gostam de visitantes. Prepare-se para enfrentar:</p>
          <div class="list">
            {#each [
              'Ratos Gigantes',
              'Morcegos das Cavernas',
              'Goblins',
              'Goblins Arqueiros',
              'Uma criatura ancestral que guarda a chave para sua liberdade...',
            ] as enemy}
              <p class="list-item"><span class="bullet">•</span> {enemy}</p>
            {/each}
          </div>
        {/if}
      </div>

      <p class="footer-text">Boa sorte, explorador!</p>
      <p class="footer-sub">Maze of Mystery II — Escape da Caverna</p>

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
    padding: 16px;
    box-sizing: border-box;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
  }

  .title {
    text-align: center;
    color: #fef3c7;
    margin-bottom: 6px;
    font-family: 'Press Start 2P', cursive;
    font-size: 16px;
    line-height: 1.4;
    letter-spacing: 1px;
    text-shadow: 2px 2px 0 #000;
  }

  .card {
    background: rgba(0,0,0,0.6);
    border: 3px solid #b45309;
    padding: 8px;
    margin-bottom: 8px;
    box-shadow: 0 0 0 2px #451a03;
  }

  .tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
    flex-wrap: wrap;
  }

  .tab {
    font-family: 'Press Start 2P', cursive;
    font-size: 8px;
    padding: 8px 12px;
    border: 3px solid #b45309;
    border-radius: 12px;
    background: linear-gradient(to bottom, #78350f, #451a03);
    color: #fef3c7;
    cursor: pointer;
    transition: all 0.15s ease;
    text-shadow: 1px 1px 0 #000;
    letter-spacing: 1px;
    line-height: 1.5;
    box-shadow: 0 0 0 2px #451a03, 0 4px 0 0 #451a03;
    image-rendering: pixelated;
    flex: 1;
    min-width: 0;
    text-align: center;
  }

  .tab:hover {
    background: linear-gradient(to bottom, #92400e, #451a03);
  }

  .tab.active {
    background: linear-gradient(to bottom, #166534, #14532d);
    border-color: #22c55e;
    box-shadow: 0 0 0 2px #14532d, 0 4px 0 0 #14532d;
    color: #86efac;
  }

  .subtitle {
    color: #fde68a;
    margin-bottom: 0;
    font-family: 'Press Start 2P', cursive;
    font-size: 10px;
    line-height: 1.6;
    text-shadow: 1px 1px 0 #000;
  }

  .subtitle.green { color: #3fc9a8; }

  .subsubtitle {
    margin-bottom: 2px;
    font-family: 'Press Start 2P', cursive;
    font-size: 9px;
    line-height: 1.6;
    text-shadow: 1px 1px 0 #000;
  }

  .subsubtitle.green { color: #3fc9a8; }
  .subsubtitle.red { color: #f87171; }

  .text {
    color: rgba(254, 243, 199, 0.9);
    margin-bottom: 2px;
    font-family: 'VT323', monospace;
    font-size: 22px;
    line-height: 1.4;
    text-shadow: 1px 1px 0 #000;
    text-align: left;
  }

  .text.italic {
    font-style: italic;
    color: rgba(254, 243, 199, 0.8);
  }

  .controls {
    margin-left: 4px;
    margin-bottom: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .control-item {
    color: rgba(254, 243, 199, 0.9);
    font-family: 'VT323', monospace;
    font-size: 22px;
    line-height: 1.4;
    text-shadow: 1px 1px 0 #000;
  }

  .key-badge {
    color: #d4b878;
    background: rgba(26, 138, 114, 0.4);
    padding: 2px 8px;
    border: 2px solid #3fc9a8;
    margin-right: 6px;
    font-family: 'Press Start 2P', cursive;
    font-size: 8px;
    border-radius: 4px;
  }

  .list {
    margin-left: 0;
    margin-bottom: 4px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .list-item {
    color: rgba(254, 243, 199, 0.9);
    font-family: 'VT323', monospace;
    font-size: 22px;
    line-height: 1.4;
    text-shadow: 1px 1px 0 #000;
    text-align: left;
  }

  .bullet {
    color: #3fc9a8;
    margin-right: 4px;
  }

  .footer-text {
    text-align: center;
    color: #3fc9a8;
    margin-bottom: 8px;
    font-family: 'VT323', monospace;
    font-size: 24px;
    line-height: 1.4;
    text-shadow: 1px 1px 0 #000;
  }

  .footer-sub {
    text-align: center;
    color: rgba(212, 184, 120, 0.8);
    font-family: 'VT323', monospace;
    font-size: 20px;
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
  .scroll-area::-webkit-scrollbar-thumb { background: #3fc9a8; border-radius: 4px; }
</style>
