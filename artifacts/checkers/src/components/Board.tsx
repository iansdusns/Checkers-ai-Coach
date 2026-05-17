import { Position, Move, Board as BoardType, Piece } from "@/lib/checkers";
import { motion, AnimatePresence } from "framer-motion";
import { Crown } from "lucide-react";

interface BoardProps {
  board: BoardType;
  selectedCell: Position | null;
  validMoves: Move[];
  lastMove: Move | null;
  onCellClick: (pos: Position) => void;
  disabled: boolean;
  playerColor: "red" | "black";
}

function PieceComponent({ piece, isSelected }: { piece: Piece; isSelected: boolean }) {
  const isRed = piece.player === "red";

  return (
    <motion.div
      layout
      initial={{ scale: 0.3, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 360, damping: 22 }}
      className={`
        relative w-[76%] h-[76%] rounded-full flex items-center justify-center
        select-none cursor-pointer transition-transform duration-100
        ${isRed
          ? [
              "bg-gradient-to-br from-rose-300 via-red-500 to-red-800",
              "shadow-[0_6px_0_0_#7f1d1d,0_4px_12px_rgba(0,0,0,0.4)]",
            ].join(" ")
          : [
              "bg-gradient-to-br from-slate-400 via-slate-600 to-slate-900",
              "shadow-[0_6px_0_0_#0f172a,0_4px_12px_rgba(0,0,0,0.5)]",
            ].join(" ")
        }
        ${isSelected
          ? "ring-[3px] ring-yellow-400 ring-offset-2 ring-offset-transparent scale-110 -translate-y-1"
          : "hover:scale-105 hover:-translate-y-0.5"
        }
        ${piece.isKing ? "king-pulse" : ""}
      `}
      data-testid={`piece-${piece.player}${piece.isKing ? "-king" : ""}`}
    >
      {/* Top highlight glare */}
      <div className={`
        absolute inset-0 rounded-full overflow-hidden pointer-events-none
      `}>
        <div className={`
          absolute top-[8%] left-[15%] w-[45%] h-[30%] rounded-full blur-sm opacity-60
          ${isRed ? "bg-rose-200" : "bg-slate-300"}
        `} />
      </div>

      {/* King crown */}
      {piece.isKing && (
        <div className="relative z-10 flex flex-col items-center justify-center">
          <Crown
            size={13}
            className={`drop-shadow-sm ${isRed ? "text-yellow-200" : "text-yellow-300"}`}
            fill="currentColor"
            strokeWidth={0.5}
          />
        </div>
      )}

      {/* Bottom shadow line */}
      <div className={`
        absolute bottom-[-8px] left-[10%] right-[10%] h-[6px] rounded-full blur-md opacity-60 pointer-events-none
        ${isRed ? "bg-red-900" : "bg-slate-900"}
      `} />
    </motion.div>
  );
}

function MoveHighlight({ isCapture }: { isCapture: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
    >
      {isCapture ? (
        <div className="relative w-[65%] h-[65%] flex items-center justify-center">
          <motion.div
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border-2 border-orange-400 dark:border-orange-400"
          />
          <div className="w-[55%] h-[55%] rounded-full bg-orange-400/70 dark:bg-orange-500/70" />
        </div>
      ) : (
        <motion.div
          animate={{ scale: [0.85, 1.0, 0.85], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="w-[36%] h-[36%] rounded-full bg-violet-400/80 dark:bg-violet-400/70 shadow-sm"
        />
      )}
    </motion.div>
  );
}

export function Board({
  board,
  selectedCell,
  validMoves,
  lastMove,
  onCellClick,
  disabled,
  playerColor,
}: BoardProps) {
  const validTargets = new Set(validMoves.map((m) => `${m.to.row},${m.to.col}`));
  const isCaptureMoves = validMoves.some((m) => m.captures.length > 0);

  const isLastFrom = (r: number, c: number) => lastMove?.from.row === r && lastMove?.from.col === c;
  const isLastTo   = (r: number, c: number) => lastMove?.to.row   === r && lastMove?.to.col   === c;
  const wasCaptured = (r: number, c: number) => lastMove?.captures.some((p) => p.row === r && p.col === c);

  const rows = playerColor === "red" ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
  const cols = playerColor === "red" ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];

  const BOARD_SIZE = "min(min(88vw, 88vh - 120px), 540px)";

  return (
    <div className="relative" style={{ width: BOARD_SIZE }}>
      {/* Row labels */}
      <div className="absolute -left-6 top-0 h-full flex flex-col pointer-events-none" style={{ width: BOARD_SIZE }}>
        {rows.map((row) => (
          <div key={row} className="flex-1 flex items-center">
            <span className="text-[10px] font-mono text-muted-foreground/60 w-4 text-right">{8 - row}</span>
          </div>
        ))}
      </div>

      {/* Board */}
      <div
        className="board-glow rounded-2xl overflow-hidden"
        style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
        data-testid="checkers-board"
      >
        <div className="grid grid-cols-8 w-full h-full">
          {rows.map((row) =>
            cols.map((col) => {
              const isDark     = (row + col) % 2 === 1;
              const piece      = board[row][col];
              const isSelected = selectedCell?.row === row && selectedCell?.col === col;
              const isTarget   = validTargets.has(`${row},${col}`);
              const isFrom     = isLastFrom(row, col);
              const isTo       = isLastTo(row, col);
              const captured   = wasCaptured(row, col);

              return (
                <div
                  key={`${row}-${col}`}
                  className={`
                    relative flex items-center justify-center transition-colors duration-75
                    ${isDark
                      ? "bg-[#5c4033] dark:bg-[#2e1f15]"
                      : "bg-[#edd9a3] dark:bg-[#c4a96e]"
                    }
                    ${isDark && (isFrom || isTo) ? "!bg-[#7a5c44] dark:!bg-[#4a2e1a]" : ""}
                    ${isDark && !disabled ? "cursor-pointer" : "cursor-default"}
                  `}
                  onClick={() => isDark && !disabled && onCellClick({ row, col })}
                  data-testid={`cell-${row}-${col}`}
                >
                  {/* Last move tint */}
                  {(isFrom || isTo) && (
                    <div className="absolute inset-0 bg-amber-400/20 dark:bg-amber-500/15 pointer-events-none" />
                  )}

                  {/* Captured flash */}
                  <AnimatePresence>
                    {captured && (
                      <motion.div
                        key="capture-flash"
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute inset-0 bg-red-500/50 pointer-events-none z-20"
                      />
                    )}
                  </AnimatePresence>

                  {/* Valid move highlight */}
                  <AnimatePresence>
                    {isTarget && <MoveHighlight key="highlight" isCapture={isCaptureMoves} />}
                  </AnimatePresence>

                  {/* Capturable piece ring */}
                  {isTarget && piece && (
                    <motion.div
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="absolute inset-0 ring-4 ring-inset ring-orange-400/70 pointer-events-none z-20"
                    />
                  )}

                  {/* Piece */}
                  <AnimatePresence mode="popLayout">
                    {piece && (
                      <PieceComponent
                        key={`${row}-${col}-${piece.player}-${piece.isKing}`}
                        piece={piece}
                        isSelected={isSelected}
                      />
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Col labels */}
      <div className="absolute -bottom-5 left-0 w-full flex pointer-events-none">
        {cols.map((col) => (
          <div key={col} className="flex-1 flex justify-center">
            <span className="text-[10px] font-mono text-muted-foreground/60">
              {String.fromCharCode(97 + col)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
