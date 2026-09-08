/**
 * Tipos del contrato con la API administrativa del backend.
 *
 * Se escriben a mano a propósito: el backend no publica OpenAPI y generar
 * tipos automáticamente añadiría una herramienta más para cuatro endpoints.
 * Si el backend cambia, estos tipos y sus pruebas deben cambiar con él.
 */

export type UserRole = "OWNER" | "EMPLOYEE";

export type RequestStatus = "COLLECTING" | "HUMAN" | "CLOSED";

export type ServiceType =
  | "REPROGRAMMING"
  | "ECU_REPAIR"
  | "ECU_CLONING"
  | "OTHER";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type LoginResponse = {
  user: AdminUser;
};

export type MeResponse = {
  user: AdminUser;
};

export type LogoutResponse = {
  loggedOut: boolean;
  revoked: boolean;
};

export type CustomerSummary = {
  id: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
};

export type VehicleSummary = {
  id: string | null;
  vehicleType: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  engine: string | null;
  plate: string | null;
  vin: string | null;
} | null;

export type RequestActivity = {
  conversationCount: number;
  messageCount: number;
  lastMessageAt: string | null;
};

export type RequestListItem = {
  id: string | null;
  status: RequestStatus;
  source: string;
  serviceType: ServiceType | null;
  description: string | null;
  summaryAi: string | null;
  missingFields: string[];
  createdAt: string | null;
  updatedAt: string | null;
  completedAt: string | null;
  lastActivityAt: string | null;
  customer: CustomerSummary;
  vehicle: VehicleSummary;
  activity: RequestActivity;
};

export type DashboardResponse = {
  totals: {
    customers: number;
    vehicles: number;
    conversations: number;
    requests: number;
  };
  requestsByStatus: Record<RequestStatus, number>;
  requestsByServiceType: Record<ServiceType | "UNKNOWN", number>;
  attention: {
    waitingForHuman: number;
    stillCollecting: number;
  };
  activity: {
    requestsCreatedLast7Days: number;
    requestsActiveLast24Hours: number;
  };
  recentRequests: RequestListItem[];
};
