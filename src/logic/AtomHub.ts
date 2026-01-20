/**
 * AtomHub - Central Executive Hub
 * Manages registry of Sub-Atom nodes and coordinates multi-node operations
 */

import type { DataAccessLayer } from './core/DataAccessLayer';
import { StateMachineInstance } from './core/StateMachineInstance';
import type { Node, NodeStatus, StateMachineState, GlobalAnalytics } from './types';

export class AtomHub {
  private nodes: Map<string, Node> = new Map();
  private stateMachines: Map<string, StateMachineInstance> = new Map();
  private dataAccess: DataAccessLayer;

  constructor(dataAccess: DataAccessLayer) {
    this.dataAccess = dataAccess;
  }

  /**
   * Register a new Sub-Atom node
   */
  registerNode(nodeId: string, metadata?: Record<string, any>): Node {
    if (this.nodes.has(nodeId)) {
      throw new Error(`Node ${nodeId} is already registered`);
    }

    const node: Node = {
      nodeId,
      nodeStatus: 'IDLE',
      performanceMetric: 1.0,
      registeredAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      metadata,
    };

    this.nodes.set(nodeId, node);

    // Create state machine instance for this node
    const stateMachine = new StateMachineInstance(nodeId, this.dataAccess);
    this.stateMachines.set(nodeId, stateMachine);

    return node;
  }

  /**
   * Unregister a node
   */
  unregisterNode(nodeId: string): void {
    if (!this.nodes.has(nodeId)) {
      throw new Error(`Node ${nodeId} is not registered`);
    }

    this.nodes.delete(nodeId);
    this.stateMachines.delete(nodeId);
  }

  /**
   * Get a node by ID
   */
  getNode(nodeId: string): Node | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all registered nodes
   */
  getAllNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Update node status
   */
  updateNodeStatus(nodeId: string, status: NodeStatus): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} is not registered`);
    }

    node.nodeStatus = status;
    node.lastActivityAt = new Date().toISOString();
    this.nodes.set(nodeId, node);
  }

  /**
   * Update node performance metric
   */
  updateNodePerformance(nodeId: string, metric: number): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} is not registered`);
    }

    node.performanceMetric = metric;
    node.lastActivityAt = new Date().toISOString();
    this.nodes.set(nodeId, node);
  }

  /**
   * Get state machine instance for a node
   */
  getStateMachineForNode(nodeId: string): StateMachineInstance {
    const stateMachine = this.stateMachines.get(nodeId);
    if (!stateMachine) {
      throw new Error(`No state machine found for node ${nodeId}. Node may not be registered.`);
    }
    return stateMachine;
  }

  /**
   * Create a new state machine instance for a node (if not exists)
   */
  createStateMachineInstance(nodeId: string): StateMachineInstance {
    if (this.stateMachines.has(nodeId)) {
      return this.stateMachines.get(nodeId)!;
    }

    // Ensure node is registered
    if (!this.nodes.has(nodeId)) {
      this.registerNode(nodeId);
    }

    return this.getStateMachineForNode(nodeId);
  }

  /**
   * Initialize a session for a specific node
   */
  async initializeNodeSession(nodeId: string, trackingIdentifier: string): Promise<void> {
    const stateMachine = this.createStateMachineInstance(nodeId);
    this.updateNodeStatus(nodeId, 'ACTIVE');
    
    try {
      await stateMachine.initializeSession(trackingIdentifier);
    } catch (error) {
      this.updateNodeStatus(nodeId, 'ERROR');
      throw error;
    }
  }

  /**
   * Process validation for a specific node
   */
  async processNodeValidation(nodeId: string, transactionId: string): Promise<void> {
    const stateMachine = this.getStateMachineForNode(nodeId);
    this.updateNodeStatus(nodeId, 'ACTIVE');
    
    try {
      await stateMachine.processValidation(transactionId);
    } catch (error) {
      this.updateNodeStatus(nodeId, 'ERROR');
      throw error;
    }
  }

  /**
   * Process verification for a specific node
   */
  async processNodeVerification(nodeId: string, category: string): Promise<void> {
    const stateMachine = this.getStateMachineForNode(nodeId);
    this.updateNodeStatus(nodeId, 'ACTIVE');
    
    try {
      await stateMachine.processVerification(category);
    } catch (error) {
      this.updateNodeStatus(nodeId, 'ERROR');
      throw error;
    }
  }

  /**
   * Process unit for a specific node
   */
  async processNodeUnit(nodeId: string, unitId: string): Promise<void> {
    const stateMachine = this.getStateMachineForNode(nodeId);
    this.updateNodeStatus(nodeId, 'ACTIVE');
    
    try {
      await stateMachine.processUnit(unitId);
    } catch (error) {
      this.updateNodeStatus(nodeId, 'ERROR');
      throw error;
    }
  }

  /**
   * Complete session for a specific node
   */
  async completeNodeSession(nodeId: string): Promise<void> {
    const stateMachine = this.getStateMachineForNode(nodeId);
    
    try {
      await stateMachine.completeSession();
      this.updateNodeStatus(nodeId, 'IDLE');
    } catch (error) {
      this.updateNodeStatus(nodeId, 'ERROR');
      throw error;
    }
  }

  /**
   * Get state for a specific node
   */
  getNodeState(nodeId: string): StateMachineState | null {
    const stateMachine = this.stateMachines.get(nodeId);
    if (!stateMachine) {
      return null;
    }
    return stateMachine.getState();
  }

  /**
   * Get all node states
   */
  getAllNodeStates(): Map<string, StateMachineState> {
    const states = new Map<string, StateMachineState>();
    for (const [nodeId, stateMachine] of this.stateMachines.entries()) {
      states.set(nodeId, stateMachine.getState());
    }
    return states;
  }

  /**
   * Get global analytics across all nodes
   */
  getGlobalAnalytics(): GlobalAnalytics {
    const allNodes = this.getAllNodes();
    const activeNodes = allNodes.filter(n => n.nodeStatus === 'ACTIVE');
    
    const nodeMetrics = new Map<string, number>();
    let totalPerformance = 0;
    
    for (const node of allNodes) {
      nodeMetrics.set(node.nodeId, node.performanceMetric);
      totalPerformance += node.performanceMetric;
    }
    
    const averagePerformanceMetric = allNodes.length > 0 
      ? totalPerformance / allNodes.length 
      : 0;

    // Count total sessions (would need to query database for accurate count)
    // For now, using node count as proxy
    const totalSessions = allNodes.length;

    return {
      totalNodes: allNodes.length,
      activeNodes: activeNodes.length,
      totalSessions,
      averagePerformanceMetric,
      nodeMetrics,
    };
  }
}

// Singleton instance
let atomHubInstance: AtomHub | null = null;

export function getAtomHub(dataAccess?: DataAccessLayer): AtomHub {
  if (!atomHubInstance) {
    if (!dataAccess) {
      throw new Error('DataAccessLayer must be provided for first initialization');
    }
    atomHubInstance = new AtomHub(dataAccess);
  }
  return atomHubInstance;
}

// Export function for getting hub (will be initialized in AtomicEngine wrapper)
export { getAtomHub as atomHub };
