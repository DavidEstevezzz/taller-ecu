/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.createTable("login_attempts", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },

    // Email normalizado con el que se intentó iniciar sesión.
    identifier: {
      type: "varchar(255)",
      notNull: true,
    },

    ip_address: {
      type: "varchar(64)",
      notNull: false,
    },

    succeeded: {
      type: "boolean",
      notNull: true,
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("login_attempts", ["identifier", "created_at"]);
  pgm.createIndex("login_attempts", ["ip_address", "created_at"]);
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropTable("login_attempts");
};
