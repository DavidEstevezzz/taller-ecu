import type { FastifyPluginAsync } from "fastify";
import { db } from "../db.js";

type CreateWorkflowErrorBody = {
  workflowName: string;

  workflowId?: string | null;

  executionId?: string | null;

  executionUrl?: string | null;

  nodeName?: string | null;

  errorMessage: string;

  errorStack?: string | null;

  errorPayload?: Record<string, unknown>;
};

const workflowErrorRoutes: FastifyPluginAsync = async (app) => {
  app.post<{
    Body: CreateWorkflowErrorBody;
  }>(
    "/workflow-errors",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,

          required: [
            "workflowName",
            "errorMessage",
          ],

          properties: {
            workflowName: {
              type: "string",
              minLength: 1,
              maxLength: 255,
            },

            workflowId: {
              type: ["string", "null"],
              maxLength: 100,
            },

            executionId: {
              type: ["string", "null"],
              maxLength: 100,
            },

            executionUrl: {
              type: ["string", "null"],
            },

            nodeName: {
              type: ["string", "null"],
              maxLength: 255,
            },

            errorMessage: {
              type: "string",
              minLength: 1,
            },

            errorStack: {
              type: ["string", "null"],
            },

            errorPayload: {
              type: "object",
              additionalProperties: true,
            },
          },
        },
      },
    },

    async (request, reply) => {
      const {
        workflowName,
        workflowId = null,
        executionId = null,
        executionUrl = null,
        nodeName = null,
        errorMessage,
        errorStack = null,
        errorPayload = {},
      } = request.body;

      const result = await db.query(
        `
          INSERT INTO workflow_errors (
            workflow_name,
            workflow_id,
            execution_id,
            execution_url,
            node_name,
            error_message,
            error_stack,
            error_payload
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8::jsonb
          )
          RETURNING *
        `,
        [
          workflowName,
          workflowId,
          executionId,
          executionUrl,
          nodeName,
          errorMessage,
          errorStack,
          JSON.stringify(errorPayload),
        ],
      );

      return reply.code(201).send({
        created: true,
        workflowError: result.rows[0],
      });
    },
  );
};

export default workflowErrorRoutes;