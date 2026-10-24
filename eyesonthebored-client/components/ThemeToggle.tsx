
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <label className="flex cursor-pointer items-center gap-3">
      <span className="text-sm font-medium">
        {theme === "dark" ? "Dark mode" : "Light mode"}
      </span>

      <input
        type="checkbox"
        className="toggle toggle-primary"
        checked={theme === "dark"}
        onChange={() => void toggleTheme()}
        aria-label="Toggle dark mode"
      />
    </label>
  );
}
