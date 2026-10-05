import { BoardConfig } from '../engine/BoardConfig.js';
import { DeckValidator } from '../engine/DeckValidator.js';
import { SecureStorage } from '../storage/SecureStorage.js';

export class DeckEditView {
  constructor(containerElement, onStartTestPlay) {
    this.container = containerElement;
    this.onStartTestPlay = onStartTestPlay;
    this.boardConfig = BoardConfig.create(BoardConfig.PRESETS.STANDARD_9X9);

    this.selectedTerritoryCell = null;
    this.currentDeck = []; // [{ pieceName, x, y }]
    this.saveData = null;
  }

  async render() {
    this.saveData = await SecureStorage.load();
    this.currentDeck = this.saveData.customDeck || DeckValidator.getSamplePreset(this.boardConfig, 0);

    this.container.innerHTML = `
      <div class="deck-editor">
        <div class="card-title">自陣配置 (手前3段)</div>
        <div class="territory-grid" id="territory-grid"></div>

        <div class="card-title">所持駒一覧</div>
        <div class="inventory-tray" id="inventory-tray"></div>

        <div style="display:flex; gap:8px; margin-top:8px;">
          <button class="btn btn-primary" id="btn-save-deck" style="flex:1;">配置保存</button>
          <button class="btn" id="btn-test-play" style="flex:1;">試運転</button>
        </div>
        <div id="deck-error-msg" style="font-size:12px; color:var(--accent-red); min-height:16px;"></div>
      </div>
    `;

    this.renderTerritoryGrid();
    this.renderInventoryTray();
    this.initEvents();
  }

  renderTerritoryGrid() {
    const gridEl = this.container.querySelector('#territory-grid');
    gridEl.innerHTML = '';

    // 自陣 3段 (y: 6, 7, 8)
    for (let y = 6; y <= 8; y++) {
      for (let x = 0; x < 9; x++) {
        const cell = document.createElement('div');
        cell.className = 'territory-cell';
        cell.dataset.x = x;
        cell.dataset.y = y;

        const piece = this.currentDeck.find(p => p.x === x && p.y === y);
        if (piece) {
          cell.textContent = piece.pieceName.slice(0, 2);
        }

        cell.addEventListener('click', () => {
          this.container.querySelectorAll('.territory-cell').forEach(c => c.classList.remove('selected'));
          if (this.selectedTerritoryCell && this.selectedTerritoryCell.x === x && this.selectedTerritoryCell.y === y) {
            // 再タップで駒解除
            this.currentDeck = this.currentDeck.filter(p => !(p.x === x && p.y === y));
            this.selectedTerritoryCell = null;
            this.renderTerritoryGrid();
          } else {
            this.selectedTerritoryCell = { x, y };
            cell.classList.add('selected');
          }
        });

        gridEl.appendChild(cell);
      }
    }
  }

  renderInventoryTray() {
    const trayEl = this.container.querySelector('#inventory-tray');
    trayEl.innerHTML = '';

    const inventory = this.saveData.inventory || {};

    for (const [name, count] of Object.entries(inventory)) {
      if (count <= 0) continue;

      const pieceEl = document.createElement('div');
      pieceEl.className = 'tray-piece';
      pieceEl.innerHTML = `<div>${name.slice(0, 2)}</div><div style="font-size:10px; color:var(--text-sub)">x${count}</div>`;

      pieceEl.addEventListener('click', () => {
        if (!this.selectedTerritoryCell) {
          this.setError('配置するマスを選択してください');
          return;
        }

        // 既存のマス配置を上書き
        this.currentDeck = this.currentDeck.filter(
          p => !(p.x === this.selectedTerritoryCell.x && p.y === this.selectedTerritoryCell.y)
        );

        this.currentDeck.push({
          pieceName: name,
          x: this.selectedTerritoryCell.x,
          y: this.selectedTerritoryCell.y
        });

        this.setError('');
        this.selectedTerritoryCell = null;
        this.renderTerritoryGrid();
      });

      trayEl.appendChild(pieceEl);
    }
  }

  initEvents() {
    const saveBtn = this.container.querySelector('#btn-save-deck');
    const testBtn = this.container.querySelector('#btn-test-play');

    saveBtn.addEventListener('click', async () => {
      const validation = DeckValidator.validate(this.currentDeck, this.boardConfig, 0);
      if (!validation.valid) {
        this.setError(validation.error);
        return;
      }

      this.saveData.customDeck = this.currentDeck;
      await SecureStorage.save(this.saveData);
      this.setError('配置を保存しました');
    });

    testBtn.addEventListener('click', () => {
      const validation = DeckValidator.validate(this.currentDeck, this.boardConfig, 0);
      if (!validation.valid) {
        this.setError(validation.error);
        return;
      }
      if (this.onStartTestPlay) {
        this.onStartTestPlay(this.currentDeck);
      }
    });
  }

  setError(msg) {
    const errEl = this.container.querySelector('#deck-error-msg');
    if (errEl) errEl.textContent = msg;
  }
}