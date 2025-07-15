# States Management

This directory contains all state management logic using Zustand for the SimpliPass application.

## 📁 File Structure

```
states/
├── auth.state.ts      # Authentication state management
├── credentials.state.ts # Credentials state management  
├── bankCards.ts       # Bank cards state management
├── secureNotes.ts     # Secure notes state management
├── user.ts            # User state management
├── category.ts        # Category state management
├── sync.ts            # State synchronization utilities
├── index.ts           # Main exports
└── README.md          # This file
```

## 🏗️ Architecture

### State Management Principles

1. **Single Source of Truth**: All UI data comes from Zustand stores
2. **Platform Agnostic**: States work across mobile and extension platforms
3. **Secure by Design**: No decrypted data is persisted
4. **Reactive Updates**: UI automatically updates when state changes

### State Structure

Each state follows a consistent pattern:

```typescript
interface StateStore {
  // Data
  items: Item[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  
  // Complex Actions
  loadItems: () => Promise<void>;
  saveItems: () => Promise<void>;
}
```

## 🔐 Security

### Data Encryption

- **At Rest**: All sensitive data is encrypted before storage
- **In Memory**: Decrypted data exists only in RAM
- **Session Management**: User secret keys are managed via platform adapters

### Platform-Specific Storage

- **Mobile**: Uses `expo-secure-store` for encrypted storage
- **Extension**: Uses encrypted `chrome.storage.local`

## 📊 State Stores

### Authentication State (`auth.state.ts`)

Manages user authentication and session data.

```typescript
interface AuthState {
  user: User | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

**Key Features:**
- User login/logout management
- Session validation and refresh
- MFA support
- Biometric authentication integration

### Credentials State (`credentials.state.ts`)

Manages password credentials and related data.

```typescript
interface CredentialsState {
  credentials: CredentialDecrypted[];
  categories: Category[];
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
}
```

**Key Features:**
- CRUD operations for credentials
- Category and tag management
- Search and filtering
- Import/export functionality

### Bank Cards State (`bankCards.ts`)

Manages bank card information.

```typescript
interface BankCardsState {
  bankCards: BankCardDecrypted[];
  isLoading: boolean;
  error: string | null;
}
```

**Key Features:**
- Secure card number storage
- CVV protection
- Expiry date validation
- Card type detection

### Secure Notes State (`secureNotes.ts`)

Manages encrypted notes and documents.

```typescript
interface SecureNotesState {
  secureNotes: SecureNoteDecrypted[];
  isLoading: boolean;
  error: string | null;
}
```

**Key Features:**
- Rich text support
- File attachments
- Version history
- Secure sharing

### User State (`user.ts`)

Manages user profile and preferences.

```typescript
interface UserState {
  user: User | null;
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
}
```

**Key Features:**
- Profile management
- Settings persistence
- Theme preferences
- Notification settings

## 🔄 Synchronization

### Sync Utilities (`sync.ts`)

Provides utilities for synchronizing state across platforms and with backend services.

**Key Functions:**
- `syncAllStates()`: Sync all states with backend
- `clearAllStates()`: Clear all state data
- `validateStateConsistency()`: Validate state integrity

### Sync Strategy

1. **Local First**: Changes are applied locally immediately
2. **Background Sync**: Sync with backend in background
3. **Conflict Resolution**: Handle conflicts based on timestamp
4. **Offline Support**: Queue changes when offline

## 🧪 Testing

### Test Structure

Each state should have comprehensive tests:

```typescript
describe('CredentialsState', () => {
  describe('CRUD Operations', () => {
    it('should add credential', () => {});
    it('should update credential', () => {});
    it('should delete credential', () => {});
  });
  
  describe('Search & Filter', () => {
    it('should filter by category', () => {});
    it('should search by title', () => {});
  });
  
  describe('Sync Operations', () => {
    it('should sync with backend', () => {});
    it('should handle sync conflicts', () => {});
  });
});
```

### Test Best Practices

1. **Isolation**: Each test should be independent
2. **Mocking**: Mock external dependencies
3. **Coverage**: Test all state transitions
4. **Edge Cases**: Test error conditions

## 🚀 Usage

### Basic Usage

```typescript
import { useCredentialsStore } from '@core/states/credentials.state';

function CredentialsList() {
  const { credentials, isLoading, loadCredentials } = useCredentialsStore();
  
  useEffect(() => {
    loadCredentials();
  }, []);
  
  if (isLoading) return <Loading />;
  
  return (
    <View>
      {credentials.map(cred => (
        <CredentialCard key={cred.id} credential={cred} />
      ))}
    </View>
  );
}
```

### Advanced Usage

```typescript
import { useCredentialsStore } from '@core/states/credentials.state';

function CredentialManager() {
  const {
    credentials,
    addCredential,
    updateCredential,
    deleteCredential,
    syncWithBackend
  } = useCredentialsStore();
  
  const handleAdd = async (credential) => {
    await addCredential(credential);
    await syncWithBackend();
  };
  
  return (
    <View>
      <AddCredentialForm onSubmit={handleAdd} />
      <CredentialsList 
        credentials={credentials}
        onUpdate={updateCredential}
        onDelete={deleteCredential}
      />
    </View>
  );
}
```

## 🔧 Development

### Adding New States

1. Create state file following naming convention
2. Implement Zustand store with consistent interface
3. Add to `index.ts` exports
4. Write comprehensive tests
5. Update documentation

### State Migration

When updating state structure:

1. **Version State**: Add version field to state
2. **Migration Logic**: Implement migration functions
3. **Backward Compatibility**: Support old state format
4. **Testing**: Test migration scenarios

## 📚 Related Documentation

- [Platform Adapters](../adapters/) - Platform-specific implementations
- [Session Management](../logic/session.ts) - Session handling logic
- [Crypto Utilities](../utils/) - Encryption/decryption utilities
- [Testing Strategy](../../../TEST_STRATEGY.md) - Testing guidelines 