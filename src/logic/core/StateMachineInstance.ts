/**
 * State Machine Instance
 * Modular state machine that can be instantiated per node
 * No React/UI dependencies - pure TypeScript
 */

import type { DataAccessLayer } from './DataAccessLayer';
import type { ProtocolState, Session, StateMachineState } from '../types';

export class StateMachineInstance {
  private nodeId: string;
  private currentState: ProtocolState = 'IDLE';
  private session: Session | null = null;
  private error: string | null = null;
  private isLoading: boolean = false;
  private dataAccess: DataAccessLayer;

  // State transition map - enforces mandatory sequence
  private readonly validTransitions: Record<ProtocolState, ProtocolState[]> = {
    'IDLE': ['VALIDATION'],
    'VALIDATION': ['VERIFICATION'],
    'VERIFICATION': ['PROCESSING'],
    'PROCESSING': ['PROCESSING', 'COMPLETE'], // Can process multiple units
    'COMPLETE': [], // Terminal state
  };

  constructor(nodeId: string, dataAccess: DataAccessLayer) {
    this.nodeId = nodeId;
    this.dataAccess = dataAccess;
  }

  /**
   * Get current state machine state
   */
  getState(): StateMachineState {
    return {
      currentState: this.currentState,
      session: this.session,
      error: this.error,
      isLoading: this.isLoading,
    };
  }

  /**
   * Get node ID
   */
  getNodeId(): string {
    return this.nodeId;
  }

  /**
   * Initialize a new session with a tracking identifier
   */
  async initializeSession(trackingIdentifier: string): Promise<void> {
    if (this.isLoading) return;

    this.isLoading = true;
    this.error = null;

    try {
      // Validate tracking identifier is not empty
      if (!trackingIdentifier || trackingIdentifier.trim().length === 0) {
        throw new Error('Tracking identifier cannot be empty');
      }

      // Check if session with this tracking identifier already exists and is not complete
      const existingSession = await this.dataAccess.findSessionByTrackingId(
        trackingIdentifier.trim(),
        this.nodeId
      );

      if (existingSession) {
        // Resume existing session - don't transition, just restore state
        this.session = existingSession;
        this.currentState = existingSession.state;
      } else {
        // Create new session
        this.session = await this.dataAccess.createSession({
          nodeId: this.nodeId,
          trackingIdentifier: trackingIdentifier.trim(),
          state: 'IDLE',
        });
        this.currentState = 'IDLE';
        
        // Transition to VALIDATION state only for new sessions
        await this.transitionToState('VALIDATION');
      }
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to initialize session';
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Transition to a new state - enforces mandatory sequence
   */
  private async transitionToState(newState: ProtocolState): Promise<void> {
    const validNextStates = this.validTransitions[this.currentState];

    if (!validNextStates.includes(newState)) {
      throw new Error(
        `Invalid state transition from ${this.currentState} to ${newState}. ` +
        `Valid next states: ${validNextStates.join(', ')}`
      );
    }

    if (!this.session) {
      throw new Error('No active session');
    }

    this.currentState = newState;

    // Update session in database
    const updateData: Partial<Session> = {
      state: newState,
    };

    if (newState === 'COMPLETE') {
      updateData.completedAt = new Date().toISOString();
    }

    this.session = await this.dataAccess.updateSession(this.session.id, updateData);
  }

  /**
   * Process validation (replaces processOrderScan) - validates transaction and transitions to VERIFICATION
   */
  async processValidation(transactionId: string): Promise<void> {
    if (this.isLoading) return;
    if (this.currentState !== 'VALIDATION') {
      this.error = `Cannot process validation in state: ${this.currentState}`;
      throw new Error(this.error);
    }

    this.isLoading = true;
    this.error = null;

    try {
      // Validate transaction exists
      const transaction = await this.dataAccess.findTransactionById(transactionId);

      if (!transaction) {
        throw new Error(`Transaction not found: ${transactionId}`);
      }

      // Update session with transaction ID
      if (!this.session) {
        throw new Error('No active session');
      }

      this.session = await this.dataAccess.updateSession(this.session.id, {
        transactionId,
      });

      // Transition to VERIFICATION
      await this.transitionToState('VERIFICATION');
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to process validation';
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Process verification (replaces processPrefixCheck) - validates category and transitions to PROCESSING
   */
  async processVerification(category: string): Promise<void> {
    if (this.isLoading) return;
    if (this.currentState !== 'VERIFICATION') {
      this.error = `Cannot process verification in state: ${this.currentState}`;
      throw new Error(this.error);
    }

    this.isLoading = true;
    this.error = null;

    try {
      if (!category || category.trim().length === 0) {
        throw new Error('Category cannot be empty');
      }

      if (!this.session) {
        throw new Error('No active session');
      }

      // Update session with category
      this.session = await this.dataAccess.updateSession(this.session.id, {
        category: category.trim(),
      });

      // Transition to PROCESSING
      await this.transitionToState('PROCESSING');
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to process verification';
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Process unit (replaces processItemScan) - validates unit and adds to session
   */
  async processUnit(unitId: string): Promise<void> {
    if (this.isLoading) return;
    if (this.currentState !== 'PROCESSING') {
      this.error = `Cannot process unit in state: ${this.currentState}`;
      throw new Error(this.error);
    }

    this.isLoading = true;
    this.error = null;

    try {
      // Validate unit exists
      const unit = await this.dataAccess.findUnitById(unitId);

      if (!unit) {
        throw new Error(`Unit not found: ${unitId}`);
      }

      // Validate category if session has one
      if (this.session?.category && unit.category !== this.session.category) {
        throw new Error(
          `Unit category ${unit.category} does not match session category ${this.session.category}`
        );
      }

      if (!this.session) {
        throw new Error('No active session');
      }

      // Check if unit already scanned in this session
      const existingUnits = await this.dataAccess.findSessionUnits(this.session.id);
      const alreadyScanned = existingUnits.some(su => su.unitId === unitId);

      if (alreadyScanned) {
        throw new Error('Unit already scanned in this session');
      }

      // Add unit to session
      await this.dataAccess.createSessionUnit({
        sessionId: this.session.id,
        unitId,
        scannedAt: new Date().toISOString(),
      });

      // State remains PROCESSING - can process more units
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to process unit';
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Complete the current session
   */
  async completeSession(): Promise<void> {
    if (this.isLoading) return;
    if (this.currentState !== 'PROCESSING') {
      this.error = `Cannot complete session in state: ${this.currentState}`;
      throw new Error(this.error);
    }

    this.isLoading = true;
    this.error = null;

    try {
      await this.transitionToState('COMPLETE');
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to complete session';
      throw err;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Reset state machine to IDLE state (for new session)
   */
  reset(): void {
    this.currentState = 'IDLE';
    this.session = null;
    this.error = null;
    this.isLoading = false;
  }
}
