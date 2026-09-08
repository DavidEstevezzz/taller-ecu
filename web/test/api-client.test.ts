/**
 * Pruebas de la capa HTTP. Comprueban el contrato con el backend sin red:
 * fetch está simulado.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, API_BASE, apiFetch } from "../src/lib/api/client";
import { currentUser, login, logout, me } from "../src/lib/api/auth";
import { getDashboard } from "../src/lib/api/dashboard";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let fetchMock: ReturnType<typeof vi.fn>;

/** Devuelve la llamada n a fetch, fallando si no existe. */
function callAt(index: number): [string, RequestInit & { headers: Record<string, string> }] {
  const call = fetchMock.mock.calls[index];
  expect(call, `no hay llamada a fetch en el índice ${index}`).toBeDefined();
  return call as [string, RequestInit & { headers: Record<string, string> }];
}

/** Ejecuta una promesa que debe fallar con ApiError y lo devuelve tipado. */
async function expectApiError(promise: Promise<unknown>): Promise<ApiError> {
  const error = await promise.catch((cause: unknown) => cause);
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("configuración del cliente", () => {
  it("usa una base relativa, sin dominio ni IP codificados", () => {
    expect(API_BASE).toBe("/api");
  });

  it("envía las credenciales para que viaje la cookie de sesión", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));

    await apiFetch("/admin/auth/me");

    const [url, init] = callAt(0);

    expect(url).toBe("/api/admin/auth/me");
    expect(init.credentials).toBe("include");
  });

  it("no guarda nada en localStorage ni sessionStorage", async () => {
    const localSpy = vi.spyOn(Storage.prototype, "setItem");

    fetchMock.mockResolvedValue(jsonResponse({ user: user() }));
    await login("jefe@example.com", "secreta");

    expect(localSpy).not.toHaveBeenCalled();
  });

  it("serializa el cuerpo como JSON solo cuando lo hay", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ user: user() }));
    await login("jefe@example.com", "secreta");

    const [, init] = callAt(0);

    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(String(init.body))).toEqual({
      email: "jefe@example.com",
      password: "secreta",
    });
  });
});

describe("manejo de errores", () => {
  it("convierte un 401 en un error de sesión", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "unauthorized" }, 401));

    const error = await expectApiError(me());

    expect(error.kind).toBe("unauthorized");
    expect(error.status).toBe(401);
    expect(error.code).toBe("unauthorized");
    expect(error.isSessionExpired).toBe(true);
  });

  it("distingue 404, 429 y 400", async () => {
    const cases = [
      [404, "not_found"],
      [429, "rate_limited"],
      [400, "validation"],
    ] as const;

    for (const [status, kind] of cases) {
      fetchMock.mockResolvedValue(jsonResponse({ error: "x" }, status));
      const error = await expectApiError(apiFetch("/admin/dashboard"));
      expect(error.kind).toBe(kind);
      expect(error.isSessionExpired).toBe(false);
    }
  });

  it("trata un 500 como error de servidor", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 500));

    const error = await expectApiError(apiFetch("/admin/dashboard"));

    expect(error.kind).toBe("server");
  });

  it("convierte un fallo de red en un error comprensible", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const error = await expectApiError(me());

    expect(error.kind).toBe("network");
    expect(error.message).toMatch(/conexión/i);
  });

  it("propaga la cancelación sin convertirla en error de red", async () => {
    fetchMock.mockRejectedValue(
      new DOMException("aborted", "AbortError")
    );

    const error = await me().catch((cause: unknown) => cause);

    expect(error).toBeInstanceOf(DOMException);
    expect((error as DOMException).name).toBe("AbortError");
  });

  it("rechaza una respuesta con forma inesperada", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ usuario: "otra cosa" }));

    const error = await expectApiError(me());

    expect(error.kind).toBe("malformed");
  });

  it("no filtra detalles internos en el mensaje", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: "ECONNREFUSED 10.0.0.5:5432" }, 500)
    );

    const error = await expectApiError(apiFetch("/admin/dashboard"));

    expect(error.message).not.toContain("10.0.0.5");
  });
});

function user() {
  return {
    id: "1",
    email: "jefe@example.com",
    name: "Jefe",
    role: "OWNER" as const,
  };
}

describe("autenticación", () => {
  it("valida la forma del usuario devuelto por el login", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ user: user() }));

    const response = await login("jefe@example.com", "secreta");

    expect(response.user.role).toBe("OWNER");
  });

  it("rechaza un rol desconocido", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ user: { ...user(), role: "ADMIN" } })
    );

    const error = await expectApiError(login("a@b.com", "x"));

    expect(error.kind).toBe("malformed");
  });

  it("currentUser devuelve null en lugar de lanzar cuando no hay sesión", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: "unauthorized" }, 401));

    await expect(currentUser()).resolves.toBeNull();
  });

  it("currentUser devuelve el usuario cuando la sesión es válida", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ user: user() }));

    await expect(currentUser()).resolves.toMatchObject({ role: "OWNER" });
  });

  it("logout llama al endpoint correcto por POST", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ loggedOut: true, revoked: true })
    );

    await logout();

    const [url, init] = callAt(0);

    expect(url).toBe("/api/admin/auth/logout");
    expect(init.method).toBe("POST");
  });
});

describe("dashboard", () => {
  const payload = {
    totals: { customers: 2, vehicles: 3, conversations: 4, requests: 5 },
    requestsByStatus: { COLLECTING: 1, HUMAN: 2, CLOSED: 2 },
    requestsByServiceType: {
      REPROGRAMMING: 1,
      ECU_REPAIR: 1,
      ECU_CLONING: 1,
      OTHER: 1,
      UNKNOWN: 1,
    },
    attention: { waitingForHuman: 2, stillCollecting: 1 },
    activity: { requestsCreatedLast7Days: 3, requestsActiveLast24Hours: 1 },
    recentRequests: [],
  };

  it("pide el endpoint del panel", async () => {
    fetchMock.mockResolvedValue(jsonResponse(payload));

    const data = await getDashboard();

    expect(callAt(0)[0]).toBe("/api/admin/dashboard");
    expect(data.totals.requests).toBe(5);
  });

  it("rechaza un resumen incompleto", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ totals: {} }));

    const error = await expectApiError(getDashboard());

    expect(error.kind).toBe("malformed");
  });
});
