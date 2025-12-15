# 🧪 Guide de Tests Manuels Automatisés par l'IA

**MÉTHODE STANDARD ET OBLIGATOIRE** : Ce guide explique comment l'IA DOIT effectuer les tests manuels de la popup en utilisant le serveur local (`npm run dev:web`) et le navigateur MCP de Cursor.

## 📚 Références

- **Workflow complet** : [`workflow.md`](workflow.md)
- **Stratégie tests** : [`testing.md`](testing.md)
- **Architecture** : [`architecture.md`](architecture.md)
- **Plan développement** : [`features.md`](features.md)

---

## 🎯 Objectif

Permettre à l'IA de :
1. **Démarrer le serveur web** (`npm run dev:web`)
2. **Tester la popup** via navigateur MCP Cursor sur `http://localhost:3000/packages/extension/popup/index.html`
3. **Voir les logs** en temps réel avec `browser_console_messages()`
4. **Corriger et itérer** jusqu'au comportement attendu (HMR recharge automatiquement)
5. **Valider automatiquement** les features de chaque phase

---

## 🛠️ Méthode Standard : Mode Web + Navigateur MCP Cursor

### ✅ Méthode Officielle pour Tests Manuels Automatisés

**Cette méthode est la méthode STANDARD et OBLIGATOIRE pour tous les tests manuels effectués par l'IA.**

Le mode web permet de tester la popup via le navigateur MCP de Cursor en naviguant vers `http://localhost:3000/packages/extension/popup/index.html`, comme un site web classique.

### Processus Complet pour l'IA

#### Étape 1 : Démarrer le Serveur Web (OBLIGATOIRE)

**L'IA DOIT TOUJOURS lancer le serveur web en premier avant d'utiliser le navigateur MCP.**

```bash
# Lancer le serveur en arrière-plan
npm run dev:web > /tmp/vite-dev-web.log 2>&1 &
```

**Vérifier que le serveur est prêt** :
```bash
# Attendre quelques secondes
sleep 5

# Vérifier que le serveur répond
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/packages/extension/popup/index.html
# Doit retourner 200

# Ou vérifier les logs
tail -20 /tmp/vite-dev-web.log | grep -E "(ready|Local:)"
# Doit afficher "Local: http://localhost:3000"
```

**⚠️ CRITIQUE** : 
- Le serveur DOIT être lancé AVANT d'utiliser le navigateur MCP
- Attendre 5-10 secondes pour que le serveur démarre complètement
- Vérifier que le serveur répond avant de continuer

#### Étape 2 : Naviguer vers la Popup avec Navigateur MCP

**URL correcte** : `http://localhost:3000/packages/extension/popup/index.html`

**Séquence d'actions MCP** :
```
1. browser_navigate({ url: 'http://localhost:3000/packages/extension/popup/index.html' })
2. browser_wait_for({ time: 3 }) // Attendre le chargement
3. browser_snapshot() // Voir l'état de la page
4. browser_console_messages() // Vérifier les logs/erreurs
```

#### Étape 3 : Tester les Interactions

**Exemples d'actions MCP** :
- `browser_click({ element: 'Email input', ref: '[data-testid="email-input"]' })` : Cliquer sur un champ
- `browser_type({ element: 'Email input', ref: '[data-testid="email-input"]', text: 'test@example.com' })` : Remplir un champ
- `browser_click({ element: 'Login button', ref: '[data-testid="login-button"]' })` : Cliquer sur un bouton
- `browser_snapshot()` : Voir l'état après interaction
- `browser_console_messages()` : Vérifier les erreurs après action

#### Étape 4 : BOUCLE D'ITÉRATION (OBLIGATOIRE)

**⚠️ CRITIQUE** : L'IA DOIT itérer automatiquement sur les erreurs jusqu'à ce que TOUTES les vérifications passent. Ne JAMAIS s'arrêter après avoir détecté des erreurs sans les corriger.

```
BOUCLE D'ITÉRATION (répéter jusqu'à ce que TOUT fonctionne) :
│
├─ Vérifier logs : browser_console_messages()
├─ Si erreurs détectées :
│  ├─ Lire TOUS les logs d'erreur en détail
│  ├─ Analyser chaque erreur (message, stack trace, contexte)
│  ├─ Identifier la cause racine
│  ├─ Corriger le code
│  ├─ Attendre 2-3 secondes pour HMR recharger
│  └─ RETOURNER au début de la boucle (re-vérifier)
│
├─ Tester features principales selon phase actuelle
├─ Si feature ne fonctionne pas :
│  ├─ Analyser pourquoi (logs, snapshot, comportement)
│  ├─ Identifier le problème
│  ├─ Corriger le code
│  ├─ Attendre 2-3 secondes pour HMR recharger
│  └─ RETOURNER au début de la boucle (re-tester)
│
└─ Si TOUT fonctionne : sortir de la boucle et continuer
```

