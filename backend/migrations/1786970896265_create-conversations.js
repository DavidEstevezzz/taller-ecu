export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("conversations", {
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

    request_id: {
      type: "bigint",
      notNull: false,
      references: '"requests"',
      onDelete: "SET NULL",
    },

    channel: {
      type: "varchar(30)",
      notNull: true,
      default: "whatsapp",
    },

    bot_enabled: {
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

    last_message_at: {
      type: "timestamptz",
      notNull: false,
    },
  });

  pgm.createIndex("conversations", "customer_id");
  pgm.createIndex("conversations", "request_id");
  pgm.createIndex("conversations", "bot_enabled");
  pgm.createIndex("conversations", "last_message_at");
};

export const down = (pgm) => {
  pgm.dropTable("conversations");
};
