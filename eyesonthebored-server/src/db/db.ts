import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";


const sqlite = new Database("data.db"); // or ":memory:"
sqlite.run("PRAGMA journal_mode = WAL;"); // optional, but recommended

export const db = drizzle({
    client:sqlite,
    relations: {...schema.Relations, ...schema.authRelations}
})
