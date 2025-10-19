# SimpliPass - TODO Analysis & Implementation Plan

## 📋 Overview

This document provides a comprehensive analysis of all TODO items and unimplemented features found in the SimpliPass codebase. The analysis is organized by priority and impact to guide development efforts.

---

## 🔍 Analysis Summary

**Total TODOs Found**: 20 items across 8 files  
**Critical Features Missing**: 4  
**UX Improvements Needed**: 2  
**Architectural Refactoring**: 2  
**Legacy Code Issues**: 3 major areas  

---

## 🔴 Critical Features (High Priority)

### 1. Context Menu Integration - PopoverManager

**Files**: `packages/extension/contextMenu.ts`  
**TODOs**: 11 occurrences  
**Impact**: **CRITICAL** - Right-click context menu features don't work

#### Current State
- Context menu is registered but all actions are stubbed
- Uses old PopoverManager instead of new organized system
- No actual functionality for credential filling, password generation, etc.

#### TODOs Found
```typescript
// Line 5: Update to use the new organized PopoverManager
// Line 166: Fill credentials clicked - TODO: implement with new PopoverManager
// Line 186: Generate password clicked - TODO: implement with new PopoverManager  
// Line 199: Open manager clicked - TODO: implement with new PopoverManager
// Line 214: Save form clicked - TODO: implement with new PopoverManager
```

#### Implementation Required
- Integrate with `packages/extension/popovers/PopoverManager.ts`
- Implement credential picker popover
- Implement password generator popover
- Implement form capture functionality
- Implement vault unlock integration

#### Estimated Effort: **High** (2-3 days)

---

### 2. Autofill Injection Service

**File**: `packages/common/hooks/useAutofillInjection.ts`  
**TODOs**: 1 occurrence  
**Impact**: **CRITICAL** - Core password manager functionality missing

#### Current State
- Hook exists but only logs to console
- No actual form field injection
- No content script integration

#### TODO Found
```typescript
// Line 22: TODO: Call actual injection service here
// await injectionService.injectCredential(credential);
```

#### Implementation Required
- Create injection service for form field detection
- Implement content script communication
- Handle different input types (text, password, email)
- Support various form structures
- Add security validation

#### Estimated Effort: **High** (3-4 days)

---

### 3. Bank Card Edit Navigation

**File**: `packages/common/hooks/useBankCardDetails.ts`  
**TODOs**: 1 occurrence  
**Impact**: **MEDIUM** - User cannot edit bank cards from details page

#### Current State
- Edit button exists but does nothing
- Navigation logic is missing
- Parent component should handle navigation

#### TODO Found
```typescript
// Line 28: TODO: Navigate to edit page - let parent handle this
console.log('Edit bank card:', card.id);
```

#### Implementation Required
- Add navigation logic to parent component
- Route to `MODIFY_BANKCARD` page
- Pass bank card data to edit form

#### Estimated Effort: **Low** (30 minutes)

---

## 🟡 UX Improvements (Medium Priority)

### 4. ItemsStateManager - Loading & Error States

**File**: `packages/common/hooks/useItems.ts`  
**TODOs**: 3 occurrences  
**Impact**: **MEDIUM** - No loading indicators or error feedback

#### Current State
- Loading state always returns false
- Error state always returns null
- No refresh functionality

#### TODOs Found
```typescript
// Line 28: return false; // TODO: Add loading state to ItemsStateManager
// Line 32: return null; // TODO: Add error state to ItemsStateManager  
// Line 48: // TODO: Implement refresh logic
```

#### Implementation Required
- Add loading state to ItemsStateManager
- Add error state management
- Implement manual refresh functionality
- Update UI components to show loading/error states

#### Estimated Effort: **Medium** (1 day)

---

## 🟠 Legacy Code Issues (Medium Priority)

### 7. Legacy Hooks Architecture

**Files**: `packages/common/hooks/index.ts`, Multiple hook files  
**Impact**: **MEDIUM** - Technical debt and maintenance burden  
**Legacy Hooks**: 17 hooks marked as legacy

#### Current State
- 17 hooks exported as "legacy" for backward compatibility
- No actual `legacy/` folder exists (hooks are in main directory)
- Documentation mentions legacy folder that doesn't exist
- Hooks are still actively used in pages

