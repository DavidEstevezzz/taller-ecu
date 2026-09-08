import type { APIRoute } from "astro";
import { SITE_URL } from "../config/domain.mjs";

/**
 * robots.txt generado, para que el dominio salga de la configuración
 * central y no se escriba a mano.
 *
 * El bloqueo de /admin es una señal para buscadores, no una medida de
 * seguridad: la protección real es la sesión del backend.
 *
 * El de /conceptos es una señal y nada más: ahí viven maquetas internas de
 * dirección visual, que además llevan `noindex, nofollow`, quedan fuera del
 * sitemap y no están enlazadas desde ninguna página pública.
 */
export const GET: APIRoute = () => {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /conceptos",
    "",
    `Sitemap: ${new URL("/sitemap-index.xml", SITE_URL).href}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
