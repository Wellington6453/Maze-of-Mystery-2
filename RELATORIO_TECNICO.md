# Relatório Técnico — Maze of Mystery 2 → Escape da Caverna

Data: 4 de junho de 2026

Este documento descreve o estado atual do projeto "Maze of Mystery 2" (rebatizado como "Escape da Caverna") após o revamp completo da engine.

---

## O que foi feito

### Engine e Renderização
- Migração de CSS-grid + `<div>`s para **KAPLAY 3001** com render por canvas chunks
- Mapa 122×122 reduzido de 14.884 objetos para ~16 sprites de canvas (chunks 24×24 tiles)
- Spritesheet DoE: chão tile único (13,3), paredes divididas por orientação (vertical/horizontal), sem auto-tiling ou cantos
- Fog of war: pool de tiles pretos criados uma vez na inicialização, toggle via `.hidden`
- `imageSmoothingEnabled = false` nos canvases para evitar bleeding entre tiles

### Jogador
- Spritesheet 192×320 com animações idle/run/attack por direção, flipX para esquerda
- Movimento grid-based via lerp (150ms) com `isMoving` bloqueante
- Input via objeto `inputCtrl` estável (`export const` — evita quebra de binding do Rollup)
- TILE_SIZE = 64, camScale = 1, player scale(2) anchor("center")

### Sistema de Combate
- Turn-based (Pokémon-style): ordem por atributo speed
- Menu de 4 ações: Atacar, Esquivar, Pedra (confunde), Água (debuffs bats/Golem +50% dano)
- Fórmula ATK - DEF (mínimo 1)
- 5 tipos de inimigo com stats atualizadas:
  - Rato: 20 HP / 3 ATK / 0 DEF (20 unidades)
  - Morcego: 15 HP / 4 ATK / 0 DEF (15 unidades)
  - Goblin: 20 HP / 6 ATK / 3 DEF (10 unidades)
  - Arqueiro: 15 HP / 8 ATK / 2 DEF (6 unidades)
  - Golem: 60 HP / 12 ATK / 8 DEF (1 unidade, perto da saída)
- UI de batalha: overlay semi-transparente, HP bars do inimigo e jogador, 4 botões de ação, log das últimas 6 ações
- Correção de chain-click via `setTimeout(recreateBattleUI, 0)`

### Itens e Equipamentos
- Espada: eleva ATK de 5 para 15; necessária para enfrentar goblins, arqueiros e golem (bloqueiam passagem sem ela)
- Equipamentos (meta-progressão):
  - Capacete: +10 HP, +5% def, visão 3→5 tiles
  - Armadura: +30 HP, +20% def
  - Botas: +20 HP, +15% def
  - Set bonus: +5% def (cap 40%)
- Picareta Antiga: drop do Golem, destrói rochas que bloqueiam a saída
- Itens de tempo: +30~90s ao timer
- Recursos de batalha: rochas e água (coletáveis no mapa)
- 4 zonas: Z1 (entrada, ratos/morcegos), Z2 (minas, espada/goblins), Z3 (profundezas, equipamentos/goblins/arqueiros), Z4 (câmara, golem/rochas/saída)

### Timer e Meta-Progessão
- Timer de 30 segundos por run
- Primeira fuga desbloqueia upgrade de +90s (salvo como meta-progresso)
- Pickups de tempo espalhados pelo mapa (+30~90s)
- Save/Load via localStorage para estado da run + meta-progresso
- Estatísticas: totalRuns, totalEscapes, bestTime, timeUpgrade, totalEnemiesKilled, ownedEquipment

### Telas (estilo Figma Maker)
- **Menu principal**: fundo com overlay gradiente, logo com animação float, botões âmbar com cantos verdes e glow hover
- **Como Jogar**: seções de história, controles WASD, missão, exploração, inimigos, dicas
- **Créditos**: lista de desenvolvedores com links GitHub no mesmo estilo visual
- Fonte: Press Start 2P (Google Fonts)

