'use client';

/**
 * NodeCard - Individual Sub-Atom node status display
 * Pure presentation component - NO business logic
 */

import type { Node, StateMachineState } from '@/logic/types';

interface NodeCardProps {
  node: Node;
  state: StateMachineState | null;
  unitCount?: number;
}

export default function NodeCard({ node, state, unitCount = 0 }: NodeCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-terminal-green';
      case 'ERROR':
        return 'text-red-500';
      case 'IDLE':
        return 'text-gray-400';
      case 'OFFLINE':
        return 'text-gray-600';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-terminal-green bg-opacity-20 border-terminal-green';
      case 'ERROR':
        return 'bg-red-900 bg-opacity-20 border-red-700';
      case 'IDLE':
        return 'bg-gray-800 border-gray-700';
      case 'OFFLINE':
        return 'bg-gray-900 border-gray-800';
      default:
        return 'bg-gray-800 border-gray-700';
    }
  };

  return (
    <div className={`rounded-lg p-6 border-2 ${getStatusBg(node.nodeStatus)} mb-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-5xl font-bold text-safety-lime">
          {node.nodeId}
        </h3>
        <span className={`text-4xl font-bold ${getStatusColor(node.nodeStatus)}`}>
          [{node.nodeStatus}]
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-4xl text-safety-lime">Performance:</span>
          <span className="text-4xl text-white font-bold">{node.performanceMetric.toFixed(2)}</span>
        </div>

        {state?.session?.trackingIdentifier && (
          <div>
            <span className="text-4xl text-safety-lime">Last Tracking ID: </span>
            <span className="text-4xl text-white">{state.session.trackingIdentifier}</span>
          </div>
        )}

        {state && (
          <div>
            <span className="text-4xl text-safety-lime">State: </span>
            <span className="text-4xl text-white">{state.currentState}</span>
          </div>
        )}

        {state?.currentState === 'PROCESSING' && (
          <div>
            <span className="text-4xl text-safety-lime">Progress: </span>
            <span className="text-6xl text-safety-lime font-bold">{unitCount}</span>
            <span className="text-4xl text-white"> Units</span>
          </div>
        )}

        {state?.error && (
          <div className="bg-red-900 bg-opacity-50 border border-red-700 rounded p-3 mt-3">
            <p className="text-3xl text-red-200">{state.error}</p>
          </div>
        )}

        <div className="text-3xl text-gray-400 mt-3">
          Last Activity: {new Date(node.lastActivityAt).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
