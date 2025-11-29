/**
 * Action Resolution System
 * Handles execution of all abilities with their special mechanics
 */

import type { Combatant, Ability, CombatAction, AbilityEffect } from '../types/core';
import {
  calculateFinalValue,
  calculateComboCON,
  applyDamageReduction,
  checkEvasion,
  applyHealingReduction,
  distributeHealing,
} from './calculations';
import {
  applyStatusEffect,
  setCooldown,
  removeAllDebuffs,
  removeDebuffs,
  resetAllCooldowns,
} from './statusEffects';
import { getAbility } from '../data/abilities';
import { getComboAbility } from '../data/combos';
import { getEnemyAbility } from '../data/enemyAbilities';

export interface ActionResult {
  success: boolean;
  actorId: string;
  abilityName: string;
  log: string[];
  damageDealt: Map<string, number>; // targetId -> damage
  healingDone: Map<string, number>; // targetId -> healing
}

/**
 * Resolve a single action
 */
export function resolveAction(
  action: CombatAction,
  playerCombatants: Combatant[],
  enemyCombatants: Combatant[],
  defendActive: boolean
): ActionResult {
  const allCombatants = [...playerCombatants, ...enemyCombatants];
  const actor = allCombatants.find(c => c.id === action.actorId);

  if (!actor || !actor.isAlive) {
    return {
      success: false,
      actorId: action.actorId,
      abilityName: 'Unknown',
      log: ['Action canceled - actor is not alive'],
      damageDealt: new Map(),
      healingDone: new Map(),
    };
  }

  // Handle Defend special case
  if (action.abilityId === 'defend') {
    return {
      success: true,
      actorId: action.actorId,
      abilityName: 'Defend',
      log: [`${actor.name} defends! (30% damage reduction for team)`],
      damageDealt: new Map(),
      healingDone: new Map(),
    };
  }

  // Get ability
  let ability: Ability | undefined;

  if (actor.type === 'player') {
    ability = getAbility(action.abilityId) || getComboAbility(action.abilityId);
  } else {
    ability = getEnemyAbility(action.abilityId);
  }

  if (!ability) {
    return {
      success: false,
      actorId: action.actorId,
      abilityName: 'Unknown',
      log: [`Ability ${action.abilityId} not found`],
      damageDealt: new Map(),
      healingDone: new Map(),
    };
  }

  // Resolve the ability
  const result = resolveAbility(
    ability,
    actor,
    action.targetIds,
    playerCombatants,
    enemyCombatants,
    defendActive
  );

  // Set cooldown if applicable
  if (ability.cooldown > 0 && actor.type === 'player') {
    // For combos, set cooldown on all participants
    if (ability.abilityType === 'duo' || ability.abilityType === 'trio') {
      for (const ownerId of ability.owners) {
        const participant = playerCombatants.find(c => c.characterId === ownerId);
        if (participant) {
          setCooldown(participant, ability.id, ability.cooldown);
        }
      }
    } else {
      setCooldown(actor, ability.id, ability.cooldown);
    }
  }

  return {
    success: true,
    actorId: action.actorId,
    abilityName: ability.name,
    ...result,
  };
}

/**
 * Resolve an ability's effects
 */
function resolveAbility(
  ability: Ability,
  actor: Combatant,
  targetIds: string[],
  playerCombatants: Combatant[],
  enemyCombatants: Combatant[],
  defendActive: boolean
): {
  log: string[];
  damageDealt: Map<string, number>;
  healingDone: Map<string, number>;
} {
  const log: string[] = [];
  const damageDealt = new Map<string, number>();
  const healingDone = new Map<string, number>();

  // Determine targets based on target type
  const targets = resolveTargets(
    ability.targetType,
    targetIds,
    actor,
    playerCombatants,
    enemyCombatants
  );

  if (targets.length === 0) {
    log.push(`${actor.name} uses ${ability.name}, but no valid targets!`);
    return { log, damageDealt, healingDone };
  }

  log.push(`${actor.name} uses ${ability.name}!`);

  // Calculate CON for the ability
  let conviction = actor.stats.con;

  // For combos, calculate average CON
  if (ability.abilityType === 'duo' || ability.abilityType === 'trio') {
    const participants: Combatant[] = [];
    for (const ownerId of ability.owners) {
      const participant = playerCombatants.find(c => c.characterId === ownerId);
      if (participant) participants.push(participant);
    }
    conviction = calculateComboCON(participants);
  }

  // Process each effect
  for (const effect of ability.effects) {
    const effectResult = resolveEffect(
      effect,
      ability,
      conviction,
      actor.level,
      targets,
      actor,
      playerCombatants,
      enemyCombatants,
      defendActive
    );

    log.push(...effectResult.log);

    // Merge damage/healing maps
    for (const [targetId, damage] of effectResult.damageDealt.entries()) {
      damageDealt.set(targetId, (damageDealt.get(targetId) ?? 0) + damage);
    }
    for (const [targetId, healing] of effectResult.healingDone.entries()) {
      healingDone.set(targetId, (healingDone.get(targetId) ?? 0) + healing);
    }
  }

  return { log, damageDealt, healingDone };
}

