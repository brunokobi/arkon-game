<div align="center">

![Arkon: A Fenda do Aglomerado](docs/cover.png)

# Arkon: A Fenda do Aglomerado

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-c9a84c?style=flat-square&labelColor=0a0a14)](https://github.com/brunokobi/arkon-game)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=61dafb&labelColor=0a0a14)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=646cff&labelColor=0a0a14)](https://vitejs.dev)
[![Phaser](https://img.shields.io/badge/Phaser-4-e91e63?style=flat-square&labelColor=0a0a14)](https://phaser.io)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase&logoColor=3ecf8e&labelColor=0a0a14)](https://supabase.com)
[![Netlify](https://img.shields.io/badge/Deploy-Netlify-00c7b7?style=flat-square&logo=netlify&logoColor=00c7b7&labelColor=0a0a14)](https://netlify.com)

</div>

---

## Sinopse

> *"Não existe lado certo num mundo rachado. Existe o lado que você aguentou mais tempo."*
> — inscrição anônima nas paredes do Bifrost Inferior

Há séculos, um deus-engenheiro morreu para estabilizar o mundo que criou sem testar. Do sacrifício restou apenas a **Fenda** — a Jötunroc, cordilheira que partiu Arkon em dois — e o **Tridente**: a interface de administração de um sistema que ninguém deveria conseguir empunhar.

Hoje, dois deuses se enfrentam a cada quatro anos pelo direito de controlar o que sobrou. Do lado oeste, **Molusk** governa pelos esgotos e pelos vazamentos que ele mesmo criou via terminal de Kobi encontrado em Helvault. Do lado leste, **Bolzarius** comanda uma cidade construída sobre eficiência real e uma narrativa que ele próprio mandou escrever.

**Varen** é um desertor do Bonde da Base que encontrou um arquivo no Nível Seis — números que não batem, coordenadas dentro da Jötunroc, e três linhas do Runa-Arché que mudam tudo.

**Eira** é neta de Bolzarius, formada desde os sete anos por Primus para sobreviver antes de governar. Estava fazendo reconhecimento no Bifrost quando encontrou um homem com uma faca no ombro e o ferimento de quem foi traído por alguém de confiança.

*Uma fantasia política sobre o preço de descobrir como o mundo realmente funciona — e a coragem necessária para refazê-lo.*

---

## O Jogo

Browser game multiplayer 2D top-down no estilo Tibia — grinding, PvP, facções, sátira política brasileira com nomenclatura nórdica/grega/romana.

| Facção | Deus | Território |
|---|---|---|
| **Bonde da Base** | Molusk, o Navis Novem | Skálholm (oeste) |
| **A Gestão** | Bolzarius, o Praetor Summus | Aetherion (leste) |
| **Os Autônomos** | — | Bifrost Inferior (neutro) |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Motor de jogo | Phaser 4 |
| UI / HUD | React 18 + Zustand |
| Build | Vite 5 |
| Backend | Netlify Functions (Node.js 20) |
| Banco | Supabase (PostgreSQL + Auth + Realtime) |
| Deploy | Netlify via GitHub |

---

## MVP — Progresso

### Interface
- [x] Tela de login com parallax
- [x] Menu inicial com ficha do personagem e parallax
- [x] Criação de personagem (3 etapas: nome → facção → confirmação)
- [x] Tela de facções com hierarquia, ranks e ações

### Modo Campanha 2D
- [x] Phaser 4 instalado e integrado ao React
- [x] `BootScene` — carrega sprites reais via spritesheet (OpenTibia Sprite Pack)
- [x] `WorldScene` — mapa do Bifrost Inferior (Arco 0), colisão, câmera
- [x] Jogador se move com WASD / setas, colisão com paredes
- [x] Sistema de NPCs com zona de proximidade e indicador interativo
- [x] Mercus no checkpoint com diálogo (3 falas)
- [x] Partículas de mana nos tiles especiais
- [x] HUD overlay (zona, nome do jogador, dica de controles)
- [x] Sistema de saídas de zona
- [x] Sprites reais estilo Tibia (OTSP) — tiles de dungeon, cavaleiro, figura encapuzada

### Próximos passos
- [ ] Supabase: migrations + seed
- [ ] Auth real com Supabase
- [ ] Posição sincronizada via Supabase Realtime
- [ ] Outros jogadores visíveis
- [ ] Inimigos (Manaphis) com spawn e comportamento básico
- [ ] Combate (espada + mana pulse)
- [ ] Sistema de Influência e Ficha
- [ ] Missões do Arco 0 (Sine Nomine, Vectigal, Prima Facie)
- [ ] Zonas de Skálholm (Venarum, Labyrnis)

---

## Rodando localmente

```bash
git clone git@github.com:brunokobi/arkon-game.git
cd arkon-game/src/client
npm install
npm run dev
# http://localhost:5173
```

> Login de teste: `teste@arkon.io` / `arkon123`
>
> No menu, clique **ENTRAR EM ARKON** para abrir o modo campanha.
> Controles: `WASD` ou `↑↓←→` para mover · `E` para interagir com NPCs

---

## Documentação

### Lore & Narrativa

| Documento | Conteúdo |
|---|---|
| [`docs/synopsis.md`](docs/synopsis.md) | Sinopse completa — Varen, Eira, o Tridente e o Livro I |
| [`docs/lore/world.md`](docs/lore/world.md) | Kobi, o Aevum, os bugs, o Tridente como interface de admin |
| [`docs/lore/gods.md`](docs/lore/gods.md) | Molusk e Bolzarius — origens reais, por que não podem usar o Tridente |
| [`docs/lore/factions.md`](docs/lore/factions.md) | Bonde da Base, A Gestão, Os Autônomos — hierarquia e NPCs |
| [`docs/lore/geography.md`](docs/lore/geography.md) | Skálholm, Aetherion, Bifrost, Niflheim, a física da Jötunroc |
| [`docs/lore/characters.md`](docs/lore/characters.md) | Perfis completos de Varen, Eira e personagens de suporte |

### Gameplay

| Documento | Conteúdo |
|---|---|
| [`docs/gameplay/missions.md`](docs/gameplay/missions.md) | Arco 0, Arco 1A (Bonde), Arco 1B (Gestão) — 3 níveis de verdade |
| [`docs/gameplay/systems.md`](docs/gameplay/systems.md) | Gradus, Influência, Ficha, Ars, Memoria Loci |
| [`docs/gameplay/classes.md`](docs/gameplay/classes.md) | As quatro classes e suas skills |
| [`docs/gameplay/events.md`](docs/gameplay/events.md) | O Pleito, eventos sazonais e emergentes |
| [`docs/glossary.md`](docs/glossary.md) | Glossário dos termos do universo |

### Livro

| Documento | Conteúdo |
|---|---|
| [`docs/ARKON-Livro-Editado-v2.docx`](docs/ARKON-Livro-Editado-v2.docx) | Arkon: A Fenda do Aglomerado — Livro I (versão editada v2) |

### Técnico

| Documento | Conteúdo |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Contexto completo do projeto (stack, schema, ordem do MVP) |
| [`src/client/public/assets/sprites/`](src/client/public/assets/sprites/) | OpenTibia Sprite Pack (CC-BY 4.0) — 12 sprite sheets, fundo magenta→alpha |

---

<div align="center">
<sub>© 2026 Bruno Kobi</sub>
</div>
