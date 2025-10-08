import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

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
    async () => {
      return {
        content: [
          {
            type: 'text',
            text: 'Checked in on your pet!',
          },
        ],
        structuredContent: {
          petStatus: 'HUNGRY',
        },
      };
    }
  );

  return server;
}
