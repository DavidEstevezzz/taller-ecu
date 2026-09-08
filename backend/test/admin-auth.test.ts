/*
 * Pruebas de la autenticación administrativa.
 *
 * El repositorio (única capa que toca PostgreSQL) se sustituye por un doble
 * en memoria. Argon2 y la generación de tokens se ejercitan de verdad.
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
  db: {
    query: vi.fn(),
    connect: vi.fn(),
    on: vi.fn(),
    end: vi.fn(),
  },
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

import { buildApp } from "../src/app.js";
import * as repository from "../src/auth/repository.js";
import { hashPassword } from "../src/auth/passwords.js";
import { hashSessionToken } from "../src/auth/tokens.js";
import { SESSION_TTL_MS } from "../src/auth/config.js";

const repo = vi.mocked(repository);

const COOKIE_NAME = "taller_session";
const PASSWORD = "una-contrasena-larga-y-segura";
const INTERNAL_API_KEY = "test-internal-api-key";

let passwordHash: string;
let app: FastifyInstance;

type StoredSession = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
};

let users: Map<string, any>;
let sessions: Map<string, StoredSession>;
let failures: { byIdentifier: number; byIpAddress: number };

function buildUser(overrides: Record<string, unknown> = {}) {
  return {
    id: "1",
    email: "jefe@jmreprocars.com",
    name: "Jefe del taller",
    password_hash: passwordHash,
    role: "OWNER",
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

/* Extrae la cookie de sesión de una cabecera set-cookie. */
function readSetCookie(response: { headers: Record<string, unknown> }) {
  const raw = response.headers["set-cookie"];
  const header = Array.isArray(raw) ? raw[0] : (raw as string | undefined);

  if (!header) {
    return null;
  }

  const value = header.split(";")[0].split("=").slice(1).join("=");

  return { header, value };
}

beforeAll(async () => {
  passwordHash = await hashPassword(PASSWORD);
}, 30_000);

beforeEach(async () => {
  vi.clearAllMocks();

  process.env.INTERNAL_API_KEY = INTERNAL_API_KEY;
  delete process.env.NODE_ENV;

  users = new Map();
  sessions = new Map();
  failures = { byIdentifier: 0, byIpAddress: 0 };

  const owner = buildUser();
  users.set(owner.email, owner);

  repo.findUserByEmail.mockImplementation(
    async (email: string) => users.get(email) ?? null
  );

  repo.countRecentLoginFailures.mockImplementation(async () => failures);

  repo.recordLoginAttempt.mockImplementation(async (input: any) => {
    if (!input.succeeded) {
      failures = {
        byIdentifier: failures.byIdentifier + 1,
        byIpAddress: failures.byIpAddress + 1,
      };
    }
  });

  repo.clearLoginFailures.mockImplementation(async () => {
    failures = { byIdentifier: 0, byIpAddress: 0 };
  });

  repo.insertSession.mockImplementation(async (input: any) => {
    sessions.set(input.tokenHash, {
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      revokedAt: null,
    });

    return {
      id: "1",
      user_id: input.userId,
      expires_at: input.expiresAt,
      revoked_at: null,
    };
  });

  repo.findSessionWithUser.mockImplementation(async (tokenHash: string) => {
    const session = sessions.get(tokenHash);

    if (!session || session.revokedAt) {
      return null;
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      return null;
    }

    const user = [...users.values()].find(
      (candidate) => String(candidate.id) === session.userId
    );

    if (!user) {
      return null;
    }

    return {
      session: {
        id: "1",
        user_id: session.userId,
        expires_at: session.expiresAt,
        revoked_at: session.revokedAt,
      },
      user,
    };
  });

  repo.revokeSessionByTokenHash.mockImplementation(
    async (tokenHash: string) => {
      const session = sessions.get(tokenHash);

      if (!session || session.revokedAt) {
        return 0;
      }

      session.revokedAt = new Date();

      return 1;
    }
  );

  app = buildApp({ logger: false });
  await app.ready();
});

afterEach(async () => {
  await app.close();
  delete process.env.NODE_ENV;
});

async function loginOk(email = "jefe@jmreprocars.com", password = PASSWORD) {
  return app.inject({
    method: "POST",
    url: "/api/admin/auth/login",
    payload: { email, password },
  });
}

