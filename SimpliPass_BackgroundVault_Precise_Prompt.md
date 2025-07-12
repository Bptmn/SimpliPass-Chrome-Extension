---
description: Load vault in background from encrypted storage using userSecretKey, and cleanup old sessionKey logic
globs:
alwaysApply: true
---

# 🔐 Task – Background Vault Restoration Using Persistent userSecretKey (SimpliPass Extension)

## 🧠 Context

This task builds on the previously implemented logic for **persisting the userSecretKey**, which is encrypted using a `deviceFingerprintKey` and stored securely in `chrome.storage.local`.

The `userSecretKey` is already used in the popup to decrypt individual items from Firestore, stored in Zustand-based memory states.

**⚠️ IMPORTANT**: This new vault system is **not used for the popup**.  
It is **dedicated to the background context**, to enable persistent and fast autofill functionality (via content scripts), even after browser or background restarts.

---

## ✅ Objective

Implement a secure and persistent `vaultEncrypted` system:
- Used **only in the background context**
- Automatically restored in RAM if the decrypted vault is missing
- Fully decoupled from the popup's Firestore state logic
- Backed by the already encrypted `userSecretKey`

Remove all legacy vault/sessionKey/session-based logic in background or content.

---

## ✅ Logic to Implement

### 1. Vault Restoration Logic

- [ ] Create `vaultLoader.ts` inside `packages/extension/utils/`:
  - `loadVaultIfNeeded()`:
    - If `memory.getVault()` already holds the decrypted vault → return
    - Else:
      - Load `userSecretKeyEncrypted` from `chrome.storage.local`
      - Derive `deviceFingerprintKey` from `fingerprint.ts`
      - Decrypt `userSecretKey`
      - Load `vaultEncrypted` (JSON string) from `chrome.storage.local`
      - Decrypt `vaultEncrypted` using `userSecretKey`
      - Parse JSON and store in RAM via `memory.setVault({ credentials, notes, cards })`

- [ ] Update `background.ts`:
  - On `chrome.runtime.onStartup` and `onInstalled` and message events:
    - Call `loadVaultIfNeeded()` at the top of any logic needing access
  - Ensure no logic directly reads the vault from storage anymore

- [ ] Update `autofillBridge.ts`:
  - Never access storage directly
  - Always rely on `memory.getVault()`
  - If vault is missing, trigger `await loadVaultIfNeeded()`

---

## 🧼 Cleanup Required

- [ ] Remove all logic that depends on:
  - `sessionKey`, `vaultRestoration.ts`, `getSessionCredentials()`
  - Legacy vault sync via `chrome.storage`
- [ ] Delete or refactor:
  - `core/session/` → if no longer used by background
  - Old injection or autofill utils relying on session-based logic
- [ ] Remove vault-related logic in content script that fetches from `chrome.storage`

---

## 🛡️ Security Constraints

### ✅ Must
- Load only if `userSecretKeyEncrypted` is present and not expired
- Use ChaCha20-Poly1305 for vault encryption
- Never persist the decrypted vault or userSecretKey
- Restore in RAM only
- Fail gracefully if fingerprint doesn’t match or data is corrupted

### ❌ Must NOT
- Use or reintroduce `sessionKey` for background logic
- Use localStorage, window globals, or devtools-exposed storage
- Store or cache decrypted secrets in persistent storage

---

## 🧪 Tests to Add

- [ ] Unit test: `decryptVaultWithUserSecretKey()`
- [ ] Unit test: `loadVaultIfNeeded()` triggers proper memory population
- [ ] Simulated cold-start: test content script fetch triggers vault restore
- [ ] Integration: background + content can read vault after restart

---

## ✅ Final Validation

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `npm run test`
- [ ] Manually test full reload: close browser, reopen → background restores vault automatically
- [ ] Verify content scripts and popovers receive data from background without triggering Firestore fetch

Once complete, ensure old logic is removed and this system becomes the only background vault strategy.
