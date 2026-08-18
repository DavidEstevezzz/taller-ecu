import type { FastifyInstance } from "fastify";
import { db } from "../db.js";
import { vehicleBodySchema } from "../schemas.js";

export async function vehicleRoutes(app: FastifyInstance) {
    app.post(
        "/vehicles",
        {
            schema: {
                body: vehicleBodySchema,
            },
        },
        async (request, reply) => {
            const body = request.body as {
                customerId?: string | number;
                vehicleType?: string;
                brand?: string;
                model?: string;
                year?: number;
                engine?: string;
                originalPower?: string;
                plate?: string;
                vin?: string;
                notes?: string;
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

            const result = await db.query(
                `
      INSERT INTO vehicles (
        customer_id,
        vehicle_type,
        brand,
        model,
        year,
        engine,
        original_power,
        plate,
        vin,
        notes
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
                [
                    body.customerId,
                    body.vehicleType ?? null,
                    body.brand ?? null,
                    body.model ?? null,
                    body.year ?? null,
                    body.engine ?? null,
                    body.originalPower ?? null,
                    body.plate ?? null,
                    body.vin ?? null,
                    body.notes ?? null,
                ]
            );

            return reply.status(201).send({
                vehicle: result.rows[0],
            });
        });

    app.get("/customers/:customerId/vehicles", async (request) => {
        const params = request.params as {
            customerId: string;
        };

        const result = await db.query(
            `
      SELECT *
      FROM vehicles
      WHERE customer_id = $1
      ORDER BY created_at ASC
      `,
            [params.customerId]
        );

        return {
            vehicles: result.rows,
        };
    });

    app.post(
        "/vehicles/find-or-create",
        {
            schema: {
                body: vehicleBodySchema,
            },
        },
        async (request, reply) => {
            const body = request.body as {
                customerId?: string | number;
                vehicleType?: string;
                brand?: string;
                model?: string;
                year?: number;
                engine?: string;
                originalPower?: string;
                plate?: string;
                vin?: string;
                notes?: string;
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

            const plate = body.plate?.trim().toUpperCase() || null;
            const vin = body.vin?.trim().toUpperCase() || null;
            const brand = body.brand?.trim() || null;
            const model = body.model?.trim() || null;
            const engine = body.engine?.trim() || null;

            // 1. VIN: identificador más fuerte
            if (vin) {
                const byVin = await db.query(
                    `
      SELECT *
      FROM vehicles
      WHERE customer_id = $1
        AND UPPER(vin) = $2
      LIMIT 1
      `,
                    [body.customerId, vin]
                );

                if (byVin.rows.length > 0) {
                    return {
                        created: false,
                        matchType: "VIN",
                        vehicle: byVin.rows[0],
                    };
                }
            }

            // 2. Matrícula
            if (plate) {
                const byPlate = await db.query(
                    `
      SELECT *
      FROM vehicles
      WHERE customer_id = $1
        AND UPPER(plate) = $2
      LIMIT 1
      `,
                    [body.customerId, plate]
                );

                if (byPlate.rows.length > 0) {
                    return {
                        created: false,
                        matchType: "PLATE",
                        vehicle: byPlate.rows[0],
                    };
                }
            }

            // 3. Coincidencia débil: marca + modelo + año (+ motor si se conoce)
            if (brand && model) {
                const candidates = await db.query(
                    `
      SELECT *
      FROM vehicles
      WHERE customer_id = $1
        AND LOWER(brand) = LOWER($2)
        AND LOWER(model) = LOWER($3)
        AND (
          $4::integer IS NULL
          OR year = $4
        )
        AND (
          $5::text IS NULL
          OR engine IS NULL
          OR LOWER(engine) = LOWER($5)
        )
      ORDER BY created_at ASC
      `,
                    [
                        body.customerId,
                        brand,
                        model,
                        body.year ?? null,
                        engine,
                    ]
                );

                if (candidates.rows.length === 1) {
                    return {
                        created: false,
                        matchType: "VEHICLE_DATA",
                        vehicle: candidates.rows[0],
                    };
                }

                if (candidates.rows.length > 1) {
                    return reply.status(409).send({
                        error: "ambiguous vehicle",
                        candidates: candidates.rows,
                    });
                }
            }

            // No existe: crear
            const created = await db.query(
                `
    INSERT INTO vehicles (
      customer_id,
      vehicle_type,
      brand,
      model,
      year,
      engine,
      original_power,
      plate,
      vin,
      notes
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
    `,
                [
                    body.customerId,
                    body.vehicleType ?? null,
                    brand,
                    model,
                    body.year ?? null,
                    engine,
                    body.originalPower ?? null,
                    plate,
                    vin,
                    body.notes ?? null,
                ]
            );

            return reply.status(201).send({
                created: true,
                matchType: null,
                vehicle: created.rows[0],
            });
        });
}