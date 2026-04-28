import "./_group.css";
import {
  Plus,
  Search,
  Wrench,
  Calendar,
  GripVertical,
  Circle,
  CheckCircle2,
  Repeat,
} from "lucide-react";

type Task = {
  id: string;
  title: string;
  status: "open" | "in_progress" | "done";
  due?: string;
  dueTone?: "today" | "soon" | "later" | "overdue";
  category?: { name: string; color: string };
  equipment?: string;
  assignee: { initials: string; color: string };
  recurring?: boolean;
};

const TASKS: Task[] = [
  {
    id: "1",
    title: "Fix Pool Pump",
    status: "open",
    due: "Today",
    dueTone: "today",
    category: { name: "Maintenance", color: "#c2683a" },
    equipment: "Hayward SP2610",
    assignee: { initials: "CO", color: "#2f6b3a" },
  },
  {
    id: "2",
    title: "Stain back deck railings",
    status: "open",
    due: "Sat, May 2",
    dueTone: "soon",
    category: { name: "Outdoor", color: "#3f8a4f" },
    assignee: { initials: "JM", color: "#c2683a" },
  },
  {
    id: "3",
    title: "Service generator (annual)",
    status: "in_progress",
    due: "May 12",
    dueTone: "later",
    category: { name: "Mechanical", color: "#736b58" },
    equipment: "Generac 22kW",
    assignee: { initials: "CO", color: "#2f6b3a" },
    recurring: true,
  },
  {
    id: "4",
    title: "Replace filter cartridges",
    status: "done",
    category: { name: "Maintenance", color: "#c2683a" },
    assignee: { initials: "JM", color: "#c2683a" },
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

function dueColor(tone?: Task["dueTone"]) {
  if (tone === "today" || tone === "overdue") return "#b8463a";
  if (tone === "soon") return "#c2683a";
  return "#736b58";
}

function TaskRow({ task }: { task: Task }) {
  const isDone = task.status === "done";
  return (
    <div
      style={{
        background: "var(--em-card)",
        borderRadius: 14,
        border: "1px solid var(--em-border)",
        padding: "12px 12px 12px 0",
        display: "flex",
        alignItems: "stretch",
        gap: 0,
        boxShadow: "0 1px 0 rgba(29,36,25,0.02)",
        opacity: isDone ? 0.62 : 1,
      }}
    >
      {/* Category accent bar */}
      <div
        style={{
          width: 4,
          background: task.category?.color ?? "transparent",
          borderTopLeftRadius: 14,
          borderBottomLeftRadius: 14,
          marginRight: 12,
          flexShrink: 0,
        }}
      />
      <div style={{ paddingTop: 2 }}>
        <StatusDot status={task.status} />
      </div>
      <div style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 600,
            color: "var(--em-fg)",
            lineHeight: 1.25,
            textDecoration: isDone ? "line-through" : "none",
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
            gap: 10,
            marginTop: 6,
            fontSize: 12,
            color: "var(--em-muted-fg)",
            fontWeight: 500,
          }}
        >
          {task.due ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color: dueColor(task.dueTone),
                fontWeight: 600,
              }}
            >
              <Calendar size={12} strokeWidth={2.4} />
              {task.due}
            </span>
          ) : null}
          {task.category ? (
            <>
              {task.due ? <Dot /> : null}
              <span style={{ color: task.category.color, fontWeight: 600 }}>
                {task.category.name}
              </span>
            </>
          ) : null}
          {task.equipment ? (
            <>
              <Dot />
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 140,
                }}
              >
                <Wrench size={11} strokeWidth={2.4} />
                {task.equipment}
              </span>
            </>
          ) : null}
          {task.recurring ? (
            <>
              <Dot />
              <Repeat size={11} strokeWidth={2.4} />
            </>
          ) : null}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          marginLeft: 8,
          paddingRight: 6,
        }}
      >
        <div
          title={task.assignee.initials}
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
          }}
        >
          {task.assignee.initials}
        </div>
        <GripVertical size={16} color="#cfc8b6" />
      </div>
    </div>
  );
}

function Dot() {
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
const CATEGORIES = [
  { name: "All", color: "#1d2419", solid: true },
  { name: "Maintenance", color: "#c2683a" },
  { name: "Outdoor", color: "#3f8a4f" },
  { name: "Mechanical", color: "#736b58" },
];

export function RefinedDensity() {
  return (
    <div className="em-root" style={{ padding: "16px 16px 88px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: "var(--em-muted-fg)",
            }}
          >
            3 open · 2 for you
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: -0.6,
              marginTop: 2,
              color: "var(--em-fg)",
            }}
          >
            Tasks
          </div>
        </div>
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

      {/* Search */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--em-card)",
          border: "1px solid var(--em-border)",
          borderRadius: 14,
          padding: "0 12px",
          height: 44,
        }}
      >
        <Search size={16} color="var(--em-muted-fg)" />
        <input
          placeholder="Search tasks"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 15,
            color: "var(--em-fg)",
            fontFamily: "inherit",
          }}
        />
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
        {FILTERS.map((f, i) => {
          const active = i === 0;
          return (
            <span
              key={f}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                background: active ? "var(--em-primary)" : "var(--em-secondary)",
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

      {/* Categories */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 10,
          overflowX: "auto",
          paddingBottom: 2,
        }}
      >
        {CATEGORIES.map((c) => (
          <span
            key={c.name}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: c.solid ? "7px 14px" : "7px 12px",
              borderRadius: 999,
              background: c.solid ? "var(--em-fg)" : "var(--em-secondary)",
              color: c.solid ? "#fff" : "var(--em-secondary-fg)",
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {!c.solid && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: c.color,
                }}
              />
            )}
            {c.solid ? "All categories" : c.name}
          </span>
        ))}
      </div>

      {/* Task list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 16,
        }}
      >
        {TASKS.map((t) => (
          <TaskRow key={t.id} task={t} />
        ))}
      </div>
    </div>
  );
}
