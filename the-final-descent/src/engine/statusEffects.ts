/**
 * Status Effect System
 * Handles application, ticking, and removal of status effects
 */

import type { Combatant, ActiveStatusEffect, StatusEffectApplication } from '../types/core';

/**
 * Process status effects at the start of a round
 * GDD Section 11.1: Tick order
 * 1. Apply passive damage/heal from statuses
 * 2. Reduce duration by 1
 * 3. Remove expired effects
 */
export function processStatusEffects(
  combatants: Combatant[]
): { combatant: Combatant; damage: number; healing: number }[] {
  const results: { combatant: Combatant; damage: number; healing: number }[] = [];

  for (const combatant of combatants) {
    if (!combatant.isAlive) continue;

    let totalDamage = 0;
    let totalHealing = 0;

    // Step 1: Apply passive damage/heal
    for (const status of combatant.statusEffects) {
      const effect = applyPassiveEffect(status);
      totalDamage += effect.damage;
      totalHealing += effect.healing;
    }

    // Apply the accumulated damage/healing
    if (totalDamage > 0) {
      combatant.stats.currentHp = Math.max(0, combatant.stats.currentHp - totalDamage);
      if (combatant.stats.currentHp === 0) {
        combatant.isAlive = false;
      }
    }

    if (totalHealing > 0) {
      combatant.stats.currentHp = Math.min(
        combatant.stats.maxHp,
        combatant.stats.currentHp + totalHealing
      );
    }

    // Step 2 & 3: Reduce duration and remove expired
    combatant.statusEffects = combatant.statusEffects
      .map(status => ({ ...status, duration: status.duration - 1 }))
      .filter(status => status.duration > 0);

    results.push({ combatant, damage: totalDamage, healing: totalHealing });
  }

  return results;
}

/**
 * Apply a status effect to a combatant
 * GDD Section 11.2: Reapplication resets duration
 */
export function applyStatusEffect(
  combatant: Combatant,
  application: StatusEffectApplication
): void {
  const existingIndex = combatant.statusEffects.findIndex(
    s => s.statusId === application.statusId
  );

  if (existingIndex >= 0) {
    // Reapplication: reset duration, update magnitude if higher
    const existing = combatant.statusEffects[existingIndex];
    const newMagnitude = application.magnitude ?? existing.magnitude;

    // GDD Section 11.3 (partially): higher magnitude takes precedence
    combatant.statusEffects[existingIndex] = {
      statusId: application.statusId,
      duration: application.duration,
      magnitude: Math.max(existing.magnitude, newMagnitude),
      source: application.statusId, // Track the source ability
    };
  } else {
    // New application
    combatant.statusEffects.push({
      statusId: application.statusId,
      duration: application.duration,
      magnitude: application.magnitude ?? 0,
      source: application.statusId,
    });
  }

  // Check for opposite status cancellation
  handleStatusCancellation(combatant);
}

/**
 * Handle opposite status effects canceling each other
 * E.g., HASTE cancels FRACTURED, EMPOWERED cancels WEAKENED
 */
function handleStatusCancellation(combatant: Combatant): void {
  const opposites: [string, string][] = [
    ['haste', 'fractured'],
    ['empowered', 'weakened'],
  ];

  for (const [status1, status2] of opposites) {
    const has1 = combatant.statusEffects.findIndex(s => s.statusId === status1);
    const has2 = combatant.statusEffects.findIndex(s => s.statusId === status2);

    if (has1 >= 0 && has2 >= 0) {
      // Both present: remove both
      combatant.statusEffects = combatant.statusEffects.filter(
        s => s.statusId !== status1 && s.statusId !== status2
      );
    }
  }
}

/**
 * Calculate passive damage/healing from a status effect
 */
function applyPassiveEffect(status: ActiveStatusEffect): { damage: number; healing: number } {
  let damage = 0;
  let healing = 0;

  switch (status.statusId) {
    case 'poison':
      damage = status.magnitude;
      break;

    case 'burn':
      // Burn increases by 1 each round (handled elsewhere)
      damage = status.magnitude;
      break;

    case 'regeneration':
      healing = status.magnitude;
      break;

    // Other statuses don't have passive tick effects
    default:
      break;
  }

  return { damage, healing };
}

/**
 * Remove all debuffs from a combatant
 */
export function removeAllDebuffs(combatant: Combatant): void {
  const debuffs = ['poison', 'burn', 'fractured', 'weakened', 'rooted', 'sealed', 'stunned', 'confused', 'terrified', 'sorrow'];
  combatant.statusEffects = combatant.statusEffects.filter(
    s => !debuffs.includes(s.statusId)
  );
}

/**
 * Remove a specific number of debuffs from a combatant
 */
export function removeDebuffs(combatant: Combatant, count: number): void {
  const debuffs = ['poison', 'burn', 'fractured', 'weakened', 'rooted', 'sealed', 'stunned', 'confused', 'terrified', 'sorrow'];

  let removed = 0;
  combatant.statusEffects = combatant.statusEffects.filter(s => {
    if (removed < count && debuffs.includes(s.statusId)) {
      removed++;
      return false;
    }
    return true;
  });
}

/**
 * Remove all buffs from a combatant
 */
export function removeAllBuffs(combatant: Combatant): void {
  const buffs = ['aegis', 'armor', 'evasion', 'regeneration', 'haste', 'empowered', 'reflect', 'taunt'];
  combatant.statusEffects = combatant.statusEffects.filter(
    s => !buffs.includes(s.statusId)
  );
}

/**
 * Check if combatant has a specific status
 */
export function hasStatus(combatant: Combatant, statusId: string): boolean {
  return combatant.statusEffects.some(s => s.statusId === statusId);
}

/**
 * Get status magnitude if present
 */
export function getStatusMagnitude(combatant: Combatant, statusId: string): number {
  const status = combatant.statusEffects.find(s => s.statusId === statusId);
  return status?.magnitude ?? 0;
}

/**
 * Tick cooldowns for a combatant
 * Reduces all cooldowns by 1 round
 */
export function tickCooldowns(combatant: Combatant): void {
  const updatedCooldowns = new Map<string, number>();

  for (const [abilityId, remaining] of combatant.cooldowns.entries()) {
    const newRemaining = remaining - 1;
    if (newRemaining > 0) {
      updatedCooldowns.set(abilityId, newRemaining);
    }
  }

  combatant.cooldowns = updatedCooldowns;
}

/**
 * Reset all cooldowns for a combatant
 */
export function resetAllCooldowns(combatant: Combatant): void {
  combatant.cooldowns.clear();
}

/**
 * Check if an ability is on cooldown
 */
export function isOnCooldown(combatant: Combatant, abilityId: string): boolean {
  return (combatant.cooldowns.get(abilityId) ?? 0) > 0;
}

/**
 * Set an ability on cooldown
 */
export function setCooldown(combatant: Combatant, abilityId: string, duration: number): void {
  if (duration > 0) {
    combatant.cooldowns.set(abilityId, duration);
  }
}
