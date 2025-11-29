/**
 * Combat Engine - Core combat loop and state management
 * (Temporary fix file to replace combatEngine.ts)
 */

import type {
  Combatant,
  Ability,
  CombatAction,
  CharacterId,
} from '../types/core';
import { COMBAT_CONSTANTS } from '../types/core';
import {
  calculateInitiative,
  compareInitiative,
  calculateSPRegen,
  calculateThreat,
} from './calculations';
import {
  processStatusEffects,
  tickCooldowns,
} from './statusEffects';
import { ABILITIES } from '../data/abilities';
import { getAvailableCombos } from '../data/combos';
import { ENEMY_ABILITIES } from '../data/enemyAbilities';

/**
 * Initialize a combat encounter
 */
export function initializeCombat(
  playerCombatants: Combatant[],
  enemyCombatants: Combatant[]
): {
  round: number;
  currentSP: number;
  spRegen: number;
  playerCombatants: Combatant[];
  enemyCombatants: Combatant[];
  actionQueue: CombatAction[];
  combatLog: string[];
  isPlayerTurn: boolean;
  defendActive: boolean;
} {
  const totalActiveMembers = playerCombatants.length;
  const deadActiveMembers = playerCombatants.filter(c => !c.isAlive).length;

  return {
    round: 1,
    currentSP: COMBAT_CONSTANTS.STARTING_SP,
    spRegen: calculateSPRegen(totalActiveMembers, deadActiveMembers),
    playerCombatants: [...playerCombatants],
    enemyCombatants: [...enemyCombatants],
    actionQueue: [],
    combatLog: ['Combat begins!'],
    isPlayerTurn: true,
    defendActive: false,
  };
}

/**
 * Generate the 4-action offer for the current round
 * Filters out abilities on cooldown and checks SP costs
 */
export function generateActionOffer(
  playerCombatants: Combatant[],
  _currentSP: number
): Ability[] {
  const livingPlayers = playerCombatants.filter(c => c.isAlive);

  if (livingPlayers.length === 0) return [];

  // Get all available single-character abilities
  const singleAbilities: Ability[] = [];
  for (const combatant of livingPlayers) {
    if (!combatant.characterId) continue;

    const character = combatant.characterId;
    // Get abilities for this character
    for (const ability of Object.values(ABILITIES)) {
      if (ability.owners.length === 1 && ability.owners[0] === character) {
        // Check if not on cooldown
        const isOnCooldown = (combatant.cooldowns.get(ability.id) ?? 0) > 0;
        if (!isOnCooldown) {
          singleAbilities.push(ability);
        }
      }
    }
  }

  // Get available combos
  const livingCharacterIds = livingPlayers
    .map(c => c.characterId)
    .filter((id): id is CharacterId => id !== undefined);

  const comboAbilities = getAvailableCombos(livingCharacterIds);

  // Filter combos by cooldown (check all participants)
  const availableCombos = comboAbilities.filter(combo => {
    for (const owner of combo.owners) {
      const combatant = livingPlayers.find(c => c.characterId === owner);
      if (!combatant) return false;

      const isOnCooldown = (combatant.cooldowns.get(combo.id) ?? 0) > 0;
      if (isOnCooldown) return false;
    }
    return true;
  });

  // Combine all available abilities
  const allAvailable = [...singleAbilities, ...availableCombos];

  // If we have 4 or fewer, return all
  if (allAvailable.length <= COMBAT_CONSTANTS.ACTIONS_OFFERED_PER_ROUND) {
    return allAvailable;
  }

  // Randomly select 4
  const selected: Ability[] = [];
  const availableCopy = [...allAvailable];

  for (let i = 0; i < COMBAT_CONSTANTS.ACTIONS_OFFERED_PER_ROUND; i++) {
    const randomIndex = Math.floor(Math.random() * availableCopy.length);
    selected.push(availableCopy[randomIndex]);
    availableCopy.splice(randomIndex, 1);
  }

  return selected;
}

