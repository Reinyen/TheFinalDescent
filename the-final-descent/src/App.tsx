/**
 * The Final Descent - Main Game Application
 * Phase 3: Full game loop with map, nodes, and combat integration
 */

import { useState } from 'react';
import { useRunStore } from './store/runStore';
import { useCombatStore } from './store/combatStore';
import { getAvailableNodes } from './engine/mapGenerator';
import { applyMemoryHealing, applyHazardDamage } from './engine/nodeResolver';
import { getAllCharacters } from './data/characters';
import type { NodeChoice } from './engine/nodeResolver';
import type { Item } from './types/core';
import { IntroScreen } from './components/IntroScreen';
import './App.css';

function App() {
  const [gamePhase, setGamePhase] = useState<'intro' | 'party_select' | 'map' | 'node' | 'combat'>('intro');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);

  const runStore = useRunStore();
  const combatStore = useCombatStore();

  // Party Selection
  const handleCharacterToggle = (characterId: string) => {
    if (selectedCharacters.includes(characterId)) {
      setSelectedCharacters(selectedCharacters.filter(id => id !== characterId));
    } else if (selectedCharacters.length < 3) {
      setSelectedCharacters([...selectedCharacters, characterId]);
    }
  };

  const handleStartRun = () => {
    if (selectedCharacters.length === 3) {
      runStore.startRun(selectedCharacters);
      setGamePhase('map');
    }
  };

  // Map Navigation
  const handleNodeClick = (nodeId: string) => {
    runStore.enterNode(nodeId);
    const result = runStore.currentNodeResult;

    if (result?.combatRequired) {
      // Start combat
      const enemies = runStore.startCombatFromNode();
      combatStore.startCombat(runStore.party, enemies, runStore.inventory);
      setGamePhase('combat');
    } else {
      // Non-combat node
      setGamePhase('node');
    }
  };

  // Node Resolution
  const handleMemoryComplete = () => {
    const healing = applyMemoryHealing(runStore.party);
    runStore.applyNodeReward(healing);
    setGamePhase('map');
  };

  const handleRestChoice = (choice: NodeChoice) => {
    runStore.makeRestChoice(choice);
    setGamePhase('map');
  };

  const handleShopPurchase = (item: Item) => {
    runStore.purchaseItem(item);
  };

  const handleHazardComplete = () => {
    const result = runStore.currentNodeResult;
    if (result?.hazardDamage) {
      applyHazardDamage(runStore.party, result.hazardDamage);
    }
    if (runStore.currentNodeId) {
      runStore.completeNode(runStore.currentNodeId);
    }
    setGamePhase('map');
  };

  // Combat Resolution
  const handleCombatEnd = () => {
    const result = combatStore.combatResult;

    if (result === 'player_victory') {
      runStore.completeCombat(true);
      setGamePhase('map');
    } else {
      runStore.completeCombat(false);
      // Offer checkpoint
      setGamePhase('map');
    }

    combatStore.reset();
  };

  // Render based on phase
  if (gamePhase === 'intro') {
    return <IntroScreen onBegin={() => setGamePhase('party_select')} />;
  }

  if (gamePhase === 'party_select') {
    return <PartySelectScreen
      selectedCharacters={selectedCharacters}
      onCharacterToggle={handleCharacterToggle}
      onStartRun={handleStartRun}
    />;
  }

  if (gamePhase === 'combat') {
    return <CombatScreen onCombatEnd={handleCombatEnd} />;
  }

  if (gamePhase === 'node') {
    return <NodeScreen
      onMemoryComplete={handleMemoryComplete}
      onRestChoice={handleRestChoice}
      onShopPurchase={handleShopPurchase}
      onHazardComplete={handleHazardComplete}
      onBack={() => setGamePhase('map')}
    />;
  }

  return <MapScreen onNodeClick={handleNodeClick} />;
}

// ============================================================================
// Party Select Screen
// ============================================================================

