import { useState, useEffect, useRef, useCallback } from 'react'
import { MOCK_USER } from '../stores/playerStore'
import './LoginScreen.css'

const RUNES = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ','ᛏ','ᛒ','ᛖ','ᛗ','ᛚ','ᛜ','ᛞ','ᛟ']

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  rune: RUNES[i % RUNES.length],
  left: `${(i * 3.7 + 2) % 100}%`,
  delay: `${(i * 0.47) % 9}s`,
  duration: `${7 + (i % 6)}s`,
  size: `${10 + (i % 4) * 7}px`,
  type: i % 3 === 0 ? 'ice' : i % 3 === 1 ? 'fire' : 'gold',
}))

const lerp = (a, b, t) => a + (b - a) * t

export default function LoginScreen({ onLogin }) {
  const mouseTarget  = useRef({ x: 0, y: 0 })
  const mouseCurrent = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
  const bgRef  = useRef(null)
  const midRef = useRef(null)
  const fgRef  = useRef(null)

  const [mode, setMode]     = useState('login')
  const [form, setForm]     = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const tick = useCallback(() => {
    mouseCurrent.current.x = lerp(mouseCurrent.current.x, mouseTarget.current.x, 0.06)
    mouseCurrent.current.y = lerp(mouseCurrent.current.y, mouseTarget.current.y, 0.06)
    const { x, y } = mouseCurrent.current
    if (bgRef.current)  bgRef.current.style.transform  = `translate3d(${x * -18}px, ${y * -12}px, 0) scale(1.14)`
    if (midRef.current) midRef.current.style.transform = `translate3d(${x * -32}px, ${y * -22}px, 0)`
    if (fgRef.current)  fgRef.current.style.transform  = `translate3d(${x * -5}px,  ${y * -3}px,  0)`
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))

    // Mock auth — aceita teste@arkon.io / arkon123
    if (form.email === MOCK_USER.email && form.password === 'arkon123') {
      onLogin(MOCK_USER)
    } else {
      setError('Ficha não encontrada. Use teste@arkon.io / arkon123')
      setLoading(false)
    }
  }

  const field = (id, label, type, placeholder) => (
    <div className="ls-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id} type={type} placeholder={placeholder}
        value={form[id]} autoComplete={id} required
        onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
      />
    </div>
  )

  return (
    <div className="ls-root">
      <div ref={bgRef}  className="ls-layer ls-bg" />
      <div ref={midRef} className="ls-layer ls-mid" />

      <div className="ls-layer ls-particles">
        {PARTICLES.map(p => (
          <span key={p.id} className={`ls-rune ls-rune--${p.type}`}
            style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, fontSize: p.size }}>
            {p.rune}
          </span>
        ))}
      </div>

      <div ref={fgRef} className="ls-layer ls-fg" />
      <div className="ls-layer ls-vignette" />
      <div className="ls-scanlines" />

      <div className="ls-card">
        <header className="ls-header">
          <div className="ls-sigil">ᚨ</div>
          <h1>ARKON</h1>
          <div className="ls-rule"><span>A FENDA DO AGLOMERADO</span></div>
          <p className="ls-version">SISTEMA ARKON · ERR0 DE DADOS: KOBI</p>
        </header>

        <form className="ls-form" onSubmit={handleSubmit} noValidate>
          {mode === 'register' && field('username', 'NOME DE AGENTE', 'text', 'seu_nome')}
          {field('email',    'E-MAIL', 'email',    'agente@arkon.io')}
          {field('password', 'SENHA',  'password', '••••••••')}

          {error && <p className="ls-error">{error}</p>}

          <button type="submit" className={`ls-btn${loading ? ' ls-btn--loading' : ''}`} disabled={loading}>
            {loading && <span className="ls-spinner" />}
            {loading ? 'VERIFICANDO FICHA...' : mode === 'login' ? 'ENTRAR NO SISTEMA' : 'CRIAR FICHA'}
          </button>

          <button type="button" className="ls-toggle"
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}>
            {mode === 'login'
              ? <>Ainda não tem ficha? <strong>Registre-se</strong></>
              : <>Já tem ficha? <strong>Entrar</strong></>}
          </button>
        </form>

        {mode === 'login' && (
          <div className="ls-mock-hint">
            <span>teste@arkon.io</span><span className="ls-dot">·</span><span>arkon123</span>
          </div>
        )}

        <footer className="ls-footer">
          <span>ESTÚDIO DE JOGOS</span>
          <span className="ls-dot">·</span>
          <span>ARKON © 2026</span>
        </footer>
      </div>

      <div className="ls-zone ls-zone--left"><span>DISTRITO</span><strong>SKÁLHOLM</strong></div>
      <div className="ls-zone ls-zone--right"><span>SETOR</span><strong>AETHERION</strong></div>
    </div>
  )
}
