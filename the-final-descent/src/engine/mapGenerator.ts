/**
 * Map Generation System
 * Creates procedural node graphs for each floor
 */

import type { Node, NodeType, EncounterData } from '../types/core';
import { getRandomCommonEnemies } from '../data/enemies';

/**
 * Floor configuration from GDD Section 6.1
 */
const FLOOR_CONFIGS = {
  1: { total: 6, combat: 2, memory: 1, shop: 1, rest: 1, hazard: 0, story: 0, boss: 1 },
  2: { total: 7, combat: 3, memory: 1, shop: 1, rest: 0, hazard: 1, story: 0, boss: 1 },
  3: { total: 8, combat: 3, memory: 1, shop: 1, rest: 1, hazard: 1, story: 0, boss: 1 },
  4: { total: 8, combat: 3, memory: 1, shop: 0, rest: 1, hazard: 1, story: 1, boss: 1 },
  5: { total: 9, combat: 4, memory: 1, shop: 1, rest: 0, hazard: 1, story: 1, boss: 1 },
  6: { total: 9, combat: 4, memory: 1, shop: 0, rest: 1, hazard: 2, story: 0, boss: 1 },
  7: { total: 10, combat: 4, memory: 1, shop: 1, rest: 0, hazard: 2, story: 1, boss: 1 },
  8: { total: 10, combat: 5, memory: 1, shop: 0, rest: 1, hazard: 2, story: 0, boss: 1 },
  9: { total: 11, combat: 5, memory: 1, shop: 1, rest: 0, hazard: 2, story: 1, boss: 1 },
  10: { total: 12, combat: 5, memory: 1, shop: 1, rest: 1, hazard: 2, story: 1, boss: 1 },
};

/**
 * Generate a floor map
 */
export function generateFloorMap(floorNumber: number): Map<string, Node> {
  const config = FLOOR_CONFIGS[floorNumber as keyof typeof FLOOR_CONFIGS] || FLOOR_CONFIGS[1];

  // Create node pool
  const nodeTypes: NodeType[] = [];

  // Add nodes based on config
  for (let i = 0; i < config.combat; i++) nodeTypes.push('combat');
  for (let i = 0; i < config.memory; i++) nodeTypes.push('memory');
  for (let i = 0; i < config.shop; i++) nodeTypes.push('shop');
  for (let i = 0; i < config.rest; i++) nodeTypes.push('rest');
  for (let i = 0; i < config.hazard; i++) nodeTypes.push('hazard');
  for (let i = 0; i < config.story; i++) nodeTypes.push('story');
  for (let i = 0; i < config.boss; i++) nodeTypes.push('boss');

  // Shuffle node types
  shuffleArray(nodeTypes);

  // Create nodes
  const nodes = new Map<string, Node>();

  // Create entrance node (always combat)
  const entranceNode: Node = {
    id: 'node_0',
    type: 'combat',
    status: 'available',
    connectedNodeIds: [],
    encounterData: generateEncounterData('combat', floorNumber),
  };
  nodes.set(entranceNode.id, entranceNode);

  // Create remaining nodes
  for (let i = 1; i < config.total; i++) {
    const nodeType = nodeTypes[i - 1]; // -1 because entrance is index 0

    const node: Node = {
      id: `node_${i}`,
      type: nodeType,
      status: 'hidden',
      connectedNodeIds: [],
      encounterData: generateEncounterData(nodeType, floorNumber),
    };

    nodes.set(node.id, node);
  }

  return nodes;
}

/**
 * Generate encounter data for a node
 */
