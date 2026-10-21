import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import * as schema from "../db/schema"
import { db } from "../db/db";
import Elysia from "elysia";
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

export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .mount("/auth", auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        if (!session) return status(401);
        return { user: session.user, session: session.session };
      },
    },
  });
