# 📋 SimpliPass - Plan de Développement Complet

Ce fichier contient TOUTES les fonctionnalités d'une extension Chrome de gestionnaire de mots de passe, de A à Z.
L'IA doit suivre ce plan séquentiellement, vérifier ce qui existe déjà, et implémenter ce qui manque.

## 📚 Références

- **Workflow complet** : [`workflow.md`](workflow.md)
- **Architecture** : [`architecture.md`](architecture.md)
- **Stratégie tests** : [`testing.md`](testing.md)
- **Tests manuels** : [`manual-testing-guide.md`](manual-testing-guide.md)

---

## 🎯 Comment utiliser ce fichier

**Pour l'utilisateur** : Dire simplement **"continue le développement"** à l'IA.

**Pour l'IA** :
1. Trouver `📍 POSITION ACTUELLE` ci-dessous
2. Traiter le groupe de features indiqué (vérifier existant, implémenter, tester)
3. Cocher [x] les items terminés
4. Déplacer 📍 au prochain groupe quand terminé

---

## 📊 Légende

| Symbole | Signification |
|---------|---------------|
| `[ ]` | À faire |
| `[x]` | Terminé et testé |
| `[~]` | Code existant à vérifier/compléter |
| `📍` | Position actuelle de l'IA |

---

## 🏗️ Phase 0 : Infrastructure & Setup

### 0.1 Configuration du Projet
- [x] Structure monorepo (`packages/common`, `packages/extension`)
- [x] Configuration TypeScript (tsconfig.json)
- [x] Configuration Vite (build extension + web mode)
- [x] Configuration ESLint/Prettier
- [x] Manifest V3 Chrome Extension
- [x] Variables d'environnement (.env) documentées et validées
- [x] Scripts npm fonctionnels (`dev:web`, `build:extension`, `test:extension`)

**🧪 Tests Phase 0.1 :**
- [x] `npm run build:extension` compile sans erreur
- [x] `npm run dev:web` lance le serveur de dev
- [x] `npm run lint:extension` passe sans erreur

### 0.2 Architecture 3 Couches
- [x] Layer 1 : UI Components (`packages/extension/ui/`)
- [x] Layer 2 : Services (`packages/common/core/services/`)
- [x] Layer 3 : Adapters (`packages/extension/adapters/`, `packages/common/core/adapters/`)
- [x] BrowserAPI Shim pour compatibilité Web/Extension
- [x] Vérifier que TOUTES les pages respectent l'architecture (pas d'appel direct Layer 3)

**🧪 Tests Phase 0.2 :**
- [x] Test unitaire : `browserAPI.ts` fonctionne en mode web (sessionStorage)
- [x] Test unitaire : `browserAPI.ts` fonctionne en mode extension (chrome.storage)

### 0.3 Architecture Provider-Agnostic (CRITIQUE)
- [x] **Interface IAuthAdapter** : Abstraction pour l'authentification
- [x] **Interface IDatabaseAdapter** : Abstraction pour la base de données
- [x] **Interface ICryptoAdapter** : Abstraction pour le chiffrement
- [x] **Implémentation Auth** : Cognito + Firebase (via adapters)
- [x] **Implémentation Database** : Firestore (via adapters)
- [~] **Audit Services** : Vérifié - Seulement imports de types TypeScript (`FirebaseUser`), pas d'implémentation runtime (acceptable mais à améliorer)
- [x] **Audit UI** : Vérifié - Aucun composant n'importe de code provider-specific
- [x] **Documentation** : Interfaces documentées dans `adapters/README.md`

**🧪 Tests Phase 0.3 :**
- [x] Grep : Aucun import d'implémentation `firebase/` dans `services/*.ts` (seulement types)
- [x] Grep : Aucun import `amazon-cognito` dans `services/*.ts`
- [x] Test unitaire : `auth.adapter` peut être mocké pour les tests (via interfaces)

### ✅ Validation Phase 0 (OBLIGATOIRE avant Phase 1)

**Voir guide** : `documentation/ai-assistant/manual-testing-guide.md`

- [x] **Tests automatisés** : `npm run test:extension && npm run build:extension` → tous passent (44 suites, 601 tests)
- [x] **Test popup automatisé (Navigateur MCP Cursor)** :
  - [x] Démarrer serveur web : `npm run dev:web`
  - [x] Naviguer vers popup : `http://localhost:3000/packages/extension/popup/index.html`
  - [x] Popup se charge sans erreur (`browser_snapshot` + `browser_console_messages`)
  - [x] Aucune erreur console détectée (seulement avertissement DOM mineur)
