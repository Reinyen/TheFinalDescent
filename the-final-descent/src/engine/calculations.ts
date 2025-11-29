/**
 * Core calculation engine for damage, healing, and initiative
 */

import { LEVEL_VALUES } from '../types/core';
import type { Combatant, Ability, CharacterId } from '../types/core';

/**
 * Calculate final damage or healing value
 * Formula: Final Value = Set Value + ceil(CON × Level_Value)
 *
 * For combos: CON = Average CON of all participants (rounded up)
 */
export function calculateFinalValue(
  setValue: number,
  conviction: number,
  level: number
): number {
  const levelValue = LEVEL_VALUES[level] || (1.0 + (level - 6) * 0.1);
  const bonusValue = Math.ceil(conviction * levelValue);
  return setValue + bonusValue;
}

/**
 * Calculate CON for combo abilities
 * Uses average CON of all participants, rounded up
 */
export function calculateComboCON(participants: Combatant[]): number {
  if (participants.length === 0) return 0;

  const totalCon = participants.reduce((sum, p) => sum + p.stats.con, 0);
  const averageCon = totalCon / participants.length;
  return Math.ceil(averageCon);
}

/**
 * Calculate initiative score for an action
 * Formula: Initiative = Actor SPD + (SPD buffs/debuffs) + (Action speed modifier)
 */
export function calculateInitiative(
  actor: Combatant,
  actionSpeedMod: number
): number {
  // Base speed
  let initiative = actor.stats.spd;

  // Apply status effect modifiers
  for (const status of actor.statusEffects) {
    if (status.statusId === 'haste') {
      initiative += status.magnitude;
    } else if (status.statusId === 'fractured') {
      initiative -= status.magnitude;
    }
  }

  // Apply action speed modifier
  initiative += actionSpeedMod;

  return initiative;
}

/**
 * Resolve initiative tie-breaking
 * Rules:
 * 1. Player actions beat enemy actions at same initiative
 * 2. Among player actions, higher current HP goes first
 * 3. Among enemy actions, arbitrary but consistent (by ID)
 */
export function compareInitiative(
  a: { initiative: number; actorId: string; actorType: 'player' | 'enemy'; actorHp: number },
  b: { initiative: number; actorId: string; actorType: 'player' | 'enemy'; actorHp: number }
): number {
  // Higher initiative goes first (negative = a goes first)
  if (a.initiative !== b.initiative) {
    return b.initiative - a.initiative;
  }

  // Tie: player beats enemy
  if (a.actorType !== b.actorType) {
    return a.actorType === 'player' ? -1 : 1;
  }

  // Tie among same type: higher HP goes first
  if (a.actorHp !== b.actorHp) {
    return b.actorHp - a.actorHp;
  }

  // Final tie-break: by ID (consistent ordering)
  return a.actorId.localeCompare(b.actorId);
}

/**
 * Calculate SP regeneration based on active living party members
 * Formula: Base +6, -3 per dead active member, minimum +1
 */
export function calculateSPRegen(
  totalActiveMembers: number,
  deadActiveMembers: number
): number {
  const baseRegen = 6;
  const penalty = deadActiveMembers * 3;
  const regen = baseRegen - penalty;
  return Math.max(regen, 1);
}

/**
 * Calculate threat score for AI targeting
 * Uses weights from AI profile
 */
export function calculateThreat(
  target: Combatant,
  damageLastRound: number,
  healingLastRound: number,
  weights: {
    currentHp: number;
    damageDealtLastRound: number;
    healingDoneLastRound: number;
    hasTaunt: number;
    isLowestHp: number;
    buffCount: number;
    debuffCount: number;
  },
  isLowestHp: boolean
): number {
  let threat = 0;

  // Current HP contribution
  threat += target.stats.currentHp * weights.currentHp;

  // Damage dealt last round
  threat += damageLastRound * weights.damageDealtLastRound;

  // Healing done last round
  threat += healingLastRound * weights.healingDoneLastRound;

  // Check for taunt status
  const hasTaunt = target.statusEffects.some(s => s.statusId === 'taunt');
  if (hasTaunt) {
    threat += weights.hasTaunt;
  }

  // Lowest HP bonus
  if (isLowestHp) {
    threat += weights.isLowestHp;
  }

  // Buff/debuff count
  const buffCount = target.statusEffects.filter(s =>
    ['aegis', 'armor', 'evasion', 'regeneration', 'haste', 'empowered', 'reflect'].includes(s.statusId)
  ).length;

  const debuffCount = target.statusEffects.filter(s =>
    ['poison', 'burn', 'fractured', 'weakened', 'rooted', 'sealed', 'stunned', 'confused', 'terrified', 'sorrow'].includes(s.statusId)
  ).length;

  threat += buffCount * weights.buffCount;
  threat -= debuffCount * weights.debuffCount;

  return threat;
}

