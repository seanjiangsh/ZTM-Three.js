import * as THREE from "three";

import App from "../App";

export default class Loop {
  app: App;
  animationFrameId!: number;
  clock: THREE.Clock;
  prviousElapsedTime: number = 0;

  constructor() {
    this.app = new App();
    this.clock = new THREE.Clock();
    this.prviousElapsedTime = 0;

    this.loop();
  }

  loop() {
    const elapsedTime = this.clock.getElapsedTime();
    const deltaTime = elapsedTime - this.prviousElapsedTime;
    this.prviousElapsedTime = elapsedTime;

    const { camera, renderer, world } = this.app;
    camera.loop();
    renderer.loop();
    world.loop(elapsedTime, deltaTime);
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
    this.prviousElapsedTime = 0;
    this.clock.stop();
  }
}
