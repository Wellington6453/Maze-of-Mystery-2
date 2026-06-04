# Relatório Técnico — Maze of Mystery

Data: 31 de maio de 2026

Este documento descreve em detalhe o estado atual do projeto "Maze of Mystery" presente neste repositório. O objetivo é documentar o funcionamento atual sem modificar nenhum código.

**Sumário**
- Estrutura do Projeto
- Sistema de Telas
- Sistema do Labirinto
- Sistema de Fases
- Sistema do Jogador
- Assets
- Estado Global do Jogo
- Possíveis Pontos de Extensão
- Resumo Final


## Estrutura do Projeto

Raiz do projeto:
- `package.json` — Configuração do projeto, scripts (`build`, `dev`, `start`) e dependências (Svelte, Rollup, sweetalert(s), sirv-cli).
- `README.md` — Descrição e instruções para rodar o projeto.
- `rollup.config.js` — Configuração do bundler (existente na raiz como artefato de projeto).

Pasta `src/` (componentes e lógica):
- `main.js` — Inicializa o `App.svelte` no `document.body`.
- `App.svelte` — Componente raiz; renderiza telas conforme a store `estado` (`menu`, `sobre`, `game`, `ajuda`, `historia`).
- `Estado.js` — Exporta a store Svelte `estado` (writable) e a função `trocarEstadoDoJogo(novoEstado)` para navegação global.
- `mudarFase.js` — Exporta a store `proximoNivel` e a função `proximaFase(value)` para controlar o nível atual.
- `Menu.svelte` — Tela principal com botões para `Como Jogar?`, `Jogar` e `Créditos`.
- `Ajuda.svelte` — Tela de instruções (teclas e imagem `akey1.png`).
- `Sobre.svelte` — Tela de créditos.
- `Historia.svelte` — Texto introdutório mostrado antes do início do Nível 1.
- `AllGames.svelte` — Controlador que renderiza `Game`, `Game2` ou `Game3` baseado em `$proximoNivel`.
- `Game.svelte`, `Game2.svelte`, `Game3.svelte` — Implementações dos níveis 1, 2 e 3 respectivamente (mapas, movimentação, detecção de vitória/derrota).
- `VoltarMenu.svelte` — Botão para voltar ao menu principal (usa `trocarEstadoDoJogo('menu')`).

Pasta `public/`:
- `index.html` — HTML estático que inclui os bundles gerados.
- `global.css` — estilos globais.
- `build/` — artefatos de build (ex.: `bundle.js`, `bundle.js.map`, possivelmente `bundle.css`).
- `images/` — sprites e imagens (parede, chão, personagem, teclas etc.).
- `styles/` — CSS específicos por tela (`game.css`, `game2.css`, `game3.css`, `menu.css`, `ajuda.css`, `historia.css`, `sobre.css`).

Pasta `scripts/`:
- `setupTypeScript.js` — utilitário de configuração (presente no repositório, não parte do runtime do jogo).


## Função de cada arquivo (resumo prático)
- `App.svelte`: rota/tela principal controlada por `estado`.
- `Estado.js`: store global do fluxo de telas.
- `mudarFase.js`: store que controla qual nível está ativo.
- `AllGames.svelte`: escolhe o componente do nível de acordo com `$proximoNivel`.
- `Game*.svelte`: contém mapa 2D embutido, posição do jogador, lógica de movimentação e detecção de chegada/derrota.
- `public/styles/*.css`: aplicam imagens de chão/paredes/jogador via background-image e grid layout.
- `public/images/*`: assets gráficos usados pelo CSS e Ajuda.
- `package.json`: dependências (Svelte, Rollup e SweetAlert).


