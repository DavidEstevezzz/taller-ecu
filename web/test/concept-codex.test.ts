/** Protege el aislamiento, la veracidad y la degradación de la maqueta Codex. */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CONTACT,
  REPRO_GOALS,
  REPRO_OPTIONS,
  REPRO_SEND,
} from "../src/config/site";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const COMPONENT_DIR = join(SRC, "components", "concepto-codex");

const CONCEPT_FILES = [
  join(SRC, "pages", "conceptos", "reprogramacion-codex.astro"),
  join(SRC, "layouts", "ConceptoCodexLayout.astro"),
  join(SRC, "styles", "concept-codex.css"),
  join(SRC, "scripts", "concept-codex-response.ts"),
  ...readdirSync(COMPONENT_DIR).map((name) => join(COMPONENT_DIR, name)),
];

const read = (path: string): string => readFileSync(path, "utf8");

function markup(source: string): string {
  return source
    .replace(/^---[\s\S]*?\n---/, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "");
}

function siteTemplates(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (/^concepto-/.test(entry.name) || entry.name === "conceptos") continue;
      files.push(...siteTemplates(full));
      continue;
    }
    if (/\.(astro|ts)$/.test(entry.name)) files.push(full);
  }
  return files;
}

describe("la variante permanece interna y aislada", () => {
  const layout = read(join(SRC, "layouts", "ConceptoCodexLayout.astro"));

  it("declara noindex, nofollow y no emite una canónica", () => {
    expect(layout).toContain('content="noindex, nofollow"');
    for (const file of CONCEPT_FILES) {
      expect(read(file), relative(ROOT, file)).not.toContain('rel="canonical"');
    }
  });

  it("declara el esquema oscuro nativo para controles y navegador", () => {
    expect(read(join(SRC, "styles", "concept-codex.css"))).toContain(
      "color-scheme: dark"
    );
  });

  it("queda fuera del sitemap, bloqueada en robots y sin enlaces públicos", () => {
    expect(read(join(ROOT, "astro.config.mjs"))).toContain(
      '!page.includes("/conceptos")'
    );
    expect(read(join(SRC, "pages", "robots.txt.ts"))).toContain(
      "Disallow: /conceptos"
    );

    const route = "/conceptos/reprogramacion-codex";
    const linked = siteTemplates(SRC).filter((file) => read(file).includes(route));
    expect(linked.map((file) => relative(ROOT, file))).toEqual([]);
  });

  it("no importa el sistema visual ni las piezas de los otros conceptos", () => {
    const forbidden = [
      "PublicLayout",
      "SiteHeader",
      "SiteFooter",
      "Seo.astro",
      "tokens.css",
      "concept-b",
      "concept-c.css",
      "ConceptoB",
      "ConceptoCLayout",
    ];

    for (const file of CONCEPT_FILES) {
      const imports = Array.from(
        read(file).matchAll(/^\s*import\s+[\s\S]*?["']([^"']+)["']/gm),
        (match) => match[1]!
      );
      for (const specifier of imports) {
        for (const name of forbidden) {
          expect(
            specifier.includes(name),
            `${relative(ROOT, file)} importa ${specifier}`
          ).toBe(false);
        }
      }
    }
  });

  it("no escribe el teléfono a mano", () => {
    for (const file of CONCEPT_FILES) {
      const source = read(file);
      expect(source, relative(ROOT, file)).not.toContain(CONTACT.whatsappNumber);
      expect(source, relative(ROOT, file)).not.toContain(CONTACT.whatsappDisplay);
    }
  });
});

describe("las interacciones conservan contenido sin JavaScript", () => {
  const delivery = read(
    join(COMPONENT_DIR, "CdxDeliveryStudio.astro")
  );
  const stages = read(join(COMPONENT_DIR, "CdxStageSelector.astro"));
  const script = read(join(SRC, "scripts", "concept-codex-response.ts"));

  it("sirve un radio, una curva y una respuesta por objetivo", () => {
    expect(delivery).toContain('type="radio"');
    expect(REPRO_GOALS).toHaveLength(5);
    expect(delivery).toContain("REPRO_GOALS.map");
    expect(delivery).toContain("cdx-response__only--${goal.id}");
    expect(delivery).toContain("cdx-response__zone--${goal.id}");
  });

  it("solo interpola la curva si el movimiento está permitido", () => {
    expect(script).toContain('classList.contains("cdx-motion")');
    expect(script).toContain('classList.add("is-live")');
    expect(delivery).toContain(".cdx-response.is-live");
  });

  it("sustituye el acordeón por un selector nativo con cinco paneles", () => {
    expect(stages).toContain('type="radio"');
    expect(markup(stages)).not.toContain("<details");
    expect(markup(stages)).not.toContain("<summary");
    expect(REPRO_OPTIONS).toHaveLength(5);
    expect(stages).toContain("REPRO_OPTIONS.map");
    expect(stages).toContain("cdx-stage__pane--${option.id}");
  });
});

describe("el recorrido comercial conserva los contratos", () => {
  const page = read(
    join(SRC, "pages", "conceptos", "reprogramacion-codex.astro")
  );
  const configurator = read(join(COMPONENT_DIR, "CdxConfigurator.astro"));

  it("mantiene el hero de A y no muestra pies de imagen", () => {
    expect(page).toContain("coche-tunel-noche.jpg");
    expect(markup(page)).not.toContain("Imágenes de referencia");
    expect(markup(page)).not.toContain("Imagen de referencia");
  });

  it("mantiene los cuatro datos de consulta y las plantillas centralizadas", () => {
    expect(REPRO_SEND).toHaveLength(4);
    expect(page).toContain("REPRO_SEND.map");
    expect(page).toContain("REPRO_MESSAGE");
  });

  it("ofrece Calcular mejora y lleva directamente a la sección de datos", () => {
    expect(page).toContain('class="cdx-calc" href="#datos"');
    expect(page).toContain('id="datos"');
  });

  it("carga Tuning-shop solo al solicitarlo y conserva el Referer en el fallback", () => {
    expect(configurator).toContain("TUNING_SHOP");
    expect(configurator).toContain("data-configurator-open");
    expect(configurator).toContain('rel="noopener"');
    expect(configurator).toContain('referrerpolicy="origin"');
    expect(configurator).toContain("scripts/configurator");
    expect(configurator).toContain("<noscript>");
    expect(configurator).toContain("no mediciones de JM Repro Cars");
  });
});

describe("no se inventan resultados", () => {
  const numberWithUnit = /\b\d+([.,]\d+)?\s?(cv|hp|bhp|nm|kw|%|€)\b/i;

  it("no publica potencias, porcentajes ni precios", () => {
    const found: string[] = [];
    for (const file of CONCEPT_FILES) {
      if (file.endsWith(".css")) continue;
      for (const line of markup(read(file)).split("\n")) {
        const match = line.match(numberWithUnit);
        if (match) found.push(`${relative(ROOT, file)}: ${match[0]}`);
      }
    }
    expect(found).toEqual([]);
  });
});
