export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("requests", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },

    customer_id: {
      type: "bigint",
      notNull: true,
      references: '"customers"',
      onDelete: "CASCADE",
    },

    vehicle_id: {
      type: "bigint",
      notNull: false,
      references: '"vehicles"',
      onDelete: "SET NULL",
    },

    source: {
      type: "varchar(30)",
      notNull: true,
      default: "whatsapp",
    },

    service_type: {
      type: "varchar(50)",
      notNull: false,
    },

    status: {
      type: "varchar(30)",
      notNull: true,
      default: "COLLECTING",
    },

    description: {
      type: "text",
      notNull: false,
    },

    structured_data: {
      type: "jsonb",
      notNull: true,
      default: "{}",
    },

    missing_fields: {
      type: "jsonb",
      notNull: true,
      default: "[]",
    },

    summary_ai: {
      type: "text",
      notNull: false,
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

    completed_at: {
      type: "timestamptz",
      notNull: false,
    },

    last_activity_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("requests", "customer_id");
  pgm.createIndex("requests", "vehicle_id");
  pgm.createIndex("requests", "status");
  pgm.createIndex("requests", "service_type");
  pgm.createIndex("requests", "last_activity_at");
};

export const down = (pgm) => {
  pgm.dropTable("requests");
};
