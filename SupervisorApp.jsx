import { useState, useEffect } from "react";
import { C } from "./constants";
import { css } from "./styles";
import { getST } from "./helpers";
import { Badge }            from "./Badge";
import { Ping }             from "./Ping";
import { Chip }             from "./Chip";
import { TrialBanner }      from "./TrialBanner";
import { AIPaymentMonitor } from "./AIPaymentMonitor";
import { CHECKLIST }        from "./constants";

export function SupervisorApp({
  user, users, saveUsers, onLogout,
  sharedReports, subscription, onRegisterPayment, onSuspend,
}) {
  const { reports, connected, lastSync, newAlert } = sharedReports;

  const [tab,         setTab]         = useState("dashboard");
  const [selected,    setSelected]    = useState(null);
  const [filter,      setFilter]      = useState("all");
  const [search,      setSearch]      = useState("");
  const [alertBanner, setAlertBanner] = useState(null);

  // Password modal (supervisors)
  const [pwModal, setPwModal] = useState(null);
  const [newPw,   setNewPw]   = useState("");
  const [pwMsg,   setPwMsg]   = useState("");

  // Edit driver modal
  const [editModal, setEditModal] = useState(null);
  const [editName,  setEditName]  = useState("");
  const [editUser,  setEditUser]  = useState("");
  const [editPw,    setEditPw]    = useState("");
  const [editMsg,   setEditMsg]   = useState("");

  useEffect(() => {
    if (newAlert) {
      setAlertBanner(newAlert);
      const t = setTimeout(() => setAlertBanner(null), 6000);
      return () => clearTimeout(t);
    }
  }, [newAlert]);

  const sorted   = [...reports].sort((a, b) => b.timestamp - a.timestamp);
  const filtered = sorted
    .filter((r) => filter === "all" || r.overall === filter)
    .filter((r) =>
      r.driverName.toLowerCase().includes(search.toLowerCase()) ||
      r.plate.toLowerCase().includes(search.toLowerCase())
    );

  const cnt = {
    all:      reports.length,
    ok:       reports.filter((r) => r.overall === "ok").length,
    revision: reports.filter((r) => r.overall === "revision").length,
    falla:    reports.filter((r) => r.overall === "falla").length,
  };

  // ── Password reset (supervisors) ──────────────────────────────────────────
  const openReset = (u) => { setPwModal(u); setNewPw(""); setPwMsg(""); };
  const doReset = () => {
    if (!newPw || newPw.length < 6) { setPwMsg("Mínimo 6 caracteres"); return; }
    const upd = (arr) => arr.map((u) => u.id === pwModal.id ? { ...u, password: newPw } : u);
    saveUsers({ supervisors: upd(users.supervisors), drivers: upd(users.drivers) });
    setPwMsg("✅ Contraseña actualizada");
    setTimeout(() => { setPwModal(null); setNewPw(""); setPwMsg(""); }, 1600);
  };

  // ── Edit driver ───────────────────────────────────────────────────────────
  const openEdit = (u) => { setEditModal(u); setEditName(u.name); setEditUser(u.username); setEditPw(""); setEditMsg(""); };
  const doEdit = () => {
    if (!editName.trim()) { setEditMsg("⚠️ El nombre no puede estar vacío"); return; }
    if (!editUser.trim()) { setEditMsg("⚠️ El usuario no puede estar vacío"); return; }
    const all = [...users.supervisors, ...users.drivers];
    if (all.find((u) => u.username === editUser.trim() && u.id !== editModal.id)) {
      setEditMsg("⚠️ Ese nombre de usuario ya existe"); return;
    }
    if (editPw.length > 0 && editPw.length < 6) {
      setEditMsg("⚠️ La contraseña debe tener mínimo 6 caracteres (o déjala en blanco)"); return;
    }
    const updArr = (arr) => arr.map((u) => u.id === editModal.id ? {
      ...u,
      name:     editName.trim(),
      username: editUser.trim(),
      avatar:   editName.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      ...(editPw.length >= 6 ? { password: editPw } : {}),
    } : u);
    saveUsers({ supervisors: updArr(users.supervisors), drivers: updArr(users.drivers) });
    setEditMsg("✅ Datos actualizados correctamente");
    setTimeout(() => setEditModal(null), 1600);
  };

  const TABS = [
    { k: "dashboard", i: "📊", l: "Dashboard" },
    { k: "reports",   i: "📋", l: "Reportes"  },
    { k: "users",     i: "👥", l: "Usuarios"  },
    { k: "pagos",     i: "💳", l: "Pagos"     },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Mono',monospace" }}>
      <TrialBanner subscription={subscription} />

      {/* Alert banner */}
      {alertBanner && (
        <div className="alert-in" style={{
          position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)",
          zIndex: 999, background: "#052e0f", border: "1.5px solid #22c55e",
          borderRadius: 14, padding: "14px 22px", display: "flex", gap: 14,
          alignItems: "center", boxShadow: "0 8px 32px #22c55e22", minWidth: 320, maxWidth: 500,
        }}>
          <span style={{ fontSize: 28 }}>🔔</span>
          <div>
            <p style={{ color: "#22c55e", margin: "0 0 3px", fontWeight: 800,
              fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>
              ⚡ NUEVO REPORTE RECIBIDO
            </p>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: 12 }}>
              {alertBanner.driverName} · {alertBanner.plate} · <Badge s={alertBanner.overall} />
            </p>
          </div>
          <button onClick={() => setAlertBanner(null)} style={{
            background: "none", border: "none", color: "#64748b",
            cursor: "pointer", fontSize: 18, marginLeft: "auto",
          }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: C.card, borderBottom: `1px solid ${C.border}`,
        padding: "13px 18px", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🏢</span>
            <div>
              <p style={{ color: C.text, margin: 0, fontWeight: 700, fontSize: 14,
                fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>{user.name}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                <span style={{ color: C.muted, fontSize: 10, display: "flex", alignItems: "center", gap: 4 }}>
                  <Ping active={connected} />{connected ? "Tiempo real" : "Sin conexión"}
                </span>
                {lastSync && (
                  <span style={{ color: C.subtle, fontSize: 10 }}>
                    · {lastSync.toLocaleTimeString("es-CO")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {TABS.map((t) => (
              <button key={t.k} onClick={() => { setTab(t.k); setSelected(null); }} style={{
                background:    tab === t.k ? `${C.accent}15` : "transparent",
                border:        `1px solid ${tab === t.k ? C.accent : C.border}`,
                borderRadius:  8,
                color:         tab === t.k ? C.accent : C.muted,
                padding:       "6px 12px",
                cursor:        "pointer",
                fontSize:      11,
                fontWeight:    700,
                letterSpacing: 0.8,
                fontFamily:    "'Rajdhani',sans-serif",
              }}>
                {t.i} {t.l}
                {t.k === "reports" && cnt.falla > 0 && <Chip color="#ef4444"> {cnt.falla}</Chip>}
              </button>
            ))}
            <button onClick={onLogout} style={{
              background: "transparent", border: "1px solid #ef444433",
              borderRadius: 8, color: "#ef4444", padding: "6px 12px",
              cursor: "pointer", fontSize: 11,
            }}>Salir</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px 60px" }}>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { l: "Total",        v: cnt.all,      c: C.accent,  i: "📋" },
                { l: "Vehículos OK", v: cnt.ok,       c: "#22c55e", i: "✅" },
                { l: "En Revisión",  v: cnt.revision, c: "#f59e0b", i: "⚠️" },
                { l: "Con Falla",    v: cnt.falla,    c: "#ef4444", i: "🚨" },
              ].map((k) => (
                <div key={k.l} style={{
                  background: `${k.c}10`, border: `1.5px solid ${k.c}33`,
                  borderRadius: 14, padding: "16px 14px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{k.i}</div>
                  <div style={{ color: k.c, fontSize: 30, fontWeight: 900,
                    fontFamily: "'Rajdhani',sans-serif" }}>{k.v}</div>
                  <div style={{ color: C.muted, fontSize: 10, letterSpacing: 1 }}>{k.l}</div>
                </div>
              ))}
            </div>

            <div style={{
              background:   connected ? "#052e0f" : "#2d0a0a",
              border:       `1px solid ${connected ? "#22c55e33" : "#ef444433"}`,
              borderRadius: 12, padding: "10px 16px", marginBottom: 20,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ color: connected ? "#22c55e" : "#ef4444",
                fontSize: 12, display: "flex", alignItems: "center", gap: 8 }}>
                <Ping active={connected} />
                {connected
                  ? "Sincronización activa — los reportes aparecen en tiempo real"
                  : "Sin conexión con el servidor compartido"}
              </span>
              {lastSync && (
                <span style={{ color: C.muted, fontSize: 11 }}>
                  Última actualización: {lastSync.toLocaleTimeString("es-CO")}
                </span>
              )}
            </div>

            <p style={css.hdr}>🕐 REPORTES RECIENTES</p>
            {sorted.slice(0, 6).map((r) => {
              const s = getST(r.overall);
              return (
                <div key={r.id}
                  onClick={() => { setSelected(r); setTab("reports"); }}
                  style={{
                    ...css.card, borderColor: `${s.color}33`,
                    display: "flex", gap: 14, alignItems: "center", cursor: "pointer",
                  }}>
                  <div style={{ width: 40, height: 40, background: `${s.color}15`,
                    borderRadius: 10, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 20 }}>🚛</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: C.text, fontWeight: 700,
                        fontFamily: "'Rajdhani',sans-serif", fontSize: 15 }}>{r.plate}</span>
                      <Badge s={r.overall} />
                    </div>
                    <p style={{ color: C.muted, margin: "3px 0 0", fontSize: 11 }}>
                      {r.driverName} · {r.date} · ⛽{r.fuel}%
                    </p>
                  </div>
                </div>
              );
            })}
            {reports.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: C.muted }}>
                <div style={{ fontSize: 48 }}>📭</div><p>Sin reportes aún</p>
              </div>
            )}

            <p style={{ ...css.hdr, marginTop: 24 }}>👥 ESTADO POR CONDUCTOR</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
              {users.drivers.map((d) => {
                const dr   = reports.filter((r) => r.driverId === d.id).sort((a, b) => b.timestamp - a.timestamp);
                const last = dr[0];
                const s    = last ? getST(last.overall) : null;
                return (
                  <div key={d.id} style={{ ...css.card, display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background:   s ? `${s.color}18`  : `${C.accent}18`,
                      border:       `1.5px solid ${s ? s.color + "55" : C.accent + "44"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color:        s ? s.color : C.accent,
                      fontWeight: 800, fontSize: 15,
                      fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1,
                    }}>{d.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: C.text, margin: "0 0 3px", fontWeight: 700,
                        fontFamily: "'Rajdhani',sans-serif" }}>{d.name}</p>
                      <p style={{ color: C.muted, margin: "0 0 5px", fontSize: 11 }}>
                        Placa: {d.plate} · {dr.length} reportes
                      </p>
                      {last ? <Badge s={last.overall} /> : <span style={{ color: C.muted, fontSize: 11 }}>Sin reportes</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── REPORTS LIST ── */}
        {tab === "reports" && !selected && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                { k: "all",      l: "Todos"       },
                { k: "ok",       l: "✅ OK"        },
                { k: "revision", l: "⚠️ Revisión" },
                { k: "falla",    l: "🚨 Falla"     },
              ].map((f) => (
                <button key={f.k} onClick={() => setFilter(f.k)} style={{
                  background:   filter === f.k ? `${C.accent}18` : "transparent",
                  border:       `1px solid ${filter === f.k ? C.accent : C.border}`,
                  borderRadius: 8,
                  color:        filter === f.k ? C.accent : C.muted,
                  padding:      "7px 14px",
                  cursor:       "pointer",
                  fontSize:     12,
                  fontWeight:   700,
                }}>
                  {f.l} ({f.k === "all" ? reports.length : cnt[f.k]})
                </button>
              ))}
            </div>

            <input style={{ ...css.inp, marginBottom: 14 }} value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍  Buscar por conductor o placa…" />

            {filtered.length === 0
              ? <div style={{ textAlign: "center", padding: "48px 0", color: C.muted }}>
                  <div style={{ fontSize: 48 }}>📭</div><p>No hay reportes</p>
                </div>
              : filtered.map((r) => {
                  const s = getST(r.overall);
                  return (
                    <button key={r.id} onClick={() => setSelected(r)} style={{
                      ...css.card, width: "100%", cursor: "pointer", textAlign: "left",
                      display: "flex", gap: 14, alignItems: "center",
                      border: `1px solid ${s.color}44`,
                    }}>
                      <div style={{ width: 44, height: 44, background: `${s.color}12`,
                        border: `1.5px solid ${s.color}33`, borderRadius: 12,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🚛</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ color: C.text, fontWeight: 800, fontSize: 16,
                            fontFamily: "'Rajdhani',sans-serif" }}>{r.plate}</span>
                          <Badge s={r.overall} />
                        </div>
                        <p style={{ color: C.muted, margin: 0, fontSize: 11 }}>
                          {r.driverName} · {r.date} · {r.km} km · ⛽{r.fuel}%
                        </p>
                      </div>
                      <span style={{ color: C.muted }}>›</span>
                    </button>
                  );
                })
            }
          </>
        )}

        {/* ── REPORT DETAIL ── */}
        {tab === "reports" && selected && (
          <>
            <button onClick={() => setSelected(null)} style={{
              background: "transparent", border: "none",
              color: C.muted, cursor: "pointer", fontSize: 13,
              marginBottom: 16, display: "flex", alignItems: "center", gap: 6,
            }}>← Volver</button>

            <div style={css.card}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <h2 style={{ color: C.text, margin: "0 0 4px", fontSize: 26,
                    fontFamily: "'Rajdhani',sans-serif", letterSpacing: 2 }}>🚛 {selected.plate}</h2>
                  <p style={{ color: C.muted, margin: 0, fontSize: 12 }}>{selected.date}</p>
                </div>
                <Badge s={selected.overall} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 20 }}>
                {[
                  ["Conductor",   selected.driverName],
                  ["Kilometraje", `${parseInt(selected.km).toLocaleString()} km`],
                  ["Combustible", `⛽ ${selected.fuel}%`],
                  ["Ruta",        selected.route || "—"],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: C.surface, borderRadius: 10, padding: "10px 14px" }}>
                    <p style={{ color: C.muted, margin: "0 0 4px", fontSize: 10, letterSpacing: 1 }}>{k.toUpperCase()}</p>
                    <p style={{ color: C.text, margin: 0, fontWeight: 700, fontSize: 13 }}>{v}</p>
                  </div>
                ))}
              </div>

              {CHECKLIST.map((sec) => {
                const hasIssue = sec.items.some(
                  (i) => selected.checks[i.id] === "falla" || selected.checks[i.id] === "revision"
                );
                return (
                  <div key={sec.section} style={{ marginBottom: 16 }}>
                    <p style={{ ...css.hdr, color: hasIssue ? "#f59e0b" : C.muted }}>
                      {sec.icon} {sec.section.toUpperCase()}
                    </p>
                    <div style={{ display: "grid", gap: 5 }}>
                      {sec.items.map((item) => (
                        <div key={item.id} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          background: C.surface, borderRadius: 8, padding: "8px 12px",
                        }}>
                          <span style={{ color: C.text, fontSize: 12 }}>{item.label}</span>
                          <Badge s={selected.checks[item.id]} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {selected.notes && (
                <div style={{ background: C.surface, borderRadius: 12, padding: 16, marginTop: 8 }}>
                  <p style={{ color: C.muted, fontSize: 10, margin: "0 0 6px", letterSpacing: 1 }}>OBSERVACIONES</p>
                  <p style={{ color: C.text, fontSize: 13, margin: 0 }}>{selected.notes}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <>
            <p style={css.hdr}>🏢 SUPERVISORES</p>
            {users.supervisors.map((u) => (
              <div key={u.id} style={{ ...css.card, display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "#8b5cf618", border: "1.5px solid #8b5cf644",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#8b5cf6", fontWeight: 800, fontSize: 15,
                  fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1,
                }}>{u.avatar}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ color: C.text, margin: "0 0 3px", fontWeight: 700,
                    fontFamily: "'Rajdhani',sans-serif", fontSize: 15 }}>{u.name}</p>
                  <p style={{ color: C.muted, margin: 0, fontSize: 11 }}>@{u.username} · Supervisor</p>
                </div>
                <button onClick={() => openReset(u)} style={css.btn("#8b5cf6")}>🔑 Contraseña</button>
              </div>
            ))}

            <p style={{ ...css.hdr, marginTop: 24 }}>🧑‍✈️ CONDUCTORES</p>
            <p style={{ color: C.muted, fontSize: 11, marginBottom: 12 }}>
              Puedes editar nombre, usuario y contraseña de cada conductor.
            </p>
            {users.drivers.map((u) => {
              const dr   = reports.filter((r) => r.driverId === u.id).sort((a, b) => b.timestamp - a.timestamp);
              const last = dr[0];
              return (
                <div key={u.id} style={{ ...css.card, display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${C.accent}18`, border: `1.5px solid ${C.accent}44`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: C.accent, fontWeight: 800, fontSize: 15,
                    fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1,
                  }}>{u.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: C.text, margin: "0 0 3px", fontWeight: 700,
                      fontFamily: "'Rajdhani',sans-serif", fontSize: 15 }}>{u.name}</p>
                    <p style={{ color: C.muted, margin: "0 0 5px", fontSize: 11 }}>
                      @{u.username} · Placa: {u.plate} · {dr.length} reportes
                    </p>
                    {last ? <Badge s={last.overall} /> : <span style={{ color: C.muted, fontSize: 11 }}>Sin reportes</span>}
                  </div>
                  <button onClick={() => openEdit(u)} style={css.btn(C.accent)}>✏️ Editar</button>
                </div>
              );
            })}
          </>
        )}

        {/* ── PAGOS ── */}
        {tab === "pagos" && (
          <AIPaymentMonitor
            subscription={subscription}
            onSuspend={onSuspend}
            onRegisterPayment={onRegisterPayment}
          />
        )}
      </div>

      {/* PASSWORD MODAL */}
      {pwModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#000000bb",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20,
        }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
            padding: 28, width: "100%", maxWidth: 380 }}>
            <h3 style={{ color: C.text, margin: "0 0 6px",
              fontFamily: "'Rajdhani',sans-serif", fontSize: 20, letterSpacing: 1 }}>
              🔑 Restablecer Contraseña
            </h3>
            <p style={{ color: C.muted, fontSize: 12, margin: "0 0 20px" }}>
              {pwModal.name} · @{pwModal.username}
            </p>
            <label style={css.label}>Nueva contraseña (mín. 6 caracteres)
              <input style={css.inp} type="password" value={newPw}
                onChange={(e) => setNewPw(e.target.value)} placeholder="Nueva contraseña…"
                onKeyDown={(e) => e.key === "Enter" && doReset()} />
            </label>
            {pwMsg && <p style={{ color: pwMsg.startsWith("✅") ? "#22c55e" : "#ef4444",
              fontSize: 12, margin: "10px 0 0" }}>{pwMsg}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setPwModal(null)} style={{ ...css.btn(C.muted), flex: 1 }}>Cancelar</button>
              <button onClick={doReset}               style={{ ...css.btn("#22c55e"), flex: 2 }}>Guardar Cambio</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DRIVER MODAL */}
      {editModal && (
        <div style={{
          position: "fixed", inset: 0, background: "#000000bb",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20,
        }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
            padding: 28, width: "100%", maxWidth: 420 }}>
            <h3 style={{ color: C.text, margin: "0 0 6px",
              fontFamily: "'Rajdhani',sans-serif", fontSize: 20, letterSpacing: 1 }}>
              ✏️ Editar Conductor
            </h3>
            <p style={{ color: C.muted, fontSize: 12, margin: "0 0 20px" }}>
              Placa: {editModal.plate} · ID: {editModal.id}
            </p>
            <label style={{ ...css.label, marginBottom: 14 }}>Nombre completo
              <input style={css.inp} value={editName}
                onChange={(e) => setEditName(e.target.value)} placeholder="Nombre del conductor" />
            </label>
            <label style={{ ...css.label, marginBottom: 14 }}>Nombre de usuario
              <input style={css.inp} value={editUser}
                onChange={(e) => setEditUser(e.target.value)} placeholder="usuario123" />
            </label>
            <label style={css.label}>Nueva contraseña (opcional, mín. 6 caracteres)
              <input style={css.inp} type="password" value={editPw}
                onChange={(e) => setEditPw(e.target.value)}
                placeholder="Dejar en blanco = no cambiar" />
            </label>
            {editMsg && <p style={{ color: editMsg.startsWith("✅") ? "#22c55e" : "#ef4444",
              fontSize: 12, margin: "10px 0 0" }}>{editMsg}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setEditModal(null)} style={{ ...css.btn(C.muted),    flex: 1 }}>Cancelar</button>
              <button onClick={doEdit}                   style={{ ...css.btn(C.accent),   flex: 2 }}>💾 Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
