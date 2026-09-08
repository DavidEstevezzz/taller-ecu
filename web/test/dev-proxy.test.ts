/**
 * Protege el aislamiento del backend: el servidor de desarrollo no debe
 * apuntar a ningún backend salvo que se le indique explícitamente.
 */
import { describe, expect, it } from "vitest";

import { buildDevProxy } from "../src/config/devProxy.mjs";

describe("proxy de desarrollo", () => {
  it("no configura ningún proxy sin la variable", () => {
    expect(buildDevProxy({})).toBeUndefined();
  });

  it("no cae por defecto al backend de producción", () => {
    expect(JSON.stringify(buildDevProxy({}) ?? null)).not.toContain("3000");
  });

  it("usa exclusivamente el destino indicado", () => {
    const proxy = buildDevProxy({
      DEV_API_PROXY_TARGET: "http://127.0.0.1:3100",
    });

    expect(proxy).toEqual({
      "/api": { target: "http://127.0.0.1:3100", changeOrigin: false },
    });
  });

  it("rechaza destinos que no sean locales", () => {
    for (const target of [
      "http://backend.produccion.example",
      "https://jmreprocars.com",
      "http://10.0.0.5:3000",
    ]) {
      expect(() => buildDevProxy({ DEV_API_PROXY_TARGET: target })).toThrow(
        /destino local/i
      );
    }
  });

  it("rechaza un valor que no es una URL", () => {
    expect(() =>
      buildDevProxy({ DEV_API_PROXY_TARGET: "127.0.0.1:3100" })
    ).toThrow();
  });
});
