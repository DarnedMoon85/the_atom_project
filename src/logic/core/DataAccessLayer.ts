/**
 * Data Access Layer Interface
 * Abstract interface for database operations to enable unit testing
 */

import type { Session, Transaction, Unit, SessionUnit } from '../types';

export interface DataAccessLayer {
  // Session operations
  findSessionByTrackingId(trackingId: string, nodeId?: string): Promise<Session | null>;
  createSession(session: Partial<Session>): Promise<Session>;
  updateSession(sessionId: string, updates: Partial<Session>): Promise<Session>;
  
  // Transaction operations (replaces Order)
  findTransactionById(transactionId: string): Promise<Transaction | null>;
  
  // Unit operations (replaces Item)
  findUnitById(unitId: string): Promise<Unit | null>;
  findSessionUnits(sessionId: string): Promise<SessionUnit[]>;
  createSessionUnit(sessionUnit: Partial<SessionUnit>): Promise<SessionUnit>;
}
