# 🚀 Mode Développement Web - Guide de Démarrage Rapide

## ✨ Qu'est-ce que le mode web ?

Le **mode web** vous permet de développer l'interface de votre extension Chrome **10x plus rapidement** grâce au Hot Module Replacement (HMR). Vous modifiez votre code, et les changements apparaissent **instantanément** dans le navigateur, sans rechargement manuel !

---

## 🎯 Démarrage en 30 secondes

### 1. Lancer le mode web

```bash
npm run dev:web
```

✅ Votre navigateur s'ouvre automatiquement sur `http://localhost:3000`  
✅ Le HMR est activé : modifiez votre code, et voyez les changements en temps réel !  
✅ Un badge **🌐 WEB MODE** apparaît en haut à droite de l'interface  

### 2. Développez votre UI

Modifiez n'importe quel fichier dans :
- `packages/extension/ui/` (composants)
- `packages/extension/ui/pages/` (pages)
- `packages/common/hooks/` (hooks)
- `packages/common/core/services/` (services)

**Les changements sont instantanés !** ⚡

### 3. Testez l'extension finale

Quand vous êtes satisfait de votre UI :

```bash
npm run build:extension
# Puis rechargez l'extension dans chrome://extensions
```

---

## 🔥 Ce qui fonctionne en mode web

| Fonctionnalité | Mode Web | Mode Extension |
|----------------|----------|----------------|
| **HMR (rechargement instantané)** | ✅ | ❌ |
| **Formulaires et validation** | ✅ | ✅ |
| **Navigation entre pages** | ✅ | ✅ |
| **Zustand (state management)** | ✅ | ✅ |
| **Firebase/Firestore** | ✅ | ✅ |
| **AWS Cognito** | ✅ | ✅ |
| **Persistance des données** | ✅ (sessionStorage) | ✅ (chrome.storage) |
| **React DevTools** | ✅ | ✅ |
| **Autofill credentials** | ❌ | ✅ |
| **Content scripts** | ❌ | ✅ |
| **Background worker** | ❌ | ✅ |

---

## 🎨 Workflow recommandé

```
┌─────────────────────────────┐
│  1. Développement UI (90%)  │
│  → npm run dev:web          │
│  → HMR, tests rapides       │
└─────────────────────────────┘
              ↓
┌─────────────────────────────┐
│  2. Test extension (10%)    │
│  → npm run build:extension  │
│  → Test APIs Chrome         │
└─────────────────────────────┘
              ↓
┌─────────────────────────────┐
│  3. Production              │
│  → npm run build            │
│  → Déploiement              │
└─────────────────────────────┘
```

---

## 💡 Comment ça marche ?

### Abstraction automatique des APIs

Le code utilise une couche d'abstraction (`browserAPI.ts`) qui détecte automatiquement l'environnement :

```typescript
// Votre code reste identique dans les deux modes !
import { browser } from '@extension/shims/browserAPI';

// En mode web : utilise sessionStorage
// En mode extension : utilise chrome.storage.session
await browser.storage.session.set({ key: 'value' });
```

### Aucun changement de code nécessaire

Vous écrivez votre code **une seule fois**, et il fonctionne dans les deux environnements ! 🎉

---

## 🛠️ Commandes disponibles

```bash
# 🌐 Mode web - Développement rapide
npm run dev:web           # Lancer avec HMR
npm run build:web         # Build pour preview
npm run preview:web       # Preview du build

# 🔌 Mode extension - Tests finaux
npm run dev:extension     # Lancer le serveur de dev
npm run build:extension   # Build l'extension
npm run build             # Build complet (prod)

# 🧪 Tests
npm run test:extension    # Tests unitaires
npm run test:e2e          # Tests E2E (Playwright)
npm run type-check        # Vérifier TypeScript
npm run lint              # Linter
```

---

## 🔍 Débogage

### Mode web

- **React DevTools** : Fonctionnent nativement
- **Console** : Affiche `[Web Mode]` pour les logs spécifiques
- **Storage** : DevTools → Application → Local Storage / Session Storage
- **Network** : DevTools → Network

### Mode extension

- **React DevTools** : Disponibles via Extension
- **Console** : Console de l'extension
- **Storage** : DevTools → Application → Extension Storage
- **Background Script** : Console séparée dans Service Worker

---

## 🐛 Problèmes fréquents

### Les données persistent après fermeture en mode web

✅ **Normal !** En mode web, `localStorage` est utilisé. Effacez-les manuellement :
```javascript
// Dans la console du navigateur
sessionStorage.clear();
localStorage.clear();
```

### Je vois des warnings sur chrome.storage

✅ **Normal en mode web !** Ces APIs ne sont pas disponibles en mode web. Le système utilise automatiquement `sessionStorage`/`localStorage` à la place.

### L'autofill ne fonctionne pas en mode web

✅ **Normal !** L'autofill nécessite les APIs Chrome Extension. Utilisez `npm run build:extension` pour tester l'autofill.

---

## 📚 Documentation complète

- **Configuration Vite** : `configs/build/vite/README.md`
- **Architecture** : `packages/extension/README.md`
- **Tests** : `documentation/TESTING_OVERVIEW.md`

---

## 🎉 Avantages du mode web

1. ⚡ **10x plus rapide** - HMR instantané vs rechargement manuel
2. 🔄 **Itération rapide** - Testez vos changements en temps réel
3. 💾 **Données réelles** - Persistance via sessionStorage/localStorage
4. 🎨 **UI/UX parfait** - Ajustez le design sans friction
5. 🧪 **Tests faciles** - React DevTools natif
6. 🚀 **Productivité** - Concentrez-vous sur le code, pas sur les rechargements

---

## 🎯 Exemple de session de développement

```bash
# Matin : Développement de la nouvelle page de login
npm run dev:web
# → Modifiez LoginPage.tsx
# → Ajustez les styles
# → Testez la validation du formulaire
# → Tout en temps réel !

# Après-midi : Test de l'autofill
npm run build:extension
# → Rechargez l'extension dans Chrome
# → Testez l'autofill sur un site réel
# → Vérifiez que tout fonctionne

# Fin de journée : Commit
git add .
git commit -m "feat: nouvelle page de login avec validation"
```

---

**Développez rapidement, testez efficacement ! 🚀**
