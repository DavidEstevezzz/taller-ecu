/**
 * Traza el camino de `SymptomRoute.astro` — /servicios/diagnostico-dtc.
 *
 * Qué hace: dibujar el camino del caso elegido en lugar de servirlo hecho, y
 * encender la unidad cuando la señal llega. Nada más. No conduce el
 * desplazamiento, no fija la página y no reproduce en bucle.
 *
 * Qué NO hace falta que haga, y por eso el archivo es corto: **elegir el caso
 * no es cosa suya**. Eso lo hace un grupo de radios con `:checked ~`, que
 * funciona con el JavaScript apagado. Este archivo solo se entera de cuál
 * está marcado para saber qué camino animar.
 *
 * Se dispara en dos momentos y solo en esos dos: la primera vez que el
 * tablero entra en pantalla, y cada vez que el visitante cambia de caso.
 *
 * Por qué la Web Animations API y no una transición CSS: al cambiar de caso
 * hay que **reiniciar** el trazado, y reiniciar una transición obliga a
 * forzar un reflujo entre dos escrituras de estilo. `animate()` se cancela y
 * se relanza limpiamente, y el navegador la interrumpe sola si llega otra.
 *
 * Cómo degrada:
 *
 *   sin JavaScript      → este archivo no se ejecuta, `is-driven` no se pone,
 *                         el camino se sirve trazado y la unidad encendida.
 *   movimiento reducido → tampoco se ejecuta: `js-anim` no está. El selector
 *                         sigue funcionando, que es lo que importa.
 *
 * Sin dependencias: un IntersectionObserver y dos animaciones.
 */

const root = document.querySelector<HTMLElement>("[data-symptom-route]");

if (root && document.documentElement.classList.contains("js-anim")) {
  const radios = Array.from(
    root.querySelectorAll<HTMLInputElement>(".sr-radio")
  );
  const paths = Array.from(
    root.querySelectorAll<SVGPathElement>(".sr-routes > path")
  );
  const pulse = root.querySelector<SVGCircleElement>(".sr-pulse");
  const board = root.querySelector<HTMLElement>(".sr-board");

  /** Lo que tarda la señal en cruzar el tablero. */
  const DRAW_MS = 900;

  let running: Animation | null = null;
  let timer = 0;
  /** El trazado automático se cancela si el visitante se adelanta. */
  let started = false;

  /**
   * Deja el tablero en su punto de partida: camino sin trazar y unidad
   * apagada. Se llama **al cargar**, no al entrar en pantalla, para que el
   * dibujo nazca vacío por debajo del pliegue en lugar de pintarse entero y
   * saltar a cero justo cuando el visitante lo está mirando.
   */
  function prime(): void {
    root!.classList.add("is-driven");
  }

  function draw(): void {
    const index = radios.findIndex((radio) => radio.checked);
    const path = paths[index];
    if (!path) return;

    started = true;
    running?.cancel();

    if (timer) {
      window.clearTimeout(timer);
      timer = 0;
    }

    root!.removeAttribute("data-arrived");
    prime();

    running = path.animate(
      [{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }],
      { duration: DRAW_MS, easing: "linear", fill: "forwards" }
    );

    /* La entrada late una vez: la señal empieza ahí, no en cualquier sitio. */
    pulse?.animate(
      [
        { opacity: 0.7, transform: "scale(1)" },
        { opacity: 0, transform: "scale(2.4)" },
      ],
      { duration: 700, easing: "cubic-bezier(0.2, 0, 0, 1)" }
    );

    timer = window.setTimeout(() => {
      root!.setAttribute("data-arrived", "");
      timer = 0;
    }, DRAW_MS);
  }

  for (const radio of radios) {
    radio.addEventListener("change", () => {
      if (radio.checked) draw();
    });
  }

  prime();

  /*
   * La primera pasada espera a que el tablero esté a la vista: arrancarla
   * antes significaría que el visitante se lo encuentra ya trazado, que es
   * exactamente lo mismo que no haberla hecho.
   */
  if (typeof IntersectionObserver === "undefined" || !board) {
    draw();
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          /* Si el visitante ya ha elegido un caso, la pasada automática
             sobra: reiniciarla le quitaría de las manos lo que acaba de
             pedir. */
          window.setTimeout(() => {
            if (!started) draw();
          }, 200);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(board);
  }
}

export {};
