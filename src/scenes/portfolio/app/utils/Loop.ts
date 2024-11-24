import App from "../App";

export default class Loop {
  app: App;
  animationFrameId!: number;

  constructor() {
    this.app = new App();
    this.loop();
  }

  loop() {
    const { camera, renderer, world } = this.app;
    camera.loop();
    renderer.loop();
    world.loop();
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  dispose() {
    cancelAnimationFrame(this.animationFrameId);
  }
}
