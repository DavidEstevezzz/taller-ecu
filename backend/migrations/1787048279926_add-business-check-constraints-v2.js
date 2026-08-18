/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.addConstraint("requests", "requests_status_check", {
    check: "status IN ('COLLECTING', 'HUMAN', 'CLOSED')",
  });

  pgm.addConstraint("requests", "requests_service_type_check", {
    check:
      "service_type IS NULL OR service_type IN ('REPROGRAMMING', 'ECU_REPAIR', 'ECU_CLONING', 'OTHER')",
  });

  pgm.addConstraint("requests", "requests_source_check", {
    check: "source IN ('whatsapp', 'web', 'manual')",
  });

  pgm.addConstraint("conversations", "conversations_channel_check", {
    check: "channel IN ('whatsapp', 'web', 'manual')",
  });

  pgm.addConstraint("messages", "messages_direction_check", {
    check: "direction IN ('INBOUND', 'OUTBOUND')",
  });

  pgm.addConstraint("messages", "messages_type_check", {
    check:
      "message_type IN ('TEXT', 'AUDIO', 'IMAGE', 'DOCUMENT', 'OTHER')",
  });

  pgm.addConstraint("vehicles", "vehicles_year_check", {
    check: "year IS NULL OR year BETWEEN 1900 AND 2100",
  });
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropConstraint("vehicles", "vehicles_year_check");

  pgm.dropConstraint("messages", "messages_type_check");
  pgm.dropConstraint("messages", "messages_direction_check");

  pgm.dropConstraint("conversations", "conversations_channel_check");

  pgm.dropConstraint("requests", "requests_source_check");
  pgm.dropConstraint("requests", "requests_service_type_check");
  pgm.dropConstraint("requests", "requests_status_check");
};