#### Legacy Hooks Found
```typescript
// packages/common/hooks/index.ts - Lines 36-52
export { useAddCard2 } from './legacy/useAddCard2';           // ❌ File doesn't exist in legacy/
export { useBankCardDetails } from './legacy/useBankCardDetails'; // ❌ File doesn't exist in legacy/
export { useCredentialDetails } from './legacy/useCredentialDetails'; // ❌ File doesn't exist in legacy/
export { useModifyBankCard } from './legacy/useModifyBankCard'; // ❌ File doesn't exist in legacy/
export { useModifyCredential } from './legacy/useModifyCredential'; // ❌ File doesn't exist in legacy/
export { useModifySecureNote } from './legacy/useModifySecureNote'; // ❌ File doesn't exist in legacy/
// ... 11 more legacy hooks
```

#### Issues Identified
1. **Broken Import Paths**: All legacy hooks import from `./legacy/` but files are in main directory
2. **Documentation Mismatch**: README mentions legacy folder that doesn't exist
3. **Active Usage**: Legacy hooks still used in 4 page files
4. **No Migration Path**: No clear strategy to replace legacy hooks

#### Implementation Required
- Fix import paths to point to actual file locations
- Create migration plan for legacy hooks
- Update documentation to reflect reality
- Implement unified hooks to replace legacy ones

#### Estimated Effort: **Medium** (1-2 days)

---

### 8. Legacy Crypto Functions

**File**: `packages/common/core/libraries/crypto.ts`  
**Impact**: **MEDIUM** - Security and compatibility concerns  
**Legacy Functions**: 1 major function

#### Current State
- `decryptDataLegacy()` function for backward compatibility
- Complex legacy format handling (Base64URL, nonce structure)
- Extensive logging for debugging legacy issues
- No clear deprecation timeline

#### Legacy Function Found
```typescript
// Line 147: Legacy decryption function for backward compatibility
export function decryptDataLegacy(symmetricKey: string, encryptedData: string): string {
  // Complex legacy format handling:
  // - Base64URL encoding (not standard Base64)
  // - nonce(12) | ciphertext | mac(16) structure
  // - Combined ciphertext+mac for @stablelib
}
```

#### Issues Identified
1. **Security Risk**: Legacy crypto may have vulnerabilities
2. **Maintenance Burden**: Complex format handling
3. **Performance Impact**: Extensive logging in production
4. **No Migration Strategy**: No plan to phase out legacy format

#### Implementation Required
- Audit legacy crypto for security issues
- Create migration strategy for legacy data
- Implement data format conversion
- Add deprecation warnings
- Plan timeline for legacy support removal

#### Estimated Effort: **High** (2-3 days)

---

### 9. Legacy Background Script Functions

**File**: `packages/extension/background.ts`  
**Impact**: **LOW** - Backward compatibility maintenance  
**Legacy Functions**: 2 functions

#### Current State
- `isAutofillAvailable()` marked as legacy for backward compatibility
- `isSaveCredentialAvailable()` legacy function
- Functions still used but superseded by new capabilities system

#### Legacy Functions Found
```typescript
// Line 67: Legacy functions for backward compatibility
const isAutofillAvailable = async (): Promise<boolean> => {
  // Superseded by checkPageCapabilities()
};

const isSaveCredentialAvailable = async (): Promise<boolean> => {
  // Superseded by checkPageCapabilities()
};
```

#### Issues Identified
1. **Code Duplication**: Legacy functions duplicate new capability checks
2. **Maintenance Overhead**: Two systems for same functionality
3. **Confusion**: Developers unsure which to use

#### Implementation Required
- Add deprecation warnings to legacy functions
- Update all callers to use new capabilities system
- Remove legacy functions after migration
- Update documentation

#### Estimated Effort: **Low** (4 hours)

---

## 🟢 Architectural Refactoring (Low Priority)

### 5. Crypto Adapter Abstraction

**Files**: Multiple service files  
**TODOs**: 3 occurrences  
**Impact**: **LOW** - Architectural improvement, no user impact

#### Current State
- Services directly import crypto libraries
- Violates 3-layer architecture principle
- Should use adapters for external dependencies

