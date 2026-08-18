import type { FastifyInstance } from "fastify";
import { db } from "../db.js";
import {
  createMessageBodySchema,
  conversationIdParamSchema,
} from "../schemas.js";

export async function messageRoutes(app: FastifyInstance) {
  app.post(
    "/messages",
    {
      schema: {
        body: createMessageBodySchema,
      },
    },
    async (request, reply) => {
      const body = request.body as {
        conversationId?: string | number;
        providerMessageId?: string | null;
        direction?: string;
        messageType?: string;
        textContent?: string | null;
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

      const providerMessageId =
        body.providerMessageId?.trim() || null;

      const inserted = await db.query(
        `
  INSERT INTO messages (
    conversation_id,
    provider_message_id,
    direction,
    message_type,
    text_content,
    metadata
  )
  VALUES (
    $1,
    $2,
    $3,
    $4,
    $5,
    $6::jsonb
  )
  ON CONFLICT (provider_message_id) DO NOTHING
  RETURNING *
  `,
        [
          body.conversationId,
          providerMessageId,
          body.direction,
          body.messageType ?? "TEXT",
          body.textContent ?? null,
          JSON.stringify(body.metadata ?? {}),
        ]
      );

      if (inserted.rows.length === 0 && providerMessageId) {
        const duplicate = await db.query(
          `
    SELECT *
    FROM messages
    WHERE provider_message_id = $1
    LIMIT 1
    `,
          [providerMessageId]
        );

        return {
          created: false,
          duplicate: true,
          message: duplicate.rows[0],
        };
      }

      // Solo actualizamos actividad si realmente entró un mensaje nuevo.
      await db.query(
        `
  UPDATE conversations
  SET
    updated_at = CURRENT_TIMESTAMP,
    last_message_at = CURRENT_TIMESTAMP
  WHERE id = $1
  `,
        [body.conversationId]
      );

      return reply.status(201).send({
        created: true,
        duplicate: false,
        message: inserted.rows[0],
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