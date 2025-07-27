# SimpliPass Extension Popup

This directory contains the Chrome extension popup implementation for SimpliPass.

## Architecture

### Initialization Flow

The popup now follows a clear separation of concerns:

#### `index.tsx` - Entry Point
- **Purpose**: Minimal entry point that only initializes storage
- **Responsibilities**:
  - Initialize platform storage adapter
  - Render the main `PopupApp` component
- **No business logic**: Does not handle auth, data loading, or UI state

#### `PopupApp.tsx` - Main App Component
- **Purpose**: Handles only authentication persistence and user object
- **Responsibilities**:
  - Firebase auth state persistence via `onAuthStateChanged`
  - Store user object in local state
  - Route rendering based on auth state
- **No data loading**: Does not handle vault/items data or initialization logic

#### `HomePage.tsx` & `useHomePage.tsx`
- **Purpose**: Handle all vault/items data loading and refresh logic
- **Responsibilities**:
  - Fetch user and items from secure storage
  - Manage all UI state (filters, selection, etc.) locally
  - Provide refresh and filtering logic
- **No global app state**: All state is local to the HomePage and its hook

### State Management

- **Auth State**: Managed in `PopupApp.tsx` via Firebase `onAuthStateChanged`
- **User State**: Passed as prop from `PopupApp.tsx` to `HomePage`
- **Vault/Items State**: Managed in `useHomePage.tsx` and `HomePage.tsx` only
- **UI State**: Managed locally in each component/hook

### Data Flow
1. **Auth State Change** → `PopupApp.tsx` updates user state
2. **User Authenticated** → Renders `HomePage` with user prop
3. **HomePage** → Uses `useHomePage` to load vault/items from secure storage
4. **UI Update** → Renders based on loaded data

### Best Practices
- Keep `PopupApp.tsx` focused on auth and user only
- Handle all data loading and refresh in `useHomePage.tsx`
- Avoid global app initialization logic
- Use local state for UI and data

### Removed
- `appInitialization.ts` and `useAppInitialization.ts` are no longer used
- No more delay or retry logic in initialization

## Troubleshooting

- If data is missing after login, check secure storage and Firestore listeners
- If user is not persisted, check Firebase auth state listener

## Development
- Add new data logic in `useHomePage.tsx`
- Add new UI state in `HomePage.tsx` or related hooks/components
- Keep entry point and PopupApp minimal and focused 