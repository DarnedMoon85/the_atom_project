'use client';

/**
 * Main workflow page - connects UI components to AtomicEngine
 * Implements state management pattern using AtomicEngine as single source of truth
 */

import { useEffect, useState } from 'react';
import { atomicEngine } from '@/logic/AtomicEngine';
import type { AtomicEngineState } from '@/logic/types';
import IdleState from '@/components/states/IdleState';
import OrderScanState from '@/components/states/OrderScanState';
import PrefixCheckState from '@/components/states/PrefixCheckState';
import ItemScanState from '@/components/states/ItemScanState';
import CompleteState from '@/components/states/CompleteState';

export default function Home() {
  const [engineState, setEngineState] = useState<AtomicEngineState>(atomicEngine.getState());

  useEffect(() => {
    // Subscribe to AtomicEngine state changes
    const unsubscribe = atomicEngine.subscribe((newState) => {
      setEngineState(newState);
    });

    // Get initial state
    setEngineState(atomicEngine.getState());

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Handler functions that call AtomicEngine methods
  const handleLPNSubmit = (lpn: string) => {
    atomicEngine.initializeSession(lpn);
  };

  const handleOrderScan = (orderId: string) => {
    atomicEngine.processOrderScan(orderId);
  };

  const handlePrefixSubmit = (prefix: string) => {
    atomicEngine.processPrefixCheck(prefix);
  };

  const handleItemScan = (itemId: string) => {
    atomicEngine.processItemScan(itemId);
  };

  const handleComplete = () => {
    atomicEngine.completeSession();
  };

  const handleReset = () => {
    atomicEngine.reset();
  };

  // Render appropriate state component based on current state
  const renderState = () => {
    switch (engineState.currentState) {
      case 'IDLE':
        return (
          <IdleState
            onLPNSubmit={handleLPNSubmit}
            isLoading={engineState.isLoading}
            error={engineState.error}
          />
        );

      case 'ORDER_SCAN':
        return (
          <OrderScanState
            lpn={engineState.session?.lpn || ''}
            onOrderScan={handleOrderScan}
            isLoading={engineState.isLoading}
            error={engineState.error}
          />
        );

      case 'PREFIX_CHECK':
        return (
          <PrefixCheckState
            lpn={engineState.session?.lpn || ''}
            orderId={engineState.session?.orderId || ''}
            onPrefixSubmit={handlePrefixSubmit}
            isLoading={engineState.isLoading}
            error={engineState.error}
          />
        );

      case 'ITEM_SCAN':
        return (
          <ItemScanState
            lpn={engineState.session?.lpn || ''}
            orderId={engineState.session?.orderId || ''}
            prefix={engineState.session?.prefix || ''}
            onItemScan={handleItemScan}
            onComplete={handleComplete}
            isLoading={engineState.isLoading}
            error={engineState.error}
          />
        );

      case 'COMPLETE':
        return (
          <CompleteState
            lpn={engineState.session?.lpn || ''}
            orderId={engineState.session?.orderId || ''}
            prefix={engineState.session?.prefix || ''}
            onReset={handleReset}
          />
        );

      default:
        return (
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-4xl text-red-500">Unknown state: {engineState.currentState}</p>
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen">
      {renderState()}
    </main>
  );
}
