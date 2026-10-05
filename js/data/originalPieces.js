/**
 * 否将棋 オリジナル駒定義データ
 */
export const ORIGINAL_PIECES = [
    {
        name: "歪曲",
        promotedName: "特異点",
        notation: "DIAG1, CROSS1",
        description: "盤面を歪める駒。1マス移動のほか、盤上の任意の空きマスへ跳躍移動ができる。",
        special: "TELEPORT",
        cost: 5,
        rarity: "SSR"
    },
    {
        name: "天台",
        promotedName: "天動",
        notation: "F2L1!, F2R1!, B2L1!, B2R1!, L2F1!, L2B1!, R2F1!, R2B1!",
        description: "超高機動駒。盤面の段差や穴を完全に無視し、八方向に八方桂の跳躍を行う。",
        special: "IGNORE_HEIGHT",
        cost: 4,
        rarity: "SR"
    },
    {
        name: "衝車",
        promotedName: "破城槌",
        notation: "F*, L1, R1, B1",
        description: "前方へ突進する攻城兵器。前方の敵駒を取る際、そのマスに留まらず敵の背後へ押し込む。",
        special: "PUSH_FORWARD",
        cost: 3,
        rarity: "R"
    },
    {
        name: "因果",
        promotedName: "輪廻",
        notation: "ALL1",
        description: "直前の相手手番で動いた駒のベクトルを反転して自らの移動力として付与する。",
        special: "MIMIC_LAST_MOVE",
        cost: 4,
        rarity: "SR"
    },
    {
        name: "虚砲",
        promotedName: "虚神",
        notation: "CROSS2!",
        description: "自陣から動かずに直線上の敵陣を射撃できる。射程内の敵駒を直接消滅させる。",
        special: "REMOTE_CAPTURE",
        cost: 5,
        rarity: "SSR"
    }
];

export function getOriginalPieceByName(name) {
    return ORIGINAL_PIECES.find(p => p.name === name || p.promotedName === name) || null;
}