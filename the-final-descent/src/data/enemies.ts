/**
 * Enemy Data - Common enemies and bosses
 * From GDD Section 3
 */

import type { Enemy } from '../types/core';

// ============================================================================
// Common Enemies
// ============================================================================

export const COMMON_ENEMIES: Record<string, Enemy> = {
  writhing_shadow: {
    id: 'writhing_shadow',
    name: 'Writhing Shadow',
    baseStats: {
      hp: 40,
      con: 6,
      spd: 5,
    },
    abilityIds: ['enemy_shadow_strike', 'enemy_fade'],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 3.0, healing: 0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 0, buff: 0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 0, highDamage: 2.0, normal: 1.0 },
        default: { offensive: 2.0, defensive: 1.0 },
      },
    },
    isBoss: false,
  },

  stone_sentinel: {
    id: 'stone_sentinel',
    name: 'Stone Sentinel',
    baseStats: {
      hp: 80,
      con: 4,
      spd: 2,
    },
    abilityIds: ['enemy_crushing_blow', 'enemy_fortify'],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 4.0, healing: 0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 0, buff: 3.0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 0, highDamage: 1.0, normal: 1.0 },
        default: { offensive: 1.5, defensive: 2.0 },
      },
    },
    isBoss: false,
  },

  corrupted_healer: {
    id: 'corrupted_healer',
    name: 'Corrupted Healer',
    baseStats: {
      hp: 50,
      con: 7,
      spd: 3,
    },
    abilityIds: ['enemy_dark_mend', 'enemy_siphon_life'],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 0, healing: 5.0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 5.0, buff: 0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 0, highDamage: 1.0, normal: 1.0 },
        default: { offensive: 1.0, healing: 3.0 },
      },
    },
    isBoss: false,
  },

  void_archer: {
    id: 'void_archer',
    name: 'Void Archer',
    baseStats: {
      hp: 35,
      con: 8,
      spd: 6,
    },
    abilityIds: ['enemy_pierce', 'enemy_pin'],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 0, healing: 0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 0, buff: 0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 2.0, highDamage: 2.0, normal: 1.0 },
        default: { offensive: 3.0, control: 1.0 },
      },
    },
    isBoss: false,
  },

  madness_spawn: {
    id: 'madness_spawn',
    name: 'Madness Spawn',
    baseStats: {
      hp: 45,
      con: 5,
      spd: 4,
    },
    abilityIds: ['enemy_mind_spike', 'enemy_psychic_scream'],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 0, healing: 0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 0, buff: 0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 3.0, highDamage: 1.0, normal: 1.0 },
        default: { offensive: 2.0, control: 2.0 },
      },
    },
    isBoss: false,
  },
};

// ============================================================================
// Bosses
// ============================================================================

