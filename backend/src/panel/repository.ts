import { db } from "../db.js";

import {
  REQUEST_SORT_COLUMNS,
  SORT_DIRECTIONS,
  buildRequestFilters,
  buildWhereClause,
} from "./sql.js";

import type {
  RequestFilters,
  RequestSortField,
  SortDirection,
} from "./sql.js";

/*
 * Única capa que habla con PostgreSQL para el panel.
 * Devuelve filas crudas; el servicio se encarga de darles forma.
 */

const REQUEST_LIST_COLUMNS = `
        r.id,
        r.status,
        r.source,
        r.service_type,
        r.description,
        r.summary_ai,
        r.missing_fields,
        r.created_at,
        r.updated_at,
        r.completed_at,
        r.last_activity_at,

        c.id    AS customer_id,
        c.name  AS customer_name,
        c.phone AS customer_phone,
        c.email AS customer_email,

        v.id            AS vehicle_id,
        v.brand         AS vehicle_brand,
        v.model         AS vehicle_model,
        v.year          AS vehicle_year,
        v.engine        AS vehicle_engine,
        v.plate         AS vehicle_plate,
        v.vin           AS vehicle_vin,
        v.vehicle_type  AS vehicle_type,

        stats.message_count,
        stats.last_message_at,
        stats.conversation_count`;

/*
 * Las conversaciones se relacionan por conversations.request_id, que ya
 * existe en el modelo. Nunca por customer_id.
 */
const REQUEST_STATS_JOIN = `
      LEFT JOIN LATERAL (
        SELECT
          COUNT(DISTINCT conv.id)::int AS conversation_count,
          COUNT(m.id)::int             AS message_count,
          MAX(m.created_at)            AS last_message_at
        FROM conversations conv
        LEFT JOIN messages m
          ON m.conversation_id = conv.id
        WHERE conv.request_id = r.id
      ) stats ON true`;

export async function countRequests(
  filters: RequestFilters
): Promise<number> {
  const params: unknown[] = [];
  const where = buildWhereClause(buildRequestFilters(filters, params));

  const result = await db.query(
    `
      SELECT COUNT(*)::int AS total
      FROM requests r
      INNER JOIN customers c ON c.id = r.customer_id
      LEFT JOIN vehicles v ON v.id = r.vehicle_id
      ${where}
    `,
    params
  );

  return result.rows[0]?.total ?? 0;
}

export async function listRequests(input: {
  filters: RequestFilters;
  sort: RequestSortField;
  order: SortDirection;
  limit: number;
  offset: number;
}): Promise<any[]> {
  const params: unknown[] = [];
  const where = buildWhereClause(
    buildRequestFilters(input.filters, params)
  );

  // Ambos vienen de listas cerradas, nunca del texto recibido.
  const sortColumn = REQUEST_SORT_COLUMNS[input.sort];
  const direction = SORT_DIRECTIONS[input.order];

  params.push(input.limit);
  const limitPlaceholder = `$${params.length}`;

  params.push(input.offset);
  const offsetPlaceholder = `$${params.length}`;

  const result = await db.query(
    `
      SELECT ${REQUEST_LIST_COLUMNS}
      FROM requests r
      INNER JOIN customers c ON c.id = r.customer_id
      LEFT JOIN vehicles v ON v.id = r.vehicle_id
      ${REQUEST_STATS_JOIN}
      ${where}
      ORDER BY ${sortColumn} ${direction} NULLS LAST, r.id DESC
      LIMIT ${limitPlaceholder}
      OFFSET ${offsetPlaceholder}
    `,
    params
  );

  return result.rows;
}

export async function findRequestDetail(
  requestId: string
): Promise<any | null> {
  const result = await db.query(
    `
      SELECT
        ${REQUEST_LIST_COLUMNS},
        r.structured_data,

        c.created_at AS customer_created_at,

        v.original_power AS vehicle_original_power,
        v.notes          AS vehicle_notes

      FROM requests r
      INNER JOIN customers c ON c.id = r.customer_id
      LEFT JOIN vehicles v ON v.id = r.vehicle_id
      ${REQUEST_STATS_JOIN}
      WHERE r.id = $1
      LIMIT 1
    `,
    [requestId]
  );

  return result.rows[0] ?? null;
}

