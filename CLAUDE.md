# CLAUDE.md — Taller ECU / JMReprocars

Guía permanente para cualquier agente o persona que trabaje en este repositorio.
Léela entera antes de tocar código.

---

## 1. Reglas críticas (nunca las incumplas)

1. **`/opt/taller-ecu` contiene la infraestructura desplegada y los datos actuales, y
   es intocable.** No leas, no escribas, no ejecutes comandos, no lances
   `docker compose` ni scripts en esa ruta. Ni siquiera para "solo mirar". Todo el
   trabajo ocurre en `/home/david/taller-ecu-dev`.
2. **No leas `.env`, claves, credenciales, backups ni datos de producción.**
   Esto incluye `backend/.env`, cualquier `.env.*`, el contenido de `backups/`,
   volcados de PostgreSQL y las credenciales guardadas dentro de n8n.
   Si necesitas saber qué variables existen, consulta `.env.example`.
3. **No inicies, detengas ni reconstruyas contenedores** sin que el usuario lo pida
   explícitamente. No `docker compose up/down/build/restart`.
4. **No ejecutes migraciones ni modifiques la base de datos.** Ni en desarrollo ni,
   por supuesto, en producción. Escribir el fichero de una migración es aceptable
   cuando se ha acordado; ejecutarla no lo es.
5. **`INTERNAL_API_KEY` nunca debe llegar al navegador**, ni en HTML, ni en JS de
   cliente, ni en variables `NEXT_PUBLIC_*`, ni en logs.
6. **No hagas commit ni push sin que se te pida.** Trabaja siempre en una rama.

---

## 2. Producción vs. desarrollo

| | `/opt/taller-ecu` | `/home/david/taller-ecu-dev` |
|---|---|---|
| Qué es | La infraestructura desplegada y los datos actuales | **Únicamente una copia Git de desarrollo** |
| Acceso | **Prohibido** | Único entorno de trabajo |
| Base de datos | La única que existe, con los datos actuales | **No existe todavía** una base de datos de pruebas |
| n8n | La única instancia desplegada | **No existe todavía** una instancia aislada de desarrollo |

Consecuencias prácticas:

- En desarrollo **solo hay código**. No hay contenedores propios, ni base de datos de
  pruebas, ni n8n aislado. Cualquier tarea que requiera ejecutar algo contra una base
  de datos o contra n8n necesita antes montar ese entorno, y eso se acuerda; no se
  improvisa.
- **Los cambios hechos aquí no llegan a producción automáticamente.** Solo llegan
  después de revisar, probar, fusionar y desplegar de forma expresa. Ese despliegue
  es siempre una decisión del usuario.
- Ambos comparten el mismo repositorio Git
  (`git@github.com:DavidEstevezzz/taller-ecu.git`), así que lo que se fusione acabará
  desplegándose: trata cada cambio con ese cuidado.

`scripts/backup-postgres.sh` contiene rutas de producción codificadas
(`/opt/taller-ecu`). **No lo ejecutes desde este entorno.**

---

## 3. Arquitectura actual

Tres servicios en `compose.yml`, en la red `taller-network`:

```
WhatsApp (Meta Cloud API)
        │  webhook
        ▼
      n8n  ──── HTTP + x-internal-api-key ────▶  backend (Fastify)
        │                                              │
        │ OpenAI (transcripción, visión, extracción)    │ pg.Pool
        ▼                                              ▼
                                                 PostgreSQL 17
```

### Responsabilidades — respétalas

**n8n (`docker.n8n.io/n8nio/n8n:2.34.6`, puerto `127.0.0.1:5678`)** es el cerebro.
El workflow `WhatsApp Inbound - Test` (78 nodos) implementa: verificación de firma
HMAC, deduplicación por `provider_message_id`, enrutado por tipo de mensaje, descarga
de multimedia desde Graph API v26, transcripción de audio y análisis de imagen/PDF
con OpenAI, extracción de datos estructurados del vehículo, cálculo de campos
faltantes, generación de la siguiente pregunta, handoff a humano, envío saliente y
registro de estados de entrega.
El workflow `Taller ECU - Error Handler` persiste los fallos en `workflow_errors`.

Que el workflow figure como **activo dentro de n8n no significa que esté conectado a
un WhatsApp real**. Ver §3.1: buena parte de esa lista está implementada pero aún no
validada contra Meta.

**Backend (Fastify 5 + TypeScript, puerto `127.0.0.1:3000`)** es una capa de
persistencia deliberadamente delgada: SQL a pelo con `pg.Pool`, validación por JSON
Schema (`backend/src/schemas.ts`), sin lógica conversacional. Lo único no trivial son
las transacciones (`/requests/:id/handoff`, `/requests/:id/close`,
`/message-statuses`).

**PostgreSQL 17** almacena el negocio *y* la base de datos interna de n8n. Migraciones
con `node-pg-migrate` en `backend/migrations/`.

**No traslades lógica de n8n al backend ni al revés sin acuerdo explícito.**

### 3.1 Estado de validación — importante

**Todavía no tenemos acceso a la API de WhatsApp del cliente.** El sistema no está
atendiendo conversaciones de un WhatsApp real. Toda la validación hecha hasta ahora
se apoya en **webhooks de texto sintéticos firmados**, no en tráfico de Meta.

Probado:

- Infraestructura Docker del servidor.
- PostgreSQL y backend.
- Workflows de n8n.
- Recepción de webhooks de texto sintéticos firmados.
- Conversaciones de reprogramación, reparación, clonación, correcciones, urgencia,
  datos no disponibles y petición de atención humana.
- Regresiones automáticas de texto superadas.

Implementado pero **pendiente de probar**:

- Conexión con la cuenta real de Meta/WhatsApp del cliente.
- Recepción de mensajes desde WhatsApp real.
- Obtención y descarga de multimedia mediante `mediaId`.
- Transcripción de audios recibidos desde Meta.
- Análisis de imágenes y documentos recibidos desde Meta.
- Estados reales de entrega enviados por Meta.

API del panel (`/api/admin/*`): **implementada y probada localmente, sin desplegar**.

- Autenticación de sesión: login, logout y `me`.
- Lectura: dashboard, listado de solicitudes con búsqueda y filtros, detalle de una
  solicitud e historial de un cliente. Solo lectura: **no hay ningún endpoint de
  escritura todavía**.
- Todo está cubierto por pruebas que se ejecutan con dobles, sin PostgreSQL.
- **Las migraciones de `users`, `sessions` y `login_attempts` están creadas pero
  todavía no se han ejecutado**, ni en desarrollo ni en producción. Hasta que se
  apliquen, nadie puede iniciar sesión y toda la API del panel es inalcanzable.
- **El script CLI de alta del primer OWNER ya se ha probado contra PostgreSQL** en el
  entorno desechable de integración: crea el usuario con hash Argon2id y email
  normalizado. Funciona tanto con terminal interactivo como con entrada por tubería.
- **El frontend existe pero no está desplegado**: portada pública, hub de
  servicios, **las cuatro páginas de servicio** —diagnóstico DTC, reprogramación,
  reparación de ECU y clonación de ECU—, **`/como-trabajamos`**,
  **`/contacto`**, **`/sobre-nosotros`**, login y resumen del panel. Ver
  `docs/frontend-design.md`.
- **`/servicios/reprogramacion` se reconstruyó entera con otra perspectiva.**
  Dejó de explicar qué ocurre dentro de la centralita y pasó a responder **qué
  se nota al volante**: hero fotográfico con un coche en movimiento, una banda
  de entrega interactiva (`PowerBand.astro`), un acordeón de cinco opciones
  (`ServiceOptions.astro`), el enlace al calculador externo y un cierre en
  cobre con los cuatro datos que hay que enviar. **Es la primera página oscura
  de principio a fin**, y el experimento de una posible evolución visual del
  resto del sitio: no la extiendas a otras páginas sin acordarlo. Reglas
  propias en `docs/frontend-design.md` §5.15–§5.17 y pruebas en
  `web/test/repro.test.ts`.
- **Existe un CONCEPTO B de reprogramación, y no es una página del sitio.**
  Vive en `/conceptos/reprogramacion-b` y es una **maqueta interna** para
  comparar dos direcciones artísticas de la misma página. `noindex, nofollow`,
  fuera del sitemap, `Disallow` en robots, sin canónica y **sin un solo enlace
  desde ninguna página pública**: solo se llega escribiendo la URL. No la
  publiques, no la enlaces, no la des por adoptada y no la describas como parte
  de la web. Tiene **sistema visual propio y aislado** —no importa Tailwind ni
  `tokens.css`, no usa `PublicLayout`, `SiteHeader`, `SiteFooter` ni
  `BrandMark`, y añade la única dependencia nueva del frontend,
  `@fontsource-variable/archivo`—, de modo que nada de lo que se pruebe ahí
  puede cambiar el aspecto del sitio. Razonamiento, referencias y pendientes en
  `docs/concepto-b-reprogramacion.md`; reglas vigiladas por
  `web/test/concept-b.test.ts`.
- **Existe también un CONCEPTO C**, en `/conceptos/reprogramacion-c`, con las
  mismas reglas que el B: maqueta interna, `noindex, nofollow`, fuera del
  sitemap, `Disallow` en robots, sin canónica y sin un solo enlace desde
  ninguna página pública. Dirección propia —«Banco»: chasis gris de
  instrumento, sin fotografía, dibujo técnico, azul de señal y un pedal que
  se mantiene pisado mientras un registrador traza la entrega— y sistema
  visual aislado: hoja y carcasa propias, sin Tailwind ni `tokens.css`, sin
  nada del B, y una dependencia nueva (`@fontsource/barlow`) que solo carga
  su carcasa. Razonamiento en `docs/concepto-c-reprogramacion.md`; reglas
  vigiladas por `web/test/concept-c.test.ts`. No lo publiques, no lo enlaces
  y no lo describas como parte de la web.
- **El abanico comercial de reprogramación está SIN CONFIRMAR.** «Stage 1»,
  «Stage 2», «orientada al consumo» y «motos» son una propuesta de cómo nombrar
  el servicio, no contenido verificado: cada una tiene su línea en
  `REPRO_OPTIONS_TO_CONFIRM` (`web/src/config/site.ts`). No las describas como
  servicios confirmados. **La gestión de cambio automático NO se publica.**
- **`/servicios/diagnostico-dtc` vende capacidad de resolución, no
  procedimiento.** Se rehízo entera por eso: la primera versión documentaba el
  método —anatomía de un código, cinco tramos del análisis, quince líneas de
  escenario, la plantilla de WhatsApp a la vista— en 1.396 palabras. Hoy tiene
  **cinco secciones y 320 palabras visibles**, y la regla que la ordena es *una
  necesidad, una interacción, un abanico de soluciones y una llamada a la
  acción*. Si vas a añadirle algo, tiene que servir a una de las cuatro; si no,
  no entra. Hay pruebas de la densidad en `web/test/dtc.test.ts`.
