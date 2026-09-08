/*
 * Pruebas de la API de lectura del panel.
 *
 * El repositorio se sustituye por un doble: no se toca PostgreSQL, no se
 * abren puertos y no se usa la red.
 */

import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import type { FastifyInstance } from "fastify";

vi.mock("../src/db.js", () => ({
  db: { query: vi.fn(), connect: vi.fn(), on: vi.fn(), end: vi.fn() },
}));

vi.mock("../src/auth/repository.js", () => ({
  findUserByEmail: vi.fn(),
  insertUser: vi.fn(),
  countUsers: vi.fn(),
  insertSession: vi.fn(),
  findSessionWithUser: vi.fn(),
  revokeSessionByTokenHash: vi.fn(),
  countRecentLoginFailures: vi.fn(),
  recordLoginAttempt: vi.fn(),
  clearLoginFailures: vi.fn(),
}));

vi.mock("../src/panel/repository.js", () => ({
  countRequests: vi.fn(),
  listRequests: vi.fn(),
  findRequestDetail: vi.fn(),
  listConversationsByRequest: vi.fn(),
  listMessagesByConversations: vi.fn(),
  findCustomer: vi.fn(),
  listVehiclesByCustomer: vi.fn(),
  summarizeCustomerRequests: vi.fn(),
  getDashboardTotals: vi.fn(),
}));

import { buildApp } from "../src/app.js";
import * as authRepository from "../src/auth/repository.js";
import * as panelRepository from "../src/panel/repository.js";
import { hashPassword } from "../src/auth/passwords.js";
import { hashSessionToken } from "../src/auth/tokens.js";

const authRepo = vi.mocked(authRepository);
const panel = vi.mocked(panelRepository);

const COOKIE_NAME = "taller_session";
const PASSWORD = "una-contrasena-larga-y-segura";
const INTERNAL_API_KEY = "test-internal-api-key";

let passwordHash: string;
let app: FastifyInstance;
let sessionCookie: string;

function requestRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    status: "HUMAN",
    source: "whatsapp",
    service_type: "REPROGRAMMING",
    description: "Quiere subir potencia",
    summary_ai: "Cliente pide reprogramación",
    missing_fields: ["plate"],
    created_at: new Date("2026-08-01T10:00:00Z"),
    updated_at: new Date("2026-08-02T10:00:00Z"),
    completed_at: null,
    last_activity_at: new Date("2026-08-02T12:00:00Z"),
    customer_id: 5,
    customer_name: "Ana",
    customer_phone: "+34600000000",
    customer_email: null,
    vehicle_id: 7,
    vehicle_brand: "Seat",
    vehicle_model: "Leon",
    vehicle_year: 2019,
    vehicle_engine: "2.0 TDI",
    vehicle_plate: "1234ABC",
    vehicle_vin: "VSSZZZ",
    vehicle_type: "car",
    conversation_count: 1,
    message_count: 3,
    last_message_at: new Date("2026-08-02T12:00:00Z"),
    ...overrides,
  };
}

function dashboardTotalsRow() {
  return {
    customers_total: 12,
    vehicles_total: 15,
    conversations_total: 14,
    requests_total: 20,
    status_collecting: 4,
    status_human: 3,
    status_closed: 13,
    service_reprogramming: 9,
    service_ecu_repair: 5,
    service_ecu_cloning: 2,
    service_other: 1,
    service_unknown: 3,
    created_last_7_days: 6,
    active_last_24_hours: 2,
  };
}

