# 🧪 Stratégie de Test

## 📚 Références

- **Tests manuels détaillés** : [`manual-testing-guide.md`](manual-testing-guide.md)
- **Workflow complet** : [`workflow.md`](workflow.md)
- **Architecture** : [`architecture.md`](architecture.md)

---

## 📊 Pyramide de Test

### 1. Tests Unitaires (Jest) - 70%
*   **Cible** : Services, Utils, Hooks, Logique pure.
*   **Commande** : `npm run test:extension`
*   **Pourquoi** : Rapide, isolés, vérifie la logique métier et les cas limites.
*   **Fichiers** : `packages/extension/**/*.test.ts`

### 2. Tests d'Intégration UI (Web Mode) - 20%
*   **Cible** : Composants React, Interactions formulaire.
*   **Outil** : Vérification manuelle via `npm run dev:web` ou Tests de composants (à venir).
*   **Sandbox** : Utiliser `packages/extension/ui/dev/Sandbox.tsx` pour tester les Popovers isolés.

### 3. Tests Navigateur (Navigateur MCP Cursor) - 10%
*   **Cible** : Tests web de la popup via navigateur MCP de Cursor.
*   **Processus** : `npm run dev:web` + navigateur MCP Cursor
*   **Pourquoi** : Permet de tester la popup comme un site web avec HMR pour itération rapide.

---

## 🌐 Tests Navigateur MCP Cursor

### Configuration
Les tests utilisent le mode web (`npm run dev:web`) et le navigateur MCP de Cursor pour tester la popup.

### Scénarios de Test

#### Phase 0 : Infrastructure
- [ ] Popup se charge sans erreur.
- [ ] Aucune erreur console.

#### Phase 1 : Authentification
- [ ] Login succès.
- [ ] Logout.
- [ ] Erreur mauvais mot de passe.

#### Phase 2 : CRUD Operations
- [ ] Création d'un Credential.
- [ ] Modification.
- [ ] Suppression.

---

## 🧪 Tests Popover (Content Scripts) avec MCP Playwright

**Usage** : valider les popovers/content scripts nécessitant l'extension réelle (non possible avec le navigateur MCP standard).

**Prérequis** :
- `npm run build:extension` (dossier `dist/` prêt)
- MCP Playwright disponible dans Cursor
- Mode **non-headless** (extensions non supportées en headless)

**Processus** :
1) Lancer Chromium via MCP Playwright avec  
   - `--disable-extensions-except=/chemin/vers/dist`  
   - `--load-extension=/chemin/vers/dist`  
   - Contexte persistant, `headless: false`
2) Récupérer l'ID via l’URL du service worker (`context.serviceWorkers()`).
3) Ouvrir une page de test signup/login (champs password/new-password).
4) Focus/click sur le champ password pour déclencher le popover, attendre un sélecteur (ex. `.password-generator-popover`).
5) Logs : `page.on('console', ...)` pour capter erreurs content script/popover ; corriger → rebuild → relancer si besoin.

**Limitations** :
- Pas de headless
- Dossier `dist` à jour requis
- Nécessite une page avec champs password pour déclencher le popover

---

## 🔍 Debugging Guide pour l'IA

Si un test échoue :

1.  **Regarder le `Error: ...`** : Souvent un timeout (sélecteur introuvable).
2.  **Regarder les `[CONSOLE]` logs** :
    *   `Error in event handler` -> Problème Background script.
    *   `Content Script: ...` -> Problème détection DOM.
    *   `Popup: ...` -> Problème UI React.

**Exemple de fix :**
*   *Erreur* : "Timeout waiting for selector .login-btn"
*   *Cause possible* : Le composant n'a pas chargé ou a crashé.
*   *Action* : Vérifier les logs console pour une erreur React "Minified React error" ou "Undefined is not a function".
