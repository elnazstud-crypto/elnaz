# Gem Quest | افسانه‌ی گوهرها

A Persian RTL fantasy match-3 puzzle project for portrait mobile play.

## Rebuilt game experience

The current campaign preview is served from `index.html` and `src/gemquest-runtime.js`:

- A fantasy level map with 10 campaign stages and saved unlock progress.
- An 8×8 jewel board with six original faceted jewel types.
- Adjacent swaps, match detection, gravity, cascades and legal-move recovery.
- Special gems: rockets, bombs and rainbow gems.
- Level objectives: score targets, collecting selected jewel colors and clearing ice overlays.
- Animated jewel facets, glow, particles, HUD, Persian RTL text and touch controls.
- Synthesized sound effects with an in-game mute state.
- Local persistence for best score and unlocked stages.
- Ads remain disabled.

## Native GDevelop project

Open `android-gdevelop/game.json` with GDevelop 5.6 or newer. It is a portrait GDevelop project with a native scene and a JavaScript event that embeds the same self-contained game runtime. The readable runtime source is `src/gemquest-runtime.js`.

The GDevelop project is an integration candidate and still requires opening in the GDevelop editor, running its Preview, and exporting/testing on Android. The existence of the project file is not proof that APK/AAB builds have completed.

## Run preview and tests

Serve the repository root with a static server, then open the local URL:

```bash
npx serve .
npm test
```

GitHub Pages preview: https://elnazstud-crypto.github.io/elnaz/

## Release gate

Before calling this a production release, the project must pass:
1. GDevelop editor open/preview without repair or runtime errors.
2. Gameplay QA across all 10 stages, including special combinations and objective completion.
3. Android APK and AAB export.
4. Installation and touch/performance checks on physical Android devices.
5. Save/resume, audio and offline behavior verification.

No APK or AAB is claimed as complete yet.
