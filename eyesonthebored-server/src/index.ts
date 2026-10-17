import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "./lib/auth";




const betterAuth = new Elysia({ name: "better-auth" })
  .mount("/auth",auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        if (!session) return status(401);
        return { user: session.user, session: session.session };
      },
    },
  });


const app = new Elysia()
  .use(
    cors({
      origin: "chrome-extension://jokdphedbajhckchmojbgnnbmkoecnec",
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["set-auth-token"],
    })
  )
  .use(betterAuth)
  .get("/hello",() => "hello")
  .get("/me", ({ user }) => user, { auth: true })
  .post("/ack", ({ body }) => {
    return body;
  }, {
    body: t.Object({
      attendanceCode: t.String()
    })
  })
  .post("/monitor", ({ body }) => {
    console.log(body)
  }, {
    body: t.Object({
      name: t.String(),
      code: t.String(),
      id: t.String(),
      tab: t.String(),
      idle: t.String()

    })
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

export type EyesServer = typeof app