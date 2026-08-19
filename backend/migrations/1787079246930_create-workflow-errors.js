/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const up = (pgm) => {
  pgm.createTable("workflow_errors", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },

    workflow_name: {
      type: "varchar(255)",
      notNull: true,
    },

    workflow_id: {
      type: "varchar(100)",
    },

    execution_id: {
      type: "varchar(100)",
    },

    execution_url: {
      type: "text",
    },

    node_name: {
      type: "varchar(255)",
    },

    error_message: {
      type: "text",
      notNull: true,
    },

    error_stack: {
      type: "text",
    },

    error_payload: {
      type: "jsonb",
      notNull: true,
      default: pgm.func("'{}'::jsonb"),
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("CURRENT_TIMESTAMP"),
    },

    resolved_at: {
      type: "timestamptz",
    },
  });

  pgm.createIndex(
    "workflow_errors",
    "created_at",
  );

  pgm.createIndex(
    "workflow_errors",
    "resolved_at",
  );

  pgm.createIndex(
    "workflow_errors",
    "execution_id",
  );
};

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
export const down = (pgm) => {
  pgm.dropTable("workflow_errors");
};