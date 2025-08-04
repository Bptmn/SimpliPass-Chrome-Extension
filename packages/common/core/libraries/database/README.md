# 🗄️ Database Library

## Purpose and Role

The Database Library provides **pure provider functions** for all database operations and data persistence. This library serves as the bridge between the application's data needs and external database providers like Firebase Firestore.

### Global Application Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYERS                      │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: Hooks (UI Layer)                                │
│ Layer 2: Services (Business Logic Layer)                  │
│ Layer 3: Adapters (Provider Abstraction Layer)            │
│ Layer 4: Libraries (External Integration Layer) ← YOU ARE HERE
│ External APIs & Services                                  │
└─────────────────────────────────────────────────────────────┘
```

## Core Principles

- **Pure Functions**: Only stateless functions that interact with external APIs
- **No Business Logic**: All orchestration moved to services layer
- **No Classes**: Removed wrapper classes and complex abstractions
- **No Mock Data**: Removed all mock implementations from production code

## Library Structure

### Files and Their Purposes

**`firestore.ts`** - Firebase Firestore Integration
- **Purpose**: Handles all Firebase Firestore database operations
- **Functions**: CRUD operations, real-time listeners, database ID generation

**`index.ts`** - Function Exports
- **Purpose**: Provides clean interface for all database functions
- **Functions**: Centralized exports for easy importing

**`mock_database.ts`** - Mock Implementation
- **Purpose**: Provides mock implementations for testing and development
- **Functions**: Mock CRUD operations, mock listeners, mock error scenarios

## Database Operations

### Core Functions
- **Document Operations**: Create, read, update, delete documents
- **Real-time Listeners**: Listen to document and collection changes
- **Utility Functions**: ID generation, connection management, error conversion

### Wrapper Functions
For adapter compatibility, wrapper functions handle:
- **Firestore Instance Management**: Get instance from auth library
- **Business Logic Integration**: Handle complex listener state management

## Security Architecture

### Data Encryption Strategy
- **Encrypted Storage**: All sensitive data encrypted before storage
- **Key Management**: Encryption keys managed through platform adapters
- **No Decrypted Persistence**: No decrypted data ever persisted to database
- **Memory Security**: All decrypted data is ephemeral

### Access Control
- **Firebase Security Rules**: Server-side security rules enforce access control
- **User-Based Isolation**: Data isolated by user ID
- **Real-time Security**: Security rules enforced in real-time
- **Audit Logging**: All database operations logged for security auditing

## Integration with Other Layers

### Libraries → Services
Services consume the database library for business logic:
- **Data Orchestration**: Services coordinate multiple database operations
- **Business Logic**: Services implement business rules around data operations
- **Error Handling**: Services handle business-specific error scenarios
- **State Management**: Services manage application state based on database results

### Libraries → External APIs
The database library handles external API interactions:
- **Firebase Firestore**: Document operations, real-time listeners, security rules
- **Error Handling**: Converts Firebase-specific errors into consistent error types
- **Connection Management**: Handles Firebase connection initialization and management

## Platform Considerations

### Cross-Platform Compatibility

**Mobile Platform**:
- **Offline Support**: Handles offline data operations gracefully
- **Network Handling**: Manages network connectivity issues
- **Background Sync**: Supports background data synchronization
- **Storage Optimization**: Optimizes storage usage for mobile devices

**Extension Platform**:
- **Browser Integration**: Leverages browser-specific storage capabilities
- **Tab Synchronization**: Handles data synchronization across browser tabs
- **Extension APIs**: Uses Chrome extension APIs for enhanced functionality
- **Memory Management**: Optimizes memory usage for browser environments

## Development Guidelines

### Design Principles
- **Pure Functions**: Every function has a single, clear purpose
- **No State**: Libraries should not maintain internal state
- **Error Propagation**: Always propagate errors up to the calling layer
- **Type Safety**: Use TypeScript interfaces for all database operations

### Security Considerations
- Never log sensitive data
- Encrypt all data before storage
- Validate all inputs before database operations
- Handle errors without exposing sensitive information 