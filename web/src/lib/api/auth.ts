import { apiFetch, isRecord } from "./client.js";
import type {
  AdminUser,
  LoginResponse,
  LogoutResponse,
  MeResponse,
} from "./types.js";

/** Comprueba que la respuesta trae un usuario con la forma esperada. */
function hasUser(data: unknown): boolean {
  if (!isRecord(data) || !isRecord(data.user)) {
    return false;
  }

  const user = data.user;

  return (
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    typeof user.name === "string" &&
    (user.role === "OWNER" || user.role === "EMPLOYEE")
  );
}

export function login(
  email: string,
  password: string,
  signal?: AbortSignal
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/admin/auth/login", {
    method: "POST",
    body: { email, password },
    validate: hasUser,
    signal,
  });
}

export function logout(signal?: AbortSignal): Promise<LogoutResponse> {
  return apiFetch<LogoutResponse>("/admin/auth/logout", {
    method: "POST",
    signal,
  });
}

export function me(signal?: AbortSignal): Promise<MeResponse> {
  return apiFetch<MeResponse>("/admin/auth/me", {
    validate: hasUser,
    signal,
  });
}

/**
 * Versión tolerante de `me` para comprobar si ya hay sesión.
 * Devuelve null en lugar de lanzar cuando no la hay: no es un error,
 * es el caso normal de alguien que aún no ha entrado.
 */
export async function currentUser(
  signal?: AbortSignal
): Promise<AdminUser | null> {
  try {
    const response = await me(signal);
    return response.user;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    return null;
  }
}
