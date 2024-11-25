import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

import assetStore, { Asset } from "./AssetStore.js";

export default class AssetLoader {
  gltfLoader!: GLTFLoader;
  textureLoader!: THREE.TextureLoader;

  constructor() {
    this.instantiateLoaders();
    this.startLoading();
  }

  private instantiateLoaders() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/draco/");
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(dracoLoader);
    this.textureLoader = new THREE.TextureLoader();
  }

  private startLoading() {
    const { assetsToLoad, loadedAssets, addLoadedAsset } =
      assetStore.getState();
    assetsToLoad.forEach((asset: Asset) => {
      // * type only has two possible values: "texture" or "model"
      const { type, path, id } = asset;
      const loader = type === "texture" ? this.textureLoader : this.gltfLoader;
      loader.load(path, (loadedAsset) => addLoadedAsset(loadedAsset, id));
    });
  }

  dispose() {
    assetStore.setState({ loadedAssets: {} });
  }
}
