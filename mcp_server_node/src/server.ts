import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { z } from 'zod';
import { getUserTrustedMetadata, updateUserTrustedMetadata } from './stytch.js';
import {
  type PetState,
  type AchievementState,
  createInitialPetState,
  applyFoodAction,
  applyPlayAction,
  checkAchievements,
  createInitialAchievementState,
  ACHIEVEMENTS,
} from './game-logic.js';

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

async function getAchievementState(userId: string): Promise<AchievementState> {
  const metadata = await getUserTrustedMetadata(userId);
  const achievementState = metadata.achievementState as
    | AchievementState
    | undefined;
  return achievementState || createInitialAchievementState();
}

async function saveAchievementState(
  userId: string,
  achievementState: AchievementState
): Promise<void> {
  const metadata = await getUserTrustedMetadata(userId);
  await updateUserTrustedMetadata(userId, {
    ...metadata,
    achievementState,
  });
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

  server.registerPrompt('new-game', { title: 'Start a new game' }, () => ({
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Let's start a brand new chatagotchi game`,
        },
      },
    ],
  }));

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
          _meta: {
            'openai/widgetDescription':
              "Renders a micro-UI showing the user's pet status.",
          },
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
    'pet-feed',
    {
      title: 'Feed your pet',
      description:
        'Feed your pet with 🍎 Apple, 🍪 Cookie, 🥗 Salad, or 🍕 Pizza',
      _meta: {
        'openai/outputTemplate': 'ui://widget/pet.html',
        'openai/toolInvocation/invoking': 'Feeding your pet',
        'openai/toolInvocation/invoked': 'Fed your pet!',
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

      petState = applyFoodAction(petState, food);
      await savePetState(userId, petState);

      // Check for achievement unlocks
      const achievementState = await getAchievementState(userId);
      const newAchievements = checkAchievements(petState, achievementState);
      if (newAchievements.length > 0) {
        achievementState.unlockedAchievements.push(...newAchievements);
        await saveAchievementState(userId, achievementState);
      }

      if (petState.state === 'DEAD') {
        const achievementText =
          newAchievements.length > 0
            ? `\n\nAchievement Unlocked! ${newAchievements.map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.emoji).join(' ')}`
            : '';
        return {
          content: [
            {
              type: 'text',
              text: `Oh no! ${petState.deathReason}${achievementText}`,
            },
          ],
          structuredContent: {
            petState,
            lastAction: { type: 'food', emoji: food },
          },
        };
      }

      if (petState.state === 'COMPLETE') {
        const achievementText =
          newAchievements.length > 0
            ? `\n\nAchievement Unlocked! ${newAchievements.map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.emoji).join(' ')}`
            : '';
        return {
          content: [
            {
              type: 'text',
              text: `Congratulations! ${petState.name} has grown up!${achievementText}`,
            },
          ],
          structuredContent: {
            petState,
            lastAction: { type: 'food', emoji: food },
          },
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `Fed ${petState.name} ${food}! Turn ${petState.turn}/6`,
          },
        ],
        structuredContent: {
          petState,
          lastAction: { type: 'food', emoji: food },
        },
      };
    }
  );

  server.registerTool(
    'pet-play',
    {
      title: 'Play with your pet',
      description:
        'Play with your pet: 🎮 Video Games, 🏃 Go for Run, or 🎿 Skiing in Alps',
      _meta: {
        'openai/outputTemplate': 'ui://widget/pet.html',
        'openai/toolInvocation/invoking': 'Playing with your pet',
        'openai/toolInvocation/invoked': 'Played with your pet!',
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

      petState = applyPlayAction(petState, activity);
      await savePetState(userId, petState);

      // Check for achievement unlocks
      const achievementState = await getAchievementState(userId);
      const newAchievements = checkAchievements(petState, achievementState);
      if (newAchievements.length > 0) {
        achievementState.unlockedAchievements.push(...newAchievements);
        await saveAchievementState(userId, achievementState);
      }

      if (petState.state === 'DEAD') {
        const achievementText =
          newAchievements.length > 0
            ? `\n\nAchievement Unlocked! ${newAchievements.map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.emoji).join(' ')}`
            : '';
        return {
          content: [
            {
              type: 'text',
              text: `Oh no! ${petState.deathReason}${achievementText}`,
            },
          ],
          structuredContent: {
            petState,
            lastAction: { type: 'play', emoji: activity },
          },
        };
      }

      if (petState.state === 'COMPLETE') {
        const achievementText =
          newAchievements.length > 0
            ? `\n\nAchievement Unlocked! ${newAchievements.map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.emoji).join(' ')}`
            : '';
        return {
          content: [
            {
              type: 'text',
              text: `Congratulations! ${petState.name} has grown up!${achievementText}`,
            },
          ],
          structuredContent: {
            petState,
            lastAction: { type: 'play', emoji: activity },
          },
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `${petState.name} did ${activity}! Turn ${petState.turn}/6`,
          },
        ],
        structuredContent: {
          petState,
          lastAction: { type: 'play', emoji: activity },
        },
      };
    }
  );

  server.registerResource(
    'achievements-widget',
    'ui://widget/achievements.html',
    {},
    () => {
      return {
        contents: [
          {
            uri: 'ui://widget/achievements.html',
            mimeType: 'text/html+skybridge',
            text: `
            <div id="achievements-root"></div>
            <link rel="stylesheet" href="https://chatagotchi-jet.vercel.app/achievements.css">
            <script type="module" src="https://chatagotchi-jet.vercel.app/achievements.js"></script>
          `.trim(),
            _meta: {
              'openai/widgetDescription':
                "Renders a micro-UI showing the user's achievements.",
            },
          },
        ],
      };
    }
  );

  server.registerTool(
    'achievements',
    {
      title: 'View Achievements',
      description: 'View all your unlocked and locked achievements',
      _meta: {
        'openai/outputTemplate': 'ui://widget/achievements.html',
        'openai/toolInvocation/invoking': 'Loading your achievements',
        'openai/toolInvocation/invoked': 'Here are your achievements!',
        'openai/widgetAccessible': true,
      },
      inputSchema: {},
    },
    async (_input, { authInfo }) => {
      const userId = getUserId(authInfo);
      const achievementState = await getAchievementState(userId);

      const unlockedCount = achievementState.unlockedAchievements.length;
      const totalCount = ACHIEVEMENTS.length;

      return {
        content: [
          {
            type: 'text',
            text: `You've unlocked ${unlockedCount} out of ${totalCount} achievements!`,
          },
        ],
        structuredContent: {
          achievements: ACHIEVEMENTS,
          unlockedAchievements: achievementState.unlockedAchievements,
        },
      };
    }
  );

  return server;
}
