import Phaser from 'phaser'

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    this.load.spritesheet('tiles',    'assets/sprites/otsp_tiles_01.png',    { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('walls',    'assets/sprites/otsp_walls_01.png',    { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('chars01',  'assets/sprites/otsp_creatures_01.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('chars02',  'assets/sprites/otsp_creatures_02.png', { frameWidth: 32, frameHeight: 32 })
  }

  create() {
    this._generateUtilTextures()
    this.scene.start('WorldScene')
  }

  _generateUtilTextures() {
    // ── 1-pixel white (collision body placeholder) ────────────────────────────
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
