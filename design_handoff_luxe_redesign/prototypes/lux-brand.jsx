/* Estate Manager Pro — Luxe design system: tokens, crest/logo, shared primitives */
/* Exports to window: luxe, LuxIcon, LuxAvatar, Crest, AppIcon, Wordmark, + helpers */

// ── Tokens ──────────────────────────────────────────────────────────────
const luxe = {
  // surfaces
  bg: "#f3ecdd",          // parchment ivory
  bgDeep: "#ece3d0",
  card: "#fbf8f1",        // warm paper
  // ink
  ink: "#1b2a23",         // deep ink-green
  inkSoft: "#3c4a40",
  muted: "#8a8472",       // sage-taupe
  faint: "#b6ad97",
  // emerald
  emerald: "#103b2f",
  emeraldDeep: "#0b2c22",
  emeraldSoft: "#1c5141",
  // gold
  gold: "#b5934d",
  goldBright: "#cda85c",
  goldDeep: "#8f7338",
  goldHair: "rgba(150,121,62,0.42)",
  // misc
  border: "#e2d9c4",
  borderSoft: "#ece4d3",
  destructive: "#9c3b32",
  radius: 16,
};

const LUX_AVATAR = ["#103b2f", "#7d2a32", "#3a4a6b", "#6b3a5a", "#8f7338", "#2f5b5e", "#7a4a2e", "#4a3a6b"];

const goldGrad = "linear-gradient(150deg, #e6cd86 0%, #c8a55e 38%, #9c7d3c 72%, #cdaa63 100%)";
const goldText = { background: goldGrad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" };
const emeraldGrad = "linear-gradient(160deg, #1c5141 0%, #103b2f 52%, #0b2c22 100%)";
const serif = "'Playfair Display', Georgia, serif";
const sans = "'Inter', system-ui, sans-serif";

// ── Feather icon ────────────────────────────────────────────────────────
function LuxIcon({ name, size = 16, color = "currentColor", strokeWidth = 1.8, style = {} }) {
  const svg = (window.feather && window.feather.icons && window.feather.icons[name])
    ? window.feather.icons[name].toSvg({ width: size, height: size, stroke: color, "stroke-width": strokeWidth })
    : "";
  return <span style={{ display: "inline-flex", lineHeight: 0, ...style }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

// ── Avatar w/ gold hairline ring ──────────────────────────────────────────
function LuxAvatar({ name, colorIdx = 0, size = 28, ring = true }) {
  const bg = LUX_AVATAR[colorIdx % LUX_AVATAR.length];
  const initials = name.split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2, background: bg, color: "#f4ecd8",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: serif, fontWeight: 600, fontSize: Math.round(size * 0.4), letterSpacing: 0.3,
      boxShadow: ring ? `0 0 0 1px ${luxe.goldHair}, inset 0 0 0 1.5px rgba(255,255,255,0.10)` : "none",
    }}>{initials}</div>
  );
}

function LuxStack({ assignees }) {
  if (!assignees.length) return (
    <div style={{ width: 28, height: 28, borderRadius: 14, border: `1px dashed ${luxe.faint}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <LuxIcon name="user" size={13} color={luxe.faint} />
    </div>
  );
  const visible = assignees.slice(0, 3);
  const overflow = assignees.length - visible.length;
  const width = 28 + (visible.length - 1) * 17 + (overflow > 0 ? 19 : 0);
  return (
    <div style={{ position: "relative", width, height: 28 }}>
      {visible.map((a, i) => (
        <div key={i} style={{ position: "absolute", left: i * 17, borderRadius: 14, background: luxe.card, padding: 1.5 }}>
          <LuxAvatar name={a.name} colorIdx={a.colorIdx} size={25} />
        </div>
      ))}
      {overflow > 0 && (
        <div style={{
          position: "absolute", left: visible.length * 17, width: 28, height: 28, borderRadius: 14,
          background: luxe.bgDeep, boxShadow: `0 0 0 1px ${luxe.goldHair}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: sans, fontWeight: 600, fontSize: 10, color: luxe.goldDeep,
        }}>+{overflow}</div>
      )}
    </div>
  );
}

