export const idParamSchema = {
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

export const conversationIdParamSchema = {
  type: "object",
  properties: {
    conversationId: { type: "string", pattern: "^[0-9]+$" },
  },
  required: ["conversationId"],
  additionalProperties: false,
} as const;

export const findOrCreateCustomerBodySchema = {
  type: "object",
  properties: {
    phone: {
      type: "string",
      minLength: 7,
      maxLength: 30,
    },
    name: {
      type: "string",
      minLength: 1,
      maxLength: 150,
    },
  },
  required: ["phone"],
  additionalProperties: false,
} as const;

export const vehicleBodySchema = {
  type: "object",
  properties: {
    customerId: {
      anyOf: [
        { type: "string", pattern: "^[0-9]+$" },
        { type: "integer", minimum: 1 },
      ],
    },
    vehicleType: {
      type: ["string", "null"],
      maxLength: 30,
    },
    brand: {
      type: ["string", "null"],
      maxLength: 100,
    },
    model: {
      type: ["string", "null"],
      maxLength: 150,
    },
    year: {
      type: ["integer", "null"],
      minimum: 1900,
      maximum: 2100,
    },
    engine: {
      type: ["string", "null"],
      maxLength: 150,
    },
    originalPower: {
      type: ["string", "null"],
      maxLength: 50,
    },
    plate: {
      type: ["string", "null"],
      maxLength: 20,
    },
    vin: {
      type: ["string", "null"],
      maxLength: 50,
    },
    notes: {
      type: ["string", "null"],
      maxLength: 5000,
    },
  },
  required: ["customerId"],
  additionalProperties: false,
} as const;

export const createRequestBodySchema = {
  type: "object",
  properties: {
    customerId: {
      anyOf: [
        { type: "string", pattern: "^[0-9]+$" },
        { type: "integer", minimum: 1 },
      ],
    },
    vehicleId: {
      anyOf: [
        { type: "string", pattern: "^[0-9]+$" },
        { type: "integer", minimum: 1 },
        { type: "null" },
      ],
    },
    source: {
      type: "string",
      enum: ["whatsapp", "web", "manual"],
    },
    serviceType: {
      type: ["string", "null"],
      enum: [
        "REPROGRAMMING",
        "ECU_REPAIR",
        "ECU_CLONING",
        "OTHER",
        null
      ],
    },
    description: {
      type: ["string", "null"],
      maxLength: 10000,
    },
    structuredData: {
      type: "object",
      additionalProperties: true,
    },
    missingFields: {
      type: "array",
      items: { type: "string" },
      uniqueItems: true,
    },
  },
  required: ["customerId"],
  additionalProperties: false,
} as const;

export const updateRequestBodySchema = {
  type: "object",
  properties: {
    serviceType: {
      type: ["string", "null"],
      enum: [
        "REPROGRAMMING",
        "ECU_REPAIR",
        "ECU_CLONING",
        "OTHER",
        null
      ],
    },
    description: {
      type: ["string", "null"],
      maxLength: 10000,
    },
    status: {
      type: "string",
      enum: ["COLLECTING", "HUMAN", "CLOSED"],
    },
    structuredData: {
      type: "object",
      additionalProperties: true,
    },
    missingFields: {
      type: "array",
      items: { type: "string" },
      uniqueItems: true,
    },
    summaryAi: {
      type: ["string", "null"],
      maxLength: 10000,
    },
  },
  minProperties: 1,
  additionalProperties: false,
} as const;

export const handoffBodySchema = {
  type: "object",
  properties: {
    summaryAi: {
      type: ["string", "null"],
      maxLength: 10000,
    },
  },
  additionalProperties: false,
} as const;

export const createConversationBodySchema = {
  type: "object",
  properties: {
    customerId: {
      anyOf: [
        { type: "string", pattern: "^[0-9]+$" },
        { type: "integer", minimum: 1 },
      ],
    },
    requestId: {
      anyOf: [
        { type: "string", pattern: "^[0-9]+$" },
        { type: "integer", minimum: 1 },
        { type: "null" },
      ],
    },
    channel: {
      type: "string",
      enum: ["whatsapp", "web", "manual"],
    },
  },
  required: ["customerId"],
  additionalProperties: false,
} as const;

export const createMessageBodySchema = {
  type: "object",
  properties: {
    conversationId: {
      anyOf: [
        { type: "string", pattern: "^[0-9]+$" },
        { type: "integer", minimum: 1 },
      ],
    },
    providerMessageId: {
      type: ["string", "null"],
      maxLength: 255,
    },
    direction: {
      type: "string",
      enum: ["INBOUND", "OUTBOUND"],
    },
    messageType: {
      type: "string",
      enum: ["TEXT", "AUDIO", "IMAGE", "DOCUMENT", "OTHER"],
    },
    textContent: {
      type: ["string", "null"],
      maxLength: 50000,
    },
    metadata: {
      type: "object",
      additionalProperties: true,
    },
  },
  required: [
    "conversationId",
    "direction"
  ],
  additionalProperties: false,
} as const;