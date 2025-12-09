/**
 * categories.types.ts - Shared category type definitions
 * 
 * This file defines shared types for item categories used throughout the application.
 * Centralizing these types ensures consistency and makes maintenance easier.
 */

export type Category = 'credentials' | 'bankCards' | 'secureNotes';

// Category constants to avoid hardcoded strings
export const CATEGORIES = {
  CREDENTIALS: 'credentials' as const,
  BANK_CARDS: 'bankCards' as const,
  SECURE_NOTES: 'secureNotes' as const,
} as const;

/**
 * Array of all available categories
 * Useful for iteration and validation
 */
export const ALL_CATEGORIES: Category[] = [
  CATEGORIES.CREDENTIALS,
  CATEGORIES.BANK_CARDS,
  CATEGORIES.SECURE_NOTES,
];

/**
 * Type guard to check if a value is a valid category
 * @param value - The value to check
 * @returns true if the value is a valid category
 */
export const isCategory = (value: unknown): value is Category => {
  return typeof value === 'string' && ALL_CATEGORIES.includes(value as Category);
}; 