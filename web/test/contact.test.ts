/**
 * Protege el contrato de /contacto, que no es visual sino de contenido.
 *
 * Tres cosas que no se ven fallar mirando la página:
 *
 * 1. **La primera frase de cada plantilla identifica el servicio.** Es lo
 *    único que tiene el orquestador de WhatsApp para saber de qué va la
 *    consulta antes de leer nada más. Si alguien reescribe una plantilla y se
 *    lleva por delante esa frase, la página sigue viéndose perfecta y el
 *    enrutado deja de funcionar.
 * 2. **Ninguna plantilla lleva marcadores internos.** Nada de
 *    `SERVICE_TYPE=ECU_REPAIR` ni parecidos: el visitante ve el mensaje antes
 *    de enviarlo, y un marcador o le sobra o lo borra.
 * 3. **Los datos pendientes de confirmar no se publican.** Dirección y correo
 *    provisionales viven en `CONTACT_PENDING_CONFIRMATION` y no pueden
 *    aparecer en ninguna plantilla del sitio hasta que el cliente los
 *    confirme.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import {
  CONTACT,
  CONTACT_AUDIENCES,
  CONTACT_FACTS,
  CONTACT_HELP_ROUTE,
  CONTACT_PENDING_CONFIRMATION,
  CONTACT_ROUTES,
  whatsappUrl,
  type ContactMessages,
} from "../src/config/site";

const SRC_DIR = join(process.cwd(), "src");

/** Todos los archivos de plantilla y de página, para buscar filtraciones. */
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

/** Todas las plantillas: una por servicio, más la salida secundaria. */
const ALL_MESSAGES: readonly { id: string; messages: ContactMessages }[] = [
  ...CONTACT_ROUTES.map((route) => ({ id: route.id, messages: route.messages })),
  { id: CONTACT_HELP_ROUTE.id, messages: CONTACT_HELP_ROUTE.messages },
];

describe("plantillas de contacto", () => {
  it("cubre las dos variantes en todas las rutas", () => {
    for (const route of ALL_MESSAGES) {
      for (const audience of CONTACT_AUDIENCES) {
        const lines = route.messages[audience.id];
        expect(
          lines.length,
          `${route.id}/${audience.id}: plantilla vacía`
        ).toBeGreaterThan(3);
      }
    }
  });

  it("identifica el servicio en la primera frase", () => {
    const expected: Record<string, string> = {
      "diagnostico-dtc": "diagnosis/dtc",
      reprogramacion: "reprogramación",
      "reparacion-ecu": "reparación de centralita ecu",
      "clonacion-ecu": "clonación de ecu",
    };

    for (const route of CONTACT_ROUTES) {
      for (const audience of CONTACT_AUDIENCES) {
        const first = route.messages[audience.id][0] ?? "";
        const needle = expected[route.id] ?? "";
        expect(needle, `${route.id}: falta el término esperado`).not.toBe("");
        expect(
          first.toLowerCase(),
          `${route.id}/${audience.id}: la primera línea no nombra el servicio`
        ).toContain(needle);
      }
    }
  });

  it("dice quién escribe en la variante de taller", () => {
    for (const route of ALL_MESSAGES) {
      const first = route.messages.taller[0] ?? "";
      expect(
        first.toLowerCase(),
        `${route.id}: la variante de taller no se identifica`
      ).toContain("taller");
    }

    for (const route of ALL_MESSAGES) {
      const first = route.messages.particular[0] ?? "";
      expect(
        first.toLowerCase(),
        `${route.id}: la variante de particular dice ser un taller`
      ).not.toContain("somos un taller");
    }
  });

  it("separa el encabezado de los campos con una línea en blanco", () => {
    for (const route of ALL_MESSAGES) {
      for (const audience of CONTACT_AUDIENCES) {
        expect(
          route.messages[audience.id][1],
          `${route.id}/${audience.id}: falta la línea en blanco`
        ).toBe("");
      }
    }
  });

  it("deja todos los campos en blanco: la plantilla ordena, no obliga", () => {
    for (const route of ALL_MESSAGES) {
      for (const audience of CONTACT_AUDIENCES) {
        const fields = route.messages[audience.id].slice(2);
        expect(fields.length, `${route.id}/${audience.id}`).toBeGreaterThan(2);

        for (const field of fields) {
          expect(
            field.endsWith(":"),
            `${route.id}/${audience.id}: «${field}» no es un campo vacío`
          ).toBe(true);
        }
      }
    }
  });

  it("no cuela ningún marcador interno en el mensaje visible", () => {
    /* Los enumerados del backend, y cualquier cosa con pinta de `CLAVE=`. */
    const FORBIDDEN = [
      "SERVICE_TYPE",
      "REPROGRAMMING",
      "ECU_REPAIR",
      "ECU_CLONING",
      "COLLECTING",
    ];

    for (const route of ALL_MESSAGES) {
      for (const audience of CONTACT_AUDIENCES) {
        const body = route.messages[audience.id].join("\n");

        for (const marker of FORBIDDEN) {
          expect(body, `${route.id}/${audience.id}: contiene ${marker}`).not.toContain(
            marker
          );
        }

        expect(
          /[A-Z_]{4,}=/.test(body),
          `${route.id}/${audience.id}: parece llevar un marcador CLAVE=valor`
        ).toBe(false);
      }
    }
  });

  it("no promete precio, plazo, garantía ni cita", () => {
    const FORBIDDEN = ["precio", "presupuesto", "plazo", "garantía", "urgente", "cita"];

    for (const route of ALL_MESSAGES) {
      for (const audience of CONTACT_AUDIENCES) {
        const body = route.messages[audience.id].join("\n").toLowerCase();

        for (const word of FORBIDDEN) {
          expect(body, `${route.id}/${audience.id}: menciona «${word}»`).not.toContain(
            word
          );
        }
      }
    }
  });
});

