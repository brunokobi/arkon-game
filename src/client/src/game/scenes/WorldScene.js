import Phaser from 'phaser'
import { TILE, TILE_SIZE, COLORS, INTERACT_DIST, SPRITE_FRAMES } from '../constants.js'
import { ZONE as BIFROST }  from '../maps/bifrost.js'
import { ZONE as SKALHOLM } from '../maps/skalholm.js'
import Player from '../entities/Player.js'

const ZONES = {
  bifrost:  BIFROST,
  skalholm: SKALHOLM,
}

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' })
  }

  init(data) {
    this._zoneId        = data?.zoneId       ?? 'bifrost'
    this._spawnOverride = data?.spawnOverride ?? null
  }

  create() {
    const zone = ZONES[this._zoneId]
    const { map, mapW, mapH, npcs, exits, spawn: defaultSpawn, id, name, music } = zone
    const spawnPos = this._spawnOverride ?? defaultSpawn

    const worldW = mapW * TILE_SIZE
    const worldH = mapH * TILE_SIZE

    this._zone = zone

    // ── 1. Render tiles + build wall colliders ────────────────────────────────
    this.wallGroup = this.physics.add.staticGroup()

    for (let row = 0; row < mapH; row++) {
      for (let col = 0; col < mapW; col++) {
        const tileId = map[row][col]
        const x  = col * TILE_SIZE
        const y  = row * TILE_SIZE
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
    this._spawnManaParticles(map, mapW, mapH)

    // ── 3. Player ─────────────────────────────────────────────────────────────
    this.player = new Player(this, spawnPos.col, spawnPos.row)
    this.physics.add.collider(this.player.sprite, this.wallGroup)

    // ── 4. NPCs ───────────────────────────────────────────────────────────────
    this.npcs = []
    for (const def of npcs) {
      this._createNpc(def)
    }

    // ── 5. Camera ─────────────────────────────────────────────────────────────
    this.cameras.main.setBackgroundColor(COLORS.bg)
    this.cameras.main.setBounds(0, 0, worldW, worldH)
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12)
    this.physics.world.setBounds(0, 0, worldW, worldH)

    // ── 6. Ambient overlay (vignette) ─────────────────────────────────────────
    this._createAmbientOverlay()

    // ── 7. Emit zone entry to React ───────────────────────────────────────────
    this.game.events.emit('dialogue-close')
    this.game.events.emit('zone-enter', { id, name })

    // ── 8. Background music ───────────────────────────────────────────────────
    this.music = this.sound.add(music, { loop: true, volume: 0.3 })
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

  // ── Tile rendering ─────────────────────────────────────────────────────────

  _renderTile(tileId, cx, cy) {
    const t = this._zone.tiles
    if (tileId === TILE.WALL) {
      this.add.image(cx, cy, 'tiles', t.wall).setDepth(0)
    } else if (tileId === TILE.MANA_FLOOR) {
      this.add.image(cx, cy, 'tiles', t.mana).setDepth(0)
    } else if (tileId === TILE.EXIT_WEST || tileId === TILE.EXIT_EAST) {
      this.add.image(cx, cy, 'tiles', t.exit).setDepth(0)
    } else {
      this.add.image(cx, cy, 'tiles', t.floor).setDepth(0)
    }
  }

  // ── NPCs ───────────────────────────────────────────────────────────────────

  _createNpc(def) {
    const x = def.tile.col * TILE_SIZE + TILE_SIZE / 2
    const y = def.tile.row * TILE_SIZE + TILE_SIZE / 2

    const sprite = this.add.image(x, y, 'chars01')
      .setFrame(def.frame ?? SPRITE_FRAMES.NPC_MERCUS)
      .setDepth(5)

    this.tweens.add({
      targets: sprite,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

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

    let nearest     = null
    let nearestDist = Infinity

    for (const npc of this.npcs) {
      const dx   = npc.sprite.x - px
      const dy   = npc.sprite.y - py
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < INTERACT_DIST && dist < nearestDist) {
        nearest = npc
        nearestDist = dist
      }
    }

    if (nearest !== this._nearNpc) {
      if (this._hintSprite) {
        this._hintSprite.destroy()
        this._hintSprite = null
      }
      this._nearNpc = nearest

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

    if (nearest && this.player.didInteract) {
      this._triggerDialogue(nearest)
    }
  }

  _triggerDialogue(npc) {
    const line = npc.def.dialogue[npc.dialogueIdx]
    if (!line) return

    this._dialogueOpen = true
    this.player.sprite.body.setVelocity(0, 0)

    this.game.events.emit('npc-interact', {
      npcId:  npc.def.id,
      name:   npc.def.name,
      text:   line.text,
      onContinue: () => {
        npc.dialogueIdx = line.next ?? 0
        this._dialogueOpen = false
        this.game.events.emit('dialogue-close')
      },
    })
  }

  // ── Exit detection ─────────────────────────────────────────────────────────

  _checkExits() {
    const col = Math.floor(this.player.x / TILE_SIZE)
    const row = Math.floor(this.player.y / TILE_SIZE)
    const { map, mapW, mapH, exits } = this._zone

    if (row < 0 || row >= mapH || col < 0 || col >= mapW) return
    const tile = map[row][col]

    if (tile === TILE.EXIT_WEST) {
      const ex = exits.west
      if (ex?.zone) {
        this.scene.restart({ zoneId: ex.zone, spawnOverride: ex.spawnIn })
      } else if (ex) {
        this.game.events.emit('exit-reached', { direction: 'west', ...ex })
      }
    }
    if (tile === TILE.EXIT_EAST) {
      const ex = exits.east
      if (ex?.zone) {
        this.scene.restart({ zoneId: ex.zone, spawnOverride: ex.spawnIn })
      } else if (ex) {
        this.game.events.emit('exit-reached', { direction: 'east', ...ex })
      }
    }
  }

  // ── Ambient effects ────────────────────────────────────────────────────────

  _spawnManaParticles(map, mapW, mapH) {
    for (let row = 0; row < mapH; row++) {
      for (let col = 0; col < mapW; col++) {
        if (map[row][col] !== TILE.MANA_FLOOR) continue
        if (Math.random() > 0.25) continue

        const x = col * TILE_SIZE + Math.random() * TILE_SIZE
        const y = row * TILE_SIZE + Math.random() * TILE_SIZE

        const dot = this.add.graphics().setDepth(1)
        dot.fillStyle(this._zone.manaParticle, 0.5)
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
