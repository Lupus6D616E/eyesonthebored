import Elysia, { t } from "elysia";
import { betterAuthPlugin } from "../../lib/auth";
import { db } from "#db/db";
import { meets } from "#db/schema";
import { secureRandomString } from "#lib/rand-string";
import { eq, and, desc } from "drizzle-orm";
export const hostPlugin = new Elysia({ prefix: "/host" })
    .use(betterAuthPlugin)
    .get("/meeting/list", async ({ user, status }) => {
        const res = await db
            .select({
                title: meets.name,
                id: meets.id,
                code: meets.code
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