async function openSession() {
  authRepo.countRecentLoginFailures.mockResolvedValue({
    byIdentifier: 0,
    byIpAddress: 0,
  });

  authRepo.findUserByEmail.mockResolvedValue({
    id: "1",
    email: "jefe@jmreprocars.com",
    name: "Jefe del taller",
    password_hash: passwordHash,
    role: "OWNER",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  } as any);

  authRepo.recordLoginAttempt.mockResolvedValue(undefined);
  authRepo.clearLoginFailures.mockResolvedValue(undefined);

  const stored: Record<string, any> = {};

  authRepo.insertSession.mockImplementation(async (input: any) => {
    stored.tokenHash = input.tokenHash;

    return {
      id: "1",
      user_id: input.userId,
      expires_at: input.expiresAt,
      revoked_at: null,
    };
  });

  const response = await app.inject({
    method: "POST",
    url: "/api/admin/auth/login",
    payload: { email: "jefe@jmreprocars.com", password: PASSWORD },
  });

  const raw = response.headers["set-cookie"];
  const header = Array.isArray(raw) ? raw[0] : (raw as string);
  const token = header.split(";")[0].split("=").slice(1).join("=");

  authRepo.findSessionWithUser.mockImplementation(
    async (tokenHash: string) => {
      if (tokenHash !== hashSessionToken(token)) {
        return null;
      }

      return {
        session: {
          id: "1",
          user_id: "1",
          expires_at: new Date(Date.now() + 3_600_000),
          revoked_at: null,
        },
        user: {
          id: "1",
          email: "jefe@jmreprocars.com",
          name: "Jefe del taller",
          password_hash: passwordHash,
          role: "OWNER",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      } as any;
    }
  );

  return token;
}

function authed(url: string) {
  return app.inject({
    method: "GET",
    url,
    cookies: { [COOKIE_NAME]: sessionCookie },
  });
}

beforeAll(async () => {
  passwordHash = await hashPassword(PASSWORD);
}, 30_000);

beforeEach(async () => {
  vi.clearAllMocks();

  process.env.INTERNAL_API_KEY = INTERNAL_API_KEY;

  app = buildApp({ logger: false });
  await app.ready();

  sessionCookie = await openSession();

  panel.countRequests.mockResolvedValue(1);
  panel.listRequests.mockResolvedValue([requestRow()]);
  panel.getDashboardTotals.mockResolvedValue(dashboardTotalsRow());
  panel.findRequestDetail.mockResolvedValue(null);
  panel.listConversationsByRequest.mockResolvedValue([]);
  panel.listMessagesByConversations.mockResolvedValue([]);
  panel.findCustomer.mockResolvedValue(null);
  panel.listVehiclesByCustomer.mockResolvedValue([]);
  panel.summarizeCustomerRequests.mockResolvedValue(null);
});

afterEach(async () => {
  await app.close();
});

const PANEL_URLS = [
  "/api/admin/dashboard",
  "/api/admin/requests",
  "/api/admin/requests/10",
  "/api/admin/customers/5",
];

describe("protección de la API de lectura", () => {
  it("rechaza todas las rutas sin sesión administrativa", async () => {
    for (const url of PANEL_URLS) {
      const response = await app.inject({ method: "GET", url });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ error: "unauthorized" });
    }
  });

  it("una x-internal-api-key válida no sustituye a la sesión", async () => {
    for (const url of PANEL_URLS) {
      const response = await app.inject({
        method: "GET",
        url,
        headers: { "x-internal-api-key": INTERNAL_API_KEY },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ error: "unauthorized" });
    }
  });

  it("no consulta la base de datos cuando rechaza la petición", async () => {
    await app.inject({ method: "GET", url: "/api/admin/requests" });

    expect(panel.countRequests).not.toHaveBeenCalled();
    expect(panel.listRequests).not.toHaveBeenCalled();
  });

  it("permite el acceso con una sesión válida", async () => {
    const response = await authed("/api/admin/requests");

    expect(response.statusCode).toBe(200);
  });

  it("no altera las rutas internas de n8n", async () => {
    const sinClave = await app.inject({
      method: "GET",
      url: "/api/messages/provider-exists?providerMessageId=wamid.X",
      cookies: { [COOKIE_NAME]: sessionCookie },
    });

    expect(sinClave.statusCode).toBe(401);
    expect(sinClave.json()).toEqual({ error: "unauthorized" });
  });
});