function PartySelectScreen({
  selectedCharacters,
  onCharacterToggle,
  onStartRun,
}: {
  selectedCharacters: string[];
  onCharacterToggle: (id: string) => void;
  onStartRun: () => void;
}) {
  const characters = getAllCharacters();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">The Final Descent</h1>
        <p className="text-xl text-center text-gray-400 mb-8">
          Select 3 characters for your expedition
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {characters.map(char => (
            <button
              key={char.id}
              onClick={() => onCharacterToggle(char.id)}
              className={`p-4 rounded-lg border-2 transition ${
                selectedCharacters.includes(char.id)
                  ? 'border-blue-500 bg-blue-900'
                  : 'border-gray-600 bg-slate-800 hover:border-gray-400'
              }`}
            >
              <div className="font-bold text-lg">{char.name}</div>
              <div className="text-sm text-gray-400">{char.role}</div>
              <div className="text-xs mt-2">
                HP: {char.baseStats.hp} | CON: {char.baseStats.con} | SPD: {char.baseStats.spd}
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className="mb-4">
            Selected: {selectedCharacters.length} / 3
          </p>
          <button
            onClick={onStartRun}
            disabled={selectedCharacters.length !== 3}
            className={`px-8 py-4 rounded-lg text-xl font-bold ${
              selectedCharacters.length === 3
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            Begin Descent
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Map Screen
// ============================================================================

function MapScreen({ onNodeClick }: { onNodeClick: (nodeId: string) => void }) {
  const { currentFloor, floorNodes, party, gold, memoryFragments, runLog } = useRunStore();
  const availableNodes = getAvailableNodes(floorNodes);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Floor {currentFloor} / 10</h1>
            <div className="text-lg">
              Gold: {gold} | Memory Fragments: {memoryFragments}
            </div>
          </div>
        </div>

        {/* Party Status */}
        <div className="bg-slate-800 rounded-lg p-4 mb-4">
          <h2 className="text-xl font-bold mb-3">Party</h2>
          <div className="grid grid-cols-3 gap-4">
            {party.map(member => (
              <div
                key={member.id}
                className={`p-3 rounded ${
                  member.isAlive ? 'bg-slate-700' : 'bg-red-900 opacity-50'
                }`}
              >
                <div className="font-bold">{member.name}</div>
                <div className="text-sm">
                  HP: {member.stats.currentHp}/{member.stats.maxHp}
                </div>
                <div className="text-xs">Level {member.level}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Map View */}
        <div className="bg-slate-800 rounded-lg p-6 mb-4">
          <h2 className="text-xl font-bold mb-4">Star Map</h2>
          <div className="grid grid-cols-4 gap-3">
            {Array.from(floorNodes.values()).map(node => (
              <button
                key={node.id}
                onClick={() => node.status === 'available' && onNodeClick(node.id)}
                disabled={node.status !== 'available'}
                className={`p-4 rounded-lg text-left transition ${
                  node.status === 'completed'
                    ? 'bg-green-900 opacity-50'
                    : node.status === 'available'
                    ? node.type === 'boss'
                      ? 'bg-red-700 hover:bg-red-600 border-2 border-red-400'
                      : 'bg-blue-700 hover:bg-blue-600'
                    : 'bg-gray-800 opacity-30'
                }`}
              >
                <div className="font-bold text-sm capitalize">{node.type}</div>
                <div className="text-xs mt-1">{node.status}</div>
              </button>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Available nodes: {availableNodes.length}
          </div>
        </div>

        {/* Log */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-3">Log</h2>
          <div className="h-48 overflow-y-auto bg-black p-3 rounded font-mono text-sm">
            {runLog.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Node Screen
// ============================================================================

function NodeScreen({
  onMemoryComplete,
  onRestChoice,
  onShopPurchase,
  onHazardComplete,
  onBack,
}: {
  onMemoryComplete: () => void;
  onRestChoice: (choice: NodeChoice) => void;
  onShopPurchase: (item: Item) => void;
  onHazardComplete: () => void;
  onBack: () => void;
}) {
  const { currentNodeResult, gold, inventory, party } = useRunStore();

  if (!currentNodeResult) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4 capitalize">
            {currentNodeResult.nodeType} Node
          </h2>

          {currentNodeResult.nodeType === 'memory' && (
            <div>
              <p className="mb-4 text-lg">
                {currentNodeResult.rewards?.lore}
              </p>
              <p className="mb-6 text-green-400">
                Party heals for 20% of max HP!
              </p>
              <button
                onClick={onMemoryComplete}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Continue
              </button>
            </div>
          )}

          {currentNodeResult.nodeType === 'rest' && currentNodeResult.choices && (
            <div>
              <p className="mb-6">Choose one benefit:</p>
              <div className="space-y-3">
                {currentNodeResult.choices.map(choice => (
                  <button
                    key={choice.id}
                    onClick={() => onRestChoice(choice)}
                    className="w-full p-4 bg-blue-700 hover:bg-blue-600 rounded text-left"
                  >
                    {choice.description}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentNodeResult.nodeType === 'story' && (
            <div>
              <p className="mb-4 italic">
                {currentNodeResult.rewards?.lore}
              </p>
              <p className="mb-6 text-yellow-400">
                +10 Memory Fragments
              </p>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Continue
              </button>
            </div>
          )}

          {currentNodeResult.nodeType === 'shop' && currentNodeResult.shopInventory && (
            <div>
              <div className="mb-6">
                <div className="flex justify-between mb-4">
                  <p className="text-xl">Gold: {gold}</p>
                  <p className="text-sm text-gray-400">Inventory: {inventory.length}/6</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {currentNodeResult.shopInventory.map((item, i) => (
                    <div
                      key={`${item.id}_${i}`}
                      className="bg-slate-700 p-4 rounded"
                    >
                      <h3 className="font-bold mb-2">{item.name}</h3>
                      <p className="text-sm text-gray-300 mb-3">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-yellow-400 font-bold">{item.cost} gold</span>
                        <button
                          onClick={() => onShopPurchase(item)}
                          disabled={gold < item.cost || inventory.length >= 6}
                          className={`px-3 py-1 rounded text-sm ${
                            gold >= item.cost && inventory.length < 6
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-600 cursor-not-allowed'
                          }`}
                        >
                          Buy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={onBack}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Leave Shop
              </button>
            </div>
          )}

          {currentNodeResult.nodeType === 'hazard' && (
            <div>
              <p className="mb-4 text-red-400 text-xl">
                Trap triggered! Party takes {currentNodeResult.hazardDamage} damage!
              </p>
              <div className="mb-6 bg-slate-700 p-4 rounded">
                <h3 className="font-bold mb-2">Party Status</h3>
                {party.map(c => (
                  <div key={c.id} className={`mb-1 ${c.isAlive ? 'text-white' : 'text-red-400'}`}>
                    {c.name}: {c.stats.currentHp}/{c.stats.maxHp} HP {!c.isAlive && '(Dead)'}
                  </div>
                ))}
              </div>
              {currentNodeResult.rewards?.items && (
                <p className="mb-4 text-green-400">Found a rare item!</p>
              )}
              <button
                onClick={onHazardComplete}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Combat Screen (Reuse from Phase 2)
// ============================================================================

function CombatScreen({ onCombatEnd }: { onCombatEnd: () => void }) {
  const {
    round,
    currentSP,
    maxSP,
    spRegen,
    playerCombatants,
    enemyCombatants,
    combatLog,
    combatStatus,
    combatResult,
    offeredActions,
    availableItems,
    usedItemThisRound,
    queuePlayerAction,
    queuePlayerItem,
    commitPlayerActions,
    resolveNextAction,
  } = useCombatStore();

  const handleActionClick = (abilityIndex: number) => {
    if (combatStatus !== 'player_turn') return;

    const ability = offeredActions[abilityIndex];
    if (!ability) return;

    const livingPlayers = playerCombatants.filter(p => p.isAlive);
    const livingEnemies = enemyCombatants.filter(e => e.isAlive);

    if (livingPlayers.length === 0 || livingEnemies.length === 0) return;

    let actorIds: string[] = [];

    if (ability.abilityType === 'duo' || ability.abilityType === 'trio') {
      for (const ownerId of ability.owners) {
        const participant = livingPlayers.find(p => p.characterId === ownerId);
        if (participant) {
          actorIds.push(participant.id);
        }
      }
    } else {
      const owner = ability.owners[0];
      const participant = livingPlayers.find(p => p.characterId === owner);
      if (participant) {
        actorIds = [participant.id];
      }
    }

    let targetIds: string[] = [];

    if (ability.targetType === 'single_enemy') {
      targetIds = [livingEnemies[0].id];
    } else if (ability.targetType === 'single_ally') {
      targetIds = [livingPlayers[0].id];
    } else if (ability.targetType === 'self') {
      targetIds = actorIds;
    }

    queuePlayerAction(ability, actorIds, targetIds);
  };

  const handleItemClick = (itemIndex: number) => {
    if (combatStatus !== 'player_turn' || usedItemThisRound) return;

    const item = availableItems[itemIndex];
    if (!item) return;

    const livingPlayers = playerCombatants.filter(p => p.isAlive);
    const deadPlayers = playerCombatants.filter(p => !p.isAlive);

    // Simple targeting: use first living player, or first dead for resurrect
    let targetId: string | undefined;

    if (item.type === 'healing_potion' || item.id === 'cleansing_salve' ||
        item.id === 'berserker_brew' || item.id === 'temporal_crystal') {
      targetId = livingPlayers[0]?.id;
    } else if (item.type === 'resurrect') {
      targetId = deadPlayers[0]?.id;
    }
    // sp_potion and smoke_bomb don't need a target

    queuePlayerItem(item, targetId);
  };

  const handleResolveAll = () => {
    if (combatStatus === 'resolving') {
      const interval = setInterval(() => {
        const state = useCombatStore.getState();
        if (state.actionQueue.length > 0) {
          state.resolveNextAction();
        } else {
          clearInterval(interval);
        }
      }, 500);
    }
  };

  if (combatStatus === 'ended') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <h2
            className={`text-4xl font-bold mb-6 ${
              combatResult === 'player_victory' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {combatResult === 'player_victory' ? 'VICTORY!' : 'DEFEAT!'}
          </h2>
          <button
            onClick={onCombatEnd}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded text-xl"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">Combat - Round {round}</h1>

        <div className="bg-slate-800 rounded-lg p-4 mb-4">
          <div className="text-lg">
            SP: {currentSP}/{maxSP} (+{spRegen})
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-3">Party</h2>
            {playerCombatants.map(c => (
              <div key={c.id} className={`mb-2 p-2 rounded ${c.isAlive ? 'bg-slate-700' : 'bg-red-900'}`}>
                <div className="font-bold">{c.name}</div>
                <div className="text-sm">
                  HP: {c.stats.currentHp}/{c.stats.maxHp}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-3">Enemies</h2>
            {enemyCombatants.map(c => (
              <div key={c.id} className={`mb-2 p-2 rounded ${c.isAlive ? 'bg-slate-700' : 'bg-gray-800'}`}>
                <div className="font-bold">{c.name}</div>
                <div className="text-sm">
                  HP: {c.stats.currentHp}/{c.stats.maxHp}
                </div>
              </div>
            ))}
          </div>
        </div>

        {combatStatus === 'player_turn' && (
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold mb-3">Actions</h2>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {offeredActions.map((ability, i) => (
                <button
                  key={ability.id}
                  onClick={() => handleActionClick(i)}
                  disabled={currentSP < ability.spCost}
                  className={`p-3 rounded text-left ${
                    currentSP >= ability.spCost
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  <div className="font-bold text-sm">{ability.name}</div>
                  <div className="text-xs">{ability.spCost} SP</div>
                </button>
              ))}
            </div>

            {availableItems.length > 0 && (
              <div className="mb-3">
                <h3 className="text-lg font-bold mb-2">
                  Items {usedItemThisRound && <span className="text-yellow-400 text-sm">(Used this round)</span>}
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {availableItems.map((item, i) => (
                    <button
                      key={`${item.id}_${i}`}
                      onClick={() => handleItemClick(i)}
                      disabled={usedItemThisRound}
                      className={`p-2 rounded text-left text-xs ${
                        usedItemThisRound
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                      title={item.description}
                    >
                      <div className="font-bold">{item.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={commitPlayerActions}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
            >
              Commit Actions
            </button>
          </div>
        )}

        {combatStatus === 'resolving' && (
          <div className="bg-slate-800 rounded-lg p-4 mb-4 text-center">
            <button
              onClick={resolveNextAction}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded mr-2"
            >
              Next Action
            </button>
            <button
              onClick={handleResolveAll}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded"
            >
              Resolve All
            </button>
          </div>
        )}

        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-3">Combat Log</h2>
          <div className="h-48 overflow-y-auto bg-black p-3 rounded font-mono text-sm">
            {combatLog.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
