'use client';

/**
 * Scanner Page - Connects ScannerFace to AtomHub
 * Handles all AtomHub interactions (business logic layer)
 * ScannerFace is pure presentation (Face Separation)
 */

import { useEffect, useState, useCallback } from 'react';
import { getAtomHub } from '@/logic/AtomHub';
import { SupabaseDataAccess } from '@/logic/core/SupabaseDataAccess';
import { InMemoryDataAccess } from '@/logic/core/InMemoryDataAccess';
import { hasSupabaseCredentials } from '@/logic/supabase';
import ScannerFace from '@/components/ScannerFace';
import type { StateMachineState, Node } from '@/logic/types';

export default function ScannerPage() {
  const [nodeId, setNodeId] = useState('default');
  const [state, setState] = useState<StateMachineState | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [hub, setHub] = useState<ReturnType<typeof getAtomHub> | null>(null);

  useEffect(() => {
    // Initialize AtomHub with appropriate data access layer
    // Use InMemoryDataAccess if Supabase credentials are not configured
    const dataAccess = hasSupabaseCredentials 
      ? new SupabaseDataAccess() 
      : new InMemoryDataAccess();
    const hubInstance = getAtomHub(dataAccess);
    setHub(hubInstance);

    // Register default node if not exists
    if (!hubInstance.getNode('default')) {
      hubInstance.registerNode('default');
    }

    // Get all nodes
    setNodes(hubInstance.getAllNodes());

    // Get initial state for default node
    const initialState = hubInstance.getNodeState('default');
    setState(initialState);

    // Set up polling for state updates (in production, use real-time subscriptions)
    const interval = setInterval(() => {
      const currentState = hubInstance.getNodeState(nodeId);
      if (currentState) {
        setState(currentState);
      }
      // Refresh nodes list
      setNodes(hubInstance.getAllNodes());
    }, 1000); // Poll every second

    return () => clearInterval(interval);
  }, [nodeId]);

  const handleNodeChange = useCallback((newNodeId: string) => {
    setNodeId(newNodeId);
    if (hub) {
      // Ensure node is registered
      if (!hub.getNode(newNodeId)) {
        hub.registerNode(newNodeId);
      }
      const nodeState = hub.getNodeState(newNodeId);
      setState(nodeState);
      setNodes(hub.getAllNodes());
    }
  }, [hub]);

  const handleScanAction = useCallback(async (data: string) => {
    if (!hub) return;

    try {
      const currentState = hub.getNodeState(nodeId);
      if (!currentState) return;

      switch (currentState.currentState) {
        case 'IDLE':
          await hub.initializeNodeSession(nodeId, data);
          break;
        case 'VALIDATION':
          await hub.processNodeValidation(nodeId, data);
          break;
        case 'VERIFICATION':
          await hub.processNodeVerification(nodeId, data);
          break;
        case 'PROCESSING':
          await hub.processNodeUnit(nodeId, data);
          break;
        default:
          console.warn('Invalid state for scan action:', currentState.currentState);
      }

      // Update state after action
      const updatedState = hub.getNodeState(nodeId);
      if (updatedState) {
        setState(updatedState);
      }
      setNodes(hub.getAllNodes());
    } catch (error) {
      console.error('Error processing scan action:', error);
      // State will be updated with error via polling
    }
  }, [hub, nodeId]);

  const handleComplete = useCallback(async () => {
    if (!hub) return;

    try {
      await hub.completeNodeSession(nodeId);
      const updatedState = hub.getNodeState(nodeId);
      if (updatedState) {
        setState(updatedState);
      }
      setNodes(hub.getAllNodes());
    } catch (error) {
      console.error('Error completing session:', error);
    }
  }, [hub, nodeId]);

  const handleReset = useCallback(() => {
    if (!hub) return;

    const stateMachine = hub.getStateMachineForNode(nodeId);
    stateMachine.reset();
    const resetState = hub.getNodeState(nodeId);
    if (resetState) {
      setState(resetState);
    }
  }, [hub, nodeId]);

  if (!hub || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-4xl text-safety-lime">Initializing Scanner...</p>
      </div>
    );
  }

  // Calculate unit count from session if in PROCESSING state
  const unitCount = state?.currentState === 'PROCESSING' && state.session
    ? 0 // TODO: Query session_units table for actual count
    : 0;

  return (
    <ScannerFace
      nodeId={nodeId}
      onNodeChange={handleNodeChange}
      onScanAction={handleScanAction}
      onComplete={handleComplete}
      onReset={handleReset}
      state={state}
      availableNodes={nodes}
      unitCount={unitCount}
    />
  );
}