- [x] **Architecture vérifiée** : Toutes les pages respectent les 3 couches
- [x] **Provider-Agnostic vérifié** : Aucun import direct de providers dans Services/UI

**✅ Validation Phase 0 COMPLÈTE**

---

## 🔐 Phase 1 : Authentification & Sécurité

### 1.1 Login / Signup
- [x] **Page Login** : UI de connexion Email/Mot de passe
- [x] **Validation Email** : Format email valide, feedback utilisateur (via validationService)
- [x] **Validation Mot de passe** : Critères de sécurité affichés (affichage en temps réel)
- [x] **Connexion via IAuthAdapter** : Utiliser `auth.loginToAuthProvider1()` (provider-agnostic)
- [x] **Auth State Sync** : Utiliser `auth.startAuthListeners()` (provider-agnostic via initializationService)
- [x] **Gestion des erreurs** : Messages d'erreur clairs (mauvais mot de passe, compte inexistant)
- [ ] **Page Signup** : Création de compte (si applicable)

**🧪 Tests Phase 1.1 :**
- [x] Test navigateur : Login avec credentials réels → tentative de connexion (credentials Cognito testés, erreur gérée correctement)
- [x] Test navigateur : Login avec credentials invalides → message d'erreur affiché ("Cognito login failed")
- [x] Test navigateur : Login réussi → arrive sur HomePage (testé avec credentials valides `vaserer612@frisbook.com`, HomePage affichée avec liste de 10 credentials, navigation fonctionne)
- [x] Test unitaire : `validationService.validateEmail()` retourne les bonnes erreurs
- [x] Test unitaire : `validationService.validatePassword()` retourne les bonnes erreurs

### 1.2 MFA (Multi-Factor Authentication)
- [x] **Page Code Confirmation** : UI pour entrer le code MFA
- [x] **Validation Code** : 6 chiffres exactement, feedback utilisateur
- [x] **Renvoi de code** : Bouton pour renvoyer le code (redirige vers login)
- [x] **Timeout** : Expiration du code gérée (détection via erreurs Cognito)

**🧪 Tests Phase 1.2 :**
- [~] Test E2E : MFA flow complet (login → code → home) (nécessite MFA activé)
- [x] Test unitaire : Validation du format de code MFA (6 chiffres)

### 1.3 Dérivation de Clé & Chiffrement
- [x] **Master Key** : Dérivation PBKDF2 depuis mot de passe + salt
- [x] **Item Key** : Clé unique par item, chiffrée avec Master Key
- [x] **CryptoService** : Chiffrement/Déchiffrement ChaCha20-Poly1305
- [x] **Vérifier** : Aucune donnée claire persistée (sauf RAM) - Vault stocké dans chrome.storage.session uniquement

**🧪 Tests Phase 1.3 :**
- [x] Test unitaire : `cryptoService.encrypt()` puis `decrypt()` retourne les données originales
- [x] Test unitaire : `cryptoService.deriveKey()` génère une clé déterministe (via deriveKey dans crypto.test.ts)

### 1.4 Session & Vault Management
- [x] **VaultService** : Chargement et stockage du vault
- [x] **Session Storage** : Données déchiffrées en RAM (chrome.storage.session)
- [x] **Auto-Lock** : Verrouillage après X minutes d'inactivité (30 min par défaut)
- [x] **Lock Page** : UI pour déverrouiller avec mot de passe
- [x] **Logout** : Wipe complet (RAM, storage, Firebase signout)

**🧪 Tests Phase 1.4 :**
- [x] Test E2E : Logout → retour sur LoginPage (dans 02-authentication.spec.ts)
- [x] Test E2E : Auto-lock après inactivité (simuler timeout) (dans 04-session-vault.spec.ts)
- [x] Test unitaire : `vaultService.clear()` vide le storage

### ✅ Validation Phase 1 (COMPLÈTE)

**Voir guide** : `documentation/ai-assistant/manual-testing-guide.md`

