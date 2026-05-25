import Phaser from 'phaser'
import { TILE_SIZE, COLORS } from '../constants.js'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  create() {
    this._generateTextures()
    this.scene.start('WorldScene')
  }

  _generateTextures() {
    const S = TILE_SIZE

    // ── Tile: floor (0) ───────────────────────────────────────────────────────
    const floor = this.make.graphics({ add: false })
    floor.fillStyle(COLORS.floor)
    floor.fillRect(0, 0, S, S)
    // Checker-like subtle variation
    floor.fillStyle(COLORS.floorAlt)
    floor.fillRect(0, 0, S / 2, S / 2)
    floor.fillRect(S / 2, S / 2, S / 2, S / 2)
    // Single-pixel border (inset)
    floor.lineStyle(1, 0x0d0d1a, 0.5)
    floor.strokeRect(0.5, 0.5, S - 1, S - 1)
    floor.generateTexture('tile_floor', S, S)
    floor.destroy()

    // ── Tile: wall (1) ────────────────────────────────────────────────────────
    const wall = this.make.graphics({ add: false })
    wall.fillStyle(COLORS.wall)
    wall.fillRect(0, 0, S, S)
    // Top highlight
    wall.fillStyle(COLORS.wallTop)
    wall.fillRect(0, 0, S, 3)
    wall.fillRect(0, 0, 2, S)
    // Bottom / right shadow
    wall.fillStyle(COLORS.wallSide)
    wall.fillRect(0, S - 2, S, 2)
    wall.fillRect(S - 2, 0, 2, S)
    // Inner bevel
    wall.fillStyle(0x1e1e38)
    wall.fillRect(2, 2, S - 4, S - 4)
    wall.generateTexture('tile_wall', S, S)
    wall.destroy()

    // ── Tile: mana floor (2) ─────────────────────────────────────────────────
    const mana = this.make.graphics({ add: false })
    mana.fillStyle(COLORS.manaFloor)
    mana.fillRect(0, 0, S, S)
    // Faint glow dot center
    mana.fillStyle(COLORS.manaGlow, 0.35)
    mana.fillCircle(S / 2, S / 2, 5)
    mana.fillStyle(COLORS.manaGlow, 0.12)
    mana.fillCircle(S / 2, S / 2, 12)
    mana.generateTexture('tile_mana', S, S)
    mana.destroy()

    // ── Tile: exit floor (4 / 5) ──────────────────────────────────────────────
    const exit = this.make.graphics({ add: false })
    exit.fillStyle(COLORS.exitFloor)
    exit.fillRect(0, 0, S, S)
    exit.fillStyle(0x1a1a40, 0.6)
    exit.fillRect(S / 2 - 1, 0, 2, S)
    exit.generateTexture('tile_exit', S, S)
    exit.destroy()

    // ── Player sprite (20x20) ─────────────────────────────────────────────────
    const player = this.make.graphics({ add: false })
    // Body
    player.fillStyle(COLORS.player)
    player.fillRect(3, 4, 14, 14)
    // Head
    player.fillStyle(COLORS.playerEdge)
    player.fillRect(5, 2, 10, 10)
    // Highlight
    player.fillStyle(0xffffff, 0.4)
    player.fillRect(5, 2, 10, 2)
    player.fillRect(5, 2, 2, 10)
    player.generateTexture('player', 20, 20)
    player.destroy()

    // ── NPC: Mercus (18x18) ───────────────────────────────────────────────────
    const npc = this.make.graphics({ add: false })
    // Outer glow
    npc.fillStyle(COLORS.npcGlow, 0.2)
    npc.fillCircle(9, 9, 9)
    // Body
    npc.fillStyle(COLORS.npc)
    npc.fillCircle(9, 9, 7)
    // Highlight
    npc.fillStyle(0xffe8a0, 0.6)
    npc.fillCircle(7, 7, 3)
    npc.generateTexture('npc_mercus', 18, 18)
    npc.destroy()

    // ── 1-pixel white (used for tinting / misc) ───────────────────────────────
    const px = this.make.graphics({ add: false })
    px.fillStyle(0xffffff)
    px.fillRect(0, 0, 1, 1)
    px.generateTexture('pixel', 1, 1)
    px.destroy()

    // ── Interact hint "E" badge ───────────────────────────────────────────────
    const hint = this.make.graphics({ add: false })
    hint.fillStyle(0xffdd44)
    hint.fillRoundedRect(0, 0, 20, 20, 4)
    hint.fillStyle(0x1a1a00)
    hint.fillRect(7, 6, 6, 2)
    hint.fillRect(7, 9, 5, 2)
    hint.fillRect(7, 12, 6, 2)
    hint.fillRect(7, 6, 2, 8)
    hint.generateTexture('hint_e', 20, 20)
    hint.destroy()
  }
}
