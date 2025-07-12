/**
 * Session management for vault runtime
 * Handles session expiration and locking
 */

import { lockSession } from './vaultSession';

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

let sessionTimeoutId: NodeJS.Timeout | null = null;

/**
 * Start session timeout timer
 * @param onExpire Callback to execute when session expires
 */
export function startSessionTimer(onExpire?: () => void): void {
  // Clear existing timer
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
  }
  
  // Set new timer
  sessionTimeoutId = setTimeout(async () => {
    console.log('[SessionManager] Session expired, locking...');
    await lockSession();
    if (onExpire) {
      onExpire();
    }
  }, SESSION_TIMEOUT_MS);
}

/**
 * Reset session timer (called on user activity)
 */
export function resetSessionTimer(): void {
  startSessionTimer();
}

/**
 * Stop session timer
 */
export function stopSessionTimer(): void {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId);
    sessionTimeoutId = null;
  }
}

/**
 * Manually lock the session
 */
export async function manualLockSession(): Promise<void> {
  console.log('[SessionManager] Manual session lock requested');
  stopSessionTimer();
  await lockSession();
}

/**
 * Check if session is about to expire (within 5 minutes)
 * @returns true if session expires within 5 minutes
 */
export function isSessionExpiringSoon(): boolean {
  // This would need to be implemented with a more sophisticated timer
  // For now, we'll return false and handle expiration in the timer
  return false;
}

/**
 * Get remaining session time in milliseconds
 * @returns Remaining time in milliseconds or 0 if no session
 */
export function getRemainingSessionTime(): number {
  // This would need to be implemented with session start time tracking
  // For now, return a default value
  return SESSION_TIMEOUT_MS;
} 