/*
 * Pruebas de contrato del backend.
 *
 * Protegen el contrato actual entre el workflow de n8n y Fastify antes de
 * tocar la autenticación. Todo se ejecuta con Fastify.inject(): no se abren
 * puertos ni se contacta con PostgreSQL, n8n, Meta ni OpenAI.
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import type { Mock } from "vitest";

import type { FastifyInstance } from "fastify";

vi.mock("../src/db.js", () => ({
  db: {
    query: vi.fn(),
    connect: vi.fn(),
    on: vi.fn(),
  },
}));

import { buildApp } from "../src/app.js";
import { db } from "../src/db.js";

const query = db.query as unknown as Mock;

const VALID_API_KEY = "test-internal-api-key";
const VALID_VERIFY_TOKEN = "test-verify-token";

/*
 * Rutas documentadas en CLAUDE.md como contrato con n8n.
 * /health se comprueba aparte: se registra dentro de buildApp(), antes de
 * que la prueba pueda enganchar el hook onRoute.
 */
const CONTRACT_ROUTES = [
  "POST /api/customers/find-or-create",
  "POST /api/vehicles/find-or-create",
  "POST /api/requests",
  "GET /api/requests/:requestId",
  "PATCH /api/requests/:requestId",
  "POST /api/requests/:requestId/handoff",
  "POST /api/conversations",
  "GET /api/customers/:customerId/conversations/active",
  "POST /api/messages",
  "GET /api/messages/provider-exists",
  "POST /api/message-statuses",
  "POST /api/workflow-errors",
  "GET /api/whatsapp/webhook/verify",
];

let app: FastifyInstance;

beforeEach(async () => {
  vi.clearAllMocks();

  process.env.INTERNAL_API_KEY = VALID_API_KEY;
  process.env.WHATSAPP_VERIFY_TOKEN = VALID_VERIFY_TOKEN;

  app = buildApp({ logger: false });
  await app.ready();
});

afterEach(async () => {
  await app.close();
});

describe("hook x-internal-api-key", () => {
  it("no exige la clave interna en GET /health", async () => {
    query.mockResolvedValueOnce({
      rows: [{ database_time: "2026-01-01T00:00:00.000Z" }],
      rowCount: 1,
    });

    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      status: "ok",
      service: "taller-ecu-backend",
      database: "connected",
      databaseTime: "2026-01-01T00:00:00.000Z",
    });
  });

  it("devuelve 503 en /health si la base de datos falla", async () => {
    query.mockRejectedValueOnce(new Error("db caída"));

    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(503);

    expect(response.json()).toEqual({
      status: "error",
      service: "taller-ecu-backend",
      database: "disconnected",
    });
  });

  it("devuelve 401 unauthorized en una ruta interna sin cabecera", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/messages/provider-exists?providerMessageId=wamid.TEST",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "unauthorized" });
    expect(query).not.toHaveBeenCalled();
  });

  it("devuelve el mismo 401 con una clave incorrecta", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/messages/provider-exists?providerMessageId=wamid.TEST",
      headers: {
        "x-internal-api-key": "clave-incorrecta",
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "unauthorized" });
    expect(query).not.toHaveBeenCalled();
  });

  it("devuelve 500 server_not_configured si falta INTERNAL_API_KEY", async () => {
    delete process.env.INTERNAL_API_KEY;

    const response = await app.inject({
      method: "GET",
      url: "/api/messages/provider-exists?providerMessageId=wamid.TEST",
      headers: {
        "x-internal-api-key": VALID_API_KEY,
      },
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ error: "server_not_configured" });
    expect(query).not.toHaveBeenCalled();
  });

  it("protege el resto de rutas internas documentadas", async () => {
    const responses = await Promise.all([
      app.inject({ method: "POST", url: "/api/customers/find-or-create" }),
      app.inject({ method: "POST", url: "/api/messages" }),
      app.inject({ method: "POST", url: "/api/message-statuses" }),
      app.inject({ method: "POST", url: "/api/workflow-errors" }),
    ]);

    for (const response of responses) {
      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ error: "unauthorized" });
    }
  });
});

