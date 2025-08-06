
# Chrome Extension Web Features: Analysis and Development Plan

## Overview

This document outlines the key features offered by major password manager Chrome extensions (e.g. Dashlane, Proton Pass, Bitwarden, 1Password, LastPass), explains how these features work internally, describes their architectural roles (popup, background, content scripts), and provides a best-practice development roadmap for implementing them in SimpliPass (Phase 1: Credentials only).

---

## 🔐 Key Web Features in Password Manager Extensions

**1. Autofill for Login Forms**
- Detects login fields on a webpage and displays inline suggestions.
- One-click to fill in username and password.
- Often includes inline icons with dropdown menus or autofill buttons.

**2. Autofill for Forms and Payments (Phase 2)**
- Fills personal details (name, address, email, etc.) and payment information (cards).
- Triggered on typical form field types (e.g., name, address, phone, etc.)

**3. Password Generation**
- Suggests secure passwords on signup or password change forms.
- Dropdowns integrated in new password fields to "use suggested password".

**4. Capture New Logins**
- Detects login form submission with credentials not already in vault.
- Suggests saving them in a popup or embedded banner in the page.

**5. Update Existing Logins**
- Detects password changes and offers to update stored credentials.
- Smart diffing between existing and newly typed credentials.

**6. Context Menu Actions & Manual Copy**
- Right-click actions to fill/copy credentials manually.
- “Copy-paste popup” appears after copying to suggest the rest of the credentials.

**7. Vault Lock/Unlock Integration**
- Requires unlocking before autofilling.
- Lock after inactivity or browser restart.

---

## ⚙️ Architecture & Logic Behind the Features

**Content Scripts**
- Injected into all web pages to detect forms and listen to user interaction.
- Cannot access vault directly — must communicate via `chrome.runtime.sendMessage`.

**Background (Service Worker)**
- Central controller of the extension.
- Holds decrypted vault in memory after unlocking.
- Handles all secure operations and vault access.

**Popup UI**
- React interface (already built in SimpliPass) used for viewing and managing credentials.
- Used for unlock flow, manual vault interaction, and fallback flows.

**Communication Flow**
- Content Script ↔ Background ↔ Popup.
- Background owns the decrypted vault and serves requests from other parts.

**Credential Flow**
1. Content script detects a login form.
2. Sends `getCredentialsForDomain` to background.
3. Background filters credentials from in-memory store or Zustand.
4. Content script displays inline suggestion.
5. On user selection, sends `getCredentialDetail`.
6. Background sends login/password pair back.
7. Content script inserts data into the fields and optionally submits form.

**Capture Flow**
1. Content script listens to form submissions.
2. On submission, sends captured credentials to background.
3. Background compares to known credentials.
4. If new or updated, sends message to display save/update banner.
5. If confirmed, calls existing services to encrypt and store credentials.

---

## 🔒 Security Best Practices

**Vault Management**
- Vault remains encrypted in `chrome.storage.local`.
- Decrypted credentials exist only in memory.
- Clear decrypted data from memory after lock or timeout.

**Form Detection Isolation**
- Use Shadow DOM or iframe when injecting suggestion UIs.
- Never expose credentials directly in DOM.

**Iframe and Subdomain Restrictions**
- Do not autofill into cross-origin iframes.
- Only match base domain (eTLD+1), not subdomains unless user-enabled.

**Unlock Requirements**
- Never autofill if vault is locked.
- Require master password or biometrics based on config.

**Safe Messaging**
- Validate all messages in `chrome.runtime.onMessage`.
- Do not respond to suspicious or malformed requests.

---

## 📈 Development Plan – Phase 1 (Credentials)

### Step 1: Setup Manifest & Structure
- Configure `manifest.json` with content scripts, background, permissions.
- Create `background.js`, `contentScript.js`, and validate injection works.

### Step 2: Detect Login Fields
- Parse DOM for `<input type="password">` and surrounding username fields.
- Insert inline icon or UI placeholder in detected fields.

### Step 3: Message Background for Matching Credentials
- On field interaction, content script sends domain to background.
- Background filters decrypted vault (Zustand, memory, or localStorage).
- Return matching credentials list (without password).

### Step 4: Show Inline Suggestions
- Display dropdown or tooltip below the login field.
- On selection, send request for specific credential detail (password).

### Step 5: Autofill Fields
- Insert username/password values into the DOM.
- Dispatch `input`, `change`, and optionally `submit()`.

### Step 6: Capture Submitted Credentials
- On `submit`, content script extracts login/password.
- Sends to background for comparison.
- If new/changed, display save/update prompt.

### Step 7: Save or Update Credential
- On confirmation, background encrypts and stores via existing services.
- Update Zustand and vault cache accordingly.

### Step 8: Testing & Security Checks
- Test on common sites (Google, Facebook, Reddit, etc.).
- Prevent autofill in iframes and unverified subdomains.
- Purge memory after vault lock.

---

## ✅ Notes

- Vault logic should live in background only.
- Zustand state should be synchronized via messages.
- Credentials must never be stored or transmitted unencrypted.
- Autocomplete is only triggered on user interaction (no automatic page-load fill).
- Focus only on **Credentials** for this phase (no identities/cards).

---

© 2025 SimpliPass — Authored by Baptiste Veyrard, Assistant: GPT-4o
