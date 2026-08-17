export const shorthands = undefined;

export const up = (pgm) => {
  pgm.createTable("messages", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },

    conversation_id: {
      type: "bigint",
      notNull: true,
      references: '"conversations"',
      onDelete: "CASCADE",
    },

    provider_message_id: {
      type: "varchar(255)",
      notNull: false,
      unique: true,
    },

    direction: {
      type: "varchar(20)",
      notNull: true,
    },

    message_type: {
      type: "varchar(30)",
      notNull: true,
      default: "TEXT",
    },

    text_content: {
      type: "text",
      notNull: false,
    },

    metadata: {
      type: "jsonb",
      notNull: true,
      default: "{}",
    },

    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });

  pgm.createIndex("messages", "conversation_id");
  pgm.createIndex("messages", "created_at");
  pgm.createIndex("messages", "direction");
};

export const down = (pgm) => {
  pgm.dropTable("messages");
};
