import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Board } from "@/components/Board";
import { GamePanel } from "@/components/GamePanel";
import { CoachingModal } from "@/components/CoachingModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useGame } from "@/hooks/useGame";

export default function Game() {
  const { state, selectCell, resetGame, setDifficulty } = useGame();
  const [showModal, setShowModal] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (state.status === "game_over") {
      const t = setTimeout(() => setShowModal(true), 600);
      return () => clearTimeout(t);
    } else {
      setShowModal(false);
    }
  }, [state.status, state.winner]);

  const disabled =
    state.status !== "playing" || state.currentPlayer !== state.playerColor;

  return (
    <div className="min-h-screen bg-background flex flex-col" data-testid="game-page">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground tracking-tight">Checkers</h1>
              <p className="text-[10px] text-muted-foreground -mt-0.5">Classic Strategy Game</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {state.status === "ai_thinking" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full"
                  />
                  <span className="text-xs font-medium text-primary">AI thinking</span>
                </motion.div>
              )}
            </AnimatePresence>

            <ThemeToggle
              theme={theme}
              onToggle={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center py-6 px-4 sm:px-6">
        <div className="w-full max-w-6xl">
          <div className="flex flex-col lg:flex-row items-start justify-center gap-6 lg:gap-8">

            {/* Board section */}
            <div className="flex flex-col items-center gap-4 w-full lg:flex-1">
              {/* Move instruction */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={state.status + state.currentPlayer}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="text-sm text-muted-foreground text-center h-5"
                >
                  {state.status === "playing" && state.currentPlayer === state.playerColor && (
                    state.selectedCell
                      ? "Click a highlighted square to move"
                      : state.captureChain
                        ? "Continue your capture chain!"
                        : "Select a piece to see valid moves"
                  )}
                  {state.status === "ai_thinking" && "AI is making its move..."}
                  {state.status === "game_over" && (
                    state.winner === state.playerColor ? "Congratulations! You won!" : "Better luck next time!"
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="pl-6 pb-6">
                <Board
                  board={state.board}
                  selectedCell={state.selectedCell}
                  validMoves={state.validMoves}
                  lastMove={state.lastMove}
                  onCellClick={selectCell}
                  disabled={disabled}
                  playerColor={state.playerColor}
                />
              </div>
            </div>

            {/* Side panel */}
            <div className="w-full lg:w-64 xl:w-72">
              <GamePanel
                currentPlayer={state.currentPlayer}
                playerColor={state.playerColor}
                status={state.status}
                winner={state.winner}
                difficulty={state.difficulty}
                redCount={state.redCount}
                blackCount={state.blackCount}
                moveCount={state.moveCount}
                onRestart={() => resetGame()}
                onDifficultyChange={setDifficulty}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Coaching modal */}
      <CoachingModal
        open={showModal}
        winner={state.winner!}
        playerColor={state.playerColor}
        tips={state.coachingTips}
        onRestart={() => { setShowModal(false); resetGame(); }}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
