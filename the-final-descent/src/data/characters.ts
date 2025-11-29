/**
 * Character Data - All 6 heroes
 * From GDD Section 8.2
 */

import type { Character } from '../types/core';

export const CHARACTERS: Record<string, Character> = {
  dranick: {
    id: 'dranick',
    name: 'Dranick',
    role: 'tank',
    baseStats: {
      hp: 120,
      con: 9,
      spd: 2,
    },
    abilityIds: ['bonebreaker_mace', 'final_vow', 'undying_judgment'],
  },

  eline: {
    id: 'eline',
    name: 'Eline',
    role: 'scout',
    baseStats: {
      hp: 70,
      con: 8,
      spd: 6,
    },
    abilityIds: ['twin_thorns', 'burrow_buddy', 'marsh_ambush'],
  },

  varro: {
    id: 'varro',
    name: 'Varro',
    role: 'hybrid',
    baseStats: {
      hp: 90,
      con: 8,
      spd: 4,
    },
    abilityIds: ['arc_lash', 'spell_parry', 'gravemark_seal'],
  },

  kestril: {
    id: 'kestril',
    name: 'Kestril',
    role: 'support',
    baseStats: {
      hp: 80,
      con: 10,
      spd: 3,
    },
    abilityIds: ['future_flare', 'foresight_step', 'rewind_pulse'],
  },

  lira: {
    id: 'lira',
    name: 'Lira',
    role: 'healer',
    baseStats: {
      hp: 85,
      con: 9,
      spd: 5,
    },
    abilityIds: ['pressure_point_strike', 'breath', 'red_thread'],
  },

  grim: {
    id: 'grim',
    name: 'Grim',
    role: 'berserker',
    baseStats: {
      hp: 110,
      con: 6,
      spd: 3,
    },
    abilityIds: ['soilcrack_fist', 'fury_guard', 'relic_howl'],
  },
};

// Helper to get character by ID
export function getCharacter(id: string): Character {
  const character = CHARACTERS[id];
  if (!character) {
    throw new Error(`Character not found: ${id}`);
  }
  return character;
}

// Get all characters as array
export function getAllCharacters(): Character[] {
  return Object.values(CHARACTERS);
}

// Get random characters (for party selection)
export function getRandomCharacters(count: number, exclude: string[] = []): Character[] {
  const available = getAllCharacters().filter(c => !exclude.includes(c.id));

  if (available.length < count) {
    throw new Error(`Not enough characters available. Requested: ${count}, Available: ${available.length}`);
  }

  const selected: Character[] = [];
  const availableCopy = [...available];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * availableCopy.length);
    selected.push(availableCopy[randomIndex]);
    availableCopy.splice(randomIndex, 1);
  }

  return selected;
}
