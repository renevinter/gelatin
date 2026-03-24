# Gelatin

A progressive web app music player for [Jellyfin](https://jellyfin.org/), built with SvelteKit 2, Svelte 5, and Tailwind CSS v4.

## Features

- Browse your music library (artists, albums, songs)
- Full-text search across artists, albums, and songs
- Play queue with next/previous, shuffle, and repeat
- Playlist support (view, play, create)
- Favorites (mark/unmark songs, albums, artists)
- Synced lyrics display
- Dark and light mode (with system preference detection)
- Keyboard shortcuts for playback control
- MediaSession API integration (lock screen controls)
- PWA with offline support (installable, caches images and audio)
- Responsive layout (mobile bottom nav, desktop sidebar)

## Getting Started

### Prerequisites

- Node.js 18+
- A running Jellyfin server (10.11.x recommended)

### Install

```bash
git clone <repo-url> gelatin
cd gelatin
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 and sign in with your Jellyfin server URL and credentials.

### Build

```bash
npm run build
npm run preview
```

The production build outputs to `build/` as static files, deployable to any static host (Nginx, Caddy, Cloudflare Pages, Vercel, Netlify, etc.).

### PWA Icons

Replace `static/icon-192.svg` with your own icons. For full PWA compatibility, provide PNG icons at 192x192 and 512x512 named `icon-192.png` and `icon-512.png` in the `static/` directory.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play / Pause |
| Arrow Right | Seek forward 10s |
| Arrow Left | Seek backward 10s |
| Shift + Arrow Right | Next track |
| Shift + Arrow Left | Previous track |
| Shift + Arrow Up | Volume up |
| Shift + Arrow Down | Volume down |
| M | Mute / Unmute |

## Tech Stack

- **SvelteKit 2** + **Svelte 5** (runes)
- **Tailwind CSS v4**
- **@jellyfin/sdk** for typed API access
- **@vite-pwa/sveltekit** + Workbox for PWA/offline
- **idb** for IndexedDB offline audio caching
- **adapter-static** for SPA deployment

## License

MIT
