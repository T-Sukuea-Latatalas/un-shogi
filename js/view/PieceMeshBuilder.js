import * as THREE from 'three';

export class PieceMeshBuilder {
  /**
   * 将棋駒の五角形ボディジオメトリを生成
   */
  static createPieceGeometry() {
    const shape = new THREE.Shape();
    // 駒の五角形輪郭
    shape.moveTo(-0.44, 0);
    shape.lineTo(0.44, 0);
    shape.lineTo(0.50, 0.95);
    shape.lineTo(0, 1.25);
    shape.lineTo(-0.50, 0.95);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: 0.28,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2
    });
    geo.center();
    geo.rotateX(-Math.PI / 2);
    return geo;
  }

  /**
   * 駒名を描画した高解像度CanvasTextureを生成
   * @param {string} text 駒名
   * @param {boolean} isPromoted 成駒フラグ（赤文字）
   * @returns {THREE.CanvasTexture}
   */
  static createTexture(text, isPromoted = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 512, 512);

    ctx.fillStyle = isPromoted ? '#b32424' : '#141312';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fontFamily = '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", "MS Mincho", serif';

    if (text.length === 1) {
      ctx.font = `900 290px ${fontFamily}`;
      ctx.fillText(text, 256, 256);
    } else if (text.length === 2) {
      ctx.font = `900 185px ${fontFamily}`;
      // 2文字を五角形の中心バランスに合わせて上下配置
      ctx.fillText(text[0], 256, 160);
      ctx.fillText(text[1], 256, 352);
    } else {
      ctx.font = `900 135px ${fontFamily}`;
      ctx.fillText(text.slice(0, 2), 256, 170);
      ctx.fillText(text.slice(2), 256, 342);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * 駒メッシュ（土台ボディ + 最適化UVテキストプレート）を構築
   * @param {string} pieceName 駒名
   * @param {number} owner 0: 先手, 1: 後手
   * @param {boolean} isPromoted 成駒フラグ
   * @returns {THREE.Mesh}
   */
  static createPieceMesh(pieceName, owner = 0, isPromoted = false) {
    const bodyGeo = this.createPieceGeometry();
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xdec69e,
      roughness: 0.45,
      metalness: 0.05
    });

    const pieceMesh = new THREE.Mesh(bodyGeo, bodyMat);

    // 駒の上面に重ねるテキストプレート（PlaneGeometry）
    const labelGeo = new THREE.PlaneGeometry(0.88, 1.16);
    labelGeo.rotateX(-Math.PI / 2);

    const labelTex = this.createTexture(pieceName, isPromoted);
    const labelMat = new THREE.MeshBasicMaterial({
      map: labelTex,
      transparent: true,
      depthWrite: false,
      depthTest: true
    });

    const labelMesh = new THREE.Mesh(labelGeo, labelMat);

    // 駒の厚み0.28の上面（Y = +0.15）および五角形重心（Z = +0.02）に配置
    labelMesh.position.set(0, 0.15, 0.02);
    labelMesh.name = 'pieceLabel';

    pieceMesh.add(labelMesh);

    // 先手は南向き（回転0）、後手は北向き（180度回転）
    pieceMesh.rotation.y = owner === 0 ? 0 : Math.PI;

    pieceMesh.userData = {
      pieceName,
      owner,
      isPromoted
    };

    return pieceMesh;
  }

  /**
   * 成り発生時にテキストプレートのテクスチャを更新
   */
  static updatePieceMeshTexture(pieceMesh, newPieceName, isPromoted = true) {
    const labelMesh = pieceMesh.getObjectByName('pieceLabel');
    if (labelMesh && labelMesh.material) {
      if (labelMesh.material.map) {
        labelMesh.material.map.dispose();
      }
      labelMesh.material.map = this.createTexture(newPieceName, isPromoted);
      labelMesh.material.needsUpdate = true;
    }
    pieceMesh.userData.pieceName = newPieceName;
    pieceMesh.userData.isPromoted = isPromoted;
  }
}