- **Sigue escrita en términos de método, no de alcance.** El cliente ha
  confirmado que su especialidad es el software —«repros, DTCs, etc.»— y la web
  lo posiciona así, pero la página **no afirma qué marcas, qué gestiones, qué
  herramientas ni qué tipos de caso se atienden**. No la describas como un
  catálogo de capacidades confirmadas. Ver `docs/site-architecture.md` §11.
- **PENDIENTE DE INTEGRACIÓN, y no se toca en la fase de frontend:** el
  clasificador del agente de WhatsApp y el CHECK de `requests.service_type`
  siguen teniendo cuatro valores (`REPROGRAMMING`, `ECU_REPAIR`, `ECU_CLONING`,
  `OTHER`). Una consulta de diagnosis entra hoy como `OTHER`. La plantilla de
  WhatsApp de la página identifica el servicio en lenguaje natural, así que el
  orquestador puede extraerlo sin cambios; **añadir un valor al enum es una
  migración y una revisión del workflow, y se acuerda aparte**.
- **`/sobre-nosotros` es una maqueta para enseñar al cliente.** Todo lo que dice
  sobre él —quién está al frente, los años de experiencia, los vehículos que se
  atienden— es **provisional**: vive en `ABOUT` (`web/src/config/site.ts`),
  marcado `PENDING_CLIENT_CONFIRMATION`, con el listado de lo que hay que
  confirmar en `ABOUT_TO_CONFIRM`. No la describas como contenido confirmado.
- Nada de esto está desplegado: no describas la API del panel como activa o en
  producción.

No describas ninguno de estos puntos pendientes como funcionando, ni en código, ni en
documentación, ni en mensajes de commit.

### Modelo de datos

`customers` (teléfono único) → `vehicles` → `requests` → `conversations` → `messages`
→ `message_status_events`. Más `workflow_errors`, independiente.

Autenticación del panel (migraciones creadas, **sin ejecutar**):
`users` (email único normalizado, `password_hash`, `role`, `is_active`) →
`sessions` (`token_hash`, `expires_at`, `revoked_at`). Más `login_attempts`, que
sostiene la limitación de intentos.

Enumerados aplicados con CHECK constraints:
- `requests.status` ∈ `COLLECTING`, `HUMAN`, `CLOSED`
- `requests.service_type` ∈ `REPROGRAMMING`, `ECU_REPAIR`, `ECU_CLONING`, `OTHER`
- `messages.direction` ∈ `INBOUND`, `OUTBOUND`
- `messages.message_type` ∈ `TEXT`, `AUDIO`, `IMAGE`, `DOCUMENT`, `OTHER`
- `messages.delivery_status` ∈ `sent`, `delivered`, `read`, `failed` (o NULL)

`conversations.bot_enabled` es el interruptor bot/humano.
Un trigger PL/pgSQL (`reconcile_message_status_after_message_insert`) reconcilia los
acks de Meta que llegan antes que el mensaje al que pertenecen.

### Autenticación actual

Dos mecanismos separados que nunca se mezclan:

**Máquina a máquina (n8n).** El hook `internalApiKeyHook`
(`backend/src/plugins/internalApiKey.ts`, registrado desde `app.ts`) protege `/api/*`
con una única clave estática compartida en la cabecera `x-internal-api-key`.
Excepciones: `/api/whatsapp/webhook/verify` (usa su propio verify token de Meta),
`/health` (fuera de `/api/`) y `/api/admin/` (usa sesión de usuario).

**Panel (`/api/admin/*`).** Sesiones opacas guardadas en PostgreSQL. Contraseñas con
Argon2id; el token de sesión viaja en una cookie `HttpOnly` y en la base de datos solo
se guarda su SHA-256. Sesiones **absolutas de 12 horas**, sin renovación deslizante:
cubren una jornada del taller con un único inicio de sesión y acotan la ventana de uso
de una cookie robada. La API administrativa **nunca** acepta `INTERNAL_API_KEY`, y una
sesión del panel **nunca** abre las rutas de n8n; hay pruebas en ambos sentidos.

No hay CORS (todo es mismo origen) ni reverse proxy todavía.

---

## 4. Contrato con n8n — no romper

Estas URLs, cabeceras y comportamientos son **el contrato actual entre el workflow de
n8n y el backend**, validado mediante pruebas sintéticas de texto. Debe conservarse
intacto de cara a la futura conexión con la cuenta real de Meta: cualquier
divergencia introducida ahora se manifestaría como un fallo justo en el momento de
conectar WhatsApp, que es cuando peor se diagnostica.

No las renombres, no cambies sus prefijos, no reorganices todavía su registro en
`server.ts`, no alteres sus códigos de estado ni la forma de sus respuestas.

