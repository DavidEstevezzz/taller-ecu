import { SITE_URL } from "./domain.mjs";

/**
 * Configuración y contenido provisional del sitio.
 *
 * Todo lo que está pendiente de confirmar por el cliente vive aquí, marcado
 * con PENDIENTE, para poder sustituirlo sin tocar plantillas.
 * Ver docs/site-architecture.md §11.
 */

export { SITE_URL };

export const SITE = {
  name: "JM Repro Cars",
  /** Descripción por defecto cuando una página no aporta la suya. */
  description:
    "Reprogramación, reparación y clonación de centralitas ECU para talleres y particulares.",
  locale: "es-ES",
  lang: "es",
} as const;

/**
 * Contacto. El teléfono está publicado por el cliente en su web actual.
 * PENDIENTE: confirmar vigencia, correo operativo, dirección y horario.
 */
export const CONTACT = {
  whatsappNumber: "34687393573",
  whatsappDisplay: "+34 687 393 573",
  /** Mensaje que precarga WhatsApp. Corto a propósito. */
  whatsappMessage:
    "Hola, me gustaría consultar sobre un vehículo.",
  /** PENDIENTE: la web actual avisa de que el buzón está deshabilitado. */
  email: null as string | null,
  /** PENDIENTE: confirmar si se publica dirección física. */
  address: null as string | null,
  /** PENDIENTE: confirmar horario de atención. */
  openingHours: null as string | null,
} as const;