function Dot() {
  return <span style={{ width: 3, height: 3, borderRadius: 2, background: luxe.faint, margin: "0 8px", display: "inline-block", flexShrink: 0 }} />;
}

// Spaced gold caps label
function Eyebrow({ children, color, style = {} }) {
  return <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 10.5, letterSpacing: 2, textTransform: "uppercase", color: color || luxe.goldDeep, ...style }}>{children}</div>;
}

// Thin gold flourish rule (centered diamond between hairlines)
function Flourish({ width = 64, color = luxe.gold }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, width }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${luxe.goldHair})` }} />
      <div style={{ width: 4, height: 4, background: color, transform: "rotate(45deg)" }} />
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${luxe.goldHair}, transparent)` }} />
    </div>
  );
}

// ── Crest: monogram E inside a pediment-topped shield, gold on emerald ─────
function Crest({ size = 96, letter = "E", bg = true }) {
  const s = size;
  const stroke = Math.max(1, s * 0.012);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ display: "block" }}>
      <defs>
        <linearGradient id={`emg-${s}`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#1c5141" />
          <stop offset="0.55" stopColor="#103b2f" />
          <stop offset="1" stopColor="#0b2c22" />
        </linearGradient>
        <linearGradient id={`gld-${s}`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#e8cf88" />
          <stop offset="0.4" stopColor="#c8a55e" />
          <stop offset="0.75" stopColor="#9c7d3c" />
          <stop offset="1" stopColor="#d2ad64" />
        </linearGradient>
      </defs>
      {bg && <rect x="0" y="0" width="100" height="100" rx="22" fill={`url(#emg-${s})`} />}
      {/* architectural pediment + double-rule frame */}
      <g fill="none" stroke={`url(#gld-${s})`} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round">
        <path d="M27 30 L50 17 L73 30" />
        <rect x="27" y="34" width="46" height="49" rx="5" />
        <rect x="30.5" y="37.5" width="39" height="42" rx="3" strokeWidth={stroke * 0.7} opacity="0.7" />
      </g>
      <text x="50" y="68.5" textAnchor="middle" fontFamily="'Playfair Display', Georgia, serif"
        fontSize="40" fontWeight="600" fill={`url(#gld-${s})`}>{letter}</text>
      {/* base ornament dot */}
      <circle cx="50" cy="28.5" r={s * 0.013} fill={`url(#gld-${s})`} />
    </svg>
  );
}

// iOS app-icon (rounded squircle, emerald field, centered crest, vignette)
function AppIcon({ size = 120, radius }) {
  const r = radius != null ? radius : size * 0.225;
  return (
    <div style={{
      width: size, height: size, borderRadius: r, background: emeraldGrad,
      position: "relative", overflow: "hidden",
      boxShadow: `0 1px 0 rgba(255,255,255,0.06) inset, 0 ${size*0.06}px ${size*0.13}px rgba(11,44,34,0.4)`,
    }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 30% 18%, rgba(255,255,255,0.10), transparent 55%)" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Crest size={size * 0.78} bg={false} />
      </div>
    </div>
  );
}

// Horizontal wordmark lockup
function Wordmark({ scale = 1, onDark = false }) {
  const titleColor = onDark ? "#f4ecd8" : luxe.emerald;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 * scale }}>
      <Crest size={52 * scale} />
      <div style={{ display: "flex", flexDirection: "column", gap: 3 * scale }}>
        <div style={{ fontFamily: serif, fontWeight: 600, fontSize: 24 * scale, lineHeight: 1, color: titleColor, letterSpacing: 0.2, whiteSpace: "nowrap" }}>
          Estate Manager
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 * scale }}>
          <div style={{ height: 1, width: 16 * scale, background: luxe.goldHair }} />
          <span style={{ ...goldText, fontFamily: sans, fontWeight: 600, fontSize: 10 * scale, letterSpacing: 4 * scale, textTransform: "uppercase" }}>Pro</span>
          <div style={{ flex: 1, height: 1, background: luxe.goldHair }} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { luxe, LUX_AVATAR, goldGrad, goldText, emeraldGrad, serif, sans, LuxIcon, LuxAvatar, LuxStack, Dot, Eyebrow, Flourish, Crest, AppIcon, Wordmark });
