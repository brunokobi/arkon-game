import { useState, useEffect, useRef, useCallback } from 'react'
import './FactionScreen.css'

const lerp = (a, b, t) => a + (b - a) * t

const FACTIONS = [
  {
    id: 'bonde',
    name: 'Bonde da Base',
    god: 'Molusk',
    godTitle: 'o Navis Novem',
    territory: 'Skálholm',
    color: '#e86010',
    colorDim: 'rgba(232,96,16,0.14)',
    border: 'rgba(232,96,16,0.4)',
    rune: 'ᚠ',
    tagline: 'Os vazamentos são propositais.',
    description:
      'Molusk não nasceu deus: encontrou o terminal abandonado de Kobi e sentou na cadeira vazia. ' +
      'Seu poder real é informação assimétrica — sabe onde cada cano vaza antes de vazar. ' +
      'Carismático para os fracos, corrupto por arquitetura.',
    members: 2847,
    influence: 184200,
    ranks: [
      { name: 'Os Convocados',    tier: 'base',   desc: 'Convocados pra votar, lutar, morrer — nunca pra decidir.',    slots: null,  filled: null },
      { name: 'Os Supervisores',  tier: 'media',  desc: 'Sabem que o cimento é podre. Assinam o laudo assim mesmo.',   slots: null,  filled: null },
      { name: 'Consilium Novem',  tier: 'cupula', desc: '9 cadeiras, zero prestação de contas. Destituíveis por Impeachment.', slots: 9, filled: 3 },
    ],
    npcs: [
      { name: 'Aerugo',  role: 'Delator domesticado, rosto da campanha anticorrupção' },
      { name: 'Graxis',  role: 'Capitão de rua que acredita no que fala — o mais perigoso' },
    ],
    joinRank: 'Convocado',
    protocol: 'Protocolo Cinza',
  },
  {
    id: 'gestao',
    name: 'A Gestão',
    god: 'Bolzarius',
    godTitle: 'o Praetor Summus',
    territory: 'Aetherion',
    color: '#4fc3f7',
    colorDim: 'rgba(79,195,247,0.12)',
    border: 'rgba(79,195,247,0.35)',
    rune: 'ᛏ',
    tagline: 'Eficiente. Direto. Incorruptível por dinheiro.',
    description:
      'Bolzarius se autocoroou. Mandou escrever as crônicas que provam sua legitimidade. ' +
      'Eficiente e direto — mas com três herdeiros como ponto cego fatal: ' +
      'Primus (profissionalizou a corrupção), Kaos (destrói por tédio) e Valka (a mais perigosa, ninguém percebeu).',
    members: 3124,
    influence: 227500,
    ranks: [
      { name: 'Os Estagiários', tier: 'base',   desc: 'Fazem o trabalho, levam a culpa, sem vínculo.',                  slots: null, filled: null },
      { name: 'Os Analistas',   tier: 'media',  desc: 'Escrevem relatório. Arquivam o relatório.',                      slots: null, filled: null },
      { name: 'Legati',         tier: 'cupula', desc: 'Aprovam o que os herdeiros querem e chamam de estratégia. 3 slots.', slots: 3, filled: 1 },
    ],
    npcs: [
      { name: 'Murus',   role: 'Veterano que viu tudo, assinou tudo, guarda tudo' },
      { name: 'Stigma',  role: 'Tenente que preenche relatório sem perguntas' },
      { name: 'Vacuus',  role: 'Assessor que sobreviveu a quatro gestões' },
    ],
    joinRank: 'Estagiário',
    protocol: 'Protocolo Cinza',
  },
  {
    id: 'autonomos',
    name: 'Os Autônomos',
    god: 'Nenhum',
    godTitle: 'sem deus, sem eclipse',
    territory: 'Bifrost Inferior',
    color: '#a0a0b8',
    colorDim: 'rgba(160,160,184,0.1)',
    border: 'rgba(160,160,184,0.28)',
    rune: 'ᛟ',
    tagline: 'Sem deus. Sem facção. Sem Eclipse.',
    description:
      'Vivem dentro do Bifrost Inferior — o Grande Túnel que divide Arkon. ' +
      'Vendem passagem e informação para os dois lados sem fidelidade a nenhum. ' +
      'São os únicos que conhecem as entradas secretas do Túnel e o que existe em Niflheim.',
    members: 412,
    influence: 38900,
    ranks: [
      { name: 'Passante',      tier: 'base',   desc: 'Recém chegado ao Túnel, aprendendo as regras não escritas.',   slots: null, filled: null },
      { name: 'Guia',          tier: 'media',  desc: 'Conhece os corredores secretos. Cobra por cada acesso.',       slots: null, filled: null },
      { name: 'Senhor do Nó',  tier: 'cupula', desc: 'Controla um Nó de passagem. Cobra dos dois lados.',            slots: 9,    filled: 2  },
    ],
    npcs: [
      { name: 'Drena',  role: 'Controla o Nó IX — duto sob o Bifrost, cobra dos dois lados' },
      { name: 'Mercus', role: 'Atravessador, compra e vende informação dos dois lados' },
    ],
    joinRank: 'Passante',
    protocol: null,
  },
]

