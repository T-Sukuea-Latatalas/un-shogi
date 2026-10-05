import { PieceCatalog } from './PieceCatalog.js';
import { SecureStorage } from '../storage/SecureStorage.js';

export class GachaSystem {
  static COST_SINGLE = 100;
  static COST_TEN = 1000;

  static RARITY_RATES = {
    UR: 0.05,
    SR: 0.20,
    R:  0.35,
    N:  0.40
  };

  static async rollSingle() {
    const saveData = await SecureStorage.load();
    if ((saveData.coins || 0) < this.COST_SINGLE) {
      return { success: false, reason: '銭が不足しています' };
    }

    saveData.coins -= this.COST_SINGLE;
    const piece = this.drawPiece(false);

    saveData.inventory[piece.name] = (saveData.inventory[piece.name] || 0) + 1;
    await SecureStorage.save(saveData);

    return {
      success: true,
      results: [piece],
      remainingCoins: saveData.coins
    };
  }

  static async rollTen() {
    const saveData = await SecureStorage.load();
    if ((saveData.coins || 0) < this.COST_TEN) {
      return { success: false, reason: '銭が不足しています' };
    }

    saveData.coins -= this.COST_TEN;
    const results = [];

    // 通常枠 9回
    for (let i = 0; i < 9; i++) {
      results.push(this.drawPiece(false));
    }
    // SR以上確定枠 1回
    results.push(this.drawPiece(true));

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

  static drawPiece(guaranteeSr = false) {
    let rarity = 'N';
    const rand = Math.random();

    if (guaranteeSr) {
      rarity = rand < 0.25 ? 'UR' : 'SR';
    } else {
      if (rand < this.RARITY_RATES.UR) rarity = 'UR';
      else if (rand < this.RARITY_RATES.UR + this.RARITY_RATES.SR) rarity = 'SR';
      else if (rand < this.RARITY_RATES.UR + this.RARITY_RATES.SR + this.RARITY_RATES.R) rarity = 'R';
      else rarity = 'N';
    }

    const pool = PieceCatalog.getPiecesByRarity(rarity);
    if (pool.length === 0) return { name: '歩兵', rarity: 'N' };

    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }
}