## Dependências utilizadas
- DevDependencies: `svelte`, `rollup`, `rollup-plugin-svelte`, `@rollup/plugin-node-resolve`, `@rollup/plugin-commonjs`, `rollup-plugin-css-only`, `rollup-plugin-livereload`, `rollup-plugin-terser`.
- Dependencies: `sirv-cli` (servidor de desenvolvimento), `sweetalert` / `sweetalert2` (popups de vitória/derrota/mensagens ao jogador).
- Fontes externas: `The Wild Breath of Zelda` via CDN.


## Como os arquivos se comunicam
- Comunicação entre telas e lógica é principalmente feita via Svelte stores:
  - `estado` (em `Estado.js`) determina a tela global a ser exibida.
  - `proximoNivel` (em `mudarFase.js`) determina qual componente de nível `AllGames.svelte` deve renderizar.
- Componentes trocam informações chamando `trocarEstadoDoJogo(...)` e `proximaFase(...)` diretamente.
- `App.svelte` observa `$estado` e renderiza o componente apropriado.


## Sistema de Telas
Telass existentes e como navegar entre elas:
- Menu principal: `Menu.svelte` — ponto de entrada (botões chamam `trocarEstadoDoJogo`).
- Como Jogar (Ajuda): `Ajuda.svelte` — acessível via botão no menu; contém instruções e imagem das teclas.
- Créditos (Sobre): `Sobre.svelte` — acessível via botão no menu.
- Seleção de fase: não há uma tela de seleção manual; `AllGames.svelte` age como controlador de níveis e escolhe automaticamente o componente do nível com base em `$proximoNivel`.
- Tela de jogo: `Game.svelte`, `Game2.svelte`, `Game3.svelte` — cada um é a interface de jogo do respectivo nível.
- Tela de vitória/derrota: não existem componentes separados; o feedback é exibido via `sweetalert2` (`Swal.fire(...)`) dentro dos componentes de nível. Após confirmação, as callbacks de `Swal` chamam `proximaFase(...)` ou mudam o fluxo.

Navegação resumo:
- `Menu` → `Jogar` chama `trocarEstadoDoJogo('game')` → `App.svelte` renderiza `AllGames.svelte` que define `proximaFase(0)` e renderiza `Game`.
- Ao vencer um nível: `Game*.svelte` chama `Swal.fire(...)` e em seguida `proximaFase(next)` (ex.: 0→1→2→0).
- `VoltarMenu.svelte` permite retornar ao menu a qualquer momento com `trocarEstadoDoJogo('menu')`.


## Sistema do Labirinto
- Armazenamento do mapa:
  - Cada nível tem um array 2D chamado `maze` embutido diretamente no arquivo Svelte. Cada sub-array representa uma linha do labirinto.
- Representação das células:
  - `1` — parede.
  - `0` — chão / célula caminhável.
  - `3` — célula de chegada/saída.
- Renderização:
  - O labirinto é renderizado como uma grade de `<div>`s usando `{#each maze as row, y}{#each row as cell, x}`.
  - Cada célula recebe classes CSS: `.maze-cell`, `.wall` (se `cell === 1`) e `.player` (quando coordenadas coincidem com `playerPosition`).
  - CSS aplica `background-image` para chão/paredes/jogador.
- Posicionamento do jogador:
  - Cada nível declara `let playerPosition = { x, y }` com coordenadas iniciais locais ao componente.
  - A célula com essas coordenadas aplica a classe `player` e exibe o sprite do personagem via CSS.
- Colisão:
  - Antes de mover, a lógica verifica o valor da célula alvo no `maze`: só permite movimento se o valor for `0` ou `3`. Caso contrário (valor `1`), movimento é bloqueado.
- Detecção de saída:
  - Ao mover para uma célula, os componentes chamam `chegada()` que verifica se `maze[y][x] === 3`. Se for verdade, é exibido um `Swal.fire` e, após confirmação, avança-se de fase.


