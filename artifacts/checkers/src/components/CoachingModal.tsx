import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, RefreshCw, X, Lightbulb, Star, Frown } from "lucide-react";
import { Player } from "@/lib/checkers";

interface CoachingModalProps {
  open: boolean;
  winner: Player;
  playerColor: Player;
  tips: string[];
  onRestart: () => void;
  onMenu: () => void;
  onClose: () => void;
}

const tipIcons = ["💡", "🎯", "♟", "👑", "🔗", "⚠️", "✅"];

export function CoachingModal({
  open,
  winner,
  playerColor,
  tips,
  onRestart,
  onMenu,
  onClose,
}: CoachingModalProps) {
  const playerWon = winner === playerColor;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-md"
          onClick={onClose}
          data-testid="coaching-modal-backdrop"
        >
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="
              relative w-full sm:max-w-md
              glass-strong
              rounded-t-3xl sm:rounded-3xl
              overflow-hidden
            "
            onClick={(e) => e.stopPropagation()}
            data-testid="coaching-modal"
          >
            {/* Gradient header */}
            <div className={`
              relative px-6 pt-7 pb-6 text-center overflow-hidden
              ${playerWon
                ? "bg-gradient-to-br from-amber-500/15 via-yellow-400/8 to-transparent"
                : "bg-gradient-to-br from-violet-600/15 via-purple-500/8 to-transparent"
              }
            `}>
              {/* Decorative rings */}
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full border border-white/10" />
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full border border-white/8" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                data-testid="button-close-coaching"
              >
                <X size={14} />
              </button>

              <motion.div
                initial={{ scale: 0.5, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.1, stiffness: 240, damping: 18 }}
                className={`
                  inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 mx-auto shadow-2xl
                  ${playerWon
                    ? "bg-gradient-to-br from-amber-400 to-orange-600 shadow-amber-500/40"
                    : "bg-gradient-to-br from-violet-500 to-purple-800 shadow-violet-500/40"
                  }
                `}
              >
                {playerWon
                  ? <Trophy size={30} className="text-white" />
                  : <TrendingUp size={30} className="text-white" />
                }
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-bold text-foreground mb-1.5"
              >
                {playerWon ? "Victory! 🎉" : "Tough Game"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-muted-foreground"
              >
                {playerWon
                  ? "You outplayed the AI. Here's what made you great."
                  : "The AI got you this time. Here's your coaching report."}
              </motion.p>
            </div>

            {/* Tips */}
            <div className="px-5 pb-6 space-y-2.5 max-h-[50vh] overflow-y-auto">
              <div className="flex items-center gap-2 py-2">
                <Lightbulb size={13} className="text-primary flex-shrink-0" />
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                  AI Coaching Analysis
                </p>
              </div>

              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 + i * 0.07, type: "spring", stiffness: 280, damping: 24 }}
                  className="flex gap-3 p-3 rounded-2xl bg-muted/40 border border-border/40"
                  data-testid={`coaching-tip-${i}`}
                >
                  <span className="text-base flex-shrink-0 mt-0.5">{tipIcons[i % tipIcons.length]}</span>
                  <p className="text-sm text-foreground/90 leading-relaxed">{tip}</p>
                </motion.div>
              ))}

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 + tips.length * 0.07 }}
                className="flex flex-col gap-2 pt-2"
              >
                <button
                  onClick={onRestart}
                  className={`
                    w-full py-3.5 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2
                    transition-all duration-150 active:scale-[0.98] text-white shadow-lg
                    ${playerWon
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/25 hover:from-amber-400 hover:to-orange-500"
                      : "bg-gradient-to-r from-violet-600 to-purple-700 shadow-violet-500/25 hover:from-violet-500 hover:to-purple-600"
                    }
                  `}
                  data-testid="button-play-again"
                >
                  <RefreshCw size={15} />
                  Play Again
                </button>
                <button
                  onClick={onMenu}
                  className="
                    w-full py-2.5 px-4 rounded-2xl text-xs font-medium text-muted-foreground
                    hover:text-foreground hover:bg-muted/40 transition-all duration-150
                  "
                  data-testid="button-menu-from-modal"
                >
                  Main Menu
                </button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
