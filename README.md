# Chatagotchi

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<table>
<tr>
<td><img src="chatagotchi.png" alt="Chatagotchi" width="300"></td>
<td>

A virtual pet game built with the Model Context Protocol (MCP) and OpenAI Apps SDK. Raise pets, unlock achievements, and experience the nostalgia of digital companions—all inside ChatGPT.

</td>
</tr>
</table>

## What is Chatagotchi?

Chatagotchi is an MCP server that brings interactive pet care to ChatGPT. Users can:

- 🐣 Start a new game and raise a randomly-assigned pet (bird, cat, dog, lizard, or fish)
- 🍎 Feed their pet with different foods (apples, cookies, salad, pizza)
- 🎮 Play activities (video games, running, skiing)
- 📊 Monitor three vital stats: stamina, happiness, and health
- 🏆 Unlock 11 discovery achievements for completing species and finding secret deaths
- 🎯 Guide pets through lifecycle stages: BABY → CHILD → ADULT → COMPLETE

The game features deterministic mechanics with hidden surprises—like skiing accidents and overeating consequences.

## Architecture

Chatagotchi uses a three-layer architecture:

### MCP Server (`mcp_server_node/`)
Node.js/TypeScript server that exposes game tools via the Model Context Protocol. Built with:
- **Controllers** (`server.ts`) - MCP tool definitions for ChatGPT integration
- **Business Logic** (`game-service.ts`) - Game state management and message generation
- **Game Mechanics** (`game-logic.ts`) - Pure functions for pet actions, lifecycle, and achievements
- **Authentication** - Stytch OAuth for user identity and metadata persistence

### Shared Types (`shared-types/`)
Single source of truth for TypeScript types shared between backend and frontend:
- Pet state definitions (`PetState`, `PetSpecies`, `PetLifecycleState`)
- Achievement system types (`Achievement`, `AchievementState`)
- Constants (species emojis, achievement definitions)

### Frontend Widgets (`widgets/`)
React components rendered inside ChatGPT via the Apps SDK:
- **Pet Widget** - Displays pet emoji, name, stats, lifecycle stage, and action buttons
- **Achievements Widget** - Gallery of locked/unlocked achievements with progress tracking
- **Utilities** - Shared hooks for accessing OpenAI global context and widget state

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- Stytch account for authentication (see [Setup](#stytch-setup))

## Installation

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd chatagotchi
pnpm install
```

## Development

### Build the Frontend Widgets

Build widgets into static assets for deployment:

```bash
pnpm run build
```

This produces versioned `.html`, `.js`, and `.css` files in `assets/`. Each widget is self-contained with its own styles.

For local development with hot reload:

```bash
pnpm run dev
```

The dev server runs on `http://localhost:4444` with CORS enabled.

### Run the MCP Server

Start the MCP server:

```bash
cd mcp_server_node
pnpm start
```

The server listens for MCP requests over HTTP with Stytch OAuth authentication.

### Stytch Setup

1. Create a Stytch account at https://stytch.com
2. Create a project and get your credentials
3. Create a `.env` file in `mcp_server_node/`:

```env
STYTCH_PROJECT_ID=your_project_id
STYTCH_SECRET=your_secret
STYTCH_DOMAIN=https://your-auth-domain.stytch.com
```

## Testing in ChatGPT

To add Chatagotchi to ChatGPT:

1. Enable [developer mode](https://platform.openai.com/docs/guides/developer-mode)
2. Expose your local server with ngrok:
   ```bash
   ngrok http 3000
   ```
3. Add the ngrok URL to ChatGPT: **Settings > Connectors**
   - Use the MCP endpoint: `https://<your-id>.ngrok-free.app/mcp`

Once connected, try saying:
- "Let's start a brand new chatagotchi game"
- "Feed my pet a cookie"
- "Let's go skiing!"
- "Show me my achievements"

## How It Works

### MCP Tools

The server exposes four tools to ChatGPT:

- **`new-game`** - Creates a new pet with a random species
- **`pet-feed`** - Feeds the pet (🍎 🍪 🥗 🍕)
- **`pet-play`** - Plays with the pet (🎮 🏃 🎿)
- **`achievements`** - Displays achievement progress

Each tool returns structured data and metadata pointing to a widget URI. ChatGPT renders the widget inline with the conversation.

### Game State Persistence

- **Pet state** - Stored per-game in Stytch user metadata (resets on new game)
- **Achievements** - Persistent across all games (stored separately)

### Stat System

Each action affects three stats (0-100 scale):
- **Stamina** - Increases with food, decreases with exercise
- **Happiness** - Boosted by treats and fun activities
- **Health** - Improved by healthy choices, harmed by junk food

If any stat drops below 20, the pet dies. Feed them pizza too many times and they might explode. 💥

### Lifecycle Progression

Pets age based on turn count:
- **Turn 0-1**: BABY 🐣
- **Turn 2-4**: CHILD 🐥
- **Turn 5-8**: ADULT 🐔
- **Turn 9+**: COMPLETE 🏆

Complete a species to unlock its achievement!

### Secret Deaths

Discover hidden death scenarios:
- 🎿 **Skiing accident** - Random tree crash (deterministic RNG)
- 🍕 **Overeating** - Stamina exceeds 120
- 👶 **Baby skiing** - Don't take babies to the slopes!

Plus standard deaths from starvation, sadness, and poor health.

## Project Structure

```
chatagotchi/
├── mcp_server_node/          # MCP server (Node/TypeScript)
│   └── src/
│       ├── server.ts          # MCP tool definitions
│       ├── game-service.ts    # Business logic layer
│       ├── game-logic.ts      # Pure game mechanics
│       ├── stytch.ts          # Authentication & storage
│       └── index.ts           # Express HTTP server
├── shared-types/              # Shared TypeScript types
│   └── game-types.ts          # Types, interfaces, constants
├── widgets/                   # Frontend React components
│   ├── pet/                   # Pet display widget
│   ├── achievements/          # Achievement gallery
│   └── utils/                 # Shared hooks
├── assets/                    # Built widget bundles
└── vite.config.mts           # Widget build configuration
```

## Adding New Features

### Adding a New Widget

1. Create `widgets/your-widget/` with `index.html`, `index.tsx`, `index.css`, `types.ts`
2. Add entry to `vite.config.mts` in `rollupOptions.input`
3. Register resource in `server.ts`:
   ```typescript
   server.registerResource('your-widget', 'ui://widget/your-widget.html', ...)
   ```
4. Create a tool that returns `_meta['openai/outputTemplate']` pointing to your widget

### Adding New Types

Define types in `shared-types/game-types.ts` and import them in both backend and widget code. Never duplicate type definitions.

### Modifying Game Mechanics

Edit `mcp_server_node/src/game-logic.ts` for stat calculations, lifecycle rules, and achievement detection. The `GameService` layer handles state persistence automatically.

## Deployment

Frontend widgets are deployed to Vercel. The MCP server references production URLs:
- Pet widget: `https://chatagotchi-jet.vercel.app/pet.{css|js}`
- Achievements widget: `https://chatagotchi-jet.vercel.app/achievements.{css|js}`

Deploy your MCP server to any Node.js hosting provider that supports Express.

## Contributing

Contributions are welcome! Open an issue or submit a PR to improve the game.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
