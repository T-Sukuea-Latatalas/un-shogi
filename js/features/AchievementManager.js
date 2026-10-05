import { SecureStorage } from '../storage/SecureStorage.js';

export class AchievementManager {
  static DEFINITIONS = [
    {
      id: 'FIRST_LOGIN',
      title: '初陣の志',
      desc: '否将棋を開始した',
      rewardCoins: 200,
      check: (data) => true
    },
    {
      id: 'WIN_FIRST_GAME',
      title: '初白星',
      desc: 'CPU対戦で1勝を挙げた',
      rewardCoins: 300,
      check: (data) => (data.stats.wins || 0) >= 1
    },
    {
      id: 'COLLECT_10_PIECES',
      title: '百般の術',
      desc: '10種類以上の駒を収集した',
      rewardCoins: 500,
      check: (data) => Object.keys(data.inventory || {}).length >= 10
    },
    {
      id: 'OWN_ROYAL_SHI_SHI',
      title: '獅子奮迅',
      desc: '「獅子」を獲得した',
      rewardCoins: 800,
      check: (data) => (data.inventory['獅子'] || 0) >= 1
    }
  ];

  /**
   * 未受取の実績一覧を取得
   */
  static async getClaimableAchievements() {
    const saveData = await SecureStorage.load();
    const claimedSet = new Set(saveData.claimedAchievements || []);

    return this.DEFINITIONS.filter(ach => {
      const isAccomplished = ach.check(saveData);
      return isAccomplished && !claimedSet.has(ach.id);
    });
  }

  /**
   * 実績全件の状態を取得
   */
  static async getAllStatus() {
    const saveData = await SecureStorage.load();
    const claimedSet = new Set(saveData.claimedAchievements || []);

    return this.DEFINITIONS.map(ach => ({
      id: ach.id,
      title: ach.title,
      desc: ach.desc,
      rewardCoins: ach.rewardCoins,
      isAccomplished: ach.check(saveData),
      isClaimed: claimedSet.has(ach.id)
    }));
  }

  /**
   * 実績報酬を受領
   */
  static async claim(achievementId) {
    const saveData = await SecureStorage.load();
    saveData.claimedAchievements = saveData.claimedAchievements || [];

    if (saveData.claimedAchievements.includes(achievementId)) {
      return { success: false, reason: '受取済みです' };
    }

    const definition = this.DEFINITIONS.find(d => d.id === achievementId);
    if (!definition || !definition.check(saveData)) {
      return { success: false, reason: '達成条件を満たしていません' };
    }

    saveData.coins = (saveData.coins || 0) + definition.rewardCoins;
    saveData.claimedAchievements.push(achievementId);
    await SecureStorage.save(saveData);

    return {
      success: true,
      rewardCoins: definition.rewardCoins,
      currentCoins: saveData.coins
    };
  }
}