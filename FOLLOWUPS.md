# Follow-ups

A running list of ideas, polish, and "nice to have" items that came up during development but weren't in scope at the time. Pull from this list when planning the next round of work.

---

## AI inventory identification (added 2026-05-30)

- **Cache identical-photo lookups** — skip the API call if the same photo URI was just identified. Probably low value since users rarely retry the same photo, but cheap to add.
- **Save the AI's confidence or raw response alongside the item** — could surface "AI-suggested" badges on fields the user didn't manually confirm, or help debug bad identifications.
- **Let the user pick the model** — expose a setting to switch between Haiku (cheap/fast) and Sonnet (smarter) for tricky items. Only worth it if Haiku quality turns out to be insufficient in practice.
- **Identify multiple items in one photo** — for a photo containing several pieces of equipment, return a list and let the user pick which one(s) to create. Larger UX change.
