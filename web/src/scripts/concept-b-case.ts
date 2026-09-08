/**
 * «Tu caso» — la capa de JavaScript del Concepto B.
 * Solo se usa en `/conceptos/reprogramacion-b`.
 *
 * Lo que hace, y ni una cosa más:
 *
 *   1. **Redacta el mensaje de WhatsApp con las respuestas.** Es la utilidad
 *      real de la pieza: convierte tres clics en una consulta con los datos
 *      ordenados, que es justo lo que el taller necesita recibir.
 *   2. **Lo enseña antes de enviarlo.** Nadie debería descubrir en WhatsApp
 *      qué se ha escrito en su nombre.
 *   3. **Lo anuncia** en una región `aria-live`, porque el panel que cambia
 *      está lejos del control que se acaba de pulsar.
 *   4. Marca la opción vigente en el índice y lleva la barra de estado.
 *   5. Deforma la anchura de la palabra que ha cambiado en la línea de
 *      estado. Es el único gesto decorativo, dura 160 ms y se apaga con
 *      `prefers-reduced-motion`.
 *
 * Lo que NO hace, y es deliberado: **decidir qué se ve**. De eso se encarga
 * el CSS generado en `CbCaseSelector.astro`, así que sin este archivo la
 * página sigue respondiendo a cada elección y el enlace de WhatsApp sigue
 * llevando la plantilla en blanco de `site.ts`.
 *
 * Sin dependencias, sin estado guardado, sin ninguna petición.
 */

interface CaseData {
  base: string[];
  encabezados: Record<string, string>;
  campos: { mods?: string; objetivo?: string };
  objetivos: Record<string, string>;
  modificaciones: Record<string, string>;
  nombres: Record<string, string>;
  combos: Record<string, string>;
  numero: string;
}

const root = document.querySelector<HTMLElement>("[data-cb-case]");

if (root) {
  let data: CaseData | null = null;

  try {
    data = JSON.parse(root.dataset.cbDatos ?? "") as CaseData;
  } catch {
    /* Con los datos ilegibles se deja la página tal cual: el CSS ya responde
       a las elecciones y el enlace lleva la plantilla en blanco. */
  }

  const preview = root.querySelector<HTMLElement>("[data-cb-preview]");
  const previewText = root.querySelector<HTMLElement>("[data-cb-previewText]");
  const status = root.querySelector<HTMLElement>("[data-cb-status]");
  const tokens = Array.from(root.querySelectorAll<HTMLElement>("[data-cb-token]"));
  const marks = Array.from(root.querySelectorAll<HTMLElement>("[data-cb-mark]"));

  /* Los enlaces viven dentro y fuera del formulario: el de la respuesta y el
     de la barra de estado, que acompaña al desplazamiento. */
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>("[data-cb-link]")
  );
  const barPre = document.querySelector<HTMLElement>("[data-cb-bar-pre]");
  const barName = document.querySelector<HTMLElement>("[data-cb-bar-name]");

  const animated = document.documentElement.classList.contains("cb-motion");

  /** El valor marcado de un grupo, o null si nadie ha elegido todavía. */
  const chosen = (name: string): string | null => {
    const input = root.querySelector<HTMLInputElement>(
      `input[name="${name}"]:checked`
    );

    return input ? input.value : null;
  };

  /**
   * El texto que el CSS está enseñando dentro de un hueco de la línea de
   * estado. Se lee del DOM en vez de repetir las etiquetas en los datos: la
   * decisión de qué se ve ya la ha tomado el CSS.
   */
  const visible = (token: HTMLElement): string => {
    const child = Array.from(token.children).find(
      (el) => getComputedStyle(el).display !== "none"
    );

    return child?.textContent?.trim() ?? "";
  };

  if (data) {
    const {
      base,
      encabezados,
      campos,
      objetivos,
      modificaciones,
      nombres,
      combos,
      numero,
    } = data;

    /** Guarda el ancho anterior de cada hueco para deformar solo el que cambia. */
    const previo = new Map<HTMLElement, string>();

    const compose = (
      vehiculo: string,
      estado: string,
      uso: string | null
    ): string => {
      const lines = base.map((line, i) => {
        if (i === 0) return encabezados[vehiculo] ?? line;
        if (campos.mods && line === campos.mods) {
          const value = modificaciones[estado];
          return value ? `${line} ${value}` : line;
        }
        if (campos.objetivo && line === campos.objetivo && uso) {
          const value = objetivos[uso];
          return value ? `${line} ${value}` : line;
        }
        return line;
      });

      return lines.join("\n");
    };

    const update = (): void => {
      const vehiculo = chosen("cb-vehiculo") ?? "coche";
      const estado = chosen("cb-estado") ?? "serie";
      const uso = chosen("cb-uso");

      const result = combos[`${vehiculo}|${estado}|${uso ?? ""}`] ?? "none";
      const nombre = nombres[result] ?? null;
      const text = compose(vehiculo, estado, uso);

      for (const link of links) {
        link.href = `https://wa.me/${numero}?text=${encodeURIComponent(text)}`;
      }

      if (previewText) previewText.textContent = text;
      if (preview) preview.hidden = false;

      for (const mark of marks) {
        if (mark.dataset.cbMark === result) {
          mark.setAttribute("data-cb-current", "");
        } else {
          mark.removeAttribute("data-cb-current");
        }
      }

      const caso = tokens.map(visible).filter(Boolean).join(", ");

      /* En la barra el prefijo es prescindible y el nombre no: por eso van
         separados, y en pantalla estrecha el CSS retira el prefijo. */
      if (barPre) barPre.hidden = nombre === null;
      if (barName) barName.textContent = nombre ?? "Elige cómo lo usas";

      if (status) {
        status.textContent = nombre
          ? `${caso}. Por aquí se empieza: ${nombre}.`
          : `${caso}. Falta elegir cómo usas el vehículo.`;
      }

      /* La deformación: la palabra que acaba de cambiar nace estrecha y se
         abre hasta la anchura del titular. Solo la que cambia. */
      if (animated) {
        for (const token of tokens) {
          const now = visible(token);
          if (previo.get(token) === now) continue;

          previo.set(token, now);
          token.style.fontVariationSettings = '"wdth" 92';

          window.requestAnimationFrame(() => {
            token.style.fontVariationSettings = "";
          });
        }
      }
    };

    root.addEventListener("change", update);

    /* Estado inicial: guarda los anchos de partida sin animarlos y compone
       el primer mensaje. */
    for (const token of tokens) previo.set(token, visible(token));
    update();
  }
}

// Marca el archivo como módulo: si no, sus constantes viven en el ámbito
// global y chocan con las de otro script.
export {};
