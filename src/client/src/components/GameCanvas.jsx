import { useEffect, useRef, useState, useCallback } from 'react'
import Phaser from 'phaser'
import { createPhaserConfig } from '../game/config.js'
import './GameCanvas.css'

export default function GameCanvas({ player, onBack }) {
  const containerRef = useRef(null)
  const gameRef      = useRef(null)

  const [zoneName,     setZoneName]     = useState('BIFROST INFERIOR')
  const [dialogue,     setDialogue]     = useState(null)   // { name, text, onContinue }
  const [notification, setNotification] = useState(null)   // string

  // ── Bootstrap Phaser ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return

    const game = new Phaser.Game(createPhaserConfig(containerRef.current))
    gameRef.current = game

    // Zone name banner
    game.events.on('zone-enter', ({ name }) => setZoneName(name))

    // NPC dialogue
    game.events.on('npc-interact', (data) => setDialogue(data))
    game.events.on('dialogue-close', () => setDialogue(null))

    // Exit reached notification
    game.events.on('exit-reached', ({ direction, label }) => {
      setNotification(label)
      setTimeout(() => setNotification(null), 3000)
    })

    return () => {
      game.destroy(true)
      gameRef.current = null
    }
  }, [])

  // ── Dialogue continue ──────────────────────────────────────────────────────
  const handleContinue = useCallback(() => {
    if (dialogue?.onContinue) dialogue.onContinue()
    setDialogue(null)
  }, [dialogue])

  return (
    <div className="gc-root">
      {/* Phaser canvas host */}
      <div ref={containerRef} className="gc-canvas" />

      {/* ── HUD ── */}
      <div className="gc-hud">
        <div className="gc-zone-tag">
          <span className="gc-zone-rune">ᛟ</span>
          <span className="gc-zone-name">{zoneName}</span>
        </div>
        <div className="gc-player-tag">
          <span className="gc-player-name">{player.username}</span>
          <span className="gc-player-level">GR. {player.level}</span>
        </div>
      </div>

      {/* ── Controls hint (bottom) ── */}
      <div className="gc-controls-hint">
        <span>WASD / ↑↓←→ mover</span>
        <span className="gc-sep">·</span>
        <span><kbd>E</kbd> interagir</span>
      </div>

      {/* ── Dialogue box ── */}
      {dialogue && (
        <div className="gc-dialogue-overlay">
          <div className="gc-dialogue">
            <div className="gc-dialogue-header">
              <span className="gc-dialogue-rune">ᚦ</span>
              <span className="gc-dialogue-name">{dialogue.name}</span>
            </div>
            <p className="gc-dialogue-text">{dialogue.text}</p>
            <button className="gc-dialogue-btn" onClick={handleContinue}>
              Continuar  →
            </button>
          </div>
        </div>
      )}

      {/* ── Exit notification ── */}
      {notification && (
        <div className="gc-notification">
          {notification}
        </div>
      )}

      {/* ── Back to menu ── */}
      <button className="gc-back-btn" onClick={onBack}>
        ← MENU
      </button>
    </div>
  )
}