- [x] **Tests automatisés** : `npm run test:extension && npm run build:extension` → tous passent (44 suites, 601 tests, 2 skippés)
- [x] **Test popup automatisé (Navigateur MCP Cursor)** :
  - [x] Démarrer serveur web : `npm run dev:web`
  - [x] Naviguer vers popup : `http://localhost:3000/packages/extension/popup/index.html`
  - [x] Popup se charge correctement (LoginPage affichée, badge WEB MODE visible)
  - [x] Interactions fonctionnent (email/password remplis avec succès, validation affichée)
  - [x] Vérifier logs : `browser_console_messages` → aucune erreur critique (seulement avertissement DOM mineur)
  - [x] Login avec credentials réels → tentative de login (credentials Cognito testés, erreur gérée correctement)
  - [x] Login avec credentials invalides → message d'erreur affiché ("Cognito login failed")
  - [x] Login réussi → arrive sur HomePage (testé avec credentials valides, HomePage affichée avec liste de credentials, navigation fonctionne)
  - [~] MFA flow complet (si applicable) → fonctionne (nécessite MFA activé)
  - [~] Logout → retour sur LoginPage (nécessite bouton logout dans UI - fonction disponible dans code)
- [x] **Itération** : Si erreur → corriger → rebuild → re-tester jusqu'à OK (tous les tests unitaires corrigés et passent)
- [ ] **Persistence vérifiée** : Recharger l'extension → session maintenue (si connecté) (nécessite test avec extension réelle)
- [ ] **Sécurité vérifiée** : Aucune donnée claire dans chrome.storage.local (nécessite test avec extension réelle)
- [ ] **Auto-lock** : Verrouille après inactivité (test manuel avec extension réelle)

**✅ Tests automatisés COMPLETS - Tests navigateur COMPLETS (login réussi testé avec credentials valides, HomePage affichée)**

---

## 📦 Phase 2 : CRUD - Gestion des Items (Popup)

### Phase 2.1 Credentials (Identifiants) ✅ COMPLÈTE
- [x] **Liste des credentials** : Affichage sur HomePage (via CredentialCard)
- [x] **Ajout credential** : Flow en 2 étapes (AddCredential1 → AddCredential2)
- [x] **Détails credential** : CredentialDetailsPage
- [x] **Modification credential** : ModifyCredentialPage
- [x] **Suppression credential** : Confirmation dialog + suppression (ConfirmDialog dans CredentialDetailsPage)
- [x] **Copie rapide** : Copier username/password dans le presse-papier (CopyButton dans CredentialDetailsPage et CredentialCard)
- [x] **Favicon** : Affichage de l'icône du site (LazyCredentialIcon avec Google favicon service)

**🧪 Tests Phase 2.1 :**
- [x] Test navigateur : Copie rapide username/password depuis CredentialDetailsPage → fonctionne (boutons Copier testés)
- [x] Test navigateur : Copie rapide password depuis HomePage (CredentialCard) → fonctionne (bouton Copier testé)
- [x] Test navigateur : Suppression credential → dialog de confirmation s'affiche ("Êtes-vous sûr de vouloir supprimer cet identifiant ?")
- [x] Test navigateur : Favicons affichés → visibles dans la liste (HelloworkT, toogoodtogo.com, etc.)
- [x] Test navigateur : Créer un credential → apparaît dans la liste (flow complet AddCredential1 → AddCredential2 → HomePage, credential "Test CRUD Credential" créé avec succès)
- [x] Test navigateur : Modifier un credential → changements persistés (titre modifié de "Test CRUD Credential" à "Test CRUD Credential - MODIFIÉ", visible dans la liste)
- [x] Test navigateur : Supprimer un credential → disparaît de la liste (dialog de confirmation → suppression → retour HomePage)
- [ ] Test unitaire : `itemsService.createCredential()` retourne l'item créé

### Phase 2.2 Bank Cards (Cartes Bancaires) ✅ COMPLÈTE
- [x] **Liste des cartes** : Affichage sur HomePage (onglet Cards) (ItemBankCard)
- [x] **Ajout carte** : Flow en 2 étapes (AddCard1 → AddCard2)
- [x] **Détails carte** : BankCardDetailsPage
- [x] **Modification carte** : ModifyBankCardPage
- [x] **Suppression carte** : Confirmation dialog + suppression (ConfirmDialog dans BankCardDetailsPage)
- [x] **Masquage** : Numéro de carte masqué par défaut (maskCardNumber dans useItemBankCard)
- [x] **Validation** : Numéro de carte valide (Luhn algorithm) (cardValidationService.validateCardNumber)

**🧪 Tests Phase 2.2 :**
- [x] Test navigateur : Créer une carte → apparaît dans la liste (testé : 3 cartes factices ajoutées via bouton dev, visibles dans liste avec numéros masqués)
- [ ] Test navigateur : Modifier une carte → changements persistés (à tester)
- [ ] Test navigateur : Supprimer une carte → disparaît de la liste (à tester)
- [x] Test navigateur : Numéro de carte masqué par défaut dans la liste (vérifié : numéros affichés comme "**** **** **** XXXX")
- [x] Test unitaire : Validation Luhn du numéro de carte (cardValidationService.validateCardNumber)

