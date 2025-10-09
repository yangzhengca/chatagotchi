// Pet state types
export type PetLifecycleState = 'BABY' | 'CHILD' | 'ADULT' | 'DEAD' | 'COMPLETE';
export type PetSpecies = 'bird' | 'cat' | 'dog' | 'lizard' | 'fish';

export interface PetState {
  state: PetLifecycleState;
  species: PetSpecies;
  name: string;
  hunger: number; // 0-100
  happiness: number; // 0-100
  health: number; // 0-100
  turn: number;
  deathReason?: string;
}

export const SPECIES_EMOJIS: Record<PetSpecies, Record<PetLifecycleState, string>> = {
  bird: {
    BABY: '🐣',
    CHILD: '🐥',
    ADULT: '🐔',
    DEAD: '💀',
    COMPLETE: '🏆',
  },
  cat: {
    BABY: '🐱',
    CHILD: '🐈',
    ADULT: '🐯',
    DEAD: '💀',
    COMPLETE: '🏆',
  },
  dog: {
    BABY: '🐶',
    CHILD: '🐕',
    ADULT: '🐺',
    DEAD: '💀',
    COMPLETE: '🏆',
  },
  lizard: {
    BABY: '🦎',
    CHILD: '🐊',
    ADULT: '🐉',
    DEAD: '💀',
    COMPLETE: '🏆',
  },
  fish: {
    BABY: '🐟',
    CHILD: '🐠',
    ADULT: '🦈',
    DEAD: '💀',
    COMPLETE: '🏆',
  },
};

// Game constants
const MIN_STAT = 20;
const MAX_STAT = 100;
const OVERFED_THRESHOLD = 120;

const FOOD_EFFECTS: Record<
  string,
  { hunger: number; happiness: number; health: number }
> = {
  '🍎': { hunger: 25, happiness: 5, health: 15 },
  '🍪': { hunger: 20, happiness: 20, health: -10 },
  '🥗': { hunger: 15, happiness: -5, health: 25 },
  '🍕': { hunger: 30, happiness: 15, health: -5 },
};

const PLAY_EFFECTS: Record<
  string,
  { hunger: number; happiness: number; health: number }
> = {
  '🎮': { hunger: -5, happiness: 25, health: -10 },
  '🏃': { hunger: -15, happiness: 10, health: 25 },
  '🎿': { hunger: -20, happiness: 30, health: 15 },
};

export function createInitialPetState(name: string): PetState {
  // Randomly select a species
  const speciesOptions: PetSpecies[] = ['bird', 'cat', 'dog', 'lizard', 'fish'];
  const randomSpecies = speciesOptions[Math.floor(Math.random() * speciesOptions.length)];

  return {
    state: 'BABY',
    species: randomSpecies,
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

export function applyFoodAction(petState: PetState, food: string): PetState {
  const effects = FOOD_EFFECTS[food];
  if (!effects) {
    throw new Error(`Unknown food: ${food}`);
  }
  return applyAction(petState, effects, food);
}

export function applyPlayAction(petState: PetState, activity: string): PetState {
  const effects = PLAY_EFFECTS[activity];
  if (!effects) {
    throw new Error(`Unknown activity: ${activity}`);
  }
  return applyAction(petState, effects, activity);
}

function applyAction(
  petState: PetState,
  effects: { hunger: number; happiness: number; health: number },
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