describe("enlaces de WhatsApp", () => {
  it("codifica el salto de línea del mensaje", () => {
    const url = whatsappUrl(CONTACT_ROUTES[0].messages.particular.join("\n"));

    expect(url.startsWith(`https://wa.me/${CONTACT.whatsappNumber}?text=`)).toBe(true);
    expect(url).toContain("%0A");
    expect(url).not.toContain("\n");
  });

  it("usa el número publicado por el cliente", () => {
    expect(CONTACT.whatsappNumber).toBe("34687393573");
    expect(CONTACT.phoneE164).toBe("+34687393573");
    expect(CONTACT.whatsappDisplay).toBe("+34 687 393 573");
  });

  it("recupera el mensaje tal cual al decodificar el enlace", () => {
    for (const route of ALL_MESSAGES) {
      for (const audience of CONTACT_AUDIENCES) {
        const text = route.messages[audience.id].join("\n");
        const url = new URL(whatsappUrl(text));

        expect(url.searchParams.get("text"), `${route.id}/${audience.id}`).toBe(text);
      }
    }
  });
});

describe("datos pendientes de confirmar", () => {
  it("los marca como pendientes y sin publicar", () => {
    expect(CONTACT_PENDING_CONFIRMATION.status).toBe("PENDING_CLIENT_CONFIRMATION");
    expect(CONTACT_PENDING_CONFIRMATION.published).toBe(false);
  });

  it("no los deja aparecer en ninguna plantilla ni página", () => {
    const secrets = [
      CONTACT_PENDING_CONFIRMATION.email,
      CONTACT_PENDING_CONFIRMATION.address.street,
      CONTACT_PENDING_CONFIRMATION.address.postalCode,
    ];

    const leaks: string[] = [];

    for (const file of sources(SRC_DIR)) {
      // El propio archivo de configuración es donde viven; ahí es su sitio.
      if (file.endsWith(join("config", "site.ts"))) continue;

      const source = readFileSync(file, "utf8");

      for (const secret of secrets) {
        if (source.includes(secret)) {
          leaks.push(`${relative(process.cwd(), file)} → ${secret}`);
        }
      }
    }

    expect(leaks, `datos sin confirmar publicados:\n${leaks.join("\n")}`).toEqual([]);
  });

  it("mantiene sin publicar dirección, correo y horario en CONTACT", () => {
    expect(CONTACT.address).toBeNull();
    expect(CONTACT.email).toBeNull();
    expect(CONTACT.openingHours).toBeNull();
  });
});

describe("información práctica", () => {
  it("solo publica datos confirmados", () => {
    const labels = CONTACT_FACTS.map((fact) => fact.label);

    expect(labels).toContain("Canal");
    expect(labels).toContain("Zona");
    expect(labels).not.toContain("Horario");
    expect(labels).not.toContain("Dirección");
  });

  it("no inventa un plazo de respuesta", () => {
    const body = CONTACT_FACTS.map((fact) => fact.value).join(" ").toLowerCase();

    expect(body).not.toContain("24 h");
    expect(body).not.toContain("horas");
    expect(body).not.toContain("inmediat");
  });
});
