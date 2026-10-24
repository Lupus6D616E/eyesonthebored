
import { storage } from "#imports";

export type Theme = "light" | "dark";

export const themeStorage = storage.defineItem<Theme>(
  "local:theme",
  {
    fallback: "light",
  },
);
