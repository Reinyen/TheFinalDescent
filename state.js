// =================================================================================
// FILE: state.js
// Purpose: Centralized Game State Management
// PATCH: Added milestone progression state.
// =================================================================================

export const GameState = {
    party: [],
    enemies: [],
    currentSP: 0,
    round: 1,
    level: 1,
    actionPool: [],
    selectedActions: [],
    isPlayerTurn: true,
    isCombatActive: false,
    rerollsLeft: 3,
    currentDungeonNodeId: null,
    lastCompletedNode: null,
    isBossEncounter: false,
    activeTemporaryBoon: null, // Only one minor boon can be active.
    bossDefeated: false,
    activeChatCharacterId: null,
    currentEncounterType: null,
    milestoneProgression: { characterIndex: 0, level: 0, onCompleteCallback: null }
};