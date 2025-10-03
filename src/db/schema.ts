import { sql, type SQL } from "drizzle-orm";
import {
  char,
  check,
  doublePrecision,
  integer,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core";

export const technologiesTable = pgTable(
  "technologies",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    description: varchar({ length: 2048 }).notNull(),
    x: doublePrecision().notNull(),
    y: doublePrecision().notNull(),
    angle: doublePrecision()
      .generatedAlwaysAs(
        (): SQL =>
          sql`((ROUND(DEGREES(ATAN2(0.5 - ${technologiesTable.y}, ${technologiesTable.x} - 0.5)))::int % 360 + 360) % 360)`,
      )
      .notNull(),
    radius: doublePrecision()
      .generatedAlwaysAs(
        (): SQL =>
          sql`SQRT(POW(${technologiesTable.x} - 0.5, 2) + POW(0.5 - ${technologiesTable.y}, 2))`,
      )
      .notNull(),
    org: char({ length: 31 }).notNull(),
  },
  (table) => [
    // we only do the checks on the generated fields as they are easier to write
    check("angle_check", sql`${table.angle} >= 0 AND ${table.angle} < 360`),
    check("radius_check", sql`${table.radius} > 0 AND ${table.radius} <= 1`),
  ],
);

export type SelectTechnology = typeof technologiesTable.$inferSelect;
