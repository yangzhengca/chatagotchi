# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a frontend-only Single Page Application (SPA) for the **BigGeo MCP Server Demo**. It serves as:
1. A marketing/demo website showcasing BigGeo's geospatial AI capabilities (foot traffic analytics, location intelligence)
2. An OAuth Authorization Server for Stytch Connected Apps
3. A frontend portal to connect ChatGPT to an external MCP server

**Note**: This repository is on the `front-end-only` branch. Previous versions included an MCP server (`mcp_server_node/`), widgets (`widgets/`), and shared types, but these have been removed in favor of a pure frontend implementation.

## Key Commands

**Note:** This project uses pnpm. Ensure you have pnpm installed (`npm install -g pnpm`).

- `pnpm run build` - Build application to `assets/` directory for production deployment
- `pnpm run dev` - Start Vite dev server on port 4444 with hot reload

## Environment Variables

Create a `.env` file in the project root with:

- `VITE_STYTCH_PUBLIC_TOKEN` - Your Stytch public token for client-side authentication (required)
- `VITE_APLIC_MCP_URL` - URL to the external BigGeo MCP Server (optional, used for display in Home page instructions)

See `.env.template` for reference.

## Architecture

### Single Page Application (SPA)

This is a React SPA using React Router for client-side routing. The application handles:
- User authentication via Stytch (Email OTP + Google OAuth)
- OAuth authorization flow for ChatGPT MCP connections
- Display of demo instructions for connecting to the BigGeo MCP server

### Entry Points & Key Files

- **`index.html`** - Main HTML template, references `/app/main.tsx`
- **`app/main.tsx`** - React entry point, renders root component
- **`app/App.tsx`** - Main app component with StytchProvider and React Router setup
- **`app/Home.tsx`** - Landing page with BigGeo demo description and connection instructions
- **`app/Auth.tsx`** - Authentication components and HOC:
  - `Login` - Email OTP and Google OAuth login page
  - `Authorize` - OAuth consent screen for apps requesting access
  - `Authenticate` - OAuth callback handler
  - `Logout` - Session revocation button
  - `withLoginRequired` - HOC to protect routes requiring authentication
- **`app/index.css`** - Global styles with Tailwind imports

### Technology Stack

- **React 19.1.1** - UI library
- **React Router 7.8.2** - Client-side routing
- **Stytch** (`@stytch/react`, `@stytch/vanilla-js`) - Authentication and OAuth
- **Tailwind CSS 4.1.11** - Styling via `@tailwindcss/vite` plugin
- **Vite 7.1.1** - Build tool and dev server
- **TypeScript 5.9.2** - Type safety
- **Zod 4.1.5** - Schema validation

### Routing Structure

- `/` - Home page (redirects to `/home`)
- `/home` - Landing page with demo instructions
- `/login` - Login page (Email OTP + Google OAuth)
- `/authenticate` - OAuth callback handler
- `/oauth/authorize` - OAuth consent screen (protected route)
- `*` - Catch-all redirects to `/home`

## Stytch Authentication

### Setup
- StytchUIClient is instantiated in `app/App.tsx` with `VITE_STYTCH_PUBLIC_TOKEN`
- All components are wrapped in `<StytchProvider>`
- Use `useStytchUser()` hook to access current user info
- Use `useStytch()` hook to access Stytch client methods

### Authentication Flow
1. User navigates to protected route (e.g., `/oauth/authorize`)
2. `withLoginRequired` HOC checks if user is logged in
3. If not logged in, saves current URL to localStorage and redirects to `/login`
4. After successful login, `onLoginComplete()` redirects back to saved URL
5. Session is managed via Stytch, can be revoked with `stytch.session.revoke()`

### OAuth Flow (for ChatGPT MCP)
1. ChatGPT redirects user to `/oauth/authorize?client_id=...&redirect_uri=...&state=...`
2. User must be logged in (enforced by `withLoginRequired`)
3. Consent screen displays app details and requested permissions
4. On approval, redirects to ChatGPT callback URL with authorization code
5. ChatGPT exchanges code for access token via Stytch

## Build & Development

### Development Server
```bash
pnpm run dev
```
- Runs on `http://localhost:4444`
- CORS enabled for cross-origin requests
- Custom middleware rewrites `/widgets/*` paths to `/widgets/*/index.html` (legacy from previous architecture)

### Production Build
```bash
pnpm run build
```
- Outputs to `assets/` directory
- Single entry point: `index.html`
- Generates `main.js`, `main.css`, and `index.html`
- Source maps enabled
- Asset naming: `[name].js`, `[name].css`, `[name].[ext]`

### Vite Configuration (`vite.config.mts`)
- Plugins: `@tailwindcss/vite`, `@vitejs/plugin-react`
- Target: ES2022
- Dev server: port 4444, strict mode, CORS enabled
- Build: minified with esbuild, sourcemaps enabled

## Deployment

### Vercel (Current Hosting)
- Configured in `vercel.json`
- Build command: `pnpm -w run build`
- Output directory: `assets/`
- Install command: `pnpm install`
- Framework: null (custom SPA setup)
- CORS headers enabled for all routes (`Access-Control-Allow-Origin: *`)
- Rewrites: All non-asset paths redirect to `index.html` for SPA routing

### Environment Variables in Vercel
Set `VITE_STYTCH_PUBLIC_TOKEN` in Vercel environment variables dashboard.

## Important Patterns

### TypeScript Configuration
- **`tsconfig.json`** - Root config with references to app and node configs
- **`tsconfig.app.json`** - App code config (ES2022 target, strict mode, React JSX)
- **`tsconfig.node.json`** - Build tool config (ES2023 target, bundler resolution)

### Styling
- Tailwind CSS with custom utilities (scrollbar styling in `app/index.css`)
- Font: IBM Plex Sans monospace
- Responsive layout with max-width constraints
- Custom scrollbar colors: `scrollbar-track-gray-100`, `scrollbar-thumb-gray-400`

### File Naming
- React components: PascalCase (e.g., `Home.tsx`, `Auth.tsx`)
- Config files: kebab-case (e.g., `vite.config.mts`, `tailwind.config.ts`)

## Legacy Code
The following are remnants from the previous Chatagotchi game architecture and can be ignored or removed:
- Widget HTML middleware in `vite.config.mts` (no longer needed, no widgets exist)
- `/widgets/` route handling (directory has been deleted)
- References to "Chatagotchi" in comments or old documentation
