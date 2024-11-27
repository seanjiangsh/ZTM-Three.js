import App from "../App";
import Physics from "./Physics";
import Environment from "./Environments";
import Character from "./Character";
import CharacterController from "./Character-controller";
import { appStateStore } from "../utils/Store";

export default class World {
  app: App;
  physics: Physics;
  environment!: Environment;
  character: Character | null = null;
  characterController: CharacterController | null = null;

  private unsubscribeAppState: () => void = () => {};

  constructor() {
    this.app = new App();
    this.physics = new Physics();

    // create world classes
    this.unsubscribeAppState = appStateStore.subscribe((state) => {
      const { physicsReady, assetsReady } = state;
      if (physicsReady && assetsReady) {
        this.environment = new Environment();
        this.character = new Character();
        this.characterController = new CharacterController();
      }
    });
  }

  loop(elapsedTime: number, deltaTime: number) {
    const { physics, characterController } = this;
    physics.loop();
    if (characterController) characterController.loop(deltaTime);
  }

  dispose() {
    this.unsubscribeAppState();
  }
}
