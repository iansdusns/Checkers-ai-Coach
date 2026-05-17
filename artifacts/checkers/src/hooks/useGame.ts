import { useState, useCallback, useEffect, useRef } from "react";
import {
  Board,
  Player,
  Move,
  Position,
  KeyMoment,
  GameSummary,
  createInitialBoard,
  getAllMoves,
  getMovesFrom,
  applyMove,
  getWinner,
  getAIMove,
  analyzePlayerMove,
  buildGameSummary,
} from "@/lib/checkers";

export type Difficulty = "easy" | "medium";
export type GameStatus = "playing" | "ai_thinking" | "game_over";

export interface GameState {
  board: Board;
  currentPlayer: Player;
  selectedCell: Position | null;
  validMoves: Move[];
  status: GameStatus;
  winner: Player | null;
  playerColor: Player;
  difficulty: Difficulty;
  redCount: number;
  blackCount: number;
  moveCount: number;
  keyMoments: KeyMoment[];
  gameSummary: GameSummary | null;
  lastMove: Move | null;
  captureChain: Move | null;
  // running tallies
  playerMoves: number;
  aiMoves: number;
  playerCaptures: number;
  aiCaptures: number;
  playerKings: number;
  aiKings: number;
}

function countPieces(board: Board) {
  let red = 0;
  let black = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.player === "red") red++;
      if (board[r][c]?.player === "black") black++;
    }
  }
  return { red, black };
}

function wasKingPromoted(board: Board, move: Move, player: Player): boolean {
  const piece = board[move.from.row][move.from.col];
  if (!piece || piece.isKing) return false;
  return (
    (player === "red" && move.to.row === 0) ||
    (player === "black" && move.to.row === 7)
  );
}

const initialBoard = createInitialBoard();
const { red: initRed, black: initBlack } = countPieces(initialBoard);

function makeInitialState(difficulty: Difficulty = "medium"): GameState {
  return {
    board: createInitialBoard(),
    currentPlayer: "red",
    selectedCell: null,
    validMoves: [],
    status: "playing",
    winner: null,
    playerColor: "red",
    difficulty,
    redCount: initRed,
    blackCount: initBlack,
    moveCount: 0,
    keyMoments: [],
    gameSummary: null,
    lastMove: null,
    captureChain: null,
    playerMoves: 0,
    aiMoves: 0,
    playerCaptures: 0,
    aiCaptures: 0,
    playerKings: 0,
    aiKings: 0,
  };
}

export function useGame() {
  const [state, setState] = useState<GameState>(() => makeInitialState());
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetGame = useCallback((difficulty?: Difficulty) => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    setState((prev) => makeInitialState(difficulty ?? prev.difficulty));
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    setState((prev) => ({ ...prev, difficulty }));
  }, []);

  const selectCell = useCallback((pos: Position) => {
    setState((prev) => {
      if (prev.status !== "playing" || prev.currentPlayer !== prev.playerColor) return prev;

      const piece = prev.board[pos.row][pos.col];

      // Ongoing capture chain
      if (prev.captureChain) {
        const move = prev.validMoves.find(
          (m) => m.to.row === pos.row && m.to.col === pos.col
        );
        if (move) return executePlayerMove(prev, move);
        return prev;
      }

      // Cell already selected
      if (prev.selectedCell) {
        const move = prev.validMoves.find(
          (m) => m.to.row === pos.row && m.to.col === pos.col
        );
        if (move) return executePlayerMove(prev, move);
        if (piece && piece.player === prev.playerColor) {
          return { ...prev, selectedCell: pos, validMoves: getMovesFrom(prev.board, pos) };
        }
        return { ...prev, selectedCell: null, validMoves: [] };
      }

      // Fresh selection
      if (piece && piece.player === prev.playerColor) {
        return { ...prev, selectedCell: pos, validMoves: getMovesFrom(prev.board, pos) };
      }

      return prev;
    });
  }, []);

  // AI move effect
  useEffect(() => {
    if (state.status !== "ai_thinking") return;
    aiTimerRef.current = setTimeout(() => {
      setState((prev) => {
        if (prev.status !== "ai_thinking") return prev;

        const move = getAIMove(prev.board, prev.difficulty);
        if (!move) {
          return finishGame(prev, "red");
        }

        const promoted = wasKingPromoted(prev.board, move, "black");
        const newBoard = applyMove(prev.board, move);
        const winner = getWinner(newBoard);
        const { red, black } = countPieces(newBoard);
        const newAiCaptures = prev.aiCaptures + move.captures.length;
        const newAiKings = prev.aiKings + (promoted ? 1 : 0);
        const newAiMoves = prev.aiMoves + 1;

        if (winner) {
          return finishGame({
            ...prev,
            board: newBoard,
            lastMove: move,
            redCount: red,
            blackCount: black,
            moveCount: prev.moveCount + 1,
            aiMoves: newAiMoves,
            aiCaptures: newAiCaptures,
            aiKings: newAiKings,
          }, winner);
        }

        return {
          ...prev,
          board: newBoard,
          currentPlayer: "red",
          selectedCell: null,
          validMoves: [],
          status: "playing",
          redCount: red,
          blackCount: black,
          moveCount: prev.moveCount + 1,
          aiMoves: newAiMoves,
          aiCaptures: newAiCaptures,
          aiKings: newAiKings,
          lastMove: move,
          captureChain: null,
        };
      });
    }, 650);

    return () => { if (aiTimerRef.current) clearTimeout(aiTimerRef.current); };
  }, [state.status]);

  return { state, selectCell, resetGame, setDifficulty };
}

