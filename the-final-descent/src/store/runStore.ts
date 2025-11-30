/**
 * Run State Management
 * Manages the overall game run (floors, party, progression)
 */

import { create } from 'zustand';
import type { Node, Combatant, Item } from '../types/core';
import { FLOOR_CONSTANTS } from '../types/core';
import { generateFloorMap, unlockPathsFromNode, isFloorComplete } from '../engine/mapGenerator';
import {
  enterNode,
  applyMemoryHealing,
  applyRestChoice,
  applyHazardDamage,
  getCombatEnemies,
  type NodeResult,
  type NodeChoice,
} from '../engine/nodeResolver';
import { createPlayerCombatant } from '../utils/combatFactory';

interface RunState {
  // Run progression
  currentFloor: number;
  isRunActive: boolean;

  // Party
  party: Combatant[];
  deadCharacterIds: string[]; // Characters who died during this run

  // Resources
  gold: number;
  inventory: Item[];
  memoryFragments: number;

  // Current floor
  floorNodes: Map<string, Node>;
  currentNodeId: string | null;
  currentNodeResult: NodeResult | null;

  // Combat integration
  combatActive: boolean;
  combatEnemies: Combatant[];

  // Log
  runLog: string[];

  // Actions
  startRun: (characterIds: string[]) => void;
  advanceToNextFloor: () => void;
  enterNode: (nodeId: string) => void;
  completeNode: (nodeId: string) => void;
  startCombatFromNode: () => Combatant[];
  completeCombat: (victory: boolean) => void;
  applyNodeReward: (healing?: Map<string, number>) => void;
  makeRestChoice: (choice: NodeChoice) => void;
  purchaseItem: (item: Item) => boolean;
  levelUpParty: () => void;
  checkpoint: () => void;
  endRun: (reason: 'victory' | 'defeat' | 'give_up') => void;
  reset: () => void;
}

