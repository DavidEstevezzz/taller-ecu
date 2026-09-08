import { db } from "../db.js";

export type UserRole = "OWNER" | "EMPLOYEE";

export type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type SessionRow = {
  id: string;
  user_id: string;
  expires_at: Date;
  revoked_at: Date | null;
};

export type SessionWithUser = {
  session: SessionRow;
  user: UserRow;
};

export async function findUserByEmail(
  email: string
): Promise<UserRow | null> {
  const result = await db.query(
    `
      SELECT *
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function insertUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  role: UserRole;
}): Promise<UserRow> {
  const result = await db.query(
    `
      INSERT INTO users (
        email,
        name,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [input.email, input.name, input.passwordHash, input.role]
  );

  return result.rows[0];
}

export async function countUsers(): Promise<number> {
  const result = await db.query(
    `
      SELECT COUNT(*)::int AS total
      FROM users
    `
  );

  return result.rows[0]?.total ?? 0;
}

export async function insertSession(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<SessionRow> {
  const result = await db.query(
    `
      INSERT INTO sessions (
        user_id,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3)
      RETURNING id, user_id, expires_at, revoked_at
    `,
    [input.userId, input.tokenHash, input.expiresAt]
  );

  return result.rows[0];
}

/*
 * El filtro de caducidad y revocación se aplica también aquí, en SQL,
 * además de en el servicio: dos capas para el mismo invariante.
 */
export async function findSessionWithUser(
  tokenHash: string
): Promise<SessionWithUser | null> {
  const result = await db.query(
    `
      SELECT
        s.id            AS session_id,
        s.user_id       AS session_user_id,
        s.expires_at    AS session_expires_at,
        s.revoked_at    AS session_revoked_at,

        u.id            AS user_id,
        u.email         AS user_email,
        u.name          AS user_name,
        u.password_hash AS user_password_hash,
        u.role          AS user_role,
        u.is_active     AS user_is_active,
        u.created_at    AS user_created_at,
        u.updated_at    AS user_updated_at

      FROM sessions s
      INNER JOIN users u
        ON u.id = s.user_id

      WHERE s.token_hash = $1
        AND s.revoked_at IS NULL
        AND s.expires_at > CURRENT_TIMESTAMP

      LIMIT 1
    `,
    [tokenHash]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    session: {
      id: row.session_id,
      user_id: row.session_user_id,
      expires_at: row.session_expires_at,
      revoked_at: row.session_revoked_at,
    },
    user: {
      id: row.user_id,
      email: row.user_email,
      name: row.user_name,
      password_hash: row.user_password_hash,
      role: row.user_role,
      is_active: row.user_is_active,
      created_at: row.user_created_at,
      updated_at: row.user_updated_at,
    },
  };
}

export async function revokeSessionByTokenHash(
  tokenHash: string
): Promise<number> {
  const result = await db.query(
    `
      UPDATE sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE token_hash = $1
        AND revoked_at IS NULL
    `,
    [tokenHash]
  );

  return result.rowCount ?? 0;
}

export async function countRecentLoginFailures(input: {
  identifier: string;
  ipAddress: string | null;
  since: Date;
}): Promise<{ byIdentifier: number; byIpAddress: number }> {
  const result = await db.query(
    `
      SELECT
        COUNT(*) FILTER (
          WHERE identifier = $1
        )::int AS by_identifier,

        COUNT(*) FILTER (
          WHERE $2::text IS NOT NULL
            AND ip_address = $2
        )::int AS by_ip_address

      FROM login_attempts
      WHERE succeeded = false
        AND created_at > $3
    `,
    [input.identifier, input.ipAddress, input.since]
  );

  return {
    byIdentifier: result.rows[0]?.by_identifier ?? 0,
    byIpAddress: result.rows[0]?.by_ip_address ?? 0,
  };
}

export async function recordLoginAttempt(input: {
  identifier: string;
  ipAddress: string | null;
  succeeded: boolean;
}): Promise<void> {
  await db.query(
    `
      INSERT INTO login_attempts (
        identifier,
        ip_address,
        succeeded
      )
      VALUES ($1, $2, $3)
    `,
    [input.identifier, input.ipAddress, input.succeeded]
  );
}

/*
 * Tras un login correcto se limpian los fallos previos de ese email, para
 * que un usuario legítimo no arrastre un bloqueo que ya ha superado.
 */
export async function clearLoginFailures(
  identifier: string
): Promise<void> {
  await db.query(
    `
      DELETE FROM login_attempts
      WHERE identifier = $1
        AND succeeded = false
    `,
    [identifier]
  );
}
