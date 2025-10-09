export type PetLifecycleState =
  | 'BABY'
  | 'CHILD'
  | 'ADULT'
  | 'DEAD'
  | 'COMPLETE';

export type PetSpecies = 'bird' | 'cat' | 'dog' | 'lizard' | 'fish';

export interface PetState {
  state: PetLifecycleState;
  species: PetSpecies;
  name: string;
  stamina: number; // 0-100
  happiness: number; // 0-100
  health: number; // 0-100
  turn: number;
  deathReason?: string;
}

export const SPECIES_EMOJIS: Record<
  PetSpecies,
  Record<PetLifecycleState, string>
> = {
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

export const FOOD_OPTIONS = [
  { emoji: '🍎', name: 'Apple', desc: 'Healthy and filling' },
  { emoji: '🍪', name: 'Cookie', desc: 'Sweet treat' },
  { emoji: '🥗', name: 'Salad', desc: 'Very healthy' },
  { emoji: '🍕', name: 'Pizza', desc: 'Tasty junk food' },
];

export const PLAY_OPTIONS = [
  { emoji: '🎮', name: 'Video Games', desc: 'Fun but sedentary' },
  { emoji: '🏃', name: 'Go for Run', desc: 'Exhausting but healthy' },
  { emoji: '🎿', name: 'Skiing', desc: 'Amazing adventure!' },
];
