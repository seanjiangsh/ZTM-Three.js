import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import App from "./App";
import { sizeStore } from "./utils/Store";
import { cameraPosition } from "three/webgpu";

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
    // this.instance.position.set(-80, 50, 80);
  }

  private setControls() {
    this.controls = new OrbitControls(this.instance, this.app.canvas);
    this.controls.enableDamping = true;
  }

  private setResizeListener() {
    this.unsubscribeSize = sizeStore.subscribe(({ aspect }) => {
      this.instance.aspect = aspect;
      this.instance.updateProjectionMatrix();
    });
  }

  loop() {
    this.controls.update();
    const { character } = this.app.world;
    if (character) {
      const { rigidBody } = character;
      const translation = rigidBody.translation();
      const rotation = rigidBody.rotation();

      const characterPosition = new THREE.Vector3().copy(translation);
      const characterRotation = new THREE.Quaternion().copy(rotation);
      // characterPosition.y += 30; // above the character
      // characterPosition.z += 60; // behind the character

      // same as "position.y += 30; position.z += 60;"
      const cameraOffset = new THREE.Vector3(0, 30, 60);
      // rotate the camera offset by the character rotation
      cameraOffset.applyQuaternion(characterRotation);
      cameraOffset.add(characterPosition);

      // look at the character
      // (the angle of the camera look at the center of character)
      const targetOffset = new THREE.Vector3(0, 0, 0);
      // rotate the target offset by the character rotation
      targetOffset.applyQuaternion(characterRotation);
      targetOffset.add(characterPosition);

      // lerp (smooth) the camera position and target position
      this.instance.position.lerp(cameraOffset, 0.1);
      this.controls.target.lerp(targetOffset, 0.1);
    }
  }

  dispose() {
    this.controls.dispose();
    this.instance.clear();
    this.unsubscribeSize();
  }
}
