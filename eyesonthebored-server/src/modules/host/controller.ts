import Elysia, { t } from "elysia";
import { betterAuthPlugin } from "../../lib/auth";
import { db } from "#db/db";
import { meets, meetsLog } from "#db/schema";
import { secureRandomString } from "#lib/rand-string";
import { eq, and, desc } from "drizzle-orm";
export const hostPlugin = new Elysia({ prefix: "/host" })
    .use(betterAuthPlugin)
    .get("/meeting/list", async ({ user, status }) => {
        const res = await db
            .select({
                title: meets.name,
                id: meets.id,
                code: meets.code,
                status: meets.status
            })
            .from(meets)
            .where(
                eq(meets.userId, user.id)
            )
            .orderBy(desc(meets.createdAt))
        return res
    }, {
        auth: true
    })
    .post("/meeting/id/:id/settime", async ({ user, body, params: { id }, status }) => {
        const idNum = parseInt(id)
        const check = await db
            .select()
            .from(meets)
            .where(and(eq(meets.userId, user.id), eq(meets.id, idNum)))
        if (check.length < 1 || body.startTime.getTime() >= body.endTime.getTime()) {
            return status(400)
        }
        else {
            const res = await db
                .update(meets)
                .set({
                    meetStart: body.startTime,
                    meetEnd: body.endTime
                })
                .where(eq(meets.id, idNum))
        }
    }, {
        auth: true,
        body: t.Object({
            startTime: t.Date(),
            endTime: t.Date()
        })
    })
    .get("/meeting/id/:id/toggle", async ({ user, params: { id }, status }) => {
        const idNum = parseInt(id)
        const check = await db
            .select()
            .from(meets)
            .where(and(eq(meets.userId, user.id), eq(meets.id, idNum)))
        if (check.length < 1) {
            return status(400)
        }
        else {
            const state = check[0].status
            if (state === "enabled") {
                const res = await db
                    .update(meets)
                    .set({
                        status: "disabled"
                    })
                    .where(eq(meets.id, idNum))
                console.log("disabled")

                return status(200, "toggled")
            }
            else {
                const res = await db
                    .update(meets)
                    .set({
                        status: "enabled"
                    })
                    .where(eq(meets.id, idNum))
                console.log("enabled")

                return status(200, "toggled")
            }
        }
    }, {
        auth: true
    })
    .get("/meeting/id/:id", async ({ user, params: { id }, status }) => {
        const idNum = parseInt(id)
        const check = await db
            .select()
            .from(meets)
            .where(and(eq(meets.userId, user.id), eq(meets.id, idNum)))
        if (check.length < 1) {
            return status(400)
        }
        else {
            return check
        }
    }, {
        auth: true
    })
    .get("/meeting/id/:id/logs", async ({ user, params: { id }, status }) => {
        const idNum = parseInt(id)
        const check = await db
            .select()
            .from(meets)
            .where(and(eq(meets.userId, user.id), eq(meets.id, idNum)))
        if (check.length === 0) {
            return status(400)
        }
        else {
            const code = await db
                .select({
                    id: meetsLog.id,
                    timestamp: meetsLog.createdAt,
                    idle: meetsLog.idle,
                    name: meetsLog.name,
                    tab: meetsLog.tab,
                    userId: meetsLog.userId,
                    ip: meetsLog.ip,
                    url: meetsLog.url,
                    windowFocus: meetsLog.windowFocus
                })
                .from(meetsLog)
                .where(
                    eq(meetsLog.code, check[0].code)
                )

            console.log("result gotten lmao")
            return code
        }
    }, {
        auth: true
    })
    .post("/meeting/create", async ({ user, body, status }) => {
        let code = secureRandomString(6) + "-" + secureRandomString(6)
        let miracle = false
        do {
            const codeConflict = await db
                .select()
                .from(meets)
                .where(
                    eq(meets.code, code)
                )
            if (codeConflict.length > 0) {
                console.log("IT'S A GODDAMN MIRACLE!")
                code = secureRandomString(6) + "-" + secureRandomString(6)
                miracle = true
            } else {
                miracle = false
            }
        } while (miracle)
        const nameConflict = await db
            .select()
            .from(meets)
            .where(and(
                eq(meets.userId, user.id),
                eq(meets.name, body.name)
            ))
        if (nameConflict.length > 0) {
            console.log(nameConflict)
            return status(409, "Name Already Exists")
        }
        const res = await db.insert(meets)
            .values({
                name: body.name,
                userId: user.id,
                code: code
            }).returning()
        console.log(res)
        return {
            name: res[0].name,
            code: res[0].code,
            id: res[0].id,

        }
    }, {
        auth: true,
        body: t.Object({
            name: t.String({
                minLength: 1,
                maxLength: 100,
            })
        })
    })