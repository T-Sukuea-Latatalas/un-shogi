import { RuleEngine } from '../engine/RuleEngine.js';
import { GameState } from '../engine/GameState.js';

export class SimpleAI {
  static PIECE_VALUES = {
    '玉将': 20000,
    '王将': 20000,
    '帥操': 20000,
    '獅子': 2500,
    '奔鷲': 2400,
    '大将': 2200,
    '副将': 2000,
    '獅鷹': 2200,
    '鉤行': 1600,
    '龍王': 1400,
    '龍馬': 1300,
    '飛車': 1100,
    '角行': 1000,
    '雲鷲': 1100,
    '金将': 500,
    '銀将': 450,
    '猛虎': 500,
    '走車': 600,
    '走鹿': 550,
    '桂馬': 300,
    '香車': 280,
    '歩兵': 100,
    '仲人': 120,
    '犬':   110
  };

  /**
   * 非同期で最善手を算出
   * @param {GameState} gameState
   * @param {Object} aiParams
   * @returns {Promise<Object|null>}
   */
  static async selectMove(gameState, aiParams = {}) {
    // 描画フレームを譲るためタイマーを挟む
    await new Promise(resolve => setTimeout(resolve, 80));

    const depth = aiParams.depth || 1;
    const isMaximizing = gameState.currentTurn === GameState.TURN.GOTE; // CPUは後手

    const moves = this.getAllLegalMoves(gameState, gameState.currentTurn);
    if (moves.length === 0) return null;

    // 王手・即時王捕獲手があるか先行チェック
    for (const move of moves) {
      const dest = gameState.getPiece(move.toX, move.toY);
      if (dest && GameState.ROYAL_PIECES.has(dest.name)) {
        return move;
      }
    }

    let bestMove = null;
    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
      // 仮想盤面を模倣してスコア評価
      const score = this.evaluateMoveQuick(gameState, move, aiParams);

      if (isMaximizing) {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
      }
    }

    // ランダム揺らぎ処理（初等AIの人間味用）
    if (aiParams.randomness && Math.random() < aiParams.randomness) {
      const randomIndex = Math.floor(Math.random() * moves.length);
      return moves[randomIndex];
    }

    return bestMove || moves[0];
  }

  /**
   * 1手適用後の簡易評価
   */
  static evaluateMoveQuick(gameState, move, aiParams) {
    let score = 0;
    const captureWeight = aiParams.captureWeight || 1.0;
    const kingAttackWeight = aiParams.kingAttackWeight || 0.5;

    const movingPiece = gameState.getPiece(move.fromX, move.fromY);
    const destPiece = gameState.getPiece(move.toX, move.toY);

    // 駒捕獲ボーナス
    if (destPiece) {
      const val = this.PIECE_VALUES[destPiece.name] || 150;
      score += val * captureWeight;
    }

    // 獅子の中間捕獲ボーナス
    if (move.capturedSteps) {
      for (const st of move.capturedSteps) {
        const midPiece = gameState.getPiece(st.x, st.y);
        if (midPiece) {
          score += (this.PIECE_VALUES[midPiece.name] || 150) * captureWeight;
        }
      }
    }

    // 先手玉（標的）への接近度評価
    const enemyKingPos = this.findKingPos(gameState, GameState.TURN.SENTE);
    if (enemyKingPos) {
      const oldDist = Math.abs(move.fromX - enemyKingPos.x) + Math.abs(move.fromY - enemyKingPos.y);
      const newDist = Math.abs(move.toX - enemyKingPos.x) + Math.abs(move.toY - enemyKingPos.y);
      score += (oldDist - newDist) * 15 * kingAttackWeight;
    }

    // 自軍の前進インセンティブ（後手はyが増加する方向が前進）
    score += (move.toY - move.fromY) * 8;

    return score;
  }

  static findKingPos(gameState, owner) {
    for (let y = 0; y < gameState.boardConfig.rows; y++) {
      for (let x = 0; x < gameState.boardConfig.cols; x++) {
        const p = gameState.getPiece(x, y);
        if (p && p.owner === owner && GameState.ROYAL_PIECES.has(p.name)) {
          return { x, y };
        }
      }
    }
    return null;
  }

  static getAllLegalMoves(gameState, owner) {
    const allMoves = [];
    for (let y = 0; y < gameState.boardConfig.rows; y++) {
      for (let x = 0; x < gameState.boardConfig.cols; x++) {
        const p = gameState.getPiece(x, y);
        if (p && p.owner === owner) {
          const legal = RuleEngine.getLegalMoves(gameState, x, y);
          allMoves.push(...legal);
        }
      }
    }
    return allMoves;
  }
}