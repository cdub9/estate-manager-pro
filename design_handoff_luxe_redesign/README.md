# Handoff: Estate Manager Pro — "Luxe" Redesign

## Overview
This package re-skins the existing **Estate Manager Pro** Expo / React Native app with a
refined, luxury identity for managing high-end estates. It replaces the current
cream + forest-green theme with an **estate-emerald + antique-gold on parchment-ivory**
scheme, introduces a **Playfair Display** serif for display type, and adds a new
**monogram-crest logo / app icon**.

It is a **restyle, not a re-architecture**. Screen structure, navigation, data flow,
and component responsibilities are unchanged. The work is almost entirely in:
- `src/constants/colors.ts` and `src/constants/typography.ts` (tokens + fonts)
- the shared components (`TaskCard.tsx`, `InventoryCard.tsx`, `Avatar.tsx`, `Button.tsx`, `EmptyState.tsx`, the tab bar in `app/(tabs)/_layout.tsx`)
- light visual additions (gold hairline rules, a crest asset, status glyphs)

## About the Design Files
The files in `prototypes/` are **design references authored in HTML/React (JSX)** — they
show the intended look, spacing, color, and type, rendered inside an on-screen iPhone
frame. **They are not production code to copy.** Your task is to reproduce this look in
the **existing Expo / React Native + expo-router codebase**, using its established
patterns (`StyleSheet`, the `Feather` icon set from `@expo/vector-icons`, the existing
`colors.ts` token module, etc.).

Concretely:
- The prototype renders web DOM with inline styles. Translate those to React Native
  `StyleSheet` objects / props.
- Where the prototype uses CSS `linear-gradient`, use **`expo-linear-gradient`** (the
  emerald button/header fills and the app icon background are gradients).
- Where the prototype uses `feather-icons` web, use the matching **`Feather`** glyph
  (same icon names) you already import.
- The serif font must be loaded via `expo-font` / `@expo-google-fonts/playfair-display`.

## Fidelity
**High-fidelity (hifi).** Colors, type, spacing, and radii below are final — match them
pixel-for-pixel. Where a value isn't specified, follow the prototype.

---

## Design Tokens

### Color — `src/constants/colors.ts`
Your file exports `AVATAR_COLORS`, `CATEGORY_COLORS = AVATAR_COLORS`, and a default
`{ light, dark, radius }`. Below is a **direct drop-in** for the existing keys plus a few
**new keys** to add (gold/emerald ramp + on-emerald foreground). Keep the same key names
so no call-sites break; just change values and append the new keys.

**Replace `AVATAR_COLORS`** (jewel-toned set — also drives `CATEGORY_COLORS`):
```ts
export const AVATAR_COLORS = [
  "#103b2f", "#7d2a32", "#3a4a6b", "#6b3a5a",
  "#8f7338", "#2f5b5e", "#7a4a2e", "#4a3a6b",
];
```

**`light` — existing keys, new values:**

| Existing key            | New value     | Notes                                         |
|-------------------------|---------------|-----------------------------------------------|
| `text`                  | `#1b2a23`     | ink green                                     |
| `tint`                  | `#103b2f`     | emerald                                        |
| `background`            | `#f3ecdd`     | parchment ivory                               |
| `foreground`            | `#1b2a23`     |                                               |
| `card`                  | `#fbf8f1`     | warm paper                                    |
| `cardForeground`        | `#1b2a23`     |                                               |
| `primary`               | `#103b2f`     | emerald (use gradient fill where prominent)   |
| `primaryForeground`     | `#ecdcb0`     | warm gold-cream text on emerald               |
| `secondary`             | `#ece3d0`     | secondary surface / segmented track           |
| `secondaryForeground`   | `#3c4a40`     |                                               |
| `muted`                 | `#ece4d3`     | muted surface (inner dividers/wells)          |
| `mutedForeground`       | `#8a8472`     | meta text, placeholders (sage-taupe)          |
| `accent`                | `#b5934d`     | **now antique gold** (was orange)             |
| `accentForeground`      | `#1b2a23`     | dark ink on gold                              |
| `destructive`           | `#9c3b32`     | overdue / delete                              |
| `destructiveForeground` | `#f4ecd8`     |                                               |
| `border`                | `#e2d9c4`     |                                               |
| `input`                 | `#e2d9c4`     |                                               |
| `success`               | `#1c5141`     | emerald-leaning success                       |
| `warning`               | `#c79a3e`     | gold-amber                                    |
| `statusInProgressBg`    | `#f3e7c9`     | soft gold                                     |
| `statusInProgressFg`    | `#8f7338`     | deep gold                                     |
| `statusDoneBg`          | `#d8e6da`     | emerald tint                                  |
| `statusDoneFg`          | `#103b2f`     | emerald                                       |
| `bulletColor`           | `#b6ad97`     | faint sage                                    |

