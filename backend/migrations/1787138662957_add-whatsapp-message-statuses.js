export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE messages
      ADD COLUMN delivery_status varchar(20),
      ADD COLUMN status_updated_at timestamptz,
      ADD COLUMN delivery_metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

    ALTER TABLE messages
      ADD CONSTRAINT messages_delivery_status_check
      CHECK (
        delivery_status IS NULL
        OR delivery_status IN (
          'sent',
          'delivered',
          'read',
          'failed'
        )
      );

    CREATE INDEX messages_delivery_status_idx
      ON messages (delivery_status)
      WHERE delivery_status IS NOT NULL;


    CREATE TABLE message_status_events (
      id bigserial PRIMARY KEY,

      message_id bigint
        REFERENCES messages(id)
        ON DELETE CASCADE,

      provider_message_id varchar(512) NOT NULL,

      status varchar(30) NOT NULL,

      status_timestamp timestamptz NOT NULL,

      recipient_id varchar(64),

      meta_conversation_id varchar(255),

      pricing jsonb
        NOT NULL
        DEFAULT '{}'::jsonb,

      errors jsonb
        NOT NULL
        DEFAULT '[]'::jsonb,

      raw_payload jsonb
        NOT NULL
        DEFAULT '{}'::jsonb,

      created_at timestamptz
        NOT NULL
        DEFAULT current_timestamp
    );


    CREATE UNIQUE INDEX
      message_status_events_unique_event_idx
      ON message_status_events (
        provider_message_id,
        status,
        status_timestamp
      );


    CREATE INDEX
      message_status_events_provider_message_idx
      ON message_status_events (
        provider_message_id
      );


    CREATE INDEX
      message_status_events_message_idx
      ON message_status_events (
        message_id
      );


    CREATE INDEX
      message_status_events_created_at_idx
      ON message_status_events (
        created_at DESC
      );


    CREATE OR REPLACE FUNCTION
      reconcile_message_status_after_message_insert()
    RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
      latest_event message_status_events%ROWTYPE;
    BEGIN
      IF NEW.provider_message_id IS NULL
         OR NEW.direction <> 'OUTBOUND'
      THEN
        RETURN NEW;
      END IF;


      UPDATE message_status_events
      SET message_id = NEW.id
      WHERE provider_message_id =
        NEW.provider_message_id
        AND message_id IS NULL;


      SELECT *
      INTO latest_event
      FROM message_status_events
      WHERE provider_message_id =
        NEW.provider_message_id
        AND status IN (
          'sent',
          'delivered',
          'read',
          'failed'
        )
      ORDER BY
        status_timestamp DESC,
        id DESC
      LIMIT 1;


      IF FOUND THEN
        UPDATE messages
        SET
          delivery_status =
            latest_event.status,

          status_updated_at =
            latest_event.status_timestamp,

          delivery_metadata =
            jsonb_build_object(
              'recipientId',
              latest_event.recipient_id,

              'metaConversationId',
              latest_event.meta_conversation_id,

              'pricing',
              latest_event.pricing,

              'errors',
              latest_event.errors
            )
        WHERE id = NEW.id;
      END IF;


      RETURN NEW;
    END;
    $$;


    CREATE TRIGGER
      messages_reconcile_status_after_insert
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION
      reconcile_message_status_after_message_insert();
  `);
};


export const down = (pgm) => {
  pgm.sql(`
    DROP TRIGGER IF EXISTS
      messages_reconcile_status_after_insert
      ON messages;

    DROP FUNCTION IF EXISTS
      reconcile_message_status_after_message_insert();

    DROP TABLE IF EXISTS
      message_status_events;

    ALTER TABLE messages
      DROP CONSTRAINT IF EXISTS
        messages_delivery_status_check;

    ALTER TABLE messages
      DROP COLUMN IF EXISTS
        delivery_metadata,
      DROP COLUMN IF EXISTS
        status_updated_at,
      DROP COLUMN IF EXISTS
        delivery_status;
  `);
};