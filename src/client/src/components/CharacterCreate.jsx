import { useState, useEffect, useRef, useCallback } from 'react'
import './CharacterCreate.css'

const lerp = (a, b, t) => a + (b - a) * t

const FACTIONS = [
  {
    id: 'bonde',
    name: 'Bonde da Base',
    god: 'Molusk, o Navis Novem',
    territory: 'Skálholm',
    rank: 'Convocado',
    quote: 'Os vazamentos são propositais.',
    desc: 'Governa pelos esgotos e pela informação assimétrica. Carismático para os fracos, corrupto por arquitetura.',
    color: '#e86010',
    colorDim: 'rgba(232,96,16,0.18)',
    border: 'rgba(232,96,16,0.4)',
    rune: 'ᚠ',
  },
  {
    id: 'gestao',
    name: 'A Gestão',
    god: 'Bolzarius, o Praetor Summus',
    territory: 'Aetherion',
    rank: 'Estagiário',
    quote: 'Eficiente. Direto. Incorruptível por dinheiro.',
    desc: 'Comanda aos gritos uma cidade construída sobre uma narrativa que ele próprio mandou escrever.',
    color: '#4fc3f7',
    colorDim: 'rgba(79,195,247,0.15)',
    border: 'rgba(79,195,247,0.38)',
    rune: 'ᛏ',
  },
  {
    id: 'autonomos',
    name: 'Os Autônomos',
    god: 'Nenhum',
    territory: 'Bifrost Inferior',
    rank: 'Passante',
    quote: 'Sem deus. Sem facção. Sem Eclipse.',
    desc: 'Vivem dentro do Túnel. Vendem passagem e informação para os dois lados. Nunicos que conhecem as entradas secretas.',
    color: '#a0a0b0',
    colorDim: 'rgba(160,160,176,0.12)',
    border: 'rgba(160,160,176,0.3)',
    rune: 'ᛟ',
  },
]

const STEPS = ['IDENTIFICAÇÃO', 'FACÇÃO', 'CONFIRMAÇÃO']

