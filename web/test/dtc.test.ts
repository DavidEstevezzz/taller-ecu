/**
 * Protege las reglas de /servicios/diagnostico-dtc que no se ven fallar.
 *
 * 1. **Ningún código de avería concreto se publica.** En cuanto se escribe uno
 *    completo se está afirmando qué significa, y eso depende del vehículo, de
 *    la unidad y del contexto. Es exactamente la clase de dato que se cuela al
 *    «poner un ejemplo» meses después.
 * 2. **El diagnóstico no es una intervención.** Hay frases en el sitio que
 *    enumeran en qué puede acabar un caso, y el diagnóstico no es un
 *    desenlace: es lo que se hace para llegar a uno. Si alguien cambia
 *    `kind`, esas frases empiezan a decir «el trabajo será un diagnóstico».
 * 3. **La densidad acordada.** La página se rehízo porque documentaba el
 *    procedimiento —mil cuatrocientas palabras— en lugar de ayudar a decidir.
 *    Seis situaciones con respuesta corta, cuatro datos que pedir, un abanico
 *    de una frase y ninguna plantilla a la vista. Todo eso se rompe añadiendo
 *    «solo un párrafo más», y no falla nada al hacerlo.
 * 4. **El dibujo no lleva texto dentro.** Es lo que le permite sobrevivir a
 *    cualquier escala, y lo que obligaba a esconder el tablero anterior por
 *    debajo de 1024 px.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SERVICES,
  INTERVENTIONS,
  SERVICE_BY_SLUG,
  SERVICE_DETAILS,
  DTC_CAVEAT,
  DTC_MESSAGE,
  DTC_MESSAGE_LINES,
  DTC_SEND,
  DTC_SITUATIONS,
  DTC_SOLUTIONS,
  CONTACT_ROUTES,
} from "../src/config/site";

const SRC_DIR = join(process.cwd(), "src");

/**
 * El marcado de la página, sin el bloque de frontmatter ni los comentarios
 * HTML: lo que de verdad acaba delante del visitante.
 */
function pageMarkup(): string {
  const source = readFileSync(
    join(SRC_DIR, "pages", "servicios", "diagnostico-dtc.astro"),
    "utf8"
  );

  return source
    .replace(/^---[\s\S]*?\n---/, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Todo lo que acaba en el HTML: plantillas, configuración y scripts. */
function sources(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...sources(full));
      continue;
    }

    if (/\.(astro|ts|tsx)$/.test(entry.name)) files.push(full);
  }

  return files;
}

/**
 * La forma de un código de avería: letra de sistema, dígito de origen y tres
 * caracteres más. No distingue uno real de uno inventado, y da igual: no se
 * publica ninguno.
 */
const DTC_CODE = /\b[PBCU][0-3][0-9A-F]{3}\b/;

describe("no se publica ningún código de avería concreto", () => {
  it("no aparece en ninguna plantilla ni configuración", () => {
    const found: string[] = [];

    for (const file of sources(SRC_DIR)) {
      const text = readFileSync(file, "utf8");

      for (const line of text.split("\n")) {
        const match = line.match(DTC_CODE);
        if (match) found.push(`${relative(process.cwd(), file)}: ${match[0]}`);
      }
    }

    expect(
      found,
      `códigos concretos publicados:\n${found.join("\n")}`
    ).toEqual([]);
  });

  it("la advertencia se dice una sola vez y de forma natural", () => {
    expect(DTC_CAVEAT).toBe(
      "Un código por sí solo no confirma qué pieza está averiada."
    );

    /*
     * La versión anterior repartía esta idea por cuatro bloques y dejaba de
     * leerse. Ahora sale de un solo sitio —`DTC_CAVEAT`, dentro del tablero—,
     * así que escribirla a mano en el marcado significa repetirla.
     *
     * Se comprueba sobre el marcado, no sobre el archivo entero: los
     * comentarios explican por qué la regla existe y tienen que poder
     * nombrarla.
     */
    expect(pageMarkup()).not.toContain("no confirma qué pieza");
  });
});

