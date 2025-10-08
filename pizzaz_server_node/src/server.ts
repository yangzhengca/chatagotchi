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
  health: number; // 0-100
  turn: number;
  deathReason?: string;
}

// Game constants
const MIN_STAT = 20;
const MAX_STAT = 100;
const OVERFED_THRESHOLD = 120;

const FOOD_EFFECTS: Record<string, { hunger: number; happiness: number; health: number }> = {
  '🍎': { hunger: 25, happiness: 5, health: 15 },
  '🍪': { hunger: 20, happiness: 20, health: -10 },
  '🥗': { hunger: 15, happiness: -5, health: 25 },
  '🍕': { hunger: 30, happiness: 15, health: -5 },
};

const PLAY_EFFECTS: Record<string, { hunger: number; happiness: number; health: number }> = {
  '🎮': { hunger: -5, happiness: 25, health: -10 },
  '🏃': { hunger: -15, happiness: 10, health: 25 },
  '🎿': { hunger: -20, happiness: 30, health: 15 },
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
  return {
    state: 'BABY',
    name,
    hunger: 50,
    happiness: 50,
    health: 50,
    turn: 0,
  };
}

function getLifecycleState(turn: number): PetLifecycleState {
  if (turn <= 1) return 'BABY';
  if (turn <= 3) return 'CHILD';
  if (turn <= 5) return 'ADULT';
  return 'COMPLETE';
}

