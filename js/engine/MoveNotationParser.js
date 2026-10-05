export class MoveNotationParser {
  static DIRECTION_VECTORS = {
    F:  { dx: 0,  dy: -1 },
    B:  { dx: 0,  dy: 1  },
    L:  { dx: -1, dy: 0  },
    R:  { dx: 1,  dy: 0  },
    FL: { dx: -1, dy: -1 },
    FR: { dx: 1,  dy: -1 },
    BL: { dx: -1, dy: 1  },
    BR: { dx: 1,  dy: 1  }
  };

  static SHORTCUTS = {
    CROSS: ['F', 'B', 'L', 'R'],
    DIAG:  ['FL', 'FR', 'BL', 'BR'],
    ALL:   ['F', 'B', 'L', 'R', 'FL', 'FR', 'BL', 'BR']
  };

  /**
   * DSL行をパースしてPieceDefinitionを返却
   * @param {string} line 例: "犬 -> 仲人: F1, BL1, BR1"
   * @returns {Object|null}
   */
  static parseLine(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return null;

    const parts = trimmed.split(':');
    if (parts.length < 2) return null;

    const header = parts[0].trim();
    const rulesText = parts.slice(1).join(':').trim();

    const [namePart, promotesToPart] = header.split('->').map(s => s.trim());
    const promotesTo = (!promotesToPart || promotesToPart === 'None') ? null : promotesToPart;

    const rawTokens = rulesText.split(',').map(s => s.trim()).filter(Boolean);
    const rules = [];

    for (const token of rawTokens) {
      const expandedRules = this.parseToken(token);
      rules.push(...expandedRules);
    }

    return {
      name: namePart,
      promotesTo: promotesTo,
      rules: rules
    };
  }

  /**
   * 単一トークン（ショートカット展開を含む）をパース
   * @param {string} token
   * @returns {Array<Object>}
   */
  static parseToken(token) {
    const isJump = token.includes('!');
    let cleanToken = token.replace('!', '');

    let multiStep = 1;
    const multiMatch = cleanToken.match(/\(x(\d+)\)/);
    if (multiMatch) {
      multiStep = parseInt(multiMatch[1], 10);
      cleanToken = cleanToken.replace(multiMatch[0], '');
    }

    let isHook = false;
    if (cleanToken.includes('(hook)')) {
      isHook = true;
      cleanToken = cleanToken.replace('(hook)', '');
    }

    let isRank = false;
    if (cleanToken.includes('(rank)')) {
      isRank = true;
      cleanToken = cleanToken.replace('(rank)', '');
    }

    cleanToken = cleanToken.trim();

    // 複合移動（例: F2L1, F2R1 等の桂馬系ジャンプ）の判定
    const knightMatch = cleanToken.match(/^([FB])(\d+)([LR])(\d+)$/);
    if (knightMatch) {
      const fb = knightMatch[1];
      const fbDist = parseInt(knightMatch[2], 10);
      const lr = knightMatch[3];
      const lrDist = parseInt(knightMatch[4], 10);

      const dy = (fb === 'F' ? -1 : 1) * fbDist;
      const dx = (lr === 'L' ? -1 : 1) * lrDist;

      return [{
        type: 'jump_step',
        dx: dx,
        dy: dy,
        steps: 1,
        isSlide: false,
        canJump: true,
        multiStep: multiStep,
        isHook: false,
        isRank: false
      }];
    }

    // ショートカット展開 (CROSS, DIAG, ALL)
    for (const [shortcutKey, directions] of Object.entries(this.SHORTCUTS)) {
      if (cleanToken.startsWith(shortcutKey)) {
        const stepNotation = cleanToken.substring(shortcutKey.length);
        const results = [];
        for (const dir of directions) {
          results.push(this.buildMoveRule(dir, stepNotation, isJump, multiStep, isHook, isRank));
        }
        return results;
      }
    }

    // 基本方向 (F, B, L, R, FL, FR, BL, BR)
    const dirMatch = cleanToken.match(/^(FL|FR|BL|BR|F|B|L|R)(.*)$/);
    if (dirMatch) {
      const dir = dirMatch[1];
      const stepNotation = dirMatch[2];
      return [this.buildMoveRule(dir, stepNotation, isJump, multiStep, isHook, isRank)];
    }

    return [];
  }

  /**
   * 方向とステップ数記号から移動ルールオブジェクトを構築
   */
  static buildMoveRule(dir, stepNotation, isJump, multiStep, isHook, isRank) {
    const vector = this.DIRECTION_VECTORS[dir];
    let isSlide = false;
    let steps = 1;

    if (stepNotation === '*') {
      isSlide = true;
      steps = Infinity;
    } else if (stepNotation) {
      const parsedSteps = parseInt(stepNotation, 10);
      if (!isNaN(parsedSteps)) {
        steps = parsedSteps;
      }
    }

    return {
      direction: dir,
      dx: vector.dx,
      dy: vector.dy,
      steps: steps,
      isSlide: isSlide,
      canJump: isJump,
      multiStep: multiStep,
      isHook: isHook,
      isRank: isRank
    };
  }
}