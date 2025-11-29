/**
 * Core type definitions for The Final Descent
 */

// ============================================================================
// Character & Stats
// ============================================================================

export type CharacterId =
  | 'dranick'
  | 'eline'
  | 'varro'
  | 'kestril'
  | 'lira'
  | 'grim';

export type CharacterRole =
  | 'tank'
  | 'support'
  | 'scout'
  | 'control'
  | 'hybrid'
  | 'healer'
  | 'striker'
  | 'berserker'
  | 'damage';

export interface BaseStats {
  hp: number;
  con: number; // Conviction
  spd: number; // Speed
}

export interface Character {
  id: CharacterId;
  name: string;
  role: CharacterRole;
  baseStats: BaseStats;
  abilityIds: string[]; // IDs of single-character abilities
}

export interface CombatantStats extends BaseStats {
  maxHp: number;
  currentHp: number;
}

// ============================================================================
// Abilities & Actions
// ============================================================================

export type TargetType =
  | 'single_enemy'
  | 'all_enemies'
  | 'single_ally'
  | 'all_allies'
  | 'self'
  | 'all';

export type AbilityType =
  | 'standard'
  | 'special'
  | 'duo'
  | 'trio';

export type EffectType =
  | 'damage'
  | 'heal'
  | 'buff'
  | 'debuff'
  | 'mixed'
  | 'special';

export interface AbilityEffect {
  type: EffectType;
  setValue: number; // Base value (0 for buff-only abilities)
  statusEffects?: StatusEffectApplication[];
  specialMechanic?: string; // For unique effects
}

export interface StatusEffectApplication {
  statusId: string;
  duration: number;
  magnitude?: number;
}

export interface Ability {
  id: string;
  name: string;
  abilityType: AbilityType;
  owners: CharacterId[]; // Single char = 1, duo = 2, trio = 3
  spCost: number;
  speedMod: number; // Modifier added to initiative
  cooldown: number; // Rounds before can be used again
  targetType: TargetType;
  effects: AbilityEffect[];
  tags?: string[]; // For AI behavior
}

// ============================================================================
// Status Effects
// ============================================================================

export type StatusCategory = 'buff' | 'debuff';

export interface StatusEffect {
  id: string;
  name: string;
  category: StatusCategory;
  description: string;
  // Effect behavior is handled by engine
}

export interface ActiveStatusEffect {
  statusId: string;
  duration: number; // Rounds remaining
  magnitude: number; // Effect strength
  source: string; // Ability ID that applied it
}

// ============================================================================
// Combatants (Characters + Enemies in combat)
// ============================================================================

export interface Combatant {
  id: string; // Unique instance ID
  type: 'player' | 'enemy';
  characterId?: CharacterId; // For player combatants
  enemyId?: string; // For enemy combatants
  name: string;
  stats: CombatantStats;
  level: number;
  statusEffects: ActiveStatusEffect[];
  isAlive: boolean;
  cooldowns: Map<string, number>; // abilityId -> rounds remaining
}

// ============================================================================
// Enemies
// ============================================================================

export interface Enemy {
  id: string;
  name: string;
  baseStats: BaseStats;
  abilityIds: string[];
  aiProfile: AIProfile;
  isBoss: boolean;
}

export interface AIProfile {
  targetingWeights: ThreatWeights;
  abilityWeights: AbilitySelectionWeights;
}

export interface ThreatWeights {
  currentHp: number;
  damageDealtLastRound: number;
  healingDoneLastRound: number;
  hasTaunt: number;
  isLowestHp: number;
  buffCount: number;
  debuffCount: number;
}

export interface AbilitySelectionWeights {
  selfHpLow: { threshold: number; defensive: number; healing: number; offensive: number };
  allyHpLow: { threshold: number; healing: number; buff: number; offensive: number };
  targetManyBuffs: { threshold: number; debuff: number; highDamage: number; normal: number };
  default: { [key: string]: number };
}

// ============================================================================
// Combat State
// ============================================================================

export interface CombatAction {
  actionId: string; // Unique ID for this action instance
  abilityId: string;
  actorId: string; // Combatant ID
  targetIds: string[]; // Can be multiple for AOE
  initiative: number; // Calculated initiative score
}

export interface CombatState {
  round: number;
  currentSP: number;
  maxSP: number;
  spRegen: number;
  playerCombatants: Combatant[];
  enemyCombatants: Combatant[];
  actionQueue: CombatAction[];
  combatLog: string[];
  isPlayerTurn: boolean; // True when player is selecting actions
  offeredActions: Ability[]; // The 4 actions offered this round
}

// ============================================================================
// Items
// ============================================================================

export type ItemType =
  | 'healing_potion'
  | 'sp_potion'
  | 'skip_node'
  | 'resurrect'
  | 'permanent_buff'
  | 'temp_buff';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  cost: number; // Gold cost in shop
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}

// ============================================================================
// Map & Nodes
// ============================================================================

export type NodeType =
  | 'combat'
  | 'memory'
  | 'shop'
  | 'rest'
  | 'hazard'
  | 'story'
  | 'boss';

export type NodeStatus = 'hidden' | 'available' | 'completed';

export interface Node {
  id: string;
  type: NodeType;
  status: NodeStatus;
  connectedNodeIds: string[];
  encounterData?: EncounterData;
}

export interface EncounterData {
  enemyIds?: string[]; // For combat/boss nodes
  loreId?: string; // For memory/story nodes
  shopSeed?: number; // For shop nodes
}

export interface FloorMap {
  floorNumber: number;
  nodes: Map<string, Node>;
  currentNodeId: string | null;
}

// ============================================================================
// Run & Progression
// ============================================================================

export interface PartyMember {
  character: Character;
  isActive: boolean; // true = alive at run start, false = dead at run start
  isDead: boolean; // true = has died during this run
  currentHp: number;
  level: number;
}

export interface RunState {
  currentFloor: number;
  party: PartyMember[];
  gold: number;
  inventory: InventoryItem[];
  floorMap: FloorMap;
  collectedLore: string[];
  memoryFragments: number; // Meta-progression currency
}

// ============================================================================
// Level Value Table (for damage/heal calculations)
// ============================================================================

export const LEVEL_VALUES: Record<number, number> = {
  1: 0.5,
  2: 0.6,
  3: 0.7,
  4: 0.8,
  5: 0.9,
  6: 1.0,
  7: 1.1,
  8: 1.2,
  9: 1.3,
  10: 1.4,
};

// ============================================================================
// Constants
// ============================================================================

export const COMBAT_CONSTANTS = {
  STARTING_SP: 10,
  MAX_SP: 18,
  BASE_SP_REGEN: 6,
  SP_PENALTY_PER_DEATH: 3,
  MIN_SP_REGEN: 1,
  ACTIONS_OFFERED_PER_ROUND: 4,
  DEFEND_DAMAGE_REDUCTION: 0.3, // 30%
  MAX_INVENTORY_SLOTS: 6,
} as const;

export const FLOOR_CONSTANTS = {
  TOTAL_FLOORS: 10,
  MEMORY_HEAL_PERCENT: 0.2, // 20% of total party max HP
} as const;

export const PARTY_CONSTANTS = {
  TOTAL_CHARACTERS: 6,
  ACTIVE_AT_START: 3,
  DEAD_AT_START: 3,
  FULL_REROLL_COST: 1,
  SINGLE_REROLL_COST: 2,
  TOTAL_REROLLS: 3,
} as const;
