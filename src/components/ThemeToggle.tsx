import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border border-white/10 hover:border-indigo-500/50 bg-surface/50 hover:bg-surface text-slate-300 hover:text-white transition-all shadow-sm ${className}`}
      title={`Tema atual: ${theme === "dark" ? "Escuro" : theme === "light" ? "Claro" : "Sistema"}. Clique para alterar.`}
      aria-label="Alternar tema"
    >
      {theme === "dark" && <Moon size={18} className="text-indigo-400" />}
      {theme === "light" && <Sun size={18} className="text-amber-500" />}
      {theme === "system" && <Laptop size={18} className="text-sky-400" />}

      {showLabel && (
        <span className="ml-2 text-xs font-medium">
          {theme === "dark" ? "Escuro" : theme === "light" ? "Claro" : "Auto"}
        </span>
      )}
    </button>
  );
}
