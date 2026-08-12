# Handoff: Estate Manager Pro — Luxe Redesign

## Overview
A high-fidelity redesign of the Estate Manager Pro mobile app using a luxury "estate" aesthetic: estate emerald + antique gold palette, Raleway + Inter typography, and a monogram-crest app identity. This covers the four main screens (Tasks, Inventory, Profile, Edit Task) plus a brand/identity board.

## About the Design Files
The files in this bundle are **design references built in HTML/JSX** — pixel-perfect prototypes showing intended look and interactions. Your task is to **recreate these designs in your existing app codebase** (React Native, Swift/SwiftUI, Flutter, etc.) using your established patterns and libraries. Do not ship the HTML files directly.

- `Estate Manager Pro - Luxe Redesign.html` — interactive prototype (open in a browser to explore)
- `lux-brand.jsx` — design tokens, logo/icon components, shared primitives
- `lux-screens.jsx` — all four screen implementations

## Fidelity
**High-fidelity.** Colors, typography, spacing, border radii, shadows, and interactions are all final. Recreate pixel-precisely using your codebase's component system.

---

## Design Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| `bg` | `#F3ECDD` | Parchment ivory — screen background |
| `bgDeep` | `#ECE3D0` | Slightly deeper parchment — segmented control bg |
| `card` | `#FBF8F1` | Warm paper — card & tab bar surface |
| `ink` | `#1B2A23` | Deep ink-green — primary text |
| `inkSoft` | `#3C4A40` | Secondary text |
| `muted` | `#8A8472` | Sage-taupe — placeholder, metadata |
| `faint` | `#B6AD97` | Hairline borders, empty states |
| `emerald` | `#103B2F` | Estate emerald — active states, icons |
| `emeraldDeep` | `#0B2C22` | Gradient stop |
| `emeraldSoft` | `#1C5141` | Gradient stop |
| `gold` | `#B5934D` | Antique gold — accents, tab indicator |
| `goldBright` | `#CDA85C` | Bright gold |
| `goldDeep` | `#8F7338` | Deep gold — eyebrow labels |
| `goldHair` | `rgba(150,121,62,0.42)` | Hairline gold ring — borders on active/emerald elements |
| `border` | `#E2D9C4` | Default card/input border |
| `borderSoft` | `#ECE4D3` | Intra-card dividers |
| `destructive` | `#9C3B32` | Red-brown — overdue dates, delete |

### Gradients
```
Emerald gradient: linear-gradient(160deg, #1C5141 0%, #103B2F 52%, #0B2C22 100%)
Gold gradient:    linear-gradient(150deg, #E6CD86 0%, #C8A55E 38%, #9C7D3C 72%, #CDAA63 100%)
```
The emerald gradient is used for: primary buttons, active chips, tab-bar active icon bg, inventory item icon bg, avatar backgrounds, app icon.

### Typography
| Role | Font | Weight | Size | Notes |
|---|---|---|---|---|
| Display / screen title | Raleway | 600 | 30px | Line-height 1 |
| Card / item title | Raleway | 500 | 20px | Line-height 24px, ellipsis overflow |
| Wordmark | Raleway | 600 | 24px | |
| Nav bar title | Raleway | 600 | 18px | |
| Profile name | Raleway | 600 | 25px | |
| Join code | Raleway | 700 | 24px | Letter-spacing 5 |
| Body / row labels | Inter | 500–600 | 14–14.5px | |
| Tab bar labels | Inter | 500/600 | 10.5px | Letter-spacing 0.3 |
| Metadata / subtext | Inter | 500–600 | 11.5px | |
| Eyebrow caps | Inter | 600 | 10.5px | All-caps, letter-spacing 2, gold-deep color |

**Google Fonts import:**
```
Raleway: ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600
Inter: wght@400;500;600;700
```

### Spacing & Shape
| Token | Value |
|---|---|
| Card border radius | 16px |
| Input/field radius | 12px |
| Chip radius | 999px (pill) |
| Avatar ring | `box-shadow: 0 0 0 1px rgba(150,121,62,0.42)` |
| Card shadow | `0 1px 2px rgba(27,42,35,0.03)` |
| Emerald button shadow | `0 0 0 1px rgba(150,121,62,0.42)` |

---

## Screens

### 1. Tasks
**Purpose:** Main task list with filter chips and search.

**Layout (top → bottom):**
- Status bar spacer: 56px height
- `LuxHeader` — eyebrow "Holloway Estate" + title "Tasks" + emerald `+` FAB (42×42, pill)
- Search bar — 14px Inter placeholder, 1px border, 12px radius, 10px/13px padding
- Filter chips — "All" (active, emerald gradient), "Mine · 3", "Completed" — pill, 6px/14px padding
- Task list — `flex column`, gap 9px, 20px horizontal padding

