import { C } from "./constants";

// ── Shared component styles (CSS-in-JS tokens) ──────────────────────────────
// Fonts are loaded in index.html via <link> tag (not here).

export const css = {
  card: {
    background:   C.card,
    border:       `1px solid ${C.border}`,
    borderRadius: 16,
    padding:      20,
    marginBottom: 14,
  },
  inp: {
    width:       "100%",
    background:  C.surface,
    border:      `1.5px solid ${C.border}`,
    borderRadius: 10,
    color:        C.text,
    fontSize:     14,
    padding:      "11px 14px",
    boxSizing:    "border-box",
    outline:      "none",
    marginTop:    6,
    fontFamily:   "'DM Mono', monospace",
  },
  label: {
    display:       "flex",
    flexDirection: "column",
    color:         C.muted,
    fontSize:      11,
    fontWeight:    700,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  hdr: {
    color:         C.muted,
    fontSize:      10,
    fontWeight:    700,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    margin:        "0 0 12px",
    display:       "flex",
    alignItems:    "center",
    gap:           8,
  },
  btn: (col = C.accent, full = false) => ({
    background:    `${col}18`,
    border:        `1.5px solid ${col}`,
    borderRadius:  10,
    color:         col,
    fontSize:      13,
    fontWeight:    700,
    padding:       "11px 20px",
    cursor:        "pointer",
    letterSpacing: 0.8,
    width:         full ? "100%" : "auto",
    transition:    "all .15s",
    fontFamily:    "'Rajdhani', sans-serif",
  }),
};

// ── Global keyframes + resets injected via <style> in main.jsx ───────────────
// NOTE: @import is intentionally NOT here — fonts are in index.html <link>.
export const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; }

  input::placeholder, textarea::placeholder { color: #2a4a6a; }
  input:focus, textarea:focus {
    border-color: #0ea5e9 !important;
    box-shadow: 0 0 0 3px #0ea5e922;
    outline: none;
  }
  button { font-family: inherit; }
  button:hover { filter: brightness(1.15); }
  textarea { resize: vertical; }

  @keyframes pulse     { 0%,100%{box-shadow:0 0 0 0 #22c55e55} 50%{box-shadow:0 0 0 6px #22c55e00} }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shake     { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes popIn     { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
  @keyframes slideDown { from{transform:translateY(-60px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes newRep    { 0%{transform:scale(.95);opacity:0} 100%{transform:scale(1);opacity:1} }

  .fadein   { animation: fadeUp    .45s ease forwards; }
  .shake    { animation: shake     .4s  ease; }
  .spin     { animation: spin      1s   linear infinite; display:inline-block; }
  .popin    { animation: popIn     .5s  ease forwards; }
  .alert-in { animation: slideDown .4s  ease; }
  .newrep   { animation: newRep    .3s  ease; }
`;
