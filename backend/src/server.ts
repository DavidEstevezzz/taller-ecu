import Fastify from "fastify";
import { db } from "./db.js";
import { customerRoutes } from "./routes/customers.js";
import { vehicleRoutes } from "./routes/vehicles.js";
import { requestRoutes } from "./routes/requests.js";
import { conversationRoutes } from "./routes/conversations.js";
import { messageRoutes } from "./routes/messages.js";
import { whatsappRoutes } from "./routes/whatsapp.js";

const app = Fastify({
  logger: true,
});

app.get("/health", async (_request, reply) => {
  try {
    const result = await db.query("SELECT NOW() AS database_time");

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
   prefix: "/api" 
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