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

  applyMove(move) {
    if (this.winner !== null) return { success: false };

    const { fromX, fromY, toX, toY, isIgai, capturedSteps } = move;
    const movingPiece = this.getPiece(fromX, fromY);
    if (!movingPiece || movingPiece.owner !== this.currentTurn) return { success: false };

    const capturedList = [];

    // マルチステップ途中捕獲（獅子の居食い等）
    if (capturedSteps && capturedSteps.length > 0) {
      for (const step of capturedSteps) {
        const target = this.getPiece(step.x, step.y);
        if (target && target.owner !== this.currentTurn) {
          capturedList.push(target);
          this.grid[step.y][step.x] = null;
        }
      }
    }

    // 目的地の捕獲
    if (!isIgai) {
      const destPiece = this.getPiece(toX, toY);
      if (destPiece) {
        if (destPiece.owner === this.currentTurn) return { success: false };
        capturedList.push(destPiece);
      }
      this.grid[fromY][fromX] = null;
      this.grid[toY][toX] = movingPiece;
    }

    // 捕獲処理と勝敗判定
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
      isIgai: !!isIgai
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