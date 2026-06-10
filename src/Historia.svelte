<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap&family=VT323&display=swap" rel="stylesheet">
</svelte:head>

<script>
  import { trocarEstadoDoJogo } from './Estado.js'
</script>

<main>
  <div class="texto-hist">
    <p>
      <b><i>Era uma vez um jovem explorador chamado Thomas. Ele dedicava seus dias a investigar lugares desconhecidos e procurar por relíquias antigas e tesouros perdidos. <br><br> Um dia, Thomas recebe um chamado para explorar um labirinto que ficava escondido em uma caverna nas montanhas.
        Ao chegar ao local, Thomas percebe que esse labirinto era diferente de todos os outros que ele já havia explorado.<br><br> As paredes eram altas e grossas, feitas de pedras negras, e não havia qualquer tipo de sinalização. Inicialmente, ele achou que seria fácil encontrar o caminho certo, mas logo percebeu que estava totalmente perdido.
      Thomas passou horas andando pelo labirinto, tentando encontrar uma saída. Ele ficou desesperado e exausto, mas não podia desistir. Cada vez que ele chegava perto da saída, tinha mais uma parede em sua frente e ele era forçado a recuar.<br><br></i>
      Guie Thomas nessa jornada e tente encontrar o caminho certo para chegar no final do labirinto.</b>
    </p>
  </div>

  <button class="historia" on:click={() => trocarEstadoDoJogo('game')}>
    Entrar na Caverna
  </button>
</main>

<style>
  button.historia {
    font-family: 'Press Start 2P', cursive;
    font-weight: bold;
    color: #0a0909;
    font-size: 12px;
    text-shadow: 1px 2px 1px #C5E8ED;
    padding: 14px 50px;
    border-radius: 12px;
    border: 5px solid #000000;
    background: #FFDC4F;
    background: linear-gradient(to top, #f0b30d, #e8eb5a);
    margin: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    letter-spacing: 1px;
    line-height: 1.5;
  }

  button.historia:hover {
    color: #000000;
    background: #C2EDF2;
    background: linear-gradient(to top, #C2EDF2, #D6EDEE);
  }

  p {
    font-family: 'VT323', monospace;
    font-size: 24px;
    color: rgba(254, 243, 199, 0.9);
    text-shadow: 1px 1px 0 #000;
    line-height: 1.4;
    text-align: left;
  }

  .texto-hist {
    margin: 20px auto;
    background-color: rgba(0, 0, 0, 0.6);
    border: 3px solid #d4b878;
    box-shadow: 0 0 15px rgba(63, 201, 168, 0.2);
    justify-content: center;
    max-width: 800px;
    max-height: 400px;
    padding: 20px;
    height: 400px;
    position: relative;
    overflow-y: scroll;
  }

  .texto-hist::-webkit-scrollbar {
    width: 8px;
  }

  .texto-hist::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.3);
  }

  .texto-hist::-webkit-scrollbar-thumb {
    background-color: #d4b878;
    border-radius: 4px;
  }

  .texto-hist::-webkit-scrollbar-thumb:hover {
    background-color: #3fc9a8;
  }
</style>