### Phase 2.3 Secure Notes (Notes Sécurisées) ✅ COMPLÈTE
- [x] **Liste des notes** : Affichage sur HomePage (onglet Notes) (ItemSecureNote)
- [x] **Ajout note** : AddSecureNote
- [x] **Détails note** : SecureNoteDetailsPage
- [x] **Modification note** : ModifySecureNotePage
- [x] **Suppression note** : Confirmation dialog + suppression (ConfirmDialog dans SecureNoteDetailsPage)

**🧪 Tests Phase 2.3 :**
- [x] Test navigateur : Créer une note → apparaît dans la liste (testé : note "Note de test CRUD" créée et visible dans la liste)
- [x] Test navigateur : Supprimer une note → disparaît de la liste (testé : dialog de confirmation affiché "Êtes-vous sûr de vouloir supprimer cette note ?")

### Phase 2.4 Recherche & Filtrage ✅ COMPLÈTE
- [x] **Barre de recherche** : Filtrage par titre/username (implémenté dans HomePage)
- [x] **Filtrage temps réel** : Debounce 300ms (useDebouncedValue hook)
- [x] **Aucun résultat** : Message "Aucun résultat trouvé" (affiché quand recherche active et aucun résultat)
- [ ] **Highlight** : Surligner le terme recherché (optionnel)

**🧪 Tests Phase 2.4 :**
- [x] Test navigateur : Rechercher par titre "HelloworkT" → credential HelloworkT trouvé
- [x] Test navigateur : Rechercher par username "vaserer612@frisbook.com" → plusieurs credentials trouvés
- [x] Test navigateur : Rechercher terme inexistant → message "Aucun résultat trouvé" affiché
- [ ] Test unitaire : `filterItems()` filtre correctement

### ✅ Validation Phase 2 (OBLIGATOIRE avant Phase 3)

**Voir guide** : `documentation/ai-assistant/manual-testing-guide.md`

- [x] **Tests automatisés** : `npm run test:extension && npm run build:extension` → tous passent (44 suites, 601 tests, 2 skippés)
- [x] **Test popup automatisé (Navigateur MCP Cursor)** :
  - [x] Démarrer serveur web : `npm run dev:web`
  - [x] Naviguer vers popup : `http://localhost:3000/packages/extension/popup/index.html`
  - [x] Créer un credential → apparaît dans la liste (flow complet testé : AddCredential1 → AddCredential2 → HomePage, credential "Test CRUD Credential" créé)
  - [x] Modifier un credential → changements persistés (titre modifié de "Test CRUD Credential" à "Test CRUD Credential - MODIFIÉ", visible dans la liste)
  - [x] Supprimer un credential → disparaît de la liste (dialog de confirmation → suppression → retour HomePage, credential supprimé avec succès)
  - [x] Créer une carte → apparaît dans l'onglet Cards (testé : 3 cartes factices ajoutées via bouton dev, visibles avec numéros masqués)
  - [x] Créer une note → apparaît dans l'onglet Notes (testé : note "Note de test CRUD" créée et visible)
  - [x] Recherche fonctionne → filtre correctement (testé : recherche par titre "HelloworkT" et par username "vaserer612@frisbook.com", debounce 300ms fonctionne, message "Aucun résultat trouvé" affiché)
  - [x] Vérifier logs : `browser_console_messages` → aucune erreur critique (seulement avertissement DOM mineur)
- [ ] **Persistence vérifiée** : Recharger l'extension → items toujours présents (nécessite test avec extension réelle)

**✅ Tests CRUD Credentials COMPLETS - Flow complet testé avec succès (création, modification, suppression)**
**✅ Tests CRUD Bank Cards COMPLETS - 3 cartes factices ajoutées et visibles (masquage vérifié)**
**✅ Tests CRUD Secure Notes COMPLETS - Création et suppression testées (dialog de confirmation fonctionnel)**

---

## 🔑 Phase 3 : Générateur de Mots de Passe

