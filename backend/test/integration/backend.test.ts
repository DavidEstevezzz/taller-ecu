/*
 * Integración real contra PostgreSQL 17 desechable.
 *
 * Se ejecuta con scripts/integration-test.sh, que levanta la base, aplica
 * las migraciones desde cero y crea el primer OWNER con el CLI real.
 * Aquí solo se valida el comportamiento de la aplicación con SQL de verdad.
 */

// Aborta el proceso si la base no es claramente desechable.
import "./guard.js";

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from "vitest";

import type { FastifyInstance } from "fastify";

import { buildApp } from "../../src/app.js";
import { db } from "../../src/db.js";
import { hashSessionToken } from "../../src/auth/tokens.js";
import { seed } from "./seed.js";
import type { SeedResult } from "./seed.js";

const COOKIE_NAME = "taller_session";

const OWNER_EMAIL = process.env.ITEST_OWNER_EMAIL ?? "";
const OWNER_PASSWORD = process.env.ITEST_OWNER_PASSWORD ?? "";

let app: FastifyInstance;
let data: SeedResult;
let sessionToken = "";

function authed(url: string) {
  return app.inject({
    method: "GET",
    url,
    cookies: { [COOKIE_NAME]: sessionToken },
  });
}

beforeAll(async () => {
  expect(OWNER_EMAIL, "ITEST_OWNER_EMAIL no definido").not.toBe("");
  expect(OWNER_PASSWORD, "ITEST_OWNER_PASSWORD no definido").not.toBe("");

  app = buildApp({ logger: false });
  await app.ready();

  data = await seed();
});

afterAll(async () => {
  await app.close();
  await db.end();
});

describe("migraciones aplicadas desde cero", () => {
  it("crea todas las tablas del negocio y de autenticación", async () => {
    const result = await db.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'`
    );

    const tablas = result.rows.map((row: any) => row.table_name);

    for (const esperada of [
      "customers",
      "vehicles",
      "requests",
      "conversations",
      "messages",
      "message_status_events",
      "workflow_errors",
      "users",
      "sessions",
      "login_attempts",
      "pgmigrations",
    ]) {
      expect(tablas).toContain(esperada);
    }
  });

  it("aplica las restricciones de negocio", async () => {
    await expect(
      db.query(
        `INSERT INTO requests (customer_id, status) VALUES ($1, 'INVENTADO')`,
        [data.ana.id]
      )
    ).rejects.toThrow();

    await expect(
      db.query(`INSERT INTO users (email, name, password_hash, role)
                VALUES ('MAYUS@example.test', 'X', 'x', 'OWNER')`)
    ).rejects.toThrow();
  });

  it("mantiene el trigger de reconciliación de estados", async () => {
    const result = await db.query(
      `SELECT tgname FROM pg_trigger
       WHERE tgname = 'messages_reconcile_status_after_insert'`
    );

    expect(result.rowCount).toBe(1);
  });
});

describe("usuario OWNER creado con el CLI real", () => {
  it("existe con rol OWNER, activo y email normalizado", async () => {
    const result = await db.query(
      `SELECT * FROM users WHERE email = $1`,
      [OWNER_EMAIL.toLowerCase()]
    );

    expect(result.rowCount).toBe(1);

    const user = result.rows[0];

    expect(user.role).toBe("OWNER");
    expect(user.is_active).toBe(true);
    expect(user.email).toBe(OWNER_EMAIL.toLowerCase());
  });

  it("guarda la contraseña con Argon2id y nunca en claro", async () => {
    const result = await db.query(
      `SELECT password_hash FROM users WHERE email = $1`,
      [OWNER_EMAIL.toLowerCase()]
    );

    const hash = result.rows[0].password_hash;

    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toContain(OWNER_PASSWORD);
  });
});

