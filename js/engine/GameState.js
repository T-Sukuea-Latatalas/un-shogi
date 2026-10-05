import { pieceRegistry } from '../data/originalPieces.js';

export class GameState {
  static TURN = {
    SENTE: 0,
    GOTE: 1
  };

  static ROYAL_PIECES = new Set(['玉将', '王将', '帥操']);

  constructor(boardConfig) {
    this.boardConfig = boardConfig;
    this.currentTurn = GameState.TURN.SENTE;
    this.winner = null;
    this.history = [];

    this.hands = {
      [GameState.TURN.SENTE]: [],
      [GameState.TURN.GOTE]: []
    };

    this.grid = Array.from({ length: boardConfig.rows }, () =>
      Array.from({ length: boardConfig.cols }, () => null)
    );
  }

  setPiece(x, y, piece) {
    if (x < 0 || x >= this.boardConfig.cols || y < 0 || y >= this.boardConfig.rows) return false;
    this.grid[y][x] = piece;
    return true;
  }

  getPiece(x, y) {
    if (x < 0 || x >= this.boardConfig.cols || y < 0 || y >= this.boardConfig.rows) return null;
    return this.grid[y][x];
  }

  /**
   * 駒移動の適用（成りフラグ対応）
   */
  applyMove(move, isPromote = false) {
    if (this.winner !== null) return { success: false };

    const { fromX, fromY, toX, toY, isIgai, capturedSteps } = move;
    const movingPiece = this.getPiece(fromX, fromY);
    if (!movingPiece || movingPiece.owner !== this.currentTurn) return { success: false };

    const capturedList = [];

    if (capturedSteps && capturedSteps.length > 0) {
      for (const step of capturedSteps) {
        const target = this.getPiece(step.x, step.y);
        if (target && target.owner !== this.currentTurn) {
          capturedList.push(target);
          this.grid[step.y][step.x] = null;
        }
      }
    }

    if (!isIgai) {
      const destPiece = this.getPiece(toX, toY);
      if (destPiece) {
        if (destPiece.owner === this.currentTurn) return { success: false };
        capturedList.push(destPiece);
      }

      // 成り処理
      if (isPromote) {
        const def = pieceRegistry.get(movingPiece.name);
        if (def && def.promotesTo) {
          movingPiece.name = def.promotesTo;
          movingPiece.isPromoted = true;
        }
      }

      this.grid[fromY][fromX] = null;
      this.grid[toY][toX] = movingPiece;
    }

    for (const captured of capturedList) {
      if (GameState.ROYAL_PIECES.has(captured.name)) {
        this.winner = this.currentTurn;
      }
      this.hands[this.currentTurn].push({
        name: captured.baseName || captured.name,
        owner: this.currentTurn
      });
    }

    this.history.push({
      turn: this.currentTurn,
      from: { x: fromX, y: fromY },
      to: { x: toX, y: toY },
      isIgai: !!isIgai,
      promoted: isPromote
    });

    this.currentTurn = this.currentTurn === GameState.TURN.SENTE
      ? GameState.TURN.GOTE
      : GameState.TURN.SENTE;

    return {
      success: true,
      winner: this.winner
    };
  }
}