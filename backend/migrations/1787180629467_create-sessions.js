/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.createTable("sessions", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },

    user_id: {
      type: "bigint",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },

    /*
     * SHA-256 en hexadecimal del token de sesión.
     * El token en claro solo existe en la cookie del navegador:
     * nunca se almacena en PostgreSQL.
     */
    token_hash: {
      type: "varchar(64)",
      notNull: true,
      unique: true,
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },

    expires_at: {
      type: "timestamptz",
      notNull: true,
    },

    revoked_at: {
      type: "timestamptz",
      notNull: false,
    },
  });

  pgm.addConstraint("sessions", "sessions_token_hash_format_check", {
    check: "token_hash ~ '^[0-9a-f]{64}$'",
  });

  pgm.addConstraint("sessions", "sessions_expires_after_creation_check", {
    check: "expires_at > created_at",
  });

  pgm.createIndex("sessions", "user_id");
  pgm.createIndex("sessions", "expires_at");
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropTable("sessions");
};