function applyAction(
  petState: PetState,
  effects: { hunger: number; happiness: number; health: number },
  actionType: 'food' | 'play',
  emoji: string
): PetState {
  // Check if already dead or complete
  if (petState.state === 'DEAD' || petState.state === 'COMPLETE') {
    return petState;
  }

  // Check baby skiing
  if (emoji === '🎿' && petState.state === 'BABY') {
    return {
      ...petState,
      state: 'DEAD',
      deathReason: "Your baby shouldn't be on the slopes!",
    };
  }

  // Apply stat changes (before clamping)
  const newHunger = petState.hunger + effects.hunger;
  const newHappiness = petState.happiness + effects.happiness;
  const newHealth = petState.health + effects.health;

  // Check overfed
  if (newHunger > OVERFED_THRESHOLD) {
    return {
      ...petState,
      state: 'DEAD',
      deathReason: 'Your pet exploded from overeating!',
    };
  }

  // Check skiing tree crash (deterministic randomness)
  if (emoji === '🎿') {
    const crashCheck = (petState.turn * 7 + Math.floor(petState.hunger)) % 4;
    if (crashCheck === 0) {
      return {
        ...petState,
        state: 'DEAD',
        deathReason: 'Your pet crashed into a tree while skiing!',
      };
    }
  }

  // Clamp stats
  const clampedHunger = Math.max(0, Math.min(MAX_STAT, newHunger));
  const clampedHappiness = Math.max(0, Math.min(MAX_STAT, newHappiness));
  const clampedHealth = Math.max(0, Math.min(MAX_STAT, newHealth));

  // Increment turn
  const newTurn = petState.turn + 1;

  // Check death from low stats
  if (clampedHunger < MIN_STAT) {
    return {
      ...petState,
      hunger: clampedHunger,
      happiness: clampedHappiness,
      health: clampedHealth,
      turn: newTurn,
      state: 'DEAD',
      deathReason: 'Your pet starved to death',
    };
  }
  if (clampedHappiness < MIN_STAT) {
    return {
      ...petState,
      hunger: clampedHunger,
      happiness: clampedHappiness,
      health: clampedHealth,
      turn: newTurn,
      state: 'DEAD',
      deathReason: 'Your pet died of sadness',
    };
  }
  if (clampedHealth < MIN_STAT) {
    return {
      ...petState,
      hunger: clampedHunger,
      happiness: clampedHappiness,
      health: clampedHealth,
      turn: newTurn,
      state: 'DEAD',
      deathReason: 'Your pet died from poor health',
    };
  }

  // Determine new lifecycle state
  const newState = getLifecycleState(newTurn);

  return {
    ...petState,
    hunger: clampedHunger,
    happiness: clampedHappiness,
    health: clampedHealth,
    turn: newTurn,
    state: newState,
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
      const petState = await getPetState(userId);

      if (!petState) {
        return {
          content: [
            {
              type: 'text',
              text: `You don't have any pets yet. Start a new game?`,
            },
          ],
          structuredContent: { petState: null },
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Your pet ${petState.name} is a ${petState.state}! Turn: ${petState.turn}/6`,
          },
        ],
        structuredContent: {
          petState,
        },
      };
    }
  );

  server.registerTool(
    'pet-feed',
    {
      title: 'Feed your pet',
      description: 'Feed your pet with 🍎 Apple, 🍪 Cookie, 🥗 Salad, or 🍕 Pizza',
      _meta: {
        'openai/outputTemplate': 'ui://widget/pet.html',
        'openai/toolInvocation/invoking': 'Feeding your pet',
        'openai/toolInvocation/invoked': 'Your pet ate!',
        'openai/widgetAccessible': true,
      },
      inputSchema: {
        food: z.enum(['🍎', '🍪', '🥗', '🍕']).describe('The food to feed'),
      },
    },
    async ({ food }, { authInfo }) => {
      const userId = getUserId(authInfo);
      let petState = await getPetState(userId);

      if (!petState) {
        return {
          content: [{ type: 'text', text: 'You need to start a game first!' }],
          structuredContent: { petState: null },
        };
      }

      if (petState.state === 'DEAD' || petState.state === 'COMPLETE') {
        return {
          content: [
            {
              type: 'text',
              text:
                petState.state === 'DEAD'
                  ? `Your pet died! ${petState.deathReason || ''}`
                  : 'Your pet has grown up! Start a new game to raise another.',
            },
          ],
          structuredContent: { petState },
        };
      }

      const effects = FOOD_EFFECTS[food];
      petState = applyAction(petState, effects, 'food', food);
      await savePetState(userId, petState);

      if (petState.state === 'DEAD') {
        return {
          content: [
            {
              type: 'text',
              text: `Oh no! ${petState.deathReason}`,
            },
          ],
          structuredContent: { petState, lastAction: { type: 'food', emoji: food } },
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Fed ${petState.name} ${food}! Turn ${petState.turn}/6`,
          },
        ],
        structuredContent: { petState, lastAction: { type: 'food', emoji: food } },
      };
    }
  );

  server.registerTool(
    'pet-play',
    {
      title: 'Play with your pet',
      description: 'Play with your pet: 🎮 Video Games, 🏃 Go for Run, or 🎿 Skiing in Alps',
      _meta: {
        'openai/outputTemplate': 'ui://widget/pet.html',
        'openai/toolInvocation/invoking': 'Playing with your pet',
        'openai/toolInvocation/invoked': 'Your pet had fun!',
        'openai/widgetAccessible': true,
      },
      inputSchema: {
        activity: z.enum(['🎮', '🏃', '🎿']).describe('The activity to do'),
      },
    },
    async ({ activity }, { authInfo }) => {
      const userId = getUserId(authInfo);
      let petState = await getPetState(userId);

      if (!petState) {
        return {
          content: [{ type: 'text', text: 'You need to start a game first!' }],
          structuredContent: { petState: null },
        };
      }

      if (petState.state === 'DEAD' || petState.state === 'COMPLETE') {
        return {
          content: [
            {
              type: 'text',
              text:
                petState.state === 'DEAD'
                  ? `Your pet died! ${petState.deathReason || ''}`
                  : 'Your pet has grown up! Start a new game to raise another.',
            },
          ],
          structuredContent: { petState },
        };
      }

      const effects = PLAY_EFFECTS[activity];
      petState = applyAction(petState, effects, 'play', activity);
      await savePetState(userId, petState);

      if (petState.state === 'DEAD') {
        return {
          content: [
            {
              type: 'text',
              text: `Oh no! ${petState.deathReason}`,
            },
          ],
          structuredContent: { petState, lastAction: { type: 'play', emoji: activity } },
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `${petState.name} did ${activity}! Turn ${petState.turn}/6`,
          },
        ],
        structuredContent: { petState, lastAction: { type: 'play', emoji: activity } },
      };
    }
  );

  return server;
}
