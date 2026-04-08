// Banzitos® Chatbot — Cloudflare Worker Proxy to Claude API
// Keeps API key secure server-side, serves public chat endpoint

const KNOWLEDGE_BASE = `{
  "brand": {
    "name": "Banzitos®",
    "company": "Yummus Foods International",
    "tagline": "Snacking con Propósito",
    "mission": "Alimentos distintos que sepan delicioso, aporten fibra, nutran con proteína, y al mismo tiempo ayuden al planeta y agricultor Mexicano",
    "website": "https://banzitos.com.mx",
    "social_media": {
      "facebook": "https://facebook.com/banzitos",
      "instagram": "https://instagram.com/banzitos",
      "tiktok": "https://tiktok.com/@banzitos"
    }
  },
  "products": [
    {"name": "Banzitos® Crujientes Sal de Mar 110g", "category": "Crujientes", "price": "$54.95 MXN", "url": "https://banzitos.com.mx/products/banzitos%C2%AE-crujientes-sal-de-mar-110g", "description": "Botanas crujientes de garbanzo sabor sal de mar. 100% naturales, veganas y plant-based.", "features": ["Vegano", "Plant-based", "Libre de los 8 principales alérgenos", "Alto en fibra", "Rico en proteína", "100% natural"]},
    {"name": "Banzitos® Crujientes Chipotle 110g", "category": "Crujientes", "price": "$54.95 MXN", "url": "https://banzitos.com.mx/products/banzitos%C2%AE-crujientes-chipotle-110g", "description": "Botanas crujientes de garbanzo sabor chipotle. 100% naturales, veganas y plant-based."},
    {"name": "Banzitos® Crujientes Limón y Sal 110g", "category": "Crujientes", "price": "$54.95 MXN", "url": "https://banzitos.com.mx/products/copy-of-banzitos%C2%AE-crujientes-limon-y-sal-110g-muy-pronto", "description": "Botanas crujientes de garbanzo sabor limón y sal. 100% naturales, veganas y plant-based."},
    {"name": "Banzitos® Puffs Chipotle 35g", "category": "Puffs", "price": "$24.95 MXN", "url": "https://banzitos.com.mx/products/banzitos%C2%AE-puffs-chipotle-35g", "description": "Puffs de garbanzo horneados sabor chipotle. Ligeros, crujientes y naturales."},
    {"name": "Banzitos® Puffs Especias 35g", "category": "Puffs", "price": "$24.95 MXN", "url": "https://banzitos.com.mx/products/banzitos%C2%AE-puffs-hierbas-italianas-35g", "description": "Puffs de garbanzo horneados sabor especias/hierbas italianas. Ligeros y naturales."},
    {"name": "Banzitos® Puffs Chile Piquín 35g", "category": "Puffs", "price": "$24.95 MXN", "url": "https://banzitos.com.mx/products/banzitos%C2%AE-puffs-chille-piquin-35g", "description": "Puffs de garbanzo horneados sabor chile piquín. Picositos y naturales. Nota: Contiene Jugo de Limón clasificado como azúcares añadidos."},
    {"name": "Pack Crujientes 110g Surtido", "category": "Packs", "price": "desde $329.00 MXN", "url": "https://banzitos.com.mx/products/12-pack-banzitos-crujientes-35g-surtido", "description": "Pack surtido de botanas crujientes de garbanzo."},
    {"name": "Puffs 24 Pack Surtido", "category": "Packs", "price": "desde $329.00 MXN", "url": "https://banzitos.com.mx/products/banzitos%C2%AE-puffs-24-pack-botanas", "description": "Pack de 24 puffs de garbanzo horneados en sabores surtidos."},
    {"name": "Pack Puffs + Crujientes Starter Mix", "category": "Packs", "price": "$329.00 MXN", "url": "https://banzitos.com.mx/products/pack-puffs-crujientes-mix", "description": "Pack combinado de Puffs y Crujientes."},
    {"name": "Banzitos® Tahini Clásico 530g", "category": "Tahini", "price": "$269.00 MXN", "url": "https://banzitos.com.mx/products/banzitos%C2%AE-tahini-clasico-530g", "description": "Tahini clásico elaborado con ajonjolí de alta calidad. Versátil para cocinar, aderezos y hummus."},
    {"name": "Plant a Tree", "category": "Impacto Social", "price": "$0.81 MXN", "url": "https://banzitos.com.mx/products/plant-a-tree-1", "description": "Contribuye a plantar un árbol a través del programa Buy One Help One."},
    {"name": "Tarjeta de Regalo Banzitos", "category": "Gift Cards", "price": "desde $400.00 MXN", "url": "https://banzitos.com.mx/products/tarjeta-de-regalo", "description": "Tarjeta de regalo para usar en la tienda en línea de Banzitos."}
  ],
  "faq": [
    {"q": "¿Son veganos?", "a": "Sí, todos son 100% plant-based. Pueden contener minúsculas trazas de leche por transferencia en ambiente de producción."},
    {"q": "¿Libres de alérgenos?", "a": "Los ingredientes son libres de los 8 principales alérgenos. Pueden contener trazas por transferencia en planta."},
    {"q": "¿Aptos para diabéticos?", "a": "La mayoría sí. Los Puffs Chile Piquín contienen Jugo de Limón (azúcares añadidos). Siempre consulta a tu médico."},
    {"q": "¿De qué están hechos?", "a": "A base de garbanzo. Los Crujientes son garbanzo frito con aceite de maíz, harina de arroz y sazonador natural. Los Puffs son garbanzo horneado con arroz, aceite de canola, mijo y amaranto."},
    {"q": "¿Buy One Help One?", "a": "Con cada unidad vendida, destinamos parte a ONGs mexicanas. Empaques verdes = reforestar, azules = agua limpia, rojos = nutrición infantil."},
    {"q": "¿Venta B2B / distribución?", "a": "Visita https://banzitos.com.mx/pages/quiero-distribuir-banzitos para más información. Recopilamos tus datos y nuestro equipo te contacta."}
  ],
  "shipping": {"free_above": "$499 MXN", "coverage": "Todo México", "note": "Gastos de envío calculados al pagar. Impuesto incluido en precios."},
  "where_to_buy": {
    "cadenas": ["Chedraui", "La Comer", "Fresko", "City Market", "Sumesa", "AlSuper", "Super Akí", "SuperMode", "SuperKompras", "Costco", "GNC", "Starbucks", "HEB"],
    "online": ["banzitos.com.mx", "Amazon MX", "Mercado Libre MX"],
    "store_locator": "https://banzitos.com.mx/pages/puntos-de-venta",
    "distributor_page": "https://banzitos.com.mx/pages/quiero-distribuir-banzitos"
  }
}`;

