/**
 * Console Monitor Helper
 * 
 * Captures and categorizes console output from the extension during tests.
 * Provides utilities to:
 * - Capture all console messages (log, warn, error)
 * - Filter out expected/ignorable messages
 * - Validate expected errors in negative tests
 * - Print formatted logs for debugging
 */

import type { Page } from '@playwright/test';
import { shouldIgnoreConsoleMessage } from '../config/test.config';

export interface ConsoleMessage {
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  text: string;
  timestamp: number;
}

export class ConsoleMonitor {
  private messages: ConsoleMessage[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.attachListeners();
  }

  /**
   * Attach console listeners to the page
   */
  private attachListeners(): void {
    this.page.on('console', msg => {
      const message: ConsoleMessage = {
        type: msg.type() as ConsoleMessage['type'],
        text: msg.text(),
        timestamp: Date.now(),
      };
      this.messages.push(message);
    });
  }

  /**
   * Get all console messages
   */
  getAllMessages(): ConsoleMessage[] {
    return [...this.messages];
  }

  /**
   * Get messages of a specific type
   */
  getMessagesByType(type: ConsoleMessage['type']): ConsoleMessage[] {
    return this.messages.filter(msg => msg.type === type);
  }

  /**
   * Get all error messages
   */
  getErrors(): ConsoleMessage[] {
    return this.getMessagesByType('error');
  }

  /**
   * Get all warning messages
   */
  getWarnings(): ConsoleMessage[] {
    return this.getMessagesByType('warn');
  }

  /**
   * Get all log messages
   */
  getLogs(): ConsoleMessage[] {
    return this.getMessagesByType('log');
  }

  /**
   * Get errors excluding ignorable ones
   */
  getUnexpectedErrors(): ConsoleMessage[] {
    return this.getErrors().filter(error => 
      !shouldIgnoreConsoleMessage(error.text)
    );
  }

  /**
   * Check if a specific message exists
   */
  hasMessage(text: string): boolean {
    return this.messages.some(msg => msg.text.includes(text));
  }

  /**
   * Check if a specific error exists
   */
  hasError(text: string): boolean {
    return this.getErrors().some(error => error.text.includes(text));
  }

  /**
   * Wait for a specific message to appear
   */
  async waitForMessage(text: string, timeout: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (this.hasMessage(text)) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  }

  /**
   * Print all console messages (for debugging)
   */
  printAll(): void {
    console.log('\n=== Console Messages ===');
    this.messages.forEach(msg => {
      console.log(`[${msg.type}] ${msg.text}`);
    });
    console.log('========================\n');
  }

  /**
   * Print only errors
   */
  printErrors(): void {
    const errors = this.getErrors();
    if (errors.length > 0) {
      console.log('\n=== Console Errors ===');
      errors.forEach(error => {
        console.log(`[ERROR] ${error.text}`);
      });
      console.log('======================\n');
    }
  }

  /**
   * Print formatted summary
   */
  printSummary(): void {
    console.log('\n=== Console Summary ===');
    console.log(`Total messages: ${this.messages.length}`);
    console.log(`Logs: ${this.getLogs().length}`);
    console.log(`Warnings: ${this.getWarnings().length}`);
    console.log(`Errors: ${this.getErrors().length}`);
    console.log(`Unexpected errors: ${this.getUnexpectedErrors().length}`);
    console.log('=======================\n');
  }

  /**
   * Clear all captured messages
   */
  clear(): void {
    this.messages = [];
  }

  /**
   * Get messages since a specific timestamp
   */
  getMessagesSince(timestamp: number): ConsoleMessage[] {
    return this.messages.filter(msg => msg.timestamp >= timestamp);
  }

  /**
   * Get the last N messages
   */
  getLastMessages(count: number): ConsoleMessage[] {
    return this.messages.slice(-count);
  }
}

/**
 * Helper to create a console monitor for a page
 */
export function createConsoleMonitor(page: Page): ConsoleMonitor {
  return new ConsoleMonitor(page);
}

