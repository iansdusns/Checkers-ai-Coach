import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Board } from "@/components/Board";
import { GamePanel } from "@/components/GamePanel";
import { CoachingModal } from "@/components/CoachingModal";
import { GameMenu } from "@/components/GameMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useGame, Difficulty } from "@/hooks/useGame";

type Screen = "menu" | "game";

export default function Game() {
  const [screen, setScreen] = useState<Screen>("menu");
  const { state, selectCell, resetGame, setDifficulty } = useGame();
  const [showModal, setShowModal] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") return stored;
    } catch {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);

  useEffect(() => {
    if (state.status === "game_over") {
      const t = setTimeout(() => setShowModal(true), 700);
      return () => clearTimeout(t);
    } else {
      setShowModal(false);
    }
  }, [state.status, state.winner]);

  const handleStart = (diff: Difficulty) => {
    setDifficulty(diff);
    resetGame(diff);
    setScreen("game");
  };

  const handleMenu = () => {
    setShowModal(false);
    setScreen("menu");
  };

  const handleRestart = () => {
    setShowModal(false);
    resetGame();
  };

  const disabled =
    state.status !== "playing" || state.currentPlayer !== state.playerColor;

  return (
    <div className="relative min-h-screen mesh-bg" data-testid="game-page">
      {/* Fixed background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full bg-violet-600/8 dark:bg-violet-600/12 blur-[120px]" />
        <div className="absolute bottom-[-15%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-500/6 dark:bg-indigo-500/10 blur-[100px]" />
      </div>

      <AnimatePresence mode="wait">
        {screen === "menu" ? (
          <motion.div key="menu" className="relative z-10">
            <GameMenu onStart={handleStart} />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10 flex flex-col min-h-screen"
          >
            {/* Header */}
            <header className="glass border-b border-white/20 dark:border-white/8 sticky top-0 z-30">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                <button
                  onClick={handleMenu}
                  className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-bold">♟</span>
                  </div>
                  <span className="font-semibold text-sm text-foreground tracking-tight hidden sm:block">Checkers</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* AI thinking indicator */}
                  <AnimatePresence>
                    {state.status === "ai_thinking" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-violet-400/25"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          className="w-3 h-3 rounded-full border-2 border-violet-400 border-t-transparent"
                        />
                        <span className="text-xs font-medium text-violet-400">AI thinking</span>
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

            {/* Main layout */}
            <main className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-6 p-4 sm:p-6 max-w-5xl mx-auto w-full pt-6">

              {/* Board column */}
              <div className="flex flex-col items-center gap-4 w-full lg:flex-1">
                {/* Turn hint */}
                <AnimatePresence mode="wait">
                  <motion.p
                    key={state.status + state.currentPlayer + (state.selectedCell ? "sel" : "")}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    className="text-sm text-muted-foreground font-medium text-center h-5"
                  >
                    {state.status === "playing" && state.currentPlayer === state.playerColor && (
                      state.captureChain
                        ? "Continue your capture chain!"
                        : state.selectedCell
                          ? "Click a highlighted square to move"
                          : "Select a red piece to move"
                    )}
                    {state.status === "ai_thinking" && "Opponent is thinking..."}
                    {state.status === "game_over" && (
                      state.winner === state.playerColor
                        ? "Brilliant! You won 🎉"
                        : "AI wins. Better luck next time!"
                    )}
                  </motion.p>
                </AnimatePresence>

                {/* Board with labels spacing */}
                <div className="pl-7 pb-6">
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
              <div className="w-full lg:w-60 xl:w-64 flex-shrink-0">
                <GamePanel
                  currentPlayer={state.currentPlayer}
                  playerColor={state.playerColor}
                  status={state.status}
                  winner={state.winner}
                  difficulty={state.difficulty}
                  redCount={state.redCount}
                  blackCount={state.blackCount}
                  moveCount={state.moveCount}
                  onRestart={handleRestart}
                  onMenu={handleMenu}
                  onDifficultyChange={setDifficulty}
                />
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coaching modal */}
      {state.winner && (
        <CoachingModal
          open={showModal}
          winner={state.winner}
          playerColor={state.playerColor}
          tips={state.coachingTips}
          onRestart={handleRestart}
          onMenu={handleMenu}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
