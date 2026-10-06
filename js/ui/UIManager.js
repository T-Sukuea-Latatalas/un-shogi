import { SecureStorage } from '../storage/SecureStorage.js';
import { RatingSystem } from '../engine/RatingSystem.js';
import { OpponentPresets } from '../ai/OpponentPresets.js';
import { pieceRegistry } from '../data/originalPieces.js';
import { BoardConfig } from '../engine/BoardConfig.js';
import { DeckValidator } from '../engine/DeckValidator.js';
import { GachaSystem } from '../features/GachaSystem.js';
import { PieceCatalog } from '../features/PieceCatalog.js';

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

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(btn => {
      btn.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        btn.classList.add('active');

        const tid = btn.dataset.tab;
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.getElementById(tid).classList.add('active');

        if (tid === 'tab-deck') this.renderSubTab('gacha');
      });
    });

    document.querySelectorAll('.sub-nav-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.sub-nav-btn').forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        this.renderSubTab(b.dataset.sub);
      });
    });

    document.getElementById('btn-save-profile').addEventListener('click', async () => {
      const input = document.getElementById('profile-name-input');
      if (input.value.trim()) {
        this.saveData.playerName = input.value.trim();
        await SecureStorage.save(this.saveData);
        this.refreshHeader();
      }
    });

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
      rateEl.textContent = `レート ${this.saveData.rating || 1500} ${rankName}`;
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
          <span class="cpu-name">${opp.name}</span>
          <span class="cpu-desc">レート ${opp.rating}</span>
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

    if (subKey === 'gacha') {
      this.renderGacha(c);
    } else if (subKey === 'edit') {
      this.renderDeckEditor(c);
    } else if (subKey === 'catalog') {
      this.renderCatalog(c);
    }
  }

  renderGacha(container) {
    container.innerHTML = `
      <div class="gacha-panel">
        <div class="gacha-banner">
          <div class="gacha-title">招来</div>
          <div class="gacha-actions">
            <button class="btn" id="btn-gacha-single">単発 100銭</button>
            <button class="btn btn-primary" id="btn-gacha-ten">十連 1000銭</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-gacha-single').addEventListener('click', async () => {
      const res = await GachaSystem.rollSingle();
      if (!res.success) {
        alert(res.reason);
        return;
      }
      this.saveData = await SecureStorage.load();
      this.refreshHeader();
      this.showGachaModal(res.results);
    });

    container.querySelector('#btn-gacha-ten').addEventListener('click', async () => {
      const res = await GachaSystem.rollTen();
      if (!res.success) {
        alert(res.reason);
        return;
      }
      this.saveData = await SecureStorage.load();
      this.refreshHeader();
      this.showGachaModal(res.results);
    });
  }

  showGachaModal(pieces) {
    const modalContainer = document.getElementById('modal-container');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay interactive';

    const cardsHtml = pieces.map(p => `
      <div style="background:#222228; border:1px solid var(--border-color); border-radius:4px; padding:10px; text-align:center;">
        <div style="font-family:var(--font-serif); font-size:16px;">${p.name}</div>
        <div style="font-size:11px; color:var(--accent-gold);">${p.rarity}</div>
      </div>
    `).join('');

    overlay.innerHTML = `
      <div class="modal-card">
        <div class="card-title">招来結果</div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(64px, 1fr)); gap:6px;">
          ${cardsHtml}
        </div>
        <button class="btn btn-primary" id="btn-close-gacha">確認</button>
      </div>
    `;

    overlay.querySelector('#btn-close-gacha').addEventListener('click', () => {
      overlay.remove();
    });

    modalContainer.appendChild(overlay);
  }

  renderDeckEditor(container) {
    const standardBoard = BoardConfig.create(BoardConfig.PRESETS.STANDARD_9X9);
    this.currentDeck = this.saveData.customDeck || DeckValidator.getSamplePreset(standardBoard, 0);

    if (!this.currentDeck.some(p => p.x === 4 && p.y === 8 && p.pieceName === '王将')) {
      this.currentDeck = this.currentDeck.filter(p => !(p.x === 4 && p.y === 8));
      this.currentDeck.push({ pieceName: '王将', x: 4, y: 8 });
    }

    container.innerHTML = `
      <div class="deck-editor">
        <div class="card-title">自陣配置</div>
        <div class="territory-grid" id="territory-grid"></div>
        <div class="card-title">所持駒一覧</div>
        <div class="inventory-tray" id="inventory-tray"></div>
        <button class="btn btn-primary" id="btn-save-deck" style="width:100%; margin-top:8px;">布陣保存</button>
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

          const isKingFixed = (x === 4 && y === 8);
          if (isKingFixed) {
            cell.classList.add('locked-royal');
            cell.innerHTML = `<div>王将</div><div style="font-size:8px; color:var(--accent-gold);">固定</div>`;
          } else {
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
          }

          gridEl.appendChild(cell);
        }
      }
    };

    trayEl.innerHTML = '';
    for (const [name, count] of Object.entries(this.saveData.inventory || {})) {
      if (count <= 0) continue;
      if (name === '王将' || name === '玉将') continue;

      const pEl = document.createElement('div');
      pEl.className = 'tray-piece';
      pEl.innerHTML = `<div>${name.slice(0, 2)}</div><div style="font-size:9px; color:var(--text-sub);">x${count}</div>`;

      pEl.addEventListener('click', () => {
        if (!this.selectedTerritoryCell) return;
        if (this.selectedTerritoryCell.x === 4 && this.selectedTerritoryCell.y === 8) return;

        // 所持数上限チェック
        const alreadyPlaced = this.currentDeck.filter(item => item.pieceName === name).length;
        const availableCount = count - alreadyPlaced;

        if (availableCount <= 0) {
          const msgEl = container.querySelector('#deck-msg');
          if (msgEl) {
            msgEl.style.color = 'var(--accent-red)';
            msgEl.textContent = '所持数上限です';
          }
          return;
        }

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
    const catalog = PieceCatalog.getCatalogWithOwnership(this.saveData.inventory || {});
    const grid = document.createElement('div');
    grid.className = 'catalog-grid';

    for (const item of catalog) {
      const card = document.createElement('div');
      card.className = 'catalog-card';
      card.innerHTML = `
        <div class="catalog-card-name">${item.name.slice(0, 2)}</div>
        <div class="catalog-card-rarity">${item.rarity}</div>
        <div style="font-size:9px; color:var(--text-sub);">所持 ${item.ownedCount}</div>
      `;
      grid.appendChild(card);
    }

    container.appendChild(grid);
  }

  /**
   * 成り選択モーダルの表示
   */
  async promptPromotion(pieceName, promotesTo) {
    return new Promise(resolve => {
      const modalContainer = document.getElementById('modal-container');
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay interactive';

      overlay.innerHTML = `
        <div class="modal-card" style="text-align:center;">
          <div class="card-title">成の選択</div>
          <div style="font-size:15px; margin:12px 0;">
            ${pieceName} を ${promotesTo} に成りますか
          </div>
          <div style="display:flex; gap:12px; justify-content:center;">
            <button class="btn btn-primary" id="btn-promote-yes" style="flex:1;">成る</button>
            <button class="btn" id="btn-promote-no" style="flex:1;">不成</button>
          </div>
        </div>
      `;

      overlay.querySelector('#btn-promote-yes').addEventListener('click', () => {
        overlay.remove();
        resolve(true);
      });

      overlay.querySelector('#btn-promote-no').addEventListener('click', () => {
        overlay.remove();
        resolve(false);
      });

      modalContainer.appendChild(overlay);
    });
  }
}