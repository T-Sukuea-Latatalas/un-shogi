export class BoardConfig {
  static PRESETS = {
    STANDARD_9X9: 'STANDARD_9X9',
    HOLE_9X9: 'HOLE_9X9',
    ISLANDS_11X11: 'ISLANDS_11X11',
    STEPPED_9X9: 'STEPPED_9X9'
  };

  /**
   * 指定したプリセットIDの盤面設定を生成
   * @param {string} presetId
   * @returns {Object} 盤面データ構造
   */
  static create(presetId = BoardConfig.PRESETS.STANDARD_9X9) {
    switch (presetId) {
      case BoardConfig.PRESETS.HOLE_9X9:
        return this.createHoleBoard(9, 9);
      case BoardConfig.PRESETS.ISLANDS_11X11:
        return this.createIslandsBoard(11, 11);
      case BoardConfig.PRESETS.STEPPED_9X9:
        return this.createSteppedBoard(9, 9);
      case BoardConfig.PRESETS.STANDARD_9X9:
      default:
        return this.createStandardBoard(9, 9);
    }
  }

  static createStandardBoard(cols = 9, rows = 9) {
    const cells = [];
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        row.push({
          isVoid: false,
          height: 0
        });
      }
      cells.push(row);
    }
    return {
      id: BoardConfig.PRESETS.STANDARD_9X9,
      name: '本将棋盤 (9x9)',
      cols,
      rows,
      cells
    };
  }

  static createHoleBoard(cols = 9, rows = 9) {
    const cells = [];
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        // 中央3x3をVoid（穴）に設定
        const isVoid = (x >= 3 && x <= 5 && y >= 3 && y <= 5);
        row.push({
          isVoid,
          height: 0
        });
      }
      cells.push(row);
    }
    return {
      id: BoardConfig.PRESETS.HOLE_9X9,
      name: '虚空盤 (9x9)',
      cols,
      rows,
      cells
    };
  }

  static createIslandsBoard(cols = 11, rows = 11) {
    const cells = [];
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        // 浮島と中央通路以外の余白をVoidに設定
        const isMainBridge = (x === 5 || y === 5);
        const isCornerIsland = (
          (x >= 1 && x <= 3 && y >= 1 && y <= 3) ||
          (x >= 7 && x <= 9 && y >= 1 && y <= 3) ||
          (x >= 1 && x <= 3 && y >= 7 && y <= 9) ||
          (x >= 7 && x <= 9 && y >= 7 && y <= 9)
        );
        const isVoid = !(isMainBridge || isCornerIsland);

        row.push({
          isVoid,
          height: isCornerIsland ? 0.3 : 0
        });
      }
      cells.push(row);
    }
    return {
      id: BoardConfig.PRESETS.ISLANDS_11X11,
      name: '浮島十字盤 (11x11)',
      cols,
      rows,
      cells
    };
  }

  static createSteppedBoard(cols = 9, rows = 9) {
    const cells = [];
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        // 外周から中心に向かって段差が高くなる構造
        const distFromCenter = Math.max(Math.abs(x - 4), Math.abs(y - 4));
        const height = (4 - distFromCenter) * 0.25;
        row.push({
          isVoid: false,
          height: height
        });
      }
      cells.push(row);
    }
    return {
      id: BoardConfig.PRESETS.STEPPED_9X9,
      name: '段丘盤 (9x9)',
      cols,
      rows,
      cells
    };
  }

  /**
   * 指定座標が盤面内で進入可能かを判定
   */
  static isWalkable(board, x, y) {
    if (x < 0 || x >= board.cols || y < 0 || y >= board.rows) {
      return false;
    }
    const cell = board.cells[y][x];
    return cell && !cell.isVoid;
  }

  /**
   * 指定座標のセル高さ（Yオフセット）を取得
   */
  static getHeight(board, x, y) {
    if (x < 0 || x >= board.cols || y < 0 || y >= board.rows) {
      return 0;
    }
    return board.cells[y][x].height || 0;
  }
}