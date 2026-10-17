import { createAuthClient } from "better-auth/react"

export const tokenItem = storage.defineItem<string | null>("local:authToken", {
    fallback: null,
});

export const authClient = createAuthClient({
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: "http://localhost:3000/auth/api",
    fetchOptions: {
        auth: {
            type: "Bearer",
            token: async () => (await tokenItem.getValue()) ?? "",
        },
        onSuccess: async (ctx) => {
            const token = ctx.response.headers.get("set-auth-token");
            if (token) await tokenItem.setValue(token);
          
        },
    },
})  