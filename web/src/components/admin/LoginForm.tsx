import { useEffect, useId, useRef, useState } from "react";
import type { ComponentProps } from "react";

import { ApiError } from "../../lib/api/client.js";
import { currentUser, login } from "../../lib/api/auth.js";

type Status = "checking" | "ready" | "submitting" | "redirecting";

/** Destino tras iniciar sesión. Solo se aceptan rutas internas del panel. */
function safeRedirect(): string {
  if (typeof window === "undefined") {
    return "/admin";
  }

  const target = new URLSearchParams(window.location.search).get("next");

  // Evita redirecciones abiertas: nada de "//evil.com" ni URLs absolutas.
  if (target && target.startsWith("/admin") && !target.startsWith("//")) {
    return target;
  }

  return "/admin";
}

export default function LoginForm() {
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const [status, setStatus] = useState<Status>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const errorRef = useRef<HTMLParagraphElement>(null);

  // Si ya hay sesión válida, no tiene sentido enseñar el formulario.
  useEffect(() => {
    const controller = new AbortController();

    currentUser(controller.signal)
      .then((user) => {
        if (user) {
          setStatus("redirecting");
          window.location.replace(safeRedirect());
        } else {
          setStatus("ready");
        }
      })
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === "AbortError") {
          return;
        }

        setStatus("ready");
      });

    return () => controller.abort();
  }, []);

  // Tras un fallo, el error recibe el foco para que lo anuncie el lector.
  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  const handleSubmit: NonNullable<
    ComponentProps<"form">["onSubmit"]
  > = async (event) => {
    event.preventDefault();

    if (status === "submitting") {
      return;
    }

    setError(null);
    setStatus("submitting");

    try {
      await login(email.trim(), password);
      setStatus("redirecting");
      window.location.assign(safeRedirect());
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(
          cause.code === "invalid_credentials"
            ? "Email o contraseña incorrectos."
            : cause.message
        );
      } else {
        setError("No hemos podido iniciar sesión. Inténtalo de nuevo.");
      }

      setStatus("ready");
    }
  };

  if (status === "checking") {
    return (
      <p className="text-sm text-ink-muted" role="status">
        Comprobando sesión…
      </p>
    );
  }

  if (status === "redirecting") {
    return (
      <p className="text-sm text-ink-muted" role="status">
        Sesión iniciada. Entrando en el panel…
      </p>
    );
  }

  const busy = status === "submitting";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && (
        <p
          ref={errorRef}
          id={errorId}
          role="alert"
          tabIndex={-1}
          className="rounded-md border border-danger bg-danger-bg px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      <div>
        <label
          htmlFor={emailId}
          className="block text-sm font-medium text-ink"
        >
          Email
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          required
          autoComplete="username"
          inputMode="email"
          autoFocus
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className="mt-2 block min-h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-base text-ink placeholder:text-ink-subtle focus-visible:border-accent disabled:opacity-60"
        />
      </div>

      <div>
        <label
          htmlFor={passwordId}
          className="block text-sm font-medium text-ink"
        >
          Contraseña
        </label>
        <input
          id={passwordId}
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          className="mt-2 block min-h-11 w-full rounded-md border border-border-strong bg-surface px-3 text-base text-ink focus-visible:border-accent disabled:opacity-60"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-on-accent transition-colors duration-(--duration-base) hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy && (
          <span
            className="size-4 animate-spin rounded-pill border-2 border-on-accent border-t-transparent"
            aria-hidden="true"
          />
        )}
        {busy ? "Entrando…" : "Entrar"}
      </button>

      <p aria-live="polite" className="sr-only">
        {busy ? "Enviando credenciales" : ""}
      </p>
    </form>
  );
}
