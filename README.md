# SimpliPass Chrome Extension

A Chrome extension for password management.

## Development Setup

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select this directory

## Project Structure

```
├── manifest.json          # Extension configuration
├── popup/                 # Popup UI files
│   ├── popup.html        # Popup HTML
│   ├── popup.css         # Popup styles
│   └── popup.js          # Popup logic
├── background/           # Background scripts
│   └── background.js     # Service worker
├── content/             # Content scripts
│   └── content.js       # Page injection script
└── assets/             # Static assets
    └── icons/          # Extension icons
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