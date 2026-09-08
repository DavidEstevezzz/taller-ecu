/*
 * Parámetros de la autenticación administrativa.
 *
 * Se leen en tiempo de ejecución (no en tiempo de import) para que las
 * pruebas puedan alternar NODE_ENV sin reconstruir la aplicación.
 */

export const SESSION_COOKIE_NAME = "taller_session";

/*
 * 12 horas absolutas, sin renovación deslizante.
 * Cubre una jornada completa del taller con un único inicio de sesión y
 * limita la ventana de uso de una cookie robada.
 */
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/*
 * Límite de intentos fallidos de login dentro de la ventana.
 * Por email frena el ataque dirigido; por IP frena la prueba masiva de
 * varios emails desde el mismo origen.
 */
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_MAX_FAILURES_PER_IDENTIFIER = 5;
export const LOGIN_MAX_FAILURES_PER_IP = 20;

export const MIN_PASSWORD_LENGTH = 12;

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export type SessionCookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge?: number;
};

/*
 * Secure se activa solo en producción: en pruebas y en desarrollo local
 * sobre HTTP el navegador descartaría una cookie Secure.
 */
export function sessionCookieOptions(
  maxAgeSeconds?: number
): SessionCookieOptions {
  const options: SessionCookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
  };

  if (maxAgeSeconds !== undefined) {
    options.maxAge = maxAgeSeconds;
  }

  return options;
}
