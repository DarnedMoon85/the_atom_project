/**
 * AtomicEngine - Legacy Wrapper for Backward Compatibility
 * Delegates to AtomHub with a default node
 * Maintains existing API for UI components
 */

import { getAtomHub } from './AtomHub';
import { SupabaseDataAccess } from './core/SupabaseDataAccess';
import { InMemoryDataAccess } from './core/InMemoryDataAccess';
import { hasSupabaseCredentials } from './supabase';
import type { AtomicEngineState, CEOState, LegacySession } from './types';

// Initialize AtomHub with appropriate data access layer
// Use InMemoryDataAccess if Supabase credentials are not configured
const dataAccess = hasSupabaseCredentials 
  ? new SupabaseDataAccess() 
  : new InMemoryDataAccess();
const atomHub = getAtomHub(dataAccess);

// Default node ID for legacy single-node usage
const DEFAULT_NODE_ID = 'default';

// Ensure default node is registered
if (!atomHub.getNode(DEFAULT_NODE_ID)) {
  atomHub.registerNode(DEFAULT_NODE_ID);
}

/**
 * Legacy AtomicEngine class that delegates to AtomHub
 * Maintains backward compatibility with existing UI components
 */
export class AtomicEngine {
  private defaultNodeId: string = DEFAULT_NODE_ID;

  /**
   * Subscribe to state changes (legacy API)
   * Note: This is a simplified version - full implementation would require event system
   */
  subscribe(listener: (state: AtomicEngineState) => void): () => void {
    // For now, return a no-op unsubscribe
    // Full implementation would require adding event system to AtomHub
    return () => {
      // Unsubscribe logic would go here
    };
  }

  /**
   * Get current engine state (legacy API)
   */
  getState(): AtomicEngineState {
    const nodeState = atomHub.getNodeState(this.defaultNodeId);
    
    if (!nodeState) {
      return {
        currentState: 'IDLE' as CEOState,
        session: null,
        error: null,
        isLoading: false,
      };
    }

    // Map ProtocolState to CEOState for backward compatibility
    const stateMap: Record<string, CEOState> = {
      'IDLE': 'IDLE',
      'VALIDATION': 'ORDER_SCAN',
      'VERIFICATION': 'PREFIX_CHECK',
      'PROCESSING': 'ITEM_SCAN',
      'COMPLETE': 'COMPLETE',
    };

    // Map Session to LegacySession
    const legacySession: LegacySession | null = nodeState.session ? {
      id: nodeState.session.id,
      lpn: nodeState.session.trackingIdentifier,
      state: stateMap[nodeState.session.state] || 'IDLE',
      orderId: nodeState.session.transactionId,
      prefix: nodeState.session.category,
      createdAt: nodeState.session.createdAt,
      updatedAt: nodeState.session.updatedAt,
      completedAt: nodeState.session.completedAt,
    } : null;

    return {
      currentState: stateMap[nodeState.currentState] || 'IDLE',
      session: legacySession,
      error: nodeState.error,
      isLoading: nodeState.isLoading,
    };
  }

  /**
   * Initialize a new session with a unique License Plate Number (legacy API)
   */
  async initializeSession(lpn: string): Promise<void> {
    try {
      await atomHub.initializeNodeSession(this.defaultNodeId, lpn);
    } catch (error) {
      // Error is already set in state machine
      throw error;
    }
  }

  /**
   * Process order scan - validates order and transitions to PREFIX_CHECK (legacy API)
   */
  async processOrderScan(orderId: string): Promise<void> {
    try {
      await atomHub.processNodeValidation(this.defaultNodeId, orderId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process prefix check - validates prefix and transitions to ITEM_SCAN (legacy API)
   */
  async processPrefixCheck(prefix: string): Promise<void> {
    try {
      await atomHub.processNodeVerification(this.defaultNodeId, prefix);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Process item scan - validates item and adds to session (legacy API)
   */
  async processItemScan(itemId: string): Promise<void> {
    try {
      await atomHub.processNodeUnit(this.defaultNodeId, itemId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Complete the current session (legacy API)
   */
  async completeSession(): Promise<void> {
    try {
      await atomHub.completeNodeSession(this.defaultNodeId);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset engine to IDLE state (for new session) (legacy API)
   */
  reset(): void {
    const stateMachine = atomHub.getStateMachineForNode(this.defaultNodeId);
    stateMachine.reset();
  }
}

// Singleton instance - single source of truth (legacy)
export const atomicEngine = new AtomicEngine();
