import type {EyesServer} from "eyesonthebored-server/src"
import { treaty } from "@elysia/eden"
import { tokenItem } from "./auth-client"
const apiUrl = import.meta.env.WXT_API_URL!
export const server = treaty<EyesServer>(apiUrl, {
  headers: async () => {
    const token = await tokenItem.getValue();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  },
})