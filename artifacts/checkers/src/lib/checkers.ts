export type Player = "red" | "black";

export interface Piece {
  player: Player;
  isKing: boolean;
}

export type Board = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captures: Position[];
}

export interface GameEvent {
  type: "missed_capture" | "exposed_king" | "king_promoted" | "multi_jump" | "piece_lost" | "good_move";
  message: string;
  detail?: string;
}

export function createInitialBoard(): Board {
  const board: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: "black", isKing: false };
      }
    }
  }

  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { player: "red", isKing: false };
      }
    }
  }

  return board;
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function getJumpsFrom(
  board: Board,
  pos: Position,
  piece: Piece,
  alreadyCaptured: Position[] = []
): Move[] {
  const moves: Move[] = [];
  const directions = getDirections(piece);

  for (const [dr, dc] of directions) {
    const midRow = pos.row + dr;
    const midCol = pos.col + dc;
    const toRow = pos.row + dr * 2;
    const toCol = pos.col + dc * 2;

    if (!inBounds(toRow, toCol)) continue;

    const midPiece = board[midRow][midCol];
    if (!midPiece || midPiece.player === piece.player) continue;

    const alreadyCapturing = alreadyCaptured.some(
      (c) => c.row === midRow && c.col === midCol
    );
    if (alreadyCapturing) continue;

    if (board[toRow][toCol] !== null) continue;

    moves.push({
      from: pos,
      to: { row: toRow, col: toCol },
      captures: [...alreadyCaptured, { row: midRow, col: midCol }],
    });
  }

  return moves;
}

function getDirections(piece: Piece): [number, number][] {
  if (piece.isKing) return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  if (piece.player === "red") return [[-1, -1], [-1, 1]];
  return [[1, -1], [1, 1]];
}

function getSimpleMoves(board: Board, pos: Position, piece: Piece): Move[] {
  const moves: Move[] = [];
  const directions = getDirections(piece);

  for (const [dr, dc] of directions) {
    const toRow = pos.row + dr;
    const toCol = pos.col + dc;
    if (inBounds(toRow, toCol) && board[toRow][toCol] === null) {
      moves.push({ from: pos, to: { row: toRow, col: toCol }, captures: [] });
    }
  }
  return moves;
}

export function getAllMoves(board: Board, player: Player): Move[] {
  const jumpMoves: Move[] = [];
  const simpleMoves: Move[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (!piece || piece.player !== player) continue;
      const pos = { row, col };
      const jumps = getJumpsFrom(board, pos, piece);
      jumpMoves.push(...jumps);
      if (jumps.length === 0) {
        simpleMoves.push(...getSimpleMoves(board, pos, piece));
      }
    }
  }

  return jumpMoves.length > 0 ? jumpMoves : simpleMoves;
}

export function getMovesFrom(board: Board, pos: Position): Move[] {
  const piece = board[pos.row][pos.col];
  if (!piece) return [];

  const allMoves = getAllMoves(board, piece.player);
  const hasJumps = allMoves.some((m) => m.captures.length > 0);

  if (hasJumps) {
    return allMoves.filter(
      (m) =>
        m.from.row === pos.row &&
        m.from.col === pos.col &&
        m.captures.length > 0
    );
  }

  return allMoves.filter(
    (m) => m.from.row === pos.row && m.from.col === pos.col
  );
}

export function applyMove(board: Board, move: Move): Board {
  const newBoard = board.map((row) => [...row]);
  const piece = newBoard[move.from.row][move.from.col]!;

  newBoard[move.from.row][move.from.col] = null;

  for (const cap of move.captures) {
    newBoard[cap.row][cap.col] = null;
  }

  const promoted =
    (!piece.isKing &&
      piece.player === "red" &&
      move.to.row === 0) ||
    (!piece.isKing &&
      piece.player === "black" &&
      move.to.row === 7);

  newBoard[move.to.row][move.to.col] = {
    player: piece.player,
    isKing: piece.isKing || promoted,
  };

  return newBoard;
}

export function getWinner(board: Board): Player | null {
  const redMoves = getAllMoves(board, "red");
  const blackMoves = getAllMoves(board, "black");

  let redCount = 0;
  let blackCount = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.player === "red") redCount++;
      if (board[r][c]?.player === "black") blackCount++;
    }
  }

  if (redCount === 0 || redMoves.length === 0) return "black";
  if (blackCount === 0 || blackMoves.length === 0) return "red";
  return null;
}

