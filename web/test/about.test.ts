/**
 * Protege el contrato de /sobre-nosotros, que es de contenido y no visual.
 *
 * Es la página con más riesgo de todo el sitio: habla del cliente, y casi
 * cualquier frase que se le añada es una afirmación sobre él. Lo que estas
 * pruebas vigilan no es cómo se ve, sino que:
 *
 * 1. **Todo lo provisional sigue centralizado y marcado.** El día que el
 *    cliente confirme sus datos, confirmarlos tiene que ser editar `ABOUT`, no
 *    buscar cadenas por las plantillas.
 * 2. **No aparece ninguna cifra de resultados.** Ni vehículos, ni clientes, ni
 *    plazos, ni garantías, ni porcentajes. La página tiene una sola cifra —los
 *    años— y es la que el cliente tiene que confirmar.
 * 3. **No se cuela ninguna afirmación de las que la web antigua hace sin
 *    respaldo.** «Casi 30 años», «más de 10.000 vehículos» y «pioneros del
 *    sector» están registradas como no verificadas en
 *    docs/site-architecture.md §7, y no pueden aparecer en la web nueva.
 * 4. **Todo lo publicado tiene su línea en `ABOUT_TO_CONFIRM`**, que es el
 *    listado que se repasa con el cliente.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { ABOUT, ABOUT_TO_CONFIRM, CONTACT } from "../src/config/site";

const PAGE = readFileSync(
  join(process.cwd(), "src", "pages", "sobre-nosotros.astro"),
  "utf8"
);

const STRATA = readFileSync(
  join(process.cwd(), "src", "components", "SignalStrata.astro"),
  "utf8"
);

/**
 * El texto que ve el visitante: sin el frontmatter, sin los estilos y sin los
 * comentarios de plantilla. Lo que se comenta en el código no se publica, y
 * mezclarlos hacía saltar la prueba por un «25 %» escrito en un comentario.
 */
function visibleSource(source: string): string {
  const body = source.split(/^---$/m).slice(2).join("---");
  return body
    .replace(/<style>[\s\S]*?<\/style>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "");
}

describe("datos provisionales de /sobre-nosotros", () => {
  it("está marcado como pendiente de confirmación", () => {
    expect(ABOUT.status).toBe("PENDING_CLIENT_CONFIRMATION");
  });

  it("se publica, a diferencia de los datos de contacto sin confirmar", () => {
    // Es una maqueta para enseñar: el cliente no puede corregir lo que no ve.
    // Ninguno de estos datos es de contacto ni compromete a nadie a nada.
    expect(ABOUT.published).toBe(true);
  });

  it("no muestra la etiqueta de pendiente en la interfaz", () => {
    expect(visibleSource(PAGE)).not.toContain("PENDING_CLIENT_CONFIRMATION");
  });

  it("tiene una línea por confirmar para cada dato que publica", () => {
    const ids = ABOUT_TO_CONFIRM.map((item) => item.id);

    for (const id of ["responsable", "anios", "vehiculos", "zona", "fotografia"]) {
      expect(ids, `falta «${id}» en ABOUT_TO_CONFIRM`).toContain(id);
    }

    for (const item of ABOUT_TO_CONFIRM) {
      expect(item.question.length, item.id).toBeGreaterThan(10);
      expect(item.published.length, item.id).toBeGreaterThan(0);
    }
  });

  it("dice de dónde sale cada dato", () => {
    for (const item of ABOUT_TO_CONFIRM) {
      expect(["CLIENTE", "WEB_OFICIAL", "MAQUETA"], item.id).toContain(
        item.source
      );
    }
  });
});

describe("lo que la página no puede afirmar", () => {
  it("no publica ninguna cifra de resultados", () => {
    const text = visibleSource(PAGE);

    for (const forbidden of ["10.000", "10000", "vehículos potenciados"]) {
      expect(text, `la página menciona «${forbidden}»`).not.toContain(forbidden);
    }

    // Ningún porcentaje: no hay ninguna medición que lo sostenga.
    expect(/\d\s*%/.test(text), "la página publica un porcentaje").toBe(false);
  });

  it("no repite las afirmaciones sin verificar de la web antigua", () => {
    const text = visibleSource(PAGE).toLowerCase();

    for (const forbidden of ["30 años", "treinta años", "pionera", "pioneros"]) {
      expect(text, `la página afirma «${forbidden}»`).not.toContain(forbidden);
    }
  });

  it("no promete precio, plazo, garantía ni certificaciones", () => {
    const text = visibleSource(PAGE).toLowerCase();

    for (const forbidden of [
      "garantía",
      "certificad",
      "homologad",
      "precio",
      "plazo",
      "banco de potencia",
    ]) {
      expect(text, `la página menciona «${forbidden}»`).not.toContain(forbidden);
    }
  });

  it("no nombra a nadie más que al responsable", () => {
    // Un equipo inventado es la mentira más fácil de colar en esta página.
    expect(ABOUT.owner.name).toBe("José");
    expect(Object.keys(ABOUT)).not.toContain("team");
  });

  it("mantiene la localidad como única referencia geográfica publicada", () => {
    const item = ABOUT_TO_CONFIRM.find((entry) => entry.id === "zona");

    expect(item?.published).toBe(CONTACT.area);
    expect(CONTACT.address).toBeNull();
  });
});

describe("el corte estratigráfico", () => {
  it("no escribe ninguna cifra, fecha ni referencia en el dibujo", () => {
    // Misma regla que el resto de los dibujos del sitio: un año inventado es
    // un dato técnico inventado, aunque vaya dentro de un SVG.
    const drawing = visibleSource(STRATA);
    const texts = [...drawing.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map(
      (match) => match[1]!
    );

    expect(texts).toEqual([]);
    expect(/\b(19|20)\d{2}\b/.test(drawing), "hay un año en el dibujo").toBe(
      false
    );
  });

  it("calcula la geometría en lugar de escribirla a mano", () => {
    // Ningún `d="…"` literal con coordenadas: la del conductor se construye.
    expect(STRATA).toContain("function conductorPoints()");
    expect(/d="M\s*-?\d/.test(STRATA), "hay un trazado escrito a mano").toBe(
      false
    );
  });

  it("no cuesta ni un byte de JavaScript propio", () => {
    // Usa el mecanismo compartido de tokens.css, medido por motion.ts.
    expect(STRATA).toContain("trace-draw");
    expect(STRATA).not.toContain("<script");
  });
});
