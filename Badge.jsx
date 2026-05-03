import { getST } from "./helpers";

export function Badge({ s }) {
  const o = getST(s);
  return (
    <span style={{
      background:    o.bg,
      color:         o.color,
      border:        `1px solid ${o.color}55`,
      borderRadius:  6,
      padding:       "3px 10px",
      fontSize:      11,
      fontWeight:    700,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      whiteSpace:    "nowrap",
    }}>
      {s === "ok" ? "✅" : s === "falla" ? "🔴" : s === "revision" ? "⚠️" : "⚪"} {o.label}
    </span>
  );
}
