/**
 * Combat Factory - Create combatants for testing
 */

import type { Combatant, Character, Enemy } from '../types/core';
import { getCharacter } from '../data/characters';
import { getCommonEnemy, getBoss } from '../data/enemies';
import { scaleEnemyStats } from '../engine/calculations';

/**
 * Create a player combatant from a character
 */
export function createPlayerCombatant(
  characterId: string,
  level: number = 1,
  instanceId?: string
): Combatant {
  const character = getCharacter(characterId);

  return {
    id: instanceId || `player_${characterId}_${Date.now()}`,
    type: 'player',
    characterId: character.id,
    name: character.name,
    stats: {
      hp: character.baseStats.hp,
      maxHp: character.baseStats.hp,
      currentHp: character.baseStats.hp,
      con: character.baseStats.con,
      spd: character.baseStats.spd,
    },
    level,
    statusEffects: [],
    isAlive: true,
    cooldowns: new Map(),
  };
}

/**
 * Create an enemy combatant
 */
export function createEnemyCombatant(
  enemyId: string,
  floor: number = 1,
  instanceId?: string
): Combatant {
  const enemy = getCommonEnemy(enemyId);
  const scaledStats = scaleEnemyStats(enemy.baseStats, floor);

  return {
    id: instanceId || `enemy_${enemyId}_${Date.now()}_${Math.random()}`,
    type: 'enemy',
    enemyId: enemy.id,
    name: enemy.name,
    stats: {
      hp: scaledStats.hp,
      maxHp: scaledStats.hp,
      currentHp: scaledStats.hp,
      con: scaledStats.con,
      spd: scaledStats.spd,
    },
    level: floor,
    statusEffects: [],
    isAlive: true,
    cooldowns: new Map(),
  };
}

/**
 * Create a boss combatant
 */
export function createBossCombatant(
  floor: number,
  instanceId?: string
): Combatant {
  const boss = getBoss(floor);
  // Boss stats are already scaled in the data

  return {
    id: instanceId || `boss_floor${floor}_${Date.now()}`,
    type: 'enemy',
    enemyId: boss.id,
    name: boss.name,
    stats: {
      hp: boss.baseStats.hp,
      maxHp: boss.baseStats.hp,
      currentHp: boss.baseStats.hp,
      con: boss.baseStats.con,
      spd: boss.baseStats.spd,
    },
    level: floor,
    statusEffects: [],
    isAlive: true,
    cooldowns: new Map(),
  };
}

/**
 * Create a test party (3 random characters)
 */
export function createTestParty(level: number = 1): Combatant[] {
  const characterIds = ['dranick', 'eline', 'varro'];

  return characterIds.map(id => createPlayerCombatant(id, level));
}

/**
 * Create a test enemy group
 */
export function createTestEnemyGroup(floor: number = 1, count: number = 3): Combatant[] {
  const enemyTypes = ['writhing_shadow', 'stone_sentinel', 'void_archer'];
  const enemies: Combatant[] = [];

  for (let i = 0; i < Math.min(count, enemyTypes.length); i++) {
    enemies.push(createEnemyCombatant(enemyTypes[i], floor));
  }

  return enemies;
}
