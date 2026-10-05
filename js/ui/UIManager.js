import { SecureStorage } from '../storage/SecureStorage.js';
import { GachaSystem } from '../features/GachaSystem.js';
import { PieceCatalog } from '../features/PieceCatalog.js';
import { AchievementManager } from '../features/AchievementManager.js';
import { DeckEditView } from './DeckEditView.js';

export class UIManager {
  constructor(gameApp) {
    this.gameApp = gameApp;
    this.root = document.getElementById('ui-layer');
    this.saveData = null;
    this.deckEditView = null;

    this.initStructure();
  }

  async initStructure() {
    this.root.innerHTML = `
      <div id="start-screen" class="interactive">
        <div class="title-logo">否将棋</div>
        <div class="subtitle">UN-SHOGI</div>
        <div class="tap-indicator">画面をタップして開始</div>
      </div>

      <div id="menu-screen" class="hidden">
        <div class="top-bar interactive">
          <div class="player-info">
            <div class="avatar-badge" id="avatar-icon">王</div>
            <span class="player-name" id="player-name-display">観戦者</span>
          </div>
          <div class="currency-badge" id="player-coins">0 銭</div>
        </div>

        <div class="tab-content-area interactive">
          <!-- 編成・獲得 (左) -->
          <div id="tab-deck" class="tab-pane">
            <div class="sub-nav-bar">
              <button class="sub-nav-btn active" data-sub="gacha">招来</button>
              <button class="sub-nav-btn" data-sub="edit">布陣</button>
              <button class="sub-nav-btn" data-sub="catalog">図鑑</button>
            </div>
            <div id="sub-pane-container"></div>
          </div>

          <!-- 対局 (中央・初期選択) -->
          <div id="tab-battle" class="tab-pane active">
            <div class="section-card">
              <div class="card-title">段位対局</div>
              <div style="font-size:13px; color:var(--text-sub); margin-bottom:12px;">現在レート: 1500 (初段)</div>
              <button class="btn btn-primary" id="btn-start-match" style="width:100%;">自由対戦 開始</button>
            </div>

            <div class="section-card">
              <div class="card-title">演習相手 (CPU)</div>
              <div class="cpu-select-list">
                <div class="cpu-item">
                  <div class="cpu-meta">
                    <span class="cpu-name">木偶 (初等)</span>
                    <span class="cpu-desc">定跡に囚われない一手</span>
                  </div>
                  <button class="btn" data-cpu="1">対局</button>
                </div>
                <div class="cpu-item">
                  <div class="cpu-meta">
                    <span class="cpu-name">機巧 (中等)</span>
                    <span class="cpu-desc">盤面優位を堅実に維持</span>
                  </div>
                  <button class="btn" data-cpu="2">対局</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 記録 (右) -->
          <div id="tab-record" class="tab-pane">
            <div class="section-card">
              <div class="card-title">遊歴譜</div>
              <div class="profile-field">
                <span style="font-size:13px;">名乗り</span>
                <input type="text" class="profile-input" id="profile-name-input" maxlength="8">
              </div>
              <div class="profile-field">
                <span style="font-size:13px;">識別符</span>
                <span id="player-id-display" style="font-size:11px; color:var(--text-sub);"></span>
              </div>
              <div class="profile-field">
                <span style="font-size:13px;">戦績</span>
                <span id="player-record-display" style="font-size:13px;">0勝 0敗</span>
              </div>
              <button class="btn" id="btn-save-profile" style="width:100%; margin-top:8px;">名乗りを改める</button>
            </div>

            <div class="section-card">
              <div class="card-title">功績</div>
              <div class="achievement-list" id="achievement-list"></div>
            </div>
          </div>
        </div>

        <nav class="bottom-nav interactive">
          <button class="nav-item" data-tab="tab-deck">編成・獲得</button>
          <button class="nav-item active" data-tab="tab-battle">対局</button>
          <button class="nav-item" data-tab="tab-record">記録</button>
        </nav>
      </div>

      <div id="modal-container"></div>
    `;

    this.initEvents();
  }