/**
 * Apply damage reduction from buffs and effects
 */
export function applyDamageReduction(
  baseDamage: number,
  target: Combatant,
  defendActive: boolean
): number {
  let damage = baseDamage;

  // Apply armor reduction
  const armorStatus = target.statusEffects.find(s => s.statusId === 'armor');
  if (armorStatus) {
    damage = Math.max(0, damage - armorStatus.magnitude);
  }

  // Apply defend reduction (30% team-wide)
  if (defendActive) {
    damage *= 0.7; // 30% reduction
  }

  return Math.floor(damage);
}

/**
 * Check if an attack is evaded
 */
export function checkEvasion(target: Combatant): boolean {
  const evasionStatus = target.statusEffects.find(s => s.statusId === 'evasion');
  if (!evasionStatus) return false;

  const evasionChance = evasionStatus.magnitude / 100; // Convert to decimal
  return Math.random() < evasionChance;
}

/**
 * Apply healing reduction from debuffs
 */
export function applyHealingReduction(
  baseHealing: number,
  target: Combatant
): number {
  let healing = baseHealing;

  // Check for terrified status (-50% healing)
  const hasTerrified = target.statusEffects.some(s => s.statusId === 'terrified');
  if (hasTerrified) {
    healing *= 0.5;
  }

  return Math.floor(healing);
}

/**
 * Distribute healing evenly among targets, with remainder going to lowest HP
 */
export function distributeHealing(
  totalHealing: number,
  targets: Combatant[]
): Map<string, number> {
  const distribution = new Map<string, number>();

  if (targets.length === 0) return distribution;

  // Calculate base amount per target (rounded down)
  const baseAmount = Math.floor(totalHealing / targets.length);
  const remainder = totalHealing - (baseAmount * targets.length);

  // Find lowest HP target
  let lowestHpTarget = targets[0];
  for (const target of targets) {
    if (target.stats.currentHp < lowestHpTarget.stats.currentHp) {
      lowestHpTarget = target;
    }
  }

  // Distribute
  for (const target of targets) {
    let amount = baseAmount;
    if (target.id === lowestHpTarget.id) {
      amount += remainder;
    }
    distribution.set(target.id, amount);
  }

  return distribution;
}

/**
 * Scale enemy stats by floor multiplier
 */
export function scaleEnemyStats(
  baseStats: { hp: number; con: number; spd: number },
  floor: number
): { hp: number; con: number; spd: number } {
  // Multipliers from GDD Section 3.3
  const multipliers: Record<number, { hp: number; con: number; spd: number }> = {
    1: { hp: 1.0, con: 1.0, spd: 1.0 },
    2: { hp: 1.3, con: 1.15, spd: 1.0 },
    3: { hp: 1.6, con: 1.25, spd: 1.0 },
    4: { hp: 1.9, con: 1.35, spd: 1.1 },
    5: { hp: 2.2, con: 1.5, spd: 1.1 },
    6: { hp: 2.5, con: 1.65, spd: 1.1 },
    7: { hp: 2.8, con: 1.75, spd: 1.2 },
    8: { hp: 3.2, con: 1.85, spd: 1.2 },
    9: { hp: 3.6, con: 2.0, spd: 1.3 },
    10: { hp: 4.0, con: 2.5, spd: 1.5 },
  };

  const multiplier = multipliers[floor] || multipliers[1];

  return {
    hp: Math.floor(baseStats.hp * multiplier.hp),
    con: Math.floor(baseStats.con * multiplier.con),
    spd: Math.floor(baseStats.spd * multiplier.spd),
  };
}
