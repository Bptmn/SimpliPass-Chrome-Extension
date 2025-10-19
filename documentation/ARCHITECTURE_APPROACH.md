# SimpliPass - Architecture Approach

## 📋 Table of Contents

- [🔐 Authentication Approach](#-authentication-approach)
  - [Multi-Provider Strategy](#multi-provider-strategy)
  - [Authentication Flow Sequence](#authentication-flow-sequence)
  - [Why Dual-Provider Authentication?](#why-dual-provider-authentication)
- [🔒 Encryption/Decryption Approach](#-encryptiondecryption-approach)
  - [Zero-Knowledge Architecture](#zero-knowledge-architecture)
  - [Key Derivation Strategy](#key-derivation-strategy)
  - [Layered Encryption Model](#layered-encryption-model)
  - [Encryption Flow](#encryption-flow)
  - [Security Guarantees](#security-guarantees)
- [💾 Data Storage Approach](#-data-storage-approach)
  - [Three-Tier Storage Pipeline](#three-tier-storage-pipeline)
  - [Data Flow Patterns](#data-flow-patterns)
  - [Data Consistency Strategy](#data-consistency-strategy)
- [🔄 Real-Time Synchronization](#-real-time-synchronization)
- [📊 Benefits of This Approach](#-benefits-of-this-approach)
- [💡 Recommendations](#-recommendations)
  - [Current Architecture Assessment](#current-architecture-assessment)
  - [Areas for Enhancement](#areas-for-enhancement)
  - [Comparison with Industry Leaders](#comparison-with-industry-leaders)
  - [Implementation Roadmap](#implementation-roadmap)

---

## 🎯 Overview

This document describes the core architectural approaches used in SimpliPass for authentication, encryption/decryption, and data storage. The architecture follows a **security-first, zero-knowledge approach** where no decrypted sensitive data is ever persisted, and all operations follow strict layer separation principles.

---

## 🔐 Authentication Approach

### Multi-Provider Strategy

SimpliPass uses a **dual-provider authentication system** combining AWS Cognito and Firebase Authentication to provide both secure authentication and real-time state management.

#### Primary Authentication Provider: AWS Cognito

**Purpose**: Handles the initial user authentication and identity verification.

**Responsibilities**:
- User login with email and password
- Multi-Factor Authentication (MFA) management
- User attribute storage (including cryptographic salt)
- Token generation and validation
- Session management

**Flow**:
1. User provides credentials (email + password)
2. Cognito validates credentials
3. If MFA is enabled, Cognito challenges the user
4. Upon successful authentication, Cognito generates tokens
5. Cognito ID token contains a custom Firebase token in its claims

#### Secondary Authentication Provider: Firebase

**Purpose**: Manages real-time authentication state and provides access to Firestore database.

**Responsibilities**:
- Real-time authentication state monitoring
- Database access control via security rules
- Cross-tab/cross-context authentication synchronization
- Authentication persistence across browser sessions

**Flow**:
1. Firebase custom token is extracted from Cognito ID token
2. User signs in to Firebase using the custom token
3. Firebase auth state is now active
4. Real-time listeners monitor authentication changes
5. Database security rules enforce user-based data isolation

### Authentication Flow Sequence

**Initial Login**:
1. Sign out from all providers (clean slate)
2. Derive and store user secret key from password
3. Authenticate with Cognito (may require MFA)
4. Extract Firebase token from Cognito ID token
5. Sign in to Firebase with custom token
6. Start real-time authentication listeners
7. Load user data and initialize application state

**MFA Confirmation**:
1. User enters MFA code
2. Cognito validates and confirms MFA
3. Session is established in Cognito
4. Firebase token is retrieved
5. Complete Firebase authentication
6. Application proceeds with normal flow

**Session Persistence**:
- Firebase maintains authentication state across browser sessions
- Cognito tokens are refreshed automatically
- Authentication listeners detect state changes in real-time
- User remains authenticated until explicit logout

### Why Dual-Provider Authentication?

**Cognito Benefits**:
- Enterprise-grade user management
- Built-in MFA support
- Custom user attributes (salt storage)
- AWS ecosystem integration

**Firebase Benefits**:
- Real-time state synchronization
- Seamless Firestore integration
- Simple security rules
- Excellent browser extension support

---

## 🔒 Encryption/Decryption Approach

### Zero-Knowledge Architecture

SimpliPass follows a **zero-knowledge encryption model** where the server (Firestore) never has access to decrypted data. All encryption and decryption operations happen exclusively on the client side.

### Key Derivation Strategy

**User Master Key Derivation**:
- User password is NEVER stored or transmitted in plain text
- User-specific salt is retrieved from Cognito user attributes
- Master key is derived using PBKDF2 algorithm with password + salt
- Derived key is stored only in Chrome Session Storage (ephemeral)
- Key is deleted immediately upon logout

**Purpose**: The master key serves as the root of trust for all encryption operations while ensuring the server never sees the password or derived key.

### Layered Encryption Model

SimpliPass uses a **three-layer encryption approach** for maximum security and flexibility:

#### Layer 1: User Secret Key
- Derived from user password + salt
- Exists only in memory and session storage
- Used to encrypt/decrypt item keys
- Never persisted in any permanent storage

#### Layer 2: Item Key
- Unique encryption key generated for each item
- Encrypted with the user secret key
- Stored encrypted in Firestore
- Allows individual item re-encryption without password

#### Layer 3: Item Content
- Actual sensitive data (credentials, cards, notes)
- Encrypted with the item key
- Stored encrypted in Firestore
- JSON structure containing all item fields

### Encryption Flow

**Adding New Item**:
1. Generate unique item key using cryptographic random
2. Serialize item content to JSON string
3. Encrypt JSON content with item key
4. Encrypt item key with user secret key
5. Store both encrypted values in Firestore
6. Store decrypted version in Chrome Session Storage
7. Update Zustand state with decrypted item

**Retrieving Items**:
1. Fetch encrypted items from Firestore
2. Decrypt item key using user secret key
3. Decrypt item content using decrypted item key
4. Parse JSON to reconstruct item object
5. Store decrypted items in Chrome Session Storage
6. Hydrate Zustand state with decrypted items

**Updating Item**:
1. Modify decrypted item in memory
2. Re-encrypt content with existing item key
3. Re-encrypt item key with user secret key
4. Update Firestore with new encrypted values
5. Update Chrome Session Storage
6. Update Zustand state

### Security Guarantees

**No Decrypted Data Persistence**:
- Decrypted data exists only in RAM and Chrome Session Storage
- Session storage is cleared on browser close
- All persistent storage (Firestore) contains only encrypted data
- Server has zero knowledge of actual content

**Key Rotation Capability**:
- Item keys allow re-encryption without user password
- Master key change requires re-encrypting all item keys
- Individual items can be re-keyed independently

**Forward Secrecy**:
- Each item has its own encryption key
- Compromise of one item key doesn't affect others
- Master key compromise requires password change

---

## 💾 Data Storage Approach

### Three-Tier Storage Pipeline

SimpliPass enforces a **mandatory data flow pipeline** for all item storage operations:

```
Firestore (encrypted) → Chrome Session Storage (decrypted) → Zustand State (in-memory)
```

This pipeline ensures data consistency, performance, and security across all application contexts.

### Tier 1: Firestore (Persistent Encrypted Storage)

**Purpose**: Single source of truth for encrypted user data.

**Storage Model**:
- User documents stored at path: `users/{userId}`
- Item documents stored at path: `users/{userId}/my_items/{itemId}`
- All sensitive data stored in encrypted form
- Metadata (creation date, last used) stored unencrypted for sorting

**Real-time Synchronization**:
- Firestore listeners detect changes in real-time
- Changes propagate automatically to all active contexts
- Enables multi-device synchronization
- Handles external changes (other devices, other tabs)

**Security Rules**:
- User can only access their own data
- Authentication required for all operations
- Firebase auth token validates access
- Server-side security enforcement

### Tier 2: Chrome Session Storage (Local Cache)

**Purpose**: Secure local cache for decrypted data to avoid repeated Firestore fetches and decryption operations.

**Storage API**:
- Uses Chrome Session Storage API (chrome.storage.session)
- Data persists only during browser session
- Automatically cleared when browser closes
- Isolated per extension context

**Stored Data**:
- User secret key (ephemeral, session-only)
- User information object
- Decrypted vault (array of all items)
- Last modified timestamp

**Benefits**:
- Eliminates repeated decryption operations
- Reduces Firestore read operations (cost savings)
- Provides offline capability during session
- Maintains security through session isolation

### Tier 3: Zustand State (In-Memory UI State)

**Purpose**: Reactive state management for immediate UI updates and reactivity.

**State Structure**:
- User authentication state
- Decrypted items array
- UI-specific flags (loading, errors)
- Application preferences

**State Updates**:
- Direct updates from user actions (add, modify, delete)
- Indirect updates from Firestore listeners (external changes)
- Automatic UI re-rendering on state changes
- Optimistic updates for better UX

### Data Flow Patterns

#### Initial Load (Cold Start)

1. Check Chrome Session Storage for cached data
2. If cache exists and valid, hydrate Zustand state
3. If cache missing or invalid, fetch from Firestore
4. Decrypt items using user secret key
5. Store decrypted items in Session Storage
6. Hydrate Zustand state
7. Start real-time listeners for updates

#### Adding Item

1. User creates item in UI (Zustand state)
2. Encrypt item with user secret key
3. Store encrypted item in Firestore
4. Update Chrome Session Storage with decrypted item
5. Firestore listener detects change (external confirmation)
6. State manager updates Zustand (listener-driven)

#### External Change Detection

1. Firestore listener detects change in database
2. Check if user secret key is available
3. Fetch latest encrypted items from Firestore
4. Decrypt items with user secret key
5. Update Chrome Session Storage
6. Update Zustand state via state manager
7. UI automatically re-renders

#### Logout Flow

1. Stop all Firestore listeners
2. Clear user secret key from Session Storage
3. Clear vault from Session Storage
4. Clear user object from Session Storage
5. Reset Zustand state to initial values
6. Sign out from Firebase
7. Sign out from Cognito

### Data Consistency Strategy

**Single Direction Flow**:
- Firestore is always the source of truth
- Chrome Session Storage mirrors Firestore (decrypted)
- Zustand mirrors Chrome Session Storage (in-memory)
- Updates flow: UI → Firestore → Session Storage → Zustand

**Conflict Resolution**:
- Last-write-wins strategy for conflicts
- Firestore timestamp determines latest version
- External changes always override local state
- No optimistic locking (trade-off for simplicity)

**Cache Invalidation**:
- Session Storage invalidated on browser close
- Explicit invalidation on logout
- Automatic refresh on Firestore listener events
- Manual refresh available for user-initiated sync

---

## 🔄 Real-Time Synchronization

### Listener Architecture

**Authentication Listeners**:
- Monitor Firebase auth state changes
- Trigger user data initialization on login
- Clean up resources on logout
- Handle cross-tab authentication events

**Database Listeners**:
- Monitor Firestore collections for changes
- Automatically fetch and decrypt updated items
- Update local cache and state
- Provide real-time sync across devices

**State Manager**:
- EventEmitter-based state updates
- Decouples Firestore listeners from UI components
- Provides clean event handling
- Enables external change detection

### Change Propagation

**User Action** → Firestore → Listener → Session Storage → State → UI

**External Change** → Firestore → Listener → Session Storage → State → UI

**Result**: All contexts remain synchronized in real-time regardless of change origin.

---

## 📊 Benefits of This Approach

### Security Benefits
- True zero-knowledge architecture
- Defense in depth through layered encryption
- No persistent decrypted data
- Server-side access control enforcement

### Performance Benefits
- Reduced decryption operations via caching
- Instant UI updates with Zustand
- Minimized Firestore reads (cost savings)
- Offline capability during active session

### Development Benefits
- Clear separation of concerns
- Platform-agnostic core logic
- Easy testing with mocked adapters
- Provider flexibility (easy swapping)

### User Experience Benefits
- Fast, responsive UI
- Real-time synchronization
- Offline access during session
- Seamless cross-device sync

---

## 💡 Recommendations

### Current Architecture Assessment

The SimpliPass architecture is **solid and production-ready** for an MVP with excellent security foundations. The zero-knowledge approach, layered encryption, and dual-provider authentication demonstrate professional password manager standards.

### Strengths

**Zero-Knowledge Implementation**:
- Server never accesses decrypted data
- Three-layer encryption model matches industry leaders (1Password, Bitwarden)
- Key derivation with PBKDF2 and salt is cryptographically sound
- Forward secrecy through individual item keys

**Real-Time Synchronization**:
- Firestore provides seamless multi-device sync
- Firebase authentication handles cross-context state
- Listener architecture enables reactive updates

**Chrome Extension Design**:
- Proper use of Session Storage for ephemeral data
- Clean separation between contexts (popup, content scripts, background)
- Platform-agnostic core logic supports future mobile app

### Areas for Enhancement

#### High Priority (Security)

**1. User Secret Key Storage**

**Current Approach**: Key stored in Chrome Session Storage.

**Concern**: While Session Storage is isolated and better than Local Storage, a compromised extension could access the key.

**Recommendation**: 
- Store User Secret Key only in RAM (JavaScript variable in background service worker)
- Implement auto-lock timeout (5-15 minutes of inactivity)
- Re-prompt for master password when key is no longer in memory
- This matches behavior of enterprise password managers

**2. Offline Vault**

**Current Limitation**: If browser closes and user is offline, vault becomes inaccessible.

**Recommendation**:
- Add encrypted offline vault in `chrome.storage.local`
- Store vault encrypted with a key derived from master password
- Allow offline access by decrypting with master password
- Sync with Firestore when connection is restored
- This is standard in Bitwarden, LastPass, 1Password

**3. Manifest V3 Service Worker Lifecycle**

**Challenge**: Background service workers in Manifest V3 are ephemeral and can be unloaded at any time.

**Impact**: User Secret Key in session storage may not persist if service worker is terminated.

**Recommendation**:
- Implement robust state restoration when service worker wakes up
- Use alarms API to keep service worker alive if needed
- Handle graceful re-authentication when key is unavailable
- Test thoroughly with service worker lifecycle events

#### Medium Priority (Performance & Scalability)

**4. Firestore Cost Optimization**

**Consideration**: Firestore costs scale with reads/writes, which can become expensive with many users and frequent sync.

**Recommendation**:
- Monitor Firestore usage and costs
- Implement local caching strategies to minimize reads
- Consider batching writes when possible
- For large-scale production, evaluate migration to custom backend (AWS S3 + DynamoDB or similar)

**5. Rate Limiting & Brute Force Protection**

**Missing Protection**: No limit on decryption attempts or login attempts.

**Recommendation**:
- Implement client-side rate limiting for failed decryption attempts
- Lock vault temporarily after multiple failed attempts
- Consider server-side rate limiting for authentication
- Log failed attempts for security monitoring

#### Lower Priority (User Experience)

**6. Master Password Validation**

**Enhancement**: Provide feedback on master password strength during account creation.

**Recommendation**:
- Implement password strength meter
- Require minimum complexity (length, character types)
- Warn users about common passwords (integration with Have I Been Pwned)

**7. Vault Lock Status Indicator**

**Enhancement**: Clear visual feedback when vault is locked/unlocked.

**Recommendation**:
- Add lock icon in extension popup
- Show lock status in badge
- Provide quick lock/unlock action
- Display auto-lock countdown

### Comparison with Industry Leaders

**Bitwarden (Open Source)**:
- ✓ Similar zero-knowledge architecture
- ✓ Offline vault in local storage
- ✓ Custom backend (not Firestore)
- Your approach is comparable for core security

**1Password**:
- ✓ Similar layered encryption
- ✓ Additional "Secret Key" concept (2SKD - Two Secret Key Derivation)
- ✓ Key in RAM only with auto-lock
- Consider adopting their auto-lock approach

**LastPass**:
- ✓ Similar architecture
- ⚠️ Had breaches but zero-knowledge prevented decryption
- Demonstrates importance of client-side security even if server is compromised

### Implementation Roadmap

**Phase 1: MVP (Current)**
- ✓ Zero-knowledge encryption
- ✓ Dual-provider authentication
- ✓ Real-time sync via Firestore
- ✓ Session-based caching

**Phase 2: Production Hardening**
- Move User Secret Key to RAM only
- Implement auto-lock mechanism
- Add offline vault support
- Rate limiting and brute force protection

**Phase 3: Scale & Advanced Features**
- Firestore cost optimization or backend migration
- Hardware security key support (WebAuthn/YubiKey)
- Breach monitoring integration
- Security audit and penetration testing

### Final Assessment

**For MVP/Prototype**: ⭐⭐⭐⭐⭐ Excellent foundation

**For Production Password Manager**: ⭐⭐⭐⭐ Very good with recommended enhancements

**For Chrome Extension**: ⭐⭐⭐⭐⭐ Well-architected for browser extension constraints

The current architecture demonstrates strong security principles and clean separation of concerns. With the high-priority enhancements (RAM-only key storage and offline vault), SimpliPass would meet production-grade password manager standards.

---

© 2025 SimpliPass - Zero-Knowledge Password Manager

