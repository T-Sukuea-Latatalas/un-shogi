import * as THREE from 'three';

export class PieceMeshBuilder {
  static createPieceGeometry() {
    const shape = new THREE.Shape();
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

  static createTexture(text, isPromoted) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#e4d3b6';
    ctx.fillRect(0, 0, 256, 256);

    ctx.fillStyle = isPromoted ? '#9e2a2b' : '#1c1b1a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 90px "Hiragino Mincho ProN", "Yu Mincho", serif';
    ctx.fillText(text[0] || '', 128, 86);
    ctx.fillText(text[1] || '', 128, 174);

    return new THREE.CanvasTexture(canvas);
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
}