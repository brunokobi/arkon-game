import { useState } from 'react'
import './CharacterSelect.css'

const CHARACTERS = [
  {
    id: 'varen',
    name: 'Varen',
    title: 'O Desertor',
    faction: 'Sem facção',
    description:
      'Carregou o arquivo que revelou o sistema. Ex-Bonde da Base, co-mediador da Ordo Bifrost. Sabe onde os dutos vazam.',
    stats: { forca: 3, agilidade: 2, influencia: 4 },
    rune: 'ᚢ',
    portrait: '/assets/sprites/varen_face.png',
    tint: null,
  },
  {
    id: 'eira',
    name: 'Eira Solenne',
    title: 'A Herdeira',
    faction: 'Sem facção',
    description:
      'Neta de Bolzarius, formada desde os 7 anos. Co-mediadora da Ordo Bifrost. Mais perigosa que qualquer Legatus.',
    stats: { forca: 2, agilidade: 4, influencia: 3 },
    rune: 'ᛖ',
    portrait: '/assets/sprites/eira_face.png',
    tint: 'blue',
  },
]

export default function CharacterSelect({ player, onSelect }) {
  const [selected, setSelected] = useState(null)
  const [hovering, setHovering] = useState(null)

  return (
    <div className="cs-root">
      {/* Background runes */}
      <div className="cs-bg-runes" aria-hidden>
        {['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᛏ','ᛒ','ᛖ','ᛗ','ᛟ','ᛞ'].map((r, i) => (
          <span key={i} className="cs-bg-rune" style={{ '--i': i }}>{r}</span>
        ))}
      </div>

      <div className="cs-inner">
        <div className="cs-header">
          <span className="cs-header-rune">ᛟ</span>
          <h1 className="cs-title">ESCOLHA SEU PERSONAGEM</h1>
          <span className="cs-header-rune">ᛟ</span>
        </div>
        <p className="cs-sub">
          Operador <span className="cs-playername">{player.username}</span> — selecione um agente para entrar na Fenda
        </p>

        <div className="cs-cards">
          {CHARACTERS.map(char => {
            const isSelected = selected?.id === char.id
            const isHover    = hovering === char.id
            return (
              <div
                key={char.id}
                className={`cs-card ${isSelected ? 'cs-card--selected' : ''} ${isHover ? 'cs-card--hover' : ''}`}
                onClick={() => setSelected(char)}
                onMouseEnter={() => setHovering(char.id)}
                onMouseLeave={() => setHovering(null)}
              >
                {isSelected && <div className="cs-card-glow" />}

                <div className="cs-card-portrait-wrap">
                  <img
                    className={`cs-card-portrait ${char.tint ? 'cs-card-portrait--' + char.tint : ''}`}
                    src={char.portrait}
                    alt={char.name}
                  />
                  <div className="cs-card-rune-badge">{char.rune}</div>
                </div>

                <div className="cs-card-info">
                  <div className="cs-card-name">{char.name}</div>
                  <div className="cs-card-title">{char.title}</div>
                  <div className="cs-card-faction">{char.faction}</div>
                  <p className="cs-card-desc">{char.description}</p>

                  <div className="cs-card-stats">
                    {Object.entries(char.stats).map(([k, v]) => (
                      <div key={k} className="cs-stat">
                        <span className="cs-stat-label">{k.toUpperCase()}</span>
                        <div className="cs-stat-bar">
                          {[1,2,3,4,5].map(pip => (
                            <div
                              key={pip}
                              className={`cs-stat-pip ${pip <= v ? 'cs-stat-pip--on' : ''}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {isSelected && (
                  <div className="cs-card-check">✓</div>
                )}
              </div>
            )
          })}
        </div>

        <button
          className={`cs-confirm-btn ${selected ? 'cs-confirm-btn--ready' : ''}`}
          disabled={!selected}
          onClick={() => selected && onSelect(selected.id)}
        >
          {selected
            ? `ENTRAR COMO ${selected.name.toUpperCase()} →`
            : 'SELECIONE UM PERSONAGEM'}
        </button>
      </div>
    </div>
  )
}
