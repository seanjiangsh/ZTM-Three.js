import * as THREE from "three";

import App from "../App";
import Physics from "./Physics";
import Environment from "./Environments";
import { appStateStore } from "../utils/Store";

export default class World {
  app: App;
  physics: Physics;
  environment!: Environment;

  constructor() {
    this.app = new App();
    this.physics = new Physics();

    // create world classes
    appStateStore.subscribe((state) => {
      if (state.physicsReady) {
        console.log("physics ready");
        this.environment = new Environment();
      }
    });

    // this.loop();
  }

  loop(deltaTime: number, elapsedTime: number) {
    this.physics.loop();
  }
}
