/**
 * Combat State Management with Zustand
 */

import { create } from 'zustand';
import type { Combatant, Ability, CombatAction, Item } from '../types/core';
import { COMBAT_CONSTANTS } from '../types/core';
import {
  initializeCombat,
  generateActionOffer,
  queueAction,
  queueDefend,
  generateEnemyActions,
  sortActionQueue,
  checkCombatEnd,
} from '../engine/combatEngine';
import { resolveAction } from '../engine/actionResolver';
import { processStatusEffects, tickCooldowns } from '../engine/statusEffects';
import { calculateSPRegen } from '../engine/calculations';

interface CombatState {
  // Combat state
  round: number;
  currentSP: number;
  maxSP: number;
  spRegen: number;
  playerCombatants: Combatant[];
  enemyCombatants: Combatant[];
  actionQueue: CombatAction[];
  combatLog: string[];
  isPlayerTurn: boolean;
  defendActive: boolean;
  offeredActions: Ability[];
  combatStatus: 'setup' | 'player_turn' | 'resolving' | 'ended';
  combatResult: 'ongoing' | 'player_victory' | 'player_defeat';

  // Inventory
  availableItems: Item[];
  usedItemThisRound: boolean;
  resurrectionUsed: boolean; // Phoenix Feather can only be used once per combat

  // Tracking for AI
  lastRoundDamage: Map<string, number>;
  lastRoundHealing: Map<string, number>;

  // Actions
  startCombat: (players: Combatant[], enemies: Combatant[], inventory?: Item[]) => void;
  queuePlayerAction: (ability: Ability, actorIds: string[], targetIds: string[]) => void;
  queuePlayerDefend: (actorId: string) => void;
  queuePlayerItem: (item: Item, targetId?: string) => void;
  commitPlayerActions: () => void;
  resolveNextAction: () => void;
  nextRound: () => void;
  reset: () => void;
}

