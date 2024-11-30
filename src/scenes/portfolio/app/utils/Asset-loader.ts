import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

import assetStore, { Asset } from "./Asset-store.js";

const { VITE_BASE } = import.meta.env;
const base = VITE_BASE || "";

export default class AssetLoader {
  gltfLoader!: GLTFLoader;
  textureLoader!: THREE.TextureLoader;
  cubeTextureLoader!: THREE.CubeTextureLoader;

  constructor() {
    this.instantiateLoaders();
    this.startLoading();
  }

  private instantiateLoaders() {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(`${base}/draco/`);
    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(dracoLoader);
    this.textureLoader = new THREE.TextureLoader();
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
  }

  private startLoading() {
    const { assetsToLoad, loadedAssets, addLoadedAsset } =
      assetStore.getState();
    assetsToLoad.forEach((asset: Asset) => {
      // * type only has two possible values: "texture" or "model"
      const { type, id } = asset;
      switch (type) {
        case "texture": {
          const { path } = asset;
          this.textureLoader.load(path, (loadedAsset) =>
            addLoadedAsset(loadedAsset, id)
          );
          break;
        }
        case "model": {
          const { path } = asset;
          this.gltfLoader.load(path, (loadedAsset) =>
            addLoadedAsset(loadedAsset, id)
          );
          break;
        }
        case "cubeTexture": {
          const { paths } = asset;
          this.cubeTextureLoader.load(paths, (loadedAsset) =>
            addLoadedAsset(loadedAsset, id)
          );
          break;
        }
        default: {
          throw new Error(`Unsupported asset type: ${type}`);
        }
      }
    });
  }

  dispose() {
    assetStore.getState().reset();
  }
}
