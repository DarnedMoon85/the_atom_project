'use client';

/**
 * ScannerFace - The Face Component
 * Pure presentation - NO business logic
 * Interfaces with AtomHub through parent component
 * 
 * Requirements:
 * - inputmode="none" on all inputs (prevents virtual keyboard)
 * - Glove-friendly buttons (minimum 48px touch targets)
 * - 5-foot visibility (text-4xl minimum, text-6xl for progress)
 */

import type { StateMachineState, Node } from '@/logic/types';

interface ScannerFaceProps {
  nodeId: string;
  onNodeChange: (nodeId: string) => void;
  onScanAction: (data: string) => void;
  onComplete: () => void;
  onReset: () => void;
  state: StateMachineState | null;
  availableNodes: Node[];
  unitCount?: number;
}

export default function ScannerFace({
  nodeId,
  onNodeChange,
  onScanAction,
  onComplete,
  onReset,
  state,
  availableNodes,
  unitCount = 0,
}: ScannerFaceProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, action: (data: string) => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const input = formData.get('scanInput') as string;
    if (input && input.trim()) {
      action(input.trim());
      e.currentTarget.reset();
      // Refocus input for next scan
      const inputElement = e.currentTarget.querySelector('input') as HTMLInputElement;
      if (inputElement) {
        setTimeout(() => inputElement.focus(), 100);
      }
    }
  };

  const currentNode = availableNodes.find(n => n.nodeId === nodeId);
  const nodeStatus = currentNode?.nodeStatus || 'OFFLINE';

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-4xl text-safety-lime">Initializing...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-6xl font-bold mb-8 text-center text-safety-orange">
          ATOMIC ENGINE
        </h1>

        {/* Node Selector */}
        <div className="mb-8 p-6 bg-gray-900 rounded-lg border-2 border-gray-800">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <label htmlFor="nodeSelect" className="text-4xl text-safety-lime">
                Node:
              </label>
              <select
                id="nodeSelect"
                value={nodeId}
                onChange={(e) => onNodeChange(e.target.value)}
                className="input-industrial bg-gray-800 border-2 border-gray-700 text-white text-4xl px-4 py-2 rounded-lg focus:border-safety-orange focus:outline-none"
              >
                {availableNodes.map((node) => (
                  <option key={node.nodeId} value={node.nodeId} className="text-2xl">
                    {node.nodeId}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-4xl">
              <span className="text-safety-lime">Status: </span>
              <span className={nodeStatus === 'ACTIVE' ? 'text-terminal-green' : nodeStatus === 'ERROR' ? 'text-red-500' : 'text-gray-400'}>
                {nodeStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Current State Display */}
        <div className="mb-8 text-center">
          <p className="text-5xl text-safety-lime mb-4">
            State: {state.currentState}
          </p>
        </div>

        {/* State-Specific Content */}
        {state.currentState === 'IDLE' && (
          <div className="bg-gray-900 rounded-lg p-8 border-2 border-gray-800">
            <h2 className="text-5xl mb-6 text-center text-safety-orange">
              START SESSION
            </h2>
            <form onSubmit={(e) => handleSubmit(e, (data) => onScanAction(data))} className="space-y-6">
              <div>
                <label htmlFor="trackingId" className="block text-4xl mb-4 text-white">
                  Tracking Identifier:
                </label>
                <input
                  type="text"
                  id="trackingId"
                  name="scanInput"
                  autoFocus
                  inputMode="none"
                  disabled={state.isLoading}
                  className="input-industrial w-full bg-gray-800 border-2 border-gray-700 text-white focus:border-safety-orange focus:outline-none disabled:opacity-50"
                  placeholder="Scan tracking identifier"
                />
              </div>
              {state.error && (
                <div className="bg-red-900 border-2 border-red-700 rounded-lg p-4">
                  <p className="text-4xl text-red-200">{state.error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={state.isLoading}
                className="btn-industrial w-full bg-safety-orange text-black hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isLoading ? 'PROCESSING...' : 'START SESSION'}
              </button>
            </form>
          </div>
        )}

        {state.currentState === 'VALIDATION' && (
          <div className="bg-gray-900 rounded-lg p-8 border-2 border-gray-800">
            <div className="mb-6 space-y-4">
              <p className="text-4xl text-safety-lime">
                Tracking ID: <span className="text-white">{state.session?.trackingIdentifier}</span>
              </p>
            </div>
            <h2 className="text-5xl mb-6 text-center text-safety-orange">
              SCAN TRANSACTION
            </h2>
            <form onSubmit={(e) => handleSubmit(e, (data) => onScanAction(data))} className="space-y-6">
              <div>
                <label htmlFor="transactionId" className="block text-4xl mb-4 text-white">
                  Transaction ID:
                </label>
                <input
                  type="text"
                  id="transactionId"
                  name="scanInput"
                  autoFocus
                  inputMode="none"
                  disabled={state.isLoading}
                  className="input-industrial w-full bg-gray-800 border-2 border-gray-700 text-white focus:border-safety-orange focus:outline-none disabled:opacity-50"
                  placeholder="Scan transaction barcode"
                />
              </div>
              {state.error && (
                <div className="bg-red-900 border-2 border-red-700 rounded-lg p-4">
                  <p className="text-4xl text-red-200">{state.error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={state.isLoading}
                className="btn-industrial w-full bg-safety-orange text-black hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isLoading ? 'PROCESSING...' : 'PROCESS TRANSACTION'}
              </button>
            </form>
          </div>
        )}

        {state.currentState === 'VERIFICATION' && (
          <div className="bg-gray-900 rounded-lg p-8 border-2 border-gray-800">
            <div className="mb-6 space-y-4">
              <p className="text-4xl text-safety-lime">
                Tracking ID: <span className="text-white">{state.session?.trackingIdentifier}</span>
              </p>
              <p className="text-4xl text-safety-lime">
                Transaction: <span className="text-white">{state.session?.transactionId || 'N/A'}</span>
              </p>
            </div>
            <h2 className="text-5xl mb-6 text-center text-safety-orange">
              ENTER CATEGORY
            </h2>
            <form onSubmit={(e) => handleSubmit(e, (data) => onScanAction(data))} className="space-y-6">
              <div>
                <label htmlFor="category" className="block text-4xl mb-4 text-white">
                  Category:
                </label>
                <input
                  type="text"
                  id="category"
                  name="scanInput"
                  autoFocus
                  inputMode="none"
                  disabled={state.isLoading}
                  className="input-industrial w-full bg-gray-800 border-2 border-gray-700 text-white focus:border-safety-orange focus:outline-none disabled:opacity-50"
                  placeholder="Enter or scan category"
                />
              </div>
              {state.error && (
                <div className="bg-red-900 border-2 border-red-700 rounded-lg p-4">
                  <p className="text-4xl text-red-200">{state.error}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={state.isLoading}
                className="btn-industrial w-full bg-safety-orange text-black hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isLoading ? 'PROCESSING...' : 'CONFIRM CATEGORY'}
              </button>
            </form>
          </div>
        )}

        {state.currentState === 'PROCESSING' && (
          <div className="bg-gray-900 rounded-lg p-8 border-2 border-gray-800">
            <div className="mb-6 space-y-4">
              <p className="text-4xl text-safety-lime">
                Tracking ID: <span className="text-white">{state.session?.trackingIdentifier}</span>
              </p>
              <p className="text-4xl text-safety-lime">
                Transaction: <span className="text-white">{state.session?.transactionId || 'N/A'}</span>
              </p>
              <p className="text-4xl text-safety-lime">
                Category: <span className="text-white">{state.session?.category || 'N/A'}</span>
              </p>
            </div>
            <h2 className="text-5xl mb-6 text-center text-safety-orange">
              SCAN UNITS
            </h2>
            <div className="mb-6 text-center">
              <p className="text-6xl text-safety-lime font-bold">
                Units: {unitCount}
              </p>
            </div>
            <form onSubmit={(e) => handleSubmit(e, (data) => onScanAction(data))} className="space-y-6">
              <div>
                <label htmlFor="unitCode" className="block text-4xl mb-4 text-white">
                  Unit Code:
                </label>
                <input
                  type="text"
                  id="unitCode"
                  name="scanInput"
                  autoFocus
                  inputMode="none"
                  disabled={state.isLoading}
                  className="input-industrial w-full bg-gray-800 border-2 border-gray-700 text-white focus:border-safety-orange focus:outline-none disabled:opacity-50"
                  placeholder="Scan unit barcode"
                />
              </div>
              {state.error && (
                <div className="bg-red-900 border-2 border-red-700 rounded-lg p-4">
                  <p className="text-4xl text-red-200">{state.error}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="submit"
                  disabled={state.isLoading}
                  className="btn-industrial bg-safety-orange text-black hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isLoading ? 'PROCESSING...' : 'SCAN UNIT'}
                </button>
                <button
                  type="button"
                  onClick={onComplete}
                  disabled={state.isLoading}
                  className="btn-industrial bg-terminal-green text-black hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  COMPLETE
                </button>
              </div>
            </form>
          </div>
        )}

        {state.currentState === 'COMPLETE' && (
          <div className="bg-gray-900 rounded-lg p-8 border-2 border-terminal-green">
            <h1 className="text-6xl font-bold mb-8 text-center text-terminal-green">
              SESSION COMPLETE
            </h1>
            <div className="space-y-6 mb-8">
              <div className="text-center space-y-4">
                <p className="text-4xl text-safety-lime">
                  Tracking ID: <span className="text-white">{state.session?.trackingIdentifier}</span>
                </p>
                <p className="text-4xl text-safety-lime">
                  Transaction: <span className="text-white">{state.session?.transactionId || 'N/A'}</span>
                </p>
                <p className="text-4xl text-safety-lime">
                  Category: <span className="text-white">{state.session?.category || 'N/A'}</span>
                </p>
              </div>
              <div className="bg-terminal-green bg-opacity-20 border-2 border-terminal-green rounded-lg p-6 text-center">
                <p className="text-6xl text-terminal-green font-bold">
                  SUCCESS
                </p>
              </div>
            </div>
            <button
              onClick={onReset}
              className="btn-industrial w-full bg-safety-orange text-black hover:bg-orange-600"
            >
              START NEW SESSION
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
