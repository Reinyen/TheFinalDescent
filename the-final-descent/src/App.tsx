/**
 * The Final Descent - Combat Testing Interface
 */

import { useEffect } from 'react';
import { useCombatStore } from './store/combatStore';
import { createTestParty, createTestEnemyGroup } from './utils/combatFactory';
import './App.css';

function App() {
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
    defendActive,
    startCombat,
    queuePlayerAction,
    queuePlayerDefend,
    commitPlayerActions,
    resolveNextAction,
    reset,
  } = useCombatStore();

  // Auto-start combat on mount
  useEffect(() => {
    if (combatStatus === 'setup') {
      const party = createTestParty(1);
      const enemies = createTestEnemyGroup(1, 3);
      startCombat(party, enemies);
    }
  }, [combatStatus, startCombat]);

  const handleActionClick = (abilityIndex: number) => {
    if (combatStatus !== 'player_turn') return;

    const ability = offeredActions[abilityIndex];
    if (!ability) return;

    // For testing: automatically select first living player as actor
    // and first living enemy as target
    const livingPlayers = playerCombatants.filter(p => p.isAlive);
    const livingEnemies = enemyCombatants.filter(e => e.isAlive);

    if (livingPlayers.length === 0 || livingEnemies.length === 0) return;

    // Determine actors based on ability type
    let actorIds: string[] = [];

    if (ability.abilityType === 'duo' || ability.abilityType === 'trio') {
      // For combos, find all participants
      for (const ownerId of ability.owners) {
        const participant = livingPlayers.find(p => p.characterId === ownerId);
        if (participant) {
          actorIds.push(participant.id);
        }
      }
    } else {
      // For single abilities, find the owner
      const owner = ability.owners[0];
      const participant = livingPlayers.find(p => p.characterId === owner);
      if (participant) {
        actorIds = [participant.id];
      }
    }

    // Select target based on ability type
    let targetIds: string[] = [];

    if (ability.targetType === 'single_enemy') {
      targetIds = [livingEnemies[0].id];
    } else if (ability.targetType === 'single_ally') {
      targetIds = [livingPlayers[0].id];
    } else if (ability.targetType === 'self') {
      targetIds = actorIds;
    }
    // For all_enemies, all_allies, all - targetIds stays empty (resolved in engine)

    queuePlayerAction(ability, actorIds, targetIds);
  };

  const handleDefend = () => {
    const livingPlayers = playerCombatants.filter(p => p.isAlive);
    if (livingPlayers.length > 0) {
      queuePlayerDefend(livingPlayers[0].id);
    }
  };

  const handleResolveAll = () => {
    if (combatStatus === 'resolving') {
      // Resolve all actions quickly
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

  if (combatStatus === 'setup') {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">The Final Descent</h1>
          <p className="text-xl">Initializing combat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">
          The Final Descent - Combat Test
        </h1>

        {/* Combat Status */}
        <div className="bg-slate-800 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xl font-bold">Round {round}</span>
              <span className="ml-4 text-lg">
                SP: {currentSP}/{maxSP} (+{spRegen})
              </span>
            </div>
            <div>
              <span
                className={`px-3 py-1 rounded ${
                  combatStatus === 'player_turn'
                    ? 'bg-blue-600'
                    : combatStatus === 'resolving'
                    ? 'bg-yellow-600'
                    : 'bg-green-600'
                }`}
              >
                {combatStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Combatants */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Player Party */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-3 text-blue-400">Your Party</h2>
            {playerCombatants.map(combatant => (
              <div
                key={combatant.id}
                className={`mb-2 p-2 rounded ${
                  combatant.isAlive ? 'bg-slate-700' : 'bg-red-900 opacity-50'
                }`}
              >
                <div className="font-bold">{combatant.name}</div>
                <div className="text-sm">
                  HP: {combatant.stats.currentHp}/{combatant.stats.maxHp} | CON:{' '}
                  {combatant.stats.con} | SPD: {combatant.stats.spd}
                </div>
                {combatant.statusEffects.length > 0 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    Effects: {combatant.statusEffects.map(s => s.statusId).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Enemies */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-3 text-red-400">Enemies</h2>
            {enemyCombatants.map(combatant => (
              <div
                key={combatant.id}
                className={`mb-2 p-2 rounded ${
                  combatant.isAlive ? 'bg-slate-700' : 'bg-gray-800 opacity-50'
                }`}
              >
                <div className="font-bold">{combatant.name}</div>
                <div className="text-sm">
                  HP: {combatant.stats.currentHp}/{combatant.stats.maxHp} | CON:{' '}
                  {combatant.stats.con} | SPD: {combatant.stats.spd}
                </div>
                {combatant.statusEffects.length > 0 && (
                  <div className="text-xs text-purple-400 mt-1">
                    Effects: {combatant.statusEffects.map(s => s.statusId).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Offers */}
        {combatStatus === 'player_turn' && (
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold mb-3">Available Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              {offeredActions.map((ability, index) => (
                <button
                  key={ability.id}
                  onClick={() => handleActionClick(index)}
                  disabled={currentSP < ability.spCost}
                  className={`p-3 rounded text-left ${
                    currentSP >= ability.spCost
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  <div className="font-bold text-sm">{ability.name}</div>
                  <div className="text-xs mt-1">
                    {ability.spCost} SP | CD: {ability.cooldown}
                  </div>
                  <div className="text-xs text-gray-300">
                    {ability.abilityType === 'duo' || ability.abilityType === 'trio'
                      ? `${ability.abilityType.toUpperCase()} Combo`
                      : ability.owners[0]}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDefend}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
              >
                Defend (0 SP)
              </button>

              <button
                onClick={commitPlayerActions}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
              >
                Commit Actions
              </button>
            </div>
          </div>
        )}

        {/* Resolution Controls */}
        {combatStatus === 'resolving' && (
          <div className="bg-slate-800 rounded-lg p-4 mb-4 text-center">
            <button
              onClick={resolveNextAction}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded mr-2"
            >
              Resolve Next Action
            </button>
            <button
              onClick={handleResolveAll}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded"
            >
              Resolve All
            </button>
          </div>
        )}

        {/* Combat End */}
        {combatStatus === 'ended' && (
          <div className="bg-slate-800 rounded-lg p-4 mb-4 text-center">
            <h2
              className={`text-3xl font-bold mb-4 ${
                combatResult === 'player_victory' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {combatResult === 'player_victory' ? 'VICTORY!' : 'DEFEAT!'}
            </h2>
            <button
              onClick={reset}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded"
            >
              New Combat
            </button>
          </div>
        )}

        {/* Combat Log */}
        <div className="bg-slate-800 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-3">Combat Log</h2>
          <div className="h-64 overflow-y-auto font-mono text-sm bg-black p-3 rounded">
            {combatLog.map((line, index) => (
              <div key={index} className="mb-1">
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
