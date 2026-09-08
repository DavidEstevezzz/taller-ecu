/*
 * Pruebas de la capa de datos del panel.
 *
 * Comprueban lo que importa de verdad del SQL: que ningún valor recibido del
 * usuario acaba dentro del texto de la consulta, que la ordenación sale de
 * una lista cerrada y que las conversaciones se buscan por request_id.
 * No comprueban el formato del SQL, para no romperse por un cambio de estilo.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";

vi.mock("../src/db.js", () => ({
  db: { query: vi.fn(), connect: vi.fn(), on: vi.fn(), end: vi.fn() },
}));

import { db } from "../src/db.js";
import * as repository from "../src/panel/repository.js";
import { toLikePattern } from "../src/panel/sql.js";

const query = db.query as unknown as Mock;

/* Devuelve { sql, params } de la última llamada a db.query. */
function lastCall() {
  const call = query.mock.calls.at(-1) as [string, unknown[]?];

  return {
    sql: call[0],
    params: call[1] ?? [],
  };
}

const INJECTION = "'; DROP TABLE requests; --";

beforeEach(() => {
  vi.clearAllMocks();
  query.mockResolvedValue({ rows: [], rowCount: 0 });
});

describe("parametrización del listado", () => {
  it("nunca mete el término de búsqueda dentro del SQL", async () => {
    await repository.listRequests({
      filters: { search: INJECTION },
      sort: "lastActivityAt",
      order: "desc",
      limit: 25,
      offset: 0,
    });

    const { sql, params } = lastCall();

    expect(sql).not.toContain("DROP TABLE");
    expect(sql).not.toContain(INJECTION);
    expect(params).toContain(toLikePattern(INJECTION));
  });

  it("escapa los comodines para que se busquen literalmente", () => {
    expect(toLikePattern("100%")).toBe("%100\\%%");
    expect(toLikePattern("a_b")).toBe("%a\\_b%");
    expect(toLikePattern("Seat")).toBe("%Seat%");
  });

  it("pasa estado, tipo de servicio y fechas como parámetros", async () => {
    const from = new Date("2026-01-01T00:00:00Z");
    const to = new Date("2026-12-31T00:00:00Z");

    await repository.listRequests({
      filters: {
        status: "HUMAN",
        serviceType: "ECU_REPAIR",
        from,
        to,
      },
      sort: "createdAt",
      order: "asc",
      limit: 10,
      offset: 20,
    });

    const { sql, params } = lastCall();

    expect(params).toContain("HUMAN");
    expect(params).toContain("ECU_REPAIR");
    expect(params).toContain(from);
    expect(params).toContain(to);
    expect(params).toContain(10);
    expect(params).toContain(20);

    // Los valores viajan como marcadores, no incrustados.
    expect(sql).not.toContain("'HUMAN'");
    expect(sql).not.toContain("'ECU_REPAIR'");
    expect(sql).toMatch(/\$1/);
  });

  it("no añade cláusulas cuando no hay filtros", async () => {
    await repository.listRequests({
      filters: {},
      sort: "lastActivityAt",
      order: "desc",
      limit: 25,
      offset: 0,
    });

    const { sql, params } = lastCall();

    // Solo LIMIT y OFFSET: ninguna cláusula de filtrado.
    expect(params).toEqual([25, 0]);
    expect(sql).not.toMatch(/r\.status\s*=/);
    expect(sql).not.toMatch(/r\.service_type\s*=/);
    expect(sql).not.toMatch(/r\.created_at\s*[<>]/);
    expect(sql).not.toMatch(/ILIKE/);
    expect(sql).not.toMatch(/\$3/);
  });

  it("usa el mismo filtrado para el recuento", async () => {
    await repository.countRequests({ status: "CLOSED", search: INJECTION });

    const { sql, params } = lastCall();

    expect(params).toContain("CLOSED");
    expect(params).toContain(toLikePattern(INJECTION));
    expect(sql).not.toContain(INJECTION);
    expect(sql).toMatch(/COUNT\(\*\)/i);
  });

  it("acota por cliente cuando se pide su historial", async () => {
    await repository.listRequests({
      filters: { customerId: "5" },
      sort: "lastActivityAt",
      order: "desc",
      limit: 100,
      offset: 0,
    });

    const { sql, params } = lastCall();

    expect(params[0]).toBe("5");
    expect(sql).toMatch(/r\.customer_id\s*=\s*\$1/);
  });
});