/**
 * Queue a player action
 */
export function queueAction(
  ability: Ability,
  actorIds: string[],
  targetIds: string[],
  playerCombatants: Combatant[],
  actionQueue: CombatAction[]
): CombatAction[] {
  // For single-character abilities, use the first actor
  // For combos, we'll use the first participant for initiative calculation
  const primaryActor = playerCombatants.find(c => c.id === actorIds[0]);
  if (!primaryActor) {
    throw new Error('Actor not found');
  }

  const initiative = calculateInitiative(primaryActor, ability.speedMod);

  const action: CombatAction = {
    actionId: `action_${Date.now()}_${Math.random()}`,
    abilityId: ability.id,
    actorId: actorIds[0], // Primary actor
    targetIds,
    initiative,
  };

  return [...actionQueue, action];
}

/**
 * Add Defend action
 */
export function queueDefend(
  actorId: string,
  playerCombatants: Combatant[],
  actionQueue: CombatAction[]
): CombatAction[] {
  const actor = playerCombatants.find(c => c.id === actorId);
  if (!actor) {
    throw new Error('Actor not found');
  }

  const action: CombatAction = {
    actionId: `defend_${Date.now()}_${Math.random()}`,
    abilityId: 'defend',
    actorId,
    targetIds: [],
    initiative: calculateInitiative(actor, 0),
  };

  return [...actionQueue, action];
}

/**
 * Generate enemy actions for the round
 */
export function generateEnemyActions(
  enemyCombatants: Combatant[],
  playerCombatants: Combatant[],
  lastRoundDamage: Map<string, number>,
  lastRoundHealing: Map<string, number>
): CombatAction[] {
  const actions: CombatAction[] = [];
  const livingEnemies = enemyCombatants.filter(e => e.isAlive);

  for (const enemy of livingEnemies) {
    // Get enemy's available abilities
    const enemyAbilities = enemy.enemyId
      ? getEnemyAbilities(enemy.enemyId, enemy.cooldowns)
      : [];

    if (enemyAbilities.length === 0) continue;

    // Select ability based on AI weights
    const selectedAbility = selectEnemyAbility(enemy, enemyAbilities, playerCombatants, enemyCombatants);

    // Select target based on threat
    const target = selectEnemyTarget(enemy, selectedAbility, playerCombatants, lastRoundDamage, lastRoundHealing);

    if (!target) continue;

    const initiative = calculateInitiative(enemy, selectedAbility.speedMod);

    actions.push({
      actionId: `enemy_action_${Date.now()}_${Math.random()}`,
      abilityId: selectedAbility.id,
      actorId: enemy.id,
      targetIds: selectedAbility.targetType === 'all_enemies' || selectedAbility.targetType === 'all_allies'
        ? []
        : [target.id],
      initiative,
    });
  }

  return actions;
}

/**
 * Helper: Get available enemy abilities (not on cooldown)
 */
function getEnemyAbilities(_enemyId: string, cooldowns: Map<string, number>): Ability[] {
  // Get all enemy abilities
  return Object.values(ENEMY_ABILITIES).filter((ability) => {
    const isOnCooldown = (cooldowns.get(ability.id) ?? 0) > 0;
    return !isOnCooldown;
  });
}

/**
 * Select which ability the enemy should use based on AI weights
 */
