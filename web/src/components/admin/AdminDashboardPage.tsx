import AdminShell from "./AdminShell.js";
import Dashboard from "./Dashboard.js";

/**
 * Une el marco del panel con el resumen. Existe para que la página .astro
 * cargue una sola isla de React en lugar de dos.
 */
export default function AdminDashboardPage() {
  return <AdminShell>{() => <Dashboard />}</AdminShell>;
}
