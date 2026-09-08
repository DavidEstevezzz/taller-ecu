/**
 * Normaliza una ruta a la forma que sirve el servidor.
 *
 * Con `build.format: "file"`, `Astro.url.pathname` trae la extensión durante
 * la compilación ("/servicios/reparacion-ecu.html"), y la dirección pública no
 * la lleva. Comparar sin normalizar da siempre falso, que es exactamente lo
 * que le pasaba a la cabecera: `aria-current="page"` no llegaba nunca al HTML
 * generado, aunque en desarrollo se viera bien.
 *
 * Política del sitio: sin barra final, salvo la portada, que es "/".
 */
export function normalisePath(value: string): string {
  let result = value;

  if (result.endsWith("/index.html")) {
    result = result.slice(0, -"index.html".length);
  } else if (result.endsWith(".html")) {
    result = result.slice(0, -".html".length);
  }

  if (result.length > 1 && result.endsWith("/")) {
    result = result.slice(0, -1);
  }

  return result === "" ? "/" : result;
}
