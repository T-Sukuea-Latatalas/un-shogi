import { PieceCatalog } from './PieceCatalog.js';
import { SecureStorage } from '../storage/SecureStorage.js';

export class GachaSystem {
  static COST_SINGLE = 100;
  static COST_TEN = 1000;

  static RARITY_RATES = {
    UR: 0.03, // 3%
    SR: 0.12, // 12%
    R:  0.35, // 35%
    N:  0.50  // 50%
  };

  static BANNER_PRESETS = {
    STANDARD: {
      id: 'standard',
      name: '恒常 登竜門',
      pickup: []
    },
    SHI_SHI_FEST: {
      id: 'shi_shi_fest',
      name: '百獣招来 獅子祭',
      pickup: ['獅子', '獅鷹', '大将']
    }
  };

  /**
   * 1連ガチャを実行
   */
  static async rollSingle(bannerId = 'STANDARD') {
    const saveData = await SecureStorage.load();
    if (saveData.coins < this.COST_SINGLE) {
      return { success: false, reason: '通貨が不足しています' };
    }

    saveData.coins -= this.COST_SINGLE;
    const banner = this.BANNER_PRESETS[bannerId] || this.BANNER_PRESETS.STANDARD;
    const piece = this.drawOne(banner, false);

    saveData.inventory[piece.name] = (saveData.inventory[piece.name] || 0) + 1;
    await SecureStorage.save(saveData);

    return {
      success: true,
      results: [piece],
      remainingCoins: saveData.coins
    };
  }

  /**
   * 10連ガチャを実行（SR以上1枠確定）
   */
  static async rollTen(bannerId = 'STANDARD') {
    const saveData = await SecureStorage.load();
    if (saveData.coins < this.COST_TEN) {
      return { success: false, reason: '通貨が不足しています' };
    }

    saveData.coins -= this.COST_TEN;
    const banner = this.BANNER_PRESETS[bannerId] || this.BANNER_PRESETS.STANDARD;
    const results = [];

    // 通常抽選 9枠
    for (let i = 0; i < 9; i++) {
      results.push(this.drawOne(banner, false));
    }

    // SR以上保証 1枠
    results.push(this.drawOne(banner, true));

    for (const piece of results) {
      saveData.inventory[piece.name] = (saveData.inventory[piece.name] || 0) + 1;
    }

    await SecureStorage.save(saveData);

    return {
      success: true,
      results,
      remainingCoins: saveData.coins
    };
  }

  /**
   * 単発抽選ロジック
   */
  static drawOne(banner, guaranteeSrOrHigher = false) {
    let rarity = 'N';
    const rand = Math.random();

    if (guaranteeSrOrHigher) {
      // 確定枠: UR 20%, SR 80%
      rarity = rand < 0.2 ? 'UR' : 'SR';
    } else {
      if (rand < this.RARITY_RATES.UR) {
        rarity = 'UR';
      } else if (rand < this.RARITY_RATES.UR + this.RARITY_RATES.SR) {
        rarity = 'SR';
      } else if (rand < this.RARITY_RATES.UR + this.RARITY_RATES.SR + this.RARITY_RATES.R) {
        rarity = 'R';
      } else {
        rarity = 'N';
      }
    }

    const pool = PieceCatalog.getPiecesByRarity(rarity);

    // ピックアップ判定
    const pickupsInPool = pool.filter(p => banner.pickup.includes(p.name));
    if (pickupsInPool.length > 0 && Math.random() < 0.5) {
      const idx = Math.floor(Math.random() * pickupsInPool.length);
      return pickupsInPool[idx];
    }

    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }
}