describe("autenticación con SQL real", () => {
  it("rechaza una contraseña incorrecta", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/admin/auth/login",
      payload: { email: OWNER_EMAIL, password: "contrasena-equivocada" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "invalid_credentials" });

    const fallos = await db.query(
      `SELECT * FROM login_attempts WHERE succeeded = false`
    );

    expect(fallos.rowCount).toBeGreaterThan(0);
  });

  it("acepta las credenciales correctas y entrega la cookie", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/admin/auth/login",
      payload: { email: OWNER_EMAIL, password: OWNER_PASSWORD },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().user.role).toBe("OWNER");

    const raw = response.headers["set-cookie"];
    const header = Array.isArray(raw) ? raw[0] : (raw as string);

    expect(header).toMatch(/HttpOnly/i);
    expect(header).toMatch(/SameSite=Lax/i);

    sessionToken = header.split(";")[0].split("=").slice(1).join("=");

    expect(sessionToken.length).toBeGreaterThan(20);
  });

  it("guarda en PostgreSQL el hash del token, nunca el token", async () => {
    const result = await db.query(`SELECT * FROM sessions`);

    expect(result.rowCount).toBe(1);

    const session = result.rows[0];

    expect(session.token_hash).toBe(hashSessionToken(sessionToken));
    expect(session.token_hash).not.toBe(sessionToken);
    expect(session.revoked_at).toBeNull();
    expect(new Date(session.expires_at).getTime()).toBeGreaterThan(Date.now());

    const enClaro = await db.query(
      `SELECT COUNT(*)::int AS total FROM sessions WHERE token_hash = $1`,
      [sessionToken]
    );

    expect(enClaro.rows[0].total).toBe(0);
  });

  it("limpia los fallos previos tras un login correcto", async () => {
    const fallos = await db.query(
      `SELECT COUNT(*)::int AS total FROM login_attempts
       WHERE succeeded = false AND identifier = $1`,
      [OWNER_EMAIL.toLowerCase()]
    );

    expect(fallos.rows[0].total).toBe(0);
  });

  it("devuelve el usuario en GET /api/admin/auth/me", async () => {
    const response = await authed("/api/admin/auth/me");

    expect(response.statusCode).toBe(200);
    expect(response.json().user.email).toBe(OWNER_EMAIL.toLowerCase());
  });

  it("rechaza la API del panel sin sesión", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/admin/requests",
    });

    expect(response.statusCode).toBe(401);
  });
});

describe("dashboard con consultas reales", () => {
  it("cuenta clientes, solicitudes, estados y servicios", async () => {
    const body = (await authed("/api/admin/dashboard")).json();

    expect(body.totals.customers).toBe(2);
    expect(body.totals.requests).toBe(3);
    expect(body.totals.vehicles).toBe(3);
    expect(body.totals.conversations).toBe(4);

    expect(body.requestsByStatus).toEqual({
      COLLECTING: 1,
      HUMAN: 1,
      CLOSED: 1,
    });

    expect(body.requestsByServiceType).toEqual({
      REPROGRAMMING: 1,
      ECU_REPAIR: 1,
      ECU_CLONING: 1,
      OTHER: 0,
      UNKNOWN: 0,
    });

    expect(body.attention).toEqual({
      waitingForHuman: 1,
      stillCollecting: 1,
    });

    expect(body.recentRequests[0].id).toBe(String(data.requestHuman.id));
  });
});