**`light` — NEW keys to add** (referenced by the redesign for hairlines, gradients, gold):

| New key          | Value                      | Usage                                         |
|------------------|----------------------------|-----------------------------------------------|
| `gold`           | `#b5934d`                  | antique gold solid                            |
| `goldBright`     | `#cda85c`                  | gold highlight / icons on emerald (`#e8cf88`) |
| `goldDeep`       | `#8f7338`                  | gold text on light, label caps                |
| `goldHair`       | `rgba(150,121,62,0.42)`    | hairline borders, avatar/button rings         |
| `emeraldDeep`    | `#0b2c22`                  | gradient end / deep pine                      |
| `emeraldSoft`    | `#1c5141`                  | gradient start                                |
| `borderSoft`     | `#ece4d3`                  | inner list-row dividers                       |
| `faint`          | `#b6ad97`                  | disabled, empty-avatar outline                |
| `onEmerald`      | `#ecdcb0`                  | text on emerald fills (`primaryForeground`)   |
| `onEmeraldIcon`  | `#e8cf88`                  | icon color on emerald fills                   |

**`dark` theme:** out of scope for this pass. To keep it compiling, mirror the new keys
into `dark` (the object is typed `typeof light`, so every new key must exist there too) —
reuse sensible dark equivalents, e.g. `gold:"#cda85c"`, `goldDeep:"#cda85c"`,
`goldHair:"rgba(205,168,92,0.35)"`, `emeraldDeep:"#0b2c22"`, `emeraldSoft:"#1c5141"`,
`onEmerald:"#ecdcb0"`, `onEmeraldIcon:"#e8cf88"`, `borderSoft:"#2e3822"`, `faint:"#4a5240"`.
A polished jewel-toned dark variant can be a follow-up.

**`radius`:** change the exported `radius: 14` → **`radius: 16`**.

**Gradients** (use `expo-linear-gradient`):
- **Emerald fill** (buttons, header add-button, tab-icon chips, active chips/pills):
  `['#1c5141', '#103b2f', '#0b2c22']`, direction ≈ top-left → bottom-right (start `{x:0,y:0}` → end `{x:0.4,y:1}`).
- **Gold** (crest, monogram, small numerals): `['#e8cf88', '#c8a55e', '#9c7d3c', '#d2ad64']`,
  start `{x:0,y:0}` → end `{x:0.7,y:1}`. For gold *text* in RN, use a `MaskedView` over a
  `LinearGradient`, or fall back to solid `goldDeep`/`goldBright` if a mask is overkill.

### Spacing & radii
- Screen horizontal padding: **20px** (was 16). Card internal padding: **14–18px**.
- Gap between list cards: **9px**. Section gaps on Profile: **14px**.
- Radii: cards/inputs **16px** (`radius`), small inputs/box **12px**, pills **999px**,
  avatars fully round. App icon corner radius = **22.5%** of icon size (iOS squircle).
- Card shadow (very soft): `0 1px 2px rgba(27,42,35,0.03)`. Emerald buttons add
  `0 0 0 1px goldHair` ring + `0 4px 10px rgba(11,44,34,0.18)`.

### Typography — `src/constants/typography.ts`
Keep Inter (already loaded). **Add Playfair Display** for display/titles.

