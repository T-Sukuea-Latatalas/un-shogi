export class BoardConfig {
  static PRESETS = {
    STANDARD_9X9: 'STANDARD_9X9',
    HOLE_9X9: 'HOLE_9X9',
    ISLANDS_11X11: 'ISLANDS_11X11',
    STEPPED_9X9: 'STEPPED_9X9'
  };

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
    const cells = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => ({ isVoid: false, height: 0 }))
    );
    return { id: BoardConfig.PRESETS.STANDARD_9X9, name: '本将棋盤', cols, rows, cells };
  }

  static createHoleBoard(cols = 9, rows = 9) {
    const cells = [];
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        const isVoid = (x >= 3 && x <= 5 && y >= 3 && y <= 5);
        row.push({ isVoid, height: 0 });
      }
      cells.push(row);
    }
    return { id: BoardConfig.PRESETS.HOLE_9X9, name: '虚空盤', cols, rows, cells };
  }

  static createIslandsBoard(cols = 11, rows = 11) {
    const cells = [];
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        const isBridge = (x === 5 || y === 5);
        const isCorner = (
          (x >= 1 && x <= 3 && y >= 1 && y <= 3) ||
          (x >= 7 && x <= 9 && y >= 1 && y <= 3) ||
          (x >= 1 && x <= 3 && y >= 7 && y <= 9) ||
          (x >= 7 && x <= 9 && y >= 7 && y <= 9)
        );
        const isVoid = !(isBridge || isCorner);
        row.push({ isVoid, height: isCorner ? 0.3 : 0 });
      }
      cells.push(row);
    }
    return { id: BoardConfig.PRESETS.ISLANDS_11X11, name: '浮島十字盤', cols, rows, cells };
  }

  static createSteppedBoard(cols = 9, rows = 9) {
    const cells = [];
    for (let y = 0; y < rows; y++) {
      const row = [];
      for (let x = 0; x < cols; x++) {
        const dist = Math.max(Math.abs(x - 4), Math.abs(y - 4));
        const height = (4 - dist) * 0.22;
        row.push({ isVoid: false, height });
      }
      cells.push(row);
    }
    return { id: BoardConfig.PRESETS.STEPPED_9X9, name: '段丘盤', cols, rows, cells };
  }

  static isWalkable(board, x, y) {
    if (!board || x < 0 || x >= board.cols || y < 0 || y >= board.rows) return false;
    const cell = board.cells[y][x];
    return cell && !cell.isVoid;
  }

  static getHeight(board, x, y) {
    if (!board || x < 0 || x >= board.cols || y < 0 || y >= board.rows) return 0;
    return board.cells[y][x].height || 0;
  }
}