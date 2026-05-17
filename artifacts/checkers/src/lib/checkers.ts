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

export type EventType =
  | "missed_capture"
  | "exposed_king"
  | "king_promoted"
  | "multi_jump"
  | "good_capture"
  | "safe_advance";

export interface KeyMoment {
  turn: number;
  type: EventType;
  player: Player;
  from: Position;
  to: Position;
  captureCount: number;
  label: string;
  detail: string;
  impact: "positive" | "negative" | "neutral";
}

export interface GameSummary {
  winner: Player;
  playerWon: boolean;
  totalMoves: number;
  playerMoves: number;
  aiMoves: number;
  playerCaptures: number;
  aiCaptures: number;
  playerKingsPromoted: number;
  aiKingsPromoted: number;
  missedCaptures: number;
  exposedKings: number;
  multiJumps: number;
  performanceScore: number;
  grade: "S" | "A" | "B" | "C" | "D" | "F";
  keyMoments: KeyMoment[];
  tips: string[];
}

export function posToAlg(pos: Position): string {
  const col = String.fromCharCode(97 + pos.col);
  const row = 8 - pos.row;
  return `${col}${row}`;
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
    (!piece.isKing && piece.player === "red" && move.to.row === 0) ||
    (!piece.isKing && piece.player === "black" && move.to.row === 7);

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

export function analyzePlayerMove(
  board: Board,
  move: Move,
  player: Player,
  turn: number
): KeyMoment[] {
  const moments: KeyMoment[] = [];
  const piece = board[move.from.row][move.from.col];
  if (!piece) return moments;

  const allMoves = getAllMoves(board, player);
  const availableCaptures = allMoves.filter((m) => m.captures.length > 0);

  // Missed capture
  if (availableCaptures.length > 0 && move.captures.length === 0) {
    moments.push({
      turn,
      type: "missed_capture",
      player,
      from: move.from,
      to: move.to,
      captureCount: 0,
      label: "Missed capture",
      detail: `You skipped a forced capture at ${posToAlg(availableCaptures[0].from)}→${posToAlg(availableCaptures[0].to)}. Captures are mandatory in checkers.`,
      impact: "negative",
    });
  }

  // Multi-jump
  if (move.captures.length > 1) {
    moments.push({
      turn,
      type: "multi_jump",
      player,
      from: move.from,
      to: move.to,
      captureCount: move.captures.length,
      label: `${move.captures.length}× combo!`,
      detail: `Excellent chain capture — you removed ${move.captures.length} pieces in one turn from ${posToAlg(move.from)} to ${posToAlg(move.to)}.`,
      impact: "positive",
    });
  } else if (move.captures.length === 1) {
    moments.push({
      turn,
      type: "good_capture",
      player,
      from: move.from,
      to: move.to,
      captureCount: 1,
      label: "Capture",
      detail: `Captured an opponent piece — ${posToAlg(move.from)}→${posToAlg(move.to)}.`,
      impact: "positive",
    });
  }

  // King promotion
  const promoted =
    (!piece.isKing && player === "red" && move.to.row === 0) ||
    (!piece.isKing && player === "black" && move.to.row === 7);
  if (promoted) {
    moments.push({
      turn,
      type: "king_promoted",
      player,
      from: move.from,
      to: move.to,
      captureCount: 0,
      label: "King crowned!",
      detail: `Your piece at ${posToAlg(move.to)} was promoted to king — it can now move in all 4 directions.`,
      impact: "positive",
    });
  }

  // Exposed king check
  const newBoard = applyMove(board, move);
  const newPiece = newBoard[move.to.row][move.to.col];
  if (newPiece?.isKing) {
    const opponentMoves = getAllMoves(newBoard, player === "red" ? "black" : "red");
    const vulnerable = opponentMoves.some((m) =>
      m.captures.some((c) => c.row === move.to.row && c.col === move.to.col)
    );
    if (vulnerable) {
      moments.push({
        turn,
        type: "exposed_king",
        player,
        from: move.from,
        to: move.to,
        captureCount: 0,
        label: "King exposed",
        detail: `Moving your king to ${posToAlg(move.to)} puts it in immediate capture range. Protect your kings — they're your most valuable pieces.`,
        impact: "negative",
      });
    }
  }

  return moments;
}

function computeGrade(score: number): GameSummary["grade"] {
  if (score >= 90) return "S";
  if (score >= 78) return "A";
  if (score >= 62) return "B";
  if (score >= 46) return "C";
  if (score >= 30) return "D";
  return "F";
}

export function buildGameSummary(params: {
  winner: Player;
  playerColor: Player;
  totalMoves: number;
  playerMoves: number;
  aiMoves: number;
  playerCaptures: number;
  aiCaptures: number;
  playerKings: number;
  aiKings: number;
  keyMoments: KeyMoment[];
}): GameSummary {
  const {
    winner, playerColor, totalMoves,
    playerMoves, aiMoves,
    playerCaptures, aiCaptures,
    playerKings, aiKings,
    keyMoments,
  } = params;

  const playerWon = winner === playerColor;

  const missedCaptures = keyMoments.filter(
    (m) => m.player === playerColor && m.type === "missed_capture"
  ).length;
  const exposedKings = keyMoments.filter(
    (m) => m.player === playerColor && m.type === "exposed_king"
  ).length;
  const multiJumps = keyMoments.filter(
    (m) => m.player === playerColor && m.type === "multi_jump"
  ).length;

  // Score: starts at 50 (base), adjusted by game events
  let score = playerWon ? 65 : 35;
  score -= missedCaptures * 12;
  score -= exposedKings * 8;
  score += multiJumps * 10;
  score += playerKings * 5;
  score += Math.min(playerCaptures * 3, 15);
  // Efficiency bonus: fewer moves relative to captures
  if (playerMoves > 0 && playerCaptures / playerMoves > 0.3) score += 8;
  score = Math.max(0, Math.min(100, score));

  const grade = computeGrade(score);

  // Generate tips
  const tips: string[] = [];

  if (missedCaptures > 0) {
    tips.push(`You missed ${missedCaptures} mandatory capture${missedCaptures > 1 ? "s" : ""}. In standard checkers, if a capture is available you must take it — skipping one is an illegal move.`);
  }
  if (exposedKings > 0) {
    tips.push(`${exposedKings === 1 ? "One of your kings was" : `${exposedKings} of your kings were`} left exposed after a move. Always scan your opponent's captures before moving a king.`);
  }
  if (multiJumps > 0) {
    tips.push(`You executed ${multiJumps} chain capture${multiJumps > 1 ? "s" : ""}. Chain jumps are one of the strongest tactics in checkers — keep looking for them.`);
  }
  if (playerKings > 0) {
    tips.push(`You promoted ${playerKings} piece${playerKings > 1 ? "s" : ""} to king. Advancing aggressively is a hallmark of strong play.`);
  }
  if (!playerWon && aiCaptures > playerCaptures) {
    tips.push(`The AI captured ${aiCaptures - playerCaptures} more piece${aiCaptures - playerCaptures > 1 ? "s" : ""} than you. Prioritize piece safety — avoid leaving pieces undefended on the flanks.`);
  }
  if (missedCaptures === 0 && playerWon) {
    tips.push("Perfect capture compliance — you never skipped a forced capture. That's the foundation of flawless checkers play.");
  }

  // General strategic tips based on result
  if (!playerWon) {
    tips.push("Control the center. Pieces on d4, e4, d5, and e5 have the most diagonal options and are hardest to capture.");
    tips.push("Try to trade pieces only when it gives you a positional advantage — avoid exchanges that leave your side of the board open.");
  } else {
    tips.push("Great win! Try bumping the difficulty to Medium to face a deeper thinking AI opponent.");
  }

  // Trim to max 5 tips
  const finalTips = tips.slice(0, 5);

  return {
    winner,
    playerWon,
    totalMoves,
    playerMoves,
    aiMoves,
    playerCaptures,
    aiCaptures,
    playerKingsPromoted: playerKings,
    aiKingsPromoted: aiKings,
    missedCaptures,
    exposedKings,
    multiJumps,
    performanceScore: score,
    grade,
    keyMoments,
    tips: finalTips,
  };
}
