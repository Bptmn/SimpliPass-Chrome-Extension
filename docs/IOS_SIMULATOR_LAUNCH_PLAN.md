### SimpliPass Mobile (iOS) – Readiness Plan for Simulator Launch (Updated)

This plan audits `packages/common/` and `packages/mobile/` and lists the concrete steps required to run the mobile app on the iOS Simulator. It assumes development on macOS with Xcode.

---

## Assumptions and Adjustments (per your notes)

- You already have Xcode and the iOS Simulator installed. Steps below won’t repeat that setup.
- You already have all `REACT_NATIVE_*` environment variables for Firebase and Cognito in a `.env` file. The plan now assumes we load these with `app.config.js` (Expo) so they’re available at runtime.
- A crypto adapter will be added following the same adapter pattern used elsewhere: interface in `packages/common/core/adapters/` + platform-specific implementations in `packages/mobile/` and `packages/extension/` libraries.
- Firebase SDK will be platform-specific via the adapters layer: web SDK for extension, React Native Firebase for mobile. The adapters will dynamically select the proper provider at runtime based on the platform (no business logic in adapters, functions normalized for a consistent interface).
- A `packages/mobile/README.md` will be created to document mobile-specific configuration (env, prebuild, permissions, adapter specifics, run commands).

## 1) Prerequisites

- Xcode 15+ (already installed)
- CocoaPods installed: `sudo gem install cocoapods`
- Node 18+ and npm or yarn
- iOS Simulator installed via Xcode (Xcode → Settings → Platforms → iOS)

Note: Web guidance recommends React Native 0.74+ for iOS 18; current code uses RN 0.72 with Expo 49 (compatible, but consider upgrading later).

---

## 2) Choose Native Build Path (Expo prebuild vs Bare RN)

We already depend on Expo libs (`expo`, `expo-secure-store`, `expo-local-authentication`). Recommended path: Expo prebuild for iOS.

- Decision: Use Expo prebuild for iOS native folders
  - Pros: Leverages current Expo 49 deps, easier permissions/config
  - Command: from `packages/mobile/` run `npx expo prebuild -p ios`

Result: Generates `packages/mobile/ios/` with Podfile, Xcode project.

---

## 3) Monorepo Metro/Babel Resolution (BLOCKER)

Current state:
- `packages/mobile/babel.config.js` aliases point to `./packages/...` which is incorrect relative to `packages/mobile/`.
- Root `metro.config.js` watches `packages/app` and `packages/shared`, not `packages/common`.

Required:
- Fix Babel aliases to resolve `@common`, `@ui`, etc. to repo-root paths.
- Ensure Metro watches and resolves `packages/common/` sources.

Actions:
1. Update `packages/mobile/babel.config.js` to fix module-resolver aliases.
2. Add `packages/mobile/metro.config.js` with proper watchFolders and SVG transform.

Without these, imports like `@common/hooks` will fail when bundling on iOS.

---

## 4) Environment Configuration (BLOCKER)

Current state:
- `packages/common/config/platform.ts` (mobile branch) reads `REACT_APP_*`; `packages/mobile/config.ts` reads `REACT_NATIVE_*`.
- You already have a `.env` with `REACT_NATIVE_*` values. We’ll surface these via Expo `app.config.js` so they’re accessible at runtime and (optionally) add fallback support in common config for `REACT_NATIVE_*`.

Required:
- Unify on one prefix for mobile (recommend `REACT_NATIVE_...`) or read both.
- Provide values at runtime via Expo config.

Actions:
1. Update `packages/common/config/platform.ts` to read `REACT_NATIVE_*` with fallback to `VITE_*`/`REACT_APP_*` if needed.
2. Create `packages/mobile/app.config.js` to inject `.env` values into `extra`.
3. In mobile runtime, read from `expo-constants` or keep `process.env` via Expo’s injection.

---

## 5) iOS Native Setup (Pods, Permissions, Identifiers)

After prebuild:
1. Install pods: `cd packages/mobile/ios && pod install`
2. iOS permissions in `Info.plist` (e.g., `NSFaceIDUsageDescription`)
3. App identifiers & icons (bundle identifier, splash, etc.)

---

## 6) Crypto Adapter (BLOCKER) – aligned with adapters layer

Problem:
- `@common/core/libraries/crypto.ts` uses WebCrypto PBKDF2; RN lacks WebCrypto.

Design:
- Add `packages/common/core/adapters/crypto.adapter.ts` with stable interface
- Implement platform libraries for web and mobile; select via adapter.

Actions:
1. Add deps: `react-native-get-random-values`, `base-64`, `react-native-simple-crypto`
2. Polyfill base64/RNG in `packages/mobile/index.js`
3. Refactor `cryptoService.ts` to use adapter

---

## 7) Firebase SDK per platform via adapters (BLOCKER)

Design:
- Keep adapter interfaces stable; provide RN Firebase implementations for mobile.

Actions:
1. Add RN Firebase deps
2. Create mobile auth/database libraries matching web exports
3. Dynamic import in adapters based on platform

---

## 8) Run Commands (after fixing items above)

From `packages/mobile/`:
1. `npx expo prebuild -p ios`
2. `cd ios && pod install`
3. `npx expo run:ios`

---

## 9) Version Hygiene and Upgrades (Post-success)
- Consider upgrading RN/Expo for iOS 18/Xcode 16 compatibility

---

## 10) iOS Readiness Checklist
- [ ] iOS native folder created via prebuild
- [ ] Pods installed successfully
- [ ] Metro/Babel aliases fixed
- [ ] Env strategy unified
- [ ] Permissions set in `Info.plist`
- [ ] Crypto adapter implemented
- [ ] Firebase split per platform
- [ ] App launches and navigates through login without errors

---

## 11) Known Risks/Blockers
- WebCrypto reliance on RN until adapter is in place
- RN Firebase vs Web SDK differences
- Monorepo resolution must be correct

---

## 12) Quick Start (Happy Path)
```
cd packages/mobile
npx expo prebuild -p ios
cd ios && pod install && cd ..
npx expo run:ios
```

---

## 13) Deliverables to add
- Create `packages/mobile/README.md` documenting env, prebuild, permissions, adapters, and run commands