/**
 * Resolve effect targets
 */
function resolveTargets(
  targetType: string,
  targetIds: string[],
  actor: Combatant,
  playerCombatants: Combatant[],
  enemyCombatants: Combatant[]
): Combatant[] {
  const allCombatants = [...playerCombatants, ...enemyCombatants];

  switch (targetType) {
    case 'self':
      return [actor];

    case 'single_enemy':
      if (actor.type === 'player') {
        return targetIds
          .map(id => enemyCombatants.find(c => c.id === id && c.isAlive))
          .filter((c): c is Combatant => c !== undefined);
      } else {
        return targetIds
          .map(id => playerCombatants.find(c => c.id === id && c.isAlive))
          .filter((c): c is Combatant => c !== undefined);
      }

    case 'single_ally':
      if (actor.type === 'player') {
        return targetIds
          .map(id => playerCombatants.find(c => c.id === id && c.isAlive))
          .filter((c): c is Combatant => c !== undefined);
      } else {
        return targetIds
          .map(id => enemyCombatants.find(c => c.id === id && c.isAlive))
          .filter((c): c is Combatant => c !== undefined);
      }

    case 'all_enemies':
      if (actor.type === 'player') {
        return enemyCombatants.filter(c => c.isAlive);
      } else {
        return playerCombatants.filter(c => c.isAlive);
      }

    case 'all_allies':
      if (actor.type === 'player') {
        return playerCombatants.filter(c => c.isAlive);
      } else {
        return enemyCombatants.filter(c => c.isAlive);
      }

    case 'all':
      return allCombatants.filter(c => c.isAlive);

    default:
      return [];
  }
}

/**
 * Resolve a single effect
 */
function resolveEffect(
  effect: AbilityEffect,
  ability: Ability,
  conviction: number,
  level: number,
  targets: Combatant[],
  actor: Combatant,
  playerCombatants: Combatant[],
  enemyCombatants: Combatant[],
  defendActive: boolean
): {
  log: string[];
  damageDealt: Map<string, number>;
  healingDone: Map<string, number>;
} {
  const log: string[] = [];
  const damageDealt = new Map<string, number>();
  const healingDone = new Map<string, number>();

  // Handle special mechanics
  if (effect.specialMechanic) {
    const specialResult = handleSpecialMechanic(
      effect.specialMechanic,
      effect,
      ability,
      conviction,
      level,
      targets,
      actor,
      playerCombatants,
      enemyCombatants,
      defendActive
    );
    return specialResult;
  }

  // Standard effect resolution
  switch (effect.type) {
    case 'damage':
      for (const target of targets) {
        // Check evasion
        if (checkEvasion(target)) {
          log.push(`  ${target.name} evades!`);
          continue;
        }

        let damage = calculateFinalValue(effect.setValue, conviction, level);
        damage = applyDamageReduction(damage, target, defendActive);

        target.stats.currentHp = Math.max(0, target.stats.currentHp - damage);
        damageDealt.set(target.id, damage);

        log.push(`  ${target.name} takes ${damage} damage! (${target.stats.currentHp}/${target.stats.maxHp} HP)`);

        if (target.stats.currentHp === 0) {
          target.isAlive = false;
          log.push(`  ${target.name} has been defeated!`);
        }

        // Apply status effects
        if (effect.statusEffects) {
          for (const statusApp of effect.statusEffects) {
            applyStatusEffect(target, statusApp);
            log.push(`  ${target.name} is afflicted with ${statusApp.statusId}!`);
          }
        }
      }
      break;

    case 'heal':
      const totalHealing = calculateFinalValue(effect.setValue, conviction, level);

      // Special case: Font of Life (Set Value 999 = full heal)
      if (effect.setValue === 999) {
        for (const target of targets) {
          const healAmount = target.stats.maxHp - target.stats.currentHp;
          target.stats.currentHp = target.stats.maxHp;
          healingDone.set(target.id, healAmount);
          log.push(`  ${target.name} fully restored! (${target.stats.currentHp}/${target.stats.maxHp} HP)`);
        }
      } else {
        // Normal healing distribution
        const distribution = distributeHealing(totalHealing, targets);

        for (const [targetId, healAmount] of distribution.entries()) {
          const target = targets.find(t => t.id === targetId);
          if (!target) continue;

          const adjustedHeal = applyHealingReduction(healAmount, target);
          target.stats.currentHp = Math.min(target.stats.maxHp, target.stats.currentHp + adjustedHeal);
          healingDone.set(target.id, adjustedHeal);

          log.push(`  ${target.name} heals ${adjustedHeal} HP! (${target.stats.currentHp}/${target.stats.maxHp} HP)`);
        }
      }

      // Apply status effects (e.g., regeneration)
      if (effect.statusEffects) {
        for (const target of targets) {
          for (const statusApp of effect.statusEffects) {
            applyStatusEffect(target, statusApp);
            log.push(`  ${target.name} gains ${statusApp.statusId}!`);
          }
        }
      }
      break;

    case 'buff':
    case 'debuff':
      for (const target of targets) {
        if (effect.statusEffects) {
          for (const statusApp of effect.statusEffects) {
            applyStatusEffect(target, statusApp);
            log.push(`  ${target.name} is affected by ${statusApp.statusId}!`);
          }
        }
      }
      break;

    case 'mixed':
      // Handle abilities that do both damage and healing
      // This will be handled by special mechanics
      break;
  }

  return { log, damageDealt, healingDone };
}

