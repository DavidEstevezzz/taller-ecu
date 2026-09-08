/**
 * Conduce el traslado de `IdentityTransfer.astro` — /servicios/clonacion-ecu.
 *
 * Qué hace: decidir cuál de los cinco pasos se está mirando y decírselo al
 * dibujo. Nada más.
 *
 * Quién lo decide, y por qué importa: **el visitante, con un botón**. En la
 * página de reparación el recorrido de la placa lo conduce el desplazamiento,
 * y repetir ahí ese mecanismo habría hecho hermanas dos páginas que tienen
 * que distinguirse. Además, aquí la secuencia se entiende mejor pudiendo
 * volver atrás: la pregunta que deja esta página es «¿y esa capa, qué era?».
 *
 * Se reproduce **una sola vez** al entrar en pantalla, para que el mecanismo
 * se entienda sin tener que descubrir el control. No es un bucle, y cualquier
 * interacción lo detiene: a partir de ahí manda quien lee.
 *
 * Cómo degrada:
 *
 *   sin JavaScript      → este archivo no se ejecuta. El dibujo ya se sirve
 *                         completo y los títulos siguen siendo títulos, no
 *                         botones muertos.
 *   movimiento reducido → no hay reproducción automática y el dibujo arranca
 *                         completo. Los botones siguen funcionando: controlar
 *                         no es moverse. Las transiciones las colapsa la regla
 *                         global de tokens.css.
 *
 * Sin dependencias: no hay observador de scroll, ni rAF, ni librería. Un
 * IntersectionObserver para el disparo inicial y un temporizador.
 */

const root = document.querySelector<HTMLElement>("[data-identity-transfer]");

if (root) {
  const items = Array.from(root.querySelectorAll<HTMLElement>("[data-it-step]"));
  const copies = Array.from(root.querySelectorAll<SVGElement>("[data-copy]"));
  const sources = Array.from(root.querySelectorAll<SVGElement>("[data-layer]"));
  const buttons: HTMLButtonElement[] = [];

  const animated = document.documentElement.classList.contains("js-anim");

  /** −1 es el estado de partida: la unidad de sustitución todavía con huecos. */
  let current = -1;
  let timer = 0;
  let played = false;

  function stopAuto(): void {
    if (timer) {
      window.clearTimeout(timer);
      timer = 0;
    }
    played = true;
  }

  /** El dibujo solo pasa a estados parciales cuando alguien los pide. */
  function drive(): void {
    root!.classList.add("is-driven");
  }

  function show(step: number): void {
    current = step;
    root!.dataset.step = String(step);

    items.forEach((element, i) => {
      element.dataset.state =
        i < step ? "done" : i === step ? "active" : "pending";
    });

    copies.forEach((element) => {
      const index = Number(element.dataset.copy);
      element.dataset.state = index <= step ? "shown" : "hidden";
    });

    sources.forEach((element) => {
      const index = Number(element.dataset.layer);
      element.dataset.state = index === step ? "active" : "idle";
    });

    buttons.forEach((button, i) => {
      button.setAttribute("aria-pressed", String(i === step));
    });
  }

  /*
   * El título se convierte en botón desde aquí, no en la plantilla: sin
   * JavaScript un botón que no controla nada es peor que un título normal,
   * y el <h3> sigue siendo un encabezado real para lectores de pantalla.
   */
  items.forEach((item, i) => {
    const title = item.querySelector<HTMLElement>("[data-it-title]");
    if (!title) return;

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = (title.textContent ?? "").trim();
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      stopAuto();
      drive();
      show(i);
    });

    title.replaceChildren(button);
    buttons.push(button);
  });

  if (animated && items.length > 0) {
    drive();
    show(-1);

    const play = (): void => {
      if (played) return;

      const next = current + 1;
      if (next >= items.length) {
        played = true;
        return;
      }

      show(next);
      timer = window.setTimeout(play, 1150);
    };

    if (typeof IntersectionObserver === "undefined") {
      timer = window.setTimeout(play, 480);
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting || played) continue;
            observer.disconnect();
            timer = window.setTimeout(play, 480);
          }
        },
        { threshold: 0.3 }
      );

      observer.observe(root);
    }
  }
}

export {};
