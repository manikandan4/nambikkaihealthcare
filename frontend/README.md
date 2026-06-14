# Frontend

The frontend lives in this folder. For full setup, architecture, API docs, and learning guide, see the **[project README](../README.md)** at the repo root.

## Quick start

1. Start the API from the repo root: `npm start`
2. Serve this directory’s `html/` folder over HTTP (e.g. VS Code Live Server or `npx serve html -p 5500`)
3. Open `index.html` and choose a portal

## Key files

| Path | Role |
|------|------|
| `html/*.html` | Page shells |
| `js/api.js` | Backend fetch layer |
| `js/auth.js` | localStorage session |
| `js/permissions.js` | Role rules |
| `js/layout.js` | Nav, guards, headers |
| `js/pages/*-controller.js` | Per-page logic |
| `css/app.css` | Minimal theme on Bootstrap |