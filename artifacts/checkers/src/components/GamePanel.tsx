import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Cpu, Zap, Shield, Crown, Swords } from "lucide-react";
import { Player } from "@/lib/checkers";
import { Difficulty } from "@/hooks/useGame";

interface GamePanelProps {
  currentPlayer: Player;
  playerColor: Player;
  status: string;
  winner: Player | null;
  difficulty: Difficulty;
  redCount: number;
  blackCount: number;
  moveCount: number;
  onRestart: () => void;
  onMenu: () => void;
  onDifficultyChange: (d: Difficulty) => void;
}

function MiniPiece({ color, alive }: { color: "red" | "black"; alive: boolean }) {
  return (
    <motion.div
      animate={{ scale: alive ? 1 : 0, opacity: alive ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`
        w-3.5 h-3.5 rounded-full flex-shrink-0
        ${color === "red"
          ? "bg-gradient-to-br from-rose-400 to-red-700 shadow-[0_2px_0_#7f1d1d]"
          : "bg-gradient-to-br from-slate-400 to-slate-800 shadow-[0_2px_0_#000]"
        }
      `}
    />
  );
}

export function GamePanel({
  currentPlayer,
  playerColor,
  status,
  winner,
  difficulty,
  redCount,
  blackCount,
  moveCount,
  onRestart,
  onMenu,
  onDifficultyChange,
}: GamePanelProps) {
  const isYourTurn  = status === "playing" && currentPlayer === playerColor;
  const isAITurn    = status === "ai_thinking";
  const isOver      = status === "game_over";
  const playerWon   = isOver && winner === playerColor;

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* Status card */}
      <div className="glass rounded-2xl p-4">
        <AnimatePresence mode="wait">
          {isOver ? (
            <motion.div
              key="over"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-1 text-center"
            >
              <span className="text-3xl mb-1">{playerWon ? "🏆" : "🤖"}</span>
              <p className={`text-lg font-bold ${playerWon ? "text-amber-500" : "text-violet-400"}`}>
                {playerWon ? "You Won!" : "AI Won"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{moveCount} total moves</p>
            </motion.div>
          ) : (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Status</p>
                <span className="text-[10px] font-mono text-muted-foreground">{moveCount} moves</span>
              </div>

              <div className="flex gap-2">
                {(["red", "black"] as Player[]).map((p) => {
                  const isActive = currentPlayer === p && !isOver;
                  const isYou    = p === playerColor;
                  return (
                    <div
                      key={p}
                      className={`
                        flex-1 flex items-center gap-2 p-2.5 rounded-xl border transition-all duration-300
                        ${isActive
                          ? "bg-primary/10 border-primary/25 shadow-sm"
                          : "bg-muted/30 border-transparent"
                        }
                      `}
                    >
                      <div className={`
                        relative w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center
                        ${p === "red"
                          ? "bg-gradient-to-br from-rose-400 to-red-700"
                          : "bg-gradient-to-br from-slate-400 to-slate-800"
                        }
                      `}>
                        {isActive && (
                          <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-white/30"
                          />
                        )}
                        {isAITurn && !isYou && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-[-3px] rounded-full border-2 border-primary border-t-transparent"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{isYou ? "You" : "AI"}</p>
                        <p className="text-[9px] text-muted-foreground capitalize">{p}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.p
                  key={isYourTurn ? "your" : isAITurn ? "ai" : "wait"}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className={`text-sm font-semibold mt-3 ${
                    isYourTurn ? "text-green-500 dark:text-green-400"
                    : isAITurn  ? "text-violet-500 dark:text-violet-400"
                    : "text-muted-foreground"
                  }`}
                  data-testid="text-game-status"
                >
                  {isYourTurn ? "Your Turn" : isAITurn ? "AI Thinking..." : "..."}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Piece counters */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Pieces</p>

        {([
          { label: "You (Red)",  color: "red"   as const, count: redCount   },
          { label: "AI (Black)", color: "black" as const, count: blackCount },
        ] as const).map(({ label, color, count }) => (
          <div key={color} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-bold text-foreground tabular-nums">{count}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: 12 }, (_, i) => (
                <MiniPiece key={i} color={color} alive={i < count} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Difficulty */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Cpu size={11} className="text-muted-foreground" />
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">AI Level</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {([
            { id: "easy" as Difficulty, label: "Easy", icon: Zap },
            { id: "medium" as Difficulty, label: "Medium", icon: Shield },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onDifficultyChange(id)}
              className={`
                py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5
                transition-all duration-150 active:scale-95
                ${difficulty === id
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              `}
              data-testid={`button-difficulty-${id}`}
            >
              <Icon size={11} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="glass rounded-2xl p-4 space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Legend</p>
        {[
          { color: "bg-violet-400/80", label: "Valid move" },
          { color: "bg-orange-400/80", label: "Capture move" },
          { color: "bg-amber-400/30 border border-amber-400/60", label: "Last move" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${color}`} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onRestart}
          className="
            w-full py-2.5 px-4 rounded-xl border border-border/50
            text-sm font-semibold text-foreground
            glass hover:bg-muted/30
            flex items-center justify-center gap-2
            transition-all duration-150 active:scale-[0.98]
          "
          data-testid="button-restart"
        >
          <RefreshCw size={13} />
          New Game
        </button>
        <button
          onClick={onMenu}
          className="
            w-full py-2.5 px-4 rounded-xl
            text-xs font-medium text-muted-foreground
            hover:text-foreground hover:bg-muted/30
            flex items-center justify-center gap-2
            transition-all duration-150
          "
          data-testid="button-menu"
        >
          <Swords size={12} />
          Main Menu
        </button>
      </div>
    </div>
  );
}