| Role                  | Family                       | Size / weight / spacing                       |
|-----------------------|------------------------------|-----------------------------------------------|
| Screen title          | Playfair Display 600         | 30px, letter-spacing 0.2                      |
| Card title (task/item)| Playfair Display 500         | 16px, line-height 20px                        |
| Detail header title   | Playfair Display 600         | 18px                                          |
| Big numerals (counts) | Playfair Display 600         | 17px (gold)                                   |
| Eyebrow / labels      | Inter 600                    | 10.5px, **letter-spacing 2**, UPPERCASE, gold |
| Body / meta           | Inter 400/500                | 11.5–14.5px                                   |
| Button / chip text    | Inter 600                    | 12–13.5px                                     |

Load via:
```
import { useFonts } from 'expo-font';
import { PlayfairDisplay_500Medium, PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
```
(`expo install @expo-google-fonts/playfair-display expo-linear-gradient`)

---

## Screens / Views

### 1. Tasks — `app/(tabs)/index.tsx` + `src/components/TaskCard.tsx`
- **Header:** small gold eyebrow with the estate name (e.g. "HOLLOWAY ESTATE") above a
  30px Playfair "Tasks" title. Right side: round 42px **emerald-gradient** add button with
  a gold `plus` and a `goldHair` ring. 1px `border` bottom rule on the header.
- **Search row:** `card` surface, 1px `border`, 12px radius, `search` icon in `muted`.
- **Filter chips:** pills. Active = emerald-gradient fill + `onEmerald` text + goldHair
  border; inactive = transparent + `border` + `inkSoft`. (`All`, `Mine · 3`, `Completed`.)
- **Task card** (restyle existing `TaskCard`):
  - Left **3px category accent stripe** (category color; default gold).
  - **Status glyph** (22px): `done` = emerald-gradient circle w/ goldHair ring + gold check;
    `in_progress` = gold ring + gold dot; `open` = `faint` hollow ring.
  - **Title** in Playfair 500 16px; strike-through + 0.6 opacity when done.
  - **Meta row:** due (calendar icon + label; tone color: overdue/today = destructive,
    soon = goldDeep, later = muted), category name in its color, inventory count (`tool`
    icon), recurring (`repeat` icon). Items separated by a 3px `faint` dot.
  - **Assignee stack** right-aligned: overlapping 25px avatars (gold-ring), `+N` chip past 3.
- Card = `card` bg, 1px `border`, 16px radius, soft shadow.

### 2. Inventory — `app/(tabs)/inventory.tsx` + `src/components/InventoryCard.tsx`
- Same header pattern (eyebrow + "Inventory"), search, chips (`Active`, `Archived · 4`).
- **Inventory card:** 54px **emerald-gradient** thumbnail tile with goldHair inset ring and
  a gold `package` icon (use the real photo when present, this is the empty state).
  Title Playfair 500 16px. Meta: `vendor · partNumber`, then location (`map-pin`).
  Right edge: large **gold numeral** task-count over a tiny "TASKS" eyebrow (hidden if 0).

### 3. Profile — `app/(tabs)/profile.tsx`
- Title row "Profile" (with "ACCOUNT" eyebrow) + `edit-2` in goldDeep, 1px bottom rule.
- **Identity card:** centered 72px gold-ring avatar, Playfair 21px name, muted email, a
  **gold flourish divider** (hairline–diamond–hairline), then a timezone eyebrow.
- **Estate card:** "THE ESTATE" eyebrow; private join code in Playfair 24px emerald with
  wide letter-spacing (e.g. `K7M·9XP`); emerald-gradient "Invite" button (`share-2`).
  Hairline divider. "MEMBERS" eyebrow; member rows = 36px avatar + name (`· You` for self)
  + role + `chevron-right`, separated by `borderSoft` rules.
- **Settings card:** rows ("Manage categories" `tag`, "Notifications" `bell`) with goldDeep
  icons + chevrons.
- **Appearance** (keep existing light/dark/system control if present): segmented control,
  active segment = emerald-gradient.

### 4. Edit Task (detail) — `app/task/[id].tsx`
- **Header bar** on `card` with a gold hairline bottom gradient rule: `arrow-left`,
  Playfair 18px "Edit Task", `trash-2` in destructive, emerald-gradient **Save** button.