## Sistema de Fases
- Quantidade de fases: 3 (Nível 1, Nível 2, Nível 3).
- Diferenças entre elas:
  - `Game.svelte` (Nível 1): mapa pequeno; apresenta a história antes do início; sem cronômetro.
  - `Game2.svelte` (Nível 2): mapa significativamente maior (comentários indicam 50x42); exibe mensagem introdutória via `Swal`.
  - `Game3.svelte` (Nível 3): mapa ainda maior (comentário indica 60x61); introduz cronômetro (`TempoRestante`) e derrota por tempo (quando chega a zero chama `perderJogo()`).
- Troca de fase:
  - Cada componente de nível chama `proximaFase(n)` (exportada por `mudarFase.js`) quando o jogador alcança a saída. `AllGames.svelte` re-renderiza o nível apropriado com base em `$proximoNivel`.
- Controle de progresso:
  - O progresso entre níveis é mantido em memória via a store `proximoNivel`. Não existe persistência externa.


## Sistema do Jogador
- Renderização:
  - O jogador é representado por uma célula `<div>` com a classe `player` que, via CSS, exibe um GIF (`thomas-mapa1.gif` no Nível 1) como background.
- Movimentação:
  - A movimentação é controlada por eventos de teclado registrados com `svelte:window on:keydown={...}`.
  - Funções como `movePlayer`, `moveMapa2` e `moveMapa3` leem `event.key` e tentam atualizar `playerPosition` verificando colisões.
- Teclas utilizadas:
  - `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` (teclas direcionais). A documentação de jogo (`Ajuda.svelte`) exibe estas instruções e uma imagem.
- Armazenamento da posição:
  - `playerPosition` é uma variável local a cada componente de nível (não é uma store global). Ao desmontar/montar o componente, a posição é reiniciada para o valor inicial programado.


## Assets
- Local: `public/images/`
- Identificados no repositório:
  - `thomas-mapa1.gif` — sprite do jogador (referenciado por `game.css` como `.player` background no Nível 1).
  - `thomas3.gif`, `caverna-dungeon.gif` — presentes; referências diretas não encontradas nos Svelte analisados (podem estar disponíveis para uso futuro ou referenciadas em CSS não analisado).
  - `parede-mapa1.jpg`, `parede-mapa2.jpeg` — imagens de parede usadas nos estilos de cada nível (`.wall`).
  - `chao-mapa1.jpg`, `chao-mapa2.jpeg` — imagens de chão (`.maze-cell`).
  - `akey1.png` — imagem mostrada em `Ajuda.svelte` para instruir o jogador sobre as teclas.
- Áudio: nenhum arquivo de áudio foi detectado.
- Fontes: fonte externa carregada via CDN (`The Wild Breath of Zelda`).

Uso dos assets:
- `public/styles/game.css` aplica `chao-mapa1.jpg`, `parede-mapa1.jpg` e `thomas-mapa1.gif` para o Nível 1.
- `Ajuda.svelte` utiliza `/images/akey1.png`.
- `game2.css` e `game3.css` (existentes) provavelmente referenciam as variantes `parede-mapa2`/`chao-mapa2`.


## Estado Global do Jogo
- Stores/variáveis que controlam o progresso:
  - `estado` (em `Estado.js`) — controla a tela global exibida.
  - `proximoNivel` (em `mudarFase.js`) — controla qual `Game` está ativo.
- Determinação de fase atual:
  - `AllGames.svelte` observa `$proximoNivel` e escolhe entre `Game`, `Game2` e `Game3`.
- Detectar vitória:
  - Cada nível checa `maze[y][x] === 3` para considerar vitória; então mostra `Swal.fire` e, ao confirmar, chama `proximaFase(next)`.
- Detectar derrota:
  - Implementado no Nível 3: `TempoRestante` decrementado por `setInterval` e, ao alcançar zero, chama `perderJogo()` que exibe `Swal.fire` e reinicia/volta ao nível inicial.
  - Não existem inimigos que causem derrota por colisão; apenas o cronômetro é fonte de falha no Nível 3.


