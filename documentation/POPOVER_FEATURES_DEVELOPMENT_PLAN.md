# SimpliPass Chrome Extension Popover Features Development Plan

## 🎯 Overview

This plan outlines the development of advanced popover features for the SimpliPass Chrome extension, building on the existing foundation while strictly following the three-layer architecture and security-first principles. The plan is designed for execution by Cursor via LLM, with precise technical details and clear implementation steps.

### 🏗️ Architecture Enforcement
All implementation must follow the strict 3-layer model:

- Layer 1 (Hooks): Only UI state management, never business logic or platform access
- Layer 2 (Services): All logic orchestration, validation, and service calls
- Layer 3 (Adapters/Libraries): Low-level platform operations only

Critical Constraint: Content scripts, popovers, and background listeners must NEVER call Layer 3 code directly — they must use proper services from `packages/common/core/services`.

### 💾 Data Flow Enforcement
Credential data must follow this mandatory pipeline:

```
Firestore (encrypted) → secureLocalStorage (chrome.storage.session) → Zustand state
```

All UI (popover or popup) must read state only from Zustand. If state or secureLocalStorage is empty, the service must:
1. Fetch encrypted data from Firestore
2. Decrypt it
3. Store it in secureLocalStorage
4. Hydrate Zustand
This service already exist in `@packages/common/core/services/itemServices` -> `fetchAndStoreItems` function.

### Key Features to Implement (Phase 1: Credentials Only)
Based on analysis of major password managers (Dashlane, 1Password, Bitwarden, LastPass, Proton Pass):

1. Autofill for Login Forms - Detect login fields and display inline suggestions
2. Password Generation - Suggest secure passwords on signup/change forms
3. Capture New Logins - Detect form submission and suggest saving new credentials
4. Update Existing Logins - Detect password changes and offer to update stored credentials
5. Context Menu Actions - Right-click actions for manual fill/copy operations
6. Vault Lock/Unlock Integration - Require unlocking before autofilling

### 🔒 Trust Boundaries & Security Constraints
- Content Scripts: Untrusted entry points - all data must be sanitized and validated
- Form Capture: Must route through background → services for secure storage
- Credential Operations: Must use existing services from `packages/common/core/services/`
- Vault Access: Never bypass Firestore → secureLocalStorage → Zustand pipeline

---

## 📋 Current State Analysis

### ✅ What's Already Implemented (Good Foundation)
- Basic field detection (`fieldDetection.ts`)
- Basic popover management (`popoverManager.ts`)
- Basic credential injection (`credentialInjection.ts`)
- Autofill bridge with vault integration (`autofillBridge.ts`)
- PopoverCredentialPicker React component
- Login prompt popover
- Content script with field detection and event listeners
- Basic background script message handling

### 🔧 What Needs Enhancement/Implementation
- Complete background script message handlers for autofill operations
- Password generation popovers
- Form submission detection and credential capture
- Save/update credential popovers
- Enhanced field detection for signup forms
- Better error handling and UX flows

---

## 🏗️ Architecture & Organization

### Layer 1: UI Components (packages/extension/popovers/)
```
packages/extension/popovers/
├── components/           # React popover components (UI only)
│   ├── CredentialPicker/
│   ├── PasswordGenerator/
│   ├── SaveCredential/
│   ├── UpdateCredential/
│   └── shared/          # Shared popover components
├── hooks/               # Extension-specific popover hooks (UI state only)
└── styles/              # Popover-specific styles
```

### Layer 2: Services (packages/extension/services/) -> only if specific to popovers, otherwise use the services from @packages/common/core/services
```
packages/extension/services/
├── popoverOrchestrationService.ts  # Orchestrates popover logic
├── formDetectionService.ts         # Enhanced form detection logic
├── credentialCaptureService.ts     # Form submission capture logic
└── backgroundMessagingService.ts   # Background communication logic
```

### Layer 3: Utilities (packages/extension/utils/) -> only if specific to popovers, otherwise use the utils from @packages/common/utils
```
packages/extension/utils/
├── fieldDetection.ts       # Enhanced (existing) - platform detection only
├── popoverManager.ts       # Enhanced (existing) - DOM manipulation only
├── credentialInjection.ts  # Enhanced (existing) - DOM injection only
└── formCapture.ts          # New form submission capture - DOM events only
```

### 🔗 Service Integration Requirements
All popover functionality must integrate with existing services:

- Credential Operations: Use `itemsService.ts` from `@common/core/services`
- Form Validation: Use `validationService.ts` from `@common/core/services`
- Crypto Operations: Use `cryptoService.ts` from `@common/core/services`
- Vault Management: Use `vaultService.ts` from `@common/core/services`

---

## 📈 Development Phases

... existing code ...

## ✅ Data Flow Validation Checklist

... existing code ...

© 2025 SimpliPass - Authored by Baptiste Veyrard, Assistant: GPT-4o