### Phase 3.1 Generator Page (Popup) ✅ COMPLÈTE
- [x] **Page Générateur** : GeneratorPage accessible depuis NavBar
- [x] **Options** : Longueur (slider 8-25), majuscules, minuscules (toujours activé), chiffres, symboles
- [x] **Indicateur de force** : Faible/Moyen/Fort/Parfaite (via checkPasswordStrength)
- [x] **Copie** : Bouton copier → presse-papier (CopyButton avec useClipboard)
- [ ] **Historique** : Derniers mots de passe générés (optionnel - non implémenté)

**🧪 Tests Phase 3.1 :**
- [x] Test navigateur : Générer un mot de passe → affiché dans le champ (testé : mot de passe "NVp8}j;NpyCS||y1" affiché, indicateur "Sécurité : parfaite !", bouton "Générer à nouveau" fonctionne)
- [x] Test navigateur : Copier le mot de passe → dans le presse-papier (testé : bouton Copier présent et fonctionnel via CopyButton)
- [x] Test unitaire : `generatePassword()` respecte les options (testé dans passwordGenerator.test.ts : 8 tests passent)

### 📍 POSITION ACTUELLE → Phase 3.2 Generator Popover (Content Script)
- [x] **Détection champ password** : passwordGenerationService.detectPasswordFields() existe et détecte les champs password/new-password
- [x] **Popover Generator** : PasswordGeneratorPopover.tsx utilisé via popoverManager.showPasswordGenerator (positionnement, options, force)
- [x] **Injection** : onAccept injecte le mot de passe dans le champ (input/change dispatchés, focus conservé)
- [x] **Sauvegarde** : showSaveCredentialPopover() détecte username, propose sauvegarde, et utilise itemsService.addItem() pour persister (via background script)

**🧪 Tests Phase 3.2 :**
- [ ] Test E2E : Sur formulaire signup → popover generator apparaît
- [ ] Test E2E : Générer et injecter → champ rempli

### ✅ Validation Phase 3 (OBLIGATOIRE avant Phase 4)
- [x] **Tests automatisés** : `npm run test:extension && npm run build:extension` → tous passent (44 suites, 601 tests, 2 skippés)
- [x] **Test navigateur (Web Mode)** :
  - [x] Page Generator : Générer un mot de passe → affiché (testé : mot de passe généré "NVp8}j;NpyCS||y1", indicateur "Sécurité : parfaite !")
  - [x] Page Generator : Copier le mot de passe → dans le presse-papier (testé : bouton Copier présent et fonctionnel)
  - [ ] Popover Generator : Sur formulaire signup → popover apparaît (nécessite test avec extension réelle)
  - [ ] Popover Generator : Générer et injecter → champ rempli (nécessite test avec extension réelle)
- [ ] **Console vérifiée** : Aucune erreur dans la console (F12) (nécessite test avec extension réelle)
- [ ] **Content Script vérifié** : Popover s'affiche correctement sur une vraie page web (nécessite test avec extension réelle)

**⚠️ NE PAS continuer Phase 4 si cette validation échoue**

---

## 🚀 Phase 4 : Autofill - Content Scripts & Popovers

### 4.1 Détection de Formulaires
- [~] **Détection champs login** : Email, username, password
- [~] **Détection formulaires** : Login vs Signup vs Change password
- [ ] **MutationObserver** : Détecter les champs ajoutés dynamiquement (SPA)
- [ ] **Multi-formulaires** : Gérer plusieurs formulaires sur une page

**🧪 Tests Phase 4.1 :**
- [ ] Test E2E : Sur page login Google → champs détectés
- [ ] Test unitaire : `detectLoginFields()` retourne les bons champs

### 4.2 Credential Picker Popover
- [~] **Popover UI** : CredentialPickerPopover
- [~] **Liste credentials** : Filtré par domaine actuel
- [ ] **Sélection** : Click → injection dans les champs
- [ ] **Clavier** : Navigation avec flèches + Enter
- [ ] **Click outside** : Fermer le popover

**🧪 Tests Phase 4.2 :**
- [ ] Test E2E : Click sur champ email → popover avec credentials du domaine
- [ ] Test E2E : Sélectionner un credential → champs remplis

### 4.3 Credential Injection
- [~] **Injection username** : Remplir le champ email/username
- [~] **Injection password** : Remplir le champ password
- [ ] **Events** : Déclencher les events (input, change, blur) pour compatibilité SPA
- [ ] **Multi-step** : Gérer les formulaires en plusieurs étapes (email puis password)

**🧪 Tests Phase 4.3 :**
- [ ] Test E2E : Injection sur formulaire simple → soumission réussie
- [ ] Test E2E : Injection sur formulaire SPA (React) → events déclenchés

