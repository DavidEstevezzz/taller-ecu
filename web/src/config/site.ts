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
    "Diagnóstico DTC, reprogramación, reparación y clonación de centralitas ECU para talleres y particulares.",
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
  /**
   * Zona de trabajo. Confirmada por el cliente y publicable: es la localidad,
   * no la dirección. La dirección exacta sigue sin publicarse
   * (ver CONTACT_PENDING_CONFIRMATION).
   */
  area: "Churriana de la Vega, Granada",
  /** El mismo número en E.164, que es lo que piden los datos estructurados. */
  phoneE164: "+34687393573",
} as const;

export function whatsappUrl(message: string = CONTACT.whatsappMessage): string {
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Servicios confirmados. No añadir ninguno sin confirmación del cliente.
 *
 * Son cuatro, y no son cuatro cosas del mismo tipo. Tres son intervenciones
 * sobre la unidad, cada una a una profundidad distinta; la primera es el
 * análisis que decide cuál de las tres hace falta —o si no hace falta
 * ninguna—. Por eso abre la lista y por eso su `depth` no nombra una capa:
 * dice dónde está respecto de las otras.
 *
 * `kind` existe para esa diferencia, y no es decorativo: hay frases en el
 * sitio —«el trabajo será una X, una Y o una Z»— que solo pueden enumerar
 * intervenciones. Para eso está `INTERVENTIONS`.
 *
 * **No llevan número.** Un 01/02/03 diría que son una secuencia, y no lo son.
 * El único 01–04 del sitio es el del proceso, que sí lo es.
 */
export const SERVICES = [
  {
    slug: "diagnostico-dtc",
    kind: "diagnosis",
    depth: "Antes de decidir",
    depthNote: "Lo que la unidad ha registrado",
    name: "Diagnóstico DTC",
    nameLower: "diagnóstico DTC",
    short: "Interpretar códigos y decidir qué comprobar",
    page: "/servicios/diagnostico-dtc" as string | null,
    description:
      "Un testigo encendido o un código no dicen qué pieza cambiar. Miramos cuándo aparece, qué hace el vehículo y qué se ha probado ya.",
    href: "/servicios/diagnostico-dtc",
  },
  {
    slug: "reprogramacion",
    kind: "intervention",
    /**
     * Sobre qué capa de la centralita actúa el servicio. Sustituye al número
     * de orden en la interfaz: los servicios son alternativas, no pasos, y
     * numerarlos decía algo que no es verdad.
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
     * que son una página de verdad. Un servicio sin página apunta a su
     * sección dentro de /servicios, y hay una prueba que lo exige.
     */
    page: "/servicios/reprogramacion" as string | null,
    description:
      "Modificamos el mapa de la centralita para adaptar el comportamiento del motor. Trabajamos sobre la gestión original, no sobre parches.",
    href: "/servicios/reprogramacion",
  },
  {
    slug: "reparacion-ecu",
    kind: "intervention",
    depth: "Placa",
    depthNote: "Componentes, pistas y soldaduras",
    name: "Reparación de ECU",
    nameLower: "reparación de ECU",
    short: "Diagnóstico y reparación electrónica",
    page: "/servicios/reparacion-ecu" as string | null,
    description:
      "Centralitas que no arrancan, entran en modo emergencia o dan errores persistentes. Reparación del componente, no sustitución a ciegas.",
    href: "/servicios/reparacion-ecu",
  },
  {
    slug: "clonacion-ecu",
    kind: "intervention",
    depth: "De unidad a unidad",
    depthNote: "La configuración del vehículo",
    name: "Clonación de ECU",
    nameLower: "clonación de ECU",
    short: "Copia de una centralita a otra",
    page: "/servicios/clonacion-ecu" as string | null,
    description:
      "Cuando hay que sustituir la unidad, trasladamos a otra compatible la información que el vehículo necesita reconocer.",
    href: "/servicios/clonacion-ecu",
  },
] as const;

export type Service = (typeof SERVICES)[number];

/**
 * Las tres intervenciones sobre la unidad, sin el diagnóstico.
 *
 * Lo usan las frases que enumeran en qué puede acabar un caso —«el trabajo
 * será una reprogramación, una reparación o una clonación»—. El diagnóstico
 * no es un desenlace posible: es lo que se hace para llegar a uno.
 */
export const INTERVENTIONS = SERVICES.filter(
  (service) => service.kind === "intervention"
);

/** Un servicio por su slug. Evita indexar SERVICES por posición. */
export const SERVICE_BY_SLUG = Object.fromEntries(
  SERVICES.map((service) => [service.slug, service])
) as Record<Service["slug"], Service>;

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
  "diagnostico-dtc": {
    what:
      "Leemos lo que la unidad ha registrado y lo cruzamos con lo que hace el " +
      "vehículo, con las condiciones en las que aparece y con lo que ya se ha " +
      "tocado. El código orienta la búsqueda; no la cierra.",
    when: [
      "Tienes el testigo de motor encendido y un código leído",
      "El vehículo circula limitado o en modo emergencia",
      "Un error vuelve a aparecer después de cada borrado",
      "Algo dejó de funcionar tras una programación o una sustitución",
    ],
    send: [
      "Marca, modelo, año y motor",
      "Los códigos, escritos o en una captura de la diagnosis",
      "Qué hace el vehículo y cuándo aparece",
      "Qué se ha reparado, sustituido o programado antes",
    ],
  },
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
      "Leemos de la centralita original la información que el vehículo " +
      "necesita —según la unidad: software, calibración, configuración e " +
      "identificadores— y la trasladamos a otra unidad compatible que pueda " +
      "ocupar su lugar.",
    when: [
      "Hay que sustituir la centralita y conviene conservar la configuración del vehículo",
      "Tienes una unidad de sustitución y hay que comprobar si encaja",
      "La unidad original todavía permite recuperar lo que hace falta",
    ],
    send: [
      "Marca, modelo, año y motorización",
      "Por qué hay que sustituir la unidad y qué se ha probado ya",
      "Referencia de la original y de la de sustitución, si están a la vista",
      "Fotos legibles de las etiquetas, si puedes hacerlas sin desmontar nada",
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

/* ═══════════════════════════════════════════════════════════════
   REPROGRAMACIÓN
   ═══════════════════════════════════════════════════════════════

   La página se reconstruyó entera con un cambio de perspectiva: deja de
   explicar qué se hace dentro de la centralita y pasa a responder **qué se
   nota al volante**. Todo lo que hay aquí abajo está escrito desde el asiento
   del conductor, no desde el banco de trabajo.

   Lo que NO entra en este bloque, y no es negociable: cifras, porcentajes,
   plazos, precios, garantías, marcas colaboradoras, homologaciones ni
   resultados concretos. Cada vehículo es un caso, y eso se dice una vez. */

/**
 * Qué quiere notar el conductor. Es el eje de la página y el control de la
 * banda de entrega (`PowerBand.astro`).
 *
 * Cinco, y son cinco **sensaciones**, no cinco productos: el abanico
 * comercial es otra lista (`REPRO_OPTIONS`). Alguien que llega no sabe si
 * necesita una Stage 1; sí sabe que su coche va perezoso abajo.
 *
 * ── El campo `band` ───────────────────────────────────────────
 *
 * Describe la **forma** de la entrega que persigue ese objetivo, y nada más.
 * No es una medición, no sale de un banco y no corresponde a ningún vehículo:
 * son los cuatro parámetros de una curva que el componente dibuja sin un solo
 * número a la vista. Están aquí, junto al objetivo, porque la forma es parte
 * de lo que el objetivo significa; las matemáticas viven en el componente.
 *
 *   rise  dónde empieza a subir (0 = ralentí, 1 = corte)
 *   slope cuánto tarda en subir
 *   hold  hasta dónde aguanta antes de caer
 *   drop  cómo de rápido cae
 *   top   altura de la meseta
 *
 * `zone` es el tramo del régimen donde ese objetivo actúa: lo que la banda
 * ilumina. Es lo que convierte el dibujo en una respuesta a «¿cuándo lo voy
 * a notar?».
 *
 * `goal` es la línea que se rellena sola en la plantilla de WhatsApp cuando
 * el visitante ha elegido. Sin JavaScript el campo va en blanco, como el
 * resto: es una comodidad, no un requisito.
 */
/**
 * La entrega de partida: la referencia contra la que se lee todo lo demás.
 *
 * Es la misma para los cinco objetivos, porque lo que cambia es a dónde se
 * va, no de dónde se sale. Vive aquí y no en el componente para que
 * `web/test/repro.test.ts` pueda comprobar la regla que de verdad importa:
 * **ninguna curva de objetivo queda nunca por debajo de esta**. Una que
 * bajase estaría afirmando que se pierde empuje en algún tramo, y eso no lo
 * decimos.
 */
export const REPRO_BASELINE_BAND = {
  rise: 0.32,
  slope: 0.085,
  hold: 0.6,
  drop: 0.28,
  top: 0.5,
} as const;

export const REPRO_GOALS = [
  {
    id: "respuesta",
    tab: "Respuesta",
    title: "Que responda antes",
    body: "Menos espera entre pisar y empujar. Se nota al salir y en cada reincorporación.",
    goal: "más respuesta al acelerador",
    band: { rise: 0.16, slope: 0.048, hold: 0.58, drop: 0.28, top: 0.62 },
    zone: [0.12, 0.42],
  },
  {
    id: "empuje",
    tab: "Empuje",
    title: "Más par donde adelantas",
    body: "El tirón que usas para incorporarte o adelantar, con la marcha ya metida.",
    goal: "más par y mejor recuperación",
    band: { rise: 0.26, slope: 0.065, hold: 0.66, drop: 0.3, top: 0.82 },
    zone: [0.34, 0.62],
  },
  {
    id: "elasticidad",
    tab: "Elasticidad",
    title: "Que estire sin reducir",
    body: "La marcha aguanta más antes de pedirte otra. Menos cambios en puerto y autovía.",
    goal: "más elasticidad, para reducir menos",
    band: { rise: 0.27, slope: 0.07, hold: 0.84, drop: 0.24, top: 0.72 },
    zone: [0.55, 0.9],
  },
  {
    id: "diario",
    tab: "Uso diario",
    title: "Más cómodo a diario",
    body: "Empuje abajo, donde se conduce casi siempre, con margen para afinar el consumo.",
    goal: "un uso diario más cómodo, y afinar consumo si el vehículo lo permite",
    band: { rise: 0.14, slope: 0.085, hold: 0.56, drop: 0.32, top: 0.58 },
    zone: [0.08, 0.4],
  },
  {
    id: "preparado",
    tab: "Ya preparado",
    title: "Coherente con lo que lleva",
    body: "Si tiene admisión, escape o turbo distintos, la gestión tiene que ir con ellos.",
    goal: "ajustar la gestión a las modificaciones que ya lleva",
    band: { rise: 0.22, slope: 0.055, hold: 0.82, drop: 0.26, top: 0.94 },
    zone: [0.28, 0.86],
  },
] as const;

export type ReproGoal = (typeof REPRO_GOALS)[number];

/**
 * Lo que la banda es y lo que no. Se dice **una vez**, debajo del dibujo, y
 * no se repite en ninguna otra parte de la página.
 */
export const REPRO_BAND_CAVEAT =
  "Representación conceptual de la forma de la entrega. No lleva cifras, no es una medición y no corresponde a ningún vehículo.";

/**
 * El abanico comercial. Cinco entradas, cada una con un panel corto que se
 * despliega: para qué vehículo encaja, qué se busca y qué condición importa.
 *
 * Antes eran cinco frases sueltas siempre a la vista, y no ayudaban a decidir:
 * una línea no distingue una Stage 1 de una optimización personalizada. El
 * acordeón permite decir lo justo —entre treinta y cinco y setenta palabras—
 * sin que la página crezca para quien ya sabe cuál es la suya.
 *
 * **«Vehículo modificado» desapareció como opción propia** y su contenido vive
 * dentro de Stage 2: eran lo mismo dicho dos veces.
 *
 * Ninguna promete cifras, plazos ni compatibilidades, y ninguna explica el
 * procedimiento. **PENDIENTE DE CONFIRMAR con el cliente**, entera: ver
 * `REPRO_OPTIONS_TO_CONFIRM`.
 */
export const REPRO_OPTIONS = [
  {
    id: "stage-1",
    name: "Stage 1",
    body:
      "Para un vehículo de serie, sin tocar la mecánica. Se trabaja solo sobre " +
      "el software de la centralita, buscando respuesta al acelerador, par " +
      "disponible y una entrega más aprovechable en el uso real. Lo que admite " +
      "cada motor depende de su versión, de su estado y de su mantenimiento, " +
      "así que el punto de partida siempre es el vehículo concreto.",
  },
  {
    id: "stage-2",
    name: "Stage 2",
    body:
      "Para vehículos que ya llevan modificaciones mecánicas compatibles: " +
      "admisión, escape, intercooler o un turbo distinto del original. La " +
      "calibración se adapta al conjunto que hay montado, no a la ficha del " +
      "modelo. Cada caso se valora por separado, porque lo razonable depende de " +
      "qué piezas lleva, de cómo están instaladas y del estado del motor.",
  },
  {
    id: "personalizada",
    name: "Optimización personalizada",
    body:
      "Para quien ya sabe qué quiere notar y cuándo. La configuración se ajusta " +
      "a tu uso —diario, carretera, remolque o conducción deportiva— y a tus " +
      "preferencias al volante, dentro de lo que el vehículo admita. Cuéntanos " +
      "cómo conduces antes que pedirnos una cifra: es lo que decide en qué " +
      "tramo del régimen tiene sentido trabajar.",
  },
  {
    id: "consumo",
    name: "Orientada al consumo",
    body:
      "Para quien hace muchos kilómetros y busca eficiencia antes que potencia. " +
      "Se trabaja la entrega en la zona baja del régimen, para reducir menos y " +
      "estirar menos las marchas. No existe una mejora de consumo universal: " +
      "depende del vehículo, del recorrido habitual y, sobre todo, de cómo se " +
      "conduce después de la intervención.",
  },
  {
    id: "motos",
    name: "Motos",
    body:
      "Adaptación de la gestión electrónica y de la respuesta al acelerador " +
      "según el modelo, su configuración y el uso que se le da. El " +
      "planteamiento es el mismo que en coche: se parte de la unidad que la " +
      "moto ya lleva y se valora caso por caso qué admite, sin dar nada por " +
      "supuesto a partir del modelo.",
  },
] as const;

export type ReproOption = (typeof REPRO_OPTIONS)[number];

/**
 * Qué hay que confirmar del abanico antes de darlo por bueno. Mismo criterio
 * que `ABOUT_TO_CONFIRM`: lo provisional se publica marcado, no escondido.
 */
export const REPRO_OPTIONS_TO_CONFIRM: readonly string[] = [
  "PENDING_CLIENT_CONFIRMATION — que «Stage 1» y «Stage 2» sean los nombres que el cliente quiere usar, y qué incluye cada uno para él.",
  "PENDING_CLIENT_CONFIRMATION — que se atiendan motos, y con qué alcance.",
  "PENDING_CLIENT_CONFIRMATION — que se trabaje sobre vehículos ya modificados, que es lo que hoy define Stage 2.",
  "PENDING_CLIENT_CONFIRMATION — si existe algún ajuste sobre gestión de cambio automático. Hoy NO se publica.",
];

/**
 * Los cuatro datos con los que se puede valorar un caso. Cuatro, no siete: la
 * versión anterior pedía cinco con un párrafo cada uno y se leía como un
 * formulario.
 */
export const REPRO_SEND = [
  "Marca, modelo y año",
  "Motor",
  "Modificaciones, si lleva",
  "Qué quieres conseguir",
] as const;

/**
 * Plantilla que se precarga en WhatsApp desde la página de reprogramación.
 *
 * Todos los campos van en blanco. La última línea es la que el selector de
 * objetivos rellena cuando hay JavaScript: por eso va la última y por eso su
 * texto coincide con el cuarto dato de `REPRO_SEND`.
 */
export const REPRO_MESSAGE_LINES = [
  "Hola, quiero consultar una reprogramación.",
  "",
  "Marca, modelo y año:",
  "Motor:",
  "Modificaciones, si lleva:",
  "Qué quiero conseguir:",
] as const;

export const REPRO_MESSAGE = REPRO_MESSAGE_LINES.join("\n");

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
 * Situaciones con las que tiene sentido preguntar por una reparación.
 *
 * Están escritas como las contaría quien tiene el problema, no como las
 * clasificaría un manual: la página tiene que dejar que alguien se reconozca
 * en una línea. La segunda frase de cada una pide un dato concreto, que es lo
 * que convierte «me pasa esto» en una consulta útil.
 *
 * Ninguna afirma que la causa sea la centralita. Esa advertencia va aparte,
 * en REPAIR_LIMITS, y en la propia página.
 */
export const REPAIR_SYMPTOMS = [
  {
    case: "El vehículo no arranca y no hay un error que lo explique",
    ask: "Cuéntanos si el motor llega a girar y si el equipo de diagnosis saca algún código.",
  },
  {
    case: "Arranca, pero entra en modo emergencia al poco de rodar",
    ask: "Dinos si pasa en frío, en caliente o al cabo de un rato: acota mucho.",
  },
  {
    case: "El mismo error vuelve después de cada borrado",
    ask: "Apunta el código tal cual sale y cuántas veces ha vuelto.",
  },
  {
    case: "El equipo de diagnosis no consigue comunicar con la centralita",
    ask: "Indica con qué equipo se ha intentado y qué mensaje da.",
  },
  {
    case: "La unidad se ha mojado, ha recibido un golpe o ha habido un problema eléctrico",
    ask: "Cuéntanos qué ocurrió y cuándo empezaron los síntomas.",
  },
  {
    case: "Ya se han cambiado piezas y el comportamiento sigue igual",
    ask: "Dinos qué se sustituyó y si algo llegó a mejorar.",
  },
] as const;

/**
 * Qué necesitamos para valorar una reparación.
 *
 * Separado en dos grupos porque la diferencia es real: sin lo primero no se
 * puede ni empezar; lo segundo adelanta trabajo, pero su falta no bloquea
 * nada. Mezclarlo todo en una lista haría creer que hace falta desmontar la
 * centralita antes de escribir, y no es así.
 */
export const REPAIR_INTAKE = {
  needed: [
    {
      label: "Marca, modelo y año",
      body: "Y el motor, si lo sabes. Es lo que identifica qué gestión lleva el vehículo.",
    },
    {
      label: "El síntoma",
      body: "Qué hace y desde cuándo. Si aparece solo en un momento concreto, dilo: acota.",
    },
    {
      label: "Si arranca y se puede mover",
      body: "No es lo mismo una unidad que no responde que una que funciona a medias.",
    },
  ],
  helpful: [
    {
      label: "Códigos de avería",
      body: "Tal cual salen del equipo de diagnosis. Una foto de la pantalla sirve igual.",
    },
    {
      label: "Qué se ha probado ya",
      body: "Piezas cambiadas, comprobaciones hechas, si algo mejoró. Si no lo sabes, dilo tal cual: eso también es información.",
    },
    {
      label: "La referencia de la centralita",
      body: "Va en una etiqueta de la unidad. Solo si ya está a la vista: no desmontes nada para escribirnos.",
    },
    {
      label: "Fotos que ya tengas",
      body: "De la unidad, de su etiqueta o de lo que muestre el equipo de diagnosis.",
    },
  ],
} as const;

/**
 * Lo que no se puede decir todavía.
 *
 * Va en la página, y en un sitio visible, no escondido en letra pequeña. Es
 * la contrapartida honesta de todo lo demás: sin datos confirmados no hay
 * precio, ni plazo, ni garantía, ni certeza de que la causa esté en la
 * centralita.
 */
export const REPAIR_LIMITS = [
  {
    title: "Sin ver la unidad no hay reparación confirmada",
    body: "Podemos decirte si el caso encaja con lo que hacemos. Si tiene arreglo, solo se sabe después de abrirla.",
  },
  {
    title: "No todas las averías son reparables",
    body: "Hay daños que no admiten intervención. Cuando es el caso, se dice y se explica por qué.",
  },
  {
    title: "El síntoma no señala a la centralita por sí solo",
    body: "Puede venir del cableado, de un sensor o de la parte mecánica. Descartarlo forma parte del trabajo.",
  },
  {
    title: "Precio y plazo dependen de lo que se encuentre",
    body: "Darlos antes de revisar el caso sería inventarlos.",
  },
] as const;

/** Plantilla que se precarga en WhatsApp desde la página de reparación. */
export const REPAIR_MESSAGE = [
  "Hola. Quería consultar una reparación de centralita.",
  "",
  "Vehículo (marca, modelo y año):",
  "Motor:",
  "Síntoma y desde cuándo:",
  "¿Arranca y se puede mover?:",
  "Códigos de avería (si los tengo):",
  "Referencia o foto de la centralita (si está a la vista):",
].join("\n");

/* ═══════════════════════════════════════════════════════════════
   CLONACIÓN DE ECU
   ═══════════════════════════════════════════════════════════════ */

/**
 * Qué se mira antes de confirmar una clonación.
 *
 * Es el contrapeso honesto de toda la página: sin identificar las dos
 * unidades no hay compatibilidad que prometer, y a veces la salida no es
 * clonar. Ninguno de los tres afirma un resultado, un plazo ni un precio.
 *
 * Las capas de información que se trasladan NO están aquí: viven en
 * `IdentityTransfer.astro` porque están atadas a la geometría del dibujo,
 * igual que los pasos de `FaultTrace.astro`.
 */
export const CLONE_CHECKS = [
  {
    title: "Identificar las dos unidades",
    body: "La referencia de la original y la de la de sustitución. Si no son compatibles, no hay clonación que valga, y eso se comprueba antes de tocar nada.",
  },
  {
    title: "Ver qué se puede leer",
    body: "Según la unidad, se lee por la toma de diagnosis o hay que trabajar sobre la propia centralita. Y si la original ya no responde, lo primero es ver qué queda accesible.",
  },
  {
    title: "Decidir la vía",
    body: "A veces lo que procede es clonar. Otras, recuperar la unidad original, adaptarla de otra forma o plantear otra salida. Si no vemos ninguna, se dice.",
  },
] as const;

/**
 * Situaciones reales al consultar una clonación, escritas en primera persona.
 *
 * Están para que alguien se reconozca en una línea y escriba, no para
 * clasificar casos. La última existe expresamente para desmentir el atajo
 * más habitual: un vehículo que no arranca no necesita automáticamente una
 * clonación.
 */
export const CLONE_CASES = [
  {
    label: "Si no sabes cuál es cuál",
    question: "Tengo dos centralitas y no sé cuál es la original.",
    answer:
      "Dilo tal cual. Es normal cuando la unidad llega suelta o el vehículo ha pasado por otras manos. Con una foto de cada etiqueta se distinguen, y si no están a la vista, se ve luego.",
  },
  {
    label: "Si todavía no la tienes",
    question: "Aún no tengo la unidad de sustitución.",
    answer:
      "Mejor preguntar antes de comprarla. Saber qué referencia buscar evita acabar con una unidad que no encaja, que es el error más caro de esta historia.",
  },
  {
    label: "Si la original no responde",
    question: "La centralita original ya no da señales de vida.",
    answer:
      "Es lo primero que hay que comprobar, porque de ella sale la información. Si no se puede leer nada, la clonación puede no ser posible tal cual y habrá que plantear otra vía; en algunos casos, recuperar la unidad original es justo lo que abre el camino.",
  },
  {
    label: "Si no ves las referencias",
    question: "No tengo a mano la referencia de ninguna de las dos.",
    answer:
      "No hace falta para preguntar. Con marca, modelo, año y motorización se puede empezar: la referencia hace falta antes de confirmar el trabajo, no antes de escribir. No desmontes nada solo para responder a una consulta.",
  },
  {
    label: "Si el coche no arranca",
    question: "El vehículo no arranca. ¿Necesita una clonación?",
    answer:
      "No necesariamente. Que un coche no arranque no señala a la centralita por sí solo, y aunque la señalara, sustituirla no siempre es lo que toca. Antes hay que descartar el resto.",
  },
] as const;

/** Qué conviene contarnos para valorar una sustitución. */
export const CLONE_SEND = [
  "Marca, modelo, año y motorización",
  "Por qué hay que sustituir la centralita",
  "Estado actual del vehículo: si arranca, si se mueve, si comunica",
  "Qué se ha probado o cambiado ya",
  "Referencia de la original y de la de sustitución, si están a la vista",
  "Cuál es la original y cuál la sustituta, si lo sabes",
] as const;

/**
 * Plantilla de WhatsApp de la página de clonación.
 *
 * Va por líneas y no como una sola cadena porque el visitante puede añadirle
 * las que le correspondan (ver CLONE_MESSAGE_OPTIONS). La base pide solo lo
 * que cualquiera puede saber sin desmontar ni medir nada.
 */
export const CLONE_MESSAGE_BASE = [
  "Hola. Quería consultar una clonación de centralita.",
  "",
  "Vehículo (marca, modelo y año):",
  "Motorización:",
  "Por qué hay que sustituir la centralita:",
  "Estado actual del vehículo:",
  "Qué se ha probado ya:",
] as const;

/**
 * Líneas opcionales del mensaje. Ninguna es obligatoria a propósito: quien no
 * tiene las referencias, o no sabe distinguir las unidades, tiene que poder
 * escribir igualmente.
 */
export const CLONE_MESSAGE_OPTIONS = [
  {
    id: "original",
    label: "Tengo la referencia de la centralita original",
    line: "Referencia de la original:",
  },
  {
    id: "sustituta",
    label: "Ya tengo la unidad de sustitución",
    line: "Referencia de la de sustitución:",
  },
  {
    id: "fotos",
    label: "Puedo enviar fotos de las etiquetas",
    line: "Puedo adjuntar fotos de las etiquetas.",
  },
  {
    id: "duda",
    label: "No sé cuál de las dos es la original",
    line: "No sé distinguir cuál es la original y cuál la de sustitución.",
  },
] as const;

/** La plantilla sin ninguna línea opcional: lo que va en los botones. */
export const CLONE_MESSAGE = CLONE_MESSAGE_BASE.join("\n");

/* ═══════════════════════════════════════════════════════════════
   DIAGNÓSTICO DTC
   ═══════════════════════════════════════════════════════════════ */

/**
 * Las seis situaciones con las que llega la gente, y qué se le puede
 * responder a cada una.
 *
 * Son el contenido principal de la página, y están escritas para que el
 * visitante **se reconozca**, no para explicarle el método. Por eso el
 * título es lo que él nota desde el asiento y la respuesta dice qué se puede
 * valorar, en dos líneas. Nada de procedimiento interno.
 *
 * Ninguna afirma una causa ni promete un resultado, y ninguna hace falta que
 * se lea entera para entender la página: se ve una cada vez.
 */
export const DTC_SITUATIONS = [
  {
    id: "testigo",
    tab: "Testigo encendido",
    title: "Tienes el testigo de avería encendido",
    answer:
      "Leemos los códigos y las condiciones en que aparecen. Con eso te decimos si hay una solución software o si conviene comprobar algo antes.",
  },
  {
    id: "emergencia",
    tab: "Modo emergencia",
    title: "El vehículo va limitado o en modo emergencia",
    answer:
      "La unidad ha recortado el motor por algo que ha detectado. Miramos qué lo dispara y si puede resolverse sobre la gestión.",
  },
  {
    id: "vuelve",
    tab: "Vuelve tras borrarlo",
    title: "El error vuelve después de borrarlo",
    answer:
      "Que vuelva significa que la causa sigue ahí y que el fallo es repetible. Valoramos si está en el software de la unidad.",
  },
  {
    id: "intermitente",
    tab: "Fallo intermitente",
    title: "El fallo aparece y desaparece",
    answer:
      "Buscamos el patrón en las condiciones que se guardan junto al código. A partir de ahí decidimos si hay solución electrónica.",
  },
  {
    id: "programacion",
    tab: "Tras una programación",
    title: "Empezó después de una programación",
    answer:
      "Software a medias, una calibración cambiada o la configuración perdida. En la mayoría de los casos la unidad se puede recuperar.",
  },
  {
    id: "comunica",
    tab: "No comunica o no arranca",
    title: "La ECU no comunica o el coche no arranca",
    answer:
      "Comprobamos si la unidad responde y en qué estado está su software. Si el problema no es electrónico, te lo decimos.",
  },
] as const;

/** La única advertencia de la página. No se repite en ningún otro bloque. */
export const DTC_CAVEAT =
  "Un código por sí solo no confirma qué pieza está averiada.";

/**
 * Qué podemos valorar. Un abanico para reconocer, no un procedimiento.
 *
 * Una frase por servicio y ni una palabra sobre cómo se ejecuta: el cliente
 * necesita reconocer la solución, no conocer el proceso interno.
 */
export const DTC_SOLUTIONS = [
  {
    title: "Lectura e interpretación de DTC",
    body: "Los códigos leídos en el contexto del vehículo, no en una lista.",
  },
  {
    title: "Fallos recurrentes o intermitentes",
    body: "Buscamos el patrón que los dispara.",
  },
  {
    title: "Modo emergencia y limitación",
    body: "Qué está protegiendo la limitación y si puede resolverse.",
  },
  {
    title: "Revisión y corrección del software",
    body: "Sobre la gestión original de la unidad.",
  },
  {
    title: "Restauración del archivo original",
    body: "Devolver la unidad al software con el que salió.",
  },
  {
    title: "Soporte de diagnosis para talleres",
    body: "Una segunda opinión electrónica sobre un caso que no cierra.",
  },
] as const;

/**
 * Los cuatro datos que hacen falta para empezar.
 *
 * Cuatro, no siete: la lista larga vive dentro de la plantilla de WhatsApp,
 * que es donde se rellena. Enseñarla entera en la página convertía un
 * «escríbenos» en un formulario.
 */
export const DTC_SEND = [
  "Vehículo y motor",
  "Código o captura de la diagnosis",
  "Qué hace el vehículo",
  "Qué se ha probado antes",
] as const;

/**
 * Plantilla de WhatsApp de la página.
 *
 * **Vive en el enlace, no en la página.** Es más completa que los cuatro
 * datos que se enseñan a propósito: ordena la consulta al abrir WhatsApp sin
 * asustar antes de pulsar.
 *
 * Mismas reglas que las de /contacto: la primera frase identifica el servicio
 * en lenguaje natural —sin marcadores internos, que el visitante ve y borra—
 * y todos los campos se pueden dejar en blanco.
 *
 * PENDIENTE DE INTEGRACIÓN: el clasificador del agente de WhatsApp y el enum
 * `requests.service_type` del backend siguen teniendo cuatro valores
 * (REPROGRAMMING, ECU_REPAIR, ECU_CLONING, OTHER). Una consulta de diagnosis
 * entrará hoy como OTHER. **No se toca ninguno de los dos en esta fase.**
 */
export const DTC_MESSAGE_LINES = [
  "Hola, quiero consultar un problema de diagnosis/DTC.",
  "",
  "Vehículo:",
  "Año:",
  "Motor:",
  "Código o códigos:",
  "Qué hace el vehículo:",
  "Cuándo aparece:",
  "¿Arranca y circula?:",
  "Qué se ha probado o reparado:",
] as const;

export const DTC_MESSAGE = DTC_MESSAGE_LINES.join("\n");

/* ═══════════════════════════════════════════════════════════════
   CÓMO TRABAJAMOS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Los tres datos del raíl del hero.
 *
 * Cada uno responde una pregunta que el visitante se hace de verdad: por dónde
 * escribo, qué tengo que contar y qué me vais a decir. El teléfono va aquí
 * porque es el dato más accionable de la página.
 */
export const CHANNEL = [
  { label: "Canal", value: `WhatsApp, ${CONTACT.whatsappDisplay}` },
  { label: "Qué contar", value: "Vehículo, motor y qué ocurre" },
  { label: "Qué recibes", value: "Si podemos ayudarte y qué hace falta" },
] as const;

/**
 * Los dos recorridos: particular y taller.
 *
 * Es la misma consulta con distinto punto de partida; lo que cambia es qué
 * clase de dato tiene cada uno a mano. Cuatro puntos cada uno, sin título ni
 * párrafo: la pestaña ya dice quién eres y la lista se escanea de un vistazo.
 */
export const CASE_ROUTES = [
  {
    id: "particular",
    tab: "Soy particular",
    brings: [
      "Marca, modelo y año",
      "Motor, si lo conoces",
      "Qué ocurre o qué quieres conseguir",
      "Fotos, códigos de error o documentación que tengas",
    ],
    message: [
      "Hola. Quería consultar un caso.",
      "",
      "Vehículo (marca, modelo y año):",
      "Motor:",
      "Qué ocurre o qué quiero conseguir:",
      "Tengo fotos o documentación:",
    ],
  },
  {
    id: "taller",
    tab: "Soy un taller",
    brings: [
      "Vehículo, año y motorización",
      "DTC y síntomas",
      "Referencia o foto de la centralita",
      "Pruebas realizadas",
    ],
    message: [
      "Hola. Soy un taller y quería consultar un caso.",
      "",
      "Vehículo, año y motorización:",
      "Servicio que pido:",
      "DTC y síntomas:",
      "Referencia de la unidad:",
      "Pruebas realizadas:",
    ],
  },
] as const;

/** Lo que hay que decir sobre precio y plazo, en una línea y sin rodeos. */
export const CASE_DISCLAIMER =
  "El precio y el plazo salen después de revisar el caso, no antes.";

/** Plantilla general de la página, para quien no se identifica con ninguna ruta. */
export const HOW_MESSAGE = [
  "Hola. Quería consultar un caso.",
  "",
  "Vehículo (marca, modelo y año):",
  "Motor:",
  "Qué ocurre o qué quiero conseguir:",
].join("\n");

/**
 * Aviso legal sobre anulaciones. La web actual del cliente ya lo incluye y
 * conviene mantenerlo.
 */
export const LEGAL_NOTICE =
  "Determinadas modificaciones sobre sistemas anticontaminación están prohibidas para vehículos que circulan por vía pública. Solo se realizan sobre vehículos de competición o en banco de pruebas.";

/* ═══════════════════════════════════════════════════════════════
   CONTACTO
   ═══════════════════════════════════════════════════════════════ */

/**
 * Quién consulta. Dos, y solo dos.
 *
 * No es una segmentación de mercado: es lo único que cambia de verdad entre
 * un particular y un taller, que es **qué datos tiene a mano**. Un taller
 * llega con DTC, pruebas hechas y la referencia de la unidad; un particular,
 * con lo que se ve desde el asiento. Pedirle a cada uno lo que el otro tiene
 * es la forma más rápida de que no escriba.
 *
 * Cambia las plantillas, y nada más. **No duplica las rutas**: seis tarjetas
 * dirían que hay seis caminos, y hay tres.
 */
export const CONTACT_AUDIENCES = [
  {
    id: "particular",
    tab: "Soy particular",
    /** Qué esperar de las plantillas de esta variante. Se ve bajo el selector. */
    note: "Las plantillas piden solo lo que se puede saber sin desmontar nada.",
  },
  {
    id: "taller",
    tab: "Soy un taller",
    note: "Las plantillas piden DTC, pruebas realizadas y referencia de la unidad.",
  },
] as const;

export type ContactAudienceId = (typeof CONTACT_AUDIENCES)[number]["id"];

/** Las plantillas de una ruta, una por variante. */
export type ContactMessages = Readonly<
  Record<ContactAudienceId, readonly string[]>
>;

/** Una de las tres entradas principales. Siempre corresponde a un servicio. */
export interface ContactRoute {
  readonly id: string;
  /** El servicio de SERVICES. De ahí salen nombre, capa y enlace. */
  readonly service: Service;
  readonly description: string;
  readonly cta: string;
  readonly messages: ContactMessages;
}

/** La salida secundaria: no corresponde a ningún servicio concreto. */
export interface ContactHelpRoute {
  readonly id: string;
  readonly text: string;
  readonly cta: string;
  readonly messages: ContactMessages;
}

/**
 * Las cuatro rutas de contacto, una por servicio.
 *
 * La de diagnóstico va primera porque es la que más gente necesita y la
 * única que no obliga a saber ya qué hay que hacerle al vehículo. No
 * sustituye a `CONTACT_HELP_ROUTE`: aquí ya se sabe que hay un código o un
 * testigo; allí no se sabe nada todavía.
 *
 * Reglas que cumplen todas las plantillas, y que hay que conservar al tocarlas:
 *
 * - **La primera frase identifica el servicio en lenguaje natural.** Nada de
 *   marcadores internos tipo `SERVICE_TYPE=…`: el orquestador de WhatsApp
 *   extrae de una frase normal, y un marcador solo serviría para que el
 *   visitante lo borrara antes de enviar.
 * - **Todos los campos se pueden dejar en blanco.** La plantilla ordena la
 *   consulta; no es un formulario. Lo que falte se pregunta después.
 * - **Ningún campo pide desmontar nada** para poder escribir.
 * - **Ni precios, ni plazos, ni urgencias, ni citas.** No hay ninguno
 *   confirmado, y una plantilla que los mencione invita a prometerlos.
 */
export const CONTACT_ROUTES = [
  {
    id: "diagnostico-dtc",
    service: SERVICE_BY_SLUG["diagnostico-dtc"],
    description:
      "Para un testigo encendido, códigos de avería o un vehículo limitado.",
    cta: "Consultar un diagnóstico DTC",
    messages: {
      particular: DTC_MESSAGE_LINES,
      taller: [
        "Hola, somos un taller y queremos consultar un caso de diagnosis/DTC.",
        "",
        "Vehículo:",
        "Año:",
        "Motor:",
        "DTC:",
        "Síntoma y condiciones en las que aparece:",
        "¿Arranca y circula?:",
        "Pruebas realizadas:",
        "Intervenciones anteriores sobre la unidad:",
      ],
    },
  },
  {
    id: "reprogramacion",
    service: SERVICE_BY_SLUG["reprogramacion"],
    description: "Para adaptar la gestión del motor o consultar una Stage 1.",
    cta: "Consultar una reprogramación",
    messages: {
      particular: [
        "Hola, quiero consultar una reprogramación.",
        "",
        "Vehículo:",
        "Año:",
        "Motor:",
        "¿Está de serie o modificado?:",
        "¿Arranca y funciona con normalidad?:",
        "Qué quiero conseguir:",
      ],
      taller: [
        "Hola, somos un taller y queremos consultar una reprogramación.",
        "",
        "Vehículo:",
        "Año:",
        "Motor:",
        "Estado actual o modificaciones:",
        "Qué quiere conseguir el cliente:",
        "Información adicional o DTC:",
      ],
    },
  },
  {
    id: "reparacion-ecu",
    service: SERVICE_BY_SLUG["reparacion-ecu"],
    description:
      "Para fallos, problemas de arranque o una posible avería de centralita.",
    cta: "Consultar una reparación de ECU",
    messages: {
      particular: [
        "Hola, quiero consultar una reparación de centralita ECU.",
        "",
        "Vehículo:",
        "Año:",
        "Motor:",
        "Qué ocurre:",
        "¿Arranca?:",
        "Códigos de error, si los tengo:",
        "Referencia de la centralita, si la tengo:",
      ],
      taller: [
        "Hola, somos un taller y queremos consultar una reparación de centralita ECU.",
        "",
        "Vehículo:",
        "Año:",
        "Motor:",
        "Síntoma o avería:",
        "¿Arranca?:",
        "DTC:",
        "Pruebas realizadas:",
        "Referencia de la centralita, si la tenemos:",
      ],
    },
  },
  {
    id: "clonacion-ecu",
    service: SERVICE_BY_SLUG["clonacion-ecu"],
    description:
      "Para transferir los datos de una centralita original a otra de sustitución.",
    cta: "Consultar una clonación de ECU",
    messages: {
      particular: [
        "Hola, quiero consultar una clonación de ECU.",
        "",
        "Vehículo:",
        "Año:",
        "Motor:",
        "Referencia de la centralita original:",
        "Referencia de la centralita de sustitución:",
        "¿Sé cuál es cuál?:",
      ],
      taller: [
        "Hola, somos un taller y queremos consultar una clonación de ECU.",
        "",
        "Vehículo:",
        "Año:",
        "Motor:",
        "Referencia de la unidad original:",
        "Referencia de la unidad de sustitución:",
        "¿Están identificadas ambas unidades?:",
        "Información adicional:",
      ],
    },
  },
] as const satisfies readonly ContactRoute[];

/**
 * La salida para quien no sabe qué servicio necesita.
 *
 * **No es una cuarta ruta.** Se dibuja aparte y sin tarjeta a propósito: si
 * compitiera en la fila con las otras tres, casi todo el mundo la elegiría —es
 * la que no obliga a decidir— y perderíamos justo el dato que hace útil la
 * primera respuesta. Pero tiene que verse: quien llega perdido y no encuentra
 * por dónde escribir, no escribe.
 */
export const CONTACT_HELP_ROUTE = {
  id: "orientacion",
  text: "¿No sabes qué servicio necesitas? Cuéntanos qué ocurre y te orientamos.",
  cta: "Contarlo sin elegir servicio",
  messages: {
    particular: [
      "Hola, no estoy seguro de qué servicio necesito.",
      "",
      "Vehículo:",
      "Año:",
      "Motor:",
      "Esto es lo que ocurre:",
      "Códigos de error o información que tengo:",
    ],
    taller: [
      "Hola, somos un taller y no estamos seguros de qué servicio necesita este caso.",
      "",
      "Vehículo:",
      "Año:",
      "Motor:",
      "Síntoma o consulta:",
      "DTC:",
      "Pruebas realizadas:",
    ],
  },
} as const satisfies ContactHelpRoute;

/** Un dato práctico de la página de contacto. */
export interface ContactFact {
  readonly label: string;
  readonly value: string;
  /** Solo el canal es accionable; el resto son datos. */
  readonly href?: string;
}

/**
 * Información práctica. **Solo datos confirmados por el cliente.**
 *
 * No hay horario, ni plazo de respuesta, ni dirección, ni correo: ninguno está
 * confirmado, y publicar un horario inventado es peor que no publicar ninguno.
 * Ver CONTACT_PENDING_CONFIRMATION.
 */
export const CONTACT_FACTS: readonly ContactFact[] = [
  {
    label: "Canal",
    value: CONTACT.whatsappDisplay,
    href: `https://wa.me/${CONTACT.whatsappNumber}`,
  },
  { label: "Zona", value: CONTACT.area },
  { label: "Primer contacto", value: "WhatsApp escrito" },
  { label: "Visitas", value: "Con cita previa" },
];

/**
 * PENDING_CLIENT_CONFIRMATION — **nada de esto se publica todavía.**
 *
 * Son los datos provisionales que el cliente aún no ha confirmado. Viven aquí,
 * y solo aquí, para que confirmarlos sea editar un objeto y no buscar cadenas
 * por las plantillas. Ninguna página los importa: hay una prueba que lo
 * comprueba (`test/contact.test.ts`).
 *
 * Cuando se confirmen: mover la dirección a `CONTACT.address`, el correo a
 * `CONTACT.email`, y decidir entonces si se publican, si aparece un mapa y si
 * los datos estructurados pasan de `Organization` a `AutoRepair` con
 * `address`. Ver docs/site-architecture.md §11.
 */
export const CONTACT_PENDING_CONFIRMATION = {
  status: "PENDING_CLIENT_CONFIRMATION",
  published: false,
  address: {
    street: "Av. Reyes Católicos, 15",
    postalCode: "18194",
    city: "Churriana de la Vega",
    province: "Granada",
  },
  email: "Hiperjomi@gmail.com",
} as const;

/* ═══════════════════════════════════════════════════════════════
   SOBRE NOSOTROS
   ═══════════════════════════════════════════════════════════════ */

/**
 * De dónde sale cada dato de /sobre-nosotros.
 *
 * La distinción no es burocracia: al repasar la página con el cliente hay que
 * poder decirle, dato a dato, si eso lo dijo él, si lo dice su web actual o si
 * lo hemos escrito nosotros para que la maqueta se pueda ver.
 */
export type AboutSource =
  /** Lo ha dicho el cliente de viva voz. Pendiente de confirmación escrita. */
  | "CLIENTE"
  /** Publicado hoy en jmreprocars.com. Verificable, pero no confirmado. */
  | "WEB_OFICIAL"
  /** Escrito para la maqueta. No lo ha afirmado nadie todavía. */
  | "MAQUETA";

/** Una línea del listado de cosas por confirmar. */
export interface AboutPendingItem {
  readonly id: string;
  /** Qué hay que preguntarle al cliente. */
  readonly question: string;
  /** Lo que la maqueta publica hoy mientras tanto. */
  readonly published: string;
  readonly source: AboutSource;
  /** Conflictos conocidos, o el motivo de haberlo escrito así. */
  readonly note?: string;
}

/**
 * PENDING_CLIENT_CONFIRMATION — contenido provisional de /sobre-nosotros.
 *
 * **Ojo a la diferencia con `CONTACT_PENDING_CONFIRMATION`**, que es lo
 * contrario: aquello son datos que NO se publican hasta confirmarlos (una
 * dirección y un correo, donde equivocarse manda a alguien a llamar a una
 * puerta que no es). Esto sí se publica, porque es una maqueta hecha para
 * enseñarla: el cliente no puede corregir una página que no ve. Nada de lo
 * que hay aquí es un dato de contacto, una cifra de resultados, una
 * titulación ni una garantía.
 *
 * Reglas al tocar este objeto:
 *
 * - **Ninguna cifra de resultados.** Ni vehículos hechos, ni clientes, ni
 *   años de garantía, ni plazos. Los «más de veinte años» son la única cifra,
 *   y es de oficio, no de resultados.
 * - **Ningún equipo, marca de maquinaria, banco de potencia ni instalación
 *   concreta**: no hay ninguna fuente que los sostenga.
 * - **Ninguna persona más que José**, y solo con nombre y papel.
 * - Todo lo que se añada aquí entra también en `ABOUT_TO_CONFIRM`, que es lo
 *   que se repasa con el cliente.
 */
export const ABOUT = {
  status: "PENDING_CLIENT_CONFIRMATION",
  /** Se publica: es la maqueta que hay que enseñar para poder corregirla. */
  published: true,

  /** Quién está al frente. Nombre y papel; nada más. */
  owner: {
    name: "José",
    role: "Al frente del taller",
  },

  /**
   * Los años de oficio.
   *
   * `short` es lo que se ve en el raíl; `long`, lo que cabe en una frase.
   * **La web actual del cliente dice «casi 30 años»**, y esa afirmación está
   * registrada como no verificada en docs/site-architecture.md §7. Aquí se
   * publica la cifra más prudente de las dos, que además es la que nos ha
   * llegado del cliente. Ver ABOUT_TO_CONFIRM.
   */
  experience: {
    short: "Más de 20 años",
    long: "más de veinte años en electrónica y automoción",
  },

  /** Para quién se trabaja. Confirmado por la web actual: sobre todo talleres. */
  audienceShort: "Particulares y talleres",

  /**
   * Sobre qué se trabaja.
   *
   * **La web actual dice más**: coches, camiones, motos, barcos y motos de
   * agua, y así lo publica la portada. Esta lista es la que nos ha llegado del
   * cliente para esta página, y es más corta. Hay que unificarlas.
   */
  vehicles: "Coches, motos y vehículos comerciales",

  /** La entradilla del hero. Dice qué es el taller, y para. */
  lead:
    "JM Repro Cars está especializado en reprogramación, reparación y " +
    "clonación de centralitas. Trabajamos para particulares y para otros " +
    "talleres.",

  /**
   * Qué aporta la experiencia. Dos bloques, no seis.
   *
   * Ninguno describe el flujo de una consulta: eso es /como-trabajamos, y
   * repetirlo aquí sería escribir la misma página dos veces.
   */
  applied: [
    {
      title: "Saber qué datos deciden un caso",
      body:
        "En una consulta hay tres o cuatro datos que cambian el diagnóstico y " +
        "muchos que no. Pedir los primeros ahorra media conversación, y a " +
        "veces sirve para decir pronto que el problema no está donde parecía.",
    },
    {
      title: "No tocar antes de entender",
      body:
        "Abrir, reprogramar o sustituir una unidad sin saber qué está pasando " +
        "es la forma más rápida de convertir una avería en dos. Cuando los " +
        "datos no bastan, lo que toca es seguir mirando, y decirlo.",
    },
  ],

  /**
   * Los dos perfiles. **No son dos servicios distintos**: es el mismo trabajo
   * con distinto punto de partida, igual que en /contacto. Lo que cambia es
   * qué clase de dato tiene cada uno a mano.
   */
  audiences: [
    {
      id: "particular",
      label: "Para particulares",
      body:
        "Explicamos qué necesitamos y qué opciones tiene el vehículo sin " +
        "exigir conocimientos técnicos. Si algo no se sabe, se pregunta de otra " +
        "manera.",
    },
    {
      id: "taller",
      label: "Para talleres",
      body:
        "Partimos de los DTC, las referencias, las pruebas hechas y los datos " +
        "disponibles. Con eso se puede revisar el caso con bastante más " +
        "precisión.",
    },
  ],

  /** Lo que comparten los dos perfiles. Va debajo, en el punto donde convergen. */
  audienceShared:
    "En los dos casos se mira lo mismo: qué está haciendo la unidad y por qué.",

  /**
   * Tres principios, y tres nada más. Describen cómo se trabaja, no valores
   * de empresa: cada uno se puede comprobar en una conversación real.
   */
  principles: [
    {
      title: "Primero entender",
      body: "No se propone una intervención sin revisar antes qué ocurre.",
    },
    {
      title: "Trabajar sobre el caso real",
      body: "Cada vehículo, cada unidad y cada configuración puede ser distinta.",
    },
    {
      title: "Explicar el resultado",
      body: "El cliente sabe qué se ha hecho y qué comportamiento esperar.",
    },
  ],
} as const;

/**
 * Lo que hay que confirmar con el cliente antes de publicar esta página.
 *
 * Está aquí, y no solo en un documento, para que se pueda repasar leyendo el
 * mismo archivo que se va a editar al confirmarlo. Cada línea dice qué se
 * publica hoy y de dónde ha salido.
 */
export const ABOUT_TO_CONFIRM: readonly AboutPendingItem[] = [
  {
    id: "responsable",
    question: "¿Se publica el nombre del responsable? ¿José, o nombre completo?",
    published: `${ABOUT.owner.name} — ${ABOUT.owner.role}`,
    source: "CLIENTE",
    note: "La web actual no nombra a nadie. Si prefiere no aparecer, el hero funciona igual sin el raíl.",
  },
  {
    id: "anios",
    question: "¿Cuántos años de experiencia se afirman?",
    published: ABOUT.experience.short,
    source: "CLIENTE",
    note: "Conflicto: jmreprocars.com/about dice «casi 30 años» y «más de 10.000 vehículos potenciados». Ninguna de las dos está verificada; la maqueta publica la más prudente y no publica ninguna cifra de vehículos.",
  },
  {
    id: "vehiculos",
    question: "¿Qué vehículos se atienden?",
    published: ABOUT.vehicles,
    source: "CLIENTE",
    note: "Conflicto: la web actual dice coches, camiones, motos, barcos y motos de agua, y así lo publica nuestra portada. Hay que unificar las dos listas.",
  },
  {
    id: "zona",
    question: "¿Se publica la localidad como zona de trabajo?",
    published: CONTACT.area,
    source: "CLIENTE",
    note: "La localidad ya se publica en /contacto. La dirección exacta sigue sin publicarse.",
  },
  {
    id: "publico",
    question: "¿Se atiende igual a particulares que a talleres?",
    published: ABOUT.audienceShort,
    source: "WEB_OFICIAL",
    note: "La web actual dice «ofrecemos sobre todo para talleres». La maqueta presenta los dos perfiles como iguales.",
  },
  {
    id: "experiencia-aplicada",
    question: "¿Es fiel la descripción de cómo se aborda un caso?",
    published: ABOUT.applied.map((item) => item.title).join(" · "),
    source: "MAQUETA",
    note: "Escrito para la maqueta a partir de lo que ya dicen /servicios y /como-trabajamos. No afirma ningún dato nuevo.",
  },
  {
    id: "principios",
    question: "¿Se reconoce en estos tres principios?",
    published: ABOUT.principles.map((item) => item.title).join(" · "),
    source: "MAQUETA",
  },
  {
    id: "fotografia",
    question: "¿Puede enviar fotografías propias del taller?",
    published: "Fotografía de banco de imágenes, sin rostro ni marcas",
    source: "MAQUETA",
    note: "Lista de las que hacen falta en docs/image-sources.md. Ninguna imagen actual se presenta como instalación ni como trabajo de JM Repro Cars.",
  },
];