- **Fields** stacked 18px apart, each with an uppercase gold eyebrow label:
  - Title (Playfair inside the box), Description (multiline box, 74px min).
  - **Status** segmented control on a `backgroundDeep` track w/ `border`; active segment =
    `card` with goldHair ring + soft shadow, emerald text.
  - **Assignees:** selectable avatar pills — selected = emerald-gradient fill + goldHair
    border + `onEmerald` text; unselected = `card` + `border`.
  - **Due date:** box with `calendar` (goldDeep) + value + clearable `x`.
  - **Recurrence:** pills (`None`/`Daily`/`Weekly`/`Monthly`/`Quarterly`), selected =
    emerald-gradient.

### Tab bar — `app/(tabs)/_layout.tsx`
- `card` background, top **gold hairline gradient rule** (transparent→goldHair→transparent).
- Icons: `check-square` / `package` / `user`. Active = emerald + 600 label + a small
  **gold diamond** (4px, rotated 45°) under the active tab; inactive = muted.

---

## Brand: Logo & App Icon
See the "Identity" board at the top of the prototype and `lux-brand.jsx` (`Crest`,
`AppIcon`, `Wordmark`).

- **Crest:** a serif **"E" monogram** centered inside a rounded shield, topped by a small
  **architectural pediment** (the angled roofline), drawn with **gold double hairline rules**
  on emerald. Recreate as a single **SVG** (`react-native-svg`) so it scales crisply — the
  prototype's `Crest` component is the exact geometry (viewBox `0 0 100 100`: pediment path
  `M27 30 L50 17 L73 30`, outer rect `27,34 46×49 r5`, inner rect inset 3.5 at 70% stroke
  opacity, "E" centered at baseline y≈68 in Playfair 600 ~40px, gold gradient fill).
- **App icon:** emerald-gradient squircle (radius 22.5%), faint top-left radial sheen
  `radial-gradient(120% 90% at 30% 18%, rgba(255,255,255,0.10), transparent 55%)`, crest at
  ~78% of icon size, no inner background. Export the required iOS/Android sizes via your
  `app.json` `icon` / `adaptive-icon` (1024px master). I can generate PNGs if you want them.
- **Wordmark:** crest + "Estate Manager" (Playfair 600) with an italic gold "Pro", and a
  small gold rule + "PRO" caps lockup beneath.

---

## Interactions & Behavior
No new flows. Preserve all existing handlers: tap task → `app/task/[id]`, tap add →
create, status glyph tap cycles/toggles status, assignee pills toggle, chips filter,
search filters, pull-to-refresh, haptics (the existing `expo-haptics` calls in `TaskCard`
stay). Keep current transitions; the redesign adds no new animation requirements beyond
matching active/selected states above.

## State Management
Unchanged. This is a visual layer only — no new state, data fetching, or storage.

## Assets
- **Crest / app icon:** ready-made PNGs are in `icons/` (`icon.png` 1024 master,
  `adaptive-icon-foreground.png` + `adaptive-icon-background.png` for Android, `favicon.png`,
  plus a masked preview). Wiring + `app.json` snippet are in `icons/ICONS.md`. For the crest
  used *inside* the UI, recreate as SVG (geometry above) so it scales and themes cleanly.
- **Icons:** existing `Feather` set (`@expo/vector-icons`) — same names as the prototype.
- **Fonts:** Inter (existing) + Playfair Display (add via `@expo-google-fonts`).

## Files in this bundle (`prototypes/`)
- `Estate Manager Pro - Luxe Redesign.html` — open in a browser to see all screens + the brand board on a canvas.
- `lux-brand.jsx` — tokens, `Crest`, `AppIcon`, `Wordmark`, avatars, icon helper (source of truth for exact values).
- `lux-screens.jsx` — all four screens + shared chrome (header, search, chips, tab bar, cards).
- `ios-frame.jsx`, `design-canvas.jsx` — presentation scaffolding only; **ignore** for implementation.

## Suggested implementation order
1. Update `colors.ts` (light theme) + load Playfair in `typography.ts` / root layout.
2. Add `expo-linear-gradient` + a small `<EmeraldFill>` / `<GoldText>` helper.
3. Build the `Crest` SVG; wire `app.json` icon.
4. Restyle shared components: `Avatar`, `TaskCard`, `InventoryCard`, tab bar, `Button`, `EmptyState`.
5. Restyle screens: Tasks → Inventory → Profile → Edit Task.
6. QA against the prototype screen-by-screen.