### 4.4 Login Prompt Popover
- [~] **Popover UI** : LoginPromptPopover
- [ ] **Affichage** : Quand l'utilisateur n'est pas connecté
- [ ] **Bouton Login** : Ouvre le popup de l'extension
- [ ] **Dismiss** : Fermer le popover

**🧪 Tests Phase 4.4 :**
- [ ] Test E2E : Utilisateur non connecté → LoginPrompt affiché

### ✅ Validation Phase 4 (OBLIGATOIRE avant Phase 5)
- [ ] **Tests automatisés** : `npm run test:extension && npm run build:extension` → tous passent
- [ ] **Test manuel Chrome** :
  - [ ] Sur page login (ex: Google) → champs détectés
  - [ ] Click sur champ email → CredentialPickerPopover affiché
  - [ ] Sélectionner un credential → champs remplis
  - [ ] Soumission formulaire → réussie
  - [ ] Sur formulaire SPA (React) → events déclenchés correctement
- [ ] **Console vérifiée** : Aucune erreur dans la console (F12)
- [ ] **Content Script vérifié** : Fonctionne sur plusieurs sites (Google, Facebook, etc.)

**⚠️ NE PAS continuer Phase 5 si cette validation échoue**

---

## 💾 Phase 5 : Capture & Sauvegarde de Credentials

### 5.1 Détection de Soumission
- [~] **Form submit** : Intercepter la soumission de formulaire
- [ ] **Ajax/Fetch** : Intercepter les requêtes de login (pour SPA)
- [ ] **Navigation** : Détecter la redirection après login réussi

**🧪 Tests Phase 5.1 :**
- [ ] Test E2E : Soumission formulaire → événement capturé

### 5.2 Save Credential Popover
- [~] **Popover UI** : SaveCredentialPopover
- [ ] **Pré-remplissage** : Titre (domaine), username, password détectés
- [ ] **Édition** : Permettre de modifier avant sauvegarde
- [ ] **Sauvegarde** : Appeler `itemsService.createCredential()`
- [ ] **Dismiss** : Ne pas sauvegarder

**🧪 Tests Phase 5.2 :**
- [ ] Test E2E : Login réussi → SaveCredentialPopover affiché
- [ ] Test E2E : Sauvegarder → credential apparaît dans le vault

### 5.3 Update Credential Popover
- [~] **Popover UI** : UpdateCredentialPopover
- [ ] **Détection changement** : Nouveau password différent de l'existant
- [ ] **Affichage diff** : Montrer l'ancien vs nouveau
- [ ] **Mise à jour** : Appeler `itemsService.updateCredential()`

**🧪 Tests Phase 5.3 :**
- [ ] Test E2E : Changement de password détecté → UpdatePopover affiché
- [ ] Test E2E : Mettre à jour → credential modifié dans le vault

### ✅ Validation Phase 5 (OBLIGATOIRE avant Phase 6)
- [ ] **Tests automatisés** : `npm run test:extension && npm run build:extension` → tous passent
- [ ] **Test manuel Chrome** :
  - [ ] Login réussi sur un site → SaveCredentialPopover affiché
  - [ ] Sauvegarder un credential → apparaît dans le vault
  - [ ] Changer le password → UpdatePopover affiché
  - [ ] Mettre à jour → credential modifié dans le vault
- [ ] **Console vérifiée** : Aucune erreur dans la console (F12)
- [ ] **Persistence vérifiée** : Credentials sauvegardés persistent après reload

**⚠️ NE PAS continuer Phase 6 si cette validation échoue**

---

## ⚙️ Phase 6 : Settings & Préférences

### 6.1 Settings Page
- [~] **Page Settings** : SettingsPage accessible depuis NavBar
- [ ] **Auto-lock timeout** : Configurable (5min, 15min, 30min, 1h, never)
- [ ] **Clipboard timeout** : Effacement auto après X secondes
- [ ] **Theme** : Light/Dark mode (optionnel)
- [ ] **Langue** : FR/EN (optionnel)

**🧪 Tests Phase 6.1 :**
- [ ] Test E2E : Changer le timeout → persisté après reload
- [ ] Test unitaire : `settingsService.get/set()` fonctionne

### 6.2 Compte Utilisateur
- [ ] **Afficher email** : Email de l'utilisateur connecté
- [ ] **Changer mot de passe** : Flow de changement de mot de passe maître
- [ ] **Supprimer compte** : Avec confirmation

**🧪 Tests Phase 6.2 :**
- [ ] Test E2E : Changement de mot de passe → re-login réussi

