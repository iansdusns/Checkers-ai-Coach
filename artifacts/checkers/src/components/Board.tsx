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
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        relative w-[78%] h-[78%] rounded-full flex items-center justify-center
        transition-transform duration-150
        ${isRed
          ? "bg-gradient-to-br from-red-400 to-red-700 shadow-[0_4px_0_0_#7f1d1d,0_2px_8px_rgba(0,0,0,0.4)]"
          : "bg-gradient-to-br from-gray-600 to-gray-900 shadow-[0_4px_0_0_#000,0_2px_8px_rgba(0,0,0,0.5)]"
        }
        ${isSelected
          ? "scale-110 ring-4 ring-yellow-400 ring-offset-2 ring-offset-transparent"
          : "hover:scale-105"
        }
        ${piece.isKing ? "ring-2 ring-yellow-400 ring-offset-1 ring-offset-transparent" : ""}
        cursor-pointer select-none
      `}
      data-testid={`piece-${piece.player}${piece.isKing ? "-king" : ""}`}
    >
      {piece.isKing && (
        <div className={`
          absolute inset-0 rounded-full
          ${isRed ? "bg-gradient-to-br from-red-300/30 to-transparent" : "bg-gradient-to-br from-gray-400/30 to-transparent"}
        `} />
      )}
      {piece.isKing && (
        <Crown
          size={14}
          className={`relative z-10 drop-shadow-sm ${isRed ? "text-yellow-200" : "text-yellow-300"}`}
          fill="currentColor"
          strokeWidth={1}
        />
      )}
      <div className={`
        absolute inset-[15%] rounded-full
        ${isRed
          ? "bg-gradient-to-br from-red-300/40 to-transparent"
          : "bg-gradient-to-br from-gray-500/40 to-transparent"
        }
      `} />
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
  const validToPositions = new Set(
    validMoves.map((m) => `${m.to.row},${m.to.col}`)
  );
  const isCapture = validMoves.some((m) => m.captures.length > 0);

  const isLastMoveCell = (row: number, col: number) => {
    if (!lastMove) return false;
    return (
      (lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row === row && lastMove.to.col === col)
    );
  };

  const isCaptured = (row: number, col: number) => {
    if (!lastMove) return false;
    return lastMove.captures.some((c) => c.row === row && c.col === col);
  };

  const rows = playerColor === "red" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const cols = playerColor === "red" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  return (
    <div className="relative">
      <div
        className="board-glow rounded-xl overflow-hidden border border-border/30"
        style={{ userSelect: "none" }}
        data-testid="checkers-board"
      >
        <div className="grid grid-cols-8" style={{ width: "min(80vw, 560px)", height: "min(80vw, 560px)" }}>
          {rows.map((row) =>
            cols.map((col) => {
              const isDark = (row + col) % 2 === 1;
              const piece = board[row][col];
              const isSelected =
                selectedCell?.row === row && selectedCell?.col === col;
              const isValidTarget = validToPositions.has(`${row},${col}`);
              const isLastMove = isLastMoveCell(row, col);
              const wasCaptured = isCaptured(row, col);

              return (
                <div
                  key={`${row}-${col}`}
                  className={`
                    relative flex items-center justify-center
                    transition-colors duration-100
                    ${isDark
                      ? "bg-[#4a3728] dark:bg-[#2d2018]"
                      : "bg-[#e8d5b0] dark:bg-[#c9b590]"
                    }
                    ${isLastMove && isDark ? "bg-[#6b5240] dark:bg-[#4a3228]" : ""}
                    ${disabled ? "cursor-default" : isDark ? "cursor-pointer" : "cursor-default"}
                  `}
                  onClick={() => isDark && !disabled && onCellClick({ row, col })}
                  data-testid={`cell-${row}-${col}`}
                >
                  {isLastMove && (
                    <div className="absolute inset-0 bg-yellow-500/15 pointer-events-none" />
                  )}

                  {isValidTarget && !piece && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className={`
                        absolute rounded-full z-10 pointer-events-none pulse-highlight
                        ${isCapture
                          ? "w-[55%] h-[55%] bg-orange-400/70 dark:bg-orange-500/70 ring-2 ring-orange-400"
                          : "w-[32%] h-[32%] bg-green-400/80 dark:bg-green-500/80"
                        }
                      `}
                    />
                  )}

                  {isValidTarget && piece && (
                    <div className="absolute inset-0 ring-4 ring-inset ring-orange-400/60 z-20 pointer-events-none rounded-none" />
                  )}

                  {wasCaptured && (
                    <motion.div
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-red-500/30 pointer-events-none"
                    />
                  )}

                  <AnimatePresence mode="popLayout">
                    {piece && (
                      <PieceComponent
                        key={`piece-${row}-${col}`}
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

      {/* Board coordinate labels */}
      <div className="absolute -left-5 top-0 h-full flex flex-col justify-around pointer-events-none">
        {rows.map((row) => (
          <span key={row} className="text-xs text-muted-foreground font-mono w-4 text-center">
            {8 - row}
          </span>
        ))}
      </div>
      <div className="absolute -bottom-5 left-0 w-full flex justify-around pointer-events-none">
        {cols.map((col) => (
          <span key={col} className="text-xs text-muted-foreground font-mono">
            {String.fromCharCode(97 + col)}
          </span>
        ))}
      </div>
    </div>
  );
}
