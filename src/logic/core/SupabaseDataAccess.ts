/**
 * Supabase Data Access Layer Implementation
 * Production implementation using Supabase with industry-agnostic schema
 */

import { supabase } from '../supabase';
import type { DataAccessLayer } from './DataAccessLayer';
import type { Session, Transaction, Unit, SessionUnit } from '../types';

export class SupabaseDataAccess implements DataAccessLayer {
  async findSessionByTrackingId(trackingId: string, nodeId?: string): Promise<Session | null> {
    let query: any = supabase
      .from('sessions')
      .select('*')
      .eq('tracking_identifier', trackingId) // Industry-agnostic column name
      .neq('state', 'COMPLETE')
      .single();

    if (nodeId) {
      query = query.eq('node_id', nodeId);
    }

    const { data, error } = await query;

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    if (!data) return null;

    return this.mapDatabaseSession(data);
  }

  async createSession(session: Partial<Session>): Promise<Session> {
    const { data, error } = await (supabase
      .from('sessions')
      .insert({
        node_id: session.nodeId,
        tracking_identifier: session.trackingIdentifier, // Industry-agnostic column
        state: session.state || 'IDLE',
        transaction_id: session.transactionId, // Industry-agnostic column
        category: session.category, // Industry-agnostic column
      } as any)
      .select()
      .single());

    if (error) throw error;

    return this.mapDatabaseSession(data);
  }

  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.state) updateData.state = updates.state;
    if (updates.trackingIdentifier) updateData.tracking_identifier = updates.trackingIdentifier;
    if (updates.transactionId) updateData.transaction_id = updates.transactionId;
    if (updates.category) updateData.category = updates.category;
    if (updates.completedAt) updateData.completed_at = updates.completedAt;

    const { data, error } = await ((supabase
      .from('sessions') as any)
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single());

    if (error) throw error;

    return this.mapDatabaseSession(data);
  }

  async findTransactionById(transactionId: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions') // Industry-agnostic table name
      .select('*')
      .eq('id', transactionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      transactionNumber: data.transaction_number, // Industry-agnostic column
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async findUnitById(unitId: string): Promise<Unit | null> {
    const { data, error } = await supabase
      .from('units') // Industry-agnostic table name
      .select('*')
      .eq('id', unitId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) return null;

    return {
      id: data.id,
      unitCode: data.unit_code, // Industry-agnostic column
      description: data.description,
      category: data.category, // Industry-agnostic column
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async findSessionUnits(sessionId: string): Promise<SessionUnit[]> {
    const { data, error } = await supabase
      .from('session_units') // Industry-agnostic table name
      .select('*')
      .eq('session_id', sessionId);

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      sessionId: item.session_id,
      unitId: item.unit_id, // Industry-agnostic column
      scannedAt: item.scanned_at,
    }));
  }

  async createSessionUnit(sessionUnit: Partial<SessionUnit>): Promise<SessionUnit> {
    const { data, error } = await (supabase
      .from('session_units') // Industry-agnostic table name
      .insert({
        session_id: sessionUnit.sessionId,
        unit_id: sessionUnit.unitId, // Industry-agnostic column
        scanned_at: sessionUnit.scannedAt || new Date().toISOString(),
      } as any)
      .select()
      .single());

    if (error) throw error;

    return {
      id: data.id,
      sessionId: data.session_id,
      unitId: data.unit_id,
      scannedAt: data.scanned_at,
    };
  }

  private mapDatabaseSession(dbSession: any): Session {
    return {
      id: dbSession.id,
      nodeId: dbSession.node_id || '',
      trackingIdentifier: dbSession.tracking_identifier, // Industry-agnostic column
      state: this.mapState(dbSession.state),
      transactionId: dbSession.transaction_id || undefined, // Industry-agnostic column
      category: dbSession.category || undefined, // Industry-agnostic column
      createdAt: dbSession.created_at,
      updatedAt: dbSession.updated_at,
      completedAt: dbSession.completed_at || undefined,
    };
  }

  private mapState(dbState: string): 'IDLE' | 'VALIDATION' | 'VERIFICATION' | 'PROCESSING' | 'COMPLETE' {
    // Map database state to ProtocolState
    // Database should store ProtocolState values directly, but handle legacy if needed
    const protocolStates: Array<'IDLE' | 'VALIDATION' | 'VERIFICATION' | 'PROCESSING' | 'COMPLETE'> = [
      'IDLE',
      'VALIDATION',
      'VERIFICATION',
      'PROCESSING',
      'COMPLETE',
    ];
    
    if (protocolStates.includes(dbState as any)) {
      return dbState as 'IDLE' | 'VALIDATION' | 'VERIFICATION' | 'PROCESSING' | 'COMPLETE';
    }
    
    // Legacy state mapping (for backward compatibility during migration)
    const legacyStateMap: Record<string, 'IDLE' | 'VALIDATION' | 'VERIFICATION' | 'PROCESSING' | 'COMPLETE'> = {
      'ORDER_SCAN': 'VALIDATION',
      'PREFIX_CHECK': 'VERIFICATION',
      'ITEM_SCAN': 'PROCESSING',
    };
    
    return legacyStateMap[dbState] || 'IDLE';
  }
}