describe("verificación del webhook de WhatsApp", () => {
  it("no exige la clave interna", async () => {
    const response = await app.inject({
      method: "GET",
      url:
        "/api/whatsapp/webhook/verify" +
        `?mode=subscribe&verifyToken=${VALID_VERIFY_TOKEN}&challenge=12345`,
    });

    expect(response.statusCode).not.toBe(401);
    expect(response.statusCode).toBe(200);
  });

  it("devuelve el challenge con un token correcto", async () => {
    const response = await app.inject({
      method: "GET",
      url:
        "/api/whatsapp/webhook/verify" +
        `?mode=subscribe&verifyToken=${VALID_VERIFY_TOKEN}&challenge=12345`,
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      verified: true,
      challenge: "12345",
    });
  });

  it("devuelve 403 con un token incorrecto", async () => {
    const response = await app.inject({
      method: "GET",
      url:
        "/api/whatsapp/webhook/verify" +
        "?mode=subscribe&verifyToken=token-incorrecto&challenge=12345",
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({ verified: false });
  });

  it("devuelve 403 si el modo no es subscribe", async () => {
    const response = await app.inject({
      method: "GET",
      url:
        "/api/whatsapp/webhook/verify" +
        `?mode=unsubscribe&verifyToken=${VALID_VERIFY_TOKEN}&challenge=12345`,
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toEqual({ verified: false });
  });

  it("devuelve 500 si falta WHATSAPP_VERIFY_TOKEN", async () => {
    delete process.env.WHATSAPP_VERIFY_TOKEN;

    const response = await app.inject({
      method: "GET",
      url:
        "/api/whatsapp/webhook/verify" +
        "?mode=subscribe&verifyToken=cualquiera&challenge=12345",
    });

    expect(response.statusCode).toBe(500);

    expect(response.json()).toEqual({
      verified: false,
      error: "server_not_configured",
    });
  });
});

describe("rutas registradas", () => {
  it("registra los métodos y rutas documentados en CLAUDE.md", async () => {
    const registered = new Set<string>();

    const routeCollector = buildApp({ logger: false });

    routeCollector.addHook("onRoute", (route) => {
      const methods = Array.isArray(route.method)
        ? route.method
        : [route.method];

      for (const method of methods) {
        registered.add(`${method} ${route.url}`);
      }
    });

    await routeCollector.ready();
    await routeCollector.close();

    for (const route of CONTRACT_ROUTES) {
      expect(registered).toContain(route);
    }
  });

  it("responde a GET /health sin devolver 404", async () => {
    query.mockResolvedValueOnce({
      rows: [{ database_time: "2026-01-01T00:00:00.000Z" }],
      rowCount: 1,
    });

    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).not.toBe(404);
  });
});

describe("GET /api/messages/provider-exists", () => {
  it("devuelve exists true cuando el mensaje ya está guardado", async () => {
    query.mockResolvedValueOnce({ rows: [{ "?column?": 1 }], rowCount: 1 });

    const response = await app.inject({
      method: "GET",
      url: "/api/messages/provider-exists?providerMessageId=wamid.TEST",
      headers: {
        "x-internal-api-key": VALID_API_KEY,
      },
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      providerMessageId: "wamid.TEST",
      exists: true,
    });
  });

  it("devuelve exists false cuando el mensaje es nuevo", async () => {
    query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

    const response = await app.inject({
      method: "GET",
      url: "/api/messages/provider-exists?providerMessageId=wamid.NUEVO",
      headers: {
        "x-internal-api-key": VALID_API_KEY,
      },
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      providerMessageId: "wamid.NUEVO",
      exists: false,
    });
  });

  it("rechaza la petición sin providerMessageId", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/messages/provider-exists",
      headers: {
        "x-internal-api-key": VALID_API_KEY,
      },
    });

    expect(response.statusCode).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });
});

describe("aislamiento del módulo", () => {
  it("no deja la aplicación escuchando en ningún puerto", () => {
    expect(app.server.listening).toBe(false);
  });

  it("importar la aplicación no arranca un servidor ni llama a process.exit", async () => {
    const exitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(((code?: number) => {
        throw new Error(`process.exit(${code}) no debería llamarse`);
      }) as never);

    const listenSpy = vi.spyOn(
      Object.getPrototypeOf(app.server) as { listen: () => unknown },
      "listen"
    );

    vi.resetModules();

    const freshModule = await import("../src/app.js");
    const freshApp = freshModule.buildApp({ logger: false });

    await freshApp.ready();

    expect(freshApp.server.listening).toBe(false);
    expect(listenSpy).not.toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();

    await freshApp.close();

    listenSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
