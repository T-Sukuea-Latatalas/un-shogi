import { BoardConfig } from './BoardConfig.js';
import { pieceRegistry } from '../data/originalPieces.js';

export class RuleEngine {
  static MAX_STEP_HEIGHT = 0.55;

  static getLegalMoves(gameState, fromX, fromY) {
    const piece = gameState.getPiece(fromX, fromY);
    if (!piece) return [];

    const pieceDef = pieceRegistry.get(piece.name);
    if (!pieceDef || !pieceDef.rules) return [];

    const isSente = piece.owner === 0;
    const moves = [];

    for (const rule of pieceDef.rules) {
      if (rule.multiStep >= 2) {
        moves.push(...this.generateLionMoves(gameState, fromX, fromY, piece));
      } else if (rule.isHook) {
        moves.push(...this.generateHookMoves(gameState, fromX, fromY, piece, isSente));
      } else {
        moves.push(...this.generateNormalMoves(gameState, fromX, fromY, piece, rule, isSente));
      }
    }

    return this.deduplicate(moves);
  }

  static generateNormalMoves(gameState, fromX, fromY, piece, rule, isSente) {
    const moves = [];
    const board = gameState.boardConfig;

    const dx = isSente ? rule.dx : -rule.dx;
    const dy = isSente ? rule.dy : -rule.dy;

    const maxSteps = rule.isSlide ? Math.max(board.cols, board.rows) : rule.steps;
    let curX = fromX;
    let curY = fromY;
    let lastH = BoardConfig.getHeight(board, fromX, fromY);

    for (let s = 1; s <= maxSteps; s++) {
      curX += dx;
      curY += dy;

      if (!BoardConfig.isWalkable(board, curX, curY)) break;

      const targetH = BoardConfig.getHeight(board, curX, curY);
      if (!rule.canJump && Math.abs(targetH - lastH) > this.MAX_STEP_HEIGHT) break;

      const occ = gameState.getPiece(curX, curY);

      if (occ) {
        if (rule.canJump) {
          if (s === maxSteps && occ.owner !== piece.owner) {
            moves.push({ fromX, fromY, toX: curX, toY: curY });
          }
          continue;
        } else {
          if (occ.owner !== piece.owner) {
            moves.push({ fromX, fromY, toX: curX, toY: curY });
          }
          break;
        }
      } else {
        if (!rule.canJump || s === maxSteps) {
          moves.push({ fromX, fromY, toX: curX, toY: curY });
        }
      }

      lastH = targetH;
    }

    return moves;
  }

  static generateHookMoves(gameState, fromX, fromY, piece, isSente) {
    const moves = [];
    const board = gameState.boardConfig;
    const dirs = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
    ];

    for (const d of dirs) {
      let cx = fromX;
      let cy = fromY;

      while (true) {
        cx += d.dx;
        cy += d.dy;

        if (!BoardConfig.isWalkable(board, cx, cy)) break;
        const occ = gameState.getPiece(cx, cy);

        if (occ) {
          if (occ.owner !== piece.owner) moves.push({ fromX, fromY, toX: cx, toY: cy });
          break;
        }

        moves.push({ fromX, fromY, toX: cx, toY: cy });

        // 直角方向にスライド
        const perps = [{ dx: d.dy, dy: -d.dx }, { dx: -d.dy, dy: d.dx }];
        for (const p of perps) {
          let bx = cx;
          let by = cy;
          while (true) {
            bx += p.dx;
            by += p.dy;
            if (!BoardConfig.isWalkable(board, bx, by)) break;
            const bocc = gameState.getPiece(bx, by);
            if (bocc) {
              if (bocc.owner !== piece.owner) moves.push({ fromX, fromY, toX: bx, toY: by });
              break;
            }
            moves.push({ fromX, fromY, toX: bx, toY: by });
          }
        }
      }
    }

    return moves;
  }

  static generateLionMoves(gameState, fromX, fromY, piece) {
    const moves = [];
    const board = gameState.boardConfig;
    const dirs = [
      { dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
      { dx: -1, dy: -1 }, { dx: 1, dy: -1 }, { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
    ];

    for (const d1 of dirs) {
      const s1x = fromX + d1.dx;
      const s1y = fromY + d1.dy;

      if (!BoardConfig.isWalkable(board, s1x, s1y)) continue;
      const occ1 = gameState.getPiece(s1x, s1y);
      if (occ1 && occ1.owner === piece.owner) continue;

      moves.push({
        fromX, fromY, toX: s1x, toY: s1y,
        capturedSteps: occ1 ? [{ x: s1x, y: s1y }] : []
      });

      for (const d2 of dirs) {
        const s2x = s1x + d2.dx;
        const s2y = s1y + d2.dy;

        if (s2x === fromX && s2y === fromY) {
          if (occ1 && occ1.owner !== piece.owner) {
            moves.push({
              fromX, fromY, toX: fromX, toY: fromY,
              isIgai: true,
              capturedSteps: [{ x: s1x, y: s1y }]
            });
          }
          continue;
        }

        if (!BoardConfig.isWalkable(board, s2x, s2y)) continue;
        const occ2 = gameState.getPiece(s2x, s2y);
        if (occ2 && occ2.owner === piece.owner) continue;

        const captured = [];
        if (occ1 && occ1.owner !== piece.owner) captured.push({ x: s1x, y: s1y });
        if (occ2 && occ2.owner !== piece.owner) captured.push({ x: s2x, y: s2y });

        moves.push({
          fromX, fromY, toX: s2x, toY: s2y,
          capturedSteps: captured
        });
      }
    }

    return moves;
  }

  static deduplicate(moves) {
    const seen = new Set();
    const result = [];
    for (const m of moves) {
      const k = `${m.toX},${m.toY},${m.isIgai ? 1 : 0}`;
      if (!seen.has(k)) {
        seen.add(k);
        result.push(m);
      }
    }
    return result;
  }
}