**Actions MCP à répéter dans la boucle** :
- `browser_snapshot()` : Voir l'état actuel
- `browser_console_messages()` : Vérifier les erreurs
- `browser_click()`, `browser_type()` : Tester les interactions
- Analyser les résultats et corriger si nécessaire

#### Étape 5 : Arrêter le Serveur Web (Après les Tests)

**⚠️ IMPORTANT** : L'IA DOIT arrêter le serveur web après avoir terminé les tests.

```bash
# Tuer le processus Vite
pkill -f "vite.*vite.config.web"

# Ou trouver le PID et le tuer
lsof -ti:3000 | xargs kill -9

# Vérifier qu'il est arrêté
lsof -ti:3000 || echo "Serveur arrêté"
```

### Avantages de cette Méthode

1. **HMR (Hot Module Replacement)** : Les changements sont instantanés, pas besoin de rebuild
2. **Logs en temps réel** : Voir les erreurs directement dans la console
3. **Itération rapide** : Corriger → HMR recharge → Re-tester en quelques secondes
4. **Même code que l'extension** : Les composants et la logique sont identiques
5. **Pas besoin de rebuild** : Beaucoup plus rapide que de tester dans l'extension réelle

---

## 📁 Structure des Tests

### Dossiers de Tests

- **`packages/extension/__tests__/e2e/`** : Tests E2E existants (popup, session, vault)
- **`packages/extension/__tests__/playwright/`** : Tests Playwright pour popovers (nouveaux tests créés après validation manuelle)

### Convention de Nommage

- Tests E2E existants : `XX-feature-name.spec.ts` (ex: `04-session-vault.spec.ts`)
- Tests Playwright popover : `XX-feature-name.spec.ts` (ex: `01-password-generator-popover.spec.ts`)

### Quand Créer un Test Playwright

Créer un test Playwright automatisé **UNIQUEMENT** après :
1. ✅ Validation manuelle réussie avec MCP Playwright
2. ✅ Toutes les features testées fonctionnent
3. ✅ Itération complète terminée (aucune erreur)

**Emplacement** : `packages/extension/__tests__/playwright/XX-feature-name.spec.ts`

---

## 🛠️ Tests Popover (Content Scripts) avec MCP Playwright

**Quand l'utiliser** : tester les popovers/content scripts nécessitant l'extension réelle (non possible avec le navigateur MCP standard).

**⚠️ PROCESSUS COMPLET** : L'IA DOIT tester manuellement avec MCP Playwright, itérer jusqu'à ce que tout fonctionne, puis créer des tests Playwright automatisés pour intégrer dans la suite de tests.

### Prérequis
- Build l'extension : `npm run build:extension` (dossier `dist/` prêt).
- MCP Playwright disponible dans Cursor.
- Mode **non-headless** obligatoire (les extensions ne fonctionnent pas en headless).

### Processus
1) Charger l'extension non empaquetée  
   - Lancer Chromium via MCP Playwright avec :  
     - `--disable-extensions-except=/chemin/vers/dist`  
     - `--load-extension=/chemin/vers/dist`  
   - Contexte persistant, `headless: false`.

2) Récupérer l'ID de l'extension  
   - Lire l’URL du service worker (`context.serviceWorkers()`), extraire l’ID.

3) Ouvrir une page de test signup/login  
   - Ex. page locale `http://localhost:4000/signup` avec champs email/password/confirm.

4) Déclencher le popover  
   - Focus/click sur le champ password pour déclencher `showPasswordGeneratorPopover()` (ou équivalent).
   - Attendre un sélecteur du popover (ex. `.password-generator-popover`).

5) Vérifier et diagnostiquer  
   - Inspecter le DOM du popover (boutons générer/injecter, validations).  
   - Logs console : `page.on('console', ...)` pour capter les erreurs content script/popover.
   - Itérer : corriger le code, rebuild, relancer le contexte MCP Playwright.

#### Étape 4 : BOUCLE D'ITÉRATION (OBLIGATOIRE)