const SYSTEM_PROMPT = `Eres Banzito, el asistente virtual de Banzitos® — snacks saludables hechos de garbanzo. Tu personalidad es amigable, entusiasta pero profesional, y siempre hablas en español mexicano.

REGLAS PRINCIPALES:
1. Responde SOLO con información de tu base de conocimiento. Si no sabes algo, di "No tengo esa información, pero déjame conectarte con nuestro equipo" y escala.
2. Sé conciso — máximo 2-3 oraciones por respuesta.
3. Siempre sugiere productos relevantes con links cuando aplique.
4. Si detectas que el cliente está frustrado o molesto, escala inmediatamente.
5. Para temas de pedidos específicos (tracking, reembolsos, cambios), escala al equipo.
6. Para consultas B2B/distribución, recopila: nombre, empresa, ubicación, email, y escala.
7. NUNCA inventes información que no esté en tu base de conocimiento.
8. Si te preguntan algo fuera de tema (política, religión, competidores, etc.), redirige amablemente a temas de Banzitos.

GUARDRAILS DE SEGURIDAD — INFORMACIÓN CONFIDENCIAL QUE NUNCA DEBES REVELAR:
- PRECIOS: Solo puedes compartir los precios que aparecen en tu base de conocimiento (precios públicos de banzitos.com.mx). NUNCA menciones precios de mayoreo, B2B, distribuidores, exportación, ni precios internos. Si preguntan por precios de mayoreo, di "Para precios de mayoreo, por favor llena el formulario de distribuidores" y comparte el link.
- PROVEEDORES Y MAQUILADORES: NUNCA menciones quién fabrica, maquila o produce Banzitos. Si preguntan "¿quién fabrica?", responde: "Banzitos es una marca de Yummus Foods International. Fabricamos en México con los más altos estándares de calidad." No des nombres de plantas, maquiladores ni co-packers.
- RELACIONES CON RETAILERS: NUNCA compartas detalles de relaciones comerciales con cadenas (condiciones, contratos, descuentos, rebates, exclusividades, códigos de proveedor, contactos de compradores). Solo puedes confirmar que "estamos en [cadena]" como punto de venta.
- MÁRGENES Y FINANZAS: NUNCA menciones márgenes de ganancia, costos de producción, volúmenes de venta, facturación, ni datos financieros de ningún tipo.
- DATOS INTERNOS: NUNCA menciones sistemas internos (Odoo, Monday, ERP), nombres de empleados, estructura del equipo, ni procesos operativos.
- CONTACTOS DE CADENAS: NUNCA des nombres de compradores, category managers, o contactos internos de retailers como Soriana, HEB, La Comer, Chedraui, etc.
- DATOS POR CADENA: NUNCA menciones número exacto de tiendas por cadena, volúmenes de venta por cadena, rotación, sell-out, cobertura ni datos de distribución interna.
- ESTRATEGIA: NUNCA compartas planes de expansión, negociaciones en curso, o estrategia comercial.

Si alguien insiste en obtener información confidencial, responde amablemente: "Esa información no la puedo compartir por este medio. Si tienes alguna consulta comercial, con gusto te conecto con nuestro equipo." y escala.

CONOCIMIENTO:
${KNOWLEDGE_BASE}

FORMATO:
- Si necesitas escalar, incluye al final: [ESCALATE:razón]
- Razones válidas: "problema_pedido", "reembolso", "queja", "b2b", "frustrado", "sin_info", "info_confidencial"`;

