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
    font-family: 'times new roman';
    font-weight: bold;
    color: #0a0909;
    font-size: 19px;
    text-shadow: 1px 2px 1px #C5E8ED;
    padding: 15px 70px;
    border-radius: 40px;
    border: 5px solid #000000;
    background: #FFDC4F;
    background: linear-gradient(to top, #f0b30d, #e8eb5a);
    margin: 35px;
  }

  button.historia:hover {
    color: #000000;
    background: #C2EDF2;
    background: linear-gradient(to top, #C2EDF2, #D6EDEE);
    cursor: pointer;
  }

  p {
    font-family: zelda;
    font-size: 30px;
    color: #eed278;
  }

  .texto-hist {
    margin: 75px;
    background-color: #1D3825;
    justify-content: center;
    max-width: 980px;
    max-height: 400px;
    padding: 30px;
    height: 400px;
    position: relative;
    overflow-y: scroll;
    margin-left: auto;
    margin-right: auto;
  }

  .texto-hist::-webkit-scrollbar {
    width: 8px;
  }

  .texto-hist::-webkit-scrollbar-track {
    background-color: #dbd5d5;
  }

  .texto-hist::-webkit-scrollbar-thumb {
    background-color: #eed278;
    border-radius: 4px;
  }

  .texto-hist::-webkit-scrollbar-thumb:hover {
    background-color: #1D3825;
  }
</style>