describe("POST /api/admin/auth/login", () => {
  it("acepta credenciales correctas y devuelve el usuario", async () => {
    const response = await loginOk();

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      user: {
        id: "1",
        email: "jefe@jmreprocars.com",
        name: "Jefe del taller",
        role: "OWNER",
      },
    });
  });

  it("no devuelve nunca el hash de la contraseña", async () => {
    const response = await loginOk();

    expect(response.body).not.toContain("argon2");
    expect(response.body).not.toContain(PASSWORD);
  });

  it("normaliza el email antes de buscar al usuario", async () => {
    const response = await loginOk("  JEFE@JMReprocars.com  ");

    expect(response.statusCode).toBe(200);
    expect(repo.findUserByEmail).toHaveBeenCalledWith("jefe@jmreprocars.com");
  });

  it("rechaza una contraseña incorrecta", async () => {
    const response = await loginOk(
      "jefe@jmreprocars.com",
      "contrasena-equivocada"
    );

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "invalid_credentials" });
    expect(repo.insertSession).not.toHaveBeenCalled();
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("rechaza un email desconocido con el mismo error", async () => {
    const response = await loginOk("nadie@jmreprocars.com", PASSWORD);

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "invalid_credentials" });
    expect(repo.insertSession).not.toHaveBeenCalled();
  });

  it("rechaza a un usuario inactivo sin revelar que la cuenta existe", async () => {
    users.set(
      "jefe@jmreprocars.com",
      buildUser({ is_active: false })
    );

    const response = await loginOk();

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "invalid_credentials" });
    expect(repo.insertSession).not.toHaveBeenCalled();
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("valida el cuerpo de la petición", async () => {
    const sinPassword = await app.inject({
      method: "POST",
      url: "/api/admin/auth/login",
      payload: { email: "jefe@jmreprocars.com" },
    });

    const emailInvalido = await app.inject({
      method: "POST",
      url: "/api/admin/auth/login",
      payload: { email: "no-es-un-email", password: PASSWORD },
    });

    expect(sinPassword.statusCode).toBe(400);
    expect(emailInvalido.statusCode).toBe(400);
    expect(repo.insertSession).not.toHaveBeenCalled();
  });

  it("registra el intento fallido y limpia los fallos tras un login correcto", async () => {
    await loginOk("jefe@jmreprocars.com", "mal");

    expect(repo.recordLoginAttempt).toHaveBeenCalledWith(
      expect.objectContaining({ succeeded: false })
    );

    await loginOk();

    expect(repo.clearLoginFailures).toHaveBeenCalledWith(
      "jefe@jmreprocars.com"
    );
  });
});

describe("almacenamiento de la sesión", () => {
  it("guarda el SHA-256 del token y nunca el token en claro", async () => {
    const response = await loginOk();
    const cookie = readSetCookie(response);

    expect(cookie).not.toBeNull();

    const token = cookie!.value;
    const stored = repo.insertSession.mock.calls[0][0] as any;

    expect(stored.tokenHash).toBe(hashSessionToken(token));
    expect(stored.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(stored.tokenHash).not.toBe(token);
    expect(JSON.stringify(stored)).not.toContain(token);
  });

  it("crea la sesión con la caducidad configurada", async () => {
    const before = Date.now();

    await loginOk();

    const stored = repo.insertSession.mock.calls[0][0] as any;
    const expiresAt = stored.expiresAt.getTime();

    expect(expiresAt).toBeGreaterThanOrEqual(before + SESSION_TTL_MS - 1000);
    expect(expiresAt).toBeLessThanOrEqual(Date.now() + SESSION_TTL_MS);
  });

  it("genera un token distinto en cada inicio de sesión", async () => {
    const primera = readSetCookie(await loginOk());
    const segunda = readSetCookie(await loginOk());

    expect(primera!.value).not.toBe(segunda!.value);
  });

  it("rechaza una sesión caducada", async () => {
    const response = await loginOk();
    const cookie = readSetCookie(response)!;

    // La sesión se caduca en el almacén sin tocar la cookie del cliente.
    const stored = sessions.get(hashSessionToken(cookie.value))!;
    stored.expiresAt = new Date(Date.now() - 1000);

    const me = await app.inject({
      method: "GET",
      url: "/api/admin/auth/me",
      cookies: { [COOKIE_NAME]: cookie.value },
    });

    expect(me.statusCode).toBe(401);
    expect(me.json()).toEqual({ error: "unauthorized" });
  });

  it("rechaza la sesión de un usuario desactivado después del login", async () => {
    const cookie = readSetCookie(await loginOk())!;

    users.set("jefe@jmreprocars.com", buildUser({ is_active: false }));

    const me = await app.inject({
      method: "GET",
      url: "/api/admin/auth/me",
      cookies: { [COOKIE_NAME]: cookie.value },
    });

    expect(me.statusCode).toBe(401);
  });
});

describe("propiedades de la cookie de sesión", () => {
  it("es HttpOnly, SameSite=Lax y de ámbito raíz", async () => {
    const cookie = readSetCookie(await loginOk())!;

    expect(cookie.header).toContain(`${COOKIE_NAME}=`);
    expect(cookie.header).toMatch(/HttpOnly/i);
    expect(cookie.header).toMatch(/SameSite=Lax/i);
    expect(cookie.header).toMatch(/Path=\//i);
    expect(cookie.header).toMatch(/Max-Age=\d+/i);
  });

  it("no es Secure fuera de producción", async () => {
    const cookie = readSetCookie(await loginOk())!;

    expect(cookie.header).not.toMatch(/Secure/i);
  });

  it("es Secure en producción", async () => {
    process.env.NODE_ENV = "production";

    const cookie = readSetCookie(await loginOk())!;

    expect(cookie.header).toMatch(/Secure/i);
    expect(cookie.header).toMatch(/HttpOnly/i);
    expect(cookie.header).toMatch(/SameSite=Lax/i);
  });
});

describe("GET /api/admin/auth/me", () => {
  it("devuelve el usuario con una sesión válida", async () => {
    const cookie = readSetCookie(await loginOk())!;

    const response = await app.inject({
      method: "GET",
      url: "/api/admin/auth/me",
      cookies: { [COOKIE_NAME]: cookie.value },
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      user: {
        id: "1",
        email: "jefe@jmreprocars.com",
        name: "Jefe del taller",
        role: "OWNER",
      },
    });
  });

  it("devuelve 401 sin cookie", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/admin/auth/me",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "unauthorized" });
  });

  it("devuelve 401 con un token inventado", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/admin/auth/me",
      cookies: { [COOKIE_NAME]: "token-que-no-existe" },
    });

    expect(response.statusCode).toBe(401);
  });
});

