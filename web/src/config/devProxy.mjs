/**
 * Proxy de /api en desarrollo.
 *
 * Por defecto NO se configura ningún proxy: sin variable no hay destino, de
 * modo que `npm run dev` no puede alcanzar por accidente el backend real que
 * escucha en 127.0.0.1:3000.
 *
 * Para trabajar contra un backend aislado:
 *   DEV_API_PROXY_TARGET=http://127.0.0.1:3100 npm run dev
 *
 * Sin proxy, las llamadas del panel devuelven 404 y la interfaz muestra su
 * estado de error: la web pública funciona igual, porque no usa la API.
 */

/** Solo se admiten destinos locales explícitos. */
function isAllowedTarget(value) {
  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    return ["localhost", "127.0.0.1", "[::1]", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Devuelve la configuración `server.proxy` de Vite, o undefined si no debe
 * haber proxy alguno.
 */
export function buildDevProxy(env = process.env) {
  const target = env.DEV_API_PROXY_TARGET;

  if (!target) {
    return undefined;
  }

  if (!isAllowedTarget(target)) {
    throw new Error(
      `DEV_API_PROXY_TARGET no es un destino local válido: "${target}". ` +
        "Usa una URL http(s) hacia localhost o 127.0.0.1."
    );
  }

  return {
    "/api": {
      target,
      changeOrigin: false,
    },
  };
}
