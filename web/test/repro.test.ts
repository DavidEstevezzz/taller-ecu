/**
 * Protege las reglas de /servicios/reprogramacion que no se ven fallar.
 *
 * La página se rehízo entera con un cambio de perspectiva: dejó de explicar
 * qué ocurre dentro de la centralita y pasó a responder qué se nota al
 * volante. Las cuatro reglas de abajo son lo que sostiene ese cambio, y las
 * cuatro son fáciles de romper meses después sin que nada se queje:
 *
 * 1. **La banda no puede afirmar un resultado.** Es una forma, no una
 *    medición: ni una cifra dentro del dibujo, ni un porcentaje en el texto.
 *    En cuanto aparece un número, el dibujo pasa a leerse como la prueba de
 *    banco de un vehículo, que es exactamente lo que no es.
 * 2. **Ninguna curva de objetivo queda por debajo de la de partida.** Una que
 *    bajase estaría diciendo que en ese tramo se pierde empuje. No lo
 *    decimos, y con estos parámetros es un descuido de un decimal.
 * 3. **La densidad acordada.** Cinco objetivos de una frase, cinco opciones
 *    de una línea y cuatro datos que pedir. Todo eso se rompe añadiendo
 *    «solo un párrafo más».
 * 4. **El abanico comercial está sin confirmar, y se nota.** Motos, Stage 1 y
 *    vehículos modificados son una propuesta, no contenido verificado.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CONTACT,
  REPRO_BAND_CAVEAT,
  REPRO_BASELINE_BAND,
  REPRO_GOALS,
  REPRO_MESSAGE,
  REPRO_MESSAGE_LINES,
  REPRO_OPTIONS,
  REPRO_OPTIONS_TO_CONFIRM,
  REPRO_SEND,
} from "../src/config/site";

const SRC_DIR = join(process.cwd(), "src");

const read = (...parts: string[]): string =>
  readFileSync(join(SRC_DIR, ...parts), "utf8");

/** Lo que de verdad acaba delante del visitante: sin frontmatter ni comentarios. */
function markup(source: string): string {
  return source
    .replace(/^---[\s\S]*?\n---/, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

const pageMarkup = (): string =>
  markup(read("pages", "servicios", "reprogramacion.astro"));

/**
 * El mismo muestreo que hace el componente en compilación. Se repite aquí a
 * propósito: si alguien cambia la fórmula, esta prueba tiene que seguir
 * comprobando la regla sobre la fórmula que se publica, no sobre sí misma.
 * Por eso la comparación de abajo es contra la geometría, no contra un
 * fichero de referencia.
 */
interface Shape {
  readonly rise: number;
  readonly slope: number;
  readonly hold: number;
  readonly drop: number;
  readonly top: number;
}

function sample({ rise, slope, hold, drop, top }: Shape, n = 25): number[] {
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const up = 1 / (1 + Math.exp(-(t - rise) / slope));
    const down = t <= hold ? 1 : Math.exp(-(((t - hold) / drop) ** 2));
    return top * up * down;
  });
}

describe("la banda es una forma, nunca una medición", () => {
  it("no publica ninguna cifra ni porcentaje en el contenido", () => {
    const text = [
      ...REPRO_GOALS.map((goal) => `${goal.title} ${goal.body} ${goal.goal}`),
      ...REPRO_OPTIONS.map((option) => `${option.name} ${option.body}`),
      ...REPRO_SEND,
      REPRO_BAND_CAVEAT,
      REPRO_MESSAGE,
    ].join(" ");

    // «Stage 1» y «Stage 2» son nombres comerciales, no cifras.
    const withoutStage = text.replace(/Stage \d/g, "Stage");

    expect(withoutStage).not.toMatch(/\d/);
    for (const word of ["%", "€", "cv", " nm", "garantía", "precio", "plazo"]) {
      expect(withoutStage.toLowerCase(), `aparece «${word}»`).not.toContain(
        word
      );
    }
  });

  it("no promete ausencia de riesgo", () => {
    const markup = pageMarkup().toLowerCase();

    for (const claim of [
      "sin riesgo",
      "garantizad",
      "asegurad",
      "homologa",
      "banco de potencia propio",
    ]) {
      expect(markup, `aparece «${claim}»`).not.toContain(claim);
    }
  });

  it("no mete ni un rótulo dentro del dibujo", () => {
    /*
     * Es lo que le permite sobrevivir a cualquier escala, y lo que hace que
     * no haya que esconderlo en pantallas pequeñas. Los rótulos del eje son
     * HTML, fuera del SVG.
     */
    expect(markup(read("components", "PowerBand.astro"))).not.toContain(
      "<text"
    );
  });

  it("dice el aviso una sola vez, y desde un solo sitio", () => {
    expect(REPRO_BAND_CAVEAT).toContain("No lleva cifras");
    expect(pageMarkup()).not.toContain("No lleva cifras");
  });
});

