export const pieceRegistry = new Map();

/**
 * 駒移動定義の登録
 */
function registerPiece(name, promotesTo, rules, rarity = 'N') {
  pieceRegistry.set(name, {
    name,
    promotesTo,
    rules,
    rarity
  });
}

// 基本駒
registerPiece('歩兵', '金将', [{ dx: 0, dy: -1, steps: 1, isSlide: false, canJump: false }], 'N');
registerPiece('香車', '白駒', [{ dx: 0, dy: -1, steps: Infinity, isSlide: true, canJump: false }], 'N');
registerPiece('桂馬', '金将', [{ dx: -1, dy: -2, steps: 1, isSlide: false, canJump: true }, { dx: 1, dy: -2, steps: 1, isSlide: false, canJump: true }], 'N');
registerPiece('銀将', '近王', [
  { dx: 0, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: 1, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: 1, steps: 1, isSlide: false, canJump: false }
], 'N');
registerPiece('金将', '近王', [
  { dx: 0, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: 0, dy: 1, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: 0, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: 0, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: -1, steps: 1, isSlide: false, canJump: false }
], 'N');
registerPiece('角行', '龍馬', [
  { dx: -1, dy: -1, steps: Infinity, isSlide: true, canJump: false },
  { dx: 1, dy: -1, steps: Infinity, isSlide: true, canJump: false },
  { dx: -1, dy: 1, steps: Infinity, isSlide: true, canJump: false },
  { dx: 1, dy: 1, steps: Infinity, isSlide: true, canJump: false }
], 'SR');
registerPiece('飛車', '龍王', [
  { dx: 0, dy: -1, steps: Infinity, isSlide: true, canJump: false },
  { dx: 0, dy: 1, steps: Infinity, isSlide: true, canJump: false },
  { dx: -1, dy: 0, steps: Infinity, isSlide: true, canJump: false },
  { dx: 1, dy: 0, steps: Infinity, isSlide: true, canJump: false }
], 'SR');
registerPiece('玉将', null, [
  { dx: 0, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: 0, dy: 1, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: 0, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: 0, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: 1, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: 1, steps: 1, isSlide: false, canJump: false }
], 'UR');
registerPiece('王将', null, [
  { dx: 0, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: 0, dy: 1, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: 0, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: 0, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: 1, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: 1, steps: 1, isSlide: false, canJump: false }
], 'UR');

// 大局将棋・特殊駒
registerPiece('獅子', '奮迅', [{ dx: 0, dy: 0, steps: 2, isSlide: false, canJump: true, multiStep: 2 }], 'UR');
registerPiece('鉤行', '鶴唳', [{ dx: 0, dy: 0, steps: Infinity, isSlide: true, canJump: false, isHook: true }], 'SR');

// 否将棋オリジナル変則駒
// 位相: 障害物を無視して広範囲に跳躍
registerPiece('位相', '転移', [
  { dx: 0, dy: -3, steps: 1, isSlide: false, canJump: true },
  { dx: 0, dy: 3, steps: 1, isSlide: false, canJump: true },
  { dx: -3, dy: 0, steps: 1, isSlide: false, canJump: true },
  { dx: 3, dy: 0, steps: 1, isSlide: false, canJump: true },
  { dx: -2, dy: -2, steps: 1, isSlide: false, canJump: true },
  { dx: 2, dy: -2, steps: 1, isSlide: false, canJump: true },
  { dx: -2, dy: 2, steps: 1, isSlide: false, canJump: true },
  { dx: 2, dy: 2, steps: 1, isSlide: false, canJump: true }
], 'UR');

// 重力: 周囲1マスの段差を完全に無視して跳躍し、直線上2マス先へ跳ぶ
registerPiece('重力', '崩壊', [
  { dx: 0, dy: -1, steps: 1, isSlide: false, canJump: true },
  { dx: 0, dy: 1, steps: 1, isSlide: false, canJump: true },
  { dx: -1, dy: 0, steps: 1, isSlide: false, canJump: true },
  { dx: 1, dy: 0, steps: 1, isSlide: false, canJump: true },
  { dx: 0, dy: -2, steps: 1, isSlide: false, canJump: true },
  { dx: 0, dy: 2, steps: 1, isSlide: false, canJump: true },
  { dx: -2, dy: 0, steps: 1, isSlide: false, canJump: true },
  { dx: 2, dy: 0, steps: 1, isSlide: false, canJump: true }
], 'R');

// 風伯: 斜め前方にスライドし、横と後ろをカバー
registerPiece('風伯', '嵐神', [
  { dx: -1, dy: -1, steps: Infinity, isSlide: true, canJump: false },
  { dx: 1, dy: -1, steps: Infinity, isSlide: true, canJump: false },
  { dx: -1, dy: 0, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: 0, steps: 1, isSlide: false, canJump: false },
  { dx: 0, dy: 1, steps: 1, isSlide: false, canJump: false }
], 'SR');