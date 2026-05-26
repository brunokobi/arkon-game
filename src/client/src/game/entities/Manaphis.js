import {
  MANAPHIS_HP, MANAPHIS_DAMAGE, MANAPHIS_SPEED, MANAPHIS_XP,
  ENEMY_CHASE_RANGE, ENEMY_ATTACK_DIST,
} from '../constants.js'

export default class Manaphis {
  constructor(scene, x, y) {
    this._scene = scene
    this.hp     = MANAPHIS_HP
    this.maxHp  = MANAPHIS_HP
    this.dead   = false

    this.xpReward      = MANAPHIS_XP
    this._nextDmgTick  = 0
    this._wanderTimer  = 0
    this._wanderVx     = 0
    this._wanderVy     = 0

    // Physics sprite
    this.sprite = scene.physics.add.sprite(x, y, 'manaphis')
    this.sprite.setDepth(8)
    this.sprite.body.setSize(14, 14)
    this.sprite.body.setCollideWorldBounds(true)

    // Pulsing glow tween
    scene.tweens.add({
      targets:  this.sprite,
      scaleX:   1.2,
      scaleY:   1.2,
      alpha:    0.82,
      duration: 650,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    })

    // HP bar (background + fill)
    this._hpBg  = scene.add.rectangle(x, y - 14, 20, 3, 0x440000).setDepth(8)
    this._hpFill = scene.add.rectangle(x, y - 14, 20, 3, 0xff2200).setDepth(9)
  }

  /** Returns damage dealt to player this frame (0 if none). */
  update(px, py) {
    if (this.dead) return 0

    const dx   = px - this.sprite.x
    const dy   = py - this.sprite.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const now  = this._scene.time.now

    // Movement AI
    if (dist < ENEMY_CHASE_RANGE) {
      // Chase player
      this.sprite.body.setVelocity(
        (dx / dist) * MANAPHIS_SPEED,
        (dy / dist) * MANAPHIS_SPEED,
      )
    } else {
      // Wander
      if (now >= this._wanderTimer) {
        this._wanderTimer = now + 1400 + Math.random() * 1800
        const angle = Math.random() * Math.PI * 2
        this._wanderVx = Math.cos(angle) * MANAPHIS_SPEED * 0.4
        this._wanderVy = Math.sin(angle) * MANAPHIS_SPEED * 0.4
      }
      this.sprite.body.setVelocity(this._wanderVx, this._wanderVy)
    }

    // Update HP bar position and fill
    const sx = this.sprite.x
    const sy = this.sprite.y
    this._hpBg.setPosition(sx, sy - 14)
    this._hpFill.setPosition(sx, sy - 14)
    this._hpFill.setDisplaySize(20 * (this.hp / this.maxHp), 3)

    // Deal damage to player if in contact range
    if (dist < ENEMY_ATTACK_DIST && now >= this._nextDmgTick) {
      this._nextDmgTick = now + 900
      return MANAPHIS_DAMAGE
    }
    return 0
  }

  takeDamage(amount) {
    if (this.dead) return

    this.hp -= amount

    // Hit flash
    this.sprite.setTint(0xffffff)
    this._scene.time.delayedCall(110, () => {
      if (!this.dead) this.sprite.clearTint()
    })

    if (this.hp <= 0) this._die()
  }

  _die() {
    this.dead = true
    this._hpBg.destroy()
    this._hpFill.destroy()

    this._scene.tweens.add({
      targets:  this.sprite,
      scaleX:   2.2,
      scaleY:   2.2,
      alpha:    0,
      duration: 280,
      ease:     'Quad.easeOut',
      onComplete: () => this.sprite.destroy(),
    })
  }

  get x() { return this.sprite.x }
  get y() { return this.sprite.y }
}
