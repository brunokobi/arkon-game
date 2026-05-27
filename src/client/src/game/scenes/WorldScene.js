import Phaser from 'phaser'
import { TILE, TILE_SIZE, COLORS, INTERACT_DIST, SPRITE_FRAMES,
         PLAYER_DAMAGE, ATTACK_RANGE, xpForNextLevel } from '../constants.js'
import { ZONE as BIFROST }  from '../maps/bifrost.js'
import { ZONE as SKALHOLM } from '../maps/skalholm.js'
import Player   from '../entities/Player.js'
import Manaphis from '../entities/Manaphis.js'

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

    this._zone = zone

    // ── 1. Tiles + wall colliders ─────────────────────────────────────────────
    this.wallGroup = this.physics.add.staticGroup()

    for (let row = 0; row < mapH; row++) {
      for (let col = 0; col < mapW; col++) {
        const tileId = map[row][col]
        const cx = col * TILE_SIZE + TILE_SIZE / 2
        const cy = row * TILE_SIZE + TILE_SIZE / 2
        this._renderTile(tileId, cx, cy)
        if (tileId === TILE.WALL) {
          const b = this.wallGroup.create(cx, cy, 'pixel')
          b.setVisible(false)
          b.setDisplaySize(TILE_SIZE, TILE_SIZE)
          b.refreshBody()
        }
      }
    }

    // ── 2. Mana particles ─────────────────────────────────────────────────────
    this._spawnManaParticles(map, mapW, mapH)

    // ── 3. Player ─────────────────────────────────────────────────────────────
    const character = this.game.registry.get('character') ?? 'varen'
    this.player = new Player(this, spawnPos.col, spawnPos.row, character)
    this.physics.add.collider(this.player.sprite, this.wallGroup)

    // ── 4. NPCs ───────────────────────────────────────────────────────────────
    this.npcs = []
    for (const def of npcs) this._createNpc(def)

    // ── 5. Enemies ────────────────────────────────────────────────────────────
    this.enemies = []
    this.enemyGroup = this.physics.add.group()
    this._spawnEnemies(map, mapW, mapH)
    this.physics.add.collider(this.enemyGroup, this.wallGroup)
    this.physics.add.collider(this.enemyGroup, this.enemyGroup)

    // ── 6. Camera ─────────────────────────────────────────────────────────────
    const worldW = mapW * TILE_SIZE
    const worldH = mapH * TILE_SIZE
    this.cameras.main.setBackgroundColor(COLORS.bg)
    this.cameras.main.setBounds(0, 0, worldW, worldH)
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12)
    this.physics.world.setBounds(0, 0, worldW, worldH)

    // ── 7. Ambient overlay ────────────────────────────────────────────────────
    this._createAmbientOverlay()

    // ── 8. Zone entry + initial stats ─────────────────────────────────────────
    this.game.events.emit('dialogue-close')
    this.game.events.emit('zone-enter', { id, name })
    this._emitPlayerStats()

    // ── 9. Background music ───────────────────────────────────────────────────
    this.music = this.sound.add(music, { loop: true, volume: 0.3 })
    this.music.play()
    this.events.once('shutdown', () => this.music.stop())

    // ── 10. Internal state ────────────────────────────────────────────────────
    this._nearNpc      = null
    this._hintSprite   = null
    this._dialogueOpen = false
    this._dying        = false
  }

  update(time, delta) {
    if (this._dialogueOpen || this._dying) {
      this.player.sprite.body.setVelocity(0, 0)
      return
    }

    this.player.update()
    this._checkNpcProximity()
    this._checkExits()
    this._updateCombat()
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

  // ── Enemies ────────────────────────────────────────────────────────────────

  _spawnEnemies(map, mapW, mapH) {
    const configs = this._zone.enemies ?? []
    if (!configs.length) return

    // Collect mana floor positions for spawning
    const spots = []
    for (let row = 0; row < mapH; row++)
      for (let col = 0; col < mapW; col++)
        if (map[row][col] === TILE.MANA_FLOOR)
          spots.push({ col, row })

    spots.sort(() => Math.random() - 0.5)

    let idx = 0
    for (const cfg of configs) {
      for (let i = 0; i < cfg.count && idx < spots.length; i++, idx++) {
        const { col, row } = spots[idx]
        const x = col * TILE_SIZE + TILE_SIZE / 2
        const y = row * TILE_SIZE + TILE_SIZE / 2
        if (cfg.type === 'manaphis') {
          const e = new Manaphis(this, x, y)
          this.enemies.push(e)
          this.enemyGroup.add(e.sprite)
        }
      }
    }
  }

  // ── Combat ─────────────────────────────────────────────────────────────────

  _updateCombat() {
    // Player attack
    if (this.player.tryAttack()) this._doPlayerAttack()

    // Enemy updates — damage player on contact
    const px = this.player.x
    const py = this.player.y
    let statsChanged = false

    for (const enemy of this.enemies) {
      if (enemy.dead) continue
      const dmg = enemy.update(px, py)
      if (dmg > 0) {
        const taken = this.player.takeDamage(dmg)
        if (taken > 0) {
          statsChanged = true
          this.cameras.main.shake(110, 0.007)
          if (this.player.hp <= 0) {
            this._onPlayerDied()
            return
          }
        }
      }
    }

    // Remove fully dead enemies (sprite already self-destroys via tween)
    this.enemies = this.enemies.filter(e => !e.dead)

    if (statsChanged) this._emitPlayerStats()
  }

  _doPlayerAttack() {
    const { x: ax, y: ay, dir } = this.player.attackOrigin

    // ── Sword sprite swing ─────────────────────────────────────────────────────
    const sword = this.add.image(ax, ay, 'corvo', 'sword').setDepth(12).setScale(1.1)
    const angles = { e: [-0.4, 0.6], w: [0.4, -0.6], s: [0.6, 1.4], n: [-1.4, -0.6] }
    const [startA, endA] = angles[dir] ?? angles.s
    sword.setRotation(startA)
    if (dir === 'w') sword.setFlipX(true)
    this.tweens.add({
      targets: sword, rotation: endA, scaleX: 1.5, scaleY: 1.5, alpha: 0,
      duration: 220, ease: 'Quad.easeOut', onComplete: () => sword.destroy(),
    })

    // ── Sparks ─────────────────────────────────────────────────────────────────
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      const spark = this.add.graphics().setDepth(13)
      spark.fillStyle(0xffdd44, 1)
      spark.fillCircle(0, 0, 2)
      spark.setPosition(ax, ay)
      this.tweens.add({
        targets: spark,
        x: ax + Math.cos(angle) * 20,
        y: ay + Math.sin(angle) * 20,
        alpha: 0,
        duration: 220,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      })
    }

    // ── Attack sound ───────────────────────────────────────────────────────────
    this._playAttackSound()

    // Hit all enemies in range
    let killedAny = false
    for (const enemy of this.enemies) {
      if (enemy.dead) continue
      if (Math.abs(enemy.x - ax) < 28 && Math.abs(enemy.y - ay) < 22) {
        enemy.takeDamage(PLAYER_DAMAGE)
        if (enemy.dead) {
          const leveled = this.player.gainXP(enemy.xpReward ?? 12)
          killedAny = true
          if (leveled) this._onLevelUp()
        }
      }
    }

    if (killedAny) this._emitPlayerStats()
  }

  _playAttackSound() {
    const ctx = this.sound.context
    if (!ctx) return
    const t = ctx.currentTime

    // Swoosh — sawtooth sweep from 460 Hz → 70 Hz
    const osc  = ctx.createOscillator()
    const gOsc = ctx.createGain()
    osc.connect(gOsc); gOsc.connect(ctx.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(460, t)
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.17)
    gOsc.gain.setValueAtTime(0.18, t)
    gOsc.gain.exponentialRampToValueAtTime(0.001, t + 0.17)
    osc.start(t); osc.stop(t + 0.17)

    // Impact — noise burst at t+0.06
    const bufLen = Math.ceil(ctx.sampleRate * 0.07)
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data   = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen)
    const noise  = ctx.createBufferSource()
    const filt   = ctx.createBiquadFilter()
    const gNoise = ctx.createGain()
    noise.buffer = buf
    filt.type = 'bandpass'; filt.frequency.value = 1100; filt.Q.value = 0.8
    noise.connect(filt); filt.connect(gNoise); gNoise.connect(ctx.destination)
    gNoise.gain.setValueAtTime(0.14, t + 0.06)
    gNoise.gain.exponentialRampToValueAtTime(0.001, t + 0.13)
    noise.start(t + 0.06)
  }

  _onLevelUp() {
    // Gold flash
    const cam = this.cameras.main
    const flash = this.add.rectangle(
      cam.width / 2, cam.height / 2, cam.width, cam.height,
      0xffdd44, 0.3
    ).setScrollFactor(0).setDepth(150)
    this.tweens.add({
      targets: flash, alpha: 0, duration: 500,
      onComplete: () => flash.destroy(),
    })

    this.game.events.emit('level-up', { level: this.player.level })
    this._emitPlayerStats()
  }

  _onPlayerDied() {
    this._dying = true
    this.player.sprite.setTint(0xff2200)
    this.cameras.main.shake(300, 0.016)

    // XP penalty: -10% do nível atual
    this.player.xp = Math.floor(this.player.xp * 0.9)
    this.game.events.emit('player-died')

    this.time.delayedCall(1300, () => {
      this.player.hp = this.player.maxHp
      this.scene.restart({ zoneId: this._zoneId })
    })
  }

  _emitPlayerStats() {
    this.game.events.emit('player-stats', {
      hp:     this.player.hp,
      maxHp:  this.player.maxHp,
      xp:     this.player.xp,
      xpNext: xpForNextLevel(this.player.level),
      level:  this.player.level,
    })
  }

  // ── NPCs ───────────────────────────────────────────────────────────────────

  _createNpc(def) {
    const x = def.tile.col * TILE_SIZE + TILE_SIZE / 2
    const y = def.tile.row * TILE_SIZE + TILE_SIZE / 2

    const sprite = this.add.image(x, y, 'chars01')
      .setFrame(def.frame ?? SPRITE_FRAMES.NPC_MERCUS)
      .setDepth(5)

    this.tweens.add({
      targets: sprite, scaleX: 1.08, scaleY: 1.08,
      duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    const label = this.add.text(x, y - 18, def.name, {
      fontSize: '9px', fontFamily: 'monospace', color: '#f0c050', alpha: 0.8,
    }).setOrigin(0.5, 1).setDepth(6)

    this.npcs.push({ def, sprite, label, dialogueIdx: 0 })
  }

  _checkNpcProximity() {
    const px = this.player.x, py = this.player.y
    let nearest = null, nearestDist = Infinity

    for (const npc of this.npcs) {
      const dx = npc.sprite.x - px, dy = npc.sprite.y - py
      const dist = Math.sqrt(dx*dx + dy*dy)
      if (dist < INTERACT_DIST && dist < nearestDist) { nearest = npc; nearestDist = dist }
    }

    if (nearest !== this._nearNpc) {
      if (this._hintSprite) { this._hintSprite.destroy(); this._hintSprite = null }
      this._nearNpc = nearest
      if (nearest) {
        this._hintSprite = this.add.image(nearest.sprite.x, nearest.sprite.y - 30, 'hint_e').setDepth(20)
        this.tweens.add({
          targets: this._hintSprite, y: nearest.sprite.y - 36,
          duration: 500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        })
      }
    }

    if (nearest && this.player.didInteract) this._triggerDialogue(nearest)
  }

  _triggerDialogue(npc) {
    const line = npc.def.dialogue[npc.dialogueIdx]
    if (!line) return
    this._dialogueOpen = true
    this.player.sprite.body.setVelocity(0, 0)
    this.game.events.emit('npc-interact', {
      npcId: npc.def.id, name: npc.def.name, text: line.text,
      onContinue: () => {
        npc.dialogueIdx = line.next ?? 0
        this._dialogueOpen = false
        this.game.events.emit('dialogue-close')
      },
    })
  }

  // ── Exits ──────────────────────────────────────────────────────────────────

  _checkExits() {
    const col = Math.floor(this.player.x / TILE_SIZE)
    const row = Math.floor(this.player.y / TILE_SIZE)
    const { map, mapW, mapH, exits } = this._zone
    if (row < 0 || row >= mapH || col < 0 || col >= mapW) return
    const tile = map[row][col]

    if (tile === TILE.EXIT_WEST) {
      const ex = exits.west
      if (ex?.zone) this.scene.restart({ zoneId: ex.zone, spawnOverride: ex.spawnIn })
      else if (ex) this.game.events.emit('exit-reached', { direction: 'west', ...ex })
    }
    if (tile === TILE.EXIT_EAST) {
      const ex = exits.east
      if (ex?.zone) this.scene.restart({ zoneId: ex.zone, spawnOverride: ex.spawnIn })
      else if (ex) this.game.events.emit('exit-reached', { direction: 'east', ...ex })
    }
  }

  // ── Ambient ────────────────────────────────────────────────────────────────

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
          targets: dot, y: startY - (8 + Math.random() * 12), alpha: 0,
          duration: 1500 + Math.random() * 1500, delay: Math.random() * 2000,
          repeat: -1, repeatDelay: 500 + Math.random() * 1000, ease: 'Sine.easeOut',
          onRepeat: () => {
            dot.setPosition(col * TILE_SIZE + Math.random() * TILE_SIZE, startY)
            dot.setAlpha(0.5)
          },
        })
      }
    }
  }

  _createAmbientOverlay() {
    const cam = this.cameras.main
    this.add.image(cam.width / 2, cam.height / 2, 'vignette')
      .setScrollFactor(0).setDepth(100)
  }
}