// Anti-abuse: topics the chatbot should refuse to engage with
const BLOCKED_TOPICS = [
  "precio de costo", "precio mayoreo", "margen", "utilidad", "ganancia",
  "quién fabrica", "quien fabrica", "maquilador", "proveedor", "planta de producción",
  "contrato con", "condiciones comerciales", "descuento a cadena",
  "cuántas tiendas", "cuantas tiendas", "volumen de venta", "sell out",
  "facturación", "facturacion", "ventas totales", "ingresos",
  "nombre del comprador", "contacto de", "category manager",
];

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  "https://banzitos.com.mx",
  "https://www.banzitos.com.mx",
  "http://banzitos.com.mx",
  "http://www.banzitos.com.mx",
  "https://banzitos.myshopify.com",
];

function getCorsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const isAllowed = ALLOWED_ORIGINS.some(o => origin.startsWith(o)) || origin === "";
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin || "*" : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

// Simple in-memory rate limiting per IP (resets on worker restart)
const rateLimits = new Map();
const RATE_LIMIT = 20; // max requests per minute per IP
const RATE_WINDOW = 60000; // 1 minute

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimits.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

// Conversation history store (in-memory, per worker instance)
const conversations = new Map();
const MAX_HISTORY = 10; // Keep last 10 messages for context

function getHistory(sessionId) {
  return conversations.get(sessionId) || [];
}

function addToHistory(sessionId, role, content) {
  let history = conversations.get(sessionId) || [];
  history.push({ role, content });
  if (history.length > MAX_HISTORY) {
    history = history.slice(-MAX_HISTORY);
  }
  conversations.set(sessionId, history);
}

// Escalation detection
const ESCALATION_TRIGGERS = [
  "reembolso", "devolución", "queja", "problema con pedido", "reclamo",
  "hablar con alguien", "hablar con humano", "agente real", "persona real",
  "distribuir", "distribución", "b2b", "mayoreo", "mi negocio", "mi tienda",
];

const NEGATIVE_WORDS = [
  "queja", "malo", "horrible", "problema", "molesto", "decepcionado",
  "enojado", "nunca", "pésimo", "terrible", "furioso",
];