describe("el diagnóstico es un servicio, no una intervención", () => {
  it("está en SERVICES con página propia", () => {
    const service = SERVICE_BY_SLUG["diagnostico-dtc"];
    expect(service.page).toBe("/servicios/diagnostico-dtc");
    expect(service.href).toBe(service.page);
    expect(service.kind).toBe("diagnosis");
  });

  it("queda fuera de INTERVENTIONS", () => {
    expect(INTERVENTIONS.map((service) => service.slug)).not.toContain(
      "diagnostico-dtc"
    );
    expect(INTERVENTIONS).toHaveLength(SERVICES.length - 1);
  });

  it("abre la lista: es por donde se entra", () => {
    expect(SERVICES[0]!.slug).toBe("diagnostico-dtc");
  });

  it("no lleva número de orden: los servicios no son una secuencia", () => {
    for (const service of SERVICES) {
      expect(service).not.toHaveProperty("index");
    }
  });

  it("tiene detalle en /servicios y ruta en /contacto", () => {
    expect(SERVICE_DETAILS["diagnostico-dtc"]).toBeDefined();
    expect(CONTACT_ROUTES.map((route) => route.id)).toContain(
      "diagnostico-dtc"
    );
  });

  it("empareja cada ruta de contacto con su propio servicio", () => {
    for (const route of CONTACT_ROUTES) {
      expect(
        route.service.slug,
        `${route.id}: la ruta apunta a otro servicio`
      ).toBe(route.id);
    }
  });
});

describe("contenido de la página", () => {
  it("no promete precio, plazo, garantía ni resultado", () => {
    const text = [
      ...DTC_SITUATIONS.map((item) => `${item.title} ${item.answer}`),
      ...DTC_SOLUTIONS.map((item) => `${item.title} ${item.body}`),
      DTC_MESSAGE,
    ]
      .join(" ")
      .toLowerCase();

    for (const word of ["precio", "€", "garantía", "plazo", "24 h", "urgente"]) {
      expect(text, `aparece «${word}»`).not.toContain(word);
    }
  });

  it("mantiene la plantilla de WhatsApp con todos los campos en blanco", () => {
    // La primera línea es el encabezado; la segunda, la separación.
    for (const line of DTC_MESSAGE_LINES.slice(2)) {
      expect(line.endsWith(":"), `«${line}» llega rellenado`).toBe(true);
    }
  });

  it("usa la misma plantilla en la página y en /contacto", () => {
    const route = CONTACT_ROUTES.find(
      (item) => item.id === "diagnostico-dtc"
    )!;
    expect(route.messages.particular.join("\n")).toBe(DTC_MESSAGE);
  });
});

describe("densidad de la página", () => {
  /*
   * La página se rehízo porque documentaba el procedimiento en lugar de
   * ayudar a decidir. Estas tres cifras son el acuerdo, y son fáciles de
   * romper añadiendo «solo un párrafo más».
   */
  it("mantiene seis situaciones con una respuesta corta cada una", () => {
    expect(DTC_SITUATIONS).toHaveLength(6);

    for (const item of DTC_SITUATIONS) {
      const words = item.answer.trim().split(/\s+/).length;
      expect(
        words,
        `${item.id}: la respuesta tiene ${words} palabras`
      ).toBeLessThanOrEqual(28);
    }
  });

  it("pide cuatro datos, no siete", () => {
    expect(DTC_SEND).toHaveLength(4);
  });

  it("ofrece un abanico de soluciones de una frase", () => {
    expect(DTC_SOLUTIONS.length).toBeGreaterThanOrEqual(5);
    expect(DTC_SOLUTIONS.length).toBeLessThanOrEqual(6);

    for (const item of DTC_SOLUTIONS) {
      const words = item.body.trim().split(/\s+/).length;
      expect(words, `«${item.title}»: ${words} palabras`).toBeLessThanOrEqual(
        14
      );
    }
  });

  it("no enseña la plantilla completa en la página", () => {
    // La plantilla vive en el enlace, no en un <pre> a la vista.
    const markup = pageMarkup();
    expect(markup).not.toContain("DTC_MESSAGE_LINES");
    expect(markup).not.toContain("<pre");
  });
});

describe("el tablero de síntomas", () => {
  const component = readFileSync(
    join(SRC_DIR, "components", "SymptomRoute.astro"),
    "utf8"
  );

  it("dibuja un camino por situación", () => {
    const routes = component.slice(
      component.indexOf("const ROUTES"),
      component.indexOf("/* Textura")
    );

    expect(routes.match(/line\(/g) ?? []).toHaveLength(DTC_SITUATIONS.length);
  });

  it("no mete ni un rótulo dentro del dibujo", () => {
    /*
     * Era el defecto de la versión anterior: cinco rótulos de procedimiento
     * dentro del SVG obligaban a esconder el tablero por debajo de 1024 px.
     * Sin texto dentro, el dibujo sobrevive a cualquier escala.
     */
    expect(component).not.toContain("<text");
  });
});
