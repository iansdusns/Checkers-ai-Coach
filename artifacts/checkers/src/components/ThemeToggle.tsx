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
        relative w-9 h-9 rounded-xl border border-white/25 dark:border-white/10
        glass
        flex items-center justify-center
        text-muted-foreground hover:text-foreground
        transition-colors duration-150
        active:scale-95
      "
      aria-label="Toggle theme"
      data-testid="button-theme-toggle"
    >
      <AnimatedIcon theme={theme} />
    </button>
  );
}

function AnimatedIcon({ theme }: { theme: "light" | "dark" }) {
  return (
    <motion.div
      key={theme}
      initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
    </motion.div>
  );
}
