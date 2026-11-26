import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const parkingReservations = pgTable(
  "parking_reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 80 }).notNull(),
    lotId: varchar("lot_id", { length: 48 }).notNull(),
    lotName: varchar("lot_name", { length: 100 }).notNull(),
    spotCode: varchar("spot_code", { length: 24 }).notNull(),
    status: varchar("status", { length: 16 }).notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("parking_reservations_username_status_idx").on(table.username, table.status),
    index("parking_reservations_lot_status_idx").on(table.lotId, table.status),
  ],
);