/**
 * Handle special ability mechanics
 */
function handleSpecialMechanic(
  mechanic: string,
  effect: AbilityEffect,
  ability: Ability,
  conviction: number,
  level: number,
  targets: Combatant[],
  actor: Combatant,
  playerCombatants: Combatant[],
  enemyCombatants: Combatant[],
  defendActive: boolean
): {
  log: string[];
  damageDealt: Map<string, number>;
  healingDone: Map<string, number>;
} {
  const log: string[] = [];
  const damageDealt = new Map<string, number>();
  const healingDone = new Map<string, number>();

  switch (mechanic) {
    case 'hit_twice':
      // Twin Thorns - hit twice
      for (const target of targets) {
        if (checkEvasion(target)) {
          log.push(`  ${target.name} evades both strikes!`);
          continue;
        }

        for (let i = 0; i < 2; i++) {
          let damage = calculateFinalValue(effect.setValue, conviction, level);
          damage = applyDamageReduction(damage, target, defendActive);

          target.stats.currentHp = Math.max(0, target.stats.currentHp - damage);
          damageDealt.set(target.id, (damageDealt.get(target.id) ?? 0) + damage);

          if (target.stats.currentHp === 0) {
            target.isAlive = false;
            log.push(`  Hit ${i + 1}: ${target.name} takes ${damage} damage and is defeated!`);
            break;
          } else {
            log.push(`  Hit ${i + 1}: ${target.name} takes ${damage} damage!`);
          }
        }

        // Apply poison after hits
        if (effect.statusEffects) {
          for (const statusApp of effect.statusEffects) {
            applyStatusEffect(target, statusApp);
          }
        }
      }
      break;

    case 'chain_50_percent':
      // Arc Lash - chain to adjacent enemy
      if (targets.length > 0 && targets[0]) {
        const primaryTarget = targets[0];
        let damage = calculateFinalValue(effect.setValue, conviction, level);
        damage = applyDamageReduction(damage, primaryTarget, defendActive);

        primaryTarget.stats.currentHp = Math.max(0, primaryTarget.stats.currentHp - damage);
        damageDealt.set(primaryTarget.id, damage);
        log.push(`  ${primaryTarget.name} takes ${damage} damage!`);

        if (primaryTarget.stats.currentHp === 0) {
          primaryTarget.isAlive = false;
          log.push(`  ${primaryTarget.name} is defeated!`);
        }

        // Chain to random other enemy
        const enemies = actor.type === 'player' ? enemyCombatants : playerCombatants;
        const otherEnemies = enemies.filter(e => e.isAlive && e.id !== primaryTarget.id);

        if (otherEnemies.length > 0) {
          const chainTarget = otherEnemies[Math.floor(Math.random() * otherEnemies.length)];
          let chainDamage = Math.floor(damage * 0.5);

          chainTarget.stats.currentHp = Math.max(0, chainTarget.stats.currentHp - chainDamage);
          damageDealt.set(chainTarget.id, chainDamage);
          log.push(`  Lightning chains to ${chainTarget.name} for ${chainDamage} damage!`);

          if (chainTarget.stats.currentHp === 0) {
            chainTarget.isAlive = false;
            log.push(`  ${chainTarget.name} is defeated!`);
          }
        }
      }
      break;

    case 'remove_1_debuff':
      // Foresight Step
      for (const target of targets) {
        removeDebuffs(target, 1);
        log.push(`  ${target.name} has 1 debuff removed!`);
      }
      break;

    case 'remove_all_debuffs':
      // Breath
      for (const target of targets) {
        removeAllDebuffs(target);
        log.push(`  ${target.name}'s debuffs are cleansed!`);
      }
      break;

    case 'reset_all_cooldowns':
      // Rewind Pulse
      for (const target of targets) {
        resetAllCooldowns(target);
        log.push(`  ${target.name}'s cooldowns reset!`);
      }

      // Also heal
      const healValue = calculateFinalValue(effect.setValue, conviction, level);
      for (const target of targets) {
        target.stats.currentHp = Math.min(target.stats.maxHp, target.stats.currentHp + healValue);
        healingDone.set(target.id, healValue);
      }
      break;

    case 'heal_lowest_ally_50_percent_damage':
      // Undying Judgment
      let totalDamage = 0;

      for (const target of targets) {
        let damage = calculateFinalValue(effect.setValue, conviction, level);
        damage = applyDamageReduction(damage, target, defendActive);

        target.stats.currentHp = Math.max(0, target.stats.currentHp - damage);
        totalDamage += damage;
        damageDealt.set(target.id, damage);
        log.push(`  ${target.name} takes ${damage} damage!`);

        if (target.stats.currentHp === 0) {
          target.isAlive = false;
          log.push(`  ${target.name} is defeated!`);
        }
      }

      // Heal lowest HP ally
      const allies = actor.type === 'player' ? playerCombatants : enemyCombatants;
      const livingAllies = allies.filter(a => a.isAlive);

      if (livingAllies.length > 0) {
        let lowestAlly = livingAllies[0];
        for (const ally of livingAllies) {
          if (ally.stats.currentHp < lowestAlly.stats.currentHp) {
            lowestAlly = ally;
          }
        }

        const healAmount = Math.floor(totalDamage * 0.5);
        lowestAlly.stats.currentHp = Math.min(lowestAlly.stats.maxHp, lowestAlly.stats.currentHp + healAmount);
        healingDone.set(lowestAlly.id, healAmount);
        log.push(`  ${lowestAlly.name} heals ${healAmount} HP!`);
      }
      break;

    case 'damage_all_enemies_heal_all_allies_same_amount':
      // Cycle of Rot & Growth
      const setValue = effect.setValue;
      const damageValue = calculateFinalValue(setValue, conviction, level);
      const healValue2 = calculateFinalValue(setValue, conviction, level);

      const enemies = actor.type === 'player' ? enemyCombatants : playerCombatants;
      for (const enemy of enemies.filter(e => e.isAlive)) {
        let damage = applyDamageReduction(damageValue, enemy, defendActive);
        enemy.stats.currentHp = Math.max(0, enemy.stats.currentHp - damage);
        damageDealt.set(enemy.id, damage);
        log.push(`  ${enemy.name} takes ${damage} damage!`);

        if (enemy.stats.currentHp === 0) {
          enemy.isAlive = false;
          log.push(`  ${enemy.name} is defeated!`);
        }
      }

      const allies2 = actor.type === 'player' ? playerCombatants : enemyCombatants;
      for (const ally of allies2.filter(a => a.isAlive)) {
        ally.stats.currentHp = Math.min(ally.stats.maxHp, ally.stats.currentHp + healValue2);
        healingDone.set(ally.id, healValue2);
        log.push(`  ${ally.name} heals ${healValue2} HP!`);
      }
      break;

    case 'heal_party_50_percent_total_damage':
      // Sacred Fury
      let totalDamageDealt = 0;

      for (const target of targets) {
        let damage = calculateFinalValue(effect.setValue, conviction, level);
        damage = applyDamageReduction(damage, target, defendActive);

        target.stats.currentHp = Math.max(0, target.stats.currentHp - damage);
        totalDamageDealt += damage;
        damageDealt.set(target.id, damage);
        log.push(`  ${target.name} takes ${damage} damage!`);

        if (target.stats.currentHp === 0) {
          target.isAlive = false;
          log.push(`  ${target.name} is defeated!`);
        }
      }

      // Heal party for 50%
      const partyHeal = Math.floor(totalDamageDealt * 0.5);
      const party = actor.type === 'player' ? playerCombatants : enemyCombatants;
      const healDist = distributeHealing(partyHeal, party.filter(p => p.isAlive));

      for (const [memberId, heal] of healDist.entries()) {
        const member = party.find(p => p.id === memberId);
        if (member) {
          member.stats.currentHp = Math.min(member.stats.maxHp, member.stats.currentHp + heal);
          healingDone.set(member.id, heal);
          log.push(`  ${member.name} heals ${heal} HP!`);
        }
      }
      break;

    default:
      log.push(`  Special mechanic '${mechanic}' not yet implemented`);
  }

  return { log, damageDealt, healingDone };
}
