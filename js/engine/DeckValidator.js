DeckValidator.jsimport { BoardConfig } from './BoardConfig.js';
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
   * @param {Array<Object>} deckItems 例: [{ pieceName: '玉将', x: 4, y: 8 }]
   * @param {Object} boardConfig
   * @param {number} owner 0: 先手, 1: 後手
   */
  static validate(deckItems, boardConfig, owner) {
    if (!Array.isArray(deckItems)) {
      return { valid: false, error: 'Deck must be an array' };
    }

    if (deckItems.length === 0 || deckItems.length > this.MAX_PIECES_PER_DECK) {
      return { valid: false, error: `Piece count must be between 1 and ${this.MAX_PIECES_PER_DECK}` };
    }

    const territory = this.getPlayerTerritoryY(boardConfig.rows, owner);
    const occupiedCoords = new Set();
    let royalCount = 0;

    for (const item of deckItems) {
      if (!taikyokuPieces.has(item.pieceName)) {
        return { valid: false, error: `Unknown piece: ${item.pieceName}` };
      }

      if (GameState.ROYAL_PIECES.has(item.pieceName)) {
        royalCount++;
      }

      // 自陣の範囲内か判定
      if (item.x < 0 || item.x >= boardConfig.cols ||
          item.y < territory.minY || item.y > territory.maxY) {
        return { valid: false, error: `Piece ${item.pieceName} placed outside territory` };
      }

      // Voidマスでないか判定
      if (!BoardConfig.isWalkable(boardConfig, item.x, item.y)) {
        return { valid: false, error: `Piece ${item.pieceName} placed on void cell` };
      }

      const coordKey = `${item.x},${item.y}`;
      if (occupiedCoords.has(coordKey)) {
        return { valid: false, error: `Overlapping pieces at ${coordKey}` };
      }
      occupiedCoords.add(coordKey);
    }

    if (royalCount !== 1) {
      return { valid: false, error: 'Deck must contain exactly one royal piece (玉将, 王将, 帥操)' };
    }

    return { valid: true };
  }

  /**
   * テスト用の標準初期配置デッキを生成
   */
  static getSamplePreset(boardConfig, owner) {
    const isSente = owner === GameState.TURN.SENTE;
    const yRow3 = isSente ? boardConfig.rows - 1 : 0;
    const yRow2 = isSente ? boardConfig.rows - 2 : 1;
    const yRow1 = isSente ? boardConfig.rows - 3 : 2;

    const royalPiece = isSente ? '玉将' : '王将';

    return [
      // 1段目（歩兵ライン）
      { pieceName: '歩兵', x: 2, y: yRow1 },
      { pieceName: '歩兵', x: 3, y: yRow1 },
      { pieceName: '歩兵', x: 4, y: yRow1 },
      { pieceName: '歩兵', x: 5, y: yRow1 },
      { pieceName: '歩兵', x: 6, y: yRow1 },

      // 2段目（大駒・特殊駒）
      { pieceName: '角行', x: 2, y: yRow2 },
      { pieceName: '獅子', x: 4, y: yRow2 },
      { pieceName: '飛車', x: 6, y: yRow2 },

      // 3段目（王・金銀）
      { pieceName: '銀将', x: 3, y: yRow3 },
      { pieceName: royalPiece, x: 4, y: yRow3 },
      { pieceName: '金将', x: 5, y: yRow3 }
    ].filter(item => BoardConfig.isWalkable(boardConfig, item.x, item.y));
  }
}