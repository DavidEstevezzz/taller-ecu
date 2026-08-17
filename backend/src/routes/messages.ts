import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

export async function messageRoutes(app: FastifyInstance) {
  app.post("/messages", async (request, reply) => {
    const body = request.body as {
      conversationId?: string | number;
      providerMessageId?: string;
      direction?: "INBOUND" | "OUTBOUND";
      messageType?: string;
      textContent?: string;
      metadata?: Record<string, unknown>;
    };

    if (!body.conversationId) {
      return reply.status(400).send({
        error: "conversationId is required",
      });
    }

    if (!body.direction) {
      return reply.status(400).send({
        error: "direction is required",
      });
    }

    const conversation = await db.query(
      `
      SELECT id
      FROM conversations
      WHERE id = $1
      LIMIT 1
      `,
      [body.conversationId]
    );

    if (conversation.rows.length === 0) {
      return reply.status(404).send({
        error: "conversation not found",
      });
    }

    if (body.providerMessageId) {
      const existing = await db.query(
        `
        SELECT *
        FROM messages
        WHERE provider_message_id = $1
        LIMIT 1
        `,
        [body.providerMessageId]
      );

      if (existing.rows.length > 0) {
        return {
          created: false,
          duplicate: true,
          message: existing.rows[0],
        };
      }
    }

    const result = await db.query(
      `
      INSERT INTO messages (
        conversation_id,
        provider_message_id,
        direction,
        message_type,
        text_content,
        metadata
      )
      VALUES ($1,$2,$3,$4,$5,$6::jsonb)
      RETURNING *
      `,
      [
        body.conversationId,
        body.providerMessageId ?? null,
        body.direction,
        body.messageType ?? "TEXT",
        body.textContent ?? null,
        JSON.stringify(body.metadata ?? {}),
      ]
    );

    await db.query(
      `
      UPDATE conversations
      SET
        last_message_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
      `,
      [body.conversationId]
    );

    return reply.status(201).send({
      created: true,
      duplicate: false,
      message: result.rows[0],
    });
  });

  app.get(
    "/conversations/:conversationId/messages",
    async (request) => {
      const params = request.params as {
        conversationId: string;
      };

      const result = await db.query(
        `
        SELECT *
        FROM messages
        WHERE conversation_id = $1
        ORDER BY created_at ASC
        `,
        [params.conversationId]
      );

      return {
        messages: result.rows,
      };
    }
  );
}