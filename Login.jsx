import { useState } from "react";
import { C, PAYMENT_CONFIG } from "./constants";
import { css } from "./styles";

export function Login({ users, onLogin }) {
  const [tab,    setTab]    = useState("driver");
  const [user,   setUser]   = useState("");
  const [pw,     setPw]     = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err,    setErr]    = useState("");
  const [shake,  setShake]  = useState(false);

  const attempt = () => {
    const pool  = tab === "supervisor" ? users.supervisors : users.drivers;
    const found = pool.find((u) => u.username === user.trim() && u.password === pw);
    if (found) {
      onLogin(found);
    } else {
      setErr("Usuario o contrasena incorrectos");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      {/* Logo */}
      <div className="fadein" style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 66, height: 66, background: `${C.accent}18`,
          border: `2px solid ${C.accent}44`, borderRadius: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 34, margin: "0 auto 14px",
        }}>🚛</div>
        <h1 style={{ color: C.text, margin: 0, fontSize: 30,
          fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, letterSpacing: 4 }}>
          PREOP FLEET
        </h1>
        <p style={{ color: C.muted, margin: "6px 0 0", fontSize: 11, letterSpacing: 2.5 }}>
          CONTROL PRE-OPERACIONAL · TIEMPO REAL
        </p>
      </div>

      {/* Card */}
      <div className={shake ? "shake" : ""} style={{
        width: "100%", maxWidth: 400, background: C.card,
        border: `1px solid ${C.border}`, borderRadius: 22, overflow: "hidden",
      }}>
        {/* Tabs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {[
            { k: "driver",     icon: "🧑‍✈️", l: "Conductor" },
            { k: "supervisor", icon: "🏢",   l: "Supervisor" },
          ].map((t) => (
            <button key={t.k} onClick={() => { setTab(t.k); setErr(""); setUser(""); setPw(""); }} style={{
              background:   tab === t.k ? `${C.accent}15` : "transparent",
              border:       "none",
              borderBottom: `2px solid ${tab === t.k ? C.accent : C.border}`,
              color:        tab === t.k ? C.accent : C.muted,
              padding:      "16px 0",
              cursor:       "pointer",
              fontWeight:   700,
              fontSize:     13,
              fontFamily:   "'Rajdhani',sans-serif",
              letterSpacing:1,
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              gap:          7,
              transition:   "all .2s",
            }}>{t.icon} {t.l}</button>
          ))}
        </div>

        <div style={{ padding: "26px 24px 22px" }}>
          <label style={css.label}>Usuario
            <input style={css.inp} value={user}
              onChange={(e) => { setUser(e.target.value); setErr(""); }}
              placeholder={tab === "supervisor" ? "cramirez / mlopez" : "atorres / lherrera"}
            />
          </label>
          <div style={{ height: 14 }} />
          <label style={css.label}>Contrasena
            <div style={{ position: "relative" }}>
              <input
                style={{ ...css.inp, paddingRight: 44 }}
                type={showPw ? "text" : "password"}
                value={pw}
                onChange={(e) => { setPw(e.target.value); setErr(""); }}
                onKeyDown={(e) => e.key === "Enter" && attempt()}
                placeholder="••••••••"
              />
              <button onClick={() => setShowPw((p) => !p)} style={{
                position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)", background: "none",
                border: "none", color: C.muted, cursor: "pointer", fontSize: 16,
                padding: 0, marginTop: 3,
              }}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
          </label>

          {err && (
            <div style={{
              background: "#2d0a0a", border: "1px solid #ef444444",
              borderRadius: 8, padding: "10px 14px", color: "#ef4444",
              fontSize: 12, margin: "14px 0 0", letterSpacing: 0.5,
            }}>⚠️ {err}</div>
          )}

          <button onClick={attempt} style={{ ...css.btn(C.accent, true), fontSize: 14, marginTop: 18 }}>
            INGRESAR →
          </button>

          {/* Quick access */}
          <div style={{ marginTop: 18, background: C.surface, borderRadius: 10, padding: "12px 14px" }}>
            <p style={{ color: C.muted, fontSize: 10, margin: "0 0 8px", letterSpacing: 1.5 }}>
              ACCESOS RAPIDOS
            </p>
            {(tab === "supervisor" ? users.supervisors : users.drivers).map((u) => (
              <button key={u.id}
                onClick={() => { setUser(u.username); setPw(u.password); setErr(""); }}
                style={{
                  background: "transparent", border: `1px solid ${C.border}`, borderRadius: 6,
                  color: C.muted, padding: "5px 10px", cursor: "pointer", fontSize: 11,
                  width: "100%", marginBottom: 5, textAlign: "left",
                  display: "flex", justifyContent: "space-between",
                }}>
                <span style={{ color: C.text }}>{u.name}</span>
                <span style={{ color: C.subtle }}>@{u.username}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p style={{ color: C.muted, fontSize: 10, marginTop: 20, textAlign: "center" }}>
        7 dias gratis · Luego $15.000/mes · Nequi {PAYMENT_CONFIG.nequi}
      </p>
    </div>
  );
}
