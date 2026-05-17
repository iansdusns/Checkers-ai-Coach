import { motion } from "framer-motion";
import { RefreshCw, Cpu, CircleDot, Crown } from "lucide-react";
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
  onDifficultyChange: (d: Difficulty) => void;
}

function PieceCounter({ count, color, label }: { count: number; color: "red" | "black"; label: string }) {
  const pieces = Array.from({ length: 12 }, (_, i) => i < count);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${color === "red" ? "bg-red-500" : "bg-gray-700 dark:bg-gray-400"}`} />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="ml-auto text-sm font-bold text-foreground">{count}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {pieces.map((alive, i) => (
          <motion.div
            key={i}
            animate={{ scale: alive ? 1 : 0, opacity: alive ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`
              w-4 h-4 rounded-full
              ${color === "red"
                ? alive ? "bg-gradient-to-br from-red-400 to-red-700 shadow-sm" : "bg-transparent"
                : alive ? "bg-gradient-to-br from-gray-500 to-gray-800 shadow-sm" : "bg-transparent"
              }
            `}
          />
        ))}
      </div>
    </div>
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
  onDifficultyChange,
}: GamePanelProps) {
  const isYourTurn = status === "playing" && currentPlayer === playerColor;
  const isAITurn = status === "ai_thinking";

  const turnLabel = winner
    ? winner === playerColor
      ? "You Won!"
      : "AI Won"
    : isYourTurn
      ? "Your Turn"
      : isAITurn
        ? "AI Thinking..."
        : "Waiting...";

  const turnColor = winner
    ? winner === playerColor
      ? "text-amber-500 dark:text-amber-400"
      : "text-violet-500 dark:text-violet-400"
    : isYourTurn
      ? "text-green-500 dark:text-green-400"
      : "text-muted-foreground";

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Turn indicator */}
      <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Game Status</h3>
          <span className="text-xs text-muted-foreground font-mono">{moveCount} moves</span>
        </div>

        <motion.div
          key={turnLabel}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-xl font-bold mb-3 ${turnColor}`}
          data-testid="text-game-status"
        >
          {turnLabel}
        </motion.div>

        {!winner && (
          <div className="flex gap-3">
            {(["red", "black"] as Player[]).map((player) => (
              <div
                key={player}
                className={`
                  flex-1 flex items-center gap-2 p-2.5 rounded-xl transition-colors duration-200
                  ${currentPlayer === player && status !== "game_over"
                    ? "bg-primary/10 border border-primary/20"
                    : "bg-muted/40 border border-transparent"
                  }
                `}
              >
                <div className={`
                  w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center
                  ${player === "red"
                    ? "bg-gradient-to-br from-red-400 to-red-700"
                    : "bg-gradient-to-br from-gray-500 to-gray-800"
                  }
                `}>
                  {currentPlayer === player && status !== "game_over" && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-2 h-2 rounded-full bg-white/80"
                    />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground capitalize">
                    {player === playerColor ? "You" : "AI"}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize">{player}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Piece counts */}
      <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pieces</h3>
        <PieceCounter count={redCount} color="red" label="Red (You)" />
        <div className="h-px bg-border" />
        <PieceCounter count={blackCount} color="black" label="Black (AI)" />
      </div>

      {/* AI Difficulty */}
      <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Cpu size={13} className="text-muted-foreground" />
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Difficulty</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["easy", "medium"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => onDifficultyChange(d)}
              className={`
                py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-150
                capitalize active:scale-95
                ${difficulty === d
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }
              `}
              data-testid={`button-difficulty-${d}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Restart button */}
      <button
        onClick={onRestart}
        className="
          w-full py-3 px-4 rounded-2xl border border-border/60
          text-sm font-semibold text-foreground
          bg-card hover:bg-muted/50
          flex items-center justify-center gap-2
          transition-all duration-150 active:scale-[0.98]
          shadow-sm
        "
        data-testid="button-restart"
      >
        <RefreshCw size={15} />
        New Game
      </button>

      {/* Legend */}
      <div className="bg-card/50 border border-border/40 rounded-2xl p-4 space-y-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Legend</h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded-full bg-green-400/80" />
          <span>Valid move</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded-full bg-orange-400/80" />
          <span>Capture move</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="w-4 h-4 rounded-full bg-red-500 ring-2 ring-yellow-400 ring-offset-1 ring-offset-card flex items-center justify-center">
            <Crown size={8} className="text-yellow-200" fill="currentColor" />
          </div>
          <span>King piece</span>
        </div>
      </div>
    </div>
  );
}
