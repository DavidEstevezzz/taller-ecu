/*
 * Utilidades compartidas por las consultas del panel.
 *
 * Regla de la casa: en el SQL solo se interpolan identificadores de una
 * lista cerrada definida aquí. Cualquier valor procedente del usuario viaja
 * siempre como parámetro posicional.
 */

export const REQUEST_SORT_COLUMNS = {
  lastActivityAt: "r.last_activity_at",
  createdAt: "r.created_at",
  updatedAt: "r.updated_at",
  status: "r.status",
  customerName: "c.name",
} as const;

export type RequestSortField = keyof typeof REQUEST_SORT_COLUMNS;

export const SORT_DIRECTIONS = {
  asc: "ASC",
  desc: "DESC",
} as const;

export type SortDirection = keyof typeof SORT_DIRECTIONS;

/*
 * Escapa los comodines de LIKE para que un término con % o _ busque esos
 * caracteres literalmente en lugar de convertirse en un patrón.
 */
export function toLikePattern(term: string): string {
  const escaped = term.replace(/[\\%_]/g, (character) => `\\${character}`);

  return `%${escaped}%`;
}

export type RequestFilters = {
  search?: string;
  status?: string;
  serviceType?: string;
  from?: Date;
  to?: Date;
  customerId?: string;
};

/*
 * Construye las cláusulas WHERE compartidas por el listado y su recuento.
 * Empuja los valores sobre `params` y devuelve solo texto con marcadores.
 */
export function buildRequestFilters(
  filters: RequestFilters,
  params: unknown[]
): string[] {
  const clauses: string[] = [];

  if (filters.customerId) {
    params.push(filters.customerId);
    clauses.push(`r.customer_id = $${params.length}`);
  }

  if (filters.status) {
    params.push(filters.status);
    clauses.push(`r.status = $${params.length}`);
  }

  if (filters.serviceType) {
    params.push(filters.serviceType);
    clauses.push(`r.service_type = $${params.length}`);
  }

  if (filters.from) {
    params.push(filters.from);
    clauses.push(`r.created_at >= $${params.length}`);
  }

  if (filters.to) {
    params.push(filters.to);
    clauses.push(`r.created_at <= $${params.length}`);
  }

  if (filters.search) {
    params.push(toLikePattern(filters.search));

    const placeholder = `$${params.length}`;

    clauses.push(`(
      c.name ILIKE ${placeholder} ESCAPE '\\'
      OR c.phone ILIKE ${placeholder} ESCAPE '\\'
      OR v.brand ILIKE ${placeholder} ESCAPE '\\'
      OR v.model ILIKE ${placeholder} ESCAPE '\\'
      OR v.plate ILIKE ${placeholder} ESCAPE '\\'
      OR v.vin ILIKE ${placeholder} ESCAPE '\\'
      OR r.description ILIKE ${placeholder} ESCAPE '\\'
    )`);
  }

  return clauses;
}

export function buildWhereClause(clauses: string[]): string {
  if (clauses.length === 0) {
    return "";
  }

  return `WHERE ${clauses.join("\n        AND ")}`;
}
