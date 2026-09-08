import type {
  FastifyReply,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from "fastify";

import { SESSION_COOKIE_NAME } from "../auth/config.js";
import { authenticate } from "../auth/service.js";
import type { PublicUser } from "../auth/service.js";

declare module "fastify" {
  interface FastifyRequest {
    adminUser?: PublicUser;
  }
}

export function readSessionToken(request: FastifyRequest): string {
  return request.cookies?.[SESSION_COOKIE_NAME] ?? "";
}

/*
 * preHandler para las rutas de /api/admin que exigen sesión.
 * No se aplica como hook global: login y logout deben ser accesibles sin
 * una sesión válida.
 */
export const requireAdminUser: preHandlerAsyncHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const token = readSessionToken(request);

  const user = await authenticate(token);

  if (!user) {
    return reply.status(401).send({
      error: "unauthorized",
    });
  }

  request.adminUser = user;
};