**⚠️ CRITIQUE** : L'IA DOIT itérer automatiquement jusqu'à ce que TOUTES les vérifications passent.

```
RÉPÉTER jusqu'à ce que TOUT fonctionne :
│
├─ Vérifier logs console : page.on('console', msg => console.log(msg.text()))
├─ Si erreurs détectées :
│  ├─ Lire TOUS les logs d'erreur en détail
│  ├─ Analyser chaque erreur (message, stack trace, contexte)
│  ├─ Identifier la cause racine (content script, popover, injection)
│  ├─ Corriger le code
│  ├─ Rebuild : npm run build:extension
│  ├─ Relancer Chromium avec extension (MCP Playwright)
│  └─ RETOURNER au début de la boucle (re-tester)
│
├─ Tester toutes les features du popover :
│  ├─ Génération de mot de passe
│  ├─ Injection dans le champ
│  ├─ Sauvegarde credential (si applicable)
│  ├─ Fermeture du popover
│  └─ Vérifier que tout fonctionne comme attendu
│
├─ Si feature ne fonctionne pas :
│  ├─ Analyser pourquoi (logs, snapshot, comportement)
│  ├─ Identifier le problème
│  ├─ Corriger le code
│  ├─ Rebuild : npm run build:extension
│  ├─ Relancer Chromium avec extension
│  └─ RETOURNER au début de la boucle (re-tester)
│
└─ Si TOUT fonctionne : sortir de la boucle et passer à l'Étape 5
```

#### Étape 5 : Créer Tests Playwright Automatisés (OBLIGATOIRE)

**⚠️ CRITIQUE** : Une fois les tests manuels réussis, l'IA DOIT créer des tests Playwright automatisés pour intégrer dans la suite de tests.

**Structure des tests** :
- **Emplacement** : `packages/extension/__tests__/playwright/`
- **Nommage** : `XX-feature-name.spec.ts` (XX = numéro séquentiel)
- **Format** : Utiliser la même structure que les tests existants dans `packages/extension/__tests__/e2e/`

**Template de test Playwright** :
```typescript
/**
 * Feature Name Tests
 * 
 * Tests automatisés pour [description de la feature]
 * Créé après validation manuelle avec MCP Playwright
 */

import { test, expect } from '../e2e/helpers/extensionContext';
import { openPopup, loginToExtension } from '../e2e/helpers/extensionHelpers';
import { TEST_USER_ACCOUNTS, TEST_TIMEOUTS } from '../e2e/helpers/testData';

test.describe('Feature Name', () => {
  test('should [description du comportement attendu]', async ({ context, extensionId }) => {
    // 1. Ouvrir page de test signup/login
    const page = await context.newPage();
    await page.goto('http://localhost:4000/signup', { waitUntil: 'networkidle' });
    
    // 2. Focus sur champ password pour déclencher popover
    await page.click('input[type="password"]');
    
    // 3. Attendre que le popover apparaisse
    await page.waitForSelector('.password-generator-popover', { timeout: TEST_TIMEOUTS.medium });
    
    // 4. Vérifier éléments du popover
    await expect(page.locator('[data-testid="password-generator-options"]')).toBeVisible();
    
    // 5. Tester génération
    await page.click('[data-testid="generate-password-button"]');
    const generatedPassword = await page.locator('[data-testid="generated-password"]').textContent();
    expect(generatedPassword).toBeTruthy();
    expect(generatedPassword!.length).toBeGreaterThan(8);
    
    // 6. Tester injection
    await page.click('[data-testid="inject-password-button"]');
    const passwordFieldValue = await page.inputValue('input[type="password"]');
    expect(passwordFieldValue).toBe(generatedPassword);
    
    // 7. Vérifier logs console (pas d'erreurs)
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(1000);
    const unexpectedErrors = errors.filter(e => !e.includes('DevTools'));
    expect(unexpectedErrors).toHaveLength(0);
    
    await page.close();
  });
});
```

**Processus de création** :
1. **Créer le fichier de test** dans `packages/extension/__tests__/playwright/`
2. **Utiliser la structure exacte** testée manuellement avec MCP Playwright
3. **Inclure tous les cas de test** validés manuellement
4. **Vérifier que le test passe** : exécuter via MCP Playwright ou commande npm si configuré
5. **Documenter** : Ajouter commentaire expliquant ce qui est testé

