/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.createTable("users", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },

    // Se guarda siempre normalizado en minúsculas y sin espacios.
    email: {
      type: "varchar(255)",
      notNull: true,
      unique: true,
    },

    name: {
      type: "varchar(150)",
      notNull: true,
    },

    password_hash: {
      type: "text",
      notNull: true,
    },

    role: {
      type: "varchar(20)",
      notNull: true,
      default: "EMPLOYEE",
    },

    is_active: {
      type: "boolean",
      notNull: true,
      default: true,
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },

    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.addConstraint("users", "users_role_check", {
    check: "role IN ('OWNER', 'EMPLOYEE')",
  });

  // La normalización del email se garantiza también en la base de datos.
  pgm.addConstraint("users", "users_email_normalized_check", {
    check: "email = lower(btrim(email))",
  });

  pgm.addConstraint("users", "users_email_length_check", {
    check: "char_length(email) >= 3",
  });

  pgm.createIndex("users", "is_active");
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropTable("users");
};
