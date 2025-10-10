// Pet state types
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

// Achievement types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

export interface AchievementState {
  unlockedAchievements: string[];
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'species_bird',
    title: 'Bird Whisperer',
    description: 'Raise a bird to adulthood',
    emoji: '🐔',
  },
  {
    id: 'species_cat',
    title: 'Cat Person',
    description: 'Raise a cat to adulthood',
    emoji: '🐯',
  },
  {
    id: 'species_dog',
    title: 'Dog Lover',
    description: 'Raise a dog to adulthood',
    emoji: '🐺',
  },
  {
    id: 'species_lizard',
    title: 'Dragon Tamer',
    description: 'Raise a lizard to adulthood',
    emoji: '🐉',
  },
  {
    id: 'species_fish',
    title: 'Marine Biologist',
    description: 'Raise a fish to adulthood',
    emoji: '🦈',
  },
  {
    id: 'death_starved',
    title: 'Hunger Strike',
    description: 'Experience death by starvation',
    emoji: '🍽️',
  },
  {
    id: 'death_sadness',
    title: 'Heartbreak',
    description: 'Experience death by sadness',
    emoji: '😢',
  },
  {
    id: 'death_health',
    title: 'Medical Mystery',
    description: 'Experience death by poor health',
    emoji: '🏥',
  },
  {
    id: 'death_skiing',
    title: 'Tree Hugger',
    description: 'Discover the skiing accident',
    emoji: '🎿',
  },
  {
    id: 'death_overeating',
    title: 'Glutton',
    description: 'Discover death by overeating',
    emoji: '🍕',
  },
  {
    id: 'death_baby_skiing',
    title: 'Bad Parenting',
    description: 'Take a baby skiing',
    emoji: '👶',
  },
];
