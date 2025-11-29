/**
 * Ability Data - All single character abilities
 * From GDD Section 2.2
 */

import type { Ability } from '../types/core';

export const ABILITIES: Record<string, Ability> = {
  // ============================================================================
  // DRANICK - Tank/Support
  // ============================================================================

  bonebreaker_mace: {
    id: 'bonebreaker_mace',
    name: 'Bonebreaker Mace',
    abilityType: 'standard',
    owners: ['dranick'],
    spCost: 3,
    speedMod: 2,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 12,
        statusEffects: [
          { statusId: 'fractured', duration: 2, magnitude: 2 }
        ],
      },
    ],
    tags: ['physical', 'debuff'],
  },

  final_vow: {
    id: 'final_vow',
    name: 'Final Vow',
    abilityType: 'standard',
    owners: ['dranick'],
    spCost: 4,
    speedMod: 0,
    cooldown: 2,
    targetType: 'self',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        statusEffects: [
          { statusId: 'aegis', duration: 99, magnitude: 30 }, // Duration 99 = until broken
          { statusId: 'taunt', duration: 2, magnitude: 1 },
        ],
      },
    ],
    tags: ['defensive', 'taunt'],
  },

  undying_judgment: {
    id: 'undying_judgment',
    name: 'Undying Judgment',
    abilityType: 'special',
    owners: ['dranick'],
    spCost: 7,
    speedMod: -1,
    cooldown: 3,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'mixed',
        setValue: 20,
        specialMechanic: 'heal_lowest_ally_50_percent_damage',
      },
    ],
    tags: ['aoe', 'healing'],
  },

  // ============================================================================
  // ELINE - Scout/Control
  // ============================================================================

  twin_thorns: {
    id: 'twin_thorns',
    name: 'Twin Thorns',
    abilityType: 'standard',
    owners: ['eline'],
    spCost: 2,
    speedMod: 4,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 8,
        specialMechanic: 'hit_twice',
        statusEffects: [
          { statusId: 'poison', duration: 3, magnitude: 3 },
        ],
      },
    ],
    tags: ['physical', 'multi-hit', 'dot'],
  },

  burrow_buddy: {
    id: 'burrow_buddy',
    name: 'Burrow Buddy',
    abilityType: 'standard',
    owners: ['eline'],
    spCost: 3,
    speedMod: 5,
    cooldown: 1,
    targetType: 'single_ally',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        statusEffects: [
          { statusId: 'evasion', duration: 2, magnitude: 50 },
        ],
      },
    ],
    tags: ['defensive', 'buff'],
  },

  marsh_ambush: {
    id: 'marsh_ambush',
    name: 'Marsh Ambush',
    abilityType: 'special',
    owners: ['eline'],
    spCost: 6,
    speedMod: 1,
    cooldown: 3,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 15,
        statusEffects: [
          { statusId: 'rooted', duration: 2, magnitude: 1 },
        ],
      },
    ],
    tags: ['aoe', 'debuff'],
  },

  // ============================================================================
  // VARRO - Balanced/Hybrid
  // ============================================================================

  arc_lash: {
    id: 'arc_lash',
    name: 'Arc Lash',
    abilityType: 'standard',
    owners: ['varro'],
    spCost: 3,
    speedMod: 3,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 10,
        specialMechanic: 'chain_50_percent',
      },
    ],
    tags: ['magic', 'chain'],
  },

  spell_parry: {
    id: 'spell_parry',
    name: 'Spell Parry',
    abilityType: 'standard',
    owners: ['varro'],
    spCost: 2,
    speedMod: 2,
    cooldown: 1,
    targetType: 'self',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        statusEffects: [
          { statusId: 'reflect', duration: 2, magnitude: 50 },
        ],
      },
    ],
    tags: ['defensive', 'buff'],
  },

  gravemark_seal: {
    id: 'gravemark_seal',
    name: 'Gravemark Seal',
    abilityType: 'special',
    owners: ['varro'],
    spCost: 6,
    speedMod: -1,
    cooldown: 3,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 18,
        statusEffects: [
          { statusId: 'sealed', duration: 2, magnitude: 1 },
        ],
      },
    ],
    tags: ['magic', 'debuff'],
  },

  // ============================================================================
  // KESTRIL - Tactical Support
  // ============================================================================

  future_flare: {
    id: 'future_flare',
    name: 'Future Flare',
    abilityType: 'standard',
    owners: ['kestril'],
    spCost: 3,
    speedMod: 2,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 9,
        specialMechanic: 'reveal_enemy_next_action',
      },
    ],
    tags: ['magic', 'utility'],
  },

  foresight_step: {
    id: 'foresight_step',
    name: 'Foresight Step',
    abilityType: 'standard',
    owners: ['kestril'],
    spCost: 2,
    speedMod: 6,
    cooldown: 1,
    targetType: 'single_ally',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        statusEffects: [
          { statusId: 'haste', duration: 2, magnitude: 4 },
        ],
        specialMechanic: 'remove_1_debuff',
      },
    ],
    tags: ['buff', 'cleanse'],
  },

  rewind_pulse: {
    id: 'rewind_pulse',
    name: 'Rewind Pulse',
    abilityType: 'special',
    owners: ['kestril'],
    spCost: 5,
    speedMod: 0,
    cooldown: 4,
    targetType: 'all_allies',
    effects: [
      {
        type: 'mixed',
        setValue: 15, // Heal amount
        specialMechanic: 'reset_all_cooldowns',
      },
    ],
    tags: ['utility', 'healing'],
  },

  // ============================================================================
  // LIRA - Healer/Striker
  // ============================================================================

  pressure_point_strike: {
    id: 'pressure_point_strike',
    name: 'Pressure Point Strike',
    abilityType: 'standard',
    owners: ['lira'],
    spCost: 2,
    speedMod: 5,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 7,
        statusEffects: [
          { statusId: 'weakened', duration: 2, magnitude: 3 },
        ],
      },
    ],
    tags: ['physical', 'debuff'],
  },

  breath: {
    id: 'breath',
    name: 'Breath',
    abilityType: 'standard',
    owners: ['lira'],
    spCost: 3,
    speedMod: 3,
    cooldown: 1,
    targetType: 'single_ally',
    effects: [
      {
        type: 'heal',
        setValue: 12,
        specialMechanic: 'remove_all_debuffs',
      },
    ],
    tags: ['healing', 'cleanse'],
  },

  red_thread: {
    id: 'red_thread',
    name: 'Red Thread',
    abilityType: 'special',
    owners: ['lira'],
    spCost: 5,
    speedMod: 1,
    cooldown: 2,
    targetType: 'all_allies',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        statusEffects: [
          { statusId: 'linked', duration: 3, magnitude: 25 }, // 25% damage sharing
        ],
      },
    ],
    tags: ['defensive', 'buff'],
  },

  // ============================================================================
  // GRIM - Berserker/Damage
  // ============================================================================

  soilcrack_fist: {
    id: 'soilcrack_fist',
    name: 'Soilcrack Fist',
    abilityType: 'standard',
    owners: ['grim'],
    spCost: 4,
    speedMod: 1,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 16,
        specialMechanic: 'stun_if_below_30_percent_hp',
      },
    ],
    tags: ['physical', 'conditional'],
  },

  fury_guard: {
    id: 'fury_guard',
    name: 'Fury Guard',
    abilityType: 'standard',
    owners: ['grim'],
    spCost: 2,
    speedMod: 0,
    cooldown: 1,
    targetType: 'self',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        specialMechanic: 'gain_3_con_if_below_50_percent_hp',
        statusEffects: [
          { statusId: 'empowered', duration: 3, magnitude: 3 },
        ],
      },
    ],
    tags: ['buff', 'conditional'],
  },

  relic_howl: {
    id: 'relic_howl',
    name: 'Relic Howl',
    abilityType: 'special',
    owners: ['grim'],
    spCost: 6,
    speedMod: -2,
    cooldown: 3,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 22,
        statusEffects: [
          { statusId: 'terrified', duration: 2, magnitude: 1 },
        ],
      },
    ],
    tags: ['aoe', 'debuff'],
  },
};

// Helper to get ability by ID
export function getAbility(id: string): Ability {
  const ability = ABILITIES[id];
  if (!ability) {
    throw new Error(`Ability not found: ${id}`);
  }
  return ability;
}

// Get all abilities as array
export function getAllAbilities(): Ability[] {
  return Object.values(ABILITIES);
}

// Get abilities for a specific character
export function getCharacterAbilities(characterId: string): Ability[] {
  return getAllAbilities().filter(ability =>
    ability.owners.length === 1 && ability.owners[0] === characterId
  );
}
