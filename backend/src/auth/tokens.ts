import { createHash, randomBytes } from "node:crypto";

/*
 * 32 bytes de entropía criptográfica. El token viaja en la cookie y nunca
 * se guarda: en PostgreSQL solo vive su SHA-256.
 *
 * SHA-256 basta aquí (a diferencia de las contraseñas) porque el token es
 * aleatorio y de alta entropía: no es adivinable por fuerza bruta.
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
