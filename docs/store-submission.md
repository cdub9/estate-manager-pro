# App Store / Play Store submission kit

Everything the stores need that lives outside the code. Copy-paste the listing
text, then work the checklist. Last updated 2026-06-27.

---

## Listing copy

**App name:** Estate Manager Pro

**Subtitle (iOS, ≤30 chars):** Tasks, inventory & upkeep

**Short description (Play, ≤80 chars):** Organize estate tasks, equipment, and maintenance with your whole team.

**Promotional text (iOS, ≤170 chars):** Run your household or estate from one place — assign tasks, track equipment, and never miss preventive maintenance again.

**Full description:**

> Estate Manager Pro keeps a busy household or large estate running smoothly — tasks, equipment, and the people who look after it all in one place.
>
> SHARED TASKS
> • Create tasks, assign them to family or staff, set due dates, and track progress together in real time
> • Drag to reorder, filter to “just mine,” and comment to keep everyone in sync
> • Recurring tasks repeat automatically when completed
>
> EQUIPMENT INVENTORY
> • Catalog appliances, tools, and equipment with photos, vendor, part number, and location
> • Snap a photo and let AI suggest the name, brand, and details — identify several items from a single picture
> • Link equipment to the tasks that service it
>
> PREVENTIVE MAINTENANCE
> • Schedule recurring upkeep for any asset or anything else, like landscaping
> • Custom intervals (every 90 days, every 6 months, yearly…) measured from the last service or a fixed calendar
> • See what’s overdue, due soon, and upcoming at a glance, and log a service to roll the schedule forward
>
> YOUR TEAM
> • Invite family and staff with a private estate code — everyone shares the same tasks, inventory, and schedules
> • Get a notification the moment a task is assigned to you
>
> Estate Manager Pro does not sell your data and shows no ads.

**Keywords (iOS, ≤100 chars, comma-separated):**
`estate,household,tasks,inventory,maintenance,property,staff,chores,equipment,checklist,home,team`

**Primary category:** Productivity
**Secondary category:** Lifestyle (or Utilities)

**Support URL:** https://cdub9.github.io/estate-manager-pro/ (add a simple support/contact page)
**Marketing/Privacy URL:** https://cdub9.github.io/estate-manager-pro/privacy-policy ✅ live

---

## Data safety / privacy declarations

Declare the same facts in **App Store Connect → App Privacy** and **Play Console → Data safety**.

| Data type | Collected | Purpose | Notes |
|---|---|---|---|
| Email address | Yes | Account, app functionality | Linked to identity |
| Name | Yes | App functionality (shown to estate members) | Linked to identity |
| Photos | Yes | App functionality (task/inventory images) | User-provided |
| User content (task/inventory text) | Yes | App functionality | |
| Push token / device ID | Yes | App functionality (assignment notifications) | Not used for tracking |

- **Not collected:** location, contacts, financial info, health, browsing history, ads/analytics identifiers.
- **Data is NOT used for tracking** across apps/companies, and is **not sold**.
- **Encrypted in transit** (HTTPS). **Account + data deletion available in-app** (Profile → Delete My Account).
- **Processors / third parties:** Supabase (database + auth), Expo (push delivery), and **Anthropic** — photos are sent to Anthropic *only* when the user taps “Identify with AI.” Disclose this AI processing.

---

## Submission checklist

### Both stores
- [ ] Screenshots: iPhone 6.7" and 6.5" (iPad not needed — `supportsTablet: false`); Android phone. Capture Tasks, Inventory, Maintenance, and a detail screen.
- [ ] App icon already set (`assets/images/icon.png`); confirm 1024×1024 for App Store Connect.
- [ ] Complete the age/content rating questionnaires (no objectionable content → expect 4+/Everyone).
- [ ] Provide a **demo account** for reviewers (see below).

### Demo account for review
Reviewers can’t sign up into a shared estate blind. Before submitting:
1. Register a demo account in the app (e.g. `review@estatemanagerpro.app`).
2. Add a few sample tasks, inventory items, and a maintenance schedule so the app isn’t empty.
3. Put the email + password in **App Review Information** (iOS) and **Play Console → App access** (Android).

### iOS-specific
- [ ] In `eas.json`, add an iOS submit profile (currently only Android exists):
  ```json
  "submit": {
    "production": {
      "ios": {
        "appleId": "you@example.com",
        "ascAppId": "<App Store Connect app ID>",
        "appleTeamId": "<Team ID>"
      },
      "android": { "serviceAccountKeyPath": "./google-service-account.json", "track": "internal" }
    }
  }
  ```
- [ ] Create the app record in App Store Connect (bundle `com.estatemanagerpro.app`).
- [ ] After the first `eas build`, confirm Expo generated `PrivacyInfo.xcprivacy` (privacy manifest) — SDK 55 handles required-reason APIs automatically.
- [ ] `ITSAppUsesNonExemptEncryption: false` is set ✅ (no per-submission encryption prompt).

### Android-specific
- [ ] **Closed testing requirement:** new personal Play developer accounts must run closed testing with **12+ testers for 14 consecutive days** before production access opens. Start this early — it’s a 2-week clock.
- [ ] Complete the **Permissions declaration**: CAMERA is used for task/equipment photos. (`RECORD_AUDIO` and legacy storage perms are now blocked ✅.)
- [ ] Provide the `google-service-account.json` referenced in `eas.json` for `eas submit`.

### Before you build
- [ ] **Deploy the AI Edge Function** (the Anthropic key is now server-side, not in the app). From the project root, with the Supabase CLI linked to your project:
  ```bash
  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...      # server-only secret
  supabase functions deploy identify-inventory           # keeps JWT verification on
  ```
  The function lives at `supabase/functions/identify-inventory/`. Until it's deployed with the secret, tapping "Identify with AI" shows a friendly error (no crash). No `EXPO_PUBLIC_ANTHROPIC_API_KEY` is needed anywhere anymore.
  - _Note:_ photos are sent to the function as base64 (picker quality 0.85). If very large photos ever fail on the Supabase request-size limit, add client-side downscaling (e.g. `expo-image-manipulator`) before the call.
- [ ] Redeploy GitHub Pages if it doesn’t auto-publish from the committed `docs/` so the live privacy policy stays current.
