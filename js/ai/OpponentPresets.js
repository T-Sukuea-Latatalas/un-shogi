import { BoardConfig } from '../engine/BoardConfig.js';

export const OpponentPresets = [
  {
    id: 'sugai_1200',
    name: '木偶 (初等)',
    rating: 1200,
    boardPresetId: BoardConfig.PRESETS.STANDARD_9X9,
    aiParams: { depth: 1, randomness: 0.3 },
    deck: [
      { pieceName: '歩兵', x: 2, y: 2 },
      { pieceName: '歩兵', x: 3, y: 2 },
      { pieceName: '歩兵', x: 4, y: 2 },
      { pieceName: '歩兵', x: 5, y: 2 },
      { pieceName: '歩兵', x: 6, y: 2 },
      { pieceName: '角行', x: 6, y: 1 },
      { pieceName: '飛車', x: 2, y: 1 },
      { pieceName: '銀将', x: 3, y: 0 },
      { pieceName: '王将', x: 4, y: 0 },
      { pieceName: '金将', x: 5, y: 0 }
    ]
  },
  {
    id: 'kikou_1500',
    name: '機巧 (中等)',
    rating: 1500,
    boardPresetId: BoardConfig.PRESETS.HOLE_9X9,
    aiParams: { depth: 2, randomness: 0.1 },
    deck: [
      { pieceName: '歩兵', x: 1, y: 2 },
      { pieceName: '歩兵', x: 2, y: 2 },
      { pieceName: '歩兵', x: 6, y: 2 },
      { pieceName: '歩兵', x: 7, y: 2 },
      { pieceName: '角行', x: 2, y: 1 },
      { pieceName: '獅子', x: 4, y: 1 },
      { pieceName: '飛車', x: 6, y: 1 },
      { pieceName: '銀将', x: 2, y: 0 },
      { pieceName: '王将', x: 4, y: 0 },
      { pieceName: '金将', x: 6, y: 0 }
    ]
  }
];