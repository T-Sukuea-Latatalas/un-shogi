import * as THREE from 'three';

export class ThreeScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.interactiveMeshes = [];
    this.onCellClick = null;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x121214);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.initLights();
    this.initEvents();
    this.resize();
  }

  initLights() {
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const dirLight = new THREE.DirectionalLight(0xfff8e7, 1.2);
    dirLight.position.set(10, 25, 15);
    this.scene.add(dirLight);
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('pointerdown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hits = this.raycaster.intersectObjects(this.interactiveMeshes, true);

      if (hits.length > 0) {
        let cur = hits[0].object;
        while (cur && !cur.userData.gridPos && cur.parent) cur = cur.parent;
        if (cur && cur.userData.gridPos && this.onCellClick) {
          this.onCellClick(cur.userData.gridPos.x, cur.userData.gridPos.y);
        }
      }
    });
  }

  setupCamera(cols, rows) {
    const maxDim = Math.max(cols, rows);
    this.camera.position.set(0, maxDim * 2.1, maxDim * 1.6);
    this.camera.lookAt(0, 0, 0);
  }

  setInteractiveMeshes(meshes) {
    this.interactiveMeshes = meshes;
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  startRenderLoop(callback) {
    const loop = (t) => {
      requestAnimationFrame(loop);
      if (callback) callback(t);
      this.renderer.render(this.scene, this.camera);
    };
    requestAnimationFrame(loop);
  }
}