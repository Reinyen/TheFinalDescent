// =================================================================================
// FILE: data.js
// CORRECTION: All data is now exported as ES6 modules.
// v6: Added data for new Memory and Anomaly node events.
// PATCH: Added all data for the Echoes of Conviction progression system.
// PATCH 6: Added exports for nested milestone data to resolve module errors.
// FINAL BLUEPRINT PATCH: Added 'Taunt' and 'Bleed' status effects.
// =================================================================================

// --- Game Constants ---
export const MAX_STAMINA = 18;
export const STAMINA_REGEN_PER_ROUND = 6;
export const LEVEL_VALUE_TABLE = { 1: 0.5, 2: 0.6, 3: 0.7, 4: 0.8, 5: 0.9, 6: 1.0 };


export const MILESTONE_DATA = {
    //================================================
    // 1. PATHS: Foundational choices at Level 5
    //================================================
    paths: {
        bastion: { id: 'bastion', name: "Path of the Bastion", description: "A defensive anchor focused on damage mitigation, ally protection, and sheer resilience.", autoStat: 'hp', dodgeCap: 0.50 },
        executioner: { id: 'executioner', name: "Path of the Executioner", description: "A relentless damage dealer who excels at consistently breaking down foes.", autoStat: 'con', dodgeCap: 0.25 },
        veilwalker: { id: 'veilwalker', name: "Path of the Veilwalker", description: "An evasive controller who uses high speed and dodge to manipulate the battlefield.", autoStat: 'spd', dodgeCap: 0.75 }
    },

    //================================================
    // 2. ABILITIES: A potential reward pool for Major Milestones
    //================================================
    abilities: {
        bastion: [
            { id: 'abil_b_1', name: 'Stoneheart Aegis', desc: 'Apply Aegis to self and weakest ally and trigger a minor self-heal.', type: 'ability' },
            { id: 'abil_b_2', name: 'Ironblood Surge', desc: 'Apply Mend (Heal over Time) to an ally and cleanse 1 negative effect.', type: 'ability' },
            { id: 'abil_b_3', name: 'Unyielding Line', desc: 'Grant the entire party Aegis, but apply Slow to self.', type: 'ability' },
            { id: 'abil_b_4', name: 'Gravestone Breaker', desc: 'Deal heavy single-target damage and apply Empower to self for 1 turn.', type: 'ability' },
            { id: 'abil_b_5', name: 'Oathbound Stand', desc: 'Apply Aegis and Mend to self. Only usable if under 50% HP.', type: 'ability' }
        ],
        executioner: [
            { id: 'abil_e_1', name: 'Crimson Arc', desc: 'Deal high damage and apply Curse (Damage over Time) to the target.', type: 'ability' },
            { id: 'abil_e_2', name: 'Butcher’s Wake', desc: 'Deal AoE damage and apply Heal Block to all targets.', type: 'ability' },
            { id: 'abil_e_3', name: 'Marked for Silence', desc: 'Apply Distracted and Slow to a target, and Empower self for the next attack.', type: 'ability' },
            { id: 'abil_e_4', name: 'Razorstorm Flurry', desc: 'Perform two rapid strikes, applying Curse if both hits land.', type: 'ability' },
            { id: 'abil_e_5', name: 'Death’s Rhythm', desc: 'Apply Empower and Haste to self for 2 turns.', type: 'ability' }
        ],
        veilwalker: [
            { id: 'abil_v_1', name: 'Twilight Cascade', desc: 'Deal moderate magic damage and apply Haste to self.', type: 'ability' },
            { id: 'abil_v_2', name: 'Wraith Veil', desc: 'Apply Aegis to self, heal slightly, and gain immunity to the next debuff.', type: 'ability' },
            { id: 'abil_v_3', name: 'Lurking Shade', desc: 'Apply Distracted and Slow to a target and Haste to self.', type: 'ability' },
            { id: 'abil_v_4', name: 'Fading Echo', desc: 'Deal low AoE damage and apply Curse to all enemies.', type: 'ability' },
            { id: 'abil_v_5', name: 'Slipstream Laceration', desc: 'Deal quick single-target damage. If this is a killing blow, gain Haste and Empower.', type: 'ability' }
        ]
    },

    //================================================
    // 3. REWARDS: The core pools for Milestone events
    //================================================
    rewards: {
        //--------------------------------------------
        // Minor Milestones (Levels 10, 15, 25, etc.)
        //--------------------------------------------
        minor: {
            permanentStats: [
                { id: 'minor_stat_hp', name: '+2 Max HP', type: 'stat', stat: 'hp', value: 2 },
                { id: 'minor_stat_con', name: '+1 CON', type: 'stat', stat: 'con', value: 1 },
                { id: 'minor_stat_spd', name: '+1 SPD', type: 'stat', stat: 'spd', value: 1 }
            ],
            temporaryBoons: {
                bastion: {
                    standard: [
                        { id: 'mb_b_1', name: 'HP Shield', desc: 'Start each combat with a 20% Max HP shield for this floor.', type: 'boon' },
                        { id: 'mb_b_2', name: 'Combat CON', desc: 'Gain +1 CON for the next combat.', type: 'boon' },
                        { id: 'mb_b_3', name: 'Minor Aegis', desc: 'Start each combat with Aegis (blocks first 10 dmg) for this floor.', type: 'boon' },
                        { id: 'mb_b_4', name: 'Floor Resistance', desc: 'Gain +5% damage resistance for this floor.', type: 'boon' },
                        { id: 'mb_b_5', name: 'Sustain', desc: 'Regenerate 5% HP after each battle on this floor.', type: 'boon' },
                        { id: 'mb_b_6', name: 'First Hit Softer', desc: 'The first instance of damage each combat is halved (max 20 dmg reduction).', type: 'boon' },
                        { id: 'mb_b_7', name: 'Combat SPD', desc: 'Gain +1 SPD for the next combat.', type: 'boon' },
                        { id: 'mb_b_8', name: 'Enhanced Shields', desc: 'All shield effects have +10% value for this floor.', type: 'boon' },
                        { id: 'mb_b_9', name: 'Free Guard', desc: 'Your first Guard action of each combat costs 0 SP for this floor.', type: 'boon' },
                        { id: 'mb_b_10', name: 'Provoke', desc: 'Gain Taunt for 2 turns but Weaken self for 1 turn at the start of each combat.', type: 'boon' }
                    ],
                    corrupted: [
                        { id: 'mcb_b_1', name: 'Glass Shield', desc: 'Gain a 30% HP shield.', penalty: 'If it breaks, take 50% more damage from the next hit.', isCorrupted: true, type: 'boon' },
                        { id: 'mcb_b_2', name: 'Hollow Fortitude', desc: 'Gain +2 CON.', penalty: 'Lose 10% Max HP.', isCorrupted: true, type: 'boon' },
                        { id: 'mcb_b_3', name: 'Cracked Aegis', desc: 'Start with Aegis.', penalty: 'Suffer -1 SPD.', isCorrupted: true, type: 'boon' },
                        { id: 'mcb_b_4', name: 'Brittle Guard', desc: 'Gain +5% damage resistance.', penalty: 'The next healing you receive is halved.', isCorrupted: true, type: 'boon' },
                        { id: 'mcb_b_5', name: 'Leechskin', desc: 'Regenerate 10% HP after battle.', penalty: 'Lose 10% of your Dodge chance.', isCorrupted: true, type: 'boon' },
                        { id: 'mcb_b_6', name: 'False Armor', desc: 'The first hit you take is halved.', penalty: 'The second hit you take is doubled.', isCorrupted: true, type: 'boon' },
                        { id: 'mcb_b_7', name: 'Heavy March', desc: 'Gain +2 SPD.', penalty: 'Lose 15% of your Dodge chance.', isCorrupted: true, type: 'boon' },
                        { id: 'mcb_b_8', name: 'Overload Barrier', desc: 'Gain +15% to shields.', penalty: 'Your Max HP is capped at 50% of its value.', isCorrupted: true, type: 'boon' },
                        { id: 'mcb_b_9', name: 'Empty Resolve', desc: 'Your first Guard is free.', penalty: 'Suffer -1 CON.', isCorrupted: true, type: 'boon' },
                        { id: 'mcb_b_10', name: 'Baited Guard', desc: 'Gain Taunt for 2 turns.', penalty: 'Also gain self-Weaken for 2 turns.', isCorrupted: true, type: 'boon' }
                    ]
                },
                executioner: {
                    standard: [
                        { id: 'me_e_1', name: 'First Strike', desc: 'Your first attack in each combat deals +50% damage.', type: 'boon' },
                        { id: 'me_e_2', name: 'Combat SPD', desc: 'Gain +1 SPD for the next combat.', type: 'boon' },
                        { id: 'me_e_3', name: 'Opening Criticals', desc: 'Gain +10% critical hit chance for the first two rounds of each combat.', type: 'boon' },
                        { id: 'me_e_4', name: 'Oppressor', desc: 'Deal +15% damage to enemies above 80% HP.', type: 'boon' },
                        { id: 'me_e_5', name: 'Finisher', desc: 'Deal +15% damage to enemies below 30% HP.', type: 'boon' },
                        { id: 'me_e_6', name: 'First Blood', desc: 'Your first attack in each combat also applies a 2-turn Bleed.', type: 'boon' },
                        { id: 'me_e_7', name: 'Combat CON', desc: 'Gain +1 CON for the next combat.', type: 'boon' },
                        { id: 'me_e_8', name: 'Assault', desc: 'Your offensive abilities cost 1 less SP for the first two rounds of combat.', type: 'boon' },
                        { id: 'me_e_9', name: 'Focus', desc: 'Start each combat with +10% accuracy for the first round.', type: 'boon' },
                        { id: 'me_e_10', name: 'Momentum', desc: 'Your first kill in each combat grants a guaranteed critical hit on your next attack.', type: 'boon' }
                    ],
                    corrupted: [
                        { id: 'mce_e_1', name: 'Blood Frenzy', desc: '+75% damage on your first hit.', penalty: 'You take double damage from the next hit you receive.', isCorrupted: true, type: 'boon' },
                        { id: 'mce_e_2', name: 'Blood Rush', desc: 'Gain +2 SPD.', penalty: 'Lose 10% of your current HP.', isCorrupted: true, type: 'boon' },
                        { id: 'mce_e_3', name: 'Blind Wrath', desc: 'Gain +15% critical hit chance.', penalty: 'Suffer a 15% accuracy penalty.', isCorrupted: true, type: 'boon' },
                        { id: 'mce_e_4', name: 'Ruthless Edge', desc: '+20% damage vs high-HP targets.', penalty: 'You have -10% damage resistance.', isCorrupted: true, type: 'boon' },
                        { id: 'mce_e_5', name: 'Desperate Blows', desc: '+20% damage vs low-HP targets.', penalty: 'Lose 10% of your current HP.', isCorrupted: true, type: 'boon' },
                        { id: 'mce_e_6', name: 'Blooded Edge', desc: 'First attack applies Bleed.', penalty: 'Also applies a 1-turn Bleed to yourself.', isCorrupted: true, type: 'boon' },
                        { id: 'mce_e_7', name: 'Pyre Focus', desc: 'Gain +2 CON.', penalty: 'You skip your next action.', isCorrupted: true, type: 'boon' },
                        { id: 'mce_e_8', name: 'Reckless Gambit', desc: 'Offensive abilities cost 2 less SP.', penalty: 'You take +10% damage.', isCorrupted: true, type: 'boon' },
                        { id: 'mce_e_9', name: 'Sharpened Instinct', desc: 'Gain +10% accuracy.', penalty: 'Lose 10% of your Dodge chance.', isCorrupted: true, type: 'boon' },
                        { id: 'mce_e_10', name: 'Ravenous Hunger', desc: 'First kill grants a critical hit.', penalty: 'Lose 10% of your Max HP.', isCorrupted: true, type: 'boon' }
                    ]
                },
                veilwalker: {
                    standard: [
                        { id: 'mv_v_1', name: 'Opening Dodge', desc: 'Your Dodge chance is doubled for the first round of each combat.', type: 'boon' },
                        { id: 'mv_v_2', name: 'Restorative Dodge', desc: 'Your first successful dodge in each combat restores 10% HP.', type: 'boon' },
                        { id: 'mv_v_3', name: 'Combat SPD', desc: 'Gain +1 SPD for the next combat.', type: 'boon' },
                        { id: 'mv_v_4', name: 'Evasion', desc: 'Start each combat with Evasion, completely negating the next hit.', type: 'boon' },
                        { id: 'mv_v_5', name: 'Punishing Dodge', desc: 'Successfully dodging an attack applies a 1-turn Weaken to the attacker.', type: 'boon' },
                        { id: 'mv_v_6', name: 'Debuff Immunity', desc: 'You are immune to the first debuff applied to you in each combat.', type: 'boon' },
                        { id: 'mv_v_7', name: 'Combat CON', desc: 'Gain +1 CON for the next combat.', type: 'boon' },
                        { id: 'mv_v_8', name: 'Ambush', desc: 'Your first offensive ability in each combat deals +15% damage.', type: 'boon' },
                        { id: 'mv_v_9', name: 'Shadowstep', desc: 'Placeholder: Movement ignores reactions.', type: 'boon' },
                        { id: 'mv_v_10', name: 'Fleet', desc: 'Gain +10% movement speed.', type: 'boon' }
                    ],
                    corrupted: [
                        { id: 'mcv_v_1', name: 'Shattered Step', desc: 'Triple your Dodge chance for 1 round.', penalty: 'Your SPD is -2 on the next turn.', isCorrupted: true, type: 'boon' },
                        { id: 'mcv_v_2', name: 'Shadow Burn', desc: 'Dodging restores HP.', penalty: 'Also applies a self-Burn for 5% HP.', isCorrupted: true, type: 'boon' },
                        { id: 'mcv_v_3', name: 'Blurred Motion', desc: 'Gain +2 SPD.', penalty: 'Suffer a 20% chance to miss attacks.', isCorrupted: true, type: 'boon' },
                        { id: 'mcv_v_4', name: 'Ghostly Evasion', desc: 'Start with Evasion.', penalty: 'You take +10% damage from the first two hits you receive.', isCorrupted: true, type: 'boon' },
                        { id: 'mcv_v_5', name: 'Venom Reflex', desc: 'Dodging applies Weaken to the attacker.', penalty: 'Also applies a 1-turn Weaken to yourself.', isCorrupted: true, type: 'boon' },
                        { id: 'mcv_v_6', name: 'Ghostform Hollow', desc: 'Gain debuff immunity.', penalty: 'Suffer -2 SPD.', isCorrupted: true, type: 'boon' },
                        { id: 'mcv_v_7', name: 'Shivering Veil', desc: 'Gain +2 CON.', penalty: 'You skip your first turn of combat.', isCorrupted: true, type: 'boon' },
                        { id: 'mcv_v_8', name: 'Umbral Bloom', desc: 'Your first hit deals +30% damage.', penalty: 'Lose 10% of your current HP.', isCorrupted: true, type: 'boon' },
                        { id: 'mcv_v_9', name: 'Shadow Flare', desc: 'Placeholder: Gain one Shadowstep.', penalty: 'Lose 5% of your Max HP.', isCorrupted: true, type: 'boon' },
                        { id: 'mcv_v_10', name: 'Vanished Speed', desc: 'Gain +15% movement speed.', penalty: 'Lose 10% of your Dodge chance.', isCorrupted: true, type: 'boon' }
                    ]
                }
            }
        },

        //--------------------------------------------
        // Major Milestones (Levels 20, 40, etc.)
        //--------------------------------------------
        major: {
            permanentBoons: {
                bastion: {
                    standard: [
                        { id: 'MAb_b_1', name: 'Iron Skin', desc: 'Permanently take -2 damage from all hits.', type: 'boon' },
                        { id: 'MAb_b_2', name: 'Vigilant', desc: 'Start every fight with the Aegis buff.', type: 'boon' },
                        { id: 'MAb_b_3', name: 'Steadfast', desc: 'Your Dodge chance cap is permanently increased by 15%.', type: 'boon' },
                        { id: 'MAb_b_4', name: 'Guardian\'s Vow', desc: 'Placeholder: Take 50% reduced damage from splash or AoE effects.', type: 'boon' },
                        { id: 'MAb_b_5', name: 'Retaliation', desc: 'After taking a hit, your next attack deals +25% damage.', type: 'boon' },
                        { id: 'MAb_b_6', name: 'Endless March', desc: 'Regenerate 3% of your Max HP after each battle.', type: 'boon' },
                        { id: 'MAb_b_7', name: 'Last Stand', desc: 'Gain +50% CON when you are below 25% HP.', type: 'boon' },
                        { id: 'MAb_b_8', name: 'Intervention', desc: 'Placeholder: Once per floor, you may redirect a fatal blow intended for an ally to yourself.', type: 'boon' },
                        { id: 'MAb_b_9', name: 'Immortal Oath', desc: 'Once per run, upon taking fatal damage, revive with 30% HP and the Aegis buff.', type: 'boon' },
                        { id: 'MAb_b_10', name: 'Bulwark Spirit', desc: 'All shields you create or receive are 10% more effective.', type: 'boon' }
                    ],
                    corrupted: [
                        { id: 'McAb_b_1', name: 'Iron Husk', desc: 'Take -5 damage per hit.', penalty: 'Permanent -2 SPD.', isCorrupted: true, type: 'boon' },
                        { id: 'McAb_b_2', name: 'False Vigil', desc: 'Start with Aegis.', penalty: 'Suffer a stacking -1 SPD penalty in each battle.', isCorrupted: true, type: 'boon' },
                        { id: 'McAb_b_3', name: 'Stonefoot', desc: 'Dodge cap +20%.', penalty: 'Movement speed -20%.', isCorrupted: true, type: 'boon' },
                        { id: 'McAb_b_4', name: 'Mirror Guard', desc: 'Gain splash protection.', penalty: 'Take 10% of the damage when hit.', isCorrupted: true, type: 'boon' },
                        { id: 'McAb_b_5', name: 'Rage March', desc: 'Gain +50% retaliation damage.', penalty: 'Suffer 2% HP decay per turn.', isCorrupted: true, type: 'boon' },
                        { id: 'McAb_b_6', name: 'Undying Husk', desc: 'Regen 5% HP per battle.', penalty: 'Max HP capped at 70%.', isCorrupted: true, type: 'boon' },
                        { id: 'McAb_b_7', name: 'Blood Stand', desc: 'Gain +75% CON below 10% HP.', penalty: 'A risky maneuver.', isCorrupted: true, type: 'boon' },
                        { id: 'McAb_b_8', name: 'Doomed Shield', desc: 'Redirect a fatal blow.', penalty: 'The next hit you take is a critical.', isCorrupted: true, type: 'boon' },
                        { id: 'McAb_b_9', name: 'Deathless Pact', desc: 'Revive once.', penalty: 'Permanently lose 10% Max HP.', isCorrupted: true, type: 'boon' },
                        { id: 'McAb_b_10', name: 'Cracked Bulwark', desc: '+20% shield effectiveness.', penalty: '-10% Dodge chance.', isCorrupted: true, type: 'boon' }
                    ]
                },
                executioner: {
                    standard: [
                        { id: 'MAe_e_1', name: 'Brutal Precision', desc: 'Permanently deal +20% damage to enemies below 50% HP.', type: 'boon' },
                        { id: 'MAe_e_2', name: 'Focused Intent', desc: 'Your CON-to-damage scaling is increased by 25%.', type: 'boon' },
                        { id: 'MAe_e_3', name: 'Relentless Pressure', desc: 'Your critical hits also apply the Weaken debuff.', type: 'boon' },
                        { id: 'MAe_e_4', name: 'Sunder Armor', desc: 'Your attacks permanently shred enemy resistance by 10%.', type: 'boon' },
                        { id: 'MAe_e_5', name: 'Battle Rhythm', desc: 'Every 3rd attack you make costs 0 SP.', type: 'boon' },
                        { id: 'MAe_e_6', name: 'Feast of Blades', desc: 'Heal for 10% of your Max HP on a killing blow.', type: 'boon' },
                        { id: 'MAe_e_7', name: 'Overwhelm', desc: 'Your AoE attacks also apply the Slow debuff.', type: 'boon' },
                        { id: 'MAe_e_8', name: 'No Escape', desc: 'Placeholder: Your attacks gain +50% accuracy (to a max of 90%).', type: 'boon' },
                        { id: 'MAe_e_9', name: 'End of All Things', desc: 'Gain a permanent Empower buff, increasing all damage by 5%.', type: 'boon' },
                        { id: 'MAe_e_10', name: 'Reaping Strike', desc: 'Placeholder: Your critical hits deal an additional +15% damage.', type: 'boon' }
                    ],
                    corrupted: [
                        { id: 'McAe_e_1', name: 'Savage Drive', desc: '+30% damage vs low-HP targets.', penalty: 'Permanent -15% Dodge chance.', isCorrupted: true, type: 'boon' },
                        { id: 'McAe_e_2', name: 'Feral Precision', desc: '+40% CON-to-damage scaling.', penalty: 'Suffer 3% HP decay per turn.', isCorrupted: true, type: 'boon' },
                        { id: 'McAe_e_3', name: 'Blood Chains', desc: 'Crits apply Weaken.', penalty: 'Also applies a self-Slow.', isCorrupted: true, type: 'boon' },
                        { id: 'McAe_e_4', name: 'Rust Bite', desc: 'Shred enemy resistance.', penalty: 'Take 5% of your HP in damage per turn.', isCorrupted: true, type: 'boon' },
                        { id: 'McAe_e_5', name: 'Death Rhythm', desc: 'Every 3rd attack is free.', penalty: 'Lose 2% of your HP.', isCorrupted: true, type: 'boon' },
                        { id: 'McAe_e_6', name: 'Crimson Feast', desc: 'Heal on kill.', penalty: 'Your next attack applies a self-Bleed.', isCorrupted: true, type: 'boon' },
                        { id: 'McAe_e_7', name: 'Wild Overwhelm', desc: 'AoE attacks Stun enemies.', penalty: 'You skip your next action.', isCorrupted: true, type: 'boon' },
                        { id: 'McAe_e_8', name: 'Killing Field', desc: 'You cannot miss.', penalty: 'You take +10% damage.', isCorrupted: true, type: 'boon' },
                        { id: 'McAe_e_9', name: 'Doom Herald', desc: 'Gain permanent Empower.', penalty: 'Max HP is reduced by 10%.', isCorrupted: true, type: 'boon' },
                        { id: 'McAe_e_10', name: 'Frenzied Reap', desc: '+25% crit damage.', penalty: 'You have -1 action per battle.', isCorrupted: true, type: 'boon' }
                    ]
                },
                veilwalker: {
                    standard: [
                        { id: 'MAv_v_1', name: 'Ghost Step', desc: 'Your Dodge chance cap is permanently increased by 15%.', type: 'boon' },
                        { id: 'MAv_v_2', name: 'Flow State', desc: 'Placeholder: Gain +2 SPD for one turn after a successful dodge.', type: 'boon' },
                        { id: 'MAv_v_3', name: 'Phantom Edge', desc: 'Placeholder: Your next attack after a successful dodge deals +50% damage.', type: 'boon' },
                        { id: 'MAv_v_4', name: 'Mire', desc: 'Placeholder: Enemies that miss you with an attack are Slowed.', type: 'boon' },
                        { id: 'MAv_v_5', name: 'Wraith Form', desc: 'You are immune to the first debuff applied to you in every combat.', type: 'boon' },
                        { id: 'MAv_v_6', name: 'Disorient Haze', desc: 'Attackers have a 25% chance to become Distracted.', type: 'boon' },
                        { id: 'MAv_v_7', name: 'Vanishing Point', desc: 'You are guaranteed to Dodge every 4th turn.', type: 'boon' },
                        { id: 'MAv_v_8', name: 'Temporal Shift', desc: 'Placeholder: Grant an ally a double turn once per battle.', type: 'boon' },
                        { id: 'MAv_v_9', name: 'Untethered', desc: 'You gain an extra turn every 5th round.', type: 'boon' },
                        { id: 'MAv_v_10', name: 'Slipstream', desc: 'Your SPD cap is increased by 10%.', type: 'boon' }
                    ],
                    corrupted: [
                        { id: 'McAv_v_1', name: 'Broken Step', desc: 'Dodge cap +25%.', penalty: 'Take +10% damage from all sources.', isCorrupted: true, type: 'boon' },
                        { id: 'McAv_v_2', name: 'Hyper Flow', desc: '+3 SPD after a dodge.', penalty: 'Suffer 2% HP decay per turn.', isCorrupted: true, type: 'boon' },
                        { id: 'McAv_v_3', name: 'Shadow Spike', desc: '+100% damage on your first hit.', penalty: 'Become self-Distracted for 1 turn.', isCorrupted: true, type: 'boon' },
                        { id: 'McAv_v_4', name: 'Mire Plague', desc: 'Misses apply Slow.', penalty: 'Also applies a 1-turn self-Slow.', isCorrupted: true, type: 'boon' },
                        { id: 'McAv_v_5', name: 'Hollow Shade', desc: 'Gain debuff immunity.', penalty: 'Suffer 5% HP decay per turn.', isCorrupted: true, type: 'boon' },
                        { id: 'McAv_v_6', name: 'Toxic Haze', desc: '25% chance to Distract attackers.', penalty: 'Become self-Blinded next round.', isCorrupted: true, type: 'boon' },
                        { id: 'McAv_v_7', name: 'Ghost Pulse', desc: 'Guaranteed Dodge.', penalty: 'Skip your next action.', isCorrupted: true, type: 'boon' },
                        { id: 'McAv_v_8', name: 'Time Fracture', desc: 'Give an ally a double turn.', penalty: 'Become Stunned.', isCorrupted: true, type: 'boon' },
                        { id: 'McAv_v_9', a: 'Fading Tether', desc: 'Extra turns every 5th round.', penalty: 'Suffer 2% HP decay per turn.', isCorrupted: true, type: 'boon' },
                        { id: 'McAv_v_10', a: 'Frictionless Form', desc: 'SPD cap +15%.', penalty: 'Max HP -10%.', isCorrupted: true, type: 'boon' }
                    ]
                }
            }
        }
    }
};


