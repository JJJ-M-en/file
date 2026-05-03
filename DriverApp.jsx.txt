import { useState } from "react";
import { C, CHECKLIST, ST, DEFAULT_CHECKS } from "./constants";
import { css } from "./styles";
import { calcOverall, getST } from "./helpers";
import { Badge } from "./Badge";
import { Ping }  from "./Ping";
import { TrialBanner } from "./TrialBanner";

export function DriverApp({ user, onLogout, sharedReports, subscription }) {
  const { reports, save, connected } = sharedReports;
  const [vtab,   setVtab]   = useState("form");
  const [step,   setStep]   = useState("form");
  const [km,     setKm]     = useState("");
  const [route,  setRoute]  = useState("");
  const [fuel,   setFuel]   = useState(50);
  const [checks, setChecks] = useState({ ...DEFAULT_CHECKS });
  const [notes,  setNotes]  = useState("");
  const [saving, setSaving] = useState(false);

  const myReports = reports
    .filter((r) => r.driverId === user.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  const overall = calcOverall(checks);
  const ovST    = getST(overall);
  const failN   = Object.values(checks).filter((v) => v === "falla").length;
  const revN    = Object.values(checks).filter((v) => v === "revision").length;

  const handleSubmit = async () => {
    if (!km.trim()) return;
    setSaving(true);
    const rep = {
      id:         Date.now(),
      driverId:   user.id,
      driverName: user.name,
      plate:      user.plate,
      km, route, fuel, checks, notes,
      overall:    calcOverall(checks),
      timestamp:  Date.now(),
      date:       new Date().toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }),
    };
    await save(rep);
    setSaving(false);
    setStep("success");
  };

  const reset = () => {
    setStep("form"); setKm(""); setRoute(""); setFuel(50);
    setNotes(""); setChecks({ ...DEFAULT_CHECKS }); setVtab("form");
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Mono',monospace" }}>
      <TrialBanner subscription={subscription} />

      {/* Header */}
      <div style={{
        background: C.card, borderBottom: `1px solid ${C.border}`,
        padding: "13px 18px", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🚛</span>
            <div>
              <p style={{ color: C.text, margin: 0, fontWeight: 700, fontSize: 14,
                fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>{user.name}</p>
              <p style={{ color: C.muted, margin: 0, fontSize: 10 }}>Placa: {user.plate}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ color: C.muted, fontSize: 10, display: "flex", alignItems: "center", gap: 5 }}>
              <Ping active={connected} />{connected ? "En línea" : "Sin conexión"}
            </span>
            {[{ k: "form", l: "📋 Reporte" }, { k: "history", l: "📂 Historial" }].map((t) => (
              <button key={t.k} onClick={() => setVtab(t.k)} style={{
                background:   vtab === t.k ? `${C.accent}15` : "transparent",
                border:       `1px solid ${vtab === t.k ? C.accent : C.border}`,
                borderRadius: 8,
                color:        vtab === t.k ? C.accent : C.muted,
                padding:      "6px 11px",
                cursor:       "pointer",
                fontSize:     11,
                fontWeight:   700,
              }}>{t.l}</button>
            ))}
            <button onClick={onLogout} style={{
              background: "transparent", border: "1px solid #ef444433",
              borderRadius: 8, color: "#ef4444", padding: "6px 11px",
              cursor: "pointer", fontSize: 11,
            }}>Salir</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px 60px" }}>

        {/* HISTORY */}
        {vtab === "history" && (
          <>
            <p style={css.hdr}>📂 MIS REPORTES ({myReports.length})</p>
            {myReports.length === 0
              ? <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
                  <div style={{ fontSize: 48 }}>📭</div><p>Sin reportes aún</p>
                </div>
              : myReports.map((r) => {
                  const s = getST(r.overall);
                  return (
                    <div key={r.id} className="newrep" style={{
                      ...css.card, borderColor: `${s.color}44`,
                      display: "flex", gap: 14, alignItems: "center",
                    }}>
                      <div style={{
                        width: 42, height: 42, background: `${s.color}15`,
                        border: `1.5px solid ${s.color}44`, borderRadius: 10,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                      }}>🚛</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: C.text, fontWeight: 700, fontSize: 15,
                            fontFamily: "'Rajdhani',sans-serif" }}>{r.plate}</span>
                          <Badge s={r.overall} />
                        </div>
                        <p style={{ color: C.muted, margin: 0, fontSize: 11 }}>
                          {r.date} · {r.km} km · ⛽ {r.fuel}%{r.route ? " · " + r.route : ""}
                        </p>
                      </div>
                    </div>
                  );
                })
            }
          </>
        )}

        {/* SUCCESS */}
        {vtab === "form" && step === "success" && (
          <div style={{ textAlign: "center", padding: "70px 20px" }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: "#22c55e", fontSize: 34, margin: "0 0 8px",
              fontFamily: "'Rajdhani',sans-serif", letterSpacing: 3 }}>ENVIADO</h2>
            <p style={{ color: C.muted, fontSize: 14, marginBottom: 12 }}>
              Pre-operacional registrado y visible al supervisor
            </p>
            <p style={{ color: "#22c55e55", fontSize: 11, marginBottom: 32, letterSpacing: 1 }}>
              ⚡ SINCRONIZADO EN TIEMPO REAL
            </p>
            <button onClick={reset} style={css.btn("#22c55e")}>+ Nuevo Reporte</button>
          </div>
        )}

        {/* FORM */}
        {vtab === "form" && step === "form" && (
          <>
            {/* Overall status */}
            <div style={{
              background: `${ovST.color}10`, border: `1.5px solid ${ovST.color}44`,
              borderRadius: 14, padding: "14px 18px", marginBottom: 20,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <p style={{ color: C.muted, margin: "0 0 4px", fontSize: 10, letterSpacing: 2 }}>ESTADO GENERAL</p>
                <p style={{ color: ovST.color, margin: 0, fontWeight: 800, fontSize: 20,
                  fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>
                  {overall === "ok" ? "✅" : overall === "falla" ? "🔴" : "⚠️"} {ovST.label.toUpperCase()}
                </p>
              </div>
              <div style={{ display: "flex", gap: 16, textAlign: "center" }}>
                <div>
                  <p style={{ color: "#ef4444", margin: 0, fontSize: 24, fontWeight: 900,
                    fontFamily: "'Rajdhani',sans-serif" }}>{failN}</p>
                  <p style={{ color: C.muted, margin: 0, fontSize: 10 }}>Fallas</p>
                </div>
                <div>
                  <p style={{ color: "#f59e0b", margin: 0, fontSize: 24, fontWeight: 900,
                    fontFamily: "'Rajdhani',sans-serif" }}>{revN}</p>
                  <p style={{ color: C.muted, margin: 0, fontSize: 10 }}>Revisión</p>
                </div>
              </div>
            </div>

            {/* Vehicle info */}
            <div style={css.card}>
              <p style={css.hdr}>📋 INFORMACIÓN DE SALIDA</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <label style={css.label}>Kilometraje
                  <input style={css.inp} type="number" value={km}
                    onChange={(e) => setKm(e.target.value)} placeholder="Ej. 85420" />
                </label>
                <label style={css.label}>Ruta / Destino
                  <input style={css.inp} value={route}
                    onChange={(e) => setRoute(e.target.value)} placeholder="Bogotá → Cali" />
                </label>
              </div>
              <label style={css.label}>
                Combustible:{" "}
                <span style={{ color: fuel < 25 ? "#ef4444" : fuel < 50 ? "#f59e0b" : "#22c55e" }}>
                  {fuel}%
                </span>
                <input type="range" min={0} max={100} value={fuel}
                  onChange={(e) => setFuel(Number(e.target.value))}
                  style={{ marginTop: 10, width: "100%",
                    accentColor: fuel < 25 ? "#ef4444" : fuel < 50 ? "#f59e0b" : "#22c55e" }} />
              </label>
            </div>

            {/* Checklist sections */}
            {CHECKLIST.map((sec) => (
              <div key={sec.section} style={css.card}>
                <p style={css.hdr}>{sec.icon} {sec.section.toUpperCase()}</p>
                <div style={{ display: "grid", gap: 7 }}>
                  {sec.items.map((item) => {
                    const cur = checks[item.id];
                    const cs  = getST(cur);
                    return (
                      <div key={item.id} style={{
                        background: `${cs.color}08`, border: `1px solid ${cs.color}30`,
                        borderRadius: 10, padding: "9px 13px",
                        display: "flex", alignItems: "center", gap: 10, transition: "all .15s",
                      }}>
                        <span style={{ flex: 1, color: C.text, fontSize: 12 }}>{item.label}</span>
                        <div style={{ display: "flex", gap: 4 }}>
                          {ST.map((opt) => (
                            <button key={opt.value}
                              onClick={() => setChecks((p) => ({ ...p, [item.id]: opt.value }))}
                              style={{
                                padding: "3px 8px", borderRadius: 6, fontSize: 10,
                                fontWeight: 700, letterSpacing: 0.5, cursor: "pointer", transition: "all .12s",
                                border:     `1.5px solid ${cur === opt.value ? opt.color : C.border}`,
                                background: cur === opt.value ? opt.bg : "transparent",
                                color:      cur === opt.value ? opt.color : C.muted,
                              }}>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Notes */}
            <div style={css.card}>
              <p style={css.hdr}>📝 OBSERVACIONES</p>
              <textarea style={{ ...css.inp, minHeight: 80 }} value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Novedades, daños visibles u otras observaciones…" />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!km.trim() || saving}
              style={{
                ...css.btn(
                  overall === "falla" ? "#ef4444" : overall === "revision" ? "#f59e0b" : "#22c55e",
                  true
                ),
                fontSize: 15,
                opacity:  (!km.trim() || saving) ? 0.5 : 1,
                cursor:   (!km.trim() || saving) ? "not-allowed" : "pointer",
                padding:  16,
              }}>
              {saving ? "⏳ ENVIANDO…" : "📤 ENVIAR PRE-OPERACIONAL"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
