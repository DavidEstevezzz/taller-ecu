/**
 * Constructor del primer mensaje — `MessageBuilder.astro`.
 *
 * Abre las casillas (nacen con `hidden` para que sin JavaScript no haya
 * controles muertos) y mantiene sincronizados tres elementos: la vista previa,
 * el enlace de WhatsApp y un aviso para lectores de pantalla.
 *
 * No hay estado guardado, ni `localStorage`, ni petición a ningún sitio: todo
 * ocurre en la página, y lo único que sale de aquí es el enlace que el
 * visitante decide abrir.
 */

const root = document.querySelector<HTMLElement>("[data-msg-builder]");

if (root) {
  const controls = root.querySelector<HTMLElement>("[data-msg-controls]");
  const preview = root.querySelector<HTMLElement>("[data-msg-preview]");
  const status = root.querySelector<HTMLElement>("[data-msg-status]");
  const link = root.querySelector<HTMLAnchorElement>("[data-msg-link]");
  const boxes = Array.from(
    root.querySelectorAll<HTMLInputElement>("[data-msg-option]")
  );

  const number = root.dataset.msgNumber ?? "";

  /** La plantilla base viaja en el HTML: la escribe site.ts, no este archivo. */
  let base: string[] = [];
  try {
    const parsed: unknown = JSON.parse(root.dataset.msgBase ?? "[]");
    if (Array.isArray(parsed)) base = parsed.map(String);
  } catch {
    /* Con la plantilla ilegible se deja el mensaje que ya está servido. */
  }

  if (preview && link && base.length > 0) {
    const update = (): void => {
      const extras = boxes
        .filter((box) => box.checked)
        .map((box) => box.value);

      const text = [...base, ...extras].join("\n");

      preview.textContent = text;
      link.href = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

      if (status) {
        status.textContent =
          extras.length === 0
            ? "Mensaje base, sin líneas añadidas."
            : `Mensaje con ${extras.length} ${
                extras.length === 1 ? "línea añadida" : "líneas añadidas"
              }.`;
      }
    };

    for (const box of boxes) {
      box.addEventListener("change", update);
    }

    if (controls) controls.hidden = false;
    update();
  }
}

export {};
