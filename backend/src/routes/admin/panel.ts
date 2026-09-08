import type {
  FastifyPluginAsync,
  preValidationAsyncHookHandler,
} from "fastify";

import { requireAdminUser } from "../../plugins/adminAuth.js";

import {
  customerIdParamSchema,
  listRequestsQuerySchema,
  requestIdParamSchema,
} from "../../schemas/adminPanel.js";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  getCustomerHistory,
  getDashboard,
  getRequestDetail,
  listRequests,
} from "../../panel/service.js";

import type { RequestSortField, SortDirection } from "../../panel/sql.js";

type ListQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  serviceType?: string;
  from?: string;
  to?: string;
  sort?: RequestSortField;
  order?: SortDirection;
};

/*
 * Fastify descarta en silencio los parámetros no declarados en el esquema.
 * Para una API interna preferimos el fallo ruidoso: así una errata como
 * "pagesize" se ve, en lugar de devolver otra página sin avisar.
 *
 * Se aplica como hook local; la configuración global de ajv no se toca para
 * no alterar la validación de las rutas que ya usa n8n.
 */
function rejectUnknownQueryParams(
  allowed: string[]
): preValidationAsyncHookHandler {
  const permitted = new Set(allowed);

  return async (request, reply) => {
    const queryString = request.url.split("?")[1];

    if (!queryString) {
      return;
    }

    for (const key of new URLSearchParams(queryString).keys()) {
      if (!permitted.has(key)) {
        return reply.status(400).send({
          error: "unknown_query_parameter",
          parameter: key.slice(0, 40),
        });
      }
    }
  };
}

const LIST_REQUESTS_PARAMS = [
  "page",
  "pageSize",
  "search",
  "status",
  "serviceType",
  "from",
  "to",
  "sort",
  "order",
];

function parseDate(value: string | undefined): Date | undefined | null {
  if (value === undefined) {
    return undefined;
  }

  const parsed = new Date(value);

  // null distingue "venía algo pero no es una fecha" de "no venía nada".
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/*
 * API de lectura del panel.
 *
 * El guard de sesión se aplica una sola vez, como hook de este plugin: todas
 * las rutas registradas aquí lo heredan y ninguna puede olvidarlo.
 */
export const adminPanelRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", requireAdminUser);

  app.get(
    "/dashboard",
    {
      preValidation: rejectUnknownQueryParams([]),
    },
    async () => {
      return getDashboard();
    }
  );

  app.get<{ Querystring: ListQuery }>(
    "/requests",
    {
      schema: {
        querystring: listRequestsQuerySchema,
      },
      preValidation: rejectUnknownQueryParams(LIST_REQUESTS_PARAMS),
    },
    async (request, reply) => {
      const query = request.query;

      const from = parseDate(query.from);
      const to = parseDate(query.to);

      if (from === null || to === null) {
        return reply.status(400).send({
          error: "invalid_date_filter",
        });
      }

      if (from && to && from.getTime() > to.getTime()) {
        return reply.status(400).send({
          error: "invalid_date_range",
        });
      }

      return listRequests({
        page: query.page ?? DEFAULT_PAGE,
        pageSize: query.pageSize ?? DEFAULT_PAGE_SIZE,
        search: query.search,
        status: query.status,
        serviceType: query.serviceType,
        from,
        to,
        sort: query.sort ?? "lastActivityAt",
        order: query.order ?? "desc",
      });
    }
  );

  app.get<{ Params: { requestId: string } }>(
    "/requests/:requestId",
    {
      schema: {
        params: requestIdParamSchema,
      },
      preValidation: rejectUnknownQueryParams([]),
    },
    async (request, reply) => {
      const detail = await getRequestDetail(request.params.requestId);

      if (!detail) {
        return reply.status(404).send({
          error: "request_not_found",
        });
      }

      return detail;
    }
  );

  app.get<{ Params: { customerId: string } }>(
    "/customers/:customerId",
    {
      schema: {
        params: customerIdParamSchema,
      },
      preValidation: rejectUnknownQueryParams([]),
    },
    async (request, reply) => {
      const history = await getCustomerHistory(request.params.customerId);

      if (!history) {
        return reply.status(404).send({
          error: "customer_not_found",
        });
      }

      return history;
    }
  );
};

export default adminPanelRoutes;
