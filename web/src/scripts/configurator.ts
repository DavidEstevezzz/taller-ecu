/**
 * Carga bajo demanda del configurador de Tuning-shop.com.
 *
 * Reglas que cumple:
 *
 * - **Nada de terceros hasta que el visitante lo pide.** Ninguna petición a
 *   `tuning-shop.com`, ninguna cookie suya, ningún coste en la carga inicial.
 * - **El redimensionador se descarga también bajo demanda**, en su propio
 *   trozo: quien no abra el configurador no paga sus ~15 kB.
 * - **Si el proveedor no contesta, la página no se rompe.** El marco conserva
 *   la altura mínima del CSS y aparece un aviso con salida por WhatsApp.
 * - **No se toca el DOM interior del marco.** Es otro origen; lo único que
 *   cruza la frontera son los mensajes de tamaño de `iframe-resizer`, que es
 *   el mecanismo que el propio proveedor incluye en su lado.
 */

const root = document.querySelector<HTMLElement>("[data-configurator]");

if (root) {
  const link = root.querySelector<HTMLAnchorElement>("[data-configurator-open]");
  const intro = root.querySelector<HTMLElement>("[data-configurator-intro]");
  const host = root.querySelector<HTMLElement>("[data-configurator-frame]");
  const src = root.dataset.src;
  const minHeight = Number(root.dataset.minHeight) || 620;

  /**
   * Aviso de que el recurso externo no ha respondido.
   *
   * Cubre los dos casos que sabemos que existen, sin poder distinguirlos desde
   * aquí —son otro origen—: que el proveedor esté caído y que el dominio desde
   * el que miramos no esté dado de alta en su cuenta. Lo segundo es lo que
   * ocurre siempre en desarrollo.
   */
  function buildNotice(): HTMLElement {
    const local = /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/.test(
      window.location.hostname
    );

    const notice = document.createElement("div");
    notice.className =
      "border-t border-border-inverse bg-surface-inverse px-5 py-6 sm:px-7";
    notice.setAttribute("role", "status");

    const title = local
      ? "En desarrollo el configurador no carga."
      : "El configurador no ha respondido.";

    const body = local
      ? "Tuning-shop.com solo sirve el configurador a los dominios dados de " +
        "alta en la cuenta del cliente, y localhost no lo está. Esto es lo " +
        "esperado aquí: no dice nada sobre cómo se comportará en producción."
      : "Puede ser una caída temporal de Tuning-shop.com o un bloqueador del " +
        "navegador. Las cifras que muestra son en todo caso orientativas: " +
        "para saber qué se puede hacer con tu vehículo, escríbenos.";

    notice.innerHTML =
      '<p class="text-sm font-medium text-ink-inverse"></p>' +
      '<p class="mt-2 max-w-prose text-sm leading-relaxed text-ink-inverse-muted"></p>';

    const [titleEl, bodyEl] = notice.querySelectorAll("p");
    titleEl!.textContent = title;
    bodyEl!.textContent = body;

    return notice;
  }

  const activate = (event: Event): void => {
    if (!src || !host || !intro) return;

    // Con teclas modificadoras se respeta el enlace: abrir en pestaña nueva
    // sigue siendo una opción legítima.
    const mouse = event as MouseEvent;
    if (mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.button > 0) {
      return;
    }

    event.preventDefault();
    link?.removeEventListener("click", activate);

    const frame = document.createElement("iframe");
    frame.src = src;
    frame.title = "Configurador de reprogramación de Tuning-shop.com";
    frame.className = "block w-full border-0";
    frame.style.minHeight = `${minHeight}px`;
    frame.style.height = `${minHeight}px`;
    /*
     * El proveedor valida el `Referer`. La política por defecto ya envía el
     * origen, pero se fija aquí para que una política más estricta puesta
     * mañana a nivel de documento no deje el configurador en un 404.
     */
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    /*
     * Caja de arena conservadora: puede ejecutar su JavaScript, usar su propio
     * origen y sus formularios, y abrir enlaces; no puede navegar nuestra
     * ventana. **No verificado contra el proveedor**, porque en desarrollo no
     * sirve el contenido: ver docs/embed-tuning-shop.md.
     */
    frame.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
    );

    intro.hidden = true;
    host.classList.remove("hidden");
    host.appendChild(frame);

    // El foco va al marco recién insertado: quien navega con teclado tiene que
    // aterrizar en lo que acaba de pedir, no volver al principio de la página.
    frame.setAttribute("tabindex", "-1");
    frame.focus({ preventScroll: true });

    let settled = false;

    /*
     * `iframe-resizer` v4, que es lo que el proveedor incluye en su lado. Se
     * importa aquí para que Vite lo separe en su propio trozo y solo se
     * descargue al abrir el configurador.
     */
    void import("iframe-resizer/js/iframeResizer.js")
      .then(({ default: iFrameResize }) => {
        if (typeof iFrameResize !== "function") return;

        iFrameResize(
          {
            log: false,
            // Solo se aceptan mensajes del origen del proveedor. Nunca `false`.
            checkOrigin: [new URL(src).origin],
            minHeight,
            // Si el marco reporta menos de lo que ocupa, mejor sobrar que
            // recortar el resultado.
            tolerance: 8,
            onInit: () => {
              settled = true;
            },
          },
          frame
        );
      })
      .catch(() => {
        /* Sin redimensionador el marco se queda en la altura mínima. */
      });

    /*
     * Si a los ocho segundos no ha habido saludo de tamaño, damos por hecho que
     * no hay contenido servible y lo decimos. No se retira el marco: puede que
     * simplemente vaya lento, y quitarlo sería peor.
     */
    window.setTimeout(() => {
      if (settled || !root) return;
      root.appendChild(buildNotice());
    }, 8000);
  };

  link?.addEventListener("click", activate);
}

// Marca el archivo como módulo: si no, sus constantes viven en el ámbito
// global y chocan con las del otro script.
export {};
