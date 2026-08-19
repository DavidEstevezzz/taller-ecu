import * as repository from "./repository.js";
import type { RequestSortField, SortDirection } from "./sql.js";

/*
 * Mapea filas de PostgreSQL a la forma que consumirá el panel.
 *
 * Los mapeadores eligen campo a campo a propósito: ninguna respuesta puede
 * arrastrar por accidente columnas que no se hayan decidido exponer.
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

function toId(value: unknown): string | null {
  return value === null || value === undefined ? null : String(value);
}

function toIso(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value as string);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toTime(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const date = value instanceof Date ? value : new Date(value as string);

  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function mapCustomerSummary(row: any) {
  return {
    id: toId(row.customer_id),
    name: row.customer_name ?? null,
    phone: row.customer_phone ?? null,
    email: row.customer_email ?? null,
  };
}

function mapVehicleSummary(row: any) {
  if (row.vehicle_id === null || row.vehicle_id === undefined) {
    return null;
  }

  return {
    id: toId(row.vehicle_id),
    vehicleType: row.vehicle_type ?? null,
    brand: row.vehicle_brand ?? null,
    model: row.vehicle_model ?? null,
    year: row.vehicle_year ?? null,
    engine: row.vehicle_engine ?? null,
    plate: row.vehicle_plate ?? null,
    vin: row.vehicle_vin ?? null,
  };
}

export function mapRequestListItem(row: any) {
  return {
    id: toId(row.id),
    status: row.status,
    source: row.source,
    serviceType: row.service_type ?? null,
    description: row.description ?? null,
    summaryAi: row.summary_ai ?? null,
    missingFields: row.missing_fields ?? [],
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
    completedAt: toIso(row.completed_at),
    lastActivityAt: toIso(row.last_activity_at),
    customer: mapCustomerSummary(row),
    vehicle: mapVehicleSummary(row),
    activity: {
      conversationCount: row.conversation_count ?? 0,
      messageCount: row.message_count ?? 0,
      lastMessageAt: toIso(row.last_message_at),
    },
  };
}

function mapVehicle(row: any) {
  return {
    id: toId(row.id),
    vehicleType: row.vehicle_type ?? null,
    brand: row.brand ?? null,
    model: row.model ?? null,
    year: row.year ?? null,
    engine: row.engine ?? null,
    originalPower: row.original_power ?? null,
    plate: row.plate ?? null,
    vin: row.vin ?? null,
    notes: row.notes ?? null,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

function mapMessage(row: any) {
  return {
    id: toId(row.id),
    conversationId: toId(row.conversation_id),
    direction: row.direction,
    messageType: row.message_type,
    textContent: row.text_content ?? null,
    metadata: row.metadata ?? {},
    deliveryStatus: row.delivery_status ?? null,
    statusUpdatedAt: toIso(row.status_updated_at),
    createdAt: toIso(row.created_at),
  };
}

export type ListRequestsInput = {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  serviceType?: string;
  from?: Date;
  to?: Date;
  sort: RequestSortField;
  order: SortDirection;
};

export async function listRequests(input: ListRequestsInput) {
  const page = Math.max(1, input.page);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, input.pageSize));

  const filters = {
    search: input.search,
    status: input.status,
    serviceType: input.serviceType,
    from: input.from,
    to: input.to,
  };

  const total = await repository.countRequests(filters);

  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  // Una página fuera de rango devuelve vacío, no un error.
  const rows =
    total === 0
      ? []
      : await repository.listRequests({
          filters,
          sort: input.sort,
          order: input.order,
          limit: pageSize,
          offset: (page - 1) * pageSize,
        });

  return {
    items: rows.map(mapRequestListItem),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}

export async function getRequestDetail(requestId: string) {
  const row = await repository.findRequestDetail(requestId);

  if (!row) {
    return null;
  }

  const conversationRows = await repository.listConversationsByRequest(
    requestId
  );

  const conversationIds = conversationRows.map((conversation: any) =>
    String(conversation.id)
  );

  const messageRows = await repository.listMessagesByConversations(
    conversationIds
  );

  /*
   * El orden ya viene del SQL; se reordena aquí también para que el
   * contrato cronológico no dependa de una única capa.
   */
  const sortedMessages = [...messageRows].sort((left, right) => {
    const byDate = toTime(left.created_at) - toTime(right.created_at);

    return byDate !== 0
      ? byDate
      : Number(left.id ?? 0) - Number(right.id ?? 0);
  });

  const conversations = [...conversationRows]
    .sort((left, right) => {
      const byDate = toTime(left.created_at) - toTime(right.created_at);

      return byDate !== 0
        ? byDate
        : Number(left.id ?? 0) - Number(right.id ?? 0);
    })
    .map((conversation: any) => ({
      id: toId(conversation.id),
      requestId: toId(conversation.request_id),
      channel: conversation.channel,
      botEnabled: conversation.bot_enabled,
      createdAt: toIso(conversation.created_at),
      updatedAt: toIso(conversation.updated_at),
      lastMessageAt: toIso(conversation.last_message_at),
      messages: sortedMessages
        .filter(
          (message: any) =>
            String(message.conversation_id) === String(conversation.id)
        )
        .map(mapMessage),
    }));

  const base = mapRequestListItem(row);

  return {
    request: {
      ...base,
      structuredData: row.structured_data ?? {},
    },
    customer: {
      ...base.customer,
      createdAt: toIso(row.customer_created_at),
    },
    vehicle: base.vehicle
      ? {
          ...base.vehicle,
          originalPower: row.vehicle_original_power ?? null,
          notes: row.vehicle_notes ?? null,
        }
      : null,
    conversations,
  };
}

