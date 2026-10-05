import { BoardConfig } from './BoardConfig.js';
import { GameState } from './GameState.js';
import { pieceRegistry } from '../data/originalPieces.js';

export class DeckValidator {
  static validate(deckItems, boardConfig, owner) {
    if (!Array.isArray(deckItems) || deckItems.length === 0) {
      return { valid: false, error: '配置が不正です' };
    }

    const isSente = owner === GameState.TURN.SENTE;
    const minY = isSente ? boardConfig.rows - 3 : 0;
    const maxY = isSente ? boardConfig.rows - 1 : 2;

    let royalCount = 0;
    const occupied = new Set();

    for (const item of deckItems) {
      if (!pieceRegistry.has(item.pieceName)) {
        return { valid: false, error: `未定義の駒: ${item.pieceName}` };
      }

      if (GameState.ROYAL_PIECES.has(item.pieceName)) {
        royalCount++;
      }

      if (item.x < 0 || item.x >= boardConfig.cols || item.y < minY || item.y > maxY) {
        return { valid: false, error: '自陣の外に駒が配置されています' };
      }

      if (!BoardConfig.isWalkable(boardConfig, item.x, item.y)) {
        return { valid: false, error: '進入不可セルに配置されています' };
      }

      const key = `${item.x},${item.y}`;
      if (occupied.has(key)) {
        return { valid: false, error: 'マスが重複しています' };
      }
      occupied.add(key);
    }

    if (royalCount !== 1) {
      return { valid: false, error: '王駒は1枚のみ配置してください' };
    }

    return { valid: true };
  }

  static getSamplePreset(boardConfig, owner) {
    const isSente = owner === GameState.TURN.SENTE;
    const y3 = isSente ? boardConfig.rows - 1 : 0;
    const y2 = isSente ? boardConfig.rows - 2 : 1;
    const y1 = isSente ? boardConfig.rows - 3 : 2;

    const royal = isSente ? '玉将' : '王将';

    return [
      { pieceName: '歩兵', x: 2, y: y1 },
      { pieceName: '歩兵', x: 3, y: y1 },
      { pieceName: '歩兵', x: 4, y: y1 },
      { pieceName: '歩兵', x: 5, y: y1 },
      { pieceName: '歩兵', x: 6, y: y1 },
      { pieceName: '角行', x: 2, y: y2 },
      { pieceName: '飛車', x: 6, y: y2 },
      { pieceName: '銀将', x: 3, y: y3 },
      { pieceName: royal, x: 4, y: y3 },
      { pieceName: '金将', x: 5, y: y3 }
    ].filter(p => BoardConfig.isWalkable(boardConfig, p.x, p.y));
  }
}