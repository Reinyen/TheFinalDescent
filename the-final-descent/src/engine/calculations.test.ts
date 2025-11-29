/**
 * Unit tests for core calculation functions
 */

import { describe, it, expect } from 'vitest';
import {
  calculateFinalValue,
  calculateComboCON,
  calculateInitiative,
  compareInitiative,
  calculateSPRegen,
  scaleEnemyStats,
} from './calculations';
import type { Combatant } from '../types/core';

describe('calculateFinalValue', () => {
  it('should calculate damage for level 1 character', () => {
    // Set Value 12, CON 9, Level 1
    // Formula: 12 + ceil(9 * 0.5) = 12 + 5 = 17
    const result = calculateFinalValue(12, 9, 1);
    expect(result).toBe(17);
  });

  it('should calculate damage for level 5 character', () => {
    // Set Value 20, CON 10, Level 5
    // Formula: 20 + ceil(10 * 0.9) = 20 + 9 = 29
    const result = calculateFinalValue(20, 10, 5);
    expect(result).toBe(29);
  });

  it('should calculate damage for level 10 character', () => {
    // Set Value 15, CON 8, Level 10
    // Formula: 15 + ceil(8 * 1.4) = 15 + 12 = 27
    const result = calculateFinalValue(15, 8, 10);
    expect(result).toBe(27);
  });

  it('should handle zero set value (buff-only abilities)', () => {
    const result = calculateFinalValue(0, 9, 3);
    expect(result).toBe(7); // 0 + ceil(9 * 0.7) = 7
  });
});

describe('calculateComboCON', () => {
  it('should calculate average CON for duo combo and round up', () => {
    const participants: Combatant[] = [
      {
        id: 'p1',
        type: 'player',
        characterId: 'dranick',
        name: 'Dranick',
        stats: { hp: 120, maxHp: 120, currentHp: 120, con: 9, spd: 2 },
        level: 1,
        statusEffects: [],
        isAlive: true,
        cooldowns: new Map(),
      },
      {
        id: 'p2',
        type: 'player',
        characterId: 'eline',
        name: 'Eline',
        stats: { hp: 70, maxHp: 70, currentHp: 70, con: 8, spd: 6 },
        level: 1,
        statusEffects: [],
        isAlive: true,
        cooldowns: new Map(),
      },
    ];

    // Average CON = (9 + 8) / 2 = 8.5, rounded up = 9
    const result = calculateComboCON(participants);
    expect(result).toBe(9);
  });

  it('should calculate average CON for trio combo and round up', () => {
    const participants: Combatant[] = [
      {
        id: 'p1',
        type: 'player',
        characterId: 'dranick',
        name: 'Dranick',
        stats: { hp: 120, maxHp: 120, currentHp: 120, con: 9, spd: 2 },
        level: 1,
        statusEffects: [],
        isAlive: true,
        cooldowns: new Map(),
      },
      {
        id: 'p2',
        type: 'player',
        characterId: 'varro',
        name: 'Varro',
        stats: { hp: 90, maxHp: 90, currentHp: 90, con: 8, spd: 4 },
        level: 1,
        statusEffects: [],
        isAlive: true,
        cooldowns: new Map(),
      },
      {
        id: 'p3',
        type: 'player',
        characterId: 'grim',
        name: 'Grim',
        stats: { hp: 110, maxHp: 110, currentHp: 110, con: 6, spd: 3 },
        level: 1,
        statusEffects: [],
        isAlive: true,
        cooldowns: new Map(),
      },
    ];

    // Average CON = (9 + 8 + 6) / 3 = 7.67, rounded up = 8
    const result = calculateComboCON(participants);
    expect(result).toBe(8);
  });
});

