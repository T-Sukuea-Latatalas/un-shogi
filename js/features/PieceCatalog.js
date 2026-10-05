import { pieceRegistry } from '../data/originalPieces.js';

export class PieceCatalog {
  static getPiecesByRarity(rarity) {
    const list = [];
    for (const [, piece] of pieceRegistry.entries()) {
      // 基本成駒（と金など）はガチャ排出対象から除外
      if (['と金', '成香', '成桂', '成銀', '龍馬', '龍王'].includes(piece.name)) continue;

      if (piece.rarity === rarity) {
        list.push(piece);
      }
    }
    return list;
  }

  static getCatalogWithOwnership(inventory) {
    const catalog = [];
    for (const [name, def] of pieceRegistry.entries()) {
      if (['と金', '成香', '成桂', '成銀'].includes(name)) continue;

      catalog.push({
        name,
        rarity: def.rarity,
        promotesTo: def.promotesTo,
        ownedCount: inventory[name] || 0
      });
    }

    const weight = { UR: 4, SR: 3, R: 2, N: 1 };
    catalog.sort((a, b) => (weight[b.rarity] || 0) - (weight[a.rarity] || 0));
    return catalog;
  }
}