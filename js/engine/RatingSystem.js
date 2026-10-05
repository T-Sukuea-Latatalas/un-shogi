export class RatingSystem {
  static K_FACTOR = 32;

  static RANKS = [
    { name: '十級', minRate: 0,    maxRate: 999 },
    { name: '九級', minRate: 1000, maxRate: 1099 },
    { name: '八級', minRate: 1100, maxRate: 1199 },
    { name: '七級', minRate: 1200, maxRate: 1299 },
    { name: '六級', minRate: 1300, maxRate: 1399 },
    { name: '五級', minRate: 1400, maxRate: 1499 },
    { name: '初段', minRate: 1500, maxRate: 1599 },
    { name: '二段', minRate: 1600, maxRate: 1699 },
    { name: '三段', minRate: 1700, maxRate: 1799 },
    { name: '四段', minRate: 1800, maxRate: 1899 },
    { name: '五段', minRate: 1900, maxRate: 1999 },
    { name: '棋仙', minRate: 2000, maxRate: 2199 },
    { name: '名人', minRate: 2200, maxRate: 9999 }
  ];

  static calculate(playerRating, opponentRating, isWin) {
    const expected = 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
    const actual = isWin ? 1 : 0;
    let delta = Math.round(this.K_FACTOR * (actual - expected));

    if (isWin && delta <= 0) delta = 1;
    if (!isWin && delta >= 0) delta = -1;

    const newRating = Math.max(100, playerRating + delta);
    return { newRating, delta };
  }

  static getRankName(rating) {
    for (const rank of this.RANKS) {
      if (rating >= rank.minRate && rating <= rank.maxRate) return rank.name;
    }
    return '十級';
  }
}