| Método | Ruta | Uso desde n8n |
|---|---|---|
| POST | `/api/customers/find-or-create` | Resolver el cliente por teléfono |
| POST | `/api/vehicles/find-or-create` | Resolver el vehículo (VIN → matrícula → datos) |
| POST | `/api/requests` | Crear solicitud |
| GET | `/api/requests/:requestId` | Leer la solicitud activa |
| PATCH | `/api/requests/:requestId` | Actualizar datos extraídos por la IA |
| POST | `/api/requests/:requestId/handoff` | Pasar a humano y desactivar el bot |
| POST | `/api/conversations` | Crear conversación |
| GET | `/api/customers/:customerId/conversations/active` | Buscar conversación abierta |
| POST | `/api/messages` | Guardar mensajes entrantes y salientes |
| GET | `/api/messages/provider-exists` | Deduplicación antes de procesar |
| POST | `/api/message-statuses` | Acks de entrega de Meta |
| POST | `/api/workflow-errors` | Error handler global |
| GET | `/api/whatsapp/webhook/verify` | Verificación del webhook de Meta |
| GET | `/health` | Healthcheck de Docker y de n8n |

Detalles que forman parte del contrato:
- La cabecera es exactamente `x-internal-api-key` (credencial `httpHeaderAuth`
  compartida en n8n).
- El hook excluye `/api/admin/`, que se autentica por cookie de sesión. Esa exclusión
  no afecta a ninguna ruta que use n8n.
- Dentro de la red Docker, n8n llama a `http://backend:3000`.
- `POST /api/messages` es idempotente vía `ON CONFLICT (provider_message_id)` y
  responde `{ created: false, duplicate: true }` en el segundo intento. Ese contrato
  es el que sostiene la deduplicación.
- `POST /api/message-statuses` es idempotente vía índice único
  `(provider_message_id, status, status_timestamp)`.

**Antes de refactorizar la autenticación o `server.ts` hacen falta pruebas de
integración mínimas que protejan estos endpoints.** Es un requisito acordado, no una
sugerencia; y es aún más importante dado que hoy la única red de seguridad son las
pruebas sintéticas de texto.

---

## 4.1 API de lectura del panel

Bajo `/api/admin`, **todas** exigen sesión administrativa; `x-internal-api-key` no
sirve para acceder a ellas. Solo lectura.

| Método | Ruta | Devuelve |
|---|---|---|
| GET | `/api/admin/dashboard` | totales, solicitudes por estado y tipo de servicio, actividad reciente |
| GET | `/api/admin/requests` | listado paginado con búsqueda y filtros |
| GET | `/api/admin/requests/:requestId` | solicitud + cliente + vehículo + conversaciones + mensajes |
| GET | `/api/admin/customers/:customerId` | cliente + vehículos + solicitudes + resumen |

Reglas que hay que mantener al ampliarla:

- El guard `requireAdminUser` se aplica como hook del plugin, una sola vez: ninguna
  ruta nueva puede olvidarlo.
- **Todo valor del usuario viaja como parámetro posicional.** En el SQL solo se
  interpolan identificadores de las listas cerradas de `src/panel/sql.ts` (columnas de
  ordenación y sentido). Nunca concatenes texto recibido.
- Las conversaciones de una solicitud se recuperan por `conversations.request_id`,
  nunca por `customer_id`.
- Los mapeadores de `src/panel/service.ts` eligen campo a campo lo que se expone: no
  devuelvas filas crudas de PostgreSQL en una respuesta.
- Los parámetros de query desconocidos se rechazan con 400 mediante un hook local. Esa
  estrictez es deliberada y **no** debe implementarse tocando la configuración global
  de ajv, que cambiaría el comportamiento de las rutas de n8n.

---

## 5. Qué estamos construyendo

Dentro de este mismo repositorio, sin microservicios y sin arquitecturas
especulativas:

**Web pública (JMReprocars)** — orientada a SEO: inicio, servicios, cómo trabajamos,
sobre nosotros, preguntas frecuentes, contacto por WhatsApp y contenido legal.

**Panel privado** — para gestionar el trabajo que llega por WhatsApp:
autenticación, resumen de solicitudes, listado con búsqueda y filtros, detalle de
cada solicitud (cliente, vehículo, resumen generado por IA, campos pendientes,
conversación completa), urgencia, notas internas, cambio de estado e historial del
cliente.

**El panel consume el backend por una API protegida. Nunca se conecta a PostgreSQL
directamente.**

---

## 6. Decisiones técnicas aprobadas

1. **Una sola aplicación en `web/`** para la web pública y el panel. Nada de dos
   proyectos frontend separados. **Implementada con Astro 5 + TypeScript estricto +
   React (islas) + Tailwind 4**, no con Next.js: la web pública es estática y no
   necesita servidor propio, y el panel se resuelve con islas de React. Evita añadir
   un runtime de servidor que hoy no hace falta (§6.1).
2. **Las rutas actuales de n8n conservan URLs, cabeceras y comportamiento.** Sin
   renombrar, sin cambiar prefijos, sin reorganizar su registro por ahora.
3. **Autenticación implementada en el backend Fastify** — ya escrita y probada, pero
   **sin desplegar**: cookie segura HttpOnly, contraseñas con hash **Argon2id**, nunca
   tokens en `localStorage`, nunca `INTERNAL_API_KEY` en el navegador, sin registro
   público, primer usuario creado mediante script CLI, roles **OWNER** y **EMPLOYEE**.
   Sesiones absolutas de 12 horas; el token solo se guarda hasheado.
4. **Mismo origen** en `jmreprocars.com`: panel en `/panel`, API administrativa en
   `/api/admin`. **No configures CORS abierto.**
5. **Urgencia = columna booleana `is_urgent`**, por defecto `false`, editable desde el
   panel. **No modifiques n8n todavía** para rellenarla automáticamente.