export async function getCustomerHistory(customerId: string) {
  const customer = await repository.findCustomer(customerId);

  if (!customer) {
    return null;
  }

  const [vehicles, summary, requestRows] = await Promise.all([
    repository.listVehiclesByCustomer(customerId),
    repository.summarizeCustomerRequests(customerId),
    repository.listRequests({
      filters: { customerId },
      sort: "lastActivityAt",
      order: "desc",
      limit: MAX_PAGE_SIZE,
      offset: 0,
    }),
  ]);

  return {
    customer: {
      id: toId(customer.id),
      name: customer.name ?? null,
      phone: customer.phone ?? null,
      email: customer.email ?? null,
      createdAt: toIso(customer.created_at),
      updatedAt: toIso(customer.updated_at),
    },
    vehicles: vehicles.map(mapVehicle),
    requests: requestRows.map(mapRequestListItem),
    summary: {
      totalRequests: summary?.total ?? 0,
      byStatus: {
        COLLECTING: summary?.collecting ?? 0,
        HUMAN: summary?.human ?? 0,
        CLOSED: summary?.closed ?? 0,
      },
      totalVehicles: vehicles.length,
      firstRequestAt: toIso(summary?.first_request_at),
      lastActivityAt: toIso(summary?.last_activity_at),
    },
  };
}

export async function getDashboard() {
  const [totals, recent] = await Promise.all([
    repository.getDashboardTotals(),
    repository.listRequests({
      filters: {},
      sort: "lastActivityAt",
      order: "desc",
      limit: 10,
      offset: 0,
    }),
  ]);

  return {
    totals: {
      customers: totals?.customers_total ?? 0,
      vehicles: totals?.vehicles_total ?? 0,
      conversations: totals?.conversations_total ?? 0,
      requests: totals?.requests_total ?? 0,
    },
    requestsByStatus: {
      COLLECTING: totals?.status_collecting ?? 0,
      HUMAN: totals?.status_human ?? 0,
      CLOSED: totals?.status_closed ?? 0,
    },
    requestsByServiceType: {
      REPROGRAMMING: totals?.service_reprogramming ?? 0,
      ECU_REPAIR: totals?.service_ecu_repair ?? 0,
      ECU_CLONING: totals?.service_ecu_cloning ?? 0,
      OTHER: totals?.service_other ?? 0,
      UNKNOWN: totals?.service_unknown ?? 0,
    },
    attention: {
      waitingForHuman: totals?.status_human ?? 0,
      stillCollecting: totals?.status_collecting ?? 0,
    },
    activity: {
      requestsCreatedLast7Days: totals?.created_last_7_days ?? 0,
      requestsActiveLast24Hours: totals?.active_last_24_hours ?? 0,
    },
    recentRequests: recent.map(mapRequestListItem),
  };
}