describe("listado, filtros y paginación reales", () => {
  it("devuelve las tres solicitudes con paginación por defecto", async () => {
    const body = (await authed("/api/admin/requests")).json();

    expect(body.pagination).toEqual({
      page: 1,
      pageSize: 25,
      total: 3,
      totalPages: 1,
    });

    expect(body.items).toHaveLength(3);
    expect(body.items[0].id).toBe(String(data.requestHuman.id));
  });

  it("agrega el recuento real de mensajes por solicitud", async () => {
    const body = (await authed("/api/admin/requests")).json();

    const conHumano = body.items.find(
      (item: any) => item.id === String(data.requestHuman.id)
    );

    expect(conHumano.activity.conversationCount).toBe(2);
    expect(conHumano.activity.messageCount).toBe(4);
  });

  it("filtra por estado y por tipo de servicio", async () => {
    const humano = (await authed("/api/admin/requests?status=HUMAN")).json();
    const reparacion = (
      await authed("/api/admin/requests?serviceType=ECU_REPAIR")
    ).json();

    expect(humano.pagination.total).toBe(1);
    expect(humano.items[0].id).toBe(String(data.requestHuman.id));

    expect(reparacion.pagination.total).toBe(1);
    expect(reparacion.items[0].id).toBe(String(data.requestClosed.id));
  });

  it("busca por matrícula, nombre y descripción", async () => {
    const porMatricula = (
      await authed("/api/admin/requests?search=1111AAA")
    ).json();

    const porNombre = (
      await authed("/api/admin/requests?search=Bruno")
    ).json();

    const porDescripcion = (
      await authed("/api/admin/requests?search=potencia")
    ).json();

    expect(porMatricula.items.map((i: any) => i.id)).toEqual([
      String(data.requestHuman.id),
    ]);

    expect(porNombre.items.map((i: any) => i.id)).toEqual([
      String(data.requestCollecting.id),
    ]);

    expect(porDescripcion.items.map((i: any) => i.id)).toEqual([
      String(data.requestHuman.id),
    ]);
  });

  it("busca sin distinguir mayúsculas y sin interpretar comodines", async () => {
    const minusculas = (
      await authed("/api/admin/requests?search=seat")
    ).json();

    const comodin = (await authed("/api/admin/requests?search=%25")).json();

    expect(minusculas.pagination.total).toBe(1);
    expect(comodin.pagination.total).toBe(0);
  });

  it("filtra por intervalo de fechas de creación", async () => {
    const agosto = (
      await authed("/api/admin/requests?from=2026-08-01&to=2026-08-31")
    ).json();

    const junio = (
      await authed("/api/admin/requests?from=2026-06-01&to=2026-06-30")
    ).json();

    expect(agosto.pagination.total).toBe(2);
    expect(junio.pagination.total).toBe(1);
    expect(junio.items[0].id).toBe(String(data.requestClosed.id));
  });

  it("pagina de verdad y ordena por los campos permitidos", async () => {
    const primera = (
      await authed("/api/admin/requests?pageSize=1&page=1")
    ).json();

    const segunda = (
      await authed("/api/admin/requests?pageSize=1&page=2")
    ).json();

    expect(primera.pagination.totalPages).toBe(3);
    expect(primera.items).toHaveLength(1);
    expect(segunda.items[0].id).not.toBe(primera.items[0].id);

    const ascendente = (
      await authed("/api/admin/requests?sort=createdAt&order=asc")
    ).json();

    expect(ascendente.items[0].id).toBe(String(data.requestClosed.id));

    const porCliente = (
      await authed("/api/admin/requests?sort=customerName&order=asc")
    ).json();

    expect(porCliente.items[0].customer.name).toBe("Ana Pérez");
  });

  it("devuelve un listado vacío coherente", async () => {
    const body = (
      await authed("/api/admin/requests?search=no-existe-nada")
    ).json();

    expect(body.items).toEqual([]);
    expect(body.pagination.total).toBe(0);
    expect(body.pagination.totalPages).toBe(0);
  });
});

describe("detalle de solicitud con datos reales", () => {
  it("agrega solicitud, cliente, vehículo y conversaciones", async () => {
    const response = await authed(
      `/api/admin/requests/${data.requestHuman.id}`
    );

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.request.status).toBe("HUMAN");
    expect(body.request.structuredData).toEqual({ objetivo: "stage 1" });
    expect(body.customer.name).toBe("Ana Pérez");
    expect(body.vehicle.plate).toBe("1111AAA");
    expect(body.vehicle.originalPower).toBe("150cv");
  });

  it("selecciona las conversaciones por request_id, no por cliente", async () => {
    const body = (
      await authed(`/api/admin/requests/${data.requestHuman.id}`)
    ).json();

    const ids = body.conversations.map((c: any) => c.id);

    expect(ids).toHaveLength(2);
    expect(ids).toContain(String(data.conversationPrimera.id));
    expect(ids).toContain(String(data.conversationSegunda.id));

    // Conversación del mismo cliente pero sin solicitud asociada.
    expect(ids).not.toContain(String(data.conversationHuerfana.id));

    const textos = JSON.stringify(body);
    expect(textos).not.toContain("mensaje-sin-solicitud");
  });

  it("ordena conversaciones y mensajes cronológicamente", async () => {
    const body = (
      await authed(`/api/admin/requests/${data.requestHuman.id}`)
    ).json();

    expect(body.conversations[0].id).toBe(
      String(data.conversationPrimera.id)
    );

    expect(
      body.conversations[0].messages.map((m: any) => m.textContent)
    ).toEqual(["primero", "segundo", "tercero"]);

    expect(
      body.conversations[1].messages.map((m: any) => m.textContent)
    ).toEqual(["cuarto"]);
  });

  it("no mezcla datos de otro cliente", async () => {
    const body = (
      await authed(`/api/admin/requests/${data.requestHuman.id}`)
    ).json();

    const serializado = JSON.stringify(body);

    expect(serializado).not.toContain("dato-privado-de-bruno");
    expect(serializado).not.toContain("Bruno");
    expect(serializado).not.toContain("2222BBB");
  });

  it("devuelve 404 si la solicitud no existe", async () => {
    const response = await authed("/api/admin/requests/99999999");

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "request_not_found" });
  });
});

