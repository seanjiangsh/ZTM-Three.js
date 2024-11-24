import * as THREE from "three";

import App from "./App";
import { sizeStore } from "./utils/Store";

export default class Renderer {
  instance!: THREE.WebGLRenderer;
  app: App;
  sizes = sizeStore.getState();

  constructor() {
    this.app = new App();
    this.setInstance();
    this.setResizeListener();
  }

  private setInstance() {
    const { canvas } = this.app;
    const { width, height, pixelRatio } = this.sizes;

    this.instance = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.instance.setSize(width, height);
    this.instance.setPixelRatio(pixelRatio);
  }

  private setResizeListener() {
    sizeStore.subscribe(({ width, height, pixelRatio }) => {
      this.instance.setSize(width, height);
      this.instance.setPixelRatio(pixelRatio);
    });
  }

  loop() {
    const { scene, camera } = this.app;
    this.instance.render(scene, camera.instance);
  }

  dispose() {
    this.instance.dispose();
  }
}
