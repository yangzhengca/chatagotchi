import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  type CallToolRequest,
  type ListResourceTemplatesRequest,
  type ListResourcesRequest,
  type ListToolsRequest,
  type ReadResourceRequest,
  type Resource,
  type ResourceTemplate,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

type PizzazWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  responseText: string;
};

function widgetMeta(widget: PizzazWidget) {
  return {
    'openai/outputTemplate': widget.templateUri,
    'openai/toolInvocation/invoking': widget.invoking,
    'openai/toolInvocation/invoked': widget.invoked,
    'openai/widgetAccessible': true,
    'openai/resultCanProduceWidget': true,
  } as const;
}

const widgets: PizzazWidget[] = [
  {
    id: 'pet-status',
    title: 'Show Pizza Map',
    templateUri: 'ui://widget/pet.html',
    invoking: 'Checking in on your pet',
    invoked: 'Here is how your pet is doing',
    html: `
<div id="pet-root"></div>
<link rel="stylesheet" href="https://chatagotchi-jet.vercel.app/index.css">
<script type="module" src="https://chatagotchi-jet.vercel.app/pet.js"></script>
    `.trim(),
    responseText: 'Checked in on your pet!',
  },
];

const widgetsById = new Map<string, PizzazWidget>();
const widgetsByUri = new Map<string, PizzazWidget>();

widgets.forEach((widget) => {
  widgetsById.set(widget.id, widget);
  widgetsByUri.set(widget.templateUri, widget);
});

const toolInputSchema = {
  type: 'object',
  properties: {
    pizzaTopping: {
      type: 'string',
      description: 'Topping to mention when rendering the widget.',
    },
  },
  required: ['pizzaTopping'] as string[],
  additionalProperties: false,
} as const;

const toolInputParser = z.object({
  pizzaTopping: z.string(),
});

const tools: Tool[] = widgets.map((widget) => ({
  name: widget.id,
  description: widget.title,
  inputSchema: toolInputSchema,
  title: widget.title,
  _meta: widgetMeta(widget),
}));

const resources: Resource[] = widgets.map((widget) => ({
  uri: widget.templateUri,
  name: widget.title,
  description: `${widget.title} widget markup`,
  mimeType: 'text/html+skybridge',
  _meta: widgetMeta(widget),
}));

const resourceTemplates: ResourceTemplate[] = widgets.map((widget) => ({
  uriTemplate: widget.templateUri,
  name: widget.title,
  description: `${widget.title} widget markup`,
  mimeType: 'text/html+skybridge',
  _meta: widgetMeta(widget),
}));

export function getServer(): Server {
  const server = new Server(
    {
      name: 'pizzaz-node',
      version: '0.1.0',
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  server.setRequestHandler(
    ListResourcesRequestSchema,
    async (_request: ListResourcesRequest) => ({
      resources,
    })
  );

  server.setRequestHandler(
    ReadResourceRequestSchema,
    async (request: ReadResourceRequest) => {
      const widget = widgetsByUri.get(request.params.uri);

      if (!widget) {
        throw new Error(`Unknown resource: ${request.params.uri}`);
      }

      return {
        contents: [
          {
            uri: widget.templateUri,
            mimeType: 'text/html+skybridge',
            text: widget.html,
            _meta: widgetMeta(widget),
          },
        ],
      };
    }
  );

  server.setRequestHandler(
    ListResourceTemplatesRequestSchema,
    async (_request: ListResourceTemplatesRequest) => ({
      resourceTemplates,
    })
  );

  server.setRequestHandler(
    ListToolsRequestSchema,
    async (_request: ListToolsRequest) => ({
      tools,
    })
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      const widget = widgetsById.get(request.params.name);

      if (!widget) {
        throw new Error(`Unknown tool: ${request.params.name}`);
      }

      const args = toolInputParser.parse(request.params.arguments ?? {});

      return {
        content: [
          {
            type: 'text',
            text: widget.responseText,
          },
        ],
        structuredContent: {
          pizzaTopping: args.pizzaTopping,
        },
        _meta: widgetMeta(widget),
      };
    }
  );

  return server;
}
