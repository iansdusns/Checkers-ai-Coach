import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="
        relative w-10 h-10 rounded-xl border border-border/60
        bg-card hover:bg-muted/60
        flex items-center justify-center
        transition-colors duration-150
        text-muted-foreground hover:text-foreground
        shadow-sm
      "
      aria-label="Toggle theme"
      data-testid="button-theme-toggle"
    >
      <motion.div
        key={theme}
        initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
      </motion.div>
    </button>
  );
}
