import * as THREE from "three";
import { GLTF } from "three/addons/loaders/GLTFLoader.js";

import App from "../App.js";
import assetStore from "../utils/Asset-store.js";

export default class Character {
  app: App;
  instance!: THREE.Mesh;
  avatar!: GLTF;

  constructor() {
    this.app = new App();

    // Create a character and add it to the scene
    const geometry = new THREE.BoxGeometry(2, 5, 2);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      wireframe: true,
      visible: false,
    });
    const instance = new THREE.Mesh(geometry, material);
    instance.position.set(0, 4, 0);
    this.instance = instance;
    this.app.scene.add(instance);

    // Add avatar to the character
    this.avatar = assetStore.getState().loadedAssets.avatar as GLTF;
    const avatarScene = this.avatar.scene;
    avatarScene.rotateY(Math.PI);
    avatarScene.position.setY(-2.5);
    avatarScene.scale.setScalar(3);
    this.instance.add(avatarScene);
  }

  dispose() {
    //
  }
}
