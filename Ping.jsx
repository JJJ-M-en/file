export function Ping({ active }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{
        width:      8,
        height:     8,
        borderRadius: "50%",
        background:   active ? "#22c55e" : "#ef4444",
        boxShadow:    active ? "0 0 0 3px #22c55e33" : "none",
        animation:    active ? "pulse 1.5s infinite" : "none",
      }} />
    </span>
  );
}
