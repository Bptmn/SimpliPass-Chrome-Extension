# Testing Guide for SimpliPass

This document provides a comprehensive guide to understanding, writing, and maintaining tests in the SimpliPass project.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Testing Philosophy](#testing-philosophy)
- [Test Organization](#test-organization)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

SimpliPass uses a comprehensive testing strategy that covers all layers of the application:

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test interactions between modules
- **Component Tests**: Test UI components with React Testing Library
- **Storybook**: Visual testing and documentation of components

## 🏗️ Test Structure

### Directory Organization

```
packages/
├── common/
│   ├── core/
│   │   ├── adapters/__tests__/
│   │   ├── libraries/__tests__/
│   │   └── services/__tests__/
│   ├── hooks/__tests__/
│   ├── ui/
│   │   ├── components/__tests__/
│   │   └── pages/__tests__/
│   └── utils/__tests__/
├── extension/
│   └── __tests__/
└── mobile/
    └── __tests__/
```

### Test File Naming Convention

- Test files should be named `*.test.ts` or `*.test.tsx`
- Place test files in `__tests__` directories colocated with the code they test
- Example: `crypto.ts` → `__tests__/crypto.test.ts`

## 🧪 Testing Philosophy

### Core Principles

1. **Single Behavior Per Test**: Each test should verify one specific behavior
2. **Descriptive Names**: Test names should clearly describe what is being tested
3. **Test Both Success and Failure**: Cover happy path and error scenarios
4. **Avoid Implementation Details**: Test behavior, not implementation
5. **Use Mocks Sparingly**: Only mock external dependencies, not internal logic

### Test Categories

#### Unit Tests
- Test individual functions in isolation
- Mock external dependencies
- Focus on logic and edge cases

#### Integration Tests
- Test interactions between modules
- Use real adapters with mocked libraries
- Verify data flow between layers

#### Component Tests
- Test UI components with React Testing Library
- Focus on user interactions and accessibility
- Use `testID` and `accessibilityLabel` for queries

## 📁 Test Organization

### Test File Structure

```typescript
// File: __tests__/example.test.ts

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { functionToTest } from '../example';

describe('functionToTest', () => {
  beforeEach(() => {
    // Setup code that runs before each test
  });

  describe('when input is valid', () => {
    it('should return expected result', () => {
      // Arrange
      const input = 'valid input';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected output');
    });
  });

  describe('when input is invalid', () => {
    it('should throw error', () => {
      // Arrange
      const input = 'invalid input';
      
      // Act & Assert
      expect(() => functionToTest(input)).toThrow('Invalid input');
    });
  });
});
```

### Test Helpers

Create reusable test utilities in `__tests__/helpers/`:

```typescript
// File: __tests__/helpers/testUtils.ts

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  ...overrides,
});

export const createMockCredential = (overrides = {}) => ({
  id: 'test-credential-id',
  title: 'Test Credential',
  username: 'testuser',
  password: 'testpass',
  ...overrides,
});
```

## ✍️ Writing Tests

### Utility Tests

```typescript
// File: __tests__/crypto.test.ts

import { generateSalt, deriveKey, encrypt, decrypt } from '../crypto';

describe('crypto', () => {
  describe('generateSalt', () => {
    it('should generate a salt of correct length', () => {
      const salt = generateSalt();
      expect(salt).toHaveLength(32);
      expect(typeof salt).toBe('string');
    });

    it('should generate unique salts', () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toBe(salt2);
    });
  });

  describe('deriveKey', () => {
    it('should derive consistent key from same password and salt', () => {
      const password = 'testpassword';
      const salt = 'testsalt';
      
      const key1 = deriveKey(password, salt);
      const key2 = deriveKey(password, salt);
      
      expect(key1).toBe(key2);
    });
  });

  describe('encrypt and decrypt', () => {
    it('should encrypt and decrypt data correctly', () => {
      const key = 'testkey';
      const data = 'sensitive data';
      
      const encrypted = encrypt(data, key);
      const decrypted = decrypt(encrypted, key);
      
      expect(decrypted).toBe(data);
      expect(encrypted).not.toBe(data);
    });
  });
});
```

### Service Tests

```typescript
// File: __tests__/cryptoService.test.ts

import { CryptoService } from '../cryptoService';
import { mockCryptoAdapter } from './mocks/cryptoAdapter';

jest.mock('../adapters/crypto.adapter', () => ({
  encrypt: jest.fn(),
  decrypt: jest.fn(),
}));

describe('CryptoService', () => {
  let cryptoService: CryptoService;
  let mockAdapter: typeof mockCryptoAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    cryptoService = new CryptoService();
    mockAdapter = require('../adapters/crypto.adapter');
  });

  describe('encryptData', () => {
    it('should encrypt data using adapter', async () => {
      // Arrange
      const data = 'sensitive data';
      const key = 'testkey';
      const expectedEncrypted = 'encrypted_data';
      mockAdapter.encrypt.mockResolvedValue(expectedEncrypted);

      // Act
      const result = await cryptoService.encryptData(data, key);

      // Assert
      expect(mockAdapter.encrypt).toHaveBeenCalledWith(data, key);
      expect(result).toBe(expectedEncrypted);
    });

    it('should throw error when encryption fails', async () => {
      // Arrange
      const data = 'sensitive data';
      const key = 'testkey';
      mockAdapter.encrypt.mockRejectedValue(new Error('Encryption failed'));

      // Act & Assert
      await expect(cryptoService.encryptData(data, key))
        .rejects.toThrow('Encryption failed');
    });
  });
});
```

### Hook Tests

```typescript
// File: __tests__/useFormState.test.tsx

import { renderHook, act } from '@testing-library/react';
import { useFormState } from '../useFormState';

describe('useFormState', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFormState({
      initialValues: { name: '', email: '' }
    }));

    expect(result.current.values).toEqual({ name: '', email: '' });
    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(false);
  });

  it('should update values when setValue is called', () => {
    const { result } = renderHook(() => useFormState({
      initialValues: { name: '', email: '' }
    }));

    act(() => {
      result.current.setValue('name', 'John');
    });

    expect(result.current.values.name).toBe('John');
  });

  it('should validate form and update isValid', () => {
    const { result } = renderHook(() => useFormState({
      initialValues: { name: '', email: '' },
      validation: {
        name: (value) => value.length > 0 ? null : 'Name is required',
        email: (value) => value.includes('@') ? null : 'Invalid email'
      }
    }));

    act(() => {
      result.current.setValue('name', 'John');
      result.current.setValue('email', 'john@example.com');
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });
});
```

### Component Tests

```typescript
// File: __tests__/CopyButton.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { CopyButton } from '../CopyButton';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('CopyButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with correct text', () => {
    render(<CopyButton text="test text" />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('should copy text to clipboard when clicked', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });

    render(<CopyButton text="test text" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockWriteText).toHaveBeenCalledWith('test text');
  });

  it('should show success state after copying', async () => {
    render(<CopyButton text="test text" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('should handle clipboard errors gracefully', async () => {
    const mockWriteText = jest.fn().mockRejectedValue(new Error('Clipboard error'));
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    });

    render(<CopyButton text="test text" />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Failed to copy')).toBeInTheDocument();
  });
});
```

## 🚀 Running Tests

### Commands

```bash
# Run all tests
npm test

# Run tests with verbose output
npm test -- --verbose

# Run tests in watch mode
npm test -- --watch

# Run tests for specific file
npm test -- crypto.test.ts

# Run tests for specific directory
npm test -- packages/common/utils/__tests__/

# Run tests with coverage
npm test -- --coverage

# Run tests and update snapshots
npm test -- --updateSnapshot

# Run tests in CI mode (no watch)
npm test -- --ci
```

### Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:update": "jest --updateSnapshot"
  }
}
```

## 📋 Best Practices

### General Guidelines

1. **Test Behavior, Not Implementation**
   ```typescript
   // ❌ Bad - testing implementation
   it('should call setState', () => {
     const setState = jest.fn();
     // test implementation details
   });

   // ✅ Good - testing behavior
   it('should update form values when input changes', () => {
     // test observable behavior
   });
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // ❌ Bad
   it('should work', () => {});

   // ✅ Good
   it('should encrypt sensitive data and return encrypted string', () => {});
   ```

3. **Follow AAA Pattern (Arrange, Act, Assert)**
   ```typescript
   it('should validate email format', () => {
     // Arrange
     const email = 'invalid-email';
     
     // Act
     const result = validateEmail(email);
     
     // Assert
     expect(result).toBe(false);
   });
   ```

### Mocking Guidelines

1. **Mock External Dependencies Only**
   ```typescript
   // ✅ Good - mock external API
   jest.mock('../adapters/firebase.adapter');

   // ❌ Bad - mock internal logic
   jest.mock('../utils/validation');
   ```

2. **Use Jest Mocks for Functions**
   ```typescript
   const mockEncrypt = jest.fn().mockResolvedValue('encrypted');
   jest.mock('../crypto', () => ({
     encrypt: mockEncrypt,
   }));
   ```

3. **Reset Mocks Between Tests**
   ```typescript
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

