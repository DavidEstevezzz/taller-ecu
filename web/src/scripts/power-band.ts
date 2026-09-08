/**
 * La banda de entrega — `PowerBand.astro`.
 *
 * Añade dos cosas a un componente que ya funciona sin él, y ninguna de las
 * dos es necesaria para entender la página:
 *
 *   1. La curva **se deforma** de un objetivo a otro en lugar de saltar. Es
 *      lo que hace que se lea como una misma entrega que cambia y no como
 *      cinco láminas distintas.
 *   2. Al entrar en pantalla, la curva **nace sobre la de partida y crece**.
 *      Ese gesto es la tesis de la página entera: esto es tu coche, esto es
 *      lo que cambia.
 *
 * Y, de paso, escribe el objetivo elegido en la plantilla de WhatsApp.
 *
 * Reglas que se respetan aquí:
 *
 * - **No se ejecuta si se ha pedido menos movimiento.** El interruptor
 *   `.js-anim` lo pone el script en línea del <head>; sin él manda el CSS del
 *   componente, que sirve las cinco curvas ya dibujadas.
 * - **Las matemáticas no se repiten.** El muestreo de cada curva se calcula
 *   en el componente, en compilación, y viaja en `data-band`. Aquí solo se
 *   interpola entre dos series de ordenadas ya calculadas.
 * - **Sin dependencias.** Una interpolación lineal y `requestAnimationFrame`
 *   bastan; una librería de animación serían decenas de kilobytes para mover
 *   veinticinco números.
 */

interface BandGoal {
  id: string;
  values: number[];
  zone: [number, number];
  message: string;
}

interface BandData {
  x0: number;
  x1: number;
  base: number;
  height: number;
  samples: number;
  stock: number[];
  goals: BandGoal[];
}

const root = document.querySelector<HTMLElement>("[data-power-band]");

if (root && document.documentElement.classList.contains("js-anim")) {
  let data: BandData | null = null;

  try {
    data = JSON.parse(root.dataset.band ?? "") as BandData;
  } catch {
    /* Con los datos ilegibles se deja el dibujo estático, que ya está bien. */
  }

  const line = root.querySelector<SVGPathElement>("[data-band-line]");
  const glow = root.querySelector<SVGPathElement>("[data-band-glow]");
  const areaPath = root.querySelector<SVGPathElement>("[data-band-area]");
  const zoneFill = root.querySelector<SVGRectElement>("[data-band-zone-fill]");
  const zoneLeft = root.querySelector<SVGLineElement>("[data-band-zone-left]");
  const zoneRight = root.querySelector<SVGLineElement>("[data-band-zone-right]");
  const link = root.querySelector<HTMLAnchorElement>("[data-band-link]");
  const radios = Array.from(
    root.querySelectorAll<HTMLInputElement>(".pb-radio")
  );

  const number = root.dataset.number ?? "";

  if (data && line && glow && areaPath && zoneFill && zoneLeft && zoneRight) {
    const { x0, x1, base, height, samples, stock, goals } = data;
    const span = x1 - x0;

    const px = (i: number): number => x0 + (span * i) / (samples - 1);
    const py = (v: number): number => base - v * height;

    /*
     * El mismo Catmull-Rom que dibuja el componente en compilación. Con las
     * abscisas fijas, dos curvas cualesquiera tienen idéntica estructura de
     * segmentos: por eso basta con interpolar las ordenadas.
     */
    const curve = (values: number[]): string => {
      let d = `M ${px(0).toFixed(1)} ${py(values[0]!).toFixed(1)}`;

      for (let i = 0; i < values.length - 1; i += 1) {
        const i0 = Math.max(i - 1, 0);
        const i3 = Math.min(i + 2, values.length - 1);

        const p0y = py(values[i0]!);
        const p1x = px(i);
        const p1y = py(values[i]!);
        const p2x = px(i + 1);
        const p2y = py(values[i + 1]!);
        const p3y = py(values[i3]!);

        const c1x = p1x + (p2x - px(i0)) / 6;
        const c1y = p1y + (p2y - p0y) / 6;
        const c2x = p2x - (px(i3) - p1x) / 6;
        const c2y = p2y - (p3y - p1y) / 6;

        d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2x.toFixed(1)} ${p2y.toFixed(1)}`;
      }

      return d;
    };

    /** Estado dibujado ahora mismo: se sale de aquí, no del objetivo previo. */
    let current = stock.slice();
    let currentZone: [number, number] = goals[0]!.zone;
    let frame = 0;

    const paint = (values: number[], zone: [number, number]): void => {
      const d = curve(values);

      line.setAttribute("d", d);
      glow.setAttribute("d", d);
      areaPath.setAttribute("d", `${d} L ${x1} ${base} L ${x0} ${base} Z`);

      zoneFill.setAttribute("x", zone[0].toFixed(1));
      zoneFill.setAttribute("width", zone[1].toFixed(1));
      zoneLeft.setAttribute("x1", zone[0].toFixed(1));
      zoneLeft.setAttribute("x2", zone[0].toFixed(1));
      zoneRight.setAttribute("x1", (zone[0] + zone[1]).toFixed(1));
      zoneRight.setAttribute("x2", (zone[0] + zone[1]).toFixed(1));
    };

    /* Sale rápido y se posa: la misma curva de asentamiento que el despiece
       de la portada, escrita a mano porque aquí no hay una transición CSS que
       la lleve. */
    const settle = (t: number): number => 1 - (1 - t) ** 3;

    const tweenTo = (target: number[], zone: [number, number]): void => {
      const from = current.slice();
      const fromZone: [number, number] = [currentZone[0], currentZone[1]];
      const start = performance.now();
      const duration = 520;

      if (frame) cancelAnimationFrame(frame);

      const step = (now: number): void => {
        const t = Math.min(1, (now - start) / duration);
        const e = settle(t);

        current = from.map((v, i) => v + (target[i]! - v) * e);
        currentZone = [
          fromZone[0] + (zone[0] - fromZone[0]) * e,
          fromZone[1] + (zone[1] - fromZone[1]) * e,
        ];

        paint(current, currentZone);

        frame = t < 1 ? requestAnimationFrame(step) : 0;
      };

      frame = requestAnimationFrame(step);
    };

    const selected = (): BandGoal => {
      const checked = radios.find((radio) => radio.checked);
      return goals.find((goal) => goal.id === checked?.value) ?? goals[0]!;
    };

    const updateLink = (goal: BandGoal): void => {
      if (!link) return;
      link.href = `https://wa.me/${number}?text=${encodeURIComponent(goal.message)}`;
    };

    /* Toma el mando: a partir de aquí el dibujo vivo sustituye al estático.
       Se pinta antes de enseñarlo para que no haya un fotograma en blanco. */
    paint(current, currentZone);
    root.classList.add("is-live");

    for (const radio of radios) {
      radio.addEventListener("change", () => {
        const goal = selected();
        tweenTo(goal.values, goal.zone);
        updateLink(goal);
      });
    }

    /*
     * La entrada. Arranca sobre la entrega de partida y crece hasta el
     * objetivo elegido, una sola vez, cuando la banda entra en pantalla.
     */
    const enter = (): void => {
      const goal = selected();
      tweenTo(goal.values, goal.zone);
      updateLink(goal);
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            observer.disconnect();
            enter();
          }
        },
        { threshold: 0.25 }
      );

      observer.observe(root);
    } else {
      enter();
    }
  }
}

// Marca el archivo como módulo: si no, sus constantes viven en el ámbito
// global y chocan con las de los otros scripts.
export {};
