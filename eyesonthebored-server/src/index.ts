import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth, betterAuthPlugin } from "./lib/auth";
import { hostPlugin } from "#modules/host/controller";
import { EventEmitter } from 'node:events'
import { db } from "#db/db";
import { meetsLog, meets } from "#db/schema";
import { eq, and, desc } from "drizzle-orm";


const app = new Elysia()
  .use(
    cors({
      origin: "chrome-extension://jokdphedbajhckchmojbgnnbmkoecnec",
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["set-auth-token"],
    })
  )
  .use(betterAuthPlugin)
  .use(hostPlugin)
  .get("/hello", () => "hello")
  .get("/me", ({ user }) => user, { auth: true })
  .post("/ack", ({ body }) => {
    return body;
  }, {
    body: t.Object({
      attendanceCode: t.String()
    })
  })
  .post("/monitor", async ({ server,request,body, status }) => {
    const check = await db
      .select({
        active: meets.status
      })
      .from(meets)
      .where(eq(meets.code, body.code))
      const ip = server?.requestIP(request)
    if (check.length === 1) {
      if (check[0].active === "enabled") {
          const res = await db.insert(meetsLog).values({
          userId: body.id,
          name: body.name,
          url: body.url,
          tab: body.tab,
          idle: body.idle,
          code: body.code,
          ip: ip?.address ?? "No IP?",
          windowFocus: body.windowFocus
        }).returning()
        console.log("hello")
        return status(201)
      }
      else{
        return status(403)
      }
    }
    else{
      return status(404)
    }
    

  }, {
    body: t.Object({
      name: t.String(),
      code: t.String(),
      id: t.String(),
      url: t.String(),
      tab: t.String(),
      idle: t.Union([
        t.Literal('idle'),
        t.Literal('active'),
        t.Literal('locked')
      ]),
      windowFocus: t.Boolean()
    })
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type EyesServer = typeof app