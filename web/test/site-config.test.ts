/**
 * Reglas del contenido del sitio que no deberían poder romperse por
 * descuido al añadir una página o un servicio.
 *
 * La más importante es la primera: **la cabecera solo enseña destinos que
 * son una página pública de verdad**, y se construye filtrando por el campo
 * `page` de cada servicio. Si alguien rellena ese campo antes de escribir la
 * página, la navegación principal empieza a prometer una dirección que
 * devuelve 404, y no hay nada más que lo impida.
 * Ver docs/site-architecture.md §4.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  REPAIR_INTAKE,
  REPAIR_MESSAGE,
  REPAIR_REASONS,
  SERVICES,
  whatsappUrl,
} from "../src/config/site";

/*
 * `import.meta.url` no sirve aquí: el entorno de las pruebas es happy-dom y
 * su URL no es de esquema `file:`. Vitest se ejecuta desde `web/`.
 */
const pagesDir = resolve(process.cwd(), "src/pages");

/** Ruta pública → archivo de página de Astro que debería generarla. */
function pageFile(route: string): string {
  return resolve(pagesDir, `${route.replace(/^\//, "")}.astro`);
}

describe("servicios y navegación", () => {
  it("todo servicio con página propia tiene la página escrita", () => {
    for (const service of SERVICES) {
      if (service.page === null) continue;
      expect(existsSync(pageFile(service.page)), service.page).toBe(true);
    }
  });

  it("el enlace de un servicio con página propia apunta a ella", () => {
    for (const service of SERVICES) {
      if (service.page === null) continue;
      expect(service.href).toBe(service.page);
    }
  });

  it("el enlace de un servicio sin página es un ancla dentro de /servicios", () => {
    for (const service of SERVICES) {
      if (service.page !== null) continue;
      expect(service.href).toBe(`/servicios#${service.slug}`);
    }
  });

  it("reparación de ECU ya tiene página propia", () => {
    const repair = SERVICES.find((s) => s.slug === "reparacion-ecu");
    expect(repair?.page).toBe("/servicios/reparacion-ecu");
  });
});

describe("plantilla de WhatsApp de reparación", () => {
  it("pide los datos que el asistente necesita para una solicitud", () => {
    for (const field of [
      "Marca, modelo y año",
      "Motor",
      "Síntoma",
      "¿Arranca y funciona?",
      "Códigos de error",
      "Referencia de la centralita",
      "Qué se ha probado ya",
    ]) {
      expect(REPAIR_MESSAGE).toContain(field);
    }
  });

  it("marca como opcionales los datos que exigirían desmontar o diagnosticar", () => {
    expect(REPAIR_MESSAGE).toContain("Códigos de error (si los tengo)");
    expect(REPAIR_MESSAGE).toContain("Referencia de la centralita (si la veo)");
  });

  it("viaja codificada en el enlace de WhatsApp, con sus saltos de línea", () => {
    const url = whatsappUrl(REPAIR_MESSAGE);
    expect(url.startsWith("https://wa.me/")).toBe(true);
    expect(url).toContain("%0A");
    expect(decodeURIComponent(url.split("?text=")[1]!)).toBe(REPAIR_MESSAGE);
  });

  it("la ficha de la página y la plantilla piden lo mismo", () => {
    for (const field of REPAIR_INTAKE) {
      expect(REPAIR_MESSAGE).toContain(field.label);
    }
  });

  it("deja continuar sin la referencia de la centralita", () => {
    const reference = REPAIR_INTAKE.find(
      (field) => field.label === "Referencia de la centralita"
    );
    expect(reference?.optional).toBe(true);
  });
});

describe("veracidad del contenido de reparación", () => {
  /*
   * No es un corrector de estilo: es una red contra las afirmaciones
   * que el encargo prohíbe expresamente y que son fáciles de colar al
   * reescribir un texto comercial.
   */
  const forbidden = [
    /\bgarantizad/i,
    /\bgarantía\b/i,
    /\bplazo de\b/i,
    /\d+\s*%/,
    /\b\d+\s*(€|euros)\b/i,
    /\basegurad[ao]\b/i,
  ];

  const texts = [
    ...REPAIR_REASONS.flatMap((r) => [r.title, r.body]),
    ...REPAIR_INTAKE.flatMap((f) => [f.label, f.body]),
    REPAIR_MESSAGE,
  ];

  it("no promete precio, plazo, garantía ni porcentaje de éxito", () => {
    for (const text of texts) {
      for (const pattern of forbidden) {
        expect(pattern.test(text), `${pattern} en «${text}»`).toBe(false);
      }
    }
  });
});
