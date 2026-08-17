export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("vehicles", {
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

    vehicle_type: {
      type: "varchar(30)",
      notNull: false,
    },

    brand: {
      type: "varchar(100)",
      notNull: false,
    },

    model: {
      type: "varchar(150)",
      notNull: false,
    },

    year: {
      type: "integer",
      notNull: false,
    },

    engine: {
      type: "varchar(150)",
      notNull: false,
    },

    original_power: {
      type: "varchar(50)",
      notNull: false,
    },

    plate: {
      type: "varchar(20)",
      notNull: false,
    },

    vin: {
      type: "varchar(50)",
      notNull: false,
    },

    notes: {
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
  });

  pgm.createIndex("vehicles", "customer_id");
  pgm.createIndex("vehicles", "plate");
  pgm.createIndex("vehicles", "vin");
};

export const down = (pgm) => {
  pgm.dropTable("vehicles");
};
