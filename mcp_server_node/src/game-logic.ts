import type {
  PetState,
  PetSpecies,
  PetLifecycleState,
  AchievementState,
} from '../../shared-types/game-types.js';

// Re-export types and constants for convenience
export type {
  PetState,
  PetSpecies,
  PetLifecycleState,
  Achievement,
  AchievementState,
} from '../../shared-types/game-types.js';
export { ACHIEVEMENTS, SPECIES_EMOJIS } from '../../shared-types/game-types.js';

// Game constants
const MIN_STAT = 20;
const MAX_STAT = 100;
const OVERFED_THRESHOLD = 120;

const FOOD_EFFECTS: Record<
  string,
  { stamina: number; happiness: number; health: number }
> = {
  '🍎': { stamina: 5, happiness: 0, health: 5 },
  '🍪': { stamina: 5, happiness: 10, health: -10 },
  '🥗': { stamina: 15, happiness: -10, health: 15 },
  '🍕': { stamina: 30, happiness: 20, health: -15 },
};

const PLAY_EFFECTS: Record<
  string,
  { stamina: number; happiness: number; health: number }
> = {
  '🎮': { stamina: -5, happiness: 25, health: -10 },
  '🏃': { stamina: -15, happiness: 10, health: 25 },
  '🎿': { stamina: -20, happiness: 30, health: 15 },
};

export function createInitialPetState(name: string): PetState {
  // Randomly select a species
  const speciesOptions: PetSpecies[] = ['bird', 'cat', 'dog', 'lizard', 'fish'];
  const randomSpecies =
    speciesOptions[Math.floor(Math.random() * speciesOptions.length)];

  return {
    state: 'BABY',
    species: randomSpecies,
    name,
    stamina: 50,
    happiness: 50,
    health: 50,
    turn: 0,
  };
}

function getLifecycleState(turn: number): PetLifecycleState {
  if (turn <= 1) return 'BABY';
  if (turn <= 4) return 'CHILD';
  if (turn <= 8) return 'ADULT';
  return 'COMPLETE';
}

export function applyFoodAction(petState: PetState, food: string): PetState {
  const effects = FOOD_EFFECTS[food];
  if (!effects) {
    throw new Error(`Unknown food: ${food}`);
  }
  return applyAction(petState, effects, food);
}

export function applyPlayAction(
  petState: PetState,
  activity: string
): PetState {
  const effects = PLAY_EFFECTS[activity];
  if (!effects) {
    throw new Error(`Unknown activity: ${activity}`);
  }
  return applyAction(petState, effects, activity);
}

function applyAction(
  petState: PetState,
  effects: { stamina: number; happiness: number; health: number },
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
  const newStamina = petState.stamina + effects.stamina;
  const newHappiness = petState.happiness + effects.happiness;
  const newHealth = petState.health + effects.health;

  // Check overfed
  if (newStamina > OVERFED_THRESHOLD) {
    return {
      ...petState,
      state: 'DEAD',
      deathReason: 'Your pet exploded from overeating!',
    };
  }

  // Check skiing tree crash (deterministic randomness)
  if (emoji === '🎿') {
    const crashCheck = (petState.turn * 7 + Math.floor(petState.stamina)) % 4;
    if (crashCheck === 0) {
      return {
        ...petState,
        state: 'DEAD',
        deathReason: 'Your pet crashed into a tree while skiing!',
      };
    }
  }

  // Clamp stats
  const clampedStamina = Math.max(0, Math.min(MAX_STAT, newStamina));
  const clampedHappiness = Math.max(0, Math.min(MAX_STAT, newHappiness));
  const clampedHealth = Math.max(0, Math.min(MAX_STAT, newHealth));

  // Increment turn
  const newTurn = petState.turn + 1;

  // Check death from low stats
  if (clampedStamina < MIN_STAT) {
    return {
      ...petState,
      stamina: clampedStamina,
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
      stamina: clampedStamina,
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
      stamina: clampedStamina,
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
    stamina: clampedStamina,
    happiness: clampedHappiness,
    health: clampedHealth,
    turn: newTurn,
    state: newState,
  };
}

// Achievement detection
export function checkAchievements(
  petState: PetState,
  achievementState: AchievementState
): string[] {
  const newAchievements: string[] = [];
  const alreadyUnlocked = new Set(achievementState.unlockedAchievements);

  // Check species achievements (only when completing)
  if (petState.state === 'COMPLETE') {
    const speciesAchievement = `species_${petState.species}`;
    if (!alreadyUnlocked.has(speciesAchievement)) {
      newAchievements.push(speciesAchievement);
    }
  }

  // Check death achievements
  if (petState.state === 'DEAD' && petState.deathReason) {
    let deathAchievement: string | null = null;

    if (petState.deathReason.includes('starved')) {
      deathAchievement = 'death_starved';
    } else if (petState.deathReason.includes('sadness')) {
      deathAchievement = 'death_sadness';
    } else if (petState.deathReason.includes('health')) {
      deathAchievement = 'death_health';
    } else if (petState.deathReason.includes('crashed into a tree')) {
      deathAchievement = 'death_skiing';
    } else if (petState.deathReason.includes('overeating')) {
      deathAchievement = 'death_overeating';
    } else if (petState.deathReason.includes("baby shouldn't be on the slopes")) {
      deathAchievement = 'death_baby_skiing';
    }

    if (deathAchievement && !alreadyUnlocked.has(deathAchievement)) {
      newAchievements.push(deathAchievement);
    }
  }

  return newAchievements;
}

export function createInitialAchievementState(): AchievementState {
  return {
    unlockedAchievements: [],
  };
}