// --- Dungeon Map Data ---
export const NODE_TYPES = {
    START: 'start',
    COMBAT: 'combat',
    EVENT: 'event',
    MEMORY: 'memory',
    LOOT: 'loot',
    ANOMALY: 'anomaly',
    EXIT: 'exit',
    BOSS: 'boss'
};
export const NODE_POOL = [
    NODE_TYPES.COMBAT, NODE_TYPES.EVENT, NODE_TYPES.MEMORY,
    NODE_TYPES.LOOT, NODE_TYPES.ANOMALY, NODE_TYPES.COMBAT, NODE_TYPES.MEMORY
];


// --- BUFFS/DEBUFFS ---
export const STATUS_EFFECT_METADATA = {
    Aegis:    { type: 'Buff',   icon: '🛡️', description: 'Reduces incoming damage by 25%.', hooks: [{ event: 'before_damage_taken', action: 'reduce_damage_percent', value: 0.25, message: "{target}'s Aegis reduces damage by {value}!" }] },
    Empower:  { type: 'Buff',   icon: '🔥', description: 'Adds CON to the base value of damage and healing abilities.', hooks: [{ event: 'before_value_calculation', action: 'add_con_to_value', message: "{caster} is Empowered, adding {value} to the action!" }] },
    Haste:    { type: 'Buff',   icon: '⏩', description: 'Increases base SPD by 50% for turn order.', hooks: [{ event: 'on_speed_calculation', action: 'modify_stat_percent', stat: 'spd', value: 1.5 }] },
    Mend:     { type: 'Buff',   icon: '💚', description: 'Heals for 2-5 HP at the start of the affected unit\'s turn.', hooks: [{ event: 'on_turn_start', action: 'heal', value: [2, 5], message: "{target} mends for {value} HP." }] },
    Weaken:   { type: 'Debuff', icon: '💥', description: 'Increases incoming damage by a flat 5 points.', hooks: [{ event: 'before_damage_taken', action: 'increase_damage_flat', value: 5, message: "{target} is Weaken, taking {value} extra damage!" }] },
    Curse:    { type: 'Debuff', icon: '💀', description: 'Takes 2-5 damage at the start of the affected unit\'s turn.', hooks: [{ event: 'on_turn_start', action: 'damage', value: [2, 5], message: "{target} takes {value} damage from Curse." }] },
    Slow:     { type: 'Debuff', icon: '⏪', description: 'Decreases base SPD by 30% for turn order.', hooks: [{ event: 'on_speed_calculation', action: 'modify_stat_percent', stat: 'spd', value: 0.7 }] },
    Distracted:{ type: 'Debuff', icon: '❓', description: '50% chance to lose action at the start of turn.', hooks: [{ event: 'before_action', action: 'chance_to_fizzle', value: 0.5, message: "{caster} is Distracted and unable to act!" }] },
    healing_block: { type: 'Debuff', icon: '💔', description: 'Soul-Scarred. All incoming healing is blocked.', hooks: [{ event: 'before_heal_applied', action: 'block_heal', message: "{target} is Soul-Scarred, preventing healing!"}] },
    recoil_veil: { type: 'Buff', icon: '🌀', description: 'Reduces incoming damage by a random 20-50%.', hooks: [{ event: 'before_damage_taken', action: 'reduce_damage_percent', value: [0.2, 0.5], message: "The veil reduces damage by {value}!" }] },
    Bleed:    { type: 'Debuff', icon: '🩸', description: 'Takes 2-5 damage at the start of the affected unit\'s turn.', hooks: [{ event: 'on_turn_start', action: 'damage', value: [2, 5], message: "{target} bleeds for {value} damage." }] },
    Taunt:    { type: 'Buff', icon: '🐂', description: 'Enemies are compelled to use single-target attacks against this unit.', hooks: [] },
};


