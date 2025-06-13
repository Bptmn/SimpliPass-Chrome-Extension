import { generateCSSVariables } from '../designSystem';

export function injectDesignSystem(): void {
  const root = document.documentElement;
  const cssVariables = generateCSSVariables();
  root.style.cssText = cssVariables;
} 