describe("ninguna curva afirma una pérdida", () => {
  const baseline = sample(REPRO_BASELINE_BAND);

  for (const goal of REPRO_GOALS) {
    it(`«${goal.tab}» no queda por debajo de la entrega de partida`, () => {
      const values = sample(goal.band);

      values.forEach((value, i) => {
        expect(
          value,
          `${goal.id}: en el punto ${i} la curva del objetivo baja de la de partida`
        ).toBeGreaterThanOrEqual(baseline[i]! - 1e-9);
      });
    });

    it(`«${goal.tab}» ilumina un tramo real del régimen`, () => {
      const [from, to] = goal.zone;
      expect(from).toBeGreaterThanOrEqual(0);
      expect(to).toBeLessThanOrEqual(1);
      expect(to - from).toBeGreaterThan(0.1);
    });
  }
});

describe("densidad de la página", () => {
  it("ofrece cinco objetivos con una respuesta corta cada uno", () => {
    expect(REPRO_GOALS).toHaveLength(5);

    for (const goal of REPRO_GOALS) {
      const words = goal.body.trim().split(/\s+/).length;
      expect(words, `${goal.id}: la respuesta tiene ${words} palabras`).toBeLessThanOrEqual(
        16
      );
    }
  });

  it("ofrece cinco opciones con un panel corto cada una", () => {
    expect(REPRO_OPTIONS).toHaveLength(5);

    /*
     * El acordeón permite decir más que una línea, pero no un ensayo: entre
     * treinta y cinco y setenta palabras es lo que cabe sin que abrir un panel
     * empuje media página hacia abajo.
     */
    for (const option of REPRO_OPTIONS) {
      const words = option.body.trim().split(/\s+/).length;
      expect(words, `«${option.name}»: ${words} palabras`).toBeGreaterThanOrEqual(35);
      expect(words, `«${option.name}»: ${words} palabras`).toBeLessThanOrEqual(70);
    }
  });

  it("no repite «vehículo modificado» como opción propia", () => {
    /*
     * Se solapaba con Stage 2 casi palabra por palabra. Su contenido vive
     * dentro de Stage 2 y no debe volver como entrada suelta.
     */
    const names = REPRO_OPTIONS.map((option) => option.name.toLowerCase());

    expect(names).toContain("stage 1");
    expect(names).toContain("stage 2");
    expect(names).not.toContain("vehículo modificado");
    expect(new Set(names).size).toBe(names.length);
  });

  it("pide cuatro datos, no siete", () => {
    expect(REPRO_SEND).toHaveLength(4);
  });

  it("no enseña la plantilla completa en la página", () => {
    const markup = pageMarkup();
    expect(markup).not.toContain("REPRO_MESSAGE_LINES");
    expect(markup).not.toContain("<pre");
  });
});

describe("la plantilla de WhatsApp", () => {
  it("va con todos los campos en blanco", () => {
    // La primera línea es el encabezado; la segunda, la separación.
    for (const line of REPRO_MESSAGE_LINES.slice(2)) {
      expect(line.endsWith(":"), `«${line}» llega rellenado`).toBe(true);
    }
  });

  it("termina por el campo que rellena el selector de objetivos", () => {
    /*
     * El script solo toca la última línea. Si alguien añade un campo detrás,
     * el objetivo elegido acabaría escrito en el campo equivocado y nadie se
     * daría cuenta hasta ver un mensaje real.
     */
    expect(REPRO_MESSAGE_LINES.at(-1)).toBe("Qué quiero conseguir:");
    expect(REPRO_SEND.at(-1)).toBe("Qué quieres conseguir");
  });

  it("no escribe el teléfono a mano en ninguna plantilla", () => {
    const sources = [
      pageMarkup(),
      read("components", "PowerBand.astro"),
      read("scripts", "power-band.ts"),
    ].join("\n");

    expect(sources).not.toContain(CONTACT.whatsappNumber);
    expect(sources).not.toContain(CONTACT.whatsappDisplay);
  });
});

describe("el abanico comercial está sin confirmar", () => {
  it("cada opción provisional tiene su línea pendiente", () => {
    const pending = REPRO_OPTIONS_TO_CONFIRM.join(" ").toLowerCase();

    for (const name of ["stage 1", "stage 2", "motos", "modificado"]) {
      expect(pending, `«${name}» se publica sin marcar`).toContain(name);
    }

    for (const item of REPRO_OPTIONS_TO_CONFIRM) {
      expect(item).toContain("PENDING_CLIENT_CONFIRMATION");
    }
  });

  it("no publica ninguna gestión de cambio automático", () => {
    /*
     * Se evaluó y se dejó fuera: es la categoría con menos apoyo de todas.
     * Su línea sigue en la lista de pendientes, pero no en la página.
     */
    const published = REPRO_OPTIONS.map((option) => option.name).join(" ");
    expect(published.toLowerCase()).not.toContain("cambio");
  });
});

