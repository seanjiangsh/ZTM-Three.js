import * as THREE from "three";
import * as RAPIER from "@dimforge/rapier3d";

import App from "../App.js";
import { inputStore } from "../utils/Store";

export default class Character {
  app: App;
  character!: THREE.Mesh;
  characterRigidBody!: RAPIER.RigidBody;
  forward: boolean = false;
  backward: boolean = false;
  left: boolean = false;
  right: boolean = false;

  unsubscribeInput: () => void = () => {};

  constructor() {
    this.app = new App();
    this.unsubscribeInput = inputStore.subscribe((state) => {
      this.forward = state.forward;
      this.backward = state.backward;
      this.left = state.left;
      this.right = state.right;
    });

    this.instantiateCharacter();
  }

  private instantiateCharacter() {
    // const geometry = new THREE.BoxGeometry(2, 2, 2);
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    this.character = new THREE.Mesh(geometry, material);
    this.character.position.set(0, 1.5, 0);
    this.app.scene.add(this.character);

    const { physics } = this.app.world;
    this.characterRigidBody = physics.add(this.character, "kinematic", "ball");
  }

  loop() {
    const { forward, backward, left, right, characterRigidBody } = this;
    let { x, y, z } = characterRigidBody.translation();

    if (forward) {
      z -= 0.1;
    }
    if (backward) {
      z += 0.1;
    }
    if (left) {
      x -= 0.1;
    }
    if (right) {
      x += 0.1;
    }

    const newTranslation = new RAPIER.Vector3(x, y, z);
    characterRigidBody.setNextKinematicTranslation(newTranslation);
  }

  dispose() {
    this.unsubscribeInput();
  }
}