describe("GET /api/admin/dashboard", () => {
  it("devuelve totales, agrupaciones y actividad reciente", async () => {
    const response = await authed("/api/admin/dashboard");

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.totals).toEqual({
      customers: 12,
      vehicles: 15,
      conversations: 14,
      requests: 20,
    });

    expect(body.requestsByStatus).toEqual({
      COLLECTING: 4,
      HUMAN: 3,
      CLOSED: 13,
    });

    expect(body.requestsByServiceType).toEqual({
      REPROGRAMMING: 9,
      ECU_REPAIR: 5,
      ECU_CLONING: 2,
      OTHER: 1,
      UNKNOWN: 3,
    });

    expect(body.attention).toEqual({
      waitingForHuman: 3,
      stillCollecting: 4,
    });

    expect(body.activity).toEqual({
      requestsCreatedLast7Days: 6,
      requestsActiveLast24Hours: 2,
    });

    expect(body.recentRequests).toHaveLength(1);
    expect(body.recentRequests[0].customer.name).toBe("Ana");
  });

  it("responde con ceros cuando no hay datos", async () => {
    panel.getDashboardTotals.mockResolvedValue(null);
    panel.listRequests.mockResolvedValue([]);

    const body = (await authed("/api/admin/dashboard")).json();

    expect(body.totals.requests).toBe(0);
    expect(body.requestsByStatus.HUMAN).toBe(0);
    expect(body.recentRequests).toEqual([]);
  });
});

