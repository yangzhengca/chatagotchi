import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { z } from 'zod';

export function getServer(): McpServer {
  const server = new McpServer({
    name: 'chatagotchi-server',
    version: '0.1.0',
  });

  server.registerResource('pet-status', 'ui://widget/pet.html', {}, () => {
    return {
      contents: [
        {
          uri: 'ui://widget/pet.html',
          mimeType: 'text/html+skybridge',
          text: `
            <div id="pet-root"></div>
            <link rel="stylesheet" href="https://chatagotchi-jet.vercel.app/pet.css">
            <script type="module" src="https://chatagotchi-jet.vercel.app/pet.js"></script>
          `.trim(),
        },
      ],
    };
  });

  server.registerTool(
    'new-game',
    {
      title: 'Start a new game',
      description:
        'Kicks off a new game with a brand new pet. Be sure to name them!',
      _meta: {
        'openai/outputTemplate': 'ui://widget/pet.html',
        'openai/toolInvocation/invoking': 'Waking up your new pet',
        'openai/toolInvocation/invoked': 'Say hello to your new pet!',
        'openai/widgetAccessible': true,
      },
      inputSchema: { name: z.string() },
    },
    async ({ name }, { authInfo }) => {
      return {
        content: [
          {
            type: 'text',
            text: `Say hello to ${name}`,
          },
        ],
        structuredContent: {
          petStatus: 'HUNGRY',
          authInfo,
        },
      };
    }
  );

  server.registerTool(
    'pet-status',
    {
      title: 'Check pet status',
      _meta: {
        'openai/outputTemplate': 'ui://widget/pet.html',
        'openai/toolInvocation/invoking': 'Checking in on your pet',
        'openai/toolInvocation/invoked': 'Here is how your pet is doing',
        'openai/widgetAccessible': true,
      },
    },
    async (_, { authInfo }) => {
      return {
        content: [
          {
            type: 'text',
            text: 'Checked in on your pet!',
          },
        ],
        structuredContent: {
          petStatus: 'HUNGRY',
          authInfo,
        },
      };
    }
  );

  return server;
}
