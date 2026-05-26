import Phaser from 'phaser'
import {
  PLAYER_SPEED, TILE_SIZE, SPRITE_FRAMES,
  PLAYER_MAX_HP, ATTACK_COOLDOWN, ATTACK_RANGE, PLAYER_IFRAMES,
  xpForNextLevel,
} from '../constants.js'

export default class Player {
  constructor(scene, col, row) {
    this._scene = scene
    const x = col * TILE_SIZE + TILE_SIZE / 2
    const y = row * TILE_SIZE + TILE_SIZE / 2

    this.sprite = scene.physics.add.sprite(x, y, 'chars01')
    this.sprite.setFrame(SPRITE_FRAMES.PLAYER)
    this.sprite.setDepth(10)
    this.sprite.body.setSize(18, 18)
    this.sprite.body.setCollideWorldBounds(true)

    // Stats
    this.hp    = PLAYER_MAX_HP
    this.maxHp = PLAYER_MAX_HP
    this.xp    = 0
    this.level = 1

    // Combat timers (scene.time.now stamps)
    this._nextAttack = 0
    this._iframesEnd = 0

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

    if (vx < 0) this.sprite.setFlipX(true)
    if (vx > 0) this.sprite.setFlipX(false)

    // Walk animation
    if (vx !== 0 || vy !== 0) {
      this.sprite.play('player-walk', true)
    } else {
      this.sprite.stop()
      this.sprite.setFrame(SPRITE_FRAMES.PLAYER)
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
    const dir = this.sprite.flipX ? -1 : 1
    return { x: this.sprite.x + dir * ATTACK_RANGE, y: this.sprite.y }
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
