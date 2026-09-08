/*
 * Defensa contra apuntar las pruebas de integración a una base que no sea
 * desechable. Estas pruebas BORRAN Y REESCRIBEN datos: si por una variable
 * mal puesta apuntaran a producción, el daño sería irreversible.
 *
 * Se ejecuta al importar el módulo, antes de que ninguna prueba arranque.
 */

const REQUIRED_MARKER = "itest";

/*
 * Cualquier parecido con los identificadores de producción aborta la
 * ejecución, aunque la marca de pruebas también estuviera presente.
 */
const FORBIDDEN_FRAGMENTS = [
  "taller_ecu",
  "taller_app",
  "taller-postgres",
  "taller-backend",
  "taller-network",
  "/opt/taller-ecu",
];

function fail(reason: string): never {
  throw new Error(
    `Pruebas de integración abortadas: ${reason}. ` +
      "Solo pueden ejecutarse contra una base desechable cuyo nombre, " +
      `usuario y host contengan "${REQUIRED_MARKER}".`
  );
}

export function assertDisposableDatabase(
  env: NodeJS.ProcessEnv = process.env
): void {
  const host = env.DB_HOST ?? "";
  const name = env.DB_NAME ?? "";
  const user = env.DB_USER ?? "";

  if (!host || !name || !user) {
    fail("faltan DB_HOST, DB_NAME o DB_USER");
  }

  for (const [label, value] of [
    ["DB_HOST", host],
    ["DB_NAME", name],
    ["DB_USER", user],
  ] as const) {
    const lowered = value.toLowerCase();

    if (!lowered.includes(REQUIRED_MARKER)) {
      fail(`${label}="${value}" no contiene "${REQUIRED_MARKER}"`);
    }

    for (const forbidden of FORBIDDEN_FRAGMENTS) {
      if (lowered.includes(forbidden)) {
        fail(`${label}="${value}" contiene un identificador de producción`);
      }
    }
  }

  const url = env.DATABASE_URL ?? "";

  if (url) {
    const lowered = url.toLowerCase();

    if (!lowered.includes(REQUIRED_MARKER)) {
      fail('DATABASE_URL no contiene "itest"');
    }

    for (const forbidden of FORBIDDEN_FRAGMENTS) {
      if (lowered.includes(forbidden)) {
        fail("DATABASE_URL contiene un identificador de producción");
      }
    }
  }
}

assertDisposableDatabase();