export default function CharacterCreate({ player, onComplete, onBack }) {
  const mouseTarget  = useRef({ x: 0, y: 0 })
  const mouseCurrent = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
  const bgRef  = useRef(null)

  const [step, setStep]           = useState(0)
  const [name, setName]           = useState(player.username || '')
  const [faction, setFaction]     = useState(null)
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState('forward')

  const tick = useCallback(() => {
    mouseCurrent.current.x = lerp(mouseCurrent.current.x, mouseTarget.current.x, 0.04)
    mouseCurrent.current.y = lerp(mouseCurrent.current.y, mouseTarget.current.y, 0.04)
    const { x, y } = mouseCurrent.current
    if (bgRef.current)
      bgRef.current.style.transform = `translate3d(${x * -10}px, ${y * -7}px, 0) scale(1.08)`
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

  const goTo = (next) => {
    setDirection(next > step ? 'forward' : 'back')
    setAnimating(true)
    setTimeout(() => { setStep(next); setAnimating(false) }, 220)
  }

  const handleComplete = () => {
    const selectedFaction = FACTIONS.find(f => f.id === faction)
    onComplete({
      ...player,
      username: name.trim(),
      faction: faction || 'none',
      reputation: selectedFaction ? 100 : 0,
    })
  }

  const canNext = step === 0 ? name.trim().length >= 3 : step === 1 ? faction !== null : true

  return (
    <div className="cc-root">
      <div ref={bgRef} className="cc-bg" />
      <div className="cc-overlay" />
      <div className="cc-vignette" />
      <div className="cc-scanlines" />

      <div className="cc-wrap">
        {/* Cabeçalho */}
        <header className="cc-header">
          <button className="cc-back-btn" onClick={onBack}>← VOLTAR</button>
          <div className="cc-logo">
            <span className="cc-logo-sigil">ᚨ</span>
            <span className="cc-logo-title">ARKON</span>
          </div>
          <div className="cc-header-right" />
        </header>

        {/* Step indicator */}
        <div className="cc-steps">
          {STEPS.map((label, i) => (
            <div key={i} className={`cc-step-item ${i === step ? 'cc-step-item--active' : ''} ${i < step ? 'cc-step-item--done' : ''}`}>
              <div className="cc-step-dot">{i < step ? '✓' : i + 1}</div>
              <span className="cc-step-label">{label}</span>
              {i < STEPS.length - 1 && <div className={`cc-step-line ${i < step ? 'cc-step-line--done' : ''}`} />}
            </div>
          ))}
        </div>

        {/* Conteúdo por step */}
        <div className={`cc-content ${animating ? `cc-content--exit-${direction}` : ''}`}>

          {/* ── Step 0: Nome ── */}
          {step === 0 && (
            <div className="cc-panel">
              <h2 className="cc-panel-title">COMO O SISTEMA VAI TE REGISTRAR?</h2>
              <p className="cc-panel-sub">Este é o nome que ficará na sua Ficha para sempre.</p>
              <div className="cc-name-wrap">
                <input
                  className="cc-name-input"
                  type="text"
                  value={name}
                  maxLength={20}
                  placeholder="nome do agente"
                  autoFocus
                  onChange={e => setName(e.target.value)}
                />
                <span className="cc-name-counter">{name.trim().length}/20</span>
              </div>
              {name.trim().length > 0 && name.trim().length < 3 && (
                <p className="cc-warn">Mínimo 3 caracteres.</p>
              )}
            </div>
          )}

          {/* ── Step 1: Facção ── */}
          {step === 1 && (
            <div className="cc-panel cc-panel--wide">
              <h2 className="cc-panel-title">ESCOLHA SEU LADO</h2>
              <p className="cc-panel-sub">Esta decisão define seus aliados, seus inimigos e como o mundo vai te tratar.</p>
              <div className="cc-factions">
                {FACTIONS.map(f => (
                  <button
                    key={f.id}
                    className={`cc-faction-card ${faction === f.id ? 'cc-faction-card--selected' : ''}`}
                    style={{ '--fc': f.color, '--fc-dim': f.colorDim, '--fc-border': f.border }}
                    onClick={() => setFaction(f.id)}
                  >
                    <div className="cc-fc-rune">{f.rune}</div>
                    <h3 className="cc-fc-name">{f.name}</h3>
                    <p className="cc-fc-god">{f.god}</p>
                    <div className="cc-fc-divider" />
                    <p className="cc-fc-desc">{f.desc}</p>
                    <div className="cc-fc-meta">
                      <span><em>Território</em> {f.territory}</span>
                      <span><em>Rank inicial</em> {f.rank}</span>
                    </div>
                    <blockquote className="cc-fc-quote">"{f.quote}"</blockquote>
                    {faction === f.id && <div className="cc-fc-selected-badge">SELECIONADO</div>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Confirmação ── */}
          {step === 2 && (() => {
            const f = FACTIONS.find(x => x.id === faction)
            return (
              <div className="cc-panel">
                <h2 className="cc-panel-title">CONFIRMAR FICHA</h2>
                <p className="cc-panel-sub">Revise antes de entrar em Arkon.</p>
                <div className="cc-summary">
                  <div className="cc-summary-avatar">{f?.rune || 'ᛉ'}</div>
                  <h3 className="cc-summary-name">{name.trim()}</h3>
                  {f && (
                    <span className="cc-summary-faction" style={{ color: f.color, borderColor: f.border }}>
                      {f.name}
                    </span>
                  )}
                  <div className="cc-summary-stats">
                    <div className="cc-ss"><span>GRADUS</span><strong>1</strong></div>
                    <div className="cc-ss"><span>INFLUÊNCIA</span><strong>0</strong></div>
                    <div className="cc-ss"><span>FICHA</span><strong>{f ? 100 : 0}</strong></div>
                    <div className="cc-ss cc-ss--full">
                      <span>CLASSE</span>
                      <strong className="cc-ss--locked">🔒 Disponível no Gradus 8</strong>
                    </div>
                    <div className="cc-ss cc-ss--full">
                      <span>TERRITÓRIO</span>
                      <strong style={{ color: f?.color }}>{f?.territory || '—'}</strong>
                    </div>
                  </div>
                  <p className="cc-summary-hint">
                    Você começará o Arco 0 no <strong>Bifrost Inferior</strong> — sem id, sem facção registrada, sem certeza do que vem a seguir.
                  </p>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Navegação */}
        <div className="cc-nav">
          {step > 0 && (
            <button className="cc-btn cc-btn--secondary" onClick={() => goTo(step - 1)}>
              ← VOLTAR
            </button>
          )}
          {step < 2 ? (
            <button className="cc-btn cc-btn--primary" disabled={!canNext} onClick={() => goTo(step + 1)}>
              PRÓXIMO →
            </button>
          ) : (
            <button className="cc-btn cc-btn--confirm" onClick={handleComplete}>
              ▶ ENTRAR EM ARKON
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
