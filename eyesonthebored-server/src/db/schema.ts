import { sqliteTable, integer, text} from "drizzle-orm/sqlite-core";
import { defineRelations, sql } from "drizzle-orm";
export * from "./auth-schema"
import { user } from "./auth-schema"
export const meets = sqliteTable("host_code", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => user.id),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  status: text("status",{
    enum: ["enabled", "disabled"],
  }).notNull()
    .default("disabled"),
  meetStart: integer("meet_start", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  meetEnd: integer("meet_end", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch('now', '+3 hours'))`)
});

export const meetsLog = sqliteTable("meet_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  tab: text("tab").notNull(),
  url: text("url").notNull(),
  idle: text("idle", {
    enum: ["idle", "active", "locked"],
  }).notNull(),
  ip: text("ip").notNull(),
  windowFocus: integer({ mode: 'boolean' }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
})
export const Relations = defineRelations({}, (r) => ({

}));