6. **El panel no envía respuestas de WhatsApp en la primera versión.** Muestra la
   conversación y ofrece un botón para abrir WhatsApp.
7. **Polling sencillo cada ~30 s** para refrescar conversaciones. **Sin WebSockets.**
8. **Todavía sin Caddy, nginx, TLS ni cambios de DNS.** Primero backend y frontend
   probados de forma aislada.
9. **No modifiques, borres ni neutralices ninguna migración existente.** La migración
   duplicada está documentada como riesgo pendiente (§8) hasta comprobar el historial
   real de migraciones en producción.
10. **Pruebas de integración mínimas antes de refactorizar autenticación o
    `server.ts`.**

### Simplicidad proporcionada al problema

El taller recibe **10–20 conversaciones nuevas al día**. Esa cifra es el criterio para
resolver dudas de diseño. Sin microservicios, sin colas, sin caché distribuida, sin
GraphQL, sin ORM, sin monorepo con workspaces, sin gestor de estado global, sin
funcionalidades especulativas. Si una solución parece elegante pero añade una pieza de
infraestructura, casi seguro es la equivocada. Paginación y consultas SQL directas
bastan y bastarán durante años.

---

### 6.1 Frontend (`web/`)

Astro 5, TypeScript estricto, React solo donde hay interacción, Tailwind 4 con
tokens propios. Sin SSR: `output: "static"`.

- **Los tokens de diseño son la única fuente de color, tamaño, sombra y
  movimiento** (`web/src/styles/tokens.css`, tres capas). Ningún valor suelto en
  una plantilla.
- **El dominio se escribe una sola vez**, en `web/src/config/domain.mjs`. Nunca
  repitas `https://jmreprocars.com` en un componente.
- **El contenido pendiente de confirmar vive en `web/src/config/site.ts`**, marcado
  con `PENDIENTE`. No lo repartas por las páginas.
- **Todos los metadatos pasan por `Seo.astro`.** Ninguna página escribe etiquetas
  sueltas.
- **La marca se dibuja solo en `BrandMark.astro`.** El logo definitivo está
  pendiente; sustituir ese componente debe bastar.
- **`/admin` lleva `noindex`, queda fuera del sitemap y bloqueado en robots.**
  Son señales para buscadores: la seguridad real es la sesión del backend.
- **La capa HTTP del panel es `web/src/lib/api/`**: base relativa `/api`,
  `credentials: "include"`, sin tokens en `localStorage`. No dupliques `fetch` en
  un componente.
- **La web pública lleva ~2,9 kB de JavaScript en línea**, y ni una línea es
  necesaria para leerla: `web/src/scripts/motion.ts` añade revelado al entrar en
  pantalla, el trazado de la pista del proceso, el paralaje del despiece, el
  cierre de los menús de la cabecera y el marcado del índice de `/servicios`.
  Tres páginas añaden lo suyo, y solo en ellas:
  `web/src/scripts/symptom-route.ts` (1,4 kB en `/servicios/diagnostico-dtc`)
  traza el camino de la señal **cuando el visitante elige un caso** y enciende
  la unidad al llegar; la elección en sí es un grupo de radios resuelto con CSS
  y funciona sin él;
  `web/src/scripts/fault-trace.ts` (1,4 kB en `/servicios/reparacion-ecu`)
  conduce el paso a paso del recorrido por la placa **con el desplazamiento**, y
  solo si hay JavaScript, no se ha pedido menos movimiento y caben dos columnas
  (≥1024 px); `web/src/scripts/identity-transfer.ts` (1,4 kB) y
  `web/src/scripts/message-builder.ts` (0,8 kB), en
  `/servicios/clonacion-ecu`, conducen el traslado entre unidades **con
  botones** y arman la plantilla de WhatsApp;
  `web/src/scripts/power-band.ts` (1,5 kB en `/servicios/reprogramacion`)
  **deforma** la curva de entrega de un objetivo a otro y la hace nacer sobre la
  de partida al entrar en pantalla; el selector es un grupo de radios resuelto
  con CSS y las cinco curvas van dibujadas en el HTML, así que sin él no falta
  nada. Esa misma página lleva **dos scripts en línea de una línea larga cada
  uno**: el que cierra la primera opción del acordeón por debajo de 768 px, y
  nada más —el acordeón es `<details>` y se abre solo; el salto al configurador
  es un ancla, y el desplazamiento suave lo pone `scroll-behavior` de
  `tokens.css`—. **`/como-trabajamos`,
  `/contacto` y `/sobre-nosotros` no añaden ni un byte**: el esquema de la primera se traza con el
  mecanismo `.trace-draw` que ya existe, y en las dos el selector es un grupo de
  radios resuelto con CSS. En `/contacto` eso incluye los conductores del cuadro
  de conexiones, su encendido al enfocar una ruta (`:has()`) y el pulso al
  cambiar de variante: todo CSS. En `/sobre-nosotros`, el corte estratigráfico
  (`SignalStrata.astro`) se traza con ese mismo mecanismo `.trace-draw` y
  calcula sus retardos invirtiendo la curva de la animación, en compilación.
  Total por página: 2,9 kB en la portada, en `/servicios`, en
  `/como-trabajamos`, en `/contacto` y en `/sobre-nosotros`; 4,4 kB en
  diagnóstico; 4,3 kB en reparación; 5,0 kB en clonación; 4,4 kB en
  reprogramación.
  **Sin librería de animación**: IntersectionObserver, rAF y temporizadores
  bastan. Si añades una isla de React a una página pública, justifica por qué.
