# 🎯 Guide d'Utilisation de Cursor - SimpliPass

Guide pratique pour utiliser Cursor de manière optimale avec le workflow de développement autonome.

## 📚 Références

- **Workflow complet** : [`workflow.md`](workflow.md)
- **Architecture** : [`architecture.md`](architecture.md)
- **Stratégie tests** : [`testing.md`](testing.md)
- **Tests manuels** : [`manual-testing-guide.md`](manual-testing-guide.md)
- **Plan développement** : [`features.md`](features.md)

---

## 🚀 Scénarios Principaux

### 1. "Continue le développement"

### ✅ Configuration Recommandée

| Paramètre | Valeur | Pourquoi |
|-----------|--------|----------|
| **Mode** | **Agent** | Permet l'exécution autonome de plusieurs étapes |
| **Modèle** | **Auto** (ou **Claude Sonnet 4.5**) | Bon équilibre vitesse/qualité |
| **Fichiers à pointer** | Aucun nécessaire | Les règles Cursor chargent automatiquement le contexte |

### 📝 Commande Simple

```
continue le développement
```

**Ou** :

```
continue
```

**L'IA va automatiquement** :
1. Lire `features.md` et trouver 📍 POSITION ACTUELLE
2. Vérifier le code existant
3. Implémenter/corriger
4. Créer les tests
5. Mettre à jour `features.md`
6. Continuer au prochain groupe

---

### 2. "Execute l'ensemble des tests"

**Quand l'utiliser** :
- ✅ Pour vérifier l'état global du projet
- ✅ Avant un commit important
- ✅ Après des modifications majeures
- ✅ Pour valider une phase complète

**Configuration** :
- **Mode** : **Agent** (pour exécuter plusieurs étapes)
- **Modèle** : **Auto**
- **Fichiers** : Aucun nécessaire

**Commande** :
```
execute l'ensemble des tests
```

**Ou** :
```
run all tests
test everything
```

**L'IA va automatiquement** :
1. Exécuter tous les tests unitaires (`npm run test:extension`)
2. Build l'extension (`npm run build:extension`)
3. Tester la popup dans le navigateur (via navigateur MCP Cursor)
4. Fournir un rapport complet avec succès/échecs

**Voir guide détaillé** : `documentation/ai-assistant/workflow.md` section "Execute l'ensemble des tests"

---

## 🎛️ Modes Cursor : Quand les Utiliser

### 1. Mode Agent (Recommandé pour "continue")

**Quand l'utiliser** :
- ✅ Pour "continue le développement"
- ✅ Pour des tâches multi-étapes
- ✅ Quand vous voulez que l'IA travaille de manière autonome

**Avantages** :
- Exécute plusieurs actions en séquence
- Peut lire des fichiers, modifier, exécuter des commandes
- Parfait pour suivre le workflow complet

**Exemple** :
```
continue le développement
```

---

### 2. Mode Plan (Pour des tâches complexes spécifiques)

**Quand l'utiliser** :
- ✅ Pour une nouvelle feature complexe non listée dans `features.md`
- ✅ Pour refactorer une partie importante
- ✅ Quand vous voulez voir le plan avant exécution

**Avantages** :
- Génère un plan détaillé avant d'agir
- Vous pouvez valider/modifier le plan
- Utile pour des tâches non routinières

**Exemple** :
```
Plan: Refactorer le système d'autofill pour supporter les SPA React
```

---

### 3. Mode Chat (Pour questions/guidance)

**Quand l'utiliser** :
- ✅ Pour poser des questions sur l'architecture
- ✅ Pour comprendre un morceau de code
- ✅ Pour obtenir des suggestions rapides

**Avantages** :
- Rapide pour des questions ponctuelles
- Pas d'exécution de code
- Bon pour la compréhension

**Exemple** :
```
Comment fonctionne le système de chiffrement dans ce projet?
```

---

## 📁 Fichiers à Pointer : Quand et Pourquoi

### ✅ Généralement : Aucun Fichier Nécessaire