**Intégration dans la suite de tests** :
- Les tests Playwright seront automatiquement exécutés lors de `npm run test:all` (si configuré)
- Ou exécuter manuellement : `npx playwright test packages/extension/__tests__/playwright/`

### Limitations
- Pas de headless.
- Exige un dossier `dist` à jour.
- Nécessite une page avec champs password/new-password pour déclencher le popover.

---


---

## 📋 Checklist de Test pour Chaque Phase

### 🎯 Méthode Standard : Mode Web + Navigateur MCP Cursor

**MÉTHODE OBLIGATOIRE** : Pour tous les tests manuels automatisés par l'IA, utiliser le Mode Web (`npm run dev:web`) + Navigateur MCP Cursor. Cette méthode permet de tester la popup comme un site web avec HMR pour itérer rapidement.

### Phase 0 : Infrastructure

**Tests à effectuer** :
- [ ] Popup se charge sans erreur
- [ ] Console : Aucune erreur JavaScript
- [ ] Architecture : Vérifier que les imports respectent les 3 couches

**Processus avec Mode Web + Navigateur MCP Cursor** :

```bash
# 1. L'IA doit D'ABORD démarrer le serveur web
npm run dev:web > /tmp/vite-dev-web.log 2>&1 &

# 2. Vérifier que le serveur est prêt
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/packages/extension/popup/index.html
# Doit retourner 200
```

**Avec Navigateur MCP Cursor** (une fois le serveur démarré) :
```
1. Naviguer vers http://localhost:3000/packages/extension/popup/index.html
   browser_navigate({ url: 'http://localhost:3000/packages/extension/popup/index.html' })

2. Attendre le chargement
   browser_wait_for({ time: 3 })

3. Prendre un snapshot pour voir l'état
   browser_snapshot()

4. Vérifier les logs d'erreur
   browser_console_messages()
   → Si aucune erreur : ✅ Popup loaded without errors
```

---

### Phase 1 : Authentification

**Tests à effectuer** :
- [ ] Page Login s'affiche
- [ ] Formulaire email/password fonctionne
- [ ] Login avec credentials valides → HomePage
- [ ] Login avec credentials invalides → message d'erreur
- [ ] MFA flow (si applicable)
- [ ] Logout → retour LoginPage

**Processus avec Mode Web + Navigateur MCP Cursor** :

```bash
# 1. L'IA doit D'ABORD démarrer le serveur web
npm run dev:web > /tmp/vite-dev-web.log 2>&1 &

# 2. Vérifier que le serveur est prêt
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/packages/extension/popup/index.html
# Doit retourner 200
```

**Avec Navigateur MCP Cursor** (une fois le serveur démarré) :
```
1. Naviguer vers http://localhost:3000/packages/extension/popup/index.html
   browser_navigate({ url: 'http://localhost:3000/packages/extension/popup/index.html' })

2. Attendre le chargement
   browser_wait_for({ time: 3 })

3. Prendre un snapshot pour voir l'état
   browser_snapshot()

4. Remplir le formulaire
   browser_click({ element: 'Email input', ref: '[data-testid="email-input"]' })
   browser_type({
     element: 'Email input',
     ref: '[data-testid="email-input"]',
     text: 'test@example.com'
   })
   
   browser_click({ element: 'Password input', ref: '[data-testid="password-input"]' })
   browser_type({
     element: 'Password input',
     ref: '[data-testid="password-input"]',
     text: 'password123'
   })

5. Cliquer sur Login
   browser_click({
     element: 'Login button',
     ref: '[data-testid="login-button"]'
   })

6. Attendre la navigation ou le message d'erreur
   browser_wait_for({ time: 3 })

7. Vérifier l'état
   browser_snapshot()

8. Vérifier les logs
   browser_console_messages()
   → Si aucune erreur : ✅ Login successful
```

---

### Phase 2 : CRUD Items

**Tests à effectuer** :
- [ ] Liste des credentials s'affiche
- [ ] Créer un credential → apparaît dans la liste
- [ ] Modifier un credential → changements persistés
- [ ] Supprimer un credential → disparaît

**Processus avec Mode Web + Navigateur MCP Cursor** :

```bash
# 1. L'IA doit D'ABORD démarrer le serveur web
npm run dev:web > /tmp/vite-dev-web.log 2>&1 &

# 2. Vérifier que le serveur est prêt
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/packages/extension/popup/index.html
# Doit retourner 200
```