export const CHARACTERS_DATA = {
    dranick: { character_name: "Dranick", role: "Tank / Support", base_stats: { hp: 120, con: 9, spd: 2 }, abilities: ["dranick_bonebreaker", "dranick_finalvow", "dranick_undyingjudgment"] },
    eline: { character_name: "Eline", role: "Scout / Status Control", base_stats: { hp: 70, con: 8, spd: 6 }, abilities: ["eline_twinthorns", "eline_burrowbuddy", "eline_marshambush"] },
    varro: { character_name: "Varro", role: "Balanced / Hybrid", base_stats: { hp: 90, con: 8, spd: 4 }, abilities: ["varro_arclash", "varro_spellparry", "varro_gravemarkseal"] },
    kestril: { character_name: "Kestril", role: "Tactical Support", base_stats: { hp: 80, con: 10, spd: 3 }, abilities: ["kestril_futureflare", "kestril_foresightstep", "kestril_rewindpulse"] },
    lira: { character_name: "Lira", role: "Healer / Agile Striker", base_stats: { hp: 85, con: 9, spd: 5 }, abilities: ["lira_pressurepoint", "lira_breath", "lira_redthread"] },
    grim: { character_name: "Grim", role: "Berserker / Damage", base_stats: { hp: 110, con: 6, spd: 3 }, abilities: ["grim_soilcrack", "grim_furyguard", "grim_relichowl"] },
};

