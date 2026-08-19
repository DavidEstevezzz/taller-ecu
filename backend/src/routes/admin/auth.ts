import type { FastifyPluginAsync } from "fastify";

import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
} from "../../auth/config.js";

import { login, logout } from "../../auth/service.js";

import {
  readSessionToken,
  requireAdminUser,
} from "../../plugins/adminAuth.js";

import { loginBodySchema } from "../../schemas/adminAuth.js";

export const adminAuthRoutes: FastifyPluginAsync = async (app) => {
  app.post<{
    Body: { email: string; password: string };
  }>(
    "/auth/login",
    {
      schema: {
        body: loginBodySchema,
      },
    },
    async (request, reply) => {
      const result = await login({
        email: request.body.email,
        password: request.body.password,
        ipAddress: request.ip ?? null,
      });

      if (!result.ok) {
        if (result.reason === "rate_limited") {
          return reply.status(429).send({
            error: "too_many_attempts",
          });
        }

        return reply.status(401).send({
          error: "invalid_credentials",
        });
      }

      const maxAgeSeconds = Math.floor(
        (result.expiresAt.getTime() - Date.now()) / 1000
      );

      reply.setCookie(
        SESSION_COOKIE_NAME,
        result.token,
        sessionCookieOptions(maxAgeSeconds)
      );

      return reply.status(200).send({
        user: result.user,
      });
    }
  );

  /*
   * El logout no exige sesión válida: siempre revoca el token presentado
   * (si lo hay) y borra la cookie, de modo que una sesión ya caducada no
   * deje al navegador con una cookie inservible.
   */
  app.post("/auth/logout", async (request, reply) => {
    const token = readSessionToken(request);

    const revoked = await logout(token);

    reply.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions());

    return reply.status(200).send({
      loggedOut: true,
      revoked,
    });
  });

  app.get(
    "/auth/me",
    {
      preHandler: requireAdminUser,
    },
    async (request) => {
      return {
        user: request.adminUser,
      };
    }
  );
};

export default adminAuthRoutes;
