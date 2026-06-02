# Follow-ups

A running list of ideas, polish, and "nice to have" items that came up during development but weren't in scope at the time. Pull from this list when planning the next round of work.

---

## AI inventory identification (added 2026-05-30)

- **Cache identical-photo lookups** — skip the API call if the same photo URI was just identified. Probably low value since users rarely retry the same photo, but cheap to add.
- **Save the AI's confidence or raw response alongside the item** — could surface "AI-suggested" badges on fields the user didn't manually confirm, or help debug bad identifications.
- **Let the user pick the model** — expose a setting to switch between Haiku (cheap/fast) and Sonnet (smarter) for tricky items. Only worth it if Haiku quality turns out to be insufficient in practice.
- **Identify multiple items in one photo** — for a photo containing several pieces of equipment, return a list and let the user pick which one(s) to create. Larger UX change.

---

## Estate setup & onboarding UX (added 2026-06-01)

- **Name your estate on registration** — currently a new estate is created silently with no name. Add a "Estate name" field to the registration flow (or a dedicated post-signup "Set up your estate" screen). Store it in the `estates` table and display it in the Profile header eyebrow (currently hardcoded "ESTATE") and anywhere else the estate identity should appear (tab bar header, invite message, etc.).
- **Prominent "Join an existing estate" path on the sign-in screen** — the join-by-code flow currently lives only inside the registration form. Add a clear entry point on the login screen (e.g. a "Join an estate" button or link below the sign-in form) so users who have been invited don't have to hunt for it. Tapping it can route to a minimal screen with just the estate code field.

---

## Luxe redesign — remaining polish (added 2026-05-31)

Items from `design_handoff_luxe_redesign/README.md` deliberately deferred from the first pass:

- **In-app crest SVG** — recreate the "E" monogram + pediment as `react-native-svg` so it scales to any size and inherits theme colors. Use it in the splash, empty states, and the header of the Auth screens. Geometry is documented in `design_handoff_luxe_redesign/icons/ICONS.md` (viewBox `0 0 100 100`, pediment `M27 30 L50 17 L73 30`, outer rect `27,34 → 46×49 r5`, etc.).
- **Wordmark component** — crest + "Estate Manager" in Playfair 600 with an italic gold "Pro" and a small gold rule + "PRO" caps lockup beneath. For the login screen, the About section, etc.
- **Dark theme polish** — the new gold/emerald keys were mirrored to the dark palette with sensible defaults, but the README explicitly calls a refined jewel-toned dark variant out of scope for the initial pass. Worth a deliberate pass once light is final.
- **`StatusSegmented` / `AssigneePicker` / `RecurrencePicker` chip restyles** — the Edit Task screen's pickers still use the old solid-fill selected state. Spec calls for emerald-gradient fill + goldHair border + onEmerald text on the selected pill, transparent + border on unselected. Same pattern as the filter chips on Tasks/Inventory.
- **Settings → Notifications row** — README mentions a "Notifications" row alongside "Manage categories" in the Profile settings card, but the app has no Notifications screen to link to yet. Build the screen (per-category toggles? quiet hours?) and add the row.