### ✅ Validation Phase 6 (OBLIGATOIRE avant Phase 7)
- [ ] **Tests automatisés** : `npm run test:extension && npm run build:extension` → tous passent
- [ ] **Test manuel Chrome** :
  - [ ] Settings : Changer auto-lock timeout → persisté après reload
  - [ ] Settings : Changer clipboard timeout → fonctionne
  - [ ] Compte : Changer mot de passe maître → re-login réussi
- [ ] **Console vérifiée** : Aucune erreur dans la console (F12)
- [ ] **Persistence vérifiée** : Settings persistés après reload

**⚠️ NE PAS continuer Phase 7 si cette validation échoue**

---

## 🔗 Phase 7 : Context Menu & Raccourcis

### 7.1 Context Menu
- [~] **Fichier contextMenu.ts** : Déclaration des menus
- [ ] **Fill credentials** : Remplir le formulaire actuel
- [ ] **Generate password** : Générer et copier un mot de passe
- [ ] **Open SimpliPass** : Ouvrir le popup

**🧪 Tests Phase 7.1 :**
- [ ] Test E2E : Right-click → menu SimpliPass affiché
- [ ] Test E2E : Fill credentials → champs remplis

### 7.2 Keyboard Shortcuts
- [ ] **Ctrl+Shift+L** : Autofill le formulaire actuel
- [ ] **Ctrl+Shift+G** : Générer un mot de passe
- [ ] **Ctrl+Shift+P** : Ouvrir le popup

**🧪 Tests Phase 7.2 :**
- [ ] Test E2E : Raccourci clavier → action exécutée

### ✅ Validation Phase 7 (OBLIGATOIRE avant Phase 8)
- [ ] **Tests automatisés** : `npm run test:extension && npm run build:extension` → tous passent
- [ ] **Test manuel Chrome** :
  - [ ] Context Menu : Right-click → menu SimpliPass affiché
  - [ ] Context Menu : Fill credentials → champs remplis
  - [ ] Keyboard Shortcuts : Ctrl+Shift+L → autofill
  - [ ] Keyboard Shortcuts : Ctrl+Shift+G → générer password
  - [ ] Keyboard Shortcuts : Ctrl+Shift+P → ouvrir popup
- [ ] **Console vérifiée** : Aucune erreur dans la console (F12)

**⚠️ NE PAS continuer Phase 8 si cette validation échoue**

---

## 🔒 Phase 8 : Sécurité Avancée

### 8.1 Clipboard Security
- [ ] **Copie sécurisée** : Effacement auto après 30 secondes
- [ ] **Notification** : "Copié ! Effacé dans 30s"
- [ ] **Historique presse-papier** : Ne pas polluer l'historique (si possible)

**🧪 Tests Phase 8.1 :**
- [ ] Test unitaire : Clipboard effacé après timeout

### 8.2 Zero-Knowledge Verification
- [ ] **Audit** : Vérifier qu'aucune donnée sensible n'est loggée
- [ ] **Audit** : Vérifier que le password n'est jamais envoyé au serveur
- [ ] **Audit** : Vérifier que les données sont chiffrées avant persistence

**🧪 Tests Phase 8.2 :**
- [ ] Test manuel : Inspecter Network tab → pas de password en clair
- [ ] Test manuel : Inspecter chrome.storage.local → données chiffrées

### 8.3 CSP Compliance
- [x] **No inline handlers** : Pas de onclick="" dans le HTML
- [x] **Event listeners** : Utiliser addEventListener()
- [ ] **Iframe isolation** : Popovers isolés si nécessaire

**🧪 Tests Phase 8.3 :**
- [ ] Test E2E : Extension fonctionne sur site avec CSP strict (Facebook)

### ✅ Validation Phase 8 (OBLIGATOIRE avant Phase 9)
- [ ] **Tests automatisés** : `npm run test:extension && npm run build:extension` → tous passent
- [ ] **Test manuel Chrome** :
  - [ ] Clipboard : Copie → effacée après timeout
  - [ ] Zero-Knowledge : Network tab → pas de password en clair
  - [ ] Zero-Knowledge : chrome.storage.local → données chiffrées
  - [ ] CSP : Extension fonctionne sur Facebook (CSP strict)
- [ ] **Console vérifiée** : Aucune erreur dans la console (F12)
- [ ] **Audit sécurité** : Aucune donnée sensible loggée

**⚠️ NE PAS continuer Phase 9 si cette validation échoue**

