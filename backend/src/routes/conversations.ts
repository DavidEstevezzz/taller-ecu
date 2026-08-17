import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

export async function conversationRoutes(app: FastifyInstance) {
  app.post("/conversations", async (request, reply) => {
    const body = request.body as {
      customerId?: string | number;
      requestId?: string | number;
      channel?: string;
    };

    if (!body.customerId) {
      return reply.status(400).send({
        error: "customerId is required",
      });
    }

    const customer = await db.query(
      `
      SELECT id
      FROM customers
      WHERE id = $1
      LIMIT 1
      `,
      [body.customerId]
    );

    if (customer.rows.length === 0) {
      return reply.status(404).send({
        error: "customer not found",
      });
    }

    if (body.requestId) {
      const requestResult = await db.query(
        `
        SELECT id
        FROM requests
        WHERE id = $1
          AND customer_id = $2
        LIMIT 1
        `,
        [body.requestId, body.customerId]
      );

      if (requestResult.rows.length === 0) {
        return reply.status(404).send({
          error: "request not found for this customer",
        });
      }
    }

    const result = await db.query(
      `
      INSERT INTO conversations (
        customer_id,
        request_id,
        channel,
        bot_enabled,
        last_message_at
      )
      VALUES ($1,$2,$3,true,NOW())
      RETURNING *
      `,
      [
        body.customerId,
        body.requestId ?? null,
        body.channel ?? "whatsapp",
      ]
    );

    return reply.status(201).send({
      conversation: result.rows[0],
    });
  });

  app.get(
    "/customers/:customerId/conversations/active",
    async (request) => {
      const params = request.params as {
        customerId: string;
      };

      const result = await db.query(
        `
        SELECT *
        FROM conversations
        WHERE customer_id = $1
          AND bot_enabled = true
        ORDER BY updated_at DESC
        LIMIT 1
        `,
        [params.customerId]
      );

      return {
        conversation: result.rows[0] ?? null,
      };
    }
  );
}