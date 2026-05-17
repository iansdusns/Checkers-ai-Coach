import { useState, useCallback, useEffect, useRef } from "react";
import {
  Board,
  Player,
  Move,
  Position,
  GameEvent,
  createInitialBoard,
  getAllMoves,
  getMovesFrom,
  applyMove,
  getWinner,
  getAIMove,
  analyzeGameEvents,
  generateCoachingTips,
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
  events: GameEvent[];
  coachingTips: string[];
  lastMove: Move | null;
  captureChain: Move | null;
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

export function useGame() {
  const [state, setState] = useState<GameState>(() => {
    const board = createInitialBoard();
    const { red, black } = countPieces(board);
    return {
      board,
      currentPlayer: "red",
      selectedCell: null,
      validMoves: [],
      status: "playing",
      winner: null,
      playerColor: "red",
      difficulty: "medium",
      redCount: red,
      blackCount: black,
      moveCount: 0,
      events: [],
      coachingTips: [],
      lastMove: null,
      captureChain: null,
    };
  });

  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetGame = useCallback((difficulty?: Difficulty) => {
    if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    const board = createInitialBoard();
    const { red, black } = countPieces(board);
    setState((prev) => ({
      board,
      currentPlayer: "red",
      selectedCell: null,
      validMoves: [],
      status: "playing",
      winner: null,
      playerColor: "red",
      difficulty: difficulty ?? prev.difficulty,
      redCount: red,
      blackCount: black,
      moveCount: 0,
      events: [],
      coachingTips: [],
      lastMove: null,
      captureChain: null,
    }));
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    setState((prev) => ({ ...prev, difficulty }));
  }, []);

  const selectCell = useCallback(
    (pos: Position) => {
      setState((prev) => {
        if (prev.status !== "playing" || prev.currentPlayer !== prev.playerColor) {
          return prev;
        }

        const piece = prev.board[pos.row][pos.col];

        if (prev.captureChain) {
          const move = prev.validMoves.find(
            (m) => m.to.row === pos.row && m.to.col === pos.col
          );
          if (move) {
            return executePlayerMove(prev, move);
          }
          return prev;
        }

        if (prev.selectedCell) {
          const move = prev.validMoves.find(
            (m) => m.to.row === pos.row && m.to.col === pos.col
          );
          if (move) {
            return executePlayerMove(prev, move);
          }
          if (piece && piece.player === prev.playerColor) {
            const moves = getMovesFrom(prev.board, pos);
            return { ...prev, selectedCell: pos, validMoves: moves };
          }
          return { ...prev, selectedCell: null, validMoves: [] };
        }

        if (piece && piece.player === prev.playerColor) {
          const moves = getMovesFrom(prev.board, pos);
          return { ...prev, selectedCell: pos, validMoves: moves };
        }

        return prev;
      });
    },
    []
  );

  useEffect(() => {
    if (state.status === "ai_thinking") {
      aiTimerRef.current = setTimeout(() => {
        setState((prev) => {
          if (prev.status !== "ai_thinking") return prev;
          const move = getAIMove(prev.board, prev.difficulty);
          if (!move) {
            const winner = "red";
            return {
              ...prev,
              status: "game_over",
              winner,
              coachingTips: generateCoachingTips(prev.events, winner, prev.playerColor),
            };
          }
          const newBoard = applyMove(prev.board, move);
          const winner = getWinner(newBoard);
          const { red, black } = countPieces(newBoard);
          const tips = winner
            ? generateCoachingTips(prev.events, winner, prev.playerColor)
            : [];

          return {
            ...prev,
            board: newBoard,
            currentPlayer: "red",
            selectedCell: null,
            validMoves: [],
            status: winner ? "game_over" : "playing",
            winner: winner ?? null,
            redCount: red,
            blackCount: black,
            moveCount: prev.moveCount + 1,
            lastMove: move,
            captureChain: null,
            coachingTips: tips,
          };
        });
      }, 600);
    }
    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [state.status]);

  return { state, selectCell, resetGame, setDifficulty };
}

function executePlayerMove(prev: GameState, move: Move): GameState {
  const newEvents = analyzeGameEvents(prev.board, move, prev.playerColor, prev.board);
  const newBoard = applyMove(prev.board, move);
  const winner = getWinner(newBoard);
  const { red, black } = countPieces(newBoard);

  if (winner) {
    const tips = generateCoachingTips(
      [...prev.events, ...newEvents],
      winner,
      prev.playerColor
    );
    return {
      ...prev,
      board: newBoard,
      currentPlayer: winner === prev.playerColor ? prev.playerColor : (prev.playerColor === "red" ? "black" : "red"),
      selectedCell: null,
      validMoves: [],
      status: "game_over",
      winner,
      redCount: red,
      blackCount: black,
      moveCount: prev.moveCount + 1,
      events: [...prev.events, ...newEvents],
      coachingTips: tips,
      lastMove: move,
      captureChain: null,
    };
  }

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
        events: [...prev.events, ...newEvents],
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
    moveCount: prev.moveCount + 1,
    events: [...prev.events, ...newEvents],
    lastMove: move,
    captureChain: null,
  };
}
