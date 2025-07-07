# SimpliPass Chrome Extension

## Design System & UI Consistency

This project uses a centralized design system for all UI components and styles. All colors, spacing, typography, and radii are defined as CSS variables in `src/styles/tokens.css`.

### Design Tokens
- **Colors:** --color-primary, --color-secondary, --color-tertiary, --color-error, etc.
- **Spacing:** --spacing-xs, --spacing-sm, --spacing-md, --spacing-lg, --spacing-xl
- **Typography:** --font-size-xs, --font-size-md, --font-size-lg, --font-weight-medium, --font-weight-bold
- **Radii:** --radius-xs, --radius-md, --radius-lg, --radius-pill

### Shared Utility Classes
- `.btn`, `.btn-primary`, `.btn-secondary` — Use for all buttons
- `.input` — Use for all text/email/password fields
- `.card` — Use for all card containers
- `.empty-state` — For empty list messages
- `.spinner` — For loading indicators
- `.ripple-card`, `.btn.ripple` — For ripple effect on click
- `.text-center`, `.text-tertiary`, `.text-secondary`, `.text-bold`, `.text-md`, `.text-lg`, `.text-xl` — For typography

### How to Use
- **Never use hardcoded colors, spacing, or font sizes.** Always use the tokens and utility classes.
- **All new components must use the shared Button, Input, Card, and utility classes.**
- **See `src/styles/tokens.css` for full documentation and examples.**

---

# SimpliPass Chrome Extension

A Chrome extension for password management.

## Development Setup

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select this directory

## Project Structure

```
src/
├─ background/  # Service worker entrypoint (background logic)
│   └─ index.ts
├─ content/     # Content scripts and in-page popovers
│   ├─ content-script.ts
│   └─ popovers/
│       ├─ InPageCredentialPicker.tsx
│       ├─ OtherPopover.tsx
│       └─ InPagePickerShadowStyles.ts
├─ popup/       # Popup React app
│   ├─ pages/
│   │   ├─ HomePage.tsx
│   │   ├─ SettingsPage.tsx
│   │   └─ GeneratorPage.tsx
│   ├─ components/
│   ├─ styles/
│   └─ Popup.tsx
├─ components/  # Shared React components (Button, Icon, etc.)
├─ hooks/       # Custom React hooks
├─ api/         # API clients (Firebase, Cognito, etc.)
├─ db/          # IndexedDB utilities
├─ utils/       # Pure helpers (domain, crypto, etc.)
├─ types/       # Shared TypeScript types
└─ styles/
    └─ tokens.css  # Global design tokens (CSS variables)
```

## Development

- The extension uses Manifest V3
- Background scripts run as service workers
- Content scripts are injected into web pages
- Popup UI is defined in the popup directory

## Building

No build step is required for development. The extension can be loaded directly from the source files.

## License

MIT 