export async function listConversationsByRequest(
  requestId: string
): Promise<any[]> {
  const result = await db.query(
    `
      SELECT
        id,
        customer_id,
        request_id,
        channel,
        bot_enabled,
        created_at,
        updated_at,
        last_message_at
      FROM conversations
      WHERE request_id = $1
      ORDER BY created_at ASC, id ASC
    `,
    [requestId]
  );

  return result.rows;
}

export async function listMessagesByConversations(
  conversationIds: string[]
): Promise<any[]> {
  if (conversationIds.length === 0) {
    return [];
  }

  const result = await db.query(
    `
      SELECT
        id,
        conversation_id,
        direction,
        message_type,
        text_content,
        metadata,
        delivery_status,
        status_updated_at,
        created_at
      FROM messages
      WHERE conversation_id = ANY($1::bigint[])
      ORDER BY created_at ASC, id ASC
    `,
    [conversationIds]
  );

  return result.rows;
}

export async function findCustomer(
  customerId: string
): Promise<any | null> {
  const result = await db.query(
    `
      SELECT
        id,
        name,
        phone,
        email,
        created_at,
        updated_at
      FROM customers
      WHERE id = $1
      LIMIT 1
    `,
    [customerId]
  );

  return result.rows[0] ?? null;
}

export async function listVehiclesByCustomer(
  customerId: string
): Promise<any[]> {
  const result = await db.query(
    `
      SELECT
        id,
        customer_id,
        vehicle_type,
        brand,
        model,
        year,
        engine,
        original_power,
        plate,
        vin,
        notes,
        created_at,
        updated_at
      FROM vehicles
      WHERE customer_id = $1
      ORDER BY created_at ASC, id ASC
    `,
    [customerId]
  );

  return result.rows;
}

export async function summarizeCustomerRequests(
  customerId: string
): Promise<any> {
  const result = await db.query(
    `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'COLLECTING')::int AS collecting,
        COUNT(*) FILTER (WHERE status = 'HUMAN')::int      AS human,
        COUNT(*) FILTER (WHERE status = 'CLOSED')::int     AS closed,
        MIN(created_at)        AS first_request_at,
        MAX(last_activity_at)  AS last_activity_at
      FROM requests
      WHERE customer_id = $1
    `,
    [customerId]
  );

  return result.rows[0] ?? null;
}

export async function getDashboardTotals(): Promise<any> {
  const result = await db.query(
    `
      SELECT
        (SELECT COUNT(*) FROM customers)::int     AS customers_total,
        (SELECT COUNT(*) FROM vehicles)::int      AS vehicles_total,
        (SELECT COUNT(*) FROM conversations)::int AS conversations_total,

        COUNT(*)::int AS requests_total,

        COUNT(*) FILTER (WHERE status = 'COLLECTING')::int AS status_collecting,
        COUNT(*) FILTER (WHERE status = 'HUMAN')::int      AS status_human,
        COUNT(*) FILTER (WHERE status = 'CLOSED')::int     AS status_closed,

        COUNT(*) FILTER (
          WHERE service_type = 'REPROGRAMMING'
        )::int AS service_reprogramming,

        COUNT(*) FILTER (
          WHERE service_type = 'ECU_REPAIR'
        )::int AS service_ecu_repair,

        COUNT(*) FILTER (
          WHERE service_type = 'ECU_CLONING'
        )::int AS service_ecu_cloning,

        COUNT(*) FILTER (
          WHERE service_type = 'OTHER'
        )::int AS service_other,

        COUNT(*) FILTER (
          WHERE service_type IS NULL
        )::int AS service_unknown,

        COUNT(*) FILTER (
          WHERE created_at > NOW() - INTERVAL '7 days'
        )::int AS created_last_7_days,

        COUNT(*) FILTER (
          WHERE last_activity_at > NOW() - INTERVAL '24 hours'
        )::int AS active_last_24_hours

      FROM requests
    `
  );

  return result.rows[0] ?? null;
}
