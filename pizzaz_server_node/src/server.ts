import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { z } from 'zod';
import { getUserTrustedMetadata, updateUserTrustedMetadata } from './stytch.js';

// Pet state types
type PetLifecycleState = 'BABY' | 'CHILD' | 'ADULT' | 'DEAD' | 'COMPLETE';

interface PetState {
  state: PetLifecycleState;
  name: string;
  hunger: number; // 0-100
  happiness: number; // 0-100
  bornAt: string; // ISO timestamp
  lastUpdate: string; // ISO timestamp
}

// Game constants
const STAT_DECAY_PER_SECOND = 10 / 60;
const FEED_AMOUNT = 30;
const PLAY_AMOUNT = 30;
const MIN_STAT_FOR_EVOLUTION = 20;
const LIFECYCLE_TIMINGS = {
  BABY_TO_CHILD: 3 * 60 * 1000,
  CHILD_TO_ADULT: 6 * 60 * 1000,
  ADULT_TO_COMPLETE: 10 * 60 * 1000,
};

async function getPetState(userId: string): Promise<PetState | null> {
  const metadata = await getUserTrustedMetadata(userId);
  const petState = metadata.petState as PetState | undefined;
  return petState || null;
}

async function savePetState(userId: string, petState: PetState): Promise<void> {
  const metadata = await getUserTrustedMetadata(userId);
  await updateUserTrustedMetadata(userId, {
    ...metadata,
    petState,
  });
}

function createInitialPetState(name: string): PetState {
  const now = new Date().toISOString();
  return {
    state: 'BABY',
    name: name,
    hunger: 30,
    happiness: 30,
    bornAt: now,
    lastUpdate: now,
  };
}

function updatePetState(petState: PetState): PetState {
  const now = new Date().toISOString();
  const elapsedSeconds =
    (Date.now() - new Date(petState.lastUpdate).getTime()) / 1000;
  const ageInMs = Date.now() - new Date(petState.bornAt).getTime();

  // Calculate stat decay
  const decay = STAT_DECAY_PER_SECOND * elapsedSeconds;
  const newHunger = Math.max(0, petState.hunger - decay);
  const newHappiness = Math.max(0, petState.happiness - decay);

  // Determine lifecycle state
  let newState = petState.state;

  if (newState !== 'DEAD' && newState !== 'COMPLETE') {
    if (newHunger <= 0 || newHappiness <= 0) {
      newState = 'DEAD';
    } else if (
      ageInMs >= LIFECYCLE_TIMINGS.ADULT_TO_COMPLETE &&
      newHunger > MIN_STAT_FOR_EVOLUTION &&
      newHappiness > MIN_STAT_FOR_EVOLUTION
    ) {
      newState = 'COMPLETE';
    } else if (
      ageInMs >= LIFECYCLE_TIMINGS.CHILD_TO_ADULT &&
      newHunger > MIN_STAT_FOR_EVOLUTION &&
      newHappiness > MIN_STAT_FOR_EVOLUTION
    ) {
      newState = 'ADULT';
    } else if (
      ageInMs >= LIFECYCLE_TIMINGS.BABY_TO_CHILD &&
      newHunger > MIN_STAT_FOR_EVOLUTION &&
      newHappiness > MIN_STAT_FOR_EVOLUTION
    ) {
      newState = 'CHILD';
    }
  }

  return {
    ...petState,
    state: newState,
    hunger: newHunger,
    happiness: newHappiness,
    lastUpdate: now,
  };
}

function getUserId(authInfo?: AuthInfo): string {
  if (
    !authInfo ||
    !authInfo.extra ||
    typeof authInfo.extra.subject !== 'string'
  ) {
    console.error('Auth info was', authInfo);
    throw Error('Auth Info missing');
  }
  return authInfo.extra.subject;
}

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
      const userId = getUserId(authInfo);

      const petState = createInitialPetState(name);
      await savePetState(userId, petState);

      return {
        content: [
          {
            type: 'text',
            text: `Say hello to ${name}`,
          },
        ],
        structuredContent: {
          petState,
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
      const userId = getUserId(authInfo);
      let petState = await getPetState(userId);

      if (!petState) {
        return {
          content: [
            {
              type: 'text',
              text: `You don't have any pets yet. Start a new game?`,
            },
          ],
          structuredContent: { petState },
        };
      }

      petState = updatePetState(petState);
      await savePetState(userId, petState);

      return {
        content: [
          {
            type: 'text',
            text: `Your pet is a ${petState.state}! Hunger: ${Math.round(petState.hunger)}, Happiness: ${Math.round(petState.happiness)}`,
          },
        ],
        structuredContent: {
          petState,
        },
      };
    }
  );

  server.registerTool(
    'pet-interact',
    {
      title: 'Interact with your pet',
      description: 'Feed or play with your pet to keep it happy and healthy',
      _meta: {
        'openai/outputTemplate': 'ui://widget/pet.html',
        'openai/toolInvocation/invoking': 'Interacting with your pet',
        'openai/toolInvocation/invoked': 'Your pet responds!',
        'openai/widgetAccessible': true,
      },
      inputSchema: {
        action: z.enum(['feed', 'play']).describe('The action to perform'),
      },
    },
    async ({ action }, { authInfo }) => {
      const userId = getUserId(authInfo);
      let petState = await getPetState(userId);

      if (!petState) {
        return {
          content: [{ type: 'text', text: 'You need to start a game first!' }],
          structuredContent: { petState },
        };
      }

      // Update state first
      petState = updatePetState(petState);

      // Can't interact with dead or complete pets
      if (petState.state === 'DEAD' || petState.state === 'COMPLETE') {
        return {
          content: [
            {
              type: 'text',
              text:
                petState.state === 'DEAD'
                  ? 'Your pet has died. Start a new game!'
                  : 'Your pet has grown up! Start a new game to raise another.',
            },
          ],
          structuredContent: {
            petState,
          },
        };
      }

      // Perform action
      if (action === 'feed') {
        petState.hunger = Math.min(100, petState.hunger + FEED_AMOUNT);
      } else {
        petState.happiness = Math.min(100, petState.happiness + PLAY_AMOUNT);
      }

      await savePetState(userId, petState);

      const actionText = action === 'feed' ? 'Fed' : 'Played with';
      return {
        content: [
          {
            type: 'text',
            text: `${actionText} your pet! Hunger: ${Math.round(petState.hunger)}, Happiness: ${Math.round(petState.happiness)}`,
          },
        ],
        structuredContent: {
          petState,
        },
      };
    }
  );

  return server;
}
