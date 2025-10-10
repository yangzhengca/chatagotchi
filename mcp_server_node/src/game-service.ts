import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { getUserTrustedMetadata, updateUserTrustedMetadata } from './stytch.js';
import {
  type PetState,
  type AchievementState,
  type Achievement,
  createInitialPetState,
  applyFoodAction,
  applyPlayAction,
  checkAchievements,
  createInitialAchievementState,
  ACHIEVEMENTS,
} from './game-logic.js';

export interface GameServiceResult {
  petState: PetState;
  newAchievements: string[];
  message: string;
  achievementText?: string;
}

export class GameService {
  private userId: string;

  constructor(authInfo?: AuthInfo) {
    if (
      !authInfo ||
      !authInfo.extra ||
      typeof authInfo.extra.subject !== 'string'
    ) {
      console.error('Auth info was', authInfo);
      throw Error('Auth Info missing');
    }
    this.userId = authInfo.extra.subject;
  }

  private async getGameState(): Promise<{
    petState: PetState | null;
    achievementState: AchievementState;
  }> {
    const metadata = await getUserTrustedMetadata(this.userId);
    const petState = (metadata.petState as PetState | undefined) || null;
    const achievementState =
      (metadata.achievementState as AchievementState | undefined) ||
      createInitialAchievementState();
    return { petState, achievementState };
  }

  private async saveGameState(
    petState: PetState | null,
    achievementState: AchievementState
  ): Promise<void> {
    await updateUserTrustedMetadata(this.userId, {
      petState,
      achievementState,
    });
  }

  private formatAchievementText(achievementIds: string[]): string {
    if (achievementIds.length === 0) return '';
    const emojis = achievementIds
      .map((id) => ACHIEVEMENTS.find((a) => a.id === id)?.emoji)
      .filter(Boolean)
      .join(' ');
    return `\n\nAchievement Unlocked! ${emojis}`;
  }

  private generateMessage(
    petState: PetState,
    action: string,
    newAchievements: string[]
  ): string {
    const achievementText = this.formatAchievementText(newAchievements);

    if (petState.state === 'DEAD') {
      return `Oh no! ${petState.deathReason}${achievementText}`;
    }

    if (petState.state === 'COMPLETE') {
      return `Congratulations! ${petState.name} has grown up!${achievementText}`;
    }

    return `${action}${achievementText}`;
  }

  async startNewGame(petName: string): Promise<GameServiceResult> {
    const { achievementState } = await this.getGameState();

    const petState = createInitialPetState(petName);
    await this.saveGameState(petState, achievementState);

    return {
      petState,
      newAchievements: [],
      message: `Say hello to ${petName}`,
    };
  }

  async feedPet(food: string): Promise<GameServiceResult | null> {
    let { petState, achievementState } = await this.getGameState();

    if (!petState) {
      return null;
    }

    if (petState.state === 'DEAD') {
      return {
        petState,
        newAchievements: [],
        message: `Your pet died! ${petState.deathReason || ''}`,
      };
    }

    if (petState.state === 'COMPLETE') {
      return {
        petState,
        newAchievements: [],
        message: 'Your pet has grown up! Start a new game to raise another.',
      };
    }

    petState = applyFoodAction(petState, food);

    // Check for achievement unlocks
    const newAchievements = checkAchievements(petState, achievementState);
    if (newAchievements.length > 0) {
      achievementState.unlockedAchievements.push(...newAchievements);
    }

    await this.saveGameState(petState, achievementState);

    return {
      petState,
      newAchievements,
      message: this.generateMessage(
        petState,
        `Fed ${petState.name} ${food}!`,
        newAchievements
      ),
      achievementText:
        newAchievements.length > 0
          ? this.formatAchievementText(newAchievements)
          : undefined,
    };
  }

  async playWithPet(activity: string): Promise<GameServiceResult | null> {
    let { petState, achievementState } = await this.getGameState();

    if (!petState) {
      return null;
    }

    if (petState.state === 'DEAD') {
      return {
        petState,
        newAchievements: [],
        message: `Your pet died! ${petState.deathReason || ''}`,
      };
    }

    if (petState.state === 'COMPLETE') {
      return {
        petState,
        newAchievements: [],
        message: 'Your pet has grown up! Start a new game to raise another.',
      };
    }

    petState = applyPlayAction(petState, activity);

    // Check for achievement unlocks
    const newAchievements = checkAchievements(petState, achievementState);
    if (newAchievements.length > 0) {
      achievementState.unlockedAchievements.push(...newAchievements);
    }

    await this.saveGameState(petState, achievementState);

    return {
      petState,
      newAchievements,
      message: this.generateMessage(
        petState,
        `${petState.name} did ${activity}!`,
        newAchievements
      ),
      achievementText:
        newAchievements.length > 0
          ? this.formatAchievementText(newAchievements)
          : undefined,
    };
  }

  async getAchievements(): Promise<{
    achievements: Achievement[];
    unlockedAchievements: string[];
    unlockedCount: number;
    totalCount: number;
  }> {
    const { achievementState } = await this.getGameState();

    return {
      achievements: ACHIEVEMENTS,
      unlockedAchievements: achievementState.unlockedAchievements,
      unlockedCount: achievementState.unlockedAchievements.length,
      totalCount: ACHIEVEMENTS.length,
    };
  }
}