const TIER_LABEL = { base: 'BASE', media: 'INTERMEDIÁRIO', cupula: 'CÚPULA' }

export default function FactionScreen({ player, onUpdate, onBack }) {
  const mouseTarget  = useRef({ x: 0, y: 0 })
  const mouseCurrent = useRef({ x: 0, y: 0 })
  const rafRef = useRef(null)
  const bgRef  = useRef(null)

  const [selected, setSelected] = useState(
    player.faction !== 'none' ? player.faction : 'bonde'
  )
  const [confirming, setConfirming] = useState(null) // 'join' | 'leave'
  const [flash, setFlash]           = useState('')

  const faction = FACTIONS.find(f => f.id === selected)
  const playerFaction = FACTIONS.find(f => f.id === player.faction)
  const isMember = player.faction === selected

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

  const handleJoin = () => {
    onUpdate({ ...player, faction: selected })
    setFlash(`Você entrou para ${faction.name} como ${faction.joinRank}.`)
    setConfirming(null)
    setTimeout(() => setFlash(''), 3500)
  }

  const handleLeave = () => {
    onUpdate({ ...player, faction: 'none' })
    setFlash('Você abandonou a facção. Sem deus, sem ficha.')
    setConfirming(null)
    setTimeout(() => setFlash(''), 3500)
  }

  const playerRank = (f) => {
    if (!f || player.faction !== f.id) return null
    return f.ranks[0].name // mock: sempre rank base
  }

  return (
    <div className="fs-root">
      <div ref={bgRef} className="fs-bg" />
      <div className="fs-overlay" />
      <div className="fs-vignette" />
      <div className="fs-scanlines" />

      {/* ── Header ── */}
      <header className="fs-header">
        <button className="fs-back" onClick={onBack}>← VOLTAR</button>
        <div className="fs-header-logo">
          <span className="fs-logo-sigil">ᚨ</span>
          <span className="fs-logo-title">FACÇÕES</span>
        </div>
        <div className="fs-header-status">
          {player.faction !== 'none' && playerFaction ? (
            <span className="fs-current-badge" style={{ color: playerFaction.color, borderColor: playerFaction.border }}>
              {playerFaction.rune} {playerFaction.name}
            </span>
          ) : (
            <span className="fs-current-badge fs-current-badge--none">SEM FACÇÃO</span>
          )}
        </div>
      </header>

      {/* ── Seletor de facção ── */}
      <div className="fs-selector">
        {FACTIONS.map(f => (
          <button
            key={f.id}
            className={`fs-tab ${selected === f.id ? 'fs-tab--active' : ''} ${player.faction === f.id ? 'fs-tab--member' : ''}`}
            style={{ '--fc': f.color, '--fc-border': f.border, '--fc-dim': f.colorDim }}
            onClick={() => { setSelected(f.id); setConfirming(null) }}
          >
            <span className="fs-tab-rune">{f.rune}</span>
            <span className="fs-tab-name">{f.name}</span>
            {player.faction === f.id && <span className="fs-tab-you">◈ SUA FACÇÃO</span>}
          </button>
        ))}
      </div>

      {/* ── Painel de detalhe ── */}
      <div className="fs-detail" key={selected}>
        <div className="fs-detail-inner">

          {/* Coluna esquerda */}
          <div className="fs-col-left">
            {/* Cabeçalho da facção */}
            <div className="fs-faction-header" style={{ '--fc': faction.color, '--fc-dim': faction.colorDim, '--fc-border': faction.border }}>
              <span className="fs-faction-rune">{faction.rune}</span>
              <div>
                <h2 className="fs-faction-name">{faction.name}</h2>
                <p className="fs-faction-god">{faction.god} — <em>{faction.godTitle}</em></p>
              </div>
              {isMember && <span className="fs-member-tag">MEMBRO</span>}
            </div>

            <blockquote className="fs-tagline">"{faction.tagline}"</blockquote>
            <p className="fs-desc">{faction.description}</p>

            {/* Stats */}
            <div className="fs-stats">
              <div className="fs-stat">
                <span>TERRITÓRIO</span>
                <strong style={{ color: faction.color }}>{faction.territory}</strong>
              </div>
              <div className="fs-stat">
                <span>MEMBROS</span>
                <strong>{faction.members.toLocaleString('pt-BR')}</strong>
              </div>
              <div className="fs-stat">
                <span>INFLUÊNCIA TOTAL</span>
                <strong>{faction.influence.toLocaleString('pt-BR')}</strong>
              </div>
              {isMember && (
                <div className="fs-stat">
                  <span>SEU RANK</span>
                  <strong style={{ color: faction.color }}>{playerRank(faction)}</strong>
                </div>
              )}
            </div>

            {/* NPCs */}
            <div className="fs-npcs">
              <h4 className="fs-section-title">PERSONAGENS-CHAVE</h4>
              {faction.npcs.map(n => (
                <div key={n.name} className="fs-npc">
                  <span className="fs-npc-name" style={{ color: faction.color }}>{n.name}</span>
                  <span className="fs-npc-role">{n.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna direita */}
          <div className="fs-col-right">
            {/* Hierarquia */}
            <h4 className="fs-section-title">HIERARQUIA</h4>
            <div className="fs-ranks">
              {[...faction.ranks].reverse().map((r, i) => (
                <div key={r.name} className={`fs-rank fs-rank--${r.tier} ${isMember && i === faction.ranks.length - 1 ? 'fs-rank--yours' : ''}`}
                  style={{ '--fc': faction.color, '--fc-border': faction.border }}>
                  <div className="fs-rank-header">
                    <div>
                      <span className="fs-rank-tier">{TIER_LABEL[r.tier]}</span>
                      <h5 className="fs-rank-name">{r.name}</h5>
                    </div>
                    {r.slots && (
                      <div className="fs-rank-slots">
                        <span className="fs-rank-slots-label">VAGAS</span>
                        <div className="fs-rank-slots-dots">
                          {Array.from({ length: r.slots }, (_, j) => (
                            <span key={j} className={`fs-slot-dot ${j < r.filled ? 'fs-slot-dot--filled' : ''}`}
                              style={{ '--fc': faction.color }} />
                          ))}
                        </div>
                        <span className="fs-rank-slots-count">{r.filled}/{r.slots}</span>
                      </div>
                    )}
                  </div>
                  <p className="fs-rank-desc">{r.desc}</p>
                  {isMember && i === faction.ranks.length - 1 && (
                    <span className="fs-rank-you-tag">← VOCÊ ESTÁ AQUI</span>
                  )}
                </div>
              ))}
            </div>

            {/* Protocolo Cinza */}
            {faction.protocol && (
              <div className="fs-protocol">
                <span className="fs-protocol-icon">⚠</span>
                <p>
                  <strong>{faction.protocol}</strong> — Acordo secreto bilateral entre Molusk e Bolzarius.
                  Nenhum dos dois quer realmente destruir o outro. O inimigo externo é instrumento de coesão.
                </p>
              </div>
            )}

            {/* Ações */}
            <div className="fs-actions">
              {flash && <p className="fs-flash">{flash}</p>}

              {!isMember && player.faction === 'none' && confirming !== 'join' && (
                <button className="fs-btn fs-btn--join" style={{ '--fc': faction.color, '--fc-dim': faction.colorDim, '--fc-border': faction.border }}
                  onClick={() => setConfirming('join')}>
                  {faction.rune} ENTRAR PARA {faction.name.toUpperCase()}
                </button>
              )}

              {!isMember && player.faction !== 'none' && (
                <p className="fs-cant-join">Abandone {playerFaction?.name} antes de mudar de facção.</p>
              )}

              {confirming === 'join' && (
                <div className="fs-confirm">
                  <p>Tem certeza? Você entrará como <strong style={{ color: faction.color }}>{faction.joinRank}</strong>.</p>
                  <div className="fs-confirm-btns">
                    <button className="fs-btn fs-btn--confirm" onClick={handleJoin}>CONFIRMAR</button>
                    <button className="fs-btn fs-btn--cancel" onClick={() => setConfirming(null)}>CANCELAR</button>
                  </div>
                </div>
              )}

              {isMember && confirming !== 'leave' && (
                <button className="fs-btn fs-btn--leave" onClick={() => setConfirming('leave')}>
                  ABANDONAR FACÇÃO
                </button>
              )}

              {confirming === 'leave' && (
                <div className="fs-confirm">
                  <p>Tem certeza? Você perderá seu rank e <strong>50% da sua Ficha</strong>.</p>
                  <div className="fs-confirm-btns">
                    <button className="fs-btn fs-btn--confirm-danger" onClick={handleLeave}>CONFIRMAR DESERÇÃO</button>
                    <button className="fs-btn fs-btn--cancel" onClick={() => setConfirming(null)}>CANCELAR</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
