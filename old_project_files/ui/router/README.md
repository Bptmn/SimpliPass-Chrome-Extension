# App Router Architecture

## Overview

The app router provides a clean separation between **system routing** (automatic) and **business navigation** (manual).

## Architecture Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ useAppState     │    │ useAppRouter    │    │ AppRouterView   │
│                 │    │                 │    │                 │
│ • App state     │───▶│ • System routes │───▶│ • Render pages  │
│ • Auth state    │    │ • Business nav  │    │ • Handle events │
│ • Secret key    │    │ • Route history │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## System Routing (Automatic)

System routes are determined automatically based on app state:

| State | Route | Description |
|-------|-------|-------------|
| `isInitializing: true` | `LOADING` | App is initializing |
| `user: null` | `LOGIN` | No user authenticated |
| `user: exists, userSecretKeyExist: false` | `LOCK` | User exists but no secret key |
| `user: exists, userSecretKeyExist: true` | `HOME` | User fully authenticated |

### Flow
1. `useAppState` manages app state (initialization, auth, secret key)
2. `useAppRouter` receives app state and determines system route
3. System route changes automatically when app state changes
4. No manual intervention needed

## Business Navigation (Manual)

Business navigation is for explicit user actions:

| Action | Method | Description |
|--------|--------|-------------|
| Form steps | `navigateTo(ROUTES.ADD_CREDENTIAL_1)` | Navigate to specific route |
| Item details | `navigateTo(ROUTES.CREDENTIAL_DETAILS, {id})` | Navigate with parameters |
| Lock screen | `navigateToLock('expired')` | Navigate to lock with reason |
| Go back | `goBack()` | Navigate to previous route |
| Reset | `resetToHome()` | Reset to home screen |

### Flow
1. User performs action (click, form submit, etc.)
2. Component calls business navigation method
3. Router updates route and history
4. AppRouterView renders new page

## Initialization Flow

```
1. App starts
   ↓
2. useAppInitialization starts
   • Initialize platform
   • Initialize storage  
   • Initialize auth
   • Start listeners
   ↓
3. useAppState receives callbacks
   • onInitializationStart → isInitializing: true
   • onInitializationComplete → isInitializing: false
   • onUserAuthenticated → user + secret key state
   ↓
4. useAppRouter determines system route
   • LOADING → LOGIN → LOCK → HOME
   ↓
5. AppRouterView renders appropriate page
```

## State Management

### useAppState
- **Single source of truth** for all app state
- Manages initialization, auth, and secret key state
- Provides computed states for UI consumption

### useAppRouter  
- **Receives app state** from useAppState
- **Determines system routes** automatically
- **Provides business navigation** methods
- **Manages route history** and parameters

### AppRouterView
- **Renders pages** based on current route
- **Handles user interactions** and calls business navigation
- **Passes route parameters** to pages

## Key Benefits

1. **Clear Separation**: System routing vs business navigation
2. **Predictable Flow**: Automatic system routing, manual business navigation
3. **Type Safety**: All routes use ROUTES constants
4. **History Management**: Proper back/forward navigation
5. **Parameter Support**: Route parameters for dynamic content
6. **Error Handling**: Centralized error state management

## Usage Examples

### System Routing (Automatic)
```typescript
// No manual code needed - happens automatically
// LOADING → LOGIN → LOCK → HOME
```

### Business Navigation (Manual)
```typescript
// Navigate to add credential form
router.navigateTo(ROUTES.ADD_CREDENTIAL_1);

// Navigate to item details with ID
router.navigateTo(ROUTES.CREDENTIAL_DETAILS, { id: 'item-123' });

// Navigate to lock screen with reason
router.navigateToLock('expired');

// Go back to previous route
router.goBack();

// Reset to home
router.resetToHome();
```

## Debugging

The router provides detailed logging:

```
[useAppRouter] Determining system route: { isInitializing: false, hasUser: true, hasSecretKey: false }
[useAppRouter] System route: LOCK (user secret key missing)
[useAppRouter] System route change: LOGIN → LOCK
[useAppRouter] Business navigation to: ADD_CREDENTIAL_1
```

This makes it easy to understand the routing flow and debug issues. 