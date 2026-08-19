import Fastify from "fastify";
import { db } from "./db.js";

import { customerRoutes } from "./routes/customers.js";
import { vehicleRoutes } from "./routes/vehicles.js";
import { requestRoutes } from "./routes/requests.js";
import { conversationRoutes } from "./routes/conversations.js";
import { messageRoutes } from "./routes/messages.js";
import { whatsappRoutes } from "./routes/whatsapp.js";

import messageLookupRoutes from "./routes/messageLookup.js";
import workflowErrorRoutes from "./routes/workflowErrors.js";
import messageStatusRoutes from "./routes/messageStatuses.js";

const app = Fastify({
  logger: true,
});

app.addHook("onRequest", async (request, reply) => {
  const url = request.raw.url ?? "";

  // Solo protegemos las rutas de API.
  if (!url.startsWith("/api/")) {
    return;
  }

  // La verificación del webhook de Meta usa su propio verify token.
  if (url.startsWith("/api/whatsapp/webhook/verify")) {
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
});

app.get("/health", async (_request, reply) => {
  try {
    const result = await db.query(
      "SELECT NOW() AS database_time"
    );

    return {
      status: "ok",
      service: "taller-ecu-backend",
      database: "connected",
      databaseTime: result.rows[0].database_time,
    };
  } catch (error) {
    app.log.error(error);

    return reply.status(503).send({
      status: "error",
      service: "taller-ecu-backend",
      database: "disconnected",
    });
  }
});

app.register(customerRoutes, {
  prefix: "/api",
});

app.register(vehicleRoutes, {
  prefix: "/api",
});

app.register(requestRoutes, {
  prefix: "/api",
});

app.register(conversationRoutes, {
  prefix: "/api",
});

app.register(messageRoutes, {
  prefix: "/api",
});

app.register(whatsappRoutes, {
  prefix: "/api",
});

app.register(messageLookupRoutes, {
  prefix: "/api",
});

app.register(workflowErrorRoutes, {
  prefix: "/api",
});

app.register(messageStatusRoutes, {
  prefix: "/api",
});

const start = async () => {
  try {
    await app.listen({
      host: "0.0.0.0",
      port: 3000,
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();