export const useRunStore = create<RunState>((set, get) => ({
  // Initial state
  currentFloor: 0,
  isRunActive: false,
  party: [],
  deadCharacterIds: [],
  gold: 0,
  inventory: [],
  memoryFragments: 0,
  floorNodes: new Map(),
  currentNodeId: null,
  currentNodeResult: null,
  combatActive: false,
  combatEnemies: [],
  runLog: [],

  // Start a new run
  startRun: (characterIds: string[]) => {
    if (characterIds.length !== 3) {
      console.error('Must select exactly 3 characters');
      return;
    }

    // Create party
    const party = characterIds.map(id => createPlayerCombatant(id, 1));

    set({
      isRunActive: true,
      currentFloor: 1,
      party,
      deadCharacterIds: [],
      gold: 0,
      inventory: [],
      runLog: ['Run started!', `Party: ${party.map(c => c.name).join(', ')}`],
    });

    // Generate first floor
    get().advanceToNextFloor();
  },

  // Advance to next floor
  advanceToNextFloor: () => {
    const state = get();
    const nextFloor = state.currentFloor === 0 ? 1 : state.currentFloor + 1;

    if (nextFloor > FLOOR_CONSTANTS.TOTAL_FLOORS) {
      set({
        runLog: [...state.runLog, '', '=== RUN COMPLETE ==='],
      });
      return;
    }

    // Generate floor map
    const floorNodes = generateFloorMap(nextFloor);

    set({
      currentFloor: nextFloor,
      floorNodes,
      currentNodeId: null,
      currentNodeResult: null,
      runLog: [
        ...state.runLog,
        '',
        `=== FLOOR ${nextFloor} ===`,
        'The descent continues...',
      ],
    });
  },

  // Enter a node
  enterNode: (nodeId: string) => {
    const state = get();
    const node = state.floorNodes.get(nodeId);

    if (!node || node.status !== 'available') {
      console.error('Node not available', nodeId);
      return;
    }

    // Resolve node
    const result = enterNode(node, state.currentFloor);

    set({
      currentNodeId: nodeId,
      currentNodeResult: result,
      runLog: [
        ...state.runLog,
        '',
        `Entered ${node.type} node`,
      ],
    });

    // If combat required, prepare enemies
    if (result.combatRequired) {
      const enemies = getCombatEnemies(node, state.currentFloor);
      set({
        combatEnemies: enemies,
        runLog: [
          ...get().runLog,
          `Enemies: ${enemies.map(e => e.name).join(', ')}`,
        ],
      });
    }
  },

  // Complete a node (unlock paths)
  completeNode: (nodeId: string) => {
    const state = get();
    const updatedNodes = unlockPathsFromNode(nodeId, state.floorNodes);

    set({
      floorNodes: updatedNodes,
      currentNodeId: null,
      currentNodeResult: null,
      runLog: [
        ...state.runLog,
        'Node completed! New paths revealed.',
      ],
    });

    // Check if floor is complete
    if (isFloorComplete(updatedNodes)) {
      get().levelUpParty();

      set({
        runLog: [
          ...get().runLog,
          '',
          '=== FLOOR COMPLETE ===',
          'Party levels up!',
        ],
      });
    }
  },

  // Start combat from current node
  startCombatFromNode: () => {
    const state = get();

    set({
      combatActive: true,
    });

    return state.combatEnemies;
  },

  // Complete combat
  completeCombat: (victory: boolean) => {
    const state = get();

    if (!victory) {
      // Combat lost
      set({
        combatActive: false,
        runLog: [...state.runLog, '', 'Combat failed!'],
      });
      return;
    }

    // Victory - award gold
    const goldReward = 10 + (state.combatEnemies.length * 5);

    // Boss bonus
    const node = state.floorNodes.get(state.currentNodeId || '');
    const isBoss = node?.type === 'boss';
    const bossBonus = isBoss ? state.currentFloor * 100 : 0;

    set({
      combatActive: false,
      gold: state.gold + goldReward + bossBonus,
      runLog: [
        ...state.runLog,
        `Victory! Earned ${goldReward + bossBonus} gold.`,
      ],
    });

    // Complete the node
    if (state.currentNodeId) {
      get().completeNode(state.currentNodeId);
    }
  },

  // Apply node rewards (healing, items, etc.)
  applyNodeReward: (healing?: Map<string, number>) => {
    const state = get();
    const result = state.currentNodeResult;

    if (!result) return;

    // Apply healing
    if (healing) {
      for (const [combatantId, healAmount] of healing.entries()) {
        const member = state.party.find(c => c.id === combatantId);
        if (member) {
          member.stats.currentHp = Math.min(
            member.stats.maxHp,
            member.stats.currentHp + healAmount
          );
        }
      }
    }

    // Apply gold reward
    if (result.rewards?.gold) {
      set({ gold: state.gold + result.rewards.gold });
    }

    // Apply memory fragments
    if (result.nodeType === 'story') {
      set({ memoryFragments: state.memoryFragments + 10 });
    }

    // Complete node
    if (state.currentNodeId) {
      get().completeNode(state.currentNodeId);
    }
  },

  // Make rest choice
  makeRestChoice: (choice: NodeChoice) => {
    const state = get();
    const healing = applyRestChoice(choice, state.party);

    // Apply healing
    for (const [combatantId, healAmount] of healing.entries()) {
      const member = state.party.find(c => c.id === combatantId);
      if (member) {
        member.stats.currentHp = Math.min(
          member.stats.maxHp,
          member.stats.currentHp + healAmount
        );
      }
    }

    // Apply other effects
    if (choice.effect === 'remove_debuffs') {
      state.party.forEach(c => {
        c.statusEffects = [];
      });
    }

    if (choice.effect === 'reduce_cooldowns') {
      state.party.forEach(c => {
        const updatedCooldowns = new Map<string, number>();
        for (const [abilityId, remaining] of c.cooldowns.entries()) {
          const newRemaining = Math.max(0, remaining - 1);
          if (newRemaining > 0) {
            updatedCooldowns.set(abilityId, newRemaining);
          }
        }
        c.cooldowns = updatedCooldowns;
      });
    }

    set({
      runLog: [...state.runLog, `Rest choice: ${choice.description}`],
    });

    // Complete node
    if (state.currentNodeId) {
      get().completeNode(state.currentNodeId);
    }
  },

  // Purchase item from shop
  purchaseItem: (item: Item) => {
    const state = get();

    // Check if player has enough gold
    if (state.gold < item.cost) {
      set({
        runLog: [...state.runLog, `Not enough gold! Need ${item.cost}, have ${state.gold}`],
      });
      return false;
    }

    // Check inventory space (max 6 items)
    if (state.inventory.length >= 6) {
      set({
        runLog: [...state.runLog, 'Inventory full! (Max 6 items)'],
      });
      return false;
    }

    // Purchase item
    set({
      gold: state.gold - item.cost,
      inventory: [...state.inventory, item],
      runLog: [...state.runLog, `Purchased ${item.name} for ${item.cost} gold`],
    });

    return true;
  },

  // Level up party
  levelUpParty: () => {
    const state = get();

    state.party.forEach(member => {
      member.level += 1;

      // Full heal on level up
      member.stats.currentHp = member.stats.maxHp;
    });

    set({
      runLog: [...state.runLog, `Party is now level ${state.party[0]?.level || 1}!`],
    });
  },

  // Checkpoint (restart current floor)
  checkpoint: () => {
    const state = get();

    // Reset party HP
    state.party.forEach(member => {
      if (member.isAlive) {
        member.stats.currentHp = member.stats.maxHp;
        member.statusEffects = [];
        member.cooldowns.clear();
      }
    });

    // Regenerate floor
    const floorNodes = generateFloorMap(state.currentFloor);

    set({
      floorNodes,
      currentNodeId: null,
      currentNodeResult: null,
      combatActive: false,
      runLog: [
        ...state.runLog,
        '',
        '=== CHECKPOINT ===',
        'Restarting floor with full HP...',
      ],
    });
  },

  // End run
  endRun: (reason: 'victory' | 'defeat' | 'give_up') => {
    const state = get();

    set({
      isRunActive: false,
      runLog: [
        ...state.runLog,
        '',
        `=== RUN ENDED: ${reason.toUpperCase()} ===`,
        `Final floor: ${state.currentFloor}`,
        `Gold earned: ${state.gold}`,
        `Memory fragments: ${state.memoryFragments}`,
      ],
    });
  },

  // Reset
  reset: () => {
    set({
      currentFloor: 0,
      isRunActive: false,
      party: [],
      deadCharacterIds: [],
      gold: 0,
      inventory: [],
      memoryFragments: 0,
      floorNodes: new Map(),
      currentNodeId: null,
      currentNodeResult: null,
      combatActive: false,
      combatEnemies: [],
      runLog: [],
    });
  },
}));
