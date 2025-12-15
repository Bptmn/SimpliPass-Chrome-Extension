# 🏗️ Architecture & Règles Techniques

## 📚 Références

- **Workflow complet** : [`workflow.md`](workflow.md)
- **Stratégie tests** : [`testing.md`](testing.md)
- **Tests manuels** : [`manual-testing-guide.md`](manual-testing-guide.md)
- **Plan développement** : [`features.md`](features.md)

---

## 🎯 Vue d'ensemble

Le projet suit une **architecture stricte en 3 couches** avec un principe **Provider-Agnostic** pour garantir :
- La **sécurité** (zero-knowledge, chiffrement local)
- La **testabilité** (services mockables, adapters interchangeables)
- La **flexibilité** (changer de provider sans réécrire le code métier)

---

## 🔌 Principe Provider-Agnostic (CRITIQUE)

Le code métier (Services) ne doit JAMAIS dépendre directement d'un provider spécifique (Firebase, Cognito, etc.).

### Architecture des Adapters

```
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 2: SERVICES                           │
│   (Business Logic - Provider Agnostic)                          │
│   authService.ts, itemsService.ts, vaultService.ts              │
│                         ⬇️                                       │
│   Utilise des INTERFACES (IAuthAdapter, IDatabaseAdapter)       │
└─────────────────────────────────────────────────────────────────┘
                              ⬇️
┌─────────────────────────────────────────────────────────────────┐
│                     LAYER 3: ADAPTERS                           │
│   (Provider-Specific Implementation)                            │
│                                                                 │
│   ┌─────────────────┐    ┌─────────────────┐                   │
│   │  auth.adapter   │    │  database.adapter│                   │
│   │  implements     │    │  implements      │                   │
│   │  IAuthAdapter   │    │  IDatabaseAdapter│                   │
│   └────────┬────────┘    └────────┬─────────┘                   │
│            ⬇️                      ⬇️                            │
│   ┌─────────────────┐    ┌─────────────────┐                   │
│   │  Cognito +      │    │  Firestore      │                   │
│   │  Firebase Auth  │    │  (ou autre)     │                   │
│   └─────────────────┘    └─────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘
```

### Interfaces Existantes

| Interface | Fichier | Description |
|-----------|---------|-------------|
| `IAuthAdapter` | `adapters/auth.adapter.ts` | Login, MFA, Session, Listeners |
| `IDatabaseAdapter` | `adapters/database.adapter.ts` | CRUD, Listeners temps réel |
| `ICryptoAdapter` | `adapters/crypto.adapter.ts` | Chiffrement, Dérivation clés |
| `IPlatformAdapter` | `adapters/platform.adapter.ts` | APIs plateforme (Chrome, Mobile) |

### Règle d'Or

```typescript
// ❌ INTERDIT - Dépendance directe au provider
import { signInWithEmailAndPassword } from 'firebase/auth';

// ✅ CORRECT - Utiliser l'adapter
import { auth } from '@common/core/adapters';
await auth.loginToAuthProvider1(email, password);
```

### Changer de Provider

Pour changer Firebase pour MongoDB par exemple :
1. Créer `libraries/database/mongodb.ts` avec les mêmes signatures
2. Modifier `database.adapter.ts` pour pointer vers MongoDB
3. **AUCUN changement dans les Services ou l'UI**

---

## 🏗️ Les 3 Couches (Strictly Enforced)

### Layer 1: UI Components (Pure Interface)
*   **Location**: `packages/extension/ui/`, `packages/extension/popovers/`
*   **Rôle**: Affichage, State UI (via Hooks), Interactions utilisateur.
*   **Contraintes**:
    *   DOM-based (React DOM) uniquement.
    *   **NE DOIT JAMAIS** appeler directement la Layer 3 (Adapters).
    *   **NE DOIT JAMAIS** importer de code provider-specific (firebase, cognito).
    *   Utilise `Zustand` pour l'état global.
    *   Utilise `browserAPI` shim pour compatibilité Web/Extension.

### Layer 2: Services (Business Logic - Provider Agnostic)
*   **Location**: `packages/common/core/services/`
*   **Rôle**: Orchestration, Validation, Règles métier, Cryptographie.
*   **Contraintes**:
    *   Point d'entrée unique pour la Layer 1.
    *   Utilise UNIQUEMENT les **Adapters** (interfaces), jamais les libraries directement.
    *   Gère la logique de chiffrement/déchiffrement.
    *   **Code 100% réutilisable** si on change de provider.

