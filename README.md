# Track Anarchy

A build-rule mod for **Subway Builder**. Enable it and the game's construction limits come off — sharp curves, near-vertical grades, zero clearances, overlapping tracks, any-size stations, at-grade road crossings, and an effectively unlimited build-height range. Build (almost) anything.

## What it does

On load (and on every city/save load) it relaxes the build rules across all train types, in two layers:

**Per-train build stats** (via `modifyTrainType`)
- **Curves** — minimum turn radius (track + station) dropped to a few meters
- **Grade** — maximum slope effectively unlimited
- **Clearance & spacing** — zero track clearance; parallel tracks can overlap
- **Station size** — build platforms of (almost) any length
- **Curve speed** — no speed penalty through tight curves
- **Road crossings** — at-grade track can cross roads

**Global build constants** (via `modifyConstants`)
- **Elevation range** — build effectively unlimited high or deep (was −100 m to +20 m)
- **Vertical clearance** — stations and tunnels can touch (zero clearance)
- **Foundation gap** — build flush against building foundations
- **Track length** — any segment length

## Usage

1. Enable **Track Anarchy** in **Settings → Mods** (restart if it doesn't appear).
2. That's it — the limits are off while the mod is enabled. No UI.

## Install (from source)

Requires **Node 20+** and **pnpm**.

```bash
pnpm install
pnpm build        # outputs dist/index.js
pnpm dev:link     # symlinks dist/ into the game's mods folder
pnpm dev          # watch + launch the game with logging
```

Mods folder: `~/Library/Application Support/metro-maker4/mods/` (macOS),
`%APPDATA%\metro-maker4\mods\` (Windows), `~/.config/metro-maker4/mods/` (Linux).

## Notes

- Targets Modding API v1.0.0.
- Some limits are **hardcoded** in the game and can't be lifted: stations must start and end level, tracks can't connect across different track types, no building-collision or track-overlap, and no airport runway/taxiway crossings.
- Values are intentionally aggressive (zero clearances, extreme grades). They lift *build* limits — physics still applies, so a truly vertical grade won't actually run trains.
