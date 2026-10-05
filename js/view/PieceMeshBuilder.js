import * as THREE from 'three';

export class PieceMeshBuilder {
  static createPieceGeometry() {
    const shape = new THREE.Shape();
    // 将棋駒の五角形断面
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
   * 楷書体（Noto Serif JP）を用いた文字テクスチャ生成
   */
  static createTexture(text, isPromoted = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // 駒木肌色
    ctx.fillStyle = '#e4d3b6';
    ctx.fillRect(0, 0, 256, 256);

    // 文字の描画色（通常は漆黒、成りは朱色）
    ctx.fillStyle = isPromoted ? '#a62424' : '#181716';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 楷書・明朝フォント指定
    const fontName = '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif';

    if (text.length === 1) {
      ctx.font = `900 130px ${fontName}`;
      ctx.fillText(text, 128, 134);
    } else if (text.length === 2) {
      ctx.font = `900 86px ${fontName}`;
      ctx.fillText(text[0], 128, 86);
      ctx.fillText(text[1], 128, 172);
    } else {
      ctx.font = `900 62px ${fontName}`;
      ctx.fillText(text.slice(0, 2), 128, 92);
      ctx.fillText(text.slice(2), 128, 168);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  static createPieceMesh(pieceName, owner = 0, isPromoted = false) {
    const geo = this.createPieceGeometry();
    const faceTex = this.createTexture(pieceName, isPromoted);

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xdec69e, roughness: 0.5 });
    const faceMat = new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.5 });

    const mesh = new THREE.Mesh(geo, [bodyMat, faceMat]);
    mesh.rotation.y = owner === 0 ? 0 : Math.PI;

    mesh.userData = { pieceName, owner, isPromoted };
    return mesh;
  }

  /**
   * 既存メッシュのテクスチャを成駒用に差し替え
   */
  static updatePieceMeshTexture(mesh, pieceName, isPromoted) {
    const newTex = this.createTexture(pieceName, isPromoted);
    if (Array.isArray(mesh.material) && mesh.material[1]) {
      mesh.material[1].map.dispose();
      mesh.material[1].map = newTex;
      mesh.material[1].needsUpdate = true;
    }
    mesh.userData.pieceName = pieceName;
    mesh.userData.isPromoted = isPromoted;
  }
}