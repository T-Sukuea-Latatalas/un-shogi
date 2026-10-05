import { BoardConfig } from '../engine/BoardConfig.js';

export const OpponentPresets = [
  {
    id: 'sugai_1200',
    name: '菅井 鉄心',
    title: '町道場の門番',
    rating: 1200,
    boardPresetId: BoardConfig.PRESETS.STANDARD_9X9,
    aiParams: {
      depth: 1,
      captureWeight: 1.2,
      mobilityWeight: 0.1,
      kingAttackWeight: 0.2,
      randomness: 0.3
    },
    // 後手陣（y: 0〜2）
    deck: [
      { pieceName: '歩兵', x: 2, y: 2 },
      { pieceName: '歩兵', x: 3, y: 2 },
      { pieceName: '歩兵', x: 4, y: 2 },
      { pieceName: '歩兵', x: 5, y: 2 },
      { pieceName: '歩兵', x: 6, y: 2 },
      { pieceName: '角行', x: 2, y: 1 },
      { pieceName: '飛車', x: 6, y: 1 },
      { pieceName: '銀将', x: 3, y: 0 },
      { pieceName: '王将', x: 4, y: 0 },
      { pieceName: '金将', x: 5, y: 0 }
    ]
  },
  {
    id: 'kusunoki_1500',
    name: '楠木 正道',
    title: '段丘の野伏',
    rating: 1500,
    boardPresetId: BoardConfig.PRESETS.STEPPED_9X9,
    aiParams: {
      depth: 2,
      captureWeight: 1.5,
      mobilityWeight: 0.2,
      kingAttackWeight: 0.5,
      randomness: 0.15
    },
    deck: [
      { pieceName: '歩兵', x: 2, y: 2 },
      { pieceName: '猛虎', x: 3, y: 2 },
      { pieceName: '歩兵', x: 4, y: 2 },
      { pieceName: '走馬', x: 5, y: 2 },
      { pieceName: '歩兵', x: 6, y: 2 },
      { pieceName: '飛牛', x: 2, y: 1 },
      { pieceName: '水牛', x: 6, y: 1 },
      { pieceName: '猛熊', x: 3, y: 0 },
      { pieceName: '王将', x: 4, y: 0 },
      { pieceName: '金将', x: 5, y: 0 }
    ]
  },
  {
    id: 'ichijo_1800',
    name: '一条 兼房',
    title: '虚空の遠眼鏡',
    rating: 1800,
    boardPresetId: BoardConfig.PRESETS.HOLE_9X9,
    aiParams: {
      depth: 2,
      captureWeight: 1.8,
      mobilityWeight: 0.3,
      kingAttackWeight: 0.8,
      randomness: 0.05
    },
    deck: [
      { pieceName: '仲人', x: 1, y: 2 },
      { pieceName: '歩兵', x: 2, y: 2 },
      { pieceName: '歩兵', x: 6, y: 2 },
      { pieceName: '仲人', x: 7, y: 2 },
      { pieceName: '鉤行', x: 2, y: 1 },
      { pieceName: '角行', x: 6, y: 1 },
      { pieceName: '雲鷲', x: 3, y: 0 },
      { pieceName: '王将', x: 4, y: 0 },
      { pieceName: '大龍', x: 5, y: 0 }
    ]
  },
  {
    id: 'kujo_2200',
    name: '九条 兼定',
    title: '棋仙宗家',
    rating: 2200,
    boardPresetId: BoardConfig.PRESETS.ISLANDS_11X11,
    aiParams: {
      depth: 2,
      captureWeight: 2.0,
      mobilityWeight: 0.4,
      kingAttackWeight: 1.2,
      randomness: 0.0
    },
    // 11x11 浮島盤用
    deck: [
      { pieceName: '歩兵', x: 2, y: 2 },
      { pieceName: '獅子', x: 5, y: 2 },
      { pieceName: '歩兵', x: 8, y: 2 },
      { pieceName: '大将', x: 2, y: 1 },
      { pieceName: '獅鷹', x: 8, y: 1 },
      { pieceName: '金将', x: 3, y: 1 },
      { pieceName: '王将', x: 5, y: 0 },
      { pieceName: '金将', x: 7, y: 1 }
    ]
  }
];