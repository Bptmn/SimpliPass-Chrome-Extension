/**
 * Auto-Lock Service
 * 
 * Handles automatic locking of the extension after inactivity.
 * Monitors user activity and locks the vault when timeout is reached.
 */

import { useAppStateStore } from '../../hooks/useAppState';
import { vaultService } from './vaultService';

// Default session timeout: 30 minutes
const DEFAULT_SESSION_TIMEOUT = 30 * 60 * 1000;

export interface IAutoLockService {
  start(): void;
  stop(): void;
  reset(): void;
  isActive(): boolean;
}

class AutoLockService implements IAutoLockService {
  private lockTimeout: NodeJS.Timeout | null = null;
  private activityListeners: Array<() => void> = [];
  private isMonitoring: boolean = false;
  private timeoutMs: number = DEFAULT_SESSION_TIMEOUT;

  constructor() {
    // Track user activity events
    this.setupActivityTracking();
  }

  /**
   * Setup activity tracking for mouse, keyboard, and focus events
   */
  private setupActivityTracking(): void {
    if (typeof window === 'undefined') {
      return; // Not in browser environment
    }

    const resetTimeout = () => {
      if (this.isMonitoring) {
        this.reset();
      }
    };

    // Track mouse movements
    window.addEventListener('mousemove', resetTimeout, { passive: true });
    window.addEventListener('mousedown', resetTimeout, { passive: true });
    window.addEventListener('mouseup', resetTimeout, { passive: true });

    // Track keyboard activity
    window.addEventListener('keydown', resetTimeout, { passive: true });
    window.addEventListener('keyup', resetTimeout, { passive: true });

    // Track focus changes (user switching tabs/windows)
    window.addEventListener('focus', resetTimeout, { passive: true });
    window.addEventListener('blur', () => {
      // Don't reset on blur, but continue monitoring
    }, { passive: true });

    // Track scroll activity
    window.addEventListener('scroll', resetTimeout, { passive: true });

    // Store cleanup functions
    this.activityListeners.push(() => {
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('mousedown', resetTimeout);
      window.removeEventListener('mouseup', resetTimeout);
      window.removeEventListener('keydown', resetTimeout);
      window.removeEventListener('keyup', resetTimeout);
      window.removeEventListener('focus', resetTimeout);
      window.removeEventListener('blur', resetTimeout);
      window.removeEventListener('scroll', resetTimeout);
    });
  }

  /**
   * Start monitoring for inactivity
   */
  public start(): void {
    if (this.isMonitoring) {
      console.log('[AutoLockService] Already monitoring, skipping start');
      return;
    }

    console.log('[AutoLockService] Starting auto-lock monitoring');
    this.isMonitoring = true;
    this.reset();
  }

  /**
   * Stop monitoring for inactivity
   */
  public stop(): void {
    if (!this.isMonitoring) {
      return;
    }

    console.log('[AutoLockService] Stopping auto-lock monitoring');
    this.isMonitoring = false;
    
    if (this.lockTimeout) {
      clearTimeout(this.lockTimeout);
      this.lockTimeout = null;
    }
  }

  /**
   * Reset the inactivity timer
   */
  public reset(): void {
    if (!this.isMonitoring) {
      return;
    }

    // Clear existing timeout
    if (this.lockTimeout) {
      clearTimeout(this.lockTimeout);
    }

    // Set new timeout
    this.lockTimeout = setTimeout(() => {
      this.lockVault();
    }, this.timeoutMs);

    console.log(`[AutoLockService] Auto-lock timer reset (${this.timeoutMs / 1000 / 60} minutes)`);
  }

  /**
   * Lock the vault due to inactivity
   */
  private async lockVault(): Promise<void> {
    try {
      console.log('[AutoLockService] Inactivity detected, locking vault');
      
      const appState = useAppStateStore.getState();
      
      // Only lock if user is authenticated and has secret key
      if (!appState.user || !appState.userSecretKeyExist) {
        console.log('[AutoLockService] User not authenticated or no secret key, skipping lock');
        return;
      }

      // Clear vault from session storage (RAM)
      await vaultService.clearLocalVault();
      
      // Clear user secret key from session storage
      const { storage } = await import('../adapters/platform.storage.adapter');
      await storage.deleteUserSecretKeyFromSecureLocalStorage();
      
      // Update app state to trigger lock page
      useAppStateStore.getState().setSecretKey(false);
      
      console.log('[AutoLockService] Vault locked due to inactivity');
    } catch (error) {
      console.error('[AutoLockService] Failed to lock vault:', error);
    }
  }

  /**
   * Check if monitoring is active
   */
  public isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Set custom timeout (in milliseconds)
   */
  public setTimeout(timeoutMs: number): void {
    this.timeoutMs = timeoutMs;
    if (this.isMonitoring) {
      this.reset();
    }
  }

  /**
   * Get current timeout
   */
  public getTimeout(): number {
    return this.timeoutMs;
  }

  /**
   * Cleanup all listeners
   */
  public cleanup(): void {
    this.stop();
    this.activityListeners.forEach(cleanup => cleanup());
    this.activityListeners = [];
  }
}

// Export singleton instance
export const autoLockService = new AutoLockService();
