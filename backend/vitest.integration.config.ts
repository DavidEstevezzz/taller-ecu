import { defineConfig } from "vitest/config";

/*
 * Pruebas de integración contra una instancia PostgreSQL desechable.
 * No se ejecutan con `npm test`: requieren la base levantada por
 * scripts/integration-test.sh.
 */
export default defineConfig({
  test: {
    include: ["test/integration/*.test.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
});
