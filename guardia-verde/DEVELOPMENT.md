# Guardiã Verde — offline edition development record

Status: In development. Dr. Mason will declare when the game is finished.

## November 26, 2026 · Browser build baseline

Recover the source and assets together from [this immutable game directory](https://github.com/Aberewa-MiddleSchool/aberewa-site/tree/759f5d01c34b672ac24ac364e335817b1d130d2a/guardia-verde). The entry point is `guardia-verde/index.html`, with gameplay in `game.js`. Current runtime artwork and audio references: `emerald-night-suit.webp`, `night-brasil.webp`, `guardia-fighter.webp`, `street-fighters.webp`, `district-fighters.webp`, `guardia-voice.wav`. Some combat effects are synthesized in JavaScript.

The blind Afro-Brazilian heroine teaches blind middle school students. In futuristic Brazil she confronts an all-women drug network on night sidewalks. Her emerald suit and opaque cowl, black briefs, round Brazilian emblem, lower-body proportions and illustrated Capoeira Angola poses are part of the character design.

The build has 50 remixed stages, Easy and Normal difficulty, alternating travel direction, sloped sidewalks, front and rear encounters, ten district bosses, a halfway arrow with a beep, sprinting, jumping, four starting attack combinations and ten collectible combinations. It supports Play Arcade and Watch CPU, required name entry, automatic continues and separate local records for each mode and difficulty. Move types appear at bottom center and reais at top center. Audio includes The Forever Woman combat effects, attack grunts and a defeat cry. The game uses sound effects only.

## Offline packaging handoff

Preserve the runtime files at the same relative paths. Preserve the Logitech F310 XInput controls, browser-local player data model, and separate CPU records. Browser saves use the key `guardia-verde-v1`. When packaging begins, decide how existing browser saves should transfer. Verify cold launch with networking disabled, audio unlock, controller detection and reconnection, and saved progress after quitting and reopening with a physical F310. Previously automated campaign and controller checks covered the web build. Standalone packaging and physical offline verification are pending.

## Continuing the record

For each material game revision, append its date, immutable commit, changed mechanics or assets, and verified results. Record pending design decisions separately from shipped changes. Close this record when Dr. Mason says Guardiã Verde is finished.
