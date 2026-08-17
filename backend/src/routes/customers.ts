import type { FastifyInstance } from "fastify";
import { db } from "../db.js";

export async function customerRoutes(app: FastifyInstance) {
  app.post("/customers/find-or-create", async (request, reply) => {
    const body = request.body as {
      phone?: string;
      name?: string;
    };

    if (!body.phone) {
      return reply.status(400).send({
        error: "phone is required",
      });
    }

    const phone = body.phone.trim();

    const existing = await db.query(
      `
      SELECT id, name, phone, email, created_at, updated_at
      FROM customers
      WHERE phone = $1
      LIMIT 1
      `,
      [phone]
    );

    if (existing.rows.length > 0) {
      return {
        created: false,
        customer: existing.rows[0],
      };
    }

    const created = await db.query(
      `
      INSERT INTO customers (phone, name)
      VALUES ($1, $2)
      RETURNING id, name, phone, email, created_at, updated_at
      `,
      [phone, body.name ?? null]
    );

    return reply.status(201).send({
      created: true,
      customer: created.rows[0],
    });
  });
}