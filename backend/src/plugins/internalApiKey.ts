import type { onRequestAsyncHookHandler } from "fastify";

/*
 * Protección máquina-a-máquina de las rutas que consume n8n.
 *
 * Extraído literalmente de server.ts. La única incorporación es la exclusión
 * de /api/admin/, que usa sesión de usuario y nunca la clave interna.
 */
export const internalApiKeyHook: onRequestAsyncHookHandler = async (
  request,
  reply
) => {
  const url = request.raw.url ?? "";

  // Solo protegemos las rutas de API.
  if (!url.startsWith("/api/")) {
    return;
  }

  // La verificación del webhook de Meta usa su propio verify token.
  if (url.startsWith("/api/whatsapp/webhook/verify")) {
    return;
  }

  // El panel se autentica con cookie de sesión, no con la clave interna.
  if (url.startsWith("/api/admin/")) {
    return;
  }

  const expectedApiKey = process.env.INTERNAL_API_KEY;

  if (!expectedApiKey) {
    request.log.error("INTERNAL_API_KEY is not configured");

    return reply.status(500).send({
      error: "server_not_configured",
    });
  }

  const header = request.headers["x-internal-api-key"];

  const providedApiKey = Array.isArray(header)
    ? header[0]
    : header;

  if (!providedApiKey || providedApiKey !== expectedApiKey) {
    return reply.status(401).send({
      error: "unauthorized",
    });
  }
};
