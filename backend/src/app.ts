import Fastify from "fastify";
import type { FastifyServerOptions } from "fastify";
import cookie from "@fastify/cookie";
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

import { adminAuthRoutes } from "./routes/admin/auth.js";
import { internalApiKeyHook } from "./plugins/internalApiKey.js";

/*
 * Construye la aplicación Fastify sin escucharla.
 *
 * El único parámetro existe para que las pruebas puedan silenciar el logger;
 * el valor por defecto es exactamente la configuración de producción.
 */
export function buildApp(
  options: FastifyServerOptions = { logger: true }
) {
  const app = Fastify(options);

  app.register(cookie);

  app.addHook("onRequest", internalApiKeyHook);

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

  // API del panel: sesión por cookie, nunca INTERNAL_API_KEY.
  app.register(adminAuthRoutes, {
    prefix: "/api/admin",
  });

  return app;
}
