# CLAUDE.md — Arkon: A Fenda do Aglomerado
> Leia este arquivo antes de qualquer ação. É o contexto completo do projeto.

---

## VISÃO GERAL

Browser game multiplayer estilo Tibia (2D top-down, grinding, PvP, facções).
Tom: sátira política brasileira com nomenclatura nórdica/grega/romana.
Objetivo atual: construir o MVP jogável.

---

## STACK

| Camada | Tecnologia |
|---|---|
| Frontend | Phaser 3 + React + Vite |
| UI overlay | React + Zustand |
| Backend | Netlify Functions (serverless Node.js) |
| Banco | Supabase (PostgreSQL + Auth + Realtime + Storage) |
| Deploy | Netlify via GitHub |
| Repo | git@github.com:brunokobi/arkon-game.git |

---

## ESTRUTURA DE PASTAS

```
arkon-game/
├── docs/
│   ├── lore/
│   │   ├── world.md
│   │   ├── gods.md
│   │   ├── factions.md
│   │   └── geography.md
│   ├── gameplay/
│   │   ├── classes.md
│   │   ├── missions.md
│   │   ├── events.md
│   │   └── systems.md
│   ├── glossary.md
│   └── synopsis.md
├── design/
│   ├── map/mapa-fenda.html
│   └── prompts/cover-art.md
├── src/
│   ├── client/
│   │   ├── public/assets/{tilemaps,sprites,audio}
│   │   └── src/
│   │       ├── scenes/
│   │       │   ├── BootScene.js
│   │       │   ├── MenuScene.js
│   │       │   ├── WorldScene.js
│   │       │   └── UIScene.js
│   │       ├── components/
│   │       │   ├── HUD.jsx
│   │       │   ├── Chat.jsx
│   │       │   ├── Inventory.jsx
│   │       │   ├── MissionLog.jsx
│   │       │   └── FactionPanel.jsx
│   │       ├── stores/
│   │       │   ├── playerStore.js
│   │       │   ├── factionStore.js
│   │       │   └── missionStore.js
│   │       ├── lib/
│   │       │   ├── supabase.js
│   │       │   └── realtime.js
│   │       ├── config/phaser.js
│   │       ├── App.jsx
│   │       └── main.jsx
│   └── server/functions/
│       ├── auth.js
│       ├── player.js
│       ├── missions.js
│       ├── faction.js
│       ├── loot.js
│       └── eclipse.js
├── supabase/
│   ├── migrations/
│   │   ├── 001_players.sql
│   │   ├── 002_factions.sql
│   │   ├── 003_missions.sql
│   │   ├── 004_lore_entries.sql
│   │   ├── 005_loot.sql
│   │   └── 006_eclipse.sql
│   └── seed/
│       ├── factions.sql
│       ├── missions.sql
│       └── lore_entries.sql
├── CLAUDE.md
├── .env.example
├── .gitignore
└── netlify.toml
```

---

## MUNDO — ARKON

- **Planeta:** Arkon (Arkhé — origem, princípio)
- **Criador:** Kobi — deus-engenheiro que nunca testou o sistema em produção
- **Sacrifício de Kobi** estabilizou Arkon mas rachou o mundo ao meio → nasceu a Fenda
- **Tridente de Kobi** — artefato legado, interface de admin disfarçada de arma
  - `Bifurcum` — divide um recurso em dois (Fork)
  - `Conflatio` — funde duas zonas (Merge)
  - `Damnatio` — apaga zona permanentemente (Delete/irreversível)
- **Ginnr** — o vazio antes da criação
- **Aevum** — a era antes do sacrifício
- **Runa-Arché** — o código fundamental da magia

---

## DEUSES

### Molusk, o Navis Novem (oeste)
- Não nasceu deus: encontrou terminal abandonado de Kobi e sentou na cadeira vazia
- Poder real: informação assimétrica — sabe onde cada cano vaza antes de vazar
- Os vazamentos são propositais. Os Manaphis foram soltos por ele
- Carismático para os fracos, corrupto por arquitetura

### Bolzarius, o Praetor Summus (leste)
- Se autocoroou. Mandou escrever as crônicas que provam sua legitimidade
- Eficiente, direto, incorruptível por dinheiro
- Ponto cego fatal: os três herdeiros
  - **Primus** (O Herdeiro Técnico) — profissionalizou a corrupção do pai
  - **Kaos** (O Herdeiro Imune) — destrói por tédio, nunca responde
  - **Valka** (A Herdeira Invisível) — mais poderosa que os dois, ninguém percebeu

### Acordo de Cavalheiros (Protocolo Cinza)
- Acordo bilateral secreto entre Molusk e Bolzarius
- Nenhum dos dois quer destruir o outro — inimigo externo é instrumento de coesão
- O Bifrost Inferior é infraestrutura compartilhada com contrato secreto

---

## FACÇÕES