describe("GET /api/admin/requests", () => {
  it("aplica la paginación por defecto", async () => {
    panel.countRequests.mockResolvedValue(60);

    const body = (await authed("/api/admin/requests")).json();

    expect(body.pagination).toEqual({
      page: 1,
      pageSize: 25,
      total: 60,
      totalPages: 3,
    });

    expect(panel.listRequests).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 25, offset: 0 })
    );
  });

  it("calcula el desplazamiento de la página solicitada", async () => {
    panel.countRequests.mockResolvedValue(60);

    await authed("/api/admin/requests?page=3&pageSize=10");

    expect(panel.listRequests).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 10, offset: 20 })
    );
  });

  it("acepta el tamaño máximo de página y rechaza pasarse", async () => {
    const maximo = await authed("/api/admin/requests?pageSize=100");
    const excesivo = await authed("/api/admin/requests?pageSize=101");

    expect(maximo.statusCode).toBe(200);
    expect(excesivo.statusCode).toBe(400);
  });

  it("rechaza paginación inválida", async () => {
    expect((await authed("/api/admin/requests?page=0")).statusCode).toBe(400);
    expect((await authed("/api/admin/requests?page=-1")).statusCode).toBe(400);
    expect((await authed("/api/admin/requests?pageSize=0")).statusCode).toBe(
      400
    );
  });

  it("rechaza filtros con valores no permitidos", async () => {
    const estado = await authed("/api/admin/requests?status=PENDIENTE");
    const servicio = await authed("/api/admin/requests?serviceType=LAVADO");
    const desconocido = await authed("/api/admin/requests?urgente=true");

    expect(estado.statusCode).toBe(400);
    expect(servicio.statusCode).toBe(400);
    expect(desconocido.statusCode).toBe(400);

    expect(desconocido.json()).toEqual({
      error: "unknown_query_parameter",
      parameter: "urgente",
    });

    expect(panel.listRequests).not.toHaveBeenCalled();
  });

  it("acepta los filtros válidos y los traslada a la capa de datos", async () => {
    await authed(
      "/api/admin/requests?status=HUMAN&serviceType=ECU_REPAIR" +
        "&from=2026-01-01&to=2026-12-31"
    );

    const argumentos = panel.listRequests.mock.calls[0][0] as any;

    expect(argumentos.filters.status).toBe("HUMAN");
    expect(argumentos.filters.serviceType).toBe("ECU_REPAIR");
    expect(argumentos.filters.from).toBeInstanceOf(Date);
    expect(argumentos.filters.to).toBeInstanceOf(Date);
  });

  it("rechaza un intervalo de fechas invertido", async () => {
    const response = await authed(
      "/api/admin/requests?from=2026-12-31&to=2026-01-01"
    );

    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({ error: "invalid_date_range" });
  });

  it("rechaza una fecha con formato incorrecto", async () => {
    const response = await authed("/api/admin/requests?from=ayer");

    expect(response.statusCode).toBe(400);
  });

  it("rechaza una ordenación fuera de la lista permitida", async () => {
    const campo = await authed("/api/admin/requests?sort=password_hash");
    const sentido = await authed("/api/admin/requests?order=aleatorio");

    expect(campo.statusCode).toBe(400);
    expect(sentido.statusCode).toBe(400);
    expect(panel.listRequests).not.toHaveBeenCalled();
  });

  it("ordena por actividad reciente de forma predeterminada", async () => {
    await authed("/api/admin/requests");

    expect(panel.listRequests).toHaveBeenCalledWith(
      expect.objectContaining({ sort: "lastActivityAt", order: "desc" })
    );
  });

  it("acepta las ordenaciones permitidas", async () => {
    for (const sort of [
      "lastActivityAt",
      "createdAt",
      "updatedAt",
      "status",
      "customerName",
    ]) {
      const response = await authed(
        `/api/admin/requests?sort=${sort}&order=asc`
      );

      expect(response.statusCode).toBe(200);
    }
  });

  it("traslada la búsqueda como valor, no como SQL", async () => {
    await authed("/api/admin/requests?search=Seat%20Leon");

    expect(panel.listRequests).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ search: "Seat Leon" }),
      })
    );
  });

  it("devuelve un listado vacío coherente", async () => {
    panel.countRequests.mockResolvedValue(0);
    panel.listRequests.mockResolvedValue([]);

    const body = (await authed("/api/admin/requests?search=nada")).json();

    expect(body.items).toEqual([]);
    expect(body.pagination).toEqual({
      page: 1,
      pageSize: 25,
      total: 0,
      totalPages: 0,
    });
  });

  it("incluye los datos de solicitud, cliente y vehículo", async () => {
    const body = (await authed("/api/admin/requests")).json();
    const item = body.items[0];

    expect(item).toMatchObject({
      id: "10",
      status: "HUMAN",
      serviceType: "REPROGRAMMING",
      missingFields: ["plate"],
    });

    expect(item.customer).toEqual({
      id: "5",
      name: "Ana",
      phone: "+34600000000",
      email: null,
    });

    expect(item.vehicle).toMatchObject({
      id: "7",
      brand: "Seat",
      model: "Leon",
      plate: "1234ABC",
    });

    expect(item.activity).toEqual({
      conversationCount: 1,
      messageCount: 3,
      lastMessageAt: "2026-08-02T12:00:00.000Z",
    });
  });

  it("tolera una solicitud sin vehículo", async () => {
    panel.listRequests.mockResolvedValue([
      requestRow({ vehicle_id: null, vehicle_brand: null }),
    ]);

    const body = (await authed("/api/admin/requests")).json();

    expect(body.items[0].vehicle).toBeNull();
  });
});

