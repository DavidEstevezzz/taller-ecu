/**
 * Los tres pasos del diagrama de aislamiento de `/servicios/reparacion-ecu`.
 *
 * El HTML sale del servidor con los tres pasos escritos y visibles, y con los
 * controles ocultos por CSS. Este módulo hace dos cosas:
 *
 *   1. Convierte esos botones en un grupo de pestañas de verdad —roles ARIA,
 *      `tabindex` móvil, flechas, Inicio y Fin—, que es lo que un lector de
 *      pantalla y un teclado esperan encontrar.
 *   2. Escribe el paso activo en `data-state`, que es lo único que el dibujo
 *      necesita: el recorrido del cerco es CSS.
 *
 * Si este archivo no llega a cargarse, los controles siguen sin dibujarse y
 * los tres pasos se leen seguidos. No se pierde contenido.
 *
 * Sin dependencias: el patrón de pestañas son treinta líneas de teclado.
 */

const root = document.querySelector<HTMLElement>("[data-fault]");
const list = root?.querySelector<HTMLElement>("[data-fault-tablist]");

if (root && list) {
  const tabs = Array.from(
    list.querySelectorAll<HTMLButtonElement>("[data-fault-tab]")
  );
  const panels = Array.from(
    root.querySelectorAll<HTMLElement>("[data-fault-panel]")
  );

  const keyOf = (el: HTMLElement, attr: string): string =>
    el.getAttribute(attr) ?? "";

  if (tabs.length > 0 && tabs.length === panels.length) {
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-orientation", "vertical");
    list.setAttribute("aria-label", "Fases del diagnóstico");

    tabs.forEach((tab, i) => {
      const key = keyOf(tab, "data-fault-tab");
      tab.setAttribute("role", "tab");
      tab.id = `fault-tab-${key}`;
      tab.setAttribute("aria-controls", `fault-panel-${key}`);

      const panel = panels[i]!;
      panel.setAttribute("role", "tabpanel");
      panel.id = `fault-panel-${key}`;
      panel.setAttribute("aria-labelledby", tab.id);
      // Los paneles llevan varios párrafos: enfocables para poder desplazarlos.
      panel.tabIndex = 0;
    });

    /** Deja activo el paso indicado. `move` solo es cierto al usar el teclado. */
    function select(key: string, move: boolean): void {
      root!.dataset.state = key;

      tabs.forEach((tab) => {
        const active = keyOf(tab, "data-fault-tab") === key;
        tab.setAttribute("aria-selected", String(active));
        // Un solo control tabulable en todo el grupo: entras con Tab y te
        // mueves con las flechas, que es como funciona un grupo de pestañas.
        tab.tabIndex = active ? 0 : -1;
        if (active && move) tab.focus();
      });

      panels.forEach((panel) => {
        panel.hidden = keyOf(panel, "data-fault-panel") !== key;
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        select(keyOf(tab, "data-fault-tab"), false);
      });

      tab.addEventListener("keydown", (event) => {
        const index = tabs.indexOf(tab);
        let next = -1;

        switch (event.key) {
          case "ArrowDown":
          case "ArrowRight":
            next = (index + 1) % tabs.length;
            break;
          case "ArrowUp":
          case "ArrowLeft":
            next = (index - 1 + tabs.length) % tabs.length;
            break;
          case "Home":
            next = 0;
            break;
          case "End":
            next = tabs.length - 1;
            break;
          default:
            return;
        }

        event.preventDefault();
        select(keyOf(tabs[next]!, "data-fault-tab"), true);
      });
    });

    select(keyOf(tabs[0]!, "data-fault-tab"), false);
  }
}

// Marca el archivo como módulo, igual que el resto de scripts del sitio.
export {};
