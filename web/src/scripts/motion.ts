/**
 * Movimiento de la web pública.
 *
 * Cinco cosas, ninguna imprescindible:
 *
 *   1. Revelado al entrar en pantalla (`.reveal`, diagramas, trazados).
 *   2. Medida y trazado de la pista de cobre del proceso.
 *   3. Paralaje por puntero sobre el despiece del hero.
 *   4. Cierre de los menús de la cabecera al pulsar fuera o con Escape.
 *   5. Marcado de la profundidad activa en el raíl de /servicios.
 *
 * Reglas que se respetan aquí:
 *
 * - Nada de esto se ejecuta si el visitante ha pedido menos movimiento: el
 *   interruptor `.js-anim` lo pone el script en línea del <head> y este
 *   módulo lo comprueba antes de tocar nada.
 * - Nada de esto es necesario para leer la página. Los elementos solo se
 *   esconden bajo `.js-anim`; si este archivo no llega a cargarse, el
 *   contenido ya está visible.
 * - Sin dependencias. IntersectionObserver y rAF bastan; una librería de
 *   animación serían decenas de kilobytes para hacer aparecer texto.
 */

const root = document.documentElement;
const animated = root.classList.contains("js-anim");

/* ── 1 y 2. Revelado y trazado ──────────────────────────────── */

function setUpReveals(): void {
  const targets = document.querySelectorAll<HTMLElement | SVGElement>(
    ".reveal, .svc-diagram, .ch-svg, .ss-svg, .trace-draw"
  );

  if (targets.length === 0) return;

  // Las pistas necesitan saber cuánto miden antes de poder dibujarse.
  document.querySelectorAll<SVGPathElement>(".trace-draw").forEach((path) => {
    const length = Math.ceil(path.getTotalLength());
    path.style.setProperty("--trace-length", String(length));
  });

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ── 3. Paralaje del despiece ───────────────────────────────── */

function setUpParallax(): void {
  const stage = document.querySelector<HTMLElement>("[data-ecu-stage]");

  // Solo con puntero fino: en táctil no hay nada que seguir y el `pointermove`
  // de un dedo produciría saltos.
  if (!stage || !window.matchMedia("(pointer: fine)").matches) return;

  let frame = 0;

  const move = (event: PointerEvent): void => {
    if (frame) return;

    frame = window.requestAnimationFrame(() => {
      frame = 0;

      const rect = stage.getBoundingClientRect();
      if (rect.width === 0) return;

      // −1..1 respecto al centro del dibujo, recortado para que el gesto no
      // se dispare cuando el ratón está lejos.
      const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
      const clamp = (v: number): number => Math.max(-1, Math.min(1, v * 2));

      // 9 px es el recorrido de la capa más alta. Es volumen, no un carrusel.
      stage.style.setProperty("--ecu-px", (clamp(dx) * 9).toFixed(2));
      stage.style.setProperty("--ecu-py", (clamp(dy) * 5).toFixed(2));
    });
  };

  const reset = (): void => {
    stage.style.setProperty("--ecu-px", "0");
    stage.style.setProperty("--ecu-py", "0");
  };

  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("pointerleave", reset);
  window.addEventListener("blur", reset);
}

/* ── 4. Cierre de los menús de la cabecera ──────────────────── */

/**
 * Lo que `<details>` no trae y un menú sí necesita: cerrarse al pulsar fuera,
 * con Escape y al salir el foco.
 *
 * El menú funciona sin esto —abrir y cerrar con el propio control, con ratón
 * y con teclado—, así que es una mejora, no un requisito. Por eso vive aquí y
 * no en la cabecera: un menú desplegable no puede depender de que llegue un
 * archivo JavaScript.
 */
function setUpNavMenus(): void {
  const menus = Array.from(
    document.querySelectorAll<HTMLDetailsElement>("[data-nav-menu]")
  );

  if (menus.length === 0) return;

  document.addEventListener("click", (event) => {
    const target = event.target as Node;
    for (const menu of menus) {
      if (menu.open && !menu.contains(target)) menu.open = false;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    for (const menu of menus) {
      if (!menu.open) continue;
      menu.open = false;
      // El foco vuelve al control que lo abrió, no al principio del documento.
      menu.querySelector("summary")?.focus();
    }
  });

  for (const menu of menus) {
    menu.addEventListener("focusout", (event) => {
      const next = (event as FocusEvent).relatedTarget as Node | null;
      if (menu.open && next && !menu.contains(next)) menu.open = false;
    });
  }
}

/* ── 5. Profundidad activa en /servicios ────────────────────── */

/**
 * Marca en el raíl qué servicio se está leyendo. Es orientación, no
 * decoración: sin JavaScript el raíl sigue siendo una lista de enlaces de
 * ancla que funciona igual, solo que sin resaltado.
 */
function setUpDepthRail(): void {
  const rail = document.querySelector<HTMLElement>("[data-depth-rail]");
  if (!rail || !("IntersectionObserver" in window)) return;

  const links = new Map<string, HTMLAnchorElement>();

  rail.querySelectorAll<HTMLAnchorElement>("a[href^='#']").forEach((link) => {
    links.set(link.getAttribute("href")!.slice(1), link);
  });

  const sections = Array.from(links.keys())
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  if (sections.length === 0) return;

  /*
   * Cuál es la sección actual se decide midiendo, no con el conjunto de
   * secciones que el observador ve intersecar: en el solape entre dos, ese
   * conjunto tiene las dos y hay que elegir, y elegir la primera dejaba el
   * índice marcando la anterior mucho después de haberla dejado atrás.
   *
   * La regla es simple: la última sección cuyo borde superior ya ha pasado
   * por debajo de la cabecera y del propio índice.
   */
  const update = (): void => {
    const line = rail.getBoundingClientRect().bottom + 8;

    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= line) current = section;
    }

    links.forEach((link, id) => {
      link.toggleAttribute("data-current", id === current?.id);
    });
  };

  // Una medida por fotograma como mucho: `scroll` se dispara muchas más veces
  // de las que hay que repintar, y medir fuerza cálculo de disposición.
  let frame = 0;
  const schedule = (): void => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };

  // El observador solo sirve de disparador barato: no calcula nada.
  const observer = new IntersectionObserver(schedule, {
    threshold: [0, 0.25, 0.5, 0.75, 1],
  });

  sections.forEach((section) => observer.observe(section));
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  update();
}

if (animated) {
  setUpReveals();
  setUpParallax();
}

// Estas dos no son movimiento: orientan y controlan. Se ejecutan siempre,
// aunque se haya pedido menos movimiento.
setUpNavMenus();
setUpDepthRail();

// Marca el archivo como módulo: si no, sus constantes viven en el ámbito
// global y chocan con las del otro script.
export {};
