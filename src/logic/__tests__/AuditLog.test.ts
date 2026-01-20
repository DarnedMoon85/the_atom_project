/**
 * Audit Log Verification Tests
 * Verifies that tracking identifiers (LPNs) and timestamps are properly captured
 */

import { StateMachineInstance } from '../core/StateMachineInstance';
import { InMemoryDataAccess } from '../core/InMemoryDataAccess';
import type { Transaction, Unit } from '../types';

describe('Audit Log Verification', () => {
  let instance: StateMachineInstance;
  let dataAccess: InMemoryDataAccess;
  const nodeId = 'audit-test-node';

  beforeEach(() => {
    dataAccess = new InMemoryDataAccess();
    instance = new StateMachineInstance(nodeId, dataAccess);
  });

  afterEach(() => {
    dataAccess.clear();
  });

  describe('Tracking Identifier Capture', () => {
    it('should capture tracking identifier (LPN) on session creation', async () => {
      const trackingId = 'LPN-AUDIT-001';
      await instance.initializeSession(trackingId);

      const state = instance.getState();
      expect(state.session).not.toBeNull();
      expect(state.session?.trackingIdentifier).toBe(trackingId);
      
      // Verify it's stored in data access layer
      const storedSession = await dataAccess.findSessionByTrackingId(trackingId, nodeId);
      expect(storedSession).not.toBeNull();
      expect(storedSession?.trackingIdentifier).toBe(trackingId);
    });

    it('should maintain tracking identifier through state transitions', async () => {
      const trackingId = 'LPN-AUDIT-002';
      await instance.initializeSession(trackingId);

      const transaction: Transaction = {
        id: 'txn-audit-1',
        transactionNumber: 'TXN-AUDIT-001',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dataAccess.addTransaction(transaction);
      await instance.processValidation('txn-audit-1');

      const state = instance.getState();
      expect(state.session?.trackingIdentifier).toBe(trackingId);
    });
  });

  describe('Timestamp Recording', () => {
    it('should set createdAt timestamp on session creation', async () => {
      const beforeCreation = new Date().toISOString();
      await instance.initializeSession('LPN-TIMESTAMP-001');
      const afterCreation = new Date().toISOString();

      const state = instance.getState();
      expect(state.session?.createdAt).toBeDefined();
      expect(state.session?.createdAt).toBeTruthy();
      
      // Verify timestamp is within reasonable range
      const createdAt = new Date(state.session!.createdAt);
      const before = new Date(beforeCreation);
      const after = new Date(afterCreation);
      
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000); // Allow 1s margin
      expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
    });

    it('should update updatedAt timestamp on state transitions', async () => {
      await instance.initializeSession('LPN-TIMESTAMP-002');
      const initialUpdatedAt = instance.getState().session!.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const transaction: Transaction = {
        id: 'txn-timestamp-1',
        transactionNumber: 'TXN-TIMESTAMP-001',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dataAccess.addTransaction(transaction);
      await instance.processValidation('txn-timestamp-1');

      const state = instance.getState();
      expect(state.session?.updatedAt).toBeDefined();
      expect(state.session?.updatedAt).not.toBe(initialUpdatedAt);
      
      // Verify updatedAt is after createdAt
      const createdAt = new Date(state.session!.createdAt);
      const updatedAt = new Date(state.session!.updatedAt);
      expect(updatedAt.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());
    });

    it('should set completedAt timestamp on session completion', async () => {
      // Setup: get to PROCESSING state
      await instance.initializeSession('LPN-COMPLETE-001');
      const transaction: Transaction = {
        id: 'txn-complete-1',
        transactionNumber: 'TXN-COMPLETE-001',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dataAccess.addTransaction(transaction);
      await instance.processValidation('txn-complete-1');
      await instance.processVerification('CAT-A');

      // Complete session
      await instance.completeSession();

      const state = instance.getState();
      expect(state.session?.completedAt).toBeDefined();
      expect(state.session?.completedAt).toBeTruthy();
      
      // Verify completedAt is after createdAt
      const createdAt = new Date(state.session!.createdAt);
      const completedAt = new Date(state.session!.completedAt!);
      expect(completedAt.getTime()).toBeGreaterThanOrEqual(createdAt.getTime());
    });

    it('should record scannedAt timestamp for session units', async () => {
      // Setup: get to PROCESSING state
      await instance.initializeSession('LPN-UNIT-TIMESTAMP-001');
      const transaction: Transaction = {
        id: 'txn-unit-1',
        transactionNumber: 'TXN-UNIT-001',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dataAccess.addTransaction(transaction);
      await instance.processValidation('txn-unit-1');
      await instance.processVerification('CAT-A');

      const unit: Unit = {
        id: 'unit-timestamp-1',
        unitCode: 'UNIT-TIMESTAMP-001',
        category: 'CAT-A',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dataAccess.addUnit(unit);

      const beforeScan = new Date().toISOString();
      await instance.processUnit('unit-timestamp-1');
      const afterScan = new Date().toISOString();

      const sessionUnits = await dataAccess.findSessionUnits(instance.getState().session!.id);
      expect(sessionUnits).toHaveLength(1);
      expect(sessionUnits[0].scannedAt).toBeDefined();
      
      // Verify scannedAt is within reasonable range
      const scannedAt = new Date(sessionUnits[0].scannedAt);
      const before = new Date(beforeScan);
      const after = new Date(afterScan);
      
      expect(scannedAt.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
      expect(scannedAt.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
    });
  });

  describe('Tracking Identifier Indexing', () => {
    it('should correctly index tracking identifiers for fast lookup', async () => {
      const trackingId1 = 'LPN-INDEX-001';
      const trackingId2 = 'LPN-INDEX-002';

      await instance.initializeSession(trackingId1);
      const session1 = await dataAccess.findSessionByTrackingId(trackingId1, nodeId);
      expect(session1).not.toBeNull();
      expect(session1?.trackingIdentifier).toBe(trackingId1);

      // Create another instance for second session
      const instance2 = new StateMachineInstance('audit-test-node-2', dataAccess);
      await instance2.initializeSession(trackingId2);
      const session2 = await dataAccess.findSessionByTrackingId(trackingId2, 'audit-test-node-2');
      expect(session2).not.toBeNull();
      expect(session2?.trackingIdentifier).toBe(trackingId2);

      // Verify they are distinct
      expect(session1?.id).not.toBe(session2?.id);
    });
  });
});
