// =================================================================================
// FILE: entityFactory.js
// Purpose: Factory functions for creating party members and enemies (ES6 Module Version)
// PATCH: Added milestone properties to characters and enemy scaling logic.
// FINAL BLUEPRINT PATCH: Initialized new character properties for shields and boons.
// =================================================================================

import { CHARACTERS_DATA, ENEMIES_DATA, PATHS_DATA, ENEMY_SCALING_DATA } from './data.js';
import { GameState } from './state.js';

export function createParty() {
    const allCharacterIds = Object.keys(CHARACTERS_DATA).sort(() => 0.5 - Math.random());
    const partyIds = allCharacterIds.slice(0, 3);

    return partyIds.map(id => {
        const charData = CHARACTERS_DATA[id];
        const character = {
            id: id,
            name: charData.character_name,
            role: charData.role,
            ...charData.base_stats,
            maxHp: charData.base_stats.hp,
            level: GameState.level,
            isAlive: true,
            isAssignedAction: false,
            isEnemy: false,
            statusEffects: [],
            path: null,
            passives: [],
            dodgeChance: 0,
            milestoneChoices: {},

            // --- BLUEPRINT IMPLEMENTATION ---
            shieldHp: 0,
            activeBoons: [],
            nextCombatEffects: [],
            // --------------------------------

            counters: {}
        };
        updateCharacterStats(character);
        return character;
    });
}

export function createEnemy(enemyId, index) {
    const enemyData = ENEMIES_DATA[enemyId];
    if (!enemyData) return null;

    let baseHp = enemyData.base_stats.base_hp;
    let con = enemyData.base_stats.con;
    let spd = enemyData.base_stats.spd;

    // Apply scaling based on dungeon level
    for (const levelTier in ENEMY_SCALING_DATA) {
        if (GameState.level >= parseInt(levelTier)) {
            const scaling = ENEMY_SCALING_DATA[levelTier];
            baseHp += scaling.hp;
            con += scaling.con;
            spd += scaling.spd;
        }
    }

    const minHp = Math.max(1, baseHp - 13);
    const maxHp = baseHp + 13;
    const startingHp = Math.floor(Math.random() * (maxHp - minHp + 1)) + minHp;

    return {
        id: `${enemyId}_${index}`,
        name: enemyData.display_name,
        ...enemyData.base_stats,
        hp: startingHp,
        maxHp: startingHp,
        con: con,
        spd: spd,
        level: GameState.level,
        isAlive: true,
        isEnemy: true,
        abilities: enemyData.abilities,
        statusEffects: [],
        activeBoons: [], // Add this line
        passives: [],
        counters: {},
    };
}

export function updateCharacterStats(character) {
    if (!character) return;

    let dodgeCap = 1.0;
    if (character.path && PATHS_DATA[character.path]) {
        dodgeCap = PATHS_DATA[character.path].dodgeCap;
    }

    let dodgeBonus = 0;
    character.passives.forEach(passiveId => {
        if (passiveId === 'MAb_b_3' || passiveId === 'MAv_v_1') { // Steadfast or Ghost Step
            dodgeBonus += 0.15;
        }
    });

    const baseDodge = character.spd * 0.015;
    character.dodgeChance = Math.min(baseDodge + dodgeBonus, dodgeCap);
}