function finishGame(prev: GameState, winner: Player): GameState {
  const summary = buildGameSummary({
    winner,
    playerColor: prev.playerColor,
    totalMoves: prev.moveCount,
    playerMoves: prev.playerMoves,
    aiMoves: prev.aiMoves,
    playerCaptures: prev.playerCaptures,
    aiCaptures: prev.aiCaptures,
    playerKings: prev.playerKings,
    aiKings: prev.aiKings,
    keyMoments: prev.keyMoments,
  });
  return {
    ...prev,
    status: "game_over",
    winner,
    gameSummary: summary,
  };
}

function executePlayerMove(prev: GameState, move: Move): GameState {
  const turn = prev.moveCount + 1;
  const newMoments = analyzePlayerMove(prev.board, move, prev.playerColor, turn);
  const promoted = wasKingPromoted(prev.board, move, prev.playerColor);
  const newBoard = applyMove(prev.board, move);
  const winner = getWinner(newBoard);
  const { red, black } = countPieces(newBoard);

  const newPlayerCaptures = prev.playerCaptures + move.captures.length;
  const newPlayerKings = prev.playerKings + (promoted ? 1 : 0);
  const newPlayerMoves = prev.playerMoves + 1;
  const allMoments = [...prev.keyMoments, ...newMoments];

  if (winner) {
    return finishGame({
      ...prev,
      board: newBoard,
      selectedCell: null,
      validMoves: [],
      redCount: red,
      blackCount: black,
      moveCount: turn,
      keyMoments: allMoments,
      playerMoves: newPlayerMoves,
      playerCaptures: newPlayerCaptures,
      playerKings: newPlayerKings,
      lastMove: move,
      captureChain: null,
    }, winner);
  }

  // Check for continued capture chain
  if (move.captures.length > 0) {
    const furtherJumps = getAllMoves(newBoard, prev.playerColor).filter(
      (m) =>
        m.from.row === move.to.row &&
        m.from.col === move.to.col &&
        m.captures.length > 0
    );
    if (furtherJumps.length > 0) {
      return {
        ...prev,
        board: newBoard,
        selectedCell: move.to,
        validMoves: furtherJumps,
        status: "playing",
        redCount: red,
        blackCount: black,
        moveCount: turn,
        keyMoments: allMoments,
        playerMoves: newPlayerMoves,
        playerCaptures: newPlayerCaptures,
        playerKings: newPlayerKings,
        lastMove: move,
        captureChain: move,
      };
    }
  }

  return {
    ...prev,
    board: newBoard,
    currentPlayer: "black",
    selectedCell: null,
    validMoves: [],
    status: "ai_thinking",
    redCount: red,
    blackCount: black,
    moveCount: turn,
    keyMoments: allMoments,
    playerMoves: newPlayerMoves,
    playerCaptures: newPlayerCaptures,
    playerKings: newPlayerKings,
    lastMove: move,
    captureChain: null,
  };
}
