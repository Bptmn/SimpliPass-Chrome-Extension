🎯 GOAL: Reorganize the project into a modular monorepo structure to support both:
1. A React Native Web Chrome Extension (`extension/`)
2. A React Native mobile app (`mobile/`)
3. A shared, central codebase for logic, components and design system (`app/`)

---

📁 NEW FOLDER STRUCTURE (INSIDE /packages)

packages/
├── app/                # Shared cross-platform app logic
│   ├── components/     # RN components (Card, Button, Input, etc.)
│   ├── screens/        # Shared screens (Vault, Generator, Settings)
│   ├── hooks/          # React hooks
│   ├── logic/          # Non-UI logic (encryption, auth, etc.)
│   ├── design/         # tokens/, textStyles, spacing, layout
│   ├── utils/          # helpers (formatting, parsing...)
│   └── index.ts        # Re-export app modules
│
├── extension/          # Chrome Extension front-end
│   ├── public/         # popup.html, icons, manifest.json
│   ├── popup/          # entrypoint for RN Web (uses app/)
│   ├── background.ts   # background service worker
│   ├── content.ts      # content script (optional)
│   ├── messaging/      # message bridge and handlers
│   └── index.ts        # ReactDOM.createRoot entry
│
├── mobile/             # React Native app (uses app/)
│   ├── App.tsx         # RN App entrypoint
│   ├── ios/
│   ├── android/
│   └── index.ts
│
├── shared/             # Optionally used for constants, types, etc.
│   ├── types.ts
│   └── constants.ts
│
├── .eslintrc.js        # Updated ESLint config for monorepo
├── babel.config.js     # Handles aliases
├── tsconfig.json       # Shared TS config
├── package.json
└── yarn.lock

---

✅ TASKS TO PERFORM:

1. 🧱 **Move files accordingly**
   - Move all reusable components, screens, styles, logic into `app/`
   - Move Chrome-only files (popup, manifest, service worker) into `extension/`
   - If needed, prepare a dummy `mobile/` folder with basic RN setup

2. 🛠️ **Setup path aliases**
   Update `tsconfig.json` and `babel.config.js`:
```ts
paths: {
  "@app/*": ["packages/app/*"],
  "@design/*": ["packages/app/design/*"],
  "@components/*": ["packages/app/components/*"],
  "@screens/*": ["packages/app/screens/*"],
  "@hooks/*": ["packages/app/hooks/*"],
  "@utils/*": ["packages/app/utils/*"]
}
🧹 Update all imports

All components should import using aliases, e.g.

ts
Copier
Modifier
import { Button } from '@components/Button';
import { spacing } from '@design/tokens';
🧪 Verify build works

Ensure extension/ still builds (npm run build)

Add a placeholder mobile/App.tsx entrypoint using the same screens/components as extension

🧪 Lint & Prettier

Run: npm run lint and npm run prettier

Fix paths and aliases if needed

✅ Testing + Storybook

Move stories next to each component in app/components/*.stories.tsx

Storybook config should point to app/components/**/*

🧩 FINAL CHECKLIST:

✅ extension/ builds using shared code from app/

✅ mobile/ builds and shows shared screens

✅ All code now lives in packages/ structure

✅ Central design system lives in app/design/

✅ No hardcoded imports, uses path aliases only

✅ Lint, Prettier, Storybook and Jest all run correctly

Proceed to implement these changes. Once the structure is done, I’ll assist you in:

Updating imports

Adding a Metro config for React Native mobile

Running extension & mobile side-by-side