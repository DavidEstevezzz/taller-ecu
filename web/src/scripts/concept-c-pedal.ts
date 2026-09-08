/**
 * El banco de respuesta del Concepto C (`CcPedalBench.astro`).
 *
 * Solo se activa con `cc-motion` —hay JavaScript y no se ha pedido menos
 * movimiento—. Hasta entonces la página sirve la figura estática, que cuenta
 * la misma comparación; este script la cambia por un registrador en vivo:
 * mantienes pisado el pedal y tres trazas avanzan como en un plóter, con lo
 * que pides y cómo llega la entrega de serie y ajustada.
 *
 * Honestidad del modelo: son dos filtros de primer orden con retardo, con
 * constantes elegidas para ilustrar «llega antes y más llena». No hay ejes
 * con unidades, no hay cifras y el aviso de que es conceptual vive en el HTML.
 *
 * Rendimiento: el bucle de dibujo solo corre mientras hay algo que dibujar
 * —pedal pisado o trazas aún moviéndose— y se detiene solo.
 */

const root = document.querySelector<HTMLElement>("[data-pedal]");
const motion = document.documentElement.classList.contains("cc-motion");

if (root && motion) {
  const button = root.querySelector<HTMLButtonElement>("[data-pedal-button]");
  const canvas = root.querySelector<HTMLCanvasElement>("[data-pedal-canvas]");
  const figure = root.querySelector<SVGElement>("[data-pedal-static]");
  const chip = root.querySelector<HTMLElement>("[data-pedal-chip]");
  const hint = root.querySelector<HTMLElement>("[data-pedal-hint]");
  const fallback = root.querySelector<HTMLElement>("[data-pedal-fallback]");
  const status = root.querySelector<HTMLElement>("[data-pedal-status]");
  const context = canvas?.getContext("2d");

  if (button && canvas && figure && context) {
    /* Colores desde los tokens: una sola fuente de verdad. */
    const styles = getComputedStyle(document.documentElement);
    const token = (name: string, hard: string): string =>
      styles.getPropertyValue(name).trim() || hard;

    const COLOR = {
      grid: token("--cc-display-grid", "#262e31"),
      base: token("--cc-display-line", "#394245"),
      demand: token("--cc-on-display-2", "#9aa5a3"),
      stock: token("--cc-trace-stock", "#97a1a0"),
      tuned: token("--cc-trace-tuned", "#7da2ff"),
    };

    /* La ventana de tiempo visible, en segundos. */
    const WINDOW = 6;
    /* Muestras por segundo del registro (independiente de los fps). */
    const RATE = 60;
    /* Retardo y respuesta de cada calibración: la de serie tarda más en
       llegar y se queda más corta. Valores ilustrativos, nunca mostrados. */
    const STOCK = { delay: 0.34, tau: 0.5, gain: 0.6 };
    const TUNED = { delay: 0.1, tau: 0.2, gain: 0.94 };

    type Sample = { demand: number; stock: number; tuned: number };

    const samples: Sample[] = [];
    const demandLog: number[] = []; // Para aplicar el retardo de cada traza.

    let pressed = false;
    let demand = 0;
    let stock = 0;
    let tuned = 0;
    let running = false;
    let lastTime = 0;

    /* ── Modelo ──────────────────────────────────────────────────────── */

    const delayed = (seconds: number): number => {
      const back = Math.round(seconds * RATE);
      const index = demandLog.length - 1 - back;
      return index >= 0 ? demandLog[index]! : 0;
    };

    function step(): void {
      const dt = 1 / RATE;
      const target = pressed ? 1 : 0;
      const tauDemand = pressed ? 0.07 : 0.22;
      demand += (target - demand) * Math.min(1, dt / tauDemand);
      demandLog.push(demand);
      if (demandLog.length > RATE * (WINDOW + 2)) demandLog.shift();

      stock += (delayed(STOCK.delay) * STOCK.gain - stock) * Math.min(1, dt / STOCK.tau);
      tuned += (delayed(TUNED.delay) * TUNED.gain - tuned) * Math.min(1, dt / TUNED.tau);

      samples.push({ demand, stock, tuned });
      if (samples.length > RATE * WINDOW) samples.shift();
    }

    /* ── Dibujo ──────────────────────────────────────────────────────── */

    function fit(): void {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      if (rect.width === 0) return;
      canvas!.width = Math.round(rect.width * dpr);
      canvas!.height = Math.round(rect.height * dpr);
      context!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function trace(key: keyof Sample, width: number, dash: number[]): void {
      const rect = canvas!.getBoundingClientRect();
      const top = 12;
      const bottom = rect.height - 14;
      const ctx = context!;

      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.lineJoin = "round";
      ctx.beginPath();

      for (let i = 0; i < samples.length; i += 1) {
        const x = (i / (RATE * WINDOW - 1)) * rect.width;
        const y = bottom - samples[i]![key] * (bottom - top);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.setLineDash([]);
    }

    function draw(): void {
      const rect = canvas!.getBoundingClientRect();
      const ctx = context!;
      ctx.clearRect(0, 0, rect.width, rect.height);

      /* Papel de registro. */
      ctx.strokeStyle = COLOR.grid;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = 1; gx < 8; gx += 1) {
        const x = (gx / 8) * rect.width;
        ctx.moveTo(x, 6);
        ctx.lineTo(x, rect.height - 6);
      }
      for (let gy = 1; gy < 5; gy += 1) {
        const y = (gy / 5) * rect.height;
        ctx.moveTo(4, y);
        ctx.lineTo(rect.width - 4, y);
      }
      ctx.stroke();

      /* Línea de reposo. */
      ctx.strokeStyle = COLOR.base;
      ctx.beginPath();
      ctx.moveTo(0, rect.height - 14);
      ctx.lineTo(rect.width, rect.height - 14);
      ctx.stroke();

      ctx.strokeStyle = COLOR.demand;
      trace("demand", 1.5, [5, 5]);
      ctx.strokeStyle = COLOR.stock;
      trace("stock", 1.75, []);
      ctx.strokeStyle = COLOR.tuned;
      trace("tuned", 3, []);
    }

    /* ── Bucle ───────────────────────────────────────────────────────── */

    let carry = 0;

    function frame(now: number): void {
      if (!running) return;

      /* Muestreo a ritmo fijo, aunque los fps bailen. */
      carry += Math.min(now - lastTime, 250);
      lastTime = now;
      while (carry >= 1000 / RATE) {
        step();
        carry -= 1000 / RATE;
      }

      draw();

      const settled =
        !pressed && demand < 0.002 && stock < 0.002 && tuned < 0.002;
      if (settled) {
        running = false;
        return;
      }

      requestAnimationFrame(frame);
    }

    function wake(): void {
      if (running) return;
      running = true;
      lastTime = performance.now();
      carry = 0;
      requestAnimationFrame(frame);
    }

    /* ── Estado del pedal ────────────────────────────────────────────── */

    function press(): void {
      if (pressed) return;
      pressed = true;
      button!.classList.add("is-down");
      chip?.classList.add("cc-chip--live");
      if (chip) chip.textContent = "Pisando";
      if (status) status.textContent = "Pedal pisado: las trazas suben.";
      wake();
    }

    function release(): void {
      if (!pressed) return;
      pressed = false;
      button!.classList.remove("is-down");
      chip?.classList.remove("cc-chip--live");
      if (chip) chip.textContent = "En reposo";
      if (status) status.textContent = "Pedal suelto: las trazas vuelven.";
      wake();
    }

    button.addEventListener("pointerdown", (event) => {
      button.setPointerCapture(event.pointerId);
      press();
    });
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);

    button.addEventListener("keydown", (event) => {
      if (event.key !== " " && event.key !== "Enter") return;
      /* La barra espaciadora no debe desplazar la página mientras pisas. */
      event.preventDefault();
      if (!event.repeat) press();
    });
    button.addEventListener("keyup", (event) => {
      if (event.key === " " || event.key === "Enter") release();
    });
    button.addEventListener("blur", release);

    /* ── Activación: la figura deja paso al registrador ──────────────── */

    /* `hidden` como atributo: un `<svg>` no es HTMLElement y no tiene la
       propiedad. La regla `[hidden]` de la hoja hace el resto. */
    figure.setAttribute("hidden", "");
    canvas.hidden = false;
    button.hidden = false;
    if (hint) hint.hidden = false;
    if (fallback) fallback.hidden = true;

    fit();
    /* Papel en blanco y línea de reposo desde el primer vistazo. */
    samples.push({ demand: 0, stock: 0, tuned: 0 });
    draw();

    const observer = new ResizeObserver(() => {
      fit();
      draw();
    });
    observer.observe(canvas);
  }
}

/* Marca el archivo como módulo. */
export {};
