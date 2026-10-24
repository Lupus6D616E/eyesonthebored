
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  themeStorage,
  type Theme,
} from "@/lib/theme";

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    let mounted = true;

    // Apply the saved theme when this extension page opens.
    const unwatch = themeStorage.watch((value) => {
      if (!mounted) return;

      const nextTheme: Theme =
        value === "dark" ? "dark" : "light";

      setThemeState(nextTheme);
      applyTheme(nextTheme);
    });

    // Load persisted state asynchronously.
    themeStorage.getValue().then((value) => {
      if (!mounted) return;

      const initialTheme: Theme =
        value === "dark" ? "dark" : "light";

      setThemeState(initialTheme);
      applyTheme(initialTheme);
    });

    return () => {
      mounted = false;
      unwatch();
    };
  }, []);

  const setTheme = useCallback(async (nextTheme: Theme) => {
    // Update immediately for a responsive toggle.
    setThemeState(nextTheme);
    applyTheme(nextTheme);

    // Persist it and notify other extension pages.
    await themeStorage.setValue(nextTheme);
  }, []);

  const toggleTheme = useCallback(async () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    await setTheme(nextTheme);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === "dark",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