describe("historial de cliente con datos reales", () => {
  it("devuelve vehículos, solicitudes y resumen de Ana", async () => {
    const body = (await authed(`/api/admin/customers/${data.ana.id}`)).json();

    expect(body.customer.name).toBe("Ana Pérez");
    expect(body.vehicles.map((v: any) => v.plate).sort()).toEqual([
      "1111AAA",
      "3333CCC",
    ]);

    expect(body.requests).toHaveLength(2);

    expect(body.summary).toMatchObject({
      totalRequests: 2,
      totalVehicles: 2,
      byStatus: { COLLECTING: 0, HUMAN: 1, CLOSED: 1 },
    });
  });

  it("aísla el historial de cada cliente", async () => {
    const deAna = (await authed(`/api/admin/customers/${data.ana.id}`)).json();
    const deBruno = (
      await authed(`/api/admin/customers/${data.bruno.id}`)
    ).json();

    const textoAna = JSON.stringify(deAna);
    const textoBruno = JSON.stringify(deBruno);

    expect(textoAna).not.toContain("Bruno");
    expect(textoAna).not.toContain("2222BBB");

    expect(textoBruno).not.toContain("Ana Pérez");
    expect(textoBruno).not.toContain("1111AAA");

    expect(deBruno.requests).toHaveLength(1);
    expect(deBruno.requests[0].id).toBe(String(data.requestCollecting.id));
    expect(deBruno.summary.totalRequests).toBe(1);
  });

  it("devuelve 404 si el cliente no existe", async () => {
    const response = await authed("/api/admin/customers/99999999");

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "customer_not_found" });
  });
});

describe("higiene de las respuestas contra datos reales", () => {
  it("no expone credenciales ni datos de sesión", async () => {
    for (const url of [
      "/api/admin/dashboard",
      "/api/admin/requests",
      `/api/admin/requests/${data.requestHuman.id}`,
      `/api/admin/customers/${data.ana.id}`,
      "/api/admin/auth/me",
    ]) {
      const body = (await authed(url)).body;

      expect(body).not.toContain("password_hash");
      expect(body).not.toContain("argon2");
      expect(body).not.toContain("token_hash");
      expect(body).not.toContain(OWNER_PASSWORD);
    }
  });
});

describe("logout con revocación real", () => {
  it("revoca la sesión en PostgreSQL", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/admin/auth/logout",
      cookies: { [COOKIE_NAME]: sessionToken },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ loggedOut: true, revoked: true });

    const result = await db.query(
      `SELECT revoked_at FROM sessions WHERE token_hash = $1`,
      [hashSessionToken(sessionToken)]
    );

    expect(result.rows[0].revoked_at).not.toBeNull();
  });

  it("rechaza la cookie después del logout", async () => {
    const me = await authed("/api/admin/auth/me");
    const panel = await authed("/api/admin/requests");

    expect(me.statusCode).toBe(401);
    expect(panel.statusCode).toBe(401);
  });
});

describe("rutas de n8n contra la base real", () => {
  it("siguen protegidas por x-internal-api-key y funcionando", async () => {
    const sinClave = await app.inject({
      method: "GET",
      url: "/api/messages/provider-exists?providerMessageId=wamid.A1",
    });

    expect(sinClave.statusCode).toBe(401);

    const conClave = await app.inject({
      method: "GET",
      url: "/api/messages/provider-exists?providerMessageId=wamid.A1",
      headers: { "x-internal-api-key": process.env.INTERNAL_API_KEY ?? "" },
    });

    expect(conClave.statusCode).toBe(200);
    expect(conClave.json()).toEqual({
      providerMessageId: "wamid.A1",
      exists: true,
    });
  });

  it("responde al healthcheck contra PostgreSQL", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json().database).toBe("connected");
  });
});
