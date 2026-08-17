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
}