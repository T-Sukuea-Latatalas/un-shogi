export class SecureStorage {
  static KEY = 'un_shogi_save_v1';
  static SALT = 'un-shogi-secure-salt-4820';

  static createDefault() {
    return {
      playerId: crypto.randomUUID ? crypto.randomUUID() : 'p_' + Date.now(),
      playerName: '観戦者',
      rating: 1500,
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
        '位相': 1,
        '重力': 2,
        '風伯': 1
      },
      stats: { wins: 0, losses: 0 }
    };
  }

  static async save(data) {
    const payload = JSON.stringify(data);
    const signature = await this.sign(payload);
    localStorage.setItem(this.KEY, JSON.stringify({ payload, signature }));
  }

  static async load() {
    const raw = localStorage.getItem(this.KEY);
    if (!raw) {
      const def = this.createDefault();
      await this.save(def);
      return def;
    }

    try {
      const pkg = JSON.parse(raw);
      const expected = await this.sign(pkg.payload);
      if (expected !== pkg.signature) {
        console.warn('改ざん検知。データを初期化します。');
        const def = this.createDefault();
        await this.save(def);
        return def;
      }
      return JSON.parse(pkg.payload);
    } catch {
      const def = this.createDefault();
      await this.save(def);
      return def;
    }
  }

  static async sign(payload) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload + this.SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}