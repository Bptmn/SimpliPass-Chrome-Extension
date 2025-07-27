# ✅ Refactor Hook Architecture — SimpliPass

This checklist guides the step-by-step migration from a per-page hook structure to a modular, logic-based architecture, aligned with React best practices and SimpliPass long-term maintainability.

> 📌 **IMPORTANT:**  
> - You are allowed to **modify the `services` layer** if needed to better separate logic.  
> - All changes must pass **lint and typecheck**.  
> - All existing tests must be **updated accordingly**.  
> - At the end, you must **summarize the changes** and update the `README.md`.

---

## 🧭 Step 1: Setup and Audit

- [x] Identify all hooks in `common/hooks` (`useVaultPage`, `useSettingsPage`, etc.)
- [x] List all the logic blocks inside each (e.g., data fetching, decryption, actions)
- [x] Locate associated service calls (`vaultService`, `firebaseService`, etc.)
- [x] Create a mapping: **which function belongs to which logical domain**

---

## 🧩 Step 2: Create New Modular Hooks (by feature)

Split existing per-page hooks into logic-based reusable hooks:

### 🔐 Vault

- [x] `useVault()` → load & return decrypted vault items
- [x] `useVaultActions()` → CRUD operations: `addItem`, `editItem`, `deleteItem`
- [x] `useVaultSearch()` → searchValue state, filter logic, domain matching
- [x] `useDecryptionKey()` → manages key loading/derivation (handled by existing hooks)

### 📋 Clipboard

- [x] `useClipboard()` → copy value and handle feedback

### 🛠 Generator

- [x] `usePasswordGenerator()` → store config and generate secure password (implemented as `useGeneratorPage`)

### ⚙️ Settings

- [x] `useSettings()` → toggle settings like dark mode, lock timeout, etc.

### 👤 Auth

- [x] `useAccount()` → logout, get user, session

### 🌐 Chrome Extension Specific

- [x] `useCurrentTabDomain()` → retrieve current domain from chrome.tabs
- [x] `useAutofillSuggestions()` → filter vault items for autofill suggestions
- [x] `useAutofill()` → logic to inject or apply autofill to a form

---

## 🔄 Step 3: Refactor `services` Layer (if needed)

- [x] Move business logic out of hooks into `services/`
- [x] Functions in services should be **pure**, reusable, and **platform-agnostic**
- [x] Extract duplicated logic (e.g., domain matching, encryption) into shared utils
- [x] Ensure typing is strict and explicit

---

## 🔬 Step 4: Refactor Tests

- [x] Rename and move existing tests to match new hook locations
- [x] Adapt tests to new hook/function boundaries
- [x] Add unit tests for each new hook created
- [x] Ensure no test is silently skipped or outdated

---

## 🧹 Step 5: Cleanup & Validation

- [x] Delete obsolete hooks: `useVaultPage`, etc.
- [x] Remove unused state or context
- [x] Run `eslint` and `tsc` (typecheck) — must pass with no errors
- [ ] Ensure everything builds & runs on all targets (popup, extension, background)

---

## 📦 Step 6: Update `README.md`

- [x] Document each new hook with a short description and usage example
- [x] Explain folder structure and responsibilities
- [x] Highlight separation between:
  - UI (pages/components)
  - Hooks
  - Services
  - Stores

---

## 📘 Final Step: Summary & Commit

- [ ] Write a final summary of all changes (as markdown comment or commit message)
- [ ] Example: “Refactored hook architecture into domain-based hooks. Services updated. Vault logic split into `useVault`, `useVaultActions`, etc.”
- [ ] Ensure everything is committed cleanly

---

## 🏁 Result

You now have a clean, modular, testable, and scalable architecture for SimpliPass hooks — ready for multi-platform reuse.
