# Gem Quest — GDevelop project

This folder contains a GDevelop 5.6 project. Open `game.json` in GDevelop 5.6 or newer.

- Portrait 720×1280 project, package ID `com.gemquest.fantasyjewels`.
- One native GDevelop scene with a JavaScript event that boots the self-contained game runtime.
- Runtime source is also kept at `../src/gemquest-runtime.js`; the event embeds the same source so the project does not depend on an external network script.
- 10 playable campaign stages, map progression, 8×8 match-3 board, special gems, score/move goals, ice overlays, particles, synthesized SFX and local progress.

Important: this is a first native GDevelop integration candidate, not a verified Android release. Open it in GDevelop, run Preview, then use GDevelop Android packaging to export APK and AAB. The source has not yet been validated in the GDevelop editor or on a physical Android device. Ads are disabled; no ad SDK or ID is included.
