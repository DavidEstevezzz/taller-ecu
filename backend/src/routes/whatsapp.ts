import { FastifyInstance } from "fastify";

export async function whatsappRoutes(app: FastifyInstance) {
  app.get("/whatsapp/webhook/verify", async (request, reply) => {
    const query = request.query as {
      mode?: string;
      verifyToken?: string;
      challenge?: string;
    };

    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN;

    if (!expectedToken) {
      request.log.error("WHATSAPP_VERIFY_TOKEN is not configured");

      return reply.status(500).send({
        verified: false,
        error: "server_not_configured",
      });
    }

    if (
      query.mode !== "subscribe" ||
      !query.verifyToken ||
      query.verifyToken !== expectedToken
    ) {
      return reply.status(403).send({
        verified: false,
      });
    }

    return reply.send({
      verified: true,
      challenge: query.challenge ?? "",
    });
  });
}