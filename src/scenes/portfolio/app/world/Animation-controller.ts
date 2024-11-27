import * as THREE from "three";

import App from "../App";
import { inputStore, InputState } from "../utils/Store";

export default class AnimationController {
  app: App;

  private animations: Map<string, THREE.AnimationAction>;
  private mixer!: THREE.AnimationMixer;
  private unsubscribeInput: () => void = () => {};
  private currentAction: THREE.AnimationAction | null = null;

  constructor() {
    this.app = new App();
    this.animations = new Map();

    this.unsubscribeInput = inputStore.subscribe(this.onInput);
    this.currentAction = null;
    this.instantiateAnimations();
  }

  private onInput = (state: InputState) => {
    const { forward, backward, left, right } = state;
    if (forward || backward || left || right) {
      this.playAnimation("run");
    } else {
      this.playAnimation("idle");
    }
  };

  private instantiateAnimations() {
    const { character } = this.app.world;
    if (!character) return;

    const { avatar } = character;
    const { animations, scene } = avatar;
    const mixer = new THREE.AnimationMixer(scene);
    this.mixer = mixer;

    animations.forEach((clip) => {
      // idle, run
      const { name } = clip;
      const action = mixer.clipAction(clip);
      this.animations.set(name, action);
    });

    const idleAction = this.animations.get("idle");
    if (!idleAction) return;
    idleAction.play();
    this.currentAction = idleAction;
  }

  private playAnimation(name: string) {
    const action = this.animations.get(name);
    const { currentAction } = this;
    if (!action || action === currentAction) return;

    action.reset();
    action.play();
    this.currentAction = action;

    if (!currentAction) return;
    // the 3rd args "warp: boolean" warp parameter. When set to false, the crossfade will not warp the time scale of the animations. When set to true, it will warp the time scale to synchronize the animations.
    action.crossFadeFrom(currentAction, 0.3, true);
  }

  loop(deltaTime: number) {
    this.mixer.update(deltaTime);
  }

  dispose() {
    this.unsubscribeInput();
  }
}
