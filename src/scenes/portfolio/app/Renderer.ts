import * as THREE from "three";

import App from "./App";
import { sizeStore } from "./utils/Store";

export default class Renderer {
  instance!: THREE.WebGLRenderer;
  app: App;
  sizes = sizeStore.getState();

  unsubscribeSize: () => void = () => {};

  constructor() {
    this.app = new App();
    this.setInstance();
    this.setResizeListener();
  }

  private setInstance() {
    const { canvas } = this.app;
    const { width, height, pixelRatio } = this.sizes;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(pixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    this.instance = renderer;
  }

  private setResizeListener() {
    this.unsubscribeSize = sizeStore.subscribe(
      ({ width, height, pixelRatio }) => {
        this.instance.setSize(width, height);
        this.instance.setPixelRatio(pixelRatio);
      }
    );
  }

  loop() {
    const { scene, camera } = this.app;
    this.instance.render(scene, camera.instance);
  }

  dispose() {
    this.instance.dispose();
    this.unsubscribeSize();
  }
}