- **Nada que haya que leer puede empezar oculto.** El interruptor `js-anim` lo
  pone un script en línea del `<head>` y solo se activa si hay JavaScript **y**
  el visitante no ha pedido menos movimiento; todas las reglas que ocultan algo
  cuelgan de él. Sin JavaScript, o con movimiento reducido, la página se sirve
  entera y visible. Está verificado con capturas reales en ambos modos.
- **Los dibujos de centralita se calculan, no se escriben a mano.** La
  proyección vive en `web/src/lib/iso.ts` y la usan `EcuExploded.astro` (la
  firma del hero), `ServiceDiagram.astro` (uno por servicio),
  `FaultTrace.astro` (el recorrido por la placa de `/servicios/reparacion-ecu`) e
  `IdentityTransfer.astro` (el traslado entre dos unidades de
  `/servicios/clonacion-ecu`).
  Si tocas la geometría, tócala ahí: hay un solo sistema de ejes en todo el
  sitio. **Las excepciones son cuatro**, y las cuatro calculan su geometría
  igualmente: `CaseHarness.astro` (`/como-trabajamos`), que no dibuja una
  centralita sino un esquema de cableado; `SignalStrata.astro`
  (`/sobre-nosotros`), que dibuja una sección con cuatro generaciones de
  electrónica; `SymptomRoute.astro` (`/servicios/diagnostico-dtc`), cuyo
  campo de pistas es plano aunque la unidad a la que llegan sí use `iso.ts`; y
  `PowerBand.astro` (`/servicios/reprogramacion`), que no dibuja ninguna
  centralita sino dos curvas de entrega sobre un plano cartesiano.
  **`MapLayer.astro` se retiró**: dibujaba la retícula de un mapa de
  calibración para el hero de reprogramación, y esa página se rehízo alrededor
  del vehículo. Está en el historial de Git.
- **Ningún dibujo lleva cifras, códigos ni medidas.** Un mapa de calibración se
  representa como la retícula que es, sin escribir un solo valor: inventar datos
  técnicos está prohibido también en un SVG.
- **No se publica ningún código de avería concreto**, ni real ni «de ejemplo»,
  en ninguna página. Qué significa un código depende del vehículo, de la unidad
  y del contexto, así que escribir uno completo es afirmar algo que no podemos
  sostener. `web/test/dtc.test.ts` recorre todo `web/src` y falla si aparece uno.
- **Los servicios no se numeran.** Son alternativas, no una secuencia; se
  distinguen por la capa sobre la que actúan (`depth` en `site.ts`) y por su
  dibujo. El único 01–04 del sitio es el del proceso, que sí es una secuencia.
  **Son cuatro y no son cuatro cosas del mismo tipo**: tres son intervenciones
  sobre la unidad y la primera —el diagnóstico DTC— es el análisis que decide
  cuál de las tres hace falta, o si no hace falta ninguna. Esa diferencia es el
  campo `kind`, y `INTERVENTIONS` es la lista de las tres: las frases que
  enumeran en qué puede acabar un caso usan esa lista, no `SERVICES`, porque un
  diagnóstico no es un desenlace.
  Las zonas del recorrido de `FaultTrace` tampoco se numeran: su orden es
  geométrico —el que encuentra la señal saliendo del conector—, no un
  procedimiento. Las capas de `IdentityTransfer`, igual: son la pila, no los
  pasos de un trabajo.
- **La cabecera solo enseña destinos que sean una página pública real.** Nada de
  anclas disfrazadas de página compitiendo en la barra principal. Lo decide el
  campo `page` de cada servicio en `site.ts`; las secciones internas viven en el
  pie y en enlaces contextuales. Rellenar `page` es lo único que hay que hacer
  al crear una página: cabecera, pie, tarjetas de la portada y enlaces laterales
  se actualizan solos. **Desde que hay más de una página de servicio, la
  barra las agrupa en un desplegable «Servicios»**: cuatro destinos más el botón
  de WhatsApp no caben a 1024 px sin partir una etiqueta en dos líneas, y eso
  rompe `--header-height`. Es un `<details>`, como el menú de móvil: funciona
  sin JavaScript, va por teclado y no depende de `hover`, que en táctil no
  existe. **Al lado del desplegable van las páginas de nivel 1**, hoy «Cómo
  trabajamos», «Sobre nosotros» y «Contacto»; se añaden al array `PAGES` de
  `SiteHeader.astro`. **Con esas tres la barra está llena a 1024 px** —caben
  porque el relleno de los enlaces se aprieta entre 1024 y 1280—: la siguiente
  habrá que agruparla bajo un desplegable, no encoger nombres. Lo que
  nunca entra en la barra es un ancla: «Preguntas habituales» sigue siendo una
  sección de `/servicios` y sigue viviendo en el pie y en el menú de móvil. **La comparación de rutas pasa siempre por
  `web/src/lib/path.ts`**: con `build.format: "file"` el `pathname` trae el
  `.html` en compilación, y compararlo en crudo funciona en `astro dev` y falla
  en producción, que es como el `aria-current` de la cabecera estuvo muerto sin
  que se notara.
