import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Cpu, Zap, Shield, ChevronRight, Crown } from "lucide-react";
import { Difficulty } from "@/hooks/useGame";

interface GameMenuProps {
  onStart: (difficulty: Difficulty) => void;
}

const difficulties = [
  {
    id: "easy" as Difficulty,
    label: "Easy",
    description: "Relaxed play — AI makes random moves",
    icon: Zap,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/8",
    border: "border-emerald-500/25 dark:border-emerald-500/20",
    iconColor: "text-emerald-500",
  },
  {
    id: "medium" as Difficulty,
    label: "Medium",
    description: "Strategic AI — thinks 4 moves ahead",
    icon: Shield,
    color: "from-violet-500 to-purple-700",
    bg: "bg-violet-500/10 dark:bg-violet-500/8",
    border: "border-violet-500/25 dark:border-violet-500/20",
    iconColor: "text-violet-500",
  },
];

export function GameMenu({ onStart }: GameMenuProps) {
  const [selected, setSelected] = useState<Difficulty>("medium");

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 24 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center min-h-screen mesh-bg px-4 py-12"
      data-testid="game-menu"
    >
      {/* Decorative orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 dark:bg-violet-600/15 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[400px] h-[400px] rounded-full bg-indigo-500/8 dark:bg-indigo-500/12 blur-[80px]" />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-purple-500/6 dark:bg-purple-500/10 blur-[60px]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8"
      >
        {/* Logo / Hero */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-5 text-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 blur-2xl scale-150" />
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-2xl shadow-violet-500/40 float-anim">
              <span className="text-4xl select-none">♟</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
              <Crown size={12} className="text-white" fill="currentColor" />
            </div>
          </div>

          <div>
            <h1 className="text-5xl font-bold tracking-tight text-foreground mb-2">
              <span className="gradient-text">Checkers</span>
            </h1>
            <p className="text-muted-foreground text-base font-medium">
              Challenge the AI. Master the board.
            </p>
          </div>
        </motion.div>

        {/* Difficulty selector */}
        <motion.div variants={itemVariants} className="w-full space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center mb-4">
            Choose Difficulty
          </p>
          {difficulties.map((diff) => {
            const Icon = diff.icon;
            const isSelected = selected === diff.id;
            return (
              <motion.button
                key={diff.id}
                onClick={() => setSelected(diff.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200
                  ${isSelected
                    ? `${diff.bg} ${diff.border} shadow-sm`
                    : "glass border-white/30 dark:border-white/8 hover:border-white/50 dark:hover:border-white/15"
                  }
                `}
                data-testid={`menu-difficulty-${diff.id}`}
              >
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isSelected
                    ? `bg-gradient-to-br ${diff.color} shadow-lg`
                    : "bg-muted"
                  }
                `}>
                  <Icon size={18} className={isSelected ? "text-white" : "text-muted-foreground"} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-semibold text-sm ${isSelected ? "text-foreground" : "text-foreground/80"}`}>
                    {diff.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{diff.description}</p>
                </div>
                <div className={`
                  w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                  ${isSelected
                    ? `bg-gradient-to-br ${diff.color} border-transparent`
                    : "border-muted-foreground/30"
                  }
                `}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Start button */}
        <motion.div variants={itemVariants} className="w-full">
          <motion.button
            onClick={() => onStart(selected)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="
              relative w-full py-4 rounded-2xl font-semibold text-base text-white overflow-hidden
              bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600
              bg-size-200 hover:bg-right
              shadow-xl shadow-violet-500/30
              transition-all duration-300
              flex items-center justify-center gap-3
            "
            data-testid="button-start-game"
            style={{ backgroundSize: "200% 100%" }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 opacity-0 hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3) 0%, transparent 60%)" }}
            />
            <Play size={18} className="relative z-10 fill-current" />
            <span className="relative z-10">Start Game</span>
            <ChevronRight size={16} className="relative z-10 opacity-70" />
          </motion.button>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          variants={itemVariants}
          className="w-full glass rounded-2xl p-4 flex items-center justify-around"
        >
          {[
            { label: "Pieces", value: "12 vs 12" },
            { label: "Board", value: "8×8" },
            { label: "Mode", value: "vs AI" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="text-sm font-bold text-foreground">{stat.value}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Powered by AI badge */}
        <motion.div variants={itemVariants} className="flex items-center gap-2 text-xs text-muted-foreground">
          <Cpu size={12} />
          <span>Powered by Minimax AI with alpha-beta pruning</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
