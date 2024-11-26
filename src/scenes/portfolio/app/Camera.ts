import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import App from "./App";
import { sizeStore } from "./utils/Store";

export default class Camera {
  instance!: THREE.PerspectiveCamera;
  controls!: OrbitControls;
  app: App;

  unsubscribeSize: () => void = () => {};

  constructor() {
    this.app = new App();
    this.setInstance();
    this.setControls();
    this.setResizeListener();
  }

  private setInstance() {
    const { aspect } = sizeStore.getState();
    this.instance = new THREE.PerspectiveCamera(35, aspect);
    this.instance.position.set(-80, 50, 80);
  }

  private setControls() {
    this.controls = new OrbitControls(this.instance, this.app.canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;
  }

  private setResizeListener() {
    this.unsubscribeSize = sizeStore.subscribe(({ aspect }) => {
      this.instance.aspect = aspect;
      this.instance.updateProjectionMatrix();
    });
  }

  loop() {
    this.controls.update();
  }

  dispose() {
    this.controls.dispose();
    this.instance.clear();
    this.unsubscribeSize();
  }
}