describe("ordenación", () => {
  const permitidas = [
    ["lastActivityAt", "r.last_activity_at"],
    ["createdAt", "r.created_at"],
    ["updatedAt", "r.updated_at"],
    ["status", "r.status"],
    ["customerName", "c.name"],
  ] as const;

  it("traduce cada campo permitido a su columna real", async () => {
    for (const [campo, columna] of permitidas) {
      await repository.listRequests({
        filters: {},
        sort: campo,
        order: "asc",
        limit: 25,
        offset: 0,
      });

      const { sql } = lastCall();

      expect(sql).toContain(`ORDER BY ${columna} ASC`);
    }
  });

  it("solo emite ASC o DESC", async () => {
    await repository.listRequests({
      filters: {},
      sort: "createdAt",
      order: "desc",
      limit: 25,
      offset: 0,
    });

    const { sql } = lastCall();
    const orderBy = sql.slice(sql.indexOf("ORDER BY"));

    expect(orderBy).toContain("DESC");
    expect(orderBy).not.toMatch(/\$\{/);
  });
});

describe("consultas del detalle", () => {
  it("busca las conversaciones por request_id, nunca por customer_id", async () => {
    await repository.listConversationsByRequest("10");

    const { sql, params } = lastCall();

    expect(params).toEqual(["10"]);
    expect(sql).toMatch(/FROM conversations/i);
    expect(sql).toMatch(/request_id\s*=\s*\$1/);
    expect(sql).not.toMatch(/customer_id\s*=\s*\$/);
  });

  it("pide las conversaciones en orden cronológico", async () => {
    await repository.listConversationsByRequest("10");

    expect(lastCall().sql).toMatch(/ORDER BY\s+created_at ASC/i);
  });

  it("pide los mensajes en orden cronológico y por conversación", async () => {
    await repository.listMessagesByConversations(["100", "101"]);

    const { sql, params } = lastCall();

    expect(params).toEqual([["100", "101"]]);
    expect(sql).toMatch(/conversation_id = ANY/i);
    expect(sql).toMatch(/ORDER BY\s+created_at ASC/i);
  });

  it("no consulta nada si no hay conversaciones", async () => {
    const messages = await repository.listMessagesByConversations([]);

    expect(messages).toEqual([]);
    expect(query).not.toHaveBeenCalled();
  });

  it("acota el detalle y el historial por identificador", async () => {
    await repository.findRequestDetail("10");
    expect(lastCall().params).toEqual(["10"]);

    await repository.findCustomer("5");
    expect(lastCall().params).toEqual(["5"]);

    await repository.listVehiclesByCustomer("5");
    expect(lastCall().params).toEqual(["5"]);
    expect(lastCall().sql).toMatch(/customer_id\s*=\s*\$1/);

    await repository.summarizeCustomerRequests("5");
    expect(lastCall().params).toEqual(["5"]);
    expect(lastCall().sql).toMatch(/customer_id\s*=\s*\$1/);
  });
});

describe("consultas que no deben tocar la autenticación", () => {
  it("ninguna consulta del panel lee users, sessions ni login_attempts", async () => {
    await repository.getDashboardTotals();
    await repository.listRequests({
      filters: {},
      sort: "lastActivityAt",
      order: "desc",
      limit: 25,
      offset: 0,
    });
    await repository.findRequestDetail("10");
    await repository.findCustomer("5");
    await repository.listVehiclesByCustomer("5");
    await repository.summarizeCustomerRequests("5");
    await repository.listConversationsByRequest("10");

    const consultas = query.mock.calls.map((call) =>
      String(call[0]).toLowerCase()
    );

    for (const sql of consultas) {
      expect(sql).not.toMatch(/\busers\b/);
      expect(sql).not.toMatch(/\bsessions\b/);
      expect(sql).not.toMatch(/\blogin_attempts\b/);
      expect(sql).not.toMatch(/password_hash|token_hash/);
    }
  });
});
