import { useEffect, useRef, useState, useCallback } from 'react'
import Phaser from 'phaser'
import { createPhaserConfig } from '../game/config.js'
import './GameCanvas.css'

export default function GameCanvas({ player, character = 'varen', onBack }) {
  const containerRef = useRef(null)
  const gameRef      = useRef(null)

  const [zoneName,     setZoneName]     = useState('BIFROST INFERIOR')
  const [dialogue,     setDialogue]     = useState(null)
  const [notification, setNotification] = useState(null)
  const [playerStats,  setPlayerStats]  = useState(null)
  const [died,         setDied]         = useState(false)

  // ── Bootstrap Phaser ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return
    const game = new Phaser.Game(createPhaserConfig(containerRef.current, character))
    gameRef.current = game

    game.events.on('zone-enter',    ({ name }) => setZoneName(name))
    game.events.on('npc-interact',  (data)     => setDialogue(data))
    game.events.on('dialogue-close',()         => setDialogue(null))
    game.events.on('player-stats',  (stats)    => setPlayerStats(stats))

    game.events.on('exit-reached', ({ label }) => {
      setNotification(label)
      setTimeout(() => setNotification(null), 3000)
    })

    game.events.on('level-up', ({ level }) => {
      setNotification(`GRADUS ${level}`)
      setTimeout(() => setNotification(null), 2500)
    })

    game.events.on('player-died', () => {
      setDied(true)
      setTimeout(() => setDied(false), 1300)
    })

    return () => { game.destroy(true); gameRef.current = null }
  }, [])

  const handleContinue = useCallback(() => {
    if (dialogue?.onContinue) dialogue.onContinue()
    setDialogue(null)
  }, [dialogue])

  const hpPct = playerStats ? Math.max(0, playerStats.hp / playerStats.maxHp) : 1
  const xpPct = playerStats ? Math.min(1, playerStats.xp / playerStats.xpNext) : 0

  return (
    <div className="gc-root">
      <div ref={containerRef} className="gc-canvas" />

      {/* ── Morte overlay ── */}
      {died && <div className="gc-died" />}

      {/* ── HUD ── */}
      <div className="gc-hud">
        <div className="gc-zone-tag">
          <span className="gc-zone-rune">ᛟ</span>
          <span className="gc-zone-name">{zoneName}</span>
        </div>

        <div className="gc-hud-right">
          <div className="gc-player-tag">
            <span className="gc-player-name">{player.username}</span>
            <span className="gc-player-level">
              GR. {playerStats?.level ?? player.level}
            </span>
          </div>

          {playerStats && (
            <div className="gc-vitals">
              {/* HP bar */}
              <div className="gc-bar">
                <div className="gc-bar-track">
                  <div
                    className="gc-bar-fill gc-bar-fill--hp"
                    style={{ width: `${hpPct * 100}%` }}
                  />
                </div>
                <span className="gc-bar-label">
                  {playerStats.hp}/{playerStats.maxHp}
                </span>
              </div>
              {/* XP bar */}
              <div className="gc-bar">
                <div className="gc-bar-track">
                  <div
                    className="gc-bar-fill gc-bar-fill--xp"
                    style={{ width: `${xpPct * 100}%` }}
                  />
                </div>
                <span className="gc-bar-label gc-bar-label--xp">
                  {playerStats.xp}/{playerStats.xpNext} XP
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Controls hint ── */}
      <div className="gc-controls-hint">
        <span>WASD / ↑↓←→ mover</span>
        <span className="gc-sep">·</span>
        <span><kbd>E</kbd> interagir</span>
        <span className="gc-sep">·</span>
        <span><kbd>ESPAÇO</kbd> atacar</span>
      </div>

      {/* ── Dialogue ── */}
      {dialogue && (
        <div className="gc-dialogue-overlay">
          <div className="gc-dialogue">
            <div className="gc-dialogue-header">
              <span className="gc-dialogue-rune">ᚦ</span>
              <span className="gc-dialogue-name">{dialogue.name}</span>
            </div>
            <p className="gc-dialogue-text">{dialogue.text}</p>
            <button className="gc-dialogue-btn" onClick={handleContinue}>
              Continuar →
            </button>
          </div>
        </div>
      )}

      {/* ── Notificação (saída / level up) ── */}
      {notification && (
        <div className="gc-notification" key={notification}>
          {notification}
        </div>
      )}

      {/* ── Voltar ── */}
      <button className="gc-back-btn" onClick={onBack}>← MENU</button>
    </div>
  )
}
