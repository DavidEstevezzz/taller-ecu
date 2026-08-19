/*
 * Alta del primer usuario OWNER del panel.
 *
 * No existe registro público: este script es la única vía de creación.
 * Uso:
 *   docker compose exec backend node dist/scripts/create-owner.js
 *   npm run create:owner        (en desarrollo, con tsx)
 *
 * La contraseña se pide por consola con el eco desactivado y nunca se
 * acepta por argumento ni por variable de entorno, para que no acabe en el
 * historial del shell ni en la tabla de procesos.
 */

import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";

import { MIN_PASSWORD_LENGTH } from "../auth/config.js";
import { db } from "../db.js";
import { countUsers } from "../auth/repository.js";
import { createUser, normalizeEmail } from "../auth/service.js";

type MutableInterface = {
  muted: boolean;
};

function createPrompt() {
  const rl = createInterface({
    input: stdin,
    output: stdout,
    terminal: true,
  }) as unknown as ReturnType<typeof createInterface> &
    MutableInterface & {
      _writeToOutput: (value: string) => void;
    };

  rl.muted = false;

  rl._writeToOutput = function writeToOutput(value: string) {
    if (rl.muted) {
      // Se traga el eco de los caracteres de la contraseña.
      return;
    }

    stdout.write(value);
  };

  const ask = (question: string): Promise<string> =>
    new Promise((resolve) => {
      rl.question(question, (answer) => resolve(answer));
    });

  const askHidden = async (question: string): Promise<string> => {
    stdout.write(question);

    rl.muted = true;

    const answer = await new Promise<string>((resolve) => {
      rl.question("", (value) => resolve(value));
    });

    rl.muted = false;
    stdout.write("\n");

    return answer;
  };

  return {
    ask,
    askHidden,
    close: () => rl.close(),
  };
}

function fail(message: string): never {
  console.error(`\nError: ${message}`);
  process.exitCode = 1;
  throw new Error(message);
}

async function main() {
  const prompt = createPrompt();

  try {
    const existing = await countUsers();

    if (existing > 0) {
      console.log(
        `Aviso: ya existen ${existing} usuario(s). ` +
          "Este script creará uno adicional con rol OWNER."
      );
    }

    const rawEmail = await prompt.ask("Email: ");
    const email = normalizeEmail(rawEmail);

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      fail("el email no tiene un formato válido");
    }

    const name = (await prompt.ask("Nombre: ")).trim();

    if (name.length === 0) {
      fail("el nombre no puede estar vacío");
    }

    const password = await prompt.askHidden("Contraseña: ");

    if (password.length < MIN_PASSWORD_LENGTH) {
      fail(
        `la contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
      );
    }

    const confirmation = await prompt.askHidden("Repite la contraseña: ");

    if (password !== confirmation) {
      fail("las contraseñas no coinciden");
    }

    const user = await createUser({
      email,
      name,
      password,
      role: "OWNER",
    });

    console.log(
      `\nUsuario OWNER creado: ${user.email} (id ${user.id})`
    );
  } finally {
    prompt.close();
    await db.end();
  }
}

main().catch((error) => {
  if (process.exitCode !== 1) {
    console.error(error);
    process.exitCode = 1;
  }
});
