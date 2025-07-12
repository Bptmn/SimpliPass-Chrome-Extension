---
description: Persistent session logic with secure userSecretKey storage (Web + Mobile)
globs:
alwaysApply: true
---

# 🔐 Task – Implement Persistent Session for SimpliPass (Web + Mobile)

## 🧠 Objective

Enable a secure persistent session across browser restarts and popup closures, by storing the `userSecretKey` locally **only if the user opts in** (e.g. “Remember me for 15 days”).

Requirements:
- On **Web**, store the `userSecretKey` **encrypted** in `chrome.storage.local` or `IndexedDB`
- On **Mobile**, store it securely in **Keychain (iOS)** or **EncryptedSharedPreferences (Android)** using Capacitor/React Native APIs
- Add logic to restore the session on startup if the encrypted key is available and valid

---

## ✅ Logic to Implement

### Step 1 – At login (with master password)
- [ ] Derive `userSecretKey` from the master password (already existing logic)
- [ ] If user chooses "Remember me" (or equivalent):
  - [ ] On Web:
    - Generate a `deviceFingerprintKey = deriveKeyFromFingerprint()` (based on stable device data)
    - Encrypt the `userSecretKey` with this key using ChaCha20-Poly1305
    - Store `{ encryptedKey, expiresAt }` in `chrome.storage.local` or IndexedDB
  - [ ] On Mobile:
    - Store the raw `userSecretKey` in secure storage (e.g. Keychain) via Capacitor or platform-native API
    - Store `expiresAt` metadata separately if needed

### Step 2 – At startup (extension or mobile app launch)
- [ ] Attempt to load encrypted `userSecretKey` if present
- [ ] Validate that `expiresAt` has not been exceeded
- [ ] On Web:
  - Rebuild the same `deviceFingerprintKey`
  - Attempt to decrypt `userSecretKey`
  - If successful: restore vault session (Firestore + memory)
  - If decryption fails: redirect to fallback unlock page
- [ ] On Mobile:
  - Load directly from secure storage (Keychain/EncryptedStorage)
  - Restore vault session

### Step 3 – Fallback unlock flow (Web only)
- [ ] If persistent key restore fails:
  - [ ] Redirect user to a `ReUnlockPage` or similar route
  - [ ] Ask for master password again
  - [ ] Derive `userSecretKey`
  - [ ] Store in memory and persist again using deviceFingerprintKey
  - [ ] Redirect to HomePage

### Step 4 – Expiration & manual logout
- [ ] If session is expired → discard stored key and require full login
- [ ] Implement a `lockSession()` that clears:
  - Web: `sessionKey`, `userSecretKey`, vault memory, and encrypted storage
  - Mobile: Keychain + memory

---

## 📦 File Structure

- `core/sessionPersistent/`
  - `storeUserSecretKeyPersistent.ts`
  - `restoreUserSecretKeyPersistent.ts`
  - `deleteUserSecretKeyPersistent.ts`
  - `fallbackUnlockFlow.tsx` or page component
  - `fingerprint.ts` – contains `generateStableFingerprintKey()`
- Update `vaultRestoration.ts` to support persistent key restore if sessionKey is missing

---

## 🔐 Security Rules

### ✅ Must do:
- Store `userSecretKey` **only if the user opted in**
- Use AEAD cipher (ChaCha20-Poly1305 or AES-GCM)
- Derive fingerprint key using stable entropy: device name, user agent, platform, screen size…
- Clear key from RAM and storage on expiration or manual lock
- Redirect to unlock flow (not crash) on fingerprint mismatch or corrupted key

### ❌ Must never:
- Never store the decrypted `userSecretKey` in `chrome.storage.local`, `localStorage` or IndexedDB
- Never expose decrypted keys in the DOM, devtools, or logs
- Never bypass expiration date unless in developer override mode

---

## 🧪 Tests to add

- [ ] Encrypt/decrypt `userSecretKey` with fingerprintKey
- [ ] Correct expiration check logic
- [ ] Session recovery on startup (browser + mobile)
- [ ] Fallback unlock flow triggers on corrupted key
- [ ] Manual unlock restores and persists the key again

---

## ✅ Final Validation

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `npm run test`

Only proceed when all checks pass. Log result in the session restoration flow for dev debugging (do not persist logs in production).
