import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { defineRelations, sql } from "drizzle-orm";
export * from "./auth-schema"
export const meets = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  code: text("code").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
export const Relations = defineRelations({}, (r) => ({

}));
