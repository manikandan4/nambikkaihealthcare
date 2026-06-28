# Frontend

The frontend lives in this folder. For full setup, architecture, API docs, and learning guide, see the **[project README](../README.md)** at the repo root.

## Quick start

1. Start the API from the repo root: `npm start`
2. Serve the whole `frontend/` folder over HTTP, not only `html/`:

   ```bash
   # run from the repo root
   npx serve frontend -p 5500
   ```

   Or, from inside this `frontend/` directory:

   ```bash
   npx serve . -p 5500
   ```

3. Open `http://localhost:5500/html/index.html` and choose a portal

If testing from another device or VM/network interface, use your machine IP:

```text
http://192.168.80.1:5500/html/index.html
```

The HTML files reference CSS and JS using paths such as `../css/app.css` and `../js/auth.js`, so the static server root must be `frontend/`. Serving only `frontend/html` will cause 404 errors for `app.css`, `auth.js`, `login.js`, and other shared files.

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