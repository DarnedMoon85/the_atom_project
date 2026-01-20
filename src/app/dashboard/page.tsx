'use client';

/**
 * Hub Dashboard - Central view for monitoring all Sub-Atom nodes
 * Connects to AtomHub for real-time monitoring
 */

import { useEffect, useState, useCallback } from 'react';
import { getAtomHub } from '@/logic/AtomHub';
import { SupabaseDataAccess } from '@/logic/core/SupabaseDataAccess';
import GlobalMetrics from '@/components/dashboard/GlobalMetrics';
import NodeCard from '@/components/dashboard/NodeCard';
import NodeRegistration from '@/components/dashboard/NodeRegistration';
import type { Node, GlobalAnalytics, StateMachineState } from '@/logic/types';

export default function DashboardPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [analytics, setAnalytics] = useState<GlobalAnalytics | null>(null);
  const [nodeStates, setNodeStates] = useState<Map<string, StateMachineState>>(new Map());
  const [hub, setHub] = useState<ReturnType<typeof getAtomHub> | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Initialize AtomHub with SupabaseDataAccess
    const dataAccess = new SupabaseDataAccess();
    const hubInstance = getAtomHub(dataAccess);
    setHub(hubInstance);

    // Initial load
    updateDashboard(hubInstance);

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      updateDashboard(hubInstance);
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const updateDashboard = (hubInstance: ReturnType<typeof getAtomHub>) => {
    // Get all nodes
    const allNodes = hubInstance.getAllNodes();
    setNodes(allNodes);

    // Get global analytics
    const globalAnalytics = hubInstance.getGlobalAnalytics();
    setAnalytics(globalAnalytics);

    // Get states for all nodes
    const allStates = hubInstance.getAllNodeStates();
    setNodeStates(allStates);
  };

  const handleRegisterNode = useCallback(async (nodeId: string) => {
    if (!hub) return;

    setIsRegistering(true);
    try {
      hub.registerNode(nodeId);
      updateDashboard(hub);
    } catch (error) {
      console.error('Error registering node:', error);
      alert(`Failed to register node: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRegistering(false);
    }
  }, [hub]);

  if (!hub || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-4xl text-safety-lime">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-6xl font-bold mb-8 text-center text-safety-orange">
          ATOM HUB DASHBOARD
        </h1>

        {/* Global Metrics */}
        <div className="mb-8">
          <h2 className="text-5xl mb-4 text-safety-lime">Global Metrics</h2>
          <GlobalMetrics analytics={analytics} />
        </div>

        {/* Node Registration */}
        <NodeRegistration
          onRegister={handleRegisterNode}
          isRegistering={isRegistering}
        />

        {/* Sub-Atom Nodes */}
        <div className="mb-8">
          <h2 className="text-5xl mb-4 text-safety-lime">Sub-Atom Nodes</h2>
          {nodes.length === 0 ? (
            <div className="bg-gray-900 rounded-lg p-8 border-2 border-gray-800 text-center">
              <p className="text-4xl text-gray-400">No nodes registered</p>
              <p className="text-3xl text-gray-500 mt-4">Register a node above to begin</p>
            </div>
          ) : (
            <div>
              {nodes.map((node) => {
                const nodeState = nodeStates.get(node.nodeId);
                // Calculate unit count from session if in PROCESSING state
                const unitCount = 0; // Would need to query session_units table
                return (
                  <NodeCard
                    key={node.nodeId}
                    node={node}
                    state={nodeState || null}
                    unitCount={unitCount}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
