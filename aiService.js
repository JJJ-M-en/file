// ─── Centralized Anthropic API service ─────────────────────────────────────
// The Claude artifact environment injects the API key automatically.
// For local dev: add VITE_ANTHROPIC_API_KEY to .env — vite.config.js proxies
// the call so the key never reaches the browser bundle.
// For production: point ANTHROPIC_API to your own backend endpoint.

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL         = "claude-sonnet-4-20250514";

async function callClaude(prompt, maxTokens = 600) {
  const res = await fetch(ANTHROPIC_API, {
    method:  "POST",
    headers: {
      "Content-Type":         "application/json",
      "anthropic-version":    "2023-06-01",
      // Required header for direct browser access (Anthropic policy)
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: maxTokens,
      messages:   [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

// ── 1. Verify a Nequi payment reference ─────────────────────────────────────
export async function verifyPaymentWithAI({ reference, previousRefs = [], status }) {
  const prompt = `Eres el sistema de verificación de pagos de PreOp Fleet Colombia.
Verifica si la referencia de pago Nequi es VÁLIDA para activar el servicio.

Datos:
- Referencia ingresada: "${reference}"
- Referencias ya usadas (no pueden repetirse): ${JSON.stringify(previousRefs)}
- Estado actual del servicio: ${status}
- Monto esperado: $15.000 COP
- Número Nequi destino: 3012247063

Reglas:
1. No puede estar vacía ni ser solo espacios.
2. No puede haber sido usada antes.
3. Debe tener al menos 6 caracteres.
4. Acepta cualquier código alfanumérico real de Nequi (2024-XXXX, NEQ-XXXXX, 10+ dígitos, etc.).
5. Rechaza si es claramente inventada: "aaa", "123", "test", "prueba", "asdf", etc.

Responde ÚNICAMENTE con JSON sin markdown:
{"approved": true, "reason": "mensaje corto en español máximo 15 palabras"}`;

  try {
    const text  = await callClaude(prompt, 300);
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return { approved: false, reason: "Error al procesar la verificación. Intenta de nuevo." };
  }
}

// ── 2. Payment-cycle executive report for the supervisor ─────────────────────
export async function getPaymentReport({ status, days, payments }) {
  const prompt = `Eres el sistema IA de control de pagos de PreOp Fleet Colombia.
Estado: ${status} | Días restantes: ${days} | Pagos realizados: ${payments.length}
Último pago: ${payments.length > 0 ? payments[payments.length - 1].date : "Ninguno"}
Historial reciente: ${JSON.stringify(payments.slice(-3))}

Genera un reporte ejecutivo de 4 oraciones: estado actual, riesgo de impago,
recomendación de acción y próximo paso. Sé directo y profesional.`;

  try {
    return await callClaude(prompt, 500);
  } catch {
    return "Error al conectar con la IA. Verifica tu conexión a internet.";
  }
}
