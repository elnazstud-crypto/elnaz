# Gem Quest | افسانه‌ی گوهرها

A Persian RTL fantasy Match-3 jewel puzzle game, designed for Android-first portrait play.

## Current build

This repository contains the first playable game slice:
- 8×8 match-3 board with six jewel types
- Adjacent swaps, match validation, gravity and cascades
- Score, moves, level target and restart
- Responsive portrait UI, Persian labels and CSS jewel rendering
- Web Audio feedback generated locally (no third-party audio assets)
- Deterministic engine tests using Node's built-in test runner

## Run locally

Open `index.html` in a modern browser, or serve the repository root with any static HTTP server.

Run engine tests:
```bash
node --test tests/engine.test.mjs
```

## Architecture

- `src/engine.js`: pure Match-3 rules and board operations.
- `src/main.js`: browser UI, input, animation and audio feedback.
- `index.html`: responsive Persian game shell and visual design.
- `levels/level-01.json`: first level configuration.
- `docs/GDEVELOP_INTEGRATION.md`: integration plan for the GDevelop-native Android project.

GDevelop is intended to remain the authoritative runtime for the Android release. This browser build is the playable rules/UI slice and a test harness, not an APK/AAB and not yet a verified native GDevelop project.

## Licensing

All code in this repository is original project code. No third-party game art, audio, fonts, or proprietary Candy Crush assets are bundled. Visual jewels are rendered with CSS gradients and shapes.