function evaluateBoard(board: Board): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const baseValue = piece.isKing ? 3 : 1;
      const centerBonus = Math.abs(3.5 - c) < 2 ? 0.1 : 0;
      const advanceBonus =
        piece.player === "black"
          ? (r / 7) * 0.3
          : ((7 - r) / 7) * 0.3;
      const val = baseValue + centerBonus + advanceBonus;
      score += piece.player === "black" ? val : -val;
    }
  }
  return score;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): number {
  const winner = getWinner(board);
  if (winner === "black") return 1000;
  if (winner === "red") return -1000;
  if (depth === 0) return evaluateBoard(board);

  const player: Player = maximizing ? "black" : "red";
  const moves = getAllMoves(board, player);

  if (moves.length === 0) return maximizing ? -1000 : 1000;

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const next = applyMove(board, move);
      const ev = minimax(next, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, ev);
      alpha = Math.max(alpha, ev);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const next = applyMove(board, move);
      const ev = minimax(next, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, ev);
      beta = Math.min(beta, ev);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getAIMove(
  board: Board,
  difficulty: "easy" | "medium"
): Move | null {
  const moves = getAllMoves(board, "black");
  if (moves.length === 0) return null;

  if (difficulty === "easy") {
    const jumps = moves.filter((m) => m.captures.length > 0);
    const pool = jumps.length > 0 ? jumps : moves;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const next = applyMove(board, move);
    const score = minimax(next, 4, -Infinity, Infinity, false);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export function analyzeGameEvents(
  board: Board,
  move: Move,
  player: Player,
  prevBoard: Board
): GameEvent[] {
  const events: GameEvent[] = [];
  const piece = prevBoard[move.from.row][move.from.col];

  if (!piece) return events;

  const allMoves = getAllMoves(prevBoard, player);
  const availableCaptures = allMoves.filter((m) => m.captures.length > 0);
  if (availableCaptures.length > 0 && move.captures.length === 0) {
    events.push({
      type: "missed_capture",
      message: "Missed capture opportunity",
      detail: "You could have captured an opponent's piece but chose not to.",
    });
  }

  const newBoard = applyMove(board, move);
  const opponentMoves = getAllMoves(newBoard, player === "red" ? "black" : "red");
  const newPiece = newBoard[move.to.row][move.to.col];
  if (newPiece?.isKing) {
    for (const oppMove of opponentMoves) {
      if (oppMove.captures.some(
        (c) => c.row === move.to.row && c.col === move.to.col
      )) {
        events.push({
          type: "exposed_king",
          message: "King exposed to capture",
          detail: "Your king is now in a position where it can be captured on the next move.",
        });
        break;
      }
    }
  }

  if (move.captures.length > 1) {
    events.push({
      type: "multi_jump",
      message: "Multi-jump executed!",
      detail: `You captured ${move.captures.length} pieces in a single turn.`,
    });
  }

  const promoted =
    (!piece.isKing && piece.player === "red" && move.to.row === 0) ||
    (!piece.isKing && piece.player === "black" && move.to.row === 7);
  if (promoted) {
    events.push({
      type: "king_promoted",
      message: "King promoted!",
      detail: "Your piece has been crowned king and can now move in all directions.",
    });
  }

  return events;
}

export function generateCoachingTips(
  events: GameEvent[],
  winner: Player,
  playerColor: Player
): string[] {
  const tips: string[] = [];
  const playerWon = winner === playerColor;

  const missedCaptures = events.filter((e) => e.type === "missed_capture").length;
  const exposedKings = events.filter((e) => e.type === "exposed_king").length;
  const multiJumps = events.filter((e) => e.type === "multi_jump").length;
  const promotions = events.filter((e) => e.type === "king_promoted").length;

  if (missedCaptures > 0) {
    tips.push(`You missed ${missedCaptures} capture ${missedCaptures === 1 ? "opportunity" : "opportunities"} — in checkers, captures are mandatory when available.`);
  }

  if (exposedKings > 0) {
    tips.push(`${exposedKings === 1 ? "A move" : "Some moves"} exposed your king to capture. Protect your kings — they're your most powerful pieces.`);
  }

  if (multiJumps > 0) {
    tips.push(`Great work executing ${multiJumps} multi-jump ${multiJumps === 1 ? "combo" : "combos"}! Chain captures are the key to dominating the board.`);
  }

  if (promotions > 0) {
    tips.push(`You successfully promoted ${promotions} ${promotions === 1 ? "piece" : "pieces"} to king. Advancing pieces aggressively is a sign of strong play.`);
  }

  if (playerWon) {
    tips.push("Excellent game! You controlled the board and outplayed your opponent strategically.");
    if (missedCaptures === 0) {
      tips.push("You never missed a capture — perfect rule compliance and tactical awareness.");
    }
  } else {
    tips.push("Tough loss. Focus on controlling the center of the board to limit your opponent's options.");
    tips.push("Try to always think 2-3 moves ahead, anticipating your opponent's responses.");
  }

  if (tips.length === 0) {
    tips.push(playerWon ? "Solid performance! Keep studying opening theory to improve further." : "Keep practicing! Every game teaches you something new.");
  }

  return tips;
}
