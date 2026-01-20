/**
 * In-Memory Data Access Layer
 * Implementation for unit testing - no external dependencies
 */

import type { DataAccessLayer } from './DataAccessLayer';
import type { Session, Transaction, Unit, SessionUnit } from '../types';

export class InMemoryDataAccess implements DataAccessLayer {
  private sessions: Map<string, Session> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private units: Map<string, Unit> = new Map();
  private sessionUnits: Map<string, SessionUnit> = new Map();
  private trackingIdIndex: Map<string, string> = new Map(); // trackingId -> sessionId

  async findSessionByTrackingId(trackingId: string, nodeId?: string): Promise<Session | null> {
    const sessionId = this.trackingIdIndex.get(trackingId);
    if (!sessionId) return null;
    
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    
    // Filter by nodeId if provided
    if (nodeId && session.nodeId !== nodeId) return null;
    
    return session;
  }

  async createSession(session: Partial<Session>): Promise<Session> {
    if (!session.id) {
      session.id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    if (!session.createdAt) {
      session.createdAt = new Date().toISOString();
    }
    
    if (!session.updatedAt) {
      session.updatedAt = new Date().toISOString();
    }

    const newSession: Session = {
      id: session.id,
      nodeId: session.nodeId || '',
      trackingIdentifier: session.trackingIdentifier || '',
      state: session.state || 'IDLE',
      transactionId: session.transactionId,
      category: session.category,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      completedAt: session.completedAt,
    };

    this.sessions.set(newSession.id, newSession);
    if (newSession.trackingIdentifier) {
      this.trackingIdIndex.set(newSession.trackingIdentifier, newSession.id);
    }

    return newSession;
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const updatedSession: Session = {
      ...session,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.sessions.set(sessionId, updatedSession);
    
    // Update tracking ID index if it changed
    if (updates.trackingIdentifier && updates.trackingIdentifier !== session.trackingIdentifier) {
      this.trackingIdIndex.delete(session.trackingIdentifier);
      this.trackingIdIndex.set(updates.trackingIdentifier, sessionId);
    }

    return updatedSession;
  }

  async findTransactionById(transactionId: string): Promise<Transaction | null> {
    return this.transactions.get(transactionId) || null;
  }

  async findUnitById(unitId: string): Promise<Unit | null> {
    return this.units.get(unitId) || null;
  }

  async findSessionUnits(sessionId: string): Promise<SessionUnit[]> {
    return Array.from(this.sessionUnits.values()).filter(
      su => su.sessionId === sessionId
    );
  }

  async createSessionUnit(sessionUnit: Partial<SessionUnit>): Promise<SessionUnit> {
    if (!sessionUnit.id) {
      sessionUnit.id = `session-unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    if (!sessionUnit.scannedAt) {
      sessionUnit.scannedAt = new Date().toISOString();
    }

    const newSessionUnit: SessionUnit = {
      id: sessionUnit.id,
      sessionId: sessionUnit.sessionId || '',
      unitId: sessionUnit.unitId || '',
      scannedAt: sessionUnit.scannedAt,
    };

    this.sessionUnits.set(newSessionUnit.id, newSessionUnit);
    return newSessionUnit;
  }

  // Test helper methods
  addTransaction(transaction: Transaction): void {
    this.transactions.set(transaction.id, transaction);
  }

  addUnit(unit: Unit): void {
    this.units.set(unit.id, unit);
  }

  clear(): void {
    this.sessions.clear();
    this.transactions.clear();
    this.units.clear();
    this.sessionUnits.clear();
    this.trackingIdIndex.clear();
  }
}
