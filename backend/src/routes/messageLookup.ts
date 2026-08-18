import type { FastifyPluginAsync } from "fastify";
import { db } from "../db.js";

type ProviderExistsQuery = {
  providerMessageId: string;
};

const messageLookupRoutes: FastifyPluginAsync = async (app) => {
  app.get<{
    Querystring: ProviderExistsQuery;
  }>(
    "/messages/provider-exists",
    {
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,
          required: ["providerMessageId"],
          properties: {
            providerMessageId: {
              type: "string",
              minLength: 1,
              maxLength: 512,
            },
          },
        },
      },
    },
    async (request) => {
      const providerMessageId =
        request.query.providerMessageId.trim();

      const result = await db.query(
        `
          SELECT 1
          FROM messages
          WHERE provider_message_id = $1
          LIMIT 1
        `,
        [providerMessageId],
      );

      return {
        providerMessageId,
        exists: (result.rowCount ?? 0) > 0,
      };
    },
  );
};

export default messageLookupRoutes;