describe("GET /api/admin/requests/:requestId", () => {
  beforeEach(() => {
    panel.findRequestDetail.mockResolvedValue({
      ...requestRow(),
      structured_data: { power: "150cv" },
      customer_created_at: new Date("2026-07-01T09:00:00Z"),
      vehicle_original_power: "150cv",
      vehicle_notes: "Sin incidencias",
    });

    panel.listConversationsByRequest.mockResolvedValue([
      {
        id: 100,
        customer_id: 5,
        request_id: 10,
        channel: "whatsapp",
        bot_enabled: false,
        created_at: new Date("2026-08-01T10:00:00Z"),
        updated_at: new Date("2026-08-02T12:00:00Z"),
        last_message_at: new Date("2026-08-02T12:00:00Z"),
      },
    ]);
  });

  it("agrega solicitud, cliente, vehículo y conversaciones", async () => {
    const response = await authed("/api/admin/requests/10");

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.request.id).toBe("10");
    expect(body.request.structuredData).toEqual({ power: "150cv" });
    expect(body.customer.id).toBe("5");
    expect(body.vehicle.originalPower).toBe("150cv");
    expect(body.conversations).toHaveLength(1);
    expect(body.conversations[0].requestId).toBe("10");
  });

  it("selecciona las conversaciones por request_id", async () => {
    await authed("/api/admin/requests/10");

    expect(panel.listConversationsByRequest).toHaveBeenCalledWith("10");
    expect(panel.listMessagesByConversations).toHaveBeenCalledWith(["100"]);
  });

  it("devuelve los mensajes en orden cronológico", async () => {
    panel.listMessagesByConversations.mockResolvedValue([
      {
        id: 3,
        conversation_id: 100,
        direction: "OUTBOUND",
        message_type: "TEXT",
        text_content: "tercero",
        metadata: {},
        delivery_status: "read",
        status_updated_at: null,
        created_at: new Date("2026-08-01T12:00:00Z"),
      },
      {
        id: 1,
        conversation_id: 100,
        direction: "INBOUND",
        message_type: "TEXT",
        text_content: "primero",
        metadata: {},
        delivery_status: null,
        status_updated_at: null,
        created_at: new Date("2026-08-01T10:00:00Z"),
      },
      {
        id: 2,
        conversation_id: 100,
        direction: "OUTBOUND",
        message_type: "TEXT",
        text_content: "segundo",
        metadata: {},
        delivery_status: "sent",
        status_updated_at: null,
        created_at: new Date("2026-08-01T11:00:00Z"),
      },
    ]);

    const body = (await authed("/api/admin/requests/10")).json();

    expect(
      body.conversations[0].messages.map((m: any) => m.textContent)
    ).toEqual(["primero", "segundo", "tercero"]);
  });

  it("no mezcla mensajes de otras conversaciones", async () => {
    panel.listMessagesByConversations.mockResolvedValue([
      {
        id: 1,
        conversation_id: 100,
        direction: "INBOUND",
        message_type: "TEXT",
        text_content: "de esta solicitud",
        metadata: {},
        delivery_status: null,
        status_updated_at: null,
        created_at: new Date("2026-08-01T10:00:00Z"),
      },
      {
        id: 2,
        conversation_id: 999,
        direction: "INBOUND",
        message_type: "TEXT",
        text_content: "de otra conversación",
        metadata: {},
        delivery_status: null,
        status_updated_at: null,
        created_at: new Date("2026-08-01T11:00:00Z"),
      },
    ]);

    const body = (await authed("/api/admin/requests/10")).json();

    expect(body.conversations[0].messages).toHaveLength(1);
    expect(body.conversations[0].messages[0].textContent).toBe(
      "de esta solicitud"
    );
  });

  it("devuelve 404 si la solicitud no existe", async () => {
    panel.findRequestDetail.mockResolvedValue(null);

    const response = await authed("/api/admin/requests/999");

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "request_not_found" });
    expect(panel.listConversationsByRequest).not.toHaveBeenCalled();
  });

  it("rechaza un identificador que no es numérico", async () => {
    const response = await authed("/api/admin/requests/abc");

    expect(response.statusCode).toBe(400);
  });
});