Les règles Cursor (`.cursor/rules/`) chargent automatiquement :
- `features.md` (plan complet)
- `architecture.md` (règles d'architecture)
- `workflow.md` (workflow de développement)
- `testing.md` (stratégie de tests)

**Donc pour "continue"** : Ne pointez rien, l'IA a déjà le contexte.

---

### 📌 Quand Pointer des Fichiers

**Scénario 1 : Bug spécifique**
```
@packages/extension/ui/pages/LoginPage.tsx
Le formulaire ne se soumet pas, pourquoi?
```

**Scénario 2 : Feature spécifique non dans features.md**
```
@documentation/ai-assistant/features.md
@packages/extension/ui/pages/HomePage.tsx
Ajouter un bouton "Export" sur la HomePage
```

**Scénario 3 : Comprendre un fichier complexe**
```
@packages/common/core/services/vaultService.ts
Explique-moi comment fonctionne le vaultService
```

---

## 🤖 Modèle IA : Quel Choisir?

### ✅ Recommandation : **Auto**

**Pourquoi** :
- Cursor choisit automatiquement le meilleur modèle selon la tâche
- Équilibre entre vitesse et qualité
- Économique

---

### Alternatives selon le besoin

| Modèle | Quand l'utiliser | Avantages |
|--------|------------------|-----------|
| **Claude Sonnet 4.5** | Tâches complexes, code critique | Meilleure compréhension, moins d'erreurs |
| **GPT-4o** | Besoin de vitesse | Plus rapide, bon pour tâches simples |
| **Claude Opus** | Refactoring majeur | Meilleure qualité, plus cher |

**Pour ce projet** : **Auto** est suffisant car :
- Le workflow est bien défini
- Les règles Cursor guident l'IA
- La plupart des tâches sont routinières

---

## 🎯 Workflow Recommandé au Quotidien

### Matin : Démarrer le développement

```
1. Ouvrir Cursor
2. Mode: Agent
3. Modèle: Auto
4. Commande: "continue le développement"
5. Laisser l'IA travailler
```

---

### Pendant le développement : Vérification

Si vous voulez vérifier l'avancement :

```
@documentation/ai-assistant/features.md
Où en sommes-nous? Quel est le prochain groupe?
```

---

### Si l'IA bloque : Debugging

```
@documentation/ai-assistant/workflow.md
Le test E2E échoue avec cette erreur: [coller l'erreur]
```

---

### Pour une feature urgente non planifiée

```
Mode: Plan
@documentation/ai-assistant/features.md
@packages/extension/ui/pages/HomePage.tsx
Plan: Ajouter un bouton "Sync Now" sur la HomePage
```

---

## ⚡ Astuces Pro

### 1. Utiliser les Raccourcis Clavier

- `Cmd/Ctrl + K` : Chat rapide
- `Cmd/Ctrl + L` : Chat avec contexte du fichier ouvert
- `Cmd/Ctrl + Shift + L` : Agent mode

### 2. Composer pour des Actions Multi-Fichiers

```
@packages/extension/ui/pages/LoginPage.tsx
@packages/common/core/services/authService.ts
Corriger le bug de login: le message d'erreur ne s'affiche pas
```

### 3. Utiliser les Rules pour le Contexte

Les fichiers `.cursor/rules/*.mdc` sont automatiquement chargés. Vous n'avez pas besoin de les pointer.

### 4. Vérifier l'Avancement

```
@documentation/ai-assistant/features.md
Affiche-moi la progression actuelle
```

---

## 🚨 Erreurs Communes à Éviter

### ❌ Ne pas faire

1. **Pointer trop de fichiers** : L'IA a déjà le contexte via les rules
2. **Utiliser Chat pour "continue"** : Utilisez Agent pour l'autonomie
3. **Changer de modèle constamment** : Auto est optimal
4. **Donner des instructions trop détaillées** : "continue" suffit

### ✅ Faire

1. **Utiliser Agent pour "continue"** : Autonomie maximale
2. **Laisser l'IA suivre le workflow** : Elle connaît les règles
3. **Vérifier `features.md`** : Pour voir l'avancement
4. **Faire confiance au workflow** : Il est conçu pour être autonome

---

## 📊 Résumé : Configuration Optimale

| Situation | Mode | Modèle | Fichiers | Commande |
|-----------|------|--------|----------|----------|
| Développement quotidien | Agent | Auto | Aucun | "continue" |
| Bug spécifique | Chat/Agent | Auto | Fichier concerné | Description du bug |
| Feature urgente | Plan | Auto | Fichiers concernés | "Plan: ..." |
| Question architecture | Chat | Auto | Aucun | Question directe |
| Vérification avancement | Chat | Auto | features.md | "Où en sommes-nous?" |

---

## 🎓 Exemples Concrets

### Exemple 1 : Développement Normal

```
Vous: continue le développement
Mode: Agent
Modèle: Auto
Fichiers: Aucun

→ L'IA travaille sur le groupe actuel (📍)
→ Met à jour features.md
→ Continue automatiquement
```

---

### Exemple 2 : Bug Critique

```
Vous: @packages/extension/ui/pages/LoginPage.tsx
      Le bouton login ne fonctionne pas après le dernier commit
Mode: Agent
Modèle: Auto
Fichiers: LoginPage.tsx

→ L'IA lit le fichier
→ Identifie le problème
→ Corrige
→ Teste
```

---

### Exemple 3 : Feature Non Planifiée

```
Vous: Plan: Ajouter un dark mode toggle dans les settings
Mode: Plan
Modèle: Auto
Fichiers: @documentation/ai-assistant/features.md
          @packages/extension/ui/pages/SettingsPage.tsx

→ L'IA génère un plan
→ Vous validez
→ L'IA implémente
```

---

## ✅ Checklist Avant de Commencer

- [ ] Mode Cursor : **Agent**
- [ ] Modèle : **Auto**
- [ ] Fichiers : **Aucun** (sauf besoin spécifique)
- [ ] Commande : **"continue le développement"**
- [ ] Vérifier que `features.md` a le marqueur 📍

---

**Résumé** : Pour 90% des cas, utilisez **Agent + Auto + "continue"** sans pointer de fichiers. C'est la configuration optimale pour votre workflow autonome.
