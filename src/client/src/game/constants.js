export const TILE_SIZE = 32

export const TILE = {
  FLOOR:      0,
  WALL:       1,
  MANA_FLOOR: 2,
  EXIT_WEST:  4,
  EXIT_EAST:  5,
}

// Frame indices for the OTSP sprite sheets (32×32 grid, 16 cols)
export const SPRITE_FRAMES = {
  // tiles_01.png
  FLOOR:      224,  // row 14 — gray rounded cobblestone (dungeon floor)
  WALL_BG:    192,  // row 12 — dark brown earth (wall)
  MANA:       304,  // row 19 — blue tile (mana zone)
  EXIT:       288,  // row 18 — light marble (exit marker)
  // creatures_01.png
  PLAYER:     32,   // row 2  — silver armored knight
  NPC_MERCUS: 48,   // row 3  — hooded figure with torch (Mercus)
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
