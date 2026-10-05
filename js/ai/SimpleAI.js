import { GameState } from '../engine/GameState.js';
import { RuleEngine } from '../engine/RuleEngine.js';

export class SimpleAI {
  static PIECE_VALUES = {
    '玉将': 10000, '王将': 10000, '帥操': 10000,
    '獅子': 1500,  '大将': 1200,  '飛車': 800,
    '角行': 700,   '金将': 400,   '銀将': 350,
    '桂馬': 250,   '香車': 200,   '歩兵': 100
  };

  /**
   * 最適手を非同期で選定
   */
  static async selectMove(gameState, aiParams = { depth: 1, randomness: 0.1 }) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const legalMoves = this.getAllLegalMoves(gameState, GameState.TURN.GOTE);
        if (legalMoves.length === 0) {
          resolve(null);
          return;
        }

        // ランダム動作
        if (Math.random() < aiParams.randomness) {
          const randomIndex = Math.floor(Math.random() * legalMoves.length);
          resolve(legalMoves[randomIndex]);
          return;
        }

        // 評価関数による最善手の選択
        let bestMove = legalMoves[0];
        let maxScore = -Infinity;

        for (const move of legalMoves) {
          let score = 0;
          const targetPiece = gameState.getPiece(move.toX, move.toY);
          if (targetPiece) {
            score += (this.PIECE_VALUES[targetPiece.name] || 200) * 1.5;
          }

          if (move.capturedSteps && move.capturedSteps.length > 0) {
            for (const step of move.capturedSteps) {
              const cap = gameState.getPiece(step.x, step.y);
              if (cap) score += (this.PIECE_VALUES[cap.name] || 200);
            }
          }

          // 前進を優先評価
          score += (move.toY - move.fromY) * 5;

          if (score > maxScore) {
            maxScore = score;
            bestMove = move;
          }
        }

        resolve(bestMove);
      }, 300); // 思考時間演出
    });
  }

  static getAllLegalMoves(gameState, owner) {
    const allMoves = [];
    for (let y = 0; y < gameState.boardConfig.rows; y++) {
      for (let x = 0; x < gameState.boardConfig.cols; x++) {
        const piece = gameState.getPiece(x, y);
        if (piece && piece.owner === owner) {
          const moves = RuleEngine.getLegalMoves(gameState, x, y);
          allMoves.push(...moves);
        }
      }
    }
    return allMoves;
  }
}