/**
 * Unit tests for AtomHub
 * Tests multi-node operations and concurrent state machines
 */

import { AtomHub } from '../AtomHub';
import { InMemoryDataAccess } from '../core/InMemoryDataAccess';
import type { Transaction, Unit } from '../types';

describe('AtomHub', () => {
  let hub: AtomHub;
  let dataAccess: InMemoryDataAccess;

  beforeEach(() => {
    dataAccess = new InMemoryDataAccess();
    hub = new AtomHub(dataAccess);
  });

  afterEach(() => {
    dataAccess.clear();
  });

  describe('Node Registration', () => {
    it('should register a new node', () => {
      const node = hub.registerNode('node-1');
      
      expect(node.nodeId).toBe('node-1');
      expect(node.nodeStatus).toBe('IDLE');
      expect(node.performanceMetric).toBe(1.0);
      expect(hub.getNode('node-1')).toEqual(node);
    });

    it('should throw error when registering duplicate node', () => {
      hub.registerNode('node-1');
      expect(() => hub.registerNode('node-1')).toThrow('already registered');
    });

    it('should unregister a node', () => {
      hub.registerNode('node-1');
      hub.unregisterNode('node-1');
      
      expect(hub.getNode('node-1')).toBeUndefined();
    });

    it('should get all registered nodes', () => {
      hub.registerNode('node-1');
      hub.registerNode('node-2');
      
      const nodes = hub.getAllNodes();
      expect(nodes).toHaveLength(2);
      expect(nodes.map(n => n.nodeId)).toContain('node-1');
      expect(nodes.map(n => n.nodeId)).toContain('node-2');
    });
  });

  describe('Node Status Management', () => {
    it('should update node status', () => {
      hub.registerNode('node-1');
      hub.updateNodeStatus('node-1', 'ACTIVE');
      
      const node = hub.getNode('node-1');
      expect(node?.nodeStatus).toBe('ACTIVE');
    });

    it('should update node performance metric', () => {
      hub.registerNode('node-1');
      hub.updateNodePerformance('node-1', 1.5);
      
      const node = hub.getNode('node-1');
      expect(node?.performanceMetric).toBe(1.5);
    });
  });

  describe('State Machine Management', () => {
    it('should create state machine instance for registered node', () => {
      hub.registerNode('node-1');
      const stateMachine = hub.getStateMachineForNode('node-1');
      
      expect(stateMachine).toBeDefined();
      expect(stateMachine.getNodeId()).toBe('node-1');
    });

    it('should auto-register node when creating state machine instance', () => {
      const stateMachine = hub.createStateMachineInstance('node-2');
      
      expect(stateMachine.getNodeId()).toBe('node-2');
      expect(hub.getNode('node-2')).toBeDefined();
    });
  });

  describe('Multi-Node Session Operations', () => {
    beforeEach(() => {
      // Setup test data
      const transaction: Transaction = {
        id: 'txn-1',
        transactionNumber: 'TXN-001',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dataAccess.addTransaction(transaction);

      const unit: Unit = {
        id: 'unit-1',
        unitCode: 'UNIT-001',
        category: 'CAT-A',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dataAccess.addUnit(unit);
    });

    it('should initialize sessions for different nodes independently', async () => {
      hub.registerNode('node-1');
      hub.registerNode('node-2');

      await hub.initializeNodeSession('node-1', 'LPN-001');
      await hub.initializeNodeSession('node-2', 'LPN-002');

      const state1 = hub.getNodeState('node-1');
      const state2 = hub.getNodeState('node-2');

      expect(state1?.session?.trackingIdentifier).toBe('LPN-001');
      expect(state2?.session?.trackingIdentifier).toBe('LPN-002');
      expect(state1?.currentState).toBe('VALIDATION');
      expect(state2?.currentState).toBe('VALIDATION');
    });

    it('should process operations for different nodes concurrently', async () => {
      hub.registerNode('node-1');
      hub.registerNode('node-2');

      // Initialize both nodes
      await hub.initializeNodeSession('node-1', 'LPN-001');
      await hub.initializeNodeSession('node-2', 'LPN-002');

      // Process validation for both
      await hub.processNodeValidation('node-1', 'txn-1');
      await hub.processNodeValidation('node-2', 'txn-1');

      const state1 = hub.getNodeState('node-1');
      const state2 = hub.getNodeState('node-2');

      expect(state1?.currentState).toBe('VERIFICATION');
      expect(state2?.currentState).toBe('VERIFICATION');
      expect(state1?.session?.transactionId).toBe('txn-1');
      expect(state2?.session?.transactionId).toBe('txn-1');
    });

    it('should update node status to ACTIVE during operations', async () => {
      hub.registerNode('node-1');
      
      await hub.initializeNodeSession('node-1', 'LPN-001');
      
      const node = hub.getNode('node-1');
      expect(node?.nodeStatus).toBe('ACTIVE');
    });

    it('should update node status to ERROR on operation failure', async () => {
      hub.registerNode('node-1');
      await hub.initializeNodeSession('node-1', 'LPN-001');

      // Try to process invalid transaction
      await expect(hub.processNodeValidation('node-1', 'invalid-txn')).rejects.toThrow();
      
      const node = hub.getNode('node-1');
      expect(node?.nodeStatus).toBe('ERROR');
    });
  });

  describe('Global Analytics', () => {
    it('should calculate global analytics across all nodes', () => {
      hub.registerNode('node-1');
      hub.registerNode('node-2');
      hub.registerNode('node-3');
      
      hub.updateNodePerformance('node-1', 1.2);
      hub.updateNodePerformance('node-2', 0.8);
      hub.updateNodePerformance('node-3', 1.0);
      
      hub.updateNodeStatus('node-1', 'ACTIVE');
      hub.updateNodeStatus('node-2', 'IDLE');
      hub.updateNodeStatus('node-3', 'ACTIVE');

      const analytics = hub.getGlobalAnalytics();
      
      expect(analytics.totalNodes).toBe(3);
      expect(analytics.activeNodes).toBe(2);
      expect(analytics.averagePerformanceMetric).toBeCloseTo(1.0, 1);
      expect(analytics.nodeMetrics.get('node-1')).toBe(1.2);
      expect(analytics.nodeMetrics.get('node-2')).toBe(0.8);
      expect(analytics.nodeMetrics.get('node-3')).toBe(1.0);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple nodes processing units simultaneously', async () => {
      // Setup
      const transaction: Transaction = {
        id: 'txn-1',
        transactionNumber: 'TXN-001',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dataAccess.addTransaction(transaction);

      const unit1: Unit = {
        id: 'unit-1',
        unitCode: 'UNIT-001',
        category: 'CAT-A',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const unit2: Unit = {
        id: 'unit-2',
        unitCode: 'UNIT-002',
        category: 'CAT-A',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dataAccess.addUnit(unit1);
      dataAccess.addUnit(unit2);

      hub.registerNode('node-1');
      hub.registerNode('node-2');

      // Initialize and process both nodes to PROCESSING state
      await hub.initializeNodeSession('node-1', 'LPN-001');
      await hub.initializeNodeSession('node-2', 'LPN-002');
      await hub.processNodeValidation('node-1', 'txn-1');
      await hub.processNodeValidation('node-2', 'txn-1');
      await hub.processNodeVerification('node-1', 'CAT-A');
      await hub.processNodeVerification('node-2', 'CAT-A');

      // Process units concurrently
      await Promise.all([
        hub.processNodeUnit('node-1', 'unit-1'),
        hub.processNodeUnit('node-2', 'unit-2'),
      ]);

      const state1 = hub.getNodeState('node-1');
      const state2 = hub.getNodeState('node-2');

      expect(state1?.currentState).toBe('PROCESSING');
      expect(state2?.currentState).toBe('PROCESSING');
    });
  });
});
