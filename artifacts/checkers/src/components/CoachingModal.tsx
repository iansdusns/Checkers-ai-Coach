import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, RefreshCw, X, Lightbulb } from "lucide-react";
import { Player } from "@/lib/checkers";

interface CoachingModalProps {
  open: boolean;
  winner: Player;
  playerColor: Player;
  tips: string[];
  onRestart: () => void;
  onClose: () => void;
}

export function CoachingModal({
  open,
  winner,
  playerColor,
  tips,
  onRestart,
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          data-testid="coaching-modal-backdrop"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md bg-card border border-card-border rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            data-testid="coaching-modal"
          >
            {/* Header gradient */}
            <div className={`
              relative px-6 pt-8 pb-6 text-center overflow-hidden
              ${playerWon
                ? "bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-transparent"
                : "bg-gradient-to-br from-violet-600/20 via-purple-500/10 to-transparent"
              }
            `}>
              <div className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: "radial-gradient(circle at 50% 0%, white 0%, transparent 70%)"
                }}
              />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                data-testid="button-close-coaching"
              >
                <X size={16} />
              </button>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.1, stiffness: 200, damping: 15 }}
                className={`
                  inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto
                  ${playerWon
                    ? "bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/30"
                    : "bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg shadow-violet-500/30"
                  }
                `}
              >
                {playerWon
                  ? <Trophy size={28} className="text-white" />
                  : <TrendingUp size={28} className="text-white" />
                }
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-bold text-foreground mb-1"
              >
                {playerWon ? "Victory!" : "Good Game"}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-sm"
              >
                {playerWon
                  ? "You defeated the AI. Here's what went well."
                  : "The AI won this round. Here's how to improve."}
              </motion.p>
            </div>

            {/* Tips section */}
            <div className="px-6 pb-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={14} className="text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  AI Coaching Analysis
                </span>
              </div>

              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.08 }}
                  className="flex gap-3 p-3 rounded-xl bg-muted/60 border border-border/50"
                  data-testid={`coaching-tip-${i}`}
                >
                  <div className={`
                    flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 text-[10px] font-bold
                    ${playerWon ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-primary/20 text-primary"}
                  `}>
                    {i + 1}
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{tip}</p>
                </motion.div>
              ))}

              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + tips.length * 0.08 }}
                onClick={onRestart}
                className={`
                  w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
                  transition-all duration-150 active:scale-[0.98]
                  ${playerWon
                    ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:from-amber-400 hover:to-yellow-500 shadow-md shadow-amber-500/25"
                    : "bg-gradient-to-r from-primary to-violet-600 text-white hover:opacity-90 shadow-md shadow-primary/25"
                  }
                `}
                data-testid="button-play-again"
              >
                <RefreshCw size={15} />
                Play Again
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
