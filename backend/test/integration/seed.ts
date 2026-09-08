import { db } from "../../src/db.js";

/*
 * Datos sintéticos mínimos pero representativos: dos clientes con
 * vehículos, solicitudes de varios estados y servicios, conversaciones
 * ligadas por request_id y mensajes insertados a propósito en desorden.
 */

export type SeedResult = Awaited<ReturnType<typeof seed>>;

async function insert(sql: string, params: unknown[]): Promise<any> {
  const result = await db.query(sql, params);

  return result.rows[0];
}

export async function seed() {
  const ana = await insert(
    `INSERT INTO customers (name, phone, email)
     VALUES ($1, $2, $3) RETURNING *`,
    ["Ana Pérez", "+34600000001", "ana@example.test"]
  );

  const bruno = await insert(
    `INSERT INTO customers (name, phone, email)
     VALUES ($1, $2, $3) RETURNING *`,
    ["Bruno Gómez", "+34600000002", null]
  );

  const leon = await insert(
    `INSERT INTO vehicles (
       customer_id, vehicle_type, brand, model, year, engine,
       original_power, plate, vin
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [ana.id, "car", "Seat", "Leon", 2019, "2.0 TDI", "150cv", "1111AAA", "VINANA1"]
  );

  const a3 = await insert(
    `INSERT INTO vehicles (
       customer_id, vehicle_type, brand, model, year, engine, plate, vin
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [ana.id, "car", "Audi", "A3", 2016, "1.6 TDI", "3333CCC", "VINANA2"]
  );

  const bmw = await insert(
    `INSERT INTO vehicles (
       customer_id, vehicle_type, brand, model, year, engine, plate, vin
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [bruno.id, "car", "BMW", "320d", 2020, "2.0d", "2222BBB", "VINBRUNO"]
  );

  // Solicitud de Ana en manos de una persona.
  const requestHuman = await insert(
    `INSERT INTO requests (
       customer_id, vehicle_id, source, service_type, status,
       description, structured_data, missing_fields, summary_ai,
       created_at, updated_at, last_activity_at
     )
     VALUES ($1,$2,'whatsapp','REPROGRAMMING','HUMAN',$3,$4::jsonb,$5::jsonb,$6,
             '2026-08-01T09:00:00Z','2026-08-03T09:00:00Z','2026-08-03T09:00:00Z')
     RETURNING *`,
    [
      ana.id,
      leon.id,
      "Quiere subir potencia del Leon",
      JSON.stringify({ objetivo: "stage 1" }),
      JSON.stringify(["plate"]),
      "Cliente pide reprogramación stage 1",
    ]
  );

  // Solicitud antigua de Ana, ya cerrada.
  const requestClosed = await insert(
    `INSERT INTO requests (
       customer_id, vehicle_id, source, service_type, status,
       description, created_at, updated_at, last_activity_at, completed_at
     )
     VALUES ($1,$2,'whatsapp','ECU_REPAIR','CLOSED',$3,
             '2026-06-01T09:00:00Z','2026-06-10T09:00:00Z',
             '2026-06-10T09:00:00Z','2026-06-10T09:00:00Z')
     RETURNING *`,
    [ana.id, a3.id, "Centralita del A3 averiada"]
  );

  // Solicitud de Bruno todavía recogiendo datos.
  const requestCollecting = await insert(
    `INSERT INTO requests (
       customer_id, vehicle_id, source, service_type, status,
       description, missing_fields, created_at, updated_at, last_activity_at
     )
     VALUES ($1,$2,'whatsapp','ECU_CLONING','COLLECTING',$3,$4::jsonb,
             '2026-08-02T09:00:00Z','2026-08-02T10:00:00Z','2026-08-02T10:00:00Z')
     RETURNING *`,
    [
      bruno.id,
      bmw.id,
      "Necesita clonar la centralita del BMW",
      JSON.stringify(["vin", "year"]),
    ]
  );

  // Dos conversaciones de la misma solicitud, creadas en orden inverso.
  const conversationSegunda = await insert(
    `INSERT INTO conversations (
       customer_id, request_id, channel, bot_enabled,
       created_at, updated_at, last_message_at
     )
     VALUES ($1,$2,'whatsapp',false,
             '2026-08-03T09:00:00Z','2026-08-03T09:30:00Z','2026-08-03T09:30:00Z')
     RETURNING *`,
    [ana.id, requestHuman.id]
  );

  const conversationPrimera = await insert(
    `INSERT INTO conversations (
       customer_id, request_id, channel, bot_enabled,
       created_at, updated_at, last_message_at
     )
     VALUES ($1,$2,'whatsapp',false,
             '2026-08-01T09:00:00Z','2026-08-01T12:00:00Z','2026-08-01T12:00:00Z')
     RETURNING *`,
    [ana.id, requestHuman.id]
  );

  /*
   * Conversación de Ana sin solicitud asociada. El detalle de una solicitud
   * NO debe recogerla: la relación es por request_id, no por customer_id.
   */
  const conversationHuerfana = await insert(
    `INSERT INTO conversations (
       customer_id, request_id, channel, bot_enabled, created_at, updated_at
     )
     VALUES ($1, NULL, 'whatsapp', true,
             '2026-08-04T09:00:00Z','2026-08-04T09:00:00Z')
     RETURNING *`,
    [ana.id]
  );

  const conversationBruno = await insert(
    `INSERT INTO conversations (
       customer_id, request_id, channel, bot_enabled,
       created_at, updated_at, last_message_at
     )
     VALUES ($1,$2,'whatsapp',true,
             '2026-08-02T09:00:00Z','2026-08-02T10:00:00Z','2026-08-02T10:00:00Z')
     RETURNING *`,
    [bruno.id, requestCollecting.id]
  );

  // Mensajes insertados fuera de orden cronológico a propósito.
  const mensajes: Array<[string, string, string, string, string]> = [
    [conversationPrimera.id, "OUTBOUND", "tercero", "2026-08-01T11:00:00Z", "wamid.A3"],
    [conversationPrimera.id, "INBOUND", "primero", "2026-08-01T09:00:00Z", "wamid.A1"],
    [conversationPrimera.id, "OUTBOUND", "segundo", "2026-08-01T10:00:00Z", "wamid.A2"],
    [conversationSegunda.id, "INBOUND", "cuarto", "2026-08-03T09:00:00Z", "wamid.A4"],
  ];

  for (const [conversationId, direction, text, createdAt, providerId] of mensajes) {
    await db.query(
      `INSERT INTO messages (
         conversation_id, provider_message_id, direction, message_type,
         text_content, created_at
       )
       VALUES ($1,$2,$3,'TEXT',$4,$5)`,
      [conversationId, providerId, direction, text, createdAt]
    );
  }

  await db.query(
    `INSERT INTO messages (
       conversation_id, provider_message_id, direction, message_type,
       text_content, created_at
     )
     VALUES ($1,'wamid.B1','INBOUND','TEXT',$2,'2026-08-02T09:00:00Z')`,
    [conversationBruno.id, "dato-privado-de-bruno"]
  );

  await db.query(
    `INSERT INTO messages (
       conversation_id, provider_message_id, direction, message_type,
       text_content, created_at
     )
     VALUES ($1,'wamid.H1','INBOUND','TEXT',$2,'2026-08-04T09:00:00Z')`,
    [conversationHuerfana.id, "mensaje-sin-solicitud"]
  );

  return {
    ana,
    bruno,
    leon,
    a3,
    bmw,
    requestHuman,
    requestClosed,
    requestCollecting,
    conversationPrimera,
    conversationSegunda,
    conversationHuerfana,
    conversationBruno,
  };
}
