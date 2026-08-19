import type { FastifyPluginAsync } from "fastify";
import { db } from "../db.js";

type MessageStatusBody = {
  providerMessageId: string;
  status: string;
  timestamp: string | number;

  recipientId?: string | null;

  metaConversationId?: string | null;

  pricing?: Record<string, unknown> | null;

  errors?: unknown[] | null;

  rawPayload?: Record<string, unknown> | null;
};

const TRACKED_STATUSES = new Set([
  "sent",
  "delivered",
  "read",
  "failed",
]);

const messageStatusRoutes: FastifyPluginAsync =
  async (app) => {
    app.post<{
      Body: MessageStatusBody;
    }>(
      "/message-statuses",
      {
        schema: {
          body: {
            type: "object",
            additionalProperties: false,

            required: [
              "providerMessageId",
              "status",
              "timestamp",
            ],

            properties: {
              providerMessageId: {
                type: "string",
                minLength: 1,
                maxLength: 512,
              },

              status: {
                type: "string",
                minLength: 1,
                maxLength: 30,
              },

              timestamp: {
                anyOf: [
                  {
                    type: "string",
                    minLength: 1,
                    maxLength: 32,
                  },
                  {
                    type: "number",
                  },
                ],
              },

              recipientId: {
                type: ["string", "null"],
                maxLength: 64,
              },

              metaConversationId: {
                type: ["string", "null"],
                maxLength: 255,
              },

              pricing: {
                type: ["object", "null"],
              },

              errors: {
                type: ["array", "null"],
              },

              rawPayload: {
                type: ["object", "null"],
              },
            },
          },
        },
      },

      async (request, reply) => {
        const providerMessageId =
          request.body.providerMessageId.trim();

        const status =
          request.body.status
            .trim()
            .toLowerCase();

        const timestampSeconds =
          Number(request.body.timestamp);

        if (
          !Number.isFinite(timestampSeconds)
          || timestampSeconds <= 0
        ) {
          return reply.status(400).send({
            error: "invalid status timestamp",
          });
        }

        const statusTimestamp =
          new Date(
            timestampSeconds * 1000
          );

        if (
          Number.isNaN(
            statusTimestamp.getTime()
          )
        ) {
          return reply.status(400).send({
            error: "invalid status timestamp",
          });
        }

        const recipientId =
          request.body.recipientId
            ?.trim()
          || null;

        const metaConversationId =
          request.body.metaConversationId
            ?.trim()
          || null;

        const pricing =
          request.body.pricing
          ?? {};

        const errors =
          Array.isArray(
            request.body.errors
          )
            ? request.body.errors
            : [];

        const rawPayload =
          request.body.rawPayload
          ?? {};

        /*
         * node-postgres trata los arrays JS como arrays PostgreSQL.
         * Como estas columnas son jsonb, serializamos explícitamente
         * para conservar correctamente objetos y arrays JSON.
         */
        const pricingJson =
          JSON.stringify(pricing);

        const errorsJson =
          JSON.stringify(errors);

        const rawPayloadJson =
          JSON.stringify(rawPayload);

        const client =
          await db.connect();

        try {
          await client.query("BEGIN");

          const messageResult =
            await client.query(
              `
                SELECT id
                FROM messages
                WHERE
                  provider_message_id = $1
                  AND direction = 'OUTBOUND'
                LIMIT 1
              `,
              [
                providerMessageId,
              ],
            );

          const messageId =
            messageResult.rows[0]?.id
            ?? null;

          const eventResult =
            await client.query(
              `
                INSERT INTO
                  message_status_events
                (
                  message_id,
                  provider_message_id,
                  status,
                  status_timestamp,
                  recipient_id,
                  meta_conversation_id,
                  pricing,
                  errors,
                  raw_payload
                )
                VALUES (
                  $1,
                  $2,
                  $3,
                  $4,
                  $5,
                  $6,
                  $7::jsonb,
                  $8::jsonb,
                  $9::jsonb
                )

                ON CONFLICT (
                  provider_message_id,
                  status,
                  status_timestamp
                )
                DO UPDATE
                SET
                  message_id =
                    COALESCE(
                      message_status_events.message_id,
                      EXCLUDED.message_id
                    ),

                  recipient_id =
                    COALESCE(
                      EXCLUDED.recipient_id,
                      message_status_events.recipient_id
                    ),

                  meta_conversation_id =
                    COALESCE(
                      EXCLUDED.meta_conversation_id,
                      message_status_events.meta_conversation_id
                    ),

                  pricing =
                    EXCLUDED.pricing,

                  errors =
                    EXCLUDED.errors,

                  raw_payload =
                    EXCLUDED.raw_payload

                RETURNING *
              `,
              [
                messageId,
                providerMessageId,
                status,
                statusTimestamp,
                recipientId,
                metaConversationId,
                pricingJson,
                errorsJson,
                rawPayloadJson,
              ],
            );

          let updatedMessage = null;

          if (
            messageId
            && TRACKED_STATUSES.has(status)
          ) {
            const updatedResult =
              await client.query(
                `
                  UPDATE messages
                  SET
                    delivery_status = $2,

                    status_updated_at = $3,

                    delivery_metadata =
                      jsonb_build_object(
                        'recipientId',
                        $4::text,

                        'metaConversationId',
                        $5::text,

                        'pricing',
                        $6::jsonb,

                        'errors',
                        $7::jsonb
                      )

                  WHERE
                    id = $1

                    AND (
                      status_updated_at IS NULL

                      OR status_updated_at < $3

                      OR (
                        status_updated_at = $3

                        AND
                        CASE $2
                          WHEN 'sent'
                            THEN 1

                          WHEN 'delivered'
                            THEN 2

                          WHEN 'read'
                            THEN 3

                          WHEN 'failed'
                            THEN 4

                          ELSE 0
                        END
                        >=
                        CASE delivery_status
                          WHEN 'sent'
                            THEN 1

                          WHEN 'delivered'
                            THEN 2

                          WHEN 'read'
                            THEN 3

                          WHEN 'failed'
                            THEN 4

                          ELSE 0
                        END
                      )
                    )

                  RETURNING *
                `,
                [
                  messageId,
                  status,
                  statusTimestamp,
                  recipientId,
                  metaConversationId,
                  pricingJson,
                  errorsJson,
                ],
              );

            updatedMessage =
              updatedResult.rows[0]
              ?? null;
          }

          await client.query("COMMIT");

          return reply.send({
            stored: true,

            tracked:
              TRACKED_STATUSES.has(
                status
              ),

            matchedMessage:
              messageId !== null,

            event:
              eventResult.rows[0],

            message:
              updatedMessage,
          });
        } catch (error) {
          await client.query(
            "ROLLBACK"
          );

          throw error;
        } finally {
          client.release();
        }
      },
    );
  };

export default messageStatusRoutes;