export const BOSSES: Record<number, Enemy> = {
  1: {
    id: 'boss_forgotten_guardian',
    name: 'The Forgotten Guardian',
    baseStats: {
      hp: 150,
      con: 8,
      spd: 3,
    },
    abilityIds: [
      'boss_guardians_wrath',
      'boss_ancient_shield',
      'boss_memory_drain',
    ],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 3.0, healing: 0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 0, buff: 0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 2.0, highDamage: 2.0, normal: 1.0 },
        default: { offensive: 2.0, defensive: 1.0, aoe: 1.5 },
      },
    },
    isBoss: true,
  },

  2: {
    id: 'boss_echoing_sorrow',
    name: 'Echoing Sorrow',
    baseStats: {
      hp: 200,
      con: 9,
      spd: 4,
    },
    abilityIds: [
      'boss_lament',
      'boss_mirror_pain',
      'boss_despair_wave',
    ],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 4.0, healing: 0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 0, buff: 0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 3.0, highDamage: 1.0, normal: 1.0 },
        default: { offensive: 1.5, defensive: 2.0, aoe: 2.0 },
      },
    },
    isBoss: true,
  },

  3: {
    id: 'boss_hunger_below',
    name: 'The Hunger Below',
    baseStats: {
      hp: 250,
      con: 10,
      spd: 3,
    },
    abilityIds: [
      'boss_devour',
      'boss_digestive_acid',
      'boss_ravenous_roar',
    ],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 0, healing: 4.0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 0, buff: 0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 0, highDamage: 2.0, normal: 1.0 },
        default: { offensive: 3.0, lifesteal: 2.0 },
      },
    },
    isBoss: true,
  },

  4: {
    id: 'boss_temporal_fracture',
    name: 'Temporal Fracture',
    baseStats: {
      hp: 280,
      con: 11,
      spd: 5,
    },
    abilityIds: [
      'boss_time_rip',
      'boss_stasis_field',
      'boss_accelerate',
    ],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 0, healing: 0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 0, buff: 0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 3.0, highDamage: 1.0, normal: 1.0 },
        default: { offensive: 2.0, control: 3.0, buff: 1.5 },
      },
    },
    isBoss: true,
  },

  5: {
    id: 'boss_betrayers_shade',
    name: "The Betrayer's Shade",
    baseStats: {
      hp: 320,
      con: 12,
      spd: 4,
    },
    abilityIds: [
      'boss_backstab',
      'boss_false_alliance',
      'boss_smoke_bomb',
    ],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 2.0, // Prioritize low HP targets
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 3.0, healing: 0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 0, buff: 0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 0, highDamage: 1.0, normal: 1.0 },
        default: { offensive: 3.0, execute: 2.0 },
      },
    },
    isBoss: true,
  },

  6: {
    id: 'boss_crystallized_agony',
    name: 'Crystallized Agony',
    baseStats: {
      hp: 380,
      con: 13,
      spd: 2,
    },
    abilityIds: [
      'boss_crystal_shatter',
      'boss_crystallize',
      'boss_resonance',
    ],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 2.0, healing: 0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 0, buff: 0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 3.0, highDamage: 2.0, normal: 1.0 },
        default: { offensive: 2.0, aoe: 2.5, debuff: 1.5 },
      },
    },
    isBoss: true,
  },

  7: {
    id: 'boss_mind_sculptor',
    name: 'The Mind Sculptor',
    baseStats: {
      hp: 420,
      con: 14,
      spd: 5,
    },
    abilityIds: [
      'boss_psychic_lance',
      'boss_mind_swap',
      'boss_madness_aura',
    ],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 0, healing: 2.0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 0, buff: 0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 3.0, highDamage: 2.0, normal: 1.0 },
        default: { offensive: 2.5, control: 2.5, debuff: 2.0 },
      },
    },
    isBoss: true,
  },

  8: {
    id: 'boss_void_convergence',
    name: 'Void Convergence',
    baseStats: {
      hp: 480,
      con: 15,
      spd: 4,
    },
    abilityIds: [
      'boss_void_beam',
      'boss_gravity_well',
      'boss_nullify',
    ],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.5, // Targets buffed enemies more
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 0, healing: 0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 0, buff: 0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 4.0, highDamage: 2.0, normal: 1.0 },
        default: { offensive: 2.5, aoe: 2.0, dispel: 3.0 },
      },
    },
    isBoss: true,
  },

  9: {
    id: 'boss_last_memory',
    name: 'The Last Memory',
    baseStats: {
      hp: 550,
      con: 16,
      spd: 5,
    },
    abilityIds: [
      'boss_erasure',
      'boss_nostalgia',
      'boss_final_remembrance',
    ],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 0, healing: 5.0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 0, buff: 0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 2.0, highDamage: 2.0, normal: 1.0 },
        default: { offensive: 3.0, control: 2.0, ultimate: 1.5 },
      },
    },
    isBoss: true,
  },

  10: {
    id: 'boss_that_which_waits',
    name: 'That Which Waits',
    baseStats: {
      hp: 999, // Unwinnable
      con: 20,
      spd: 6,
    },
    abilityIds: [
      'boss_inevitable_end',
      'boss_cosmic_horror',
      'boss_reality_break',
    ],
    aiProfile: {
      targetingWeights: {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      abilityWeights: {
        selfHpLow: { threshold: 30, defensive: 0, healing: 0, offensive: 1.0 },
        allyHpLow: { threshold: 30, healing: 0, buff: 0, offensive: 1.0 },
        targetManyBuffs: { threshold: 2, debuff: 0, highDamage: 3.0, normal: 1.0 },
        default: { offensive: 5.0, aoe: 3.0, ultimate: 2.0 },
      },
    },
    isBoss: true,
  },
};

// Helper functions
export function getCommonEnemy(id: string): Enemy {
  const enemy = COMMON_ENEMIES[id];
  if (!enemy) {
    throw new Error(`Common enemy not found: ${id}`);
  }
  return enemy;
}

export function getBoss(floor: number): Enemy {
  const boss = BOSSES[floor];
  if (!boss) {
    throw new Error(`Boss not found for floor: ${floor}`);
  }
  return boss;
}

export function getAllCommonEnemies(): Enemy[] {
  return Object.values(COMMON_ENEMIES);
}

export function getRandomCommonEnemies(count: number): Enemy[] {
  const enemies = getAllCommonEnemies();
  const selected: Enemy[] = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * enemies.length);
    selected.push(enemies[randomIndex]);
  }

  return selected;
}