**Avec Navigateur MCP Cursor** (une fois le serveur démarré) :
```
1. Naviguer vers http://localhost:3000/packages/extension/popup/index.html (après login)
   browser_navigate({ url: 'http://localhost:3000/packages/extension/popup/index.html' })

2. Attendre le chargement
   browser_wait_for({ time: 3 })

3. Prendre un snapshot pour voir l'état
   browser_snapshot()

4. Cliquer sur "Add Credential"
   browser_click({
     element: 'Add credential button',
     ref: '[data-testid="add-credential-button"]'
   })

5. Remplir le formulaire
   browser_type({ element: 'Title input', ref: '[data-testid="title-input"]', text: 'Test Site' })
   browser_click({ element: 'Next button', ref: '[data-testid="next-button"]' })
   browser_type({ element: 'Username input', ref: '[data-testid="username-input"]', text: 'username' })
   browser_type({ element: 'Password input', ref: '[data-testid="password-input"]', text: 'password' })

6. Sauvegarder
   browser_click({ element: 'Save button', ref: '[data-testid="save-button"]' })

7. Attendre la mise à jour
   browser_wait_for({ time: 2 })

8. Vérifier que l'item apparaît dans la liste
   browser_snapshot()
   browser_console_messages()
```

---

## 🔍 Détection et Correction d'Erreurs

### Processus d'Itération

```
1. TESTER
   ↓
2. LIRE LES LOGS (browser_console_messages)
   ↓
3. IDENTIFIER L'ERREUR
   - Erreur JavaScript → Vérifier le code
   - Sélecteur non trouvé → Vérifier data-testid
   - Timeout → Vérifier le chargement
   ↓
4. CORRIGER LE CODE
   ↓
5. HMR RECHARGE AUTOMATIQUEMENT (pas besoin de rebuild en mode web)
   ↓
6. ATTENDRE 2-3 secondes pour le rechargement
   ↓
7. RE-TESTER avec browser_snapshot() et browser_console_messages()
   ↓
8. RÉPÉTER jusqu'à ce que ça fonctionne
```

### Exemple : Erreur Détectée

```typescript
// Test échoue → Lire les logs
const logs = await browser_console_messages({ level: 'error' });
// logs = [
//   "Error: Cannot read property 'login' of undefined",
//   "at LoginPage.tsx:45"
// ]

// → L'IA identifie : problème dans LoginPage.tsx ligne 45
// → L'IA corrige le code
// → HMR recharge automatiquement (pas besoin de rebuild en mode web)
// → L'IA attend 2-3 secondes puis re-teste avec browser_snapshot() et browser_console_messages()
```

---

---

## 🎯 Intégration dans le Workflow

### Dans `workflow.md` - Section Validation Inter-Phase

#### 2. Test Automatisé de la Popup (par l'IA)

**⚠️ IMPORTANT** : L'IA doit utiliser le **navigateur MCP Cursor** pour tester la popup.

```bash
# L'IA doit :
1. Démarrer le serveur web : npm run dev:web
2. Vérifier que le serveur est prêt (curl http://localhost:3000/packages/extension/popup/index.html)
3. Naviguer vers http://localhost:3000/packages/extension/popup/index.html avec navigateur MCP Cursor
4. Tester les features de la phase via browser_click, browser_type, browser_snapshot
5. Vérifier les logs console avec browser_console_messages()
6. Si erreur : corriger, HMR recharge automatiquement, re-tester
7. Itérer jusqu'à ce que tout fonctionne
```

---

## ✅ Checklist pour l'IA

Pour chaque validation de phase, l'IA doit choisir une méthode :

### Mode Web + Navigateur MCP Cursor (Méthode Unique)

**⚠️ IMPORTANT** : L'IA doit d'abord lancer le serveur web avant d'utiliser le navigateur MCP Cursor.

