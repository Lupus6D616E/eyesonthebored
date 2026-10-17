import type {EyesServer} from "eyesonthebored-server/src"
import { treaty } from "@elysia/eden"
import { tokenItem } from "./auth-client"
export const server = treaty<EyesServer>('localhost:3000', {
  headers: async () => {
    const token = await tokenItem.getValue();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  },
})