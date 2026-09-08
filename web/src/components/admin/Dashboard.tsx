import { useCallback, useEffect, useState } from "react";

import { ApiError } from "../../lib/api/client.js";
import { getDashboard } from "../../lib/api/dashboard.js";
import type {
  DashboardResponse,
  RequestListItem,
  RequestStatus,
} from "../../lib/api/types.js";

type State =
  | { phase: "loading" }
  | { phase: "error"; message: string; expired: boolean }
  | { phase: "ready"; data: DashboardResponse };

const STATUS_LABEL: Record<RequestStatus, string> = {
  COLLECTING: "Recogiendo datos",
  HUMAN: "Requiere atención",
  CLOSED: "Cerrada",
};

/*
 * El color nunca es el único indicador: cada estado lleva su etiqueta.
 */
const STATUS_CLASS: Record<RequestStatus, string> = {
  COLLECTING: "bg-status-collecting-bg text-status-collecting",
  HUMAN: "bg-status-human-bg text-status-human",
  CLOSED: "bg-status-closed-bg text-status-closed",
};

const SERVICE_LABEL: Record<string, string> = {
  REPROGRAMMING: "Reprogramación",
  ECU_REPAIR: "Reparación de ECU",
  ECU_CLONING: "Clonación de ECU",
  OTHER: "Otro",
  UNKNOWN: "Sin clasificar",
};

function formatDate(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function vehicleLabel(request: RequestListItem): string {
  const vehicle = request.vehicle;
  if (!vehicle) return "Vehículo sin identificar";

  const parts = [vehicle.brand, vehicle.model].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "Vehículo sin identificar";
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="border border-border bg-surface p-5">
      <p className="label-technical text-ink-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold tabular text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-8" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="h-28 border border-border bg-surface" />
        ))}
      </div>
      <div className="h-64 border border-border bg-surface" />
    </div>
  );
}

export default function Dashboard() {
  const [state, setState] = useState<State>({ phase: "loading" });

  const load = useCallback((signal?: AbortSignal) => {
    setState({ phase: "loading" });

    getDashboard(signal)
      .then((data) => setState({ phase: "ready", data }))
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }

        const expired = cause instanceof ApiError && cause.isSessionExpired;

        setState({
          phase: "error",
          message:
            cause instanceof ApiError
              ? cause.message
              : "No hemos podido cargar el resumen.",
          expired,
        });
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  if (state.phase === "loading") {
    return (
      <>
        <p role="status" className="sr-only">
          Cargando el resumen
        </p>
        <Skeleton />
      </>
    );
  }

  if (state.phase === "error") {
    return (
      <div
        role="alert"
        className="border border-danger bg-danger-bg p-6 text-sm"
      >
        <p className="font-medium text-danger">{state.message}</p>

        {state.expired ? (
          <>
            <p className="mt-2 text-ink-muted">
              Tu sesión ha caducado. Vuelve a iniciarla para continuar.
            </p>
            <a
              href="/admin/login"
              className="mt-4 inline-flex min-h-11 items-center rounded-md bg-accent px-4 font-medium text-on-accent hover:bg-accent-hover"
            >
              Iniciar sesión
            </a>
          </>
        ) : (
          <button
            type="button"
            onClick={() => load()}
            className="mt-4 inline-flex min-h-11 cursor-pointer items-center rounded-md border border-border-strong bg-surface px-4 font-medium text-ink hover:bg-surface-sunken"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  const { data } = state;
  const hasRequests = data.totals.requests > 0;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Resumen
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Estado general de las solicitudes que llegan por WhatsApp.
        </p>
      </div>

      <section aria-labelledby="titulo-cifras">
        <h2 id="titulo-cifras" className="sr-only">
          Cifras generales
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Requieren atención"
            value={data.attention.waitingForHuman}
            hint="Conversaciones pasadas a una persona"
          />
          <StatCard
            label="Recogiendo datos"
            value={data.attention.stillCollecting}
            hint="El asistente sigue preguntando"
          />
          <StatCard
            label="Solicitudes"
            value={data.totals.requests}
            hint={`${data.activity.requestsCreatedLast7Days} en los últimos 7 días`}
          />
          <StatCard
            label="Clientes"
            value={data.totals.customers}
            hint={`${data.totals.vehicles} vehículos registrados`}
          />
        </div>
      </section>

      <section aria-labelledby="titulo-servicios">
        <h2
          id="titulo-servicios"
          className="text-sm font-semibold text-ink"
        >
          Por tipo de servicio
        </h2>

        <dl className="mt-4 grid gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
          {Object.entries(data.requestsByServiceType).map(([key, count]) => (
            <div key={key} className="bg-surface px-4 py-3">
              <dt className="text-xs text-ink-muted">
                {SERVICE_LABEL[key] ?? key}
              </dt>
              <dd className="mt-1 text-lg font-semibold tabular text-ink">
                {count}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="titulo-recientes">
        <div className="flex items-baseline justify-between gap-4">
          <h2
            id="titulo-recientes"
            className="text-sm font-semibold text-ink"
          >
            Actividad reciente
          </h2>
          <span className="label-technical text-ink-subtle">
            {data.recentRequests.length} solicitudes
          </span>
        </div>

        {data.recentRequests.length === 0 ? (
          <div className="mt-4 border border-dashed border-border-strong bg-surface px-6 py-12 text-center">
            <p className="text-sm font-medium text-ink">
              {hasRequests
                ? "Sin actividad reciente"
                : "Todavía no hay solicitudes"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
              {hasRequests
                ? "Cuando entren mensajes nuevos aparecerán aquí."
                : "En cuanto un cliente escriba por WhatsApp, su solicitud aparecerá en esta lista."}
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-border border border-border bg-surface">
            {data.recentRequests.map((request) => (
              <li
                key={request.id ?? Math.random()}
                className="flex flex-wrap items-start justify-between gap-4 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`label-technical rounded-sm px-2 py-1 ${
                        STATUS_CLASS[request.status]
                      }`}
                    >
                      {STATUS_LABEL[request.status]}
                    </span>

                    {request.serviceType && (
                      <span className="text-xs text-ink-muted">
                        {SERVICE_LABEL[request.serviceType] ??
                          request.serviceType}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 truncate text-sm font-medium text-ink">
                    {request.customer.name ?? "Cliente sin nombre"}
                    <span className="ml-2 font-normal text-ink-muted">
                      · {vehicleLabel(request)}
                    </span>
                  </p>

                  {request.vehicle?.plate && (
                    <p className="mt-1 font-mono text-xs tracking-wide text-ink-muted">
                      {request.vehicle.plate}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-xs text-ink-muted">
                    {formatDate(request.lastActivityAt)}
                  </p>
                  <p className="mt-1 text-xs tabular text-ink-subtle">
                    {request.activity.messageCount} mensajes
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
