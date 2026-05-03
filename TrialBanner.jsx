import { daysLeft } from "./helpers";
import { PAYMENT_CONFIG, C } from "./constants";

export function TrialBanner({ subscription }) {
  const days = daysLeft(subscription);
  if (days <= 0) return null;

  return (
    <div style={{
      background: "#2d1a00",
      border:     "1px solid #f59e0b55",
      padding:    "8px 18px",
      display:    "flex",
      justifyContent: "space-between",
      alignItems:     "center",
    }}>
      <span style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700 }}>
        🎁 PRUEBA GRATIS · {days} día{days !== 1 ? "s" : ""} restante{days !== 1 ? "s" : ""}
      </span>
      <span style={{ color: C.muted, fontSize: 10 }}>
        Luego: $15.000/mes · Nequi {PAYMENT_CONFIG.nequi}
      </span>
    </div>
  );
}
