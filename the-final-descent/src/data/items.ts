/**
 * Item Data System
 * Defines all items available in the game
 */

import type { Item } from '../types/core';

/**
 * All available items
 * From GDD confirmation: Healing Potion, SP Potion, Skip Node, Resurrect, Permanent Buff, Temp Buff
 */
export const ITEMS: Record<string, Item> = {
  healing_potion: {
    id: 'healing_potion',
    name: 'Healing Potion',
    type: 'healing_potion',
    description: 'Restore 30 HP to a single ally',
    cost: 50,
  },

  stamina_draught: {
    id: 'stamina_draught',
    name: 'Stamina Draught',
    type: 'sp_potion',
    description: 'Gain +3 SP immediately',
    cost: 75,
  },

  smoke_bomb: {
    id: 'smoke_bomb',
    name: 'Smoke Bomb',
    type: 'temp_buff',
    description: 'All allies gain 30% evasion for 2 rounds',
    cost: 60,
  },

  cleansing_salve: {
    id: 'cleansing_salve',
    name: 'Cleansing Salve',
    type: 'temp_buff',
    description: 'Remove all debuffs from single target',
    cost: 40,
  },

  berserker_brew: {
    id: 'berserker_brew',
    name: "Berserker's Brew",
    type: 'temp_buff',
    description: 'Target gains +5 CON but -3 SPD (3 rounds)',
    cost: 100,
  },

  temporal_crystal: {
    id: 'temporal_crystal',
    name: 'Temporal Crystal',
    type: 'temp_buff',
    description: 'Reset all cooldowns for single character',
    cost: 150,
  },

  void_shard: {
    id: 'void_shard',
    name: 'Void Shard',
    type: 'temp_buff',
    description: 'Next ability costs 0 SP',
    cost: 125,
  },

  phoenix_feather: {
    id: 'phoenix_feather',
    name: 'Phoenix Feather',
    type: 'resurrect',
    description: 'Revive fallen ally at 25% HP (once per combat)',
    cost: 200,
  },

  // Map items
  path_compass: {
    id: 'path_compass',
    name: 'Path Compass',
    type: 'skip_node',
    description: 'Skip one non-boss node and still unlock paths',
    cost: 150,
  },

  // Permanent upgrades
  vitality_charm: {
    id: 'vitality_charm',
    name: 'Vitality Charm',
    type: 'permanent_buff',
    description: 'Permanently increase max HP by 10 for one character',
    cost: 300,
  },

  conviction_ring: {
    id: 'conviction_ring',
    name: 'Conviction Ring',
    type: 'permanent_buff',
    description: 'Permanently increase CON by 1 for one character',
    cost: 350,
  },
};

/**
 * Get item by ID
 */
export function getItem(itemId: string): Item {
  const item = ITEMS[itemId];
  if (!item) {
    throw new Error(`Item not found: ${itemId}`);
  }
  return item;
}

/**
 * Get all items
 */
export function getAllItems(): Item[] {
  return Object.values(ITEMS);
}

/**
 * Generate shop inventory
 * Returns 6 random items, scaled by floor
 */
export function generateShopInventory(floor: number, seed?: number): Item[] {
  // Use seed for deterministic generation
  const rng = seed ? seededRandom(seed) : Math.random;

  const allItems = getAllItems();

  // Scale prices by floor
  const priceMultiplier = 1 + (floor - 1) * 0.1; // Floor 1 = 1.0x, Floor 5 = 1.4x, Floor 10 = 1.9x

  // Select 6 random items
  const inventory: Item[] = [];
  const availableItems = [...allItems];

  for (let i = 0; i < 6 && availableItems.length > 0; i++) {
    const randomIndex = Math.floor(rng() * availableItems.length);
    const item = availableItems[randomIndex];

    // Create scaled copy
    inventory.push({
      ...item,
      cost: Math.floor(item.cost * priceMultiplier),
    });

    availableItems.splice(randomIndex, 1);
  }

  return inventory;
}

/**
 * Simple seeded random number generator
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/**
 * Get combat-usable items
 */
export function getCombatItems(): Item[] {
  return getAllItems().filter(item =>
    item.type === 'healing_potion' ||
    item.type === 'sp_potion' ||
    item.type === 'temp_buff' ||
    item.type === 'resurrect'
  );
}