export const useCombatStore = create<CombatState>((set, get) => ({
  // Initial state
  round: 0,
  currentSP: 0,
  maxSP: COMBAT_CONSTANTS.MAX_SP,
  spRegen: 0,
  playerCombatants: [],
  enemyCombatants: [],
  actionQueue: [],
  combatLog: [],
  isPlayerTurn: false,
  defendActive: false,
  offeredActions: [],
  combatStatus: 'setup',
  combatResult: 'ongoing',
  availableItems: [],
  usedItemThisRound: false,
  resurrectionUsed: false,
  lastRoundDamage: new Map(),
  lastRoundHealing: new Map(),

  // Start a new combat
  startCombat: (players: Combatant[], enemies: Combatant[], inventory: Item[] = []) => {
    const combat = initializeCombat(players, enemies);

    set({
      ...combat,
      maxSP: COMBAT_CONSTANTS.MAX_SP,
      combatStatus: 'player_turn',
      combatResult: 'ongoing',
      availableItems: inventory,
      usedItemThisRound: false,
      resurrectionUsed: false,
      lastRoundDamage: new Map(),
      lastRoundHealing: new Map(),
      offeredActions: generateActionOffer(players, combat.currentSP),
    });
  },

  // Queue a player action
  queuePlayerAction: (ability: Ability, actorIds: string[], targetIds: string[]) => {
    const state = get();

    // Check if can afford
    if (state.currentSP < ability.spCost) {
      set({
        combatLog: [...state.combatLog, `Not enough SP! Need ${ability.spCost}, have ${state.currentSP}`],
      });
      return;
    }

    const newQueue = queueAction(
      ability,
      actorIds,
      targetIds,
      state.playerCombatants,
      state.actionQueue
    );

    set({
      actionQueue: newQueue,
      currentSP: state.currentSP - ability.spCost,
      combatLog: [...state.combatLog, `Queued ${ability.name} (${ability.spCost} SP)`],
    });
  },

  // Queue defend action
  queuePlayerDefend: (actorId: string) => {
    const state = get();

    // Clear existing actions (Defend replaces everything)
    set({
      actionQueue: [],
      currentSP: state.currentSP, // Refund SP from cleared actions (simplified)
      defendActive: true,
      combatLog: [...state.combatLog, 'Defend selected - action queue cleared'],
    });

    const newQueue = queueDefend(actorId, state.playerCombatants, []);

    set({
      actionQueue: newQueue,
      combatLog: [...get().combatLog, 'Defend action queued'],
    });
  },

  // Use an item
  queuePlayerItem: (item: Item, targetId?: string) => {
    const state = get();

    // Check if item already used this round
    if (state.usedItemThisRound) {
      set({
        combatLog: [...state.combatLog, 'Can only use 1 item per round!'],
      });
      return;
    }

    // Check phoenix feather special case
    if (item.id === 'phoenix_feather' && state.resurrectionUsed) {
      set({
        combatLog: [...state.combatLog, 'Phoenix Feather already used this combat!'],
      });
      return;
    }

    // Apply item effect immediately
    const log: string[] = [`Used ${item.name}`];

    switch (item.type) {
      case 'healing_potion': {
        // Restore 30 HP to single ally
        const target = state.playerCombatants.find(c => c.id === targetId);
        if (target && target.isAlive) {
          const healAmount = 30;
          const actualHeal = Math.min(healAmount, target.stats.maxHp - target.stats.currentHp);
          target.stats.currentHp = Math.min(target.stats.maxHp, target.stats.currentHp + healAmount);
          log.push(`${target.name} healed ${actualHeal} HP`);
        }
        break;
      }

      case 'sp_potion': {
        // Gain +3 SP
        const newSP = Math.min(COMBAT_CONSTANTS.MAX_SP, state.currentSP + 3);
        const gain = newSP - state.currentSP;
        set({ currentSP: newSP });
        log.push(`Gained ${gain} SP`);
        break;
      }

      case 'temp_buff': {
        // Handle various temp buffs
        if (item.id === 'smoke_bomb') {
          // All allies gain 30% evasion for 2 rounds
          for (const ally of state.playerCombatants.filter(c => c.isAlive)) {
            ally.statusEffects.push({
              statusId: 'evasion',
              duration: 2,
              magnitude: 30,
              source: 'smoke_bomb',
            });
          }
          log.push('All allies gain 30% evasion (2 rounds)');
        } else if (item.id === 'cleansing_salve') {
          // Remove all debuffs from single target
          const target = state.playerCombatants.find(c => c.id === targetId);
          if (target && target.isAlive) {
            const debuffCount = target.statusEffects.filter(s =>
              ['fractured', 'bleed', 'weakness'].includes(s.statusId)
            ).length;
            target.statusEffects = target.statusEffects.filter(s =>
              !['fractured', 'bleed', 'weakness'].includes(s.statusId)
            );
            log.push(`Removed ${debuffCount} debuff(s) from ${target.name}`);
          }
        } else if (item.id === 'berserker_brew') {
          // Target gains +5 CON but -3 SPD (3 rounds)
          const target = state.playerCombatants.find(c => c.id === targetId);
          if (target && target.isAlive) {
            target.stats.con += 5;
            target.stats.spd -= 3;
            // Store for cleanup after 3 rounds (simplified - would need better tracking)
            log.push(`${target.name} gains +5 CON, -3 SPD (3 rounds)`);
          }
        } else if (item.id === 'temporal_crystal') {
          // Reset all cooldowns for single character
          const target = state.playerCombatants.find(c => c.id === targetId);
          if (target && target.isAlive) {
            const cooldownCount = target.cooldowns.size;
            target.cooldowns.clear();
            log.push(`Reset ${cooldownCount} cooldown(s) for ${target.name}`);
          }
        } else if (item.id === 'void_shard') {
          // Next ability costs 0 SP (would need buff tracking for this)
          // For now, just add SP equal to average ability cost
          const newSP = Math.min(COMBAT_CONSTANTS.MAX_SP, state.currentSP + 3);
          set({ currentSP: newSP });
          log.push('Next ability costs less SP');
        }
        break;
      }

      case 'resurrect': {
        // Revive fallen ally at 25% HP
        const target = state.playerCombatants.find(c => c.id === targetId);
        if (target && !target.isAlive) {
          const reviveHP = Math.floor(target.stats.maxHp * 0.25);
          target.stats.currentHp = reviveHP;
          target.isAlive = true;
          target.statusEffects = [];
          set({ resurrectionUsed: true });
          log.push(`${target.name} revived at ${reviveHP} HP!`);
        }
        break;
      }

      default:
        log.push('Item type not usable in combat');
        return;
    }

    // Remove item from inventory
    const updatedInventory = state.availableItems.filter(i => i.id !== item.id || i !== item);

    set({
      availableItems: updatedInventory,
      usedItemThisRound: true,
      combatLog: [...state.combatLog, ...log],
    });
  },

  // Commit player actions and generate enemy actions
  commitPlayerActions: () => {
    const state = get();

    if (state.actionQueue.length === 0 && !state.defendActive) {
      set({
        combatLog: [...state.combatLog, 'No actions queued!'],
      });
      return;
    }

    // Generate enemy actions
    const enemyActions = generateEnemyActions(
      state.enemyCombatants,
      state.playerCombatants,
      state.lastRoundDamage,
      state.lastRoundHealing
    );

    // Combine and sort action queue
    const allActions = [...state.actionQueue, ...enemyActions];
    const sortedActions = sortActionQueue(
      allActions,
      state.playerCombatants,
      state.enemyCombatants
    );

    set({
      actionQueue: sortedActions,
      combatStatus: 'resolving',
      combatLog: [...state.combatLog, '', '--- Resolving Actions ---'],
    });
  },

  // Resolve next action in queue
  resolveNextAction: () => {
    const state = get();

    if (state.actionQueue.length === 0) {
      // All actions resolved, move to next round
      get().nextRound();
      return;
    }

    const [currentAction, ...remainingActions] = state.actionQueue;

    const result = resolveAction(
      currentAction,
      state.playerCombatants,
      state.enemyCombatants,
      state.defendActive
    );

    // Update damage/healing tracking
    for (const [targetId, damage] of result.damageDealt.entries()) {
      state.lastRoundDamage.set(targetId, (state.lastRoundDamage.get(targetId) ?? 0) + damage);
    }

    for (const [targetId, healing] of result.healingDone.entries()) {
      state.lastRoundHealing.set(targetId, (state.lastRoundHealing.get(targetId) ?? 0) + healing);
    }

    // Check if combat ended
    const combatEnd = checkCombatEnd(state.playerCombatants, state.enemyCombatants);

    if (combatEnd !== 'ongoing') {
      set({
        actionQueue: [],
        combatLog: [...state.combatLog, ...result.log, '', `*** ${combatEnd.toUpperCase()} ***`],
        combatStatus: 'ended',
        combatResult: combatEnd,
      });
      return;
    }

    set({
      actionQueue: remainingActions,
      combatLog: [...state.combatLog, ...result.log],
    });
  },

  // Move to next round
  nextRound: () => {
    const state = get();

    // Process status effects
    const statusResults = processStatusEffects([
      ...state.playerCombatants,
      ...state.enemyCombatants,
    ]);

    const statusLog: string[] = [];
    for (const { combatant, damage, healing } of statusResults) {
      if (damage > 0) {
        statusLog.push(`${combatant.name} takes ${damage} damage from status effects`);
      }
      if (healing > 0) {
        statusLog.push(`${combatant.name} heals ${healing} HP from status effects`);
      }
    }

    // Tick cooldowns
    for (const combatant of [...state.playerCombatants, ...state.enemyCombatants]) {
      if (combatant.isAlive) {
        tickCooldowns(combatant);
      }
    }

    // Check if combat ended from status effects
    const combatEnd = checkCombatEnd(state.playerCombatants, state.enemyCombatants);

    if (combatEnd !== 'ongoing') {
      set({
        combatLog: [...state.combatLog, ...statusLog, '', `*** ${combatEnd.toUpperCase()} ***`],
        combatStatus: 'ended',
        combatResult: combatEnd,
      });
      return;
    }

    // Regenerate SP
    const totalActiveMembers = state.playerCombatants.length;
    const deadActiveMembers = state.playerCombatants.filter(c => !c.isAlive).length;
    const spRegen = calculateSPRegen(totalActiveMembers, deadActiveMembers);

    const newSP = Math.min(COMBAT_CONSTANTS.MAX_SP, state.currentSP + spRegen);

    // Generate new action offers
    const offers = generateActionOffer(state.playerCombatants, newSP);

    set({
      round: state.round + 1,
      currentSP: newSP,
      spRegen,
      combatLog: [
        ...state.combatLog,
        ...statusLog,
        '',
        `--- Round ${state.round + 1} ---`,
        `SP: ${newSP} (+${spRegen})`,
      ],
      combatStatus: 'player_turn',
      defendActive: false,
      usedItemThisRound: false,
      lastRoundDamage: new Map(),
      lastRoundHealing: new Map(),
      offeredActions: offers,
    });
  },

  // Reset combat
  reset: () => {
    set({
      round: 0,
      currentSP: 0,
      spRegen: 0,
      playerCombatants: [],
      enemyCombatants: [],
      actionQueue: [],
      combatLog: [],
      isPlayerTurn: false,
      defendActive: false,
      offeredActions: [],
      combatStatus: 'setup',
      combatResult: 'ongoing',
      availableItems: [],
      usedItemThisRound: false,
      resurrectionUsed: false,
      lastRoundDamage: new Map(),
      lastRoundHealing: new Map(),
    });
  },
}));
