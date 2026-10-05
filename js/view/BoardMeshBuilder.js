import * as THREE from 'three';

export class BoardMeshBuilder {
  static CELL_SIZE = 1.6;
  static CELL_GAP = 0.04;
  static BASE_HEIGHT = 0.4;

  /**
   * 木目・和風モダンなプロシージャルテクスチャ生成
   */
  static createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#22201d';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#2d2a26';
    ctx.lineWidth = 2;
    for (let i = 0; i < 50; i++) {
      ctx.beginPath();
      const y = Math.random() * 512;
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(
        150, y + (Math.random() - 0.5) * 40,
        350, y + (Math.random() - 0.5) * 40,
        512, y + (Math.random() - 0.5) * 20
      );
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * 盤面メッシュ全体を生成
   * @param {Object} boardConfig
   * @returns {{ boardGroup: THREE.Group, cellMeshes: Array<THREE.Mesh> }}
   */
  static build(boardConfig) {
    const boardGroup = new THREE.Group();
    const cellMeshes = [];

    const woodTexture = this.createWoodTexture();
    const cellMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.6,
      metalness: 0.1
    });

    const borderMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f0e0d,
      roughness: 0.8
    });

    const size = this.CELL_SIZE;
    const offsetX = ((boardConfig.cols - 1) * size) / 2;
    const offsetZ = ((boardConfig.rows - 1) * size) / 2;

    for (let y = 0; y < boardConfig.rows; y++) {
      for (let x = 0; x < boardConfig.cols; x++) {
        const cellData = boardConfig.cells[y][x];
        if (cellData.isVoid) continue;

        const cellHeight = this.BASE_HEIGHT + cellData.height;
        const boxGeo = new THREE.BoxGeometry(
          size - this.CELL_GAP,
          cellHeight,
          size - this.CELL_GAP
        );

        const mesh = new THREE.Mesh(boxGeo, cellMaterial);
        const posX = x * size - offsetX;
        const posZ = y * size - offsetZ;
        const posY = cellHeight / 2;

        mesh.position.set(posX, posY, posZ);
        mesh.userData = {
          gridPos: { x, y },
          surfaceY: cellHeight
        };

        boardGroup.add(mesh);
        cellMeshes.push(mesh);
      }
    }

    // 台座（外枠）の生成
    const baseWidth = boardConfig.cols * size + 0.6;
    const baseDepth = boardConfig.rows * size + 0.6;
    const baseGeo = new THREE.BoxGeometry(baseWidth, this.BASE_HEIGHT * 0.8, baseDepth);
    const baseMesh = new THREE.Mesh(baseGeo, borderMaterial);
    baseMesh.position.set(0, (this.BASE_HEIGHT * 0.8) / 2 - 0.05, 0);
    boardGroup.add(baseMesh);

    return { boardGroup, cellMeshes };
  }
}