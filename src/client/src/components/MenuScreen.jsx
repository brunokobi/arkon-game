import { useState, useEffect, useRef, useCallback } from 'react'
import './MenuScreen.css'

const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  rune: RUNES[(i * 3) % RUNES.length],
  left: `${(i * 5.1 + 3) % 100}%`,
  delay: `${(i * 0.6) % 10}s`,
  duration: `${9 + (i % 5)}s`,
  size: `${10 + (i % 3) * 6}px`,
  type: i % 3 === 0 ? 'ice' : i % 3 === 1 ? 'fire' : 'gold',
}))

const FACTION_LABEL = { none: 'SEM FACÇÃO', bonde: 'BONDE DA BASE', gestao: 'A GESTÃO' }
const FACTION_CLASS = { none: 'ms-badge--none', bonde: 'ms-badge--bonde', gestao: 'ms-badge--gestao' }
const CLASS_LABEL   = { none: 'SEM CLASSE', geral: 'O GERAL', esquemista: 'O ESQUEMISTA', articuladora: 'A ARTICULADORA', concursado: 'O CONCURSADO' }

const lerp = (a, b, t) => a + (b - a) * t

const MENU_ITEMS = [
  { id: 'play',     label: 'ENTRAR EM ARKON', icon: '▶', primary: true,  disabled: true,  hint: 'Em desenvolvimento' },
  { id: 'char',     label: 'PERSONAGEM',       icon: 'ᛉ', primary: false, disabled: false },
  { id: 'faction',  label: 'FACÇÕES',          icon: 'ᚷ', primary: false, disabled: false },
  { id: 'missions', label: 'MISSÕES',          icon: 'ᛏ', primary: false, disabled: false },
  { id: 'settings', label: 'CONFIGURAÇÕES',    icon: 'ᚲ', primary: false, disabled: false },
]

export default function MenuScreen({ player, onLogout, onNavigate }) {
  const mouseTarget  = useRef({ x: 0, y: 0 })
  const mouseCurrent = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
  const bgRef  = useRef(null)
  const midRef = useRef(null)
  const [active, setActive] = useState(null)

  const tick = useCallback(() => {
    mouseCurrent.current.x = lerp(mouseCurrent.current.x, mouseTarget.current.x, 0.04)
    mouseCurrent.current.y = lerp(mouseCurrent.current.y, mouseTarget.current.y, 0.04)
    const { x, y } = mouseCurrent.current
    if (bgRef.current)  bgRef.current.style.transform  = `translate3d(${x * -12}px, ${y * -8}px,  0) scale(1.1)`
    if (midRef.current) midRef.current.style.transform = `translate3d(${x * -22}px, ${y * -14}px, 0)`
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      mouseTarget.current = {
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(tick)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafRef.current) }
  }, [tick])

  const handleItem = (item) => {
    if (item.disabled) return
    setActive(item.id)
    if (item.id === 'char')    onNavigate('character-create')
    if (item.id === 'faction') onNavigate('factions')
  }

  return (
    <div className="ms-root">
      {/* ── Background parallax ── */}
      <div ref={bgRef}  className="ms-layer ms-bg" />
      <div ref={midRef} className="ms-layer ms-mid" />

      <div className="ms-layer ms-particles">
        {PARTICLES.map(p => (
          <span key={p.id} className={`ms-rune ms-rune--${p.type}`}
            style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, fontSize: p.size }}>
            {p.rune}
          </span>
        ))}
      </div>

      <div className="ms-layer ms-vignette" />
      <div className="ms-scanlines" />

      {/* ── Header ── */}
      <header className="ms-header">
        <div className="ms-header-logo">
          <span className="ms-header-sigil">ᚨ</span>
          <span className="ms-header-title">ARKON</span>
        </div>
        <div className="ms-header-player">
          <span className="ms-header-name">{player.username}</span>
          <span className={`ms-badge ${FACTION_CLASS[player.faction]}`}>
            {FACTION_LABEL[player.faction]}
          </span>
        </div>
      </header>

      {/* ── Conteúdo central ── */}
      <main className="ms-main">
        {/* Coluna esquerda — stats do personagem */}
        <aside className="ms-player-card">
          <div className="ms-avatar">
            <span>ᛉ</span>
          </div>
          <h2 className="ms-player-name">{player.username}</h2>
          <p className="ms-player-class">{CLASS_LABEL[player.class]}</p>

          <div className="ms-stats">
            <div className="ms-stat">
              <span className="ms-stat-label">GRADUS</span>
              <span className="ms-stat-value">{player.level}</span>
            </div>
            <div className="ms-stat">
              <span className="ms-stat-label">INFLUÊNCIA</span>
              <span className="ms-stat-value">{player.influence}</span>
            </div>
            <div className="ms-stat">
              <span className="ms-stat-label">FICHA</span>
              <span className="ms-stat-value">{player.reputation}</span>
            </div>
            <div className="ms-stat ms-stat--full">
              <span className="ms-stat-label">FACÇÃO</span>
              <span className={`ms-stat-value ms-stat-faction ms-stat-faction--${player.faction}`}>
                {FACTION_LABEL[player.faction]}
              </span>
            </div>
          </div>

          <div className="ms-arco-hint">
            <span className="ms-arco-icon">◈</span>
            <span>Arco 0 — Tutorial disponível</span>
          </div>
        </aside>

        {/* Coluna direita — menu */}
        <nav className="ms-nav">
          <div className="ms-nav-logo">
            <div className="ms-nav-sigil">ᚨ</div>
            <h1>ARKON</h1>
            <p>A FENDA DO AGLOMERADO</p>
          </div>

          <ul className="ms-menu">
            {MENU_ITEMS.map(item => (
              <li key={item.id}>
                <button
                  className={[
                    'ms-menu-btn',
                    item.primary  ? 'ms-menu-btn--primary'  : '',
                    item.disabled ? 'ms-menu-btn--disabled' : '',
                    active === item.id ? 'ms-menu-btn--active' : '',
                  ].join(' ')}
                  onClick={() => handleItem(item)}
                  title={item.hint}
                >
                  <span className="ms-menu-icon">{item.icon}</span>
                  <span className="ms-menu-label">{item.label}</span>
                  {item.disabled && <span className="ms-menu-soon">EM BREVE</span>}
                </button>
              </li>
            ))}
          </ul>

          <button className="ms-logout" onClick={onLogout}>
            ← SAIR DO SISTEMA
          </button>
        </nav>
      </main>

      {/* ── Lore quote ── */}
      <div className="ms-quote">
        <span className="ms-quote-rune">ᛟ</span>
        <q>Kobi construiu Arkon sem testar. Nós somos o bug.</q>
      </div>

      {/* ── Labels de zona ── */}
      <div className="ms-zone ms-zone--left"><span>DISTRITO</span><strong>SKÁLHOLM</strong></div>
      <div className="ms-zone ms-zone--right"><span>SETOR</span><strong>AETHERION</strong></div>
    </div>
  )
}
