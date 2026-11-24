# Gem Quest | افسانه‌ی گوهرها

A Persian RTL fantasy Match-3 jewel puzzle game, designed for Android-first portrait play.

## Current playable slice

- Responsive portrait 8×8 board with six original faceted SVG jewel assets.
- Adjacent tap-to-swap input and horizontal/vertical match detection.
- Invalid-move rejection, gravity, cascades and automatic shuffle when no legal move remains.
- Special creation: four-match rockets, five-match rainbow gems and intersecting L/T bombs.
- Special activation and adjacent special-gem combos.
- Score, target, move counter, best score and browser local-save/resume.
- Original particle bursts, gem entrance animation, synthesized sound effects and a light generated melody.
- Persian RTL interface and first level configuration.
- Automated engine tests and JavaScript syntax checks.

## Web preview

To enable the hosted preview, open **Settings → Pages** in this repository and set the build source to **GitHub Actions**. The deployment workflow will publish the game after that setting is enabled.

## Run locally

Serve the repository root with any static HTTP server, then open its local URL. For example:
```bash
npx serve .
```

Run checks:
```bash
npm test
```

## Architecture

- `src/engine.js`: pure Match-3 rules, special effects and board operations.
- `src/main.js`: browser UI, input, particles, audio and local save.
- `assets/gems/`: original vector jewel artwork.
- `index.html` and `styles/game.css`: responsive Persian game shell.
- `levels/level-01.json`: first level configuration.
- `docs/GDEVELOP_INTEGRATION.md`: plan for moving the validated rules into the GDevelop Android runtime.

GDevelop remains the intended authoritative runtime for the Android release. **This repository currently contains a playable browser slice and tested rules engine, not a completed native GDevelop project and not an APK/AAB.** The multi-level campaign, map, blockers, full production animation/audio asset pack, Android packaging and device QA remain future milestones.

## Asset and IP notes

The jewel SVGs and game code are original project assets. No Candy Crush logos, characters, proprietary art or audio are used. The UI requests the Vazirmatn font from Google Fonts and falls back to system fonts if unavailable; include its license notice if later bundling the font locally.
