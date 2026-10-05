import { RuleEngine } from '../engine/RuleEngine.js';
import { GameState } from '../engine/GameState.js';

export class SimpleAI {
  static PIECE_VALUES = {
    '玉将': 20000,
    '王将': 20000,
    '帥操': 20000,
    '獅子': 2500,
    '位相': 2000,
    '鉤行': 1600,
    '飛車': 1100,
    '角行': 1000,
    '風伯': 800,
    '金将': 500,
    '銀将': 450,
    '重力': 400,
    '桂馬': 300,
    '香車': 280,
    '歩兵': 100
  };

  static async selectMove(gameState, aiParams = {}) {
    await new Promise(resolve => setTimeout(resolve, 80));

    const moves = [];
    for (let y = 0; y < gameState.boardConfig.rows; y++) {
      for (let x = 0; x < gameState.boardConfig.cols; x++) {
        const p = gameState.getPiece(x, y);
        if (p && p.owner === GameState.TURN.GOTE) {
          moves.push(...RuleEngine.getLegalMoves(gameState, x, y));
        }
      }
    }

    if (moves.length === 0) return null;

    // 王を取れる手があれば即実行
    for (const m of moves) {
      const dest = gameState.getPiece(m.toX, m.toY);
      if (dest && GameState.ROYAL_PIECES.has(dest.name)) return m;
    }

    let bestMove = null;
    let maxScore = -Infinity;

    for (const move of moves) {
      let score = 0;
      const dest = gameState.getPiece(move.toX, move.toY);

      if (dest) {
        score += (this.PIECE_VALUES[dest.name] || 150) * (aiParams.captureWeight || 1.2);
      }

      if (move.capturedSteps) {
        for (const st of move.capturedSteps) {
          const mid = gameState.getPiece(st.x, st.y);
          if (mid) score += (this.PIECE_VALUES[mid.name] || 150);
        }
      }

      // 前進へのインセンティブ
      score += (move.toY - move.fromY) * 6;

      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
      }
    }

    if (aiParams.randomness && Math.random() < aiParams.randomness) {
      return moves[Math.floor(Math.random() * moves.length)];
    }

    return bestMove || moves[0];
  }
}