describe("GET /api/admin/customers/:customerId", () => {
  beforeEach(() => {
    panel.findCustomer.mockResolvedValue({
      id: 5,
      name: "Ana",
      phone: "+34600000000",
      email: null,
      created_at: new Date("2026-07-01T09:00:00Z"),
      updated_at: new Date("2026-08-01T09:00:00Z"),
    });

    panel.listVehiclesByCustomer.mockResolvedValue([
      {
        id: 7,
        customer_id: 5,
        vehicle_type: "car",
        brand: "Seat",
        model: "Leon",
        year: 2019,
        engine: "2.0 TDI",
        original_power: "150cv",
        plate: "1234ABC",
        vin: "VSSZZZ",
        notes: null,
        created_at: new Date("2026-07-01T09:00:00Z"),
        updated_at: new Date("2026-07-01T09:00:00Z"),
      },
    ]);

    panel.summarizeCustomerRequests.mockResolvedValue({
      total: 2,
      collecting: 1,
      human: 1,
      closed: 0,
      first_request_at: new Date("2026-07-01T09:00:00Z"),
      last_activity_at: new Date("2026-08-02T12:00:00Z"),
    });
  });

  it("devuelve cliente, vehículos, solicitudes y resumen", async () => {
    const response = await authed("/api/admin/customers/5");

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body.customer).toMatchObject({
      id: "5",
      name: "Ana",
      phone: "+34600000000",
    });

    expect(body.vehicles).toHaveLength(1);
    expect(body.vehicles[0].plate).toBe("1234ABC");
    expect(body.requests).toHaveLength(1);

    expect(body.summary).toEqual({
      totalRequests: 2,
      byStatus: { COLLECTING: 1, HUMAN: 1, CLOSED: 0 },
      totalVehicles: 1,
      firstRequestAt: "2026-07-01T09:00:00.000Z",
      lastActivityAt: "2026-08-02T12:00:00.000Z",
    });
  });

  it("consulta siempre acotando por el cliente pedido", async () => {
    await authed("/api/admin/customers/5");

    expect(panel.findCustomer).toHaveBeenCalledWith("5");
    expect(panel.listVehiclesByCustomer).toHaveBeenCalledWith("5");
    expect(panel.summarizeCustomerRequests).toHaveBeenCalledWith("5");

    expect(panel.listRequests).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ customerId: "5" }),
      })
    );
  });

  it("devuelve 404 si el cliente no existe", async () => {
    panel.findCustomer.mockResolvedValue(null);

    const response = await authed("/api/admin/customers/999");

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "customer_not_found" });
    expect(panel.listVehiclesByCustomer).not.toHaveBeenCalled();
  });

  it("rechaza un identificador que no es numérico", async () => {
    expect((await authed("/api/admin/customers/xyz")).statusCode).toBe(400);
  });
});

describe("higiene de las respuestas", () => {
  it("no filtra credenciales ni datos de sesión en ninguna ruta", async () => {
    panel.findRequestDetail.mockResolvedValue({
      ...requestRow(),
      structured_data: {},
      customer_created_at: new Date(),
      vehicle_original_power: null,
      vehicle_notes: null,
      // Columnas que jamás deberían salir aunque el SQL las trajese.
      password_hash: "$argon2id$secreto",
      token_hash: "a".repeat(64),
    });

    panel.findCustomer.mockResolvedValue({
      id: 5,
      name: "Ana",
      phone: "+34600000000",
      email: null,
      created_at: new Date(),
      updated_at: new Date(),
      password_hash: "$argon2id$secreto",
    });

    panel.listRequests.mockResolvedValue([
      { ...requestRow(), password_hash: "$argon2id$secreto" },
    ]);

    for (const url of PANEL_URLS) {
      const body = (await authed(url)).body;

      expect(body).not.toContain("password_hash");
      expect(body).not.toContain("argon2");
      expect(body).not.toContain("token_hash");
      expect(body).not.toContain("INTERNAL_API_KEY");
      expect(body).not.toContain(INTERNAL_API_KEY);
      expect(body).not.toContain("login_attempts");
    }
  });
});
