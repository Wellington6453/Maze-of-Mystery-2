# Mapa e Sprites — Como funciona no KAPLAY

## Estrutura do Mapa

O mapa é uma matrix 122×122 em `src/game/levels/cavernLayout.js`. Cada caractere representa um tipo de célula:

| Char | Significado |
|------|-------------|
| `#` | Parede |
| ` ` (espaço) | Chão caminhável |
| `S` | Spawn do jogador |
| `z` | Spawn de Rato |
| `b` | Spawn de Morcego |
| `g` | Spawn de Goblin |
| `a` | Spawn de Arqueiro |
| `G` | Spawn de Golem |
| `1` | Espada |
| `2` | Equipamento |
| `4` | Picareta |
| `r` | Recurso: Pedra |
| `w` | Recurso: Água |
| `t` | Pickup de tempo |
| `o` | Rochedo (barreira destruível) |

## Renderização do Mapa (Canvas Chunks)

Em `src/game/rendering/spriteLoader.js`:

### 1. Carregamento dos tilesheets

Dois PNGs da coleção DoE (Dungeon of Elements) são carregados via `loadImage()`:

- `free_floor_TileSheet.png` — 400×304 px, grade 25×19 tiles de 16×16
- `free_walls&doors_TileSheet.png` — 448×384 px, grade 28×24 tiles de 16×16

### 2. Tiles usados

Cada tile é selecionado por coordenada de pixel no tilesheet:

| Tile | Função | Col/Row | Pixel (x, y) |
|------|--------|---------|--------------|
| Chão | Piso padrão | (13, 3) | (208, 48) |
| wall_vertical | Parede de corredor N-S | (1, 2) | (16, 32) |
| wall_horizontal | Parede de corredor E-W | (3, 2) | (48, 32) |

### 3. Divisão em chunks

O mapa 122×122 é dividido em blocos de **24×24 tiles**. Cada bloco vira um canvas independente com `(24 × 64) × (24 × 64)` pixels.

```
const chunk = 24
const numChunksX = Math.ceil(cols / chunk)  // ceil(122/24) = 6
const numChunksY = Math.ceil(rows / chunk)  // ceil(122/24) = 6
```

Total: **36 sprites** de canvas (6×6) em vez de 14.884 sprites individuais.

### 4. Iteração célula a célula

Para cada tile do chunk:

- **Chão**: desenha o tile (13,3) do floor tilesheet.
- **Parede** (`#`): verifica os 4 vizinhos (cima, baixo, esquerda, direita) para decidir orientação:

```js
const up = mapData[r-1][c] === '#'
const down = mapData[r+1][c] === '#'
const left = mapData[r][c-1] === '#'
const right = mapData[r][c+1] === '#'

const vertical = (up && down) || (up && !left && !right) || (down && !left && !right)
const horizontal = (left && right) || (left && !up && !down) || (right && !up && !down)

const frame = (horizontal && !vertical ? wallHFrames : wallVFrames)[0]
```

Regras:
- **Corredor vertical** (N-S): vizinhos ativos em cima E embaixo → `wall_vertical`
- **Corredor horizontal** (E-W): vizinhos ativos esquerda E direita → `wall_horizontal`
- **Cantos**: fallback para `wall_vertical`
- **Sem auto-tiling**: sem variação, sem cantos dedicados

### 5. Upload para GPU

Cada canvas é registrado como sprite KAPLAY:

```js
loadPromises.push(k.loadSprite(`lvl-${cx}-${cy}`, canvas))
await Promise.all(loadPromises)
```

O `Promise.all` garante que todos os uploads de textura para GPU terminem antes de prosseguir.

## Como o KAPLAY exibe o mapa

Em `src/game/scenes/gameScene.js`:

```js
const chunkInfo = await createLevelTexture(k, CAVERN_MAP)

for (let cy = 0; cy < chunkInfo.numChunksY; cy++)
  for (let cx = 0; cx < chunkInfo.numChunksX; cx++)
    k.add([
      k.sprite(`lvl-${cx}-${cy}`),
      k.pos(cx * chunkInfo.chunkSize * TILE_SIZE,
            cy * chunkInfo.chunkSize * TILE_SIZE),
      k.z(-1)
    ])
```

- `z(-1)` posiciona o mapa atrás de todas as entidades (jogador, inimigos, itens).
- O KAPLAY renderiza ~36 objetos de chunk + algumas entidades, em vez de 14.884 tiles individuais.

## Entidades no mapa (placeholders visuais)

Em `src/game/entities/enemySpawner.js`, cada caractere especial vira uma entidade KAPLAY na posição `(col * 64 + 32, row * 64 + 32)` com um retângulo colorido:

| Char | Entidade | Cor |
|------|----------|-----|
| `z` | Rato | Vermelho |
| `b` | Morcego | Roxo |
| `g` | Goblin | Laranja |
| `a` | Arqueiro | Rosa |
| `G` | Golem | Cinza escuro |
| `r` | Pedra (recurso) | Marrom |
| `w` | Água (recurso) | Azul |
| `t` | Pickup de tempo | Amarelo |
| `o` | Rochedo | Cinza |
| `1`, `2`, `4` | Itens/Equipamentos | Verde |

## Colisão (grid-based)

A movimentação do jogador usa lerp suave (150ms) com `isMoving` bloqueante. Quando o movimento completa, `gameScene.js` verifica a célula alvo no `CAVERN_MAP`:

- **Inimigo** (`z/b/g/a/G`): inicia batalha via `battleManager.js`
- **Item** (`1/2/4/r/w/t`): coleta via `items.js`
- **Rochedo** (`o`): se tiver picareta, destrói; senão, bloqueia
- **Parede** (`#`): bloqueia movimento (impedido pela verificação de caminhabilidade)

Este método é mais confiável que `k.onCollide` para detecção precisa em grid.

## Fluxo completo

```
main.js → App.svelte → Game.svelte → game/init.js
  ├── loadGameSprites(k)       → carrega atlas do player + heart
  ├── createLevelTexture(k, map) → chunks canvas → sprites KAPLAY
  └── setupScene(k)            → posiciona chunks, spawna entidades, HUD, fog, timer
```
