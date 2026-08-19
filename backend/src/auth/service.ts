import {
  LOGIN_MAX_FAILURES_PER_IDENTIFIER,
  LOGIN_MAX_FAILURES_PER_IP,
  LOGIN_WINDOW_MS,
  SESSION_TTL_MS,
} from "./config.js";

import {
  hashPassword,
  verifyPassword,
  wastePasswordVerification,
} from "./passwords.js";

import { generateSessionToken, hashSessionToken } from "./tokens.js";

import * as repository from "./repository.js";
import type { UserRole, UserRow } from "./repository.js";

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type LoginResult =
  | {
      ok: true;
      user: PublicUser;
      token: string;
      expiresAt: Date;
    }
  | {
      ok: false;
      reason: "invalid_credentials" | "rate_limited";
    };

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function toPublicUser(user: UserRow): PublicUser {
  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function login(input: {
  email: string;
  password: string;
  ipAddress: string | null;
}): Promise<LoginResult> {
  const identifier = normalizeEmail(input.email);
  const ipAddress = input.ipAddress;

  const since = new Date(Date.now() - LOGIN_WINDOW_MS);

  const failures = await repository.countRecentLoginFailures({
    identifier,
    ipAddress,
    since,
  });

  if (
    failures.byIdentifier >= LOGIN_MAX_FAILURES_PER_IDENTIFIER ||
    failures.byIpAddress >= LOGIN_MAX_FAILURES_PER_IP
  ) {
    return { ok: false, reason: "rate_limited" };
  }

  const user = await repository.findUserByEmail(identifier);

  /*
   * Si el email no existe se verifica igualmente contra un hash ficticio:
   * así el tiempo de respuesta no revela qué cuentas están dadas de alta.
   */
  if (!user) {
    await wastePasswordVerification(input.password);

    await repository.recordLoginAttempt({
      identifier,
      ipAddress,
      succeeded: false,
    });

    return { ok: false, reason: "invalid_credentials" };
  }

  const passwordMatches = await verifyPassword(
    user.password_hash,
    input.password
  );

  /*
   * Una cuenta desactivada devuelve exactamente el mismo error que una
   * contraseña incorrecta, para no filtrar el estado de la cuenta.
   */
  if (!passwordMatches || !user.is_active) {
    await repository.recordLoginAttempt({
      identifier,
      ipAddress,
      succeeded: false,
    });

    return { ok: false, reason: "invalid_credentials" };
  }

  await repository.recordLoginAttempt({
    identifier,
    ipAddress,
    succeeded: true,
  });

  await repository.clearLoginFailures(identifier);

  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await repository.insertSession({
    userId: String(user.id),
    tokenHash: hashSessionToken(token),
    expiresAt,
  });

  return {
    ok: true,
    user: toPublicUser(user),
    token,
    expiresAt,
  };
}

/*
 * Resuelve el token de la cookie a un usuario.
 * Repite en código las comprobaciones que ya hace el SQL: si alguna vez la
 * consulta cambia, la sesión caducada o revocada sigue sin ser válida.
 */
export async function authenticate(
  token: string
): Promise<PublicUser | null> {
  if (!token) {
    return null;
  }

  const found = await repository.findSessionWithUser(
    hashSessionToken(token)
  );

  if (!found) {
    return null;
  }

  if (found.session.revoked_at) {
    return null;
  }

  const expiresAt = new Date(found.session.expires_at).getTime();

  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return null;
  }

  if (!found.user.is_active) {
    return null;
  }

  return toPublicUser(found.user);
}

export async function logout(token: string): Promise<boolean> {
  if (!token) {
    return false;
  }

  const revoked = await repository.revokeSessionByTokenHash(
    hashSessionToken(token)
  );

  return revoked > 0;
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}): Promise<PublicUser> {
  const email = normalizeEmail(input.email);

  const existing = await repository.findUserByEmail(email);

  if (existing) {
    throw new Error(`Ya existe un usuario con el email ${email}`);
  }

  const passwordHash = await hashPassword(input.password);

  const created = await repository.insertUser({
    email,
    name: input.name.trim(),
    passwordHash,
    role: input.role,
  });

  return toPublicUser(created);
}
