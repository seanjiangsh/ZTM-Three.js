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
    this.avatar = assetStore.getState().loadedAssets.avatar as GLTF;
    this.instantiateCharacter();
  }

  instantiateCharacter() {
    // create character and add to scene
    const { scene } = this.app;

    const geometry = new THREE.BoxGeometry(0.6, 2, 0.6);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      wireframe: true,
      visible: false,
    });
    const instance = new THREE.Mesh(geometry, material);
    instance.position.set(0, 4, 0);
    this.instance = instance;

    // add avatar to character
    const avatar = this.avatar.scene;
    avatar.rotation.y = Math.PI;
    avatar.position.y = -1;
    avatar.castShadow = true;

    instance.add(avatar);
    scene.add(instance);
  }

  dispose() {
    //
  }
}
