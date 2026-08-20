import { useEffect, useState, type ReactNode } from "react";

import { ApiError } from "../../lib/api/client.js";
import { currentUser, logout } from "../../lib/api/auth.js";
import type { AdminUser } from "../../lib/api/types.js";

/**
 * Marco del panel: comprueba la sesión, pinta navegación y cabecera, y
 * entrega el usuario autenticado a su contenido.
 *
 * Mientras no haya sesión validada no se renderiza nada del interior.
 */

type SessionState =
  | { phase: "checking" }
  | { phase: "anonymous" }
  | { phase: "ready"; user: AdminUser };

type NavItem = {
  href: string;
  label: string;
  /** Destinos aún no implementados: se muestran, pero no fingen estar listos. */
  ready: boolean;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Resumen", ready: true },
  { href: "/admin/solicitudes", label: "Solicitudes", ready: false },
  { href: "/admin/clientes", label: "Clientes", ready: false },
];

function currentPath(): string {
  return typeof window === "undefined" ? "/admin" : window.location.pathname;
}

export default function AdminShell({
  children,
}: {
  children: (user: AdminUser) => ReactNode;
}) {
  const [session, setSession] = useState<SessionState>({ phase: "checking" });
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    currentUser(controller.signal)
      .then((user) => {
        if (user) {
          setSession({ phase: "ready", user });
        } else {
          setSession({ phase: "anonymous" });
          const next = encodeURIComponent(currentPath());
          window.location.replace(`/admin/login?next=${next}`);
        }
      })
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }

        setSession({ phase: "anonymous" });
      });

    return () => controller.abort();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
    } catch (cause) {
      // Un fallo de red al cerrar sesión no debe dejar al usuario atrapado.
      if (!(cause instanceof ApiError)) {
        throw cause;
      }
    } finally {
      window.location.assign("/admin/login");
    }
  }

  if (session.phase === "checking") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <p role="status" className="text-sm text-ink-muted">
          Comprobando sesión…
        </p>
      </div>
    );
  }

  if (session.phase === "anonymous") {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-ink-muted">
            Necesitas iniciar sesión para acceder al panel.
          </p>
          <a
            href="/admin/login"
            className="mt-4 inline-flex min-h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-on-accent hover:bg-accent-hover"
          >
            Ir al inicio de sesión
          </a>
        </div>
      </div>
    );
  }

  const { user } = session;
  const path = currentPath();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#panel-contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-(--z-modal) focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:shadow-md"
      >
        Saltar al contenido
      </a>

      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-(--container-content) flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            {/* Mismo símbolo que la web pública, desde public/brand/. */}
            <img
              src="/brand/logo-mark.svg"
              alt=""
              width={32}
              height={32}
              className="size-8 text-ink"
            />
            <span className="text-base font-semibold tracking-tight text-ink">
              JM Repro
            </span>
            <span className="label-technical text-ink-muted">Panel</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-ink-muted sm:inline">
              {user.name}
              <span className="ml-2 rounded-sm bg-surface-sunken px-1.5 py-0.5 text-xs text-ink-muted">
                {user.role === "OWNER" ? "Propietario" : "Empleado"}
              </span>
            </span>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-border-strong px-3 text-sm text-ink transition-colors duration-(--duration-base) hover:bg-surface-sunken disabled:opacity-60"
            >
              {loggingOut ? "Saliendo…" : "Cerrar sesión"}
            </button>
          </div>
        </div>

        <nav
          aria-label="Secciones del panel"
          className="mx-auto max-w-(--container-content) px-4 sm:px-6"
        >
          <ul className="-mb-px flex gap-1 overflow-x-auto">
            {NAV.map((item) => {
              const active = path === item.href;

              if (!item.ready) {
                return (
                  <li key={item.href}>
                    <span
                      aria-disabled="true"
                      title="Todavía no disponible"
                      className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-3 text-sm text-ink-subtle"
                    >
                      {item.label}
                      <span className="label-technical rounded-sm bg-surface-sunken px-1.5 py-0.5 text-ink-subtle">
                        Pronto
                      </span>
                    </span>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center whitespace-nowrap border-b-2 px-3 text-sm transition-colors duration-(--duration-base) ${
                      active
                        ? "border-accent font-medium text-ink"
                        : "border-transparent text-ink-muted hover:border-border-strong hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main
        id="panel-contenido"
        className="mx-auto w-full max-w-(--container-content) flex-1 px-4 py-8 sm:px-6"
      >
        {children(user)}
      </main>
    </div>
  );
}
