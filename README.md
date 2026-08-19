# Taller ECU — JMReprocars

Sistema de gestión de solicitudes para un taller especializado en reprogramaciones
y centralitas ECU. Los clientes escribirán por WhatsApp; un asistente automatizado
recoge los datos del vehículo y del servicio, y cuando la información está completa
—o el cliente lo necesita— la conversación pasa a una persona.

> **Estado:** el sistema **todavía no está conectado a un WhatsApp real.** Aún no
> tenemos acceso a la API de WhatsApp del cliente. Lo validado hasta ahora se apoya en
> webhooks de texto sintéticos firmados. Ver [Estado actual](#estado-actual).

Volumen previsto: **10–20 conversaciones nuevas al día**. La arquitectura está
dimensionada a propósito para ese tamaño.

---

## Objetivo

1. **Automatizar la recogida de datos** de cada solicitud que llega por WhatsApp:
   cliente, vehículo, tipo de servicio y descripción, incluyendo audios, fotos y PDFs.
2. **Dar al taller un panel privado** donde ver y gestionar esas solicitudes sin
   rebuscar en el móvil.
3. **Publicar una web pública** para JMReprocars que capte clientes y los dirija a
   WhatsApp.

---

## Arquitectura

```
   Cliente por WhatsApp
            │
            ▼
   Meta WhatsApp Cloud API
            │  webhook
            ▼
          n8n  ────────── OpenAI (transcripción, visión, extracción)
            │
            │  HTTP interno + cabecera x-internal-api-key
            ▼
      backend (Fastify 5 + TypeScript)
            │
            │  pg.Pool
            ▼
        PostgreSQL 17
```

Tres servicios en `compose.yml`, dentro de la red `taller-network`. Ninguno se
publica fuera de `127.0.0.1`.

| Servicio | Imagen / stack | Puerto | Responsabilidad |
|---|---|---|---|
| `postgres` | `postgres:17-alpine` | interno | Datos del negocio **y** base de datos interna de n8n |
| `backend` | Node 24 + Fastify 5 + TypeScript | `127.0.0.1:3000` | Persistencia y validación |
| `n8n` | `n8nio/n8n:2.34.6` | `127.0.0.1:5678` | Orquestación y toda la lógica conversacional |

**El reparto de responsabilidades es intencionado:** n8n es el cerebro, el backend es
una capa de persistencia delgada (SQL directo, validación por JSON Schema, sin lógica
conversacional) y PostgreSQL es el almacén. Mover lógica de un lado a otro requiere
acuerdo previo.

### Modelo de datos

```
customers ──┬── vehicles
            │
            └── requests ──── conversations ──── messages ──── message_status_events
```

- **`customers`** — teléfono único, nombre y email opcionales.
- **`vehicles`** — marca, modelo, año, motor, potencia original, matrícula, VIN.
- **`requests`** — `status` (`COLLECTING` → `HUMAN` → `CLOSED`), `service_type`
  (`REPROGRAMMING`, `ECU_REPAIR`, `ECU_CLONING`, `OTHER`), `structured_data` y
  `missing_fields` en JSONB, `summary_ai`, `last_activity_at`.
- **`conversations`** — `bot_enabled` es el interruptor bot/humano.
- **`messages`** — dirección, tipo, `provider_message_id` único (deduplicación),
  `delivery_status`.
- **`message_status_events`** — histórico de acks de Meta, idempotente.
- **`workflow_errors`** — fallos de n8n capturados por un error handler global.

Migraciones con `node-pg-migrate` en `backend/migrations/`.

---

## Estructura actual

```
taller-ecu/
├── compose.yml                  postgres + backend + n8n
├── .env.example                 plantilla de variables (incompleta, ver §Riesgos)
├── CLAUDE.md                    guía permanente de trabajo en este repositorio
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json  tsconfig.json
│   ├── migrations/              9 migraciones
│   └── src/
│       ├── server.ts            arranque, hook de API key, registro de rutas
│       ├── db.ts                pool de PostgreSQL
│       ├── schemas.ts           esquemas JSON de validación
│       └── routes/              customers, vehicles, requests, conversations,
│                                messages, whatsapp, messageLookup,
│                                messageStatuses, workflowErrors
├── n8n-workflows/
│   └── workflows-export.json    3 workflows exportados
└── scripts/
    └── backup-postgres.sh       SOLO para producción, no ejecutar en desarrollo
```

Todavía no existe nada de frontend. Se añadirá en `web/`.

---

## Producción y desarrollo

| | `/opt/taller-ecu` | `/home/david/taller-ecu-dev` |
|---|---|---|
| Qué es | La infraestructura desplegada y los datos actuales | **Únicamente una copia Git de desarrollo** |
| Base de datos | La única que existe, con los datos actuales | **No existe todavía** una base de datos de pruebas |
| n8n | La única instancia desplegada | **No existe todavía** una instancia aislada de desarrollo |

En desarrollo, por ahora, **solo hay código**: ni contenedores propios, ni base de
datos de pruebas, ni n8n aislado. Montar ese entorno es una tarea pendiente y
acordada aparte.

**Los cambios hechos en desarrollo no llegan a producción automáticamente.**
Únicamente llegan después de revisar, probar, fusionar y desplegar expresamente.

Ambos entornos comparten el mismo repositorio Git. **Todo el trabajo ocurre en
`/home/david/taller-ecu-dev`.** No se accede, modifica ni ejecuta nada en
`/opt/taller-ecu`; tampoco se leen ficheros `.env`, credenciales, backups ni datos de
producción. `scripts/backup-postgres.sh` tiene rutas de producción codificadas y no
debe ejecutarse desde el entorno de desarrollo.

Las reglas completas están en [CLAUDE.md](CLAUDE.md).

---

## Requisitos

- Docker y Docker Compose (v2).
- Una cuenta de Meta WhatsApp Business con la Cloud API configurada. **Pendiente:
  todavía no tenemos acceso a la cuenta del cliente**, y es el requisito que bloquea
  la integración real.
- Una clave de API de OpenAI (se guarda como credencial dentro de n8n, no en este
  repositorio).
- Node.js 24 y npm, **solo** si quieres ejecutar el backend o el futuro frontend
  fuera de Docker. El entorno de desarrollo actual no tiene Node instalado en el
  host: todo pasa por contenedores.

---

## Variables de entorno

Van en un fichero `.env` en la raíz, que **nunca** se sube al repositorio.
`.env.example` es la plantilla. Aquí solo se documentan los nombres y su propósito;
ningún valor real aparece en este repositorio.

| Variable | Propósito |
|---|---|
| `POSTGRES_DB` | Base de datos del negocio |
| `POSTGRES_USER` | Usuario de la base de datos del negocio |
| `POSTGRES_PASSWORD` | Contraseña de ese usuario |
| `N8N_DB_NAME` | Base de datos interna de n8n |
| `N8N_DB_USER` | Usuario de la base de datos de n8n |
| `N8N_DB_PASSWORD` | Contraseña de ese usuario |
| `N8N_ENCRYPTION_KEY` | Clave con la que n8n cifra sus credenciales. **Si se pierde, las credenciales guardadas dejan de ser recuperables** |
| `WHATSAPP_VERIFY_TOKEN` | Token de verificación del webhook de Meta |
| `INTERNAL_API_KEY` | Clave compartida entre n8n y el backend. **No debe llegar nunca al navegador** |

El backend deriva `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y
`DATABASE_URL` desde `compose.yml`; no hace falta definirlas a mano.

Para ver qué espera el compose sin abrir ningún `.env`:

```bash
grep -oE '\$\{[A-Z_]+\}' compose.yml | sort -u
```

---

## Flujo WhatsApp → n8n → backend → PostgreSQL

Así está diseñado el flujo. Cada paso lleva marcado su nivel de validación:

- ✅ **Probado** con webhooks de texto sintéticos firmados.
- ⏳ **Implementado, pendiente** de validación end-to-end contra Meta.

1. ✅ **Entrada.** El webhook llega a n8n (`/webhook/whatsapp/inbound`). n8n comprueba
   la firma HMAC y descarta lo que no sea un mensaje. Probado con webhooks
   sintéticos; ⏳ pendiente con tráfico real de Meta.
2. ✅ **Deduplicación.** n8n consulta `GET /api/messages/provider-exists`. Si el mismo
   mensaje se reintenta, el flujo se detiene ahí.
3. ✅ **Identificación.** `POST /api/customers/find-or-create` resuelve el cliente por
   teléfono (creándolo si es nuevo).
4. ⏳ **Multimedia.** Según el tipo: el audio se transcribe, las imágenes y los PDFs se
   analizan con OpenAI, y el resultado se convierte en texto utilizable. Lo no
   soportado se rechaza con un mensaje al cliente. **Ningún tramo de este paso se ha
   ejecutado nunca contra Meta**: ni la obtención y descarga por `mediaId`, ni la
   transcripción, ni el análisis de imágenes y documentos.
5. ✅ **Extracción.** Un modelo con salida estructurada obtiene los datos del vehículo y
   del servicio, y calcula qué campos siguen faltando.
6. ✅ **Persistencia.** n8n llama al backend para resolver el vehículo
   (`/api/vehicles/find-or-create`, que compara por VIN, luego matrícula, luego
   marca+modelo+año), crear o actualizar la solicitud y la conversación, y guardar el
   mensaje entrante en `/api/messages`.
7. ✅ **Respuesta.** Si faltan datos, n8n genera la siguiente pregunta; el mensaje
   saliente también se guarda. Si la solicitud está completa,
   `POST /api/requests/:id/handoff` la marca como `HUMAN` y desactiva el bot.
   ⏳ El envío efectivo por la Graph API está pendiente de validación real.
8. ⏳ **Entrega.** Los acks de Meta (`sent`, `delivered`, `read`, `failed`) llegan como
   webhooks de estado y se guardan en `/api/message-statuses`. Un trigger de
   PostgreSQL reconcilia los que llegan antes que su mensaje. **Pendiente de probar
   con estados reales enviados por Meta.**
9. ✅ **Errores.** Cualquier fallo en un workflow activa un error handler global que lo
   persiste en `/api/workflow-errors`.

Todas las llamadas de n8n al backend viajan por la red interna de Docker
(`http://backend:3000`) con la cabecera `x-internal-api-key`. **Estas rutas son el
contrato actual entre el workflow y el backend**, validado mediante pruebas
sintéticas, y debe conservarse intacto de cara a la futura conexión real. El listado
completo está en [CLAUDE.md](CLAUDE.md).

---

## Plan de la web y el panel

Ambos se construyen **dentro de este mismo repositorio**, como una única aplicación
Next.js (App Router + TypeScript) en `web/`.

### Web pública (`jmreprocars.com`)

Orientada a SEO: inicio, servicios, cómo trabajamos, sobre nosotros, preguntas
frecuentes, contacto por WhatsApp y contenido legal.

### Panel privado (`jmreprocars.com/panel`)

Resumen de solicitudes, listado con búsqueda y filtros, y detalle de cada solicitud
con datos del cliente y del vehículo, resumen generado por IA, campos pendientes,
conversación completa, marca de urgencia, notas internas, cambio de estado e
historial del cliente.

**El panel consume el backend a través de `/api/admin`. Nunca se conecta a PostgreSQL
directamente.**

### Decisiones ya tomadas

- Una sola aplicación Next.js para web y panel.
- Autenticación en el backend Fastify: cookie **HttpOnly** segura, contraseñas con
  hash **Argon2**, sin tokens en `localStorage`, sin registro público, primer usuario
  creado por script CLI, roles **OWNER** y **EMPLOYEE**.
- Mismo origen para web, panel y API. **Sin CORS abierto.**
- `INTERNAL_API_KEY` no llega jamás al navegador.
- Urgencia como columna booleana `is_urgent` (por defecto `false`), editable desde el
  panel. n8n no la rellena todavía.
- El panel **no envía** respuestas de WhatsApp en la primera versión: muestra la
  conversación y ofrece un botón para abrir WhatsApp.
- Refresco por **polling cada ~30 s**. Sin WebSockets.
- Las rutas actuales de n8n conservan URLs, cabeceras y comportamiento.

---

## Estado actual

**Todavía no tenemos acceso a la API de WhatsApp del cliente.** El sistema no está
atendiendo conversaciones reales. Que el workflow figure como activo dentro de n8n no
significa que esté conectado a un WhatsApp real.

### Probado

- Infraestructura Docker del servidor.
- PostgreSQL y backend.
- Workflows de n8n.
- Recepción de webhooks de texto sintéticos firmados.
- Conversaciones de reprogramación, reparación, clonación, correcciones, urgencia,
  datos no disponibles y petición de atención humana.
- Regresiones automáticas de texto superadas.

### Implementado, pendiente de validar end-to-end con Meta

- Conexión con la cuenta real de Meta/WhatsApp del cliente.
- Recepción de mensajes desde WhatsApp real.
- Obtención y descarga de multimedia mediante `mediaId`.
- Transcripción de audios recibidos desde Meta.
- Análisis de imágenes y documentos recibidos desde Meta.
- Estados reales de entrega enviados por Meta.

### Sin empezar

Todo el frontend. No hay usuarios ni autenticación de personas; la única protección de
la API es una clave compartida pensada para máquinas.

### Siguientes fases

| Fase | Contenido |
|---|---|
| **1** | Pruebas de integración mínimas de los endpoints que usa n8n, tabla `users`, sesión con cookie HttpOnly y Argon2, script CLI para el primer usuario |
| **2** | Endpoints de lectura del panel: listado con búsqueda y filtros, detalle agregado, resumen, ficha e historial del cliente |
| **3** | Proyecto Next.js en `web/`, Dockerfile, servicio en compose, login funcional |
| **4** | Panel en modo lectura: resumen, listado y detalle completo |
| **5** | Panel en modo escritura: cambio de estado, notas internas, `is_urgent`, devolver la conversación al bot |
| **6** | Web pública: las siete páginas, SEO y JSON-LD |
| **7** | Reverse proxy, TLS, DNS y despliegue |

Reverse proxy, TLS y DNS quedan deliberadamente para el final: primero se construyen
y prueban backend y frontend de forma aislada.

### Riesgos pendientes

- **`.env.example` está incompleto**: declara tres variables cuando `compose.yml`
  exige nueve.
- **Migración duplicada**: `1787047877216_add-business-check-constraints.js` usa
  sintaxis CommonJS en un paquete ESM y se re-creó como `..._v2.js`. No se toca hasta
  comprobar el historial real de migraciones en producción.
- **Sin tests, sin CI y sin linter**, y builds no reproducibles (`npm install` sin
  lockfile).
- **La integración con Meta sigue sin validar**, así que todo el tramo de multimedia,
  transcripción, análisis y estados de entrega puede requerir ajustes cuando se
  conecte la cuenta real.
- **No existe entorno de desarrollo ejecutable**: ni base de datos de pruebas ni n8n
  aislado. Montarlo es una tarea pendiente.

---

## Cómo contribuir

Rama por trabajo, commits pequeños con un solo propósito, revisar el diff antes de
confirmar y probar antes de dar algo por terminado. Los detalles, y las reglas de
seguridad de obligado cumplimiento, están en [CLAUDE.md](CLAUDE.md).
