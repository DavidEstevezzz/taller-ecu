/**
 * Restricciones de negocio.
 *
 * Esta migración y su gemela (1787048279926_add-business-check-constraints-v2.js) declaran los
 * mismos siete nombres de constraint: la segunda en aplicarse chocaba con
 * `already exists` (42710) y ninguna instalación nueva podía migrar desde
 * cero. Ambas se hicieron idempotentes —drop if exists antes de add— para
 * que converjan sea cual sea el estado previo de `pgmigrations`.
 *
 * Los nombres y las definiciones de los constraints no han cambiado.
 * En producción ambas migraciones ya están registradas y no volverán a
 * ejecutarse.
 *
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.dropConstraint("requests", "requests_status_check", { ifExists: true });
  pgm.addConstraint("requests", "requests_status_check", {
    check: "status IN ('COLLECTING', 'HUMAN', 'CLOSED')",
  });

  pgm.dropConstraint("requests", "requests_service_type_check", { ifExists: true });
  pgm.addConstraint("requests", "requests_service_type_check", {
    check:
      "service_type IS NULL OR service_type IN ('REPROGRAMMING', 'ECU_REPAIR', 'ECU_CLONING', 'OTHER')",
  });

  pgm.dropConstraint("requests", "requests_source_check", { ifExists: true });
  pgm.addConstraint("requests", "requests_source_check", {
    check: "source IN ('whatsapp', 'web', 'manual')",
  });

  pgm.dropConstraint("conversations", "conversations_channel_check", { ifExists: true });
  pgm.addConstraint("conversations", "conversations_channel_check", {
    check: "channel IN ('whatsapp', 'web', 'manual')",
  });

  pgm.dropConstraint("messages", "messages_direction_check", { ifExists: true });
  pgm.addConstraint("messages", "messages_direction_check", {
    check: "direction IN ('INBOUND', 'OUTBOUND')",
  });

  pgm.dropConstraint("messages", "messages_type_check", { ifExists: true });
  pgm.addConstraint("messages", "messages_type_check", {
    check:
      "message_type IN ('TEXT', 'AUDIO', 'IMAGE', 'DOCUMENT', 'OTHER')",
  });

  pgm.dropConstraint("vehicles", "vehicles_year_check", { ifExists: true });
  pgm.addConstraint("vehicles", "vehicles_year_check", {
    check: "year IS NULL OR year BETWEEN 1900 AND 2100",
  });
};

/**
 * `ifExists` también aquí: una reversión completa en una base de pruebas
 * ejecuta los dos `down` seguidos sobre los mismos constraints.
 *
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropConstraint("vehicles", "vehicles_year_check", { ifExists: true });
  pgm.dropConstraint("messages", "messages_type_check", { ifExists: true });
  pgm.dropConstraint("messages", "messages_direction_check", { ifExists: true });
  pgm.dropConstraint("conversations", "conversations_channel_check", { ifExists: true });
  pgm.dropConstraint("requests", "requests_source_check", { ifExists: true });
  pgm.dropConstraint("requests", "requests_service_type_check", { ifExists: true });
  pgm.dropConstraint("requests", "requests_status_check", { ifExists: true });
};
