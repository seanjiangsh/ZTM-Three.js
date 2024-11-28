import App from "../App";
import Physics from "./Physics";
import Environment from "./Environments";
import Character from "./Character";
import CharacterController from "./Character-controller";
import AnimationController from "./Animation-controller";
import { appStateStore } from "../utils/Store";

export default class World {
  app: App;
  physics: Physics;
  environment!: Environment;
  character: Character | null = null;
  characterController: CharacterController | null = null;
  animationController: AnimationController | null = null;

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
        this.animationController = new AnimationController();
      }
    });
  }

  loop(elapsedTime: number, deltaTime: number) {
    const { physics, characterController, animationController } = this;
    if (characterController) characterController.loop(deltaTime);
    if (animationController) animationController.loop(deltaTime);
    physics.loop();
  }

  dispose() {
    const { characterController, animationController } = this;
    characterController?.dispose();
    animationController?.dispose();
    this.unsubscribeAppState();
  }
}