function selectEnemyAbility(
  enemy: Combatant,
  abilities: Ability[],
  playerCombatants: Combatant[],
  enemyCombatants: Combatant[]
): Ability {
  // Calculate context
  const selfHpPercent = (enemy.stats.currentHp / enemy.stats.maxHp) * 100;
  const livingAllies = enemyCombatants.filter(e => e.isAlive && e.id !== enemy.id);
  const woundedAlly = livingAllies.find(e => (e.stats.currentHp / e.stats.maxHp) < 0.3);
  const targetWithManyBuffs = playerCombatants.find(p => p.statusEffects.filter(s =>
    ['aegis', 'armor', 'evasion', 'regeneration', 'haste', 'empowered', 'reflect'].includes(s.statusId)
  ).length >= 2);

  // Assign weights to each ability
  const weights: number[] = [];

  for (const ability of abilities) {
    let weight = 1.0;

    // Check tags and apply contextual weights
    const tags = ability.tags || [];

    // Self HP low
    if (selfHpPercent < 30) {
      if (tags.includes('defensive')) weight *= 3.0;
      if (tags.includes('healing')) weight *= 4.0;
    }

    // Ally HP low
    if (woundedAlly) {
      if (tags.includes('healing')) weight *= 5.0;
      if (tags.includes('buff')) weight *= 2.0;
    }

    // Target has many buffs
    if (targetWithManyBuffs) {
      if (tags.includes('debuff') || tags.includes('dispel')) weight *= 3.0;
      if (tags.includes('highDamage')) weight *= 2.0;
    }

    weights.push(weight);
  }

  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < abilities.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return abilities[i];
    }
  }

  return abilities[0]; // Fallback
}

/**
 * Select target based on threat calculation
 */
function selectEnemyTarget(
  enemy: Combatant,
  ability: Ability,
  playerCombatants: Combatant[],
  lastRoundDamage: Map<string, number>,
  lastRoundHealing: Map<string, number>
): Combatant | null {
  const livingPlayers = playerCombatants.filter(p => p.isAlive);

  if (livingPlayers.length === 0) return null;

  // For ally-targeting abilities, find wounded ally
  if (ability.targetType === 'single_ally') {
    // This is for enemy healers
    return enemy; // For now, heal self
  }

  // For player-targeting abilities, calculate threat
  let lowestHpValue = Infinity;
  for (const player of livingPlayers) {
    if (player.stats.currentHp < lowestHpValue) {
      lowestHpValue = player.stats.currentHp;
    }
  }

  const threats: { combatant: Combatant; threat: number }[] = [];

  for (const player of livingPlayers) {
    const damage = lastRoundDamage.get(player.id) ?? 0;
    const healing = lastRoundHealing.get(player.id) ?? 0;
    const isLowestHp = player.stats.currentHp === lowestHpValue;

    const threat = calculateThreat(
      player,
      damage,
      healing,
      {
        currentHp: 0.3,
        damageDealtLastRound: 1.0,
        healingDoneLastRound: 1.2,
        hasTaunt: 999,
        isLowestHp: 0.5,
        buffCount: 0.2,
        debuffCount: -0.1,
      },
      isLowestHp
    );

    threats.push({ combatant: player, threat });
  }

  // Sort by threat descending
  threats.sort((a, b) => b.threat - a.threat);

  return threats[0].combatant;
}

/**
 * Sort action queue by initiative
 */
export function sortActionQueue(
  actionQueue: CombatAction[],
  playerCombatants: Combatant[],
  enemyCombatants: Combatant[]
): CombatAction[] {
  const allCombatants = [...playerCombatants, ...enemyCombatants];

  const actionsWithMetadata = actionQueue.map(action => {
    const actor = allCombatants.find(c => c.id === action.actorId);
    return {
      action,
      initiative: action.initiative,
      actorId: action.actorId,
      actorType: actor?.type || 'player',
      actorHp: actor?.stats.currentHp || 0,
    };
  });

  actionsWithMetadata.sort(compareInitiative);

  return actionsWithMetadata.map(a => a.action);
}

/**
 * Check if combat is over
 */
export function checkCombatEnd(
  playerCombatants: Combatant[],
  enemyCombatants: Combatant[]
): 'player_victory' | 'player_defeat' | 'ongoing' {
  const livingPlayers = playerCombatants.filter(c => c.isAlive);
  const livingEnemies = enemyCombatants.filter(c => c.isAlive);

  if (livingPlayers.length === 0) return 'player_defeat';
  if (livingEnemies.length === 0) return 'player_victory';
  return 'ongoing';
}
