/**
 * Protege dos reglas de la web pública que no se ven fallar en desarrollo.
 *
 * 1. La normalización de rutas. Con `build.format: "file"` el `pathname` trae
 *    el `.html` durante la compilación, así que comparar rutas en crudo
 *    funciona en `astro dev` y falla en el HTML generado. Es exactamente lo
 *    que le pasaba a la cabecera: `aria-current="page"` no llegaba nunca.
 *
 * 2. Ningún enlace del sitio apunta a una página que no existe. Los servicios
 *    llevan su destino en la configuración, y basta con que alguien escriba
 *    `page` antes de crear el archivo para publicar un enlace roto.
 *
 * 3. Ningún `href` escrito a mano en una plantilla apunta a una ruta que no
 *    existe. Es el caso que aparece al crear una página nueva: los enlaces
 *    provisionales hacia el ancla que la sustituía se quedan atrás, y en el
 *    HTML generado no se distinguen de un enlace bueno.
 */
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { normalisePath } from "../src/lib/path";
import { SERVICES } from "../src/config/site";

/* Vitest se ejecuta desde web/, que es la raíz del proyecto frontend. */
const SRC_DIR = join(process.cwd(), "src");
const PAGES_DIR = join(SRC_DIR, "pages");
const PUBLIC_DIR = join(process.cwd(), "public");

/** Todas las rutas que el build va a generar, leídas de src/pages. */
function allRoutes(dir = PAGES_DIR, prefix = ""): string[] {
  const routes: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      routes.push(...allRoutes(join(dir, entry.name), `${prefix}/${entry.name}`));
      continue;
    }

    if (!entry.name.endsWith(".astro")) continue;

    const name = entry.name.replace(/\.astro$/, "");
    routes.push(name === "index" ? `${prefix}/` : `${prefix}/${name}`);
  }

  return routes;
}

/** Las públicas: sin el panel y sin la página de error. */
function publicRoutes(): string[] {
  return allRoutes().filter(
    (route) => !route.startsWith("/admin") && route !== "/404"
  );
}

/** Plantillas donde puede haber un `href` escrito a mano. */
function templates(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...templates(full));
      continue;
    }

    if (entry.name.endsWith(".astro")) files.push(full);
  }

  return files;
}

describe("normalisePath", () => {
  it("quita la extensión que añade build.format file", () => {
    expect(normalisePath("/servicios/reparacion-ecu.html")).toBe(
      "/servicios/reparacion-ecu"
    );
  });

  it("deja la portada como /", () => {
    expect(normalisePath("/index.html")).toBe("/");
    expect(normalisePath("/")).toBe("/");
    expect(normalisePath("")).toBe("/");
  });

  it("aplica la política de sin barra final", () => {
    expect(normalisePath("/servicios/")).toBe("/servicios");
    expect(normalisePath("/servicios")).toBe("/servicios");
  });

  it("hace coincidir la ruta compilada con el href del enlace", () => {
    for (const service of SERVICES) {
      if (service.page === null) continue;
      expect(normalisePath(`${service.page}.html`)).toBe(
        normalisePath(service.page)
      );
    }
  });
});

describe("enlaces de los servicios", () => {
  const routes = new Set(publicRoutes().map(normalisePath));

  it("encuentra las páginas públicas", () => {
    expect(routes.has("/")).toBe(true);
    expect(routes.has("/servicios")).toBe(true);
  });

  it("no publica ningún enlace a una página que no existe", () => {
    for (const service of SERVICES) {
      const [path] = service.href.split("#");
      expect(
        routes.has(normalisePath(path!)),
        `${service.slug}: href apunta a ${path}, que no existe`
      ).toBe(true);
    }
  });

  it("solo declara `page` cuando el archivo está escrito", () => {
    for (const service of SERVICES) {
      if (service.page === null) continue;
      expect(
        routes.has(normalisePath(service.page)),
        `${service.slug}: page apunta a ${service.page}, que no existe`
      ).toBe(true);
    }
  });

  it("manda a /servicios el servicio que todavía no tiene página", () => {
    for (const service of SERVICES) {
      if (service.page !== null) continue;
      expect(service.href.startsWith("/servicios#")).toBe(true);
    }
  });

  it("hace que `href` y `page` coincidan cuando la página existe", () => {
    for (const service of SERVICES) {
      if (service.page === null) continue;
      expect(
        service.href,
        `${service.slug}: href y page no apuntan al mismo sitio`
      ).toBe(service.page);
    }
  });
});

describe("enlaces escritos en las plantillas", () => {
  const routes = new Set(allRoutes().map(normalisePath));
  const files = [
    ...templates(PAGES_DIR),
    ...templates(join(SRC_DIR, "components")),
    ...templates(join(SRC_DIR, "layouts")),
  ];

  /** `href="/algo"` y `href="/algo#ancla"`, no expresiones ni externos. */
  const HREF = /href="(\/[^"?]*)"/g;

  it("encuentra plantillas que revisar", () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it("no deja ningún enlace interno hacia una ruta inexistente", () => {
    const broken: string[] = [];

    for (const file of files) {
      const source = readFileSync(file, "utf8");

      for (const match of source.matchAll(HREF)) {
        const value = match[1]!;
        const [path] = value.split("#");
        const route = normalisePath(path!);

        // El ancla suelta dentro de la misma página («#contenido») entra como
        // ruta vacía y no hay nada que comprobar.
        if (route === "/" && !path) continue;
        if (routes.has(route)) continue;
        // Archivos servidos tal cual desde public/, como el favicon.
        if (existsSync(join(PUBLIC_DIR, route))) continue;

        broken.push(`${relative(process.cwd(), file)} → ${value}`);
      }
    }

    expect(broken, `enlaces rotos:\n${broken.join("\n")}`).toEqual([]);
  });
});
