'use client';

/**
 * GlobalMetrics - Global analytics display
 * Pure presentation component - NO business logic
 */

import type { GlobalAnalytics } from '@/logic/types';

interface GlobalMetricsProps {
  analytics: GlobalAnalytics;
}

export default function GlobalMetrics({ analytics }: GlobalMetricsProps) {
  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      <div className="bg-gray-900 rounded-lg p-6 border-2 border-gray-800 text-center">
        <p className="text-4xl text-safety-lime mb-2">Total Nodes</p>
        <p className="text-6xl font-bold text-white">{analytics.totalNodes}</p>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 border-2 border-gray-800 text-center">
        <p className="text-4xl text-safety-lime mb-2">Active Nodes</p>
        <p className="text-6xl font-bold text-terminal-green">{analytics.activeNodes}</p>
      </div>

      <div className="bg-gray-900 rounded-lg p-6 border-2 border-gray-800 text-center">
        <p className="text-4xl text-safety-lime mb-2">Avg Performance</p>
        <p className="text-6xl font-bold text-white">{analytics.averagePerformanceMetric.toFixed(2)}</p>
      </div>
    </div>
  );
}