- [ ] **Démarrer le serveur web** : `npm run dev:web` (l'IA doit exécuter cette commande)
- [ ] **Attendre que le serveur soit prêt** (vérifier que `http://localhost:3000/packages/extension/popup/index.html` répond avec code 200)
- [ ] **Naviguer vers** : `http://localhost:3000/packages/extension/popup/index.html` avec `browser_navigate`
- [ ] **Prendre un snapshot** : `browser_snapshot()` pour voir l'état
- [ ] **Vérifier les logs** : `browser_console_messages({ level: 'error' })`
- [ ] **Tester chaque feature de la phase** avec `browser_click`, `browser_type`, etc.
- [ ] **Si erreur** : lire les logs, corriger le code (HMR recharge automatiquement), re-tester
- [ ] **Itérer** jusqu'à ce que tout fonctionne
- [ ] **Arrêter le serveur web après les tests** : `lsof -ti:3000 | xargs kill -9` (macOS/Linux)
- [ ] **Cocher les items de validation** dans `features.md`

---

## 🚨 Erreurs Communes et Solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Element not found` | Sélecteur incorrect | Vérifier `data-testid` dans le code |
| `Timeout waiting for element` | Page ne charge pas | Vérifier les logs console, corriger les erreurs JS |
| `Console errors` | Bug JavaScript | Lire les logs avec `browser_console_messages()`, corriger le code |
| `Server not responding` | Serveur web non démarré | Exécuter `npm run dev:web` avant de naviguer |
| **Navigateur Chrome se lance en boucle** | Serveur web non arrêté | Voir section "🧹 Nettoyage après les Tests" ci-dessous |

---

## 🧹 Nettoyage après les Tests

### Arrêter le Serveur Web

**Après avoir terminé les tests, l'IA doit arrêter le serveur web** pour éviter qu'il continue à consommer des ressources.

```bash
# Méthode 1 : Si le serveur tourne dans un terminal
# Appuyer sur Ctrl+C dans le terminal où npm run dev:web a été lancé

# Méthode 2 : Tuer le processus par port
# Sur macOS/Linux :
lsof -ti:3000 | xargs kill -9

# Méthode 3 : Tuer tous les processus Vite
# Sur macOS/Linux :
pkill -f "vite.*vite.config.web"

# Sur Windows :
# Ouvrir le Gestionnaire des tâches et tuer le processus Node.js/Vite
```

### Vérifier qu'aucun processus ne tourne

```bash
# Vérifier le port 3000
lsof -i:3000
# Si rien ne s'affiche, le serveur est arrêté

# Vérifier les processus Chrome/Chromium
ps aux | grep -i chrome | grep -v grep
# Si rien ne s'affiche, tous les navigateurs sont fermés
```

### Script de Nettoyage Automatique

L'IA peut créer un script temporaire pour nettoyer :

```bash
#!/bin/bash
# cleanup.sh - Nettoyer tous les processus de test

# Arrêter le serveur web
lsof -ti:3000 | xargs kill -9 2>/dev/null

echo "✅ Nettoyage terminé"
```

**Exécuter** : `chmod +x cleanup.sh && ./cleanup.sh`

---

---

## 📚 Ressources

- **Navigateur MCP Cursor** : Utiliser les outils browser disponibles dans Cursor
- **Guide complet** : Voir `documentation/ai-assistant/workflow.md` pour le processus complet

---

## 🎓 Exemple Complet : Test Phase 1 avec Navigateur MCP Cursor

**Processus pour l'IA** :

```bash
# 1. Démarrer le serveur web
npm run dev:web > /tmp/vite-dev-web.log 2>&1 &

# 2. Vérifier que le serveur est prêt
sleep 5
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/packages/extension/popup/index.html
```

**Avec Navigateur MCP Cursor** :

```
1. Naviguer vers la popup
   browser_navigate({ url: 'http://localhost:3000/packages/extension/popup/index.html' })
   browser_wait_for({ time: 3 })

2. Vérifier que LoginPage s'affiche
   browser_snapshot()
   # Vérifier la présence de [data-testid="email-input"], [data-testid="password-input"], [data-testid="login-button"]

3. Vérifier les logs (aucune erreur)
   browser_console_messages()
   # Doit retourner aucune erreur

4. Tester le login avec credentials valides
   browser_click({ element: 'Email input', ref: '[data-testid="email-input"]' })
   browser_type({ element: 'Email input', ref: '[data-testid="email-input"]', text: 'test@example.com' })
   browser_click({ element: 'Password input', ref: '[data-testid="password-input"]' })
   browser_type({ element: 'Password input', ref: '[data-testid="password-input"]', text: 'password123' })
   browser_click({ element: 'Login button', ref: '[data-testid="login-button"]' })
   browser_wait_for({ time: 3 })
   browser_snapshot()
   # Vérifier navigation vers HomePage ([data-testid="home-page"])

5. Si erreur détectée : corriger → HMR recharge → re-tester
```

**Nettoyage** :
```bash
pkill -f "vite.*vite.config.web"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
```

---

**Note** : L'IA doit utiliser ce guide pour automatiser tous les tests manuels de validation inter-phase, permettant une itération rapide et efficace.
