import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth, betterAuthPlugin } from "./lib/auth";
import { hostPlugin } from "#modules/host/controller";
import { EventEmitter } from 'node:events'
import { db } from "#db/db";
import { meetsLog,meets } from "#db/schema";
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
  .post("/monitor", async ({ body }) => {
    console.log(body.name + "sent")
    const check = await db
    .select({
      active: meets.status
    })
    .from(meets)
    .where(eq(meets.code,body.code))
    if(check.length === 1){
      console.log(check[0].active)
    }
    const res = await db.insert(meetsLog).values({
      userId: body.id,
      name: body.name,
      tab: body.tab,
      idle: body.idle,
      code: body.code
    }).returning()
    console.log(res[0])
    const bus = new EventEmitter()
    bus.setMaxListeners(0)

  }, {
    body: t.Object({
      name: t.String(),
      code: t.String(),
      id: t.String(),
      tab: t.String(),
      idle: t.Union([
        t.Literal('idle'),
        t.Literal('active'),
        t.Literal('locked')
      ])
    })
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type EyesServer = typeof app