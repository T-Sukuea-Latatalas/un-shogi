export const pieceRegistry = new Map();

export function registerPiece(name, promotesTo, rules, rarity = 'N') {
  pieceRegistry.set(name, {
    name,
    promotesTo,
    rules,
    rarity
  });
}

// 金将の動き共通定義
const GOLD_RULES = [
  { dx: 0, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: 0, dy: 1, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: 0, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: 0, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: -1, steps: 1, isSlide: false, canJump: false }
];

// 基本駒
registerPiece('歩兵', 'と金', [{ dx: 0, dy: -1, steps: 1, isSlide: false, canJump: false }], 'N');
registerPiece('と金', null, GOLD_RULES, 'N');

registerPiece('香車', '成香', [{ dx: 0, dy: -1, steps: Infinity, isSlide: true, canJump: false }], 'N');
registerPiece('成香', null, GOLD_RULES, 'N');

registerPiece('桂馬', '成桂', [
  { dx: -1, dy: -2, steps: 1, isSlide: false, canJump: true },
  { dx: 1, dy: -2, steps: 1, isSlide: false, canJump: true }
], 'N');
registerPiece('成桂', null, GOLD_RULES, 'N');

registerPiece('銀将', '成銀', [
  { dx: 0, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: 1, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: 1, steps: 1, isSlide: false, canJump: false }
], 'N');
registerPiece('成銀', null, GOLD_RULES, 'N');

registerPiece('金将', null, GOLD_RULES, 'N');

registerPiece('角行', '龍馬', [
  { dx: -1, dy: -1, steps: Infinity, isSlide: true, canJump: false },
  { dx: 1, dy: -1, steps: Infinity, isSlide: true, canJump: false },
  { dx: -1, dy: 1, steps: Infinity, isSlide: true, canJump: false },
  { dx: 1, dy: 1, steps: Infinity, isSlide: true, canJump: false }
], 'SR');

registerPiece('龍馬', null, [
  { dx: -1, dy: -1, steps: Infinity, isSlide: true, canJump: false },
  { dx: 1, dy: -1, steps: Infinity, isSlide: true, canJump: false },
  { dx: -1, dy: 1, steps: Infinity, isSlide: true, canJump: false },
  { dx: 1, dy: 1, steps: Infinity, isSlide: true, canJump: false },
  { dx: 0, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: 0, dy: 1, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: 0, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: 0, steps: 1, isSlide: false, canJump: false }
], 'SR');

registerPiece('飛車', '龍王', [
  { dx: 0, dy: -1, steps: Infinity, isSlide: true, canJump: false },
  { dx: 0, dy: 1, steps: Infinity, isSlide: true, canJump: false },
  { dx: -1, dy: 0, steps: Infinity, isSlide: true, canJump: false },
  { dx: 1, dy: 0, steps: Infinity, isSlide: true, canJump: false }
], 'SR');

registerPiece('龍王', null, [
  { dx: 0, dy: -1, steps: Infinity, isSlide: true, canJump: false },
  { dx: 0, dy: 1, steps: Infinity, isSlide: true, canJump: false },
  { dx: -1, dy: 0, steps: Infinity, isSlide: true, canJump: false },
  { dx: 1, dy: 0, steps: Infinity, isSlide: true, canJump: false },
  { dx: -1, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: -1, steps: 1, isSlide: false, canJump: false },
  { dx: -1, dy: 1, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: 1, steps: 1, isSlide: false, canJump: false }
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

registerPiece('獅子', null, [{ dx: 0, dy: 0, steps: 2, isSlide: false, canJump: true, multiStep: 2 }], 'UR');
registerPiece('鉤行', null, [{ dx: 0, dy: 0, steps: Infinity, isSlide: true, canJump: false, isHook: true }], 'SR');

// オリジナル変則駒
registerPiece('位相', null, [
  { dx: 0, dy: -3, steps: 1, isSlide: false, canJump: true },
  { dx: 0, dy: 3, steps: 1, isSlide: false, canJump: true },
  { dx: -3, dy: 0, steps: 1, isSlide: false, canJump: true },
  { dx: 3, dy: 0, steps: 1, isSlide: false, canJump: true },
  { dx: -2, dy: -2, steps: 1, isSlide: false, canJump: true },
  { dx: 2, dy: -2, steps: 1, isSlide: false, canJump: true },
  { dx: -2, dy: 2, steps: 1, isSlide: false, canJump: true },
  { dx: 2, dy: 2, steps: 1, isSlide: false, canJump: true }
], 'UR');

registerPiece('重力', null, [
  { dx: 0, dy: -1, steps: 1, isSlide: false, canJump: true },
  { dx: 0, dy: 1, steps: 1, isSlide: false, canJump: true },
  { dx: -1, dy: 0, steps: 1, isSlide: false, canJump: true },
  { dx: 1, dy: 0, steps: 1, isSlide: false, canJump: true },
  { dx: 0, dy: -2, steps: 1, isSlide: false, canJump: true },
  { dx: 0, dy: 2, steps: 1, isSlide: false, canJump: true },
  { dx: -2, dy: 0, steps: 1, isSlide: false, canJump: true },
  { dx: 2, dy: 0, steps: 1, isSlide: false, canJump: true }
], 'R');

registerPiece('風伯', null, [
  { dx: -1, dy: -1, steps: Infinity, isSlide: true, canJump: false },
  { dx: 1, dy: -1, steps: Infinity, isSlide: true, canJump: false },
  { dx: -1, dy: 0, steps: 1, isSlide: false, canJump: false },
  { dx: 1, dy: 0, steps: 1, isSlide: false, canJump: false },
  { dx: 0, dy: 1, steps: 1, isSlide: false, canJump: false }
], 'SR');