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

No describas ninguno de estos puntos pendientes como funcionando, ni en código, ni en
documentación, ni en mensajes de commit.

### Modelo de datos

`customers` (teléfono único) → `vehicles` → `requests` → `conversations` → `messages`
→ `message_status_events`. Más `workflow_errors`, independiente.

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

Un hook `onRequest` en `backend/src/server.ts` protege **todo** `/api/*` con una única
clave estática compartida en la cabecera `x-internal-api-key`. Excepciones:
`/api/whatsapp/webhook/verify` (usa su propio verify token de Meta) y `/health`
(fuera de `/api/`). No hay usuarios, ni CORS, ni rate limiting, ni reverse proxy.

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

1. **Una sola aplicación Next.js** (App Router + TypeScript) en `web/`, que sirve la
   web pública y el panel. Nada de dos proyectos frontend separados.
2. **Las rutas actuales de n8n conservan URLs, cabeceras y comportamiento.** Sin
   renombrar, sin cambiar prefijos, sin reorganizar su registro por ahora.
3. **Autenticación implementada en el backend Fastify:** cookie segura HttpOnly,
   contraseñas con hash **Argon2**, nunca tokens en `localStorage`, nunca
   `INTERNAL_API_KEY` en el navegador, sin registro público, primer usuario creado
   mediante script CLI, roles iniciales **OWNER** y **EMPLOYEE**.
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
- **`.env.example` incompleto.** Declara tres variables, mientras `compose.yml` exige
  además `N8N_DB_NAME`, `N8N_DB_USER`, `N8N_DB_PASSWORD`, `N8N_ENCRYPTION_KEY`,
  `WHATSAPP_VERIFY_TOKEN` e `INTERNAL_API_KEY`.
- **Sin tests, sin CI, sin linter.** No hay red de seguridad para refactorizar.
- **Builds no reproducibles**: el `Dockerfile` usa `npm install` y no hay lockfile en
  el repositorio.
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

Inspeccionar los workflows de n8n sin volcar 99 KB de JSON:

```bash
python3 -c "import json;[print(w['name'], w.get('active'), len(w['nodes'])) for w in json.load(open('/home/david/taller-ecu-dev/n8n-workflows/workflows-export.json'))]"
```

Para revisar si un cambio arrastra algo que no debería, usa `git diff --name-only` y
abre solo los ficheros pertinentes. **No canalices `git diff` hacia un `grep` de
secretos**: imprimiría en la terminal y en los logs justo los valores que se
pretendía detectar.

### No disponibles en este entorno

- **`npx tsc --noEmit`** y cualquier otro `npx`: Node y las dependencias no están
  instalados en el host de desarrollo, y `npx` intentaría descargar paquetes. La
  comprobación de tipos tendrá que hacerse dentro de un contenedor cuando exista ese
  entorno.
- **No están permitidos:** cualquier `docker compose up/down/build/restart`,
  `npm run migrate:*`, `psql` contra los datos actuales,
  `scripts/backup-postgres.sh`, ni cualquier comando ejecutado desde
  `/opt/taller-ecu`.