describe('calculateInitiative', () => {
  it('should calculate base initiative without modifiers', () => {
    const combatant: Combatant = {
      id: 'p1',
      type: 'player',
      characterId: 'eline',
      name: 'Eline',
      stats: { hp: 70, maxHp: 70, currentHp: 70, con: 8, spd: 6 },
      level: 1,
      statusEffects: [],
      isAlive: true,
      cooldowns: new Map(),
    };

    // Initiative = SPD (6) + speedMod (4) = 10
    const result = calculateInitiative(combatant, 4);
    expect(result).toBe(10);
  });

  it('should apply HASTE buff to initiative', () => {
    const combatant: Combatant = {
      id: 'p1',
      type: 'player',
      characterId: 'eline',
      name: 'Eline',
      stats: { hp: 70, maxHp: 70, currentHp: 70, con: 8, spd: 6 },
      level: 1,
      statusEffects: [{ statusId: 'haste', duration: 2, magnitude: 4, source: 'test' }],
      isAlive: true,
      cooldowns: new Map(),
    };

    // Initiative = SPD (6) + HASTE (4) + speedMod (0) = 10
    const result = calculateInitiative(combatant, 0);
    expect(result).toBe(10);
  });

  it('should apply FRACTURED debuff to initiative', () => {
    const combatant: Combatant = {
      id: 'p1',
      type: 'player',
      characterId: 'dranick',
      name: 'Dranick',
      stats: { hp: 120, maxHp: 120, currentHp: 120, con: 9, spd: 2 },
      level: 1,
      statusEffects: [{ statusId: 'fractured', duration: 2, magnitude: 2, source: 'test' }],
      isAlive: true,
      cooldowns: new Map(),
    };

    // Initiative = SPD (2) - FRACTURED (2) + speedMod (0) = 0
    const result = calculateInitiative(combatant, 0);
    expect(result).toBe(0);
  });
});

describe('compareInitiative', () => {
  it('should prioritize higher initiative', () => {
    const a = { initiative: 10, actorId: 'p1', actorType: 'player' as const, actorHp: 100 };
    const b = { initiative: 5, actorId: 'e1', actorType: 'enemy' as const, actorHp: 50 };

    const result = compareInitiative(a, b);
    expect(result).toBeLessThan(0); // a goes first
  });

  it('should break ties with player > enemy', () => {
    const a = { initiative: 10, actorId: 'p1', actorType: 'player' as const, actorHp: 100 };
    const b = { initiative: 10, actorId: 'e1', actorType: 'enemy' as const, actorHp: 50 };

    const result = compareInitiative(a, b);
    expect(result).toBeLessThan(0); // player goes first
  });

  it('should break ties among players with higher HP first', () => {
    const a = { initiative: 10, actorId: 'p1', actorType: 'player' as const, actorHp: 120 };
    const b = { initiative: 10, actorId: 'p2', actorType: 'player' as const, actorHp: 70 };

    const result = compareInitiative(a, b);
    expect(result).toBeLessThan(0); // higher HP goes first
  });
});

describe('calculateSPRegen', () => {
  it('should calculate full regen with no deaths', () => {
    const result = calculateSPRegen(3, 0);
    expect(result).toBe(6); // Base 6, no penalty
  });

  it('should reduce regen with 1 death', () => {
    const result = calculateSPRegen(3, 1);
    expect(result).toBe(3); // Base 6 - 3 = 3
  });

  it('should reduce regen with 2 deaths', () => {
    const result = calculateSPRegen(3, 2);
    expect(result).toBe(1); // Base 6 - 6 = 0, clamped to 1
  });

  it('should clamp regen at minimum 1', () => {
    const result = calculateSPRegen(3, 3);
    expect(result).toBe(1); // Base 6 - 9 = -3, clamped to 1
  });
});

describe('scaleEnemyStats', () => {
  it('should not scale on floor 1', () => {
    const baseStats = { hp: 40, con: 6, spd: 5 };
    const result = scaleEnemyStats(baseStats, 1);

    expect(result).toEqual({ hp: 40, con: 6, spd: 5 });
  });

  it('should scale correctly on floor 5', () => {
    const baseStats = { hp: 40, con: 6, spd: 5 };
    const result = scaleEnemyStats(baseStats, 5);

    // Floor 5 multipliers: HP 2.2x, CON 1.5x, SPD 1.1x
    expect(result).toEqual({
      hp: Math.floor(40 * 2.2), // 88
      con: Math.floor(6 * 1.5), // 9
      spd: Math.floor(5 * 1.1), // 5
    });
  });

  it('should scale correctly on floor 10', () => {
    const baseStats = { hp: 40, con: 6, spd: 5 };
    const result = scaleEnemyStats(baseStats, 10);

    // Floor 10 multipliers: HP 4.0x, CON 2.5x, SPD 1.5x
    expect(result).toEqual({
      hp: Math.floor(40 * 4.0), // 160
      con: Math.floor(6 * 2.5), // 15
      spd: Math.floor(5 * 1.5), // 7
    });
  });
});
