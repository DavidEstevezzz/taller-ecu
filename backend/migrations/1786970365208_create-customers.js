export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("customers", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },

    name: {
      type: "varchar(150)",
      notNull: false,
    },

    phone: {
      type: "varchar(30)",
      notNull: true,
      unique: true,
    },

    email: {
      type: "varchar(255)",
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
};

export const down = (pgm) => {
  pgm.dropTable("customers");
};