### Layer 3: Adapters & Libraries (Infrastructure)
*   **Location**: `packages/common/core/adapters/`, `packages/common/core/libraries/`
*   **Rôle**: Implémentation spécifique aux providers.
*   **Structure**:
    ```
    adapters/
      auth.adapter.ts        # Interface IAuthAdapter + implémentation
      database.adapter.ts    # Interface IDatabaseAdapter + implémentation
      crypto.adapter.ts      # Interface ICryptoAdapter + implémentation
    libraries/
      auth/
        firebase.ts          # Implémentation Firebase Auth
        cognito.ts           # Implémentation Cognito
      database/
        firestore.ts         # Implémentation Firestore
    ```
*   **Contraintes**:
    *   Implémentation pure, sans logique métier.
    *   Chaque adapter expose une **interface** stable.
    *   Les libraries contiennent le code provider-specific.

---

## 💾 Flux de Données & Sécurité

### Pipeline de Données (Provider-Agnostic)
```
Database Provider (Encrypted) 
    ⬇️  [via IDatabaseAdapter]
Platform Storage (Encrypted Cache)
    ⬇️  [via IPlatformStorageAdapter]
Session Storage (Decrypted/RAM)
    ⬇️
Zustand Store (UI State)
```

1.  **Persistance** : Les données sensibles sont toujours chiffrées au repos.
2.  **Runtime** : Les données ne sont déchiffrées qu'en mémoire via `vaultService`.
3.  **UI** : L'interface ne lit que depuis le State Zustand.

### Contraintes de Sécurité
*   **Content Scripts** : Considérés comme non-sûrs. Communication via `postMessage` validés.
*   **Popovers** : Isolés dans des Shadow DOM ou Iframes.
*   **Zéro-Knowledge** : Le mot de passe maître ne quitte jamais le client.
*   **Chiffrement** : Utilise `ICryptoAdapter` (actuellement ChaCha20-Poly1305).

---

## 🧩 Organisation des Dossiers

```
packages/
  common/
    core/
      adapters/           # Interfaces + Implémentations (Provider-Agnostic)
        auth.adapter.ts
        database.adapter.ts
        crypto.adapter.ts
      libraries/          # Code Provider-Specific
        auth/
          firebase.ts
          cognito.ts
        database/
          firestore.ts
      services/           # Business Logic (Provider-Agnostic)
    types/                # Types partagés
    utils/                # Fonctions utilitaires pures
  extension/
    ui/                   # Composants React & Pages
    popovers/             # UI Content Script
    adapters/             # Adapters spécifiques extension (Chrome APIs)
    services/             # Services spécifiques extension
    shims/                # Abstractions (BrowserAPI) pour mode Web
```

---

## ⚠️ Règles pour l'IA

1.  **Provider-Agnostic** : Ne JAMAIS importer directement `firebase/*` ou `amazon-cognito-*` dans les Services.
2.  **Utiliser les Adapters** : Toujours passer par `@common/core/adapters`.
3.  **Interfaces First** : Si un nouveau provider est nécessaire, définir l'interface d'abord.
4.  **Modification UI** : Toujours vérifier le rendu en `npm run dev:web`.
5.  **Nouvelle Feature** : Créer le Service avant l'UI.
6.  **Refactoring** : Ne jamais briser l'isolation des couches.
7.  **Imports** : Utiliser les alias `@common` et `@extension`.

---

## 🔄 Exemple : Ajouter un nouveau provider

**Objectif** : Remplacer Firestore par Supabase

1. **Créer la library** : `libraries/database/supabase.ts`
   ```typescript
   export const getCollectionWrapper = async (path: string) => {
     // Implémentation Supabase
   };
   ```

2. **Modifier l'adapter** : `adapters/database.adapter.ts`
   ```typescript
   import * as supabaseDb from '../libraries/database/supabase';
   
   export const db: IDatabaseAdapter = {
     getCollection: supabaseDb.getCollectionWrapper,
     // ...
   };
   ```

3. **Aucun changement** dans :
   - `services/itemsService.ts`
   - `services/vaultService.ts`
   - `ui/pages/HomePage.tsx`
   - Etc.
