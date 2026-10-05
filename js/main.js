import * as THREE from 'three';
import './data/originalPieces.js';
import { BoardConfig } from './engine/BoardConfig.js';
import { GameState } from './engine/GameState.js';
import { RuleEngine } from './engine/RuleEngine.js';
import { DeckValidator } from './engine/DeckValidator.js';
import { RatingSystem } from './engine/RatingSystem.js';
import { SecureStorage } from './storage/SecureStorage.js';
import { OpponentPresets } from './ai/OpponentPresets.js';
import { SimpleAI } from './ai/SimpleAI.js';
import { ThreeScene } from './view/ThreeScene.js';
import { BoardMeshBuilder } from './view/BoardMeshBuilder.js';
import { PieceMeshBuilder } from './view/PieceMeshBuilder.js';
import { UIManager } from './ui/UIManager.js';

export class UnShogiApp {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.sceneManager = new ThreeScene(this.canvas);
    this.uiManager = new UIManager(this);

    this.boardConfig = null;
    this.gameState = null;
    this.currentOpponent = null;

    this.pieceMeshes = new Map();
    this.selectedCoord = null;
    this.currentLegalMoves = [];
    this.highlightGroup = new THREE.Group();
    this.boardGroup = null;

    this.isAiThinking = false;

    this.sceneManager.scene.add(this.highlightGroup);
    this.sceneManager.onCellClick = (x, y) => this.handleCellClick(x, y);
    this.sceneManager.startRenderLoop();
  }

  async startMatch(playerDeck = null, opponentId = 'sugai_1200') {
    this.currentOpponent = OpponentPresets.find(o => o.id === opponentId) || OpponentPresets[0];
    this.boardConfig = BoardConfig.create(this.currentOpponent.boardPresetId);
    this.gameState = new GameState(this.boardConfig);

    this.clearBoardScene();
    this.sceneManager.setupCamera(this.boardConfig.cols, this.boardConfig.rows);

    const { boardGroup, cellMeshes } = BoardMeshBuilder.build(this.boardConfig);
    this.boardGroup = boardGroup;
    this.sceneManager.scene.add(this.boardGroup);
    this.sceneManager.setInteractiveMeshes(cellMeshes);

    const defaultDeck = DeckValidator.getSamplePreset(this.boardConfig, GameState.TURN.SENTE);
    this.spawnDeck(playerDeck || defaultDeck, GameState.TURN.SENTE);
    this.spawnDeck(this.currentOpponent.deck, GameState.TURN.GOTE);
  }

  spawnDeck(deckItems, owner) {
    for (const item of deckItems) {
      if (!BoardConfig.isWalkable(this.boardConfig, item.x, item.y)) continue;

      const pieceData = {
        name: item.pieceName,
        baseName: item.pieceName,
        owner: owner,
        isPromoted: false
      };
      this.gameState.setPiece(item.x, item.y, pieceData);

      const mesh = PieceMeshBuilder.createPieceMesh(item.pieceName, owner, false);
      const pos = this.gridToWorldPosition(item.x, item.y);
      mesh.position.set(pos.x, pos.y, pos.z);

      this.sceneManager.scene.add(mesh);
      this.pieceMeshes.set(`${item.x},${item.y}`, mesh);
    }
  }

  gridToWorldPosition(x, y) {
    const size = BoardMeshBuilder.CELL_SIZE;
    const ox = ((this.boardConfig.cols - 1) * size) / 2;
    const oz = ((this.boardConfig.rows - 1) * size) / 2;
    const cellH = BoardMeshBuilder.BASE_HEIGHT + BoardConfig.getHeight(this.boardConfig, x, y);

    return {
      x: x * size - ox,
      y: cellH + 0.14,
      z: y * size - oz
    };
  }

  handleCellClick(x, y) {
    if (this.isAiThinking || this.gameState.winner !== null) return;
    if (this.gameState.currentTurn !== GameState.TURN.SENTE) return;

    if (this.selectedCoord) {
      const move = this.currentLegalMoves.find(m => m.toX === x && m.toY === y);
      if (move) {
        this.executeMove(move);
        this.clearSelection();

        if (this.gameState.winner === null) {
          this.triggerAiTurn();
        }
        return;
      }
    }

    const piece = this.gameState.getPiece(x, y);
    if (piece && piece.owner === GameState.TURN.SENTE) {
      this.selectedCoord = { x, y };
      this.currentLegalMoves = RuleEngine.getLegalMoves(this.gameState, x, y);
      this.updateHighlights();
    } else {
      this.clearSelection();
    }
  }

  executeMove(move) {
    const fromKey = `${move.fromX},${move.fromY}`;
    const toKey = `${move.toX},${move.toY}`;

    if (!move.isIgai && this.pieceMeshes.has(toKey)) {
      const capMesh = this.pieceMeshes.get(toKey);
      this.sceneManager.scene.remove(capMesh);
      this.pieceMeshes.delete(toKey);
    }

    if (move.capturedSteps) {
      for (const st of move.capturedSteps) {
        const k = `${st.x},${st.y}`;
        if (this.pieceMeshes.has(k)) {
          const m = this.pieceMeshes.get(k);
          this.sceneManager.scene.remove(m);
          this.pieceMeshes.delete(k);
        }
      }
    }

    const mesh = this.pieceMeshes.get(fromKey);
    this.pieceMeshes.delete(fromKey);

    const destX = move.isIgai ? move.fromX : move.toX;
    const destY = move.isIgai ? move.fromY : move.toY;
    const pos = this.gridToWorldPosition(destX, destY);

    mesh.position.set(pos.x, pos.y, pos.z);
    this.pieceMeshes.set(`${destX},${destY}`, mesh);

    const res = this.gameState.applyMove(move);
    if (res.winner !== null) {
      this.handleGameOver(res.winner);
    }
  }

  async triggerAiTurn() {
    this.isAiThinking = true;
    const move = await SimpleAI.selectMove(this.gameState, this.currentOpponent.aiParams);
    if (move) {
      this.executeMove(move);
    } else {
      this.handleGameOver(GameState.TURN.SENTE);
    }
    this.isAiThinking = false;
  }

  async handleGameOver(winner) {
    const isPlayerWin = winner === GameState.TURN.SENTE;
    const saveData = await SecureStorage.load();

    const currentRate = saveData.rating || 1500;
    const { newRating, delta } = RatingSystem.calculate(currentRate, this.currentOpponent.rating, isPlayerWin);

    saveData.rating = newRating;
    saveData.stats = saveData.stats || { wins: 0, losses: 0 };

    if (isPlayerWin) {
      saveData.stats.wins++;
      saveData.coins = (saveData.coins || 0) + 150;
    } else {
      saveData.stats.losses++;
      saveData.coins = (saveData.coins || 0) + 30;
    }

    await SecureStorage.save(saveData);
    this.showGameOverModal(isPlayerWin, delta, newRating);
  }

  showGameOverModal(isPlayerWin, rateDelta, newRating) {
    const modalContainer = document.getElementById('modal-container');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay interactive';

    const rankName = RatingSystem.getRankName(newRating);
    const title = isPlayerWin ? '勝 礼' : '敗 礼';
    const color = isPlayerWin ? 'var(--accent-gold)' : 'var(--text-sub)';

    overlay.innerHTML = `
      <div class="modal-card" style="text-align:center;">
        <div style="font-family:var(--font-serif); font-size:32px; color:${color};">${title}</div>
        <div style="font-size:14px; margin:8px 0;">
          変動: ${rateDelta >= 0 ? '+' : ''}${rateDelta} (新レート: ${newRating})
        </div>
        <div style="font-size:12px; color:var(--text-sub); margin-bottom:16px;">
          段級位: ${rankName}
        </div>
        <button class="btn btn-primary" id="btn-return-menu">本陣へ戻る</button>
      </div>
    `;

    overlay.querySelector('#btn-return-menu').addEventListener('click', () => {
      overlay.remove();
      this.clearBoardScene();
      document.getElementById('menu-screen').classList.remove('hidden');
      this.uiManager.refreshHeader();
    });

    modalContainer.appendChild(overlay);
  }

  clearBoardScene() {
    for (const [, mesh] of this.pieceMeshes) {
      this.sceneManager.scene.remove(mesh);
      if (mesh.geometry) mesh.geometry.dispose();
    }
    this.pieceMeshes.clear();

    if (this.boardGroup) {
      this.sceneManager.scene.remove(this.boardGroup);
      this.boardGroup = null;
    }

    this.clearSelection();
  }

  clearSelection() {
    this.selectedCoord = null;
    this.currentLegalMoves = [];
    this.updateHighlights();
  }

  updateHighlights() {
    while (this.highlightGroup.children.length > 0) {
      const child = this.highlightGroup.children[0];
      this.highlightGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }

    if (!this.selectedCoord) return;

    this.addHighlightMesh(this.selectedCoord.x, this.selectedCoord.y, 0xc5a059, 0.45);

    for (const m of this.currentLegalMoves) {
      this.addHighlightMesh(m.toX, m.toY, 0x5a9e78, 0.55);
    }
  }

  addHighlightMesh(x, y, colorHex, opacity) {
    const size = BoardMeshBuilder.CELL_SIZE - 0.08;
    const geo = new THREE.PlaneGeometry(size, size);
    geo.rotateX(-Math.PI / 2);

    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    const pos = this.gridToWorldPosition(x, y);
    mesh.position.set(pos.x, pos.y + 0.02, pos.z);

    this.highlightGroup.add(mesh);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.unShogiApp = new UnShogiApp();
});