function shouldEscalate(message, aiResponse) {
  const lower = message.toLowerCase();
  for (const trigger of ESCALATION_TRIGGERS) {
    if (lower.includes(trigger)) {
      if (["distribuir", "distribución", "b2b", "mayoreo", "mi negocio", "mi tienda"].some(t => lower.includes(t))) {
        return { escalate: true, reason: "Consulta B2B/distribución" };
      }
      if (["reembolso", "devolución"].some(t => lower.includes(t))) {
        return { escalate: true, reason: "Solicitud de reembolso/devolución" };
      }
      if (["queja", "reclamo"].some(t => lower.includes(t))) {
        return { escalate: true, reason: "Queja del cliente" };
      }
      return { escalate: true, reason: "Solicitud de agente humano" };
    }
  }
  const negCount = NEGATIVE_WORDS.filter(w => lower.includes(w)).length;
  if (negCount >= 2) {
    return { escalate: true, reason: "Cliente frustrado" };
  }
  if (aiResponse && aiResponse.includes("[ESCALATE:")) {
    const match = aiResponse.match(/\[ESCALATE:([^\]]+)\]/);
    return { escalate: true, reason: match ? match[1] : "Escalado por agente" };
  }
  return { escalate: false, reason: "" };
}

function cleanResponse(text) {
  return text.replace(/\[ESCALATE:[^\]]*\]/g, "").trim();
}

