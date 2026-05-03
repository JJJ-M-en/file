import { C } from "../../utils/constants";

export function Chip({ color = C.accent, children }) {
  return (
    <span style={{
      background:   `${color}18`,
      border:       `1px solid ${color}44`,
      color,
      borderRadius: 20,
      padding:      "2px 10px",
      fontSize:     11,
      fontWeight:   700,
    }}>
      {children}
    </span>
  );
}
