/**
 * Recursos externos incrustados.
 *
 * La web pública no hace peticiones a terceros por norma. Este archivo es la
 * lista completa de las excepciones, y hoy solo tiene una. Si algún día hay
 * dos, siguen viviendo aquí: ninguna URL de tercero se escribe dentro de un
 * componente.
 *
 * ── Configurador de Tuning-shop.com ────────────────────────────────────────
 *
 * Es el mismo recurso que ya usa la web antigua del cliente. El identificador
 * de cuenta (6898) aparece públicamente en el HTML de esa web; no es un
 * secreto y no da acceso a nada.
 *
 * Lo comprobado sobre él, con fecha 2026-08-20:
 *
 * - **Valida el `Referer`.** Sin una cabecera `Referer` de un dominio dado de
 *   alta responde `404` con el texto «Domain could not be validated - please
 *   check your referrer settings». `https://jmreprocars.com/` sí está dado de
 *   alta; `localhost` y `127.0.0.1` **no**, así que el configurador **no se
 *   puede probar en desarrollo** (ver `docs/embed-tuning-shop.md`).
 * - **No envía `X-Frame-Options` ni `frame-ancestors`**: el marcado no está
 *   bloqueado por cabeceras, la única puerta es el `Referer`.
 * - **Deja una cookie de sesión PHP de tercero** (`HttpOnly`). Por eso no se
 *   carga solo: hace falta que el visitante lo active.
 * - **Solo pide recursos a `tuning-shop.com`** (su CSS, su JS y sus fuentes).
 *   Ni Google Fonts, ni analítica, ni ningún otro dominio.
 * - **`https://tuning-shop.com/demo/` NO sirve como destino de un enlace.**
 *   Comprobado en navegador el 2026-08-28: responde 200, pero es una página de
 *   su tienda —cabecera comercial, carrito, muro de cookies de Cookiebot con
 *   las cuatro categorías activadas y Google Tag Manager— y el selector que
 *   incrusta usa **la cuenta de demostración del proveedor (`user=177`)**, no
 *   la del cliente. El único destino honesto sería este mismo `src`.
 * - **Un enlace saliente hacia él no puede llevar `rel="noreferrer"`**: suprime
 *   la cabecera `Referer`, que es justo lo que el proveedor valida. Hoy no hay
 *   ningún enlace saliente —el botón «Calcular mejora» es un ancla interna que
 *   baja hasta el marco—, pero si alguna vez lo hay, esto es lo que rompe.
 * - **Incluye `iframe-resizer` v4** en su lado (protocolo `[iFrameSizer]`), que
 *   es el mecanismo documentado para que el marco crezca solo cuando se pasa
 *   del selector al resultado.
 * - **No emite la selección del visitante** por `postMessage`: los únicos
 *   mensajes son los de tamaño. No podemos leer qué vehículo ha elegido, así
 *   que la plantilla de WhatsApp es genérica y la rellena la persona.
 */

/** Cuenta del cliente en Tuning-shop.com. Público: está en su web actual. */
export const TUNING_SHOP_USER = "6898";

export const TUNING_SHOP = {
  /** Nombre del proveedor. La atribución no se oculta nunca. */
  provider: "Tuning-shop.com",
  providerUrl: "https://tuning-shop.com/",
  /** Origen exacto, para `connect-src`/`frame-src` cuando exista un proxy. */
  origin: "https://tuning-shop.com",
  /** La URL del marco. No la escribas en ninguna plantilla: impórtala. */
  src: `https://tuning-shop.com/iframe/iframe.php?user=${TUNING_SHOP_USER}`,
  /**
   * Altura de partida, en píxeles. Es solo una red de seguridad: si
   * `iframe-resizer` responde, manda él. Si no responde —proveedor caído,
   * dominio no autorizado, script bloqueado— el marco se queda en esta altura
   * y desplaza por dentro, en vez de colapsar a cero.
   */
  minHeight: 620,
} as const;
