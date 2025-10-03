import { technologiesTable } from "./schema.ts";
import type { InsertTechnology } from "./validation.ts";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-serverless";
// import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { WebSocket } from "ws";

neonConfig.webSocketConstructor = WebSocket;
neonConfig.poolQueryViaFetch = true;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

if (import.meta.env.PROD) {
  // await migrate(db, { migrationsFolder: __dirname + "/drizzle" });
}

export class Repo {
  async createTechnology(technology: InsertTechnology) {
    const [result] = await db
      .insert(technologiesTable)
      .values(technology)
      .returning();

    if (!result) {
      throw new Error("Failed to create technology");
    }

    return result;
  }
  async getTechnologies(org: string) {
    return db
      .select()
      .from(technologiesTable)
      .where(eq(technologiesTable.org, org));
  }
  async getTechnology(id: number, org: string) {
    const [technology] = await db
      .select()
      .from(technologiesTable)
      .where(and(eq(technologiesTable.id, id), eq(technologiesTable.org, org)))
      .limit(1);
    return technology;
  }
}
