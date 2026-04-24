# Estate Manager

Mobile app (Expo) for managing an estate: tasks, equipment inventory, and the people who keep the place running.

## Artifacts

- `artifacts/estate-manager` — Expo mobile app (primary deliverable)
- `artifacts/api-server` — scaffolded API server (unused; this build is local-first)
- `artifacts/mockup-sandbox` — scaffolded design canvas (unused)

## Estate Manager — Architecture

Local-first app using AsyncStorage. No backend.

### State (React contexts)
- `AuthContext` — list of users on device + current session
- `CategoriesContext` — category CRUD with color palette
- `TasksContext` — task CRUD, completion toggle, recurring task auto-cloning, manual reorder, inventory + category unlinking on delete
- `InventoryContext` — equipment CRUD

### Storage keys
- `estate.users` — User[]
- `estate.session` — current user id
- `estate.categories` — Category[]
- `estate.tasks` — Task[]
- `estate.inventory` — InventoryItem[]

### Routes
- `(auth)/login`, `(auth)/register` — authentication flows
- `(tabs)/index` — Tasks list (filters: All / Mine / Open / Done, category chips, search; long-press to reorder when no filters active)
- `(tabs)/inventory` — Equipment catalog (search)
- `(tabs)/profile` — Account, stats, switch user, edit profile, link to categories, sign out
- `task/new`, `task/[id]` — create/edit task (status, assignee, due date, category, recurrence, photos, linked equipment)
- `inventory/new`, `inventory/[id]` — create/edit equipment (name, vendor, part #, location, description, photo, linked tasks)
- `categories` — manage categories (name, color, in-use count, delete)

### Recurring tasks
When a task with a non-`none` recurrence is marked done, a fresh open clone is auto-created with the next due date (advanced from the original due date by daily/weekly/monthly/yearly until it lands in the future). Photos are NOT carried over.

### Reordering tasks
Tasks list uses `react-native-draggable-flatlist`. Long-press a task card to pick it up and drop into the new position. Reorder is only enabled when no filter, category, or search is active. Completed tasks always sink to the bottom of the manual order. New tasks are inserted at the top.

### Theme
Warm, earthy estate palette in `constants/colors.ts`:
- Primary: forest green `#2f6b3a`
- Accent: terracotta `#c2683a`
- Background: cream `#faf6ef`
- Radius: 14
Typography: Inter (400/500/600/700). Icons: Feather + SF Symbols (iOS).

### Photos
`expo-image-picker` (camera + library). URIs stored as strings in AsyncStorage. Photos can be attached to tasks (multi) and inventory items (single).

### Auth notes
Local-only multi-user. Passwords stored in plaintext in AsyncStorage — appropriate for a household app on a shared device, not production-grade security.
