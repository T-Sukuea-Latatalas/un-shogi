import { SecureStorage } from "./storage/SecureStorage.js";
import { PieceCatalog } from "./features/PieceCatalog.js";
import { GachaSystem } from "./features/GachaSystem.js";
import { AchievementManager } from "./features/AchievementManager.js";
import { ThreeScene } from "./view/ThreeScene.js";
import { BoardMeshBuilder } from "./view/BoardMeshBuilder.js";
import { PieceMeshBuilder } from "./view/PieceMeshBuilder.js";
import { GameState } from "./engine/GameState.js";
import { RuleEngine } from "./engine/RuleEngine.js";
import { getBoardConfig } from "./engine/BoardConfig.js";
import { OPPONENT_PRESETS } from "./ai/OpponentPresets.js";
import { SimpleAI } from "./ai/SimpleAI.js";
import { RatingSystem } from "./engine/RatingSystem.js";
import { UIManager } from "./ui/UIManager.js";
import { DeckEditView } from "./ui/DeckEditView.js";

class Application {
    constructor() {
        this.storage = new SecureStorage();
        this.catalog = new PieceCatalog();
        this.gacha = new GachaSystem(this.storage, this.catalog);
        this.achievements = new AchievementManager(this.storage);
        this.rating = new RatingSystem(this.storage);

        this.canvas = document.getElementById("webgl-canvas");
        this.scene = new ThreeScene(this.canvas);
        this.boardBuilder = new BoardMeshBuilder(this.scene);
        this.pieceBuilder = new PieceMeshBuilder(this.scene);

        this.gameState = null;
        this.ruleEngine = null;
        this.ai = null;
        this.currentOpponent = null;

        this.ui = new UIManager(this);
        this.deckEditor = new DeckEditView(this);

        this.selectedTile = null;
        this.validMoves = [];
        this.isProcessingMove = false;
    }

    async initialize() {
        this.storage.load();
        this.catalog.initialize();
        this.scene.initialize();

        this.scene.onCellClicked = (x, z) => this.handleCellClick(x, z);

        this.ui.setupEvents();
        this.deckEditor.setupEvents();

        this.ui.hideLoading();
        this.ui.showScreen("title");
    }

    startBattle(opponentId) {
        this.currentOpponent = OPPONENT_PRESETS.find(op => op.id === opponentId) || OPPONENT_PRESETS[0];
        const boardConfig = getBoardConfig(this.currentOpponent.boardType);

        this.gameState = new GameState(boardConfig);
        this.ruleEngine = new RuleEngine(this.gameState);
        this.ai = new SimpleAI(this.ruleEngine, this.currentOpponent.difficulty);

        const playerDeck = this.storage.getCurrentDeck();
        this.gameState.setupInitialPlacement(playerDeck, this.currentOpponent.deck);

        this.boardBuilder.build(boardConfig);
        this.pieceBuilder.sync(this.gameState);

        this.ui.showScreen("game");
        this.ui.updateTurnIndicator(this.gameState.currentTurn);
    }

    async handleCellClick(x, z) {
        if (this.isProcessingMove) return;
        if (this.gameState.isGameOver) return;
        if (this.gameState.currentTurn !== "SENTE") return;

        const piece = this.gameState.getPieceAt(x, z);

        if (this.selectedTile) {
            const isMoveTarget = this.validMoves.some(m => m.toX === x && m.toZ === z);
            if (isMoveTarget) {
                await this.executeMove(this.selectedTile.x, this.selectedTile.z, x, z);
                return;
            }
        }

        if (piece && piece.owner === "SENTE") {
            this.selectedTile = { x, z };
            this.validMoves = this.ruleEngine.calculateLegalMoves(x, z);
            this.boardBuilder.highlightTiles(this.validMoves);
        } else {
            this.selectedTile = null;
            this.validMoves = [];
            this.boardBuilder.clearHighlights();
        }
    }

    async executeMove(fromX, fromZ, toX, toZ) {
        this.isProcessingMove = true;
        this.boardBuilder.clearHighlights();

        const moveResult = this.gameState.applyMove(fromX, fromZ, toX, toZ);
        await this.pieceBuilder.animateMove(fromX, fromZ, toX, toZ, moveResult);

        this.selectedTile = null;
        this.validMoves = [];

        if (this.gameState.checkVictory()) {
            this.handleGameEnd(this.gameState.winner);
            this.isProcessingMove = false;
            return;
        }

        this.gameState.switchTurn();
        this.ui.updateTurnIndicator(this.gameState.currentTurn);

        if (this.gameState.currentTurn === "GOTE") {
            await this.processAITurn();
        }

        this.isProcessingMove = false;
    }

    async processAITurn() {
        this.ui.setThinkingState(true);
        const bestMove = await this.ai.computeBestMove(this.gameState);
        this.ui.setThinkingState(false);

        if (bestMove) {
            const moveResult = this.gameState.applyMove(
                bestMove.fromX,
                bestMove.fromZ,
                bestMove.toX,
                bestMove.toZ
            );
            await this.pieceBuilder.animateMove(
                bestMove.fromX,
                bestMove.fromZ,
                bestMove.toX,
                bestMove.toZ,
                moveResult
            );

            if (this.gameState.checkVictory()) {
                this.handleGameEnd(this.gameState.winner);
                return;
            }

            this.gameState.switchTurn();
            this.ui.updateTurnIndicator(this.gameState.currentTurn);
        }
    }

    handleGameEnd(winner) {
        const isPlayerWin = winner === "SENTE";
        const rateChange = this.rating.updateAfterMatch(this.currentOpponent.rating, isPlayerWin);

        if (isPlayerWin) {
            this.storage.addCoins(100);
            this.achievements.trigger("WIN_BATTLE");
        }

        this.storage.save();
        this.ui.showResultModal({
            won: isPlayerWin,
            rateChange: rateChange,
            coins: isPlayerWin ? 100 : 20
        });
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const app = new Application();
    app.initialize().catch(err => {
        console.error("Initialization Failed:", err);
    });
});