**TaskCard anatomy:**
- 3px left accent bar (category color)
- 22×22 StatusGlyph (open = faint ring, in-progress = gold ring + gold dot, done = emerald fill + gold checkmark)
- Title: Raleway 500 20px / 24px, `#1B2A23`, ellipsis. Strike-through + 0.6 opacity when done.
- Metadata row (Inter 600 11.5px): due date (color-coded) · category (category color) · inventory count · recurrence icon
- Assignee stack (right): 28px avatars overlapping by 11px, +N overflow badge

**Category colors:**
- Maintenance: `#7A4A2E`
- Vendors: `#3A4A6B`
- Supplies: `#8F7338`
- Household: `#6B3A5A`
- Admin: `#2F5B5E`

**Due date tones:**
- `today` / `overdue` → `#9C3B32` (destructive)
- `soon` → `#8F7338` (goldDeep)
- `later` → `#8A8472` (muted)

---

### 2. Inventory
**Purpose:** Equipment/supplies registry.

**Layout:** Same shell as Tasks (status bar → header → search → chips → list → tab bar).

**InventoryCard anatomy:**
- 54×54 icon thumbnail: emerald gradient bg, 11px radius, gold hairline inset border, package icon 22px `#CDA85C`
- Title: Raleway 500 20px / 24px
- Subtext: `vendor · partNumber` · location (with map-pin icon), Inter 500 11.5px muted
- Task count badge (right, if > 0): gold-gradient text Raleway 600 17px + "TASKS" eyebrow 8px

---

### 3. Profile
**Purpose:** User account, estate join code, team roster, settings.

**Layout:**
- Status bar spacer 56px
- Page header (inline, no separate component): eyebrow "Account" + title "Profile" (30px) + edit icon
- Avatar card: centered 72px avatar, name Raleway 600 25px, email Inter 12.5px muted, gold flourish rule, timezone eyebrow
- Estate card: join code Raleway 700 24px letter-spacing-5, emerald Invite button with share icon
- Members list: 36px avatars, name Inter 600 14px, role Inter 11.5px muted, chevron
- Settings rows: icon (17px goldDeep) + label Inter 500 14.5px + chevron, 13px padding block

**Gold flourish rule:** thin hairline lines with a 4×4px rotated diamond in the center.

---

### 4. Edit Task (Detail)
**Purpose:** Edit an existing task's fields.

**Layout:**
- Status bar spacer 56px
- Nav bar: back arrow + "Edit Task" Raleway 600 18px + trash icon + emerald Save button
- Scrollable form fields with 18px gaps: Title, Description, Status segmented control, Assignees, Due date, Recurrence

**Status segmented control:** 3-segment pill on `#ECE3D0` bg, active segment gets white card bg + gold hairline shadow.

**Recurrence chips:** same pill style as filter chips.

**Assignee chips:** small avatar (22px) + first name, emerald gradient when selected.

---

## Tab Bar
Three tabs: Tasks (check-square), Inventory (package), Profile (user).

- Active: emerald color `#103B2F`, weight 2 stroke, 4×4px rotated gold diamond indicator below label
- Inactive: muted `#8A8472`, weight 1.7 stroke
- Surface: `#FBF8F1` (card), 1px top border, gold hairline gradient overlay at top edge
- Labels: Inter 500/600 10.5px, letter-spacing 0.3

---

## App Icon & Identity

**App Icon:** Squircle (border-radius ≈ 22.5% of size), emerald gradient fill, radial highlight at top-left, centered crest at 92% of icon size.

**Crest:** SVG monogram — architectural pediment (triangle) above a double-rule shield, gold "E" letterform at center. All strokes use gold gradient. Rendered as an SVG with inline `<linearGradient>` definitions.

**Wordmark:** 52px crest + column of ["Estate Manager" Raleway 600 24px + gold hairline rule + "PRO" spaced caps with gold gradient text].

---

## Interactions & Behavior
- Completed tasks: 0.6 opacity + strikethrough title
- Active filter chip: emerald gradient bg, `#ECDCB0` text, gold hairline border
- Active tab: emerald icon + bold label + gold diamond pip
- Status segmented control: white card segment with gold hairline for active state
- Selected assignee chip: emerald gradient bg

---

## Icons
Uses **Feather Icons** (`feather-icons` npm package). Key icons used:
`check-square`, `package`, `user`, `plus`, `search`, `calendar`, `tool`, `repeat`, `map-pin`, `chevron-right`, `arrow-left`, `trash-2`, `edit-2`, `share-2`, `bell`, `tag`, `check`, `x`

All icons: stroke-based, stroke-width 1.7–2.0, sized 11–22px depending on context.

---

## Assets
No external images. All visual elements are CSS gradients, SVG, or icon glyphs. The monogram crest is a self-contained inline SVG (see `Crest` component in `lux-brand.jsx`).
