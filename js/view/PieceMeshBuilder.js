import * as THREE from 'three';

export class PieceMeshBuilder {
  /**
   * 将棋駒の五角形ボディジオメトリを生成
   */
  static createPieceGeometry() {
    const shape = new THREE.Shape();
    // 将棋駒の五角形輪郭
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

    // 透過背景
    ctx.clearRect(0, 0, 512, 512);

    // 文字色の設定（通常: 漆黒, 成駒: 朱赤）
    ctx.fillStyle = isPromoted ? '#b32424' : '#141312';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fontFamily = '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", "MS Mincho", serif';

    if (text.length === 1) {
      ctx.font = `900 280px ${fontFamily}`;
      ctx.fillText(text, 256, 256);
    } else if (text.length === 2) {
      ctx.font = `900 180px ${fontFamily}`;
      // 五角形の上下バランスに合わせて中央配置
      ctx.fillText(text[0], 256, 165);
      ctx.fillText(text[1], 256, 350);
    } else {
      ctx.font = `900 130px ${fontFamily}`;
      ctx.fillText(text.slice(0, 2), 256, 175);
      ctx.fillText(text.slice(2), 256, 345);
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

    // 駒の上面に重ねるテキストプレート
    const labelGeo = new THREE.PlaneGeometry(0.86, 1.12);
    labelGeo.rotateX(-Math.PI / 2);

    const labelTex = this.createTexture(pieceName, isPromoted);
    const labelMat = new THREE.MeshBasicMaterial({
      map: labelTex,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });

    const labelMesh = new THREE.Mesh(labelGeo, labelMat);

    // 駒上面（Y=0.175）および五角形中央（Z=0.05）に確実に配置
    labelMesh.position.set(0, 0.175, 0.05);
    labelMesh.name = 'pieceLabel';

    pieceMesh.add(labelMesh);

    // 先手は南向き（0度）、後手は北向き（180度）
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
