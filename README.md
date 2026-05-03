# 🚛 PreOp Fleet Pro

**Control Pre-Operacional de Vehículos · Tiempo Real · IA · Pagos Nequi**

---

## 📁 Estructura del proyecto

```
preop-fleet/
├── public/
│   └── index.html                  ← HTML base
├── src/
│   ├── main.jsx                    ← Punto de entrada Vite
│   ├── App.jsx                     ← Componente raíz / router
│   ├── pages/
│   │   ├── Login.jsx               ← Pantalla de inicio de sesión
│   │   ├── DriverApp.jsx           ← Vista del conductor
│   │   └── SupervisorApp.jsx       ← Vista del supervisor
│   ├── components/
│   │   ├── PaymentWall.jsx         ← Pantalla de pago bloqueante
│   │   ├── AIPaymentMonitor.jsx    ← Panel IA de pagos (supervisor)
│   │   └── ui/
│   │       ├── Badge.jsx           ← Etiqueta de estado
│   │       ├── Ping.jsx            ← Indicador de conexión
│   │       ├── Chip.jsx            ← Chip de conteo
│   │       └── TrialBanner.jsx     ← Banner de prueba gratis
│   ├── hooks/
│   │   ├── useSharedReports.js     ← Sincronización de reportes en tiempo real
│   │   ├── useSharedUsers.js       ← Gestión de usuarios compartida
│   │   └── useSubscription.js      ← Control de suscripción + auto-suspensión
│   └── utils/
│       ├── constants.js            ← Usuarios, checklist, colores, claves
│       ├── helpers.js              ← Funciones puras (estado, fechas)
│       ├── styles.js               ← Estilos globales y tokens CSS-in-JS
│       └── aiService.js            ← Llamadas a la API de Anthropic (IA)
├── .env.example                    ← Plantilla de variables de entorno
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## ✨ Funcionalidades

| Módulo | Descripción |
|---|---|
| 📋 Checklist | 8 secciones · 33 ítems de inspección vehicular |
| ⚡ Tiempo real | Supervisor ve reportes instantáneos vía `window.storage` |
| 🎁 Prueba gratis | 7 días automáticos al primer ingreso |
| 💳 Pago Nequi | $15.000 COP/mes al número **3012247063** |
| 🤖 IA verifica pagos | Claude analiza la referencia y activa el servicio al instante |
| ⛔ Auto-suspensión | El sistema bloquea el acceso si vence el período sin pago |
| ✏️ Gestión usuarios | Supervisor edita nombre, usuario y contraseña de conductores |
| 🔑 Reset passwords | Supervisores cambian contraseñas desde el panel |

---

## 🚀 Instalación rápida

```bash
# 1. Clonar
git clone https://github.com/TU_USUARIO/preop-fleet.git
cd preop-fleet

# 2. Instalar dependencias
npm install

# 3. Configurar clave de API (solo desarrollo)
cp .env.example .env
# Edita .env y coloca tu VITE_ANTHROPIC_API_KEY

# 4. Ejecutar en modo desarrollo
npm run dev
# → http://localhost:3000

# 5. Construir para producción
npm run build
```

---

## 🔑 Conexión a la red (API de Anthropic)

### Desarrollo local
La clave se inyecta via proxy en `vite.config.js`. Solo necesitas:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

### Producción (recomendado)
**Nunca expongas la API key en el frontend en producción.**
Crea un endpoint propio (Node/Express, Cloudflare Workers, etc.) que reciba la solicitud y llame a Anthropic:

```js
// backend/anthropic-proxy.js (ejemplo Express)
import express from "express";
import fetch   from "node-fetch";

const app = express();
app.use(express.json());

app.post("/api/ai", async (req, res) => {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method:  "POST",
    headers: {
      "Content-Type":         "application/json",
      "x-api-key":            process.env.ANTHROPIC_API_KEY,
      "anthropic-version":    "2023-06-01",
    },
    body: JSON.stringify(req.body),
  });
  const data = await response.json();
  res.json(data);
});

app.listen(4000);
```

Luego en `src/utils/aiService.js` cambia la URL:
```js
const ANTHROPIC_API = "/api/ai"; // Apunta a tu backend
```

---

## 💳 Sistema de suscripción

```
Prueba gratuita : 7 días (automática al primer ingreso)
Costo mensual   : $15.000 COP
Método de pago  : Nequi → 3012247063
Concepto        : PreOp Fleet
```

**Flujo de pago con IA:**
1. Usuario ingresa la referencia del comprobante Nequi
2. Presiona **"Verificar y Activar con IA"**
3. Claude analiza la referencia (validez, duplicados, formato)
4. Si aprueba → servicio activo en 1.5 segundos
5. Si rechaza → muestra el motivo y pide corregir

---

## 👥 Usuarios por defecto

### Supervisores
| Nombre | Usuario | Contraseña |
|---|---|---|
| Carlos Ramírez | `cramirez` | `Super123` |
| María López    | `mlopez`   | `Super456` |

### Conductores
| Nombre | Usuario | Contraseña | Placa |
|---|---|---|---|
| Andrés Torres   | `atorres`    | `Driver123` | ABC-123 |
| Luis Herrera    | `lherrera`   | `Driver456` | XYZ-789 |
| Pedro Gutiérrez | `pgutierrez` | `Driver789` | MNO-456 |
| Diana Moreno    | `dmoreno`    | `Driver321` | QRS-654 |

---

## 📤 Subir a GitHub

```bash
git init
git add .
git commit -m "🚛 PreOp Fleet Pro v2.0 — IA + Nequi + Tiempo Real"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/preop-fleet.git
git push -u origin main
```

---

## 🛡️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| React 18 + Vite | UI y bundler |
| Claude AI (Anthropic) | Verificación de pagos con IA |
| `window.storage` | Sincronización en tiempo real |
| CSS-in-JS | Estilos sin dependencias externas |

---

*PreOp Fleet Pro © 2025 Janer Figueroa — Hecho en Colombia 🇨🇴*
