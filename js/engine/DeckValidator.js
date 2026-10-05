import { BoardConfig } from './BoardConfig.js';
import { GameState } from './GameState.js';
import { taikyokuPieces } from '../data/taikyokuPieces.js';

export class DeckValidator {
  static MAX_PIECES_PER_DECK = 27;

  /**
   * プレイヤーの自陣Y座標範囲を返却
   */
  static getPlayerTerritoryY(boardRows, owner) {
    if (owner === GameState.TURN.SENTE) {
      return { minY: boardRows - 3, maxY: boardRows - 1 };
    } else {
      return { minY: 0, maxY: 2 };
    }
  }

  /**
   * デッキ配置の妥当性検証
   */
  static validate(deckItems, boardConfig, owner) {
    if (!Array.isArray(deckItems)) {
      return { valid: false, error: '配置データが不正です' };
    }

    if (deckItems.length === 0 || deckItems.length > this.MAX_PIECES_PER_DECK) {
      return { valid: false, error: `駒の数は1〜${this.MAX_PIECES_PER_DECK}個にしてください` };
    }

    const territory = this.getPlayerTerritoryY(boardConfig.rows, owner);
    const occupiedCoords = new Set();
    let royalCount = 0;

    for (const item of deckItems) {
      if (!taikyokuPieces.has(item.pieceName)) {
        return { valid: false, error: `未知の駒: ${item.pieceName}` };
      }

      if (GameState.ROYAL_PIECES.has(item.pieceName)) {
        royalCount++;
      }

      if (item.x < 0 || item.x >= boardConfig.cols ||
          item.y < territory.minY || item.y > territory.maxY) {
        return { valid: false, error: `${item.pieceName} が自陣の範囲外です` };
      }

      if (!BoardConfig.isWalkable(boardConfig, item.x, item.y)) {
        return { valid: false, error: `${item.pieceName} が進入不能マスにあります` };
      }

      const coordKey = `${item.x},${item.y}`;
      if (occupiedCoords.has(coordKey)) {
        return { valid: false, error: `マス (${item.x}, ${item.y}) で駒が重複しています` };
      }
      occupiedCoords.add(coordKey);
    }

    if (royalCount !== 1) {
      return { valid: false, error: '王将・玉将・帥操のいずれか1枚を含めてください' };
    }

    return { valid: true };
  }

  static getSamplePreset(boardConfig, owner) {
    const isSente = owner === GameState.TURN.SENTE;
    const yRow3 = isSente ? boardConfig.rows - 1 : 0;
    const yRow2 = isSente ? boardConfig.rows - 2 : 1;
    const yRow1 = isSente ? boardConfig.rows - 3 : 2;

    const royalPiece = isSente ? '玉将' : '王将';

    return [
      { pieceName: '歩兵', x: 2, y: yRow1 },
      { pieceName: '歩兵', x: 3, y: yRow1 },
      { pieceName: '歩兵', x: 4, y: yRow1 },
      { pieceName: '歩兵', x: 5, y: yRow1 },
      { pieceName: '歩兵', x: 6, y: yRow1 },
      { pieceName: '角行', x: 2, y: yRow2 },
      { pieceName: '獅子', x: 4, y: yRow2 },
      { pieceName: '飛車', x: 6, y: yRow2 },
      { pieceName: '銀将', x: 3, y: yRow3 },
      { pieceName: royalPiece, x: 4, y: yRow3 },
      { pieceName: '金将', x: 5, y: yRow3 }
    ].filter(item => BoardConfig.isWalkable(boardConfig, item.x, item.y));
  }
}