function generateEncounterData(nodeType: NodeType, floor: number): EncounterData | undefined {
  switch (nodeType) {
    case 'combat':
      // Generate 2-5 random enemies
      const enemyCount = 2 + Math.floor(Math.random() * 4); // 2-5
      const enemies = getRandomCommonEnemies(enemyCount);
      return {
        enemyIds: enemies.map(e => e.id),
      };

    case 'boss':
      return {
        enemyIds: [`boss_floor${floor}`],
      };

    case 'memory':
      return {
        loreId: `lore_floor_${floor}_memory`,
      };

    case 'shop':
      return {
        shopSeed: Math.floor(Math.random() * 1000000),
      };

    case 'story':
      return {
        loreId: `lore_floor_${floor}_story_${Math.floor(Math.random() * 3)}`,
      };

    default:
      return undefined;
  }
}

/**
 * Unlock paths from a completed node
 * GDD Section 5.2: Random number of paths (1-3) connect to other nodes
 */
export function unlockPathsFromNode(
  nodeId: string,
  nodes: Map<string, Node>
): Map<string, Node> {
  const updatedNodes = new Map(nodes);
  const sourceNode = updatedNodes.get(nodeId);

  if (!sourceNode) return updatedNodes;

  // Mark source as completed
  sourceNode.status = 'completed';

  // Determine how many paths to create (1-3)
  // Weighted: 40% one, 40% two, 20% three
  const rand = Math.random();
  let pathCount: number;
  if (rand < 0.4) pathCount = 1;
  else if (rand < 0.8) pathCount = 2;
  else pathCount = 3;

  // Find hidden nodes to connect to
  const hiddenNodes = Array.from(updatedNodes.values()).filter(n => n.status === 'hidden');

  if (hiddenNodes.length === 0) {
    // No more hidden nodes, reveal boss if not already available
    const bossNode = Array.from(updatedNodes.values()).find(n => n.type === 'boss');
    if (bossNode && bossNode.status === 'hidden') {
      bossNode.status = 'available';
    }
    return updatedNodes;
  }

  // Select random hidden nodes to connect
  const targets = selectRandomNodes(hiddenNodes, Math.min(pathCount, hiddenNodes.length));

  for (const target of targets) {
    // Add connection
    if (!sourceNode.connectedNodeIds.includes(target.id)) {
      sourceNode.connectedNodeIds.push(target.id);
    }

    // Make target available
    target.status = 'available';
  }

  // Check if 60% of nodes are completed, reveal boss
  const totalNodes = updatedNodes.size;
  const completedNodes = Array.from(updatedNodes.values()).filter(n => n.status === 'completed').length;
  const availableNodes = Array.from(updatedNodes.values()).filter(n => n.status === 'available').length;

  const progressPercent = (completedNodes + availableNodes) / totalNodes;

  if (progressPercent >= 0.6) {
    const bossNode = Array.from(updatedNodes.values()).find(n => n.type === 'boss');
    if (bossNode && bossNode.status === 'hidden') {
      bossNode.status = 'available';

      // Ensure at least 2 paths lead to boss
      const availableNonBoss = Array.from(updatedNodes.values()).filter(
        n => n.status === 'available' && n.type !== 'boss'
      );

      if (availableNonBoss.length >= 2) {
        const bossConnections = selectRandomNodes(availableNonBoss, 2);
        for (const connector of bossConnections) {
          if (!connector.connectedNodeIds.includes(bossNode.id)) {
            connector.connectedNodeIds.push(bossNode.id);
          }
        }
      }
    }
  }

  return updatedNodes;
}

/**
 * Check if floor is complete (boss defeated)
 */
export function isFloorComplete(nodes: Map<string, Node>): boolean {
  const bossNode = Array.from(nodes.values()).find(n => n.type === 'boss');
  return bossNode?.status === 'completed';
}

/**
 * Get available nodes (can be visited)
 */
export function getAvailableNodes(nodes: Map<string, Node>): Node[] {
  return Array.from(nodes.values()).filter(n => n.status === 'available');
}

// Helper functions

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function selectRandomNodes(nodes: Node[], count: number): Node[] {
  const shuffled = [...nodes];
  shuffleArray(shuffled);
  return shuffled.slice(0, count);
}
