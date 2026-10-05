import * as THREE from 'three';

export class ThreeScene {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.boardConfig = null;
    this.interactiveMeshes = [];
    this.onCellClick = null;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x141416);

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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xfff8e7, 1.2);
    directionalLight.position.set(10, 25, 15);
    this.scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xb0c4de, 0.4);
    fillLight.position.set(-10, 15, -15);
    this.scene.add(fillLight);
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    this.canvas.addEventListener('pointerdown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.interactiveMeshes, true);

      if (intersects.length > 0) {
        let current = intersects[0].object;
        while (current && !current.userData.gridPos && current.parent) {
          current = current.parent;
        }

        if (current && current.userData.gridPos && this.onCellClick) {
          this.onCellClick(current.userData.gridPos.x, current.userData.gridPos.y);
        }
      }
    });
  }

  setupCamera(boardCols, boardRows) {
    const maxDim = Math.max(boardCols, boardRows);
    this.camera.position.set(0, maxDim * 2.1, maxDim * 1.6);
    this.camera.lookAt(0, 0, 0);
  }

  setInteractiveMeshes(meshes) {
    this.interactiveMeshes = meshes;
  }

  resize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  startRenderLoop(updateCallback) {
    const loop = (time) => {
      requestAnimationFrame(loop);
      if (updateCallback) {
        updateCallback(time);
      }
      this.renderer.render(this.scene, this.camera);
    };
    requestAnimationFrame(loop);
  }
}