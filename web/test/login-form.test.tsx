import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LoginForm from "../src/components/admin/LoginForm";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const USER = { id: "1", email: "jefe@example.com", name: "Jefe", role: "OWNER" };

let fetchMock: ReturnType<typeof vi.fn>;
let assign: ReturnType<typeof vi.fn>;
let replace: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);

  assign = vi.fn();
  replace = vi.fn();

  Object.defineProperty(window, "location", {
    configurable: true,
    value: { assign, replace, pathname: "/admin/login", search: "" },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Sin sesión previa: el formulario debe aparecer. */
function noSession() {
  fetchMock.mockResolvedValueOnce(jsonResponse({ error: "unauthorized" }, 401));
}

describe("comprobación de sesión existente", () => {
  it("redirige al panel si ya hay sesión", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ user: USER }));

    render(<LoginForm />);

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/admin"));
  });

  it("muestra el formulario cuando no hay sesión", async () => {
    noSession();
    render(<LoginForm />);

    expect(await screen.findByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
  });
});

describe("accesibilidad del formulario", () => {
  it("asocia cada etiqueta con su campo", async () => {
    noSession();
    render(<LoginForm />);

    const email = await screen.findByLabelText("Email");
    const password = screen.getByLabelText("Contraseña");

    expect(email).toHaveAttribute("type", "email");
    expect(email).toHaveAttribute("autocomplete", "username");
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("autocomplete", "current-password");
  });

  it("permite completar y enviar solo con el teclado", async () => {
    noSession();
    fetchMock.mockResolvedValueOnce(jsonResponse({ user: USER }));

    const user = userEvent.setup();
    render(<LoginForm />);

    const email = await screen.findByLabelText("Email");

    // El primer campo recibe el foco automáticamente.
    await waitFor(() => expect(email).toHaveFocus());

    await user.keyboard("jefe@example.com");
    await user.tab();
    expect(screen.getByLabelText("Contraseña")).toHaveFocus();

    await user.keyboard("contrasena-larga");
    await user.tab();
    expect(screen.getByRole("button", { name: "Entrar" })).toHaveFocus();

    await user.keyboard("{Enter}");

    await waitFor(() => expect(assign).toHaveBeenCalledWith("/admin"));
  });
});

describe("envío", () => {
  it("envía las credenciales y redirige al panel", async () => {
    noSession();
    fetchMock.mockResolvedValueOnce(jsonResponse({ user: USER }));

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(await screen.findByLabelText("Email"), "jefe@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "contrasena-larga");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(assign).toHaveBeenCalledWith("/admin"));

    const secondCall = fetchMock.mock.calls[1];
    expect(secondCall).toBeDefined();
    const init = secondCall![1] as RequestInit;
    expect(JSON.parse(String(init.body))).toEqual({
      email: "jefe@example.com",
      password: "contrasena-larga",
    });
  });

  it("muestra estado de envío y desactiva el botón", async () => {
    noSession();

    let resolve: (value: Response) => void = () => {};
    fetchMock.mockReturnValueOnce(
      new Promise<Response>((r) => {
        resolve = r;
      })
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(await screen.findByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Contraseña"), "x");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    const button = await screen.findByRole("button", { name: /Entrando/ });
    expect(button).toBeDisabled();

    resolve(jsonResponse({ user: USER }));
  });

  it("muestra un error comprensible con credenciales incorrectas", async () => {
    noSession();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "invalid_credentials" }, 401)
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(await screen.findByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Contraseña"), "mal");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Email o contraseña incorrectos.");
    expect(assign).not.toHaveBeenCalled();
  });

  it("explica el bloqueo por demasiados intentos", async () => {
    noSession();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "too_many_attempts" }, 429)
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(await screen.findByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Contraseña"), "x");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/intentos/i);
  });

  it("informa cuando no hay conexión", async () => {
    noSession();
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(await screen.findByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Contraseña"), "x");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/conectar/i);
  });

  it("lleva el foco al mensaje de error", async () => {
    noSession();
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ error: "invalid_credentials" }, 401)
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(await screen.findByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Contraseña"), "x");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    const alert = await screen.findByRole("alert");
    await waitFor(() => expect(alert).toHaveFocus());
  });
});

describe("redirección posterior", () => {
  it("respeta el destino interno indicado en next", async () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        assign,
        replace,
        pathname: "/admin/login",
        search: "?next=%2Fadmin%2Fsolicitudes",
      },
    });

    noSession();
    fetchMock.mockResolvedValueOnce(jsonResponse({ user: USER }));

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(await screen.findByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Contraseña"), "x");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() =>
      expect(assign).toHaveBeenCalledWith("/admin/solicitudes")
    );
  });

  it("ignora un destino externo", async () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        assign,
        replace,
        pathname: "/admin/login",
        search: "?next=https%3A%2F%2Fevil.example",
      },
    });

    noSession();
    fetchMock.mockResolvedValueOnce(jsonResponse({ user: USER }));

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(await screen.findByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Contraseña"), "x");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(assign).toHaveBeenCalledWith("/admin"));
  });
});