  initEvents() {
    const startScreen = this.root.querySelector('#start-screen');
    const menuScreen = this.root.querySelector('#menu-screen');

    startScreen.addEventListener('click', async () => {
      this.saveData = await SecureStorage.load();
      this.refreshHeader();
      startScreen.classList.add('hidden');
      menuScreen.classList.remove('hidden');
    });

    // メインタブ切り替え
    const navItems = this.root.querySelectorAll('.nav-item');
    navItems.forEach(btn => {
      btn.addEventListener('click', () => {
        navItems.forEach(n => n.classList.remove('active'));
        btn.classList.add('active');

        const targetId = btn.dataset.tab;
        this.root.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        this.root.querySelector(`#${targetId}`).classList.add('active');

        if (targetId === 'tab-deck') {
          this.switchSubTab('gacha');
        } else if (targetId === 'tab-record') {
          this.refreshRecordTab();
        }
      });
    });

    // サブタブ切り替え (編成・獲得)
    const subNavBtns = this.root.querySelectorAll('.sub-nav-btn');
    subNavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        subNavBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.switchSubTab(btn.dataset.sub);
      });
    });

    // プロフィール保存
    this.root.querySelector('#btn-save-profile').addEventListener('click', async () => {
      const input = this.root.querySelector('#profile-name-input');
      if (input.value.trim()) {
        this.saveData.playerName = input.value.trim();
        await SecureStorage.save(this.saveData);
        this.refreshHeader();
      }
    });

    // 自由対戦開始
    this.root.querySelector('#btn-start-match').addEventListener('click', () => {
      menuScreen.classList.add('hidden');
      if (this.gameApp && this.gameApp.startMatch) {
        this.gameApp.startMatch(this.saveData.customDeck);
      }
    });
  }

  refreshHeader() {
    if (!this.saveData) return;
    this.root.querySelector('#player-name-display').textContent = this.saveData.playerName || '観戦者';
    this.root.querySelector('#player-coins').textContent = `${this.saveData.coins} 銭`;
  }

  switchSubTab(subKey) {
    const container = this.root.querySelector('#sub-pane-container');
    container.innerHTML = '';

    if (subKey === 'gacha') {
      this.renderGachaPanel(container);
    } else if (subKey === 'edit') {
      this.deckEditView = new DeckEditView(container, (testDeck) => {
        this.root.querySelector('#menu-screen').classList.add('hidden');
        if (this.gameApp && this.gameApp.startMatch) {
          this.gameApp.startMatch(testDeck);
        }
      });
      this.deckEditView.render();
    } else if (subKey === 'catalog') {
      this.renderCatalogPanel(container);
    }
  }

  renderGachaPanel(container) {
    container.innerHTML = `
      <div class="gacha-panel">
        <div class="gacha-banner">
          <div class="gacha-title">百獣招来 獅子祭</div>
          <div style="font-size:12px; color:var(--text-sub); margin-bottom:16px;">
            限定提供: 獅子・獅鷹・大将
          </div>
          <div class="gacha-actions">
            <button class="btn" id="btn-roll-single">単発 (100銭)</button>
            <button class="btn btn-primary" id="btn-roll-ten">十連 (1000銭)</button>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-roll-single').addEventListener('click', async () => {
      const res = await GachaSystem.rollSingle('SHI_SHI_FEST');
      if (!res.success) {
        alert(res.reason);
        return;
      }
      this.refreshHeader();
      this.showGachaResultModal(res.results);
    });

    container.querySelector('#btn-roll-ten').addEventListener('click', async () => {
      const res = await GachaSystem.rollTen('SHI_SHI_FEST');
      if (!res.success) {
        alert(res.reason);
        return;
      }
      this.refreshHeader();
      this.showGachaResultModal(res.results);
    });
  }

  renderCatalogPanel(container) {
    const catalog = PieceCatalog.getCatalogWithOwnership(this.saveData.inventory || {});
    const grid = document.createElement('div');
    grid.className = 'catalog-grid';

    for (const item of catalog) {
      const card = document.createElement('div');
      card.className = `catalog-card ${item.isOwned ? '' : 'unowned'}`;
      card.innerHTML = `
        <div class="catalog-card-name">${item.name.slice(0, 2)}</div>
        <div class="catalog-card-rarity">${item.rarity}</div>
      `;
      card.addEventListener('click', () => {
        this.showPieceDetailModal(item);
      });
      grid.appendChild(card);
    }

    container.appendChild(grid);
  }

  async refreshRecordTab() {
    this.saveData = await SecureStorage.load();
    this.root.querySelector('#profile-name-input').value = this.saveData.playerName || '観戦者';
    this.root.querySelector('#player-id-display').textContent = this.saveData.playerId.slice(0, 8);
    this.root.querySelector('#player-record-display').textContent =
      `${this.saveData.stats.wins || 0}勝 ${this.saveData.stats.losses || 0}敗`;

    const listEl = this.root.querySelector('#achievement-list');
    listEl.innerHTML = '';

    const list = await AchievementManager.getAllStatus();
    for (const ach of list) {
      const item = document.createElement('div');
      item.className = 'achievement-item';

      let actionHtml = '';
      if (ach.isClaimed) {
        actionHtml = '<span style="font-size:12px; color:var(--text-sub);">受領済</span>';
      } else if (ach.isAccomplished) {
        actionHtml = `<button class="btn btn-primary btn-claim" data-id="${ach.id}" style="padding:4px 10px; font-size:11px;">受取</button>`;
      } else {
        actionHtml = '<span style="font-size:12px; color:var(--border-color);">未達成</span>';
      }

      item.innerHTML = `
        <div class="achieve-meta">
          <span class="achieve-title">${ach.title}</span>
          <span class="achieve-reward">${ach.desc} (+${ach.rewardCoins}銭)</span>
        </div>
        <div>${actionHtml}</div>
      `;

      listEl.appendChild(item);
    }

    listEl.querySelectorAll('.btn-claim').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const res = await AchievementManager.claim(id);
        if (res.success) {
          this.refreshHeader();
          this.refreshRecordTab();
        }
      });
    });
  }

  showGachaResultModal(pieces) {
    const modalContainer = this.root.querySelector('#modal-container');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay interactive';

    const cardHtml = pieces.map(p => `
      <div style="background:#222228; border:1px solid #3a3a42; border-radius:4px; padding:10px; text-align:center;">
        <div style="font-family:var(--font-serif); font-size:16px;">${p.name}</div>
        <div style="font-size:11px; color:var(--accent-gold);">${p.rarity}</div>
      </div>
    `).join('');

    overlay.innerHTML = `
      <div class="modal-card">
        <div class="card-title">招来結果</div>
        <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:6px;">
          ${cardHtml}
        </div>
        <button class="btn btn-primary" id="btn-close-modal">確認</button>
      </div>
    `;

    overlay.querySelector('#btn-close-modal').addEventListener('click', () => {
      overlay.remove();
    });

    modalContainer.appendChild(overlay);
  }

  showPieceDetailModal(item) {
    const modalContainer = this.root.querySelector('#modal-container');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay interactive';

    overlay.innerHTML = `
      <div class="modal-card">
        <div class="card-title">${item.name} (${item.rarity})</div>
        <div style="font-size:13px; line-height:1.6;">
          <div>成り先: ${item.promotesTo || '成らず'}</div>
          <div>所持数: ${item.ownedCount}</div>
        </div>
        <button class="btn" id="btn-close-detail">閉じる</button>
      </div>
    `;

    overlay.querySelector('#btn-close-detail').addEventListener('click', () => {
      overlay.remove();
    });

    modalContainer.appendChild(overlay);
  }
}