### Component Testing Guidelines

1. **Use Accessibility Queries**
   ```typescript
   // ✅ Good - accessibility-focused
   screen.getByRole('button');
   screen.getByLabelText('Password');
   screen.getByTestId('copy-button');

   // ❌ Bad - implementation-focused
   screen.getByClassName('btn');
   screen.getByText('Copy');
   ```

2. **Test User Interactions**
   ```typescript
   it('should submit form when submit button is clicked', () => {
     render(<LoginForm onSubmit={mockSubmit} />);
     
     fireEvent.change(screen.getByLabelText('Email'), {
       target: { value: 'test@example.com' },
     });
     fireEvent.change(screen.getByLabelText('Password'), {
       target: { value: 'password123' },
     });
     fireEvent.click(screen.getByRole('button', { name: 'Login' }));
     
     expect(mockSubmit).toHaveBeenCalledWith({
       email: 'test@example.com',
       password: 'password123',
     });
   });
   ```

## 🔧 Common Patterns

### Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const mockAsyncFunction = jest.fn().mockResolvedValue('result');
  
  const result = await mockAsyncFunction();
  
  expect(result).toBe('result');
  expect(mockAsyncFunction).toHaveBeenCalledTimes(1);
});
```

### Testing Error Handling

```typescript
it('should throw error for invalid input', () => {
  expect(() => {
    validateInput('invalid');
  }).toThrow('Invalid input');
});

