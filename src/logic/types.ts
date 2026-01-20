// Core type definitions for Atomic Engine

// Legacy CEOState (kept for backward compatibility)
export type CEOState = 'IDLE' | 'ORDER_SCAN' | 'PREFIX_CHECK' | 'ITEM_SCAN' | 'COMPLETE';

// Industry-agnostic Protocol State
export type ProtocolState = 'IDLE' | 'VALIDATION' | 'VERIFICATION' | 'PROCESSING' | 'COMPLETE';

// Node Management Types
export type NodeStatus = 'ACTIVE' | 'IDLE' | 'ERROR' | 'OFFLINE';

export interface Node {
  nodeId: string;
  nodeStatus: NodeStatus;
  performanceMetric: number; // For money-making optimization (0.0 - 1.0+)
  registeredAt: string;
  lastActivityAt: string;
  metadata?: Record<string, any>;
}

// Industry-Agnostic Types (abstracted from WMS terminology)

// Generic Unit (replaces Item)
export interface Unit {
  id: string;
  unitCode: string; // Replaces itemCode
  description?: string;
  category?: string; // Replaces prefix, more generic
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Generic Transaction (replaces Order)
export interface Transaction {
  id: string;
  transactionNumber: string; // Replaces orderNumber
  status: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Session with node awareness (industry-agnostic)
export interface Session {
  id: string;
  nodeId: string; // NEW: Associate session with node
  trackingIdentifier: string; // Replaces LPN (industry-agnostic)
  state: ProtocolState;
  transactionId?: string; // Replaces orderId
  category?: string; // Replaces prefix
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Session-Unit junction (replaces SessionItem)
export interface SessionUnit {
  id: string;
  sessionId: string;
  unitId: string; // Replaces itemId
  scannedAt: string;
}

// Legacy Types (kept for backward compatibility)
export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  itemCode: string;
  description?: string;
  prefix?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionItem {
  id: string;
  sessionId: string;
  itemId: string;
  scannedAt: string;
}

// Legacy Session type for backward compatibility with UI components
export interface LegacySession {
  id: string;
  lpn: string;
  state: CEOState;
  orderId?: string;
  prefix?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface AtomicEngineConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export interface AtomicEngineState {
  currentState: CEOState;
  session: LegacySession | null;
  error: string | null;
  isLoading: boolean;
}

// State Machine State (industry-agnostic)
export interface StateMachineState {
  currentState: ProtocolState;
  session: Session | null;
  error: string | null;
  isLoading: boolean;
}

// Global Analytics
export interface GlobalAnalytics {
  totalNodes: number;
  activeNodes: number;
  totalSessions: number;
  averagePerformanceMetric: number;
  nodeMetrics: Map<string, number>;
}
