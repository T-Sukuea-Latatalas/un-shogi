import { MoveNotationParser } from '../engine/MoveNotationParser.js';
import { taikyokuPieces } from './taikyokuPieces.js';

export const ORIGINAL_PIECES = [
  {
    name: "歪曲",
    promotedName: "特異点",
    notation: "DIAG1, CROSS1",
    description: "盤面を歪める駒。跳躍移動を行う。",
    special: "TELEPORT",
    cost: 5,
    rarity: "UR"
  },
  {
    name: "天台",
    promotedName: "天動",
    notation: "F2L1!, F2R1!, B2L1!, B2R1!",
    description: "高機動駒。八方向に桂馬跳躍を行う。",
    special: "IGNORE_HEIGHT",
    cost: 4,
    rarity: "SR"
  },
  {
    name: "衝車",
    promotedName: "破城槌",
    notation: "F*, L1, R1, B1",
    description: "前方へ突進する兵器。",
    special: "PUSH_FORWARD",
    cost: 3,
    rarity: "R"
  },
  {
    name: "因果",
    promotedName: "輪廻",
    notation: "ALL1",
    description: "全方位に1マス動く。",
    special: "MIMIC_LAST_MOVE",
    cost: 4,
    rarity: "SR"
  },
  {
    name: "虚砲",
    promotedName: "虚神",
    notation: "CROSS2!",
    description: "十字2マスへ飛び越え移動する。",
    special: "REMOTE_CAPTURE",
    cost: 5,
    rarity: "UR"
  }
];

// taikyokuPieces の Map にオリジナル駒を自動登録
for (const p of ORIGINAL_PIECES) {
  const dslLine = `${p.name} -> ${p.promotedName}: ${p.notation}`;
  const parsed = MoveNotationParser.parseLine(dslLine);
  if (parsed) {
    taikyokuPieces.set(parsed.name, parsed);
  }
}

export function getOriginalPieceByName(name) {
  return ORIGINAL_PIECES.find(p => p.name === name || p.promotedName === name) || null;
}