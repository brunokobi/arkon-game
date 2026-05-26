import { TILE } from '../constants.js'

const W = TILE
export const MAP_W = 58
export const MAP_H = 30

/**
 * Skálholm — Venarum (entrada oeste)
 * Layout:
 *   - Corredor leste (entrada do Bifrost): cols 50-56, rows 13-15
 *   - Câmara de entrada: cols 38-50, rows 9-21
 *   - Praça principal Venarum: cols 17-38, rows 4-26
 *   - Beco norte (labiríntico): cols 5-17, rows 4-14
 *   - Bolso oeste (esconderijo do Aerugo): cols 1-6, rows 9-17
 *   - Beco sul: cols 5-17, rows 16-26
 *   - Pools de mana vazando por toda parte (design de Molusk)
 */
function buildMap() {
  const map = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(W.WALL))

  const carve = (x1, y1, x2, y2, type = W.FLOOR) => {
    for (let y = y1; y <= y2; y++)
      for (let x = x1; x <= x2; x++)
        map[y][x] = type
  }

  // Corredor leste (do Bifrost)
  carve(50, 13, 56, 15)
  carve(57, 13, 57, 15, W.EXIT_EAST)

  // Câmara de entrada
  carve(38, 9, 50, 21)

  // Praça principal — Venarum
  carve(17, 4, 38, 26)

  // Pools de mana — norte da praça (vazamentos dos dutos de Molusk)
  carve(19, 6, 26, 13, W.MANA_FLOOR)

  // Pools de mana — sul da praça
  carve(22, 16, 36, 24, W.MANA_FLOOR)

  // Beco norte
  carve(5, 4, 17, 14)

  // Mana no beco norte (vazamento pesado)
  carve(7, 6, 13, 11, W.MANA_FLOOR)

  // Bolso oeste — esconderijo do Aerugo
  carve(1, 9, 6, 17)

  // Beco sul
  carve(5, 16, 17, 26)

  // Mana no beco sul
  carve(6, 19, 11, 24, W.MANA_FLOOR)

  return map
}

export const SKALHOLM_MAP = buildMap()

export const SKALHOLM_NPCS = [
  {
    id:   'graxis',
    name: 'Graxis',
    tile: { col: 27, row: 15 },
    dialogue: [
      {
        text: 'Você não é daqui. Consegui saber em dois segundos — e não foi pelo rosto.',
        next: 1,
      },
      {
        text: 'Skálholm não tem lei escrita. Tem regras. E as regras, aqui, sou eu.',
        next: 2,
      },
      {
        text: 'Se veio trabalhar pro Bonde, fala com Supervisão. Se veio espiar, já sabe o que acontece.',
        next: null,
      },
    ],
  },
  {
    id:   'aerugo',
    name: 'Aerugo',
    tile: { col: 3, row: 13 },
    dialogue: [
      {
        text: 'Chá de mana? Recém-chegado tem desconto — Molusk manda assim.',
        next: 1,
      },
      {
        text: 'Eu falo de tudo. De bom grado. Sempre fui assim. Transparente. Colaborativo.',
        next: 2,
      },
      {
        text: 'A campanha anticorrupção? Fui eu a estrela. Bonito, né? Ninguém perguntou com quem eu colaborava.',
        next: null,
      },
    ],
  },
]

export const SKALHOLM_EXITS = {
  east: { label: 'BIFROST INFERIOR', zone: 'bifrost', spawnIn: { col: 3, row: 12 } },
}

export const PLAYER_SPAWN = { col: 52, row: 14 }

export const ZONE = {
  id:    'skalholm',
  name:  'SKÁLHOLM — VENARUM',
  map:   SKALHOLM_MAP,
  mapW:  MAP_W,
  mapH:  MAP_H,
  npcs:  SKALHOLM_NPCS,
  exits: SKALHOLM_EXITS,
  spawn: PLAYER_SPAWN,
  music: 'bifrost-music',
  tiles: {
    floor: 160,  // terra oliva escura — chão orgânico sem planejamento
    wall:  176,  // terra marrom profunda — paredes compactadas de Venarum
    mana:  130,  // terra rachada laranja — mana de Molusk vazando pelas rachaduras
    exit:  284,  // pedra bruta escura — passagem para o Bifrost
  },
  manaParticle: 0xffdd44,  // amarelo-dourado (contraste sobre o chão laranja)
}
