# BigGeo MCP Server Demo

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A frontend demo application showcasing [BigGeo](https://biggeo.com)'s cutting-edge Geospatial AI capabilities. This Single Page Application (SPA) serves as an OAuth authorization server and marketing portal for connecting ChatGPT to the BigGeo MCP server.

Built with [Stytch](https://stytch.com) for authentication and deployed on [Vercel](https://vercel.com).

## What is BigGeo MCP?

BigGeo MCP provides advanced location intelligence and data analytics through ChatGPT. Users can:

- 🏢 **Brand-Level Insights** - Retrieve foot traffic data (visitor counts, etc.) for all locations of a brand within a geographic area
- 🏪 **Business-Level Insights** - Get visitor counts and other metrics for specific businesses, or find and compare foot traffic for similar nearby businesses within a given radius

## Architecture

This is a React-based Single Page Application that handles:

### Frontend Website (`app/`)
A React SPA built with React Router and Stytch authentication:
- **Marketing Portal** - Landing page with demo instructions and BigGeo capabilities
- **OAuth Authorization Server** - Handles ChatGPT MCP authentication flow
- **User Management** - Login, logout, and session management via Stytch

Built with:
- React 19.1.1 + React Router 7.8.2
- Stytch for OAuth and authentication
- Tailwind CSS for styling
- Vite for bundling and development

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- Stytch and Vercel accounts

## Deployment

Fork the repository in GitHub so you can connect your personal repository to Vercel.

### Vercel Setup
1. Create a Vercel account at https://vercel.com/
2. Grant Vercel access to your forked repository and deploy it
3. Remember your Vercel domain, which will look like `https://your-app-name.vercel.app`

### Stytch Setup

1. Create a Stytch account at https://stytch.com
2. Create a "Consumer" project and get your credentials from the Project Overview page
   - You'll need the `STYTCH_PROJECT_ID`, `STYTCH_SECRET`, `STYTCH_DOMAIN`, and `STYTCH_PUBLIC_TOKEN`
3. Navigate to Frontend SDK
   - Enable the JavaScript SDK and add your Vercel domain as an approved domain
4. Navigate to Connected Apps > Settings
   - Enable Dynamic Client Registration
   - Set `${VERCEL_DOMAIN}/oauth/authorize` as your project Authorization URL
5. Return to Vercel and set `VITE_STYTCH_PUBLIC_TOKEN` as an environment variable with your Stytch public token

### Environment Variables

Create a `.env` file in the project root (see `.env.template`):

```bash
VITE_STYTCH_PUBLIC_TOKEN=your-stytch-public-token
VITE_APLIC_MCP_URL=https://your-mcp-server.alpic.live  # Optional, for display purposes
```

## Testing in ChatGPT

To connect the BigGeo MCP server to ChatGPT:

1. Enable [developer mode](https://platform.openai.com/docs/guides/developer-mode)
2. Add the MCP server URL to ChatGPT: **Settings > Connectors**
   - Use your MCP endpoint (e.g., `https://biggeo-mcp.alpic.live`)
3. ChatGPT will redirect you to the OAuth authorization page to grant access

Once connected, you can ask ChatGPT questions like:
- "What's the foot traffic for Starbucks locations in San Francisco?"
- "Find businesses similar to [business name] within 2 miles"

## Local Development

### Run Development Server

Start the Vite dev server with hot reload:

```bash
pnpm run dev
```

The dev server runs on `http://localhost:4444`

### Build for Production

Build the application for deployment:

```bash
pnpm run build
```

This produces optimized static assets in the `assets/` directory, ready for deployment to Vercel.

## Project Structure

```
app/
├── main.tsx          # React entry point
├── App.tsx           # Main app with routing and Stytch provider
├── Home.tsx          # Landing page with demo instructions
├── Auth.tsx          # Login, OAuth, and authentication components
└── index.css         # Global styles with Tailwind imports

assets/               # Build output directory
index.html            # Main HTML template
vite.config.mts       # Vite configuration
vercel.json           # Vercel deployment configuration
```

## Contributing

Contributions are welcome! Open an issue or submit a PR to improve the application.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
