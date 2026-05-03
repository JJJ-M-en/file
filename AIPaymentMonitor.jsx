import { useState } from "react";
import { C, PAYMENT_CONFIG } from "./constants";
import { css } from "./styles";
import { getSubscriptionStatus, daysLeft } from "./helpers";
import { verifyPaymentWithAI, getPaymentReport } from "./aiService";

export function AIPaymentMonitor({ subscription, onSuspend, onRegisterPayment }) {
  const [aiReport,      setAiReport]      = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [ref,           setRef]           = useState("");
  const [phase,         setPhase]         = useState("idle");
  const [reason,        setReason]        = useState("");

  const status       = getSubscriptionStatus(subscription);
  const days         = daysLeft(subscription);
  const previousRefs = (subscription?.payments ?? []).map((p) => p.reference);

  const statusColor = {
    trial:         "#f59e0b",
    active:        "#22c55e",
    trial_expired: "#ef4444",
    payment_due:   "#ef4444",
    suspended:     "#ef4444",
    none:          C.muted,
  }[status] ?? C.muted;

  const statusLabel = {
    trial:         "🎁 En Prueba",
    active:        "✅ Activo",
    trial_expired: "⏰ Prueba Vencida",
    payment_due:   "⚠️ Pago Vencido",
    suspended:     "⛔ Suspendido",
    none:          "Sin suscripción",
  }[status] ?? status;

  const handleReport = async () => {
    setReportLoading(true);
    setAiReport("");
    const text = await getPaymentReport({ status, days, payments: subscription?.payments ?? [] });
    setAiReport(text);
    setReportLoading(false);
  };

  const handleVerify = async () => {
    if (!ref.trim()) return;
    setPhase("verifying");
    setReason("");
    try {
      const result = await verifyPaymentWithAI({ reference: ref.trim(), previousRefs, status });
      if (result.approved) {
        setPhase("approved");
        setReason(result.reason);
        setTimeout(async () => {
          await onRegisterPayment(ref.trim());
          setRef("");
          setPhase("idle");
        }, 1500);
      } else {
        setPhase("rejected");
        setReason(result.reason);
        setTimeout(() => setPhase("idle"), 4000);
      }
    } catch {
      setPhase("rejected");
      setReason("Error de conexión. Intenta de nuevo.");
      setTimeout(() => setPhase("idle"), 3000);
    }
  };

  const isVerifying = phase === "verifying";
  const isApproved  = phase === "approved";
  const borderColor =
    phase === "rejected" ? "#ef444466" :
    phase === "approved" ? "#22c55e66" : "#8b5cf644";

  return (
    <div>
      <p style={css.hdr}>🤖 MONITOR IA DE PAGOS</p>

      {/* Status */}
      <div style={{
        background: `${statusColor}10`, border: `1.5px solid ${statusColor}44`,
        borderRadius: 14, padding: "16px 20px", marginBottom: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <p style={{ color: C.muted, margin: "0 0 4px", fontSize: 10, letterSpacing: 2 }}>ESTADO SUSCRIPCIÓN</p>
          <p style={{ color: statusColor, margin: 0, fontWeight: 800, fontSize: 22,
            fontFamily: "'Rajdhani',sans-serif" }}>{statusLabel}</p>
        </div>
        {(status === "trial" || status === "active") && (
          <div style={{ textAlign: "right" }}>
            <p style={{ color: statusColor, margin: 0, fontSize: 32, fontWeight: 900,
              fontFamily: "'Rajdhani',sans-serif" }}>{days}d</p>
            <p style={{ color: C.muted, margin: 0, fontSize: 10 }}>
              {status === "trial" ? "de prueba" : "restantes"}
            </p>
          </div>
        )}
      </div>

      {/* Payment history */}
      <div style={css.card}>
        <p style={css.hdr}>💳 HISTORIAL DE PAGOS</p>
        {(subscription?.payments ?? []).length === 0
          ? <p style={{ color: C.muted, fontSize: 12 }}>Sin pagos registrados aún</p>
          : [...(subscription?.payments ?? [])].reverse().map((p, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between",
              background: C.surface, borderRadius: 8, padding: "10px 14px",
              marginBottom: 8, border: "1px solid #22c55e22",
            }}>
              <div>
                <p style={{ color: "#22c55e", margin: "0 0 2px", fontSize: 13, fontWeight: 700 }}>
                  ${p.amount?.toLocaleString("es-CO")} COP ✅ Verificado por IA
                </p>
                <p style={{ color: C.muted, margin: 0, fontSize: 10 }}>
                  {p.date} · Ref: {p.reference}
                </p>
              </div>
            </div>
          ))
        }
      </div>

      {/* AI verify new payment */}
      <div style={{ ...css.card, border: `1.5px solid ${borderColor}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 20 }}>
            {isVerifying ? "⏳" : isApproved ? "✅" : phase === "rejected" ? "❌" : "🤖"}
          </span>
          <p style={{ ...css.hdr, margin: 0 }}>VERIFICAR Y ACTIVAR NUEVO PAGO CON IA</p>
        </div>

        <div style={{ background: "#052e0f", borderRadius: 8, padding: "8px 12px",
          border: "1px solid #22c55e33", marginBottom: 12 }}>
          <p style={{ color: "#22c55e", fontSize: 11, margin: 0 }}>
            Nequi: <strong>{PAYMENT_CONFIG.nequi}</strong> · Monto: <strong>$15.000 COP/mes</strong>
          </p>
        </div>

        <label style={css.label}>Referencia del comprobante Nequi
          <input
            style={{
              ...css.inp,
              borderColor: phase === "rejected" ? "#ef4444" :
                           phase === "approved"  ? "#22c55e" : C.border,
            }}
            value={ref}
            placeholder="Ej. 20250501-NQ-003847"
            onChange={(e) => { setRef(e.target.value); if (phase !== "idle") setPhase("idle"); setReason(""); }}
            disabled={isVerifying || isApproved}
            onKeyDown={(e) => e.key === "Enter" && phase === "idle" && handleVerify()}
          />
        </label>

        {isVerifying && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12,
            background: "#1a0a2e", borderRadius: 8, padding: "10px 14px" }}>
            <span className="spin" style={{ fontSize: 16 }}>⚙️</span>
            <p style={{ color: "#c4b5fd", fontSize: 12, margin: 0 }}>La IA está verificando la referencia…</p>
          </div>
        )}
        {isApproved && (
          <div style={{ marginTop: 12, background: "#052e0f", borderRadius: 8,
            padding: "10px 14px", border: "1px solid #22c55e44" }}>
            <p style={{ color: "#22c55e", fontSize: 12, margin: 0 }}>✅ {reason} — Activando servicio…</p>
          </div>
        )}
        {phase === "rejected" && reason && (
          <div style={{ marginTop: 12, background: "#2d0a0a", borderRadius: 8,
            padding: "10px 14px", border: "1px solid #ef444433" }}>
            <p style={{ color: "#ef4444", fontSize: 12, margin: 0 }}>❌ {reason}</p>
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={!ref.trim() || isVerifying || isApproved}
          style={{
            ...css.btn("#8b5cf6", true),
            marginTop: 14, fontSize: 13,
            opacity: (!ref.trim() || isVerifying || isApproved) ? 0.5 : 1,
            cursor:  (!ref.trim() || isVerifying || isApproved) ? "not-allowed" : "pointer",
          }}>
          {isVerifying ? "🤖 Verificando con IA…"
            : isApproved ? "✅ Verificado — Activando…"
            : "🔍 VERIFICAR Y ACTIVAR CON IA"}
        </button>
      </div>

      {/* AI Report */}
      <div style={css.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ ...css.hdr, margin: 0 }}>🧠 ANÁLISIS IA DEL CICLO DE PAGO</p>
          <button onClick={handleReport} disabled={reportLoading}
            style={{ ...css.btn("#8b5cf6"), fontSize: 11, padding: "6px 14px" }}>
            {reportLoading ? <span className="spin">⚙️</span> : "🔍 Generar"}
          </button>
        </div>
        {aiReport
          ? <div style={{ background: "#1a0a2e", border: "1px solid #8b5cf644", borderRadius: 10, padding: 14 }}>
              <p style={{ color: "#c4b5fd", fontSize: 12, margin: 0, lineHeight: 1.8 }}>{aiReport}</p>
            </div>
          : <p style={{ color: C.muted, fontSize: 11, margin: 0 }}>
              La IA analiza el historial de pagos y recomienda acciones para mantener el servicio activo.
            </p>
        }
      </div>

      {/* Manual suspend */}
      {(status === "active" || status === "trial") && (
        <div style={{ ...css.card, border: "1px solid #ef444433" }}>
          <p style={{ ...css.hdr, color: "#ef4444" }}>⚠️ SUSPENSIÓN MANUAL</p>
          <p style={{ color: C.muted, fontSize: 12, margin: "0 0 14px" }}>
            Suspende el servicio si el pago no fue recibido en tu cuenta Nequi.
          </p>
          <button onClick={onSuspend} style={{ ...css.btn("#ef4444", true) }}>
            ⛔ SUSPENDER SERVICIO
          </button>
        </div>
      )}
    </div>
  );
}