### Limpeza e Padronização
- 7 arquivos src/ órfãos deletados (AllGames, Game2, Game3, VoltarMenu, MazeRenderer, mudarFase, tileDefs)
- 2 CSS órfãos deletados (game2.css, game3.css)
- Dependências não usadas removidas (sweetalert, sweetalert2)
- Indentação padronizada para 2 espaços
- Quotes padronizadas para single (')

---

## O que ainda falta / está incompleto

| Item | Status | Detalhes |
|------|--------|----------|
| **UI do combate turno** | ✅ Funcional (placeholder) | Overlay básico funciona, mas sem arte final — barras, botões e log são retângulos coloridos do KAPLAY |
| **Colisão no mapa** | ✅ Funciona | Grid-based por verificação pós-movimento, mas **sprites de parede podem estar com orientação incorreta** em algumas células (cantos, interseções) |
| **Sistema de tempo** | ✅ Funciona | Timer 30s decrementa, pickups funcionam, meta-upgrade +90s salvo |
| **Sistema roguelike** | ❌ Não implementado | Sem geração procedural de mapa, sem randomização de itens/inimigos entre runs, permadeath não testado |
| **Áudio** | ❌ Ausente | Sem assets sonoros, sem chamadas de áudio no código |
| **Tela de morte/vitória** | ⚠️ Parcial | Transições via `k.go('cavern')`, sem tela dedicada com animação ou feedback visual |
| **Números flutuantes** | ❌ Ausente | Dano exibido apenas no log de texto da batalha |
| **Confirmação de saída** | ❌ Ausente | Sem diálogo de confirmação ao sair de uma run |
| **Tela de História** | ❌ Desconectada | `Historia.svelte` existe com o texto introdutório, mas não está integrada no fluxo novo do jogo |
| **Equilíbrio** | ⚠️ Não testado | Dificuldade, spawn rates, timer e drop rates não foram balanceados |

---

## Arquivos relevantes

### Núcleo do jogo
| Arquivo | Função |
|---------|--------|
| `src/game/levels/cavernLayout.js` | Mapa 122×122 com marcadores de spawn |
| `src/game/rendering/spriteLoader.js` | Render canvas chunk + load de sprites |
| `src/game/scenes/gameScene.js` | Lógica principal (timer, HUD, fog, colisão, batalha, vitória/derrota) |
| `src/game/gameState.js` | Stores globais (HP, ATK, DEF, itens, meta) |
| `src/game/init.js` | Orquestrador: carrega sprites, cria textura do nível, inicia cena |

### Batalha
| Arquivo | Função |
|---------|--------|
| `src/game/battle/battleManager.js` | Engine turn-based (ações, turnos, status, dano) |
| `src/game/battle/battleUI.js` | Overlay visual da batalha |
| `src/game/battle/enemyDefs.js` | Definições dos 5 inimigos |

### Entidades
| Arquivo | Função |
|---------|--------|
| `src/game/entities/player.js` | Player: spawn, movimento lerp, animações |
| `src/game/entities/enemySpawner.js` | Varre o mapa e cria entidades (inimigos, itens, rochas) |
| `src/game/entities/items.js` | Coleta de itens, aplicação de equipamentos |

### Persistência
| Arquivo | Função |
|---------|--------|
| `src/game/saveManager.js` | Save/load via localStorage (run + meta) |
| `src/game/kaplay.js` | Singleton do KAPLAY |

### Telas
| Arquivo | Função |
|---------|--------|
| `src/Menu.svelte` | Menu principal |
| `src/Ajuda.svelte` | Como Jogar |
| `src/Sobre.svelte` | Créditos |
| `src/Historia.svelte` | Texto introdutório (não integrado) |
| `src/App.svelte` | Roteamento por estado |
| `src/Game.svelte` | Container do canvas KAPLAY |

---

## Estrutura de diretórios (src/)

```
src/
├── main.js
├── App.svelte
├── Estado.js
├── Menu.svelte
├── Ajuda.svelte
├── Sobre.svelte
├── Historia.svelte
├── Game.svelte
└── game/
    ├── kaplay.js
    ├── gameState.js
    ├── init.js
    ├── saveManager.js
    ├── levels/
    │   └── cavernLayout.js
    ├── rendering/
    │   └── spriteLoader.js
    ├── scenes/
    │   └── gameScene.js
    ├── entities/
    │   ├── player.js
    │   ├── enemySpawner.js
    │   └── items.js
    └── battle/
        ├── battleManager.js
        ├── battleUI.js
        └── enemyDefs.js
```

---

## Próximos passos sugeridos

1. Corrigir orientação das sprites de parede em cantos e interseções complexas
2. Implementar tela de morte com animação e opção de reiniciar
3. Implementar tela de vitória com estatísticas da run
4. Adicionar números flutuantes de dano durante batalhas
5. Adicionar placeholder de áudio (chamadas preparadas para quando houver assets)
6. Integrar tela de História ao fluxo do jogo
7. Adicionar confirmação antes de sair de uma run
8. Balancear dificuldade (HP inimigos, timer, drop rates)
