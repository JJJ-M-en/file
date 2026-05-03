// ─── PAYMENT CONFIG ────────────────────────────────────────────────────────
export const PAYMENT_CONFIG = {
  nequi:      "3012247063",
  monthlyFee: 15000,
  trialDays:  7,
  currency:   "COP",
};

// ─── STORAGE KEYS ──────────────────────────────────────────────────────────
export const KEY_REPORTS      = "preop:reports";
export const KEY_USERS        = "preop:users";
export const KEY_SUBSCRIPTION = "preop:subscription";

// ─── COLOR PALETTE ─────────────────────────────────────────────────────────
export const C = {
  bg:      "#03070f",
  surface: "#0a1628",
  card:    "#0d1f3c",
  border:  "#1a3050",
  accent:  "#0ea5e9",
  text:    "#e2f0ff",
  muted:   "#4a6680",
  subtle:  "#1e3a5f",
};

// ─── STATUS OPTIONS ─────────────────────────────────────────────────────────
export const ST = [
  { value: "ok",       label: "OK",       color: "#22c55e", bg: "#052e0f" },
  { value: "revision", label: "Revisión", color: "#f59e0b", bg: "#2d1a00" },
  { value: "falla",    label: "Falla",    color: "#ef4444", bg: "#2d0a0a" },
  { value: "na",       label: "N/A",      color: "#475569", bg: "#1e293b" },
];

// ─── DEFAULT USERS ─────────────────────────────────────────────────────────
export const INIT_USERS = {
  supervisors: [
    { id: "sup1", name: "Carlos Ramírez",  username: "cramirez",   password: "Super123",  role: "supervisor", avatar: "CR" },
    { id: "sup2", name: "María López",     username: "mlopez",     password: "Super456",  role: "supervisor", avatar: "ML" },
  ],
  drivers: [
    { id: "drv1", name: "Andrés Torres",   username: "atorres",    password: "Driver123", role: "driver", plate: "ABC-123", avatar: "AT" },
    { id: "drv2", name: "Luis Herrera",    username: "lherrera",   password: "Driver456", role: "driver", plate: "XYZ-789", avatar: "LH" },
    { id: "drv3", name: "Pedro Gutiérrez", username: "pgutierrez", password: "Driver789", role: "driver", plate: "MNO-456", avatar: "PG" },
    { id: "drv4", name: "Diana Moreno",    username: "dmoreno",    password: "Driver321", role: "driver", plate: "QRS-654", avatar: "DM" },
  ],
};

// ─── CHECKLIST ─────────────────────────────────────────────────────────────
export const CHECKLIST = [
  { section: "Sistema de Frenos",        icon: "🛑", items: [
    { id: "freno_servicio",    label: "Freno de servicio" },
    { id: "freno_emergencia",  label: "Freno de emergencia / parqueo" },
    { id: "liquido_frenos",    label: "Nivel líquido de frenos" },
  ]},
  { section: "Iluminación",              icon: "💡", items: [
    { id: "luces_bajas",    label: "Luces bajas" },
    { id: "luces_altas",    label: "Luces altas" },
    { id: "direccionales",  label: "Direccionales / intermitentes" },
    { id: "luces_reversa",  label: "Luces de reversa" },
    { id: "luces_freno",    label: "Luces de freno" },
  ]},
  { section: "Motor y Fluidos",          icon: "⚙️", items: [
    { id: "aceite_motor",       label: "Nivel de aceite del motor" },
    { id: "refrigerante",       label: "Nivel de refrigerante/agua" },
    { id: "liquido_hidraulico", label: "Líquido hidráulico" },
    { id: "combustible",        label: "Nivel de combustible" },
    { id: "fugas_motor",        label: "Sin fugas de aceite/fluidos" },
  ]},
  { section: "Neumáticos y Ruedas",      icon: "🔧", items: [
    { id: "presion_llantas", label: "Presión de neumáticos" },
    { id: "estado_llantas",  label: "Estado del labrado" },
    { id: "llanta_repuesto", label: "Llanta de repuesto" },
    { id: "tuercas_ruedas",  label: "Tuercas de ruedas apretadas" },
  ]},
  { section: "Carrocería y Visibilidad", icon: "🪟", items: [
    { id: "parabrisas",        label: "Parabrisas sin grietas" },
    { id: "limpiabrisas",      label: "Limpiaparabrisas funcionales" },
    { id: "espejos",           label: "Espejos retrovisores" },
    { id: "puertas",           label: "Puertas y seguros" },
    { id: "carroceria_danios", label: "Carrocería sin daños nuevos" },
  ]},
  { section: "Seguridad",                icon: "🦺", items: [
    { id: "cinturon",   label: "Cinturón de seguridad" },
    { id: "extintor",   label: "Extintor (vigente y cargado)" },
    { id: "botiquin",   label: "Botiquín de primeros auxilios" },
    { id: "triangulos", label: "Triángulos de señalización" },
    { id: "chaleco",    label: "Chaleco reflectivo" },
  ]},
  { section: "Eléctrico y Batería",      icon: "🔋", items: [
    { id: "bateria",    label: "Estado de la batería" },
    { id: "alternador", label: "Indicador de carga (alternador)" },
    { id: "claxon",     label: "Bocina / Claxon" },
  ]},
  { section: "Documentación",            icon: "📄", items: [
    { id: "licencia",          label: "Licencia de conducción vigente" },
    { id: "soat",              label: "SOAT vigente" },
    { id: "tecno",             label: "Tecnomecánica vigente" },
    { id: "tarjeta_propiedad", label: "Tarjeta de propiedad" },
    { id: "seguro",            label: "Póliza de seguros" },
  ]},
];

export const ALL_ITEMS     = CHECKLIST.flatMap(s => s.items);
export const DEFAULT_CHECKS = Object.fromEntries(ALL_ITEMS.map(i => [i.id, "ok"]));
