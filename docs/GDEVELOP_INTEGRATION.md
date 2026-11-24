# GDevelop integration plan

## Runtime ownership

GDevelop remains the Android runtime and packaging authority. This repository currently contains a browser-playable vertical slice and a pure JavaScript rules engine. Do not claim this is already a native GDevelop project.

## Integration approach

1. Create a portrait GDevelop project at 720×1280 or an adaptive portrait resolution.
2. Create the gameplay scene and UI objects (score, moves, target, board frame, overlay).
3. Add `src/engine.js` as a project JavaScript resource or port its pure functions into a GDevelop JavaScript event/extension.
4. Use GDevelop events for scene lifecycle, pointer/touch input, audio and tweens.
5. Use the engine only for board rules: match detection, legal swap, gravity, cascade and special creation.
6. Keep rendering and animation in GDevelop; do not manipulate GDevelop event variables directly from shared engine code.
7. Load `levels/level-01.json` as a JSON resource and validate it before use.
8. Test in GDevelop Preview, then export Android APK for device QA and AAB for store preparation.

## Required GDevelop scene objects

- BoardFrame (Sprite or NinePatch)
- Jewel (Sprite object, one animation per gem type and special state)
- ScoreText, MovesText, TargetText, LevelText
- PauseButton, ShuffleButton, SoundButton
- Particle emitter for match bursts
- Full-screen transition overlay

## Event flow

- At scene start: load level JSON, initialize board, set score and moves.
- On touch: map pointer position to board row/column.
- On adjacent second touch: call swap validation.
- If invalid: animate swap back.
- If valid: tween jewel positions, play swap sound, resolve all match waves.
- For each wave: animate clear particles, play clear sound, update score, drop surviving jewels, spawn new jewels, then scan again.
- On objective complete: show victory sequence and persist unlock.
- On moves exhausted: show retry/level-failed sequence.
- If no legal move exists: shuffle the board without creating initial matches.

## Visual direction

Fantasy jewel garden, deep indigo and teal backdrop, gold highlights, luminous jewel facets, soft bloom, restrained particles and springy easing. Build a distinct brand; do not copy Candy Crush logos, characters, level map or proprietary art.

## Android release gate

A release candidate is not complete until the GDevelop project opens without repair prompts, all core interactions work in preview, touch targets are comfortable, save/load is verified, performance is checked on a real Android device, and APK/AAB exports complete successfully.


## Current browser-slice capabilities

The shared rules engine currently handles adjacent swaps, match detection, gravity, cascades, legal-move checks, rocket/bomb/rainbow creation and activation. Adjacent special swaps are passed into the resolver as a special-combo wave. The browser slice persists the current board, moves and score with localStorage.

## Remaining work before Android release

- Build and validate the actual GDevelop project file and scene/event serialization.
- Recreate the board and animations as GDevelop scene objects and tweens.
- Implement chapter map, multiple level objectives, blockers, boosters and level progression.
- Replace browser localStorage with GDevelop-supported persistent storage for Android.
- Integrate licensed music/SFX files and production-grade particle effects.
- Test on physical Android devices, then export and verify APK and AAB.
