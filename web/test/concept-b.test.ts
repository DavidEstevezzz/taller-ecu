/**
 * Protege las reglas del Concepto B, que son de dos clases y las dos se
 * rompen sin que nada se queje:
 *
 * 1. **Aislamiento.** Es una maqueta interna. No puede indexarse, no puede
 *    entrar en el sitemap, no puede enlazarse desde una página pública y —lo
 *    más fácil de romper meses después— no puede empezar a compartir
 *    componentes, capas ni tokens con el sitio. El día que importe
 *    `PublicLayout` o `tokens.css` dejará de ser una alternativa aislada y
 *    pasará a ser una página capaz de cambiar el aspecto de las demás.
 *
 * 2. **Veracidad.** Un concepto es justo donde más tienta inventar una cifra
 *    para que la maqueta luzca. Aquí no hay potencias, ni porcentajes, ni
 *    precios, ni plazos, igual que en el resto del sitio.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { CONTACT, REPRO_OPTIONS } from "../src/config/site";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const CONCEPT_FILES = [
  join(SRC, "pages", "conceptos", "reprogramacion-b.astro"),
  join(SRC, "layouts", "ConceptoBLayout.astro"),
  join(SRC, "styles", "concept-b.css"),
  join(SRC, "scripts", "concept-b-case.ts"),
  ...readdirSync(join(SRC, "components", "concepto-b")).map((name) =>
    join(SRC, "components", "concepto-b", name)
  ),
];

const read = (path: string): string => readFileSync(path, "utf8");

/** El marcado real: sin frontmatter, sin comentarios y sin estilos. */
function markup(source: string): string {
  return source
    .replace(/^---[\s\S]*?\n---/, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "");
}

/** Plantillas del sitio, excluidas las del concepto. */
function siteTemplates(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "concepto-b" || entry.name === "conceptos") continue;
      files.push(...siteTemplates(full));
      continue;
    }

    if (!/\.(astro|ts)$/.test(entry.name)) continue;
    if (entry.name.startsWith("ConceptoB") || entry.name.startsWith("concept-b")) {
      continue;
    }

    files.push(full);
  }

  return files;
}

