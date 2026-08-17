import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

export async function vehicleRoutes(app: FastifyInstance) {
  app.post("/vehicles", async (request, reply) => {
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
}