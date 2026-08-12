/* Estate Manager Pro — Luxe screens. Depends on lux-brand.jsx (window globals). */
/* Exports: LuxTasks, LuxInventory, LuxProfile, LuxTaskDetail, BrandBoard */

// ── shared chrome ─────────────────────────────────────────────────────────
function LuxHeader({ title, eyebrow, action }) {
  return (
    <div style={{ padding: "14px 20px 14px", background: luxe.bg, borderBottom: `1px solid ${luxe.border}` }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          {eyebrow && <Eyebrow style={{ marginBottom: 4 }}>{eyebrow}</Eyebrow>}
          <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 30, lineHeight: 1, color: luxe.ink, letterSpacing: 0.2 }}>{title}</div>
        </div>
        {action || (
          <div style={{
            width: 42, height: 42, borderRadius: 999, background: emeraldGrad,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 0 1px ${luxe.goldHair}, 0 4px 10px rgba(11,44,34,0.18)`,
          }}>
            <LuxIcon name="plus" size={19} color="#e8cf88" strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}

function LuxSearch({ placeholder }) {
  return (
    <div style={{ padding: "12px 20px 8px", background: luxe.bg }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 9, background: luxe.card,
        border: `1px solid ${luxe.border}`, borderRadius: 12, padding: "10px 13px",
        boxShadow: "0 1px 2px rgba(27,42,35,0.03)",
      }}>
        <LuxIcon name="search" size={15} color={luxe.muted} />
        <div style={{ flex: 1, fontFamily: sans, fontSize: 14, color: luxe.muted }}>{placeholder}</div>
      </div>
    </div>
  );
}

function LuxChips({ chips }) {
  return (
    <div style={{ display: "flex", gap: 8, padding: "4px 20px 12px", background: luxe.bg, flexWrap: "wrap" }}>
      {chips.map((c, i) => (
        <div key={i} style={{
          padding: "6px 14px", borderRadius: 999, fontFamily: sans, fontWeight: 600, fontSize: 12,
          letterSpacing: 0.2,
          background: c.active ? emeraldGrad : "transparent",
          color: c.active ? "#ecdcb0" : luxe.inkSoft,
          border: c.active ? `1px solid ${luxe.goldHair}` : `1px solid ${luxe.border}`,
        }}>{c.label}</div>
      ))}
    </div>
  );
}

function LuxTabBar({ active }) {
  const tabs = [
    { id: "tasks", icon: "check-square", label: "Tasks" },
    { id: "inventory", icon: "package", label: "Inventory" },
    { id: "profile", icon: "user", label: "Profile" },
  ];
  return (
    <div style={{ background: luxe.card, borderTop: `1px solid ${luxe.border}`, paddingTop: 9, paddingBottom: 6, paddingInline: 10, position: "relative" }}>
      <div style={{ position: "absolute", top: 0, left: 20, right: 20, height: 1, background: `linear-gradient(90deg, transparent, ${luxe.goldHair}, transparent)` }} />
      <div style={{ display: "flex" }}>
        {tabs.map((t) => {
          const on = t.id === active;
          const color = on ? luxe.emerald : luxe.muted;
          return (
            <div key={t.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 0" }}>
              <LuxIcon name={t.icon} size={22} color={color} strokeWidth={on ? 2 : 1.7} />
              <div style={{ fontFamily: sans, fontWeight: on ? 600 : 500, fontSize: 10.5, letterSpacing: 0.3, color }}>{t.label}</div>
              {on && <div style={{ width: 4, height: 4, background: luxe.gold, transform: "rotate(45deg)", marginTop: 1 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusGlyph({ status }) {
  if (status === "done") return (
    <div style={{ width: 22, height: 22, borderRadius: 11, background: emeraldGrad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 1px ${luxe.goldHair}` }}>
      <LuxIcon name="check" size={12} color="#e8cf88" strokeWidth={3} />
    </div>
  );
  if (status === "in_progress") return (
    <div style={{ width: 22, height: 22, borderRadius: 11, border: `1.5px solid ${luxe.gold}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 9, height: 9, borderRadius: 5, background: goldGrad }} />
    </div>
  );
  return <div style={{ width: 22, height: 22, borderRadius: 11, border: `1.5px solid ${luxe.faint}` }} />;
}

// ── Task card ───────────────────────────────────────────────────────────
function LuxTaskCard({ task }) {
  const done = task.status === "done";
  const dueTone = task.due ? (["today", "overdue"].includes(task.due.tone) ? luxe.destructive : task.due.tone === "soon" ? luxe.goldDeep : luxe.muted) : null;
  return (
    <div style={{
      display: "flex", background: luxe.card, border: `1px solid ${luxe.border}`, borderRadius: luxe.radius,
      overflow: "hidden", opacity: done ? 0.6 : 1, boxShadow: "0 1px 2px rgba(27,42,35,0.03)",
    }}>
      <div style={{ width: 3, background: task.categoryColor || luxe.gold }} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 13, padding: "13px 14px" }}>
        <StatusGlyph status={task.status} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: serif, fontWeight: 500, fontSize: 17, lineHeight: "21px", color: luxe.ink,
            textDecoration: done ? "line-through" : "none",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{task.title}</div>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 4, marginTop: 6 }}>
            {task.due && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: dueTone, fontFamily: sans, fontWeight: 600, fontSize: 11.5 }}><LuxIcon name="calendar" size={11} color={dueTone} />{task.due.label}</span>}
            {task.category && (<>{task.due && <Dot />}<span style={{ color: task.categoryColor, fontFamily: sans, fontWeight: 600, fontSize: 11.5, letterSpacing: 0.2 }}>{task.category}</span></>)}
            {task.inventoryCount > 0 && (<>{(task.due || task.category) && <Dot />}<span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: luxe.muted, fontFamily: sans, fontWeight: 500, fontSize: 11.5 }}><LuxIcon name="tool" size={11} color={luxe.muted} />{task.inventoryCount}</span></>)}
            {task.recurring && (<>{(task.due || task.category || task.inventoryCount) && <Dot />}<LuxIcon name="repeat" size={11} color={luxe.muted} /></>)}
          </div>
        </div>
        <LuxStack assignees={task.assignees || []} />
      </div>
    </div>
  );
}

function LuxInvCard({ item }) {
  const subtitle = [item.vendor, item.partNumber].filter(Boolean).join(" · ");
  return (
    <div style={{ display: "flex", background: luxe.card, border: `1px solid ${luxe.border}`, borderRadius: luxe.radius, overflow: "hidden", boxShadow: "0 1px 2px rgba(27,42,35,0.03)" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 13, padding: "12px 14px" }}>
        <div style={{ width: 54, height: 54, borderRadius: 11, background: emeraldGrad, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `inset 0 0 0 1px ${luxe.goldHair}` }}>
          <LuxIcon name="package" size={22} color="#cda85c" strokeWidth={1.6} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: serif, fontWeight: 500, fontSize: 17, lineHeight: "21px", color: luxe.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", rowGap: 4, marginTop: 5 }}>
            {subtitle && <span style={{ color: luxe.muted, fontFamily: sans, fontWeight: 500, fontSize: 11.5 }}>{subtitle}</span>}
            {item.location && (<>{subtitle && <Dot />}<span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: luxe.muted, fontFamily: sans, fontWeight: 500, fontSize: 11.5 }}><LuxIcon name="map-pin" size={11} color={luxe.muted} />{item.location}</span></>)}
          </div>
        </div>
        {item.taskCount > 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, paddingInline: 4 }}>
            <span style={{ fontFamily: serif, fontWeight: 600, fontSize: 17, color: luxe.emerald, ...goldText }}>{item.taskCount}</span>
            <Eyebrow style={{ fontSize: 8, letterSpacing: 1 }}>tasks</Eyebrow>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Screens ───────────────────────────────────────────────────────────────
function ScreenShell({ children }) {
  return <div style={{ display: "flex", flexDirection: "column", height: "100%", background: luxe.bg }}>{children}</div>;
}

function LuxTasks() {
  const tasks = [
    { title: "Replace HVAC filter — upstairs", status: "open", due: { label: "Today", tone: "today" }, category: "Maintenance", categoryColor: "#7a4a2e", inventoryCount: 2, recurring: true, assignees: [{ name: "Alex Reed", colorIdx: 0 }, { name: "Jamie Park", colorIdx: 2 }] },
    { title: "Schedule chimney inspection", status: "in_progress", due: { label: "Tomorrow", tone: "soon" }, category: "Vendors", categoryColor: "#3a4a6b", recurring: false, assignees: [{ name: "Alex Reed", colorIdx: 0 }] },
    { title: "Restock pool chlorine tablets", status: "open", due: { label: "3d overdue", tone: "overdue" }, category: "Supplies", categoryColor: "#8f7338", inventoryCount: 1, recurring: true, assignees: [{ name: "Jamie Park", colorIdx: 2 }] },
    { title: "Service generator — annual", status: "open", due: { label: "In 4 days", tone: "soon" }, category: "Maintenance", categoryColor: "#7a4a2e", inventoryCount: 3, recurring: true, assignees: [{ name: "Morgan Lee", colorIdx: 3 }, { name: "Alex Reed", colorIdx: 0 }, { name: "Jamie Park", colorIdx: 2 }, { name: "Sam Diaz", colorIdx: 4 }] },
    { title: "Polish silver before gala", status: "open", due: { label: "Nov 14", tone: "later" }, category: "Household", categoryColor: "#6b3a5a", recurring: false, assignees: [] },
    { title: "Settle landscaper invoice", status: "done", due: { label: "Paid", tone: "later" }, category: "Admin", categoryColor: "#2f5b5e", recurring: false, assignees: [{ name: "Morgan Lee", colorIdx: 3 }] },
  ];
  return (
    <ScreenShell>
      <div style={{ height: 56 }} />
      <LuxHeader eyebrow="Holloway Estate" title="Tasks" />
      <LuxSearch placeholder="Search tasks…" />
      <LuxChips chips={[{ label: "All", active: true }, { label: "Mine · 3" }, { label: "Completed" }]} />
      <div style={{ flex: 1, padding: "2px 20px 16px", display: "flex", flexDirection: "column", gap: 9, overflow: "hidden" }}>
        {tasks.map((t, i) => <LuxTaskCard key={i} task={t} />)}
      </div>
      <LuxTabBar active="tasks" />
    </ScreenShell>
  );
}

function LuxInventory() {
  const items = [
    { name: "Carrier Infinity 98 Furnace", vendor: "Carrier", partNumber: "59TN6A", location: "Mechanical room", taskCount: 3 },
    { name: "HVAC filter — MERV 11", vendor: "Filterbuy", partNumber: "20×25×1", location: "Garage, shelf B", taskCount: 2 },
    { name: "Kohler 20kW Generator", vendor: "Kohler", partNumber: "20RESCL", location: "Side yard pad", taskCount: 4 },
    { name: "Pentair Pool Pump", vendor: "Pentair", partNumber: "SF-N1-1FA", location: "Equipment shed", taskCount: 1 },
    { name: "Rinnai Tankless Heater", vendor: "Rinnai", partNumber: "RU199iN", location: "Utility closet", taskCount: 0 },
    { name: "Sub-Zero Wine Reserve", vendor: "Sub-Zero", partNumber: "424FS", location: "Cellar", taskCount: 0 },
  ];
  return (
    <ScreenShell>
      <div style={{ height: 56 }} />
      <LuxHeader eyebrow="Holloway Estate" title="Inventory" />
      <LuxSearch placeholder="Search inventory…" />
      <LuxChips chips={[{ label: "Active", active: true }, { label: "Archived · 4" }]} />
      <div style={{ flex: 1, padding: "2px 20px 16px", display: "flex", flexDirection: "column", gap: 9, overflow: "hidden" }}>
        {items.map((it, i) => <LuxInvCard key={i} item={it} />)}
      </div>
      <LuxTabBar active="inventory" />
    </ScreenShell>
  );
}

function LuxCard({ children, style = {} }) {
  return <div style={{ background: luxe.card, border: `1px solid ${luxe.border}`, borderRadius: luxe.radius, padding: 18, display: "flex", flexDirection: "column", gap: 14, boxShadow: "0 1px 2px rgba(27,42,35,0.03)", ...style }}>{children}</div>;
}

function LuxProfile() {
  const me = { name: "Alex Reed", email: "alex.reed@hollowayestate.com", tz: "Eastern (ET)", colorIdx: 0 };
  const members = [
    { name: "Alex Reed", role: "Estate Manager", colorIdx: 0, me: true },
    { name: "Jamie Park", role: "Groundskeeper", colorIdx: 2 },
    { name: "Morgan Lee", role: "House Steward", colorIdx: 3 },
    { name: "Sam Diaz", role: "Maintenance", colorIdx: 4 },
  ];
  return (
    <ScreenShell>
      <div style={{ height: 56 }} />
      <div style={{ flex: 1, padding: "0 20px 16px", display: "flex", flexDirection: "column", gap: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "14px 0 14px", borderBottom: `1px solid ${luxe.border}` }}>
          <div>
            <Eyebrow style={{ marginBottom: 4 }}>Account</Eyebrow>
            <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 30, lineHeight: 1, color: luxe.ink }}>Profile</div>
          </div>
          <LuxIcon name="edit-2" size={18} color={luxe.goldDeep} />
        </div>

        <LuxCard style={{ alignItems: "center", gap: 12, paddingBottom: 20 }}>
          <LuxAvatar name={me.name} colorIdx={me.colorIdx} size={72} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 25, color: luxe.ink }}>{me.name}</div>
            <div style={{ fontFamily: sans, fontSize: 12.5, color: luxe.muted, marginTop: 3 }}>{me.email}</div>
          </div>
          <Flourish width={88} />
          <Eyebrow>{me.tz}</Eyebrow>
        </LuxCard>

        <LuxCard>
          <Eyebrow>The Estate</Eyebrow>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: sans, fontSize: 11.5, color: luxe.muted, marginBottom: 3 }}>Private join code</div>
              <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 24, color: luxe.emerald, letterSpacing: 5 }}>K7M·9XP</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", background: emeraldGrad, borderRadius: 11, boxShadow: `0 0 0 1px ${luxe.goldHair}` }}>
              <LuxIcon name="share-2" size={15} color="#e8cf88" />
              <span style={{ color: "#ecdcb0", fontFamily: sans, fontWeight: 600, fontSize: 12.5 }}>Invite</span>
            </div>
          </div>
          <div style={{ height: 1, background: luxe.borderSoft }} />
          <Eyebrow>Members</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {members.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, paddingBlock: 9, borderBottom: i < members.length - 1 ? `1px solid ${luxe.borderSoft}` : "none" }}>
                <LuxAvatar name={m.name} colorIdx={m.colorIdx} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 14, color: luxe.ink }}>{m.name}{m.me ? " · You" : ""}</div>
                  <div style={{ fontFamily: sans, fontSize: 11.5, color: luxe.muted }}>{m.role}</div>
                </div>
                <LuxIcon name="chevron-right" size={16} color={luxe.faint} />
              </div>
            ))}
          </div>
        </LuxCard>

        <LuxCard style={{ gap: 0, paddingBlock: 4 }}>
          {[{ icon: "tag", label: "Manage categories" }, { icon: "bell", label: "Notifications" }].map((row, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 13, paddingBlock: 13, borderBottom: i < arr.length - 1 ? `1px solid ${luxe.borderSoft}` : "none" }}>
              <LuxIcon name={row.icon} size={17} color={luxe.goldDeep} strokeWidth={1.7} />
              <div style={{ flex: 1, fontFamily: sans, fontWeight: 500, fontSize: 14.5, color: luxe.ink }}>{row.label}</div>
              <LuxIcon name="chevron-right" size={16} color={luxe.faint} />
            </div>
          ))}
        </LuxCard>
      </div>
      <LuxTabBar active="profile" />
    </ScreenShell>
  );
}

function LuxField({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Eyebrow style={{ color: luxe.inkSoft }}>{label}</Eyebrow>
      {children}
    </div>
  );
}
function LuxBox({ children, style = {} }) {
  return <div style={{ background: luxe.card, border: `1px solid ${luxe.border}`, borderRadius: 12, padding: "12px 14px", minHeight: 48, display: "flex", alignItems: "center", gap: 10, fontFamily: sans, fontSize: 14.5, color: luxe.ink, ...style }}>{children}</div>;
}

function LuxTaskDetail() {
  return (
    <ScreenShell>
      <div style={{ height: 56 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", background: luxe.card, borderBottom: `1px solid ${luxe.border}`, position: "relative" }}>
        <div style={{ position: "absolute", bottom: 0, left: 18, right: 18, height: 1, background: `linear-gradient(90deg, transparent, ${luxe.goldHair}, transparent)` }} />
        <LuxIcon name="arrow-left" size={21} color={luxe.ink} />
        <div style={{ flex: 1, fontFamily: serif, fontWeight: 600, fontSize: 18, color: luxe.ink }}>Edit Task</div>
        <LuxIcon name="trash-2" size={18} color={luxe.destructive} style={{ marginRight: 6 }} />
        <div style={{ background: emeraldGrad, color: "#ecdcb0", padding: "7px 16px", borderRadius: 10, fontFamily: sans, fontWeight: 600, fontSize: 13.5, boxShadow: `0 0 0 1px ${luxe.goldHair}` }}>Save</div>
      </div>
      <div style={{ flex: 1, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 18, overflow: "hidden" }}>
        <LuxField label="Title"><LuxBox><span style={{ fontFamily: serif, fontSize: 16 }}>Replace HVAC filter — upstairs</span></LuxBox></LuxField>
        <LuxField label="Description"><LuxBox style={{ minHeight: 74, alignItems: "flex-start", paddingTop: 12 }}><span style={{ color: luxe.inkSoft, lineHeight: "21px" }}>20×25×1 MERV 11. Inspect the upstairs hall return-air grille while up there.</span></LuxBox></LuxField>
        <LuxField label="Status">
          <div style={{ display: "flex", background: luxe.bgDeep, borderRadius: 12, padding: 4, gap: 4, border: `1px solid ${luxe.border}` }}>
            {[{ label: "Open" }, { label: "In progress", active: true }, { label: "Done" }].map((s, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center", padding: "9px 0", background: s.active ? luxe.card : "transparent", borderRadius: 9, fontFamily: sans, fontWeight: 600, fontSize: 13, color: s.active ? luxe.emerald : luxe.muted, boxShadow: s.active ? `0 1px 3px rgba(27,42,35,0.08), 0 0 0 1px ${luxe.goldHair}` : "none" }}>{s.label}</div>
            ))}
          </div>
        </LuxField>
        <LuxField label="Assignees">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[{ name: "Alex Reed", colorIdx: 0, on: true }, { name: "Jamie Park", colorIdx: 2, on: true }, { name: "Morgan Lee", colorIdx: 3, on: false }, { name: "Sam Diaz", colorIdx: 4, on: false }].map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 12px 5px 5px", borderRadius: 999, border: `1px solid ${p.on ? luxe.goldHair : luxe.border}`, background: p.on ? emeraldGrad : luxe.card }}>
                <LuxAvatar name={p.name} colorIdx={p.colorIdx} size={22} ring={false} />
                <span style={{ color: p.on ? "#ecdcb0" : luxe.inkSoft, fontFamily: sans, fontWeight: 500, fontSize: 13 }}>{p.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </LuxField>
        <LuxField label="Due date"><LuxBox><LuxIcon name="calendar" size={16} color={luxe.goldDeep} /><span style={{ flex: 1 }}>Today · Nov 6</span><LuxIcon name="x" size={15} color={luxe.muted} /></LuxBox></LuxField>
        <LuxField label="Recurrence">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["None", "Daily", "Weekly", "Monthly", "Quarterly"].map((r) => (
              <div key={r} style={{ padding: "7px 14px", borderRadius: 999, background: r === "Quarterly" ? emeraldGrad : "transparent", color: r === "Quarterly" ? "#ecdcb0" : luxe.inkSoft, border: r === "Quarterly" ? `1px solid ${luxe.goldHair}` : `1px solid ${luxe.border}`, fontFamily: sans, fontWeight: 600, fontSize: 12 }}>{r}</div>
            ))}
          </div>
        </LuxField>
      </div>
    </ScreenShell>
  );
}

// ── Brand board (logo / icon / palette / type) ─────────────────────────────
function Swatch({ color, name, hex, dark }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      <div style={{ width: "100%", height: 60, borderRadius: 12, background: color, boxShadow: `inset 0 0 0 1px ${luxe.goldHair}` }} />
      <div>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 12, color: luxe.ink }}>{name}</div>
        <div style={{ fontFamily: sans, fontSize: 11, color: luxe.muted, letterSpacing: 0.3 }}>{hex}</div>
      </div>
    </div>
  );
}

function BrandBoard() {
  return (
    <div style={{ width: 860, background: luxe.bg, borderRadius: 22, border: `1px solid ${luxe.border}`, overflow: "hidden", fontFamily: sans }}>
      {/* hero */}
      <div style={{ background: emeraldGrad, padding: "44px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(90% 120% at 80% 0%, rgba(232,207,136,0.10), transparent 60%)" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 28 }}>
          <AppIcon size={108} />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <Eyebrow color="#cda85c" style={{ marginBottom: 12 }}>Identity</Eyebrow>
            <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 38, lineHeight: 1.08, color: "#f4ecd8", letterSpacing: 0.3, whiteSpace: "nowrap" }}>Estate Manager <span style={{ fontStyle: "italic", color: "#e8cf88" }}>Pro</span></div>
            <div style={{ fontFamily: sans, fontSize: 13.5, color: "rgba(244,236,216,0.66)", marginTop: 14, maxWidth: 380, lineHeight: "20px" }}>A monogram crest beneath an architectural pediment — antique gold on estate emerald.</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "30px 48px 40px", display: "flex", flexDirection: "column", gap: 30 }}>
        {/* icon sizes + wordmark */}
        <div style={{ display: "flex", gap: 40, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
            <AppIcon size={84} />
            <AppIcon size={56} />
            <AppIcon size={38} />
            <AppIcon size={26} />
          </div>
          <div style={{ width: 1, alignSelf: "stretch", background: luxe.border }} />
          <Wordmark scale={1.05} />
        </div>

        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${luxe.goldHair}, transparent)` }} />

        {/* palette */}
        <div>
          <Eyebrow style={{ marginBottom: 14 }}>Palette</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
            <Swatch color={emeraldGrad} name="Estate Emerald" hex="#103B2F" />
            <Swatch color={luxe.emeraldDeep} name="Deep Pine" hex="#0B2C22" />
            <Swatch color={goldGrad} name="Antique Gold" hex="#C8A55E" />
            <Swatch color={luxe.bg} name="Parchment" hex="#F3ECDD" />
            <Swatch color={luxe.card} name="Warm Paper" hex="#FBF8F1" />
            <Swatch color={luxe.ink} name="Ink Green" hex="#1B2A23" />
          </div>
        </div>

        {/* type */}
        <div>
          <Eyebrow style={{ marginBottom: 14 }}>Typography</Eyebrow>
          <div style={{ display: "flex", gap: 48, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 38, color: luxe.ink, lineHeight: 1 }}>Playfair Display</div>
              <div style={{ fontFamily: sans, fontSize: 12, color: luxe.muted, marginTop: 6 }}>Display & titles · high-contrast serif</div>
            </div>
            <div>
              <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 26, color: luxe.ink, lineHeight: 1 }}>Inter</div>
              <div style={{ fontFamily: sans, fontSize: 12, color: luxe.muted, marginTop: 6 }}>Interface & body</div>
            </div>
            <Eyebrow style={{ fontSize: 13 }}>Spaced Gold Caps · Labels</Eyebrow>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LuxTasks, LuxInventory, LuxProfile, LuxTaskDetail, BrandBoard });
