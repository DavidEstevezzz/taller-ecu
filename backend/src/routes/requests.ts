import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

export async function requestRoutes(app: FastifyInstance) {
    app.post("/requests", async (request, reply) => {
        const body = request.body as {
            customerId?: string | number;
            vehicleId?: string | number;
            source?: string;
            serviceType?: string;
            description?: string;
            structuredData?: Record<string, unknown>;
            missingFields?: string[];
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

        if (body.vehicleId) {
            const vehicle = await db.query(
                `
        SELECT id
        FROM vehicles
        WHERE id = $1
          AND customer_id = $2
        LIMIT 1
        `,
                [body.vehicleId, body.customerId]
            );

            if (vehicle.rows.length === 0) {
                return reply.status(404).send({
                    error: "vehicle not found for this customer",
                });
            }
        }

        const result = await db.query(
            `
      INSERT INTO requests (
        customer_id,
        vehicle_id,
        source,
        service_type,
        status,
        description,
        structured_data,
        missing_fields
      )
        VALUES ($1,$2,$3,$4,'COLLECTING',$5,$6::jsonb,$7::jsonb)
      RETURNING *
      `,
            [
                body.customerId,
                body.vehicleId ?? null,
                body.source ?? "whatsapp",
                body.serviceType ?? null,
                body.description ?? null,
                JSON.stringify(body.structuredData ?? {}),
                JSON.stringify(body.missingFields ?? []),
            ]
        );

        return reply.status(201).send({
            request: result.rows[0],
        });
    });

    app.get("/customers/:customerId/requests", async (request) => {
        const params = request.params as {
            customerId: string;
        };

        const result = await db.query(
            `
      SELECT *
      FROM requests
      WHERE customer_id = $1
      ORDER BY created_at DESC
      `,
            [params.customerId]
        );

        return {
            requests: result.rows,
        };
    });

    app.patch("/requests/:requestId", async (request, reply) => {
        const params = request.params as {
            requestId: string;
        };

        const body = request.body as {
            serviceType?: string;
            description?: string;
            structuredData?: Record<string, unknown>;
            missingFields?: string[];
            summaryAi?: string;
            status?: string;
        };

        const existing = await db.query(
            `
    SELECT id
    FROM requests
    WHERE id = $1
    LIMIT 1
    `,
            [params.requestId]
        );

        if (existing.rows.length === 0) {
            return reply.status(404).send({
                error: "request not found",
            });
        }

        const result = await db.query(
            `
    UPDATE requests
    SET
      service_type = COALESCE($2, service_type),
      description = COALESCE($3, description),

      structured_data =
        structured_data || $4::jsonb,

      missing_fields =
        CASE
          WHEN $5::jsonb IS NULL THEN missing_fields
          ELSE $5::jsonb
        END,

      summary_ai = COALESCE($6, summary_ai),
      status = COALESCE($7, status),

      updated_at = NOW(),
      last_activity_at = NOW()

    WHERE id = $1

    RETURNING *
    `,
            [
                params.requestId,
                body.serviceType ?? null,
                body.description ?? null,
                JSON.stringify(body.structuredData ?? {}),
                body.missingFields !== undefined
                    ? JSON.stringify(body.missingFields)
                    : null,
                body.summaryAi ?? null,
                body.status ?? null,
            ]
        );

        return {
            request: result.rows[0],
        };
    });

    app.post("/requests/:requestId/handoff", async (request, reply) => {
        const params = request.params as {
            requestId: string;
        };

        const body = (request.body ?? {}) as {
            summaryAi?: string;
        };

        const client = await db.connect();

        try {
            await client.query("BEGIN");

            const requestResult = await client.query(
                `
      UPDATE requests
      SET
        status = 'HUMAN',
        summary_ai = COALESCE($2, summary_ai),
        updated_at = NOW(),
        last_activity_at = NOW()
      WHERE id = $1
      RETURNING *
      `,
                [params.requestId, body.summaryAi ?? null]
            );

            if (requestResult.rows.length === 0) {
                await client.query("ROLLBACK");

                return reply.status(404).send({
                    error: "request not found",
                });
            }

            const conversationResult = await client.query(
                `
      UPDATE conversations
      SET
        bot_enabled = false,
        updated_at = NOW()
      WHERE request_id = $1
        AND bot_enabled = true
      RETURNING *
      `,
                [params.requestId]
            );

            await client.query("COMMIT");

            return {
                request: requestResult.rows[0],
                conversationsDisabled: conversationResult.rowCount,
            };
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    });

    app.get("/requests/:requestId", async (request, reply) => {
        const { requestId } = request.params as {
            requestId: string;
        };

        const result = await db.query(
            `
    SELECT *
    FROM requests
    WHERE id = $1
    LIMIT 1
    `,
            [requestId]
        );

        if (result.rows.length === 0) {
            return reply.status(404).send({
                error: "request not found",
            });
        }

        return {
            request: result.rows[0],
        };
    });

}