describe("el concepto no se publica", () => {
  const layout = read(join(SRC, "layouts", "ConceptoBLayout.astro"));

  it("declara noindex, nofollow", () => {
    expect(layout).toContain('content="noindex, nofollow"');
  });

  it("no declara ninguna canónica", () => {
    /*
     * Ni hacia sí misma —diría que es una página pública definitiva— ni hacia
     * la página real, que diría que este borrador es una variante suya.
     */
    for (const file of CONCEPT_FILES) {
      expect(read(file), `${relative(ROOT, file)} declara una canónica`).not.toContain(
        "canonical"
      );
    }
  });

  it("queda fuera del sitemap y bloqueado en robots", () => {
    expect(read(join(ROOT, "astro.config.mjs"))).toContain('!page.includes("/conceptos")');
    expect(read(join(SRC, "pages", "robots.txt.ts"))).toContain("Disallow: /conceptos");
  });

  it("no está enlazado desde ninguna página del sitio", () => {
    /*
     * Se busca un enlace, no la palabra: `robots.txt.ts` nombra la ruta para
     * bloquearla, que es justo lo contrario de enlazarla.
     */
    const ENLACE = /href\s*=\s*["'{][^"'}]*\/conceptos/;
    const linked: string[] = [];

    for (const file of siteTemplates(SRC)) {
      if (ENLACE.test(read(file))) linked.push(relative(ROOT, file));
    }

    expect(linked, `enlazan al concepto:\n${linked.join("\n")}`).toEqual([]);
  });
});

describe("el concepto está aislado del sistema del sitio", () => {
  /*
   * Lo que hace verificable la comparación: si el concepto pudiera tocar la
   * capa, la cabecera, el pie o los tokens del sitio, cualquier prueba visual
   * suya sería también un cambio en las otras ocho páginas.
   */
  const PROHIBIDOS = [
    "PublicLayout",
    "SiteHeader",
    "SiteFooter",
    "Seo.astro",
    "tokens.css",
    "BrandMark",
    "tailwindcss",
  ];

  /**
   * Lo que un archivo importa de verdad. Se mira el `import`, no el texto: los
   * comentarios de estas piezas explican precisamente por qué NO importan el
   * sistema del sitio, y tienen que poder nombrarlo.
   */
  function imports(source: string): string[] {
    const found: string[] = [];

    for (const match of source.matchAll(/^\s*import\s+[\s\S]*?["']([^"']+)["']/gm)) {
      found.push(match[1]!);
    }

    for (const match of source.matchAll(/@import\s+["']([^"']+)["']/g)) {
      found.push(match[1]!);
    }

    return found;
  }

  for (const file of CONCEPT_FILES) {
    it(`${relative(ROOT, file)} no importa piezas compartidas de presentación`, () => {
      for (const specifier of imports(read(file))) {
        for (const name of PROHIBIDOS) {
          expect(
            specifier.includes(name),
            `${relative(ROOT, file)} importa ${specifier}`
          ).toBe(false);
        }
      }
    });
  }

  it("reutiliza la configuración y la lógica que sí son compartidas", () => {
    const whatsapp = read(join(SRC, "components", "concepto-b", "CbWhatsApp.astro"));
    const configurador = read(
      join(SRC, "components", "concepto-b", "CbConfigurator.astro")
    );

    /* El número, el enlace y el marco de terceros no se reimplementan. */
    expect(whatsapp).toContain("whatsappUrl");
    expect(configurador).toContain("scripts/configurator");
    expect(configurador).toContain("TUNING_SHOP");
  });

  it("no escribe el teléfono a mano en ninguna plantilla del concepto", () => {
    for (const file of CONCEPT_FILES) {
      const source = read(file);
      expect(source, `${relative(ROOT, file)}`).not.toContain(CONTACT.whatsappNumber);
      expect(source, `${relative(ROOT, file)}`).not.toContain(CONTACT.whatsappDisplay);
    }
  });
});

describe("la pieza interactiva sigue funcionando sin JavaScript", () => {
  const selector = read(join(SRC, "components", "concepto-b", "CbCaseSelector.astro"));
  const script = read(join(SRC, "scripts", "concept-b-case.ts"));

  it("el control es un grupo de radios nativo, no un botón muerto", () => {
    expect(selector).toContain("<fieldset");
    expect(selector).toContain('type="radio"');
  });

  it("la decisión de qué se ve la toma el CSS, generado desde la tabla", () => {
    /*
     * Si alguien mueve la lógica al script, la página deja de responder sin
     * JavaScript y no se nota hasta que alguien navega sin él.
     */
    expect(selector).toContain("function decidir(");
    expect(selector).toContain(":has(#cb-v-");
    expect(script).not.toContain("style.display");
  });

  it("la vista previa del mensaje nace oculta", () => {
    // Sin JavaScript no hay nada que previsualizar: un recuadro vacío sería
    // peor que ninguno.
    expect(selector).toContain("data-cb-preview hidden");
  });

  it("ofrece las cinco opciones y ninguna reescribe su texto", () => {
    for (const option of REPRO_OPTIONS) {
      expect(selector, `falta el panel de ${option.id}`).toContain(
        `data-cb-opt={option.id}`
      );
    }

    expect(selector).toContain("{option.body}");
    expect(selector).toContain("REPRO_OPTIONS");
  });
});

describe("el concepto no inventa datos", () => {
  /** Cifras con unidad: potencias, pares, porcentajes, precios. */
  const CIFRA = /\b\d+([.,]\d+)?\s?(cv|hp|bhp|nm|kw|%|€)\b/i;

  it("no publica ninguna potencia, porcentaje ni precio", () => {
    const found: string[] = [];

    for (const file of CONCEPT_FILES) {
      if (file.endsWith(".css")) continue;

      for (const line of markup(read(file)).split("\n")) {
        const match = line.match(CIFRA);
        if (match) found.push(`${relative(ROOT, file)}: ${match[0]}`);
      }
    }

    expect(found, `cifras publicadas:\n${found.join("\n")}`).toEqual([]);
  });

  it("mantiene el aviso de que las cifras del configurador son ajenas", () => {
    const configurador = read(
      join(SRC, "components", "concepto-b", "CbConfigurator.astro")
    );

    expect(configurador).toContain("no nuestras");
    expect(configurador).toContain("no son un presupuesto");
  });

  it("dice que las fotografías no son trabajos del taller", () => {
    const selector = read(join(SRC, "components", "concepto-b", "CbCaseSelector.astro"));
    expect(selector).toContain("No es un trabajo del taller");
  });
});