## Possíveis Pontos de Extensão
Abaixo seguem sugestões sobre onde integrar futuras funcionalidades e onde a arquitetura atual facilita extensões.

- Sistema de inimigos
  - Onde adicionar: Preferencialmente criar um módulo `EnemyManager` e uma store `enemyStore`; integrar com o renderizador de grelha e com o loop de turno/tempo de cada nível (`Game*.svelte`). Cada inimigo pode ter `x,y`, comportamento (patrulha, busca), e ser processado por tick/turn.

- Sistema de combate por turnos
  - Onde adicionar: Extrair a entrada do jogador (atualmente `on:keydown`) para um `TurnManager` que alterna entre ações do jogador e dos inimigos. Separar a movimentação (como ação) da execução imediata.

- Sistema de inventário
  - Onde adicionar: Criar `inventoryStore` global; definir células do `maze` como pickups (ex.: `cell === 4` para item). Ao coletar, atualizar a store e exibir HUD.

- Sistema de itens
  - Onde adicionar: Implementar objetos de item com propriedades (cura, buff, consumível). UI para equipar e usar entre turnos.

- Sistema de tempo
  - Onde adicionar/alterar: Transformar o cronômetro de `Game3.svelte` em um componente reutilizável `Timer` ou uma store `timerStore` para ativar/desativar por nível.

- Sistema de save/load e múltiplos slots
  - Onde adicionar: Implementar `SaveManager` que persiste (`localStorage` ou backend) `playerState`, `proximoNivel`, `inventory`, e `runProgress`. Adicionar UI no menu para `Salvar/Carregar` com múltiplos slots.

Refatorações recomendadas para extensões:
- Extrair renderização do labirinto para `MazeRenderer.svelte` (reaproveitável entre níveis).
- Extrair movimentação e verificação de colisão para `MovementService`/`CollisionService` (testável e reutilizável).
- Centralizar stores: `playerStore`, `levelStore`, `enemyStore`, `inventoryStore`, `runStore`.


## Resumo Final (arquitetura e roteiro para transformação em roguelite)
### Como o jogo funciona atualmente
- Arquitetura simples baseada em Svelte: telas controladas por stores (`estado`, `proximoNivel`).
- Cada nível descreve seu mapa em um array 2D embutido; o render é uma grid de `<div>`s com classes que definem aparência via CSS.
- Entrada do jogador é direta (teclas direcionais) e movimento é executado imediatamente se a célula destino não for parede.
- Feedbacks (vitória/derrota) são renderizados através de modal `sweetalert2` e, após confirmação, chamam mudanças de fase.

### Sistemas já existentes
- Gerenciamento de telas, seleção de fase, render de labirinto por grelha, input de teclado, verificação de colisões via consulta à matriz, detecção de saída, cronômetro simples no Nível 3.

### O que precisa mudar para um roguelite com combate por turnos e progressão entre runs
- Introduzir persistência (localStorage ou servidor) para meta-progression e múltiplos slots.
- Substituir mapas estáticos por gerador procedural (seed-driven) para runs distintas.
- Adicionar `TurnManager` para orquestrar turns entre jogador e inimigos.
- Criar `EnemyManager` e AI por turno, com dados de inimigos persistidos/gerenciados por store.
- Implementar sistema de inventário, itens, lojas e recompensas por run (meta-progression).
- Refatorar render/logic para módulos reutilizáveis e testáveis (`MazeRenderer`, `MovementService`, `CombatService`).

Estimativa geral: transformar em roguelite completo é um trabalho de média a alta complexidade (várias semanas, dependendo de escopo e equipe), mas a base (render, input, fases) já facilita a evolução.


---

Se desejar, posso:
- Gerar uma versão em PDF deste relatório;
- Criar uma checklist de tarefas para implementar as extensões acima;
- Ou exportar o relatório para um local específico.

Arquivo criado: `RELATORIO_TECNICO.md` no diretório raiz do projeto.
