/**
 * The Final Descent - Main Game Application
 * Phase 3: Full game loop with map, nodes, and combat integration
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRunStore } from './store/runStore';
import { useCombatStore } from './store/combatStore';
import { getAvailableNodes } from './engine/mapGenerator';
import { applyMemoryHealing, applyHazardDamage } from './engine/nodeResolver';
import { getAllCharacters, getRandomCharacters } from './data/characters';
import { getCharacterAbilities } from './data/abilities';
import type { Ability, Item } from './types/core';
import type { NodeChoice } from './engine/nodeResolver';
import { IntroScreen } from './components/IntroScreen';
import { RosterVFX, type RosterFxHandle } from './components/RosterVFX';
import './App.css';

function App() {
  const [gamePhase, setGamePhase] = useState<'intro' | 'party_select' | 'map' | 'node' | 'combat'>('intro');

  const runStore = useRunStore();
  const combatStore = useCombatStore();

  const handleRosterConfirmed = (livingRoster: string[]) => {
    runStore.startRun(livingRoster);
    setGamePhase('map');
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
    return <PartySelectScreen onConfirmRoster={handleRosterConfirmed} />;
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
  onConfirmRoster,
}: {
  onConfirmRoster: (livingRoster: string[]) => void;
}) {
  const characters = useMemo(() => getAllCharacters(), []);
  const [livingRoster, setLivingRoster] = useState<string[]>([]);
  const [fallenRoster, setFallenRoster] = useState<string[]>([]);
  const [selectedForReroll, setSelectedForReroll] = useState<string | null>(null);
  const [rerolls, setRerolls] = useState(3);
  const [locked, setLocked] = useState(false);
  const [toast, setToast] = useState('');
  const [introPlayed, setIntroPlayed] = useState(false);
  const flickerTimer = useRef<number | null>(null);
  const [popoverState, setPopoverState] = useState<{
    id: string;
    left: number;
    top: number;
  } | null>(null);
  const toastTimer = useRef<number | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const fallenRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rerollStarsRef = useRef<HTMLDivElement | null>(null);
  const fxRef = useRef<RosterFxHandle | null>(null);

  useEffect(() => {
    initializeRosters();
  }, []);

  useEffect(() => {
    const scheduleFlicker = () => {
      const delay = 20000 + Math.random() * 10000;
      if (flickerTimer.current) window.clearTimeout(flickerTimer.current);
      flickerTimer.current = window.setTimeout(() => {
        document.querySelectorAll('.fallen').forEach(el => {
          el.classList.add('flicker');
          window.setTimeout(() => el.classList.remove('flicker'), 1200);
        });
        scheduleFlicker();
      }, delay);
    };

    scheduleFlicker();
    return () => {
      if (flickerTimer.current) window.clearTimeout(flickerTimer.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const initializeRosters = () => {
    const living = getRandomCharacters(3).map(c => c.id);
    const fallen = characters
      .map(c => c.id)
      .filter(id => !living.includes(id));

    setLivingRoster(living);
    setFallenRoster(fallen);
    setSelectedForReroll(null);
    setRerolls(3);
    setIntroPlayed(false);
  };

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 1500);
  };

  const abilityBriefs: Record<string, string> = {
    bonebreaker_mace: 'Heavy strike; may weaken enemy damage output.',
    final_vow: 'Draws attention and shields self with a bulwark.',
    undying_judgment: 'Crushing verdict that can steady Dranick if bleeding.',
    twin_thorns: 'Fast cut that leaves the enemy bleeding.',
    burrow_buddy: 'Evasive setup that speeds Eline for a follow-up.',
    marsh_ambush: 'Punishes DoT-afflicted foes; chance to slow.',
    arc_lash: 'Arc strike that chains to a nearby enemy.',
    spell_parry: 'Brief arcane guard that reflects part of the blow.',
    gravemark_seal: 'Marks the target so all damage bites deeper.',
    future_flare: 'Tags a foe; the next hit spikes harder.',
    foresight_step: 'Tempo boost that sharpens speed and evasion.',
    rewind_pulse: 'Party-wide rewind that heals and scrubs a debuff.',
    pressure_point_strike: 'Precise hit that exposes the target.',
    breath: 'Quick single-target heal that can add gentle regen.',
    red_thread: 'Major heal that redirects risk back to Lira.',
    soilcrack_fist: 'Brutal blow that costs Grim some blood.',
    fury_guard: 'Rage armor with a self-inflicted toll.',
    relic_howl: 'Wide howl that chills enemy speed.',
  };

  const handleSingleReroll = async () => {
    if (!selectedForReroll || rerolls < 2 || locked) return;

    const replacementPool = characters
      .map(c => c.id)
      .filter(id => !livingRoster.includes(id));
    if (!replacementPool.length) return;

    const replacementId = replacementPool[Math.floor(Math.random() * replacementPool.length)];
    const nextLiving = livingRoster.map(id => (id === selectedForReroll ? replacementId : id));
    const nextFallen = characters
      .map(c => c.id)
      .filter(id => !nextLiving.includes(id));

    const cardRect = cardRefs.current[selectedForReroll]?.getBoundingClientRect();
    const starRect = rerollStarsRef.current?.getBoundingClientRect();

    setLocked(true);
    setRerolls(r => r - 2);
    showToast('Rerolling one soul…');

    if (fxRef.current?.playSingleReroll) {
      await fxRef.current.playSingleReroll(cardRect, starRect);
    } else {
      await new Promise(resolve => setTimeout(resolve, 950));
    }

    setLivingRoster(nextLiving);
    setFallenRoster(nextFallen);
    setSelectedForReroll(null);
    setLocked(false);
    showToast('Fate rewrites the star.');
  };

  const handleTotalReroll = async () => {
    if (rerolls < 1 || locked) return;

    const nextLiving = getRandomCharacters(3).map(c => c.id);
    const nextFallen = characters
      .map(c => c.id)
      .filter(id => !nextLiving.includes(id));

    const cardRects = livingRoster
      .map(id => cardRefs.current[id]?.getBoundingClientRect())
      .filter(Boolean) as DOMRect[];
    const starRect = rerollStarsRef.current?.getBoundingClientRect();

    setLocked(true);
    setRerolls(r => r - 1);
    showToast('Total reroll…');

    if (fxRef.current?.playTotalReroll) {
      await fxRef.current.playTotalReroll(cardRects, starRect);
    } else {
      await new Promise(resolve => setTimeout(resolve, 1050));
    }

    setLivingRoster(nextLiving);
    setFallenRoster(nextFallen);
    setSelectedForReroll(null);
    setLocked(false);
    showToast('The heavens reshuffle.');
  };

  const handleConfirm = () => {
    if (livingRoster.length === 3 && !locked) {
      onConfirmRoster(livingRoster);
    }
  };

  const formatAbilityMeta = (ability: Ability) => {
    const desc = abilityBriefs[ability.id];
    const parts: string[] = desc ? [desc] : [];
    parts.push(`${ability.spCost} SP`);
    parts.push(ability.abilityType);
    parts.push(ability.targetType.replace(/_/g, ' '));
    if (ability.tags?.length) parts.push(`Tags: ${ability.tags.join(', ')}`);
    return parts.join(' • ');
  };

  const openPopover = (id: string, target: HTMLDivElement) => {
    const pad = 10;
    const rect = target.getBoundingClientRect();
    const popWidth = Math.min(360, window.innerWidth - 24);
    const popHeight = 260;
    let left = rect.right + 14;
    let top = rect.top + 10;

    if (left + popWidth + pad > window.innerWidth) {
      left = rect.left - 14 - popWidth;
    }
    if (top + popHeight + pad > window.innerHeight) {
      top = window.innerHeight - popHeight - pad;
    }
    if (top < pad) top = pad;
    if (left < pad) left = pad;

    setPopoverState({ id, left: Math.round(left), top: Math.round(top) });
  };

  const closePopover = () => setPopoverState(null);

  const gatherAnchors = useCallback(
    () => ({
      living: livingRoster.map(id => cardRefs.current[id]?.getBoundingClientRect() ?? null),
      fallen: fallenRoster.map(id => fallenRefs.current[id]?.getBoundingClientRect() ?? null),
    }),
    [fallenRoster, livingRoster],
  );

  const playTransition = async () => {
    if (locked) return;
    setLocked(true);
    if (fxRef.current?.playIntro) {
      const anchors = gatherAnchors();
      await fxRef.current.playIntro(livingRoster, fallenRoster, anchors);
    }
    setLocked(false);
  };

  const getCharacter = (id: string) => characters.find(c => c.id === id)!;
  const abilityListFor = (id: string) => getCharacterAbilities(id);

  const getConstellationPattern = (characterId: string) => {
    const patterns: Record<string, { stars: { x: number; y: number; size: number }[]; lines: { x1: number; y1: number; x2: number; y2: number }[] }> = {
      dranick: {
        stars: [
          { x: 50, y: 30, size: 2.5 },
          { x: 35, y: 50, size: 2 },
          { x: 65, y: 50, size: 2 },
          { x: 50, y: 70, size: 3 },
          { x: 25, y: 65, size: 1.5 },
          { x: 75, y: 65, size: 1.5 },
        ],
        lines: [
          { x1: 50, y1: 30, x2: 35, y2: 50 },
          { x1: 50, y1: 30, x2: 65, y2: 50 },
          { x1: 35, y1: 50, x2: 50, y2: 70 },
          { x1: 65, y1: 50, x2: 50, y2: 70 },
        ],
      },
      eline: {
        stars: [
          { x: 50, y: 25, size: 2 },
          { x: 30, y: 40, size: 2 },
          { x: 70, y: 40, size: 2 },
          { x: 50, y: 55, size: 2.5 },
          { x: 40, y: 70, size: 1.5 },
          { x: 60, y: 70, size: 1.5 },
          { x: 50, y: 80, size: 2 },
        ],
        lines: [
          { x1: 50, y1: 25, x2: 30, y2: 40 },
          { x1: 50, y1: 25, x2: 70, y2: 40 },
          { x1: 30, y1: 40, x2: 50, y2: 55 },
          { x1: 70, y1: 40, x2: 50, y2: 55 },
          { x1: 50, y1: 55, x2: 40, y2: 70 },
          { x1: 50, y1: 55, x2: 60, y2: 70 },
          { x1: 40, y1: 70, x2: 50, y2: 80 },
          { x1: 60, y1: 70, x2: 50, y2: 80 },
        ],
      },
      varro: {
        stars: [
          { x: 50, y: 35, size: 3 },
          { x: 35, y: 50, size: 2 },
          { x: 65, y: 50, size: 2 },
          { x: 35, y: 65, size: 2 },
          { x: 65, y: 65, size: 2 },
        ],
        lines: [
          { x1: 50, y1: 35, x2: 35, y2: 50 },
          { x1: 50, y1: 35, x2: 65, y2: 50 },
          { x1: 35, y1: 50, x2: 35, y2: 65 },
          { x1: 65, y1: 50, x2: 65, y2: 65 },
          { x1: 35, y1: 65, x2: 65, y2: 65 },
        ],
      },
      kestril: {
        stars: [
          { x: 50, y: 28, size: 2 },
          { x: 40, y: 45, size: 2.5 },
          { x: 60, y: 45, size: 2.5 },
          { x: 30, y: 60, size: 1.8 },
          { x: 50, y: 60, size: 2 },
          { x: 70, y: 60, size: 1.8 },
          { x: 50, y: 75, size: 2.2 },
        ],
        lines: [
          { x1: 50, y1: 28, x2: 40, y2: 45 },
          { x1: 50, y1: 28, x2: 60, y2: 45 },
          { x1: 40, y1: 45, x2: 30, y2: 60 },
          { x1: 40, y1: 45, x2: 50, y2: 60 },
          { x1: 60, y1: 45, x2: 70, y2: 60 },
          { x1: 60, y1: 45, x2: 50, y2: 60 },
          { x1: 50, y1: 60, x2: 50, y2: 75 },
        ],
      },
      lira: {
        stars: [
          { x: 50, y: 30, size: 2.5 },
          { x: 38, y: 48, size: 2 },
          { x: 62, y: 48, size: 2 },
          { x: 32, y: 65, size: 1.8 },
          { x: 50, y: 62, size: 2.2 },
          { x: 68, y: 65, size: 1.8 },
        ],
        lines: [
          { x1: 50, y1: 30, x2: 38, y2: 48 },
          { x1: 50, y1: 30, x2: 62, y2: 48 },
          { x1: 38, y1: 48, x2: 32, y2: 65 },
          { x1: 62, y1: 48, x2: 68, y2: 65 },
          { x1: 38, y1: 48, x2: 50, y2: 62 },
          { x1: 62, y1: 48, x2: 50, y2: 62 },
        ],
      },
      grim: {
        stars: [
          { x: 50, y: 32, size: 2.8 },
          { x: 35, y: 48, size: 2.2 },
          { x: 65, y: 48, size: 2.2 },
          { x: 25, y: 64, size: 2 },
          { x: 50, y: 64, size: 2 },
          { x: 75, y: 64, size: 2 },
          { x: 50, y: 78, size: 2.5 },
        ],
        lines: [
          { x1: 50, y1: 32, x2: 35, y2: 48 },
          { x1: 50, y1: 32, x2: 65, y2: 48 },
          { x1: 35, y1: 48, x2: 25, y2: 64 },
          { x1: 65, y1: 48, x2: 75, y2: 64 },
          { x1: 25, y1: 64, x2: 50, y2: 64 },
          { x1: 50, y1: 64, x2: 75, y2: 64 },
          { x1: 50, y1: 64, x2: 50, y2: 78 },
        ],
      },
    };

    const pattern = patterns[characterId] || patterns.dranick;
    return (
      <svg className="constellation" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={`glow-${characterId}`}>
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {pattern.lines.map((line, idx) => (
          <line
            key={`line-${idx}`}
            x1={`${line.x1}%`}
            y1={`${line.y1}%`}
            x2={`${line.x2}%`}
            y2={`${line.y2}%`}
            stroke="rgba(232, 244, 253, 0.25)"
            strokeWidth="0.3"
            filter={`url(#glow-${characterId})`}
          />
        ))}
        {pattern.stars.map((star, idx) => (
          <circle
            key={`star-${idx}`}
            cx={`${star.x}%`}
            cy={`${star.y}%`}
            r={star.size}
            fill="rgba(232, 244, 253, 0.7)"
            filter={`url(#glow-${characterId})`}
          />
        ))}
      </svg>
    );
  };

  useEffect(() => {
    if (livingRoster.length === 3 && fallenRoster.length === 3 && !introPlayed) {
      setLocked(true);
      const anchors = gatherAnchors();
      const introPromise = fxRef.current?.playIntro(livingRoster, fallenRoster, anchors) ?? Promise.resolve();
      introPromise.finally(() => {
        setLocked(false);
        setIntroPlayed(true);
      });
    }
  }, [fallenRoster, gatherAnchors, introPlayed, livingRoster]);

  return (
    <div className="roster-screen">
      <div className="fx-layer" aria-hidden="true">
        <RosterVFX ref={fxRef} />
        <div className="vignette"></div>
      </div>

      <div className="ui-layer">
        <div className="screen" role="application" aria-label="Roster Selection">
          <header className="title-area">
            <div className="title-block">
              <div className="kicker">The Final Descent</div>
              <h1 className="title">Choose the stars that still burn.</h1>
              <div className="sub">Hover a living soul to read their gifts. Click a living card to mark it for reroll.</div>
            </div>
            <div className="top-actions">
              <button className="mini-btn" onClick={playTransition} title="Replays a simplified transition mockup">
                Replay Transition
              </button>
            </div>
          </header>

          <main className="living-area">
            <div className="living-row">
              {livingRoster.map((id, idx) => {
                const char = getCharacter(id);
                return (
                  <div
                    key={id}
                    className={`card ${selectedForReroll === id ? 'selected' : ''}`}
                    style={{ ['--rot' as string]: `${(idx - 1) * 1.8}deg` }}
                    data-id={id}
                    ref={el => {
                      cardRefs.current[id] = el;
                    }}
                    onClick={() => {
                      if (locked) return;
                      setSelectedForReroll(prev => (prev === id ? null : id));
                    }}
                    onMouseEnter={e => {
                      if (locked) return;
                      openPopover(id, e.currentTarget);
                    }}
                    onMouseMove={e => {
                      if (!popoverState || popoverState.id !== id) return;
                      openPopover(id, e.currentTarget);
                    }}
                    onMouseLeave={closePopover}
                  >
                    <div className="glow"></div>
                    {getConstellationPattern(id)}
                    <div className="marked">
                      <span className="sigil-dot"></span>
                      <span>MARKED</span>
                    </div>
                    <div className="card-body">
                      <div>
                        <p className="role">{char.role}</p>
                        <h2 className="name">{char.name}</h2>
                        <div className="divider"></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>

          <section className="bottom-area">
            <div className="fallen-block">
              <div className="fallen-row">
                {fallenRoster.map((id, idx) => {
                  const char = getCharacter(id);
                  return (
                    <div
                      key={id}
                      className="fallen"
                      style={{ ['--frot' as string]: `${(idx - 1) * 1.4}deg` }}
                      ref={el => {
                        fallenRefs.current[id] = el;
                      }}
                    >
                      <div className="fallen-name">{char.name}</div>
                    </div>
                  );
                })}
              </div>
              <div className="meta-lines">
                <div className="rerolls">
                  <div className="label">Celestial Rerolls:</div>
                  <div className="stars" ref={rerollStarsRef}>
                    {[0, 1, 2].map(idx => (
                      <div key={idx} className={`star ${idx >= rerolls ? 'spent' : ''}`}>⭐</div>
                    ))}
                  </div>
                </div>
                <div className="hint">
                  <b>Single Reroll</b> replaces <b>one</b> marked Living soul (cost: <b>2</b>).<br />
                  <b>Total Reroll</b> replaces <b>all three</b> Living souls (cost: <b>1</b>).
                </div>
              </div>
            </div>

            <div className="actions">
              <div className="btn-row">
                <button className="btn" onClick={handleSingleReroll} disabled={!selectedForReroll || rerolls < 2 || locked}>
                  Reroll Selected
                  <small>Cost: 2 • Requires a marked card</small>
                </button>
                <button className="btn" onClick={handleTotalReroll} disabled={rerolls < 1 || locked}>
                  Total Reroll
                  <small>Cost: 1 • Reroll all living</small>
                </button>
              </div>
              <button className="btn btn-primary" onClick={handleConfirm} disabled={locked || livingRoster.length !== 3}>
                <span>DESCEND WITH THESE SOULS</span>
              </button>
            </div>
          </section>
        </div>

        <aside
          className={`popover ${popoverState ? 'open' : ''}`}
          style={popoverState ? { left: popoverState.left, top: popoverState.top } : {}}
          aria-hidden={!popoverState}
        >
          {popoverState && (() => {
            const character = getCharacter(popoverState.id);
            const abilities = abilityListFor(popoverState.id);
            return (
              <>
                <div className="pop-head">
                  <h3 className="pop-title">{character.name}</h3>
                  <div className="pop-role">{character.role}</div>
                </div>
                <div className="pop-divider"></div>
                <div className="stats">
                  <div className="stat hp">
                    <div className="stat-label">HP</div>
                    <div className="stat-val">{character.baseStats.hp}</div>
                  </div>
                  <div className="stat con">
                    <div className="stat-label">CON</div>
                    <div className="stat-val">{character.baseStats.con}</div>
                  </div>
                  <div className="stat spd">
                    <div className="stat-label">SPD</div>
                    <div className="stat-val">{character.baseStats.spd}</div>
                  </div>
                </div>
                <ul className="abilities">
                  {abilities.map(ability => (
                    <li key={ability.id}>
                      <b>{ability.name}</b> — {formatAbilityMeta(ability)}
                    </li>
                  ))}
                </ul>
              </>
            );
          })()}
        </aside>

        <div className={`lock ${locked ? 'active' : ''}`} aria-hidden="true"></div>
        <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
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
