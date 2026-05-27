import { TILE } from '../constants.js'

// Frame indices in bifrost_sprites.png (frameWidth=32, frameHeight=32)
export const BF = {
  // Terrain
  FLOOR:       0,
  FLOOR_B:     1,
  MANA_PULSE:  2,
  WALL:        3,
  WALL_B:      4,
  WALL_C:      5,
  PATH_WOOD:   6,
  PATH_IRON:   7,
  // Items
  POTION:      8,
  MANA_SHARD:  9,
  DARK_FRUIT:  10,
  HAT:         11,
  DAGGER:      12,
  GRATE:       13,
  BOOK_I:      14,
  RUNE_FRAG:   15,
  TERM_FRAG:   16,
}

const W = TILE
export const MAP_W = 52
export const MAP_H = 26

/**
 * Bifrost Inferior — Área inicial (Arco 0)
 * Layout:
 *   - Corredor principal: horizontal, y=11-13 (3 tiles largura), full width
 *   - Câmara oeste (chegada): x=2-14, y=5-19  (onde o jogador aparece)
 *   - Checkpoint central:  x=16-35, y=4-21  (onde Mercus fica)
 *   - Passagem leste: x=36-51, y=11-13
 *   - Saída oeste: x=0, y=11-13
 *   - Saída leste: x=51, y=11-13
 */
function buildMap() {
  // Start with walls everywhere
  const map = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(W.WALL))

  const carve = (x1, y1, x2, y2, type = W.FLOOR) => {
    for (let y = y1; y <= y2; y++)
      for (let x = x1; x <= x2; x++)
        map[y][x] = type
  }

  // Main horizontal corridor
  carve(0, 11, MAP_W - 1, 13)

  // West arrival chamber
  carve(2, 5, 14, 19)

  // Central checkpoint (wider)
  carve(16, 4, 35, 21)

  // Mana glow area — center of checkpoint, around the duto pillar
  carve(22, 9, 29, 15, W.MANA_FLOOR)

  // East passage continuation
  carve(36, 11, MAP_W - 2, 13)

  // Exits (passable, no collision)
  carve(0, 11, 0, 13, W.EXIT_WEST)
  carve(MAP_W - 1, 11, MAP_W - 1, 13, W.EXIT_EAST)

  // Small detail: narrow passage between west chamber and checkpoint
  carve(15, 11, 15, 13)

  return map
}

export const BIFROST_MAP = buildMap()

// ── NPCs & interactables ─────────────────────────────────────────────────────
export const BIFROST_NPCS = [
  {
    id:     'mercus',
    name:   'Mercus',
    tile:   { col: 25, row: 12 },
    lore:   'autônomo',
    dialogue: [
      {
        text: 'Você chegou. O Bifrost registra tudo — inclusive a ausência de ID no seu pulso.',
        next: 1,
      },
      {
        text: 'Passagem custa. Se não tem moeda, tem trabalho. Sempre tem trabalho aqui dentro.',
        next: 2,
      },
      {
        text: 'Oeste é Skálholm. Leste é Aetherion. Eu fico aqui no meio — que é, na minha experiência, o único lugar razoável para se ficar.',
        next: null,
      },
    ],
  },
]

// ── Zone transitions ─────────────────────────────────────────────────────────
export const BIFROST_EXITS = {
  west: { label: 'SKÁLHOLM',                       zone: 'skalholm', spawnIn: { col: 52, row: 14 } },
  east: { label: 'AETHERION — em desenvolvimento', zone: null },
}

// ── Player spawn ─────────────────────────────────────────────────────────────
export const PLAYER_SPAWN = { col: 6, row: 12 }

export const ZONE = {
  id:    'bifrost',
  name:  'BIFROST INFERIOR',
  map:   BIFROST_MAP,
  mapW:  MAP_W,
  mapH:  MAP_H,
  npcs:  BIFROST_NPCS,
  exits: BIFROST_EXITS,
  spawn: PLAYER_SPAWN,
  music: 'bifrost-music',
  tileSheet: 'bftiles',
  tiles: {
    floor: BF.FLOOR,
    wall:  BF.WALL,
    mana:  BF.MANA_PULSE,
    exit:  BF.PATH_WOOD,
  },
  manaParticle: 0x44ccff,  // azul
  enemies: [],
}