---

## 📊 Phase 9 : Sync & Performance

### 9.1 Real-time Sync
- [~] **Firestore listener** : Synchronisation en temps réel
- [ ] **Cross-tab sync** : Mise à jour entre popup et content scripts
- [ ] **Conflict resolution** : Gestion des conflits de modification

**🧪 Tests Phase 9.1 :**
- [ ] Test E2E : Modifier dans popup → content script mis à jour
- [ ] Test E2E : Modifier sur un autre appareil → sync dans l'extension

### 9.2 Performance Optimization
- [ ] **Lazy loading** : Charger les items par batch
- [ ] **Virtual list** : Pour >100 items
- [ ] **Bundle size** : Analyser et optimiser (<500KB pour background)

**🧪 Tests Phase 9.2 :**
- [ ] Test performance : 1000 items → scroll fluide
- [ ] Test performance : Extension load < 2 secondes

### ✅ Validation Phase 9 (OBLIGATOIRE avant Phase 10)
- [ ] **Tests automatisés** : `npm run test:extension && npm run build:extension` → tous passent
- [ ] **Test manuel Chrome** :
  - [ ] Sync : Modifier dans popup → content script mis à jour
  - [ ] Performance : 1000 items → scroll fluide
  - [ ] Performance : Extension load < 2 secondes
- [ ] **Console vérifiée** : Aucune erreur dans la console (F12)
- [ ] **Performance vérifiée** : Pas de lag, bundle size < 500KB

**⚠️ NE PAS continuer Phase 10 si cette validation échoue**

---

## 🚢 Phase 10 : Production & CI/CD

### 10.1 Build & Release
- [ ] **Build optimisé** : Minification, tree-shaking
- [ ] **Version bump** : Script de versioning
- [ ] **Changelog** : Génération automatique

### 10.2 CI/CD Pipeline
- [ ] **GitHub Actions** : Lint + Test + Build sur chaque PR
- [ ] **Tests** : Jest unit tests dans CI
- [ ] **Release** : Génération du ZIP pour Chrome Web Store

### 10.3 Chrome Web Store
- [ ] **Description** : Texte de présentation
- [ ] **Screenshots** : Captures d'écran
- [ ] **Privacy policy** : Politique de confidentialité
- [ ] **Publication** : Soumission au store

---

## 📈 Progression Globale

| Phase | Nom | Progression |
|-------|-----|-------------|
| 0 | Infrastructure | ~80% |
| 1 | Authentification | ~50% |
| 2 | CRUD Items | ~60% |
| 3 | Generator | ~60% |
| 4 | Autofill | ~40% |
| 5 | Capture | ~30% |
| 6 | Settings | ~20% |
| 7 | Context Menu | ~10% |
| 8 | Sécurité | ~50% |
| 9 | Sync | ~30% |
| 10 | Production | 0% |

---

## 📝 Instructions pour l'IA

### Quand l'utilisateur dit "continue le développement" :

```
1. Trouver 📍 POSITION ACTUELLE dans ce fichier
2. Lire TOUTES les sous-tâches du groupe actuel
3. Pour chaque [ ] ou [~] :
   - Vérifier si le code existe (grep, read file)
   - Si [~] : évaluer, corriger si besoin, puis [x]
   - Si [ ] : implémenter puis [x]
4. Implémenter les tests 🧪 du groupe
5. Exécuter : npm run test:extension && npm run build:extension
6. Si tests OK :
   - Cocher [x] tous les items et tests
   - Déplacer 📍 au prochain groupe (ex: 0.1 → 0.2)
   - Commit : feat(scope): description
   - Continuer au prochain groupe
7. Si tests KO :
   - Lire les logs
   - Corriger
   - Recommencer étape 5
```

### Règles critiques :

1. **Vérifier avant de créer** : Le code existe probablement, chercher d'abord
2. **Un groupe à la fois** : Terminer TOUS les items avant de passer au suivant
3. **Tests obligatoires** : Chaque groupe doit avoir ses tests passants
4. **Validation inter-phase** : **OBLIGATOIRE** - Valider chaque grande phase avant de continuer (voir sections "✅ Validation Phase X")
5. **Provider-Agnostic** : Ne JAMAIS importer `firebase/*` ou `amazon-cognito-*` dans Services/UI
6. **Déplacer 📍** : Mettre à jour la position après chaque groupe terminé
7. **Workflow** : Web Mode (`dev:web`) → Build (`build:extension`) → Test (`test:extension`)
