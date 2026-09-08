import { hash, verify } from "@node-rs/argon2";

/*
 * 2 = Argon2id en @node-rs/argon2. Se escribe como literal en lugar de
 * importar el enum: es un `const enum` de TypeScript, y depender de él
 * ataría el runtime a cómo lo transpile cada herramienta.
 *
 * Parámetros recomendados por OWASP para Argon2id:
 * 19 MiB de memoria, 2 iteraciones, paralelismo 1.
 */
const ARGON2_OPTIONS = {
  algorithm: 2,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(
  digest: string,
  plain: string
): Promise<boolean> {
  try {
    return await verify(digest, plain, ARGON2_OPTIONS);
  } catch {
    // Un hash corrupto o de otro algoritmo no debe tumbar el login.
    return false;
  }
}

/*
 * Hash real contra el que verificar cuando el email no existe, de forma que
 * el login tarde lo mismo exista la cuenta o no. Se calcula una sola vez y
 * de forma perezosa: si nadie falla el login, no cuesta nada.
 */
let dummyHashPromise: Promise<string> | null = null;

function getDummyHash(): Promise<string> {
  if (!dummyHashPromise) {
    dummyHashPromise = hashPassword(
      "contrasena-inexistente-para-igualar-tiempos"
    );
  }

  return dummyHashPromise;
}

export async function wastePasswordVerification(
  plain: string
): Promise<void> {
  await verifyPassword(await getDummyHash(), plain);
}
