import Phaser from 'phaser'
import { TILE, TILE_SIZE, COLORS, INTERACT_DIST, SPRITE_FRAMES } from '../constants.js'
import { BIFROST_MAP, BIFROST_NPCS, BIFROST_EXITS, PLAYER_SPAWN, MAP_W, MAP_H } from '../maps/bifrost.js'
import Player from '../entities/Player.js'

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' })
  }

  create() {
    const worldW = MAP_W * TILE_SIZE
    const worldH = MAP_H * TILE_SIZE

    // ── 1. Render tiles + build wall colliders ────────────────────────────────
    this.wallGroup = this.physics.add.staticGroup()

    for (let row = 0; row < MAP_H; row++) {
      for (let col = 0; col < MAP_W; col++) {
        const tileId = BIFROST_MAP[row][col]
        const x = col * TILE_SIZE
        const y = row * TILE_SIZE
        const cx = x + TILE_SIZE / 2
        const cy = y + TILE_SIZE / 2

        this._renderTile(tileId, cx, cy)

        if (tileId === TILE.WALL) {
          const body = this.wallGroup.create(cx, cy, 'pixel')
          body.setVisible(false)
          body.setDisplaySize(TILE_SIZE, TILE_SIZE)
          body.refreshBody()
        }
      }
    }

    // ── 2. Mana particle layer (visual — no logic) ────────────────────────────
    this._spawnManaParticles()

    // ── 3. Player ─────────────────────────────────────────────────────────────
    this.player = new Player(this, PLAYER_SPAWN.col, PLAYER_SPAWN.row)
    this.physics.add.collider(this.player.sprite, this.wallGroup)

    // ── 4. NPCs ───────────────────────────────────────────────────────────────
    this.npcs = []
    for (const def of BIFROST_NPCS) {
      this._createNpc(def)
    }

    // ── 5. Camera ─────────────────────────────────────────────────────────────
    this.cameras.main.setBackgroundColor(COLORS.bg)
    this.cameras.main.setBounds(0, 0, worldW, worldH)
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12)
    this.physics.world.setBounds(0, 0, worldW, worldH)

    // ── 6. Ambient overlay (scanlines / vignette feel) ────────────────────────
    this._createAmbientOverlay()

    // ── 7. Emit zone entry to React ───────────────────────────────────────────
    this.game.events.emit('zone-enter', { id: 'bifrost', name: 'BIFROST INFERIOR' })

    // ── 8. Background music ───────────────────────────────────────────────────
    this.music = this.sound.add('bifrost-music', { loop: true, volume: 0.3 })
    this.music.play()
    this.events.once('shutdown', () => this.music.stop())

    // ── 9. Internal state ─────────────────────────────────────────────────────
    this._nearNpc      = null
    this._hintSprite   = null
    this._dialogueOpen = false
  }

  update() {
    if (this._dialogueOpen) {
      this.player.sprite.body.setVelocity(0, 0)
      return
    }

    this.player.update()
    this._checkNpcProximity()
    this._checkExits()
  }

  // ── NPC ────────────────────────────────────────────────────────────────────

  _renderTile(tileId, cx, cy) {
    if (tileId === TILE.WALL) {
      this.add.image(cx, cy, 'tiles', SPRITE_FRAMES.WALL_BG).setDepth(0)
    } else if (tileId === TILE.MANA_FLOOR) {
      this.add.image(cx, cy, 'tiles', SPRITE_FRAMES.MANA).setDepth(0)
    } else if (tileId === TILE.EXIT_WEST || tileId === TILE.EXIT_EAST) {
      this.add.image(cx, cy, 'tiles', SPRITE_FRAMES.EXIT).setDepth(0)
    } else {
      this.add.image(cx, cy, 'tiles', SPRITE_FRAMES.FLOOR).setDepth(0)
    }
  }

  _createNpc(def) {
    const x = def.tile.col * TILE_SIZE + TILE_SIZE / 2
    const y = def.tile.row * TILE_SIZE + TILE_SIZE / 2

    const sprite = this.add.image(x, y, 'chars01').setFrame(SPRITE_FRAMES.NPC_MERCUS).setDepth(5)

    // Pulsing scale tween
    this.tweens.add({
      targets: sprite,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Name label
    const label = this.add.text(x, y - 18, def.name, {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#f0c050',
      alpha: 0.8,
    }).setOrigin(0.5, 1).setDepth(6)

    this.npcs.push({ def, sprite, label, dialogueIdx: 0 })
  }

  _checkNpcProximity() {
    const px = this.player.x
    const py = this.player.y

    let nearest = null
    let nearestDist = Infinity

    for (const npc of this.npcs) {
      const dx = npc.sprite.x - px
      const dy = npc.sprite.y - py
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < INTERACT_DIST && dist < nearestDist) {
        nearest = npc
        nearestDist = dist
      }
    }

    if (nearest !== this._nearNpc) {
      // Remove old hint
      if (this._hintSprite) {
        this._hintSprite.destroy()
        this._hintSprite = null
      }
      this._nearNpc = nearest

      // Show new hint
      if (nearest) {
        this._hintSprite = this.add.image(
          nearest.sprite.x,
          nearest.sprite.y - 30,
          'hint_e'
        ).setDepth(20)

        this.tweens.add({
          targets: this._hintSprite,
          y: nearest.sprite.y - 36,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        })
      }
    }

    // Interact key
    if (nearest && this.player.didInteract) {
      this._triggerDialogue(nearest)
    }
  }

  _triggerDialogue(npc) {
    const line = npc.def.dialogue[npc.dialogueIdx]
    if (!line) return

    this._dialogueOpen = true
    this.player.sprite.body.setVelocity(0, 0)

    // Emit to React with a callback to advance/close
    this.game.events.emit('npc-interact', {
      npcId:  npc.def.id,
      name:   npc.def.name,
      text:   line.text,
      onContinue: () => {
        if (line.next !== null && line.next !== undefined) {
          npc.dialogueIdx = line.next
        } else {
          npc.dialogueIdx = 0  // reset for replay
        }
        this._dialogueOpen = false
        this.game.events.emit('dialogue-close')
      },
    })
  }

  // ── Exit detection ─────────────────────────────────────────────────────────

  _checkExits() {
    const col = Math.floor(this.player.x / TILE_SIZE)
    const row = Math.floor(this.player.y / TILE_SIZE)

    if (row < 0 || row >= MAP_H || col < 0 || col >= MAP_W) return
    const tile = BIFROST_MAP[row][col]

    if (tile === TILE.EXIT_WEST) {
      this.game.events.emit('exit-reached', { direction: 'west', ...BIFROST_EXITS.west })
    }
    if (tile === TILE.EXIT_EAST) {
      this.game.events.emit('exit-reached', { direction: 'east', ...BIFROST_EXITS.east })
    }
  }

  // ── Ambient effects ────────────────────────────────────────────────────────

  _spawnManaParticles() {
    // Find mana floor tiles and add floating dots
    for (let row = 0; row < MAP_H; row++) {
      for (let col = 0; col < MAP_W; col++) {
        if (BIFROST_MAP[row][col] !== TILE.MANA_FLOOR) continue
        if (Math.random() > 0.25) continue  // sparse

        const x = col * TILE_SIZE + Math.random() * TILE_SIZE
        const y = row * TILE_SIZE + Math.random() * TILE_SIZE

        const dot = this.add.graphics().setDepth(1)
        dot.fillStyle(COLORS.manaGlow, 0.5)
        dot.fillCircle(0, 0, 2)
        dot.setPosition(x, y)

        const startY = y
        this.tweens.add({
          targets: dot,
          y: startY - (8 + Math.random() * 12),
          alpha: 0,
          duration: 1500 + Math.random() * 1500,
          delay: Math.random() * 2000,
          repeat: -1,
          repeatDelay: 500 + Math.random() * 1000,
          ease: 'Sine.easeOut',
          onRepeat: () => {
            dot.setPosition(
              col * TILE_SIZE + Math.random() * TILE_SIZE,
              startY
            )
            dot.setAlpha(0.5)
          },
        })
      }
    }
  }

  _createAmbientOverlay() {
    const cam = this.cameras.main
    this.add.image(cam.width / 2, cam.height / 2, 'vignette')
      .setScrollFactor(0)
      .setDepth(100)
  }
}
