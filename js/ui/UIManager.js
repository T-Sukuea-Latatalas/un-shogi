import { SecureStorage } from '../storage/SecureStorage.js';
import { RatingSystem } from '../engine/RatingSystem.js';
import { OpponentPresets } from '../ai/OpponentPresets.js';
import { pieceRegistry } from '../data/originalPieces.js';
import { BoardConfig } from '../engine/BoardConfig.js';
import { DeckValidator } from '../engine/DeckValidator.js';

export class UIManager {
  constructor(gameApp) {
    this.gameApp = gameApp;
    this.selectedTerritoryCell = null;
    this.currentDeck = [];
    this.saveData = null;

    this.init();
  }

  async init() {
    this.saveData = await SecureStorage.load();
    this.bindEvents();
    this.refreshHeader();
    this.renderCpuList();
  }

  bindEvents() {
    const startScreen = document.getElementById('start-screen');
    const menuScreen = document.getElementById('menu-screen');

    startScreen.addEventListener('click', () => {
      startScreen.classList.add('hidden');
      menuScreen.classList.remove('hidden');
    });

    // タブ切り替え
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(btn => {
      btn.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        btn.classList.add('active');

        const tid = btn.dataset.tab;
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.getElementById(tid).classList.add('active');

        if (tid === 'tab-deck') this.renderSubTab('edit');
      });
    });

    // サブタブ切り替え
    document.querySelectorAll('.sub-nav-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.sub-nav-btn').forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        this.renderSubTab(b.dataset.sub);
      });
    });

    // プロフィール保存
    document.getElementById('btn-save-profile').addEventListener('click', async () => {
      const input = document.getElementById('profile-name-input');
      if (input.value.trim()) {
        this.saveData.playerName = input.value.trim();
        await SecureStorage.save(this.saveData);
        this.refreshHeader();
      }
    });

    // 自由対戦開始
    document.getElementById('btn-start-match').addEventListener('click', () => {
      menuScreen.classList.add('hidden');
      this.gameApp.startMatch(this.saveData.customDeck, 'sugai_1200');
    });
  }

  refreshHeader() {
    if (!this.saveData) return;
    document.getElementById('player-name-display').textContent = this.saveData.playerName || '観戦者';
    document.getElementById('player-coins').textContent = `${this.saveData.coins || 0} 銭`;

    const rankName = RatingSystem.getRankName(this.saveData.rating || 1500);
    const rateEl = document.getElementById('player-rate-info');
    if (rateEl) {
      rateEl.textContent = `現在レート: ${this.saveData.rating || 1500} (${rankName})`;
    }

    const idEl = document.getElementById('player-id-display');
    if (idEl) idEl.textContent = (this.saveData.playerId || '').slice(0, 8);

    const recEl = document.getElementById('player-record-display');
    if (recEl) {
      const st = this.saveData.stats || { wins: 0, losses: 0 };
      recEl.textContent = `${st.wins}勝 ${st.losses}敗`;
    }
  }

  renderCpuList() {
    const listEl = document.getElementById('cpu-opponent-list');
    listEl.innerHTML = '';

    for (const opp of OpponentPresets) {
      const row = document.createElement('div');
      row.className = 'cpu-item';
      row.innerHTML = `
        <div class="cpu-meta">
          <span class="cpu-name">${opp.name} (${opp.rating})</span>
          <span class="cpu-desc">${opp.title}</span>
        </div>
        <button class="btn btn-primary" data-opp="${opp.id}">対局</button>
      `;

      row.querySelector('button').addEventListener('click', () => {
        document.getElementById('menu-screen').classList.add('hidden');
        this.gameApp.startMatch(this.saveData.customDeck, opp.id);
      });

      listEl.appendChild(row);
    }
  }

  renderSubTab(subKey) {
    const c = document.getElementById('sub-pane-container');
    c.innerHTML = '';

    if (subKey === 'edit') {
      this.renderDeckEditor(c);
    } else if (subKey === 'catalog') {
      this.renderCatalog(c);
    }
  }

  renderDeckEditor(container) {
    const standardBoard = BoardConfig.create(BoardConfig.PRESETS.STANDARD_9X9);
    this.currentDeck = this.saveData.customDeck || DeckValidator.getSamplePreset(standardBoard, 0);

    container.innerHTML = `
      <div class="deck-editor">
        <div class="card-title">自陣配置 (手前3段)</div>
        <div class="territory-grid" id="territory-grid"></div>
        <div class="card-title">所持駒一覧</div>
        <div class="inventory-tray" id="inventory-tray"></div>
        <button class="btn btn-primary" id="btn-save-deck" style="width:100%; margin-top:8px;">布陣を保存</button>
        <div id="deck-msg" style="font-size:12px; min-height:16px; margin-top:4px;"></div>
      </div>
    `;

    const gridEl = container.querySelector('#territory-grid');
    const trayEl = container.querySelector('#inventory-tray');

    const updateGrid = () => {
      gridEl.innerHTML = '';
      for (let y = 6; y <= 8; y++) {
        for (let x = 0; x < 9; x++) {
          const cell = document.createElement('div');
          cell.className = 'territory-cell';
          const p = this.currentDeck.find(item => item.x === x && item.y === y);
          if (p) cell.textContent = p.pieceName.slice(0, 2);

          cell.addEventListener('click', () => {
            if (this.selectedTerritoryCell && this.selectedTerritoryCell.x === x && this.selectedTerritoryCell.y === y) {
              this.currentDeck = this.currentDeck.filter(item => !(item.x === x && item.y === y));
              this.selectedTerritoryCell = null;
            } else {
              this.selectedTerritoryCell = { x, y };
            }
            updateGrid();
          });

          if (this.selectedTerritoryCell && this.selectedTerritoryCell.x === x && this.selectedTerritoryCell.y === y) {
            cell.classList.add('selected');
          }

          gridEl.appendChild(cell);
        }
      }
    };

    trayEl.innerHTML = '';
    for (const [name, count] of Object.entries(this.saveData.inventory || {})) {
      if (count <= 0) continue;
      const pEl = document.createElement('div');
      pEl.className = 'tray-piece';
      pEl.innerHTML = `<div>${name.slice(0, 2)}</div><div style="font-size:10px; color:var(--text-sub);">x${count}</div>`;

      pEl.addEventListener('click', () => {
        if (!this.selectedTerritoryCell) return;
        this.currentDeck = this.currentDeck.filter(
          item => !(item.x === this.selectedTerritoryCell.x && item.y === this.selectedTerritoryCell.y)
        );
        this.currentDeck.push({
          pieceName: name,
          x: this.selectedTerritoryCell.x,
          y: this.selectedTerritoryCell.y
        });
        this.selectedTerritoryCell = null;
        updateGrid();
      });

      trayEl.appendChild(pEl);
    }

    container.querySelector('#btn-save-deck').addEventListener('click', async () => {
      const v = DeckValidator.validate(this.currentDeck, standardBoard, 0);
      const msgEl = container.querySelector('#deck-msg');
      if (!v.valid) {
        msgEl.style.color = 'var(--accent-red)';
        msgEl.textContent = v.error;
        return;
      }
      this.saveData.customDeck = this.currentDeck;
      await SecureStorage.save(this.saveData);
      msgEl.style.color = 'var(--accent-gold)';
      msgEl.textContent = '布陣を保存しました';
    });

    updateGrid();
  }

  renderCatalog(container) {
    const grid = document.createElement('div');
    grid.className = 'catalog-grid';

    for (const [name, def] of pieceRegistry.entries()) {
      const card = document.createElement('div');
      card.className = 'catalog-card';
      card.innerHTML = `
        <div class="catalog-card-name">${name.slice(0, 2)}</div>
        <div class="catalog-card-rarity">${def.rarity}</div>
      `;
      grid.appendChild(card);
    }

    container.appendChild(grid);
  }
}