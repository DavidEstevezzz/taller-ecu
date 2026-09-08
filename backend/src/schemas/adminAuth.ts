/*
 * Esquemas de la API administrativa.
 *
 * Viven aparte de src/schemas.ts a propósito: ese archivo define el
 * contrato que consume n8n y no debe tocarse por esta funcionalidad.
 */

export const loginBodySchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      minLength: 3,
      maxLength: 255,
      /*
       * Validación deliberadamente laxa: ajv no trae el formato "email".
       * Se toleran espacios envolventes porque el servicio normaliza el
       * email (trim + minúsculas) antes de buscar al usuario.
       */
      pattern: "^\\s*[^@\\s]+@[^@\\s]+\\.[^@\\s]+\\s*$",
    },
    password: {
      type: "string",
      minLength: 1,
      maxLength: 512,
    },
  },
  required: ["email", "password"],
  additionalProperties: false,
} as const;
