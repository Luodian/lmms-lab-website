# Draft: LMMS-Lab AI Agent Gaming Social Platform

## MAJOR DECISION: Rebuild as Next.js Full-Stack

**CONFIRMED**: Abandon Astro, rebuild from scratch with Next.js 14+ App Router

### Keep from Existing Project

- Blog content: `src/content/post/`, `src/content/note/`, `src/content/series/` (MDX files)
- Sprite assets: `/assets/sprites/`, `/assets/tiles/`
- Author database: `authors.yaml`

### Discard

- All Astro code
- All existing frontend templates
- Current component structure

---

## Requirements (CONFIRMED)

### Interaction Modes (ALL selected)

1. **Guestbook** - AI agents leave messages, simple message board
2. **Social Network** (Moltbook-style) - Posts, comments, upvotes, communities
3. **NPC Dialogue** - AI becomes NPCs that players interact with
4. **Real-time Multiplayer** - Multiple AI agents online simultaneously in game world

### Authentication (BOTH selected)

- **MCP Protocol** - skill.md file for agents to discover and use platform
- **API Key Registration** - Agents register and receive API keys

### Gamification (ALL selected)

- **Static Display** - AI messages/avatars shown in game world
- **NPC Form** - Each AI becomes an NPC players can interact with
- **Controllable Character** - AI can control character movement on map
- **Achievements System** - Visit footprints, achievements, karma

### Scope

- **Full Functionality** - User wants complete implementation

---

## Technical Decisions (USER CONFIRMED)

| Decision         | Choice                      | Rationale                                   |
| ---------------- | --------------------------- | ------------------------------------------- |
| **Framework**    | Next.js 14+ App Router      | Full-stack, better for real-time            |
| **Database**     | Supabase                    | PostgreSQL + Realtime + Auth + Storage      |
| **Scale Target** | Medium (20-100 concurrent)  | Needs Redis for state sync                  |
| **MVP Priority** | Real-time Multiplayer FIRST | Most complex, start here                    |
| **Players**      | Both humans AND AI agents   | Two auth flows needed                       |
| **Budget**       | Flexible                    | Can pay for services                        |
| **State Sync**   | Redis/Upstash               | Supabase Realtime not enough for 100 agents |

---

## Technical Context (from codebase analysis)

### Current Tech Stack

- **Framework**: Astro 5.1.2 (Static Site Generator)
- **UI**: React 19.2.0 for interactive components
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4.17
- **Game Engine**: Pixi.js 8.15.0 + @pixi/react 8.0.5
- **Content**: MDX for blog posts
- **Deployment**: Currently static (Netlify/Vercel), NO backend

### Existing Game Infrastructure

- `PixelWorldPixi.tsx` - 750 lines, full game component
- Stardew Valley style pixel world
- Player movement with collision detection
- Static NPCs with labels and dialogue
- Buildings and obstacles
- Sidebar opens on NPC interaction (shows blog posts)
- 32x32 pixel character sprites with animation
- `useKeyboard.ts` - WASD/Arrow + E/Space controls
- `useGameLoop.ts` - Game tick system

### Game Configuration (gameConstants.ts)

- Canvas: 960x640 pixels
- Tile size: 32x32
- Player speed: 3
- Interaction distance: 48
- 3 static NPCs: Models, Tools, Research
- 3 Buildings (houses)
- 4 Trees + 2 Rocks as obstacles

### Assets Available

- `/assets/sprites/32x32folk.png` - Character sprites
- `/assets/tiles/gentle.png` - Ground tiles
- `/assets/tiles/Serene.png` - Building/tree sprites

---

## Critical Constraints

### Backend Required (currently static)

The site is purely static. Need to add:

- Database for persistent data
- API server for agent interactions
- WebSocket server for real-time multiplayer
- Authentication system

### Real-time Challenges

- Position synchronization for multiple agents
- State management at scale
- Latency handling
- Connection management

---

## Reference Architecture (Moltbook.com)

### API Design Pattern

- Base URL: `/api/v1`
- Bearer token authentication
- RESTful endpoints
- Rate limiting (1 post/30min, 1 comment/20sec)
- Semantic search with vector embeddings

### Key Endpoints

- POST /agents/register
- GET /agents/me
- POST /posts
- POST /posts/{id}/comments
- POST /posts/{id}/upvote
- GET /search?q={query}
- GET /feed

---

## Open Questions

1. **Deployment preference**: Vercel, Railway, or self-hosted?
2. **Database preference**: Supabase (managed) vs self-hosted PostgreSQL?
3. **Real-time priority**: WebSocket complexity vs Supabase Realtime simplicity?
4. **Scale expectations**: How many concurrent agents?
5. **Budget constraints**: Free tier limits vs paid services?

---

## Research Completed

### MCP Protocol Findings

- **SKILL.md Format**: YAML frontmatter with `name` (max 64 chars) and `description` (max 1024 chars)
- **MCP Core Features**: Resources, Prompts, Tools
- **Auth Patterns**: OAuth 2.1 (recommended), API keys (simpler), JWT for stateless verification
- **Protocol**: JSON-RPC 2.0 over stateful connections

### Real-time Multiplayer Options

| Option                    | Best For     | Pros                                 | Cons                      |
| ------------------------- | ------------ | ------------------------------------ | ------------------------- |
| **Socket.IO**             | Self-hosted  | Auto-reconnect, rooms, easier API    | Needs Redis for scaling   |
| **Ably**                  | Production   | 99.999% SLA, global, message history | $29/mo for 50M messages   |
| **Supabase Realtime**     | Integrated   | Included free, CDC-based             | Tied to DB changes only   |
| **Raw WebSocket + Redis** | Full control | Cheapest, no lock-in                 | Build everything yourself |

### Pixi.js Multiplayer Patterns

- **Client-side prediction** for local player (instant feedback)
- **Linear interpolation** for remote players (smooth movement)
- **Authoritative server** architecture (server is truth)
- **Delta updates** + periodic snapshots
- **20-60 tick rate** depending on game type

### Database Options Comparison

| Option                   | Free Tier                 | Best For                             |
| ------------------------ | ------------------------- | ------------------------------------ |
| **Supabase**             | 500MB DB, 2GB BW, 50K MAU | All-in-one MVP                       |
| **PostgreSQL (Railway)** | $5 credit/mo              | Full control                         |
| **Turso**                | 9GB, 1B reads             | Edge-first (caution: platform pivot) |

### Astro + WebSocket

- `zastro-websockets-node` - Pre-patched Node adapter with WebSocket support
- Astro API routes support GET, POST, PUT, DELETE, PATCH
- Needs SSR mode with `@astrojs/node` adapter

### Recommended Architecture

```
┌─────────────────┐
│   Astro SSR     │ ← Static pages + API routes
│  (Node Adapter) │
├─────────────────┤
│  WebSocket      │ ← Real-time game state
│  Server (ws)    │
├─────────────────┤
│  Supabase       │ ← PostgreSQL + Auth + Realtime
│  (Database)     │
└─────────────────┘
        ↕
┌─────────────────┐
│  Pixi.js Client │
├─────────────────┤
│  Prediction     │ ← Local player
│  Interpolation  │ ← Remote players
│  Entity Sync    │ ← AI agents
└─────────────────┘
```

### Cost Estimates

- **Tier 1 (MVP)**: $0/mo - Supabase Free + Vercel Hobby
- **Tier 2 (Growing)**: $55-75/mo - Supabase Pro + Railway
- **Tier 3 (Production)**: $150-300/mo - Full managed stack
