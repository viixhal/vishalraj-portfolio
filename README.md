# Vishalraj TSR Portfolio

Production Vite + React portfolio for Vishalraj TSR. The app is a static client-side site with animated sections, project modals, resume viewer, contact links, and Vercel security headers.

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

## Structure

```txt
src/
  App.jsx
  main.jsx
  config/
    portfolioData.jsx
    theme.js
  hooks/
    useDynamicFavicon.js
    useKonamiCode.js
    useMagnetic.js
  lib/
    audio.js
    externalLinks.js
    time.js
  pages/
    PortfolioPage.jsx
  styles/
    global.css
```

## Deployment

The app builds to `dist/` with `npm run build`. Vercel headers are defined in `vercel.json`, including CSP, HSTS, frame, referrer, permissions, and content-type protections.