### Bonde da Base (Molusk)
| Camada | Nome | Crítica |
|---|---|---|
| Base | Os Convocados | Convocados pra votar, lutar, morrer — nunca pra decidir |
| Média | Os Supervisores | Sabem que o cimento é podre. Assinam o laudo assim mesmo |
| Cúpula | O Conselho (Consilium Novem) | 9 cadeiras, zero prestação de contas |

### A Gestão (Bolzarius)
| Camada | Nome | Crítica |
|---|---|---|
| Base | Os Estagiários | Fazem o trabalho, levam a culpa, sem vínculo |
| Média | Os Analistas | Escrevem relatório. Arquivam o relatório |
| Cúpula | Os Diretores (Legati) | Aprovam o que os herdeiros querem e chamam de estratégia |

### Os Autônomos (neutros)
- Vivem dentro do Bifrost Inferior
- Sem deus, sem facção, sem Eclipse
- Vendem passagem e informação para os dois lados
- Únicos que conhecem as entradas secretas do Túnel

---

## PERSONAGENS

| Nome | Papel | Facção |
|---|---|---|
| Drena | Controla o Nó IX — duto sob o Bifrost, cobra dos dois lados | Neutro |
| Aerugo | Delator domesticado, rosto da campanha anticorrupção de Molusk | Bonde |
| Murus | Veterano que viu tudo, assinou tudo, guarda tudo | Gestão |
| Graxis | Capitão de rua que acredita no que fala — o mais perigoso | Bonde |
| Stigma | Tenente que preenche relatório sem perguntas | Gestão |
| Vacuus | Assessor que sobreviveu a quatro gestões | Gestão |
| Mercus | Atravessador dos Autônomos, compra e vende dos dois lados | Neutro |

---

## GEOGRAFIA

| Local | Nome | Descrição |
|---|---|---|
| Planeta | Arkon | O mundo rachado |
| Cordilheira | Jötunroc | Barreira intransponível no centro |
| Grande Túnel | Bifrost Inferior | Única passagem, cobrada pela Ordo Bifrost |
| Zona oculta | Niflheim | Dentro do Túnel, não consta em mapas oficiais |
| Favela oeste | Skálholm | Labiríntica, mana vaza por design de Molusk |
| Metrópole leste | Aetherion | Eficiente, privatizada, praias inacessíveis |
| Mar a leste | Mare Ignotum | Desconhecido |
| Zonas Skálholm | Helvault, Labyrnis, Falcorum, Venarum, Austral Skál | — |
| Zonas Aetherion | Turris Magna, Liminar, Portus Aer, Agora Ferrum, Forgia | — |

---

## CLASSES

| Classe | Nome BR | Skills principais |
|---|---|---|
| Tank/melee | O Geral | Pressão de Duto, Modo Ruptura |
| Mago ofensivo | O Esquemista | Vazamento Induzido, Colapso de Rede |
| Mago suporte | A Articuladora | Sifão, Redistribuição Total |
| Arqueiro/ranger | O Concursado | Protocolo de Campo, Ordem de Execução |

### Escolha de classe
- Começa sem vocação
- Escolhe no **Gradus 8** após missão de iniciação
- Troca apenas com item raro de evento

---

## SISTEMAS

| Sistema | Nome | Descrição |
|---|---|---|
| Nível | Gradus | 1-200+, curva exponencial após 50 |
| Moeda política | Influência (id_fluxo) | Peso no Pleito, acesso a missões |
| Reputação | Ficha | Decai 50pts/dia após 7 dias offline (Diminutio) |
| Especialização | Ars | Acumula por uso, perde ao trocar linha |
| Mapa | Memoria Loci | Revelado por exploração, some na Jötunroc |
| Morte | — | Perde 10% XP do level. Após nível 100, dropa itens |

### Missões em 3 níveis de verdade
- **Nível 0** — A Versão Oficial (o comunicado de imprensa)
- **Nível 1** — O que Realmente Aconteceu (desbloqueado por Influência)
- **Nível 2** — O Dossiê (só para quem já traiu a própria facção)

### Posições únicas no servidor
- **Consilium Novem** — 9 slots no Bonde da Base
- **Legati** — 3 slots na Gestão
- Destituíveis via **Impeachment** (60% de aprovação da facção)

---

## EVENTOS

### O Pleito (a cada 4 anos)
1. **A Campanha** — 30 dias, troca de facção gratuita, missões de recrutamento
2. **O Cadastro** — espionagem, infiltração, sabotagem
3. **O Lockdown** — Bifrost Inferior em combate total, Ordo Bifrost leiloa entradas
4. **O Segundo Turno** — 6 horas, servidor único, decide quem controla Arkon

### Eventos sazonais
| Evento | Frequência | Duração |
|---|---|---|
| A Auditoria | A cada 3 meses | 2 semanas |
| A Inspeção do Topo | A cada 3 meses | 1 semana |
| Noite das Anomalias (Eidolon) | 1x por ano | 72h |