export const ABILITIES_DATA = {
    dranick_bonebreaker: { ability_id: "dranick_bonebreaker", display_name: "Bonebreaker Mace", user: "Dranick", type: "Standard", sp_cost: 3, set_value: 8, speed_mod: 2, target_type: "SingleEnemy", description: "A heavy mace attack that deals solid physical damage.", tags: ["Melee", "Damage"], effects: [{ type: 'damage', value_source: 'calculated' }] },
    dranick_finalvow: { ability_id: "dranick_finalvow", display_name: "Final Vow", user: "Dranick", type: "Standard", sp_cost: 3, set_value: 16, speed_mod: 0, target_type: "SingleEnemy", description: "Strike a foe, converting the blow's life force into a wave of healing for the entire party.", tags: ["Melee", "Damage", "Heal", "Defensive"], effects: [{ type: 'damage', value_source: 'calculated', remember_as: 'last_damage' }, { type: 'heal', target: 'allies', value_source: 'memory', value: 'last_damage * 0.5', message: "...and a powerful pact heals the party for {value} HP." }] },
    dranick_undyingjudgment: { ability_id: "dranick_undyingjudgment", display_name: "Undying Judgment", user: "Dranick", type: "Special", sp_cost: 5, set_value: 15, speed_mod: -1, target_type: "SingleEnemy", description: "A powerful, slow attack that inflicts a withering Curse on the target.", tags: ["Melee", "Damage", "Debuff"], effects: [{ type: 'damage', value_source: 'calculated' }, { type: 'apply_status', status: 'Curse', duration: 2 }] },
    eline_twinthorns: { ability_id: "eline_twinthorns", display_name: "Twin Thorns", user: "Eline", type: "Standard", sp_cost: 3, set_value: 6, speed_mod: 4, target_type: "SingleEnemy", description: "A lightning-fast jab with two poisoned daggers.", tags: ["Melee", "Damage", "Offensive"], effects: [{ type: 'damage', value_source: 'calculated' }] },
    eline_burrowbuddy: { ability_id: "eline_burrowbuddy", display_name: "Burrow Buddy", user: "Eline", type: "Standard", sp_cost: 3, set_value: 0, speed_mod: 5, target_type: "SingleEnemy", description: "A summoned creature erupts from the ground to ensnare and Slow an enemy.", tags: ["Support", "Debuff", "Offensive"], effects: [{ type: 'apply_status', status: 'Slow', duration: 2 }] },
    eline_marshambush: { ability_id: "eline_marshambush", display_name: "Marsh Ambush", user: "Eline", type: "Special", sp_cost: 5, set_value: 12, speed_mod: 1, target_type: "SingleEnemy", description: "Strike from unexpected quarters, the thrill of the hunt granting a brief Mend to the user.", tags: ["Melee", "Damage", "Buff", "Offensive"], effects: [{ type: 'damage', value_source: 'calculated' }, { type: 'apply_status', status: 'Mend', duration: 2, target: 'self' }] },
    varro_arclash: { ability_id: "varro_arclash", display_name: "Arc Lash", user: "Varro", type: "Standard", sp_cost: 3, set_value: 7, speed_mod: 3, target_type: "SingleEnemy", description: "A whip of pure arcane energy strikes a foe.", tags: ["Magic", "Damage", "Offensive"], effects: [{ type: 'damage', value_source: 'calculated' }] },
    varro_gravemarkseal: { ability_id: "varro_gravemarkseal", display_name: "Gravemark Seal", user: "Varro", type: "Special", sp_cost: 5, set_value: 0, speed_mod: 0, target_type: "AllEnemies", description: "Inflict a lingering Curse on all foes while bestowing a regenerative Mend upon the party.", tags: ["Magic", "Support", "Debuff", "Heal", "Offensive"], effects: [{ type: 'apply_status', status: 'Mend', duration: 2, target: 'allies' }, { type: 'apply_status', status: 'Curse', duration: 2 }] },
    kestril_futureflare: { ability_id: "kestril_futureflare", display_name: "Future Flare", user: "Kestril", type: "Standard", sp_cost: 3, set_value: 7, speed_mod: 2, target_type: "SingleEnemy", description: "A burst of temporal energy reveals and manifests a future wound on an enemy.", tags: ["Magic", "Damage", "Offensive"], effects: [{ type: 'damage', value_source: 'calculated' }] },
    kestril_rewindpulse: { ability_id: "kestril_rewindpulse", display_name: "Rewind Pulse", user: "Kestril", type: "Special", sp_cost: 5, set_value: 8, speed_mod: 0, target_type: "AllAllies", description: "Emit a pulse of temporal energy that mends recent wounds on all allies.", tags: ["Heal", "AoE", "Support", "Defensive"], effects: [{ type: 'heal', value_source: 'calculated' }] },
    lira_pressurepoint: { ability_id: "lira_pressurepoint", display_name: "Pressure Point", user: "Lira", type: "Standard", sp_cost: 3, set_value: 6, speed_mod: 5, target_type: "SingleEnemy", description: "A precise strike aimed at a vital point to disrupt the target's flow.", tags: ["Melee", "Damage", "Offensive"], effects: [{ type: 'damage', value_source: 'calculated' }] },
    lira_breath: { ability_id: "lira_breath", display_name: "Breath", user: "Lira", type: "Standard", sp_cost: 3, set_value: 9, speed_mod: 3, target_type: "SingleAlly", description: "A calming breath that restores an ally's vitality and mends their wounds.", tags: ["Heal", "Support", "Defensive"], effects: [{ type: 'heal', value_source: 'calculated' }] },
    lira_redthread: { ability_id: "lira_redthread", display_name: "Red Thread", user: "Lira", type: "Special", sp_cost: 5, set_value: 13, speed_mod: 1, target_type: "SingleEnemy", description: "Bind a foe with a thread of crimson fate, dealing potent magical damage.", tags: ["Magic", "Damage", "Offensive"], effects: [{ type: 'damage', value_source: 'calculated' }] },
    grim_soilcrack: { ability_id: "grim_soilcrack", display_name: "Soilcrack Fist", user: "Grim", type: "Standard", sp_cost: 3, set_value: 15, speed_mod: 1, target_type: "SingleEnemy", description: "A heavy-handed punch that cracks the very ground with its raw power.", tags: ["Melee", "Damage", "Offensive"], effects: [{ type: 'damage', value_source: 'calculated' }] },
    grim_relichowl: { ability_id: "grim_relichowl", display_name: "Relic Howl", user: "Grim", type: "Special", sp_cost: 8, set_value: 10, speed_mod: -2, target_type: "AllEnemies", description: "A roar empowered by a relic's energy that damages and applies Weaken to all enemies.", tags: ["AoE", "Damage", "Debuff", "Offensive"], effects: [{ type: 'damage', value_source: 'calculated' }, { type: 'apply_status', status: 'Weaken', duration: 3 }] },
};