export function whatsappUrl(message: string = CONTACT.whatsappMessage): string {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Servicios confirmados. No añadir ninguno sin confirmación del cliente. */
export const SERVICES = [
  {
    slug: "reprogramacion",
    index: "01",
    /**
     * Sobre qué capa de la centralita actúa el servicio. Sustituye al número
     * de orden en la interfaz: los tres servicios son alternativas, no pasos,
     * y numerarlos decía algo que no es verdad.
     */
    depth: "Software",
    depthNote: "El mapa que gobierna el motor",
    name: "Reprogramación",
    /** Para usarlo dentro de una frase. `toLowerCase()` destrozaba «ECU». */
    nameLower: "reprogramación",
    short: "Ajuste del software de la centralita",
    /**
     * Página propia, si la tiene. Es lo que decide si el servicio puede
     * aparecer en la navegación principal: la cabecera solo enseña destinos
     * que son una página de verdad. Los otros dos siguen siendo secciones de
     * /servicios hasta que se escriban.
     */
    page: "/servicios/reprogramacion" as string | null,
    description:
      "Modificamos el mapa de la centralita para adaptar el comportamiento del motor. Trabajamos sobre la gestión original, no sobre parches.",
    href: "/servicios/reprogramacion",
  },
  {
    slug: "reparacion-ecu",
    index: "02",
    depth: "Placa",
    depthNote: "Componentes, pistas y soldaduras",
    name: "Reparación de ECU",
    nameLower: "reparación de ECU",
    short: "Diagnóstico y reparación electrónica",
    page: null as string | null,
    description:
      "Centralitas que no arrancan, entran en modo emergencia o dan errores persistentes. Reparación del componente, no sustitución a ciegas.",
    href: "/servicios#reparacion-ecu",
  },
  {
    slug: "clonacion-ecu",
    index: "03",
    depth: "De unidad a unidad",
    depthNote: "La configuración del vehículo",
    name: "Clonación de ECU",
    nameLower: "clonación de ECU",
    short: "Copia de una centralita a otra",
    page: null as string | null,
    description:
      "Volcamos la configuración de una centralita a otra unidad equivalente para que el vehículo la reconozca como propia.",
    href: "/servicios#clonacion-ecu",
  },
] as const;

export type Service = (typeof SERVICES)[number];

/**
 * Pasos del proceso. Describen cómo funciona hoy el flujo por WhatsApp.
 * No prometen plazos: PENDIENTE confirmarlos.
 */
export const PROCESS_STEPS = [
  {
    index: "01",
    title: "Nos escribes por WhatsApp",
    body: "Cuéntanos el vehículo y el síntoma. Si tienes fotos del error o de la centralita, envíalas: adelantan mucho el diagnóstico.",
  },
  {
    index: "02",
    title: "Revisamos el caso",
    body: "Miramos los datos y te decimos si es algo que podemos resolver y qué haría falta para hacerlo.",
  },
  {
    index: "03",
    title: "Trabajamos sobre la centralita",
    body: "Reprogramación, reparación o clonación según lo que necesite el vehículo.",
  },
  {
    index: "04",
    title: "Te devolvemos el trabajo",
    body: "Con la explicación de qué se ha hecho y qué comportamiento esperar.",
  },
] as const;

/**
 * Detalle de cada servicio para /servicios.
 * Nada de precios, plazos, garantías, potencias ni compatibilidades:
 * no hay ninguno confirmado.
 */
export const SERVICE_DETAILS = {
  reprogramacion: {
    what:
      "Modificamos el mapa que gobierna la centralita para cambiar cómo se " +
      "comporta el motor. Se trabaja sobre la gestión original de la unidad.",
    when: [
      "Quieres adaptar el comportamiento del motor a tu uso real",
      "El vehículo lleva una preparación y la gestión no la acompaña",
      "Necesitas ajustar parámetros tras una modificación mecánica",
    ],
    send: [
      "Marca, modelo, año y motor",
      "Matrícula o número de bastidor (VIN)",
      "Qué buscas conseguir y cómo usas el vehículo",
      "Si ya se ha tocado antes la centralita",
    ],
  },
  "reparacion-ecu": {
    what:
      "Diagnóstico y reparación de la propia unidad: se abre, se localiza el " +
      "fallo y se repara el componente en lugar de sustituir la centralita " +
      "completa.",
    when: [
      "El vehículo no arranca y se sospecha de la centralita",
      "Entra en modo emergencia sin causa mecánica clara",
      "Un error vuelve a aparecer después de cada borrado",
      "La unidad ha sufrido humedad, un golpe o un problema eléctrico",
    ],
    send: [
      "Referencia y fotos de la centralita, incluida la etiqueta",
      "Códigos de error leídos, si los tienes",
      "Qué síntoma da el vehículo y desde cuándo",
      "Qué se ha probado ya",
    ],
  },
  "clonacion-ecu": {
    what:
      "Volcamos la configuración de una centralita a otra unidad equivalente " +
      "para que el vehículo la reconozca como propia.",
    when: [
      "La centralita original está dañada y hay una unidad de recambio",
      "Se sustituye la unidad y no se quiere reprogramar todo el vehículo",
      "Hace falta conservar la configuración específica del vehículo",
    ],
    send: [
      "Referencia de la centralita original y de la de recambio",
      "Fotos de las etiquetas de ambas unidades",
      "Marca, modelo y motor del vehículo",
    ],
  },
} as const;

/**
 * Preguntas habituales. SOLO con respuestas que podemos afirmar hoy.
 * No hay ninguna sobre precio, plazo, garantía ni resultados.
 */
export const FAQ = [
  {
    q: "¿Trabajáis para talleres?",
    a: "Sí. Buena parte del trabajo llega de otros talleres que necesitan resolver la parte electrónica de una avería.",
  },
  {
    q: "¿Puedo consultar antes de mover el vehículo?",
    a: "Sí, y es lo recomendable. Escríbenos por WhatsApp con los datos y las fotos del error, y te decimos si es algo que podemos resolver.",
  },
  {
    q: "¿Qué información os hace falta para empezar?",
    a: "Marca, modelo, año y motor del vehículo, el síntoma concreto y, si los tienes, los códigos de error y una foto de la etiqueta de la centralita.",
  },
  {
    q: "¿Qué pasa si no tiene solución?",
    a: "Te lo decimos. Preferimos descartar un trabajo antes que prometer un resultado que no podemos asegurar.",
  },
  {
    q: "¿Hacéis anulaciones de sistemas anticontaminación?",
    a: "Solo para vehículos de competición o en banco de pruebas. Están prohibidas en vehículos que circulan por vía pública.",
  },
] as const;

/**
 * Qué conviene mandar al escribir.
 *
 * Sustituye al bloque vacío de «Trabajos» de la portada. No es relleno: es
 * exactamente lo que el asistente de WhatsApp pregunta después, así que
 * ordenarlo antes acorta la conversación y hace útil la primera respuesta.
 * Todo lo que hay aquí es verificable; no promete plazo, precio ni resultado.
 */
export const INTAKE = [
  {
    label: "El vehículo",
    body: "Marca, modelo, año y motor. Si tienes a mano la matrícula o el número de bastidor, mejor: identifican la unidad sin margen de error.",
  },
  {
    label: "El síntoma",
    body: "Qué hace el vehículo y desde cuándo. Si ocurre en frío, en caliente o al cabo de un rato, dilo: acota mucho.",
  },
  {
    label: "Lo que ya se ha leído",
    body: "Códigos de error, si los has sacado, y qué se ha probado o sustituido hasta ahora.",
  },
  {
    label: "Fotos",
    body: "De la centralita y de su etiqueta de referencia, y de lo que muestre el equipo de diagnosis. Una foto de la etiqueta ahorra media conversación.",
  },
] as const;

/**
 * Qué hace falta para confirmar una reprogramación sobre un vehículo concreto.
 *
 * Es la continuación del configurador: sus cifras son genéricas por motor, y
 * esto es lo que convierte una cifra genérica en una respuesta sobre TU coche.
 * Nada de lo que hay aquí promete resultado, plazo ni precio.
 */
export const REPRO_INTAKE = [
  {
    label: "Marca, modelo y año",
    body: "O la generación, si la sabes. Un mismo modelo cambia de gestión entre generaciones.",
  },
  {
    label: "El motor",
    body: "La denominación del motor, o el código si lo tienes a mano. Es el dato que más acota.",
  },
  {
    label: "La potencia original",
    body: "Si la conoces. Si no, la sacamos de los datos del vehículo; no es un problema.",
  },
  {
    label: "Qué quieres conseguir",
    body: "Cómo usas el vehículo y qué esperas que cambie. No es lo mismo un uso de carretera que un remolque o un vehículo preparado.",
  },
  {
    label: "De serie o modificado",
    body: "Si lleva alguna modificación mecánica, o si ya se ha tocado antes la centralita. Cambia por completo el punto de partida.",
  },
] as const;

/** Plantilla que se precarga en WhatsApp desde la página de reprogramación. */
export const REPRO_MESSAGE = [
  "Hola. Quería consultar una reprogramación.",
  "",
  "Marca, modelo y año:",
  "Motor:",
  "Potencia original (si la conozco):",
  "Qué busco conseguir:",
  "¿De serie o con alguna modificación?:",
].join("\n");

/** Plantilla que se precarga en WhatsApp desde el bloque de entrada. */
export const INTAKE_MESSAGE = [
  "Hola. Os escribo por un vehículo.",
  "",
  "Marca, modelo, año y motor:",
  "Matrícula o bastidor:",
  "Síntoma y desde cuándo:",
  "Códigos de error:",
  "Qué se ha probado ya:",
].join("\n");

/**
 * Aviso legal sobre anulaciones. La web actual del cliente ya lo incluye y
 * conviene mantenerlo.
 */
export const LEGAL_NOTICE =
  "Determinadas modificaciones sobre sistemas anticontaminación están prohibidas para vehículos que circulan por vía pública. Solo se realizan sobre vehículos de competición o en banco de pruebas.";
