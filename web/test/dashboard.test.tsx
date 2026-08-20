import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Dashboard from "../src/components/admin/Dashboard";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function payload(overrides: Record<string, unknown> = {}) {
  return {
    totals: { customers: 12, vehicles: 15, conversations: 14, requests: 20 },
    requestsByStatus: { COLLECTING: 4, HUMAN: 3, CLOSED: 13 },
    requestsByServiceType: {
      REPROGRAMMING: 9,
      ECU_REPAIR: 5,
      ECU_CLONING: 2,
      OTHER: 1,
      UNKNOWN: 3,
    },
    attention: { waitingForHuman: 3, stillCollecting: 4 },
    activity: { requestsCreatedLast7Days: 6, requestsActiveLast24Hours: 2 },
    recentRequests: [],
    ...overrides,
  };
}

function request(overrides: Record<string, unknown> = {}) {
  return {
    id: "10",
    status: "HUMAN",
    source: "whatsapp",
    serviceType: "REPROGRAMMING",
    description: "Subir potencia",
    summaryAi: null,
    missingFields: [],
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-02T10:00:00.000Z",
    completedAt: null,
    lastActivityAt: "2026-08-02T12:00:00.000Z",
    customer: {
      id: "5",
      name: "Ana Pérez",
      phone: "+34600000001",
      email: null,
    },
    vehicle: {
      id: "7",
      vehicleType: "car",
      brand: "Seat",
      model: "Leon",
      year: 2019,
      engine: "2.0 TDI",
      plate: "1111AAA",
      vin: "VIN123",
    },
    activity: { conversationCount: 2, messageCount: 4, lastMessageAt: null },
    ...overrides,
  };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("estado de carga", () => {
  it("anuncia la carga antes de tener datos", async () => {
    fetchMock.mockReturnValue(new Promise(() => {}));

    render(<Dashboard />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando el resumen");
  });
});

describe("datos cargados", () => {
  it("muestra las cifras del backend", async () => {
    fetchMock.mockResolvedValue(jsonResponse(payload()));

    render(<Dashboard />);

    expect(
      await screen.findByRole("heading", { name: "Resumen", level: 1 })
    ).toBeInTheDocument();

    const atencion = screen.getByText("Requieren atención").closest("div")!;
    expect(atencion).toHaveTextContent("3");

    const clientes = screen.getByText("Clientes").closest("div")!;
    expect(clientes).toHaveTextContent("12");
    expect(clientes).toHaveTextContent("15 vehículos registrados");
  });

  it("traduce los tipos de servicio", async () => {
    fetchMock.mockResolvedValue(jsonResponse(payload()));

    render(<Dashboard />);

    expect(await screen.findByText("Reprogramación")).toBeInTheDocument();
    expect(screen.getByText("Reparación de ECU")).toBeInTheDocument();
    expect(screen.getByText("Sin clasificar")).toBeInTheDocument();
  });

  it("lista la actividad reciente con estado en texto, no solo color", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(payload({ recentRequests: [request()] }))
    );

    render(<Dashboard />);

    expect(await screen.findByText("Requiere atención")).toBeInTheDocument();
    expect(screen.getByText(/Ana Pérez/)).toBeInTheDocument();
    expect(screen.getByText(/Seat Leon/)).toBeInTheDocument();
    expect(screen.getByText("1111AAA")).toBeInTheDocument();
  });

  it("tolera una solicitud sin vehículo ni nombre", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        payload({
          recentRequests: [
            request({
              vehicle: null,
              customer: { id: "9", name: null, phone: null, email: null },
            }),
          ],
        })
      )
    );

    render(<Dashboard />);

    expect(await screen.findByText(/Cliente sin nombre/)).toBeInTheDocument();
    expect(screen.getByText(/Vehículo sin identificar/)).toBeInTheDocument();
  });
});

describe("estado vacío", () => {
  it("explica que aún no hay solicitudes", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        payload({
          totals: { customers: 0, vehicles: 0, conversations: 0, requests: 0 },
          recentRequests: [],
        })
      )
    );

    render(<Dashboard />);

    expect(
      await screen.findByText("Todavía no hay solicitudes")
    ).toBeInTheDocument();
  });

  it("distingue 'sin actividad reciente' de 'sin solicitudes'", async () => {
    fetchMock.mockResolvedValue(jsonResponse(payload()));

    render(<Dashboard />);

    expect(
      await screen.findByText("Sin actividad reciente")
    ).toBeInTheDocument();
  });
});

describe("errores", () => {
  it("ofrece reintentar ante un fallo de red", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    render(<Dashboard />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/conectar/i);

    fetchMock.mockResolvedValueOnce(jsonResponse(payload()));

    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Resumen", level: 1 })
      ).toBeInTheDocument()
    );
  });

  it("trata la sesión caducada de forma distinta y enlaza al login", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: "unauthorized" }, 401)
    );

    render(<Dashboard />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/caducado/i);

    const link = screen.getByRole("link", { name: "Iniciar sesión" });
    expect(link).toHaveAttribute("href", "/admin/login");

    expect(
      screen.queryByRole("button", { name: "Reintentar" })
    ).not.toBeInTheDocument();
  });

  it("avisa si la respuesta no tiene el formato esperado", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ totals: {} }));

    render(<Dashboard />);

    expect(await screen.findByRole("alert")).toHaveTextContent(/formato/i);
  });
});