describe("POST /api/admin/auth/logout", () => {
  it("revoca la sesión y borra la cookie", async () => {
    const cookie = readSetCookie(await loginOk())!;
    const tokenHash = hashSessionToken(cookie.value);

    const logout = await app.inject({
      method: "POST",
      url: "/api/admin/auth/logout",
      cookies: { [COOKIE_NAME]: cookie.value },
    });

    expect(logout.statusCode).toBe(200);
    expect(logout.json()).toEqual({ loggedOut: true, revoked: true });

    expect(repo.revokeSessionByTokenHash).toHaveBeenCalledWith(tokenHash);
    expect(sessions.get(tokenHash)!.revokedAt).not.toBeNull();

    const cleared = readSetCookie(logout)!;
    expect(cleared.header).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
  });

  it("deja la cookie inservible después del logout", async () => {
    const cookie = readSetCookie(await loginOk())!;

    await app.inject({
      method: "POST",
      url: "/api/admin/auth/logout",
      cookies: { [COOKIE_NAME]: cookie.value },
    });

    const me = await app.inject({
      method: "GET",
      url: "/api/admin/auth/me",
      cookies: { [COOKIE_NAME]: cookie.value },
    });

    expect(me.statusCode).toBe(401);
  });

  it("es idempotente sin sesión activa", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/admin/auth/logout",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ loggedOut: true, revoked: false });
  });
});

describe("limitación de intentos de login", () => {
  it("bloquea con 429 tras superar el umbral de fallos", async () => {
    for (let intento = 0; intento < 5; intento += 1) {
      const fallo = await loginOk("jefe@jmreprocars.com", "mal");
      expect(fallo.statusCode).toBe(401);
    }

    const bloqueado = await loginOk("jefe@jmreprocars.com", "mal");

    expect(bloqueado.statusCode).toBe(429);
    expect(bloqueado.json()).toEqual({ error: "too_many_attempts" });
  });

  it("bloquea también con la contraseña correcta mientras dura el castigo", async () => {
    failures = { byIdentifier: 5, byIpAddress: 5 };

    const response = await loginOk();

    expect(response.statusCode).toBe(429);
    expect(repo.findUserByEmail).not.toHaveBeenCalled();
    expect(repo.insertSession).not.toHaveBeenCalled();
  });

  it("permite entrar de nuevo cuando los fallos caducan", async () => {
    failures = { byIdentifier: 5, byIpAddress: 5 };

    expect((await loginOk()).statusCode).toBe(429);

    failures = { byIdentifier: 0, byIpAddress: 0 };

    expect((await loginOk()).statusCode).toBe(200);
  });
});

describe("separación entre la API administrativa y la clave interna", () => {
  it("no acepta INTERNAL_API_KEY como autenticación en /me", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/admin/auth/me",
      headers: { "x-internal-api-key": INTERNAL_API_KEY },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "unauthorized" });
  });

  it("permite llegar al login sin la clave interna", async () => {
    delete process.env.INTERNAL_API_KEY;

    const response = await loginOk();

    expect(response.statusCode).toBe(200);
  });

  it("sigue exigiendo la clave interna en las rutas de n8n", async () => {
    const cookie = readSetCookie(await loginOk())!;

    // Una sesión válida del panel no abre las rutas internas.
    const conCookie = await app.inject({
      method: "GET",
      url: "/api/messages/provider-exists?providerMessageId=wamid.TEST",
      cookies: { [COOKIE_NAME]: cookie.value },
    });

    expect(conCookie.statusCode).toBe(401);
    expect(conCookie.json()).toEqual({ error: "unauthorized" });
  });

  it("registra las rutas administrativas esperadas", async () => {
    const registered = new Set<string>();

    const collector = buildApp({ logger: false });

    collector.addHook("onRoute", (route) => {
      const methods = Array.isArray(route.method)
        ? route.method
        : [route.method];

      for (const method of methods) {
        registered.add(`${method} ${route.url}`);
      }
    });

    await collector.ready();
    await collector.close();

    expect(registered).toContain("POST /api/admin/auth/login");
    expect(registered).toContain("POST /api/admin/auth/logout");
    expect(registered).toContain("GET /api/admin/auth/me");
  });
});
