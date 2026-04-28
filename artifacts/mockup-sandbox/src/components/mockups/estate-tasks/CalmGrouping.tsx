import "./_group.css";
import {
  Plus,
  Search,
  Wrench,
  GripVertical,
  Circle,
  CheckCircle2,
  Repeat,
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  status: "open" | "in_progress" | "done";
  category?: { name: string; color: string };
  equipment?: string;
  assignee: { initials: string; color: string };
  recurring?: boolean;
};

type Section = {
  label: string;
  hint: string;
  accent: string;
  tasks: Task[];
};

const SECTIONS: Section[] = [
  {
    label: "Today",
    hint: "Apr 28",
    accent: "#b8463a",
    tasks: [
      {
        id: "1",
        title: "Fix Pool Pump",
        status: "open",
        category: { name: "Maintenance", color: "#c2683a" },
        equipment: "Hayward SP2610",
        assignee: { initials: "CO", color: "#2f6b3a" },
      },
    ],
  },
  {
    label: "This week",
    hint: "Apr 28 — May 4",
    accent: "#c2683a",
    tasks: [
      {
        id: "2",
        title: "Stain back deck railings",
        status: "open",
        category: { name: "Outdoor", color: "#3f8a4f" },
        assignee: { initials: "JM", color: "#c2683a" },
      },
      {
        id: "3",
        title: "Replace HVAC filters",
        status: "in_progress",
        category: { name: "Mechanical", color: "#736b58" },
        equipment: "Carrier 24ANB1",
        assignee: { initials: "CO", color: "#2f6b3a" },
      },
    ],
  },
  {
    label: "Later",
    hint: "May 12+",
    accent: "#736b58",
    tasks: [
      {
        id: "4",
        title: "Service generator (annual)",
        status: "open",
        category: { name: "Mechanical", color: "#736b58" },
        equipment: "Generac 22kW",
        assignee: { initials: "CO", color: "#2f6b3a" },
        recurring: true,
      },
    ],
  },
];

function StatusDot({ status }: { status: Task["status"] }) {
  if (status === "done") {
    return <CheckCircle2 size={22} color="#2f6b3a" strokeWidth={2.2} />;
  }
  if (status === "in_progress") {
    return (
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          border: "2px solid #2f6b3a",
          background:
            "conic-gradient(#2f6b3a 0 50%, transparent 50% 100%)",
        }}
      />
    );
  }
  return <Circle size={22} color="#9b9583" strokeWidth={2} />;
}

function TaskRow({ task }: { task: Task }) {
  return (
    <div
      style={{
        background: "var(--em-card)",
        borderRadius: 14,
        border: "1px solid var(--em-border)",
        padding: "14px 12px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <StatusDot status={task.status} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 600,
            color: "var(--em-fg)",
            lineHeight: 1.25,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {task.title}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 5,
            fontSize: 12,
            color: "var(--em-muted-fg)",
            fontWeight: 500,
          }}
        >
          {task.category ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 999,
                  background: task.category.color,
                }}
              />
              <span style={{ color: task.category.color, fontWeight: 600 }}>
                {task.category.name}
              </span>
            </span>
          ) : null}
          {task.equipment ? (
            <>
              <Sep />
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 130,
                }}
              >
                <Wrench size={11} strokeWidth={2.4} />
                {task.equipment}
              </span>
            </>
          ) : null}
          {task.recurring ? (
            <>
              <Sep />
              <Repeat size={11} strokeWidth={2.4} />
            </>
          ) : null}
        </div>
      </div>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          background: task.assignee.color,
          color: "#fff",
          fontSize: 11,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          letterSpacing: 0.3,
          flexShrink: 0,
        }}
      >
        {task.assignee.initials}
      </div>
      <GripVertical size={16} color="#cfc8b6" />
    </div>
  );
}

function Sep() {
  return (
    <span
      style={{
        width: 3,
        height: 3,
        borderRadius: 999,
        background: "#cfc8b6",
        display: "inline-block",
      }}
    />
  );
}

const FILTERS = ["All", "Mine", "Open", "Done"];

export function CalmGrouping() {
  return (
    <div className="em-root" style={{ padding: "16px 16px 88px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: -0.6,
              color: "var(--em-fg)",
              lineHeight: 1.1,
            }}
          >
            Tasks
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--em-muted-fg)",
              fontWeight: 500,
              marginTop: 4,
            }}
          >
            Tuesday, April 28
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            aria-label="Search"
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "var(--em-card)",
              border: "1px solid var(--em-border)",
              color: "var(--em-fg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Search size={18} />
          </button>
          <button
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "var(--em-primary)",
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(47,107,58,0.25)",
              cursor: "pointer",
            }}
          >
            <Plus size={20} strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginTop: 16,
          background: "var(--em-secondary)",
          padding: 4,
          borderRadius: 999,
        }}
      >
        {FILTERS.map((f, i) => {
          const active = i === 0;
          return (
            <span
              key={f}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "8px 10px",
                borderRadius: 999,
                background: active ? "var(--em-primary)" : "transparent",
                color: active ? "#fff" : "var(--em-secondary-fg)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 0.3,
              }}
            >
              {f}
            </span>
          );
        })}
      </div>

      {/* Sections */}
      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 22 }}>
        {SECTIONS.map((s) => (
          <div key={s.label}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                marginBottom: 10,
                paddingLeft: 2,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: s.accent,
                  alignSelf: "center",
                }}
              />
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--em-fg)",
                  letterSpacing: -0.1,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--em-muted-fg)",
                  fontWeight: 500,
                }}
              >
                {s.hint}
              </div>
              <div style={{ flex: 1 }} />
              <div
                style={{
                  fontSize: 11,
                  color: "var(--em-muted-fg)",
                  fontWeight: 600,
                }}
              >
                {s.tasks.length}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {s.tasks.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