### Eventos emergentes (sem aviso)
- Colapso de Duto
- Ordem Executiva
- Retorno de Aerugo
- Audiência com Murus (evento único — dispara quando Murus morre)

---

## MISSÕES INICIAIS

### Arco 0 — Tutorial (sem facção, Gradus 1-7)
| Código | Nome | Descrição |
|---|---|---|
| 0.1 | Sine Nomine | Acordar no Bifrost sem id, sem facção |
| 0.2 | Vectigal | Pagar pedágio ou trabalhar pra Ordo Bifrost |
| 0.3 | Prima Facie | Visitar os dois lados antes de escolher |

### Arco 1A — Bonde da Base (Gradus 5-15)
| Código | Nome | Descrição |
|---|---|---|
| 1A.1 | Prima Vena | Reparar vazamento — os Manaphis foram soltos por Molusk |
| 1A.2 | Subsídio | Distribuir mana que cria dependência |
| 1A.3 | Delator | Seguir suspeito — primeira escolha com memória |
| 1A.4 | Consilium Vocat | Convocação ao Conselho — transição para Nível 1 |
| 1A.5 | Aerugo Loquitur | Evento oculto — Aerugo revela a verdade dos dutos |

### Arco 1B — A Gestão (Gradus 5-15)
| Código | Nome | Descrição |
|---|---|---|
| 1B.1 | Primus Gradus | Limpar Deserti — um deles avisa sobre a deserção |
| 1B.2 | Relatório | Assinar laudo falso sobre Zero-Dois/Kaos |
| 1B.3 | Protocolo | Escoltar comerciante — Kaos destrói a carga |
| 1B.4 | Probatio | Avaliação com Primus — entrega coordenada misteriosa |
| 1B.5 | Murus Loquitur | Evento oculto — Murus revela o Acordo de Cavalheiros |

---

## SCHEMA SUPABASE

```sql
-- Jogadores
create table players (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  email text unique not null,
  level int default 1,
  faction text default 'none', -- 'none' | 'bonde' | 'gestao'
  class text default 'none',   -- 'geral' | 'esquemista' | 'articuladora' | 'concursado'
  influence int default 0,
  reputation int default 0,
  map_memory jsonb default '{}',
  created_at timestamptz default now()
);

-- Facções
create table factions (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  god text not null,
  member_count int default 0,
  total_influence int default 0
);

-- Jogador x Facção
create table player_factions (
  player_id uuid references players(id),
  faction_id uuid references factions(id),
  joined_at timestamptz default now(),
  reputation_points int default 0,
  rank text default 'convocado',
  primary key (player_id, faction_id)
);

-- Missões
create table missions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  title text not null,
  arc text not null,
  min_level int default 1,
  faction text default 'none',
  lore_level int default 0,
  is_hidden boolean default false,
  trigger_condition jsonb,
  choices jsonb,
  rewards jsonb
);

-- Progresso de missões
create table player_missions (
  player_id uuid references players(id),
  mission_id uuid references missions(id),
  status text default 'available', -- available | active | completed | failed
  choice_made text,
  completed_at timestamptz,
  primary key (player_id, mission_id)
);

-- Lore
create table lore_entries (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  lore_level int default 0,
  faction text default 'none',
  unlock_condition jsonb,
  order_index int default 0
);

-- Loot
create table loot_tables (
  id uuid primary key default gen_random_uuid(),
  zone text not null,
  min_level int default 1,
  max_level int default 999,
  items jsonb not null,
  drop_rates jsonb not null
);

-- Ciclo do Eclipse / O Pleito
create table eclipse_cycles (
  id uuid primary key default gen_random_uuid(),
  start_date timestamptz not null,
  end_date timestamptz,
  winner_faction text,
  trident_holder uuid references players(id),
  changes_applied jsonb
);

-- Posições em tempo real
create table player_positions (
  player_id uuid references players(id) primary key,
  x float not null default 0,
  y float not null default 0,
  zone text default 'bifrost',
  updated_at timestamptz default now()
);

-- Chat
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id),
  faction text,
  message text not null,
  zone text,
  created_at timestamptz default now()
);
```

---

## CONFIGURAÇÕES

### netlify.toml
```toml
[build]
  base = "src/client"
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "src/server/functions"
```

### .env.example
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_KEY=sua-chave-de-servico
```

---

## ORDEM DE IMPLEMENTAÇÃO DO MVP

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

---

## GLOSSÁRIO RÁPIDO

| Termo no jogo | Significado real |
|---|---|
| Influência | Moeda política — quem você conhece |
| Ficha | Reputação pública na facção |
| Gradus | Nível do personagem |
| Ars | Especialização de arma |
| O Pleito | Eleição de 4 em 4 anos com violência |
| Damnatio | Delete irreversível do Tridente |
| Impeachment | Missão de traição para tomar cargo |
| Acordo de Cavalheiros | Protocolo secreto entre os dois deuses |
| Niflheim | Zona oculta dentro do Bifrost Inferior |
| Eidolon | Anomalias — fragmentos do código de Kobi |
