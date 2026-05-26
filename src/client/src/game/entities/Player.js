import Phaser from 'phaser'
import {
  PLAYER_SPEED, TILE_SIZE,
  PLAYER_MAX_HP, ATTACK_COOLDOWN, ATTACK_RANGE, PLAYER_IFRAMES,
  xpForNextLevel,
} from '../constants.js'

export default class Player {
  constructor(scene, col, row) {
    this._scene = scene
    const x = col * TILE_SIZE + TILE_SIZE / 2
    const y = row * TILE_SIZE + TILE_SIZE / 2

    this.sprite = scene.physics.add.sprite(x, y, 'corvo', 'cs0')
    this.sprite.setDepth(10)
    // Body is a small box at the character's lower-center (sprite is 64×64)
    this.sprite.body.setSize(24, 20)
    this.sprite.body.setOffset(20, 36)
    this.sprite.body.setCollideWorldBounds(true)

    // Stats
    this.hp    = PLAYER_MAX_HP
    this.maxHp = PLAYER_MAX_HP
    this.xp    = 0
    this.level = 1

    // Combat timers (scene.time.now stamps)
    this._nextAttack = 0
    this._iframesEnd = 0

    // Last facing direction: 's' | 'n' | 'e' | 'w'
    this._facing = 's'

    // Controls (WASD + arrows + Space to attack)
    const K = Phaser.Input.Keyboard.KeyCodes
    this.keys = scene.input.keyboard.addKeys({
      up:       K.W,
      down:     K.S,
      left:     K.A,
      right:    K.D,
      upArr:    K.UP,
      downArr:  K.DOWN,
      leftArr:  K.LEFT,
      rightArr: K.RIGHT,
      interact: K.E,
      attack:   K.SPACE,
    })
  }

  update() {
    const { up, down, left, right, upArr, downArr, leftArr, rightArr } = this.keys
    const body = this.sprite.body

    let vx = 0
    let vy = 0
    if (left.isDown  || leftArr.isDown)  vx = -PLAYER_SPEED
    if (right.isDown || rightArr.isDown) vx =  PLAYER_SPEED
    if (up.isDown    || upArr.isDown)    vy = -PLAYER_SPEED
    if (down.isDown  || downArr.isDown)  vy =  PLAYER_SPEED

    if (vx !== 0 && vy !== 0) { vx *= 0.7071; vy *= 0.7071 }

    body.setVelocity(vx, vy)

    if (vx < 0) { this.sprite.setFlipX(true);  this._facing = 'w' }
    if (vx > 0) { this.sprite.setFlipX(false); this._facing = 'e' }
    // Vertical overrides horizontal for facing/animation
    if (vy < 0) { this._facing = 'n' }
    if (vy > 0) { this._facing = 's' }

    if (vx !== 0 || vy !== 0) {
      const anim = (this._facing === 'n') ? 'corvo-n' : 'corvo-s'
      this.sprite.play(anim, true)
    } else {
      this.sprite.stop()
      this.sprite.setFrame('cs0')
    }
  }

  /** Returns true once when Space is pressed and cooldown expired. */
  tryAttack() {
    const now = this._scene.time.now
    if (now < this._nextAttack) return false
    if (!Phaser.Input.Keyboard.JustDown(this.keys.attack)) return false
    this._nextAttack = now + ATTACK_COOLDOWN
    return true
  }

  /** Position of the melee hitbox in front of the player. */
  get attackOrigin() {
    const offsets = {
      s: { x: 0,              y:  ATTACK_RANGE },
      n: { x: 0,              y: -ATTACK_RANGE },
      e: { x:  ATTACK_RANGE,  y: 0 },
      w: { x: -ATTACK_RANGE,  y: 0 },
    }
    const o = offsets[this._facing] ?? offsets.s
    return { x: this.sprite.x + o.x, y: this.sprite.y + o.y, dir: this._facing }
  }

  /** Apply damage; returns actual damage taken (0 if invulnerable). */
  takeDamage(amount) {
    const now = this._scene.time.now
    if (now < this._iframesEnd) return 0
    this.hp = Math.max(0, this.hp - amount)
    this._iframesEnd = now + PLAYER_IFRAMES
    return amount
  }

  /**
   * Add XP and handle level-up.
   * Returns true if the player leveled up.
   */
  gainXP(amount) {
    this.xp += amount
    const needed = xpForNextLevel(this.level)
    if (this.xp >= needed) {
      this.level++
      this.xp = Math.max(0, this.xp - needed)
      return true
    }
    return false
  }

  get didInteract() {
    return Phaser.Input.Keyboard.JustDown(this.keys.interact)
  }

  get x() { return this.sprite.x }
  get y() { return this.sprite.y }
}
