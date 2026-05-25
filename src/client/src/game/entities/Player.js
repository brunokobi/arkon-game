import Phaser from 'phaser'
import { PLAYER_SPEED, TILE_SIZE } from '../constants.js'

export default class Player {
  constructor(scene, col, row) {
    const x = col * TILE_SIZE + TILE_SIZE / 2
    const y = row * TILE_SIZE + TILE_SIZE / 2

    // Physics sprite using the pre-generated texture
    this.sprite = scene.physics.add.sprite(x, y, 'player')
    this.sprite.setDepth(10)
    this.sprite.body.setSize(14, 14)
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

    // Flip sprite horizontally based on direction
    if (vx < 0) this.sprite.setFlipX(true)
    if (vx > 0) this.sprite.setFlipX(false)
  }

  /** Returns true on the frame the interact key was just pressed */
  get didInteract() {
    const down = Phaser.Input.Keyboard.JustDown(this.keys.interact)
    return down
  }

  get x() { return this.sprite.x }
  get y() { return this.sprite.y }
}
