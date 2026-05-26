import Phaser from 'phaser'
import { PLAYER_SPEED, TILE_SIZE, SPRITE_FRAMES } from '../constants.js'

export default class Player {
  constructor(scene, col, row) {
    const x = col * TILE_SIZE + TILE_SIZE / 2
    const y = row * TILE_SIZE + TILE_SIZE / 2

    this.sprite = scene.physics.add.sprite(x, y, 'chars01')
    this.sprite.setFrame(SPRITE_FRAMES.PLAYER)
    this.sprite.setDepth(10)
    this.sprite.body.setSize(18, 18)
    this.sprite.body.setCollideWorldBounds(true)

    // Controls (WASD + arrows)
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
    })

    this._interactPressed = false
    this.nearbyNpc = null
  }

  /** Called every frame from WorldScene.update() */
  update() {
    const { up, down, left, right, upArr, downArr, leftArr, rightArr } = this.keys
    const body = this.sprite.body

    let vx = 0
    let vy = 0
    if (left.isDown  || leftArr.isDown)  vx = -PLAYER_SPEED
    if (right.isDown || rightArr.isDown) vx =  PLAYER_SPEED
    if (up.isDown    || upArr.isDown)    vy = -PLAYER_SPEED
    if (down.isDown  || downArr.isDown)  vy =  PLAYER_SPEED

    // Normalize diagonal movement
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071
      vy *= 0.7071
    }

    body.setVelocity(vx, vy)

    // Flip sprite horizontally based on horizontal direction
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

  /** Returns true on the frame the interact key was just pressed */
  get didInteract() {
    const down = Phaser.Input.Keyboard.JustDown(this.keys.interact)
    return down
  }

  get x() { return this.sprite.x }
  get y() { return this.sprite.y }
}
