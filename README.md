<div align="center">

![Arkon: A Fenda do Aglomerado](docs/cover.png)

# Arkon: A Fenda do Aglomerado

> Browser game multiplayer 2D top-down — sátira política brasileira com alma nórdica/grega/romana.

📖 **[Ler o livro — ARKON Completo](docs/ARKON-Completo.pdf)**

</div>

---

## Sobre o Projeto

Arkon é um MMORPG browser no estilo Tibia, ambientado num planeta rachado ao meio pelo sacrifício do deus-engenheiro **Kobi**. Dois lados, dois deuses, zero prestação de contas.

- **Bonde da Base** — sob o domínio de Molusk, o Navis Novem
- **A Gestão** — sob o domínio de Bolzarius, o Praetor Summus
- **Os Autônomos** — vivem no Bifrost Inferior, vendem passagem para os dois lados

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Phaser 3 + React + Vite |
| UI overlay | React + Zustand |
| Backend | Netlify Functions (serverless Node.js) |
| Banco | Supabase (PostgreSQL + Auth + Realtime) |
| Deploy | Netlify via GitHub |

## MVP — Ordem de Implementação

1. Estrutura de pastas + dependências
2. Supabase: migrations + seed
3. Auth: login/registro com Supabase
4. Phaser: BootScene + WorldScene com tilemap básico
5. Personagem se move + colide
6. Posição sincronizada via Supabase Realtime
7. Outros jogadores visíveis
8. Combate básico + monstros com spawn
9. Loot no banco
10. Sistema de facção + Influência
11. Missões do Arco 0

## Documentação

Veja [`CLAUDE.md`](CLAUDE.md) para o contexto completo: lore, facções, personagens, geografia, classes, sistemas, eventos, missões e schema do banco.
