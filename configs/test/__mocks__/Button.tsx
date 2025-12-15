/**
 * Centralized Button mock for tests
 * This prevents Button redefinition errors across test files
 */

import React from 'react';

export const Button = React.forwardRef<HTMLButtonElement, any>(({ children, onClick, testID, ...props }, ref) => (
  <button ref={ref} onClick={onClick} data-testid={testID} {...props}>
    {children}
  </button>
));

export const PrimaryButton = Button;
export const SecondaryButton = Button;
export const GhostButton = Button;
export const DangerButton = Button;
export const SuccessButton = Button;

export default Button;
