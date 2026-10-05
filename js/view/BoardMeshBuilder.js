import * as THREE from 'three';

export class BoardMeshBuilder {
  static CELL_SIZE = 1.6;
  static CELL_GAP = 0.04;
  static BASE_HEIGHT = 0.4;

  static createTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#22201d';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#2b2824';
    ctx.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * 256);
      ctx.lineTo(256, Math.random() * 256);
      ctx.stroke();
    }
    return new THREE.CanvasTexture(c);
  }

  static build(boardConfig) {
    const boardGroup = new THREE.Group();
    const cellMeshes = [];
    const mat = new THREE.MeshStandardMaterial({
      map: this.createTexture(),
      roughness: 0.6
    });

    const size = this.CELL_SIZE;
    const ox = ((boardConfig.cols - 1) * size) / 2;
    const oz = ((boardConfig.rows - 1) * size) / 2;

    for (let y = 0; y < boardConfig.rows; y++) {
      for (let x = 0; x < boardConfig.cols; x++) {
        const cell = boardConfig.cells[y][x];
        if (cell.isVoid) continue;

        const h = this.BASE_HEIGHT + cell.height;
        const geo = new THREE.BoxGeometry(size - this.CELL_GAP, h, size - this.CELL_GAP);
        const mesh = new THREE.Mesh(geo, mat);

        mesh.position.set(x * size - ox, h / 2, y * size - oz);
        mesh.userData = { gridPos: { x, y } };

        boardGroup.add(mesh);
        cellMeshes.push(mesh);
      }
    }

    return { boardGroup, cellMeshes };
  }
}