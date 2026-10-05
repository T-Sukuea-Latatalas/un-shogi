import { BoardConfig } from './BoardConfig.js';
import { taikyokuPieces } from '../data/taikyokuPieces.js';

export class RuleEngine {
  static MAX_STEP_HEIGHT = 0.55; // 進入可能な最大高低差

  /**
   * 指定したマスの駒の合法手一覧を算出
   */
  static getLegalMoves(gameState, fromX, fromY) {
    const piece = gameState.getPiece(fromX, fromY);
    if (!piece) return [];

    const pieceDef = taikyokuPieces.get(piece.name);
    if (!pieceDef || !pieceDef.rules) return [];

    const isSente = piece.owner === 0;
    const moves = [];

    for (const rule of pieceDef.rules) {
      if (rule.multiStep >= 2) {
        // 獅子系（マルチステップ・居食い）
        const lionMoves = this.generateLionMoves(gameState, fromX, fromY, piece, rule, isSente);
        moves.push(...lionMoves);
      } else if (rule.isHook) {
        // 鉤行
        const hookMoves = this.generateHookMoves(gameState, fromX, fromY, piece, rule, isSente);
        moves.push(...hookMoves);
      } else {
        // 通常直線・ジャンプ移動
        const normalMoves = this.generateNormalMoves(gameState, fromX, fromY, piece, rule, isSente);
        moves.push(...normalMoves);
      }
    }

    return this.deduplicateMoves(moves);
  }

  static generateNormalMoves(gameState, fromX, fromY, piece, rule, isSente) {
    const moves = [];
    const board = gameState.boardConfig;

    // 後手は盤面方向が反転
    const dx = isSente ? rule.dx : -rule.dx;
    const dy = isSente ? rule.dy : -rule.dy;

    const fromHeight = BoardConfig.getHeight(board, fromX, fromY);
    const maxSteps = rule.isSlide ? Math.max(board.cols, board.rows) : rule.steps;

    let curX = fromX;
    let curY = fromY;
    let lastHeight = fromHeight;

    for (let step = 1; step <= maxSteps; step++) {
      curX += dx;
      curY += dy;

      if (!BoardConfig.isWalkable(board, curX, curY)) break;

      const targetHeight = BoardConfig.getHeight(board, curX, curY);
      if (!rule.canJump && Math.abs(targetHeight - lastHeight) > this.MAX_STEP_HEIGHT) {
        break; // 段差が高すぎて進入不可
      }

      const occupant = gameState.getPiece(curX, curY);

      if (occupant) {
        if (rule.canJump) {
          if (step === maxSteps) {
            if (occupant.owner !== piece.owner) {
              moves.push({ fromX, fromY, toX: curX, toY: curY });
            }
          }
          // ジャンプ駒は中間駒を無視して直進
          continue;
        } else {
          // 障害物に当たった場合、敵駒なら取って停止、味方駒なら手前で停止
          if (occupant.owner !== piece.owner) {
            moves.push({ fromX, fromY, toX: curX, toY: curY });
          }
          break;
        }
      } else {
        if (!rule.canJump || step === maxSteps) {
          moves.push({ fromX, fromY, toX: curX, toY: curY });
        }
      }

      lastHeight = targetHeight;
    }

    return moves;
  }

  /**
   * 鉤行の処理（1回だけ直角に曲がって走る）
   */
  static generateHookMoves(gameState, fromX, fromY, piece, rule, isSente) {
    const moves = [];
    const board = gameState.boardConfig;

    const dx1 = isSente ? rule.dx : -rule.dx;
    const dy1 = isSente ? rule.dy : -rule.dy;

    let curX = fromX;
    let curY = fromY;

    // 1軸目の直進
    while (true) {
      curX += dx1;
      curY += dy1;

      if (!BoardConfig.isWalkable(board, curX, curY)) break;

      const occ1 = gameState.getPiece(curX, curY);
      if (occ1) {
        if (occ1.owner !== piece.owner) {
          moves.push({ fromX, fromY, toX: curX, toY: curY });
        }
        break;
      }

      moves.push({ fromX, fromY, toX: curX, toY: curY });

      // 空きマスから直角方向へ2軸目のスライド
      // (dx1, dy1) に対して直角は (dy1, -dx1) および (-dy1, dx1)
      const perpendiculars = [
        { dx: dy1, dy: -dx1 },
        { dx: -dy1, dy: dx1 }
      ];

      for (const perp of perpendiculars) {
        let branchX = curX;
        let branchY = curY;

        while (true) {
          branchX += perp.dx;
          branchY += perp.dy;

          if (!BoardConfig.isWalkable(board, branchX, branchY)) break;

          const occ2 = gameState.getPiece(branchX, branchY);
          if (occ2) {
            if (occ2.owner !== piece.owner) {
              moves.push({ fromX, fromY, toX: branchX, toY: branchY });
            }
            break;
          }

          moves.push({ fromX, fromY, toX: branchX, toY: branchY });
        }
      }
    }

    return moves;
  }

  /**
   * 獅子系（周囲連続移動・居食い）の処理
   */
  static generateLionMoves(gameState, fromX, fromY, piece, rule, isSente) {
    const moves = [];
    const board = gameState.boardConfig;
    const directions = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
      { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
    ];

    // 1歩目の全方向探索
    for (const d1 of directions) {
      const step1X = fromX + d1.dx;
      const step1Y = fromY + d1.dy;

      if (!BoardConfig.isWalkable(board, step1X, step1Y)) continue;
      const occ1 = gameState.getPiece(step1X, step1Y);

      if (occ1 && occ1.owner === piece.owner) {
        // 味方駒の上は通過・着地不可
        continue;
      }

      // 1歩のみで着地（敵駒捕獲または空きマス移動）
      moves.push({
        fromX, fromY,
        toX: step1X, toY: step1Y,
        capturedSteps: occ1 ? [{ x: step1X, y: step1Y }] : []
      });

      // 2歩目の全方向探索
      for (const d2 of directions) {
        const step2X = step1X + d2.dx;
        const step2Y = step1Y + d2.dy;

        // 元の位置に戻る場合（居食い: 隣接する敵を取って戻る、またはその場で手番をパス）
        if (step2X === fromX && step2Y === fromY) {
          if (occ1 && occ1.owner !== piece.owner) {
            moves.push({
              fromX, fromY,
              toX: fromX, toY: fromY,
              isIgai: true,
              capturedSteps: [{ x: step1X, y: step1Y }]
            });
          }
          continue;
        }

        if (!BoardConfig.isWalkable(board, step2X, step2Y)) continue;
        const occ2 = gameState.getPiece(step2X, step2Y);

        if (occ2 && occ2.owner === piece.owner) continue;

        const captured = [];
        if (occ1 && occ1.owner !== piece.owner) captured.push({ x: step1X, y: step1Y });
        if (occ2 && occ2.owner !== piece.owner) captured.push({ x: step2X, y: step2Y });

        moves.push({
          fromX, fromY,
          toX: step2X, toY: step2Y,
          capturedSteps: captured
        });
      }
    }

    return moves;
  }

  static deduplicateMoves(moves) {
    const map = new Map();
    for (const m of moves) {
      const key = `${m.toX},${m.toY},${m.isIgai ? '1' : '0'}`;
      if (!map.has(key)) {
        map.set(key, m);
      }
    }
    return Array.from(map.values());
  }
}