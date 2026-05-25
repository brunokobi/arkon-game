export const TILE_SIZE = 32

export const TILE = {
  FLOOR:      0,
  WALL:       1,
  MANA_FLOOR: 2,
  EXIT_WEST:  4,
  EXIT_EAST:  5,
}

export const COLORS = {
  wall:       0x16162a,
  wallTop:    0x252542,
  wallSide:   0x0d0d1a,
  floor:      0x0a0a14,
  floorAlt:   0x0e0e1a,
  manaFloor:  0x150c04,
  manaGlow:   0xff6600,
  exitFloor:  0x050508,
  player:     0xe8d5a3,
  playerEdge: 0xfff0d0,
  npc:        0xc8a96e,
  npcGlow:    0xf0a830,
  interactHint: 0xffdd44,
  bg:         0x050508,
}

export const PLAYER_SPEED   = 160
export const INTERACT_DIST  = 48   // pixels, distance to show interact hint
