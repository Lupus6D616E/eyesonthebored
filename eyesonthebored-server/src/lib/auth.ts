import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import * as schema from "../db/schema"
import { db } from "../db/db";
export const auth = betterAuth({
  basePath: "/api",
  plugins: [bearer()],
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema
  }),
  emailAndPassword: {
    enabled: true
  },
  trustedOrigins: [
    "chrome-extension://jokdphedbajhckchmojbgnnbmkoecnec",
  ],
})