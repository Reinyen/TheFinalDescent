/**
 * Node Resolution System
 * Handles entering and resolving different node types
 */

import type { Node, Combatant, Item } from '../types/core';
import { FLOOR_CONSTANTS } from '../types/core';
import { createEnemyCombatant, createBossCombatant } from '../utils/combatFactory';
import { distributeHealing } from './calculations';

export interface NodeResult {
  nodeType: string;
  completed: boolean;
  rewards?: {
    gold?: number;
    items?: Item[];
    healing?: number;
    lore?: string;
  };
  combatRequired?: boolean;
  choices?: NodeChoice[];
}

export interface NodeChoice {
  id: string;
  description: string;
  effect: 'heal' | 'remove_debuffs' | 'reduce_cooldowns';
}

/**
 * Enter a node and get the encounter/event
 */
export function enterNode(node: Node, floor: number): NodeResult {
  switch (node.type) {
    case 'combat':
      return {
        nodeType: 'combat',
        completed: false,
        combatRequired: true,
      };

    case 'boss':
      return {
        nodeType: 'boss',
        completed: false,
        combatRequired: true,
      };

    case 'memory':
      return resolveMemoryNode(node, floor);

    case 'shop':
      return resolveShopNode(node, floor);

    case 'rest':
      return resolveRestNode();

    case 'hazard':
      return resolveHazardNode(floor);

    case 'story':
      return resolveStoryNode(node);

    default:
      return {
        nodeType: 'unknown',
        completed: true,
      };
  }
}

/**
 * Resolve memory node
 * GDD Section 12.3: Lore + 20% max HP heal (distributed evenly, remainder to lowest HP)
 */
function resolveMemoryNode(node: Node, floor: number): NodeResult {
  return {
    nodeType: 'memory',
    completed: true,
    rewards: {
      lore: node.encounterData?.loreId || `Memory Fragment - Floor ${floor}`,
      gold: 50, // Memory node bonus from GDD
    },
  };
}

/**
 * Apply memory node healing
 * GDD: 20% of total party max HP, distributed evenly, remainder to lowest HP
 */
export function applyMemoryHealing(party: Combatant[]): Map<string, number> {
  const livingMembers = party.filter(c => c.isAlive);

  if (livingMembers.length === 0) return new Map();

  // Calculate total party max HP (living members only)
  const totalMaxHp = livingMembers.reduce((sum, c) => sum + c.stats.maxHp, 0);
  const totalHealing = Math.floor(totalMaxHp * FLOOR_CONSTANTS.MEMORY_HEAL_PERCENT);

  // Distribute healing
  return distributeHealing(totalHealing, livingMembers);
}

/**
 * Resolve shop node
 */
function resolveShopNode(node: Node, floor: number): NodeResult {
  // Generate shop inventory based on seed
  // For now, return basic structure

  return {
    nodeType: 'shop',
    completed: true,
    rewards: {
      // Shop doesn't give automatic rewards, player chooses items
    },
  };
}

/**
 * Resolve rest node
 * GDD Section 6.3: Player chooses one of three options
 */
function resolveRestNode(): NodeResult {
  return {
    nodeType: 'rest',
    completed: true,
    choices: [
      {
        id: 'heal',
        description: 'Heal 40% max HP for the party',
        effect: 'heal',
      },
      {
        id: 'cleanse',
        description: 'Remove all debuffs from all party members',
        effect: 'remove_debuffs',
      },
      {
        id: 'cooldowns',
        description: 'Reduce all cooldowns by 1',
        effect: 'reduce_cooldowns',
      },
    ],
  };
}

/**
 * Apply rest node choice
 */
export function applyRestChoice(
  choice: NodeChoice,
  party: Combatant[]
): Map<string, number> {
  const healingMap = new Map<string, number>();
  const livingMembers = party.filter(c => c.isAlive);

  switch (choice.effect) {
    case 'heal':
      const totalMaxHp = livingMembers.reduce((sum, c) => sum + c.stats.maxHp, 0);
      const totalHealing = Math.floor(totalMaxHp * 0.4);
      return distributeHealing(totalHealing, livingMembers);

    case 'remove_debuffs':
      // Handled in UI/store
      return healingMap;

    case 'reduce_cooldowns':
      // Handled in UI/store
      return healingMap;
  }

  return healingMap;
}

/**
 * Resolve hazard node
 * GDD Section 6.3: Trap deals damage, 50% chance to gain rare item
 */
function resolveHazardNode(floor: number): NodeResult {
  const baseDamage = 15;
  const damage = baseDamage + (floor * 2); // Scales with floor

  // 50% chance for item
  const gainItem = Math.random() < 0.5;

  return {
    nodeType: 'hazard',
    completed: true,
    rewards: {
      // Damage is applied in the store/UI
      items: gainItem ? [] : undefined, // Placeholder for rare item
    },
  };
}

/**
 * Apply hazard damage to party
 */
export function applyHazardDamage(party: Combatant[], damage: number): void {
  const livingMembers = party.filter(c => c.isAlive);

  // Distribute damage evenly
  const damagePerMember = Math.floor(damage / livingMembers.length);

  for (const member of livingMembers) {
    member.stats.currentHp = Math.max(0, member.stats.currentHp - damagePerMember);
    if (member.stats.currentHp === 0) {
      member.isAlive = false;
    }
  }
}

/**
 * Resolve story node
 * GDD Section 6.3: Lore + meta-progression currency
 */
function resolveStoryNode(node: Node): NodeResult {
  return {
    nodeType: 'story',
    completed: true,
    rewards: {
      lore: node.encounterData?.loreId || 'A fragment of forgotten history...',
      gold: 10, // Memory Fragments (meta currency)
    },
  };
}

/**
 * Get enemies for combat node
 */
export function getCombatEnemies(node: Node, floor: number): Combatant[] {
  if (!node.encounterData?.enemyIds) return [];

  if (node.type === 'boss') {
    return [createBossCombatant(floor)];
  }

  // Regular combat
  return node.encounterData.enemyIds.map(enemyId =>
    createEnemyCombatant(enemyId, floor)
  );
}
