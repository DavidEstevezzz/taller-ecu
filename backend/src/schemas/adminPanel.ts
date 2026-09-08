/*
 * Esquemas de la API de lectura del panel.
 *
 * Todo lo que llega por query string se valida aquí: fuera de estas listas
 * cerradas nada alcanza la capa de datos.
 */

const ISO_DATE_PATTERN =
  "^\\d{4}-\\d{2}-\\d{2}([T ]\\d{2}:\\d{2}(:\\d{2})?(\\.\\d+)?(Z|[+-]\\d{2}:?\\d{2})?)?$";

export const listRequestsQuerySchema = {
  type: "object",
  properties: {
    page: {
      type: "integer",
      minimum: 1,
      default: 1,
    },
    pageSize: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      default: 25,
    },
    search: {
      type: "string",
      minLength: 1,
      maxLength: 120,
    },
    status: {
      type: "string",
      enum: ["COLLECTING", "HUMAN", "CLOSED"],
    },
    serviceType: {
      type: "string",
      enum: ["REPROGRAMMING", "ECU_REPAIR", "ECU_CLONING", "OTHER"],
    },
    from: {
      type: "string",
      pattern: ISO_DATE_PATTERN,
    },
    to: {
      type: "string",
      pattern: ISO_DATE_PATTERN,
    },
    sort: {
      type: "string",
      enum: [
        "lastActivityAt",
        "createdAt",
        "updatedAt",
        "status",
        "customerName",
      ],
      default: "lastActivityAt",
    },
    order: {
      type: "string",
      enum: ["asc", "desc"],
      default: "desc",
    },
  },
  additionalProperties: false,
} as const;

export const requestIdParamSchema = {
  type: "object",
  properties: {
    requestId: { type: "string", pattern: "^[0-9]+$" },
  },
  required: ["requestId"],
  additionalProperties: false,
} as const;

export const customerIdParamSchema = {
  type: "object",
  properties: {
    customerId: { type: "string", pattern: "^[0-9]+$" },
  },
  required: ["customerId"],
  additionalProperties: false,
} as const;
