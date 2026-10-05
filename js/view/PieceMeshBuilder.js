import * as THREE from 'three';

export class PieceMeshBuilder {
  /**
   * 将棋駒の五角形幾何を生成
   */
  static createPieceGeometry() {
    const shape = new THREE.Shape();
    const halfBase = 0.44;
    const halfShoulder = 0.50;
    const shoulderY = 0.95;
    const topY = 1.25;

    shape.moveTo(-halfBase, 0);
    shape.lineTo(halfBase, 0);
    shape.lineTo(halfShoulder, shoulderY);
    shape.lineTo(0, topY);
    shape.lineTo(-halfShoulder, shoulderY);
    shape.closePath();

    const extrudeSettings = {
      steps: 1,
      depth: 0.28,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    geometry.rotateX(-Math.PI / 2); // 盤面に水平に寝かせる
    return geometry;
  }

  /**
   * 駒表面の文字テクスチャをCanvasで動的生成
   */
  static createPieceTexture(text, isPromoted = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // 駒木地色
    ctx.fillStyle = '#e8d5b5';
    ctx.fillRect(0, 0, 256, 256);

    // 文字の描画
    ctx.fillStyle = isPromoted ? '#a62424' : '#1a1918';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (text.length === 1) {
      ctx.font = 'bold 130px "Hiragino Mincho ProN", "Yu Mincho", serif';
      ctx.fillText(text, 128, 134);
    } else if (text.length === 2) {
      ctx.font = 'bold 88px "Hiragino Mincho ProN", "Yu Mincho", serif';
      ctx.fillText(text[0], 128, 86);
      ctx.fillText(text[1], 128, 174);
    } else {
      ctx.font = 'bold 64px "Hiragino Mincho ProN", "Yu Mincho", serif';
      ctx.fillText(text.slice(0, 2), 128, 92);
      ctx.fillText(text.slice(2), 128, 168);
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * 駒メッシュを生成
   * @param {string} pieceName 表示する駒名
   * @param {number} owner 0: 先手, 1: 後手
   * @param {boolean} isPromoted 成駒フラグ
   * @returns {THREE.Mesh}
   */
  static createPieceMesh(pieceName, owner = 0, isPromoted = false) {
    const geometry = this.createPieceGeometry();
    const texture = this.createPieceTexture(pieceName, isPromoted);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xdec69e,
      roughness: 0.5,
      metalness: 0.05
    });

    const faceMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.5,
      metalness: 0.05
    });

    // 上下面に文字テクスチャ、側面に木地色
    const materials = [bodyMaterial, faceMaterial];

    // ExtrudeGeometryの面判定: faceIndex 0が側面、1が蓋面
    const mesh = new THREE.Mesh(geometry, materials);

    // 先手は南向き(回転0)、後手は北向き(180度回転)
    mesh.rotation.y = owner === 0 ? 0 : Math.PI;

    mesh.userData = {
      pieceName,
      owner,
      isPromoted
    };

    return mesh;
  }
}