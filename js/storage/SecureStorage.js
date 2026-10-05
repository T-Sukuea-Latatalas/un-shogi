export class SecureStorage {
  static STORAGE_KEY = 'un_shogi_savedata_v1';
  static SECRET_SALT = 'un-shogi-salt-9874123650';

  /**
   * 初期セーブデータを返却
   */
  static createDefaultSaveData() {
    return {
      playerId: crypto.randomUUID(),
      coins: 1000,
      inventory: {
        '歩兵': 18,
        '香車': 4,
        '桂馬': 4,
        '銀将': 4,
        '金将': 4,
        '角行': 2,
        '飛車': 2,
        '玉将': 1,
        '王将': 1,
        '仲人': 2,
        '獅子': 1
      },
      stats: {
        wins: 0,
        losses: 0
      },
      updatedAt: Date.now()
    };
  }

  /**
   * 署名付きでセーブデータをLocalStorageに保存
   * @param {Object} data
   */
  static async save(data) {
    data.updatedAt = Date.now();
    const payload = JSON.stringify(data);
    const signature = await this.generateSignature(payload);

    const packageData = {
      payload,
      signature
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(packageData));
    return true;
  }

  /**
   * LocalStorageからセーブデータをロードし改ざんを検証
   * @returns {Promise<Object>}
   */
  static async load() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) {
      const defaultData = this.createDefaultSaveData();
      await this.save(defaultData);
      return defaultData;
    }

    try {
      const packageData = JSON.parse(raw);
      if (!packageData.payload || !packageData.signature) {
        console.warn('不正なセーブデータ構造を検知。データを初期化します。');
        return this.reset();
      }

      const expectedSig = await this.generateSignature(packageData.payload);
      if (expectedSig !== packageData.signature) {
        console.warn('改ざんされたセーブデータを検知。データを初期化します。');
        return this.reset();
      }

      return JSON.parse(packageData.payload);
    } catch (e) {
      console.warn('セーブデータ解析エラー。データを初期化します。', e);
      return this.reset();
    }
  }

  /**
   * データを強制初期化
   */
  static async reset() {
    const defaultData = this.createDefaultSaveData();
    await this.save(defaultData);
    return defaultData;
  }

  /**
   * ペイロードとソルトからハッシュ署名を生成
   */
  static async generateSignature(payload) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload + this.SECRET_SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}