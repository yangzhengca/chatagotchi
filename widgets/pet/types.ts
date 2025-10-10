// Import shared types
export type {
  PetLifecycleState,
  PetSpecies,
  PetState,
} from '../../shared-types/game-types.js';
export { SPECIES_EMOJIS } from '../../shared-types/game-types.js';

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
