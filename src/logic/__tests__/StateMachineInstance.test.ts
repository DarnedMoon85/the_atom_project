/**
 * Unit tests for StateMachineInstance
 * No React/UI dependencies - pure TypeScript testing
 */

import { StateMachineInstance } from '../core/StateMachineInstance';
import { InMemoryDataAccess } from '../core/InMemoryDataAccess';
import type { Transaction, Unit } from '../types';

describe('StateMachineInstance', () => {
  let instance: StateMachineInstance;
  let dataAccess: InMemoryDataAccess;
  const nodeId = 'test-node-1';

  beforeEach(() => {
    dataAccess = new InMemoryDataAccess();
    instance = new StateMachineInstance(nodeId, dataAccess);
  });

  afterEach(() => {
    dataAccess.clear();
  });

  describe('Initialization', () => {
    it('should start in IDLE state', () => {
      const state = instance.getState();
      expect(state.currentState).toBe('IDLE');
      expect(state.session).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
    });

    it('should return correct node ID', () => {
      expect(instance.getNodeId()).toBe(nodeId);
    });
  });

  describe('Session Initialization', () => {
    it('should transition IDLE -> VALIDATION on session init', async () => {
      await instance.initializeSession('LPN-001');
      
      const state = instance.getState();
      expect(state.currentState).toBe('VALIDATION');
      expect(state.session).not.toBeNull();
      expect(state.session?.trackingIdentifier).toBe('LPN-001');
      expect(state.session?.nodeId).toBe(nodeId);
    });

    it('should throw error if tracking identifier is empty', async () => {
      await expect(instance.initializeSession('')).rejects.toThrow('Tracking identifier cannot be empty');
    });

    it('should resume existing incomplete session', async () => {
      // Create a session manually
      const session = await dataAccess.createSession({
        nodeId,
        trackingIdentifier: 'LPN-002',
        state: 'VERIFICATION',
      });

      await instance.initializeSession('LPN-002');
      
      const state = instance.getState();
      expect(state.currentState).toBe('VERIFICATION');
      expect(state.session?.id).toBe(session.id);
    });
  });

  describe('State Transitions', () => {
    beforeEach(async () => {
      await instance.initializeSession('LPN-TEST');
    });

    it('should transition VALIDATION -> VERIFICATION after processing validation', async () => {
      // Add a transaction
      const transaction: Transaction = {
        id: 'txn-1',
        transactionNumber: 'TXN-001',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (dataAccess as any).addTransaction(transaction);

      await instance.processValidation('txn-1');
      
      const state = instance.getState();
      expect(state.currentState).toBe('VERIFICATION');
      expect(state.session?.transactionId).toBe('txn-1');
    });

    it('should throw error if transaction not found', async () => {
      await expect(instance.processValidation('invalid-txn')).rejects.toThrow('Transaction not found');
    });

    it('should transition VERIFICATION -> PROCESSING after processing verification', async () => {
      // Setup: process validation first
      const transaction: Transaction = {
        id: 'txn-1',
        transactionNumber: 'TXN-001',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (dataAccess as any).addTransaction(transaction);
      await instance.processValidation('txn-1');

      await instance.processVerification('CAT-A');
      
      const state = instance.getState();
      expect(state.currentState).toBe('PROCESSING');
      expect(state.session?.category).toBe('CAT-A');
    });

    it('should throw error if category is empty', async () => {
      const transaction: Transaction = {
        id: 'txn-1',
        transactionNumber: 'TXN-001',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (dataAccess as any).addTransaction(transaction);
      await instance.processValidation('txn-1');

      await expect(instance.processVerification('')).rejects.toThrow('Category cannot be empty');
    });

    it('should remain in PROCESSING after processing unit', async () => {
      // Setup: get to PROCESSING state
      const transaction: Transaction = {
        id: 'txn-1',
        transactionNumber: 'TXN-001',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (dataAccess as any).addTransaction(transaction);
      await instance.processValidation('txn-1');
      await instance.processVerification('CAT-A');

      // Add a unit
      const unit: Unit = {
        id: 'unit-1',
        unitCode: 'UNIT-001',
        category: 'CAT-A',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (dataAccess as any).addUnit(unit);

      await instance.processUnit('unit-1');
      
      const state = instance.getState();
      expect(state.currentState).toBe('PROCESSING');
    });

    it('should throw error if unit category does not match session category', async () => {
      const transaction: Transaction = {
        id: 'txn-1',
        transactionNumber: 'TXN-001',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (dataAccess as any).addTransaction(transaction);
      await instance.processValidation('txn-1');
      await instance.processVerification('CAT-A');

      const unit: Unit = {
        id: 'unit-1',
        unitCode: 'UNIT-001',
        category: 'CAT-B', // Different category
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (dataAccess as any).addUnit(unit);

      await expect(instance.processUnit('unit-1')).rejects.toThrow('does not match session category');
    });

    it('should transition PROCESSING -> COMPLETE on session completion', async () => {
      // Setup: get to PROCESSING state
      const transaction: Transaction = {
        id: 'txn-1',
        transactionNumber: 'TXN-001',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (dataAccess as any).addTransaction(transaction);
      await instance.processValidation('txn-1');
      await instance.processVerification('CAT-A');

      await instance.completeSession();
      
      const state = instance.getState();
      expect(state.currentState).toBe('COMPLETE');
      expect(state.session?.completedAt).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should prevent invalid state transitions', async () => {
      await instance.initializeSession('LPN-TEST');
      
      // Try to skip VALIDATION and go directly to VERIFICATION
      // This should be prevented by the state machine
      const state = instance.getState();
      expect(state.currentState).toBe('VALIDATION');
      
      // processVerification should fail because we're in VALIDATION, not VERIFICATION
      await expect(instance.processVerification('CAT-A')).rejects.toThrow('Cannot process verification in state: VALIDATION');
    });
  });

  describe('Reset', () => {
    it('should reset to IDLE state', async () => {
      await instance.initializeSession('LPN-TEST');
      expect(instance.getState().currentState).toBe('VALIDATION');
      
      instance.reset();
      
      const state = instance.getState();
      expect(state.currentState).toBe('IDLE');
      expect(state.session).toBeNull();
      expect(state.error).toBeNull();
    });
  });
});
