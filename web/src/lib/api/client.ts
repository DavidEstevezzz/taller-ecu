/**
 * Capa HTTP única del panel.
 *
 * Reglas que no se rompen:
 *  - Base relativa `/api`. Nunca una IP ni un dominio codificado: el panel
 *    se sirve desde el mismo origen que la API.
 *  - `credentials: "include"`, porque la sesión viaja en una cookie HttpOnly.
 *  - Ningún token en localStorage ni sessionStorage. No hay token que
 *    guardar: el navegador nunca lo ve.
 *  - El 401 tiene su propio tipo de error para que la interfaz distinga
 *    "no has iniciado sesión" de "algo ha fallado".
 */

export const API_BASE = "/api";

export type ApiErrorKind =
  | "unauthorized"
  | "not_found"
  | "rate_limited"
  | "validation"
  | "server"
  | "network"
  | "malformed";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;
  readonly code: string | null;

  constructor(
    kind: ApiErrorKind,
    message: string,
    status = 0,
    code: string | null = null
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
  }

  /** true cuando conviene mandar al usuario de vuelta al login. */
  get isSessionExpired(): boolean {
    return this.kind === "unauthorized";
  }
}

function kindForStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 404) return "not_found";
  if (status === 429) return "rate_limited";
  if (status === 400 || status === 422) return "validation";
  return "server";
}

/** Mensajes en castellano, comprensibles, sin filtrar detalles internos. */
const MESSAGES: Record<ApiErrorKind, string> = {
  unauthorized: "Tu sesión no es válida o ha caducado.",
  not_found: "No hemos encontrado lo que buscabas.",
  rate_limited:
    "Demasiados intentos seguidos. Espera unos minutos y vuelve a probar.",
  validation: "Revisa los datos introducidos.",
  server: "El servidor no ha podido completar la petición.",
  network: "No hemos podido conectar. Comprueba tu conexión.",
  malformed: "La respuesta del servidor no tiene el formato esperado.",
};

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  signal?: AbortSignal;
  /** Valida y estrecha la respuesta. Si devuelve false, se lanza `malformed`. */
  validate?: (data: unknown) => boolean;
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, signal, validate } = options;

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      // La cookie de sesión es HttpOnly: sin esto no viaja.
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new ApiError("network", MESSAGES.network);
  }

  let payload: unknown = null;

  if (response.status !== 204) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const kind = kindForStatus(response.status);

    const code =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof (payload as { error: unknown }).error === "string"
        ? (payload as { error: string }).error
        : null;

    throw new ApiError(kind, MESSAGES[kind], response.status, code);
  }

  if (validate && !validate(payload)) {
    throw new ApiError("malformed", MESSAGES.malformed, response.status);
  }

  return payload as T;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
