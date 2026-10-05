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

    // 手駒リスト
    this.hands = {
      [GameState.TURN.SENTE]: [],
      [GameState.TURN.GOTE]: []
    };

    // 盤面グリッド初期化 [y][x]
    this.grid = Array.from({ length: boardConfig.rows }, () =>
      Array.from({ length: boardConfig.cols }, () => null)
    );
  }

  /**
   * 盤面の指定マスに駒を配置
   */
  setPiece(x, y, piece) {
    if (x < 0 || x >= this.boardConfig.cols || y < 0 || y >= this.boardConfig.rows) {
      return false;
    }
    this.grid[y][x] = piece;
    return true;
  }

  getPiece(x, y) {
    if (x < 0 || x >= this.boardConfig.cols || y < 0 || y >= this.boardConfig.rows) {
      return null;
    }
    return this.grid[y][x];
  }

  /**
   * 駒の移動を実行
   * @param {Object} move MoveNotationParserおよびRuleEngineで生成された移動情報
   * @returns {Object} 移動結果情報
   */
  applyMove(move) {
    if (this.winner !== null) return { success: false, reason: 'Game already finished' };

    const { fromX, fromY, toX, toY, isIgai, capturedSteps } = move;
    const movingPiece = this.getPiece(fromX, fromY);

    if (!movingPiece || movingPiece.owner !== this.currentTurn) {
      return { success: false, reason: 'Invalid piece or turn' };
    }

    const capturedPieces = [];

    // 獅子等のマルチステップ途中捕獲（居食い含む）の処理
    if (capturedSteps && capturedSteps.length > 0) {
      for (const step of capturedSteps) {
        const target = this.getPiece(step.x, step.y);
        if (target && target.owner !== this.currentTurn) {
          capturedPieces.push(target);
          this.grid[step.y][step.x] = null;
        }
      }
    }

    // 着地点の駒捕獲判定
    if (!isIgai) {
      const destPiece = this.getPiece(toX, toY);
      if (destPiece) {
        if (destPiece.owner === this.currentTurn) {
          return { success: false, reason: 'Cannot capture friendly piece' };
        }
        capturedPieces.push(destPiece);
      }
      this.grid[fromY][fromX] = null;
      this.grid[toY][toX] = movingPiece;
    }

    // 捕獲した駒を持ち駒に加算（成りを解除して原名に戻す）
    for (const captured of capturedPieces) {
      if (GameState.ROYAL_PIECES.has(captured.name)) {
        this.winner = this.currentTurn;
      }
      const rawName = captured.baseName || captured.name;
      this.hands[this.currentTurn].push({
        name: rawName,
        owner: this.currentTurn
      });
    }

    this.history.push({
      turn: this.currentTurn,
      from: { x: fromX, y: fromY },
      to: { x: toX, y: toY },
      piece: movingPiece.name,
      captured: capturedPieces.map(p => p.name),
      isIgai: !!isIgai
    });

    // ターン交代
    this.currentTurn = this.currentTurn === GameState.TURN.SENTE
      ? GameState.TURN.GOTE
      : GameState.TURN.SENTE;

    return {
      success: true,
      winner: this.winner,
      capturedPieces
    };
  }
}