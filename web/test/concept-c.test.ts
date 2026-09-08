/**
 * Protege las reglas del Concepto C, espejo de las del B
 * (`concept-b.test.ts`), porque se rompen igual de en silencio:
 *
 * 1. **Aislamiento.** Es una maqueta interna: no puede indexarse, no puede
 *    entrar en el sitemap, no puede enlazarse desde una página pública y no
 *    puede empezar a compartir componentes, capas ni tokens con el sitio.
 *
 * 2. **Veracidad.** Sin potencias, porcentajes, precios ni plazos; el banco
 *    de pedal es una demostración conceptual y lo dice al lado.
 *
 * 3. **La pieza interactiva degrada bien.** La figura estática con la misma
 *    comparación viaja en el HTML y nace visible; el pedal nace oculto y solo
 *    lo revela el script cuando hay JavaScript y movimiento permitido.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { CONTACT, REPRO_OPTIONS } from "../src/config/site";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const CONCEPT_FILES = [
  join(SRC, "pages", "conceptos", "reprogramacion-c.astro"),
  join(SRC, "layouts", "ConceptoCLayout.astro"),
  join(SRC, "styles", "concept-c.css"),
  join(SRC, "scripts", "concept-c-pedal.ts"),
  ...readdirSync(join(SRC, "components", "concepto-c")).map((name) =>
    join(SRC, "components", "concepto-c", name)
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

/** Plantillas del sitio, excluidas las de los conceptos. */
function siteTemplates(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (/^concepto-[a-z]$/.test(entry.name) || entry.name === "conceptos") {
        continue;
      }
      files.push(...siteTemplates(full));
      continue;
    }

    if (!/\.(astro|ts)$/.test(entry.name)) continue;
    if (/^Concepto[A-Z]|^concept-/.test(entry.name)) continue;

    files.push(full);
  }

  return files;
}

describe("el concepto no se publica", () => {
  const layout = read(join(SRC, "layouts", "ConceptoCLayout.astro"));

  it("declara noindex, nofollow", () => {
    expect(layout).toContain('content="noindex, nofollow"');
  });

  it("no declara ninguna canónica", () => {
    for (const file of CONCEPT_FILES) {
      expect(
        read(file),
        `${relative(ROOT, file)} declara una canónica`
      ).not.toContain("canonical");
    }
  });

  it("queda fuera del sitemap y bloqueado en robots", () => {
    expect(read(join(ROOT, "astro.config.mjs"))).toContain(
      '!page.includes("/conceptos")'
    );
    expect(read(join(SRC, "pages", "robots.txt.ts"))).toContain(
      "Disallow: /conceptos"
    );
  });

  it("no está enlazado desde ninguna página del sitio", () => {
    const ENLACE = /href\s*=\s*["'{][^"'}]*\/conceptos/;
    const linked: string[] = [];

    for (const file of siteTemplates(SRC)) {
      if (ENLACE.test(read(file))) linked.push(relative(ROOT, file));
    }

    expect(linked, `enlazan al concepto:\n${linked.join("\n")}`).toEqual([]);
  });
});

describe("el concepto está aislado del sistema del sitio", () => {
  const PROHIBIDOS = [
    "PublicLayout",
    "SiteHeader",
    "SiteFooter",
    "Seo.astro",
    "tokens.css",
    "BrandMark",
    "tailwindcss",
    /* Tampoco puede apoyarse en el otro concepto: son alternativas. */
    "ConceptoB",
    "concept-b",
  ];

  /** Lo que un archivo importa de verdad: el `import`, no el texto. */
  function imports(source: string): string[] {
    const found: string[] = [];

    for (const match of source.matchAll(
      /^\s*import\s+[\s\S]*?["']([^"']+)["']/gm
    )) {
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
    const whatsapp = read(
      join(SRC, "components", "concepto-c", "CcWhatsApp.astro")
    );
    const configurador = read(
      join(SRC, "components", "concepto-c", "CcConfigurator.astro")
    );

    expect(whatsapp).toContain("whatsappUrl");
    expect(configurador).toContain("scripts/configurator");
    expect(configurador).toContain("TUNING_SHOP");
  });

  it("no escribe el teléfono a mano en ninguna plantilla del concepto", () => {
    for (const file of CONCEPT_FILES) {
      const source = read(file);
      expect(source, `${relative(ROOT, file)}`).not.toContain(
        CONTACT.whatsappNumber
      );
      expect(source, `${relative(ROOT, file)}`).not.toContain(
        CONTACT.whatsappDisplay
      );
    }
  });
});

describe("el banco de pedal degrada bien", () => {
  const bench = read(
    join(SRC, "components", "concepto-c", "CcPedalBench.astro")
  );
  const script = read(join(SRC, "scripts", "concept-c-pedal.ts"));

  it("la figura estática viaja en el HTML y nace visible", () => {
    expect(bench).toContain("data-pedal-static");
    /* El `<svg>` de la figura no puede llevar `hidden` de serie. */
    expect(markup(bench)).not.toMatch(/data-pedal-static[^>]*\shidden/);
  });

  it("el pedal y el lienzo nacen ocultos: solo el script los revela", () => {
    expect(markup(bench)).toMatch(/data-pedal-button\s+hidden/);
    expect(markup(bench)).toMatch(/data-pedal-canvas\s+hidden/);
  });

  it("el control es un botón de verdad y respeta el movimiento reducido", () => {
    expect(bench).toContain('type="button"');
    expect(script).toContain('classList.contains("cc-motion")');
  });

  it("pisar con la barra espaciadora no desplaza la página", () => {
    expect(script).toContain("preventDefault");
  });

  it("dice al lado que es una demostración conceptual", () => {
    expect(bench).toContain("Demostración conceptual");
    expect(bench).toContain("no es una medición");
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

  it("presenta las cinco opciones con su nombre de site.ts", () => {
    const page = read(join(SRC, "pages", "conceptos", "reprogramacion-c.astro"));
    expect(page).toContain("REPRO_OPTIONS");
    /* Y su fila «para quién» existe para cada id, sin opciones nuevas. */
    for (const option of REPRO_OPTIONS) {
      expect(page, `falta la línea de ${option.id}`).toContain(
        `"${option.id}"` /* clave del mapa PARA_QUIEN */
      );
    }
  });

  it("mantiene el aviso de que las cifras del configurador son ajenas", () => {
    const configurador = read(
      join(SRC, "components", "concepto-c", "CcConfigurator.astro")
    );

    expect(configurador).toContain("no nuestras");
    expect(configurador).toContain("no son un presupuesto");
  });

  it("las siluetas se declaran como dibujos, no como vehículos reales", () => {
    const vehicles = read(
      join(SRC, "components", "concepto-c", "CcVehicles.astro")
    );
    expect(vehicles).toContain("Silueta de perfil");
  });
});