- **Una sola petición a terceros en toda la web pública**, y está declarada en
  `web/src/config/embeds.ts`: el configurador de Tuning-shop.com de
  `/servicios/reprogramacion`. Reglas que no se negocian: **no se carga hasta que
  el visitante lo activa** (deja cookie de tercero), la atribución al proveedor no
  se oculta, el aviso de que sus cifras son orientativas vive en NUESTRO HTML y no
  dentro del marco, y no se toca el DOM interior del marco. Si hace falta otra
  excepción, va en ese archivo y se documenta. Ver `docs/embed-tuning-shop.md`.
  **El botón «Calcular mejora» (`CalcLink.astro`) NO enlaza fuera**: es un ancla
  interna a `#configurador`, para no obligar a recorrer la página entera. Va en
  el hero y en una pestaña lateral pegajosa. Si algún día se enlaza fuera de
  verdad, `embeds.ts` explica por qué `tuning-shop.com/demo/` no vale como
  destino y por qué `rel="noreferrer"` rompería el enlace.
- **Las cifras del proveedor no se afirman nunca como propias.** No son
  mediciones nuestras, no salen de un banco, no confirman compatibilidad y no son
  un presupuesto. Tampoco se copian a nuestro HTML ni se generan páginas por
  vehículo.
- **Las imágenes van en `web/src/assets/photos/` y se usan con `astro:assets`.**
  Nunca hotlinking. Registra procedencia y licencia en `docs/image-sources.md`.
- **El servidor de desarrollo no habla con ningún backend salvo que se lo pidas.**
  `DEV_API_PROXY_TARGET=http://127.0.0.1:3100 npm run dev`, y solo destinos
  locales. Sin la variable no hay proxy: así `npm run dev` no puede alcanzar el
  backend real de `127.0.0.1:3000` por descuido.
- **No inventes datos del cliente**: ni cifras, ni premios, ni plazos, ni precios,
  ni testimonios, ni dirección. Ver `docs/site-architecture.md` §11.
- **Los datos provisionales sin confirmar viven en un solo objeto y no se
  publican.** `CONTACT_PENDING_CONFIRMATION` (`web/src/config/site.ts`) guarda
  hoy una dirección y un correo marcados `PENDING_CLIENT_CONFIRMATION`. Ninguna
  página los importa, y `web/test/contact.test.ts` falla si aparecen en una
  plantilla.
- **`ABOUT` es el caso contrario, y la diferencia importa.** Es contenido
  provisional que **sí se publica**, porque `/sobre-nosotros` es una maqueta
  para que el cliente la corrija, y una maqueta que no se ve no se corrige. Lo
  que nunca entra ahí: cifras de resultados, garantías, certificaciones,
  maquinaria, instalaciones ni personas distintas del responsable. Cada dato
  publicado tiene su línea en `ABOUT_TO_CONFIRM` diciendo de dónde sale, y
  `web/test/about.test.ts` vigila las prohibiciones.
- **Las plantillas de WhatsApp de `/contacto` son un contrato con el
  orquestador.** Están en `CONTACT_ROUTES` y `CONTACT_HELP_ROUTE`, una por
  servicio y variante (particular / taller). Su primera frase identifica el
  servicio **en lenguaje natural**: nada de marcadores tipo
  `SERVICE_TYPE=ECU_REPAIR`, que el visitante ve y borra. Todos los campos se
  pueden dejar en blanco. Hay pruebas de las tres reglas.

En desarrollo, `/api` se redirige al backend con el proxy de Vite, para que la
cookie de sesión se comporte igual que en producción (mismo origen).

**El frontend no está desplegado.** No hay servidor, ni dominio apuntando, ni
build publicado.

---

## 7. Cómo trabajar

- **Rama por trabajo.** Nunca directamente sobre `main`. Rama actual:
  `feature/web-foundation`.
- **Commits pequeños y con un solo propósito.** Un cambio de esquema, un endpoint, una
  pantalla. Nada de commits que mezclen refactor y funcionalidad nueva.
- **Revisa el diff antes de cada commit** (`git diff`, `git diff --stat`). Léelo de
  verdad; no lo des por bueno.
- **Prueba antes de dar algo por terminado.** Si no lo has ejecutado, no está probado;
  dilo claramente en lugar de suponerlo.
- **Commit solo cuando se pida.** Formato de mensaje del repositorio:
  `feat:`, `fix:`, `chore:` en minúsculas, en imperativo.
- **Sigue el estilo existente:** TypeScript ESM (`import ... from "./x.js"`), SQL con
  parámetros posicionales, validación por JSON Schema, comentarios en español donde
  aporten. No introduzcas dependencias sin acordarlo.

---

## 8. Riesgos abiertos

- **Migración duplicada.** `1787047877216_add-business-check-constraints.js` usa
  sintaxis CommonJS (`exports.up`) dentro de un paquete `"type": "module"`; se
  re-creó como `1787048279926_..._v2.js` con contenido idéntico y los mismos nombres
  de constraint. **No la toques.** Pendiente: comprobar qué registra realmente la
  tabla `pgmigrations` en producción antes de decidir nada.
- **Migraciones duplicadas: RESUELTO.**
  `1787047877216_add-business-check-constraints.js` y `1787048279926_..._v2.js`
  declaran los mismos siete nombres de constraint, y la segunda en aplicarse abortaba
  con `already exists` (42710): ninguna instalación nueva podía migrar desde cero. Lo
  descubrió la prueba de integración (§9.1). Ambas se hicieron **idempotentes**
  (`dropConstraint(..., { ifExists: true })` antes de cada `addConstraint`, también en
  los `down`), sin cambiar nombres ni definiciones. Validado dos veces desde una base
  vacía. En producción ambas están ya registradas y no volverán a ejecutarse.