export const BUFF_ABILITIES_DATA = {
    varro_spellparry: { ability_id: "varro_spellparry", display_name: "Spell Parry", user: "Varro", type: "Standard", sp_cost: 3, set_value: 0, speed_mod: 2, target_type: "Self", description: "Assume a defensive stance, raising an arcane Aegis to reduce incoming damage.", tags: ["Defense", "Support", "Buff", "Defensive"], effects: [{ type: 'apply_status', status: 'Aegis', duration: 2 }] },
    kestril_foresightstep: { ability_id: "kestril_foresightstep", display_name: "Foresight Step", user: "Kestril", type: "Standard", sp_cost: 3, set_value: 0, speed_mod: 6, target_type: "Self", description: "Step through time, gaining both the Haste of the future and the Aegis of a past defense.", tags: ["Support", "Defense", "Buff", "Defensive"], effects: [{ type: 'apply_status', status: 'Aegis', duration: 2 }, { type: 'apply_status', status: 'Haste', duration: 2 }] },
    grim_furyguard: { ability_id: "grim_furyguard", display_name: "Fury Guard", user: "Grim", type: "Standard", sp_cost: 3, set_value: 0, speed_mod: 0, target_type: "Self", description: "Channel inner fury into a protective Aegis, preparing for the next blow.", tags: ["Defense", "Support", "Buff", "Defensive"], effects: [{ type: 'apply_status', status: 'Aegis', duration: 2 }] },
};

