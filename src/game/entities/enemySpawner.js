import { TILE_SIZE } from "../kaplay.js";
import { ENEMY_DEFS } from "../battle/enemyDefs.js";
const ENEMY_LABELS = { r: "R", b: "B", g: "G", a: "A", G: "G" };
const ENEMY_CHARS = { r: 1, b: 1, g: 1, a: 1, G: 1, f: 1 };

const ITEM_DEFS = {
  t: {
    color: [255, 200, 50],
    label: "+",
    outline: [200, 150, 0],
    key: "tempo",
  },
  p: {
    color: [140, 120, 100],
    label: "P",
    outline: [100, 80, 60],
    key: "pedra",
  },
  w: { color: [50, 100, 255], label: "W", outline: [0, 60, 200], key: "agua" },
  S: {
    color: [200, 180, 100],
    label: "S",
    outline: [160, 140, 60],
    key: "espada",
  },
  1: { sprite: "capacete", key: "capacete" },
  2: { sprite: "armadura", key: "armadura" },
  4: { sprite: "botas", key: "botas" },
};

export function spawnAll(k, mapData) {
  const entities = { enemies: [], items: [], rocks: [] };

  for (let r = 0; r < mapData.length; r++) {
    for (let c = 0; c < mapData[0].length; c++) {
      const ch = mapData[r][c];
      const pos = k.vec2(c * TILE_SIZE, r * TILE_SIZE);

      if (ENEMY_CHARS[ch]) {
        const def = ENEMY_DEFS[ch];
        if (!def) continue;

        if (ch === "f") {
          const frog = k.add([
            k.sprite("frog", { anim: "idle" }),
            k.pos(pos.x + TILE_SIZE / 2, pos.y + TILE_SIZE / 2),
            k.anchor("center"),
            k.scale(0.5),
            k.area({ width: 116, height: 116 }),
            k.z(5),
            "enemy",
            "enemy-f",
            {
              enemyKey: ch,
              hp: def.hp,
              maxHp: def.hp,
              atk: def.atk,
              def: def.def,
              speed: def.speed,
            },
          ]);
          entities.enemies.push(frog);
          continue;
        }

        const enemy = k.add([
          k.rect(TILE_SIZE - 4, TILE_SIZE - 4),
          k.color(...ENEMY_DEFS[ch].color),
          k.outline(2, k.Color.fromArray([255, 255, 255])),
          k.pos(pos),
          k.area({ width: TILE_SIZE - 4, height: TILE_SIZE - 4 }),
          k.z(5),
          "enemy",
          `enemy-${ch}`,
          {
            enemyKey: ch,
            hp: def.hp,
            maxHp: def.hp,
            atk: def.atk,
            def: def.def,
            speed: def.speed,
          },
        ]);
        const label = k.add([
          k.text(ENEMY_LABELS[ch], { size: 16 }),
          k.pos(pos.x + TILE_SIZE / 2, pos.y + TILE_SIZE / 2),
          k.anchor("center"),
          k.color(255, 255, 255),
          k.z(6),
        ]);
        enemy.labelRef = label;
        entities.enemies.push(enemy);
      } else if (ch === "x") {
        const rock = k.add([
          k.rect(TILE_SIZE - 4, TILE_SIZE - 4),
          k.color(100, 90, 80),
          k.pos(pos),
          k.area({ width: TILE_SIZE - 4, height: TILE_SIZE - 4 }),
          k.z(8),
          k.outline(2, k.Color.fromArray([80, 70, 60])),
          "rock-obstacle",
          "wall",
        ]);
        entities.rocks.push(rock);
      } else if (ITEM_DEFS[ch]) {
        const d = ITEM_DEFS[ch];

        if (d.sprite) {
          const scale = (TILE_SIZE * 0.575) / 512;
          const obj = k.add([
            k.sprite(d.sprite),
            k.pos(pos.x + TILE_SIZE / 2, pos.y + TILE_SIZE / 2),
            k.anchor("center"),
            k.scale(scale),
            k.area({ width: 460, height: 460 }),
            k.z(5),
            "item",
            `item-${d.key}`,
            { itemKey: d.key },
          ]);
          entities.items.push(obj);
          continue;
        }

        const obj = k.add([
          k.rect(TILE_SIZE * 0.6, TILE_SIZE * 0.6),
          k.color(...d.color),
          k.outline(2, k.Color.fromArray(d.outline)),
          k.pos(pos.x + TILE_SIZE / 2, pos.y + TILE_SIZE / 2),
          k.anchor("center"),
          k.area({ width: TILE_SIZE * 0.6, height: TILE_SIZE * 0.6 }),
          k.z(5),
          "item",
          `item-${d.key}`,
          { itemKey: d.key },
        ]);
        k.add([
          k.text(d.label, { size: 14 }),
          k.pos(pos.x + TILE_SIZE / 2, pos.y + TILE_SIZE / 2),
          k.anchor("center"),
          k.color(255, 255, 255),
          k.z(6),
        ]);
        entities.items.push(obj);
      }
    }
  }

  return entities;
}