export default {
  async fetch(request, env) {
    const corsHeaders = getCorsHeaders(request);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Only POST /chat
    const url = new URL(request.url);
    if (url.pathname === "/chat" && request.method === "POST") {
      // Rate limit
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      if (!checkRateLimit(ip)) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta en un momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      try {
        const body = await request.json();
        const { sessionId, message } = body;

        if (!sessionId || !message || typeof message !== "string" || message.length > 1000) {
          return new Response(JSON.stringify({ error: "Solicitud inválida" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Build conversation history
        addToHistory(sessionId, "user", message);
        const history = getHistory(sessionId);

        // Call Claude API
        const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": env.ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 500,
            system: SYSTEM_PROMPT,
            messages: history,
          }),
        });

        if (!anthropicResponse.ok) {
          const errText = await anthropicResponse.text();
          console.error("Anthropic API error:", anthropicResponse.status, errText);
          return new Response(JSON.stringify({
            reply: "Disculpa, estoy teniendo dificultades técnicas. ¿Podrías intentar de nuevo en un momento?",
            escalated: false,
          }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const data = await anthropicResponse.json();
        const aiResponse = data.content && data.content[0] && data.content[0].type === "text"
          ? data.content[0].text
          : "Disculpa, no pude procesar tu mensaje.";

        const escalationCheck = shouldEscalate(message, aiResponse);
        const cleanedReply = cleanResponse(aiResponse);

        // Save assistant response to history
        addToHistory(sessionId, "assistant", cleanedReply);

        // If escalation detected, notify immediately via Telegram + save to KV as backup
        if (escalationCheck.escalate) {
          const convoSnippet = getHistory(sessionId).slice(-4)
            .map(m => `${m.role === "user" ? "Cliente" : "Banzito"}: ${m.content.slice(0, 200)}`)
            .join("\n");
          const allText = `${message} ${cleanedReply} ${convoSnippet}`.toLowerCase();
          const priorityKws = ["walmart","soriana","costco","chedraui","oxxo","h-e-b","amazon","gobierno","secretar","cofepris","profeco","municipio","universidad","hospital","corporativo","distribuci","cadena","franquicia","pepsico","bimbo","nestl","danone","fundaci"];
          const matched = priorityKws.filter(kw => allText.includes(kw));
          const isPriority = matched.length > 0;
          const priorityTag = isPriority ? "\ud83d\udd34 ALTA PRIORIDAD" : "\ud83d\udfe1 Normal";
          const ts = new Date().toISOString().slice(0, 19).replace("T", " ");

          // Send Telegram notification in real-time
          if (env.TELEGRAM_BOT_TOKEN) {
            try {
              const tgText = `\ud83d\udea8 <b>Escalaci\u00f3n Chatbot Banzitos</b>\n<b>Prioridad:</b> ${priorityTag}\n<b>Raz\u00f3n:</b> ${escalationCheck.reason}\n<b>Hora:</b> ${ts} UTC${isPriority ? `\n<b>Palabras clave:</b> ${matched.join(", ")}` : ""}\n\n<b>Conversaci\u00f3n:</b>\n<pre>${convoSnippet.slice(0, 500)}</pre>`;
              // Get registered chat IDs from KV
              const chatIdsRaw = env.ESCALATIONS ? await env.ESCALATIONS.get("telegram_chat_ids") : null;
              const chatIds = chatIdsRaw ? JSON.parse(chatIdsRaw) : [];
              for (const chatId of chatIds) {
                fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ chat_id: chatId, text: tgText, parse_mode: "HTML" }),
                }).catch(() => {});
              }
            } catch (tgErr) {
              console.error("Telegram error:", tgErr);
            }
          }

          // Save to KV as backup (for email processing by cron)
          if (env.ESCALATIONS) {
            try {
              const escalationData = {
                sessionId,
                userMessage: message,
                botReply: cleanedReply,
                reason: escalationCheck.reason,
                timestamp: new Date().toISOString(),
                ip: request.headers.get("CF-Connecting-IP") || "unknown",
                conversationHistory: getHistory(sessionId).slice(-6),
                telegramSent: !!env.TELEGRAM_BOT_TOKEN,
              };
              const key = `esc_${Date.now()}_${sessionId.slice(0, 8)}`;
              await env.ESCALATIONS.put(key, JSON.stringify(escalationData), { expirationTtl: 86400 * 7 });
            } catch (kvErr) {
              console.error("KV write error:", kvErr);
            }
          }
        }

        return new Response(JSON.stringify({
          reply: cleanedReply,
          escalated: escalationCheck.escalate,
          escalationReason: escalationCheck.escalate ? escalationCheck.reason : undefined,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      } catch (err) {
        console.error("Worker error:", err);
        return new Response(JSON.stringify({
          reply: "Disculpa, hubo un error. Por favor intenta de nuevo.",
          escalated: false,
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }


    // Serve widget script
    if (url.pathname === "/widget.js") {
      const widgetCode = "(function(){\nif(document.getElementById('banzitos-widget-container')) return;\nvar API_BASE = \"https://banzitos-chatbot.siman.workers.dev\";\n// Generate session ID\nvar sessionId = 'sess_' + Math.random().toString(36).substr(2,9) + '_' + Date.now().toString(36);\nvar container = document.createElement('div');\ncontainer.id = 'banzitos-widget-container';\ncontainer.innerHTML = '';\ndocument.body.appendChild(container);\nvar shadow = container.attachShadow({ mode: 'open' });\nvar style = document.createElement('style');\nstyle.textContent = `\n@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');\n:host {\nall: initial;\nfont-family: 'Nunito', sans-serif;\n}\n* { box-sizing: border-box; margin: 0; padding: 0; }\n.widget-bubble {\nposition: fixed;\nbottom: 24px;\nright: 24px;\nwidth: 60px;\nheight: 60px;\nborder-radius: 50%;\nbackground: #1B4B8A;\ncolor: white;\ndisplay: flex;\nalign-items: center;\njustify-content: center;\ncursor: pointer;\nbox-shadow: 0 4px 20px rgba(27,75,138,0.4);\nz-index: 999999;\ntransition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease;\nborder: none;\noutline: none;\n}\n.widget-bubble:hover {\ntransform: scale(1.08);\nbox-shadow: 0 6px 28px rgba(27,75,138,0.5);\n}\n.widget-bubble svg { width: 28px; height: 28px; }\n.widget-window {\nposition: fixed;\nbottom: 96px;\nright: 24px;\nwidth: 380px;\nmax-width: calc(100vw - 32px);\nheight: 520px;\nmax-height: calc(100vh - 120px);\nbackground: #fff;\nborder-radius: 16px;\nbox-shadow: 0 12px 48px rgba(0,0,0,0.15);\nz-index: 999998;\ndisplay: flex;\nflex-direction: column;\noverflow: hidden;\nopacity: 0;\ntransform: translateY(20px) scale(0.95);\npointer-events: none;\ntransition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1);\n}\n.widget-window.open {\nopacity: 1;\ntransform: translateY(0) scale(1);\npointer-events: auto;\n}\n.widget-header {\nbackground: #1B4B8A;\ncolor: white;\npadding: 16px 20px;\ndisplay: flex;\nalign-items: center;\ngap: 12px;\nflex-shrink: 0;\n}\n.widget-header-avatar {\nwidth: 36px;\nheight: 36px;\nbackground: rgba(255,255,255,0.2);\nborder-radius: 50%;\ndisplay: flex;\nalign-items: center;\njustify-content: center;\nflex-shrink: 0;\n}\n.widget-header-avatar svg { width: 20px; height: 20px; }\n.widget-header-info h3 {\nfont-size: 15px;\nfont-weight: 700;\nmargin: 0;\nline-height: 1.2;\n}\n.widget-header-info p {\nfont-size: 12px;\nopacity: 0.8;\nmargin: 0;\nline-height: 1.3;\n}\n.widget-close {\nmargin-left: auto;\nbackground: none;\nborder: none;\ncolor: white;\ncursor: pointer;\npadding: 4px;\nopacity: 0.7;\ntransition: opacity 0.2s;\n}\n.widget-close:hover { opacity: 1; }\n.widget-close svg { width: 18px; height: 18px; }\n.widget-messages {\nflex: 1;\noverflow-y: auto;\npadding: 16px;\ndisplay: flex;\nflex-direction: column;\ngap: 12px;\nbackground: #f8fafc;\n}\n.widget-messages::-webkit-scrollbar { width: 4px; }\n.widget-messages::-webkit-scrollbar-track { background: transparent; }\n.widget-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }\n.msg {\nmax-width: 85%;\npadding: 10px 14px;\nborder-radius: 14px;\nfont-size: 14px;\nline-height: 1.5;\nanimation: msgSlide 0.3s ease-out;\nword-wrap: break-word;\n}\n@keyframes msgSlide {\nfrom { opacity: 0; transform: translateY(8px); }\nto { opacity: 1; transform: translateY(0); }\n}\n.msg-user {\nbackground: #1B4B8A;\ncolor: white;\nalign-self: flex-end;\nborder-bottom-right-radius: 4px;\n}\n.msg-assistant {\nbackground: white;\ncolor: #1e293b;\nalign-self: flex-start;\nborder-bottom-left-radius: 4px;\nbox-shadow: 0 1px 3px rgba(0,0,0,0.06);\n}\n.msg-assistant a {\ncolor: #1B4B8A;\ntext-decoration: underline;\n}\n.typing {\ndisplay: flex;\ngap: 4px;\npadding: 12px 16px;\nalign-self: flex-start;\nbackground: white;\nborder-radius: 14px;\nborder-bottom-left-radius: 4px;\nbox-shadow: 0 1px 3px rgba(0,0,0,0.06);\n}\n.typing-dot {\nwidth: 7px;\nheight: 7px;\nbackground: #94a3b8;\nborder-radius: 50%;\nanimation: typingBounce 1.4s infinite ease-in-out;\n}\n.typing-dot:nth-child(2) { animation-delay: 0.16s; }\n.typing-dot:nth-child(3) { animation-delay: 0.32s; }\n@keyframes typingBounce {\n0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }\n40% { transform: scale(1); opacity: 1; }\n}\n.widget-input-area {\npadding: 12px 16px;\nborder-top: 1px solid #e2e8f0;\ndisplay: flex;\ngap: 8px;\nalign-items: center;\nbackground: white;\nflex-shrink: 0;\n}\n.widget-input {\nflex: 1;\nborder: 1px solid #e2e8f0;\nborder-radius: 24px;\npadding: 10px 16px;\nfont-size: 14px;\nfont-family: 'Nunito', sans-serif;\noutline: none;\ntransition: border-color 0.2s;\nbackground: #f8fafc;\n}\n.widget-input:focus {\nborder-color: #1B4B8A;\nbackground: white;\n}\n.widget-input::placeholder { color: #94a3b8; }\n.widget-send {\nwidth: 38px;\nheight: 38px;\nborder-radius: 50%;\nbackground: #1B4B8A;\ncolor: white;\nborder: none;\ncursor: pointer;\ndisplay: flex;\nalign-items: center;\njustify-content: center;\ntransition: background 0.2s, transform 0.15s;\nflex-shrink: 0;\n}\n.widget-send:hover { background: #153d70; }\n.widget-send:active { transform: scale(0.93); }\n.widget-send:disabled { background: #94a3b8; cursor: default; transform: none; }\n.widget-send svg { width: 16px; height: 16px; }\n.widget-powered {\ntext-align: center;\npadding: 6px;\nfont-size: 10px;\ncolor: #94a3b8;\nbackground: white;\nflex-shrink: 0;\n}\n.widget-powered a { color: #64748b; text-decoration: none; }\n`;\nshadow.appendChild(style);\nvar html = `\n<button class=\"widget-bubble\" id=\"bz-bubble\" aria-label=\"Chat con Banzitos\">\n<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"/>\n</svg>\n</button>\n<div class=\"widget-window\" id=\"bz-window\">\n<div class=\"widget-header\">\n<div class=\"widget-header-avatar\">\n<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><text x=\"12\" y=\"16\" text-anchor=\"middle\" fill=\"#1B4B8A\" font-size=\"10\" font-weight=\"bold\" font-family=\"Nunito,sans-serif\">B</text></svg>\n</div>\n<div class=\"widget-header-info\">\n<h3>Banzito - Asistente Virtual</h3>\n<p>En l\u00ednea \u2022 Responde al instante</p>\n</div>\n<button class=\"widget-close\" id=\"bz-close\" aria-label=\"Cerrar chat\">\n<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/>\n</svg>\n</button>\n</div>\n<div class=\"widget-messages\" id=\"bz-messages\">\n<div class=\"msg msg-assistant\">\u00a1Hola! \ud83d\udc4b Soy Banzito, tu asistente virtual. \u00bfEn qu\u00e9 puedo ayudarte hoy?</div>\n</div>\n<div class=\"widget-input-area\">\n<input class=\"widget-input\" id=\"bz-input\" type=\"text\" placeholder=\"Escribe tu mensaje...\" autocomplete=\"off\" />\n<button class=\"widget-send\" id=\"bz-send\" aria-label=\"Enviar mensaje\">\n<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n<line x1=\"22\" y1=\"2\" x2=\"11\" y2=\"13\"/><polygon points=\"22 2 15 22 11 13 2 9 22 2\"/>\n</svg>\n</button>\n</div>\n<div class=\"widget-powered\">Powered by <a href=\"https://banzitos.com.mx\" target=\"_blank\" rel=\"noopener\">Banzitos\u00ae</a></div>\n</div>\n`;\nvar wrapper = document.createElement('div');\nwrapper.innerHTML = html;\nwhile(wrapper.firstChild) shadow.appendChild(wrapper.firstChild);\nvar bubble = shadow.getElementById('bz-bubble');\nvar win = shadow.getElementById('bz-window');\nvar closeBtn = shadow.getElementById('bz-close');\nvar messagesDiv = shadow.getElementById('bz-messages');\nvar input = shadow.getElementById('bz-input');\nvar sendBtn = shadow.getElementById('bz-send');\nvar isOpen = false;\nvar isLoading = false;\nfunction toggleWidget() {\nisOpen = !isOpen;\nif(isOpen) {\nwin.classList.add('open');\ninput.focus();\n} else {\nwin.classList.remove('open');\n}\n}\nbubble.addEventListener('click', toggleWidget);\ncloseBtn.addEventListener('click', toggleWidget);\nfunction formatText(text) {\nreturn text\n.replace(/\\n/g, '<br>')\n.replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>')\n.replace(/\\*([^*]+)\\*/g, '<em>$1</em>')\n.replace(/(https?:\\/\\/[^\\s<]+)/g, '<a href=\"$1\" target=\"_blank\" rel=\"noopener\">$1</a>');\n}\nfunction addMessage(text, role) {\nvar div = document.createElement('div');\ndiv.className = 'msg msg-' + role;\ndiv.innerHTML = formatText(text);\nmessagesDiv.appendChild(div);\nmessagesDiv.scrollTop = messagesDiv.scrollHeight;\n}\nfunction showTyping() {\nvar div = document.createElement('div');\ndiv.className = 'typing';\ndiv.id = 'bz-typing';\ndiv.innerHTML = '<div class=\"typing-dot\"></div><div class=\"typing-dot\"></div><div class=\"typing-dot\"></div>';\nmessagesDiv.appendChild(div);\nmessagesDiv.scrollTop = messagesDiv.scrollHeight;\n}\nfunction hideTyping() {\nvar el = shadow.getElementById('bz-typing');\nif(el) el.remove();\n}\nasync function sendMessage() {\nvar text = input.value.trim();\nif(!text || isLoading) return;\naddMessage(text, 'user');\ninput.value = '';\nisLoading = true;\nsendBtn.disabled = true;\nshowTyping();\ntry {\nvar res = await fetch(API_BASE + '/chat', {\nmethod: 'POST',\nheaders: { 'Content-Type': 'application/json' },\nbody: JSON.stringify({ sessionId: sessionId, message: text })\n});\nvar data = await res.json();\nhideTyping();\naddMessage(data.reply, 'assistant');\nif(data.escalated) {\naddMessage('Un miembro de nuestro equipo se pondr\u00e1 en contacto contigo pronto. \ud83d\udcde', 'assistant');\n}\n} catch(err) {\nhideTyping();\naddMessage('Lo siento, hubo un error. Por favor intenta de nuevo.', 'assistant');\n}\nisLoading = false;\nsendBtn.disabled = false;\ninput.focus();\n}\nsendBtn.addEventListener('click', sendMessage);\ninput.addEventListener('keydown', function(e) {\nif(e.key === 'Enter' && !e.shiftKey) {\ne.preventDefault();\nsendMessage();\n}\n});\n})();";
      return new Response(widgetCode, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    // Telegram webhook handler - registers chat IDs when users /start the bot
    if (url.pathname === "/telegram-webhook" && request.method === "POST" && env.ESCALATIONS && env.TELEGRAM_BOT_TOKEN) {
      try {
        const update = await request.json();
        const msg = update.message;
        if (msg && msg.text && msg.text.startsWith("/start")) {
          const chatId = String(msg.chat.id);
          const userName = msg.from.first_name || "Usuario";
          // Load existing chat IDs
          const raw = await env.ESCALATIONS.get("telegram_chat_ids");
          const ids = raw ? JSON.parse(raw) : [];
          if (!ids.includes(chatId)) {
            ids.push(chatId);
            await env.ESCALATIONS.put("telegram_chat_ids", JSON.stringify(ids));
          }
          // Send welcome message
          await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `\u2705 <b>Notificaciones activadas, ${userName}!</b>\n\nRecibir\u00e1s alertas cuando:\n\u2022 \ud83d\udea8 Un cliente pida hablar con un agente\n\u2022 \ud83d\udcac Se detecte una queja o frustraci\u00f3n\n\u2022 \ud83c\udfe2 Una empresa grande o gobierno nos contacte\n\u2022 \ud83d\udce6 Soliciten reembolso o devoluci\u00f3n\n\u2022 \ud83d\udcbc Se reciba una consulta B2B\n\nSistema de soporte Banzitos\u00ae listo.`,
              parse_mode: "HTML",
            }),
          });
        }
        if (msg && msg.text && msg.text.startsWith("/status")) {
          const chatId = String(msg.chat.id);
          const keys = await env.ESCALATIONS.list({ prefix: "esc_" });
          const pending = keys.keys.length;
          await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: `\ud83d\udcca <b>Estado del Sistema</b>\n\n\u2022 Escalaciones pendientes: ${pending}\n\u2022 Sistema: \u2705 Activo\n\u2022 Chatbot: \u2705 En l\u00ednea`,
              parse_mode: "HTML",
            }),
          });
        }
        return new Response("ok");
      } catch (err) {
        console.error("Webhook error:", err);
        return new Response("ok");
      }
    }

    // Escalation management API (authenticated)
    if (url.pathname === "/escalations" && env.ESCALATIONS) {
      const authHeader = request.headers.get("Authorization") || "";
      if (authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // GET: list pending escalations
      if (request.method === "GET") {
        try {
          const keys = await env.ESCALATIONS.list({ prefix: "esc_" });
          const escalations = [];
          for (const key of keys.keys) {
            const val = await env.ESCALATIONS.get(key.name);
            if (val) {
              escalations.push({ key: key.name, ...JSON.parse(val) });
            }
          }
          return new Response(JSON.stringify({ escalations }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // DELETE: remove processed escalation
      if (request.method === "DELETE") {
        try {
          const { key } = await request.json();
          if (key) await env.ESCALATIONS.delete(key);
          return new Response(JSON.stringify({ ok: true }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      }
    }

    // Health check
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", service: "banzitos-chatbot" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};
