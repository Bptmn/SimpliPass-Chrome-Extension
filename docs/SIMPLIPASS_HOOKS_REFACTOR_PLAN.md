# SimpliPass Hooks & Services Refactoring Plan

## 🎯 Goals

- Enforce strict separation of concerns between hooks (UI state) and services (business logic)
- Reduce hook size and complexity by splitting large hooks into focused, reusable units
- Move business logic out of hooks and utils into the services layer
- Clarify the role of utils (pure, stateless helpers only)
- Document the new structure and migration steps

---

## 1. Hooks: Best Practices

- Hooks should only manage UI state, user interaction, and call services for business logic
- One hook per feature/concern, not per UI file/component
- Hooks should be small and focused (ideally <100 lines)
- Hooks should never call adapters/libraries directly
- Hooks should not contain business logic, validation, or data transformation

---

## 2. Utils: Best Practices

- Utils should be pure, stateless, and side-effect free
- No business logic, validation, or orchestration in utils
- Utils are for formatting, parsing, and simple helpers only
- Complex logic belongs in services

---

## 3. Services: Best Practices

- All business logic, validation, and orchestration lives in services
- Services may call adapters/libraries
- Services are the only layer that can coordinate multiple lower-level functions

---

## 4. Refactoring Steps

### A. Split Large Hooks

- [x] Split `useItems.ts` into:
  - [x] `useItemsList` (list and filtering)
  - [x] `useItemSearch` (search state)
  - [x] `useItemSelection` (selection state)
  - [x] `useItemCRUD` (CRUD actions, delegates to services)
- [x] Split `useAutofill.ts` into:
  - [x] `useAutofillSuggestions`
  - [x] `useAutofillInjection`
  - [x] `useAutofillState`

### B. Move Business Logic to Services

- [x] Move all validation logic from `utils/validation.utils.ts` to `core/services/validationService.ts`
- [x] Move all crypto logic from `utils/crypto.ts` to `core/libraries/crypto.ts`
- [x] Move card-related business logic from `utils/cards.ts` to `core/services/cardService.ts`
- [x] Keep only pure helpers in `utils/`

### C. Create Focused Hook Categories

- [x] Organize hooks into:
  - [x] `hooks/core/` (app state, auth, initialization)
  - [x] `hooks/forms/` (form state, validation)
  - [x] `hooks/operations/` (CRUD, business operations)
  - [x] `hooks/ui/` (UI behaviors: clipboard, password visibility)
  - [x] `hooks/formatting/` (formatting helpers)

### D. Update Imports and Documentation

- [x] Update all imports to use new hook/service locations
- [x] Update README files to reflect new structure and best practices

---

## 5. Migration Example

Before:
```ts
// In a hook
const validate = (value) => { /* complex logic */ }
```

After:
```ts
// In a hook
const { validateField } = useFormValidation(validationService);
```

---

## 6. Follow-up Tasks

- [x] Refactor all usages in UI/pages/components to use new hooks/services
- [x] Remove any remaining business logic from hooks
- [x] Ensure all tests pass and update/add tests as needed

---

## ✅ REFACTORING COMPLETED

All major refactoring goals have been achieved:

1. Strict Separation of Concerns: Hooks now only manage UI state, services handle business logic
2. Reduced Hook Complexity: Large hooks split into focused, reusable units
3. Business Logic Migration: All business logic moved from hooks/utils to services
4. Organized Structure: Hooks organized into logical categories
5. Updated Documentation: README files reflect new architecture
6. Build Success: All imports updated and build passes successfully

Note: Linting shows some warnings about unused variables and TypeScript `any` types, but these are not critical for the refactoring goals and can be addressed in future iterations.

---

This plan will be tracked and updated as the refactor progresses.