import { defineConfig } from "vitest/config";

/*
 * Pruebas unitarias: usan dobles y no tocan PostgreSQL.
 * Las de integración quedan fuera a propósito; se lanzan con su propia
 * configuración desde scripts/integration-test.sh.
 */
export default defineConfig({
  test: {
    include: ["test/*.test.ts"],
  },
});
