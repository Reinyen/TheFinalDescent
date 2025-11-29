/**
 * Enemy Ability Data
 * Abilities used by common enemies and bosses
 */

import type { Ability } from '../types/core';

export const ENEMY_ABILITIES: Record<string, Ability> = {
  // ============================================================================
  // Common Enemy Abilities
  // ============================================================================

  // Writhing Shadow
  enemy_shadow_strike: {
    id: 'enemy_shadow_strike',
    name: 'Shadow Strike',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 2,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [{ type: 'damage', setValue: 8 }],
    tags: ['aggressive', 'offensive'],
  },

  enemy_fade: {
    id: 'enemy_fade',
    name: 'Fade',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 4,
    cooldown: 2,
    targetType: 'self',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        statusEffects: [{ statusId: 'evasion', duration: 2, magnitude: 30 }],
      },
    ],
    tags: ['defensive'],
  },

  // Stone Sentinel
  enemy_crushing_blow: {
    id: 'enemy_crushing_blow',
    name: 'Crushing Blow',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: -1,
    cooldown: 1,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 10,
        statusEffects: [{ statusId: 'stunned', duration: 1, magnitude: 1 }],
      },
    ],
    tags: ['offensive', 'control'],
  },

  enemy_fortify: {
    id: 'enemy_fortify',
    name: 'Fortify',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 3,
    targetType: 'all_allies',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        statusEffects: [{ statusId: 'armor', duration: 2, magnitude: 3 }],
      },
    ],
    tags: ['defensive', 'buff'],
  },

  // Corrupted Healer
  enemy_dark_mend: {
    id: 'enemy_dark_mend',
    name: 'Dark Mend',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 2,
    cooldown: 1,
    targetType: 'single_ally',
    effects: [{ type: 'heal', setValue: 15 }],
    tags: ['healing'],
  },

  enemy_siphon_life: {
    id: 'enemy_siphon_life',
    name: 'Siphon Life',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 1,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'mixed',
        setValue: 6,
        specialMechanic: 'heal_self_same_amount',
      },
    ],
    tags: ['offensive', 'healing'],
  },

  // Void Archer
  enemy_pierce: {
    id: 'enemy_pierce',
    name: 'Pierce',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 3,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 9,
        specialMechanic: 'ignore_armor',
      },
    ],
    tags: ['offensive', 'penetrating'],
  },

  enemy_pin: {
    id: 'enemy_pin',
    name: 'Pin',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 2,
    cooldown: 2,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 5,
        statusEffects: [{ statusId: 'rooted', duration: 2, magnitude: 1 }],
      },
    ],
    tags: ['offensive', 'control'],
  },

  // Madness Spawn
  enemy_mind_spike: {
    id: 'enemy_mind_spike',
    name: 'Mind Spike',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 1,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 7,
        statusEffects: [{ statusId: 'confused', duration: 1, magnitude: 1 }],
      },
    ],
    tags: ['offensive', 'control'],
  },

  enemy_psychic_scream: {
    id: 'enemy_psychic_scream',
    name: 'Psychic Scream',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 3,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 4,
        specialMechanic: 'remove_1_buff_each',
      },
    ],
    tags: ['aoe', 'debuff'],
  },

  // ============================================================================
  // Boss Abilities - Floor 1: The Forgotten Guardian
  // ============================================================================

  boss_guardians_wrath: {
    id: 'boss_guardians_wrath',
    name: "Guardian's Wrath",
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [{ type: 'damage', setValue: 12 }],
    tags: ['offensive'],
  },

  boss_ancient_shield: {
    id: 'boss_ancient_shield',
    name: 'Ancient Shield',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 2,
    cooldown: 3,
    targetType: 'self',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        statusEffects: [{ statusId: 'armor', duration: 1, magnitude: 30 }],
      },
    ],
    tags: ['defensive'],
  },

  boss_memory_drain: {
    id: 'boss_memory_drain',
    name: 'Memory Drain',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: -1,
    cooldown: 2,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 8,
        specialMechanic: 'apply_random_debuff',
      },
    ],
    tags: ['aoe', 'debuff'],
  },

  // ============================================================================
  // Boss Abilities - Floor 2: Echoing Sorrow
  // ============================================================================

  boss_lament: {
    id: 'boss_lament',
    name: 'Lament',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 1,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 10,
        statusEffects: [{ statusId: 'sorrow', duration: 2, magnitude: 2 }],
      },
    ],
    tags: ['aoe', 'debuff'],
  },

  boss_mirror_pain: {
    id: 'boss_mirror_pain',
    name: 'Mirror Pain',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 3,
    cooldown: 4,
    targetType: 'self',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        statusEffects: [{ statusId: 'reflect', duration: 1, magnitude: 100 }],
      },
    ],
    tags: ['defensive'],
  },

  boss_despair_wave: {
    id: 'boss_despair_wave',
    name: 'Despair Wave',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 3,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 15,
        specialMechanic: 'push_turn_order_back',
      },
    ],
    tags: ['aoe', 'control'],
  },

  // ============================================================================
  // Boss Abilities - Floor 3: The Hunger Below
  // ============================================================================

  boss_devour: {
    id: 'boss_devour',
    name: 'Devour',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: -1,
    cooldown: 1,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'mixed',
        setValue: 20,
        specialMechanic: 'heal_self_damage_dealt',
      },
    ],
    tags: ['offensive', 'healing'],
  },

  boss_digestive_acid: {
    id: 'boss_digestive_acid',
    name: 'Digestive Acid',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 1,
    cooldown: 2,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'debuff',
        setValue: 0,
        statusEffects: [{ statusId: 'burn', duration: 3, magnitude: 5 }],
      },
    ],
    tags: ['aoe', 'dot'],
  },

  boss_ravenous_roar: {
    id: 'boss_ravenous_roar',
    name: 'Ravenous Roar',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 3,
    targetType: 'all_allies',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        statusEffects: [{ statusId: 'empowered', duration: 2, magnitude: 3 }],
      },
    ],
    tags: ['buff'],
  },

  // ============================================================================
  // Boss Abilities - Floor 4: Temporal Fracture
  // ============================================================================

  boss_time_rip: {
    id: 'boss_time_rip',
    name: 'Time Rip',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 2,
    cooldown: 2,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 18,
        specialMechanic: 'reset_target_cooldowns_negative',
      },
    ],
    tags: ['offensive', 'control'],
  },

  boss_stasis_field: {
    id: 'boss_stasis_field',
    name: 'Stasis Field',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 4,
    cooldown: 3,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'debuff',
        setValue: 0,
        statusEffects: [{ statusId: 'stunned', duration: 1, magnitude: 1 }],
        specialMechanic: 'target_highest_spd',
      },
    ],
    tags: ['control'],
  },

  boss_accelerate: {
    id: 'boss_accelerate',
    name: 'Accelerate',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 2,
    targetType: 'self',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        statusEffects: [{ statusId: 'haste', duration: 1, magnitude: 8 }],
      },
    ],
    tags: ['buff'],
  },

  // Additional boss abilities would continue here for Floors 5-10
  // For brevity in Phase 1, I'll create placeholders for the remaining bosses

  // Floor 5
  boss_backstab: {
    id: 'boss_backstab',
    name: 'Backstab',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 3,
    cooldown: 1,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 25,
        specialMechanic: 'target_lowest_hp',
      },
    ],
    tags: ['offensive', 'execute'],
  },

  boss_false_alliance: {
    id: 'boss_false_alliance',
    name: 'False Alliance',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 4,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'debuff',
        setValue: 0,
        statusEffects: [{ statusId: 'confused', duration: 1, magnitude: 1 }],
      },
    ],
    tags: ['control'],
  },

  boss_smoke_bomb: {
    id: 'boss_smoke_bomb',
    name: 'Smoke Bomb',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 4,
    cooldown: 3,
    targetType: 'all_allies',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        statusEffects: [{ statusId: 'evasion', duration: 2, magnitude: 50 }],
      },
    ],
    tags: ['defensive'],
  },

  // Floor 6-10 boss abilities (simplified for Phase 1)
  boss_crystal_shatter: {
    id: 'boss_crystal_shatter',
    name: 'Crystal Shatter',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 1,
    targetType: 'all_enemies',
    effects: [{ type: 'damage', setValue: 15 }],
    tags: ['aoe', 'offensive'],
  },

  boss_crystallize: {
    id: 'boss_crystallize',
    name: 'Crystallize',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 1,
    cooldown: 2,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'debuff',
        setValue: 0,
        statusEffects: [{ statusId: 'sealed', duration: 3, magnitude: 1 }],
      },
    ],
    tags: ['debuff'],
  },

  boss_resonance: {
    id: 'boss_resonance',
    name: 'Resonance',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 10,
        specialMechanic: 'increase_by_5_each_use',
      },
    ],
    tags: ['offensive', 'scaling'],
  },

  boss_psychic_lance: {
    id: 'boss_psychic_lance',
    name: 'Psychic Lance',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 1,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [{ type: 'damage', setValue: 22 }],
    tags: ['offensive'],
  },

  boss_mind_swap: {
    id: 'boss_mind_swap',
    name: 'Mind Swap',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: 2,
    cooldown: 4,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'special',
        setValue: 0,
        specialMechanic: 'swap_hp_percentages',
      },
    ],
    tags: ['control'],
  },

  boss_madness_aura: {
    id: 'boss_madness_aura',
    name: 'Madness Aura',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 3,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'debuff',
        setValue: 0,
        specialMechanic: 'damage_on_ability_use',
        statusEffects: [{ statusId: 'madness_aura', duration: 3, magnitude: 3 }],
      },
    ],
    tags: ['debuff'],
  },

  boss_void_beam: {
    id: 'boss_void_beam',
    name: 'Void Beam',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 1,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 20,
        specialMechanic: 'pierce_through_line',
      },
    ],
    tags: ['aoe', 'penetrating'],
  },

  boss_gravity_well: {
    id: 'boss_gravity_well',
    name: 'Gravity Well',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 3,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'debuff',
        setValue: 0,
        specialMechanic: 'set_all_spd_to_1',
        statusEffects: [{ statusId: 'gravity_well', duration: 1, magnitude: 1 }],
      },
    ],
    tags: ['debuff', 'control'],
  },

  boss_nullify: {
    id: 'boss_nullify',
    name: 'Nullify',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: 2,
    cooldown: 4,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'debuff',
        setValue: 0,
        specialMechanic: 'remove_all_buffs',
      },
    ],
    tags: ['debuff', 'dispel'],
  },

  boss_erasure: {
    id: 'boss_erasure',
    name: 'Erasure',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 3,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 30,
        specialMechanic: 'disable_1_ability_this_combat',
      },
    ],
    tags: ['offensive', 'control'],
  },

  boss_nostalgia: {
    id: 'boss_nostalgia',
    name: 'Nostalgia',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 5,
    targetType: 'all',
    effects: [
      {
        type: 'special',
        setValue: 0,
        specialMechanic: 'repeat_last_round',
      },
    ],
    tags: ['control'],
  },

  boss_final_remembrance: {
    id: 'boss_final_remembrance',
    name: 'Final Remembrance',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 99,
    targetType: 'all',
    effects: [
      {
        type: 'mixed',
        setValue: 25,
        specialMechanic: 'damage_all_full_heal_self_once',
      },
    ],
    tags: ['ultimate'],
  },

  boss_inevitable_end: {
    id: 'boss_inevitable_end',
    name: 'Inevitable End',
    abilityType: 'standard',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_enemies',
    effects: [{ type: 'damage', setValue: 50 }],
    tags: ['aoe', 'ultimate'],
  },

  boss_cosmic_horror: {
    id: 'boss_cosmic_horror',
    name: 'Cosmic Horror',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 2,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'debuff',
        setValue: 0,
        specialMechanic: 'apply_all_debuffs_permanent',
      },
    ],
    tags: ['debuff', 'ultimate'],
  },

  boss_reality_break: {
    id: 'boss_reality_break',
    name: 'Reality Break',
    abilityType: 'special',
    owners: [],
    spCost: 0,
    speedMod: 0,
    cooldown: 1,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'special',
        setValue: 0,
        specialMechanic: 'disable_all_abilities_except_retreat',
      },
    ],
    tags: ['control', 'ultimate'],
  },
};

// Helper to get enemy ability by ID
export function getEnemyAbility(id: string): Ability {
  const ability = ENEMY_ABILITIES[id];
  if (!ability) {
    throw new Error(`Enemy ability not found: ${id}`);
  }
  return ability;
}

// Get all enemy abilities
export function getAllEnemyAbilities(): Ability[] {
  return Object.values(ENEMY_ABILITIES);
}
