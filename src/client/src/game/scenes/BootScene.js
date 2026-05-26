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
    this.load.audio('bifrost-music',  'assets/dark-fallout.ogg')
  }

  create() {
    this._generateUtilTextures()
    this._createAnimations()
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

    // ── Manaphis — orbe de mana laranja ──────────────────────────────────────
    const m = this.make.graphics({ add: false })
    m.fillStyle(0xaa2200, 1);  m.fillCircle(10, 10, 10)
    m.fillStyle(0xff5500, 1);  m.fillCircle(10, 10,  7)
    m.fillStyle(0xff9922, 1);  m.fillCircle(10, 10,  4)
    m.fillStyle(0xffdd88, 1);  m.fillCircle(10, 10,  2)
    m.generateTexture('manaphis', 20, 20)
    m.destroy()

    // ── Vignette — radial gradient, transparent center → dark edges ──────────
    const W = 800, H = 560
    const vc = document.createElement('canvas')
    vc.width = W
    vc.height = H
    const ctx = vc.getContext('2d')
    const g = ctx.createRadialGradient(W / 2, H / 2, W * 0.12, W / 2, H / 2, W * 0.62)
    g.addColorStop(0,   'rgba(0,0,0,0)')
    g.addColorStop(0.6, 'rgba(0,0,0,0.12)')
    g.addColorStop(1,   'rgba(0,0,0,0.78)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, W, H)
    this.textures.addCanvas('vignette', vc)
  }

  _createAnimations() {
    // South / east walk — flipX for west
    this.anims.create({
      key: 'walk-s',
      frames: this.anims.generateFrameNumbers('chars01', { frames: [32, 33, 34] }),
      frameRate: 8,
      repeat: -1,
    })
    // North walk (knight facing away from camera)
    this.anims.create({
      key: 'walk-n',
      frames: this.anims.generateFrameNumbers('chars01', { frames: [38, 39, 40] }),
      frameRate: 8,
      repeat: -1,
    })
  }
}