- **Migraciones de autenticación sin ejecutar en producción.** `users`, `sessions` y
  `login_attempts` se han validado desde cero contra PostgreSQL 17 desechable, pero
  **nunca se han aplicado en producción**. Hasta que se ejecuten allí, el login
  devolverá errores de SQL contra tablas inexistentes.
- **`trustProxy` pendiente.** La limitación de intentos de login usa `request.ip`.
  Cuando se ponga el reverse proxy delante habrá que configurar `trustProxy` en
  Fastify; si no, todas las peticiones parecerán venir de la IP del proxy y el límite
  por IP bloqueará a todos los usuarios a la vez. Revisarlo en la fase del proxy.
- **CSRF / validación de Origin pendiente.** Hoy la única defensa es la cookie
  `SameSite=Lax`, suficiente mientras la API administrativa sea de solo lectura.
  **Antes de añadir operaciones administrativas de escritura** (cambio de estado,
  notas internas, urgencia) hay que revisar la protección CSRF: validación de la
  cabecera `Origin` o token anti-CSRF.
- **Sin CI y sin linter.** Ya hay pruebas de contrato y de autenticación, pero nadie
  las ejecuta automáticamente: hay que lanzarlas a mano (§9).
- **`INTERNAL_API_KEY` es una clave única compartida** sin rotación ni caducidad.
- **La integración con Meta está sin validar.** Todo lo relativo a multimedia,
  transcripción, análisis de imágenes y documentos, y estados reales de entrega está
  implementado pero no se ha ejecutado nunca contra la API de WhatsApp (§3.1).
- **Node no está instalado en el host de desarrollo**; todo pasa por Docker. Afecta al
  flujo de trabajo del frontend.

---

## 9. Comandos de verificación seguros

Todos son de solo lectura y no afectan a producción.

Estado del repositorio, sin imprimir el contenido de los cambios:

```bash
git status --short
```

```bash
git diff --check
```

```bash
git diff --stat
```

```bash
git diff --name-only
```

Historial reciente:

```bash
git log --oneline -10
```

Ver qué variables espera `compose.yml` sin leer ningún `.env`:

```bash
grep -oE '\$\{[A-Z_]+\}' /home/david/taller-ecu-dev/compose.yml | sort -u
```

Listar migraciones por orden de aplicación:

```bash
ls -1 /home/david/taller-ecu-dev/backend/migrations
```

Frontend: instalar, comprobar tipos, probar y compilar en contenedor desechable
(el host no tiene Node):

```bash
docker run --rm --user "$(id -u):$(id -g)" -e HOME=/tmp -e npm_config_cache=/tmp/.npm -e CI=true -v /home/david/taller-ecu-dev/web:/app -w /app node:24-alpine sh -c 'npm ci && npm run check && npm test && npm run build'
```

Ejecutar las pruebas y el build del backend en un contenedor desechable, sin tocar
producción, sin abrir puertos y sin base de datos (las pruebas usan dobles):

```bash
docker run --rm -e HOME=/tmp -e npm_config_cache=/tmp/.npm -v /home/david/taller-ecu-dev/backend:/app -v /app/node_modules -w /app node:24-alpine sh -c 'npm ci && npm test && npm run build && rm -rf /app/dist'
```

Inspeccionar los workflows de n8n sin volcar 99 KB de JSON:

```bash
python3 -c "import json;[print(w['name'], w.get('active'), len(w['nodes'])) for w in json.load(open('/home/david/taller-ecu-dev/n8n-workflows/workflows-export.json'))]"
```

Para revisar si un cambio arrastra algo que no debería, usa `git diff --name-only` y
abre solo los ficheros pertinentes. **No canalices `git diff` hacia un `grep` de
secretos**: imprimiría en la terminal y en los logs justo los valores que se
pretendía detectar.

### 9.1 Prueba de integración contra PostgreSQL real

```bash
./scripts/integration-test.sh
```

Levanta un PostgreSQL 17 desechable (`tallerecu-itest-*`) en su propia red, sin
publicar puertos y con los datos en tmpfs, aplica todas las migraciones desde cero,
crea el primer OWNER con el CLI real y ejecuta `test/integration/`. Destruye todo al
terminar, falle o no.

Es seguro por construcción: nombres, red, base, usuario y contraseña son distintos de
los de producción, y `test/integration/guard.ts` aborta la ejecución si `DB_HOST`,
`DB_NAME`, `DB_USER` o `DATABASE_URL` no contienen `itest` o contienen cualquier
identificador de producción.

Estado: **pasa entera desde una base vacía**, con los archivos reales del
repositorio: 12 migraciones, alta del OWNER con el CLI y 33 pruebas. Verificada en dos
ejecuciones consecutivas.

Nada de esto implica despliegue: las migraciones siguen sin ejecutarse en producción.

### No disponibles en este entorno

- **`npx tsc --noEmit`** y cualquier otro `npx`: Node y las dependencias no están
  instalados en el host de desarrollo, y `npx` intentaría descargar paquetes. La
  comprobación de tipos tendrá que hacerse dentro de un contenedor cuando exista ese
  entorno.
- **No están permitidos:** cualquier `docker compose up/down/build/restart`,
  `npm run migrate:*`, `psql` contra los datos actuales,
  `scripts/backup-postgres.sh`, ni cualquier comando ejecutado desde
  `/opt/taller-ecu`.
