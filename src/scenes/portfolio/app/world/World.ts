import * as THREE from "three";

import App from "../App";
import Physics from "./Physics";
import Environment from "./Environments";
import Character from "./Character";
import { appStateStore } from "../utils/Store";

export default class World {
  app: App;
  physics: Physics;
  environment!: Environment;
  character: Character | null = null;

  private unsubscribeAppState: () => void = () => {};

  constructor() {
    this.app = new App();
    this.physics = new Physics();

    // create world classes
    this.unsubscribeAppState = appStateStore.subscribe((state) => {
      if (state.physicsReady) {
        console.log("physics ready");
        this.environment = new Environment();
        this.character = new Character();
      }
    });

    this.loop();
  }

  loop() {
    this.physics.loop();
    if (this.character) this.character.loop();
  }

  dispose() {
    this.unsubscribeAppState();
  }
}
