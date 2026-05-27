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
    this.load.spritesheet('bftiles',  'assets/sprites/bifrost_sprites.png',   { frameWidth: 32, frameHeight: 32 })
    this.load.image('corvo',          'assets/sprites/corvo_alpha.png')
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
    // ── Corvo character — custom 64×64 frames ──────────────────────────────────
    // Layout: each row = 1 walk frame; each col = 1 direction
    //   col 0 (x=0):   South  — face visible
    //   col 1 (x=64):  East   — right profile
    //   col 2 (x=128): West   — left profile (back visible)
    //   col 3 (x=192): North  — full back to camera
    const tex = this.textures.get('corvo')
    tex.add('cs0', 0,   0, 224, 64, 64)
    tex.add('cs1', 0,   0, 288, 64, 64)
    tex.add('cs2', 0,   0, 352, 64, 64)
    tex.add('cw0', 0,  64, 224, 64, 64)
    tex.add('cw1', 0,  64, 288, 64, 64)
    tex.add('cw2', 0,  64, 352, 64, 64)
    tex.add('cn0', 0, 128, 224, 64, 64)
    tex.add('cn1', 0, 128, 288, 64, 64)
    tex.add('cn2', 0, 128, 352, 64, 64)
    tex.add('ce0', 0, 192, 224, 64, 64)
    tex.add('ce1', 0, 192, 288, 64, 64)
    tex.add('ce2', 0, 192, 352, 64, 64)
    // Green mana sword (equipment row y=64)
    tex.add('sword', 0, 0, 64, 32, 32)

    const makeAnim = (key, frames) => this.anims.create({
      key, repeat: -1, frameRate: 7,
      frames: frames.map(f => ({ key: 'corvo', frame: f })),
    })
    makeAnim('corvo-s', ['cs0', 'cs1', 'cs2'])
    makeAnim('corvo-e', ['ce0', 'ce1', 'ce2'])
    makeAnim('corvo-w', ['cw0', 'cw1', 'cw2'])
    makeAnim('corvo-n', ['cn0', 'cn1', 'cn2'])
  }
}
