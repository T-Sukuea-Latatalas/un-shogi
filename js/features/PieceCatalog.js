import { taikyokuPieces } from '../data/taikyokuPieces.js';

export class PieceCatalog {
  static RARITY_DEFINITIONS = {
    UR: [
      '獅子', '奔鷲', '大将', '副将', '獅鷹', '鵬師', '帥操', '狛犬'
    ],
    SR: [
      '角行', '飛車', '龍王', '龍馬', '麒麟', '鳳凰', '鉤行', '金翅',
      '朱雀', '白虎', '青龍', '玄武', '雲鷲', '大龍', '大鷲', '神龍'
    ],
    R: [
      '猛虎', '飛牛', '水牛', '走車', '走鹿', '走狼', '竪豹', '方行',
      '山鷹', '馬麟', '摩羯', '猛鷲', '奔熊', '奔虎', '走馬', '走牛'
    ]
    // 上記に含まれない駒はすべて N
  };

  /**
   * 指定レアリティの駒配列を取得
   */
  static getPiecesByRarity(rarity) {
    const list = [];
    const urSet = new Set(this.RARITY_DEFINITIONS.UR);
    const srSet = new Set(this.RARITY_DEFINITIONS.SR);
    const rSet = new Set(this.RARITY_DEFINITIONS.R);

    for (const [name, pieceDef] of taikyokuPieces.entries()) {
      let pieceRarity = 'N';
      if (urSet.has(name)) pieceRarity = 'UR';
      else if (srSet.has(name)) pieceRarity = 'SR';
      else if (rSet.has(name)) pieceRarity = 'R';

      if (pieceRarity === rarity) {
        list.push({
          name: pieceDef.name,
          promotesTo: pieceDef.promotesTo,
          rarity: pieceRarity,
          rules: pieceDef.rules
        });
      }
    }
    return list;
  }

  /**
   * 駒名から詳細メタデータを取得
   */
  static getPieceInfo(pieceName) {
    const pieceDef = taikyokuPieces.get(pieceName);
    if (!pieceDef) return null;

    let rarity = 'N';
    if (this.RARITY_DEFINITIONS.UR.includes(pieceName)) rarity = 'UR';
    else if (this.RARITY_DEFINITIONS.SR.includes(pieceName)) rarity = 'SR';
    else if (this.RARITY_DEFINITIONS.R.includes(pieceName)) rarity = 'R';

    return {
      name: pieceDef.name,
      promotesTo: pieceDef.promotesTo,
      rarity: rarity,
      rules: pieceDef.rules
    };
  }

  /**
   * プレイヤー所持数付きの全駒図鑑データを生成
   */
  static getCatalogWithOwnership(inventory) {
    const catalog = [];
    for (const [name] of taikyokuPieces.entries()) {
      const info = this.getPieceInfo(name);
      catalog.push({
        ...info,
        ownedCount: inventory[name] || 0,
        isOwned: (inventory[name] || 0) > 0
      });
    }

    // レアリティ順（UR -> SR -> R -> N）かつ名前順にソート
    const rarityWeight = { UR: 4, SR: 3, R: 2, N: 1 };
    catalog.sort((a, b) => {
      if (rarityWeight[b.rarity] !== rarityWeight[a.rarity]) {
        return rarityWeight[b.rarity] - rarityWeight[a.rarity];
      }
      return a.name.localeCompare(b.name, 'ja');
    });

    return catalog;
  }
}