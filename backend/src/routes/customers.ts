import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

export async function customerRoutes(app: FastifyInstance) {
  app.post("/customers/find-or-create", async (request, reply) => {
    const body = request.body as {
      phone?: string;
      name?: string;
    };

    const phone = body.phone?.trim();
    const name = body.name?.trim() || null;

    if (!phone) {
      return reply.status(400).send({
        error: "phone is required",
      });
    }

    const inserted = await db.query(
      `
  INSERT INTO customers (
    phone,
    name
  )
  VALUES ($1, $2)
  ON CONFLICT (phone) DO NOTHING
  RETURNING *
  `,
      [phone, name]
    );

    if (inserted.rows.length > 0) {
      return reply.status(201).send({
        created: true,
        customer: inserted.rows[0],
      });
    }

    // Si otro proceso lo creó simultáneamente,
    // este SELECT ya verá el registro confirmado.
    const existing = await db.query(
      `
  SELECT *
  FROM customers
  WHERE phone = $1
  LIMIT 1
  `,
      [phone]
    );

    if (existing.rows.length === 0) {
      return reply.status(500).send({
        error: "customer could not be resolved",
      });
    }

    // Aprovechamos para completar el nombre si antes no lo conocíamos.
    if (!existing.rows[0].name && name) {
      const updated = await db.query(
        `
    UPDATE customers
    SET
      name = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
    `,
        [existing.rows[0].id, name]
      );

      return {
        created: false,
        customer: updated.rows[0],
      };
    }

    return {
      created: false,
      customer: existing.rows[0],
    };
  });
}