#### TODOs Found
```typescript
// cryptoService.ts line 20: TODO: Create a crypto adapter to abstract this dependency
// secretsService.ts line 105: TODO: Create a crypto adapter to abstract this dependency  
// formTransformationService.ts line 18: TODO: Create a crypto adapter to abstract this dependency
```

#### Implementation Required
- Create crypto adapter interface
- Move crypto library calls to adapter
- Update services to use adapter
- Maintain same functionality

#### Estimated Effort: **Medium** (1-2 days)

---

### 6. Type Handling Improvements

**File**: `packages/common/utils/homePage.ts`  
**TODOs**: 1 occurrence  
**Impact**: **LOW** - Edge case handling

#### TODO Found
```typescript
// Line 25: TODO: handle other item types or log a warning
```

#### Implementation Required
- Add handling for unknown item types
- Add warning logging
- Improve type safety

#### Estimated Effort: **Low** (30 minutes)

---

## 📊 Implementation Roadmap

### Phase 1: Critical Features (Week 1)
1. **Bank Card Edit Navigation** (30 min) - Quick win
2. **Autofill Injection Service** (3-4 days) - Core functionality
3. **Context Menu Integration** (2-3 days) - User experience

### Phase 2: Legacy Code Cleanup (Week 2)
4. **Legacy Hooks Architecture** (1-2 days) - Fix broken imports and migration
5. **Legacy Crypto Functions** (2-3 days) - Security audit and migration strategy
6. **Legacy Background Functions** (4 hours) - Remove deprecated functions

### Phase 3: UX Improvements (Week 3)
7. **Loading/Error States** (1 day) - Better feedback
8. **Type Handling** (30 min) - Edge cases

### Phase 4: Architecture (Week 4)
9. **Crypto Adapter** (1-2 days) - Code quality

---

## 🎯 Quick Wins (Can be done immediately)

### Bank Card Edit Navigation
**Effort**: 30 minutes  
**Impact**: High user value  
**Files to modify**: 
- `packages/common/hooks/useBankCardDetails.ts`
- Parent component using the hook

### Legacy Background Functions
**Effort**: 4 hours  
**Impact**: Remove technical debt  
**Files to modify**: 
- `packages/extension/background.ts`
- Update all callers to use new capabilities system

### Type Handling
**Effort**: 30 minutes  
**Impact**: Better error handling  
**Files to modify**: 
- `packages/common/utils/homePage.ts`

---

## 🚀 Recommended Next Steps

1. **Start with Bank Card Edit** - Immediate user value
2. **Fix Legacy Hooks Architecture** - Critical for development workflow
3. **Implement Autofill Injection** - Core password manager feature
4. **Legacy Crypto Security Audit** - Security and data migration
5. **Context Menu Integration** - Complete the user experience
6. **Legacy Background Functions Cleanup** - Remove technical debt
7. **Add Loading/Error States** - Better UX
8. **Crypto Adapter Refactoring** - Long-term code quality

---

## 📈 Success Metrics

### Phase 1 Completion
- ✅ All bank cards can be edited from details page
- ✅ Autofill works on real websites
- ✅ Context menu provides full functionality

### Phase 2 Completion (Legacy Cleanup)
- ✅ Legacy hooks import paths fixed
- ✅ Migration strategy for legacy hooks implemented
- ✅ Legacy crypto functions audited and secured
- ✅ Legacy background functions removed
- ✅ Documentation updated to reflect reality

### Phase 3 Completion (UX Improvements)
- ✅ Loading states visible during operations
- ✅ Error messages shown to users
- ✅ Manual refresh available

### Phase 4 Completion (Architecture)
- ✅ Clean 3-layer architecture
- ✅ All external dependencies abstracted
- ✅ Improved code maintainability

---

## 🔧 Development Notes

### Testing Strategy
- Each feature should have unit tests
- Autofill injection needs E2E tests with real websites
- Context menu needs extension environment testing

### Security Considerations
- Autofill injection must validate form fields
- Content script communication must be secure
- No sensitive data in console logs
- **Legacy crypto functions must be audited for vulnerabilities**
- **Legacy data migration must preserve security guarantees**

### Performance Considerations
- Loading states should be responsive
- Autofill should be fast (< 100ms)
- Context menu should not block UI

---

© 2025 SimpliPass - Comprehensive TODO Analysis