it('should handle async errors', async () => {
  const mockFunction = jest.fn().mockRejectedValue(new Error('Network error'));
  
  await expect(mockFunction()).rejects.toThrow('Network error');
});
```

### Testing Custom Hooks

```typescript
it('should return expected state and functions', () => {
  const { result } = renderHook(() => useCustomHook());
  
  expect(result.current.value).toBeDefined();
  expect(typeof result.current.updateValue).toBe('function');
});
```

### Testing with Context

```typescript
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </AuthProvider>
);

it('should render with context', () => {
  render(<Component />, { wrapper: TestWrapper });
  
  expect(screen.getByText('Authenticated')).toBeInTheDocument();
});
```

## 🛠️ Troubleshooting

### Common Issues

1. **Tests Failing Due to Missing Mocks**
   ```typescript
   // Add to test file or jest.setup.js
   jest.mock('react-native', () => ({
     Platform: { OS: 'ios' },
     Alert: { alert: jest.fn() },
   }));
   ```

2. **Async Tests Not Completing**
   ```typescript
   // Use done callback or async/await
   it('should complete async operation', async () => {
     await waitFor(() => {
       expect(screen.getByText('Loaded')).toBeInTheDocument();
     });
   });
   ```

3. **Component Not Rendering**
   ```typescript
   // Check for missing providers or context
   render(<Component />, {
     wrapper: ({ children }) => <Provider>{children}</Provider>,
   });
   ```

### Debugging Tips

1. **Use `console.log` in tests for debugging**
2. **Use `screen.debug()` to see rendered output**
3. **Use `--verbose` flag for detailed output**
4. **Use `--no-cache` to clear Jest cache**

### Performance Tips

1. **Use `jest.isolateModules()` for module isolation**
2. **Mock heavy dependencies**
3. **Use `beforeAll` for expensive setup**
4. **Group related tests in `describe` blocks**

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Storybook for Visual Testing](https://storybook.js.org/)

## 🤝 Contributing

When adding new tests:

1. Follow the existing patterns and conventions
2. Ensure tests are descriptive and maintainable
3. Add tests for both success and failure cases
4. Update this documentation if needed
5. Run the full test suite before submitting

---

**Remember**: Good tests are an investment in code quality and maintainability. They help catch bugs early and make refactoring safer. 