export const COMBOS_DATA = {
    combo_grave_in_bloom: { ability_id: "combo_grave_in_bloom", display_name: "Grave in Bloom", users: ["Dranick", "Eline"], type: "Duo", sp_cost: 8, set_value: 16, speed_mod: 0, target_type: "AllEnemies", description: "Eruptions of thorns and bone sprout from the ground, damaging all foes in an AoE.", tags: ["Damage", "AoE", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }] },
    combo_arcane_bastion: { ability_id: "combo_arcane_bastion", display_name: "Arcane Bastion", users: ["Dranick", "Varro"], type: "Duo", sp_cost: 7, set_value: 14, speed_mod: 1, target_type: "AllAllies", description: "Create a bastion of arcane energy to administer a significant party-wide heal.", tags: ["Heal", "AoE", "Defensive"], isCombo: true, effects: [{ type: 'heal', value_source: 'calculated' }] },
    combo_temporal_bulwark: { ability_id: "combo_temporal_bulwark", display_name: "Temporal Bulwark", users: ["Dranick", "Kestril"], type: "Duo", sp_cost: 7, set_value: 0, speed_mod: 4, target_type: "AllAllies", description: "Weave threads of time into a defensive bulwark, granting Aegis to all allies.", tags: ["Support", "Defense", "Buff", "Defensive"], isCombo: true, effects: [{ type: 'apply_status', status: 'Aegis', duration: 2 }] },
    combo_guardians_breath: { ability_id: "combo_guardians_breath", display_name: "Guardian's Breath", users: ["Dranick", "Lira"], type: "Duo", sp_cost: 8, set_value: 20, speed_mod: 0, target_type: "AllAllies", description: "A massive, party-wide heal that also bestows a lingering Mend to all allies.", tags: ["Heal", "AoE", "Defensive"], isCombo: true, effects: [{ type: 'heal', value_source: 'calculated' }, { type: 'apply_status', status: 'Mend', duration: 1 }] },
    combo_unstoppable_force: { ability_id: "combo_unstoppable_force", display_name: "Unstoppable Force", users: ["Dranick", "Grim"], type: "Duo", sp_cost: 8, set_value: 25, speed_mod: -1, target_type: "SingleEnemy", description: "A high-damage, single-target blow delivered with the force of a battering ram.", tags: ["Damage", "Melee", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }] },
    combo_witching_thorns: { ability_id: "combo_witching_thorns", display_name: "Witching Thorns", users: ["Eline", "Varro"], type: "Duo", sp_cost: 7, set_value: 18, speed_mod: 2, target_type: "SingleEnemy", description: "Entangle a foe in arcane thorns, dealing damage and inflicting a lasting Curse.", tags: ["Damage", "Magic", "Debuff", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }, { type: 'apply_status', status: 'Curse', duration: 3 }] },
    combo_venom_foretold: { ability_id: "combo_venom_foretold", display_name: "Venom Foretold", users: ["Eline", "Kestril"], type: "Duo", sp_cost: 7, set_value: 22, speed_mod: 3, target_type: "SingleEnemy", description: "A poison-infused strike so potent it creates a restorative Mending aura for the party.", tags: ["Damage", "Melee", "Buff", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }, { type: 'apply_status', status: 'Mend', duration: 1, target: 'allies' }] },
    combo_swift_mercy: { ability_id: "combo_swift_mercy", display_name: "Swift Mercy", users: ["Eline", "Lira"], type: "Duo", sp_cost: 8, set_value: 26, speed_mod: 4, target_type: "SingleEnemy", description: "An elite-damage, single-target strike that offers a swift, merciful end.", tags: ["Damage", "Melee", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }] },
    combo_savage_ambush: { ability_id: "combo_savage_ambush", display_name: "Savage Ambush", users: ["Eline", "Grim"], type: "Duo", sp_cost: 9, set_value: 28, speed_mod: 2, target_type: "SingleEnemy", description: "A savage surprise attack that deals very high damage and leaves the target Distracted.", tags: ["Damage", "Melee", "Debuff", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }, { type: 'apply_status', status: 'Distracted', duration: 2 }] },
    combo_echoing_spell: { ability_id: "combo_echoing_spell", display_name: "Echoing Spell", users: ["Varro", "Kestril"], type: "Duo", sp_cost: 8, set_value: 18, speed_mod: 1, target_type: "AllEnemies", description: "Unleash a powerful AoE magical attack that echoes across the battlefield.", tags: ["Damage", "Magic", "AoE", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }] },
    combo_siphoning_seal: { ability_id: "combo_siphoning_seal", display_name: "Siphoning Seal", users: ["Varro", "Lira"], type: "Duo", sp_cost: 7, set_value_damage: 19, set_value_heal: 9, speed_mod: 2, target_type: "SingleEnemy", description: "Damage a foe to siphon health to the casters, while a Mending aura envelops the whole party.", tags: ["Damage", "Heal", "Magic", "Defensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated_custom', custom_value_key: 'set_value_damage' }, { type: 'heal', target: 'casters', value_source: 'calculated_custom', custom_value_key: 'set_value_heal' }, { type: 'apply_status', status: 'Mend', duration: 2, target: 'allies' }] },
    combo_runic_juggernaut: { ability_id: "combo_runic_juggernaut", display_name: "Runic Juggernaut", users: ["Varro", "Grim"], type: "Duo", sp_cost: 9, set_value: 27, speed_mod: -2, target_type: "SingleEnemy", description: "A powerful single-target attack combining magical runes and overwhelming physical force.", tags: ["Damage", "Melee", "Magic", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }] },
    combo_vital_thread: { ability_id: "combo_vital_thread", display_name: "Vital Thread", users: ["Kestril", "Lira"], type: "Duo", sp_cost: 7, set_value: 30, speed_mod: 3, target_type: "SingleAlly", description: "Weave a thread of pure life force, providing a potent, single-target heal.", tags: ["Heal", "Defensive"], isCombo: true, effects: [{ type: 'heal', value_source: 'calculated' }] },
    combo_rage_foretold: { ability_id: "combo_rage_foretold", display_name: "Rage Foretold", users: ["Kestril", "Grim"], type: "Duo", sp_cost: 8, set_value: 24, speed_mod: 0, target_type: "SingleEnemy", description: "A high-damage, single-target guided attack born of controlled rage.", tags: ["Damage", "Melee", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }] },
    combo_soul_fired_fury: { ability_id: "combo_soul_fired_fury", display_name: "Soul-Fired Fury", users: ["Lira", "Grim"], type: "Duo", sp_cost: 8, set_value: 23, speed_mod: 1, target_type: "SingleEnemy", description: "A strike fueled by burning soulfire that damages a target and grants Empower to the entire party.", tags: ["Damage", "Melee", "Buff", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }, { type: 'apply_status', status: 'Empower', duration: 3, target: 'allies' }] },
    combo_sealed_fate: { ability_id: "combo_sealed_fate", display_name: "Sealed Fate", users: ["Dranick", "Eline", "Varro"], type: "Trio", sp_cost: 12, set_value: 28, speed_mod: -2, target_type: "AllEnemies", description: "A high-damage AoE assault that seals the fate of all enemies caught in its wake.", tags: ["Damage", "AoE", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }] },
    combo_preserved_ground: { ability_id: "combo_preserved_ground", display_name: "Preserved Ground", users: ["Dranick", "Eline", "Kestril"], type: "Trio", sp_cost: 11, set_value: 15, speed_mod: 0, target_type: "AllEnemies", description: "The ground cracks with temporal energy, damaging and applying Slow to all enemies.", tags: ["Damage", "AoE", "Debuff", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }, { type: 'apply_status', status: 'Slow', duration: 3 }] },
    combo_cycle_of_rot_and_growth: { ability_id: "combo_cycle_of_rot_and_growth", display_name: "Cycle of Rot & Growth", users: ["Dranick", "Eline", "Lira"], type: "Trio", sp_cost: 12, set_value: 20, speed_mod: -1, target_type: "AllEnemies", description: "Damages all enemies with a wave of decay, then transforms that energy to heal all allies for an equal amount.", tags: ["Damage", "Heal", "AoE", "Defensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated', remember_as: 'last_damage' }, { type: 'heal', target: 'allies', value_source: 'memory', value: 'last_damage', message: "...and transforms the decay to heal all allies for {value}." }] },
    combo_mire_and_maul: { ability_id: "combo_mire_and_maul", display_name: "Mire and Maul", users: ["Dranick", "Eline", "Grim"], type: "Trio", sp_cost: 13, set_value: 40, speed_mod: -2, target_type: "SingleEnemy", description: "An overwhelming, single-target physical blow that leaves little but ruin.", tags: ["Damage", "Melee", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }] },
    combo_aegis_of_ages: { ability_id: "combo_aegis_of_ages", display_name: "Aegis of Ages", users: ["Dranick", "Varro", "Kestril"], type: "Trio", sp_cost: 11, set_value: 15, speed_mod: 5, target_type: "AllAllies", description: "A pulse of ancient power heals the party and grants a powerful Aegis to all allies.", tags: ["Heal", "Defense", "Support", "Buff", "Defensive"], isCombo: true, effects: [{ type: 'heal', value_source: 'calculated' }, { type: 'apply_status', status: 'Aegis', duration: 3 }] },
    combo_font_of_life: { ability_id: "combo_font_of_life", display_name: "Font of Life", users: ["Dranick", "Varro", "Lira"], type: "Trio", sp_cost: 16, set_value: 999, speed_mod: -3, target_type: "AllAllies", description: "Tap into a font of pure life essence, fully restoring the entire party to their maximum HP.", tags: ["Heal", "AoE", "Defensive"], isCombo: true, effects: [{ type: 'heal', value_source: 'absolute', value: 9999, message: "...fully restoring the party's HP!" }] },
    combo_runic_colossus: { ability_id: "combo_runic_colossus", display_name: "Runic Colossus", users: ["Dranick", "Varro", "Grim"], type: "Trio", sp_cost: 14, set_value: 35, speed_mod: -4, target_type: "AllEnemies", description: "Combine physical and magical force to become a runic colossus, unleashing a devastating AoE attack.", tags: ["Damage", "AoE", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }] },
    combo_vow_of_foresight: { ability_id: "combo_vow_of_foresight", display_name: "Vow of Foresight", users: ["Dranick", "Kestril", "Lira"], type: "Trio", sp_cost: 10, set_value: 0, speed_mod: 3, target_type: "AllAllies", description: "A shared vision of the future grants both Haste and Aegis to the entire party.", tags: ["Support", "Buff", "Defensive"], isCombo: true, effects: [{ type: 'apply_status', status: 'Haste', duration: 3 }, { type: 'apply_status', status: 'Aegis', duration: 3 }] },
    combo_guided_cataclysm: { ability_id: "combo_guided_cataclysm", display_name: "Guided Cataclysm", users: ["Dranick", "Kestril", "Grim"], type: "Trio", sp_cost: 13, set_value: 42, speed_mod: -2, target_type: "SingleEnemy", description: "A massive-damage, single-target attack that also leaves the enemy Distracted.", tags: ["Damage", "Melee", "Debuff", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }, { type: 'apply_status', status: 'Distracted', duration: 1 }] },
    combo_sacred_fury: { ability_id: "combo_sacred_fury", display_name: "Sacred Fury", users: ["Dranick", "Lira", "Grim"], type: "Trio", sp_cost: 13, set_value: 38, speed_mod: -1, target_type: "SingleEnemy", description: "A sacred strike that converts 50% of its damage into party healing and grants a Mending aura.", tags: ["Damage", "Heal", "Melee", "Defensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated', remember_as: 'last_damage' }, { type: 'heal', target: 'allies', value_source: 'memory', value: 'last_damage * 0.5' }, { type: 'apply_status', status: 'Mend', duration: 2, target: 'allies' }] },
    combo_miasma_of_paradox: { ability_id: "combo_miasma_of_paradox", display_name: "Miasma of Paradox", users: ["Eline", "Varro", "Kestril"], type: "Trio", sp_cost: 12, set_value: 18, speed_mod: 1, target_type: "AllEnemies", description: "A mind-bending miasma damages all enemies and leaves them Distracted.", tags: ["Damage", "AoE", "Debuff", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }, { type: 'apply_status', status: 'Distracted', duration: 2 }] },
    combo_baleful_trinity: { ability_id: "combo_baleful_trinity", display_name: "Baleful Trinity", users: ["Eline", "Varro", "Lira"], type: "Trio", sp_cost: 12, set_value: 36, speed_mod: 2, target_type: "SingleEnemy", description: "A high-damage, single-target attack combining three distinct and baleful magical elements.", tags: ["Damage", "Magic", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }] },
    combo_arcane_ambush: { ability_id: "combo_arcane_ambush", display_name: "Arcane Ambush", users: ["Eline", "Varro", "Grim"], type: "Trio", sp_cost: 13, set_value: 39, speed_mod: 0, target_type: "SingleEnemy", description: "A massive-damage, single-target pincer attack executed with arcane precision.", tags: ["Damage", "Melee", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }] },
    combo_trinity_of_grace: { ability_id: "combo_trinity_of_grace", display_name: "Trinity of Grace", users: ["Eline", "Kestril", "Lira"], type: "Trio", sp_cost: 12, set_value: 37, speed_mod: 3, target_type: "SingleEnemy", description: "A graceful, high-damage synchronized assault that leaves a Mending aura on the party.", tags: ["Damage", "Melee", "Buff", "Defensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }, { type: 'apply_status', status: 'Mend', duration: 2, target: 'allies' }] },
    combo_calculated_carnage: { ability_id: "combo_calculated_carnage", display_name: "Calculated Carnage", users: ["Eline", "Kestril", "Grim"], type: "Trio", sp_cost: 13, set_value: 32, speed_mod: 1, target_type: "AllEnemies", description: "A powerful AoE counter-attack born from tactical calculation and raw carnage.", tags: ["Damage", "AoE", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }] },
    combo_hunters_triage: { ability_id: "combo_hunters_triage", display_name: "Hunter's Triage", users: ["Eline", "Lira", "Grim"], type: "Trio", sp_cost: 12, set_value_damage: 30, set_value_heal: 13, speed_mod: 2, target_type: "SingleEnemy", description: "Deals high damage to one target while a hunter's foresight provides a moderate party-wide heal.", tags: ["Damage", "Heal", "Defensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated_custom', custom_value_key: 'set_value_damage' }, { type: 'heal', target: 'allies', value_source: 'calculated_custom', custom_value_key: 'set_value_heal' }] },
    combo_seal_of_providence: { ability_id: "combo_seal_of_providence", display_name: "Seal of Providence", users: ["Varro", "Kestril", "Lira"], type: "Trio", sp_cost: 11, set_value: 15, speed_mod: 3, target_type: "AllEnemies", description: "A divine seal strikes all foes, simultaneously healing the party and granting Empower to all allies.", tags: ["Damage", "Heal", "Support", "Buff", "Defensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }, { type: 'heal', target: 'allies', value_source: 'calculated' }, { type: 'apply_status', status: 'Empower', duration: 3, target: 'allies' }] },
    combo_anathema_strike: { ability_id: "combo_anathema_strike", display_name: "Anathema Strike", users: ["Varro", "Kestril", "Grim"], type: "Trio", sp_cost: 13, set_value: 35, speed_mod: -2, target_type: "SingleEnemy", description: "A high-damage magic attack that strikes a foe with both a Weaken and a Curse.", tags: ["Damage", "Magic", "Debuff", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }, { type: 'apply_status', status: 'Weaken', duration: 3 }, { type: 'apply_status', status: 'Curse', duration: 3 }] },
    combo_soulcrushing_weight: { ability_id: "combo_soulcrushing_weight", display_name: "Soulcrushing Weight", users: ["Varro", "Lira", "Grim"], type: "Trio", sp_cost: 13, set_value: 22, speed_mod: -3, target_type: "AllEnemies", description: "The weight of existence crashes down, damaging all enemies and leaving them Weaken.", tags: ["Damage", "AoE", "Debuff", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }, { type: 'apply_status', status: 'Weaken', duration: 3 }] },
    combo_climax_of_fate: { ability_id: "combo_climax_of_fate", display_name: "Climax of Fate", users: ["Kestril", "Lira", "Grim"], type: "Trio", sp_cost: 15, set_value: 50, speed_mod: -2, target_type: "SingleEnemy", description: "A climactic, single-target strike that embodies the absolute pinnacle of destructive power.", tags: ["Damage", "Melee", "Offensive"], isCombo: true, effects: [{ type: 'damage', value_source: 'calculated' }] },
};


export const ALL_ABILITIES_DATA = {
    ...ABILITIES_DATA, 
    ...COMBOS_DATA, 
    ...BUFF_ABILITIES_DATA, 
    ...MILESTONE_DATA.abilities.bastion.reduce((obj, item) => ({...obj, [item.id]: item }), {}),
    ...MILESTONE_DATA.abilities.executioner.reduce((obj, item) => ({...obj, [item.id]: item }), {}),
    ...MILESTONE_DATA.abilities.veilwalker.reduce((obj, item) => ({...obj, [item.id]: item }), {}),
};

export const ENEMIES_BY_TIER = {
    low: [
        "nest_of_folds", "gnurl", "murmur_scrip", "ruin_gnats", "mireling"
    ],
    mid: [
        "grieve_skin", "oath_larvae", "autoclast_of_the_weft", "soul_scar_warden"
    ],
    high: [
        "abyssal_archivist", "existential_dreadnought"
    ]
};

export const ENEMY_SCALING_DATA = {
    10: { hp: 10, con: 1, spd: 0, newEnemies: ["grieve_skin", "oath_larvae"]},
    20: { hp: 20, con: 2, spd: 1, newEnemies: ["autoclast_of_the_weft", "soul_scar_warden"]},
    30: { hp: 30, con: 3, spd: 1, newEnemies: ["abyssal_archivist"]},
    40: { hp: 40, con: 4, spd: 2, newEnemies: ["existential_dreadnought"]},
};

export const ENEMIES_DATA = {
    nest_of_folds: { enemy_id: "nest_of_folds", display_name: "Nest of Folds", base_stats: { base_hp: 45, con: 5, spd: 3 }, abilities: ["mind_jab_low", "invert_step", "recoil_veil"] },
    gnurl: { enemy_id: "gnurl", display_name: "Gnurl", base_stats: { base_hp: 40, con: 4, spd: 5 }, abilities: ["mind_jab_low", "warp_trail", "recoil_veil"] },
    murmur_scrip: { enemy_id: "murmur_scrip", display_name: "Murmur Scrip", base_stats: { base_hp: 35, con: 5, spd: 4 }, abilities: ["mind_jab_low", "scripted_compulsion", "recoil_veil"] },
    ruin_gnats: { enemy_id: "ruin_gnats", display_name: "Ruin Gnats", base_stats: { base_hp: 50, con: 5, spd: 5 }, abilities: ["mind_jab_low", "conviction_swarm", "recoil_veil"] },
    mireling: { enemy_id: "mireling", display_name: "Mireling", base_stats: { base_hp: 40, con: 6, spd: 2 }, abilities: ["mind_jab_low", "sludge_spit", "recoil_veil"] },
    grieve_skin: { enemy_id: "grieve_skin", display_name: "Grieve Skin", base_stats: { base_hp: 80, con: 8, spd: 2 }, abilities: ["mind_jab_mid", "echo_grasp", "recoil_veil"] },
    oath_larvae: { enemy_id: "oath_larvae", display_name: "Oath Larvae", base_stats: { base_hp: 85, con: 9, spd: 1 }, abilities: ["mind_jab_mid", "vow_split", "recoil_veil"] },
    autoclast_of_the_weft: { enemy_id: "autoclast_of_the_weft", display_name: "Autoclast of the Weft", base_stats: { base_hp: 95, con: 8, spd: 3 }, abilities: ["mind_jab_mid", "thread_sever", "recoil_veil"] },
    soul_scar_warden: { enemy_id: "soul_scar_warden", display_name: "Soul-Scar Warden", base_stats: { base_hp: 110, con: 10, spd: 2}, abilities: ["mind_jab_mid", "sorrows_toll", "recoil_veil"]},
    abyssal_archivist: { enemy_id: "abyssal_archivist", display_name: "Abyssal Archivist", base_stats: { base_hp: 130, con: 11, spd: 3 }, abilities: ["mind_jab_high", "written_fate", "recoil_veil"] },
    existential_dreadnought: { enemy_id: "existential_dreadnought", display_name: "Existential Dreadnought", base_stats: { base_hp: 180, con: 12, spd: 1 }, abilities: ["mind_jab_high", "existential_shear", "recoil_veil"]},
};

export const ENEMY_ABILITIES_DATA = {
    mind_jab_low: { ability_id: "mind_jab_low", display_name: "Mind Jab", type: "Attack", set_value: [2, 8], bonus_value: [1, 5], speed_mod: 0, target_type: "RandomHero", description: "Deals 2-8 base damage plus 1-5 bonus damage.", tags: ["Damage"], effects: [{ type: 'damage_enemy' }] },
    mind_jab_mid: { ability_id: "mind_jab_mid", display_name: "Mind Jab", type: "Attack", set_value: [5, 10], bonus_value: [3, 7], speed_mod: 0, target_type: "RandomHero", description: "Deals 5-10 base damage plus 3-7 bonus damage.", tags: ["Damage"], effects: [{ type: 'damage_enemy' }] },
    mind_jab_high: { ability_id: "mind_jab_high", display_name: "Mind Jab", type: "Attack", set_value: [8, 18], bonus_value: [5, 10], speed_mod: 0, target_type: "RandomHero", description: "Deals 8-18 base damage plus 5-10 bonus damage.", tags: ["Damage"], effects: [{ type: 'damage_enemy' }] },
    conviction_swarm: { ability_id: "conviction_swarm", display_name: "Conviction Swarm", type: "Attack", set_value: 6, bonus_value: [1, 5], speed_mod: 0, target_type: "RandomHero", description: "Deals 6 base damage plus 1-5 bonus damage and applies the Weaken debuff for 2 turns.", tags: ["Damage", "Debuff"], effects: [{ type: 'damage_enemy' }, { type: 'apply_status', status: 'Weaken', duration: 2 }] },
    sludge_spit: { ability_id: "sludge_spit", display_name: "Sludge Spit", type: "Attack", set_value: 7, bonus_value: [1, 5], speed_mod: 0, target_type: "RandomHero", description: "Deals 7 base damage plus 1-5 bonus damage and applies the Slow debuff for 2 turns.", tags: ["Damage", "Debuff"], effects: [{ type: 'damage_enemy' }, { type: 'apply_status', status: 'Slow', duration: 2 }] },
    thread_sever: { ability_id: "thread_sever", display_name: "Thread Sever", type: "Attack", set_value: 11, bonus_value: [3, 10], speed_mod: 0, target_type: "RandomHero", description: "Deals 11 base damage plus 3-10 bonus damage and applies the Weaken debuff for 2 turns.", tags: ["Damage", "Debuff"], effects: [{ type: 'damage_enemy' }, { type: 'apply_status', status: 'Weaken', duration: 2 }] },
    sorrows_toll: { ability_id: 'sorrows_toll', display_name: "Sorrow's Toll", type: "Effect", speed_mod: -1, target_type: 'RandomHero', description: 'Applies the Soul-Scar (healing block) debuff for 3 turns.', tags: ['Debuff'], effects: [{ type: 'apply_status', status: 'healing_block', duration: 3}]},
    existential_shear: { ability_id: 'existential_shear', display_name: "Existential Shear", type: 'Attack', speed_mod: -2, target_type: 'RandomHero', description: 'Shears away at a target\'s very existence, dealing 20% of their Max HP as damage.', tags: ['Damage', 'MaxHP'], effects: [{ type: 'damage_max_hp_percent', value: 0.20}]},
    invert_step: { ability_id: "invert_step", display_name: "Invert Step", type: "Effect", speed_mod: 0, target_type: "Self", description: "Applies the Haste buff for 2 turns.", tags: ["Buff"], effects: [{ type: 'apply_status', status: 'Haste', duration: 2 }] },
    warp_trail: { ability_id: "warp_trail", display_name: "Warp Trail", type: "Effect", speed_mod: 0, target_type: "Self", description: "Applies the Aegis buff for 2 turns.", tags: ["Buff"], effects: [{ type: 'apply_status', status: 'Aegis', duration: 2 }] },
    scripted_compulsion: { ability_id: "scripted_compulsion", display_name: "Scripted Compulsion", type: "Effect", speed_mod: 0, target_type: "RandomHero", description: "Applies the Distracted debuff for 2 turns.", tags: ["Debuff"], effects: [{ type: 'apply_status', status: 'Distracted', duration: 2 }] },
    echo_grasp: { ability_id: "echo_grasp", display_name: "Echo Grasp", type: "Effect", speed_mod: 0, target_type: "RandomHero", description: "Applies the Slow debuff for 2 turns.", tags: ["Debuff"], effects: [{ type: 'apply_status', status: 'Slow', duration: 2 }] },
    vow_split: { ability_id: "vow_split", display_name: "Vow Split", type: "Effect", speed_mod: 0, target_type: "Self", description: "Applies the Mend buff for 2 turns.", tags: ["Buff"], effects: [{ type: 'apply_status', status: 'Mend', duration: 2 }] },
    written_fate: { ability_id: "written_fate", display_name: "Written Fate", type: "Effect", speed_mod: 0, target_type: "RandomHero", description: "Applies the Curse debuff for 2 turns.", tags: ["Debuff"], effects: [{ type: 'apply_status', status: 'Curse', duration: 2 }] },
    recoil_veil: { ability_id: "recoil_veil", display_name: "Recoil Veil", type: "Defense", speed_mod: 3, target_type: "Self", description: "Reduces incoming damage by a random 20-50% until the end of the next turn.", tags: ["Defense", "Buff"], effects: [{ type: 'apply_status', status: 'recoil_veil', duration: 2 }] },
};

// --- NEW: LORE & DIALOGUE DATA ---

export const LORE_FRAGMENTS = [
    "The stone here doesn't just echo sound, it echoes intent. Every promise made, every lie told... it remembers.",
    "They say the first explorers tried to map this place. Their maps became maddening spirals, leading back to their own footprints.",
    "Time does not flow here. It pools. It stagnates. We wade through the dregs of forgotten eons.",
    "This entire structure is a monument to a single, failed promise. A seal that has slowly, inevitably, withered.",
    "The architect of this place did not build with stone, but with regret. We are trespassing in a tomb of sorrow.",
    "A psychic resonance clings to the air, a constant hum of thoughts that are not your own. It is the price of knowledge.",
    "This place remembers every footstep. Some paths are worn into the stone by memory alone.",
    "Even the dead leave echoes here—shadows that do not know they’ve faded.",
    "The Sleeper does not stir, yet the ground swells as though beneath breat  h.",
    "There is no map for this descent. Every line you draw is already erased.",
    "They called themselves The Eleventh. Now the stones call them something else.",
    "Time pools in fractures. Step carefully, lest you slip into another era’s ruin.",
    "The Council’s silence is not absence. It is waiting.",
    "To descend is to peel away certainty, layer by layer, until only hunger remains.",
    "They carved warnings into the walls, but the language has teeth now.",
    "Some doors are not meant to open. Others open on their own.",
    "The deeper you go, the less of you returns.",
    "There are whispers in the stone, but they speak of things no voice should shape.",
    "The seal was never meant to hold forever. It frays. It yields.",
    "Those who gaze too long into the veils beneath forget the shapes of their own hands.",
    "Some structures are alive, though their bones are stone and regret.",
    "The first explorers built spirals because straight lines led nowhere.",
    "You cannot kill what never lived. You can only forget.",
    "Beneath the oldest ruins lie older ruins still, each layer more impossible than the last.",
    "The Eleventh sought answers. They found reflections instead.",
    "Every pact has weight, every ascent has debt.",
    "The hum you hear is not mechanical. It is breath, slowed to a crawl.",
    "They buried their doubts in silence. The silence grew roots.",
    "Not all ghosts are dead. Some are memories that refuse to cease thinking.",
    "The ink on ancient contracts still drips, centuries after the parchment rotted.",
    "The Sleeper does not dream. It watches without watching.",
    "Shadows fall upward here. Do not follow them.",
    "Even the echoes have forgotten what they once repeated.",
    "Circles drawn in desperation still pulse faintly. Fading, but not gone.",
    "There was a time before the Seal, but even the stones refuse to speak of it.",
    "Nothing ends. It only sinks deeper."
];

export const SPIRIT_DIALOGUE = {
    dranick: [
        "My vow feels... thin here. Hold fast.",
        "The weight of our duty never truly lifts, does it?",
        "Protect the others. That is all that matters now."
    ],
    eline: [
        "The walls are breathing. Can you feel it?",
        "Listen to the silence. It has a story to tell.",
        "Don't trust the shadows. I learned that too late."
    ],
    varro: [
        "The arcane energies here are... wrong. Unwoven.",
        "A seal this powerful should be silent. This one screams.",
        "There are patterns in the chaos. Try to see them."
    ],
    kestril: [
        "Past, present, and future bleed together here. It's blinding.",
        "I saw our arrival. I saw... this. But not the end.",
        "Be careful what you sacrifice. Some prices are paid forever."
    ],
    lira: [
        "The threads of fate are tangled, frayed. So much pain.",
        "Even in this oppressive dark, there is a pulse. A lifebeat.",
        "Do not let your focus waver. It is the only shield you have."
    ],
    grim: [
        "This place tries to crush your spirit. Don't let it.",
        "My rage feels cold here. Like a dying star.",
        "Break what you must, but do not let it break you."
    ]
};

// PATCH 6: Added exports for nested milestone data
export const PATHS_DATA = MILESTONE_DATA.paths;
export const PATH_ABILITIES_DATA = MILESTONE_DATA.abilities;
export const MINOR_REWARDS_DATA = MILESTONE_DATA.rewards.minor;
export const MAJOR_REWARDS_DATA = MILESTONE_DATA.rewards.major;