import { useState } from "react";
import { C, PAYMENT_CONFIG } from "./constants";
import { css } from "./styles";
import { verifyPaymentWithAI } from "./aiService";

export function PaymentWall({ subscription, onRegisterPayment, status }) {
  const [ref,    setRef]    = useState("");
  const [phase,  setPhase]  = useState("idle"); // idle | verifying | approved | rejected
  const [reason, setReason] = useState("");
  const [aiMsg,  setAiMsg]  = useState("");

  const previousRefs = (subscription?.payments ?? []).map((p) => p.reference);
  const isVerifying  = phase === "verifying";
  const isApproved   = phase === "approved";

  const handleVerify = async () => {
    if (!ref.trim()) { setAiMsg("⚠️ Ingresa la referencia del comprobante Nequi"); return; }
    setPhase("verifying");
    setAiMsg("");
    setReason("");
    try {
      const result = await verifyPaymentWithAI({ reference: ref.trim(), previousRefs, status });
      if (result.approved) {
        setPhase("approved");
        setReason(result.reason);
        setTimeout(async () => { await onRegisterPayment(ref.trim()); }, 1500);
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

  const borderColor =
    phase === "rejected" ? "#ef444466" :
    phase === "approved" ? "#22c55e66" : "#8b5cf644";

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      {/* Approved overlay */}
      {isApproved && (
        <div style={{
          position: "fixed", inset: 0, background: "#000000cc", zIndex: 9999,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        }}>
          <div className="popin" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 90, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: "#22c55e", fontSize: 36, margin: "0 0 8px",
              fontFamily: "'Rajdhani',sans-serif", letterSpacing: 4 }}>PAGO VERIFICADO</h2>
            <p style={{ color: "#86efac", fontSize: 14, marginBottom: 6 }}>{reason}</p>
            <p style={{ color: C.muted, fontSize: 12 }}>Activando servicio…</p>
          </div>
        </div>
      )}

      <div className="fadein" style={{ width: "100%", maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>
            {status === "suspended" ? "⛔" : "⏰"}
          </div>
          <h1 style={{ color: C.text, margin: 0, fontSize: 26,
            fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, letterSpacing: 3 }}>
            {status === "suspended" ? "SERVICIO SUSPENDIDO" : "PRUEBA VENCIDA"}
          </h1>
          <p style={{ color: C.muted, margin: "8px 0 0", fontSize: 12 }}>
            {status === "suspended"
              ? "Tu suscripción está suspendida por falta de pago"
              : "Tu período de prueba gratuito de 7 días ha vencido"}
          </p>
        </div>

        {/* Payment instructions */}
        <div style={{ ...css.card, border: "1.5px solid #f59e0b44", marginBottom: 16 }}>
          <p style={{ ...css.hdr, color: "#f59e0b" }}>💳 CÓMO PAGAR</p>
          <div style={{ background: C.surface, borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: C.muted, fontSize: 12 }}>Valor mensual</span>
              <span style={{ color: "#22c55e", fontSize: 16, fontWeight: 900,
                fontFamily: "'Rajdhani',sans-serif" }}>$15.000 COP</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "#0ea5e915", borderRadius: 8, padding: "10px 12px",
              border: "1px solid #0ea5e944" }}>
              <span style={{ color: C.muted, fontSize: 12 }}>📱 Nequi</span>
              <span style={{ color: C.accent, fontSize: 20, fontWeight: 900,
                fontFamily: "'Rajdhani',sans-serif", letterSpacing: 3 }}>
                {PAYMENT_CONFIG.nequi}
              </span>
            </div>
          </div>
          <div style={{ background: "#052e0f", borderRadius: 10, padding: "10px 14px",
            border: "1px solid #22c55e33" }}>
            <p style={{ color: "#22c55e", fontSize: 11, margin: 0, lineHeight: 1.7 }}>
              1. Abre Nequi → "Enviar dinero"<br />
              2. Número: <strong>{PAYMENT_CONFIG.nequi}</strong><br />
              3. Monto: <strong>$15.000</strong> · Concepto: <strong>PreOp Fleet</strong><br />
              4. Copia la referencia del comprobante y pégala abajo
            </p>
          </div>
        </div>

        {/* AI Verification */}
        <div style={{ ...css.card, border: `1.5px solid ${borderColor}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 22 }}>
              {isVerifying ? "⏳" : isApproved ? "✅" : phase === "rejected" ? "❌" : "🤖"}
            </span>
            <div>
              <p style={{ ...css.hdr, margin: 0 }}>VERIFICACIÓN IA AUTOMÁTICA</p>
              <p style={{ color: C.muted, fontSize: 10, margin: 0 }}>
                La IA analiza y activa el servicio al instante
              </p>
            </div>
          </div>

          <label style={css.label}>Referencia del comprobante Nequi
            <input
              style={{
                ...css.inp,
                borderColor: phase === "rejected" ? "#ef4444" :
                             phase === "approved"  ? "#22c55e" : C.border,
              }}
              value={ref}
              onChange={(e) => { setRef(e.target.value); if (phase !== "idle") setPhase("idle"); setAiMsg(""); }}
              placeholder="Ej. 20250501-NQ-003847"
              disabled={isVerifying || isApproved}
              onKeyDown={(e) => e.key === "Enter" && !isVerifying && handleVerify()}
            />
          </label>

          {isVerifying && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12,
              background: "#1a0a2e", borderRadius: 8, padding: "10px 14px" }}>
              <span className="spin" style={{ fontSize: 16 }}>⚙️</span>
              <p style={{ color: "#c4b5fd", fontSize: 12, margin: 0 }}>
                La IA está verificando tu referencia Nequi…
              </p>
            </div>
          )}

          {phase === "rejected" && reason && (
            <div style={{ marginTop: 12, background: "#2d0a0a", borderRadius: 8,
              padding: "10px 14px", border: "1px solid #ef444433" }}>
              <p style={{ color: "#ef4444", fontSize: 12, margin: 0 }}>❌ {reason}</p>
            </div>
          )}

          {aiMsg && <p style={{ color: "#f59e0b", fontSize: 12, margin: "10px 0 0" }}>{aiMsg}</p>}

          <button
            onClick={handleVerify}
            disabled={isVerifying || isApproved}
            style={{
              ...css.btn(isApproved ? "#22c55e" : "#8b5cf6", true),
              marginTop: 14, fontSize: 14,
              opacity: (isVerifying || isApproved) ? 0.6 : 1,
              cursor:  (isVerifying || isApproved) ? "not-allowed" : "pointer",
            }}>
            {isVerifying ? "🤖 Verificando con IA…"
              : isApproved ? "✅ Verificado — Activando…"
              : "🔍 VERIFICAR Y ACTIVAR CON IA"}
          </button>
        </div>

        <p style={{ color: C.muted, fontSize: 10, textAlign: "center", marginTop: 14 }}>
          ¿Problemas? WhatsApp al {PAYMENT_CONFIG.nequi}
        </p>
      </div>
    </div>
  );
}
