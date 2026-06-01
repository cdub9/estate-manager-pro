# App Icon & Logo Assets

Crest = serif **"E"** monogram under an architectural pediment, antique-gold hairlines on
estate emerald. All PNGs were rendered at native resolution from the design geometry
(`lux-brand.jsx → Crest / AppIcon`).

## Files
| File | Size | Purpose |
|------|------|---------|
| `icon.png` | 1024×1024 | **iOS / master.** Full-bleed square — iOS applies its own rounded mask. Use as Expo `icon`. |
| `icon-rounded-preview.png` | 1024×1024 | Reference only — shows how the icon looks once iOS masks it. Don't ship. |
| `adaptive-icon-foreground.png` | 1024×1024 | **Android adaptive foreground** — crest on transparent, kept inside the 66% safe zone. |
| `adaptive-icon-background.png` | 1024×1024 | **Android adaptive background** — emerald gradient field. |
| `favicon.png` | 48×48 | Web favicon. |
| `icon-180.png`, `icon-120.png` | — | Reference rasters (iPhone @3x / @2x) for spot-checks. |

> The icon background is a **gradient**, so a single 1024 master + the adaptive layers are
> all you ship — no per-size bitmap set needed. Expo/EAS generates the rest at build time.

## Wiring into `app.json` / `app.config`
Copy the four production PNGs into the app's `assets/` and point Expo at them:

```jsonc
{
  "expo": {
    "icon": "./assets/icon.png",
    "web": { "favicon": "./assets/favicon.png" },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon-foreground.png",
        "backgroundImage": "./assets/adaptive-icon-background.png"
        // or, instead of backgroundImage:  "backgroundColor": "#103b2f"
      }
    }
  }
}
```

## In-app crest (not the launcher icon)
For the crest used *inside* the UI (headers, splash, empty states), recreate it as a
**vector** with `react-native-svg` rather than dropping a PNG — it stays crisp at every
size and inherits theme colors. The exact geometry is in `prototypes/lux-brand.jsx`
(`Crest`): viewBox `0 0 100 100`, pediment `M27 30 L50 17 L73 30`, outer rect
`27,34 → 46×49 r5`, inner rect inset to `30.5,37.5 → 39×42 r3` at 70% stroke opacity,
"E" in Playfair 600 ≈40px centered at baseline y≈68.5, all in the gold gradient
(`#e8cf88 → #c8a55e → #9c7d3c → #d2ad64`).
