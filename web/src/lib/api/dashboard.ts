import { apiFetch, isRecord } from "./client.js";
import type { DashboardResponse } from "./types.js";

function looksLikeDashboard(data: unknown): boolean {
  if (!isRecord(data)) {
    return false;
  }

  return (
    isRecord(data.totals) &&
    typeof data.totals.requests === "number" &&
    isRecord(data.requestsByStatus) &&
    isRecord(data.attention) &&
    Array.isArray(data.recentRequests)
  );
}

export function getDashboard(
  signal?: AbortSignal
): Promise<DashboardResponse> {
  return apiFetch<DashboardResponse>("/admin/dashboard", {
    validate: looksLikeDashboard,
    signal,
  });
}