describe("la banda funciona sin JavaScript", () => {
  const component = read("components", "PowerBand.astro");
  const script = read("scripts", "power-band.ts");

  it("sirve una curva por objetivo ya dibujada en el HTML", () => {
    for (const goal of REPRO_GOALS) {
      expect(
        component,
        `${goal.id}: falta su curva estática`
      ).toContain(`pb-only-${goal.id}`);
      expect(component).toContain(`pb-zone-${goal.id}`);
    }
  });

  it("el control es un grupo de radios, no un botón muerto", () => {
    expect(component).toContain('type="radio"');
    expect(component).toContain("<fieldset");
  });

  it("el script no se ejecuta si se ha pedido menos movimiento", () => {
    expect(script).toContain('classList.contains("js-anim")');
  });

  it("el relevo al dibujo vivo pasa por una sola clase", () => {
    expect(script).toContain('classList.add("is-live")');
    expect(component).toContain(".pb.is-live");
  });
});

describe("el acordeón de opciones", () => {
  const source = read("components", "ServiceOptions.astro");
  // Sin el frontmatter: los comentarios explican por qué no hay
  // `aria-expanded`, y tienen que poder nombrarlo.
  const component = markup(source);

  it("es un grupo de <details>, así que se abre sin JavaScript", () => {
    /*
     * Un <button> con aria-expanded necesita JavaScript para abrir el panel, y
     * en esta web nada que haya que leer puede depender de que llegue un
     * archivo. <summary> ya tiene rol de botón y estado expandido nativos.
     */
    expect(component).toContain("<details");
    expect(component).toContain("<summary");
    expect(component).not.toContain("aria-expanded");
  });

  it("solo deja una abierta a la vez", () => {
    // El atributo `name` es el acordeón exclusivo nativo.
    expect(component).toContain("name={`${id}-abanico`}");
  });

  it("cierra la primera en móvil, y solo eso", () => {
    // Es lo único que hace JavaScript aquí; sin él se queda abierta.
    expect(source).toContain("max-width: 47.9375rem");
    expect(source).toContain("data-opt-first");
  });

  it("abre la primera y solo la primera", () => {
    expect(component).toContain("open={i === 0}");
  });

  it("anima la altura sin medirla en JavaScript", () => {
    expect(component).toContain("::details-content");
    expect(component).toContain("interpolate-size: allow-keywords");
  });

  it("hace pulsable la fila entera, no solo el título", () => {
    // El indicador va dentro del <summary>, que ocupa el ancho completo.
    expect(component).toContain("opt-summary");
    expect(component).toContain("justify-content: space-between");
  });
});

describe("el atajo hasta el configurador", () => {
  const source = read("components", "CalcLink.astro");
  // El destino se declara en el frontmatter; los atributos, en el marcado.
  const component = markup(source);
  const page = pageMarkup();

  it("es un ancla interna, no un enlace externo", () => {
    /*
     * El configurador está en esta misma página. El botón solo evita
     * recorrerla entera; no manda a nadie a otro dominio, ni abre pestañas.
     */
    expect(source).toContain('const TARGET = "#configurador"');
    expect(component).not.toContain("target=");
    expect(component).not.toContain("rel=");
    expect(component).not.toContain("tuning-shop.com");
  });

  it("apunta a una sección que existe en la página", () => {
    expect(page).toContain('id="configurador"');
    // Sin `scroll-mt` el titular queda debajo de la cabecera fija al saltar.
    expect(page).toContain("scroll-mt-24");
  });

  it("está en el hero y en la pestaña lateral, y en ningún sitio más", () => {
    const uses = page.match(/<CalcLink/g) ?? [];
    expect(uses).toHaveLength(2);
    expect(page).toContain('<CalcLink variant="rail" />');
  });

  it("el hero ofrece las tres acciones, con WhatsApp primero", () => {
    const hero = page.slice(0, page.indexOf("EL TRAMO CON RAÍL"));
    expect(hero.indexOf("<WhatsAppLink")).toBeGreaterThan(-1);
    expect(hero.indexOf("<WhatsAppLink")).toBeLessThan(hero.indexOf('href="#banda"'));
    expect(hero.indexOf('href="#banda"')).toBeLessThan(hero.indexOf("<CalcLink"));
  });

  it("el marco del proveedor sigue montado y sigue sin cargarse solo", () => {
    /*
     * Es la única petición a un tercero de la web pública, y lo que la hace
     * defendible es que no sale hasta que el visitante la pide.
     */
    expect(page).toContain("<PowerConfigurator");

    const configurator = read("components", "PowerConfigurator.astro");
    expect(configurator).toContain("data-configurator-open");
    expect(configurator).toContain("<noscript>");
  });
});
