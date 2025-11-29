/**
 * Combo Ability Data - Duo and Trio combinations
 * From GDD Sections 9.2 and 9.3
 */

import type { Ability, CharacterId } from '../types/core';

export const COMBO_ABILITIES: Record<string, Ability> = {
  // ============================================================================
  // DUO COMBOS
  // ============================================================================

  grave_in_bloom: {
    id: 'grave_in_bloom',
    name: 'Grave in Bloom',
    abilityType: 'duo',
    owners: ['dranick', 'eline'],
    spCost: 8,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 16,
        statusEffects: [
          { statusId: 'thorny_ground', duration: 3, magnitude: 3 },
        ],
      },
    ],
    tags: ['aoe', 'dot'],
  },

  arcane_bastion: {
    id: 'arcane_bastion',
    name: 'Arcane Bastion',
    abilityType: 'duo',
    owners: ['dranick', 'varro'],
    spCost: 7,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_allies',
    effects: [
      {
        type: 'buff',
        setValue: 14, // Absorb amount
        statusEffects: [
          { statusId: 'aegis', duration: 99, magnitude: 14 },
        ],
      },
    ],
    tags: ['defensive', 'buff'],
  },

  temporal_bulwark: {
    id: 'temporal_bulwark',
    name: 'Temporal Bulwark',
    abilityType: 'duo',
    owners: ['dranick', 'kestril'],
    spCost: 7,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_allies',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        statusEffects: [
          { statusId: 'armor', duration: 2, magnitude: 8 },
          { statusId: 'haste', duration: 2, magnitude: 3 },
        ],
      },
    ],
    tags: ['defensive', 'buff'],
  },

  guardians_breath: {
    id: 'guardians_breath',
    name: "Guardian's Breath",
    abilityType: 'duo',
    owners: ['dranick', 'lira'],
    spCost: 8,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_allies',
    effects: [
      {
        type: 'heal',
        setValue: 20,
      },
    ],
    tags: ['healing'],
  },

  unstoppable_force: {
    id: 'unstoppable_force',
    name: 'Unstoppable Force',
    abilityType: 'duo',
    owners: ['dranick', 'grim'],
    spCost: 8,
    speedMod: 0,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 25,
        specialMechanic: 'ignore_armor',
      },
    ],
    tags: ['physical', 'penetrating'],
  },

  witching_thorns: {
    id: 'witching_thorns',
    name: 'Witching Thorns',
    abilityType: 'duo',
    owners: ['eline', 'varro'],
    spCost: 7,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 18,
        statusEffects: [
          { statusId: 'poison', duration: 3, magnitude: 4 },
        ],
      },
    ],
    tags: ['aoe', 'dot', 'magic'],
  },

  venom_foretold: {
    id: 'venom_foretold',
    name: 'Venom Foretold',
    abilityType: 'duo',
    owners: ['eline', 'kestril'],
    spCost: 7,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 22,
        statusEffects: [
          { statusId: 'poison', duration: 4, magnitude: 5 },
        ],
      },
    ],
    tags: ['aoe', 'dot'],
  },

  swift_mercy: {
    id: 'swift_mercy',
    name: 'Swift Mercy',
    abilityType: 'duo',
    owners: ['eline', 'lira'],
    spCost: 8,
    speedMod: 0,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'mixed',
        setValue: 26,
        specialMechanic: 'heal_party_if_kill_overkill',
      },
    ],
    tags: ['damage', 'healing', 'execute'],
  },

  savage_ambush: {
    id: 'savage_ambush',
    name: 'Savage Ambush',
    abilityType: 'duo',
    owners: ['eline', 'grim'],
    spCost: 9,
    speedMod: 0,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 28,
        specialMechanic: 'double_if_target_full_hp',
      },
    ],
    tags: ['physical', 'burst'],
  },

  echoing_spell: {
    id: 'echoing_spell',
    name: 'Echoing Spell',
    abilityType: 'duo',
    owners: ['varro', 'kestril'],
    spCost: 8,
    speedMod: 0,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 18,
        specialMechanic: 'cast_twice',
      },
    ],
    tags: ['magic', 'multi-hit'],
  },

  siphoning_seal: {
    id: 'siphoning_seal',
    name: 'Siphoning Seal',
    abilityType: 'duo',
    owners: ['varro', 'lira'],
    spCost: 7,
    speedMod: 0,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'mixed',
        setValue: 19,
        specialMechanic: 'heal_users_half_damage',
      },
    ],
    tags: ['magic', 'lifesteal'],
  },

  runic_juggernaut: {
    id: 'runic_juggernaut',
    name: 'Runic Juggernaut',
    abilityType: 'duo',
    owners: ['varro', 'grim'],
    spCost: 9,
    speedMod: 0,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 27,
        statusEffects: [
          { statusId: 'armor', duration: 2, magnitude: 5 },
        ],
      },
    ],
    tags: ['magic', 'buff'],
  },

  vital_thread: {
    id: 'vital_thread',
    name: 'Vital Thread',
    abilityType: 'duo',
    owners: ['kestril', 'lira'],
    spCost: 7,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_allies',
    effects: [
      {
        type: 'heal',
        setValue: 22,
        statusEffects: [
          { statusId: 'regeneration', duration: 3, magnitude: 5 },
        ],
      },
    ],
    tags: ['healing', 'buff'],
  },

  rage_foretold: {
    id: 'rage_foretold',
    name: 'Rage Foretold',
    abilityType: 'duo',
    owners: ['kestril', 'grim'],
    spCost: 8,
    speedMod: 0,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 24,
        specialMechanic: 'guarantee_crit',
      },
    ],
    tags: ['physical', 'crit'],
  },

  soul_fired_fury: {
    id: 'soul_fired_fury',
    name: 'Soul-Fired Fury',
    abilityType: 'duo',
    owners: ['lira', 'grim'],
    spCost: 8,
    speedMod: 0,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 23,
        specialMechanic: 'damage_scales_with_missing_hp',
      },
    ],
    tags: ['physical', 'execute'],
  },

  // ============================================================================
  // TRIO COMBOS (Key Ones for Prototype)
  // ============================================================================

  sealed_fate: {
    id: 'sealed_fate',
    name: 'Sealed Fate',
    abilityType: 'trio',
    owners: ['dranick', 'eline', 'varro'],
    spCost: 12,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 28,
        statusEffects: [
          { statusId: 'sealed', duration: 3, magnitude: 1 },
        ],
      },
    ],
    tags: ['aoe', 'debuff'],
  },

  preserved_ground: {
    id: 'preserved_ground',
    name: 'Preserved Ground',
    abilityType: 'trio',
    owners: ['dranick', 'eline', 'kestril'],
    spCost: 11,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_allies',
    effects: [
      {
        type: 'buff',
        setValue: 15,
        statusEffects: [
          { statusId: 'aegis', duration: 99, magnitude: 15 },
          { statusId: 'regeneration', duration: 3, magnitude: 5 },
        ],
      },
    ],
    tags: ['defensive', 'buff'],
  },

  cycle_of_rot_and_growth: {
    id: 'cycle_of_rot_and_growth',
    name: 'Cycle of Rot & Growth',
    abilityType: 'trio',
    owners: ['dranick', 'eline', 'lira'],
    spCost: 12,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all',
    effects: [
      {
        type: 'mixed',
        setValue: 20, // Both damage and heal
        specialMechanic: 'damage_all_enemies_heal_all_allies_same_amount',
      },
    ],
    tags: ['aoe', 'healing'],
  },

  mire_and_maul: {
    id: 'mire_and_maul',
    name: 'Mire and Maul',
    abilityType: 'trio',
    owners: ['dranick', 'eline', 'grim'],
    spCost: 13,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 40,
      },
    ],
    tags: ['aoe', 'physical'],
  },

  aegis_of_ages: {
    id: 'aegis_of_ages',
    name: 'Aegis of Ages',
    abilityType: 'trio',
    owners: ['dranick', 'varro', 'kestril'],
    spCost: 11,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_allies',
    effects: [
      {
        type: 'buff',
        setValue: 10,
        statusEffects: [
          { statusId: 'aegis', duration: 99, magnitude: 10 },
          { statusId: 'armor', duration: 3, magnitude: 8 },
          { statusId: 'reflect', duration: 2, magnitude: 50 },
        ],
      },
    ],
    tags: ['defensive', 'buff'],
  },

  font_of_life: {
    id: 'font_of_life',
    name: 'Font of Life',
    abilityType: 'trio',
    owners: ['dranick', 'varro', 'lira'],
    spCost: 16,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_allies',
    effects: [
      {
        type: 'heal',
        setValue: 999, // Special: full heal
        specialMechanic: 'full_heal_all_remove_debuffs_regen',
        statusEffects: [
          { statusId: 'regeneration', duration: 3, magnitude: 5 },
        ],
      },
    ],
    tags: ['healing', 'ultimate'],
  },

  runic_colossus: {
    id: 'runic_colossus',
    name: 'Runic Colossus',
    abilityType: 'trio',
    owners: ['dranick', 'varro', 'grim'],
    spCost: 14,
    speedMod: 0,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 35,
        specialMechanic: 'stun_1_round',
      },
    ],
    tags: ['physical', 'magic', 'cc'],
  },

  vow_of_foresight: {
    id: 'vow_of_foresight',
    name: 'Vow of Foresight',
    abilityType: 'trio',
    owners: ['dranick', 'kestril', 'lira'],
    spCost: 11,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_allies',
    effects: [
      {
        type: 'buff',
        setValue: 0,
        statusEffects: [
          { statusId: 'evasion', duration: 2, magnitude: 70 },
          { statusId: 'haste', duration: 2, magnitude: 5 },
        ],
      },
    ],
    tags: ['defensive', 'buff'],
  },

  guided_cataclysm: {
    id: 'guided_cataclysm',
    name: 'Guided Cataclysm',
    abilityType: 'trio',
    owners: ['dranick', 'kestril', 'grim'],
    spCost: 13,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 42,
      },
    ],
    tags: ['aoe', 'ultimate'],
  },

  sacred_fury: {
    id: 'sacred_fury',
    name: 'Sacred Fury',
    abilityType: 'trio',
    owners: ['dranick', 'lira', 'grim'],
    spCost: 13,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'mixed',
        setValue: 38,
        specialMechanic: 'heal_party_50_percent_total_damage',
      },
    ],
    tags: ['aoe', 'lifesteal'],
  },

  miasma_of_paradox: {
    id: 'miasma_of_paradox',
    name: 'Miasma of Paradox',
    abilityType: 'trio',
    owners: ['eline', 'varro', 'kestril'],
    spCost: 12,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 18,
        statusEffects: [
          { statusId: 'confused', duration: 2, magnitude: 1 },
          { statusId: 'poison', duration: 3, magnitude: 4 },
        ],
      },
    ],
    tags: ['aoe', 'debuff', 'dot'],
  },

  baleful_trinity: {
    id: 'baleful_trinity',
    name: 'Baleful Trinity',
    abilityType: 'trio',
    owners: ['eline', 'varro', 'lira'],
    spCost: 12,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 36,
      },
    ],
    tags: ['aoe'],
  },

  arcane_ambush: {
    id: 'arcane_ambush',
    name: 'Arcane Ambush',
    abilityType: 'trio',
    owners: ['eline', 'varro', 'grim'],
    spCost: 13,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 39,
      },
    ],
    tags: ['aoe', 'burst'],
  },

  trinity_of_grace: {
    id: 'trinity_of_grace',
    name: 'Trinity of Grace',
    abilityType: 'trio',
    owners: ['eline', 'kestril', 'lira'],
    spCost: 12,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_allies',
    effects: [
      {
        type: 'heal',
        setValue: 37,
        specialMechanic: 'remove_all_debuffs',
      },
    ],
    tags: ['healing', 'cleanse'],
  },

  calculated_carnage: {
    id: 'calculated_carnage',
    name: 'Calculated Carnage',
    abilityType: 'trio',
    owners: ['eline', 'kestril', 'grim'],
    spCost: 13,
    speedMod: 0,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 32,
        specialMechanic: 'crit_if_target_debuffed',
      },
    ],
    tags: ['physical', 'crit'],
  },

  hunters_triage: {
    id: 'hunters_triage',
    name: "Hunter's Triage",
    abilityType: 'trio',
    owners: ['eline', 'lira', 'grim'],
    spCost: 12,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all',
    effects: [
      {
        type: 'mixed',
        setValue: 30, // Damage
        specialMechanic: 'damage_30_heal_party_15',
      },
    ],
    tags: ['aoe', 'healing'],
  },

  seal_of_providence: {
    id: 'seal_of_providence',
    name: 'Seal of Providence',
    abilityType: 'trio',
    owners: ['varro', 'kestril', 'lira'],
    spCost: 11,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_allies',
    effects: [
      {
        type: 'buff',
        setValue: 15,
        statusEffects: [
          { statusId: 'aegis', duration: 99, magnitude: 15 },
          { statusId: 'evasion', duration: 2, magnitude: 40 },
        ],
      },
    ],
    tags: ['defensive', 'buff'],
  },

  anathema_strike: {
    id: 'anathema_strike',
    name: 'Anathema Strike',
    abilityType: 'trio',
    owners: ['varro', 'kestril', 'grim'],
    spCost: 13,
    speedMod: 0,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 35,
        statusEffects: [
          { statusId: 'sealed', duration: 3, magnitude: 1 },
        ],
      },
    ],
    tags: ['magic', 'physical', 'debuff'],
  },

  soulcrushing_weight: {
    id: 'soulcrushing_weight',
    name: 'Soulcrushing Weight',
    abilityType: 'trio',
    owners: ['varro', 'lira', 'grim'],
    spCost: 13,
    speedMod: 0,
    cooldown: 0,
    targetType: 'single_enemy',
    effects: [
      {
        type: 'damage',
        setValue: 22,
        statusEffects: [
          { statusId: 'weakened', duration: 3, magnitude: 5 },
          { statusId: 'fractured', duration: 3, magnitude: 4 },
        ],
      },
    ],
    tags: ['debuff'],
  },

  climax_of_fate: {
    id: 'climax_of_fate',
    name: 'Climax of Fate',
    abilityType: 'trio',
    owners: ['kestril', 'lira', 'grim'],
    spCost: 15,
    speedMod: 0,
    cooldown: 0,
    targetType: 'all_enemies',
    effects: [
      {
        type: 'damage',
        setValue: 45,
        specialMechanic: 'reset_sp_to_10_next_round',
      },
    ],
    tags: ['aoe', 'ultimate'],
  },
};

// Helper to get all combo abilities
export function getAllComboAbilities(): Ability[] {
  return Object.values(COMBO_ABILITIES);
}

// Helper to get combo ability by ID
export function getComboAbility(id: string): Ability | undefined {
  return COMBO_ABILITIES[id];
}

// Check if a combo is available given the current party composition
export function getAvailableCombos(characterIds: CharacterId[]): Ability[] {
  const available: Ability[] = [];

  for (const combo of getAllComboAbilities()) {
    // Check if all required owners are in the party
    const hasAllOwners = combo.owners.every(owner =>
      characterIds.includes(owner as CharacterId)
    );

    if (hasAllOwners) {
      available.push(combo);
    }
  }

  return available;
}
