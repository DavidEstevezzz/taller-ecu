/**
 * Conduce el recorrido de `FaultTrace.astro` con el desplazamiento.
 *
 * Qué hace, exactamente: decide cuál de los seis pasos se está leyendo y se
 * lo dice al dibujo. Nada más. No secuestra el desplazamiento, no fija la
 * página, no reproduce nada en bucle y no escucha al puntero.
 *
 * Y, sobre todo, qué NO hace falta que haga: el dibujo ya se sirve completo
 * —zonas revisadas, recorrido entero y punto de intervención marcado— y los
 * seis pasos son una lista legible. Este archivo solo añade el paso a paso,
 * y solo cuando se cumplen las tres condiciones:
 *
 *   1. Hay JavaScript y no se ha pedido menos movimiento (`.js-anim`).
 *   2. Hay sitio para las dos columnas (≥1024px, el mismo corte que el CSS).
 *   3. La sección está a la vista.
 *
 * Si alguna deja de cumplirse —girar una tableta, por ejemplo— se apaga y
 * devuelve el dibujo a su estado completo.
 *
 * Sin dependencias: IntersectionObserver y rAF, como el resto del sitio.
 */

const root = document.querySelector<HTMLElement>("[data-fault-trace]");

if (root && document.documentElement.classList.contains("js-anim")) {
  const steps = Array.from(
    root.querySelectorAll<HTMLElement>("[data-ft-step]")
  );
  /* Conector y zonas: cada uno sabe en qué paso le toca. */
  const marks = Array.from(root.querySelectorAll<SVGElement>("[data-at]"));
  const progress = (root.dataset.progress ?? "")
    .split(",")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  const wide = window.matchMedia("(min-width: 64rem)");

  let current = -1;
  let visible = false;
  let frame = 0;

  function apply(step: number): void {
    if (step === current) return;
    current = step;

    root!.dataset.step = String(step);

    if (progress[step] !== undefined) {
      root!.style.setProperty("--ft-p", String(progress[step]));
    }

    steps.forEach((element, i) => {
      element.dataset.state =
        i < step ? "done" : i === step ? "active" : "pending";
    });

    marks.forEach((element) => {
      const at = Number(element.dataset.at);
      element.dataset.state =
        at < step ? "done" : at === step ? "active" : "pending";
    });
  }

  /*
   * Cuál es el paso actual se decide midiendo, igual que el índice de
   * /servicios: es el último cuyo borde superior ya ha pasado la línea de
   * lectura. Con el conjunto de elementos que el observador ve intersecar no
   * basta, porque en el solape hay dos y hay que elegir.
   *
   * La línea va a media pantalla, y no es arbitrario: cada paso ocupa 52vh
   * con el texto centrado, así que con la línea al 50 % el texto del paso
   * activo barre de 76vh a 24vh, es decir, se pasa toda su vida dentro de la
   * zona de lectura. Con la línea más abajo, el paso se activaba cuando su
   * texto todavía no había entrado.
   */
  function update(): void {
    if (!visible || steps.length === 0) return;

    const line = window.innerHeight * 0.5;
    let step = 0;

    for (let i = 0; i < steps.length; i += 1) {
      if (steps[i]!.getBoundingClientRect().top <= line) step = i;
    }

    apply(step);
  }

  function schedule(): void {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  }

  /*
   * El interruptor se pone una sola vez, al cargar, y NO al entrar la sección
   * en pantalla. Es deliberado: `is-driven` da a cada paso 52vh de recorrido,
   * así que ponerlo a mitad de lectura estiraría la página casi dos mil
   * píxeles debajo de los pies del visitante, y quitarlo al salir la
   * encogería otra vez. Puesto al principio, el alto del documento es estable
   * desde el primer momento.
   */
  function setDriven(on: boolean): void {
    if (on === root!.classList.contains("is-driven")) return;

    if (on) {
      root!.classList.add("is-driven");
      current = -1;
      update();
      return;
    }

    root!.classList.remove("is-driven");
    current = -1;
    delete root!.dataset.step;
    root!.style.removeProperty("--ft-p");

    for (const element of [...steps, ...marks]) {
      delete (element as HTMLElement).dataset.state;
    }
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  wide.addEventListener("change", () => setDriven(wide.matches));

  /*
   * El observador no enciende ni apaga nada visible: solo evita medir
   * mientras la sección está fuera de la pantalla.
   */
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible = entry.isIntersecting;
        update();
      },
      { rootMargin: "20% 0px 20% 0px" }
    );

    observer.observe(root);
  } else {
    visible = true;
  }

  setDriven(wide.matches);
}

export {};
